"use client"

import { useState } from "react"
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { parseTrading212CSV } from "@/lib/utils/csv-parser"
import { createClient } from "@/lib/supabase/client"

export function TradeImporter() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatus('idle')
    setMessage('')

    try {
      const text = await file.text()
      const trades = parseTrading212CSV(text)

      if (trades.length === 0) {
        setStatus('error')
        setMessage('No valid trades found in CSV.')
        setIsUploading(false)
        return
      }

      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
         setStatus('error')
         setMessage('You must be logged in to import trades.')
         setIsUploading(false)
         return
      }

      const tradesWithUser = trades.map(t => ({ ...t, user_id: user.id }))

      const { error } = await supabase.from('trades').insert(tradesWithUser)

      if (error) throw error

      setStatus('success')
      setMessage(`Successfully imported ${trades.length} trades.`)
      
    } catch (error) {
      console.error(error)
      setStatus('error')
      const message = error instanceof Error ? error.message : 'Failed to import trades'
      setMessage(message)
    } finally {
      setIsUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Upload className="mr-2 h-4 w-4" />
        Import Trades
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Import Trading212 Data"
      >
        <div className="space-y-6 text-center relative">
            <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center space-y-4 hover:bg-muted/50 transition-colors relative">
                <div className="bg-primary/10 p-4 rounded-full">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <p className="font-medium">Click to upload CSV</p>
                    <p className="text-sm text-muted-foreground mt-1">Trading212 Export Format</p>
                </div>
                <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                />
            </div>

            {isUploading && <p className="text-sm text-muted-foreground animate-pulse">Processing trades...</p>}
            
            {status === 'success' && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2 justify-center">
                    <Check className="h-4 w-4" />
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 justify-center">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                </div>
            )}
        </div>
      </Modal>
    </>
  )
}
