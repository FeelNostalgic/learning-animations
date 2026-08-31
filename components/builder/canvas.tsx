"use client"

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  ViewportPortal,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { nodeTypes } from "./nodes"
import { edgeTypes } from "./edges"
import { FloatingPropertyPanel } from "./floating-property-panel"
import { useTheme } from "next-themes"
import {
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
} from "lucide-react"
import type { UniversalNode, UniversalStep, AnimationBackground, UniversalAnimationData } from "@/types/universal-animation"
import { getBackgroundInlineStyle, getPatternSvgPattern } from "@/lib/animations/background-styles"
import { StudioPlaybackBar } from "./studio-playback-bar"
import { PacketParticleOverlay } from "./packet-particle-overlay"
import type { PlaybackMode } from "@/lib/animations/studio-playback-controller"
import gsap from "gsap"
import {
  compileUniversalTimeline,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"

interface ContextMenuState {
  x: number
  y: number
  nodeId: string
}

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  currentStep?: UniversalStep
  allSteps?: UniversalStep[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  selectedNodeId: string | null
  selectedEdgeId: string | null
  selectedNode: UniversalNode | null
  selectedEdge: Edge | null
  background?: AnimationBackground
  playbackProps?: {
    currentStepIndex: number
    totalSteps: number
    stepLabel: string
    mode: PlaybackMode
    speed: number
    progress: number
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
  onSelectNode: (nodeId: string | null) => void
  onSelectEdge: (edgeId: string | null) => void
  onUpdateNode?: (node: UniversalNode) => void
  onUpdateEdge?: (edge: Edge) => void
  onDeleteNode?: (nodeId: string) => void
  onDeleteEdge?: (edgeId: string) => void
  onDuplicateNode?: (nodeId: string) => void
  onUpdateNodeZIndex?: (nodeId: string, delta: "front" | "back" | "up" | "down") => void
}

export function Canvas({
  nodes,
  edges,
  currentStep,
  allSteps,
  onNodesChange,
  onEdgesChange,
  onConnect,
  selectedNodeId,
  selectedEdgeId,
  selectedNode,
  selectedEdge,
  background,
  playbackProps,
  onSelectNode,
  onSelectEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onUpdateNodeZIndex,
}: CanvasProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const C: UniversalPaletteColors = useMemo(
    () =>
      !isDark
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
    [isDark]
  )

  // Live GSAP timeline synchronization in Studio
  useEffect(() => {
    const container = containerRef.current
    if (!container || !currentStep) return

    const q = gsap.utils.selector(container)
    const animData: UniversalAnimationData = {
      title: "Studio active animation",
      description: "Active Studio canvas sequence",
      discipline: "general",
      topic: "studio",
      tags: [],
      difficulty: "beginner",
      is_public: true,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as any,
        label: (n.data as any).label || "",
        x: n.position.x,
        y: n.position.y,
        width: (n.data as any).width,
        height: (n.data as any).height,
        fill: (n.data as any).fill,
        stroke: (n.data as any).stroke,
        strokeWidth: (n.data as any).strokeWidth,
        opacity: (n.data as any).opacity,
        rotation: (n.data as any).rotation,
        scale: (n.data as any).scale,
        shapeDetails: (n.data as any).shapeDetails,
        content: (n.data as any).content,
      })),
      connectors: edges.map((e) => ({
        id: e.id,
        sourceId: e.source,
        targetId: e.target,
        type: (e.data as any)?.connectorType || "bezier",
        directed: (e.data as any)?.directed || "none",
        dashed: e.animated,
        color: (e.style as any)?.stroke,
      })),
      steps: [currentStep],
    }

    const tl = compileUniversalTimeline(animData, q, C)

    if (playbackProps) {
      if (playbackProps.mode === "playing_step" || playbackProps.mode === "playing_all") {
        tl.timeScale(playbackProps.speed)
        tl.progress(playbackProps.progress)
        tl.play()
      } else if (playbackProps.mode === "paused") {
        tl.pause()
        tl.progress(playbackProps.progress)
      } else {
        tl.progress(playbackProps.progress || 0)
        tl.pause()
      }
    }

    return () => {
      tl.kill()
    }
  }, [nodes, edges, currentStep, playbackProps?.mode, playbackProps?.progress, playbackProps?.speed, C])

  const bgStyle = getBackgroundInlineStyle(background, isDark ? "dark" : "light")
  const patternBg = getPatternSvgPattern(background?.pattern, isDark)

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectNode(node.id)
      onSelectEdge(null)
      setContextMenu(null)
    },
    [onSelectNode, onSelectEdge]
  )

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      onSelectEdge(edge.id)
      onSelectNode(null)
      setContextMenu(null)
    },
    [onSelectEdge, onSelectNode]
  )

  const handlePaneClick = useCallback(() => {
    onSelectNode(null)
    onSelectEdge(null)
    setContextMenu(null)
  }, [onSelectNode, onSelectEdge])

  const handleNodeContextMenu: NodeMouseHandler = useCallback(
    (e, node) => {
      e.preventDefault()
      onSelectNode(node.id)
      onSelectEdge(null)
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId: node.id,
      })
    },
    [onSelectNode, onSelectEdge]
  )

  // Keyboard shortcut to delete selected node or edge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId && onDeleteNode) {
          onDeleteNode(selectedNodeId)
        } else if (selectedEdgeId && onDeleteEdge) {
          onDeleteEdge(selectedEdgeId)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedNodeId, selectedEdgeId, onDeleteNode, onDeleteEdge])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full overflow-hidden transition-colors duration-300"
      style={bgStyle}
    >
      {patternBg && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: patternBg, backgroundSize: "24px 24px" }}
        />
      )}

      {/* ── Native Studio WYSIWYG Playback Bar (Top-Center Canvas) ──── */}
      {playbackProps && (
        <StudioPlaybackBar
          currentStepIndex={playbackProps.currentStepIndex}
          totalSteps={playbackProps.totalSteps}
          stepLabel={playbackProps.stepLabel}
          mode={playbackProps.mode}
          speed={playbackProps.speed}
          progress={playbackProps.progress}
          actionCount={playbackProps.actionCount}
          onPlayStep={playbackProps.onPlayStep}
          onPlayAll={playbackProps.onPlayAll}
          onPause={playbackProps.onPause}
          onResume={playbackProps.onResume}
          onStop={playbackProps.onStop}
          onNextStep={playbackProps.onNextStep}
          onPrevStep={playbackProps.onPrevStep}
          onSpeedChange={playbackProps.onSpeedChange}
        />
      )}

      {/* ── Floating Property Panel (Top-Left Canvas) ───────────── */}
      {(selectedNode || selectedEdge) && (
        <FloatingPropertyPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode || (() => {})}
          onDeleteNode={onDeleteNode || (() => {})}
          selectedEdge={selectedEdge}
          onUpdateEdge={onUpdateEdge || (() => {})}
          onDeleteEdge={onDeleteEdge || (() => {})}
          allSteps={allSteps}
          onClose={() => {
            onSelectNode(null)
            onSelectEdge(null)
          }}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={playbackProps ? playbackProps.mode === "idle" : true}
        nodesConnectable={playbackProps ? playbackProps.mode === "idle" : true}
        elementsSelectable={playbackProps ? playbackProps.mode === "idle" : true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[16, 16]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="h-full w-full !bg-transparent transition-colors duration-300"
      >
        {/* If no custom pattern is selected and no custom bg, use React Flow's default dots */}
        {!background && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color={isDark ? "#334155" : "#CBD5E1"}
          />
        )}

        {/* ── Live Animated Packet Particle Layer ──────────────────── */}
        <ViewportPortal>
          <PacketParticleOverlay
            step={currentStep}
            nodes={nodes}
            edges={edges}
            progress={playbackProps?.progress || 0}
            isPlaying={Boolean(playbackProps && playbackProps.mode !== "idle")}
          />
        </ViewportPortal>
        <Controls
          showInteractive={false}
          className="!bg-card/90 !border-border !shadow-md !rounded-xl overflow-hidden"
        />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(n) => {
            if (n.type === "shape") return "var(--primary)"
            if (n.type === "math") return "#8B5CF6"
            if (n.type === "text") return "#3B82F6"
            if (n.type === "image") return "#EC4899"
            return "#64748B"
          }}
          className="!bg-card/90 !border-border !rounded-xl !shadow-md"
        />
      </ReactFlow>

      {/* ── Right-Click Context Menu ──────────────────────────────── */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu(null)
            }}
          />
          <div
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
            className="fixed z-50 min-w-44 rounded-xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-md text-xs select-none space-y-0.5"
          >
            <button
              onClick={() => {
                onUpdateNodeZIndex?.(contextMenu.nodeId, "front")
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent cursor-pointer"
            >
              <ArrowUp className="size-3.5 text-primary" />
              <span>Traer al frente</span>
            </button>

            <button
              onClick={() => {
                onUpdateNodeZIndex?.(contextMenu.nodeId, "up")
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent cursor-pointer"
            >
              <ChevronUp className="size-3.5 text-muted-foreground" />
              <span>Subir un nivel</span>
            </button>

            <button
              onClick={() => {
                onUpdateNodeZIndex?.(contextMenu.nodeId, "down")
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent cursor-pointer"
            >
              <ChevronDown className="size-3.5 text-muted-foreground" />
              <span>Bajar un nivel</span>
            </button>

            <button
              onClick={() => {
                onUpdateNodeZIndex?.(contextMenu.nodeId, "back")
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent cursor-pointer"
            >
              <ArrowDown className="size-3.5 text-muted-foreground" />
              <span>Enviar al fondo</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              onClick={() => {
                onDuplicateNode?.(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent cursor-pointer"
            >
              <Copy className="size-3.5 text-emerald-500" />
              <span>Duplicar nodo</span>
            </button>

            <button
              onClick={() => {
                onDeleteNode?.(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Eliminar nodo</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
