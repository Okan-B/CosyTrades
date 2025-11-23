"use client"

import * as React from "react"
import { Search, Plus, TrendingUp, TrendingDown, Globe, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { CommunityCanvasExplorer } from "@/components/community/CommunityCanvasExplorer"

interface WatchlistSidebarProps {
    onSelectTicker: (ticker: string) => void
    selectedTicker: string | null
}

import { searchMarket, getBatchMarketData, MarketStock } from "@/services/MarketSearchService"
import { WatchlistService, WatchlistItem } from "@/services/WatchlistService"
import { SearchResults } from "./SearchResults"

export function WatchlistSidebar({ onSelectTicker, selectedTicker }: WatchlistSidebarProps) {
    const [isCommunityModalOpen, setIsCommunityModalOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // State
    const [watchlistItems, setWatchlistItems] = React.useState<WatchlistItem[]>([])
    const [marketData, setMarketData] = React.useState<Record<string, MarketStock>>({})
    const [isLoading, setIsLoading] = React.useState(true)
    
    const [searchResults, setSearchResults] = React.useState<MarketStock[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [showResults, setShowResults] = React.useState(false)
    const sidebarRef = React.useRef<HTMLDivElement>(null)

    // Load Watchlist
    const loadWatchlist = React.useCallback(async () => {
        try {
            const items = await WatchlistService.getWatchlist()
            setWatchlistItems(items)
            
            if (items.length > 0) {
                const tickers = items.map(i => i.symbol)
                const quotes = await getBatchMarketData(tickers)
                const quoteMap: Record<string, MarketStock> = {}
                quotes.forEach(q => quoteMap[q.ticker] = q)
                setMarketData(quoteMap)
            }
        } catch (error) {
            console.error("Failed to load watchlist", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadWatchlist()
    }, [loadWatchlist])

    // Click outside handler
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Debounced search effect
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true)
                try {
                    const results = await searchMarket(searchQuery)
                    setSearchResults(results)
                    setShowResults(true)
                    setIsSearching(false)
                } catch (error) {
                    console.error("Search failed:", error)
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
                setShowResults(false)
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleToggleWatchlist = async (stock: MarketStock) => {
        // Optimistic update
        const exists = watchlistItems.some(item => item.symbol === stock.ticker)
        
        if (exists) {
            // Remove
            setWatchlistItems(prev => prev.filter(i => i.symbol !== stock.ticker))
            try {
                await WatchlistService.removeFromWatchlist(stock.ticker)
            } catch (error) {
                console.error("Failed to remove", error)
                loadWatchlist() // Revert on error
            }
        } else {
            // Add
            const tempItem: WatchlistItem = {
                id: "temp-" + Date.now(),
                user_id: "temp",
                symbol: stock.ticker,
                added_at: new Date().toISOString(),
                has_notes: false,
                display_order: 999
            }
            setWatchlistItems(prev => [...prev, tempItem])
            setMarketData(prev => ({ ...prev, [stock.ticker]: stock }))
            
            try {
                await WatchlistService.addToWatchlist(stock.ticker)
                loadWatchlist() // Reload to get real ID
            } catch (error) {
                console.error("Failed to add", error)
                setWatchlistItems(prev => prev.filter(i => i.symbol !== stock.ticker))
            }
        }
    }

    const addedTickers = new Set(watchlistItems.map(item => item.symbol))

    return (
        <>
            <Modal
                isOpen={isCommunityModalOpen}
                onClose={() => setIsCommunityModalOpen(false)}
                title="Community Canvas Explorer"
            >
                <CommunityCanvasExplorer />
            </Modal>
            <div ref={sidebarRef} className="w-80 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
                <div className="p-4 border-b border-sidebar-border">
                    <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">Watchlist</h2>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search ticker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    if (searchQuery.trim()) setShowResults(true)
                                }}
                                className="w-full pl-8 pr-4 py-2 bg-sidebar-accent/50 border border-sidebar-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                            />
                        </div>
                        <button className="p-2 rounded-md border border-dashed border-sidebar-border text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors" title="Add Ticker">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {showResults && searchQuery ? (
                        <SearchResults
                            results={searchResults}
                            onToggle={handleToggleWatchlist}
                            isSearching={isSearching}
                            addedTickers={addedTickers}
                        />
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {watchlistItems.map((item) => {
                                const stock = marketData[item.symbol] || { 
                                    ticker: item.symbol, 
                                    name: "Loading...", 
                                    price: 0, 
                                    change: 0,
                                    sector: ""
                                }
                                
                                return (
                                    <button
                                        key={item.symbol}
                                        onClick={() => onSelectTicker(item.symbol)}
                                        className={`w-full text-left p-3 rounded-md transition-colors flex items-center justify-between group ${selectedTicker === item.symbol
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {item.symbol}
                                                {item.has_notes && <span className="w-1.5 h-1.5 rounded-full bg-primary/50" title="Has notes" />}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm">{stock.price.toFixed(2)}</div>
                                            <div className={`text-xs flex items-center justify-end gap-0.5 ${stock.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {Math.abs(stock.change)}%
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                            {watchlistItems.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Your watchlist is empty
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-sidebar-border">
                    <button
                        onClick={() => setIsCommunityModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        title="Explore Canvas Ideas"
                    >
                        <Globe className="w-4 h-4" />
                        <span>Explore Canvas Ideas</span>
                    </button>
                </div>
            </div>
        </>
    )
}
