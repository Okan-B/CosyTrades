
export interface TradeImportRow {
  Action: string
  Time: string
  ISIN: string
  Ticker: string
  Name: string
  'No. of shares': string
  'Price / share': string
  'Currency (Price / share)': string
  'Exchange rate': string
  Result: string
  Total: string
  'Withholding tax': string
  'Currency (Withholding tax)': string
  'Charge amount (GBP)': string
  'Stamp duty reserve tax': string
  Notes: string
  ID: string
  'Currency conversion fee': string
}

export interface ParsedTrade {
  broker_id: string
  symbol: string
  direction: 'BUY' | 'SELL'
  quantity: number
  price: number
  timestamp: string
  fee: number
  currency: string
  notes: string
}

export function parseTrading212CSV(csvContent: string): ParsedTrade[] {
  const lines = csvContent.split('\n')
  // Simple CSV split might break if fields contain commas.
  // Ideally use a library like papaparse, but for now a manual robust split:
  // We need to find the header line. Sometimes there's metadata before.
  // We assume the first line with "Ticker" or "Action" is the header.
  
  let headerIndex = -1
  let headers: string[] = []

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Action') && lines[i].includes('Ticker')) {
      headerIndex = i
      headers = lines[i].split(',').map((h) => h.trim().replace(/"/g, ''))
      break
    }
  }

  if (headerIndex === -1) return [] // No valid header found
  
  const trades: ParsedTrade[] = []

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle potential commas inside quotes
    const values: string[] = []
    let inQuote = false
    let currentValue = ''

    for (const char of line) {
      if (char === '"') {
        inQuote = !inQuote
      } else if (char === ',' && !inQuote) {
        values.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())

    const row: Record<string, string | undefined> = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/"/g, '')
    })

    // Filter for only Market buy/sell orders
    const action = row['Action']?.toLowerCase()
    // Common T212 actions: "Market buy", "Market sell", "Limit buy", "Stop buy"
    if (!action || (!action.includes('buy') && !action.includes('sell'))) {
      continue
    }
    
    // Skip "Dividend" or "Deposit"
    if (action.includes('dividend') || action.includes('deposit')) continue

    // Map to our schema
    const direction = action.includes('buy') ? 'BUY' : 'SELL'
    const quantity = parseFloat(row['No. of shares'] || '0')
    const price = parseFloat(row['Price / share'] || '0')
    const currency = row['Currency (Price / share)'] || 'USD'
    const timestamp = row['Time'] 
    
    // Fees: Sum up taxes and fees
    const stampDuty = parseFloat(row['Stamp duty reserve tax'] || '0')
    const conversionFee = parseFloat(row['Currency conversion fee'] || '0')
    const fee = stampDuty + conversionFee

    trades.push({
      broker_id: row['ID'] || `generated-${Date.now()}-${i}`,
      symbol: row['Ticker'],
      direction,
      quantity,
      price,
      timestamp, 
      fee,
      currency,
      notes: row['Notes'] || ''
    })
  }

  return trades
}
