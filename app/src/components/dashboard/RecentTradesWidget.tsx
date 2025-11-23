import { SectionHeader } from "./SectionHeader"

interface Trade {
  id: string
  symbol: string
  direction: "BUY" | "SELL"
  quantity: number
  price: number
  timestamp: string
}

interface RecentTradesWidgetProps {
  trades: Trade[]
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(dateString))
}

export function RecentTradesWidget({ trades }: RecentTradesWidgetProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader title="Recent Trades" subtitle="Ground Jarvis in your latest executions" />
      <div className="rounded-xl border bg-card shadow-sm flex-1">
        {trades.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">No trades logged yet today.</div>
        ) : (
          <ul className="divide-y divide-border">
            {trades.map((trade) => (
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
  )
}
