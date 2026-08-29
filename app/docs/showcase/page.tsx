"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  Sliders,
  Sigma,
  Layers,
  Search,
  PenTool,
  ArrowLeft,
  Cpu,
  Compass,
  Shapes,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionLoopCard } from "@/components/docs/action-loop-card"
import { ACTION_DEFINITIONS } from "@/components/docs/action-definitions"
import { LiveInteractiveSandbox } from "@/components/docs/live-interactive-sandbox"
import { KatexCheatSheet } from "@/components/docs/katex-cheat-sheet"
import { ComponentCatalog } from "@/components/docs/component-catalog"

type ShowcaseTab = "actions" | "components" | "interactive" | "katex" | "architecture"

export default function ShowcasePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("actions")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all")

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/animations")
    }
  }

  // Filter actions based on search query and type filter
  const filteredActions = useMemo(() => {
    return ACTION_DEFINITIONS.filter((act) => {
      const matchesSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.whenToUse.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        selectedTypeFilter === "all" || act.type === selectedTypeFilter

      return matchesSearch && matchesType
    })
  }, [searchQuery, selectedTypeFilter])

  return (
    <div className="min-h-full bg-background pb-16">
      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-primary/5 via-card to-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Top Bar: Back Button & Badge */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:border-primary/50 transition-all cursor-pointer shadow-xs"
              title="Volver a la página anterior"
            >
              <ArrowLeft className="size-3.5 text-primary" />
              <span>Volver atrás</span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Showcase & Wiki del Motor de Animaciones</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Catálogo de Acciones, Componentes y Fórmulas
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Descubre todas las capacidades del motor universal con ejemplos en bucle infinito en tiempo real, catálogo de componentes configurables, interactividad en vivo y fórmulas KaTeX.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/builder">
                <Button size="sm" className="gap-1.5 text-xs font-bold shadow-md cursor-pointer">
                  <PenTool className="size-3.5" />
                  <span>Crear en el Studio</span>
                </Button>
              </Link>
              <Link href="/animations">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                  <Compass className="size-3.5" />
                  <span>Ver Catálogo</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
            <button
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "actions"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Acciones del Motor ({ACTION_DEFINITIONS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("components")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "components"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Shapes className="size-3.5" />
              <span>Componentes & Nodos</span>
            </button>

            <button
              onClick={() => setActiveTab("interactive")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "interactive"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Sliders className="size-3.5" />
              <span>Interactividad en Vivo</span>
            </button>

            <button
              onClick={() => setActiveTab("katex")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "katex"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Sigma className="size-3.5" />
              <span>KaTeX Cheat Sheet & Playground</span>
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Cpu className="size-3.5" />
              <span>Arquitectura del Motor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Tab Content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8 pt-8">
        {/* ═══ TAB 1: ALL ACTIONS IN INFINITE LOOPS ═══ */}
        {activeTab === "actions" && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar acción o concepto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedTypeFilter("all")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedTypeFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas ({ACTION_DEFINITIONS.length})
                </button>
                {["highlight", "pulse", "packet", "transform", "fade", "path_draw", "badge", "tooltip", "math_eval"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(t)}
                    className={`px-2 py-1 text-[10px] font-mono rounded-lg transition-all cursor-pointer ${
                      selectedTypeFilter === t
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActions.map((action) => (
                <ActionLoopCard key={action.type} action={action} />
              ))}
            </div>

            {filteredActions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Layers className="size-8 text-primary/40 mb-2" />
                <p className="text-xs font-semibold">No se encontraron acciones que coincidan con la búsqueda.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 2: COMPONENT & NODES CATALOG ═══ */}
        {activeTab === "components" && <ComponentCatalog />}

        {/* ═══ TAB 3: LIVE INTERACTIVE SANDBOX ═══ */}
        {activeTab === "interactive" && <LiveInteractiveSandbox />}

        {/* ═══ TAB 4: KATEX CHEAT SHEET & PLAYGROUND ═══ */}
        {activeTab === "katex" && <KatexCheatSheet />}

        {/* ═══ TAB 5: ENGINE ARCHITECTURE & PHILOSOPHY ═══ */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Arquitectura del Compilador Universal de Animaciones
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cómo se transforma el modelo declarativo de datos en una línea de tiempo GSAP a 60 FPS
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    1. Modelo de Datos Declarativo
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las animaciones se definen como estructuras puras validadas con Zod (<code className="text-primary font-mono text-[10px]">UniversalAnimationData</code>), independientes del framework de renderizado.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    2. Compilación Paramétrica GSAP
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <code className="text-emerald-500 font-mono text-[10px]">compileUniversalTimeline</code> convierte cada paso y acción en tweens coordinados, muestreando waypoints paramétricos <code className="font-mono text-[10px]">B(t)</code> a lo largo de curvas Bézier.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                    3. Capas SVG & Máquina de Estados
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El reproductor organiza el renderizado en 5 capas SVG optimizadas (Contenedores, Conectores, Nodos, Paquetes y Overlays Reactivos) aceleradas por GPU.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
