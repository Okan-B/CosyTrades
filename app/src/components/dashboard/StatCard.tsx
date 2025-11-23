import type React from "react"

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  hint?: string
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="p-2 rounded-lg bg-muted/50 text-foreground flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
