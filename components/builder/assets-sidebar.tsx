"use client"

import React, { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UniversalNode, UniversalNodeType, ShapeKind } from "@/types/universal-animation"

interface AssetsSidebarProps {
  onAddNode: (type: UniversalNodeType, preset?: Partial<UniversalNode>) => void
  selectedNode: UniversalNode | null
  onUpdateNode: (node: UniversalNode) => void
  onDeleteNode: (nodeId: string) => void
}

type TabKey = "geometry" | "math" | "text" | "network"

export function AssetsSidebar({
  onAddNode,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
}: AssetsSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("geometry")

  return (
    <aside className="flex h-full w-80 flex-col border-r border-border bg-card/60 backdrop-blur-md select-none overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b border-border p-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Shapes className="size-3.5 text-primary" />
          <span>Biblioteca de Assets</span>
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Haz clic en un componente para añadirlo al lienzo
        </p>

        {/* Categories Tabs */}
        <div className="grid grid-cols-4 gap-1 mt-3 bg-muted/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("geometry")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeTab === "geometry"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Formas
          </button>
          <button
            onClick={() => setActiveTab("math")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeTab === "math"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            KaTeX
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeTab === "text"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Texto
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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

        {activeTab === "network" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                onAddNode("network", {
                  label: "PC",
                  props: { networkType: "pc", ip: "192.168.1.10" },
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
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

            <button
              onClick={() =>
                onAddNode("network", {
                  label: "Servidor",
                  props: { networkType: "server" },
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Server className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Servidor</h3>
                  <p className="text-[10px] text-muted-foreground">Data Center</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>

            <button
              onClick={() =>
                onAddNode("network", {
                  label: "Internet",
                  props: { networkType: "cloud" },
                })
              }
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                  <Cloud className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Nube / WAN</h3>
                  <p className="text-[10px] text-muted-foreground">Red externa</p>
                </div>
              </div>
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* ── Selected Node Inspector ──────────────────────────────── */}
      {selectedNode ? (
        <div className="border-t border-border bg-card/90 p-3.5 max-h-[280px] overflow-y-auto">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary truncate max-w-[140px]">
              {selectedNode.label}
            </h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="h-6 px-2 text-[11px] cursor-pointer"
            >
              <Trash2 className="mr-1 size-3" />
              Eliminar
            </Button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Etiqueta / Nombre</label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {selectedNode.type === "math" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Fórmula LaTeX</label>
                <textarea
                  rows={2}
                  value={selectedNode.content || ""}
                  onChange={(e) => onUpdateNode({ ...selectedNode, content: e.target.value })}
                  placeholder="f(x) = x^2"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {selectedNode.type === "text" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Contenido Markdown</label>
                <textarea
                  rows={3}
                  value={selectedNode.content || ""}
                  onChange={(e) => onUpdateNode({ ...selectedNode, content: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {selectedNode.type === "network" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Dirección IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.10"
                  value={selectedNode.props?.ip || ""}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      props: { ...selectedNode.props, ip: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
          Selecciona un nodo en el lienzo para ver y editar sus propiedades.
        </div>
      )}
    </aside>
  )
}
