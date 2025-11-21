
"use client"

import * as React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { StockNote } from "./StockNote"
import { AddTradeModal } from "@/components/data/AddTradeModal"

interface StockDetailProps {
    ticker: string | null
}

// Mock data for the chart
const data = [
    { name: '9:30', price: 178.2 },
    { name: '10:00', price: 179.5 },
    { name: '10:30', price: 178.8 },
    { name: '11:00', price: 180.1 },
    { name: '11:30', price: 181.2 },
    { name: '12:00', price: 180.9 },
    { name: '12:30', price: 181.5 },
    { name: '13:00', price: 182.1 },
    { name: '13:30', price: 181.8 },
    { name: '14:00', price: 182.5 },
    { name: '14:30', price: 183.2 },
    { name: '15:00', price: 182.9 },
    { name: '15:30', price: 183.5 },
    { name: '16:00', price: 182.5 },
];

export function StockDetail({ ticker }: StockDetailProps) {
    const [isInfoOpen, setIsInfoOpen] = React.useState(false)
    const { theme } = useTheme()
    const canvasRef = React.useRef<HTMLDivElement>(null)
    const infoSectionId = React.useId()

    // State for dynamic notes
    // Start with one note by default
    const [notes, setNotes] = React.useState<{ id: string; x: number; y: number; zIndex: number; title: string }[]>([
        { id: '1', x: 0, y: 0, zIndex: 1, title: 'Investment Thesis' }
    ])

    const addNote = () => {
        const newId = Math.random().toString(36).substr(2, 9)
        // Add new note with a slight offset so they don't stack perfectly
        const offset = notes.length * 20
        // Find max z-index to place new note on top
        const maxZ = Math.max(0, ...notes.map(n => n.zIndex))
        setNotes(prev => [{ id: newId, x: offset, y: offset, zIndex: maxZ + 1, title: 'New Note' }, ...prev])
    }

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(note => note.id !== id))
    }

    const updateNotePosition = (id: string, x: number, y: number) => {
        setNotes(prev => prev.map(note =>
            note.id === id ? { ...note, x, y } : note
        ))
    }

    const updateNoteTitle = (id: string, title: string) => {
        setNotes(prev => prev.map(note =>
            note.id === id ? { ...note, title } : note
        ))
    }

    const bringToFront = (id: string) => {
        setNotes(prev => {
            const maxZ = Math.max(0, ...prev.map(n => n.zIndex))
            const note = prev.find(n => n.id === id)
            // Optimization: If note is already at the top, don't update state
            // This prevents re-renders that interrupt color picker clicks
            if (note && note.zIndex === maxZ) return prev

            return prev.map(note =>
                note.id === id ? { ...note, zIndex: maxZ + 1 } : note
            )
        })
    }

    const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false)

    if (!ticker) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-background">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a stock</h3>
                <p>Choose a ticker from the watchlist to view details and notes.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b px-8 flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        {ticker}
                        <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                            Technology
                        </span>
                    </h1>
                </div>
                <button
                    onClick={() => setIsTradeModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Log Trade
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8 space-y-8">

                    {/* Chart Section (Full Width) */}
                    <div className="h-[400px] w-full rounded-xl border bg-card p-4 shadow-sm relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Key Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border bg-card flex flex-col justify-center">
                            <div className="text-sm text-muted-foreground mb-1">Price</div>
                            <div className="text-2xl font-mono font-bold">$182.50</div>
                        </div>
                        <div className="p-4 rounded-xl border bg-card flex flex-col justify-center">
                            <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                            <div className="text-2xl font-mono font-bold">$2.8T</div>
                        </div>
                        <div className="p-4 rounded-xl border bg-card flex flex-col justify-center">
                            <div className="text-sm text-muted-foreground mb-1">P/E Ratio</div>
                            <div className="text-2xl font-mono font-bold">28.5</div>
                        </div>
                    </div>

                    {/* Collapsible "More Info" Section */}
                    <div className="space-y-2">
                        <div className="py-2 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setIsInfoOpen(prev => !prev)}
                                aria-expanded={isInfoOpen}
                                aria-controls={infoSectionId}
                                className="inline-flex items-center justify-center rounded-full border border-muted/60 px-6 py-2 text-sm font-semibold text-muted-foreground tracking-wide hover:border-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40"
                            >
                                {isInfoOpen ? "Hide Info" : "More Info"}
                            </button>
                        </div>
                        <div
                            id={infoSectionId}
                            className={`px-1 sm:px-2 transition-[max-height,opacity,padding] duration-300 ease-out ${isInfoOpen ? "py-4 opacity-100 max-h-[360px]" : "py-0 opacity-0 max-h-0"} overflow-hidden`}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">52W High</div>
                                    <div className="font-mono font-medium">$198.23</div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">52W Low</div>
                                    <div className="font-mono font-medium">$124.17</div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Div Yield</div>
                                    <div className="font-mono font-medium">0.52%</div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Beta</div>
                                    <div className="font-mono font-medium">1.28</div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Avg Vol</div>
                                    <div className="font-mono font-medium">52.4M</div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Next Earnings</div>
                                    <div className="font-mono font-medium">May 2, 2025</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Canvas Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span>📝</span> Investment Canvas
                            </h2>
                            <button
                                onClick={addNote}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Note
                            </button>
                        </div>

                        {/* Canvas Container */}
                        <div ref={canvasRef} className="relative min-h-[600px] rounded-xl border-2 border-dashed border-muted/50 bg-muted/10 overflow-hidden">
                            {notes.map(note => (
                                <StockNote
                                    key={note.id}
                                    id={note.id}
                                    initialX={note.x}
                                    initialY={note.y}
                                    zIndex={note.zIndex}
                                    title={note.title}
                                    theme={theme === "dark" ? "dark" : "light"}
                                    dragConstraints={canvasRef as React.RefObject<Element>}
                                    onDelete={deleteNote}
                                    onPositionChange={updateNotePosition}
                                    onTitleChange={updateNoteTitle}
                                    onFocus={bringToFront}
                                />
                            ))}
                            {notes.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                                    <p>Click Add Note to start building your thesis.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddTradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                ticker={ticker}
            />
        </div>
    )
}
