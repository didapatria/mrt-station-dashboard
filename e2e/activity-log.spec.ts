import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Activity Log Page", () => {
  test("should display activity log with controls", async ({ adminPage: page }) => {
    await navigateTo(page, "/activity");

    // Page title
    await expect(page.locator("text=/activity/i").first()).toBeVisible();

    // Entity filter
    const triggers = page.locator("button[role='combobox'], select");
    expect(await triggers.count()).toBeGreaterThanOrEqual(1);

    // CSV export button
    await expect(page.getByRole("button", { name: /csv/i })).toBeVisible();

    // Content (entries or empty state)
    await page.waitForTimeout(1000);
    const hasContent =
      (await page.locator("text=/create|update|delete/i").first().isVisible().catch(() => false)) ||
      (await page.locator("text=/no.*activity|no.*log|empty|no.*data/i").first().isVisible().catch(() => false));
    expect(hasContent).toBeTruthy();
  });
});
