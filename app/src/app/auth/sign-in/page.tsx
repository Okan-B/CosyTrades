"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
)

export default function SignInPage() {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get("redirectTo") || "/"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSupabaseConfigured) {
            setError("Supabase environment variables are not set.")
            return
        }
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setError("Please verify your email address before logging in.")
            } else {
                setError(error.message)
            }
            return
        }

        router.replace(redirectTo)
    }

    return (
        <div className="rounded-2xl border bg-card shadow-sm">
            <div className="p-6 border-b bg-muted/40 rounded-t-2xl">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1">Welcome back</p>
                <h1 className="text-2xl font-bold">Sign in</h1>
                <p className="text-sm text-muted-foreground">Enter your credentials to access your room.</p>
            </div>
            <form onSubmit={handleSignIn} className="p-6 space-y-4">
                {!isSupabaseConfigured && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
                        <AlertCircle className="h-4 w-4" />
                        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
                    </div>
                )}
                <label className="block space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Password</span>
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </label>

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    {loading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-sm text-muted-foreground text-center">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                        Create one
                    </Link>
                </div>
            </form>
        </div>
    )
}
