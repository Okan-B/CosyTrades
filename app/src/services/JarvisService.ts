import { TradeService } from "./TradeService"
import { JournalService } from "./JournalService"
import { CanvasService } from "./CanvasService"
import { WatchlistService } from "./WatchlistService"
import { StockNotesService, StockNoteRecord } from "./StockNotesService"

export interface JarvisContext {
    activeCanvas?: any
    recentTrades?: any[]
    journalEntries?: any[]
    watchlist?: any[]
    stockNotes?: {
        symbol: string
        notes: {
            title: string
            excerpt: string
            updated_at: string
        }[]
    }[]
    currentDate: string
}

export interface JarvisMessage {
    role: "user" | "assistant"
    content: string
}

export const JarvisService = {
    async getContext(activeCanvasId?: string): Promise<JarvisContext> {
        const results = await Promise.allSettled([
            TradeService.getTrades(),
            JournalService.getEntries(),
            CanvasService.getUserCanvases(),
            WatchlistService.getWatchlist(),
            StockNotesService.getAllNotes()
        ])

        const trades = results[0].status === 'fulfilled' ? results[0].value : []
        const journalEntries = results[1].status === 'fulfilled' ? results[1].value : []
        const canvases = results[2].status === 'fulfilled' ? results[2].value : []
        const watchlist = results[3].status === 'fulfilled' ? results[3].value : []
        const stockNotes = results[4].status === 'fulfilled' ? results[4].value as StockNoteRecord[] : []

        if (results[0].status === 'rejected') console.error("Jarvis failed to load trades:", results[0].reason)
        if (results[1].status === 'rejected') console.error("Jarvis failed to load journal:", results[1].reason)
        if (results[2].status === 'rejected') console.error("Jarvis failed to load canvases:", results[2].reason)
        if (results[3].status === 'rejected') console.error("Jarvis failed to load watchlist:", results[3].reason)
        if (results[4].status === 'rejected') console.error("Jarvis failed to load stock notes:", results[4].reason)

        const activeCanvas = activeCanvasId
            ? canvases.find(c => c.id === activeCanvasId)
            : canvases.find(c => c.is_default) || canvases[0]

        // Filter for recent context (last 5 trades, last 5 entries)
        const recentTrades = trades.slice(0, 5)
        const recentJournal = journalEntries.slice(0, 5)

        const groupedNotes = stockNotes.reduce<Record<string, StockNoteRecord[]>>((acc, note) => {
            acc[note.symbol] = acc[note.symbol] ? [...acc[note.symbol], note] : [note]
            return acc
        }, {})

        const stockNotesContext = Object.entries(groupedNotes).map(([symbol, notes]) => ({
            symbol,
            notes: notes.slice(0, 3).map(n => ({
                title: n.title,
                excerpt: toPlainTextSnippet(n.content),
                updated_at: n.updated_at
            }))
        }))

        return {
            activeCanvas: activeCanvas ? { name: activeCanvas.name, layout: activeCanvas.layout } : null,
            recentTrades,
            journalEntries: recentJournal,
            watchlist: watchlist.map(w => ({ symbol: w.symbol, added_at: w.added_at })),
            stockNotes: stockNotesContext,
            currentDate: new Date().toISOString()
        }
    },

    async sendMessage(messages: JarvisMessage[], context: JarvisContext, systemPrompt?: string) {
        const response = await fetch("/api/jarvis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages,
                context,
                systemPrompt
            })
        })

        if (!response.ok) {
            throw new Error("Failed to communicate with Jarvis")
        }

        return await response.json()
    }
}

function toPlainTextSnippet(content: any): string {
    type BlockNoteChild = { text?: string }
    type BlockNoteBlock = { content?: BlockNoteChild[] | string }

    if (!content) return ""
    try {
        if (Array.isArray(content)) {
            const blocks = content as BlockNoteBlock[]
            const text = blocks
                .map((block) => {
                    if (Array.isArray(block?.content)) {
                        return (block.content as BlockNoteChild[])
                            .map((child) => child?.text ?? "")
                            .join(" ")
                    }
                    if (typeof block?.content === "string") return block.content
                    return ""
                })
                .join(" ")
            return text.slice(0, 220).trim()
        }
        if (typeof content === "string") {
            return content.slice(0, 220).trim()
        }
    } catch {
        // best-effort fallback
    }
    return ""
}
