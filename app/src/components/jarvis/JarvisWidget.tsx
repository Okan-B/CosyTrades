"use client"

import * as React from "react"
import { Brain, Sparkles, Send, Bot, User, Wand2, RefreshCw, Settings2, X } from "lucide-react"
import { SectionHeader } from "../dashboard/SectionHeader"
import { JarvisService, JarvisMessage, JarvisContext } from "@/services/JarvisService"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface JarvisWidgetProps {
  prompts?: string[]
  mode: "live" | "demo"
}

const HISTORY_KEY = "jarvis_conversation_v1"
const PROMPT_KEY = "jarvis_system_prompt"

export function JarvisWidget({ prompts = [], mode }: JarvisWidgetProps) {
  const [messages, setMessages] = React.useState<JarvisMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [context, setContext] = React.useState<JarvisContext | null>(null)
  const [systemPrompt, setSystemPrompt] = React.useState("")
  const [promptSavedAt, setPromptSavedAt] = React.useState<Date | null>(null)
  const [sessionStartedAt, setSessionStartedAt] = React.useState<Date | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bootstrapped = React.useRef(false)
  const promptSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const loadContext = async () => {
      try {
        const ctx = await JarvisService.getContext()
        setContext(ctx)
      } catch (error) {
        console.error("Failed to load Jarvis context", error)
      }
    }
    loadContext()
  }, [])

  React.useEffect(() => {
    if (bootstrapped.current || typeof window === "undefined") return
    bootstrapped.current = true

    const storedPrompt = localStorage.getItem(PROMPT_KEY)
    if (storedPrompt !== null) {
      setSystemPrompt(storedPrompt)
      setPromptSavedAt(new Date())
    }

    const storedHistory = localStorage.getItem(HISTORY_KEY)
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          setSessionStartedAt(new Date())
          return
        }
      } catch (error) {
        console.warn("Failed to parse saved Jarvis history", error)
      }
    }

    const seeded = seedMessages(prompts)
    setMessages(seeded)
    setSessionStartedAt(new Date())
  }, [prompts])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (messages.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
    } else {
      localStorage.removeItem(HISTORY_KEY)
    }
  }, [messages])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (promptSaveTimer.current) clearTimeout(promptSaveTimer.current)
    promptSaveTimer.current = setTimeout(() => {
      localStorage.setItem(PROMPT_KEY, systemPrompt)
      setPromptSavedAt(new Date())
    }, 500)
    return () => {
      if (promptSaveTimer.current) clearTimeout(promptSaveTimer.current)
    }
  }, [systemPrompt])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: JarvisMessage = { role: "user", content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput("")
    setIsLoading(true)
    setSessionStartedAt(prev => prev ?? new Date())

    try {
      const currentContext = await JarvisService.getContext()
      setContext(currentContext)

      const response = await JarvisService.sendMessage(
        nextMessages.slice(-30),
        currentContext,
        systemPrompt
      )

      const assistantMsg: JarvisMessage = {
        role: "assistant",
        content: response.content[0].text
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error("Failed to send message", error)
      toast.error("Jarvis is having trouble connecting right now.")
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again shortly." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetConversation = () => {
    const seeded = seedMessages(prompts)
    setMessages(seeded)
    setSessionStartedAt(new Date())
    setInput("")
  }

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sessionLabel = sessionStartedAt ? `Session ${formatShortTime(sessionStartedAt)}` : "Fresh session"
  const noteCount = countNoteSnippets(context)

  return (
    <div className="space-y-3 h-full flex flex-col">
      <SectionHeader title="Jarvis" subtitle="AI Trading Coach" />
      <div className="relative rounded-2xl border bg-card/90 shadow-lg flex flex-col flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 pointer-events-none" aria-hidden />
        <div className="p-4 border-b relative z-10 border-border/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Jarvis is warmed up</p>
                <p className="text-xs text-muted-foreground">
                  {mode === "demo" ? "Demo context" : "Live context"} · {noteCount} ticker notes in view
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border hidden sm:inline-block">{sessionLabel}</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Wand2 className="w-4 h-4 text-primary" />
                      Personalise Jarvis
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customize how Jarvis responds to you. Changes autosave.
                    </p>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="E.g. Keep answers concise, call me by my nickname, prefer risk-focused language..."
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                    <div className="text-[10px] text-right text-muted-foreground">
                      {promptSavedAt ? `Saved ${formatShortTime(promptSavedAt)}` : "Autosaves"}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="sm" className="gap-1" onClick={handleResetConversation}>
                <RefreshCw className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">Reset</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}-${msg.content.slice(0, 10)}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "assistant" ? "bg-primary/15 text-primary" : "bg-foreground text-background"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${msg.role === "assistant"
                  ? "bg-muted/60 border-border text-foreground"
                  : "bg-primary text-primary-foreground border-primary/50"
                  }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm bg-muted/60 border border-border flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background/80 p-3">
            <form onSubmit={handleSendMessage} className="space-y-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a ticker, your plan, or something Jarvis already knows about your notes..."
                rows={2}
                className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Jarvis keeps this session so you can pick up where you left off.
                </div>
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function seedMessages(prompts: string[]): JarvisMessage[] {
  if (prompts.length > 0) {
    return [
      {
        role: "assistant",
        content: `Welcome back. Here are a few things worth keeping in view:\n\n${prompts.map(p => `- ${p}`).join("\n")}`
      }
    ]
  }
  return [
    {
      role: "assistant",
      content: "I'm ready to think through your trades and notes. What should we tackle first?"
    }
  ]
}

function formatShortTime(date?: Date | null) {
  if (!date) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function countNoteSnippets(context: JarvisContext | null) {
  if (!context?.stockNotes) return 0
  return context.stockNotes.reduce((acc, item) => acc + (item.notes?.length || 0), 0)
}


