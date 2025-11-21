"use client"

import * as React from "react"
import { Moon, Sun, Leaf, BookOpen } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-[140px] h-[36px] bg-muted/50 rounded-lg animate-pulse" />
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-md transition-colors ${theme === "light" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                title="Warm Paper (Default)"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-md transition-colors ${theme === "dark" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                title="Deep Focus"
            >
                <Moon className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("nature")}
                className={`p-2 rounded-md transition-colors ${theme === "nature" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                title="Nature"
            >
                <Leaf className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("classic")}
                className={`p-2 rounded-md transition-colors ${theme === "classic" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                title="Classic"
            >
                <BookOpen className="w-4 h-4" />
            </button>
        </div>
    )
}
