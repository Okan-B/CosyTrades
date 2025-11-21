"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Loader2, Plus, Shield, Trash2, Zap, Target } from "lucide-react"

type Rule = {
    id: string
    title: string
    description: string | null
    category: string | null
    is_active: boolean | null
}

type Setup = {
    id: string
    name: string
    description: string | null
}

export default function MePage() {
    const supabase = useMemo(() => createClient(), [])
    const supabaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
    )
    const [rules, setRules] = useState<Rule[]>([])
    const [setups, setSetups] = useState<Setup[]>([])
    const [loading, setLoading] = useState(true)
    const [authMessage, setAuthMessage] = useState<string | null>(null)

    const [newRule, setNewRule] = useState({ title: "", description: "", category: "" })
    const [newSetup, setNewSetup] = useState({ name: "", description: "" })
    const [savingRule, setSavingRule] = useState(false)
    const [savingSetup, setSavingSetup] = useState(false)

    useEffect(() => {
        const load = async () => {
            if (!supabaseConfigured) {
                setAuthMessage("Supabase env vars are not set—showing placeholders only.")
                setLoading(false)
                return
            }

            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                setAuthMessage("Sign in to sync your rules, setups, and streaks.")
                setLoading(false)
                return
            }

            const [{ data: rulesData }, { data: setupsData }] = await Promise.all([
                supabase.from("rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
                supabase.from("setups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            ])

            setRules(rulesData ?? [])
            setSetups(setupsData ?? [])
            setLoading(false)
        }

        load()
    }, [supabase, supabaseConfigured])

    const addRule = async () => {
        if (!newRule.title.trim()) return
        setSavingRule(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setAuthMessage("Sign in to save this rule.")
            setSavingRule(false)
            return
        }

        const payload = {
            user_id: user.id,
            title: newRule.title.trim(),
            description: newRule.description.trim() || null,
            category: newRule.category.trim() || null,
            is_active: true,
        }

        const { data, error } = await supabase.from("rules").insert(payload).select().single()
        if (!error && data) {
            setRules((prev) => [data as Rule, ...prev])
            setNewRule({ title: "", description: "", category: "" })
        }
        setSavingRule(false)
    }

    const addSetup = async () => {
        if (!newSetup.name.trim()) return
        setSavingSetup(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setAuthMessage("Sign in to save this setup.")
            setSavingSetup(false)
            return
        }

        const payload = {
            user_id: user.id,
            name: newSetup.name.trim(),
            description: newSetup.description.trim() || null,
        }

        const { data, error } = await supabase.from("setups").insert(payload).select().single()
        if (!error && data) {
            setSetups((prev) => [data as Setup, ...prev])
            setNewSetup({ name: "", description: "" })
        }
        setSavingSetup(false)
    }

    const toggleRule = async (ruleId: string, current: boolean | null) => {
        setRules((prev) => prev.map((rule) => rule.id === ruleId ? { ...rule, is_active: !current } : rule))
        const { error } = await supabase.from("rules").update({ is_active: !current }).eq("id", ruleId)
        if (error) {
            setRules((prev) => prev.map((rule) => rule.id === ruleId ? { ...rule, is_active: current } : rule))
        }
    }

    const deleteRule = async (ruleId: string) => {
        const snapshot = rules
        setRules((prev) => prev.filter((rule) => rule.id !== ruleId))
        const { error } = await supabase.from("rules").delete().eq("id", ruleId)
        if (error) {
            setRules(snapshot)
        }
    }

    const deleteSetup = async (setupId: string) => {
        const snapshot = setups
        setSetups((prev) => prev.filter((setup) => setup.id !== setupId))
        const { error } = await supabase.from("setups").delete().eq("id", setupId)
        if (error) {
            setSetups(snapshot)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Personal Guardrails</p>
                <h1 className="text-3xl font-bold tracking-tight">Me</h1>
                <p className="text-muted-foreground">Rules and setups Jarvis references to keep you disciplined.</p>
                {authMessage && <p className="text-xs text-amber-600 dark:text-amber-400">{authMessage}</p>}
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading your room...
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    My Rules
                                </h2>
                                <p className="text-sm text-muted-foreground">Jarvis will warn you when you drift.</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{rules.filter(r => r.is_active !== false).length} active</span>
                        </div>

                        <div className="space-y-3 rounded-lg bg-muted/40 p-3 border border-dashed border-border">
                            <div className="grid sm:grid-cols-3 gap-2">
                                <input
                                    placeholder="Title (e.g., Max 1% risk)"
                                    value={newRule.title}
                                    onChange={(e) => setNewRule((prev) => ({ ...prev, title: e.target.value }))}
                                    className="col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                                />
                                <input
                                    placeholder="Category (Risk, Psych...)"
                                    value={newRule.category}
                                    onChange={(e) => setNewRule((prev) => ({ ...prev, category: e.target.value }))}
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <textarea
                                placeholder="Describe the rule and its why..."
                                value={newRule.description}
                                onChange={(e) => setNewRule((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                            />
                            <Button onClick={addRule} disabled={savingRule} className="w-full sm:w-auto">
                                {savingRule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {savingRule ? "Saving..." : "Add Rule"}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {rules.length === 0 && <p className="text-sm text-muted-foreground">No rules defined yet.</p>}
                            {rules.map((rule) => (
                                <div key={rule.id} className="rounded-lg border p-4 bg-card/40">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{rule.title}</p>
                                                {rule.category && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
                                                        {rule.category}
                                                    </span>
                                                )}
                                            </div>
                                            {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleRule(rule.id, rule.is_active)}
                                                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${rule.is_active !== false
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                                                    : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {rule.is_active !== false ? "Active" : "Paused"}
                                            </button>
                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                className="p-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                aria-label={`Delete ${rule.title}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    My Setups
                                </h2>
                                <p className="text-sm text-muted-foreground">Document the playbook Jarvis can reference.</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{setups.length} tracked</span>
                        </div>

                        <div className="space-y-3 rounded-lg bg-muted/40 p-3 border border-dashed border-border">
                            <input
                                placeholder="Setup name (e.g., Oversold Swing)"
                                value={newSetup.name}
                                onChange={(e) => setNewSetup((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                            <textarea
                                placeholder="Criteria, entry/exit triggers, context..."
                                value={newSetup.description}
                                onChange={(e) => setNewSetup((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                            />
                            <Button onClick={addSetup} disabled={savingSetup} className="w-full sm:w-auto">
                                {savingSetup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {savingSetup ? "Saving..." : "Add Setup"}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {setups.length === 0 && <p className="text-sm text-muted-foreground">No setups captured yet.</p>}
                            {setups.map((setup) => (
                                <div key={setup.id} className="rounded-lg border p-4 bg-card/40 flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="w-4 h-4 text-primary" />
                                            <p className="font-semibold">{setup.name}</p>
                                        </div>
                                        {setup.description && <p className="text-sm text-muted-foreground">{setup.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => deleteSetup(setup.id)}
                                        className="p-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        aria-label={`Delete ${setup.name}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-lg border border-dashed p-4 bg-muted/30 flex items-start gap-3 text-sm text-muted-foreground">
                            <Zap className="w-4 h-4 text-primary mt-0.5" />
                            <p>Jarvis will mix your rules and setups into coaching prompts once Supabase auth is connected.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
