import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FloatingPropertyPanel } from "@/components/builder/floating-property-panel"
import type { UniversalNode } from "@/types/universal-animation"

function makeNode(overrides: Partial<UniversalNode> = {}): UniversalNode {
  return {
    id: "n1",
    type: "interactive_slider",
    label: "Slider",
    x: 0,
    y: 0,
    ...overrides,
  } as UniversalNode
}

describe("FloatingPropertyPanel interactive inspectors — Phase 4.2 RED", () => {
  it("renders slider inspector with range and variable inputs", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_slider",
      props: { variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 },
    })
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/variable/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue("x")).toBeInTheDocument()
    expect(screen.getByLabelText(/^Min$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Max$/i)).toBeInTheDocument()
  })

  it("updates slider max via onUpdateNode", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_slider",
      props: { variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 },
    })
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    const inputs = screen.getAllByDisplayValue("100")
    // find max input near "max" label
    const maxInput = screen.getByLabelText(/max/i) as HTMLInputElement
    fireEvent.change(maxInput, { target: { value: "200" } })
    expect(onUpdateNode).toHaveBeenCalled()
    const updated = onUpdateNode.mock.calls[0][0] as UniversalNode
    expect((updated.props as any).max).toBe(200)
  })

  it("renders quiz inspector with question, type and gate toggle", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_quiz",
      label: "Quiz",
      props: {
        quizType: "single",
        question: "Q?",
        options: [
          { id: "a", text: "A", isCorrect: true, feedback: "ok" },
          { id: "b", text: "B", isCorrect: false, feedback: "no" },
        ],
        blocksNextStep: true,
      },
    })
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue("Q?")).toBeInTheDocument()
    expect(screen.getAllByText(/Single|Multi/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/bloquea avance/i)).toBeInTheDocument()
  })

  it("renders branch inspector with single target dropdown", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_branch",
      label: "Branch",
      props: { targetStepId: "step-2" },
    })
    const allSteps = [
      { id: "step-1", label: "1. Intro", description: "", actions: [] },
      { id: "step-2", label: "2. Desarrollo", description: "", actions: [] },
    ] as any
    const { container } = render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} allSteps={allSteps} />)
    expect(screen.getByText("Seleccionar paso destino")).toBeInTheDocument()
    const select = container.querySelector("select") as HTMLSelectElement
    expect(select).not.toBeNull()
    expect(select.value).toBe("step-2")
    expect(screen.queryByText(/añadir opción/i)).not.toBeInTheDocument()
  })

  it("persists branch target update via onUpdateNode", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_branch",
      props: { targetStepId: "step-2" },
    })
    const allSteps = [
      { id: "step-1", label: "1. Intro", description: "", actions: [] },
      { id: "step-2", label: "2. Desarrollo", description: "", actions: [] },
      { id: "step-3", label: "3. Cierre", description: "", actions: [] },
    ] as any
    const { container } = render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} allSteps={allSteps} />)
    const select = container.querySelector("select") as HTMLSelectElement
    fireEvent.change(select, { target: { value: "step-3" } })
    expect(onUpdateNode).toHaveBeenCalled()
    const updated = onUpdateNode.mock.calls[0][0] as UniversalNode
    expect((updated.props as any).targetStepId).toBe("step-3")
  })
})

