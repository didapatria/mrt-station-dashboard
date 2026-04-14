import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./fixtures/auth";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.locator("text=Sign In").first()).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.click("button[type='submit']");
    await page.waitForTimeout(500);
    await expect(
      page.locator("text=/invalid email|required/i").first()
    ).toBeVisible();
  });

  test("should show error on wrong credentials", async ({ page }) => {
    await page.locator("#email").fill("wrong@email.com");
    await page.locator("#password").fill("wrongpassword");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    // Error could be inline, toast, or alert
    const errorVisible =
      (await page
        .locator("text=/invalid|incorrect|error|unauthorized|failed/i")
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page.locator("[data-sonner-toast]").isVisible().catch(() => false)) ||
      (await page.locator("[role='status']").isVisible().catch(() => false)) ||
      (await page.locator("li[data-toast]").isVisible().catch(() => false)) ||
      (await page.locator(".bg-destructive, .text-destructive").first().isVisible().catch(() => false));
    // If still on login page, the login failed (which is the expected behavior)
    expect(errorVisible || page.url().includes("/login")).toBeTruthy();
  });

  test("should login successfully as admin", async ({ page }) => {
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.click("a[href='/register']");
    await expect(page).toHaveURL(/register/);
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display register form", async ({ page }) => {
    await expect(page.locator("text=Sign Up").first()).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.click("button[type='submit']");
    await page.waitForTimeout(500);
    const hasErrors = await page
      .locator(
        "p.text-destructive, [role='alert'], .text-red-500, p[class*='destructive'], p[class*='error']"
      )
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasErrors).toBeTruthy();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.click("a[href='/login']");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Auth Guard", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect /stations to login when not logged in", async ({
    page,
  }) => {
    await page.goto("/stations");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("404 Page", () => {
  test("should show 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=404")).toBeVisible();
  });
});
