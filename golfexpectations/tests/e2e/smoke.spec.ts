import { expect, test } from "../support/fixtures";
import { waitForDocumentReady } from "../support/helpers/network";

test.describe("MVP smoke checks", () => {
  test("loads the app shell @p0", async ({ page }) => {
    await page.goto("/");
    await waitForDocumentReady(page);

    await expect(page).toHaveTitle(/(vite|golf)/i);
  });
});
