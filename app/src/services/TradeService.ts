import { createClient } from "@/lib/supabase/client"

export interface Trade {
    id: string
    user_id: string
    symbol: string
    direction: "BUY" | "SELL"
    quantity: number
    price: number
    timestamp: string
    fee: number
    currency: string
    notes?: string
    broker_id?: string
    created_at: string
}

export const TradeService = {
    async getTrades() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("trades")
            .select("*")
            .order("timestamp", { ascending: false })

        if (error) throw error
        return data as Trade[]
    },

    async getTradesBySymbol(symbol: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("trades")
            .select("*")
            .eq("symbol", symbol)
            .order("timestamp", { ascending: false })

        if (error) throw error
        return data as Trade[]
    },

    async addTrade(trade: Omit<Trade, "id" | "user_id" | "created_at">) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("User not authenticated")

        const { data, error } = await supabase
            .from("trades")
            .insert({
                ...trade,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data as Trade
    },

    async updateTrade(id: string, updates: Partial<Trade>) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("trades")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error
        return data as Trade
    },

    async deleteTrade(id: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from("trades")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}
