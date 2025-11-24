"use client"

import * as React from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface CanvasProps {
  widgets: Record<string, React.ReactNode>
  defaultLayout?: any
  onLayoutChange?: (layout: any) => void
}

// Default layout mimicking the previous grid
const DEFAULT_LAYOUT = {
  lg: [
    { i: "stats_positions", x: 0, y: 0, w: 3, h: 4 },
    { i: "stats_trades", x: 3, y: 0, w: 3, h: 4 },
    { i: "stats_streak", x: 6, y: 0, w: 3, h: 4 },
    { i: "stats_rules", x: 9, y: 0, w: 3, h: 4 },
    { i: "recent_trades", x: 0, y: 4, w: 8, h: 10 }, // Increased height
    { i: "jarvis", x: 8, y: 4, w: 4, h: 18 }, // Increased height to match full column
    { i: "journal", x: 0, y: 14, w: 8, h: 8 },
    { i: "rhythm", x: 8, y: 22, w: 4, h: 8 },
  ],
  md: [
    { i: "stats_positions", x: 0, y: 0, w: 5, h: 4 },
    { i: "stats_trades", x: 5, y: 0, w: 5, h: 4 },
    { i: "stats_streak", x: 0, y: 4, w: 5, h: 4 },
    { i: "stats_rules", x: 5, y: 4, w: 5, h: 4 },
    { i: "recent_trades", x: 0, y: 8, w: 10, h: 10 },
    { i: "jarvis", x: 0, y: 18, w: 10, h: 10 },
    { i: "journal", x: 0, y: 28, w: 10, h: 8 },
    { i: "rhythm", x: 0, y: 36, w: 10, h: 6 },
  ]
}

export function Canvas({ widgets, defaultLayout = DEFAULT_LAYOUT, onLayoutChange }: CanvasProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={defaultLayout}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      draggableHandle=".drag-handle"
      isDraggable
      isResizable
      onLayoutChange={(layout, layouts) => onLayoutChange?.(layouts)}
    >
      {Object.entries(widgets).map(([key, widget]) => (
        <div key={key} className="relative group">
          <div className="drag-handle absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-muted-foreground/20 cursor-move hover:bg-muted-foreground/40 transition-colors z-20 opacity-0 group-hover:opacity-100" />
          <div className="h-full w-full overflow-hidden">
            {widget}
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  )
}
