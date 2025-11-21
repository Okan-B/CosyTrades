"use client"

import * as React from "react"
import { WatchlistSidebar } from "@/components/watchlist/WatchlistSidebar"
import { StockDetail } from "@/components/watchlist/StockDetail"

export default function WatchlistPage() {
    const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <WatchlistSidebar
                onSelectTicker={setSelectedTicker}
                selectedTicker={selectedTicker}
            />

            {/* Main Content */}
            <main className="flex-1 h-full overflow-hidden relative">
                <StockDetail ticker={selectedTicker} />
            </main>
        </div>
    )
}
