"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, User as UserIcon, LogOut, LogIn, UserPlus, Sparkles } from "lucide-react"
import { animationRegistry } from "@/lib/animations/registry"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { type User } from "@supabase/supabase-js"

export function AppHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Don't render header in embed mode
  if (pathname.startsWith("/embed")) {
    return null
  }

  // Breadcrumbs calculation
  const isOfficialDetail = pathname.startsWith("/animations/") && pathname !== "/animations"
  const isMyAnimationDetail = pathname.startsWith("/my-animations/") && pathname !== "/my-animations"
  const isMyAnimationsIndex = pathname === "/my-animations"
  const isBuilder = pathname.startsWith("/builder")

  const officialSlug = isOfficialDetail ? pathname.split("/")[2] : null
  const officialAnim = officialSlug
    ? animationRegistry.find((item) => item.slug === officialSlug)
    : null

  let breadcrumbs: { label: string; href?: string }[] = [{ label: "Inicio", href: "/animations" }]

  if (isOfficialDetail) {
    breadcrumbs.push({ label: officialAnim?.title || dynamicTitle || "Animación" })
  } else if (isMyAnimationsIndex) {
    breadcrumbs.push({ label: "Mis Animaciones" })
  } else if (isMyAnimationDetail) {
    breadcrumbs.push({ label: "Mis Animaciones", href: "/my-animations" })
    breadcrumbs.push({ label: dynamicTitle || "Cargando animación..." })
  } else if (isBuilder) {
    breadcrumbs.push({ label: "Editor" })
    if (dynamicTitle && dynamicTitle !== "Nueva Animación de Red") {
      breadcrumbs.push({ label: dynamicTitle })
    }
  } else if (pathname === "/login") {
    breadcrumbs.push({ label: "Iniciar Sesión" })
  } else if (pathname === "/signup") {
    breadcrumbs.push({ label: "Crear Cuenta" })
  } else if (pathname === "/forgot-password") {
    breadcrumbs.push({ label: "Recuperar Contraseña" })
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
        <ThemeToggle />

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            aria-label="Menú de usuario"
          >
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 text-xs">
              {user ? (
                <>
                  <div className="border-b border-border px-3 py-2">
                    <p className="font-semibold text-foreground truncate">
                      {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/my-animations"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Mis Animaciones</span>
                    </Link>
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={async () => {
                        setMenuOpen(false)
                        await signOut()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-1 space-y-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors font-medium"
                  >
                    <LogIn className="h-3.5 w-3.5 text-primary" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Crear Cuenta</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
