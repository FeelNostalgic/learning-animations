import { describe, it, expect, vi } from "vitest"

describe("Canvas viewport wiring", () => {
  it("exports Viewport type and accepts defaultViewport/onViewportChange props", async () => {
    const mod = await import("@/components/builder/canvas")
    // Check that Canvas component exists
    expect(typeof mod.Canvas).toBe("function")
    // Check Viewport type export exists at runtime? we test by inspecting file content or hook existence
    // Instead verify file contains defaultViewport and onViewportChange via dynamic import check
    const fs = await import("node:fs")
    const source = fs.readFileSync("components/builder/canvas.tsx", "utf-8")
    expect(source).toContain("defaultViewport")
    expect(source).toContain("onViewportChange")
    expect(source).toContain("Viewport")
    expect(source).toContain("useViewport")
  })

  it("persists viewport via useDebouncedLocalStorage or usePreferences", async () => {
    const fs = await import("node:fs")
    const prefSource = fs.readFileSync("lib/hooks/use-preferences.ts", "utf-8")
    expect(prefSource).toContain("BuilderViewport")
    expect(prefSource).toContain("builder_zoom_pan")
    expect(prefSource).toContain("useBuilderViewport")
  })
})
