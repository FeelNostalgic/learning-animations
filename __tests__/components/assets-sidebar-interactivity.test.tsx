import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"

describe("AssetsSidebar — interactivity tab restored, step-level interactivity removed", () => {
  it("renders interactividad as category option in select", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    const select = screen.getByLabelText(/categoría/i) as HTMLSelectElement
    expect(select).toBeInTheDocument()
    const options = Array.from(select.options).map((o) => o.textContent)
    expect(options).toContain("Interactividad")
    expect(options).toContain("Formas")
    expect(options).toContain("KaTeX")
  })

  it("has no horizontal scrollbar — uses select dropdown instead", () => {
    const onAddNode = vi.fn()
    const { container } = render(<AssetsSidebar onAddNode={onAddNode} />)
    expect(container.innerHTML).not.toMatch(/overflow-x-auto/)
    expect(container.innerHTML).not.toMatch(/scrollbar-thin/)
    expect(container.innerHTML).not.toMatch(/whitespace-nowrap.*snap/)
  })

  it("shows 3 interactivity presets when interactividad category selected", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    const select = screen.getByLabelText(/categoría/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: "interactivity" } })
    expect(screen.getByText("Slider")).toBeInTheDocument()
    expect(screen.getByText("Quiz")).toBeInTheDocument()
    expect(screen.getByText("Branch")).toBeInTheDocument()
  })

  it("calls onAddNode with correct types for each preset", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    const select = screen.getByLabelText(/categoría/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: "interactivity" } })
    fireEvent.click(screen.getByText("Slider").closest("button")!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_slider", expect.any(Object))
    fireEvent.click(screen.getByText("Quiz").closest("button")!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_quiz", expect.any(Object))
    fireEvent.click(screen.getByText("Branch").closest("button")!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_branch", expect.any(Object))
  })

  it("still renders geometry presets via default category", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    expect(screen.getByText("Círculo")).toBeInTheDocument()
  })

  it("interactive node types are still registerable via nodeTypes", async () => {
    const { nodeTypes } = await import("@/components/builder/nodes")
    expect(nodeTypes["interactive_slider"]).toBeDefined()
    expect(nodeTypes["interactive_quiz"]).toBeDefined()
    expect(nodeTypes["interactive_branch"]).toBeDefined()
  })
})
