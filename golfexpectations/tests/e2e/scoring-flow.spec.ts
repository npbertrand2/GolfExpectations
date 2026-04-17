import { expect, test } from "../support/fixtures";

test.describe("Expected-score workflow placeholder", () => {
  test("Given a golfer input, When data is entered, Then calculation CTA is visible @p1", async ({ page, roundInput }) => {
    await page.goto("/");

    // This test is intentionally lightweight until the MVP form is implemented.
    // It keeps the E2E harness wired and ready for ATDD red-phase expansion.
    await expect(page.getByTestId("mvp-root")).toBeVisible();
    await expect(roundInput.holes).toHaveLength(18);
  });
});
