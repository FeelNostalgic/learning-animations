import { AppHeader } from "@/components/app-header"

export default function AnimationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
