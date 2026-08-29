import { type Page, type Locator, expect } from "@playwright/test"
import { BasePage } from "../base-page"

export class ShowcasePage extends BasePage {
  readonly actionsTab: Locator
  readonly componentsTab: Locator
  readonly interactiveTab: Locator
  readonly katexTab: Locator
  readonly architectureTab: Locator
  readonly searchInput: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    super(page)
    this.actionsTab = page.getByRole("button", { name: /Acciones del Motor/i })
    this.componentsTab = page.getByRole("button", { name: /Componentes & Nodos/i })
    this.interactiveTab = page.getByRole("button", { name: /Interactividad en Vivo/i })
    this.katexTab = page.getByRole("button", { name: /KaTeX Cheat Sheet/i })
    this.architectureTab = page.getByRole("button", { name: /Arquitectura del Motor/i })
    this.searchInput = page.getByPlaceholder(/Buscar acción o concepto/i)
    this.backButton = page.getByRole("button", { name: /Volver atrás/i })
  }

  async goto(): Promise<void> {
    await super.goto("/docs/showcase")
  }

  async filterActions(query: string): Promise<void> {
    await this.searchInput.fill(query)
  }

  async selectTab(tab: "actions" | "components" | "interactive" | "katex" | "architecture"): Promise<void> {
    switch (tab) {
      case "components":
        await this.componentsTab.click()
        break
      case "interactive":
        await this.interactiveTab.click()
        break
      case "katex":
        await this.katexTab.click()
        break
      case "architecture":
        await this.architectureTab.click()
        break
      case "actions":
      default:
        await this.actionsTab.click()
        break
    }
  }
}
