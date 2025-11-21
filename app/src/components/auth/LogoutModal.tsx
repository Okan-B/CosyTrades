"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogoutModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    loading?: boolean
}

export function LogoutModal({ isOpen, onClose, onConfirm, loading }: LogoutModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <LogOut className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Sign out?</h3>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to sign out of your account?
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? "Signing out..." : "Sign out"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
