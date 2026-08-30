import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserAnimations } from "@/app/builder/actions"
import { createClient } from "@/lib/supabase/server"
import { Sparkles, Plus } from "lucide-react"
import { UserAnimationsDashboard } from "@/components/my-animations/user-animations-dashboard"

export default async function MyAnimationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/my-animations")
  }

  const res = await getUserAnimations()
  const animations = res.data || []

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 select-none space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Mis animaciones</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            Gestiona, visualiza, duplica y edita las animaciones interactivas que has creado.
          </p>
        </div>

        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Nueva animación</span>
        </Link>
      </div>

      {/* ── Interactive Dashboard with Free Custom Topics & Privacy ── */}
      <UserAnimationsDashboard initialAnimations={animations} />
    </div>
  )
}
