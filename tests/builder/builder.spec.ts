import { test, expect } from "@playwright/test"

test.describe("Studio Animation Builder Route Protection", () => {
  test(
    "redirects unauthenticated users to login page with redirect parameter",
    { tag: ["@critical", "@e2e", "@builder", "@BUILDER-E2E-001"] },
    async ({ page }) => {
      await page.goto("/builder")
      await expect(page).toHaveURL(/\/login\?redirect=%2Fbuilder/)
      await expect(page.getByRole("heading", { name: "Iniciar Sesión" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
    }
  )
})
