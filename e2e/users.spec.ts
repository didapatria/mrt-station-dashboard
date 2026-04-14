import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Users Page", () => {
  test("should display and search users (admin)", async ({ adminPage: page }) => {
    await navigateTo(page, "/users");

    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    expect(await rows.count()).toBeGreaterThanOrEqual(2);

    // Search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Operator");
    await page.waitForTimeout(1000);
    await expect(page.locator("tbody")).toContainText(/operator/i);
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Current user badge
    await expect(page.locator("text=/you/i").first()).toBeVisible();
  });

  test("should not show Users in sidebar for operator", async ({ operatorPage: page }) => {
    const usersLink = page.locator("a[href='/users']");
    const isVisible = await usersLink.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });
});
