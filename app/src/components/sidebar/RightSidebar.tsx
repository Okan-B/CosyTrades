"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NewsWidget } from "./widgets/NewsWidget"
import { WatchlistWidget } from "./widgets/WatchlistWidget"
import { JarvisWidget } from "@/components/jarvis/JarvisWidget"

type WidgetType = "jarvis" | "news" | "watchlist"

interface WidgetConfig {
    id: WidgetType
    label: string
    component: React.ReactNode
    isOpen: boolean
}

export function RightSidebar() {
    const [isOpen, setIsOpen] = React.useState(true)
    const [activeWidgets, setActiveWidgets] = React.useState<WidgetType[]>(["jarvis", "news"])

    const widgets: Record<WidgetType, WidgetConfig> = {
        jarvis: { id: "jarvis", label: "Jarvis", component: <div className="h-[450px] border-b"><JarvisWidget mode="live" /></div>, isOpen: true },
        news: { id: "news", label: "News", component: <div className="h-64 border-b"><NewsWidget /></div>, isOpen: true },
        watchlist: { id: "watchlist", label: "Watchlist", component: <div className="h-64 border-b"><WatchlistWidget /></div>, isOpen: true },
    }

    const toggleWidget = (id: WidgetType) => {
        setActiveWidgets(prev => 
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        )
    }

    return (
        <div
            className={cn(
                "flex h-screen flex-col border-l bg-sidebar transition-all duration-300",
                isOpen ? "w-80" : "w-12"
            )}
        >
            <div className="flex h-14 items-center justify-between border-b px-2">
                {isOpen && <span className="font-semibold ml-2">Sidebar</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-8 w-8"
                >
                    {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {isOpen ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {activeWidgets.map(id => (
                            <div key={id} className="relative group border-b border-sidebar-border last:border-0">
                                <button 
                                    onClick={() => toggleWidget(id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar-accent rounded"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                {widgets[id].component}
                            </div>
                        ))}
                    </div>
                    
                    {/* Add Widget Area */}
                    <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
                        <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Add Widget</div>
                        <div className="flex gap-2 flex-wrap">
                            {(Object.keys(widgets) as WidgetType[]).filter(id => !activeWidgets.includes(id)).map(id => (
                                <button
                                    key={id}
                                    onClick={() => toggleWidget(id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-sidebar-accent/50 hover:bg-sidebar-accent text-xs transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    {widgets[id].label}
                                </button>
                            ))}
                            {activeWidgets.length === Object.keys(widgets).length && (
                                <span className="text-xs text-muted-foreground italic">All widgets added</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center py-4 gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                </div>
            )}
        </div>
    )
}

