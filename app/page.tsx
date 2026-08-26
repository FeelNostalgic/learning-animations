import Link from "next/link"
import { animationRegistry } from "@/lib/animations/registry"
import { ThemeToggle } from "@/components/theme-toggle"
import { Network, Play, ExternalLink, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Network className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              Learning Animations
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {animationRegistry.length} animaciones
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">Simulador interactivo paso a paso</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-mono">
            <Sparkles className="size-3.5 text-primary" />
            Catálogo interactivo
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Protocolos y Modelos de Red
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Visualiza el intercambio de tramas, paquetes y segmentos en tiempo real. Cada animación desglosa el flujo paso a paso con tablas de conmutación, enrutamiento y caché ARP.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {animationRegistry.map((anim) => (
            <div
              key={anim.slug}
              className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                  {anim.topic}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {anim.steps.length} pasos
                </span>
              </div>

              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {anim.title}
              </h3>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2 flex-1">
                {anim.description}
              </p>

              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-border/40">
                <Link
                  href={`/animations/${anim.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <Play className="size-3.5 fill-current" />
                  Ver Animación
                </Link>
                <Link
                  href={`/embed/${anim.slug}`}
                  target="_blank"
                  title="Abrir vista Embed (iFrame)"
                  className="size-8 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6 text-center text-xs text-muted-foreground">
        Learning Animations &bull; Motor interactivo desacoplado para plataformas educativas.
      </footer>
    </div>
  )
}
