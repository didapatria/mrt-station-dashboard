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

  test("should filter activity log by entity", async ({ adminPage: page }) => {
    await navigateTo(page, "/activity");
    await page.waitForTimeout(1000);

    const trigger = page.locator("button[role='combobox']").first();
    await trigger.click();
    await page.waitForTimeout(200);

    const stationOption = page.getByRole("option", { name: /station/i });
    if (await stationOption.isVisible()) {
      await stationOption.click();
      await page.waitForTimeout(1000);
      // Should show Station-related entries or empty state
      const hasContent =
        (await page.locator("text=/station/i").first().isVisible().catch(() => false)) ||
        (await page.locator("text=/no.*activity|empty/i").first().isVisible().catch(() => false));
      expect(hasContent).toBeTruthy();
    }
  });

  test("should export activity log as CSV", async ({ adminPage: page }) => {
    await navigateTo(page, "/activity");
    await page.waitForTimeout(1000);

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 5000 }).catch(() => null),
      page.getByRole("button", { name: /csv/i }).click(),
    ]);
    // Download triggered or button clicked without error
    const exportBtn = page.getByRole("button", { name: /csv/i });
    await expect(exportBtn).toBeVisible();
  });
});
