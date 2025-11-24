"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Modal } from "@/components/ui/modal"

import { Trade } from "@/services/TradeService"

interface AddTradeModalProps {
    isOpen: boolean
    onClose: () => void
    ticker?: string | null
    onSuccess?: () => void
    initialData?: Trade | null
}

export function AddTradeModal({ isOpen, onClose, ticker, onSuccess, initialData }: AddTradeModalProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Form State
    const [formData, setFormData] = React.useState({
        symbol: ticker || "",
        direction: "BUY",
        quantity: "",
        price: "",
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        notes: ""
    })

    // Update form when initialData or ticker changes
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                symbol: initialData.symbol,
                direction: initialData.direction,
                quantity: initialData.quantity.toString(),
                price: initialData.price.toString(),
                date: new Date(initialData.timestamp).toISOString().split('T')[0],
                notes: initialData.notes || ""
            })
        } else if (ticker) {
            setFormData(prev => ({ ...prev, symbol: ticker }))
        }
    }, [initialData, ticker, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Redirect to sign in with return URL
                const redirectTo = encodeURIComponent(pathname)
                router.push(`/auth/sign-in?redirectTo=${redirectTo}`)
                return
            }

            const tradeData = {
                user_id: user.id,
                symbol: formData.symbol.toUpperCase(),
                direction: formData.direction,
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price),
                timestamp: new Date(formData.date).toISOString(),
                notes: formData.notes,
                currency: 'USD' // Default for now
            }

            if (initialData) {
                // Update existing trade
                const { error: updateError } = await supabase
                    .from('trades')
                    .update(tradeData)
                    .eq('id', initialData.id)

                if (updateError) throw updateError
            } else {
                // Insert new trade
                const { error: insertError } = await supabase
                    .from('trades')
                    .insert(tradeData)

                if (insertError) throw insertError
            }

            // Reset form and close
            if (!initialData) {
                setFormData({
                    symbol: ticker || "",
                    direction: "BUY",
                    quantity: "",
                    price: "",
                    date: new Date().toISOString().split('T')[0],
                    notes: ""
                })
            }

            if (onSuccess) onSuccess()
            onClose()

        } catch (err: any) {
            console.error("Error saving trade:", err)
            setError(err.message || "Failed to save trade")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Trade">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Symbol</label>
                        <input
                            type="text"
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                            placeholder="AAPL"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Direction</label>
                        <select
                            name="direction"
                            value={formData.direction}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="BUY">Buy (Long)</option>
                            <option value="SELL">Sell (Short)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            step="any"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="150.00"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Why did you take this trade?"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Trade
                    </button>
                </div>
            </form>
        </Modal>
    )
}
