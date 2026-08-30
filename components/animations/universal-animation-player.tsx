"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import gsap from "gsap"
import {
  ReactFlow,
  ConnectionMode,
  ViewportPortal,
  useReactFlow,
  type Node as FlowNode,
  type Edge as FlowEdge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useTheme } from "next-themes"
import { useAnimationContext } from "./animation-player"
import { InteractionOverlay } from "./interaction-overlay"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import {
  compileUniversalTimeline,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"
import { universalToReactFlow } from "@/lib/animations/react-flow-adapter"
import { getBackgroundInlineStyle, getPatternSvgPattern } from "@/lib/animations/background-styles"
import { evaluateStepScene } from "@/lib/animations/live-step-evaluator"
import { nodeTypes } from "@/components/builder/nodes"
import { edgeTypes } from "@/components/builder/edges"
import { PacketParticleOverlay } from "@/components/builder/packet-particle-overlay"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
} from "@/types/universal-animation"

function ReactFlowZoomBridge() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  useEffect(() => {
    const handleZoomAction = (e: CustomEvent<{ action: "in" | "out" | "reset" }>) => {
      if (e.detail?.action === "in") zoomIn({ duration: 250 })
      else if (e.detail?.action === "out") zoomOut({ duration: 250 })
      else if (e.detail?.action === "reset") fitView({ duration: 300, padding: 0.15 })
    }

    const handleFullscreenTransition = () => {
      setTimeout(() => {
        fitView({ duration: 200, padding: 0.15 })
      }, 100)
    }

    window.addEventListener("player-zoom-action", handleZoomAction as EventListener)
    document.addEventListener("fullscreenchange", handleFullscreenTransition)

    return () => {
      window.removeEventListener("player-zoom-action", handleZoomAction as EventListener)
      document.removeEventListener("fullscreenchange", handleFullscreenTransition)
    }
  }, [zoomIn, zoomOut, fitView])

  return null
}

interface UniversalAnimationPlayerProps {
  animation: UniversalAnimationData
  className?: string
}

export function UniversalAnimationPlayer({ animation, className }: UniversalAnimationPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { registerTimeline, currentStep, isPlaying, progress, stepProgress } = useAnimationContext()
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
    [resolvedTheme, isLight]
  )

  const nodes = useMemo(() => animation?.nodes || [], [animation?.nodes])
  const steps = useMemo(() => animation?.steps || [], [animation?.steps])
  const connectors = useMemo(() => animation?.connectors || (animation as any)?.links || [], [animation?.connectors, (animation as any)?.links])

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((n) => [n.id, n]))
  }, [nodes])

  // Convert Universal domain structure to React Flow nodes and edges in read-only player mode
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    return universalToReactFlow(animation, { isReadOnly: true })
  }, [animation])

  // Live evaluated scene for the active step
  const evaluatedScene = useMemo(() => {
    return evaluateStepScene(nodes, connectors, steps, currentStep, isPlaying)
  }, [nodes, connectors, steps, currentStep, isPlaying])

  const liveFlowNodes: FlowNode[] = useMemo(() => {
    return flowNodes.map((n) => {
      const nState = evaluatedScene.nodeStates[n.id]
      return {
        ...n,
        data: {
          ...n.data,
          evaluatedState: nState,
        },
      }
    })
  }, [flowNodes, evaluatedScene.nodeStates])

  const liveFlowEdges: FlowEdge[] = useMemo(() => {
    return flowEdges.map((e) => {
      const eState = evaluatedScene.edgeStates[e.id]
      if (!eState) return e
      const strokeColor =
        eState.highlightColor === "active" ? "var(--primary)" : eState.packetColor || e.style?.stroke

      return {
        ...e,
        animated: eState.isAnimated !== undefined ? eState.isAnimated : e.animated,
        label: eState.packetLabel ? `📦 ${eState.packetLabel}` : e.label,
        style: {
          ...e.style,
          stroke: strokeColor,
          strokeWidth:
            (eState.strokeWidth ||
              (typeof e.style?.strokeWidth === "number" ? e.style.strokeWidth : 2)) +
            (eState.highlightColor ? 1 : 0),
        },
      }
    })
  }, [flowEdges, evaluatedScene.edgeStates])

  // Compile unified GSAP timeline targeting live DOM/React Flow elements
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const q = gsap.utils.selector(container)
    const tl = compileUniversalTimeline(animation, q, C)
    registerTimeline(tl)

    return () => {
      tl.kill()
    }
  }, [animation, registerTimeline, C])

  const bgStyle = getBackgroundInlineStyle(animation.background, isLight ? "light" : "dark")
  const patternBg = getPatternSvgPattern(animation.background?.pattern, !isLight)

  // Calculate strict bounding box extent to prevent panning into the void
  const translateExtent = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return [
        [-1500, -1500],
        [3000, 3000],
      ] as [[number, number], [number, number]]
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    nodes.forEach((n) => {
      const w = n.width || 120
      const h = n.height || 80
      if (n.x < minX) minX = n.x
      if (n.y < minY) minY = n.y
      if (n.x + w > maxX) maxX = n.x + w
      if (n.y + h > maxY) maxY = n.y + h
    })

    const paddingX = Math.max(400, (maxX - minX) * 0.6)
    const paddingY = Math.max(300, (maxY - minY) * 0.6)

    return [
      [minX - paddingX, minY - paddingY],
      [maxX + paddingX, maxY + paddingY],
    ] as [[number, number], [number, number]]
  }, [nodes])

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none overflow-hidden transition-colors duration-300 [&_.react-flow__handle]:!hidden [&_.react-flow__handle]:!opacity-0 [&_.react-flow__handle]:!pointer-events-none ${className || ""}`}
      style={bgStyle}
    >
      {patternBg && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: patternBg, backgroundSize: "24px 24px" }}
        />
      )}

      {/* ── Unified React Flow Host (Read-Only / 1:1 Parity Mode) ──── */}
      <div className="relative z-10 h-full w-full">
        <ReactFlow
          nodes={liveFlowNodes}
          edges={liveFlowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          preventScrolling={true}
          minZoom={0.2}
          maxZoom={3.0}
          translateExtent={translateExtent}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          className="h-full w-full pointer-events-auto [&_.react-flow__handle]:!hidden [&_.react-flow__handle]:!opacity-0 [&_.react-flow__handle]:!pointer-events-none [&_.react-flow__pane]:!cursor-default [&_.react-flow__pane.dragging]:!cursor-grabbing"
          onMove={(_, viewport) => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("player-zoom-synced", { detail: { zoom: viewport.zoom } })
              )
            }
          }}
          onNodeClick={(_, flowNode) => {
            const rawNode = nodeMap.get(flowNode.id)
            if (rawNode) setSelectedNode(rawNode)
          }}
        >
          <ReactFlowZoomBridge />
          {/* ── Live Animated Packet Particle Layer Inside Viewport ── */}
          <ViewportPortal>
            <PacketParticleOverlay
              step={steps[currentStep]}
              universalNodes={nodes}
              universalConnectors={connectors}
              progress={stepProgress}
              isPlaying={isPlaying}
            />
          </ViewportPortal>
        </ReactFlow>
      </div>

      {/* ── Native Interaction HUD & Quiz Overlay ──────────────────── */}
      {steps[currentStep]?.interaction && (
        <InteractionOverlay
          stepId={steps[currentStep]?.id || `step-${currentStep + 1}`}
          interaction={steps[currentStep]?.interaction}
          runtime={runtimeRef.current}
        />
      )}
    </div>
  )
}
