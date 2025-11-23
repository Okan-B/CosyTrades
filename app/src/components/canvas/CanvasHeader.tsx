"use client"

import * as React from "react"
import { Save, Share2, Layout, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Canvas, CanvasService } from "@/services/CanvasService"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CanvasHeaderProps {
    currentCanvas: Canvas | null
    onCanvasSelect: (canvas: Canvas) => void
    onSave: (name: string, isPublic: boolean, description?: string, tags?: string[]) => Promise<void>
    onUpdate: () => Promise<void>
    canvases: Canvas[]
}

export function CanvasHeader({ currentCanvas, onCanvasSelect, onSave, onUpdate, canvases }: CanvasHeaderProps) {
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false)
    const [newCanvasName, setNewCanvasName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [tags, setTags] = React.useState("")
    const [isPublic, setIsPublic] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    const handleSave = async () => {
        if (!newCanvasName.trim()) return
        setIsSaving(true)
        try {
            const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean)
            await onSave(newCanvasName, isPublic, description, tagsArray)
            setIsSaveModalOpen(false)
            setNewCanvasName("")
            setDescription("")
            setTags("")
        } catch (error) {
            console.error("Failed to save canvas", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Layout className="w-4 h-4" />
                            {currentCanvas ? currentCanvas.name : "Default Layout"}
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>My Canvases</DropdownMenuLabel>
                        {canvases.map(canvas => (
                            <DropdownMenuItem key={canvas.id} onClick={() => onCanvasSelect(canvas)}>
                                {canvas.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                             // Reset to default logic could go here
                             onCanvasSelect(null as any) 
                        }}>
                            Default Layout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
                {currentCanvas ? (
                    <Button variant="ghost" size="sm" onClick={onUpdate} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(true)} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save As...
                    </Button>
                )}
                
                <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
            </div>

            <Modal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                title="Save Canvas Layout"
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Canvas Name</Label>
                        <Input 
                            placeholder="e.g., Morning Scalp Setup" 
                            value={newCanvasName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCanvasName(e.target.value)}
                        />
                    </div>
                    
                    {isPublic && (
                        <>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                    placeholder="Describe your strategy..." 
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags (comma separated)</Label>
                                <Input 
                                    placeholder="Scalping, Forex, Crypto..." 
                                    value={tags}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-between">
                        <Label>Share to Community</Label>
                        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                    <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Canvas"}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
