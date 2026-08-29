import { describe, it, expect } from "vitest"
import { universalAnimationSchema } from "@/lib/validations/universal-animation"
import type { UniversalAnimationData } from "@/types/universal-animation"

describe("Universal Animation Schema & Persistence Validation (TDD)", () => {
  it("validates valid universal animation with custom topics and privacy settings", () => {
    const validAnim: UniversalAnimationData = {
      title: "Análisis de Fourier en Señales LTI",
      description: "Transformada continua y descomposición armónica",
      discipline: "physics",
      topic: "Procesamiento de Señales Digitales",
      tags: ["fourier", "física", "dsp"],
      difficulty: "advanced",
      is_public: true,
      nodes: [
        {
          id: "node-sig-1",
          type: "math",
          label: "Señal x(t)",
          x: 200,
          y: 150,
          content: "x(t) = \\sum_{k=-\\infty}^{\\infty} c_k e^{j k \\omega_0 t}",
          strokeWidth: 0,
        },
      ],
      connectors: [
        {
          id: "conn-1",
          sourceId: "node-sig-1",
          targetId: "node-sig-1",
          type: "bezier",
          directed: "forward",
          label: "Convolución",
          labelPosition: 0.75,
          strokeWidth: 2,
        },
      ],
      steps: [
        {
          id: "step-1",
          label: "1. Descomposición Armónica",
          description: "Calculamos los coeficientes c_k",
          duration: 2.5,
          actions: [
            {
              id: "act-1",
              type: "highlight",
              targetId: "node-sig-1",
              color: "active",
            },
          ],
        },
      ],
    }

    const result = universalAnimationSchema.safeParse(validAnim)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.topic).toBe("Procesamiento de Señales Digitales")
      expect(result.data.is_public).toBe(true)
      expect(result.data.connectors[0].labelPosition).toBe(0.75)
    }
  })

  it("rejects animation without title or with empty nodes array", () => {
    const invalidAnim = {
      title: "",
      topic: "General",
      nodes: [],
      steps: [],
    }

    const result = universalAnimationSchema.safeParse(invalidAnim)
    expect(result.success).toBe(false)
  })
})
