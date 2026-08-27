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

  // Sorted nodes by zIndex for proper layer depth rendering
  const sortedNodes = useMemo(() => {
    return [...animation.nodes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
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
    const legacyLinks = (animation as any).links || []
    return legacyLinks.map((l: any) => ({
      id: l.id,
      sourceId: l.source,
      targetId: l.target,
      type: "bezier",
      dashed: l.dashed,
    }))
  }, [animation.connectors, (animation as any).links])

  // GSAP Context & Timeline Compilation
  useEffect(() => {
    if (!svgRef.current) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(svgRef.current)
      const tl = compileUniversalTimeline(animation, q, C)
      registerTimeline(tl)
    }, svgRef)

    return () => {
      ctx.revert()
    }
  }, [animation, C, registerTimeline])

  // Render SVG node shape based on node type
  const renderNodeShape = (node: UniversalNode) => {
    const fill = node.fill || (resolvedTheme === "light" ? "#F8FAFC" : "#0F172A")
    const stroke = node.stroke || C.idle
    const strokeWidth = node.strokeWidth || 1.5
    const opacity = node.opacity !== undefined ? node.opacity : 1

    switch (node.type) {
      case "shape": {
        const shapeType = node.shapeDetails?.shapeType || "circle"
        const r = node.shapeDetails?.radius || 36
        const w = node.width || node.shapeDetails?.width || 80
        const h = node.height || node.shapeDetails?.height || 50

        if (shapeType === "circle") {
          return (
            <circle
              r={r}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          )
        }

        if (shapeType === "rounded_rect" || shapeType === "rect" || shapeType === "pill") {
          const rx = shapeType === "pill" ? h / 2 : node.shapeDetails?.rx || 8
          return (
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={rx}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          )
        }

        if (shapeType === "diamond") {
          return (
            <polygon
              points={`0,${-r} ${r},0 0,${r} ${-r},0`}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          )
        }

        if (shapeType === "triangle") {
          return (
            <polygon
              points={`0,${-r} ${r},${r} ${-r},${r}`}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          )
        }

        return (
          <circle
            r={r}
            className="node-shape transition-colors duration-200"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      }

      case "image": {
        const w = node.width || 120
        const h = node.height || 120
        const imgUrl = node.imageUrl || node.content || ""
        return (
          <g>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={12}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            {imgUrl && (
              <image
                href={imgUrl}
                x={-w / 2 + 4}
                y={-h / 2 + 4}
                width={w - 8}
                height={h - 8}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </g>
        )
      }

      case "math": {
        const w = node.width || 180
        const h = node.height || 64
        return (
          <g>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={10}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <foreignObject
              x={-w / 2 + 8}
              y={-h / 2 + 6}
              width={w - 16}
              height={h - 12}
              className="overflow-visible"
            >
              <div className="flex h-full w-full items-center justify-center text-center overflow-x-auto text-xs font-semibold text-foreground">
                <MarkdownView inline content={`$${node.content || node.label}$`} />
              </div>
            </foreignObject>
          </g>
        )
      }

      case "text": {
        const w = node.width || 200
        const h = node.height || 90
        return (
          <g>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={10}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <foreignObject
              x={-w / 2 + 8}
              y={-h / 2 + 8}
              width={w - 16}
              height={h - 16}
              className="overflow-hidden"
            >
              <div className="h-full w-full text-xs text-foreground leading-relaxed overflow-y-auto">
                <MarkdownView content={node.content || node.label} />
              </div>
            </foreignObject>
          </g>
        )
      }

      case "container": {
        const w = node.width || 320
        const h = node.height || 200
        return (
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx={16}
            className="node-shape transition-colors duration-200"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray="6 6"
            opacity={opacity * 0.4}
          />
        )
      }

      case "network":
      default: {
        const netType = node.props?.networkType || "pc"
        return (
          <g>
            <circle
              r={NETWORK_DEVICE_STYLE.radius}
              className="node-shape transition-colors duration-200"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
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
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={C.primary} />
          </marker>
          <marker
            id="arrowhead-backward"
            markerWidth="10"
            markerHeight="10"
            refX="2"
            refY="3.5"
            orient="auto"
          >
            <polygon points="10 0, 0 3.5, 10 7" fill={C.primary} />
          </marker>
        </defs>

        {/* ── 1. Connectors Layer ─────────────────────────────────────── */}
        <g id="connectors-layer">
          {connectors.map((conn) => {
            const src = nodeMap.get(conn.sourceId)
            const dst = nodeMap.get(conn.targetId)
            if (!src || !dst) return null

            const pathData = calculateConnectorPath(src, dst, conn.type || "bezier")
            const hasForwardArrow =
              conn.directed === "forward" || conn.directed === "bidirectional"
            const hasBackwardArrow =
              conn.directed === "backward" || conn.directed === "bidirectional"

            return (
              <g key={conn.id}>
                <path
                  id={`conn-${conn.id}`}
                  d={pathData}
                  fill="none"
                  stroke={conn.color ? C[conn.color] || conn.color : C.idle}
                  strokeWidth={conn.strokeWidth || 2}
                  strokeDasharray={conn.dashed ? "6 6" : undefined}
                  markerEnd={hasForwardArrow ? "url(#arrowhead-forward)" : undefined}
                  markerStart={hasBackwardArrow ? "url(#arrowhead-backward)" : undefined}
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

        {/* ── 2. Nodes Layer (Depth-Sorted by zIndex) ────────────────── */}
        <g id="nodes-layer">
          {sortedNodes.map((node) => {
            const hasLabel = node.type !== "text" && node.type !== "math" && node.type !== "image"
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
                    y="-36"
                    fill={C.successText}
                    fontSize="10"
                    fontFamily="monospace"
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

        {/* ── 3. Animated Particles / Packets Layer ──────────────────── */}
        <g id="packets-layer" className="pointer-events-none">
          {allActions.map((act) => {
            if (act.type !== "packet") return null
            const colorVal = act.color ? C[act.color] || act.color : C.warn
            return (
              <g key={act.id} id={`pkt-${act.id}`} opacity={0}>
                <circle r={14} fill={colorVal} stroke={C.fg} strokeWidth={1.5} opacity={0.9} />
                <text
                  y={4}
                  fill={C.warnText}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {act.text || "DATA"}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* ── 4. Interactive Overlays (Sliders, Quizzes, Decision Trees) ── */}
      <InteractionOverlay
        steps={animation.steps}
        runtime={runtimeRef.current}
        onTriggerAction={(actionId) => {
          // Trigger reactive GSAP micro-animation
        }}
      />
    </div>
  )
}
