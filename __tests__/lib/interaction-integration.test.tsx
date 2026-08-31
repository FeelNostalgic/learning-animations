import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ReactFlowProvider, type NodeProps } from "@xyflow/react"
import { InteractiveSliderNode } from "@/components/builder/nodes/InteractiveSliderNode"
import { InteractionRuntime } from "@/lib/animations/interaction-runtime"
import { universalToReactFlow, reactFlowToUniversal } from "@/lib/animations/react-flow-adapter"
import type { UniversalAnimationData } from "@/types/universal-animation"
import { FloatingPropertyPanel } from "@/components/builder/floating-property-panel"

function mockNodeProps(overrides: Partial<NodeProps> & { id: string; data: Record<string, unknown> }): NodeProps {
  return {
    type: "test",
    dragging: false,
    zIndex: 1,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    ...overrides,
  } as NodeProps
}

describe("Integration Phase 5.3 — slider→KaTeX, quiz gate, branch, adapter, inspector", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("slider→KaTeX rAF coalescing with quickSetter mock", async () => {
    const runtime = new InteractionRuntime()
    runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 0 } as any)
    const katexUpdate = vi.fn()
    // simulate KaTeX subscriber via onVariableChange + rAF
    let rafCb: FrameRequestCallback | null = null
    const originalRAF = (globalThis as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame
    ;(globalThis as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame = ((cb: FrameRequestCallback) => {
      rafCb = cb
      return 1 as unknown as number
    }) as typeof requestAnimationFrame
    const unsub = runtime.onVariableChange("x", (v) => {
      requestAnimationFrame(() => katexUpdate(v))
    })
    runtime.setVariable("x", 42)
    expect(katexUpdate).not.toHaveBeenCalled() // rAF not flushed yet
    if (rafCb) (rafCb as FrameRequestCallback)(0)
    expect(katexUpdate).toHaveBeenCalledWith(42)
    unsub()
    ;(globalThis as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame = originalRAF
  })

  it("quiz gate toggles Next via isStepUnlocked", () => {
    const runtime = new InteractionRuntime()
    const quiz = {
      type: "quiz",
      question: "Q?",
      options: [
        { id: "a", text: "A", isCorrect: false, feedback: "no" },
        { id: "b", text: "B", isCorrect: true, feedback: "ok" },
      ],
      quizType: "single",
      blocksNextStep: true,
    } as any
    runtime.registerInteraction("step-q", quiz)
    expect(runtime.isStepUnlocked("step-q")).toBe(false)
    let res = runtime.submitQuizAnswer("step-q", "a")
    expect(res.isCorrect).toBe(false)
    expect(runtime.isStepUnlocked("step-q")).toBe(false)
    res = runtime.submitQuizAnswer("step-q", "b")
    expect(res.isCorrect).toBe(true)
    expect(runtime.isStepUnlocked("step-q")).toBe(true)
  })

  it("non-blocking quiz never gates Next", () => {
    const runtime = new InteractionRuntime()
    const quiz = {
      type: "quiz",
      question: "Q?",
      options: [
        { id: "a", text: "A", isCorrect: false, feedback: "no" },
        { id: "b", text: "B", isCorrect: true, feedback: "ok" },
      ],
      quizType: "single",
      blocksNextStep: false,
    } as any
    runtime.registerInteraction("step-q2", quiz)
    expect(runtime.isStepUnlocked("step-q2")).toBe(true)
    runtime.submitQuizAnswer("step-q2", "a")
    expect(runtime.isStepUnlocked("step-q2")).toBe(true)
  })

  it("branch valid jump returns target and hides intermediate steps (timeline filter simulation)", () => {
    const runtime = new InteractionRuntime()
    runtime.registerInteraction("step-branch", { type: "branch_choice", choices: [{ id: "c1", label: "Go", targetStepId: "step-5" }, { id: "c2", label: "Else", targetStepId: "step-3" }] } as any)
    const target = runtime.selectBranchChoice("step-branch", "c1")
    expect(target).toBe("step-5")
    // simulate timeline hide: steps 3-4 hidden when jumping to 5
    const steps = ["step-1", "step-2", "step-3", "step-4", "step-5"].map((id) => ({ id }))
    const idx = steps.findIndex((s) => s.id === target)
    const hidden = steps.slice(2, idx).map((s) => s.id)
    expect(hidden).toEqual(["step-3", "step-4"])
  })

  it("branch invalid renders role=alert (BranchNode guard)", async () => {
    const { BranchNode } = await import("@/components/builder/nodes/BranchNode")
    render(
      <ReactFlowProvider>
        <BranchNode
          {...mockNodeProps({
            id: "b1",
            type: "interactive_branch",
            data: { label: "Branch", props: { choices: [{ id: "c1", label: "Bad", targetStepId: "" }] } },
            selected: false,
          })}
        />
      </ReactFlowProvider>
    )
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("adapter round-trip preserves interactive props", () => {
    const anim: UniversalAnimationData = {
      title: "Anim",
      description: "Test anim",
      discipline: "math",
      topic: "Math",
      tags: [],
      difficulty: "beginner",
      is_public: false,
      nodes: [{ id: "n1", type: "interactive_slider", label: "S", x: 0, y: 0, props: { variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 } }],
      connectors: [],
      steps: [{ id: "s1", label: "S1", description: "", actions: [] }],
    }
    const { nodes, edges } = universalToReactFlow(anim)
    const recovered = reactFlowToUniversal(nodes, edges, anim.steps, { title: anim.title, topic: anim.topic })
    expect(recovered.nodes[0].props).toEqual({ variableName: "x", min: 0, max: 10, step: 1, defaultValue: 5 })
  })

  it("inspector persist round-trip via onUpdateNode", () => {
    const onUpdateNode = vi.fn()
    const node = { id: "n1", type: "interactive_slider", label: "S", x: 0, y: 0, props: { variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 } } as any
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    const maxInput = screen.getByLabelText(/^Max$/i) as HTMLInputElement
    fireEvent.change(maxInput, { target: { value: "200" } })
    expect(onUpdateNode).toHaveBeenCalledWith(expect.objectContaining({ props: expect.objectContaining({ max: 200 }) }))
  })

  it("ephemeral reset discards values on reload", () => {
    const runtime = new InteractionRuntime()
    runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 } as any)
    runtime.setVariable("x", 75)
    expect(runtime.getVariable("x")).toBe(75)
    runtime.reset()
    runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 } as any)
    expect(runtime.getVariable("x")).toBe(50)
  })
})

