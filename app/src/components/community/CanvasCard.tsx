"use client"

import * as React from "react"
import { Heart, Download, Share2 } from "lucide-react"

export interface CanvasSetup {
    id: string
    title: string
    author: string
    description: string
    upvotes: number
    tags: string[]
}

interface CanvasCardProps {
    setup: CanvasSetup
}

export function CanvasCard({ setup }: CanvasCardProps) {
    const [upvotes, setUpvotes] = React.useState(setup.upvotes)
    const [hasUpvoted, setHasUpvoted] = React.useState(false)

    const handleUpvote = () => {
        if (hasUpvoted) {
            setUpvotes(prev => prev - 1)
            setHasUpvoted(false)
        } else {
            setUpvotes(prev => prev + 1)
            setHasUpvoted(true)
        }
    }

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">{setup.title}</h3>
                    <p className="text-sm text-muted-foreground">by {setup.author}</p>
                </div>
                <div className="flex gap-1">
                    {setup.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full uppercase font-medium tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {setup.description}
            </p>

            <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${hasUpvoted ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                >
                    <Heart className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
                    <span>{upvotes}</span>
                </button>

                <div className="flex gap-2">
                    <button className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Share">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Import
                    </button>
                </div>
            </div>
        </div>
    )
}
