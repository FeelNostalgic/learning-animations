"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { login } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, User, AlertCircle, Sparkles } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/animations"
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">
            Accede para crear y publicar tus propias animaciones
          </p>
        </div>

        {state?.error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="identifier">
              Usuario o Correo Electrónico
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                placeholder="usuario o nombre@correo.com"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                Contraseña
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste la contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending ? "Iniciando sesión..." : "Entrar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
