"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import gsap from "gsap"
import {
  ReactFlow,
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
import { nodeTypes } from "@/components/builder/nodes"
import { edgeTypes } from "@/components/builder/edges"
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

export function UniversalAnimationPlayer({ animation, className }: UniversalAnimationPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
    [resolvedTheme, isLight]
  )

  const nodes = useMemo(() => animation?.nodes || [], [animation?.nodes])
  const steps = useMemo(() => animation?.steps || [], [animation?.steps])
  const connectors = useMemo(() => animation?.connectors || (animation as any)?.links || [], [animation?.connectors, (animation as any)?.links])

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((n) => [n.id, n]))
  }, [nodes])

  // Convert Universal domain structure to React Flow nodes and edges
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    return universalToReactFlow(animation)
  }, [animation])

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

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none overflow-hidden transition-colors duration-300 ${className || ""}`}
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
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          preventScrolling={false}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          className="h-full w-full pointer-events-auto"
          onNodeClick={(_, flowNode) => {
            const rawNode = nodeMap.get(flowNode.id)
            if (rawNode) setSelectedNode(rawNode)
          }}
        />
      </div>

      {/* ── Live Animated Packet Particle Layer ──────────────────── */}
      <PacketParticleOverlay
        step={steps[currentStep]}
        universalNodes={nodes}
        universalConnectors={connectors}
        progress={progress}
        isPlaying={isPlaying}
      />

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
