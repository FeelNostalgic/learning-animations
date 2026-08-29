"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import gsap from "gsap"
import { useTheme } from "next-themes"
import { useAnimationContext } from "./animation-player"
import { InteractionOverlay } from "./interaction-overlay"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import {
  compileUniversalTimeline,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"
import {
  getOptimalAnchorPair,
  computeConnectorPathData,
} from "@/lib/animations/connector-geometry"
import { evaluateStepScene } from "@/lib/animations/live-step-evaluator"
import { getBackgroundInlineStyle, getPatternSvgPattern } from "@/lib/animations/background-styles"
import { UniversalNodeView } from "@/components/animations/visual/universal-node-view"
import { PacketParticleOverlay } from "@/components/builder/packet-particle-overlay"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
} from "@/types/universal-animation"

interface UniversalAnimationPlayerProps {
  animation: UniversalAnimationData
  className?: string
}

const VB = { w: 1280, h: 720 }

export function UniversalAnimationPlayer({ animation, className }: UniversalAnimationPlayerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { registerTimeline, currentStep, isPlaying, progress } = useAnimationContext()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedNode, setSelectedNode] = useState<UniversalNode | null>(null)
  const runtimeRef = useRef<InteractionRuntime>(new InteractionRuntime())

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = !mounted || resolvedTheme !== "dark"

  const C: UniversalPaletteColors = useMemo(
    () =>
      isLight
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

  const nodes = useMemo(() => animation?.nodes || [], [animation?.nodes])
  const steps = useMemo(() => animation?.steps || [], [animation?.steps])

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((n) => [n.id, n]))
  }, [nodes])

  // Separate container nodes from foreground nodes
  const containerNodes = useMemo(() => {
    return nodes.filter((n) => n.type === "container")
  }, [nodes])

  const foregroundNodes = useMemo(() => {
    return nodes
      .filter((n) => n.type !== "container")
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  }, [nodes])

  const allActions = useMemo(() => {
    return steps.flatMap((s) => s.actions || [])
  }, [steps])

  const connectors: UniversalConnector[] = useMemo(() => {
    if (animation?.connectors && animation.connectors.length > 0) {
      return animation.connectors
    }
    if (animation?.links && animation.links.length > 0) {
      return animation.links.map((link) => ({
        id: link.id,
        sourceId: link.source,
        targetId: link.target,
        label: link.label,
        type: (link.style as any) === "curved" ? "bezier" : "straight",
        directed: link.animated ? "forward" : "none",
        color: link.color,
      }))
    }
    return []
  }, [animation.connectors, animation.links])

  // Live evaluated scene for the active step in the player (1:1 identical to Studio)
  const evaluatedScene = useMemo(() => {
    return evaluateStepScene(
      nodes,
      connectors,
      steps,
      currentStep,
      isPlaying
    )
  }, [nodes, connectors, steps, currentStep, isPlaying])

  // Compile GSAP timeline using compiled universal engine
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const q = gsap.utils.selector(svg)
    const tl = compileUniversalTimeline(animation, q, C)
    registerTimeline(tl)

    return () => {
      tl.kill()
    }
  }, [animation, registerTimeline, C])

  const dynamicViewBox = useMemo(() => {
    if (nodes.length === 0) return "0 0 1280 720"

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const n of nodes) {
      const w = n.width || (n.type === "shape" && n.shapeDetails?.shapeType === "circle" ? 80 : 120)
      const h = n.height || (n.type === "shape" && n.shapeDetails?.shapeType === "circle" ? 80 : 70)
      minX = Math.min(minX, n.x)
      minY = Math.min(minY, n.y)
      maxX = Math.max(maxX, n.x + w)
      maxY = Math.max(maxY, n.y + h)
    }

    for (const c of connectors) {
      const src = nodeMap.get(c.sourceId)
      const tgt = nodeMap.get(c.targetId)
      if (src && tgt) {
        minX = Math.min(minX, src.x, tgt.x)
        minY = Math.min(minY, src.y, tgt.y)
        maxX = Math.max(maxX, src.x + 100, tgt.x + 100)
        maxY = Math.max(maxY, src.y + 60, tgt.y + 60)
      }
    }

    const padding = 100
    const rawW = maxX - minX + padding * 2
    const rawH = maxY - minY + padding * 2

    const w = Math.max(900, rawW)
    const h = Math.max(550, rawH)

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const x = cx - w / 2
    const y = cy - h / 2

    return `${Math.round(x)} ${Math.round(y)} ${Math.round(w)} ${Math.round(h)}`
  }, [nodes, connectors, nodeMap])

  const bgStyle = getBackgroundInlineStyle(animation.background, isLight ? "light" : "dark")
  const patternBg = getPatternSvgPattern(animation.background?.pattern, !isLight)

  return (
    <div
      className={`relative h-full w-full select-none overflow-hidden transition-colors duration-300 ${className || ""}`}
      style={bgStyle}
    >
      {patternBg && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: patternBg, backgroundSize: "24px 24px" }}
        />
      )}
      <svg
        ref={svgRef}
        viewBox={dynamicViewBox}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 h-full w-full overflow-visible"
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

        {/* ── Background Subsystem Containers ────────────────────────── */}
        <g id="layer-containers">
          {containerNodes.map((node) => {
            const w = node.width || 320
            const h = node.height || 200
            return (
              <foreignObject
                key={node.id}
                id={`node-${node.id}`}
                x={node.x}
                y={node.y}
                width={w}
                height={h}
                className="overflow-visible pointer-events-none"
              >
                <UniversalNodeView
                  node={node}
                  evaluatedState={evaluatedScene.nodeStates[node.id]}
                />
              </foreignObject>
            )
          })}
        </g>

        {/* ── Connectors & Arrow Paths ─────────────────────────────── */}
        <g id="layer-connectors">
          {connectors.map((conn) => {
            const src = nodeMap.get(conn.sourceId)
            const tgt = nodeMap.get(conn.targetId)
            if (!src || !tgt) return null

            const { sourcePoint, targetPoint } = getOptimalAnchorPair(src, tgt)
            const { pathData, midPoint } = computeConnectorPathData(
              sourcePoint,
              targetPoint,
              conn.type || "bezier"
            )
            const strokeColor = conn.color || C.idle
            const strokeWidth = conn.strokeWidth || 2

            let markerEnd = undefined
            let markerStart = undefined
            if (conn.directed === "forward" || conn.directed === "bidirectional") {
              markerEnd = "url(#arrowhead-forward)"
            }
            if (conn.directed === "backward" || conn.directed === "bidirectional") {
              markerStart = "url(#arrowhead-backward)"
            }

            return (
              <g key={conn.id} id={`connector-${conn.id}`} className="transition-opacity duration-300">
                <path
                  id={`connector-path-${conn.id}`}
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={conn.dashed ? "6 4" : undefined}
                  markerEnd={markerEnd}
                  markerStart={markerStart}
                  className="transition-colors duration-200"
                />
                {conn.label && (
                  <g id={`connector-label-${conn.id}`} transform={`translate(${Math.round(midPoint.x)}, ${Math.round(midPoint.y)})`}>
                    <rect
                      x={-40}
                      y={-12}
                      width={80}
                      height={20}
                      rx={6}
                      className="fill-card/90 stroke-border/60"
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-foreground text-[10px] font-bold select-none pointer-events-none"
                    >
                      {conn.label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>

        {/* ── Foreground Nodes (100% Identical Shared Primitives) ──── */}
        <g id="layer-nodes">
          {foregroundNodes.map((node) => {
            const w = node.width || (node.type === "shape" && node.shapeDetails?.shapeType === "circle" ? 80 : 100)
            const h = node.height || (node.type === "shape" && node.shapeDetails?.shapeType === "circle" ? 80 : 60)

            return (
              <foreignObject
                key={node.id}
                id={`node-${node.id}`}
                x={node.x}
                y={node.y}
                width={w}
                height={h}
                className="overflow-visible cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                <UniversalNodeView
                  node={node}
                  evaluatedState={evaluatedScene.nodeStates[node.id]}
                  className="w-full h-full"
                />
              </foreignObject>
            )
          })}
        </g>
      </svg>

      {/* ── Live Animated Packet Particle Layer ──────────────────── */}
      <PacketParticleOverlay
        step={steps[currentStep]}
        universalNodes={nodes}
        universalConnectors={connectors}
        progress={progress}
        isPlaying={isPlaying}
      />

      {/* ── Native Interaction HUD & Quiz Overlay ──────────────────── */}
      <InteractionOverlay runtimeRef={runtimeRef} />
    </div>
  )
}
