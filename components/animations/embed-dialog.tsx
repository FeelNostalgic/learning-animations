"use client"

import { useState } from "react"
import { Code, Copy, Check, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  if (!isOpen) return null

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const embedUrl = `${origin}/embed/${slugOrId}`
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="520" frameborder="0" allowfullscreen></iframe>`

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet)
      setCopiedSnippet(true)
      setTimeout(() => setCopiedSnippet(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2500)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Incrustar Animación</h3>
              <p className="text-[11px] text-muted-foreground">
                Copia el código iframe o el enlace directo para incrustar esta animación.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Snippet Code Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Código HTML (iFrame)
            </label>
            <span className="text-[10px] text-muted-foreground">Arrastra o copia</span>
          </div>
          <div className="relative rounded-xl border border-border bg-background p-3 font-mono text-[11px] text-foreground break-all select-text cursor-text">
            {iframeSnippet}
          </div>
        </div>

        {/* URL Box with direct Copy button */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Enlace Directo
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-2.5 py-1.5 font-mono text-[10px] text-foreground">
            <span className="truncate flex-1 select-text cursor-text">{embedUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-accent transition-colors shrink-0 cursor-pointer"
              title="Copiar enlace"
            >
              {copiedUrl ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={handleCopySnippet}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copiedSnippet ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar iFrame</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
