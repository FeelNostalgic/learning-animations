"use client"

import React, { useState, useEffect } from "react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { Button } from "@/components/ui/button"
import {
  Sliders,
  HelpCircle,
  GitFork,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
} from "lucide-react"
import type { UniversalInteraction, QuizOption } from "@/types/universal-animation"
import { InteractionRuntime, type QuizSubmissionResult } from "@/lib/animations/interaction-runtime"
import { cn } from "@/lib/utils"

interface InteractionOverlayProps {
  stepId: string
  interaction?: UniversalInteraction
  runtime: InteractionRuntime
  onStepUnlocked?: () => void
  onJumpToStep?: (targetStepId: string) => void
  className?: string
}

export function InteractionOverlay({
  stepId,
  interaction,
  runtime,
  onStepUnlocked,
  onJumpToStep,
  className,
}: InteractionOverlayProps) {
  // Slider state
  const [sliderValue, setSliderValue] = useState<number>(0)

  // Quiz state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null)

  // Register interaction on mount or step change
  useEffect(() => {
    if (!interaction) return
    runtime.registerInteraction(stepId, interaction)

    if (interaction.type === "variable_slider" && interaction.variableName) {
      const current = runtime.getVariable(interaction.variableName) as number
      setSliderValue(current ?? interaction.defaultValue ?? interaction.min ?? 0)
    }

    setSelectedOptionId(null)
    setQuizResult(null)
  }, [stepId, interaction, runtime])

  if (!interaction) return null

  // ── 1. Variable Slider Interaction ─────────────────────────────────────
  if (interaction.type === "variable_slider" && interaction.variableName) {
    const min = interaction.min ?? 0
    const max = interaction.max ?? 100
    const step = interaction.step ?? 1
    const unit = interaction.unit ? ` ${interaction.unit}` : ""
    const varName = interaction.variableName

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      setSliderValue(val)
      runtime.setVariable(varName, val)
    }

    const handleReset = () => {
      const defVal = interaction.defaultValue ?? min
      setSliderValue(defVal)
      runtime.setVariable(varName, defVal)
    }

    return (
      <div
        className={cn(
          "rounded-xl border border-primary/30 bg-card/95 p-3.5 shadow-lg backdrop-blur-md transition-all",
          className
        )}
        role="region"
        aria-label={`Control interactivo de la variable ${varName}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sliders className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Variable: <code className="font-mono text-primary font-semibold">{varName}</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              {sliderValue}
              {unit}
            </span>
            <button
              onClick={handleReset}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Restablecer valor inicial"
            >
              <RotateCcw className="size-3" />
            </button>
          </div>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleSliderChange}
          aria-label={`Ajustar ${varName}`}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(0,112,243,0.2)]"
        />

        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    )
  }

  // ── 2. Interactive Quiz Interaction ────────────────────────────────────
  if (interaction.type === "quiz" && interaction.options) {
    const handleSelectOption = (optId: string) => {
      if (quizResult?.isCorrect) return // Prevent changing once completed
      setSelectedOptionId(optId)
      const res = runtime.submitQuizAnswer(stepId, optId)
      setQuizResult(res)
      if (res.isCorrect && onStepUnlocked) {
        onStepUnlocked()
      }
    }

    return (
      <div
        className={cn(
          "rounded-xl border border-primary/40 bg-card/95 p-4 shadow-xl backdrop-blur-md transition-all max-w-lg",
          className
        )}
        role="region"
        aria-label="Cuestionario interactivo"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <HelpCircle className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">
            Reto Conceptual
          </span>
        </div>

        {/* Question Text with KaTeX and Markdown */}
        <div className="mb-3 text-xs md:text-sm font-medium text-foreground">
          <MarkdownView content={interaction.question || ""} />
        </div>

        {/* Options List */}
        <div className="space-y-2" role="radiogroup" aria-label="Opciones de respuesta">
          {interaction.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id
            const isCorrect = quizResult?.isCorrect && isSelected
            const isWrong = quizResult && !quizResult.isCorrect && isSelected

            return (
              <button
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all cursor-pointer",
                  !isSelected && "border-border/80 bg-background/80 hover:border-primary/50 hover:bg-accent/40",
                  isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold",
                  isWrong && "border-destructive bg-destructive/10 text-destructive font-semibold"
                )}
              >
                <div className="flex-1 pr-2">
                  <MarkdownView inline content={opt.text} />
                </div>
                {isCorrect && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                {isWrong && <AlertCircle className="size-4 text-destructive shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Feedback Message */}
        {quizResult && (
          <div
            aria-live="polite"
            className={cn(
              "mt-3 flex items-start gap-2 rounded-lg p-2.5 text-xs",
              quizResult.isCorrect
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-destructive/10 text-destructive border border-destructive/30"
            )}
          >
            {quizResult.isCorrect ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">
              <MarkdownView inline content={quizResult.feedback} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── 3. Branch — automatic single jump (no user choice) ─────────────
  if (interaction.type === "branch_choice") {
    const raw = interaction as unknown as Record<string, unknown>
    const targetStepId = (raw.targetStepId as string) || (interaction.choices?.[0]?.targetStepId as string) || ""
    const hasInvalid = !targetStepId || targetStepId.trim() === ""

    useEffect(() => {
      if (hasInvalid) return
      const target = runtime.getBranchTarget(stepId)
      if (target && onJumpToStep) {
        // microtask auto-jump — no user click required
        const t = setTimeout(() => onJumpToStep(target), 0)
        return () => clearTimeout(t)
      }
    }, [stepId, hasInvalid, onJumpToStep, runtime])

    if (hasInvalid) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={cn(
            "rounded-xl border border-destructive/40 bg-destructive/10 p-4 shadow-xl backdrop-blur-md max-w-md",
            className
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <GitFork className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-destructive uppercase tracking-wide">Bifurcación</span>
          </div>
          <p className="text-xs text-destructive">Destino inválido: revisa targetStepId</p>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "rounded-xl border border-primary/40 bg-card/95 p-4 shadow-xl backdrop-blur-md transition-all max-w-md",
          className
        )}
        role="region"
        aria-label="Salto automático de la animación"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GitFork className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Bifurcación</span>
        </div>
        <p className="text-xs text-foreground">
          Salta a: <span className="font-mono font-semibold text-primary">{targetStepId}</span>
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">Salto automático al continuar</p>
      </div>
    )
  }

  return null
}
