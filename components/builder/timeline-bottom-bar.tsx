"use client"

import { useState } from "react"
import { Plus, Trash2, Clock, Sparkles, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DynamicStep } from "@/types/dynamic-animation"

interface TimelineBottomBarProps {
  steps: DynamicStep[]
  selectedStepIndex: number
  onSelectStep: (index: number) => void
  onAddStep: () => void
  onDeleteStep: (index: number) => void
  onUpdateStepDuration: (index: number, newDuration: number) => void
  onReorderSteps: (fromIndex: number, toIndex: number) => void
}

const PIXELS_PER_SECOND = 90 // 1 second = 90px

export function TimelineBottomBar({
  steps,
  selectedStepIndex,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onUpdateStepDuration,
  onReorderSteps,
}: TimelineBottomBarProps) {
  // Resize state
  const [resizing, setResizing] = useState<{
    index: number
    side: "left" | "right"
    startX: number
    initialDuration: number
  } | null>(null)

  // Drag & Drop reorder state
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Total duration of animation
  const totalDuration = steps.reduce((acc, step) => acc + (step.duration || 2.0), 0)

  // Handle Resize (Left or Right handle)
  const handleResizeStart = (index: number, side: "left" | "right", e: React.PointerEvent) => {
    e.stopPropagation()
    setResizing({
      index,
      side,
      startX: e.clientX,
      initialDuration: steps[index].duration || 2.0,
    })
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizing) return
    const deltaPixels = e.clientX - resizing.startX
    const deltaSeconds = deltaPixels / PIXELS_PER_SECOND

    let newDuration: number
    if (resizing.side === "right") {
      newDuration = Math.max(0.5, +(resizing.initialDuration + deltaSeconds).toFixed(1))
    } else {
      // Left handle: moving left increases duration, moving right decreases duration
      newDuration = Math.max(0.5, +(resizing.initialDuration - deltaSeconds).toFixed(1))
    }

    onUpdateStepDuration(resizing.index, newDuration)
  }

  const handleResizeEnd = () => {
    setResizing(null)
  }

  // Handle Drag & Drop for reordering
  const handleDragStart = (index: number) => {
    setDraggedStepIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedStepIndex !== null && draggedStepIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (toIndex: number) => {
    if (draggedStepIndex !== null && draggedStepIndex !== toIndex) {
      onReorderSteps(draggedStepIndex, toIndex)
    }
    setDraggedStepIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedStepIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex h-36 flex-col border-t border-border bg-card/90 backdrop-blur-md shrink-0 select-none">
      {/* ── Header Metrics ───────────────────────────────────────── */}
      <div className="flex h-9 items-center justify-between border-b border-border px-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Línea de Tiempo</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="font-mono text-muted-foreground">
            {steps.length} {steps.length === 1 ? "paso" : "pasos"}
          </span>
          <span className="rounded bg-accent/50 px-2 py-0.5 font-mono font-semibold text-primary">
            Duración Total: {totalDuration.toFixed(1)}s
          </span>
        </div>

        <Button
          size="sm"
          onClick={onAddStep}
          className="h-6 gap-1 text-[11px] font-semibold px-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir Paso
        </Button>
      </div>

      {/* ── Timeline Tracks (Draggable & Resizable) ────────────────── */}
      <div className="relative flex-1 overflow-x-auto overflow-y-hidden p-3">
        <div className="flex items-center gap-2 pb-1">
          {steps.map((step, idx) => {
            const duration = step.duration || 2.0
            const width = Math.max(80, duration * PIXELS_PER_SECOND)
            const isSelected = selectedStepIndex === idx
            const isDraggingThis = draggedStepIndex === idx
            const isDragTarget = dragOverIndex === idx

            return (
              <div
                key={step.id || idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectStep(idx)}
                style={{ width: `${width}px` }}
                className={`group relative flex h-20 shrink-0 cursor-grab active:cursor-grabbing flex-col justify-between rounded-xl border p-2.5 transition-all ${
                  isDraggingThis
                    ? "opacity-40 scale-95 border-dashed border-primary"
                    : isDragTarget
                    ? "border-primary bg-primary/20 scale-105 ring-2 ring-primary"
                    : isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
                    : "border-border bg-card/80 hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                {/* Left Resize Handle */}
                <div
                  onPointerDown={(e) => handleResizeStart(idx, "left", e)}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeEnd}
                  title="Arrastra desde la izquierda para cambiar la duración"
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l-xl transition-colors hover:bg-primary/50 group-hover:bg-primary/20"
                />

                {/* Step Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100" />
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      Paso {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="rounded bg-background/80 px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground border border-border/60">
                      {duration.toFixed(1)}s
                    </span>
                    {steps.length > 1 && (
                      <Trash2
                        className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteStep(idx)
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Step Label Preview */}
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {step.label || `Paso ${idx + 1}`}
                </p>

                {/* Actions Count */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>
                    {step.actions.length} {step.actions.length === 1 ? "acción" : "acciones"}
                  </span>
                </div>

                {/* Right Resize Handle */}
                <div
                  onPointerDown={(e) => handleResizeStart(idx, "right", e)}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeEnd}
                  title="Arrastra desde la derecha para cambiar la duración"
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-xl transition-colors hover:bg-primary/50 group-hover:bg-primary/20"
                />
              </div>
            )
          })}

          {/* Add Step Button */}
          <button
            onClick={onAddStep}
            className="flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] font-semibold mt-1">Paso</span>
          </button>
        </div>
      </div>
    </div>
  )
}
