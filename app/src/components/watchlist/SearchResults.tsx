import * as React from "react"
import { Plus, Check, X } from "lucide-react"
import { MarketStock } from "@/services/MarketSearchService"

interface SearchResultsProps {
    results: MarketStock[]
    onToggle: (stock: MarketStock) => void
    isSearching: boolean
    addedTickers: Set<string>
}

export function SearchResults({ results, onToggle, isSearching, addedTickers }: SearchResultsProps) {
    const [hoverLockTickers, setHoverLockTickers] = React.useState<Set<string>>(() => new Set())

    const addHoverLock = (ticker: string) => {
        setHoverLockTickers(prev => {
            if (prev.has(ticker)) return prev
            const next = new Set(prev)
            next.add(ticker)
            return next
        })
    }

    const removeHoverLock = (ticker: string) => {
        setHoverLockTickers(prev => {
            if (!prev.has(ticker)) return prev
            const next = new Set(prev)
            next.delete(ticker)
            return next
        })
    }

    if (isSearching) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Market Results
            </div>
            {results.map((stock) => {
                const isAdded = addedTickers.has(stock.ticker)
                const isHoverLocked = hoverLockTickers.has(stock.ticker)
                const buttonStateClasses = isAdded
                    ? isHoverLocked
                        ? "bg-green-500/20 text-green-500"
                        : "bg-green-500/20 text-green-500 hover:bg-red-500/20 hover:text-red-500"
                    : "hover:bg-sidebar-accent hover:text-sidebar-foreground text-muted-foreground"

                return (
                    <div
                        key={stock.ticker}
                        className="w-full text-left p-3 rounded-md bg-sidebar-accent/10 hover:bg-sidebar-accent/30 transition-colors flex items-center justify-between group border border-transparent hover:border-sidebar-border"
                    >
                        <div>
                            <div className="font-medium flex items-center gap-2 text-sidebar-foreground">
                                {stock.ticker}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sidebar-border text-muted-foreground">
                                    {stock.sector}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {stock.name}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="font-mono text-sm text-sidebar-foreground">
                                    {stock.price.toFixed(2)}
                                </div>
                                <div className={`text-xs ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {stock.change > 0 ? "+" : ""}{stock.change}%
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (isAdded) {
                                        removeHoverLock(stock.ticker)
                                    } else {
                                        addHoverLock(stock.ticker)
                                    }
                                    onToggle(stock)
                                }}
                                onMouseLeave={() => removeHoverLock(stock.ticker)}
                                className={`p-1.5 rounded-md transition-all group/btn ${buttonStateClasses}`}
                                title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                                {isAdded ? (
                                    isHoverLocked ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 group-hover/btn:hidden" />
                                            <X className="w-4 h-4 hidden group-hover/btn:block" />
                                        </>
                                    )
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
