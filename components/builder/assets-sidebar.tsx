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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UniversalNode, UniversalNodeType, ShapeKind } from "@/types/universal-animation"

interface AssetsSidebarProps {
  onAddNode: (type: UniversalNodeType, preset?: Partial<UniversalNode>) => void
  selectedNode: UniversalNode | null
  onUpdateNode: (node: UniversalNode) => void
  onDeleteNode: (nodeId: string) => void
}

type TabKey = "geometry" | "math" | "text" | "images" | "network"

export function AssetsSidebar({
  onAddNode,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
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
        // Local FileReader fallback
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
      // Local FileReader fallback
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

            <button
              onClick={() =>
                onAddNode("math", {
                  label: "Límite",
                  content: "\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1",
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Sigma className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Límite $\lim$</h3>
                  <p className="text-[10px] text-muted-foreground">Cálculo infinitesimal</p>
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

            <button
              onClick={() =>
                onAddNode("network", {
                  label: "Router",
                  props: { networkType: "router", ip: "192.168.1.1" },
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Shield className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Router</h3>
                  <p className="text-[10px] text-muted-foreground">Enrutador L3</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* ── Selected Node Advanced Style Inspector ────────────────── */}
      {selectedNode ? (
        <div className="border-t border-border bg-card/90 p-3 max-h-[300px] overflow-y-auto space-y-2.5 text-xs">
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

            {/* Opacity & Stroke Width */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Opacidad</span>
                  <span>{Math.round((selectedNode.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedNode.opacity ?? 1}
                  onChange={(e) => onUpdateNode({ ...selectedNode, opacity: parseFloat(e.target.value) })}
                  className="w-full h-1 mt-1 rounded bg-border cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Grosor de Borde</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={selectedNode.strokeWidth ?? 2}
                  onChange={(e) => onUpdateNode({ ...selectedNode, strokeWidth: parseInt(e.target.value) || 1 })}
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
      ) : (
        <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
          Selecciona un nodo en el lienzo para personalizar colores, opacidad y tamaños.
        </div>
      )}
    </aside>
  )
}
