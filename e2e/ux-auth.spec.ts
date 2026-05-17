import { test, expect } from "@playwright/test";

test.describe("UX: Auth Pages", () => {
  test("login password toggle should show/hide password", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const passwordInput = page.locator("#password");
    await passwordInput.fill("mypassword");
    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = passwordInput.locator("..").locator("button");
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("register password toggle should show/hide password", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    const passwordInput = page.locator("#password");
    await passwordInput.fill("mypassword");
    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = passwordInput.locator("..").locator("button");
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("tab order should skip password toggle buttons on login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#email").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#password")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("button[type='submit']")).toBeFocused();
  });

  test("login should show Zod validation error for invalid email", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Submit with empty fields to trigger Zod validation
    await page.click("button[type='submit']");
    await page.waitForTimeout(500);

    await expect(page.locator("text=/invalid email/i").first()).toBeVisible();
  });
});
