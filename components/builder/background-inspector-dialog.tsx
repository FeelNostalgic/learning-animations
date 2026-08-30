"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Layers,
  RotateCcw,
  Check,
  Grid,
  SunMedium,
  Moon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import type { AnimationBackground } from "@/types/universal-animation"
import { getBackgroundInlineStyle } from "@/lib/animations/background-styles"

interface BackgroundInspectorDialogProps {
  background?: AnimationBackground
  onUpdateBackground: (bg: AnimationBackground | undefined) => void
  trigger?: React.ReactNode
}

const SOLID_PRESETS = [
  { name: "Obsidiana espacial", color: "#090D16", isDark: true },
  { name: "Deep slate", color: "#0F172A", isDark: true },
  { name: "Midnight navy", color: "#0A192F", isDark: true },
  { name: "Dark velvet", color: "#18122B", isDark: true },
  { name: "Dark emerald", color: "#06281E", isDark: true },
  { name: "Alabastro cálido", color: "#F8FAFC", isDark: false },
  { name: "Blanco puro", color: "#FFFFFF", isDark: false },
  { name: "Transparente", color: "transparent", isDark: false },
]

const GRADIENT_PRESETS = [
  { name: "Deep nebula", from: "#090D16", to: "#1E1B4B", direction: "to-br" as const },
  { name: "Midnight ocean", from: "#0A192F", to: "#0F3A5D", direction: "to-b" as const },
  { name: "Emerald matrix", from: "#051F1A", to: "#0D4236", direction: "to-br" as const },
  { name: "Warm sunset", from: "#1E130C", to: "#4A2010", direction: "to-r" as const },
  { name: "Cyber twilight", from: "#150050", to: "#3F0071", direction: "to-r" as const },
  { name: "Alabaster mist", from: "#F8FAFC", to: "#E2E8F0", direction: "to-b" as const },
]

