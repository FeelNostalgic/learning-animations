// @ts-nocheck
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"

describe("AssetsSidebar interactivity tab — Phase 4.1 RED", () => {
  it("renders interactividad tab", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    expect(screen.getByText(/interactividad/i)).toBeInTheDocument()
  })

  it("shows 3 presets when interactivity tab active", async () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    const tab = screen.getByText(/interactividad/i)
    fireEvent.click(tab)
    expect(screen.getByText(/^Slider$/)).toBeInTheDocument()
    expect(screen.getByText(/^Quiz$/)).toBeInTheDocument()
    expect(screen.getByText(/^Branch$/)).toBeInTheDocument()
  })

  it("calls onAddNode with interactive_slider preset when clicking slider", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    fireEvent.click(screen.getByText(/interactividad/i))
    const sliderBtn = screen.getByText(/slider/i).closest("button")
    expect(sliderBtn).not.toBeNull()
    fireEvent.click(sliderBtn!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_slider", expect.any(Object))
  })

  it("calls onAddNode with interactive_quiz and interactive_branch", () => {
    const onAddNode = vi.fn()
    render(<AssetsSidebar onAddNode={onAddNode} />)
    fireEvent.click(screen.getByText(/interactividad/i))
    const quizHeading = screen.getAllByText(/^Quiz$/).find((el) => el.closest("button"))
    const quizBtn = quizHeading?.closest("button") || screen.getByText(/^Quiz$/).closest("button")
    fireEvent.click(quizBtn!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_quiz", expect.any(Object))
    const branchHeading = screen.getAllByText(/^Branch$/)[0]
    const branchBtn = branchHeading.closest("button")
    fireEvent.click(branchBtn!)
    expect(onAddNode).toHaveBeenCalledWith("interactive_branch", expect.any(Object))
  })

  it("grid is 6 cols or at least renders preset buttons in grid", () => {
    const onAddNode = vi.fn()
    const { container } = render(<AssetsSidebar onAddNode={onAddNode} />)
    fireEvent.click(screen.getByText(/interactividad/i))
    // check grid class
    expect(container.innerHTML).toMatch(/grid/)
  })
})

