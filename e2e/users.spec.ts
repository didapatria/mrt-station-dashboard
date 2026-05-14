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

test.describe("Access Management Page", () => {
  test("should display permission matrix for admin", async ({ adminPage: page }) => {
    await navigateTo(page, "/access");

    await expect(page.locator("text=/User Access Management/i").first()).toBeVisible();
    await expect(page.locator("text=/Permission Matrix/i").first()).toBeVisible();

    // Should show both roles
    await expect(page.locator("text=ADMIN").first()).toBeVisible();
    await expect(page.locator("text=OPERATOR").first()).toBeVisible();

    // Should show permission groups (loaded from API)
    await expect(page.locator("text=/Stations|Schedules|Users/").first()).toBeVisible();

    // Permission badges loaded from DB
    await expect(page.locator("text=/View Stations|Create Stations/").first()).toBeVisible({ timeout: 10000 });
  });

  test("should not show Access Management for operator", async ({ operatorPage: page }) => {
    const accessLink = page.locator("a[href='/access']");
    const isVisible = await accessLink.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });
});
