import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Changelog Page", () => {
  test("should display changelog with versions", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    await expect(page.locator("text=/changelog/i").first()).toBeVisible();
    await expect(page.locator("text=/v[0-9]+/").first()).toBeVisible();
  });
});
