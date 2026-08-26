import { AppLayoutShell } from "@/components/app-layout-shell"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta",
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>
}
