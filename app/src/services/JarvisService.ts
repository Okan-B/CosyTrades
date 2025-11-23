import { TradeService } from "./TradeService"
import { JournalService } from "./JournalService"
import { CanvasService } from "./CanvasService"
import { WatchlistService } from "./WatchlistService"

export interface JarvisContext {
    activeCanvas?: any
    recentTrades?: any[]
    journalEntries?: any[]
    watchlist?: any[]
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
            WatchlistService.getWatchlist()
        ])

        const trades = results[0].status === 'fulfilled' ? results[0].value : []
        const journalEntries = results[1].status === 'fulfilled' ? results[1].value : []
        const canvases = results[2].status === 'fulfilled' ? results[2].value : []
        const watchlist = results[3].status === 'fulfilled' ? results[3].value : []

        if (results[0].status === 'rejected') console.error("Jarvis failed to load trades:", results[0].reason)
        if (results[1].status === 'rejected') console.error("Jarvis failed to load journal:", results[1].reason)
        if (results[2].status === 'rejected') console.error("Jarvis failed to load canvases:", results[2].reason)
        if (results[3].status === 'rejected') console.error("Jarvis failed to load watchlist:", results[3].reason)

        const activeCanvas = activeCanvasId
            ? canvases.find(c => c.id === activeCanvasId)
            : canvases.find(c => c.is_default) || canvases[0]

        // Filter for recent context (last 5 trades, last 5 entries)
        const recentTrades = trades.slice(0, 5)
        const recentJournal = journalEntries.slice(0, 5)

        return {
            activeCanvas: activeCanvas ? { name: activeCanvas.name, layout: activeCanvas.layout } : null,
            recentTrades,
            journalEntries: recentJournal,
            watchlist: watchlist.map(w => ({ symbol: w.symbol, added_at: w.added_at })),
            currentDate: new Date().toISOString()
        }
    },

    async sendMessage(messages: JarvisMessage[], context: JarvisContext) {
        const response = await fetch("/api/jarvis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages,
                context
            })
        })

        if (!response.ok) {
            throw new Error("Failed to communicate with Jarvis")
        }

        return await response.json()
    }
}
