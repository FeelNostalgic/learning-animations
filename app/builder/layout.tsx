import { AppHeader } from "@/components/app-header"

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
