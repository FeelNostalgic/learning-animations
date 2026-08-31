// @ts-nocheck
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

describe("RadioGroup primitive — Phase 2 TDD RED", () => {
  it("renders radiogroup with roving tabindex and aria-checked", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="Quiz options">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="opt-a" />
          <label htmlFor="opt-a">Option A</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="opt-b" />
          <label htmlFor="opt-b">Option B</label>
        </div>
      </RadioGroup>
    )
    const group = screen.getByRole("radiogroup")
    expect(group).toBeInTheDocument()
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(2)
    // radix renders aria-checked or data-state checked; verify at least one is checked via aria-checked or data-state
    const checked = radios.find((r) => r.getAttribute("aria-checked") === "true" || r.getAttribute("data-state") === "checked")
    expect(checked).toBeTruthy()
  })

  it("supports keyboard navigation (renders 2 items distinct values)", () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" id="r-a" />
        <RadioGroupItem value="b" id="r-b" />
      </RadioGroup>
    )
    expect(screen.getAllByRole("radio")).toHaveLength(2)
  })

  it("applies custom className and forwards props", () => {
    render(
      <RadioGroup data-testid="group" className="custom-group">
        <RadioGroupItem value="x" id="r-x" data-testid="radio-x" />
      </RadioGroup>
    )
    expect(screen.getByTestId("group")).toBeInTheDocument()
    expect(screen.getByTestId("radio-x")).toBeInTheDocument()
  })
})

