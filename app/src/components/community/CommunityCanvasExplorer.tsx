"use client"

import * as React from "react"
import { Search, Filter } from "lucide-react"
import { CanvasCard, CanvasSetup } from "./CanvasCard"

const MOCK_COMMUNITY_CANVASES: CanvasSetup[] = [
    {
        id: "1",
        title: "Swing Trading Daily",
        author: "TraderJoe",
        description: "A focused layout for daily swing trading analysis. Includes sections for pre-market check, key levels, and trade execution notes.",
        upvotes: 124,
        tags: ["Swing", "Daily"]
    },
    {
        id: "2",
        title: "Long Term Value",
        author: "WarrenBuff",
        description: "Deep dive fundamental analysis template. Perfect for quarterly earnings reviews and long-term thesis tracking.",
        upvotes: 89,
        tags: ["Investing", "Fundamental"]
    },
    {
        id: "3",
        title: "Scalping Setup",
        author: "FastFingers",
        description: "Minimalist layout for quick decision making. Focuses on price action notes and rapid execution logging.",
        upvotes: 56,
        tags: ["Scalping", "Intraday"]
    },
    {
        id: "4",
        title: "Crypto Altcoin Gem",
        author: "MoonShot",
        description: " specialized template for analyzing low-cap altcoins. Includes sections for tokenomics, team analysis, and roadmap tracking.",
        upvotes: 210,
        tags: ["Crypto", "Research"]
    },
    {
        id: "5",
        title: "Forex Pair Analysis",
        author: "PipMaster",
        description: "Standard template for major pair analysis. Includes macro economic calendar notes and technical correlation checks.",
        upvotes: 45,
        tags: ["Forex", "Macro"]
    }
]

export function CommunityCanvasExplorer() {
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredCanvases = MOCK_COMMUNITY_CANVASES.filter(canvas =>
        canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search community setups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button className="p-2 border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
                {filteredCanvases.map(setup => (
                    <CanvasCard key={setup.id} setup={setup} />
                ))}
            </div>
        </div>
    )
}
