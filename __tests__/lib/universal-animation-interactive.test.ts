import { describe, it, expect } from "vitest"
import {
  universalNodeTypeEnum,
  universalNodeSchema,
  sliderPropsSchema,
  quizPropsSchema,
  branchPropsSchema,
  universalAnimationSchema,
} from "@/lib/validations/universal-animation"

describe("Interactive Node Types — Phase 1 Foundation (TDD RED)", () => {
  describe("universalNodeTypeEnum", () => {
    it("accepts interactive_slider", () => {
      expect(universalNodeTypeEnum.safeParse("interactive_slider").success).toBe(true)
    })
    it("accepts interactive_quiz", () => {
      expect(universalNodeTypeEnum.safeParse("interactive_quiz").success).toBe(true)
    })
    it("accepts interactive_branch", () => {
      expect(universalNodeTypeEnum.safeParse("interactive_branch").success).toBe(true)
    })
    it("still accepts legacy types", () => {
      expect(universalNodeTypeEnum.safeParse("shape").success).toBe(true)
      expect(universalNodeTypeEnum.safeParse("math").success).toBe(true)
    })
  })

  describe("sliderPropsSchema", () => {
    it("validates a correct slider props", () => {
      const res = sliderPropsSchema.safeParse({
        variableName: "alpha",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
      })
      expect(res.success).toBe(true)
    })
    it("fails when min equals max (min < max refinement)", () => {
      const res = sliderPropsSchema.safeParse({
        variableName: "alpha",
        min: 10,
        max: 10,
        step: 1,
        defaultValue: 10,
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        const msg = res.error.issues.map((i) => i.message).join(" ")
        expect(msg).toMatch(/min/i)
      }
    })
    it("fails when min > max", () => {
      const res = sliderPropsSchema.safeParse({
        variableName: "beta",
        min: 100,
        max: 0,
        step: 1,
        defaultValue: 50,
      })
      expect(res.success).toBe(false)
    })
    it("fails when step is zero or negative", () => {
      expect(sliderPropsSchema.safeParse({ variableName: "x", min: 0, max: 10, step: 0, defaultValue: 5 }).success).toBe(false)
      expect(sliderPropsSchema.safeParse({ variableName: "x", min: 0, max: 10, step: -2, defaultValue: 5 }).success).toBe(false)
    })
    it("fails when defaultValue outside [min,max]", () => {
      const res = sliderPropsSchema.safeParse({ variableName: "x", min: 0, max: 10, step: 1, defaultValue: 99 })
      expect(res.success).toBe(false)
    })
    it("fails when variableName empty", () => {
      const res = sliderPropsSchema.safeParse({ variableName: "", min: 0, max: 10, step: 1, defaultValue: 5 })
      expect(res.success).toBe(false)
    })
    it("fails when variableName invalid pattern (starts with digit)", () => {
      const res = sliderPropsSchema.safeParse({ variableName: "1bad", min: 0, max: 10, step: 1, defaultValue: 5 })
      expect(res.success).toBe(false)
    })
    it("accepts optional unit", () => {
      const res = sliderPropsSchema.safeParse({ variableName: "v", min: 0, max: 10, step: 1, defaultValue: 5, unit: "m/s" })
      expect(res.success).toBe(true)
    })
    it("clamps defaultValue at boundaries is valid", () => {
      expect(sliderPropsSchema.safeParse({ variableName: "v", min: 0, max: 10, step: 1, defaultValue: 0 }).success).toBe(true)
      expect(sliderPropsSchema.safeParse({ variableName: "v", min: 0, max: 10, step: 1, defaultValue: 10 }).success).toBe(true)
    })
  })

  describe("quizPropsSchema", () => {
    it("validates single quiz with 2 options and 1 correct", () => {
      const res = quizPropsSchema.safeParse({
        quizType: "single",
        question: "¿Cuánto es 2+2?",
        options: [
          { id: "a", text: "3", isCorrect: false, feedback: "No" },
          { id: "b", text: "4", isCorrect: true, feedback: "Sí" },
        ],
        blocksNextStep: true,
      })
      expect(res.success).toBe(true)
    })
    it("rejects quiz with fewer than 2 options", () => {
      const res = quizPropsSchema.safeParse({
        quizType: "single",
        question: "Q?",
        options: [{ id: "a", text: "Solo una", isCorrect: true, feedback: "x" }],
      })
      expect(res.success).toBe(false)
    })
    it("rejects quiz with zero correct answers", () => {
      const res = quizPropsSchema.safeParse({
        quizType: "single",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: false, feedback: "x" },
          { id: "b", text: "B", isCorrect: false, feedback: "x" },
        ],
      })
      expect(res.success).toBe(false)
    })
    it("rejects empty option text", () => {
      const res = quizPropsSchema.safeParse({
        quizType: "single",
        question: "Q?",
        options: [
          { id: "a", text: "", isCorrect: true, feedback: "x" },
          { id: "b", text: "B", isCorrect: false, feedback: "x" },
        ],
      })
      expect(res.success).toBe(false)
    })
    it("accepts valid multi quiz", () => {
      const res = quizPropsSchema.safeParse({
        quizType: "multi",
        question: "Elige correctas",
        options: [
          { id: "a", text: "A", isCorrect: true, feedback: "ok" },
          { id: "b", text: "B", isCorrect: false, feedback: "no" },
          { id: "c", text: "C", isCorrect: true, feedback: "ok" },
        ],
        blocksNextStep: false,
      })
      expect(res.success).toBe(true)
    })
  })

  describe("branchPropsSchema", () => {
    it("validates branch with choices each having targetStepId", () => {
      const res = branchPropsSchema.safeParse({
        choices: [{ id: "c1", label: "Ir a paso 5", targetStepId: "step-5" }],
      })
      expect(res.success).toBe(true)
    })
    it("rejects empty choices array", () => {
      const res = branchPropsSchema.safeParse({ choices: [] })
      expect(res.success).toBe(false)
    })
    it("rejects choice missing targetStepId", () => {
      const res = branchPropsSchema.safeParse({
        choices: [{ id: "c1", label: "Ir" } as any],
      })
      expect(res.success).toBe(false)
    })
    it("rejects choice with empty label", () => {
      const res = branchPropsSchema.safeParse({
        choices: [{ id: "c1", label: "", targetStepId: "step-2" }],
      })
      expect(res.success).toBe(false)
    })
  })

  describe("universalNodeSchema with interactive props", () => {
    it("validates interactive_slider node with slider props", () => {
      const node = {
        id: "n-slider-1",
        type: "interactive_slider",
        label: "Slider x",
        x: 100,
        y: 100,
        props: { variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 },
      }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })
    it("validates interactive node without props (backwards compat optional)", () => {
      const node = { id: "n-slider-1", type: "interactive_slider", label: "Slider", x: 0, y: 0 }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })
    it("fails slider props when min == max inside node props", () => {
      const node = {
        id: "n-s-2",
        type: "interactive_slider",
        label: "Bad",
        x: 0,
        y: 0,
        props: { variableName: "x", min: 10, max: 10, step: 1, defaultValue: 10 },
      }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(false)
    })
    it("validates legacy node still works", () => {
      const node = { id: "n1", type: "shape", label: "Old", x: 0, y: 0 }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })
  })

  describe("universalAnimationSchema backwards compat", () => {
    it("loads old animation without props field", () => {
      const anim = {
        title: "Vieja animación",
        topic: "General",
        nodes: [{ id: "n1", type: "shape", label: "A", x: 0, y: 0 }],
        steps: [{ id: "s1", label: "Paso 1", description: "Hola" }],
      }
      const res = universalAnimationSchema.safeParse(anim)
      expect(res.success).toBe(true)
    })
    it("validates animation with interactive nodes round-trip", () => {
      const anim = {
        title: "Con slider",
        topic: "Math",
        nodes: [
          { id: "n1", type: "interactive_slider", label: "Slider", x: 0, y: 0, props: { variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 } },
          { id: "n2", type: "math", label: "Formula", x: 100, y: 0, content: "{{x}}" },
        ],
        steps: [{ id: "s1", label: "Paso 1", description: "Test" }],
      }
      const res = universalAnimationSchema.safeParse(anim)
      expect(res.success).toBe(true)
    })
  })
})

