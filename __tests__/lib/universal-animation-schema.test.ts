import { describe, it, expect } from "vitest"
import {
  universalNodeSchema,
  universalConnectorSchema,
  universalActionSchema,
  universalStepSchema,
  universalInteractionSchema,
  universalAnimationSchema,
  disciplineEnum,
} from "@/lib/validations/universal-animation"
import type { UniversalAnimationData } from "@/types/universal-animation"

describe("Universal Animation Schemas (Zod Validation)", () => {
  describe("Discipline Enum", () => {
    it("accepts valid educational disciplines", () => {
      expect(disciplineEnum.safeParse("math").success).toBe(true)
      expect(disciplineEnum.safeParse("physics").success).toBe(true)
      expect(disciplineEnum.safeParse("computer_science").success).toBe(true)
      expect(disciplineEnum.safeParse("biology").success).toBe(true)
      expect(disciplineEnum.safeParse("chemistry").success).toBe(true)
      expect(disciplineEnum.safeParse("general").success).toBe(true)
    })

    it("rejects invalid disciplines", () => {
      expect(disciplineEnum.safeParse("astrology").success).toBe(false)
      expect(disciplineEnum.safeParse("").success).toBe(false)
    })
  })

  describe("Universal Node Schema", () => {
    it("validates a standard geometric shape node", () => {
      const node = {
        id: "node-circle-1",
        type: "shape",
        label: "Círculo Unitario",
        x: 100,
        y: 200,
        shapeDetails: { shapeType: "circle", radius: 40 },
        fill: "#2563EB",
      }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })

    it("validates a math formula LaTeX node", () => {
      const node = {
        id: "node-math-1",
        type: "math",
        label: "Teorema de Pitágoras",
        x: 350,
        y: 150,
        content: "a^2 + b^2 = c^2",
      }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })

    it("validates a network node with backwards compatibility props", () => {
      const node = {
        id: "node-sw-1",
        type: "network",
        label: "Switch Central",
        x: 500,
        y: 300,
        props: { ip: "192.168.1.1", mac: "00:11:22:33:44:55", networkType: "switch" },
      }
      const res = universalNodeSchema.safeParse(node)
      expect(res.success).toBe(true)
    })

    it("fails when node is missing required fields (id, x, y)", () => {
      const invalidNode = {
        label: "Sin ID ni coordenadas",
        type: "text",
      }
      const res = universalNodeSchema.safeParse(invalidNode)
      expect(res.success).toBe(false)
    })
  })

  describe("Universal Connector Schema", () => {
    it("validates a directed bezier connector", () => {
      const connector = {
        id: "conn-1",
        sourceId: "node-1",
        targetId: "node-2",
        type: "bezier",
        directed: "forward",
        label: "f(x)",
        dashed: false,
      }
      const res = universalConnectorSchema.safeParse(connector)
      expect(res.success).toBe(true)
    })

    it("fails if sourceId or targetId are empty", () => {
      const invalid = {
        id: "conn-2",
        sourceId: "",
        targetId: "node-2",
      }
      const res = universalConnectorSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe("Universal Interaction Schema", () => {
    it("validates variable slider interaction", () => {
      const sliderInteraction = {
        type: "variable_slider",
        variableName: "velocidad",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 25,
        unit: "m/s",
      }
      const res = universalInteractionSchema.safeParse(sliderInteraction)
      expect(res.success).toBe(true)
    })

    it("validates interactive quiz interaction", () => {
      const quizInteraction = {
        type: "quiz",
        question: "¿Cuál es el resultado de $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$?",
        options: [
          { id: "opt-1", text: "0", isCorrect: false, feedback: "Incorrecto, usa L'Hôpital." },
          { id: "opt-2", text: "1", isCorrect: true, feedback: "¡Correcto! Es el límite fundamental trigonométrico." },
          { id: "opt-3", text: "$\\infty$", isCorrect: false, feedback: "No diverge." },
        ],
      }
      const res = universalInteractionSchema.safeParse(quizInteraction)
      expect(res.success).toBe(true)
    })
  })

  describe("Universal Animation Full Payload Schema", () => {
    it("validates complete animation data", () => {
      const fullAnim: UniversalAnimationData = {
        title: "Derivada de una Función",
        description: "Explicación visual del concepto de recta tangente y derivada.",
        discipline: "math",
        topic: "Cálculo Diferencial",
        tags: ["cálculo", "derivadas", "tangente", "límites"],
        difficulty: "intermediate",
        is_public: true,
        nodes: [
          { id: "n1", type: "shape", label: "Punto P", x: 200, y: 300 },
          { id: "n2", type: "math", label: "Fórmula", x: 400, y: 100, content: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}" },
        ],
        connectors: [
          { id: "c1", sourceId: "n1", targetId: "n2", type: "straight", directed: "forward" },
        ],
        steps: [
          {
            id: "step-1",
            label: "1. Recta Secante",
            description: "Observamos la recta secante que une dos puntos con distancia $h$.",
            duration: 2.5,
            actions: [
              { id: "act-1", type: "highlight", targetId: "n1", color: "active" },
            ],
            interaction: {
              type: "variable_slider",
              variableName: "h",
              min: 0.01,
              max: 2,
              step: 0.01,
              defaultValue: 1,
            },
          },
        ],
      }

      const res = universalAnimationSchema.safeParse(fullAnim)
      expect(res.success).toBe(true)
    })

    it("rejects animation without title, nodes or steps", () => {
      const emptyAnim = {
        title: "",
        discipline: "math",
        topic: "Álgebra",
        nodes: [],
        steps: [],
      }
      const res = universalAnimationSchema.safeParse(emptyAnim)
      expect(res.success).toBe(false)
    })
  })
})
