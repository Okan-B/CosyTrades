import { Brain, Sparkles } from "lucide-react"
import { SectionHeader } from "./SectionHeader"

interface JarvisWidgetProps {
  prompts: string[]
  mode: "live" | "demo"
}

export function JarvisWidget({ prompts, mode }: JarvisWidgetProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader title="Jarvis" subtitle="Soft nudges to keep you grounded" />
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="w-4 h-4" />
          <span>{mode === "demo" ? "Demo context" : "Live context"}</span>
        </div>
        <ul className="space-y-3">
          {prompts.map((prompt, idx) => (
            <li key={idx} className="flex gap-3">
              <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm text-foreground">{prompt}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
