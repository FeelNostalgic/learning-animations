"use client"

import { Code, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EmbedDialogProps {
  slugOrId: string
  isOpen: boolean
  onClose: () => void
}

export function EmbedDialog({
  slugOrId,
  isOpen,
  onClose,
}: EmbedDialogProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const embedUrl = `${origin}/embed/${slugOrId}`
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="520" frameborder="0" allowfullscreen></iframe>`

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet)
      toast.success("Código iFrame copiado", {
        description: "Pega este snippet en tu LMS, blog o sitio web.",
      })
    } catch {
      toast.error("No se pudo copiar el código")
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl)
      toast.success("Enlace de incrustación copiado", {
        description: "Enlace directo copiado al portapapeles.",
      })
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md select-none">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code className="size-5" />
            </div>
            <div>
              <DialogTitle>Incrustar Animación</DialogTitle>
              <DialogDescription>
                Copia el código iframe o el enlace directo para incrustar esta animación interactiva.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Snippet Code Box */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Código HTML (iFrame)
            </label>
            <span className="text-[10px] text-muted-foreground font-mono">100% Responsive</span>
          </div>
          <div className="relative rounded-xl border border-border bg-background/80 p-3 font-mono text-[11px] text-foreground break-all select-text cursor-text shadow-xs">
            {iframeSnippet}
          </div>
        </div>

        {/* URL Box with direct Copy button */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Enlace Directo
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 font-mono text-[10px] text-foreground">
            <span className="truncate flex-1 select-text cursor-text">{embedUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="h-7 px-2 text-muted-foreground hover:text-primary cursor-pointer"
              title="Copiar enlace directo"
            >
              <Copy className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={handleCopySnippet}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Copy className="size-3.5" />
            <span>Copiar iFrame</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
