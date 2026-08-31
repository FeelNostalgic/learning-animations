import { describe, it, expect } from "vitest"
import { universalToReactFlow, reactFlowToUniversal } from "@/lib/animations/react-flow-adapter"
import type { UniversalAnimationData } from "@/types/universal-animation"

describe("Interactive Adapter round-trip — Phase 4.3 RED", () => {
  const interactiveAnim: UniversalAnimationData = {
    title: "Test interactive",
    description: "Test interactive animation",
    discipline: "math",
    topic: "Math",
    tags: [],
    difficulty: "beginner",
    is_public: false,
    nodes: [
      { id: "n-slider", type: "interactive_slider", label: "Slider", x: 10, y: 20, props: { variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 } },
      { id: "n-quiz", type: "interactive_quiz", label: "Quiz", x: 100, y: 20, props: { quizType: "single", question: "Q?", options: [{ id: "a", text: "A", isCorrect: true, feedback: "ok" }, { id: "b", text: "B", isCorrect: false, feedback: "no" }], blocksNextStep: true } },
      { id: "n-branch", type: "interactive_branch", label: "Branch", x: 200, y: 20, props: { choices: [{ id: "c1", label: "Go", targetStepId: "step-2" }] } },
      { id: "n-old", type: "shape", label: "Old", x: 0, y: 0 },
    ],
    connectors: [],
    steps: [{ id: "step-1", label: "Step 1", description: "hi", actions: [] }],
  }

  it("universalToReactFlow preserves props and nodeType", () => {
    const { nodes } = universalToReactFlow(interactiveAnim)
    const slider = nodes.find((n) => n.id === "n-slider")
    expect(slider?.data.props).toEqual({ variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 })
    expect(slider?.data.nodeType).toBe("interactive_slider")
    const quiz = nodes.find((n) => n.id === "n-quiz")
    expect((quiz?.data.props as any).quizType).toBe("single")
  })

  it("reactFlowToUniversal round-trips props", () => {
    const { nodes, edges } = universalToReactFlow(interactiveAnim)
    const recovered = reactFlowToUniversal(nodes, edges, interactiveAnim.steps, { title: interactiveAnim.title, topic: interactiveAnim.topic })
    const slider = recovered.nodes.find((n) => n.id === "n-slider")
    expect(slider?.type).toBe("interactive_slider")
    expect((slider?.props as any).variableName).toBe("x")
    const branch = recovered.nodes.find((n) => n.id === "n-branch")
    expect((branch?.props as any).choices[0].targetStepId).toBe("step-2")
  })

  it("tolerates missing props for backwards compat", () => {
    const oldAnim: UniversalAnimationData = {
      title: "Old",
      description: "Old animation",
      discipline: "general",
      topic: "General",
      tags: [],
      difficulty: "beginner",
      is_public: false,
      nodes: [{ id: "n1", type: "shape", label: "A", x: 0, y: 0 }],
      connectors: [],
      steps: [{ id: "s1", label: "S1", description: "", actions: [] }],
    }
    const { nodes, edges } = universalToReactFlow(oldAnim)
    expect(nodes[0].data.props).toBeUndefined()
    const recovered = reactFlowToUniversal(nodes, edges, oldAnim.steps, { title: "Old", topic: "General" })
    expect(recovered.nodes[0].props).toBeUndefined()
    expect(recovered.nodes[0].type).toBe("shape")
  })

  it("interactive node without props survives round-trip (optional)", () => {
    const anim: UniversalAnimationData = {
      title: "No props",
      description: "No props animation",
      discipline: "general",
      topic: "General",
      tags: [],
      difficulty: "beginner",
      is_public: false,
      nodes: [{ id: "n1", type: "interactive_slider", label: "Slider", x: 0, y: 0 }],
      connectors: [],
      steps: [{ id: "s1", label: "S1", description: "", actions: [] }],
    }
    const { nodes, edges } = universalToReactFlow(anim)
    const recovered = reactFlowToUniversal(nodes, edges, anim.steps, { title: "No props", topic: "General" })
    expect(recovered.nodes[0].type).toBe("interactive_slider")
    expect(recovered.nodes[0].props).toBeUndefined()
  })
})

