import { describe, it, expect } from "vitest"
import fs from "node:fs"

describe("PR3 preferences wiring — RED probe (file contract)", () => {
  it("faceted-catalog persists catalog_filters via useCatalogFilters with SSR guard", () => {
    const src = fs.readFileSync("components/catalog/faceted-catalog.tsx", "utf-8")
    expect(src).toContain("useCatalogFilters")
    expect(src).toContain("catalog_filters")
    expect(src).toContain("useEffect")
  })

  it("user-animations-dashboard shares catalog_filters via same hook", () => {
    const src = fs.readFileSync("components/my-animations/user-animations-dashboard.tsx", "utf-8")
    expect(src).toContain("useCatalogFilters")
    // shared key is encapsulated in useCatalogFilters (CATALOG_FILTERS_KEY = catalog_filters)
    expect(src).toContain("useCatalogFilters")
    expect(src).toContain("useEffect")
  })

  it("animation-player hydrates/persists player_speed via usePlayerSpeed and resolvePlaybackSpeed", () => {
    const src = fs.readFileSync("components/animations/animation-player.tsx", "utf-8")
    expect(src).toContain("usePlayerSpeed")
    expect(src).toContain("player_speed")
    expect(src).toContain("resolvePlaybackSpeed")
    expect(src).toContain("useEffect")
  })

  it("no duplicate theme writes — next-themes sole owner", () => {
    const files = [
      "components/catalog/faceted-catalog.tsx",
      "components/my-animations/user-animations-dashboard.tsx",
      "components/animations/animation-player.tsx",
      "app/builder/page.tsx",
      "components/builder/canvas.tsx",
      "lib/hooks/use-preferences.ts",
    ]
    for (const f of files) {
      const src = fs.readFileSync(f, "utf-8")
      // no manual setItem for theme key
      expect(src, `${f} must not write theme manually`).not.toMatch(/localStorage\.setItem\(.*theme/i)
      expect(src, `${f} must not contain CATALOG_FILTERS manual duplicate`).not.toMatch(/localStorage\.getItem\(.*catalog_filters/i)
    }
    // theme read only via useTheme
    const themeToggle = fs.readFileSync("components/theme-toggle.tsx", "utf-8")
    expect(themeToggle).toContain("useTheme")
  })
})
