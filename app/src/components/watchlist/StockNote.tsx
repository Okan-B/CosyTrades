"use client"

import * as React from "react"
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { X, GripHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { motion, useDragControls } from "framer-motion"

interface StockNoteProps {
    id: string
    theme: "light" | "dark"
    initialX: number
    initialY: number
    zIndex: number
    title: string
    dragConstraints: React.RefObject<Element>
    onDelete: (id: string) => void
    onPositionChange: (id: string, x: number, y: number) => void
    onTitleChange: (id: string, title: string) => void
    onFocus: (id: string) => void
}

const DEFAULT_NOTE_WIDTH = 360
const DEFAULT_NOTE_HEIGHT = 280
const MIN_NOTE_WIDTH = 180
const MIN_NOTE_HEIGHT = 150
const HEADER_HEIGHT = 40

export function StockNote({
    id,
    theme,
    initialX,
    initialY,
    zIndex,
    title,
    dragConstraints,
    onDelete,
    onPositionChange,
    onTitleChange,
    onFocus
}: StockNoteProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [dimensions, setDimensions] = React.useState({
        width: DEFAULT_NOTE_WIDTH,
        height: DEFAULT_NOTE_HEIGHT,
    })
    const [position, setPosition] = React.useState({ x: initialX, y: initialY })
    const dragControls = useDragControls()
    const resizeListeners = React.useRef<{
        move?: (event: PointerEvent) => void
        up?: () => void
    }>({})

    const editor = useCreateBlockNote({
        initialContent: [
            {
                type: "paragraph",
                content: "",
            },
        ],
        trailingBlock: false,
    })

    React.useEffect(() => {
        return () => {
            if (resizeListeners.current.move) {
                window.removeEventListener("pointermove", resizeListeners.current.move)
            }
            if (resizeListeners.current.up) {
                window.removeEventListener("pointerup", resizeListeners.current.up)
            }
        }
    }, [])

    const handleResizeStart = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        onFocus(id)

        const startX = event.clientX
        const startY = event.clientY
        const startWidth = dimensions.width
        const startHeight = dimensions.height

        const handleMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            let newWidth = Math.max(MIN_NOTE_WIDTH, startWidth + deltaX)
            let newHeight = Math.max(MIN_NOTE_HEIGHT, startHeight + deltaY)

            // Get canvas boundaries if available
            if (dragConstraints.current) {
                const canvasBounds = dragConstraints.current.getBoundingClientRect()

                // Check if resize would extend beyond right boundary
                const noteRightEdge = position.x + newWidth
                if (noteRightEdge > canvasBounds.width) {
                    newWidth = canvasBounds.width - position.x
                }

                // Check if resize would extend beyond bottom boundary
                const noteBottomEdge = position.y + newHeight
                if (noteBottomEdge > canvasBounds.height) {
                    newHeight = canvasBounds.height - position.y
                }
            }

            setDimensions({
                width: newWidth,
                height: newHeight,
            })
        }

        const handleUp = () => {
            if (resizeListeners.current.move) {
                window.removeEventListener("pointermove", resizeListeners.current.move)
            }
            if (resizeListeners.current.up) {
                window.removeEventListener("pointerup", resizeListeners.current.up)
            }
            resizeListeners.current = {}
        }

        resizeListeners.current = {
            move: handleMove,
            up: handleUp,
        }

        window.addEventListener("pointermove", handleMove)
        window.addEventListener("pointerup", handleUp, { once: false })
    }, [dimensions, id, onFocus, position, dragConstraints])

    const bodyHeight = Math.max(MIN_NOTE_HEIGHT - HEADER_HEIGHT, dimensions.height - HEADER_HEIGHT)

    return (
        <motion.div
            drag
            dragListener={false} // Disable default drag listener
            dragControls={dragControls} // Use manual controls
            dragMomentum={false}
            dragConstraints={dragConstraints}
            initial={{ x: initialX, y: initialY }}
            onDragEnd={(e, info) => {
                setPosition({ x: info.point.x, y: info.point.y })
                onPositionChange(id, info.point.x, info.point.y)
            }}
            // Use onPointerDown (bubbling) instead of capture to allow child elements
            // (like color picker buttons) to handle their events first
            onPointerDown={() => onFocus(id)}
            style={{
                zIndex,
                position: "absolute",
                width: dimensions.width,
                height: isCollapsed ? undefined : dimensions.height,
            }}
            className="relative shadow-lg rounded-xl bg-card border border-border/50 flex flex-col"
        >
            {/* Drag Handle Header */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="h-10 bg-muted/50 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-border/50 rounded-t-xl touch-none"
            >
                <div className="flex items-center gap-2 text-muted-foreground flex-1">
                    <GripHorizontal className="w-4 h-4 flex-shrink-0" />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(id, e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-medium w-full text-foreground placeholder:text-muted-foreground/50"
                        placeholder="Note Title"
                        onPointerDown={(e) => e.stopPropagation()} // Allow text selection without dragging
                    />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-background rounded-md transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="p-1 hover:bg-destructive/10 text-hover:text-destructive rounded-md transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Note Body */}
            {!isCollapsed && (
                <div
                    className="flex-1 overflow-auto bg-card p-2 rounded-b-xl cursor-text"
                    style={{
                        height: bodyHeight,
                        minHeight: MIN_NOTE_HEIGHT - HEADER_HEIGHT
                    }}
                >
                    <BlockNoteView
                        editor={editor}
                        theme={theme}
                        className="h-full"
                    />
                </div>
            )}

            {/* Resize Handle */}
            <div
                onPointerDown={handleResizeStart}
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize touch-none group"
                aria-label="Resize note"
            >
                <div className="absolute bottom-1 right-1 flex flex-col gap-[3px] items-end pointer-events-none">
                    <div className="flex gap-[3px]">
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                    </div>
                    <div className="flex gap-[3px]">
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                    </div>
                    <div className="flex gap-[3px]">
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                        <div className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground/70 transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
