import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Slider } from "@/components/ui/slider"

describe("Slider a11y 44px — Phase 2.2 TDD RED", () => {
  it("thumb has 44px touch target (h-11 w-11)", () => {
    const { container } = render(<Slider defaultValue={[50]} min={0} max={100} step={1} />)
    const thumb = container.querySelector('[role="slider"]') as HTMLElement | null
    expect(thumb).not.toBeNull()
    // 44px is h-11 w-11 tailwind class
    expect(thumb!.className).toMatch(/h-11/)
    expect(thumb!.className).toMatch(/w-11/)
  })

  it("slider root has min-h-[44px] hit area", () => {
    const { container } = render(<Slider defaultValue={[50]} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toMatch(/min-h-\[44px\]/)
  })

  it("track is aria-hidden", () => {
    const { container } = render(<Slider defaultValue={[50]} />)
    const track = container.querySelector('[data-radix-slider-track], .relative.h-2') as HTMLElement | null
    // Radix track should be hidden from a11y, or we set aria-hidden on container's track div
    // check that track element has aria-hidden=true or our component sets it
    if (track) {
      // we expect aria-hidden attribute present
      expect(track.getAttribute("aria-hidden")).toBe("true")
    } else {
      // fallback: ensure no extra track is focusable
      expect(container.innerHTML).toContain("aria-hidden")
    }
  })

  it("exposes aria-valuenow/min/max when value supplied", () => {
    const { container } = render(<Slider value={[25]} min={0} max={100} />)
    const thumb = container.querySelector('[role="slider"]') as HTMLElement | null
    expect(thumb).not.toBeNull()
    // radix adds aria-valuenow etc via props
    expect(thumb!.getAttribute("aria-valuenow")).toBe("25")
    expect(thumb!.getAttribute("aria-valuemin")).toBe("0")
    expect(thumb!.getAttribute("aria-valuemax")).toBe("100")
  })
})

