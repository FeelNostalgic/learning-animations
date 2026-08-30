"use client"

import { useActionState, useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { signup, checkUsernameAvailability } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react"

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    error?: string
  }>({
    checking: false,
    available: null,
  })
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checking: false, available: null })
      return
    }

    setUsernameStatus({ checking: true, available: null })

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const res = await checkUsernameAvailability(username)
        setUsernameStatus({
          checking: false,
          available: res.available,
          error: res.error,
        })
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [username])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Únete para diseñar y publicar animaciones interactivas
          </p>
        </div>

        {state?.error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">¡Cuenta creada con éxito!</p>
              <p className="text-xs">Revisa tu correo electrónico para confirmar tu cuenta o inicia sesión.</p>
              <Link href="/login" className="mt-2 inline-block font-semibold underline">
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="username">
                  Nombre de usuario (único)
                </label>
                {usernameStatus.checking && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Comprobando...
                  </span>
                )}
                {!usernameStatus.checking && usernameStatus.available === true && (
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" /> Disponible
                  </span>
                )}
                {!usernameStatus.checking && usernameStatus.available === false && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" /> {usernameStatus.error || "No disponible"}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. network_guru"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || usernameStatus.checking || usernameStatus.available === false}
              className="w-full gap-2"
            >
              {isPending ? "Creando cuenta..." : "Registrarse"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
