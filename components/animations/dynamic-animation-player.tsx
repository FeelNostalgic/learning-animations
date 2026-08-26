"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import gsap from "gsap"
import { useTheme } from "next-themes"
import { AnimatePresence } from "framer-motion"
import { useAnimationContext } from "./animation-player"
import {
  NETWORK_DEVICE_STYLE,
  PcGlyph,
  SwitchGlyph,
  RouterGlyph,
  ServerGlyph,
} from "./network-device-icons"
import { CloudGlyph, PacketPill } from "./network-visual-primitives"
import { NodeInfoCard, type NodeInfo } from "./node-info-card"
import { compileDynamicTimeline, type PaletteColors } from "@/lib/animations/dynamic-compiler"
import type { DynamicAnimationData, DynamicNode } from "@/types/dynamic-animation"

interface DynamicAnimationPlayerProps {
  animation: DynamicAnimationData
}

const VB = { w: 1280, h: 720 }

export function DynamicAnimationPlayer({ animation }: DynamicAnimationPlayerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { registerTimeline } = useAnimationContext()
  const { resolvedTheme } = useTheme()
  const [selectedNode, setSelectedNode] = useState<DynamicNode | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNodeEnter = useCallback((node: DynamicNode) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setSelectedNode(node)
  }, [])

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setSelectedNode(null), 180)
  }, [])

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  const C: PaletteColors = useMemo(
    () =>
      resolvedTheme === "light"
        ? {
            idle: "#94A3B8",
            active: "#2563EB",
            success: "#059669",
            warn: "#D97706",
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

  useEffect(() => {
    if (!svgRef.current) return
    const q = gsap.utils.selector(svgRef)

    const tl = compileDynamicTimeline(animation, q, C)
    registerTimeline(tl)

    return () => {
      tl.kill()
    }
  }, [animation, C, registerTimeline])

  const renderNodeGlyph = (node: DynamicNode) => {
    switch (node.type) {
      case "pc":
        return <PcGlyph stroke={C.fg} />
      case "switch":
        return <SwitchGlyph stroke={C.active} />
      case "router":
        return <RouterGlyph stroke={C.fg} />
      case "server":
        return <ServerGlyph stroke={C.fg} />
      case "cloud":
        return <CloudGlyph fill={C.bg} stroke={C.idle} />
      default:
        return <PcGlyph stroke={C.fg} />
    }
  }

  const getNodeRadius = (type: string) => {
    switch (type) {
      case "router":
        return NETWORK_DEVICE_STYLE.router.radius
      case "switch":
        return NETWORK_DEVICE_STYLE.switch.radius
      case "server":
        return NETWORK_DEVICE_STYLE.server.radius
      case "cloud":
        return 48
      case "pc":
      default:
        return NETWORK_DEVICE_STYLE.pc.radius
    }
  }

  const getNodeLabelY = (type: string) => {
    switch (type) {
      case "router":
        return NETWORK_DEVICE_STYLE.router.labelOffsetY
      case "switch":
        return NETWORK_DEVICE_STYLE.switch.labelOffsetY
      case "server":
        return NETWORK_DEVICE_STYLE.server.labelOffsetY
      case "cloud":
        return 64
      case "pc":
      default:
        return NETWORK_DEVICE_STYLE.pc.labelOffsetY
    }
  }

  const activeNodeInfo: NodeInfo | null = selectedNode
    ? {
        id: selectedNode.id,
        label: selectedNode.label,
        ip: selectedNode.ip,
        mask: selectedNode.mask,
        mac: selectedNode.mac,
        gateway: selectedNode.gateway,
      }
    : null

  const activeNodeRadius = selectedNode ? getNodeRadius(selectedNode.type) : 36

  return (
    <div className="relative h-full w-full">
      {/* ── Node Info Card Hover Overlay ───────────────────────── */}
      <AnimatePresence>
        {activeNodeInfo && selectedNode && (
          <NodeInfoCard
            node={activeNodeInfo}
            anchorX={selectedNode.x + activeNodeRadius}
            anchorY={selectedNode.y + activeNodeRadius}
            viewBoxW={VB.w}
            viewBoxH={VB.h}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          />
        )}
      </AnimatePresence>

      <svg
        ref={svgRef}
        viewBox="0 0 1280 720"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Links ────────────────────────────────────────────── */}
        {animation.links.map((link) => {
          const source = nodeMap.get(link.source)
          const target = nodeMap.get(link.target)
          if (!source || !target) return null

          return (
            <line
              key={link.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={C.idle}
              strokeWidth="1.5"
              strokeDasharray={link.dashed ? "4 3" : undefined}
            />
          )
        })}

        {/* ── Nodes ────────────────────────────────────────────── */}
        {animation.nodes.map((node) => {
          const r = getNodeRadius(node.type)
          const labelY = getNodeLabelY(node.type)

          return (
            <g
              key={node.id}
              id={`node-${node.id}`}
              onMouseEnter={() => handleNodeEnter(node)}
              onMouseLeave={scheduleHide}
              className="cursor-pointer"
            >
              {/* Pulse Ring */}
              <circle
                className="ring"
                r={r + 14}
                fill="none"
                stroke={C.active}
                strokeWidth="1"
                opacity="0"
              />
              {/* Node Circle Background */}
              {node.type !== "cloud" && (
                <circle
                  className="node-circle"
                  r={r}
                  fill={C.bg}
                  stroke={C.idle}
                  strokeWidth="1.5"
                />
              )}
              {/* Glyph Icon */}
              {renderNodeGlyph(node)}
              {/* Label */}
              <text
                y={labelY}
                textAnchor="middle"
                fill={C.fg}
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                {node.label}
              </text>
              {/* Badge Overlay */}
              <g id={`badge-${node.id}`} pointerEvents="none" opacity="0">
                <rect x="-30" y="-56" width="60" height="18" rx="4" fill={C.warn} />
                <text
                  y="-43"
                  textAnchor="middle"
                  fill={C.warnText}
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  ACTIVO
                </text>
              </g>
            </g>
          )
        })}

        {/* ── Tooltips ─────────────────────────────────────────── */}
        {allActions
          .filter((a) => a.type === "tooltip")
          .map((action) => {
            const target = action.targetId ? nodeMap.get(action.targetId) : null
            const x = target ? target.x : 400
            const y = target ? target.y - 70 : 200

            return (
              <g
                key={action.id}
                id={`tooltip-${action.id}`}
                pointerEvents="none"
                transform={`translate(${x}, ${y})`}
                opacity="0"
              >
                <rect
                  x="-120"
                  y="-24"
                  width="240"
                  height={action.subText ? 44 : 32}
                  rx="8"
                  fill={C.bg}
                  stroke={action.color ? C[action.color] : C.active}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="-6"
                  textAnchor="middle"
                  fill={action.color ? C[action.color] : C.fg}
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {action.text || "INFO"}
                </text>
                {action.subText && (
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill={C.subText}
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                  >
                    {action.subText}
                  </text>
                )}
              </g>
            )
          })}

        {/* ── Packets ──────────────────────────────────────────── */}
        {allActions
          .filter((a) => a.type === "packet")
          .map((action) => {
            const colorKey = action.color || "active"
            const fill = C[colorKey] || C.active
            const textColor =
              colorKey === "warn" ? C.warnText : colorKey === "success" ? C.successText : "#FFFFFF"

            return (
              <g
                key={action.id}
                id={`pkt-${action.id}`}
                className="packet"
                pointerEvents="none"
                opacity="0"
              >
                <PacketPill
                  label={action.text || "DATA"}
                  fill={fill}
                  textColor={textColor}
                  width={68}
                  height={22}
                />
              </g>
            )
          })}
      </svg>
    </div>
  )
}
