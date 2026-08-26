import { AppLayoutShell } from "@/components/app-layout-shell"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mis Animaciones",
}

export default function MyAnimationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayoutShell>{children}</AppLayoutShell>
}
