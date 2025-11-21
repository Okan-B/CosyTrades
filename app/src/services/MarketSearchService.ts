export interface MarketStock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    sector: string;
}

const MOCK_MARKET_DATA: MarketStock[] = [
    { ticker: "AAPL", name: "Apple Inc.", price: 182.50, change: 1.2, sector: "Technology" },
    { ticker: "MSFT", name: "Microsoft Corp.", price: 415.10, change: 0.5, sector: "Technology" },
    { ticker: "GOOGL", name: "Alphabet Inc.", price: 173.90, change: -0.8, sector: "Technology" },
    { ticker: "AMZN", name: "Amazon.com Inc.", price: 178.30, change: 1.5, sector: "Consumer Cyclical" },
    { ticker: "NVDA", name: "NVIDIA Corp.", price: 875.90, change: 3.8, sector: "Technology" },
    { ticker: "TSLA", name: "Tesla, Inc.", price: 175.30, change: -2.5, sector: "Consumer Cyclical" },
    { ticker: "META", name: "Meta Platforms", price: 485.50, change: 2.1, sector: "Technology" },
    { ticker: "AMD", name: "Advanced Micro Devices", price: 170.20, change: -1.1, sector: "Technology" },
    { ticker: "NFLX", name: "Netflix, Inc.", price: 605.40, change: 0.9, sector: "Communication Services" },
    { ticker: "INTC", name: "Intel Corp.", price: 43.50, change: -0.5, sector: "Technology" },
    { ticker: "V", name: "Visa Inc.", price: 275.40, change: 0.3, sector: "Financial Services" },
    { ticker: "JPM", name: "JPMorgan Chase", price: 195.20, change: 1.1, sector: "Financial Services" },
    { ticker: "WMT", name: "Walmart Inc.", price: 60.10, change: 0.2, sector: "Consumer Defensive" },
    { ticker: "PG", name: "Procter & Gamble", price: 161.80, change: 0.4, sector: "Consumer Defensive" },
    { ticker: "JNJ", name: "Johnson & Johnson", price: 158.20, change: -0.2, sector: "Healthcare" },
    { ticker: "UNH", name: "UnitedHealth Group", price: 480.50, change: -1.5, sector: "Healthcare" },
    { ticker: "XOM", name: "Exxon Mobil", price: 115.30, change: 1.8, sector: "Energy" },
    { ticker: "CVX", name: "Chevron Corp.", price: 155.60, change: 1.2, sector: "Energy" },
    { ticker: "KO", name: "Coca-Cola Co.", price: 59.40, change: 0.1, sector: "Consumer Defensive" },
    { ticker: "PEP", name: "PepsiCo, Inc.", price: 168.90, change: -0.3, sector: "Consumer Defensive" },
];

export const searchMarket = async (query: string): Promise<MarketStock[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    return MOCK_MARKET_DATA.filter(
        (stock) =>
            stock.ticker.toLowerCase().includes(lowerQuery) ||
            stock.name.toLowerCase().includes(lowerQuery)
    );
};
