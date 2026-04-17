import type { Page } from "@playwright/test";

export async function saveAuthState(page: Page, outputPath = "tests/.auth/user.json"): Promise<void> {
  await page.context().storageState({ path: outputPath });
}
