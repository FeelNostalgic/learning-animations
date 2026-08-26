"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface AppLayoutShellProps {
  children: React.ReactNode
  fullHeight?: boolean
}

export function AppLayoutShell({ children, fullHeight = false }: AppLayoutShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ── Left Fixed Expandable Sidebar (w-12 / hover:w-56) ─── */}
      <AppSidebar />

      {/* ── Main Content Area with reserved 48px left gutter ─── */}
      <div className="flex-1 flex flex-col pl-12 min-w-0">
        <AppHeader />
        <main className={fullHeight ? "flex-1 overflow-hidden" : "flex-1 p-6"}>
          {children}
        </main>
      </div>
    </div>
  )
}
