"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BookOpen, List, User, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { LogoutModal } from "@/components/auth/LogoutModal"

const navigation = [
    { name: "Today", href: "/", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Watchlist", href: "/watchlist", icon: List },
    { name: "Me", href: "/me", icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const supabase = useMemo(() => createClient(), [])
    const [user, setUser] = useState<any>(null)
    const [signingOut, setSigningOut] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const logoutButtonRef = useRef<HTMLButtonElement | null>(null)
    const supabaseConfigured = typeof window !== "undefined" &&
        Boolean(
            process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
            !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
        )

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])



    const router = useRouter() // Make sure to import useRouter from next/navigation


    const handleSignOut = async () => {
        setSigningOut(true)
        try {
            // 1. Sign out on client to clear local state/listeners
            if (supabaseConfigured) {
                await supabase.auth.signOut()
            }

            // 2. Call server-side route to clear cookies
            await fetch("/auth/sign-out", {
                method: "POST",
            })

            // 3. Force a hard reload to clear all memory/cache
            window.location.href = "/auth/sign-in"
        } catch (error) {
            console.error("Error signing out:", error)
            window.location.href = "/auth/sign-in"
        } finally {
            setSigningOut(false)
        }
    }

    return (
        <>
            {/* Spacer to reserve width in the flex layout */}
            <div className="w-16 h-full flex-shrink-0 bg-sidebar border-r invisible" />

            {/* Actual Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 h-screen flex flex-col border-r bg-sidebar py-4 transition-[width] duration-200 ease-in-out z-40",
                    isExpanded ? "w-56 shadow-2xl" : "w-16"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => {
                    if (!showLogoutConfirm) setIsExpanded(false)
                }}
            >
                <div className="flex flex-1 flex-col items-center gap-2 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex w-full items-center rounded-md px-2 py-2 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    "justify-start",
                                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60"
                                )}
                                title={item.name}
                            >
                                <item.icon className="h-8 w-8" />
                                <span
                                    className={cn(
                                        "text-sm whitespace-nowrap overflow-hidden transition-all duration-200",
                                        isExpanded ? "opacity-100 max-w-[140px] ml-3" : "opacity-0 max-w-0 ml-0"
                                    )}
                                    aria-hidden={!isExpanded}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
                <div className="mt-auto flex items-center justify-center px-2 relative">
                    {user ? (
                        <>
                            <button
                                ref={logoutButtonRef}
                                onClick={() => setShowLogoutConfirm(true)}
                                disabled={signingOut}
                                className={cn(
                                    "flex w-full items-center rounded-md px-2 py-2 transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    "justify-start",
                                    signingOut && "opacity-60"
                                )}
                                title="Sign out"
                                aria-label="Sign out"
                                aria-expanded={isExpanded}
                            >
                                {signingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-8 w-8" />}
                                <span
                                    className={cn(
                                        "text-sm whitespace-nowrap overflow-hidden transition-all duration-200",
                                        isExpanded ? "opacity-100 max-w-[140px] ml-3" : "opacity-0 max-w-0 ml-0"
                                    )}
                                    aria-hidden={!isExpanded}
                                >
                                    Logout
                                </span>
                            </button>
                            <LogoutModal
                                isOpen={showLogoutConfirm}
                                onClose={() => setShowLogoutConfirm(false)}
                                onConfirm={handleSignOut}
                                loading={signingOut}
                            />
                        </>
                    ) : (
                        <Link
                            href="/auth/sign-in"
                            className={cn(
                                "flex w-full items-center rounded-md px-2 py-2 transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                "justify-start"
                            )}
                            title="Sign in"
                        >
                            <LogOut className="h-8 w-8 rotate-180" />
                            <span
                                className={cn(
                                    "text-sm whitespace-nowrap overflow-hidden transition-all duration-200",
                                    isExpanded ? "opacity-100 max-w-[140px] ml-3" : "opacity-0 max-w-0 ml-0"
                                )}
                                aria-hidden={!isExpanded}
                            >
                                Login
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}
