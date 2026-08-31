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
  const fillParsed = selectedNode
    ? parseColorAlpha(selectedNode.fill, "#1E293B")
    : { hex: "#1E293B", alpha: 1, isTransparent: false }
  const strokeParsed = selectedNode
    ? parseColorAlpha(selectedNode.stroke, "#0070F3")
    : { hex: "#0070F3", alpha: 1, isTransparent: false }

  const handleNodeFillHexChange = (hex: string) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, fill: hexToRgba(hex, fillParsed.alpha) })
  }

  const handleNodeFillAlphaChange = (alpha: number) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, fill: hexToRgba(fillParsed.hex || "#1E293B", alpha) })
  }

  const handleNodeStrokeHexChange = (hex: string) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, stroke: hexToRgba(hex, strokeParsed.alpha) })
  }

  const handleNodeStrokeAlphaChange = (alpha: number) => {
    if (!selectedNode) return
    onUpdateNode({ ...selectedNode, stroke: hexToRgba(strokeParsed.hex || "#0070F3", alpha) })
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
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Fondo (relleno)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {Math.round(fillParsed.alpha * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillParsed.hex}
                    onChange={(e) => handleNodeFillHexChange(e.target.value)}
                    className="h-7 w-10 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-foreground font-semibold uppercase">
                    {fillParsed.hex}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Opacidad</span>
                    <span>{Math.round(fillParsed.alpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fillParsed.alpha}
                    onChange={(e) => handleNodeFillAlphaChange(parseFloat(e.target.value))}
                    className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Border Stroke & Alpha Channel */}
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Borde (trazo)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {Math.round(strokeParsed.alpha * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeParsed.hex}
                    onChange={(e) => handleNodeStrokeHexChange(e.target.value)}
                    className="h-7 w-10 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-foreground font-semibold uppercase">
                    {strokeParsed.hex}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Opacidad</span>
                    <span>{Math.round(strokeParsed.alpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={strokeParsed.alpha}
                    onChange={(e) => handleNodeStrokeAlphaChange(parseFloat(e.target.value))}
                    className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                  />
                </div>

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

              {/* Math & Text Node Header & Formatting Controls */}
              {(selectedNode.type === "math" || selectedNode.type === "text") && (
                <div className="space-y-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Mostrar cabecera / título
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentProps = (selectedNode.props as Record<string, any>) || {}
                        const nextShow = currentProps.showHeader === false ? true : false
                        onUpdateNode({
                          ...selectedNode,
                          props: { ...currentProps, showHeader: nextShow },
                        })
                      }}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                        selectedNode.props?.showHeader !== false
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {selectedNode.props?.showHeader !== false ? "Visible" : "Oculto"}
                    </button>
                  </div>

                  {selectedNode.type === "text" && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Alineación de texto
                        </label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          {(["left", "center", "right"] as const).map((aln) => (
                            <button
                              key={aln}
                              type="button"
                              onClick={() => {
                                const currentProps = (selectedNode.props as Record<string, any>) || {}
                                onUpdateNode({
                                  ...selectedNode,
                                  props: { ...currentProps, align: aln },
                                })
                              }}
                              className={`py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer capitalize ${
                                (selectedNode.props?.align || "left") === aln
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {aln === "left" ? "Izquierda" : aln === "center" ? "Centro" : "Derecha"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Comportamiento de desbordamiento
                        </label>
                        <select
                          value={selectedNode.props?.overflow || "hidden"}
                          onChange={(e) => {
                            const currentProps = (selectedNode.props as Record<string, any>) || {}
                            onUpdateNode({
                              ...selectedNode,
                              props: { ...currentProps, overflow: e.target.value },
                            })
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="hidden">Recortar exceso (Oculto)</option>
                          <option value="visible">Sin recorte (Visible)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

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

              {/* Interactive slider inspector */}
              {selectedNode.type === "interactive_slider" && (
                <div className="space-y-2 border-t border-border pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Slider interactivo
                  </label>
                  <div>
                    <label htmlFor="slider-variable" className="text-[10px] font-medium text-muted-foreground">
                      Variable
                    </label>
                    <input
                      id="slider-variable"
                      type="text"
                      value={(selectedNode.props as Record<string, unknown>)?.variableName as string || ""}
                      onChange={(e) =>
                        onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), variableName: e.target.value } })
                      }
                      placeholder="x"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="slider-min" className="text-[10px] font-medium text-muted-foreground">
                        Min
                      </label>
                      <input
                        id="slider-min"
                        type="number"
                        value={(selectedNode.props as Record<string, unknown>)?.min as number ?? 0}
                        onChange={(e) =>
                          onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), min: parseFloat(e.target.value) || 0 } })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="slider-max" className="text-[10px] font-medium text-muted-foreground">
                        Max
                      </label>
                      <input
                        id="slider-max"
                        type="number"
                        value={(selectedNode.props as Record<string, unknown>)?.max as number ?? 100}
                        onChange={(e) =>
                          onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), max: parseFloat(e.target.value) || 0 } })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Step</label>
                      <input
                        type="number"
                        step="0.1"
                        value={(selectedNode.props as Record<string, unknown>)?.step as number ?? 1}
                        onChange={(e) =>
                          onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), step: parseFloat(e.target.value) || 1 } })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Valor por defecto</label>
                      <input
                        type="number"
                        value={(selectedNode.props as Record<string, unknown>)?.defaultValue as number ?? 50}
                        onChange={(e) =>
                          onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), defaultValue: parseFloat(e.target.value) || 0 } })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Unidad (opcional)</label>
                    <input
                      type="text"
                      value={(selectedNode.props as Record<string, unknown>)?.unit as string || ""}
                      onChange={(e) =>
                        onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), unit: e.target.value } })
                      }
                      placeholder="m/s"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Interactive quiz inspector */}
              {selectedNode.type === "interactive_quiz" && (
                <div className="space-y-2 border-t border-border pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quiz interactivo</label>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Pregunta</label>
                    <input
                      type="text"
                      value={(selectedNode.props as Record<string, unknown>)?.question as string || ""}
                      onChange={(e) =>
                        onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), question: e.target.value } })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Tipo</label>
                    <div className="grid grid-cols-2 gap-1 mt-1 bg-muted/60 p-1 rounded-lg">
                      {(["single", "multi"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), quizType: t } })}
                          className={`py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                            ((selectedNode.props as Record<string, unknown>)?.quizType as string || "single") === t
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {t === "single" ? "Single" : "Multi"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Opciones</label>
                    {(((selectedNode.props as Record<string, unknown>)?.options as unknown[]) || []).map((opt: unknown, idx: number) => {
                      const o = opt as Record<string, unknown>
                      return (
                        <div key={(o.id as string) || idx} className="flex items-center gap-1 rounded-md border border-border p-1">
                          <input
                            type="text"
                            value={(o.text as string) || ""}
                            onChange={(e) => {
                              const opts = [...(((selectedNode.props as Record<string, unknown>)?.options as unknown[]) || [])] as Record<string, unknown>[]
                              opts[idx] = { ...o, text: e.target.value }
                              onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), options: opts } })
                            }}
                            placeholder="Texto"
                            className="flex-1 rounded border border-border px-1 py-0.5 text-xs focus:outline-none"
                          />
                          <label className="flex items-center gap-1 text-[10px]">
                            <input
                              type="checkbox"
                              checked={Boolean(o.isCorrect)}
                              onChange={(e) => {
                                const opts = [...(((selectedNode.props as Record<string, unknown>)?.options as unknown[]) || [])] as Record<string, unknown>[]
                                opts[idx] = { ...o, isCorrect: e.target.checked }
                                onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), options: opts } })
                              }}
                            />
                            Correcta
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const opts = [...(((selectedNode.props as Record<string, unknown>)?.options as unknown[]) || [])]
                              opts.splice(idx, 1)
                              onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), options: opts } })
                            }}
                            className="px-1 text-destructive text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const opts = [...(((selectedNode.props as Record<string, unknown>)?.options as unknown[]) || [])] as Record<string, unknown>[]
                        opts.push({ id: `opt-${Date.now()}`, text: "Nueva opción", isCorrect: false, feedback: "Feedback" })
                        onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), options: opts } })
                      }}
                      className="w-full rounded-md border border-dashed border-border py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Añadir opción
                    </button>
                  </div>
                  <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-2 cursor-pointer">
                    <span className="text-xs font-medium text-foreground">Bloquea avance</span>
                    <input
                      type="checkbox"
                      checked={Boolean((selectedNode.props as Record<string, unknown>)?.blocksNextStep ?? true)}
                      onChange={(e) => onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), blocksNextStep: e.target.checked } })}
                    />
                  </label>
                </div>
              )}

              {/* Interactive branch inspector */}
              {selectedNode.type === "interactive_branch" && (
                <div className="space-y-2 border-t border-border pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Branch interactivo</label>
                  <div className="space-y-1">
                    {(((selectedNode.props as Record<string, unknown>)?.choices as unknown[]) || []).map((choice: unknown, idx: number) => {
                      const c = choice as Record<string, unknown>
                      return (
                        <div key={(c.id as string) || idx} className="grid grid-cols-2 gap-1 rounded-md border border-border p-1">
                          <input
                            type="text"
                            value={(c.label as string) || ""}
                            onChange={(e) => {
                              const choices = [...(((selectedNode.props as Record<string, unknown>)?.choices as unknown[]) || [])] as Record<string, unknown>[]
                              choices[idx] = { ...c, label: e.target.value }
                              onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), choices } })
                            }}
                            placeholder="Etiqueta"
                            className="rounded border border-border px-1 py-0.5 text-xs focus:outline-none"
                          />
                          <input
                            type="text"
                            value={(c.targetStepId as string) || ""}
                            onChange={(e) => {
                              const choices = [...(((selectedNode.props as Record<string, unknown>)?.choices as unknown[]) || [])] as Record<string, unknown>[]
                              choices[idx] = { ...c, targetStepId: e.target.value }
                              onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), choices } })
                            }}
                            placeholder="targetStepId"
                            className="rounded border border-border px-1 py-0.5 text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const choices = [...(((selectedNode.props as Record<string, unknown>)?.choices as unknown[]) || [])]
                              choices.splice(idx, 1)
                              onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), choices } })
                            }}
                            className="col-span-2 text-xs text-destructive"
                          >
                            Eliminar
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const choices = [...(((selectedNode.props as Record<string, unknown>)?.choices as unknown[]) || [])] as Record<string, unknown>[]
                        choices.push({ id: `ch-${Date.now()}`, label: "Nueva opción", targetStepId: "step-2" })
                        onUpdateNode({ ...selectedNode, props: { ...(selectedNode.props as object), choices } })
                      }}
                      className="w-full rounded-md border border-dashed border-border py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Añadir opción
                    </button>
                  </div>
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
