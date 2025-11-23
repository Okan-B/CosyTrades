import { Clock3 } from "lucide-react"
import { SectionHeader } from "./SectionHeader"

interface JournalWidgetProps {
  latestJournal?: {
    date: string
    excerpt: string
  }
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date(dateString))
}

export function JournalWidget({ latestJournal }: JournalWidgetProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader title="Latest Journal" subtitle="Process beats outcome" />
      <div className="rounded-xl border bg-card p-5 shadow-sm flex-1">
        {latestJournal ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock3 className="w-3 h-3" />
              {formatDate(latestJournal.date)}
            </div>
            <p className="text-base leading-relaxed">{latestJournal.excerpt || "Entry saved with no text content."}</p>
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
  )
}
