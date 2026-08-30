"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Clock, Sparkles, GripVertical, Sliders, HelpCircle, GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UniversalStep } from "@/types/universal-animation"

interface TimelineBottomBarProps {
  steps: UniversalStep[]
  selectedStepIndex: number
  onSelectStep: (index: number) => void
  onAddStep: () => void
  onDeleteStep: (index: number) => void
  onUpdateStepDuration: (index: number, newDuration: number) => void
  onReorderSteps: (fromIndex: number, toIndex: number) => void
}

const PIXELS_PER_SECOND = 90 // 1 second = 90px

function StepDurationInput({
  duration,
  onUpdateDuration,
}: {
  duration: number
  onUpdateDuration: (newDuration: number) => void
}) {
  const [text, setText] = useState(String(duration))

  // Synchronize when duration changes externally (e.g. via drag resize)
  useEffect(() => {
    setText(String(duration))
  }, [duration])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setText(raw)

    // Allow typing decimals with either dot or comma
    const normalized = raw.replace(",", ".")
    const parsed = parseFloat(normalized)
    if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 120) {
      onUpdateDuration(+parsed.toFixed(1))
    }
  }

  const handleBlur = () => {
    const normalized = text.replace(",", ".")
    const parsed = parseFloat(normalized)
    if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 120) {
      const formatted = +parsed.toFixed(1)
      setText(String(formatted))
      onUpdateDuration(formatted)
    } else {
      setText(String(duration))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      handleBlur()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex items-center rounded bg-background/95 px-1 py-0.5 border border-border text-foreground shadow-xs hover:border-primary/60 transition-colors"
      title="Haz clic para escribir la duración (acepta punto o coma decimal)"
    >
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-8 bg-transparent font-mono text-[11px] font-bold text-foreground text-center focus:outline-none focus:text-primary p-0"
      />
      <span className="font-mono text-[9px] font-semibold text-muted-foreground select-none pr-0.5">
        s
      </span>
    </div>
  )
}

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
    e.preventDefault()
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
  const handleDragStart = (index: number, e: React.DragEvent) => {
    if (resizing !== null) {
      e.preventDefault()
      return
    }
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
            <span>Línea de tiempo</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="font-mono text-muted-foreground">
            {steps.length} {steps.length === 1 ? "paso" : "pasos"}
          </span>
          <span className="rounded bg-accent/50 px-2 py-0.5 font-mono font-semibold text-primary">
            Duración total: {totalDuration.toFixed(1)}s
          </span>
        </div>

        <Button
          size="sm"
          onClick={onAddStep}
          className="h-6 gap-1 text-[11px] font-semibold px-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir paso
        </Button>
      </div>

      {/* ── Timeline Tracks (Draggable & Resizable) ────────────────── */}
      <div className="relative flex-1 overflow-x-auto overflow-y-hidden p-3">
        <div className="flex items-center gap-2 pb-1">
          {steps.map((step, idx) => {
            const duration = step.duration || 2.0
            const width = Math.max(120, duration * PIXELS_PER_SECOND)
            const isSelected = selectedStepIndex === idx
            const isDraggingThis = draggedStepIndex === idx
            const isDragTarget = dragOverIndex === idx

            return (
              <div
                key={step.id || idx}
                draggable={resizing === null}
                onDragStart={(e) => handleDragStart(idx, e)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectStep(idx)}
                style={{ width: `${width}px` }}
                className={`group relative flex h-20 shrink-0 cursor-grab active:cursor-grabbing flex-col justify-between rounded-xl border px-2 py-2 transition-all ${
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
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={(e) => handleResizeStart(idx, "left", e)}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeEnd}
                  title="Arrastra desde la izquierda para cambiar la duración"
                  className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize rounded-l-xl z-10 transition-colors hover:bg-primary/50 group-hover:bg-primary/25"
                />

                {/* Step Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <GripVertical className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 shrink-0" />
                    <span
                      className={`font-mono text-[11px] font-bold truncate ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      Paso {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 z-20 shrink-0">
                    {/* Dedicated Decimal-Safe Duration Input */}
                    <StepDurationInput
                      duration={duration}
                      onUpdateDuration={(newDuration) => onUpdateStepDuration(idx, newDuration)}
                    />

                    {steps.length > 1 && (
                      <button
                        type="button"
                        title="Eliminar paso"
                        aria-label="Eliminar paso"
                        className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 shrink-0 cursor-pointer ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteStep(idx)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Step Label Preview */}
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {step.label || `Paso ${idx + 1}`}
                </p>

                {/* Actions & Interaction Count */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="truncate">
                      {step.actions.length} {step.actions.length === 1 ? "acción" : "acciones"}
                    </span>
                  </div>
                  {step.interaction && (
                    <div className="flex items-center gap-0.5 rounded bg-primary/15 px-1 py-0.5 font-mono text-[9px] font-bold text-primary">
                      {step.interaction.type === "variable_slider" && <Sliders className="size-2.5" />}
                      {step.interaction.type === "quiz" && <HelpCircle className="size-2.5 text-amber-500" />}
                      {step.interaction.type === "branch_choice" && <GitFork className="size-2.5" />}
                      <span className="capitalize">{step.interaction.type.split("_")[0]}</span>
                    </div>
                  )}
                </div>

                {/* Right Resize Handle */}
                <div
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={(e) => handleResizeStart(idx, "right", e)}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeEnd}
                  title="Arrastra desde la derecha para cambiar la duración"
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize rounded-r-xl z-10 transition-colors hover:bg-primary/50 group-hover:bg-primary/25"
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
