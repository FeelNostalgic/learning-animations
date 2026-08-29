"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Compass, Layers, PenTool, Network, Sparkles, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"

interface NavItem {
  label: string
  href: string
  icon: typeof Compass
  matchPath: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Inicio",
    href: "/animations",
    icon: Compass,
    matchPath: (p) => p === "/animations" || p.startsWith("/animations/"),
  },
  {
    label: "Mis Animaciones",
    href: "/my-animations",
    icon: Sparkles,
    matchPath: (p) => p === "/my-animations" || p.startsWith("/my-animations/"),
  },
  {
    label: "Editor Studio",
    href: "/builder",
    icon: PenTool,
    matchPath: (p) => p === "/builder" || p.startsWith("/builder/"),
  },
]

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"]

export function AppSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Do not render sidebar on embed, auth pages, or for non-logged-in visitors
  if (pathname.startsWith("/embed") || AUTH_PATHS.includes(pathname) || !user) {
    return null
  }

  return (
    <aside
      className="group fixed left-0 top-0 bottom-0 z-40 flex w-12 flex-col justify-between border-r border-border bg-card/95 py-2 shadow-xs backdrop-blur-md transition-all duration-200 ease-out hover:w-56 hover:shadow-2xl overflow-hidden select-none"
      aria-label="Barra lateral de navegación"
    >
      {/* ── Top: Logo / Brand ────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <Link
          href="/animations"
          className="flex h-10 w-full items-center gap-3 px-3 text-primary transition-colors hover:text-primary/90"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Network className="h-4 w-4" />
          </div>
          <span className="font-mono text-xs font-bold tracking-tight text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
            NET-ANIM
          </span>
        </Link>

        {/* ── Navigation Links ─────────────────────────────────────── */}
        <nav className="flex flex-col gap-1 px-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.matchPath(pathname)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 w-full items-center gap-3 rounded-lg px-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                title={item.label}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Bottom Section ───────────────────────────────────────── */}
      <div className="px-1.5">
        <div className="flex h-8 items-center gap-3 px-2 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap font-mono">
            v1.3.0
          </span>
        </div>
      </div>
    </aside>
  )
}
