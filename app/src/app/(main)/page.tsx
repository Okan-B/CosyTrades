import type React from "react"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { TradeImporter } from "@/components/data/TradeImporter"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { Brain, Activity, NotebookPen, ShieldCheck, ArrowUpRight, Clock3, Sparkles } from "lucide-react"

type DashboardData = {
  mode: "live" | "demo"
  userEmail?: string
  openPositions: number
  tradesToday: number
  recentTrades: Array<{
    id: string
    symbol: string
    direction: "BUY" | "SELL"
    quantity: number
    price: number
    timestamp: string
  }>
  journalStreak: number
  latestJournal?: {
    date: string
    excerpt: string
  }
  activeRules: number
}

const DEMO_DASHBOARD: DashboardData = {
  mode: "demo",
  openPositions: 2,
  tradesToday: 1,
  recentTrades: [
    { id: "demo-1", symbol: "AAPL", direction: "BUY", quantity: 50, price: 181.2, timestamp: new Date().toISOString() },
    { id: "demo-2", symbol: "TSLA", direction: "SELL", quantity: 12, price: 176.8, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ],
  journalStreak: 3,
  latestJournal: {
    date: new Date().toISOString(),
    excerpt: "Refined swing plan: focus on quality names at weekly demand. No revenge trades after first loss.",
  },
  activeRules: 4,
}

async function getDashboardData(): Promise<DashboardData> {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
  )

  if (!supabaseConfigured) {
    return DEMO_DASHBOARD
  }

  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) return DEMO_DASHBOARD

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const [{ data: positions }, { data: trades }, { data: journals }, { data: rules }] = await Promise.all([
      supabase.from("positions").select("id").eq("user_id", user.id).eq("status", "OPEN"),
      supabase.from("trades")
        .select("id,symbol,direction,quantity,price,timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", startOfDay.toISOString())
        .order("timestamp", { ascending: false })
        .limit(5),
      supabase.from("journal_entries")
        .select("id,date,content")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgo.toISOString().slice(0, 10))
        .order("date", { ascending: false }),
      supabase.from("rules")
        .select("id,is_active")
        .eq("user_id", user.id),
    ])

    const journalStreak = new Set((journals ?? []).map((j) => j.date)).size
    const latestJournal = journals?.[0]

    return {
      mode: "live",
      userEmail: user.email ?? undefined,
      openPositions: positions?.length ?? 0,
      tradesToday: trades?.length ?? 0,
      recentTrades: trades?.map((trade) => ({
        ...trade,
        direction: (trade.direction ?? "BUY") as "BUY" | "SELL",
      })) ?? [],
      journalStreak,
      latestJournal: latestJournal
        ? {
          date: latestJournal.date,
          excerpt: toPlainTextSnippet(latestJournal.content),
        }
        : undefined,
      activeRules: (rules ?? []).filter((rule) => rule.is_active !== false).length,
    }
  } catch (error) {
    console.error("Failed to load dashboard data", error)
    return DEMO_DASHBOARD
  }
}

function toPlainTextSnippet(content?: string | null): string {
  type BlockNoteChild = { text?: string }
  type BlockNoteBlock = { content?: BlockNoteChild[] | string }

  if (!content) return ""
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      const blocks = parsed as BlockNoteBlock[]
      const text = blocks
        .map((block) => {
          if (Array.isArray(block?.content)) {
            return (block.content as BlockNoteChild[])
              .map((child) => child?.text ?? "")
              .join(" ")
          }
          if (typeof block?.content === "string") return block.content
          return ""
        })
        .join(" ")
      return text.slice(0, 160).trim()
    }
  } catch {
    // Fall through to raw string
  }
  return typeof content === "string" ? content.slice(0, 160).trim() : ""
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date(dateString))
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(dateString))
}

