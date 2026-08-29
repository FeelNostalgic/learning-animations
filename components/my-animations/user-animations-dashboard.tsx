"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  PenTool,
  Plus,
  Calendar,
  Globe,
  Lock,
  Copy,
  Trash2,
  Eye,
  Search,
  Layers,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  toggleAnimationVisibility,
  deleteAnimation,
  forkAnimation,
} from "@/app/builder/actions"
import type { UniversalAnimationData } from "@/types/universal-animation"

interface UserAnimationsDashboardProps {
  initialAnimations: UniversalAnimationData[]
}

export function UserAnimationsDashboard({
  initialAnimations,
}: UserAnimationsDashboardProps) {
  const router = useRouter()
  const [animations, setAnimations] = useState<UniversalAnimationData[]>(initialAnimations)
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Extract unique topics from user animations
  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>()
    animations.forEach((a) => {
      if (a.topic) topics.add(a.topic)
    })
    return Array.from(topics)
  }, [animations])

  // Filtered animations
  const filteredAnimations = useMemo(() => {
    return animations.filter((anim) => {
      const matchesSearch =
        anim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (anim.description && anim.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        anim.topic.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTopic =
        selectedTopic === "all" || anim.topic === selectedTopic

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && anim.is_public) ||
        (visibilityFilter === "private" && !anim.is_public)

      return matchesSearch && matchesTopic && matchesVisibility
    })
  }, [animations, searchQuery, selectedTopic, visibilityFilter])

  // Handle toggle public / private
  const handleToggleVisibility = async (id: string, currentPublic: boolean) => {
    const nextPublic = !currentPublic
    setLoadingActionId(`vis-${id}`)

    // Optimistic update
    setAnimations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_public: nextPublic } : a))
    )

    const res = await toggleAnimationVisibility(id, nextPublic)
    setLoadingActionId(null)

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: nextPublic
          ? "Animación publicada en el catálogo público"
          : "Animación cambiada a modo privado",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      // Revert on error
      setAnimations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_public: currentPublic } : a))
      )
      setStatusMessage({ type: "error", text: res.error || "Error al actualizar visibilidad" })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  // Handle clone / fork
  const handleFork = async (id: string) => {
    setLoadingActionId(`fork-${id}`)
    const res = await forkAnimation(id)
    setLoadingActionId(null)

    if (res.success && res.id) {
      setStatusMessage({ type: "success", text: "¡Animación duplicada con éxito!" })
      setTimeout(() => setStatusMessage(null), 3000)
      router.push(`/builder?id=${res.id}`)
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al duplicar animación" })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la animación "${title}"?`)) {
      return
    }

    setLoadingActionId(`del-${id}`)
    const res = await deleteAnimation(id)
    setLoadingActionId(null)

    if (res.success) {
      setAnimations((prev) => prev.filter((a) => a.id !== id))
      setStatusMessage({ type: "success", text: "Animación eliminada correctamente" })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al eliminar animación" })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* ── Status Toast Message ──────────────────────────────────── */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold shadow-md ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── Search & Filter Toolbar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none shadow-xs"
          />
        </div>

        {/* Visibility Filter */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setVisibilityFilter("all")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              visibilityFilter === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setVisibilityFilter("public")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              visibilityFilter === "public"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="size-3" />
            <span>Públicas</span>
          </button>
          <button
            onClick={() => setVisibilityFilter("private")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              visibilityFilter === "private"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="size-3" />
            <span>Privadas</span>
          </button>
        </div>
      </div>

      {/* ── Custom Free Topics / Categories Filter ────────────────── */}
      {uniqueTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center border-b border-border pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
            <Layers className="size-3 text-primary" />
            <span>Categorías:</span>
          </span>
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedTopic === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({animations.length})
          </button>
          {uniqueTopics.map((topic) => {
            const count = animations.filter((a) => a.topic === topic).length
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedTopic === topic
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {topic} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* ── Animations Grid ──────────────────────────────────────── */}
      {filteredAnimations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAnimations.map((anim) => {
            const dateStr = anim.updated_at
              ? new Date(anim.updated_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null

            const isVisLoading = loadingActionId === `vis-${anim.id}`
            const isForkLoading = loadingActionId === `fork-${anim.id}`
            const isDelLoading = loadingActionId === `del-${anim.id}`

            return (
              <div
                key={anim.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-md transition-all duration-200 hover:border-primary/50 hover:shadow-xl"
              >
                {/* Card Top: Topic Pill & Privacy Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase tracking-wider truncate max-w-[140px]">
                    {anim.topic}
                  </span>

                  {/* Public / Private Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(anim.id!, anim.is_public)}
                    disabled={isVisLoading}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                      anim.is_public
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                    title={anim.is_public ? "Pública (Visible en catálogo). Clic para cambiar a privada." : "Privada (Solo tú puedes verla). Clic para publicar."}
                  >
                    {isVisLoading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : anim.is_public ? (
                      <Globe className="size-3 text-emerald-500" />
                    ) : (
                      <Lock className="size-3 text-muted-foreground" />
                    )}
                    <span>{anim.is_public ? "Pública" : "Privada"}</span>
                  </button>
                </div>

                {/* Card Body */}
                <Link href={`/my-animations/${anim.id}`} className="block flex-1 cursor-pointer space-y-1.5">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                    {anim.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {anim.description || "Sin descripción pedagógica."}
                  </p>
                </Link>

                {/* Card Stats */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-[10px] font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{anim.steps?.length || 0} pasos</span>
                    <span>•</span>
                    <span>{anim.nodes?.length || 0} nodos</span>
                  </div>
                  {dateStr && (
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>{dateStr}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-border/50">
                  <Link href={`/my-animations/${anim.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-[11px] font-semibold cursor-pointer"
                      title="Ver reproducción"
                    >
                      <Eye className="size-3 mr-1" />
                      <span>Ver</span>
                    </Button>
                  </Link>

                  <Link href={`/builder?id=${anim.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      title="Editar en el Studio"
                    >
                      <PenTool className="size-3.5" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFork(anim.id!)}
                    disabled={isForkLoading}
                    className="h-7 px-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                    title="Duplicar / Clonar animación"
                  >
                    {isForkLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Copy className="size-3.5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(anim.id!, anim.title)}
                    disabled={isDelLoading}
                    className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Eliminar animación"
                  >
                    {isDelLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────────── */
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Sparkles className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {searchQuery || selectedTopic !== "all" || visibilityFilter !== "all"
              ? "No se encontraron animaciones con los filtros aplicados"
              : "Aún no has creado ninguna animación"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Utiliza el Studio para diseñar conceptos interactivos, diagramas de flujo y fórmulas con animaciones fluidas a 60 FPS.
          </p>
          <Link
            href="/builder"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Crear mi primera animación</span>
          </Link>
        </div>
      )}
    </div>
  )
}
