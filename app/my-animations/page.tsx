import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserAnimations } from "@/app/builder/actions"
import { createClient } from "@/lib/supabase/server"
import { Sparkles, PenTool, Network, Plus, Calendar } from "lucide-react"

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
    <div className="mx-auto w-full max-w-7xl select-none">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Mis Animaciones</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            Gestiona, visualiza y edita las animaciones de red que has creado.
          </p>
        </div>

        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Nueva Animación</span>
        </Link>
      </div>

      {/* ── Animations Grid ──────────────────────────────────────── */}
      {animations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animations.map((anim) => {
            const dateStr = anim.updated_at
              ? new Date(anim.updated_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null

            return (
              <div
                key={anim.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase tracking-wider">
                    {anim.topic}
                  </span>
                  <Link
                    href={`/builder?id=${anim.id}`}
                    className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors cursor-pointer"
                    title="Editar en el Constructor"
                  >
                    <PenTool className="size-3.5" />
                  </Link>
                </div>

                <Link href={`/my-animations/${anim.id}`} className="block flex-1 cursor-pointer">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                    {anim.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {anim.description || "Sin descripción pedagógica."}
                  </p>
                </Link>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span className="font-medium">{anim.steps.length} pasos</span>
                  {dateStr && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>{dateStr}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────────── */
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Network className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Aún no has creado ninguna animación</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Utiliza el editor visual para arrastrar dispositivos, conectar nodos y diseñar secuencias de paquetes interactivas.
          </p>
          <Link
            href="/builder"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Crear mi primera animación</span>
          </Link>
        </div>
      )}
    </div>
  )
}
