"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  GraduationCap,
  Layers,
  Sparkles,
  Network,
  RotateCcw,
  Globe,
  Star,
  Play,
  Sigma,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnimationMeta } from "@/types/animations"
import type { UniversalAnimationData, DisciplineType, DifficultyLevel } from "@/types/universal-animation"

export interface UnifiedCatalogItem {
  id: string
  slug: string
  title: string
  description: string
  topic: string
  discipline: DisciplineType
  difficulty: DifficultyLevel
  tags: string[]
  stepsCount: number
  isOfficial: boolean
  updatedAt?: string
}

interface FacetedCatalogProps {
  officialItems: AnimationMeta[]
  communityItems: UniversalAnimationData[]
}

const DISCIPLINES: { key: string; label: string }[] = [
  { key: "all", label: "Todas las disciplinas" },
  { key: "general", label: "General" },
  { key: "math", label: "Matemáticas" },
  { key: "physics", label: "Física" },
  { key: "computer_science", label: "Computación / TI" },
  { key: "chemistry", label: "Química" },
  { key: "biology", label: "Biología" },
]

const DIFFICULTIES: { key: string; label: string }[] = [
  { key: "all", label: "Cualquier dificultad" },
  { key: "beginner", label: "Principiante" },
  { key: "intermediate", label: "Intermedio" },
  { key: "advanced", label: "Avanzado" },
]