function buildJarvisPrompts(data: DashboardData) {
  const prompts: string[] = []

  if (data.tradesToday === 0) {
    prompts.push("No trades logged yet. Walk through your checklist before entering anything that feels like a chase.")
  } else {
    prompts.push("Review each trade against your rules before the close. Mark any discipline slips explicitly.")
  }

  if (!data.latestJournal) {
    prompts.push("Capture a quick reflection. Even two sentences keep the streak alive and calm the mind.")
  } else if (data.journalStreak < 3) {
    prompts.push("Your journaling streak is young—stack a few more days to lock the habit.")
  }

  if (data.activeRules === 0) {
    prompts.push("Define at least one guardrail rule today (e.g., max daily loss or avoid trading first 15 minutes).")
  }

  if (data.mode === "demo") {
    prompts.push("Connect Supabase auth to move from demo data to your real trading room.")
  }

  return prompts.slice(0, 3)
}

export default async function DashboardPage() {
  const dashboard = await getDashboardData()
  const jarvisPrompts = buildJarvisPrompts(dashboard)

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Calm over hype</p>
            <h1 className="text-4xl font-bold tracking-tight">Today</h1>
            <p className="text-muted-foreground">{formatDate(new Date().toISOString())}</p>
            {dashboard.mode === "demo" ? (
              <p className="text-xs text-muted-foreground">Showing demo data. Sign in via Supabase to see your room.</p>
            ) : (
              <p className="text-xs text-muted-foreground">Welcome back{dashboard.userEmail ? `, ${dashboard.userEmail}` : ""}.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TradeImporter />
            <ThemeSwitcher />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Open Positions"
            value={dashboard.openPositions}
            icon={<Activity className="w-4 h-4" />}
            hint="Positions marked OPEN in your journal"
          />
          <StatCard
            label="Trades Logged Today"
            value={dashboard.tradesToday}
            icon={<ArrowUpRight className="w-4 h-4" />}
            hint={dashboard.tradesToday > 0 ? "Review execution vs. plan" : "Plan first, then execute"}
          />
          <StatCard
            label="Journal Streak"
            value={`${dashboard.journalStreak}/7`}
            icon={<NotebookPen className="w-4 h-4" />}
            hint="Entries in the last 7 days"
          />
          <StatCard
            label="Active Rules"
            value={dashboard.activeRules}
            icon={<ShieldCheck className="w-4 h-4" />}
            hint={dashboard.activeRules > 0 ? "Keep them visible today" : "Add a guardrail before trading"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader title="Recent Trades" subtitle="Ground Jarvis in your latest executions" />
            <div className="rounded-xl border bg-card shadow-sm">
              {dashboard.recentTrades.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">No trades logged yet today.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {dashboard.recentTrades.map((trade) => (
                    <li key={trade.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-md text-xs font-semibold ${trade.direction === "BUY" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"}`}>
                          {trade.direction}
                        </div>
                        <div>
                          <p className="font-semibold">{trade.symbol}</p>
                          <p className="text-xs text-muted-foreground">{trade.quantity} @ ${trade.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(trade.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader title="Jarvis" subtitle="Soft nudges to keep you grounded" />
            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>{dashboard.mode === "demo" ? "Demo context" : "Live context"}</span>
              </div>
              <ul className="space-y-3">
                {jarvisPrompts.map((prompt, idx) => (
                  <li key={idx} className="flex gap-3">
                    <Sparkles className="w-4 h-4 text-primary mt-1" />
                    <p className="text-sm text-foreground">{prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader title="Latest Journal" subtitle="Process beats outcome" />
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              {dashboard.latestJournal ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock3 className="w-3 h-3" />
                    {formatDate(dashboard.latestJournal.date)}
                  </div>
                  <p className="text-base leading-relaxed">{dashboard.latestJournal.excerpt || "Entry saved with no text content."}</p>
                  <p className="text-xs text-muted-foreground">Jarvis will reference this in chats today.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>No journal entry yet today.</p>
                  <p>Capture pre-trade intentions or a brief market read to center yourself.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader title="Rhythm" subtitle="Habits that keep the room calm" />
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {dashboard.journalStreak}
                </div>
                <div>
                  <p className="font-semibold">Days logged this week</p>
                  <p className="text-xs text-muted-foreground">Aim for 5/7 to build the muscle.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>{dashboard.activeRules > 0 ? "Keep rules visible while journaling and reviewing trades." : "Add one rule today to anchor discipline."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, hint }: { label: string; value: string | number; icon: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="p-2 rounded-lg bg-muted/50 text-foreground flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}
