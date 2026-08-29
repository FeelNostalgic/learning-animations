import { type Page, type Locator } from "@playwright/test"
import { BasePage } from "../base-page"

export class BuilderPage extends BasePage {
  readonly titleInput: Locator
  readonly topicInput: Locator
  readonly previewToggleBtn: Locator
  readonly saveBtn: Locator

  constructor(page: Page) {
    super(page)
    this.titleInput = page.getByPlaceholder(/Título de la animación/i)
    this.topicInput = page.getByPlaceholder(/Tema o categoría/i)
    this.previewToggleBtn = page.getByRole("button", { name: /Previsualizar|Editor Studio/i })
    this.saveBtn = page.getByRole("button", { name: /Guardar/i })
  }

  async goto(): Promise<void> {
    await super.goto("/builder")
  }
}
