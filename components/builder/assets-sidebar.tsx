"use client"

import React, { useState, useRef } from "react"
import {
  Circle,
  Square,
  Triangle,
  Diamond,
  Sigma,
  FileText,
  Box,
  Laptop,
  Network,
  Shield,
  Server,
  Cloud,
  Plus,
  Trash2,
  Shapes,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Link2,
  Loader2,
  Palette,
  Spline,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
  Eye,
  EyeOff,
  Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UniversalNode, UniversalNodeType, ShapeKind } from "@/types/universal-animation"
import type { Edge } from "@xyflow/react"

interface AssetsSidebarProps {
  onAddNode: (type: UniversalNodeType, preset?: Partial<UniversalNode>) => void
  selectedNode: UniversalNode | null
  onUpdateNode: (node: UniversalNode) => void
  onDeleteNode: (nodeId: string) => void
  selectedEdge?: Edge | null
  onUpdateEdge?: (edge: Edge) => void
  onDeleteEdge?: (edgeId: string) => void
}

type TabKey = "geometry" | "math" | "text" | "images" | "network"

export function AssetsSidebar({
  onAddNode,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
}: AssetsSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("geometry")
  const [isUploading, setIsUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success && data.url) {
        onAddNode("image", {
          label: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: data.url,
          width: 140,
          height: 140,
        })
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          onAddNode("image", {
            label: file.name.replace(/\.[^/.]+$/, ""),
            imageUrl: event.target?.result as string,
            width: 140,
            height: 140,
          })
        }
        reader.readAsDataURL(file)
      }
    } catch {
      const reader = new FileReader()
      reader.onload = (event) => {
        onAddNode("image", {
          label: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: event.target?.result as string,
          width: 140,
          height: 140,
        })
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAddExternalImage = () => {
    if (!externalUrl.trim()) return
    onAddNode("image", {
      label: "Imagen Web",
      imageUrl: externalUrl.trim(),
      width: 140,
      height: 140,
    })
    setExternalUrl("")
  }

  // Edge editing helper functions
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
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
    onUpdateEdge({
      ...selectedEdge,
      style: {
        ...selectedEdge.style,
        strokeWidth: width,
      },
    })
  }

  const handleEdgeLabelChange = (text: string) => {
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
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
    if (!selectedEdge || !onUpdateEdge) return
    onUpdateEdge({
      ...selectedEdge,
      data: {
        ...edgeData,
        labelPosition: pos,
      },
    })
  }

  return (
    <aside className="flex h-full w-80 flex-col border-r border-border bg-card/60 backdrop-blur-md select-none overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b border-border p-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Shapes className="size-3.5 text-primary" />
          <span>Biblioteca de Assets</span>
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Haz clic en un componente para añadirlo al lienzo
        </p>

        {/* Categories Tabs */}
        <div className="grid grid-cols-5 gap-1 mt-2.5 bg-muted/60 p-1 rounded-lg text-center">
          <button
            onClick={() => setActiveTab("geometry")}
            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
              activeTab === "geometry"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Formas
          </button>
          <button
            onClick={() => setActiveTab("math")}
            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
              activeTab === "math"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            KaTeX
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
              activeTab === "text"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Texto
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
              activeTab === "images"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Imágenes
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
              activeTab === "network"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Redes
          </button>
        </div>
      </div>

      {/* ── Asset Palette Content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === "geometry" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                onAddNode("shape", {
                  label: "Círculo",
                  shapeDetails: { shapeType: "circle", radius: 36 },
                  fill: "var(--card)",
                  stroke: "var(--primary)",
                  width: 80,
                  height: 80,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Circle className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Círculo</h3>
                  <p className="text-[10px] text-muted-foreground">Nodo circular / Punto</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("shape", {
                  label: "Rectángulo",
                  shapeDetails: { shapeType: "rounded_rect", rx: 8 },
                  fill: "var(--card)",
                  stroke: "var(--primary)",
                  width: 110,
                  height: 60,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Square className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Rectángulo</h3>
                  <p className="text-[10px] text-muted-foreground">Bloque o tarjeta</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("shape", {
                  label: "Diamante",
                  shapeDetails: { shapeType: "diamond", radius: 30 },
                  fill: "var(--card)",
                  stroke: "var(--primary)",
                  width: 70,
                  height: 70,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Diamond className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Diamante</h3>
                  <p className="text-[10px] text-muted-foreground">Decisión / Condición</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("shape", {
                  label: "Píldora",
                  shapeDetails: { shapeType: "pill" },
                  fill: "var(--card)",
                  stroke: "var(--primary)",
                  width: 120,
                  height: 48,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Píldora / Estado</h3>
                  <p className="text-[10px] text-muted-foreground">Etiqueta redondeada</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {activeTab === "math" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                onAddNode("math", {
                  label: "Función",
                  content: "f(x) = x^2 - 4x + 3",
                  width: 200,
                  height: 80,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Sigma className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Función $f(x)$</h3>
                  <p className="text-[10px] text-muted-foreground">Fórmula algebraica</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("math", {
                  label: "Integral Definida",
                  content: "\\int_a^b f(x) dx = F(b) - F(a)",
                  width: 220,
                  height: 80,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Sigma className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Integral $\int$</h3>
                  <p className="text-[10px] text-muted-foreground">Cálculo integral</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {activeTab === "text" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                onAddNode("text", {
                  label: "Explicación",
                  content: "**Concepto Clave**:\nExplica aquí los detalles del paso.",
                  width: 220,
                  height: 110,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Tarjeta Markdown</h3>
                  <p className="text-[10px] text-muted-foreground">Texto enriquecido y notas</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("container", {
                  label: "Subsistema",
                  width: 320,
                  height: 200,
                  fill: "transparent",
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Box className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Contenedor / Grupo</h3>
                  <p className="text-[10px] text-muted-foreground">Caja agrupador de nodos</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-3">
            {/* Upload File button */}
            <div className="rounded-xl border border-dashed border-border bg-card/80 p-3 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-file-upload"
              />
              <label
                htmlFor="image-file-upload"
                className="flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="size-6 text-primary animate-spin" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="size-5" />
                  </div>
                )}
                <span className="text-xs font-semibold text-foreground">Subir imagen / SVG</span>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPEG, WebP, SVG o GIF (máx 5MB)
                </span>
              </label>
            </div>

            {/* External URL Input */}
            <div className="rounded-xl border border-border bg-card/60 p-2.5 space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Link2 className="size-3 text-primary" />
                <span>O pegar URL directa de imagen</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.png"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={handleAddExternalImage}
                  disabled={!externalUrl.trim()}
                  className="h-7 px-2.5 text-xs cursor-pointer"
                >
                  <Plus className="size-3 mr-1" />
                  Añadir
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "network" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                onAddNode("network", {
                  label: "PC",
                  props: { networkType: "pc", ip: "192.168.1.10" },
                  width: 100,
                  height: 100,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Laptop className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Host / PC</h3>
                  <p className="text-[10px] text-muted-foreground">Cliente final</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("network", {
                  label: "Switch",
                  props: { networkType: "switch" },
                  width: 100,
                  height: 100,
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Network className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Switch</h3>
                  <p className="text-[10px] text-muted-foreground">Conmutador L2</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* ── Selected Element Inspector (Node OR Edge) ─────────────── */}
      {selectedNode ? (
        <div className="border-t border-border bg-card/90 p-3 max-h-[340px] overflow-y-auto space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary truncate max-w-[140px] flex items-center gap-1">
              <Palette className="size-3" />
              <span>{selectedNode.label}</span>
            </h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="h-6 px-2 text-[10px] cursor-pointer"
            >
              <Trash2 className="mr-1 size-3" />
              Eliminar
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Etiqueta / Nombre</label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
                className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Colors: Fill & Stroke */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Color de Fondo</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="color"
                    value={selectedNode.fill && selectedNode.fill.startsWith("#") ? selectedNode.fill : "#1E293B"}
                    onChange={(e) => onUpdateNode({ ...selectedNode, fill: e.target.value })}
                    className="h-6 w-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground truncate">
                    {selectedNode.fill || "Auto"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Color de Borde</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="color"
                    value={selectedNode.stroke && selectedNode.stroke.startsWith("#") ? selectedNode.stroke : "#0070F3"}
                    onChange={(e) => onUpdateNode({ ...selectedNode, stroke: e.target.value })}
                    className="h-6 w-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground truncate">
                    {selectedNode.stroke || "Auto"}
                  </span>
                </div>
              </div>
            </div>

            {/* Opacity & Decimal Stroke Width */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Opacidad</span>
                  <span>{Math.round((selectedNode.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={selectedNode.opacity ?? 1}
                  onChange={(e) => onUpdateNode({ ...selectedNode, opacity: parseFloat(e.target.value) })}
                  className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Grosor Borde</span>
                  <span>{selectedNode.strokeWidth ?? 2}px</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={selectedNode.strokeWidth ?? 2}
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, strokeWidth: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateNode({
                        ...selectedNode,
                        strokeWidth: selectedNode.strokeWidth === 0 ? 2 : 0,
                      })
                    }
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                      selectedNode.strokeWidth === 0
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground"
                    }`}
                    title="Activar/desactivar borde"
                  >
                    0px
                  </button>
                </div>
              </div>
            </div>

            {/* Width & Height inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Ancho (px)</label>
                <input
                  type="number"
                  min="30"
                  max="1000"
                  value={selectedNode.width || 100}
                  onChange={(e) =>
                    onUpdateNode({ ...selectedNode, width: parseInt(e.target.value) || 100 })
                  }
                  className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Alto (px)</label>
                <input
                  type="number"
                  min="30"
                  max="1000"
                  value={selectedNode.height || 60}
                  onChange={(e) =>
                    onUpdateNode({ ...selectedNode, height: parseInt(e.target.value) || 60 })
                  }
                  className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Image Node Specific Controls */}
            {selectedNode.type === "image" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Ajuste de Imagen</label>
                <select
                  value={selectedNode.imageFit || "contain"}
                  onChange={(e) => onUpdateNode({ ...selectedNode, imageFit: e.target.value as any })}
                  className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="contain">Contener (Contain)</option>
                  <option value="cover">Cubrir (Cover)</option>
                  <option value="fill">Rellenar (Fill)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      ) : selectedEdge ? (
        /* ── Selected Edge Inspector in Left Sidebar ─────────────── */
        <div className="border-t border-border bg-card/90 p-3 max-h-[340px] overflow-y-auto space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Spline className="size-3.5" />
              <span>Conexión Seleccionada</span>
            </h3>
            {onDeleteEdge && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="h-6 px-2 text-[10px] cursor-pointer"
                title="Eliminar conexión"
              >
                <Trash2 className="size-3 mr-1" />
                Eliminar
              </Button>
            )}
          </div>

          {/* Geometry / Line Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Tipo de Trazado
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

          {/* Arrowhead Direction */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Dirección de Flecha
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

          {/* Line Style & Color */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Color de Línea</label>
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
                <label className="text-[10px] font-medium text-muted-foreground">Grosor de Trazo</label>
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

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-1.5 cursor-pointer">
              <div className="flex items-center gap-1.5 text-[11px] text-foreground">
                <Sparkles className="size-3 text-amber-500" />
                <span>Línea Discontinua / Animada</span>
              </div>
              <input
                type="checkbox"
                checked={edgeDashed}
                onChange={(e) => handleEdgeDashedChange(e.target.checked)}
                className="rounded text-primary"
              />
            </label>
          </div>

          {/* Label & Label Position Along Curve */}
          <div className="space-y-1.5 border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Etiqueta / Nombre
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
                  Posición a lo largo de la línea
                </span>
                <span>{Math.round(edgeLabelPos * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={edgeLabelPos}
                onChange={(e) => handleEdgeLabelPositionChange(parseFloat(e.target.value))}
                className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
          Selecciona un nodo o una conexión en el lienzo para personalizar sus propiedades.
        </div>
      )}
    </aside>
  )
}
