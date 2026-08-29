"use client"

import React from "react"
import {
  Play,
  FastForward,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PlaybackMode } from "@/lib/animations/studio-playback-controller"

interface StudioPlaybackBarProps {
  currentStepIndex: number
  totalSteps: number
  stepLabel: string
  mode: PlaybackMode
  speed: number
  progress: number // 0 to 1
  actionCount: number
  onPlayStep: () => void
  onPlayAll: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onNextStep: () => void
  onPrevStep: () => void
  onSpeedChange: (speed: number) => void
}

export function StudioPlaybackBar({
  currentStepIndex,
  totalSteps,
  stepLabel,
  mode,
  speed,
  progress,
  actionCount,
  onPlayStep,
  onPlayAll,
  onPause,
  onResume,
  onStop,
  onNextStep,
  onPrevStep,
  onSpeedChange,
}: StudioPlaybackBarProps) {
  const isPlaying = mode === "playing_step" || mode === "playing_all"
  const isPaused = mode === "paused"

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 select-none max-w-[95vw]">
      {/* ── Main Control Capsule ─────────────────────────────────── */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3 py-1.5 shadow-2xl backdrop-blur-md">
        {/* Step Navigation */}
        <div className="flex items-center gap-1 border-r border-border/80 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevStep}
            disabled={currentStepIndex <= 0 || isPlaying}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
            title="Paso anterior"
          >
            <SkipBack className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNextStep}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
            title="Siguiente paso"
          >
            <SkipForward className="size-3.5" />
          </Button>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onPause}
              className="h-7 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-md"
              title="Pausar reproducción"
            >
              <Pause className="size-3.5" />
              <span>Pausar</span>
            </Button>
          ) : isPaused ? (
            <Button
              variant="default"
              size="sm"
              onClick={onResume}
              className="h-7 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
              title="Reanudar reproducción"
            >
              <Play className="size-3.5 fill-current" />
              <span>Reanudar</span>
            </Button>
          ) : (
            <>
              {/* Play Current Step */}
              <Button
                variant="default"
                size="sm"
                onClick={onPlayStep}
                className="h-7 px-2.5 text-xs font-bold gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                title="Reproducir únicamente el paso actual seleccionado"
              >
                <Play className="size-3.5 fill-current" />
                <span>Paso Actual</span>
              </Button>

              {/* Play All Steps */}
              <Button
                variant="outline"
                size="sm"
                onClick={onPlayAll}
                className="h-7 px-2.5 text-xs font-bold gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                title="Reproducir la secuencia completa de pasos de principio a fin"
              >
                <FastForward className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Toda la Animación</span>
                <span className="sm:hidden">Toda</span>
              </Button>
            </>
          )}

          {(isPlaying || isPaused) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Detener y volver al modo edición"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 border-l border-border/80 pl-2">
          <Gauge className="size-3.5 text-muted-foreground hidden sm:inline-block" />
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                  speed === s ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Label Badge */}
        <div className="hidden md:flex items-center gap-2 border-l border-border/80 pl-2">
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono shrink-0">
            {currentStepIndex + 1}/{totalSteps}
          </Badge>
          <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
            {stepLabel}
          </span>
        </div>

        {actionCount > 0 && (
          <Badge
            variant="outline"
            className="hidden lg:inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-primary border-primary/30 bg-primary/10 shrink-0"
          >
            <Sparkles className="size-3" />
            <span>{actionCount} {actionCount === 1 ? "acción" : "acciones"}</span>
          </Badge>
        )}
      </div>

      {/* ── Active Progress Bar Line ──────────────────────────────── */}
      {isPlaying && (
        <div className="h-1 w-full rounded-full bg-muted/80 overflow-hidden shadow-xs">
          <div
            className="h-full bg-primary transition-all duration-75"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
