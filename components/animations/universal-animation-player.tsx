"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import gsap from "gsap"
import { useTheme } from "next-themes"
import { useAnimationContext } from "./animation-player"
import {
  NETWORK_DEVICE_STYLE,
  PcGlyph,
  SwitchGlyph,
  RouterGlyph,
  ServerGlyph,
} from "./network-device-icons"
import { CloudGlyph } from "./network-visual-primitives"
import { MarkdownView } from "@/components/ui/markdown-view"
import { InteractionOverlay } from "./interaction-overlay"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import {
  compileUniversalTimeline,
  calculateConnectorPath,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
  UniversalAction,
} from "@/types/universal-animation"

interface UniversalAnimationPlayerProps {
  animation: UniversalAnimationData
  className?: string
}

const VB = { w: 1280, h: 720 }

export function UniversalAnimationPlayer({ animation, className }: UniversalAnimationPlayerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { registerTimeline } = useAnimationContext()
  const { resolvedTheme } = useTheme()
  const [selectedNode, setSelectedNode] = useState<UniversalNode | null>(null)
  const runtimeRef = useRef<InteractionRuntime>(new InteractionRuntime())

  const C: UniversalPaletteColors = useMemo(
    () =>
      resolvedTheme === "light"
        ? {
            idle: "#94A3B8",
            active: "#2563EB",
            success: "#059669",
            warn: "#D97706",
            destructive: "#EF4444",
            primary: "#0070F3",
            muted: "#CBD5E1",
            fg: "#0F172A",
            bg: "#E5EAF0",
            warnText: "#111827",
            successText: "#F8FAFC",
            subText: "#475569",
          }
        : {
            idle: "#64748B",
            active: "#38BDF8",
            success: "#34D399",
            warn: "#FBBF24",
            destructive: "#F87171",
            primary: "#0070F3",
            muted: "#334155",
            fg: "#E5E7EB",
            bg: "#1F2937",
            warnText: "#111827",
            successText: "#F8FAFC",
            subText: "#A3B0C2",
          },
    [resolvedTheme]
  )

  const nodeMap = useMemo(() => {
    return new Map(animation.nodes.map((n) => [n.id, n]))
  }, [animation.nodes])

  // Extract all actions from all steps
  const allActions = useMemo(() => {
    return animation.steps.flatMap((s) => s.actions)
  }, [animation.steps])

  // Connectors list (supports both connectors and legacy links)
  const connectors: UniversalConnector[] = useMemo(() => {
    if (animation.connectors && animation.connectors.length > 0) {
      return animation.connectors
    }
    // Fallback to legacy links if present
    const legacyLinks = (animation as any).links || []
    return legacyLinks.map((l: any) => ({
      id: l.id,
      sourceId: l.source,
      targetId: l.target,
      type: "straight",
      dashed: l.dashed,
    }))
  }, [animation])

  useEffect(() => {
    if (!svgRef.current) return
    const q = gsap.utils.selector(svgRef)

    const tl = compileUniversalTimeline(animation, q, C)
    registerTimeline(tl)

    return () => {
      tl.kill()
    }
  }, [animation, C, registerTimeline])

  // Render individual Node Visual Representation
  const renderNodeShape = (node: UniversalNode) => {
    const isNodeSelected = selectedNode?.id === node.id

    switch (node.type) {
      case "shape": {
        const shapeType = node.shapeDetails?.shapeType || "circle"
        const r = node.shapeDetails?.radius || 32
        const w = node.width || 80
        const h = node.height || 60

        if (shapeType === "circle") {
          return (
            <circle
              r={r}
              className="node-shape transition-colors duration-200"
              fill={node.fill || (resolvedTheme === "light" ? "#FFFFFF" : "#1E293B")}
              stroke={node.stroke || C.idle}
              strokeWidth={node.strokeWidth || 2}
            />
          )
        }

        if (shapeType === "diamond") {
          return (
            <polygon
              points={`0,-${r * 1.2} ${r * 1.2},0 0,${r * 1.2} -${r * 1.2},0`}
              className="node-shape transition-colors duration-200"
              fill={node.fill || (resolvedTheme === "light" ? "#FFFFFF" : "#1E293B")}
              stroke={node.stroke || C.idle}
              strokeWidth={node.strokeWidth || 2}
            />
          )
        }

        if (shapeType === "triangle") {
          return (
            <polygon
              points={`-${r},${r * 0.8} ${r},${r * 0.8} 0,-${r}`}
              className="node-shape transition-colors duration-200"
              fill={node.fill || (resolvedTheme === "light" ? "#FFFFFF" : "#1E293B")}
              stroke={node.stroke || C.idle}
              strokeWidth={node.strokeWidth || 2}
            />
          )
        }

        // Rect / Rounded Rect / Pill
        return (
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx={shapeType === "pill" ? h / 2 : node.shapeDetails?.rx || 8}
            className="node-shape transition-colors duration-200"
            fill={node.fill || (resolvedTheme === "light" ? "#FFFFFF" : "#1E293B")}
            stroke={node.stroke || C.idle}
            strokeWidth={node.strokeWidth || 2}
          />
        )
      }

      case "math": {
        const w = node.width || 180
        const h = node.height || 70
        return (
          <g>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={10}
              className="node-shape transition-colors duration-200"
              fill={node.fill || (resolvedTheme === "light" ? "#FFFFFF" : "#1E293B")}
              stroke={node.stroke || C.primary}
              strokeWidth={node.strokeWidth || 1.5}
            />
            <foreignObject x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16}>
              <div className="flex h-full w-full items-center justify-center text-center overflow-hidden">
                <MarkdownView inline content={node.content ? `$${node.content}$` : `$${node.label}$`} />
              </div>
            </foreignObject>
          </g>
        )
      }

      case "text": {
        const w = node.width || 200
        const h = node.height || 100
        return (
          <g>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={10}
              className="node-shape transition-colors duration-200"
              fill={node.fill || (resolvedTheme === "light" ? "#F8FAFC" : "#182234")}
              stroke={node.stroke || C.idle}
              strokeWidth={node.strokeWidth || 1}
            />
            <foreignObject x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20}>
              <div className="h-full w-full overflow-y-auto pr-1 text-xs select-text">
                <MarkdownView content={node.content || node.label} />
              </div>
            </foreignObject>
          </g>
        )
      }

      case "container": {
        const w = node.width || 320
        const h = node.height || 220
        return (
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx={16}
            className="node-shape"
            fill={node.fill || "transparent"}
            stroke={node.stroke || C.idle}
            strokeWidth={1.5}
            strokeDasharray="6 6"
            opacity={0.6}
          />
        )
      }

      case "network":
      default: {
        // Network Device glyphs
        const netType = node.props?.networkType || "pc"
        return (
          <g>
            <circle
              r={NETWORK_DEVICE_STYLE.radius}
              className="node-shape transition-colors duration-200"
              fill={resolvedTheme === "light" ? "#F1F5F9" : "#1E293B"}
              stroke={C.idle}
              strokeWidth={1.5}
            />
            {netType === "pc" && <PcGlyph stroke={C.fg} />}
            {netType === "switch" && <SwitchGlyph stroke={C.fg} />}
            {netType === "router" && <RouterGlyph stroke={C.fg} />}
            {netType === "server" && <ServerGlyph stroke={C.fg} />}
            {netType === "cloud" && <CloudGlyph fill={C.fg} />}
          </g>
        )
      }
    }
  }

  return (
    <div className={`relative h-full w-full select-none overflow-hidden ${className || ""}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="h-full w-full overflow-visible"
        aria-label={`Visualización interactiva: ${animation.title}`}
        role="img"
      >
        <defs>
          <marker
            id="arrowhead-forward"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill={C.idle} />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill={C.active} />
          </marker>
        </defs>

        {/* ── 1. Connectors Layer ─────────────────────────────────────── */}
        <g id="connectors-layer">
          {connectors.map((conn) => {
            const src = nodeMap.get(conn.sourceId)
            const dst = nodeMap.get(conn.targetId)
            if (!src || !dst) return null

            const pathData = calculateConnectorPath(src, dst, conn.type || "straight")
            const hasArrow = conn.directed === "forward" || conn.directed === "bidirectional"

            return (
              <g key={conn.id}>
                <path
                  id={`conn-${conn.id}`}
                  d={pathData}
                  fill="none"
                  stroke={conn.color ? C[conn.color] || conn.color : C.idle}
                  strokeWidth={conn.strokeWidth || 1.5}
                  strokeDasharray={conn.dashed ? "6 6" : undefined}
                  markerEnd={hasArrow ? "url(#arrowhead-forward)" : undefined}
                  className="transition-colors duration-200"
                />
                {conn.label && (
                  <text
                    x={(src.x + dst.x) / 2}
                    y={(src.y + dst.y) / 2 - 8}
                    fill={C.subText}
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none font-semibold"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* ── 2. Nodes Layer ─────────────────────────────────────────── */}
        <g id="nodes-layer">
          {animation.nodes.map((node) => {
            const hasLabel = node.type !== "text" && node.type !== "math"
            return (
              <g
                key={node.id}
                id={`node-${node.id}`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
                tabIndex={0}
                role="button"
                aria-label={node.ariaLabel || `${node.label} (${node.type})`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedNode(node)
                  }
                }}
              >
                {/* Pulse Ring */}
                <circle
                  className="ring pointer-events-none"
                  r={node.shapeDetails?.radius ? node.shapeDetails.radius * 1.3 : 42}
                  fill="none"
                  stroke={C.active}
                  strokeWidth={2}
                  opacity={0}
                />

                {/* Node Shape */}
                {renderNodeShape(node)}

                {/* Node Label */}
                {hasLabel && (
                  <text
                    y={node.height ? node.height / 2 + 18 : 46}
                    fill={C.fg}
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none font-sans pointer-events-none"
                  >
                    {node.label}
                  </text>
                )}

                {/* Node Badge */}
                <g id={`badge-${node.id}`} className="pointer-events-none" opacity={0}>
                  <rect
                    x="-35"
                    y="-50"
                    width="70"
                    height="20"
                    rx="10"
                    fill={C.success}
                    stroke={C.fg}
                    strokeWidth={1}
                  />
                  <text
                    x="0"
                    y="-36"
                    fill={C.successText}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    OK
                  </text>
                </g>
              </g>
            )
          })}
        </g>

        {/* ── 3. Overlay Particles and Tooltips Layer ────────────────── */}
        <g id="particles-layer" className="pointer-events-none">
          {allActions.map((action) => {
            if (action.type === "packet") {
              return (
                <g key={action.id} id={`pkt-${action.id}`} opacity={0}>
                  <rect
                    x="-40"
                    y="-13"
                    width="80"
                    height="26"
                    rx="13"
                    fill={action.color ? C[action.color] || C.active : C.active}
                    stroke={C.fg}
                    strokeWidth={1.5}
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {action.text || "DATA"}
                  </text>
                </g>
              )
            }

            if (action.type === "tooltip") {
              return (
                <g key={action.id} id={`tooltip-${action.id}`} opacity={0}>
                  <rect
                    x="-80"
                    y="-65"
                    width="160"
                    height="45"
                    rx="8"
                    fill={resolvedTheme === "light" ? "#1E293B" : "#0F172A"}
                    stroke={C.primary}
                    strokeWidth={1.5}
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
                  />
                  <text
                    x="0"
                    y="-45"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {action.text}
                  </text>
                  {action.subText && (
                    <text
                      x="0"
                      y="-30"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {action.subText}
                    </text>
                  )}
                </g>
              )
            }

            return null
          })}
        </g>
      </svg>

      {/* ── 4. Interactive Overlay Layer (Sliders, Quizzes, Decisions) ── */}
      {animation.steps.map((step) => {
        if (!step.interaction) return null
        return (
          <div
            key={step.id}
            className="absolute bottom-4 right-4 z-20 max-w-sm"
          >
            <InteractionOverlay
              stepId={step.id}
              interaction={step.interaction}
              runtime={runtimeRef.current}
            />
          </div>
        )
      })}
    </div>
  )
}
