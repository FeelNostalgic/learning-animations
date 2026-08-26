"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { createClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface AppLayoutShellProps {
  children: React.ReactNode
  fullHeight?: boolean
}

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"]

export function AppLayoutShell({ children, fullHeight = false }: AppLayoutShellProps) {
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

  const isEmbed = pathname.startsWith("/embed")
  const isAuth = AUTH_PATHS.includes(pathname)
  const showSidebar = !isEmbed && !isAuth && Boolean(user)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ── Left Fixed Expandable Sidebar (Only for logged-in users) ─── */}
      {showSidebar && <AppSidebar />}

      {/* ── Main Content Area (pl-12 only when sidebar is active) ─── */}
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-200", showSidebar && "pl-12")}>
        <AppHeader />
        <main className={fullHeight ? "flex-1 overflow-hidden" : "flex-1 p-6"}>
          {children}
        </main>
      </div>
    </div>
  )
}
