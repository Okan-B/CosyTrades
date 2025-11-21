import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { JarvisSidebar } from "@/components/layout/JarvisSidebar"

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
            <JarvisSidebar />
        </div>
    )
}
