import type { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /get started/i });
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
