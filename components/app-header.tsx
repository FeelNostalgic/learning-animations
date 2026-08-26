"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { animationRegistry } from "@/lib/animations/registry"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  const pathname = usePathname()

  const isAnimationDetail = pathname.startsWith("/animations/") && pathname !== "/animations"
  const slug = isAnimationDetail ? pathname.split("/")[2] : null
  const currentAnimation = slug
    ? animationRegistry.find((item) => item.slug === slug)
    : null

  const animationTitle = currentAnimation?.title ?? slug

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
      <nav aria-label="Migas de pan" className="flex items-center">
        <ol className="flex items-center gap-2 text-sm">
          {isAnimationDetail ? (
            <>
              <li>
                <Link
                  href="/animations"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </li>
              <li aria-current="page">
                <span className="font-semibold text-foreground">
                  {animationTitle}
                </span>
              </li>
            </>
          ) : (
            <li aria-current="page">
              <span className="font-semibold text-foreground">Inicio</span>
            </li>
          )}
        </ol>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
        >
          <span>Crear Animación</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
