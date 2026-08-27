"use client"

import React, { useState, useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
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
import { useTheme } from "next-themes"
import {
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
} from "lucide-react"

interface ContextMenuState {
  x: number
  y: number
  nodeId: string
}

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  selectedNodeId: string | null
  selectedEdgeId: string | null
  onSelectNode: (nodeId: string | null) => void
  onSelectEdge: (edgeId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onDeleteEdge?: (edgeId: string) => void
  onDuplicateNode?: (nodeId: string) => void
  onUpdateNodeZIndex?: (nodeId: string, delta: "front" | "back" | "up" | "down") => void
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onUpdateNodeZIndex,
}: CanvasProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

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
          e.preventDefault()
          onDeleteNode(selectedNodeId)
        } else if (selectedEdgeId && onDeleteEdge) {
          e.preventDefault()
          onDeleteEdge(selectedEdgeId)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedNodeId, selectedEdgeId, onDeleteNode, onDeleteEdge])

  // Custom node color for MiniMap
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case "math":
        return "#0070F3"
      case "shape":
        return "#10B981"
      case "image":
        return "#EC4899"
      case "network":
        return "#F59E0B"
      case "text":
        return "#8B5CF6"
      case "container":
        return "#64748B"
      default:
        return "#0070F3"
    }
  }, [])

  return (
    <div
      className="relative h-full w-full bg-background overflow-hidden select-none"
      onClick={() => setContextMenu(null)}
    >
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
        }))}
        edges={edges.map((e) => ({
          ...e,
          selected: e.id === selectedEdgeId,
          style: {
            ...e.style,
            stroke: e.id === selectedEdgeId ? "var(--primary)" : e.style?.stroke || "#0070F3",
            strokeWidth: e.id === selectedEdgeId ? 3.5 : e.style?.strokeWidth || 2,
          },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={handlePaneClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: isDark ? "#38BDF8" : "#0070F3", strokeWidth: 2 },
        }}
        className="touch-none"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.2}
          color={isDark ? "#334155" : "#CBD5E1"}
        />
        <Controls
          showInteractive={false}
          className="!bg-card/90 !border-border !shadow-lg !rounded-xl !overflow-hidden [&>button]:!border-border [&>button]:!bg-card [&>button]:hover:!bg-accent [&>button>svg]:!fill-foreground"
        />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={2}
          zoomable
          pannable
          className="!bg-card/80 !border-border/80 !rounded-xl !shadow-xl !overflow-hidden hidden md:block"
          maskColor={isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.7)"}
        />
      </ReactFlow>

      {/* ── Context Menu (Right Click on Node) ──────────────────────── */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-[160px] rounded-xl border border-border bg-card/95 p-1 text-xs shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
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
            <ChevronUp className="size-3.5 text-primary" />
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
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  )
}
