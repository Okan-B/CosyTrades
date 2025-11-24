import { createClient } from "@/lib/supabase/client"

export interface CanvasLayout {
    lg: any[]
    md: any[]
    sm: any[]
    xs: any[]
    xxs: any[]
}

export interface Canvas {
    id: string
    user_id: string
    name: string
    layout: CanvasLayout
    is_public: boolean
    is_default?: boolean
    likes_count: number
    created_at: string
    description?: string
    tags?: string[]
    author_name?: string // For joined queries
    users?: {
        email?: string
        settings?: Record<string, any>
    }
}

export const CanvasService = {
    async getUserCanvases() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return []

        const { data, error } = await supabase
            .from("canvases")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching user canvases:", JSON.stringify(error, null, 2))
            return []
        }

        return data as Canvas[]
    },

    async getCommunityCanvases() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from("canvases")
            .select("*, users:users(email, settings)")
            .eq("is_public", true)
            .order("likes_count", { ascending: false })
            .limit(50)

        if (error) {
            console.error("Error fetching community canvases:", error)
            return []
        }

        return (data || []).map(canvas => ({
            ...canvas,
            author_name:
                (canvas as any)?.users?.settings?.display_name ||
                (canvas as any)?.users?.email?.split("@")[0] ||
                "Trader"
        })) as Canvas[]
    },

    async saveCanvas(name: string, layout: CanvasLayout, isPublic: boolean = false, description?: string, tags?: string[]) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("User not authenticated")

        const { data, error } = await supabase
            .from("canvases")
            .insert({
                user_id: user.id,
                name,
                layout,
                is_public: isPublic,
                description,
                tags,
                likes_count: 0
            })
            .select()
            .single()

        if (error) throw error
        return data as Canvas
    },

    async updateCanvas(id: string, updates: Partial<Canvas>) {
        const supabase = createClient()
        const { error } = await supabase
            .from("canvases")
            .update(updates)
            .eq("id", id)

        if (error) throw error
    },

    async unpublishCanvas(id: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from("canvases")
            .update({ is_public: false })
            .eq("id", id)

        if (error) throw error
    },

    async deleteCanvas(id: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from("canvases")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}
