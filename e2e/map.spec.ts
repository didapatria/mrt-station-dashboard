import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Station Map Page", () => {
  test("should display map with station markers", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/map");
    await page.waitForTimeout(1000);

    // Leaflet map
    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });

    // Status indicators
    await expect(page.locator("text=/active/i").first()).toBeVisible();

    // Click station in list
    const stationItem = page
      .locator("text=/Lebak Bulus|Bundaran HI|Dukuh Atas/i")
      .first();
    if (await stationItem.isVisible()) {
      await stationItem.click();
      await page.waitForTimeout(500);
    }
  });

  test("should search stations in map sidebar", async ({ adminPage: page }) => {
    await navigateTo(page, "/map");
    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Bundaran");
      await page.waitForTimeout(500);
      await expect(page.locator("text=/Bundaran HI/i").first()).toBeVisible();
    }
  });
});
