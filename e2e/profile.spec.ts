import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Profile Page", () => {
  test("should display profile info and sections", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    // User info
    await expect(page.locator("text=/admin/i").first()).toBeVisible();

    // Change password form
    await expect(page.locator("#currentPassword")).toBeVisible();
    await expect(page.locator("#newPassword")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();

    // Tech stack section
    await expect(page.locator("text=/tech stack/i").first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /frontend/i })).toBeVisible();

    // Preferences section
    await expect(page.locator("text=/preference/i").first()).toBeVisible();
  });

  test("should validate password change form", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    await page.locator("#currentPassword").fill("admin123");
    await page.locator("#newPassword").fill("newpass123");
    await page.locator("#confirmPassword").fill("differentpass");

    await page.getByRole("button", { name: /change password/i }).click();
    await page.waitForTimeout(1000);

    const hasError =
      (await page.locator("text=/match|mismatch|not match/i").first().isVisible().catch(() => false)) ||
      (await page.locator("p.text-destructive, [role='alert'], .text-red-500, p[class*='destructive']").first().isVisible().catch(() => false));
    expect(hasError).toBeTruthy();
  });

  test("should display permissions card with badges (admin)", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    await expect(page.locator("text=/permissions/i").first()).toBeVisible({ timeout: 8000 });
    // Admin has many permissions — at least one badge should be visible
    await expect(page.locator("text=/stations.view|dashboard.view|users.view/").first()).toBeVisible({ timeout: 8000 });
    // Should show count
    await expect(page.locator("text=/permissions granted/i").first()).toBeVisible();
  });

  test("should show fewer permissions for operator", async ({ operatorPage: page }) => {
    await navigateTo(page, "/profile");

    await expect(page.locator("text=/permissions/i").first()).toBeVisible({ timeout: 8000 });
    // Operator should NOT have admin permissions
    const hasUsersDelete = await page.locator("text=users.delete").isVisible().catch(() => false);
    expect(hasUsersDelete).toBeFalsy();
  });

  test("should switch tech stack tabs", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    await expect(page.getByRole("tab", { name: /frontend/i })).toBeVisible();
    await page.getByRole("tab", { name: /backend/i }).click();
    await expect(page.locator("text=/Express|Prisma/").first()).toBeVisible();

    await page.getByRole("tab", { name: /infra/i }).click();
    await expect(page.locator("text=/Fly.io|Vercel|Docker/").first()).toBeVisible();

    await page.getByRole("tab", { name: /testing/i }).click();
    await expect(page.locator("text=/Playwright/").first()).toBeVisible();
  });
});
