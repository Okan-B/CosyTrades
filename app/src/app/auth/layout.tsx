import type { Metadata } from "next"
import Link from "next/link"
import "../globals.css"

export const metadata: Metadata = {
    title: "CosyTrades | Sign in",
    description: "Sign in to your calm trading room.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 text-foreground">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 gap-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">CT</div>
                        <div>
                            <p className="text-lg font-semibold">CosyTrades</p>
                            <p className="text-sm text-muted-foreground">Calm over hype.</p>
                        </div>
                    </div>
                    <Link href="/" className="text-sm text-primary hover:underline">
                        Back to Home
                    </Link>
                </header>
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
