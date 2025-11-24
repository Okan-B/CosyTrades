"use client"

import * as React from "react"
import { Heart, Download, Share2, Trash2 } from "lucide-react"
import { Canvas } from "@/services/CanvasService"

export interface CanvasCardProps {
    setup: Canvas
    onImport: (canvas: Canvas) => void
    canRemove?: boolean
    onRemove?: (id: string) => void
}

export function CanvasCard({ setup, onImport, canRemove = false, onRemove }: CanvasCardProps) {
    const [likes, setLikes] = React.useState(setup.likes_count || 0)
    const [hasLiked, setHasLiked] = React.useState(false)

    const handleLike = () => {
        if (hasLiked) {
            setLikes((prev: number) => prev - 1)
            setHasLiked(false)
        } else {
            setLikes((prev: number) => prev + 1)
            setHasLiked(true)
        }
        // TODO: Call API to toggle like
    }

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">{setup.name}</h3>
                    <p className="text-sm text-muted-foreground">by {setup.author_name || setup.users?.email || "Community trader"}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-[40%]">
                    {setup.tags?.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full uppercase font-medium tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {setup.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                >
                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                    <span>{likes}</span>
                </button>

                <div className="flex gap-2">
                    <button className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Share">
                        <Share2 className="w-4 h-4" />
                    </button>
                    {canRemove && (
                        <button
                            onClick={() => onRemove?.(setup.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Remove from community"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button 
                        onClick={() => onImport(setup)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Import
                    </button>
                </div>
            </div>
        </div>
    )
}