export function BackgroundInspectorDialog({
  background,
  onUpdateBackground,
  trigger,
}: BackgroundInspectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"solid" | "gradient" | "image">(
    background?.type || "solid"
  )

  // Local state for draft editing inside the dialog
  const [solidColor, setSolidColor] = useState<string>(
    background?.type === "solid" ? background.color || "#090D16" : "#090D16"
  )
  const [solidAlpha, setSolidAlpha] = useState<number>(
    background?.opacity !== undefined ? Math.round(background.opacity * 100) : 100
  )

  const [gradientFrom, setGradientFrom] = useState<string>(
    background?.gradient?.from || "#090D16"
  )
  const [gradientTo, setGradientTo] = useState<string>(
    background?.gradient?.to || "#1E1B4B"
  )
  const [gradientDir, setGradientDir] = useState<"to-r" | "to-b" | "to-br" | "radial">(
    background?.gradient?.direction || "to-br"
  )

  const [imageUrl, setImageUrl] = useState<string>(background?.imageUrl || "")
  const [imageFit, setImageFit] = useState<"cover" | "contain" | "repeat" | "center">(
    background?.imageFit || "cover"
  )
  const [imageOpacity, setImageOpacity] = useState<number>(
    background?.opacity !== undefined ? Math.round(background.opacity * 100) : 100
  )
  const [pattern, setPattern] = useState<"none" | "grid" | "dots" | "cross">(
    background?.pattern || "none"
  )

  const [isUploading, setIsUploading] = useState(false)

  // Compute live preview background object
  const liveDraftBackground: AnimationBackground = {
    type: activeTab,
    pattern,
    ...(activeTab === "solid"
      ? {
          color: solidColor,
          opacity: solidAlpha / 100,
        }
      : {}),
    ...(activeTab === "gradient"
      ? {
          gradient: {
            from: gradientFrom,
            to: gradientTo,
            direction: gradientDir,
          },
        }
      : {}),
    ...(activeTab === "image"
      ? {
          imageUrl,
          imageFit,
          opacity: imageOpacity / 100,
          color: solidColor,
        }
      : {}),
  }

  const livePreviewStyle = getBackgroundInlineStyle(liveDraftBackground)

  // Handle local image file upload to R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setIsUploading(false)

      if (data.success && data.url) {
        setImageUrl(data.url)
        toast.success("Imagen de fondo cargada", {
          description: "La imagen ha sido asignada al fondo de la animación.",
        })
      } else {
        toast.error("Error al subir imagen", {
          description: data.error || "No se pudo procesar el archivo.",
        })
      }
    } catch {
      setIsUploading(false)
      toast.error("Error de conexión al subir la imagen")
    }
  }

  const handleApply = () => {
    onUpdateBackground(liveDraftBackground)
    setIsOpen(false)
    toast.success("Fondo de animación actualizado")
  }

  const handleResetToDefault = () => {
    onUpdateBackground(undefined)
    setSolidColor("#090D16")
    setSolidAlpha(100)
    setImageUrl("")
    setPattern("none")
    setIsOpen(false)
    toast.info("Fondo restablecido por defecto")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs font-semibold cursor-pointer"
            title="Configurar color o imagen de fondo del lienzo"
          >
            <Palette className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Fondo</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg select-none">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="size-5" />
            </div>
            <div>
              <DialogTitle>Personalizar fondo de animación</DialogTitle>
              <DialogDescription>
                Ajusta el color sólido con canal alpha, degradados o imágenes personalizadas para tu animación.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Live Preview Box ─────────────────────────────────────── */}
        <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-border shadow-inner flex items-center justify-center">
          {/* Background Layer */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              ...livePreviewStyle,
              opacity: activeTab === "image" ? imageOpacity / 100 : activeTab === "solid" ? solidAlpha / 100 : 1,
            }}
          />

          {/* Decorative Pattern overlay */}
          {pattern === "grid" && (
            <div className="absolute inset-0 bg-radial-grid opacity-30 pointer-events-none" />
          )}

          {/* Foreground Mock Elements to show contrast */}
          <div className="relative z-10 flex items-center gap-3 bg-card/75 backdrop-blur-md px-4 py-2 rounded-xl border border-border/80 shadow-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Previsualización de contraste</p>
              <p className="text-[10px] text-muted-foreground">Legibilidad del diagrama sobre este fondo</p>
            </div>
          </div>
        </div>

        {/* ── Tabs for Background Mode ─────────────────────────────── */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "solid" | "gradient" | "image")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solid" className="gap-1.5 text-xs">
              <SunMedium className="size-3.5" />
              <span>Color sólido</span>
            </TabsTrigger>
            <TabsTrigger value="gradient" className="gap-1.5 text-xs">
              <Sparkles className="size-3.5" />
              <span>Degradado</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5 text-xs">
              <ImageIcon className="size-3.5" />
              <span>Imagen</span>
            </TabsTrigger>
          </TabsList>

          {/* ── 1. Color Sólido / Alpha ─────────────────────────────── */}
          <TabsContent value="solid" className="space-y-4 pt-2">
            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Paletas recomendadas
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SOLID_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setSolidColor(p.color)
                    }}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-all cursor-pointer ${
                      solidColor === p.color
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card/60 hover:bg-muted"
                    }`}
                  >
                    <span
                      className="size-4 rounded-full border border-border shrink-0 shadow-xs"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate text-[11px] font-semibold text-foreground">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input & Alpha Slider */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Color personalizado (Hex)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/80 p-1.5 shadow-xs">
                  <input
                    type="color"
                    value={solidColor.startsWith("#") ? solidColor : "#090D16"}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-foreground focus:outline-none"
                    placeholder="#090D16"
                  />
                </div>
              </div>

              {/* Alpha Channel Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span className="uppercase tracking-wider">Opacidad / alpha</span>
                  <span className="font-mono text-foreground">{solidAlpha}%</span>
                </div>
                <Slider
                  value={[solidAlpha]}
                  onValueChange={([val]) => setSolidAlpha(val)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── 2. Degradado ────────────────────────────────────────── */}
          <TabsContent value="gradient" className="space-y-4 pt-2">
            {/* Gradient Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Estilos de degradado
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => {
                      setGradientFrom(g.from)
                      setGradientTo(g.to)
                      setGradientDir(g.direction)
                    }}
                    className="flex flex-col gap-1 rounded-xl border border-border p-2 text-left transition-all hover:border-primary/50 cursor-pointer bg-card/60"
                  >
                    <div
                      className="h-6 w-full rounded-lg border border-border shadow-xs"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${g.from}, ${g.to})`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-foreground truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom From / To / Direction */}
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Color inicial</label>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background p-1">
                  <input
                    type="color"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="h-6 w-6 rounded bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="w-full font-mono text-[10px] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Color final</label>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background p-1">
                  <input
                    type="color"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="h-6 w-6 rounded bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="w-full font-mono text-[10px] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Dirección</label>
                <select
                  value={gradientDir}
                  onChange={(e) => setGradientDir(e.target.value as any)}
                  className="w-full h-8 rounded-xl border border-border bg-background px-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="to-r">Horizontal (→)</option>
                  <option value="to-b">Vertical (↓)</option>
                  <option value="to-br">Diagonal (↘)</option>
                  <option value="radial">Radial (⊙)</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* ── 3. Imagen de Fondo ──────────────────────────────────── */}
          <TabsContent value="image" className="space-y-3.5 pt-2">
            {/* File Upload or URL input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Subir imagen (Cloudflare R2) o URL externa
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent cursor-pointer shrink-0">
                  <Upload className="size-3.5 text-primary" />
                  <span>{isUploading ? "Subiendo..." : "Seleccionar archivo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... o pega URL de imagen"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Image Fit & Opacity Slider */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ajuste de imagen
                </label>
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                  {(["cover", "contain", "repeat"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setImageFit(fit)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        imageFit === fit ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      {fit === "cover" ? "Cubrir" : fit === "contain" ? "Ajustar" : "Mosaico"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span className="uppercase tracking-wider">Opacidad de imagen</span>
                  <span className="font-mono text-foreground">{imageOpacity}%</span>
                </div>
                <Slider
                  value={[imageOpacity]}
                  onValueChange={([val]) => setImageOpacity(val)}
                  min={10}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Decorative Pattern Selector ──────────────────────────── */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Grid className="size-3 text-primary" />
              <span>Patrón de rejilla técnico</span>
            </label>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
              {(["none", "grid", "dots"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPattern(p)}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    pattern === p ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  {p === "none" ? "Liso" : p === "grid" ? "Rejilla" : "Puntos"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer Actions ───────────────────────────────────────── */}
        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Por defecto</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs font-semibold cursor-pointer"
            >
              <Check className="size-3.5 mr-1" />
              <span>Aplicar fondo</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
