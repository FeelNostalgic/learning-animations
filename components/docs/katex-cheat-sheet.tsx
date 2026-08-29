"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { MarkdownView } from "@/components/ui/markdown-view"
import {
  Copy,
  Check,
  Sigma,
  Sparkles,
  BookOpen,
  Terminal,
} from "lucide-react"

interface MathSnippet {
  title: string
  code: string
  description: string
}

const KATEX_CATEGORIES: { name: string; items: MathSnippet[] }[] = [
  {
    name: "Álgebra y Funciones",
    items: [
      {
        title: "Fórmula Cuadrática",
        code: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        description: "Solución general para ecuaciones de segundo grado",
      },
      {
        title: "Logaritmos y Exponentes",
        code: "\\log_b(x \\cdot y) = \\log_b(x) + \\log_b(y)",
        description: "Propiedad aditiva de logaritmos",
      },
      {
        title: "Polinomio de Taylor",
        code: "P_n(x) = \\sum_{k=0}^n \\frac{f^{(k)}(a)}{k!}(x-a)^k",
        description: "Aproximación polinómica en torno a x = a",
      },
    ],
  },
  {
    name: "Cálculo y Análisis",
    items: [
      {
        title: "Definición de Derivada",
        code: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        description: "Límite del cociente incremental",
      },
      {
        title: "Teorema Fundamental del Cálculo",
        code: "\\int_a^b f(x)\\,dx = F(b) - F(a)",
        description: "Conexión entre derivación e integración",
      },
      {
        title: "Integral Impropia Gaussiana",
        code: "\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}",
        description: "Distribución normal estándar",
      },
    ],
  },
  {
    name: "Física y Ondas",
    items: [
      {
        title: "Ecuación de Onda",
        code: "\\frac{\\partial^2 u}{\\partial t^2} = v^2 \\nabla^2 u",
        description: "Propagación de ondas electromagnéticas o acústicas",
      },
      {
        title: "Ley de Gravitación Universal",
        code: "F = G \\frac{m_1 m_2}{r^2}",
        description: "Fuerza gravitatoria entre dos masas puntuales",
      },
      {
        title: "Principio de Incertidumbre",
        code: "\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}",
        description: "Límite cuántico de precisión",
      },
    ],
  },
  {
    name: "Redes y Computación",
    items: [
      {
        title: "Tiempo de Transmisión de Paquete",
        code: "T_{\\text{tx}} = \\frac{L}{R} = \\frac{\\text{Longitud (bits)}}{\\text{Tasa (bps)}}",
        description: "Tiempo para inyectar un paquete en el enlace",
      },
      {
        title: "Retardo de Propagación",
        code: "T_{\\text{prop}} = \\frac{d}{s} = \\frac{\\text{Distancia (m)}}{\\text{Velocidad de señal (m/s)}}",
        description: "Tiempo de viaje de la señal por el medio físico",
      },
      {
        title: "Teorema de Shannon-Hartley",
        code: "C = B \\log_2\\left(1 + \\frac{S}{N}\\right)",
        description: "Capacidad máxima teórica de un canal ruidoso",
      },
    ],
  },
  {
    name: "Matrices y Álgebra Lineal",
    items: [
      {
        title: "Matriz de Transformación 2D",
        code: "\\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}",
        description: "Matriz de rotación en el plano cartesiano",
      },
      {
        title: "Ecuación de Autovalores",
        code: "A\\mathbf{v} = \\lambda\\mathbf{v}",
        description: "Vectores y valores propios de una matriz",
      },
    ],
  },
]

export function KatexCheatSheet() {
  const [activeCategory, setActiveCategory] = useState(KATEX_CATEGORIES[0].name)
  const [customMath, setCustomMath] = useState("\\int_0^{\\infty} x^2 e^{-x}\\,dx = 2")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string, title?: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Fórmula KaTeX copiada", {
      description: title ? `"${title}" copiada al portapapeles.` : `LaTeX: ${code}`,
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const currentCategoryData = KATEX_CATEGORIES.find((c) => c.name === activeCategory) || KATEX_CATEGORIES[0]

  return (
    <div className="space-y-8">
      {/* ── Interactive KaTeX Sandbox / Live Playground ──────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Editor KaTeX en Vivo (Playground)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Escribe cualquier fórmula matemática para probar el renderizado instantáneo
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {/* Input Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              Código KaTeX
            </label>
            <textarea
              rows={4}
              value={customMath}
              onChange={(e) => setCustomMath(e.target.value)}
              placeholder="Escribe código KaTeX..."
              className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:border-primary focus:outline-none resize-none shadow-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Puedes copiar y pegar esta fórmula directamente en cualquier nodo matemático del Studio
            </p>
          </div>

          {/* Rendered Preview */}
          <div className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Resultado Renderizado
              </label>
              <button
                onClick={() => handleCopy(customMath)}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {copiedCode === customMath ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copiar código</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center overflow-x-auto">
              <MarkdownView inline content={`$$${customMath}$$`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Categorized Reference Library ────────────────────────── */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
          {KATEX_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === cat.name
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Snippet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCategoryData.items.map((item, idx) => {
            const isCopied = copiedCode === item.code

            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                      title="Copiar código KaTeX"
                    >
                      {isCopied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Rendered Math Formula */}
                  <div className="flex items-center justify-center rounded-xl bg-muted/30 py-3 px-2 text-center overflow-x-auto min-h-[60px]">
                    <MarkdownView inline content={`$${item.code}$`} />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {item.description}
                  </p>
                </div>

                {/* Raw KaTeX Code Box */}
                <div className="mt-3 rounded-lg bg-background/80 p-2 font-mono text-[10px] text-primary truncate border border-border/60">
                  {item.code}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
