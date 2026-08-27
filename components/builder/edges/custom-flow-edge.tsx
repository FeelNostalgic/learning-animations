"use client"

import React, { memo, useCallback, useRef } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react"
import { sampleConnectorPoints } from "@/lib/animations/universal-compiler"

export const CustomFlowEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    markerStart,
    data,
    label,
    selected,
  }: EdgeProps) => {
    const { setEdges } = useReactFlow()
    const isDraggingRef = useRef(false)

    const connectorType = (data?.connectorType as string) || "bezier"
    const labelPos = data?.labelPosition !== undefined ? (data.labelPosition as number) : 0.5
    const showLabel = data?.showLabel !== false && Boolean(label || data?.rawLabel)
    const displayLabel = (typeof label === "string" ? label : data?.rawLabel) as string

    // 1. Calculate path based on connector type
    let edgePath = ""
    let defaultLabelX = (sourceX + targetX) / 2
    let defaultLabelY = (sourceY + targetY) / 2

    if (connectorType === "straight") {
      const [path, lx, ly] = getStraightPath({ sourceX, sourceY, targetX, targetY })
      edgePath = path
      defaultLabelX = lx
      defaultLabelY = ly
    } else if (connectorType === "orthogonal") {
      const [path, lx, ly] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      })
      edgePath = path
      defaultLabelX = lx
      defaultLabelY = ly
    } else {
      const [path, lx, ly] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      })
      edgePath = path
      defaultLabelX = lx
      defaultLabelY = ly
    }

    // Sample waypoints along the curve to accurately position the label at labelPos (0.05 to 0.95)
    const waypoints = sampleConnectorPoints(
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
      connectorType as any,
      20
    )
    const waypointIdx = Math.min(
      waypoints.length - 1,
      Math.max(0, Math.round(labelPos * (waypoints.length - 1)))
    )
    const labelCoord = waypoints[waypointIdx] || { x: defaultLabelX, y: defaultLabelY }

    // Pointer DnD handler for dragging label along the curve
    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.stopPropagation()
        isDraggingRef.current = true
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      },
      []
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return
        e.stopPropagation()

        // Calculate projection distance from source (sourceX, sourceY) to target (targetX, targetY)
        const totalDx = targetX - sourceX
        const totalDy = targetY - sourceY
        const totalDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy)
        if (totalDist < 10) return

        // Vector from source to current pointer
        const ptrDx = e.clientX - sourceX
        const ptrDy = e.clientY - sourceY

        // Scalar projection t = (ptr . total) / (totalDist^2)
        const dot = ptrDx * totalDx + ptrDy * totalDy
        let t = dot / (totalDist * totalDist)
        t = Math.max(0.08, Math.min(0.92, +t.toFixed(2)))

        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === id
              ? {
                  ...edge,
                  data: {
                    ...edge.data,
                    labelPosition: t,
                  },
                }
              : edge
          )
        )
      },
      [id, setEdges, sourceX, sourceY, targetX, targetY]
    )

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      isDraggingRef.current = false
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }, [])

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          markerStart={markerStart}
          style={{
            ...style,
            stroke: selected ? "var(--primary)" : style?.stroke || "#0070F3",
            strokeWidth: selected ? 3.5 : style?.strokeWidth || 2,
          }}
        />

        {showLabel && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelCoord.x}px,${labelCoord.y}px)`,
                pointerEvents: "all",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`nodrag nopan nowheel select-none cursor-grab active:cursor-grabbing rounded-md border bg-card/95 px-2 py-0.5 font-mono text-[10px] font-bold shadow-md transition-shadow backdrop-blur-md ${
                selected ? "border-primary text-primary ring-1 ring-primary" : "border-border text-foreground"
              }`}
              title="Arrastra para mover la etiqueta a lo largo de la línea"
            >
              {displayLabel}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  }
)

CustomFlowEdge.displayName = "CustomFlowEdge"
