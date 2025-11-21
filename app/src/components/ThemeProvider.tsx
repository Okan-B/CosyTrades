"use client"

import * as React from "react"

type Theme = "light" | "dark" | "nature" | "classic"

interface ThemeProviderContext {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderContext | undefined>(undefined)

export function ThemeProvider({
    children,
    defaultTheme = "light",
    storageKey = "theme",
}: {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}) {
    const [theme, setTheme] = React.useState<Theme>(defaultTheme)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        const savedTheme = localStorage.getItem(storageKey) as Theme | null
        if (savedTheme) {
            setTheme(savedTheme)
        }
        setMounted(true)
    }, [storageKey])

    React.useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark", "theme-nature", "theme-classic")

        if (theme === "dark") {
            root.classList.add("dark")
        } else if (theme === "nature") {
            root.classList.add("theme-nature")
        } else if (theme === "classic") {
            root.classList.add("theme-classic")
        } else {
            root.classList.add("light")
        }

        localStorage.setItem(storageKey, theme)
    }, [theme, mounted, storageKey])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}
