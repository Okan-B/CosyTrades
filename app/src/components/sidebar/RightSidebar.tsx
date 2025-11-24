"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft, Plus, X, Bot, Newspaper, List, GripHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NewsWidget } from "./widgets/NewsWidget"
import { WatchlistWidget } from "./widgets/WatchlistWidget"
import { JarvisWidget } from "@/components/jarvis/JarvisWidget"
import GridLayout, { Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

type WidgetType = "jarvis" | "news" | "watchlist"

interface WidgetConfig {
    id: WidgetType
    label: string
    component: React.ReactNode
    defaultH: number
}

export function RightSidebar() {
    const [isOpen, setIsOpen] = React.useState(true)
    const [activeWidgets, setActiveWidgets] = React.useState<WidgetType[]>(["jarvis", "news"])
    
    // Initial layout state
    const [layout, setLayout] = React.useState<Layout[]>([
        { i: "jarvis", x: 0, y: 0, w: 1, h: 15 },
        { i: "news", x: 0, y: 15, w: 1, h: 9 },
    ])

    const widgets: Record<WidgetType, WidgetConfig> = {
        jarvis: { 
            id: "jarvis", 
            label: "Jarvis", 
            component: <JarvisWidget mode="live" />,
            defaultH: 15 
        },
        news: { 
            id: "news", 
            label: "News", 
            component: <NewsWidget />,
            defaultH: 9 
        },
        watchlist: { 
            id: "watchlist", 
            label: "Watchlist", 
            component: <WatchlistWidget />,
            defaultH: 9 
        },
    }

    const toggleWidget = (id: WidgetType) => {
        if (activeWidgets.includes(id)) {
            setActiveWidgets(prev => prev.filter(w => w !== id))
            setLayout(prev => prev.filter(l => l.i !== id))
        } else {
            setActiveWidgets(prev => [...prev, id])
            // Add new item to the bottom
            const newY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)
            setLayout(prev => [
                ...prev,
                { i: id, x: 0, y: newY, w: 1, h: widgets[id].defaultH }
            ])
        }
    }

    const onLayoutChange = (newLayout: Layout[]) => {
        setLayout(newLayout)
    }

    return (
        <div
            className={cn(
                "flex h-screen flex-col border-l bg-sidebar transition-all duration-300",
                isOpen ? "w-80" : "w-12"
            )}
        >
            <div className="flex h-14 items-center justify-between border-b px-2 shrink-0">
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
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        <GridLayout
                            className="layout"
                            layout={layout}
                            cols={1}
                            rowHeight={30}
                            width={319}
                            onLayoutChange={onLayoutChange}
                            draggableHandle=".drag-handle"
                            isResizable={true}
                            isDraggable={true}
                            resizeHandles={['s']}
                            resizeHandle={
                                <div className="absolute bottom-0 left-0 right-0 h-4 cursor-s-resize flex items-center justify-center z-50 group/handle hover:bg-sidebar-accent/10 transition-colors">
                                    <div className="w-12 h-1 rounded-full bg-border group-hover/handle:bg-sidebar-accent-foreground/50 transition-colors" />
                                </div>
                            }
                            margin={[0, 0]}
                            containerPadding={[0, 0]}
                        >
                            {activeWidgets.map(id => {
                                const widget = widgets[id]
                                return (
                                    <div key={id} className="bg-background border-b border-sidebar-border relative group flex flex-col pb-4">
                                        {/* Header / Drag Handle */}
                                        <div className="drag-handle h-8 flex items-center justify-between px-3 bg-sidebar-accent/20 cursor-grab active:cursor-grabbing hover:bg-sidebar-accent/40 transition-colors shrink-0">
                                            <div className="flex items-center gap-2">
                                                <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-medium">{widget.label}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation() // Prevent drag start
                                                    toggleWidget(id)
                                                }}
                                                className="p-1 hover:bg-sidebar-accent rounded text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden relative">
                                            <div className="absolute inset-0 overflow-auto">
                                                {widget.component}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </GridLayout>
                    </div>
                    
                    {/* Add Widget Area */}
                    <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10 shrink-0">
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
                <div className="flex flex-1 flex-col items-center py-4 gap-3">
                    {activeWidgets.map((id) => {
                        const Icon = id === "jarvis" ? Bot : id === "news" ? Newspaper : List
                        return (
                            <div
                                key={id}
                                className="w-10 h-10 rounded-xl bg-sidebar-accent/40 border border-sidebar-border flex items-center justify-center shadow-sm text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors"
                                title={widgets[id].label}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                        )
                    })}
                    {activeWidgets.length === 0 && (
                        <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                    )}
                </div>
            )}
        </div>
    )
}

