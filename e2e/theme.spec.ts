import { test, expect } from "@playwright/test";

test.describe("Theme Toggle — Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
  });

  test("ThemeToggle is visible on auth page (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await expect(toggle).toBeVisible();
  });

  test("toggles between dark and light mode on auth page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Check initial theme
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await toggle.click();
    await page.waitForTimeout(300);

    // Theme should have flipped
    const isNowDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isNowDark).toBe(!isDark);

    // Toggle back
    await toggle.click();
    await page.waitForTimeout(300);
    const isBackToOriginal = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isBackToOriginal).toBe(isDark);
  });

  test("theme persists in localStorage after toggle", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const before = await page.evaluate(() => localStorage.getItem("theme"));

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await toggle.click();
    await page.waitForTimeout(300);

    const after = await page.evaluate(() => localStorage.getItem("theme"));
    expect(after).not.toBeNull();
    expect(after).not.toBe(before);
  });
});

test.describe("Theme Toggle — Dashboard", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("ThemeToggle is visible in header", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await expect(toggle).toBeVisible();
  });

  test("toggles theme and persists across navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await toggle.click();
    await page.waitForTimeout(300);

    // Navigate to another page
    await page.goto("/stations");
    await page.waitForTimeout(1000);

    // Theme should still be flipped (persisted via localStorage)
    const isNowDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isNowDark).toBe(!isDark);

    // Restore
    const toggle2 = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await toggle2.click();
  });

  test("html element has correct dark class after toggle", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    const toggle = page
      .getByRole("button", { name: /switch to (dark|light) mode/i })
      .first();
    await toggle.click();
    await page.waitForTimeout(300);

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDarkClass).toBe(!isDark);

    // Restore
    await toggle.click();
  });
});
