"use client"

import { Newspaper } from "lucide-react"

const MOCK_NEWS = [
    { id: 1, title: "Fed holds rates steady, signals cuts in 2024", time: "2h ago", sentiment: "neutral" },
    { id: 2, title: "Tech sector rallies on AI breakthrough", time: "4h ago", sentiment: "positive" },
    { id: 3, title: "Oil prices dip as supply concerns ease", time: "5h ago", sentiment: "negative" },
    { id: 4, title: "Retail sales beat expectations", time: "6h ago", sentiment: "positive" },
]

export function NewsWidget() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b bg-sidebar-accent/10">
                <Newspaper className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Market News</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {MOCK_NEWS.map(item => (
                    <div key={item.id} className="p-2 rounded-md hover:bg-sidebar-accent/30 transition-colors cursor-pointer group">
                        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                            <span>{item.time}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                item.sentiment === 'positive' ? 'bg-green-500' : 
                                item.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                        </div>
                        <div className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                            {item.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
