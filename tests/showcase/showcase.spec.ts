import { test, expect } from "@playwright/test"
import { ShowcasePage } from "./showcase-page"

test.describe("Showcase & Wiki Documentation", () => {
  test(
    "renders infinite loop action cards and allows tab navigation",
    { tag: ["@critical", "@e2e", "@showcase", "@SHOWCASE-E2E-001"] },
    async ({ page }) => {
      const showcase = new ShowcasePage(page)
      await showcase.goto()

      // Verify all 9 action loop cards are rendered
      await expect(page.getByRole("heading", { name: /Highlight/i })).toBeVisible()
      await expect(page.getByRole("heading", { name: /Pulse/i })).toBeVisible()
      await expect(page.getByRole("heading", { name: /Packet along Path/i })).toBeVisible()
      await expect(page.getByRole("heading", { name: /Math Eval/i })).toBeVisible()

      // Search filter test
      await showcase.filterActions("packet")
      await expect(page.getByRole("heading", { name: /Packet along Path/i })).toBeVisible()

      // Switch to components catalog
      await showcase.selectTab("components")
      await expect(page.getByText("Nodos de Formas Geométricas")).toBeVisible()
      await expect(page.getByText("Nodos Matemáticos KaTeX")).toBeVisible()

      // Switch to KaTeX cheat sheet
      await showcase.selectTab("katex")
      await expect(page.getByText("Editor KaTeX en Vivo (Playground)")).toBeVisible()
    }
  )
})
