"use client"

import * as React from "react"
import { CanvasHeader } from "./CanvasHeader"
import { Canvas } from "./Canvas"
import { CanvasService, Canvas as CanvasType, CanvasLayout } from "@/services/CanvasService"
import { toast } from "sonner"

interface CanvasManagerProps {
    widgets: Record<string, React.ReactNode>
    initialCanvases: CanvasType[]
}

export function CanvasManager({ widgets, initialCanvases }: CanvasManagerProps) {
    const [canvases, setCanvases] = React.useState<CanvasType[]>(initialCanvases)
    const [currentCanvas, setCurrentCanvas] = React.useState<CanvasType | null>(null)
    const [currentLayout, setCurrentLayout] = React.useState<CanvasLayout | undefined>(undefined)

    const handleCanvasSelect = (canvas: CanvasType) => {
        setCurrentCanvas(canvas)
        setCurrentLayout(canvas ? canvas.layout : undefined)
    }

    const handleLayoutChange = (layout: CanvasLayout) => {
        setCurrentLayout(layout)
    }

    const handleSave = async (name: string, isPublic: boolean, description?: string, tags?: string[]) => {
        if (!currentLayout) return

        try {
            const newCanvas = await CanvasService.saveCanvas(name, currentLayout, isPublic, description, tags)
            setCanvases(prev => [newCanvas, ...prev])
            setCurrentCanvas(newCanvas)
            toast.success(`"${name}" has been saved successfully.`)
        } catch (error) {
            console.error("Failed to save canvas", error)
            toast.error("Failed to save canvas. Please try again.")
        }
    }

    const handleUpdate = async () => {
        if (!currentCanvas || !currentLayout) return

        try {
            await CanvasService.updateCanvas(currentCanvas.id, { layout: currentLayout })
            
            // Update local state
            setCanvases(prev => prev.map(c => 
                c.id === currentCanvas.id ? { ...c, layout: currentLayout } : c
            ))
            
            toast.success("Your layout changes have been saved.")
        } catch (error) {
            console.error("Failed to update canvas", error)
             toast.error("Failed to update canvas.")
        }
    }

    return (
        <div className="flex flex-col h-full">
            <CanvasHeader
                currentCanvas={currentCanvas}
                onCanvasSelect={handleCanvasSelect}
                onSave={handleSave}
                onUpdate={handleUpdate}
                canvases={canvases}
            />
            <div className="flex-1 overflow-hidden">
                <Canvas
                    widgets={widgets}
                    defaultLayout={currentLayout}
                    onLayoutChange={handleLayoutChange}
                />
            </div>
        </div>
    )
}
