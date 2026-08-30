"use client"

import React, { useState } from "react"
import {
  Palette,
  Spline,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
  Sparkles,
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { hexToRgba, parseColorAlpha } from "@/lib/utils/color-alpha"
import type { UniversalNode } from "@/types/universal-animation"
import type { Edge } from "@xyflow/react"

interface FloatingPropertyPanelProps {
  selectedNode: UniversalNode | null
  onUpdateNode: (node: UniversalNode) => void
  onDeleteNode: (nodeId: string) => void
  selectedEdge: Edge | null
  onUpdateEdge: (edge: Edge) => void
  onDeleteEdge: (edgeId: string) => void
  onClose: () => void
}

export function FloatingPropertyPanel({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: FloatingPropertyPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!selectedNode && !selectedEdge) return null

  // ── Node Color & Alpha Calculations ──────────────────────────────
  const fillParsed = selectedNode ? parseColorAlpha(selectedNode.fill) : { hex: "#1E293B", alpha: 1, isTransparent: false }
  const strokeParsed = selectedNode ? parseColorAlpha(selectedNode.stroke) : { hex: "#0070F3", alpha: 1, isTransparent: false }

  const handleNodeFillHexChange = (hex: string) => {
    if (!selectedNode) return
    const alpha = fillParsed.isTransparent ? 1 : fillParsed.alpha
    onUpdateNode({ ...selectedNode, fill: hexToRgba(hex, alpha) })
  }

  const handleNodeFillAlphaChange = (alpha: number) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, fill: hexToRgba(fillParsed.hex, alpha) })
  }

  const handleToggleTransparentFill = () => {
    if (!selectedNode) return
    if (fillParsed.isTransparent) {
      onUpdateNode({ ...selectedNode, fill: hexToRgba(fillParsed.hex || "#1E293B", 1) })
    } else {
      onUpdateNode({ ...selectedNode, fill: "transparent" })
    }
  }

  const handleNodeStrokeHexChange = (hex: string) => {
    if (!selectedNode) return
    const alpha = strokeParsed.isTransparent ? 1 : strokeParsed.alpha
    onUpdateNode({ ...selectedNode, stroke: hexToRgba(hex, alpha) })
  }

  const handleNodeStrokeAlphaChange = (alpha: number) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, stroke: hexToRgba(strokeParsed.hex, alpha) })
  }

  const handleToggleTransparentStroke = () => {
    if (!selectedNode) return
    if (strokeParsed.isTransparent) {
      onUpdateNode({ ...selectedNode, stroke: hexToRgba(strokeParsed.hex || "#0070F3", 1) })
    } else {
      onUpdateNode({ ...selectedNode, stroke: "transparent" })
    }
  }

  // ── Edge Calculations ───────────────────────────────────────────
  const edgeData = (selectedEdge?.data || {}) as Record<string, any>
  const edgeConnectorType = edgeData.connectorType || selectedEdge?.type || "smoothstep"
  const edgeDirected = edgeData.directed || (selectedEdge?.markerEnd ? "forward" : "none")
  const edgeDashed = edgeData.dashed ?? Boolean(selectedEdge?.animated)
  const edgeStrokeColor = (selectedEdge?.style?.stroke as string) || "#0070F3"
  const edgeStrokeWidth = (selectedEdge?.style?.strokeWidth as number) || 2
  const edgeLabel = typeof selectedEdge?.label === "string" ? selectedEdge.label : ""
  const edgeShowLabel = edgeData.showLabel !== false
  const edgeLabelPos = edgeData.labelPosition !== undefined ? edgeData.labelPosition : 0.5

  const handleEdgeTypeChange = (newType: "bezier" | "straight" | "orthogonal") => {
    if (!selectedEdge) return
    const rfType = newType === "straight" ? "straight" : newType === "orthogonal" ? "step" : "smoothstep"
    onUpdateEdge({
      ...selectedEdge,
      type: rfType,
      data: {
        ...edgeData,
        connectorType: newType,
      },
    })
  }

  const handleEdgeDirectedChange = (dir: "none" | "forward" | "backward" | "bidirectional") => {
    if (!selectedEdge) return
    const hasEndArrow = dir === "forward" || dir === "bidirectional"
    const hasStartArrow = dir === "backward" || dir === "bidirectional"

    onUpdateEdge({
      ...selectedEdge,
      markerEnd: hasEndArrow ? { type: "arrowclosed" as any, color: edgeStrokeColor } : undefined,
      markerStart: hasStartArrow ? { type: "arrowclosed" as any, color: edgeStrokeColor } : undefined,
      data: {
        ...edgeData,
        directed: dir,
      },
    })
  }

  const handleEdgeDashedChange = (isDashed: boolean) => {
    if (!selectedEdge) return
    onUpdateEdge({
      ...selectedEdge,
      animated: isDashed,
      style: {
        ...selectedEdge.style,
        strokeDasharray: isDashed ? "6 6" : undefined,
      },
      data: {
        ...edgeData,
        dashed: isDashed,
      },
    })
  }

  const handleEdgeColorChange = (color: string) => {
    if (!selectedEdge) return
    const hasEndArrow = edgeDirected === "forward" || edgeDirected === "bidirectional"
    const hasStartArrow = edgeDirected === "backward" || edgeDirected === "bidirectional"

    onUpdateEdge({
      ...selectedEdge,
      style: {
        ...selectedEdge.style,
        stroke: color,
      },
      markerEnd: hasEndArrow ? { type: "arrowclosed" as any, color } : undefined,
      markerStart: hasStartArrow ? { type: "arrowclosed" as any, color } : undefined,
    })
  }

  const handleEdgeStrokeWidthChange = (width: number) => {
    if (!selectedEdge) return
    onUpdateEdge({
      ...selectedEdge,
      style: {
        ...selectedEdge.style,
        strokeWidth: width,
      },
    })
  }

  const handleEdgeLabelChange = (text: string) => {
    if (!selectedEdge) return
    onUpdateEdge({
      ...selectedEdge,
      label: edgeShowLabel && text ? text : undefined,
      data: {
        ...edgeData,
        rawLabel: text,
      },
    })
  }

  const handleEdgeToggleShowLabel = () => {
    if (!selectedEdge) return
    const nextShow = !edgeShowLabel
    onUpdateEdge({
      ...selectedEdge,
      label: nextShow ? edgeData.rawLabel || edgeLabel : undefined,
      data: {
        ...edgeData,
        showLabel: nextShow,
      },
    })
  }

  const handleEdgeLabelPositionChange = (pos: number) => {
    if (!selectedEdge) return
    onUpdateEdge({
      ...selectedEdge,
      data: {
        ...edgeData,
        labelPosition: pos,
      },
    })
  }

  return (
    <div className="absolute top-3 left-3 z-30 w-84 max-h-[calc(100%-24px)] flex flex-col rounded-2xl border border-border/90 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden select-none transition-all">
      {/* ── Panel Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5 bg-muted/40">
        <div className="flex items-center gap-2 truncate">
          {selectedNode ? (
            <Palette className="size-4 text-primary shrink-0" />
          ) : (
            <Spline className="size-4 text-primary shrink-0" />
          )}
          <span className="text-xs font-bold text-foreground truncate">
            {selectedNode ? selectedNode.label || "Propiedades del nodo" : "Propiedades de conexión"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer"
            title={isMinimized ? "Expandir panel" : "Minimizar panel"}
          >
            {isMinimized ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Cerrar panel"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Panel Content ────────────────────────────────────────── */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          {/* ══════════════════ NODE INSPECTOR ══════════════════ */}
          {selectedNode && (
            <>
              {/* Label */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Etiqueta / nombre
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Background Fill & Alpha Channel */}
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Fondo (relleno)
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleTransparentFill}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border transition-all ${
                      fillParsed.isTransparent
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                      {fillParsed.isTransparent ? "Transparente ✓" : "Hacer transparente"}
                  </button>
                </div>

                {!fillParsed.isTransparent && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fillParsed.hex}
                        onChange={(e) => handleNodeFillHexChange(e.target.value)}
                        className="h-7 w-10 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-foreground font-semibold">{fillParsed.hex}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                        <span>Opacidad fondo (alpha)</span>
                        <span>{Math.round(fillParsed.alpha * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={fillParsed.alpha}
                        onChange={(e) => handleNodeFillAlphaChange(parseFloat(e.target.value))}
                        className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Border Stroke & Alpha Channel */}
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Borde (trazo)
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleTransparentStroke}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border transition-all ${
                      strokeParsed.isTransparent
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                      {strokeParsed.isTransparent ? "Transparente ✓" : "Hacer transparente"}
                  </button>
                </div>

                {!strokeParsed.isTransparent && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strokeParsed.hex}
                        onChange={(e) => handleNodeStrokeHexChange(e.target.value)}
                        className="h-7 w-10 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-foreground font-semibold">{strokeParsed.hex}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                        <span>Opacidad borde (alpha)</span>
                        <span>{Math.round(strokeParsed.alpha * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={strokeParsed.alpha}
                        onChange={(e) => handleNodeStrokeAlphaChange(parseFloat(e.target.value))}
                        className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Stroke Width */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground mb-1">
                    <span>Grosor del borde</span>
                    <span>{selectedNode.strokeWidth ?? 2}px</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      value={selectedNode.strokeWidth ?? 2}
                      onChange={(e) =>
                        onUpdateNode({ ...selectedNode, strokeWidth: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateNode({
                          ...selectedNode,
                          strokeWidth: selectedNode.strokeWidth === 0 ? 2 : 0,
                        })
                      }
                      className={`text-[9px] px-2 py-1 rounded-md font-semibold border ${
                        selectedNode.strokeWidth === 0
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      0px
                    </button>
                  </div>
                </div>
              </div>

              {/* Dimensions: Width & Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="1200"
                    value={selectedNode.width || 100}
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, width: parseInt(e.target.value) || 100 })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="1200"
                    value={selectedNode.height || 60}
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, height: parseInt(e.target.value) || 60 })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Image node specific */}
              {selectedNode.type === "image" && (
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Ajuste de imagen
                  </label>
                  <select
                    value={selectedNode.imageFit || "contain"}
                    onChange={(e) => onUpdateNode({ ...selectedNode, imageFit: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="contain">Contener (Contain)</option>
                    <option value="cover">Cubrir (Cover)</option>
                    <option value="fill">Rellenar (Fill)</option>
                  </select>
                </div>
              )}

              {/* Delete Node Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  className="w-full h-8 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Eliminar nodo
                </Button>
              </div>
            </>
          )}

          {/* ══════════════════ EDGE INSPECTOR ══════════════════ */}
          {selectedEdge && (
            <>
              {/* Line Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tipo de trazado
                </label>
                <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg">
                  <button
                    onClick={() => handleEdgeTypeChange("bezier")}
                    className={`py-1 text-[10px] font-semibold rounded transition-all ${
                      edgeConnectorType === "bezier" || edgeConnectorType === "smoothstep"
                        ? "bg-card text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bézier
                  </button>
                  <button
                    onClick={() => handleEdgeTypeChange("straight")}
                    className={`py-1 text-[10px] font-semibold rounded transition-all ${
                      edgeConnectorType === "straight"
                        ? "bg-card text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Recta
                  </button>
                  <button
                    onClick={() => handleEdgeTypeChange("orthogonal")}
                    className={`py-1 text-[10px] font-semibold rounded transition-all ${
                      edgeConnectorType === "orthogonal" || edgeConnectorType === "step"
                        ? "bg-card text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Ortogonal
                  </button>
                </div>
              </div>

              {/* Arrow Direction */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Dirección de flecha
                </label>
                <div className="grid grid-cols-4 gap-1 bg-muted/60 p-1 rounded-lg">
                  <button
                    onClick={() => handleEdgeDirectedChange("none")}
                    className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
                      edgeDirected === "none" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Sin flecha"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdgeDirectedChange("forward")}
                    className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
                      edgeDirected === "forward" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Flecha adelante"
                  >
                    <ArrowRight className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdgeDirectedChange("backward")}
                    className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
                      edgeDirected === "backward" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Flecha atrás"
                  >
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdgeDirectedChange("bidirectional")}
                    className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
                      edgeDirected === "bidirectional"
                        ? "bg-card text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Bidireccional"
                  >
                    <ArrowLeftRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Color & Stroke Width */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Color de línea</label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="color"
                      value={edgeStrokeColor.startsWith("#") ? edgeStrokeColor : "#0070F3"}
                      onChange={(e) => handleEdgeColorChange(e.target.value)}
                      className="h-6 w-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[10px] text-muted-foreground truncate">{edgeStrokeColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Grosor de trazo</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={edgeStrokeWidth}
                    onChange={(e) => handleEdgeStrokeWidthChange(parseFloat(e.target.value) || 1)}
                    className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Dashed line */}
              <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-2 cursor-pointer">
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Línea discontinua / animada</span>
                </div>
                <input
                  type="checkbox"
                  checked={edgeDashed}
                  onChange={(e) => handleEdgeDashedChange(e.target.checked)}
                  className="rounded text-primary"
                />
              </label>

              {/* Label & Label Position Along Curve */}
              <div className="space-y-1.5 border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Etiqueta / nombre
                  </label>
                  <button
                    onClick={handleEdgeToggleShowLabel}
                    className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {edgeShowLabel ? <Eye className="size-3 text-emerald-500" /> : <EyeOff className="size-3" />}
                    <span>{edgeShowLabel ? "Visible" : "Oculto"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={edgeData.rawLabel ?? edgeLabel}
                  onChange={(e) => handleEdgeLabelChange(e.target.value)}
                  placeholder="Ej. Petición ARP, Flujo..."
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />

                {/* Slider for label position along curve */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sliders className="size-2.5 text-primary" />
                      Posición en la línea (DnD interactivo)
                    </span>
                    <span>{Math.round(edgeLabelPos * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.92"
                    step="0.02"
                    value={edgeLabelPos}
                    onChange={(e) => handleEdgeLabelPositionChange(parseFloat(e.target.value))}
                    className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Delete Edge Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteEdge(selectedEdge.id)}
                  className="w-full h-8 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Eliminar conexión
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
