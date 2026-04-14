import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Route Planner Page", () => {
  test("should display and use route planner", async ({ adminPage: page }) => {
    await navigateTo(page, "/route-planner");

    await expect(page.locator("text=/route planner/i").first()).toBeVisible();

    const comboboxes = page.locator("button[role='combobox']");
    expect(await comboboxes.count()).toBeGreaterThanOrEqual(2);

    // Select departure station
    await comboboxes.first().click();
    await page.waitForTimeout(300);
    await page.getByRole("option").first().click();
    await page.waitForTimeout(300);

    // Select arrival station
    await comboboxes.nth(1).click();
    await page.waitForTimeout(300);
    const options = page.getByRole("option");
    const optCount = await options.count();
    await options.nth(Math.min(1, optCount - 1)).click();
    await page.waitForTimeout(1000);

    // Results
    const hasResults =
      (await page.locator("table").isVisible().catch(() => false)) ||
      (await page.locator("text=/no.*route|no.*schedule|0 schedule/i").first().isVisible().catch(() => false)) ||
      (await page.locator("text=/schedule/i").first().isVisible().catch(() => false));
    expect(hasResults).toBeTruthy();
  });
});
