"use client"

import React from "react"
import {
  Trash2,
  Spline,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Edge } from "@xyflow/react"

interface EdgeInspectorProps {
  edge: Edge | null
  onUpdateEdge: (updatedEdge: Edge) => void
  onDeleteEdge: (edgeId: string) => void
  onClose: () => void
}

export function EdgeInspector({
  edge,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: EdgeInspectorProps) {
  if (!edge) return null

  const data = (edge.data || {}) as Record<string, any>
  const connectorType = data.connectorType || edge.type || "smoothstep"
  const directed = data.directed || (edge.markerEnd ? "forward" : "none")
  const dashed = data.dashed ?? Boolean(edge.animated)
  const strokeColor = (edge.style?.stroke as string) || "#0070F3"
  const strokeWidth = (edge.style?.strokeWidth as number) || 2
  const label = typeof edge.label === "string" ? edge.label : ""
  const showLabel = data.showLabel !== false

  const handleTypeChange = (newType: "bezier" | "straight" | "orthogonal") => {
    const rfType = newType === "straight" ? "straight" : newType === "orthogonal" ? "step" : "smoothstep"
    onUpdateEdge({
      ...edge,
      type: rfType,
      data: {
        ...data,
        connectorType: newType,
      },
    })
  }

  const handleDirectedChange = (dir: "none" | "forward" | "backward" | "bidirectional") => {
    const hasEndArrow = dir === "forward" || dir === "bidirectional"
    const hasStartArrow = dir === "backward" || dir === "bidirectional"

    onUpdateEdge({
      ...edge,
      markerEnd: hasEndArrow ? { type: "arrowclosed" as any, color: strokeColor } : undefined,
      markerStart: hasStartArrow ? { type: "arrowclosed" as any, color: strokeColor } : undefined,
      data: {
        ...data,
        directed: dir,
      },
    })
  }

  const handleDashedChange = (isDashed: boolean) => {
    onUpdateEdge({
      ...edge,
      animated: isDashed,
      style: {
        ...edge.style,
        strokeDasharray: isDashed ? "6 6" : undefined,
      },
      data: {
        ...data,
        dashed: isDashed,
      },
    })
  }

  const handleColorChange = (color: string) => {
    const hasEndArrow = directed === "forward" || directed === "bidirectional"
    const hasStartArrow = directed === "backward" || directed === "bidirectional"

    onUpdateEdge({
      ...edge,
      style: {
        ...edge.style,
        stroke: color,
      },
      markerEnd: hasEndArrow ? { type: "arrowclosed" as any, color } : undefined,
      markerStart: hasStartArrow ? { type: "arrowclosed" as any, color } : undefined,
    })
  }

  const handleStrokeWidthChange = (width: number) => {
    onUpdateEdge({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: width,
      },
    })
  }

  const handleLabelChange = (text: string) => {
    onUpdateEdge({
      ...edge,
      label: showLabel && text ? text : undefined,
      data: {
        ...data,
        rawLabel: text,
      },
    })
  }

  const handleToggleShowLabel = () => {
    const nextShow = !showLabel
    onUpdateEdge({
      ...edge,
      label: nextShow ? data.rawLabel || label : undefined,
      data: {
        ...data,
        showLabel: nextShow,
      },
    })
  }

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-card/90 backdrop-blur-md select-none overflow-hidden p-3.5 space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Spline className="size-3.5" />
          <span>Propiedades de conexión</span>
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteEdge(edge.id)}
            className="h-6 px-2 text-[10px] cursor-pointer"
            title="Eliminar conexión"
          >
            <Trash2 className="size-3 mr-1" />
            Eliminar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 px-2 text-[10px] text-muted-foreground"
          >
            Cerrar
          </Button>
        </div>
      </div>

      {/* Geometry / Line Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Tipo de trazado
        </label>
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg">
          <button
            onClick={() => handleTypeChange("bezier")}
            className={`py-1 text-[10px] font-semibold rounded transition-all ${
              connectorType === "bezier" || connectorType === "smoothstep"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bézier curva
          </button>
          <button
            onClick={() => handleTypeChange("straight")}
            className={`py-1 text-[10px] font-semibold rounded transition-all ${
              connectorType === "straight"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Recta
          </button>
          <button
            onClick={() => handleTypeChange("orthogonal")}
            className={`py-1 text-[10px] font-semibold rounded transition-all ${
              connectorType === "orthogonal" || connectorType === "step"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ortogonal
          </button>
        </div>
      </div>

      {/* Arrowhead Direction */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Dirección de flecha
        </label>
        <div className="grid grid-cols-4 gap-1 bg-muted/60 p-1 rounded-lg">
          <button
            onClick={() => handleDirectedChange("none")}
            className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
              directed === "none" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Sin flecha"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => handleDirectedChange("forward")}
            className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
              directed === "forward" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Flecha adelante"
          >
            <ArrowRight className="size-3.5" />
          </button>
          <button
            onClick={() => handleDirectedChange("backward")}
            className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
              directed === "backward" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Flecha atrás"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            onClick={() => handleDirectedChange("bidirectional")}
            className={`py-1 flex items-center justify-center text-[10px] font-semibold rounded transition-all ${
              directed === "bidirectional"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Bidireccional"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Line Style & Color */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Color de línea</label>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="color"
                value={strokeColor.startsWith("#") ? strokeColor : "#0070F3"}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-6 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[10px] text-muted-foreground truncate">{strokeColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Grosor de trazo</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value) || 1)}
              className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Dashed line toggle */}
        <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-2 cursor-pointer">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Línea discontinua / animada</span>
          </div>
          <input
            type="checkbox"
            checked={dashed}
            onChange={(e) => handleDashedChange(e.target.checked)}
            className="rounded text-primary"
          />
        </label>
      </div>

      {/* Label / Name of Connection */}
      <div className="space-y-1.5 border-t border-border pt-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Etiqueta / nombre
          </label>
          <button
            onClick={handleToggleShowLabel}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            {showLabel ? <Eye className="size-3 text-emerald-500" /> : <EyeOff className="size-3" />}
            <span>{showLabel ? "Visible" : "Oculto"}</span>
          </button>
        </div>
        <input
          type="text"
          value={data.rawLabel ?? label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="Ej. Petición ARP, Flujo..."
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
        />
      </div>
    </aside>
  )
}
