"use client"

import React, { memo, useState } from "react"
import { type NodeProps } from "@xyflow/react"
import { InteractiveNodeShell } from "./InteractiveNodeShell"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuizProps } from "@/types/universal-animation"

export const QuizNode = memo(({ id, data, selected }: NodeProps) => {
  const props = (data.props as QuizProps) || {
    quizType: "single",
    question: "Pregunta",
    options: [],
    blocksNextStep: true,
  }
  const quizType = props.quizType || "single"
  const question = props.question || "Pregunta"
  const options = props.options || []
  const blocksNextStep = props.blocksNextStep ?? true
  const isReadOnly = Boolean((data as Record<string, unknown>).isReadOnly)
  const label = (data.label as string) || "Quiz"

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const handleSingleChange = (val: string) => {
    setSelectedIds([val])
    const opt = options.find((o) => o.id === val)
    if (opt) {
      setFeedback(opt.feedback)
      setIsCorrect(opt.isCorrect)
    }
  }

  const handleMultiToggle = (optId: string) => {
    setSelectedIds((prev) => (prev.includes(optId) ? prev.filter((i) => i !== optId) : [...prev, optId]))
  }

  const handleSubmitMulti = () => {
    // evaluate if all correct and only correct selected
    const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id)
    const ok = correctIds.length === selectedIds.length && correctIds.every((c) => selectedIds.includes(c))
    setIsCorrect(ok)
    setFeedback(ok ? "¡Correcto!" : "Revisa tu selección")
  }

  return (
    <InteractiveNodeShell id={id} selected={Boolean(selected)} isReadOnly={isReadOnly} label={label}>
      <div className="space-y-3 min-w-[220px]">
        <p className="text-xs font-semibold text-foreground">{question}</p>

        {quizType === "single" ? (
          <RadioGroup value={selectedIds[0] || ""} onValueChange={handleSingleChange} aria-label={question}>
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <RadioGroupItem value={opt.id} id={`${id}-${opt.id}`} />
                <label htmlFor={`${id}-${opt.id}`} className="text-xs text-foreground cursor-pointer">
                  {opt.text}
                </label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(opt.id)}
                  onChange={() => handleMultiToggle(opt.id)}
                  className="h-4 w-4 rounded border-primary"
                />
                <span className="text-xs text-foreground">{opt.text}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={handleSubmitMulti}
              className="mt-1 rounded-md border border-primary px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Enviar respuesta
            </button>
          </div>
        )}

        <div
          data-testid="quiz-feedback"
          aria-live="polite"
          className={`min-h-[20px] rounded-md px-2 py-1 text-xs ${
            isCorrect === null ? "text-muted-foreground" : isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback || "Selecciona una opción"}
        </div>

        {blocksNextStep && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600">
            <span>⚠</span>
            <span>Bloquea avance hasta responder correctamente</span>
          </div>
        )}
        {!blocksNextStep && (
          <div className="text-[10px] text-muted-foreground">No bloquea avance</div>
        )}
      </div>
    </InteractiveNodeShell>
  )
})

QuizNode.displayName = "QuizNode"
