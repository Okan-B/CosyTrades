"use client"

import * as React from "react"
import { Search, Plus, TrendingUp, TrendingDown, Loader2, List } from "lucide-react"
import { searchMarket, getBatchMarketData, MarketStock } from "@/services/MarketSearchService"
import { WatchlistService, WatchlistItem } from "@/services/WatchlistService"
import { SearchResults } from "@/components/watchlist/SearchResults"

interface WatchlistWidgetProps {
    onSelectTicker?: (ticker: string) => void
}

export function WatchlistWidget({ onSelectTicker }: WatchlistWidgetProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // State
    const [watchlistItems, setWatchlistItems] = React.useState<WatchlistItem[]>([])
    const [marketData, setMarketData] = React.useState<Record<string, MarketStock>>({})
    const [isLoading, setIsLoading] = React.useState(true)
    
    const [searchResults, setSearchResults] = React.useState<MarketStock[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [showResults, setShowResults] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

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
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
                notes: false,
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
        <div ref={containerRef} className="h-full flex flex-col">
             <div className="flex items-center gap-2 p-3 border-b bg-sidebar-accent/10">
                <List className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Watchlist</span>
            </div>
            
            <div className="p-2 border-b border-sidebar-border">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <input
                            placeholder="Add ticker..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchQuery.trim()) setShowResults(true)
                            }}
                            className="w-full pl-7 pr-2 py-1.5 bg-sidebar-accent/50 border border-sidebar-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 space-y-1">
                {showResults && searchQuery ? (
                    <SearchResults
                        results={searchResults}
                        onToggle={handleToggleWatchlist}
                        isSearching={isSearching}
                        addedTickers={addedTickers}
                    />
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                                    onClick={() => onSelectTicker?.(item.symbol)}
                                    className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {item.symbol}
                                            {item.notes && <span className="w-1 h-1 rounded-full bg-primary/50" title="Has notes" />}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-xs">{stock.price.toFixed(2)}</div>
                                        <div className={`text-[10px] flex items-center justify-end gap-0.5 ${stock.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                            {stock.change >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                                            {Math.abs(stock.change)}%
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                        {watchlistItems.length === 0 && (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                Watchlist empty
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
