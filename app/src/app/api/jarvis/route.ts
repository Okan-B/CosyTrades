import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json()
        const apiKey = process.env.OPENAI_API_KEY
        const model = process.env.JARVIS_MODEL || "gpt-4o"

        if (!apiKey) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY is not set" },
                { status: 500 }
            )
        }

        const systemPrompt = `You are Jarvis, a wise and calm trading coach for a discretionary swing trader.
Your goal is to help the trader maintain discipline, follow their process, and reflect on their decisions.
You prioritize "Calm over Hype" and "Process over Outcome".

Here is the current context of the trader's workspace:
Current Date: ${context.currentDate}
Active Canvas: ${JSON.stringify(context.activeCanvas)}
Recent Trades: ${JSON.stringify(context.recentTrades)}
Recent Journal Entries: ${JSON.stringify(context.journalEntries)}

Guidelines:
1. Be concise but warm.
2. If the trader is showing signs of FOMO or emotional trading, gently remind them of their rules.
3. Use the data provided to give specific feedback (e.g., "I noticed your last trade on AAPL was a SELL...").
4. Do not give financial advice or predict the market. Focus on psychology and process.
5. If the user asks about their canvas, refer to the "Active Canvas" data.
`

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                max_tokens: 1000
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error("OpenAI API Error:", error)
            return NextResponse.json(
                { error: "Failed to communicate with AI provider" },
                { status: response.status }
            )
        }

        const data = await response.json()
        // OpenAI response format is different from Anthropic
        // We need to return it in a way the frontend expects or update frontend
        // Frontend expects: response.content[0].text (Anthropic style)
        // OpenAI returns: choices[0].message.content

        // Let's adapt the response to match what our frontend expects
        // or better yet, let's return a standard format and update frontend if needed.
        // But to minimize frontend changes, I'll map it here.

        return NextResponse.json({
            content: [
                { text: data.choices[0].message.content }
            ]
        })

    } catch (error) {
        console.error("Jarvis API Route Error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
