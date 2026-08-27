import { describe, it, expect, beforeEach } from "vitest"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import type { UniversalStep, UniversalInteraction } from "@/types/universal-animation"

describe("Interaction Runtime Engine (TDD)", () => {
  let runtime: InteractionRuntime

  beforeEach(() => {
    runtime = new InteractionRuntime()
  })

  describe("Reactive Variables & Sliders", () => {
    it("initializes and updates numeric variables from slider interactions", () => {
      const sliderInteraction: UniversalInteraction = {
        type: "variable_slider",
        variableName: "velocidad",
        min: 0,
        max: 120,
        step: 5,
        defaultValue: 30,
        unit: "km/h",
      }

      runtime.registerInteraction("step-1", sliderInteraction)

      expect(runtime.getVariable("velocidad")).toBe(30)

      runtime.setVariable("velocidad", 65)
      expect(runtime.getVariable("velocidad")).toBe(65)

      // Respects clamping to max/min limits
      runtime.setVariable("velocidad", 200)
      expect(runtime.getVariable("velocidad")).toBe(120)

      runtime.setVariable("velocidad", -50)
      expect(runtime.getVariable("velocidad")).toBe(0)
    })

    it("notifies variable change listeners", () => {
      let notifiedValue = 0
      const unsubscribe = runtime.onVariableChange("masa", (val) => {
        notifiedValue = val as number
      })

      runtime.setVariable("masa", 15)
      expect(notifiedValue).toBe(15)

      unsubscribe()
      runtime.setVariable("masa", 25)
      expect(notifiedValue).toBe(15) // Not called after unsubscribe
    })
  })

  describe("Interactive Quiz Evaluation", () => {
    const quizInteraction: UniversalInteraction = {
      type: "quiz",
      question: "¿Cuál es la derivada de $f(x) = x^2$?",
      options: [
        { id: "opt-1", text: "$x$", isCorrect: false, feedback: "Incorrecto, recuerda la regla de potencias: $\\frac{d}{dx}x^n = n x^{n-1}$." },
        { id: "opt-2", text: "$2x$", isCorrect: true, feedback: "¡Exacto! La derivada de $x^2$ es $2x$." },
        { id: "opt-3", text: "$2$", isCorrect: false, feedback: "Incorrecto, la derivada no es constante." },
      ],
    }

    it("evaluates correct quiz answer and unlocks step completion", () => {
      runtime.registerInteraction("step-derivada", quizInteraction)

      expect(runtime.isStepUnlocked("step-derivada")).toBe(false)

      const result = runtime.submitQuizAnswer("step-derivada", "opt-2")
      expect(result.success).toBe(true)
      expect(result.isCorrect).toBe(true)
      expect(result.feedback).toContain("¡Exacto!")
      expect(runtime.isStepUnlocked("step-derivada")).toBe(true)
    })

    it("evaluates incorrect quiz answer without unlocking step", () => {
      runtime.registerInteraction("step-derivada", quizInteraction)

      const result = runtime.submitQuizAnswer("step-derivada", "opt-1")
      expect(result.success).toBe(true)
      expect(result.isCorrect).toBe(false)
      expect(result.feedback).toContain("regla de potencias")
      expect(runtime.isStepUnlocked("step-derivada")).toBe(false)
    })
  })

  describe("Branch Choices & Decision Trees", () => {
    const branchInteraction: UniversalInteraction = {
      type: "branch_choice",
      choices: [
        { id: "ch-success", label: "El paquete llega intacto", targetStepId: "step-ack" },
        { id: "ch-drop", label: "El paquete se descarta en el switch", targetStepId: "step-timeout" },
      ],
    }

    it("returns target step for chosen branch", () => {
      runtime.registerInteraction("step-decision", branchInteraction)

      const target1 = runtime.selectBranchChoice("step-decision", "ch-success")
      expect(target1).toBe("step-ack")

      const target2 = runtime.selectBranchChoice("step-decision", "ch-drop")
      expect(target2).toBe("step-timeout")
    })
  })

  describe("Drag & Drop Validation", () => {
    const dragDropInteraction: UniversalInteraction = {
      type: "drag_drop",
      dragTargetNodeId: "node-electron",
      dropZoneNodeId: "zone-orbital",
      onDropSuccessStepId: "step-ionizado",
    }

    it("validates successful drop into target zone", () => {
      runtime.registerInteraction("step-quimica", dragDropInteraction)

      const success = runtime.validateDrop("step-quimica", "node-electron", "zone-orbital")
      expect(success.isMatch).toBe(true)
      expect(success.targetStepId).toBe("step-ionizado")
      expect(runtime.isStepUnlocked("step-quimica")).toBe(true)
    })

    it("rejects invalid drop into wrong zone", () => {
      runtime.registerInteraction("step-quimica", dragDropInteraction)

      const failure = runtime.validateDrop("step-quimica", "node-electron", "zone-nucleus")
      expect(failure.isMatch).toBe(false)
      expect(runtime.isStepUnlocked("step-quimica")).toBe(false)
    })
  })
})
