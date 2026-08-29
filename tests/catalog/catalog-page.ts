import { type Page, type Locator } from "@playwright/test"
import { BasePage } from "../base-page"

export class CatalogPage extends BasePage {
  readonly searchInput: Locator
  readonly disciplineSelect: Locator
  readonly topicSelect: Locator
  readonly officialFilterBtn: Locator
  readonly communityFilterBtn: Locator

  constructor(page: Page) {
    super(page)
    this.searchInput = page.getByPlaceholder(/Buscar por tema, protocolo/i)
    this.disciplineSelect = page.locator("select").nth(0)
    this.topicSelect = page.locator("select").nth(2)
    this.officialFilterBtn = page.getByRole("button", { name: /Oficiales/i })
    this.communityFilterBtn = page.getByRole("button", { name: /Comunidad/i })
  }

  async goto(): Promise<void> {
    await super.goto("/animations")
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term)
  }
}