export function FacetedCatalog({ officialItems, communityItems }: FacetedCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<"all" | "official" | "community">("all")

  // Unify official and community animations
  const allItems: UnifiedCatalogItem[] = useMemo(() => {
    const officials: UnifiedCatalogItem[] = officialItems.map((o) => ({
      id: o.slug,
      slug: o.slug,
      title: o.title,
      description: o.description,
      topic: o.topic,
      discipline: (o.discipline as DisciplineType) || "computer_science",
      difficulty: (o.difficulty as DifficultyLevel) || "intermediate",
      tags: o.tags || [],
      stepsCount: o.steps.length,
      isOfficial: true,
    }))

    const communities: UnifiedCatalogItem[] = communityItems.map((c) => ({
      id: c.id || c.title,
      slug: c.id || "",
      title: c.title,
      description: c.description || "",
      topic: c.topic || "General",
      discipline: c.discipline || "general",
      difficulty: c.difficulty || "beginner",
      tags: c.tags || [],
      stepsCount: c.steps?.length || 0,
      isOfficial: false,
      updatedAt: c.updated_at,
    }))

    return [...officials, ...communities]
  }, [officialItems, communityItems])

  // Extract unique topics from all items
  const uniqueTopics = useMemo(() => {
    const set = new Set<string>()
    allItems.forEach((i) => {
      if (i.topic) set.add(i.topic)
    })
    return Array.from(set).sort()
  }, [allItems])

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))

      const matchesDiscipline =
        selectedDiscipline === "all" || item.discipline === selectedDiscipline

      const matchesTopic =
        selectedTopic === "all" || item.topic === selectedTopic

      const matchesDifficulty =
        selectedDifficulty === "all" || item.difficulty === selectedDifficulty

      const matchesSource =
        selectedSource === "all" ||
        (selectedSource === "official" && item.isOfficial) ||
        (selectedSource === "community" && !item.isOfficial)

      return (
        matchesSearch &&
        matchesDiscipline &&
        matchesTopic &&
        matchesDifficulty &&
        matchesSource
      )
    })
  }, [
    allItems,
    searchQuery,
    selectedDiscipline,
    selectedTopic,
    selectedDifficulty,
    selectedSource,
  ])

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDiscipline !== "all" ||
    selectedTopic !== "all" ||
    selectedDifficulty !== "all" ||
    selectedSource !== "all"

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedDiscipline("all")
    setSelectedTopic("all")
    setSelectedDifficulty("all")
    setSelectedSource("all")
  }

  const getDisciplineBadgeColor = (disc: DisciplineType) => {
    switch (disc) {
      case "math":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "physics":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      case "chemistry":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "biology":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      case "computer_science":
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case "beginner":
        return { label: "Principiante", color: "text-emerald-500" }
      case "advanced":
        return { label: "Avanzado", color: "text-rose-500" }
      case "intermediate":
      default:
        return { label: "Intermedio", color: "text-amber-500" }
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* ── Search & Source Filter Bar ────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por tema, protocolo, fórmula o concepto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2 text-xs md:text-sm text-foreground focus:border-primary focus:outline-none shadow-xs"
          />
        </div>

        {/* Source Switcher: All, Official, Community */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setSelectedSource("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedSource === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({allItems.length})
          </button>
          <button
            onClick={() => setSelectedSource("official")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedSource === "official"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="size-3 text-amber-500 fill-amber-500" />
            <span>Oficiales ({officialItems.length})</span>
          </button>
          <button
            onClick={() => setSelectedSource("community")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedSource === "community"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="size-3 text-emerald-500" />
            <span>Comunidad ({communityItems.length})</span>
          </button>
        </div>
      </div>

      {/* ── Faceted Filters (Discipline, Difficulty, Topic) ───────── */}
      <div className="flex flex-wrap gap-2 items-center bg-card/60 p-3 rounded-2xl border border-border">
        {/* Discipline Selector */}
        <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1.5 rounded-xl border border-border">
          <GraduationCap className="size-3.5 text-muted-foreground" />
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            {DISCIPLINES.map((d) => (
              <option key={d.key} value={d.key} className="bg-card text-foreground">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1.5 rounded-xl border border-border">
          <Sparkles className="size-3.5 text-muted-foreground" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.key} value={d.key} className="bg-card text-foreground">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Selector */}
        <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1.5 rounded-xl border border-border">
          <Layers className="size-3.5 text-muted-foreground" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer max-w-[160px] truncate"
          >
            <option value="all" className="bg-card text-foreground">Todos los temas ({uniqueTopics.length})</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic} className="bg-card text-foreground">
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer ml-auto"
          >
            <RotateCcw className="size-3 mr-1" />
            <span>Limpiar filtros</span>
          </Button>
        )}
      </div>

      {/* ── Active Filters & Results Counter ──────────────────────── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-semibold text-foreground">
          Mostrando {filteredItems.length} {filteredItems.length === 1 ? "animación" : "animaciones"}
        </span>
      </div>

      {/* ── Animation Cards Grid ─────────────────────────────────── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((anim) => {
            const diff = getDifficultyBadge(anim.difficulty)
            const discClass = getDisciplineBadgeColor(anim.discipline)

            return (
              <Link
                key={anim.id}
                href={`/animations/${anim.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:bg-card/90 hover:shadow-xl cursor-pointer"
              >
                <div>
                  {/* Card Header: Topic & Source Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase tracking-wider truncate max-w-[150px]">
                      {anim.topic}
                    </span>

                    {anim.isOfficial ? (
                      <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" />
                        <span>Oficial</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Globe className="size-2.5 text-emerald-500" />
                        <span>Comunidad</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                    {anim.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {anim.description || "Visualización conceptual paso a paso."}
                  </p>
                </div>

                {/* Footer Info & Badges */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold ${discClass}`}>
                      {anim.discipline}
                    </span>
                    <span className={`font-semibold ${diff.color}`}>
                      ● {diff.label}
                    </span>
                  </div>

                  <span className="font-semibold text-foreground">
                    {anim.stepsCount} {anim.stepsCount === 1 ? "paso" : "pasos"}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* ── Empty Filter State ───────────────────────────────────── */
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Filter className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No se encontraron animaciones</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Prueba a cambiar los términos de búsqueda o a limpiar los filtros aplicados.
          </p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            size="sm"
            className="mt-4 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="size-3 mr-1.5" />
            <span>Restablecer filtros</span>
          </Button>
        </div>
      )}
    </div>
  )
}
