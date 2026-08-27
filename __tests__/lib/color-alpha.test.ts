import { describe, it, expect } from "vitest"
import { hexToRgba, rgbaToHex, parseColorAlpha } from "@/lib/utils/color-alpha"

describe("Color & Alpha Channel Helpers (TDD)", () => {
  it("converts hex color with alpha to rgba string", () => {
    expect(hexToRgba("#0070f3", 1)).toBe("rgba(0, 112, 243, 1)")
    expect(hexToRgba("#0070f3", 0.5)).toBe("rgba(0, 112, 243, 0.5)")
    expect(hexToRgba("#0070f3", 0)).toBe("transparent")
  })

  it("parses color string into base hex and alpha value", () => {
    expect(parseColorAlpha("transparent")).toEqual({ hex: "#000000", alpha: 0, isTransparent: true })
    expect(parseColorAlpha("rgba(0, 112, 243, 0.5)")).toEqual({
      hex: "#0070f3",
      alpha: 0.5,
      isTransparent: false,
    })
    expect(parseColorAlpha("#0070f3")).toEqual({
      hex: "#0070f3",
      alpha: 1,
      isTransparent: false,
    })
  })
})
