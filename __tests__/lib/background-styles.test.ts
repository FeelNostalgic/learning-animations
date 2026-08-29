import { describe, it, expect } from "vitest"
import {
  getBackgroundInlineStyle,
  getPatternSvgPattern,
} from "@/lib/animations/background-styles"
import type { AnimationBackground } from "@/types/universal-animation"

describe("Animation Background Styles & Presets", () => {
  it("returns empty style if background is undefined", () => {
    expect(getBackgroundInlineStyle(undefined)).toEqual({})
  })

  it("handles solid color background", () => {
    const bg: AnimationBackground = {
      type: "solid",
      color: "#090D16",
      opacity: 0.85,
    }
    const style = getBackgroundInlineStyle(bg)
    expect(style.backgroundColor).toBe("#090D16")
  })

  it("handles linear gradient backgrounds", () => {
    const bg: AnimationBackground = {
      type: "gradient",
      gradient: {
        from: "#090D16",
        to: "#1E1B4B",
        direction: "to-r",
      },
    }
    const style = getBackgroundInlineStyle(bg)
    expect(style.backgroundImage).toBe("linear-gradient(to right, #090D16, #1E1B4B)")
  })

  it("handles radial gradient backgrounds", () => {
    const bg: AnimationBackground = {
      type: "gradient",
      gradient: {
        from: "#090D16",
        to: "#1E1B4B",
        direction: "radial",
      },
    }
    const style = getBackgroundInlineStyle(bg)
    expect(style.backgroundImage).toBe("radial-gradient(circle at center, #090D16, #1E1B4B)")
  })

  it("handles custom image backgrounds with fit and repeat options", () => {
    const bg: AnimationBackground = {
      type: "image",
      imageUrl: "https://r2.example.com/nebula.png",
      imageFit: "cover",
      color: "#090D16",
    }
    const style = getBackgroundInlineStyle(bg)
    expect(style.backgroundImage).toBe('url("https://r2.example.com/nebula.png")')
    expect(style.backgroundSize).toBe("cover")
    expect(style.backgroundRepeat).toBe("no-repeat")
    expect(style.backgroundColor).toBe("#090D16")
  })

  it("handles pattern overlays (dots and grid)", () => {
    expect(getPatternSvgPattern("none")).toBeNull()
    expect(getPatternSvgPattern(undefined)).toBeNull()

    const dotsDark = getPatternSvgPattern("dots", true)
    expect(dotsDark).toContain("radial-gradient")

    const gridDark = getPatternSvgPattern("grid", true)
    expect(gridDark).toContain("linear-gradient")
  })
})
