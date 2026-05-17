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
      (await page
        .locator("table")
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator("text=/no.*route|no.*schedule|0 schedule/i")
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator("text=/schedule/i")
        .first()
        .isVisible()
        .catch(() => false));
    expect(hasResults).toBeTruthy();
  });

  test("should show all station options in dropdowns", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/route-planner");

    const comboboxes = page.locator("button[role='combobox']");
    await comboboxes.first().click();
    await page.waitForTimeout(300);

    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(13); // 13 MRT stations
    await page.keyboard.press("Escape");
  });

  test("should work for operator user", async ({ operatorPage: page }) => {
    await navigateTo(page, "/route-planner");
    await expect(page.locator("text=/route planner/i").first()).toBeVisible();
    // Operator has stations.view permission — route planner accessible
    const comboboxes = page.locator("button[role='combobox']");
    expect(await comboboxes.count()).toBeGreaterThanOrEqual(2);
  });
});
