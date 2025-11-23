import { ShieldCheck } from "lucide-react"
import { SectionHeader } from "./SectionHeader"

interface RhythmWidgetProps {
  journalStreak: number
  activeRules: number
}

export function RhythmWidget({ journalStreak, activeRules }: RhythmWidgetProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader title="Rhythm" subtitle="Habits that keep the room calm" />
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {journalStreak}
          </div>
          <div>
            <p className="font-semibold">Days logged this week</p>
            <p className="text-xs text-muted-foreground">Aim for 5/7 to build the muscle.</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span>{activeRules > 0 ? "Keep rules visible while journaling and reviewing trades." : "Add one rule today to anchor discipline."}</span>
        </div>
      </div>
    </div>
  )
}
