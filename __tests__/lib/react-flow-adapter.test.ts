import { describe, it, expect } from "vitest"
import {
  universalToReactFlow,
  reactFlowToUniversal,
} from "@/lib/animations/react-flow-adapter"
import type { UniversalAnimationData, UniversalNode, UniversalConnector } from "@/types/universal-animation"

describe("React Flow <-> UniversalAnimationData Adapter (TDD)", () => {
  const sampleUniversalData: UniversalAnimationData = {
    title: "Teorema Fundamental del Cálculo",
    description: "Conexión entre derivación e integración.",
    discipline: "math",
    topic: "Cálculo",
    tags: ["matemáticas", "cálculo", "integrales"],
    difficulty: "advanced",
    is_public: true,
    background: {
      type: "gradient",
      gradient: { from: "#090D16", to: "#1E1B4B", direction: "to-br" },
      pattern: "dots",
    },
    nodes: [
      {
        id: "node-func",
        type: "math",
        label: "Función f(x)",
        x: 200,
        y: 150,
        content: "f(x) = x^2",
      },
      {
        id: "node-integral",
        type: "math",
        label: "Integral F(x)",
        x: 600,
        y: 150,
        content: "F(x) = \\int_0^x f(t) dt",
      },
      {
        id: "node-circle",
        type: "shape",
        label: "Punto P",
        x: 400,
        y: 350,
        shapeDetails: { shapeType: "circle", radius: 30 },
        fill: "#2563EB",
      },
    ],
    connectors: [
      {
        id: "conn-1",
        sourceId: "node-func",
        targetId: "node-integral",
        type: "bezier",
        directed: "forward",
        label: "Integración",
      },
    ],
    steps: [
      {
        id: "step-1",
        label: "1. Planteamiento",
        description: "Definimos la función y su integral acumulada.",
        duration: 2.5,
        actions: [
          { id: "act-1", type: "highlight", targetId: "node-func", color: "active" },
        ],
      },
    ],
  }

  it("converts UniversalAnimationData to React Flow nodes and edges", () => {
    const { nodes, edges } = universalToReactFlow(sampleUniversalData)

    expect(nodes).toHaveLength(3)
    expect(edges).toHaveLength(1)

    // Check mapped node
    const funcNode = nodes.find((n) => n.id === "node-func")
    expect(funcNode).toBeDefined()
    expect(funcNode?.type).toBe("math")
    expect(funcNode?.position).toEqual({ x: 200, y: 150 })
    expect(funcNode?.data.label).toBe("Función f(x)")
    expect(funcNode?.data.content).toBe("f(x) = x^2")

    // Check mapped edge
    const edge = edges[0]
    expect(edge.id).toBe("conn-1")
    expect(edge.source).toBe("node-func")
    expect(edge.target).toBe("node-integral")
    expect(edge.label).toBe("Integración")
  })

  it("converts React Flow nodes and edges back to UniversalAnimationData seamlessly", () => {
    const { nodes, edges } = universalToReactFlow(sampleUniversalData)

    // Mutate position in React Flow as if dragged
    const updatedNodes = nodes.map((n) =>
      n.id === "node-func" ? { ...n, position: { x: 250, y: 180 } } : n
    )

    const recovered = reactFlowToUniversal(
      updatedNodes,
      edges,
      sampleUniversalData.steps,
      {
        title: sampleUniversalData.title,
        description: sampleUniversalData.description,
        discipline: sampleUniversalData.discipline,
        topic: sampleUniversalData.topic,
        tags: sampleUniversalData.tags,
        difficulty: sampleUniversalData.difficulty,
        is_public: sampleUniversalData.is_public,
        background: sampleUniversalData.background,
      }
    )

    expect(recovered.title).toBe(sampleUniversalData.title)
    expect(recovered.discipline).toBe("math")
    expect(recovered.background).toEqual(sampleUniversalData.background)
    expect(recovered.nodes).toHaveLength(3)

    const updatedFuncNode = recovered.nodes.find((n) => n.id === "node-func")
    expect(updatedFuncNode?.x).toBe(250)
    expect(updatedFuncNode?.y).toBe(180)
    expect(updatedFuncNode?.content).toBe("f(x) = x^2")

    expect(recovered.connectors).toHaveLength(1)
    expect(recovered.connectors[0].sourceId).toBe("node-func")
    expect(recovered.connectors[0].targetId).toBe("node-integral")
    expect(recovered.steps).toHaveLength(1)
  })
})
