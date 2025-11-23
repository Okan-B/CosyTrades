import { createClient } from "@/lib/supabase/client"

export interface JournalEntry {
    id: string
    user_id: string
    trade_id?: string
    type: "PRE_TRADE" | "POST_TRADE" | "DAILY" | "WEEKLY" | "NOTE"
    date: string
    content: any // JSON content from rich text editor
    tags: string[]
    created_at: string
}

export const JournalService = {
    async getEntries() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("journal_entries")
            .select("*")
            .order("date", { ascending: false })

        if (error) throw error
        return data as JournalEntry[]
    },

    async getEntriesForTrade(tradeId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("journal_entries")
            .select("*")
            .eq("trade_id", tradeId)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as JournalEntry[]
    },

    async addEntry(entry: Omit<JournalEntry, "id" | "user_id" | "created_at">) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("User not authenticated")

        const { data, error } = await supabase
            .from("journal_entries")
            .insert({
                ...entry,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data as JournalEntry
    },

    async updateEntry(id: string, updates: Partial<JournalEntry>) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("journal_entries")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error
        return data as JournalEntry
    },

    async deleteEntry(id: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from("journal_entries")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}
