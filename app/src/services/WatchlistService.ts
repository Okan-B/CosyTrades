import { createClient } from "@/lib/supabase/client"

export interface WatchlistItem {
    id: string
    user_id: string
    symbol: string
    added_at: string
    has_notes: boolean
    display_order: number
}

// Helper for LocalStorage
const getLocalWatchlist = (): WatchlistItem[] => {
    if (typeof window === "undefined") return []
    const local = localStorage.getItem("cosy_watchlist")
    return local ? JSON.parse(local) : []
}

const saveLocalWatchlist = (items: WatchlistItem[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("cosy_watchlist", JSON.stringify(items))
}

export const WatchlistService = {
    async getWatchlist() {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return getLocalWatchlist()

            const { data, error } = await supabase
                .from("watchlist_items")
                .select("*")
                .eq("user_id", user.id)
                .order("display_order", { ascending: true })

            if (error) throw error

            return data as WatchlistItem[]
        } catch (error) {
            console.warn("Watchlist sync failed, falling back to local storage:", error)
            return getLocalWatchlist()
        }
    },

    async addToWatchlist(symbol: string) {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("No user")

            // Check if already exists
            const { data: existing, error: fetchError } = await supabase
                .from("watchlist_items")
                .select("id")
                .eq("user_id", user.id)
                .eq("symbol", symbol)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
            if (existing) return existing

            // Get max order
            const { data: maxOrder } = await supabase
                .from("watchlist_items")
                .select("display_order")
                .eq("user_id", user.id)
                .order("display_order", { ascending: false })
                .limit(1)
                .single()

            const nextOrder = (maxOrder?.display_order ?? 0) + 1

            const { data, error } = await supabase
                .from("watchlist_items")
                .insert({
                    user_id: user.id,
                    symbol: symbol,
                    display_order: nextOrder,
                    has_notes: false
                })
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error("Add to watchlist failed:", JSON.stringify(error, null, 2))
            // Fallback logic
            const items = getLocalWatchlist()
            if (items.some(i => i.symbol === symbol)) return items.find(i => i.symbol === symbol)

            const newItem: WatchlistItem = {
                id: "local-" + Date.now(),
                user_id: "local",
                symbol: symbol,
                added_at: new Date().toISOString(),
                has_notes: false,
                display_order: items.length + 1
            }
            saveLocalWatchlist([...items, newItem])
            return newItem
        }
    },

    async removeFromWatchlist(symbol: string) {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("No user")

            const { error } = await supabase
                .from("watchlist_items")
                .delete()
                .eq("user_id", user.id)
                .eq("symbol", symbol)

            if (error) throw error
        } catch (error) {
            console.warn("Remove from watchlist failed, updating locally:", error)
            const items = getLocalWatchlist()
            const filtered = items.filter(i => i.symbol !== symbol)
            saveLocalWatchlist(filtered)
        }
    }
}
