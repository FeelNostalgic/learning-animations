"use client"

import React from "react"
import type { EvaluatedNodeState } from "@/lib/animations/live-step-evaluator"
import { cn } from "@/lib/utils"

interface NodeActionVisualizerProps {
  evaluatedState?: EvaluatedNodeState
  children: React.ReactNode
  className?: string
}

export function NodeActionVisualizer({
  evaluatedState,
  children,
  className,
}: NodeActionVisualizerProps) {
  if (!evaluatedState) {
    return <div className={cn("relative h-full w-full", className)}>{children}</div>
  }

  const {
    highlightColor,
    pulseGlow,
    badgeText,
    tooltipText,
    offsetX = 0,
    offsetY = 0,
    scale = 1,
    rotation = 0,
    overrideOpacity,
  } = evaluatedState

  const hasTransform = offsetX !== 0 || offsetY !== 0 || scale !== 1 || rotation !== 0

  // Color mapping for highlights
  const highlightStyles: Record<string, string> = {
    active: "ring-4 ring-primary/80 shadow-xl shadow-primary/30",
    success: "ring-4 ring-emerald-500/90 shadow-xl shadow-emerald-500/30",
    warn: "ring-4 ring-amber-500/90 shadow-xl shadow-amber-500/30",
    destructive: "ring-4 ring-red-500/90 shadow-xl shadow-red-500/30",
    primary: "ring-4 ring-blue-500/90 shadow-xl shadow-blue-500/30",
  }

  const highlightClass = highlightColor
    ? highlightStyles[highlightColor] || `ring-4 ring-[${highlightColor}] shadow-xl`
    : ""

  return (
    <div
      className={cn(
        "relative h-full w-full transition-all duration-300",
        highlightClass,
        pulseGlow && "animate-pulse",
        className
      )}
      style={{
        transform: hasTransform
          ? `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale}) rotate(${rotation}deg)`
          : undefined,
        opacity: overrideOpacity !== undefined ? overrideOpacity : undefined,
      }}
    >
      {/* ── Active Live Badge Overlay ─────────────────────────────── */}
      {badgeText && (
        <div className="absolute -top-3 -right-3 z-30 flex items-center justify-center rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-extrabold text-primary-foreground shadow-lg border border-primary-foreground/20 animate-bounce">
          {badgeText}
        </div>
      )}

      {/* ── Active Live Tooltip Callout ───────────────────────────── */}
      {tooltipText && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center rounded-xl bg-card/95 border border-primary/50 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none">
          <span className="text-primary mr-1">✦</span>
          <span>{tooltipText}</span>
        </div>
      )}

      {children}
    </div>
  )
}
