import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      {children}
    </div>
  )
}
