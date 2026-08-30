"use client"

import React, { memo } from "react"
import { MarkdownView } from "@/components/ui/markdown-view"
import {
  Sigma,
  FileText,
  Image as ImageIcon,
  Laptop,
  Network,
  Shield,
  Server,
  Cloud,
  Box,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UniversalNode } from "@/types/universal-animation"
import type { EvaluatedNodeState } from "@/lib/animations/live-step-evaluator"

export interface UniversalNodeViewProps {
  node: UniversalNode
  evaluatedState?: EvaluatedNodeState
  isEditingInline?: boolean
  inlineEditorContent?: React.ReactNode
  className?: string
  onClick?: () => void
}

export const UniversalNodeView = memo(function UniversalNodeView({
  node,
  evaluatedState,
  isEditingInline,
  inlineEditorContent,
  className,
  onClick,
}: UniversalNodeViewProps) {
  const {
    type,
    label,
    content,
    shapeDetails = {},
    props = {},
    iconName,
  } = node

  // Effective visual attributes combining base node + evaluated step overrides
  const fill = evaluatedState?.overrideFill || node.fill || "var(--card)"
  const stroke = evaluatedState?.overrideStroke || node.stroke || "var(--primary)"
  const strokeWidth =
    evaluatedState?.overrideStrokeWidth !== undefined
      ? evaluatedState.overrideStrokeWidth
      : node.strokeWidth !== undefined
      ? node.strokeWidth
      : 2
  const opacity =
    evaluatedState?.overrideOpacity !== undefined
      ? evaluatedState.overrideOpacity
      : node.opacity !== undefined
      ? node.opacity
      : 1

  const width = node.width || (type === "shape" && shapeDetails.shapeType === "circle" ? 80 : 100)
  const height = node.height || (type === "shape" && shapeDetails.shapeType === "circle" ? 80 : 60)

  const {
    highlightColor,
    pulseGlow,
    badgeText,
    tooltipText,
    offsetX = 0,
    offsetY = 0,
    scale = 1,
    rotation = 0,
  } = evaluatedState || {}

  const hasTransform = offsetX !== 0 || offsetY !== 0 || scale !== 1 || rotation !== 0

  const highlightStyles: Record<string, string> = {
    active: "ring-4 ring-primary/80 shadow-2xl shadow-primary/30",
    success: "ring-4 ring-emerald-500/90 shadow-2xl shadow-emerald-500/30",
    warn: "ring-4 ring-amber-500/90 shadow-2xl shadow-amber-500/30",
    destructive: "ring-4 ring-red-500/90 shadow-2xl shadow-red-500/30",
    primary: "ring-4 ring-blue-500/90 shadow-2xl shadow-blue-500/30",
  }

  const highlightClass = highlightColor
    ? highlightStyles[highlightColor] || `ring-4 ring-[${highlightColor}] shadow-2xl`
    : ""

  const shapeType = shapeDetails?.shapeType || "circle"
  const isCircle = shapeType === "circle"
  const isDiamond = shapeType === "diamond"
  const isTriangle = shapeType === "triangle"
  const isPill = shapeType === "pill"
  const isRounded =
    type === "math" ||
    type === "text" ||
    type === "code" ||
    type === "image" ||
    type === "network" ||
    type === "container" ||
    (type === "shape" && !isCircle && !isPill && !isDiamond && !isTriangle)

  const renderNetworkIcon = () => {
    const netType = props.networkType || "pc"
    switch (netType) {
      case "router":
        return <Network className="size-5 text-primary" />
      case "switch":
        return <Shield className="size-5 text-emerald-500" />
      case "server":
        return <Server className="size-5 text-purple-500" />
      case "cloud":
        return <Cloud className="size-5 text-sky-500" />
      case "pc":
      default:
        return <Laptop className="size-5 text-primary" />
    }
  }

  return (
    <div
      data-node-id={node.id}
      onClick={onClick}
      className={cn(
        "universal-node-view relative flex select-none transition-all duration-300",
        (isCircle || isPill) && "rounded-full",
        isRounded && "rounded-xl",
        isDiamond && "rounded-md",
        highlightClass,
        pulseGlow && "animate-pulse",
        className
      )}
      style={{
        width,
        height,
        opacity,
        transform: hasTransform
          ? `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale}) rotate(${rotation}deg)`
          : undefined,
      }}
    >
      {/* ── GSAP Target Ring Overlay ──────────────────────────────── */}
      <div
        className={cn(
          "ring pointer-events-none absolute inset-0 opacity-0 border-2 border-primary",
          (isCircle || isPill) && "rounded-full",
          isRounded && "rounded-xl",
          isDiamond && "rounded-md"
        )}
      />

      {/* ── Active Live Badge Overlay ─────────────────────────────── */}
      {badgeText && (
        <div
          data-badge-id={node.id}
          className="node-badge absolute -top-3 -right-3 z-30 flex items-center justify-center rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-extrabold text-primary-foreground shadow-lg border border-primary-foreground/20 animate-bounce"
        >
          {badgeText}
        </div>
      )}

      {/* ── Active Live Tooltip Callout ───────────────────────────── */}
      {tooltipText && (
        <div className="node-tooltip absolute -top-9 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center rounded-xl bg-card/95 border border-primary/50 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none">
          <span className="text-primary mr-1">✦</span>
          <span>{tooltipText}</span>
        </div>
      )}

      {/* ── 1. Geometric Shape Node ──────────────────────────────── */}
      {type === "shape" && (
        <div
          className={cn(
            "node-shape flex h-full w-full items-center justify-center p-2 shadow-md transition-colors",
            isCircle && "rounded-full",
            isPill && "rounded-full",
            !isCircle && !isPill && !isDiamond && !isTriangle && "rounded-xl",
            isDiamond && "rotate-45 rounded-md",
            isTriangle && "rounded-md"
          )}
          style={{
            backgroundColor: fill,
            border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
          }}
        >
          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            <span
              className={cn(
                "text-xs font-bold text-foreground select-none text-center truncate max-w-full px-1",
                isDiamond && "-rotate-45"
              )}
            >
              {label}
            </span>
          )}
        </div>
      )}

      {/* ── 2. Math Formula Node (KaTeX) ─────────────────────────── */}
      {type === "math" && (
        <div
          className="node-shape flex h-full w-full flex-col justify-between rounded-xl bg-card/95 p-3 shadow-lg backdrop-blur-md transition-colors"
          style={{
            backgroundColor: fill,
            border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
          }}
        >
          <div className="flex items-center justify-between mb-1 pb-1 border-b border-border/50 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Sigma className="size-3 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          </div>

          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            <div className="flex flex-1 items-center justify-center overflow-x-auto text-xs py-0.5 font-semibold text-foreground">
              <MarkdownView inline content={`$${content || label}$`} />
            </div>
          )}
        </div>
      )}

      {/* ── 3. Rich Text Node (Markdown) ─────────────────────────── */}
      {type === "text" && (
        <div
          className="node-shape flex h-full w-full flex-col justify-between rounded-xl bg-card/95 p-3 shadow-md backdrop-blur-md transition-colors"
          style={{
            backgroundColor: fill,
            border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
          }}
        >
          <div className="flex items-center justify-between mb-1 pb-1 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <FileText className="size-3 text-primary shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          </div>

          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            <div className="flex-1 text-xs leading-relaxed overflow-y-auto pr-1 text-foreground">
              <MarkdownView content={content || label} />
            </div>
          )}
        </div>
      )}

      {/* ── 4. Image Node (R2 / URL) ──────────────────────────────── */}
      {type === "image" && (
        <div
          className="node-shape flex h-full w-full flex-col items-center justify-between rounded-2xl p-1 transition-colors"
          style={{
            backgroundColor: fill,
            border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
          }}
        >
          <div className="relative overflow-hidden rounded-xl bg-card/80 shadow-md flex items-center justify-center h-full w-full">
            {node.imageUrl || content ? (
              <img
                src={node.imageUrl || content}
                alt={label}
                className="h-full w-full select-none pointer-events-none"
                style={{ objectFit: node.imageFit || "contain" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-1 p-2">
                <ImageIcon className="size-6 text-primary/60" />
                <span className="text-[10px] text-center font-medium">Sin imagen</span>
              </div>
            )}
          </div>

          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            <span className="text-[11px] font-bold text-foreground mt-1 text-center truncate max-w-full px-1">
              {label}
            </span>
          )}
        </div>
      )}

      {/* ── 5. Network Node ───────────────────────────────────────── */}
      {type === "network" && (
        <div
          className="node-shape flex h-full w-full flex-col items-center justify-center rounded-2xl p-2 shadow-md transition-colors"
          style={{
            backgroundColor: fill,
            border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/40 mb-1 shrink-0">
            {renderNetworkIcon()}
          </div>

          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            <span className="text-xs font-bold text-foreground text-center truncate max-w-full px-1">
              {label}
            </span>
          )}

          {props.ip && (
            <span className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate max-w-full">
              {props.ip}
            </span>
          )}
        </div>
      )}

      {/* ── 6. Container Node ─────────────────────────────────────── */}
      {type === "container" && (
        <div
          className="node-shape flex h-full w-full flex-col justify-between rounded-2xl p-3 shadow-inner transition-colors"
          style={{
            backgroundColor: fill || "rgba(15, 23, 42, 0.35)",
            border: strokeWidth > 0 ? `${strokeWidth}px dashed ${stroke || "var(--border)"}` : "none",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider pb-1">
            <Box className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          {isEditingInline && inlineEditorContent ? (
            inlineEditorContent
          ) : (
            content && (
              <div className="text-[11px] text-muted-foreground">
                <MarkdownView content={content} />
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
})
