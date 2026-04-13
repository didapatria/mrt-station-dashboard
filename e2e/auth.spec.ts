import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2, [data-slot='card-title']")).toContainText(/sign in/i);
  });

  test("should show register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2, [data-slot='card-title']")).toContainText(/sign up/i);
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await page.click("a[href='/register']");
    await expect(page).toHaveURL(/register/);
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/login");
    await page.click("button[type='submit']");
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("404 Page", () => {
  test("should show 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=404")).toBeVisible();
  });
});
