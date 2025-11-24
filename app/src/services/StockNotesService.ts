import { PartialBlock } from "@blocknote/core"
import { createClient } from "@/lib/supabase/client"

export interface StockNoteRecord {
    id: string
    user_id?: string
    symbol: string
    title: string
    content: PartialBlock[] | null
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    updated_at: string
}

const LOCAL_STORAGE_KEY = "cosy_stock_notes"

const parseLocalNotes = (): Record<string, StockNoteRecord[]> => {
    if (typeof window === "undefined") return {}
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch (error) {
        console.warn("Failed to read local stock notes", error)
        return {}
    }
}

const writeLocalNotes = (notes: Record<string, StockNoteRecord[]>) => {
    if (typeof window === "undefined") return
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes))
}

const fallbackCreate = (
    symbol: string,
    title?: string,
    content?: PartialBlock[] | null,
    position?: { x: number; y: number },
    size?: { width: number; height: number }
): StockNoteRecord => {
    const record: StockNoteRecord = {
        id: `local-${Date.now()}`,
        symbol,
        title: title || "New Note",
        content: content ?? null,
        position,
        size,
        updated_at: new Date().toISOString()
    }
    const local = parseLocalNotes()
    const existing = local[symbol] || []
    local[symbol] = [record, ...existing]
    writeLocalNotes(local)
    return record
}

const fallbackUpdate = (symbol: string, id: string, updates: Partial<StockNoteRecord>) => {
    const local = parseLocalNotes()
    const existing = local[symbol] || []
    local[symbol] = existing.map(note => note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note)
    writeLocalNotes(local)
}

const fallbackDelete = (symbol: string, id: string) => {
    const local = parseLocalNotes()
    const existing = local[symbol] || []
    local[symbol] = existing.filter(note => note.id !== id)
    writeLocalNotes(local)
}

export const StockNotesService = {
    async getAllNotes(): Promise<StockNoteRecord[]> {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return Object.values(parseLocalNotes()).flat()
            }

            const { data, error } = await supabase
                .from("stock_notes")
                .select("id,user_id,symbol,title,content,position,size,updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })

            if (error) throw error
            return (data || []) as StockNoteRecord[]
        } catch (error) {
            console.warn("StockNotesService.getAllNotes fell back to local storage:", error)
            return Object.values(parseLocalNotes()).flat()
        }
    },

    async getNotesForSymbol(symbol: string): Promise<StockNoteRecord[]> {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return parseLocalNotes()[symbol] || []
            }

            const { data, error } = await supabase
                .from("stock_notes")
                .select("id,user_id,symbol,title,content,position,size,updated_at")
                .eq("user_id", user.id)
                .eq("symbol", symbol)
                .order("updated_at", { ascending: false })

            if (error) throw error
            return (data || []) as StockNoteRecord[]
        } catch (error) {
            console.warn("StockNotesService.getNotesForSymbol fell back to local storage:", error)
            return parseLocalNotes()[symbol] || []
        }
    },

    async createNote(
        symbol: string,
        title?: string,
        content?: PartialBlock[] | null,
        position?: { x: number; y: number },
        size?: { width: number; height: number }
    ): Promise<StockNoteRecord> {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return fallbackCreate(symbol, title, content, position, size)
            }

            const { data, error } = await supabase
                .from("stock_notes")
                .insert({
                    user_id: user.id,
                    symbol,
                    title: title || "New Note",
                    content: content ?? null,
                    position,
                    size
                })
                .select()
                .single()

            if (error) throw error

            return {
                ...data,
                symbol: data.symbol,
                title: data.title,
                content: data.content,
                position: data.position,
                size: data.size,
                updated_at: data.updated_at
            } as StockNoteRecord
        } catch (error) {
            console.warn("StockNotesService.createNote fell back to local storage:", error)
            return fallbackCreate(symbol, title, content, position, size)
        }
    },

    async updateNote(symbol: string, id: string, updates: Partial<StockNoteRecord>) {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                fallbackUpdate(symbol, id, updates)
                return
            }

            const { error } = await supabase
                .from("stock_notes")
                .update({
                    title: updates.title,
                    content: updates.content,
                    position: updates.position,
                    size: updates.size
                })
                .eq("id", id)
                .eq("user_id", user.id)

            if (error) throw error
        } catch (error) {
            console.warn("StockNotesService.updateNote fell back to local storage:", error)
            fallbackUpdate(symbol, id, updates)
        }
    },

    async deleteNote(symbol: string, id: string) {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                fallbackDelete(symbol, id)
                return
            }

            const { error } = await supabase
                .from("stock_notes")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id)

            if (error) throw error
        } catch (error) {
            console.warn("StockNotesService.deleteNote fell back to local storage:", error)
            fallbackDelete(symbol, id)
        }
    }
}
