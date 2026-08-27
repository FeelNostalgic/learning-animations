"use client"

import React, { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { nodeTypes } from "./nodes"
import { useTheme } from "next-themes"

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
}: CanvasProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectNode(node.id)
    },
    [onSelectNode]
  )

  const handlePaneClick = useCallback(() => {
    onSelectNode(null)
  }, [onSelectNode])

  // Custom node color for MiniMap
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case "math":
        return "#0070F3"
      case "shape":
        return "#10B981"
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
    <div className="relative h-full w-full bg-background overflow-hidden select-none">
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
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
    </div>
  )
}
