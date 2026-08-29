import type { Page, Locator } from "@playwright/test"

/**
 * BasePage - Parent class for all Playwright page objects.
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path)
    await this.page.waitForLoadState("domcontentloaded")
  }

  async waitForNotification(): Promise<void> {
    await this.page.waitForSelector('[role="status"]', { timeout: 5000 })
  }

  async getNotificationText(): Promise<string | null> {
    const notification = this.page.locator('[role="status"]')
    return await notification.textContent()
  }

  async getUrl(): Promise<string> {
    return this.page.url()
  }
}
