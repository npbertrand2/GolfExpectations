import type { Page } from "@playwright/test";

export async function waitForDocumentReady(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
}

export async function captureNetworkErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}
