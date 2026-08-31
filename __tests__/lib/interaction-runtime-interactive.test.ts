// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from "vitest"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import type { UniversalInteraction } from "@/types/universal-animation"

describe("InteractionRuntime Phase 5 extensions — TDD RED", () => {
  let runtime: InteractionRuntime

  beforeEach(() => {
    runtime = new InteractionRuntime()
  })

  describe("variable registry duplicate guard", () => {
    it("throws or returns false when registering duplicate variableName", () => {
      const slider1: UniversalInteraction = { type: "variable_slider", variableName: "alpha", min: 0, max: 10, step: 1, defaultValue: 5 }
      const slider2: UniversalInteraction = { type: "variable_slider", variableName: "alpha", min: 0, max: 20, step: 1, defaultValue: 10 }
      runtime.registerInteraction("step-1", slider1)
      // duplicate variableName should be guarded — expect error or explicit false
      expect(() => runtime.registerInteraction("step-2", slider2)).toThrow()
    })

    it("allows distinct variableNames", () => {
      runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 })
      expect(() => runtime.registerInteraction("step-2", { type: "variable_slider", variableName: "y", min: 0, max: 10, step: 1, defaultValue: 5 })).not.toThrow()
      expect(runtime.getVariable("x")).toBe(5)
      expect(runtime.getVariable("y")).toBe(5)
    })
  })

  describe("isStepUnlocked blocksNextStep-aware", () => {
    it("non-blocking quiz is unlocked even before answering", () => {
      const quizNonBlocking: UniversalInteraction = {
        type: "quiz",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: true, feedback: "ok" },
          { id: "b", text: "B", isCorrect: false, feedback: "no" },
        ],
      } as unknown as UniversalInteraction
      // simulate blocksNextStep false via props extension not in type yet — we add quizType/blocksNextStep
      ;(quizNonBlocking as any).quizType = "single"
      ;(quizNonBlocking as any).blocksNextStep = false
      runtime.registerInteraction("step-quiz-nb", quizNonBlocking)
      expect(runtime.isStepUnlocked("step-quiz-nb")).toBe(true)
    })

    it("blocking quiz remains locked until correct", () => {
      const quizBlocking: UniversalInteraction = {
        type: "quiz",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: false, feedback: "no" },
          { id: "b", text: "B", isCorrect: true, feedback: "ok" },
        ],
      } as unknown as UniversalInteraction
      ;(quizBlocking as any).quizType = "single"
      ;(quizBlocking as any).blocksNextStep = true
      runtime.registerInteraction("step-quiz-b", quizBlocking)
      expect(runtime.isStepUnlocked("step-quiz-b")).toBe(false)
      runtime.submitQuizAnswer("step-quiz-b", "a")
      expect(runtime.isStepUnlocked("step-quiz-b")).toBe(false)
      runtime.submitQuizAnswer("step-quiz-b", "b")
      expect(runtime.isStepUnlocked("step-quiz-b")).toBe(true)
    })

    it("non-blocking quiz submitQuizAnswer still leaves unlocked true even if incorrect", () => {
      const quizNB: UniversalInteraction = {
        type: "quiz",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: true, feedback: "ok" },
          { id: "b", text: "B", isCorrect: false, feedback: "no" },
        ],
      } as unknown as UniversalInteraction
      ;(quizNB as any).quizType = "single"
      ;(quizNB as any).blocksNextStep = false
      runtime.registerInteraction("step-nb2", quizNB)
      const res = runtime.submitQuizAnswer("step-nb2", "b")
      expect(res.isCorrect).toBe(false)
      expect(runtime.isStepUnlocked("step-nb2")).toBe(true)
    })
  })

  describe("selectBranchChoice null on invalid", () => {
    it("returns targetStepId on valid", () => {
      const branch: UniversalInteraction = {
        type: "branch_choice",
        choices: [
          { id: "ch1", label: "Go", targetStepId: "step-5" },
          { id: "ch2", label: "Else", targetStepId: "step-3" },
        ],
      }
      runtime.registerInteraction("step-branch", branch)
      expect(runtime.selectBranchChoice("step-branch", "ch1")).toBe("step-5")
    })

    it("returns null on invalid choice id", () => {
      const branch: UniversalInteraction = { type: "branch_choice", choices: [{ id: "ch1", label: "Go", targetStepId: "step-5" }] }
      runtime.registerInteraction("step-branch2", branch)
      expect(runtime.selectBranchChoice("step-branch2", "nope")).toBeNull()
    })

    it("returns null on empty targetStepId (invalid guard)", () => {
      const branch: UniversalInteraction = { type: "branch_choice", choices: [{ id: "ch1", label: "Bad", targetStepId: "" }] }
      runtime.registerInteraction("step-branch3", branch)
      expect(runtime.selectBranchChoice("step-branch3", "ch1")).toBeNull()
    })
  })

  describe("ephemeral reset", () => {
    it("resets variables to default on reset (ephemeral)", () => {
      runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 })
      runtime.setVariable("x", 75)
      expect(runtime.getVariable("x")).toBe(75)
      runtime.reset()
      // after reset, re-register should reset to default
      runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 })
      expect(runtime.getVariable("x")).toBe(50)
    })

    it("clears unlocked steps on reset", () => {
      const quiz: UniversalInteraction = {
        type: "quiz",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: true, feedback: "ok" },
          { id: "b", text: "B", isCorrect: false, feedback: "no" },
        ],
      } as unknown as UniversalInteraction
      ;(quiz as any).quizType = "single"
      ;(quiz as any).blocksNextStep = true
      runtime.registerInteraction("step-q", quiz)
      runtime.submitQuizAnswer("step-q", "a")
      expect(runtime.isStepUnlocked("step-q")).toBe(true)
      runtime.reset()
      // after reset, unknown step defaults to true (no interaction)
      expect(runtime.isStepUnlocked("step-q")).toBe(true)
    })
  })

  describe("rAF coalescing and quickSetter bridge not needed in unit but setVariable dispatch", () => {
    it("dispatches listeners synchronously for slider→KaTeX", () => {
      runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "k", min: 0, max: 10, step: 1, defaultValue: 0 })
      const cb = vi.fn()
      runtime.onVariableChange("k", cb)
      runtime.setVariable("k", 7)
      expect(cb).toHaveBeenCalledWith(7)
    })
  })
})

