import { AppLayoutShell } from "@/components/app-layout-shell"

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayoutShell fullHeight>{children}</AppLayoutShell>
}
