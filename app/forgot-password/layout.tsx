import { AppLayoutShell } from "@/components/app-layout-shell"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>
}
