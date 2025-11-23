"use client"

import * as React from "react"
import { Search, Filter } from "lucide-react"
import { CanvasCard } from "./CanvasCard"

import { CanvasService, Canvas } from "@/services/CanvasService"
import { toast } from "sonner"

export function CommunityCanvasExplorer() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [canvases, setCanvases] = React.useState<Canvas[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        loadCanvases()
    }, [])

    const loadCanvases = async () => {
        try {
            const data = await CanvasService.getCommunityCanvases()
            setCanvases(data)
        } catch (error) {
            console.error("Failed to load community canvases", error)
            toast.error("Failed to load community canvases")
        } finally {
            setIsLoading(false)
        }
    }

    const handleImport = async (canvas: Canvas) => {
        try {
            await CanvasService.saveCanvas(
                `Imported: ${canvas.name}`,
                canvas.layout,
                false, // Private by default
                `Imported from ${canvas.author_name || "Community"}`,
                canvas.tags
            )
            toast.success("Canvas imported successfully! Check your canvases.")
        } catch (error) {
            console.error("Failed to import canvas", error)
            toast.error("Failed to import canvas")
        }
    }

    const filteredCanvases = canvases.filter(canvas =>
        canvas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

            {isLoading ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                    Loading community setups...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
                    {filteredCanvases.length > 0 ? (
                        filteredCanvases.map(setup => (
                            <CanvasCard key={setup.id} setup={setup} onImport={handleImport} />
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-10 text-muted-foreground">
                            No canvases found. Be the first to share one!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
