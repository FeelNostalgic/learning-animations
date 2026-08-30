"use client"

import React from "react"
import type { Node, Edge } from "@xyflow/react"
import type { UniversalStep, UniversalNode, UniversalConnector } from "@/types/universal-animation"
import { computeConnectorPathData, getOptimalAnchorPair } from "@/lib/animations/connector-geometry"

import { sampleConnectorPoints } from "@/lib/animations/universal-compiler"

interface PacketParticleOverlayProps {
  step?: UniversalStep
  nodes?: Node[]
  edges?: Edge[]
  universalNodes?: UniversalNode[]
  universalConnectors?: UniversalConnector[]
  progress: number // 0 to 1
  isPlaying: boolean
}

export function PacketParticleOverlay({
  step,
  nodes,
  edges,
  universalNodes,
  universalConnectors,
  progress,
  isPlaying,
}: PacketParticleOverlayProps) {
  if (!isPlaying || !step || !step.actions) return null

  const packetActions = step.actions.filter((a) => a.type === "packet")
  if (packetActions.length === 0) return null

  // Build standardized node map
  const uNodeMap = new Map<string, UniversalNode>()
  if (universalNodes) {
    universalNodes.forEach((n) => uNodeMap.set(n.id, n))
  } else if (nodes) {
    nodes.forEach((n) => {
      uNodeMap.set(n.id, {
        id: n.id,
        type: (n.type as any) || "shape",
        label: (n.data?.label as string) || "",
        x: n.position.x,
        y: n.position.y,
        width: n.style?.width ? Number(n.style.width) : (n.data?.width as number) || 100,
        height: n.style?.height ? Number(n.style.height) : (n.data?.height as number) || 60,
      })
    })
  }

  // Build standardized connector list
  const uConnectors: UniversalConnector[] = []
  if (universalConnectors) {
    uConnectors.push(...universalConnectors)
  } else if (edges) {
    edges.forEach((e) => {
      uConnectors.push({
        id: e.id,
        sourceId: e.source,
        targetId: e.target,
        type: (e.data?.connectorType as any) || (e.type === "straight" ? "straight" : "bezier"),
        directed: (e.data?.directed as any) || "forward",
      })
    })
  }

  const connectorMap = new Map<string, UniversalConnector>()
  uConnectors.forEach((c) => {
    connectorMap.set(c.id, c)
    connectorMap.set(`${c.sourceId}->${c.targetId}`, c)
    connectorMap.set(`${c.targetId}->${c.sourceId}`, c)
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {packetActions.map((act) => {
        let conn: UniversalConnector | undefined = act.connectorId ? connectorMap.get(act.connectorId) : undefined
        if (!conn && act.fromId && act.toId) {
          conn = connectorMap.get(`${act.fromId}->${act.toId}`)
        }

        if (!conn) return null

        const srcNode = uNodeMap.get(conn.sourceId)
        const tgtNode = uNodeMap.get(conn.targetId)
        if (!srcNode || !tgtNode) return null

        const { sourcePoint, targetPoint } = getOptimalAnchorPair(srcNode, tgtNode)
        const connType = conn.type || "bezier"

        // Sample exact waypoints along the connector curve
        const waypoints = sampleConnectorPoints(sourcePoint, targetPoint, connType as any, 100)
        const t = Math.max(0, Math.min(1, progress))
        const waypointIdx = Math.min(
          waypoints.length - 1,
          Math.max(0, Math.round(t * (waypoints.length - 1)))
        )
        const coord = waypoints[waypointIdx] || sourcePoint

        const packetColor = act.color || "#3B82F6"

        return (
          <div
            key={act.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xl transition-transform duration-75 border border-white/30"
            style={{
              left: `${coord.x}px`,
              top: `${coord.y}px`,
              backgroundColor: packetColor,
            }}
          >
            <span>📦</span>
            <span>{act.text || "Paquete"}</span>
          </div>
        )
      })}
    </div>
  )
}
