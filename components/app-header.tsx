"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, User as UserIcon, LogOut, Plus, LogIn, UserPlus } from "lucide-react"
import { animationRegistry } from "@/lib/animations/registry"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { type User } from "@supabase/supabase-js"

export function AppHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Breadcrumbs calculation
  const isAnimationDetail = pathname.startsWith("/animations/") && pathname !== "/animations"
  const slug = isAnimationDetail ? pathname.split("/")[2] : null
  const currentAnimation = slug
    ? animationRegistry.find((item) => item.slug === slug)
    : null

  let secondBreadcrumb: string | null = null
  if (isAnimationDetail) {
    secondBreadcrumb = currentAnimation?.title ?? slug
  } else if (pathname.startsWith("/builder")) {
    secondBreadcrumb = "Constructor"
  } else if (pathname === "/login") {
    secondBreadcrumb = "Iniciar Sesión"
  } else if (pathname === "/signup") {
    secondBreadcrumb = "Crear Cuenta"
  } else if (pathname === "/forgot-password") {
    secondBreadcrumb = "Recuperar Contraseña"
  }

  const isHome = pathname === "/animations" || pathname === "/"

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
      <nav aria-label="Migas de pan" className="flex items-center">
        <ol className="flex items-center gap-2 text-sm">
          {!isHome ? (
            <>
              <li>
                <Link
                  href="/animations"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Inicio
                </Link>
              </li>
              {secondBreadcrumb && (
                <>
                  <li aria-hidden="true">
                    <ChevronRight className="size-4 text-muted-foreground/60" />
                  </li>
                  <li aria-current="page">
                    <span className="font-semibold text-foreground">
                      {secondBreadcrumb}
                    </span>
                  </li>
                </>
              )}
            </>
          ) : (
            <li aria-current="page">
              <span className="font-semibold text-foreground">Inicio</span>
            </li>
          )}
        </ol>
      </nav>

      <div className="flex items-center gap-3">
        {pathname !== "/builder" && (
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>Crear Animación</span>
          </Link>
        )}

        <ThemeToggle />

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                      href="/builder"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      <span>Constructor de Animaciones</span>
                    </Link>
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={async () => {
                        setMenuOpen(false)
                        await signOut()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left"
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
