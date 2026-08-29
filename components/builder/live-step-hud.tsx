"use client"

import React from "react"
import { Play, Pause, SkipForward, SkipBack, Sparkles, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LiveStepHudProps {
  currentStepIndex: number
  totalSteps: number
  stepLabel: string
  stepDescription?: string
  isPlaying: boolean
  onTogglePlay: () => void
  onNextStep: () => void
  onPrevStep: () => void
  actionCount: number
}

export function LiveStepHud({
  currentStepIndex,
  totalSteps,
  stepLabel,
  stepDescription,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  actionCount,
}: LiveStepHudProps) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-border/90 bg-card/90 px-3.5 py-1.5 shadow-2xl backdrop-blur-md select-none max-w-[90vw] overflow-hidden">
      {/* ── Playback Navigation ────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-r border-border/80 pr-2.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevStep}
          disabled={currentStepIndex <= 0}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
          title="Paso anterior"
        >
          <SkipBack className="size-3.5" />
        </Button>

        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="sm"
          onClick={onTogglePlay}
          className="h-7 px-2.5 text-xs font-bold gap-1 cursor-pointer"
          title={isPlaying ? "Pausar reproducción en vivo" : "Reproducir pasos en vivo"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
          <span>{isPlaying ? "Pausar" : "Play"}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNextStep}
          disabled={currentStepIndex >= totalSteps - 1}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
          title="Siguiente paso"
        >
          <SkipForward className="size-3.5" />
        </Button>
      </div>

      {/* ── Live Step Info ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 truncate">
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono shrink-0">
          Paso {currentStepIndex + 1}/{totalSteps}
        </Badge>
        <span className="text-xs font-bold text-foreground truncate max-w-[200px] md:max-w-[340px]">
          {stepLabel || "Paso sin título"}
        </span>
      </div>

      {/* ── Active Actions Badge ───────────────────────────────────── */}
      {actionCount > 0 && (
        <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-primary border-primary/30 bg-primary/10 shrink-0">
          <Sparkles className="size-3" />
          <span>{actionCount} {actionCount === 1 ? "acción" : "acciones"}</span>
        </Badge>
      )}
    </div>
  )
}
