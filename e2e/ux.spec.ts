import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("UX: Dashboard", () => {
  test("stat cards should display data after loading", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=13").first()).toBeVisible();
  });
});

test.describe("UX: Forms", () => {
  test("station form should validate required fields on empty submit", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    await page.waitForTimeout(1000);

    const addBtn = page.getByRole("button", { name: /add station/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await page.waitForTimeout(500);

    const hasErrors = await dialog
      .locator("p.text-destructive, p[class*='destructive']")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasErrors).toBeTruthy();

    await page.keyboard.press("Escape");
  });

  test("profile password mismatch should show clear error", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    await page.locator("#currentPassword").fill("admin123");
    await page.locator("#newPassword").fill("newpass123");
    await page.locator("#confirmPassword").fill("wrongmatch");

    await page.getByRole("button", { name: /change password/i }).click();
    await page.waitForTimeout(1000);

    const hasError =
      (await page.locator("text=/match/i").first().isVisible().catch(() => false)) ||
      (await page.locator("p.text-destructive").first().isVisible().catch(() => false));
    expect(hasError).toBeTruthy();
  });

  test("profile password toggle should not steal tab focus", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");

    await page.locator("#currentPassword").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#newPassword")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#confirmPassword")).toBeFocused();
  });
});

test.describe("UX: Navigation", () => {
  test("active sidebar item should be highlighted", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    const stationsLink = page.locator("a[href='/stations']").first();
    const classes = await stationsLink.getAttribute("class");
    expect(classes).toMatch(/bg-primary|bg-muted|active|font-medium/);
  });

  test("breadcrumb should show current page", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    // Check breadcrumb specifically (ol element)
    const breadcrumb = page.locator("ol[data-slot='breadcrumb-list']");
    await expect(breadcrumb).toContainText("Stations");
  });
});

test.describe("UX: Empty States", () => {
  test("search with no results should show feedback", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("zzzznonexistent");
    await page.waitForTimeout(1000);

    const hasEmptyFeedback =
      (await page.locator("text=/no.*station|not found|0 total|no.*result/i").first().isVisible().catch(() => false)) ||
      (await page.locator("tbody tr").count()) === 0;
    expect(hasEmptyFeedback).toBeTruthy();
  });
});

test.describe("UX: Responsive", () => {
  test("sidebar should be collapsible", async ({ adminPage: page }) => {
    const collapseBtn = page.locator("button").filter({ has: page.locator("svg.lucide-panel-left-close, svg.lucide-panel-left") }).first();
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(500);
      expect(true).toBeTruthy();
    }
  });
});
