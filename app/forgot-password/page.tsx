"use client"

import { useActionState } from "react"
import Link from "next/link"
import { forgotPassword } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Introduce tu correo y te enviaremos un enlace de recuperación
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
              <p className="font-semibold">Correo enviado</p>
              <p className="text-xs">Si la cuenta existe, recibirás las instrucciones para restablecer tu contraseña.</p>
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
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

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Enviando enlace..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
