import Link from "next/link"
import { notFound } from "next/navigation"
import { animationComponentMap } from "@/components/animations/animation-component-map"
import { animationRegistry } from "@/lib/animations/registry"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = animationRegistry.find((a) => a.slug === slug)
  return {
    title: meta ? `${meta.title} | Learning Animations` : "Animación",
    description: meta?.description,
  }
}

type Slug = keyof typeof animationComponentMap

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = animationRegistry.find((a) => a.slug === slug)

  if (!meta || !(slug in animationComponentMap)) notFound()

  const AnimationComponent = animationComponentMap[slug as Slug]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Catálogo
            </Link>
          </Button>
          <span className="text-border">/</span>
          <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {meta.topic}
          </span>
          <span className="text-sm font-semibold text-foreground hidden sm:inline">
            {meta.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground border-border/50">
            <Link href={`/embed/${slug}`} target="_blank">
              <ExternalLink className="size-3.5" />
              Modo Embed
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Animation Player Area */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full flex flex-col">
        <div className="flex-1 min-h-[580px]">
          <AnimationPlayer steps={meta.steps} title={meta.title}>
            <AnimationComponent />
          </AnimationPlayer>
        </div>
      </main>
    </div>
  )
}

export function generateStaticParams() {
  return animationRegistry.map((a) => ({ slug: a.slug }))
}
