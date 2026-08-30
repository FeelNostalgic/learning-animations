"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, User as UserIcon, LogOut, LogIn, UserPlus, Sparkles, BookOpen } from "lucide-react"
import { animationRegistry } from "@/lib/animations/registry"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { type User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"]

export function AppHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Listen for dynamic breadcrumb title events from viewers
  useEffect(() => {
    const handleSetTitle = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setDynamicTitle(customEvent.detail)
      }
    }

    window.addEventListener("set-breadcrumb-title", handleSetTitle)
    return () => window.removeEventListener("set-breadcrumb-title", handleSetTitle)
  }, [])

  // Reset dynamic title on navigation
  useEffect(() => {
    setDynamicTitle(null)
  }, [pathname])

  // Don't render header in embed mode or on auth pages
  if (pathname.startsWith("/embed") || AUTH_PATHS.includes(pathname)) {
    return null
  }

  // Breadcrumbs calculation
  const isOfficialDetail = pathname.startsWith("/animations/") && pathname !== "/animations"
  const isMyAnimationDetail = pathname.startsWith("/my-animations/") && pathname !== "/my-animations"
  const isMyAnimationsIndex = pathname === "/my-animations"
  const isBuilder = pathname.startsWith("/builder")
  const isDocs = pathname.startsWith("/docs")

  const officialSlug = isOfficialDetail ? pathname.split("/")[2] : null
  const officialAnim = officialSlug
    ? animationRegistry.find((item) => item.slug === officialSlug)
    : null

  let breadcrumbs: { label: string; href?: string }[] = [{ label: "Inicio", href: "/animations" }]

  if (isOfficialDetail) {
    breadcrumbs.push({ label: officialAnim?.title || dynamicTitle || "Animación" })
  } else if (isMyAnimationsIndex) {
    breadcrumbs.push({ label: "Mis animaciones" })
  } else if (isMyAnimationDetail) {
    breadcrumbs.push({ label: "Mis animaciones", href: "/my-animations" })
    breadcrumbs.push({ label: dynamicTitle || "Cargando animación..." })
  } else if (isBuilder) {
    breadcrumbs.push({ label: "Editor studio" })
    if (dynamicTitle && dynamicTitle !== "Nueva animación de red") {
      breadcrumbs.push({ label: dynamicTitle })
    }
  } else if (isDocs) {
    breadcrumbs.push({ label: "Showcase & wiki" })
  }

  return (
    <header className="h-12 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 sticky top-0 z-30 select-none">
      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav aria-label="Migas de pan" className="flex items-center">
        <ol className="flex items-center gap-1.5 text-xs font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1

            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />}
                {isLast || !crumb.href ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px] md:max-w-md">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[140px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ── Right Utilities ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Link
          href="/docs/showcase"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer shadow-xs"
          title="Ver wiki & showcase de componentes y animaciones"
        >
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Wiki / Docs</span>
        </Link>

        <ThemeToggle />

        {user ? (
          /* User Profile Dropdown Menu (Shadcn UI) */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                aria-label="Menú de usuario"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold text-foreground truncate">
                  {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
                </p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my-animations" className="flex items-center gap-2 w-full cursor-pointer">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Mis animaciones</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut()
                }}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="size-3.5 mr-2" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Explicit Auth Buttons (Logged out visitor) */
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-primary" />
              <span>Iniciar sesión</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Crear cuenta</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
