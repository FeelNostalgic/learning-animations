import { animationRegistry } from "@/lib/animations/registry"
import { getPublicAnimations } from "@/app/builder/actions"
import { FacetedCatalog } from "@/components/catalog/faceted-catalog"
import { Sparkles } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catálogo de Animaciones Educativas",
  description: "Explora animaciones interactivas paso a paso de redes, matemáticas, física y computación.",
}

export default async function AnimationsIndexPage() {
  const communityRes = await getPublicAnimations()
  const communityAnimations = communityRes.data || []

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-8 select-none">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-xs">
          <Sparkles className="size-3.5" />
          <span>Catálogo Abierto de Animaciones Educativas</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Aprende Conceptos Complejos Paso a Paso
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Explora la colección oficial y las animaciones interactivas publicadas por la comunidad sobre redes, telecomunicaciones, matemáticas y ciencias.
        </p>
      </div>

      {/* ── Faceted Search & Filter Catalog ─────────────────────── */}
      <FacetedCatalog
        officialItems={animationRegistry}
        communityItems={communityAnimations}
      />
    </div>
  )
}
