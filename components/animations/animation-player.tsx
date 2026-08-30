"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsRight,
  RotateCcw,
  Repeat,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Shrink,
  Expand,
  Code,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmbedDialog } from "./embed-dialog"
import { MarkdownView } from "@/components/ui/markdown-view"
import type { AnimationStep } from "@/types/animations"
import type gsap from "gsap"
import { cn } from "@/lib/utils"
import {
  PLAYBACK_SPEED_OPTIONS,
  type PlaybackSpeedLabel,
  resolvePlaybackSpeed,
} from "@/lib/animations/playback"

// ─── Context ─────────────────────────────────────────────────────────────────

interface AnimationContextValue {
  registerTimeline: (tl: gsap.core.Timeline) => void
  currentStep: number
  isPlaying: boolean
  progress: number
  stepProgress: number
  zoom: number
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleZoomReset: () => void
  isFullscreen: boolean
  handleFullscreenToggle: () => void
}

export const AnimationContext = createContext<AnimationContextValue | null>(null)

export function useAnimationContext() {
  const ctx = useContext(AnimationContext)
  if (!ctx) throw new Error("useAnimationContext must be used inside AnimationPlayer")
  return ctx
}

// ─── Player ──────────────────────────────────────────────────────────────────

interface AnimationPlayerProps {
  steps: AnimationStep[]
  title: string
  children: React.ReactNode
  embedSlugOrId?: string
  isDynamic?: boolean
  editHref?: string
}

const ZOOM_MIN = 0.2
const ZOOM_MAX = 3.0
const ZOOM_STEP = 0.25

