"use client"

import React, { useState } from "react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { Button } from "@/components/ui/button"
import {
  Sliders,
  HelpCircle,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react"

export function LiveInteractiveSandbox() {
  // ── 1. Variable Slider State ─────────────────────────────────────
  const [sliderA, setSliderA] = useState<number>(1)
  const [sliderK, setSliderK] = useState<number>(-4)
  const [sliderC, setSliderC] = useState<number>(4)

  const discriminant = sliderK * sliderK - 4 * sliderA * sliderC
  const vertexX = (-sliderK / (2 * sliderA)).toFixed(2)
  const vertexY = (sliderA * Math.pow(+vertexX, 2) + sliderK * +vertexX + sliderC).toFixed(2)

  // ── 2. Interactive Quiz State ────────────────────────────────────
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const quizQuestion = {
    prompt: "¿Cuál es la principal ventaja de utilizar conexiones Bézier paramétricas frente a líneas rectas?",
    options: [
      {
        id: "opt-1",
        text: "Permiten que los paquetes sigan curvas visuales elegantes evitando solaparse con nodos intermedios.",
        isCorrect: true,
        feedback: "¡Exacto! El muestreo paramétrico B(t) guía las partículas a lo largo de la curvatura del diseño sin colisiones visuales.",
      },
      {
        id: "opt-2",
        text: "Hacen que la animación tarde exactamente la mitad de tiempo en reproducirse.",
        isCorrect: false,
        feedback: "Incorrecto. La duración se controla mediante la propiedad duration del paso o acción.",
      },
      {
        id: "opt-3",
        text: "Solo funcionan con nodos circulares y no con rectángulos ni fórmulas.",
        isCorrect: false,
        feedback: "Incorrecto. El motor universal conecta cualquier tipo de nodo (KaTeX, Markdown, Redes, Imágenes).",
      },
    ],
  }

  const handleSelectOption = (optId: string) => {
    if (hasSubmitted) return
    setSelectedOption(optId)
  }

  const handleSubmitQuiz = () => {
    if (!selectedOption) return
    setHasSubmitted(true)
  }

  const handleResetQuiz = () => {
    setSelectedOption(null)
    setHasSubmitted(false)
  }

  // ── 3. Decision Branching State ──────────────────────────────────
  const [selectedBranch, setSelectedBranch] = useState<"tcp" | "udp">("tcp")

  return (
    <div className="space-y-8">
      {/* ── Demo 1: Variable Slider with Live Math & Graph Evaluation ── */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Sliders className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Demo 1: Variable Slider & Evaluación Dinámica en Tiempo Real
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Mueve los deslizadores para recalcular la fórmula KaTeX y sus propiedades algebraicas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
          {/* Controls */}
          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              Parámetros de la Ecuación Cuadrática
            </h4>

            {/* Slider a */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-foreground">
                <span>Coeficiente cuadrático ($a$)</span>
                <span className="font-mono font-bold text-primary">{sliderA}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={sliderA}
                onChange={(e) => setSliderA(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-border cursor-pointer accent-primary"
              />
            </div>

            {/* Slider k */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-foreground">
                <span>Coeficiente lineal ($b$)</span>
                <span className="font-mono font-bold text-primary">{sliderK}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={sliderK}
                onChange={(e) => setSliderK(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-border cursor-pointer accent-primary"
              />
            </div>

            {/* Slider c */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-foreground">
                <span>Término independiente ($c$)</span>
                <span className="font-mono font-bold text-primary">{sliderC}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={sliderC}
                onChange={(e) => setSliderC(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-border cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Dynamic Live Formula & Analysis */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-5 space-y-4 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Expresión Algebraica Resultante
              </span>
              <div className="mt-2 flex items-center justify-center rounded-xl border border-primary/20 bg-primary/5 py-4 text-center">
                <MarkdownView
                  inline
                  content={`$$f(x) = ${sliderA !== 1 ? sliderA : ""}x^2 ${sliderK >= 0 ? "+" : ""}${sliderK}x ${sliderC >= 0 ? "+" : ""}${sliderC}$$`}
                />
              </div>
            </div>

            {/* Calculated Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-border bg-card p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">Discriminante ($\Delta$)</span>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                  {discriminant} {discriminant > 0 ? "(2 raíces)" : discriminant === 0 ? "(1 raíz doble)" : "(Sin raíces reales)"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">Vértice $(h, k)$</span>
                <p className="font-mono text-sm font-bold text-primary mt-0.5">
                  ({vertexX}, {vertexY})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Demo 2: Interactive In-Step Quiz ─────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Demo 2: Quiz de Evaluación Pedagógica con Feedback Inmediato
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Evalúa la comprensión del estudiante antes de permitir el avance al siguiente paso
              </p>
            </div>
          </div>

          {hasSubmitted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetQuiz}
              className="h-7 text-xs cursor-pointer"
            >
              <RotateCcw className="size-3 mr-1" />
              Reintentar
            </Button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {quizQuestion.prompt}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {quizQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id
              let optStyle = "border-border bg-card hover:border-primary/50 hover:bg-accent/40"

              if (hasSubmitted) {
                if (opt.isCorrect) {
                  optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                } else if (isSelected && !opt.isCorrect) {
                  optStyle = "border-destructive bg-destructive/10 text-destructive font-semibold"
                } else {
                  optStyle = "border-border/40 opacity-50 bg-card"
                }
              } else if (isSelected) {
                optStyle = "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={hasSubmitted}
                  className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer ${optStyle}`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span>{opt.text}</span>
                    {hasSubmitted && isSelected && (
                      <p
                        className={`text-[11px] font-medium pt-1 ${
                          opt.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                        }`}
                      >
                        {opt.feedback}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Submit Button */}
          {!hasSubmitted && (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!selectedOption}
              className="w-full h-9 text-xs font-semibold cursor-pointer"
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Comprobar Respuesta
            </Button>
          )}
        </div>
      </div>

      {/* ── Demo 3: Interactive Decision Tree & Flow Branching ─────── */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <GitBranch className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Demo 3: Bifurcación de Ruta & Decisión Condicional
              </h3>
              <p className="text-[11px] text-muted-foreground">
                El usuario elige qué camino seguir (ej. TCP Confiable vs UDP Tiempo Real)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => setSelectedBranch("tcp")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedBranch === "tcp"
                  ? "bg-card text-blue-500 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ruta TCP
            </button>
            <button
              onClick={() => setSelectedBranch("udp")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedBranch === "udp"
                  ? "bg-card text-amber-500 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ruta UDP
            </button>
          </div>
        </div>

        <div className="p-5">
          {selectedBranch === "tcp" ? (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                <Sparkles className="size-3.5" />
                <span>Protocolo TCP Seleccionado (Orientado a Conexión)</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                El motor compila la secuencia de 3 vías (SYN $\to$ SYN-ACK $\to$ ACK), garantizando entrega ordenada y control de congestión mediante números de secuencia.
              </p>
              <div className="font-mono text-[11px] text-muted-foreground pt-1">
                Pasos: [1. SYN Handshake, 2. ACK Confirm, 3. Flujo Confiable]
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                <Sparkles className="size-3.5" />
                <span>Protocolo UDP Seleccionado (Sin Conexión / Datagramas)</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                El motor envía datagramas de inmediato sin establecimiento previo de sesión, optimizando la latencia para streaming o VoIP en tiempo real.
              </p>
              <div className="font-mono text-[11px] text-muted-foreground pt-1">
                Pasos: [1. Emisión Inmediata de Datagrama, 2. Recepción sin ACK]
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
