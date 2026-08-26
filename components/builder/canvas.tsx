"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  NETWORK_DEVICE_STYLE,
  PcGlyph,
  SwitchGlyph,
  RouterGlyph,
  ServerGlyph,
} from "@/components/animations/network-device-icons"
import { CloudGlyph } from "@/components/animations/network-visual-primitives"
import { Link2, Trash2, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DynamicNode, DynamicLink } from "@/types/dynamic-animation"

interface CanvasProps {
  nodes: DynamicNode[]
  links: DynamicLink[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void
  onAddLink: (sourceId: string, targetId: string) => void
  onDeleteLink: (linkId: string) => void
  onDeleteNode: (nodeId: string) => void
}

export function Canvas({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onAddLink,
  onDeleteLink,
  onDeleteNode,
}: CanvasProps) {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Connecting and Dragging states
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null)
  const [dragNodeId, setDragNodeId] = useState<string | null>(null)

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string
    x: number
    y: number
  } | null>(null)

  const isLight = resolvedTheme === "light"
  const C = isLight
    ? {
        idle: "#94A3B8",
        active: "#2563EB",
        success: "#059669",
        warn: "#D97706",
        fg: "#0F172A",
        bg: "#E5EAF0",
      }
    : {
        idle: "#64748B",
        active: "#38BDF8",
        success: "#34D399",
        warn: "#FBBF24",
        fg: "#E5E7EB",
        bg: "#1F2937",
      }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null)
    window.addEventListener("click", handleGlobalClick)
    return () => window.removeEventListener("click", handleGlobalClick)
  }, [])

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))
  const handleZoomReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
    setZoom((z) => Math.min(2.5, Math.max(0.4, +(z * zoomFactor).toFixed(2))))
  }

  // Background Pan Handling
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      if (!connectingSourceId) {
        onSelectNode(null)
      }
      setContextMenu(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Pan canvas background
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    // 2. Drag node
    if (!dragNodeId || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()

    const x = Math.round(
      Math.max(40, Math.min(760, ((e.clientX - rect.left - pan.x) / zoom) * (800 / rect.width * zoom)))
    )
    const y = Math.round(
      Math.max(40, Math.min(420, ((e.clientY - rect.top - pan.y) / zoom) * (460 / rect.height * zoom)))
    )

    onUpdateNodePosition(dragNodeId, x, y)
  }

  const handlePointerUp = () => {
    setIsPanning(false)
    setDragNodeId(null)
  }

  // Node Drag Start or Node Target Click for Connection
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation()
    if (e.button === 2) return // Ignore right-click

    if (connectingSourceId) {
      if (connectingSourceId !== nodeId) {
        onAddLink(connectingSourceId, nodeId)
      }
      setConnectingSourceId(null)
      return
    }

    onSelectNode(nodeId)
    setDragNodeId(nodeId)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  // Right-Click Context Menu on Node
  const handleNodeContextMenu = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectNode(nodeId)

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setContextMenu({
        nodeId,
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      })
    }
  }

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

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={handleBackgroundPointerDown}
      className="relative flex flex-1 h-full w-full flex-col items-center justify-center overflow-hidden bg-background select-none cursor-crosshair"
    >
      {/* ── Active Connecting Mode Helper Banner ─────────────────── */}
      {connectingSourceId && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-6 top-6 z-30 flex items-center gap-3 rounded-xl border border-amber-500/50 bg-card/95 px-4 py-2 shadow-xl backdrop-blur-md animate-pulse"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Link2 className="h-4 w-4" />
            <span>Modo Conexión: Haz clic en el nodo destino</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setConnectingSourceId(null)
            }}
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        </div>
      )}

      {/* ── Zoom Controls Floating Bar ──────────────────────────── */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-6 top-6 z-10 flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 text-foreground"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="min-w-[42px] text-center font-mono text-xs font-semibold text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 text-foreground"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomReset}
          className="h-8 w-8 text-foreground"
          title="Restablecer vista"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── Context Menu (Right Click on Node) ───────────────────── */}
      {contextMenu && (
        <div
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 min-w-[180px] rounded-xl border border-border bg-card/98 p-1.5 shadow-2xl backdrop-blur-md text-xs"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/80 mb-1">
            Nodo: {nodeMap.get(contextMenu.nodeId)?.label || "Opciones"}
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              const sourceId = contextMenu.nodeId
              setContextMenu(null)
              setConnectingSourceId(sourceId)
              onSelectNode(sourceId)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-foreground hover:bg-accent transition-colors text-left font-medium cursor-pointer"
          >
            <Link2 className="h-3.5 w-3.5 text-primary" />
            <span>Conectar a otro nodo...</span>
          </button>
          <div className="border-t border-border my-1" />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNode(contextMenu.nodeId)
              setContextMenu(null)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left font-semibold cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Eliminar nodo</span>
          </button>
        </div>
      )}

      {/* ── SVG Canvas Board (Zoom & Pan Applied) ────────────────── */}
      <div className="relative h-full w-full overflow-hidden bg-card/20">
        <div className="absolute inset-0 bg-radial-grid opacity-30 pointer-events-none" />

        <svg
          ref={svgRef}
          viewBox="0 0 800 460"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.05s ease-out",
          }}
          className="relative h-full w-full select-none"
        >
          {/* Links */}
          {links.map((link) => {
            const source = nodeMap.get(link.source)
            const target = nodeMap.get(link.target)
            if (!source || !target) return null

            const midX = (source.x + target.x) / 2
            const midY = (source.y + target.y) / 2

            return (
              <g key={link.id} className="group cursor-pointer">
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={C.idle}
                  strokeWidth="2"
                  strokeDasharray={link.dashed ? "4 3" : undefined}
                />
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteLink(link.id)
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <circle r="12" fill={C.bg} stroke={C.idle} strokeWidth="1" />
                  <Trash2
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    className="text-destructive"
                  />
                </g>
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id
            const isConnecting = connectingSourceId === node.id
            const r = getNodeRadius(node.type)
            const labelY = getNodeLabelY(node.type)

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (connectingSourceId) {
                    if (connectingSourceId !== node.id) {
                      onAddLink(connectingSourceId, node.id)
                    }
                    setConnectingSourceId(null)
                    return
                  }
                  onSelectNode(node.id)
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Active Selection Ring */}
                {(isSelected || isConnecting) && (
                  <circle
                    r={r + 8}
                    fill="none"
                    stroke={isConnecting ? C.warn : C.active}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                )}

                {/* Node Background */}
                {node.type !== "cloud" && (
                  <circle
                    r={r}
                    fill={C.bg}
                    stroke={isSelected ? C.active : C.idle}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                  />
                )}

                {/* Glyph */}
                {renderNodeGlyph(node)}

                {/* Node Label */}
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

                {/* IP Pill if available */}
                {node.ip && (
                  <g transform={`translate(0, ${labelY + 16})`}>
                    <rect
                      x="-40"
                      y="-8"
                      width="80"
                      height="15"
                      rx="3"
                      fill={C.bg}
                      stroke={C.idle}
                      strokeWidth="0.8"
                    />
                    <text
                      textAnchor="middle"
                      y="3"
                      fill={C.fg}
                      fontSize="8"
                      fontFamily="var(--font-mono)"
                    >
                      {node.ip}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
