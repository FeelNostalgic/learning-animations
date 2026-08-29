"use client"

import React, { useRef, useEffect, useState, useId } from "react"
import gsap from "gsap"
import { useTheme } from "next-themes"
import {
  Play,
  Pause,
  RotateCcw,
  Code2,
  Check,
  Copy,
  Sparkles,
  Info,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UniversalActionType } from "@/types/universal-animation"

export interface ActionDefinition {
  type: UniversalActionType
  title: string
  subtitle: string
  description: string
  whenToUse: string
  jsonExample: Record<string, any>
  setupScene: (
    svg: SVGSVGElement,
    uid: string,
    theme: "light" | "dark"
  ) => { timeline: gsap.core.Timeline }
}

interface ActionLoopCardProps {
  action: ActionDefinition
}

export function ActionLoopCard({ action }: ActionLoopCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const { resolvedTheme } = useTheme()
  const rawId = useId()
  const uid = rawId.replace(/:/g, "")

  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<number>(1)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  // Initialize and run infinite GSAP loop
  useEffect(() => {
    if (!svgRef.current) return

    const currentTheme = (resolvedTheme === "light" ? "light" : "dark") as "light" | "dark"
    const ctx = gsap.context(() => {
      if (!svgRef.current) return
      const { timeline } = action.setupScene(svgRef.current, uid, currentTheme)
      timeline.timeScale(speed)
      if (!isPlaying) timeline.pause()
      timelineRef.current = timeline
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [action, uid, resolvedTheme])

  const togglePlay = () => {
    if (!timelineRef.current) return
    if (isPlaying) {
      timelineRef.current.pause()
      setIsPlaying(false)
    } else {
      timelineRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleRestart = () => {
    if (!timelineRef.current) return
    timelineRef.current.restart()
    setIsPlaying(true)
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (timelineRef.current) {
      timelineRef.current.timeScale(newSpeed)
    }
  }

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(action.jsonExample, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
    >
      {/* ── Top Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{action.title}</h3>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              type: &quot;{action.type}&quot;
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className={`h-7 px-2 text-xs cursor-pointer ${
              showCode ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
            title="Ver JSON de la acción"
          >
            <Code2 className="size-3.5 mr-1" />
            <span>{showCode ? "Animación" : "JSON"}</span>
          </Button>
        </div>
      </div>

      {/* ── Visual Canvas / Code Screen ──────────────────────────── */}
      <div className="relative h-56 w-full bg-slate-950/20 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center border-b border-border/40">
        {showCode ? (
          <div className="relative h-full w-full overflow-auto p-3 font-mono text-[11px] leading-relaxed bg-muted/40">
            <button
              onClick={copyJson}
              className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md border border-border bg-card/80 px-2 py-1 text-[10px] text-foreground hover:bg-card cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
            <pre className="text-primary-foreground/90 dark:text-primary-foreground/80">
              {JSON.stringify(action.jsonExample, null, 2)}
            </pre>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 400 220"
            className="h-full w-full select-none overflow-visible"
            role="img"
            aria-label={`Demostración interactiva de ${action.title}`}
          />
        )}

        {/* Live Loop Badge */}
        {!showCode && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[9px] font-bold text-muted-foreground border border-border backdrop-blur-md shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bucle Infinito</span>
          </div>
        )}

        {/* Playback Controls Overlay (bottom of canvas) */}
        {!showCode && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-xl border border-border/80 bg-background/85 px-1.5 py-1 backdrop-blur-md shadow-md">
            <button
              onClick={togglePlay}
              className="p-1 rounded-lg text-foreground hover:bg-accent cursor-pointer"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <button
              onClick={handleRestart}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              title="Reiniciar bucle"
            >
              <RotateCcw className="size-3" />
            </button>
            <div className="h-3 w-px bg-border mx-0.5" />
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-all ${
                  speed === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Explanation & Pedagogical Guide ──────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs text-foreground leading-relaxed font-medium">
            {action.description}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
            <Info className="size-3 shrink-0" />
            <span>¿Cuándo usarla en diagramas?</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            {action.whenToUse}
          </p>
        </div>
      </div>
    </div>
  )
}