export function AnimationPlayer({
  steps,
  title,
  children,
  embedSlugOrId,
  isDynamic = false,
  editHref,
}: AnimationPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const stepTimesRef = useRef<number[]>([])
  const isDraggingRef = useRef(false)
  const loopRef = useRef(false)
  const speedLabelRef = useRef<PlaybackSpeedLabel>(1)
  const stepPlayTargetRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [speedLabel, setSpeedLabel] = useState<PlaybackSpeedLabel>(1)
  const [loop, setLoop] = useState(false)
  const [tlDuration, setTlDuration] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEmbedOpen, setIsEmbedOpen] = useState(false)

  const handleZoomIn = () => {
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("player-zoom-action", { detail: { action: "in" } }))
    }
  }
  const handleZoomOut = () => {
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("player-zoom-action", { detail: { action: "out" } }))
    }
  }
  const handleZoomReset = () => {
    setZoom(1)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("player-zoom-action", { detail: { action: "reset" } }))
    }
  }

  useEffect(() => {
    const handleZoomSynced = (e: CustomEvent<{ zoom: number }>) => {
      if (typeof e.detail?.zoom === "number") {
        setZoom(+e.detail.zoom.toFixed(2))
      }
    }
    window.addEventListener("player-zoom-synced", handleZoomSynced as EventListener)
    return () => {
      window.removeEventListener("player-zoom-synced", handleZoomSynced as EventListener)
    }
  }, [])

  const updateStep = useCallback((time: number, customTl?: gsap.core.Timeline) => {
    const times = stepTimesRef.current
    let step = 0
    for (let i = 0; i < times.length; i++) {
      if (time >= times[i] - 0.01) step = i
    }
    setCurrentStep(step)

    const tl = customTl || tlRef.current
    const tStart = times[step] ?? 0
    const tEnd = times[step + 1] ?? (tl ? tl.duration() : tStart + 2)
    const duration = Math.max(0.01, tEnd - tStart)
    const currentStepProgress = Math.max(0, Math.min(1, (time - tStart) / duration))
    setStepProgress(currentStepProgress)
  }, [])

  const registerTimeline = useCallback(
    (tl: gsap.core.Timeline) => {
      tlRef.current = tl

      // Extract ordered step label times
      const times = steps.map((s, idx) => {
        const labelKey = s.id || `step-${idx + 1}`
        return typeof tl.labels[labelKey] === "number"
          ? (tl.labels[labelKey] as number)
          : idx * (tl.duration() / Math.max(1, steps.length))
      })

      stepTimesRef.current = times
      setTlDuration(tl.duration())
      tl.timeScale(resolvePlaybackSpeed(speedLabelRef.current))

      tl.eventCallback("onUpdate", () => {
        if (stepPlayTargetRef.current !== null && tl.time() >= stepPlayTargetRef.current - 0.01) {
          const targetTime = stepPlayTargetRef.current
          stepPlayTargetRef.current = null
          tl.pause()
          tl.seek(targetTime)
          setProgress(tl.progress())
          updateStep(targetTime, tl)
          setIsPlaying(false)
          return
        }

        if (!isDraggingRef.current) {
          setProgress(tl.progress())
          updateStep(tl.time(), tl)
        }
      })

      tl.eventCallback("onComplete", () => {
        stepPlayTargetRef.current = null
        if (loopRef.current) {
          tl.seek(0).play()
          setProgress(0)
          setStepProgress(0)
          setCurrentStep(0)
        } else {
          setIsPlaying(false)
          setProgress(1)
          setStepProgress(1)
          setCurrentStep(steps.length - 1)
        }
      })
    },
    [steps, updateStep]
  )

  useEffect(() => {
    speedLabelRef.current = speedLabel
    tlRef.current?.timeScale(resolvePlaybackSpeed(speedLabel))
  }, [speedLabel])

  useEffect(() => {
    if (title && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("set-breadcrumb-title", { detail: title }))
    }
  }, [title])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = document.fullscreenElement === playerRef.current
      setIsFullscreen(isNowFullscreen)
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("player-zoom-action", { detail: { action: "reset" } }))
        }, 120)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Keyboard Navigation & Accessibility (WCAG 2.2 Operable)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === " " || e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (isPlaying) {
          handlePause()
        } else {
          handlePlay()
        }
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "j") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "Home" || e.key.toLowerCase() === "r") {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPlaying, currentStep, steps.length])

  // Controls
  const handlePlay = () => {
    if (!tlRef.current) return
    stepPlayTargetRef.current = null
    if (tlRef.current.progress() >= 1) tlRef.current.seek(0)
    tlRef.current.play()
    setIsPlaying(true)
  }

  const handlePlayNextStep = () => {
    if (!tlRef.current) return

    const tl = tlRef.current
    const times = stepTimesRef.current

    if (tl.progress() >= 1) {
      tl.seek(0)
      setProgress(0)
      setCurrentStep(0)
    }

    const refreshedStep = times.findIndex((time, index) => {
      const nextTime = times[index + 1] ?? Infinity
      return tl.time() >= time - 0.01 && tl.time() < nextTime - 0.01
    })
    const normalizedStep = refreshedStep >= 0 ? refreshedStep : currentStep
    const target = times[normalizedStep + 1] ?? tl.duration()

    stepPlayTargetRef.current = target
    tl.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    stepPlayTargetRef.current = null
    tlRef.current?.pause()
    setIsPlaying(false)
  }

  const handlePrev = () => {
    if (!tlRef.current) return
    const times = stepTimesRef.current
    const target = currentStep > 0 ? times[currentStep - 1] : 0
    stepPlayTargetRef.current = null
    tlRef.current.pause()
    tlRef.current.seek(target)
    setIsPlaying(false)
    setProgress(tlRef.current.progress())
    updateStep(target)
  }

  const handleNext = () => {
    if (!tlRef.current) return
    const times = stepTimesRef.current
    if (currentStep < times.length - 1) {
      const target = times[currentStep + 1]
      stepPlayTargetRef.current = null
      tlRef.current.pause()
      tlRef.current.seek(target)
      setIsPlaying(false)
      setProgress(tlRef.current.progress())
      updateStep(target)
    }
  }

  const handleReset = () => {
    stepPlayTargetRef.current = null
    tlRef.current?.pause()
    tlRef.current?.seek(0)
    setIsPlaying(false)
    setProgress(0)
    setCurrentStep(0)
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tlRef.current) return
    isDraggingRef.current = true
    const value = parseFloat(e.target.value)
    stepPlayTargetRef.current = null
    tlRef.current.pause()
    tlRef.current.progress(value)
    setProgress(value)
    updateStep(tlRef.current.time())
    setIsPlaying(false)
  }

  const handleScrubEnd = () => {
    isDraggingRef.current = false
  }

  const handleSpeedChange = (label: PlaybackSpeedLabel) => {
    setSpeedLabel(label)
  }

  const handleLoopToggle = () => {
    const next = !loop
    setLoop(next)
    loopRef.current = next
  }

  const handleFullscreenToggle = async () => {
    if (!playerRef.current) return

    if (document.fullscreenElement === playerRef.current) {
      await document.exitFullscreen()
      return
    }

    await playerRef.current.requestFullscreen()
  }

  const activeStep = steps[currentStep]

  return (
    <AnimationContext.Provider
      value={{
        registerTimeline,
        currentStep,
        isPlaying,
        progress,
        stepProgress,
        zoom,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        isFullscreen,
        handleFullscreenToggle,
      }}
    >
      <div
        ref={playerRef}
        className={cn(
          "flex flex-col h-full gap-2 bg-background select-none",
          isFullscreen && "p-4 md:p-6"
        )}
      >
        {/* Embed Dialog */}
        {embedSlugOrId && (
          <EmbedDialog
            slugOrId={embedSlugOrId}
            isDynamic={isDynamic}
            isOpen={isEmbedOpen}
            onClose={() => setIsEmbedOpen(false)}
          />
        )}

        {/* Title Bar & Actions */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-4 w-1 bg-primary rounded-full shrink-0" />
            <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {editHref && (
              <Link
                href={editHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/20 cursor-pointer shadow-xs"
              >
                <PenTool className="size-3.5" />
                <span>Editar</span>
              </Link>
            )}

            {embedSlugOrId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmbedOpen(true)}
                className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Incrustar animación vía iFrame"
              >
                <Code className="size-3.5" />
                <span>Incrustar</span>
              </Button>
            )}

            <span className="text-xs text-muted-foreground font-mono ml-1">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Animation canvas + zoom overlay */}
        <div
          className={cn(
            "min-h-0 rounded-lg border border-border/50 bg-card overflow-hidden relative",
            isFullscreen && "flex-1"
          )}
          style={{ flex: "1 1 0", minHeight: "360px", maxHeight: isFullscreen ? "none" : "55vh" }}
        >
          {/* Canvas Viewport */}
          <div className="w-full h-full">
            {children}
          </div>

          {/* Zoom controls — overlay top-right */}
          <div className="absolute top-2 right-2 z-50 flex items-center gap-0.5 rounded-md border border-border/60 bg-card/95 backdrop-blur-sm px-1 py-0.5 shadow-md pointer-events-auto">
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Shrink className="size-4" /> : <Expand className="size-4" />}
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors cursor-pointer"
              title="Alejar zoom (-)"
            >
              <ZoomOut className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="h-6 px-1.5 flex items-center justify-center rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors min-w-[36px] cursor-pointer"
              title="Centrar y resetear zoom"
            >
              {zoom === 1 ? <Maximize2 className="size-4" /> : `${Math.round(zoom * 100)}%`}
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors cursor-pointer"
              title="Acercar zoom (+)"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrubber */}
        <div className="space-y-3">
          <div className="relative">
            {/* Step markers — absolutely positioned at real timeline proportions */}
            <div className="relative h-4 mb-1">
              {steps.map((step, i) => {
                const pct =
                  tlDuration > 0
                    ? (stepTimesRef.current[i] / tlDuration) * 100
                    : (i / Math.max(steps.length - 1, 1)) * 100
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!tlRef.current) return
                      const t = stepTimesRef.current[i] ?? 0
                      tlRef.current.pause()
                      tlRef.current.seek(t)
                      setCurrentStep(i)
                      setProgress(tlRef.current.progress())
                      setIsPlaying(false)
                    }}
                    title={step.label}
                    style={{ left: `${pct}%` }}
                    className={cn(
                      "absolute -translate-x-1/2 bottom-0 w-2 h-2 rounded-full transition-all duration-200 cursor-pointer hover:scale-150",
                      i <= currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )
              })}
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={handleScrub}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(0,112,243,0.2)]
                [&::-webkit-slider-runnable-track]:rounded-full"
              style={{
                background: `linear-gradient(to right, var(--primary) ${progress * 100}%, var(--border) ${progress * 100}%)`,
              }}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 items-center">
            {/* Left: step indicator dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!tlRef.current) return
                    const t = stepTimesRef.current[i] ?? 0
                    tlRef.current.pause()
                    tlRef.current.seek(t)
                    setCurrentStep(i)
                    setProgress(tlRef.current.progress())
                    setIsPlaying(false)
                  }}
                  className={cn(
                    "rounded-full transition-all duration-200 cursor-pointer",
                    i === currentStep
                      ? "w-5 h-2 bg-primary"
                      : i < currentStep
                      ? "w-2 h-2 bg-primary/40"
                      : "w-2 h-2 bg-border"
                  )}
                />
              ))}
            </div>

            {/* Center: transport controls */}
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="h-8 w-8 cursor-pointer"
              >
                <SkipBack className="size-4" />
              </Button>

              <Button
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 cursor-pointer"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayNextStep}
                disabled={steps.length <= 1}
                className="h-9 w-9 rounded-full border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary disabled:border-border disabled:bg-muted/30 disabled:text-muted-foreground cursor-pointer"
                title="Reproducir hasta el siguiente paso"
              >
                <ChevronsRight className="size-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="h-8 w-8 cursor-pointer"
              >
                <SkipForward className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLoopToggle}
                className={cn(
                  "h-8 w-8 transition-colors cursor-pointer",
                  loop ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title={loop ? "Bucle activado" : "Bucle desactivado"}
              >
                <Repeat className="size-3.5" />
              </Button>
            </div>

            {/* Right: speed */}
            <div className="flex items-center justify-end">
              <div className="flex items-center rounded-md border border-border/50 overflow-hidden shrink-0">
                {PLAYBACK_SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleSpeedChange(option.label)}
                    className={cn(
                      "px-2 py-1 text-xs font-mono transition-colors cursor-pointer",
                      speedLabel === option.label
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {option.label}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live region for Screen Reader Announcements (WCAG 2.2) */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {activeStep ? `Paso ${currentStep + 1} de ${steps.length}: ${activeStep.label}. ${activeStep.description}` : ""}
        </div>

        {/* Step description */}
        <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs font-mono text-primary mb-1 uppercase tracking-wider">
                {activeStep?.label}
              </p>
              <MarkdownView content={activeStep?.description || ""} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AnimationContext.Provider>
  )
}
