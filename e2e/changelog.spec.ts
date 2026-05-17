import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Changelog Page", () => {
  test("should display changelog with versions", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    await expect(page.locator("text=/changelog/i").first()).toBeVisible();
    await expect(page.locator("text=/v[0-9]+/").first()).toBeVisible();
  });

  test("should show Latest badge on newest release", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    await expect(page.locator("text=/latest/i").first()).toBeVisible();
    // v2.9.0 should be at top
    await expect(page.locator("text=/2\.9\.0/").first()).toBeVisible();
  });

  test("should show commit hash links", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    // Commit hashes for v2.7.0
    await expect(page.locator("text=/16aa9d8|fc1c219/").first()).toBeVisible();
    // Commit links should point to GitHub
    const commitLink = page.locator("a[href*='github.com'][href*='/commit/']").first();
    await expect(commitLink).toBeVisible();
  });

  test("should display items for each version", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    await expect(page.locator("text=/RBAC|Spatie/i").first()).toBeVisible();
    await expect(page.locator("text=/Google OAuth/i").first()).toBeVisible();
    await expect(page.locator("text=/Fly.io|Supabase/i").first()).toBeVisible();
  });
});
