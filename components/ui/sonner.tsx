"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group select-none"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="size-4 text-destructive shrink-0" />,
        warning: <AlertTriangle className="size-4 text-amber-500 shrink-0" />,
        info: <Info className="size-4 text-primary shrink-0" />,
        loading: <Loader2 className="size-4 animate-spin text-primary shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:text-xs group-[.toaster]:font-medium",
          title: "font-bold text-foreground text-xs",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[11px] leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
