import { test, expect } from "@playwright/test";

/**
 * ATDD red-phase scaffolds for Epic 1 — Golf Expected Score MVP.
 * Green phase: scenarios run against the MVP UI and scoring engine.
 *
 * Selector contract (add to App when building):
 * - data-testid="mvp-root"
 * - data-testid="handicap-index"
 * - data-testid="tee-name"
 * - data-testid="course-par" | "course-rating" | "bogey-rating" | "slope-rating"
 * - data-testid="hole-row-{n}-par" | "hole-row-{n}-yards" | "hole-row-{n}-hcp"
 * - data-testid="calculate-button"
 * - data-testid="results-table"
 * - data-testid="result-hole-{n}-expected-decimal"
 * - data-testid="result-hole-{n}-expected-integer"
 * - data-testid="result-hole-{n}-expected-range"
 * - data-testid="total-front" | "total-back" | "total-18"
 * - data-testid="validation-error" (visible when inputs invalid)
 */

test.describe("Epic 1 MVP — expected score (ATDD)", () => {
  test("P0: user enters handicap + tee ratings + 18 holes and sees per-hole triple output + totals @p0", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("mvp-root")).toBeVisible();

    await page.getByTestId("handicap-index").fill("15.2");
    await page.getByTestId("tee-name").fill("Green");
    await page.getByTestId("course-par").fill("72");
    await page.getByTestId("course-rating").fill("70.7");
    await page.getByTestId("bogey-rating").fill("95.8");
    await page.getByTestId("slope-rating").fill("135");

    for (let hole = 1; hole <= 18; hole++) {
      await page.getByTestId(`hole-row-${hole}-par`).fill(String((hole % 3) + 3));
      await page.getByTestId(`hole-row-${hole}-yards`).fill(String(300 + hole * 10));
      await page.getByTestId(`hole-row-${hole}-hcp`).fill(String(hole));
    }

    await page.getByTestId("calculate-button").click();

    await expect(page.getByTestId("results-table")).toBeVisible();
    await expect(page.getByTestId("result-hole-1-expected-decimal")).toBeVisible();
    await expect(page.getByTestId("result-hole-1-expected-integer")).toBeVisible();
    await expect(page.getByTestId("result-hole-1-expected-range")).toBeVisible();
    await expect(page.getByTestId("total-front")).toBeVisible();
    await expect(page.getByTestId("total-back")).toBeVisible();
    await expect(page.getByTestId("total-18")).toBeVisible();
  });

  test("P1: invalid handicap ranks block calculate and show validation @p1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mvp-root")).toBeVisible();

    await page.getByTestId("handicap-index").fill("10");
    await page.getByTestId("tee-name").fill("Green");
    await page.getByTestId("course-par").fill("72");
    await page.getByTestId("course-rating").fill("70.7");
    await page.getByTestId("bogey-rating").fill("95.8");
    await page.getByTestId("slope-rating").fill("135");

    for (let hole = 1; hole <= 18; hole++) {
      await page.getByTestId(`hole-row-${hole}-par`).fill("4");
      await page.getByTestId(`hole-row-${hole}-yards`).fill("400");
      const rank = hole <= 2 ? 1 : hole;
      await page.getByTestId(`hole-row-${hole}-hcp`).fill(String(rank));
    }

    await page.getByTestId("calculate-button").click();

    await expect(page.getByTestId("validation-error")).toBeVisible();
    await expect(page.getByTestId("results-table")).not.toBeVisible();
  });
});
