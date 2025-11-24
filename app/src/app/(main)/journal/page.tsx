"use client"

import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { JournalEditor } from "@/components/journal/JournalEditor"
import { createClient } from "@/lib/supabase/client"
import { PartialBlock } from "@blocknote/core"
import { Loader2, Check } from "lucide-react"

export default function JournalPage() {
    const [content, setContent] = useState<PartialBlock[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [entryId, setEntryId] = useState<string | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        const loadEntry = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                setIsLoading(false)
                return
            }

            const { data } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .maybeSingle()

            if (data) {
                setEntryId(data.id)
                try {
                    setContent(JSON.parse(data.content) as PartialBlock[])
                } catch (e) {
                    console.error("Failed to parse journal content", e)
                    setContent(undefined) 
                }
            } else {
                setContent(undefined)
            }
            setIsLoading(false)
        }

        loadEntry()
    }, [today, supabase])

    const saveToDb = useCallback(async (contentToSave: PartialBlock[]) => {
        setIsSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            setIsSaving(false)
            return
        }

        const contentString = JSON.stringify(contentToSave)

        if (entryId) {
            const { error } = await supabase
                .from('journal_entries')
                .update({ content: contentString })
                .eq('id', entryId)
            
            if (error) {
                console.error("Auto-save failed", JSON.stringify(error, null, 2))
            } else {
                setLastSaved(new Date())
            }
        } else {
            const { data, error } = await supabase
                .from('journal_entries')
                .insert({
                    user_id: user.id,
                    date: today,
                    content: contentString,
                    mood_score: 5
                })
                .select()
                .single()
            
            if (data) {
                setEntryId(data.id)
                setLastSaved(new Date())
            }
            if (error) {
                console.error("Auto-save failed", JSON.stringify(error, null, 2))
            }
        }
        setIsSaving(false)
    }, [entryId, supabase, today])

    const handleEditorChange = useCallback((newContent: PartialBlock[]) => {
        setContent(newContent)
        
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Set new timeout (debounce)
        saveTimeoutRef.current = setTimeout(() => {
            saveToDb(newContent)
        }, 2000) // Auto-save after 2 seconds of inactivity
    }, [saveToDb])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    if (isLoading) {
        return <div className="flex h-full items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
    }

    return (
        <div className="p-8 space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
                    <p className="text-muted-foreground">Reflection for {today}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </>
                    ) : null}
                </div>
            </div>
            
            <div className="flex-1">
                <JournalEditor 
                    initialContent={content} 
                    onSave={handleEditorChange} 
                />
            </div>
        </div>
    )
}
