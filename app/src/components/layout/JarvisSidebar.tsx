"use client"

import { useState } from "react"
import { Bot, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function JarvisSidebar() {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div
            className={cn(
                "flex h-screen flex-col border-l bg-sidebar transition-all duration-300",
                isOpen ? "w-80" : "w-12"
            )}
        >
            <div className="flex h-14 items-center justify-between border-b px-2">
                {isOpen && <span className="font-semibold ml-2">Jarvis</span>}
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
                <div className="flex-1 p-4">
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        Jarvis Chat Interface
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center py-4">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
            )}
        </div>
    )
}
