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
});
