import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AnimationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm font-medium text-foreground">Animaciones</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
