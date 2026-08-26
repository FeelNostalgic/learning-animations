import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta",
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      {children}
    </div>
  )
}
