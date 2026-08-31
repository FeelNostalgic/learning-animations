// @ts-nocheck
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

  it("renders branch inspector with choices and add/remove", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_branch",
      label: "Branch",
      props: { choices: [{ id: "c1", label: "Go", targetStepId: "step-2" }] },
    })
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue("Go")).toBeInTheDocument()
    expect(screen.getByDisplayValue("step-2")).toBeInTheDocument()
    // add button
    const addBtn = screen.getByText(/añadir opción|añadir/i)
    expect(addBtn).toBeInTheDocument()
    fireEvent.click(addBtn)
    expect(onUpdateNode).toHaveBeenCalled()
  })

  it("persists branch choice update via onUpdateNode", () => {
    const onUpdateNode = vi.fn()
    const node = makeNode({
      type: "interactive_branch",
      props: { choices: [{ id: "c1", label: "Go", targetStepId: "step-2" }] },
    })
    render(<FloatingPropertyPanel selectedNode={node} onUpdateNode={onUpdateNode} onDeleteNode={vi.fn()} selectedEdge={null} onUpdateEdge={vi.fn()} onDeleteEdge={vi.fn()} onClose={vi.fn()} />)
    const labelInput = screen.getByDisplayValue("Go")
    fireEvent.change(labelInput, { target: { value: "Updated" } })
    expect(onUpdateNode).toHaveBeenCalled()
  })
})

