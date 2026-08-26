import { AppLayoutShell } from "@/components/app-layout-shell"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesión",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>
}
