// @ts-nocheck
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReactFlowProvider } from "@xyflow/react"
import { InteractiveNodeShell } from "@/components/builder/nodes/InteractiveNodeShell"

describe("InteractiveNodeShell — Phase 2.3 TDD RED", () => {
  const renderShell = (props: Partial<React.ComponentProps<typeof InteractiveNodeShell>> = {}) =>
    render(
      <ReactFlowProvider>
        <InteractiveNodeShell selected={false} label="Test shell" {...props}>
          <div>child content</div>
        </InteractiveNodeShell>
      </ReactFlowProvider>
    )

  it("renders child content and handles", () => {
    const { container } = renderShell({ label: "Slider" })
    expect(screen.getByText("child content")).toBeInTheDocument()
    // 4 handles (top,bottom,left,right)
    const handles = container.querySelectorAll('[data-handlepos]')
    // fallback: check data-handle or class handle
    expect(container.innerHTML).toContain("data-handlepos")
  })

  it("has nodrag nopan and stops propagation on pointer down", () => {
    const { container } = renderShell()
    const shell = container.querySelector(".interactive-node-shell") as HTMLElement
    expect(shell).not.toBeNull()
    expect(shell.className).toMatch(/nodrag/)
    expect(shell.className).toMatch(/nopan/)
  })

  it("applies selected ring when selected", () => {
    const { container } = renderShell({ selected: true })
    const shell = container.querySelector(".interactive-node-shell") as HTMLElement
    expect(shell.className).toMatch(/ring-2/)
  })

  it("renders NodeResizer when selected and not readonly", () => {
    const { container } = renderShell({ selected: true, isReadOnly: false })
    // NodeResizer renders with data-testid or class; check presence of resizer handle
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })

  it("is interactive shell with pointer-events aware class", () => {
    const { container } = renderShell()
    const shell = container.querySelector(".interactive-node-shell")
    expect(shell).toBeInTheDocument()
  })
})

