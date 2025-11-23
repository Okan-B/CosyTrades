"use client"

import * as React from "react"
import { Brain, Sparkles, Send, Bot, User } from "lucide-react"
import { SectionHeader } from "../dashboard/SectionHeader"
import { JarvisService, JarvisMessage, JarvisContext } from "@/services/JarvisService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface JarvisWidgetProps {
  prompts?: string[]
  mode: "live" | "demo"
}

export function JarvisWidget({ prompts = [], mode }: JarvisWidgetProps) {
  const [messages, setMessages] = React.useState<JarvisMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [context, setContext] = React.useState<JarvisContext | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Load context on mount
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

  // Stable prompts dependency
  const promptsJson = JSON.stringify(prompts)

  React.useEffect(() => {
    // Only set initial messages if empty
    if (messages.length > 0) return

    // Add initial greeting based on prompts
    if (prompts.length > 0) {
      setMessages([
        {
          role: "assistant",
          content: `Welcome to your trading room. Here are a few things I noticed:\n\n${prompts.map(p => `• ${p}`).join("\n")}`
        }
      ])
    } else {
        setMessages([
            {
              role: "assistant",
              content: "I'm ready to help you analyze your process. What's on your mind?"
            }
        ])
    }
  }, [promptsJson])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: JarvisMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // Refresh context before sending to get latest state
      const currentContext = await JarvisService.getContext()
      setContext(currentContext)

      const response = await JarvisService.sendMessage(
        [...messages, userMsg],
        currentContext
      )

      const assistantMsg: JarvisMessage = {
        role: "assistant",
        content: response.content[0].text // Assuming Anthropic response format
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error("Failed to send message", error)
      toast.error("Jarvis is having trouble connecting right now.")
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to my brain right now. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader title="Jarvis" subtitle="AI Trading Coach" />
      <div className="rounded-xl border bg-card shadow-sm flex flex-col flex-1 overflow-hidden h-[400px]">
        
        {/* Header / Context Indicator */}
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" />
            <span>{mode === "demo" ? "Demo Mode" : "Connected"}</span>
          </div>
          {context?.activeCanvas && (
             <span className="truncate max-w-[150px]">Viewing: {context.activeCanvas.name}</span>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="bg-muted rounded-lg p-3 text-sm">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                   <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                   <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your trades or process..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
