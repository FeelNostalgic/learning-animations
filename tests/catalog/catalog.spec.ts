import { test, expect } from "@playwright/test"
import { CatalogPage } from "./catalog-page"

test.describe("Faceted Animation Catalog", () => {
  test(
    "allows searching and faceted filtering of animations",
    { tag: ["@critical", "@e2e", "@catalog", "@CATALOG-E2E-001"] },
    async ({ page }) => {
      const catalog = new CatalogPage(page)
      await catalog.goto()

      // Verify header and initial animations display
      await expect(page.getByText("Aprende Conceptos Complejos Paso a Paso")).toBeVisible()
      await expect(page.getByRole("heading", { name: "Protocolo ARP" }).first()).toBeVisible()

      // Search for specific protocol
      await catalog.search("ARP")
      await expect(page.getByRole("heading", { name: "Protocolo ARP" }).first()).toBeVisible()

      // Click to open animation detail player
      await page.getByRole("heading", { name: "Protocolo ARP" }).first().click()
      await expect(page).toHaveURL(/\/animations\/arp/)
    }
  )
})
