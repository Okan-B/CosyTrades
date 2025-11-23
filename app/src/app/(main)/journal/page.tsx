"use client"

import { useEffect, useMemo, useState } from "react"
import { JournalEditor } from "@/components/journal/JournalEditor"
import { createClient } from "@/lib/supabase/client"
import { PartialBlock } from "@blocknote/core"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function JournalPage() {
    const [content, setContent] = useState<PartialBlock[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [entryId, setEntryId] = useState<string | null>(null)

    const supabase = useMemo(() => createClient(), [])
    // Simple YYYY-MM-DD date
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        const loadEntry = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            // If no user, we can't load properly. 
            // For MVP dev, we might just show empty editor but saving will fail.
            if (!user) {
                setIsLoading(false)
                return
            }

            const { data } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .maybeSingle() // Use maybeSingle instead of single to avoid 406 on 0 rows

            if (data) {
                setEntryId(data.id)
                try {
                    // Supabase Text column might contain the JSON string
                    setContent(JSON.parse(data.content) as PartialBlock[])
                } catch (e) {
                    console.error("Failed to parse journal content", e)
                    setContent(undefined) 
                }
            } else {
                setContent(undefined) // Let editor handle default empty state
            }
            setIsLoading(false)
        }

        loadEntry()
    }, [today, supabase])

    // Local state update
    const handleEditorChange = (newContent: PartialBlock[]) => {
        setContent(newContent)
    }

    const saveToDb = async () => {
        setIsSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            alert("Please login to save.")
            setIsSaving(false)
            return
        }

        const contentString = JSON.stringify(content)

        if (entryId) {
            const { error } = await supabase
                .from('journal_entries')
                .update({ content: contentString })
                .eq('id', entryId)
            
            if (error) {
                console.error("Save failed", JSON.stringify(error, null, 2))
                alert("Failed to save entry")
            }
        } else {
            const { data, error } = await supabase
                .from('journal_entries')
                .insert({
                    user_id: user.id,
                    date: today,
                    content: contentString,
                    mood_score: 5 // default
                })
                .select()
                .single()
            
            if (data) setEntryId(data.id)
            if (error) {
                console.error("Save failed", JSON.stringify(error, null, 2))
                alert("Failed to save entry")
            }
        }
        setIsSaving(false)
    }

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
                <Button onClick={saveToDb} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
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
