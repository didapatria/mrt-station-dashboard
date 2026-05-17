import { test, expect } from "@playwright/test";
import { navigateTo } from "./fixtures/auth";

test.describe("Design — Auth Page", () => {
  test("left panel should be visible on desktop and contain branding text", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const leftPanel = page.locator(".hidden.lg\\:flex, [class*='lg:flex']").first();
    await expect(leftPanel).toBeVisible();

    await expect(page.locator("text=STATION").first()).toBeVisible();
    await expect(page.locator("text=MANAGEMENT").first()).toBeVisible();
    await expect(page.locator("text=DASHBOARD").first()).toBeVisible();
  });

  test("left panel should contain station names from rail line", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=LEBAK BULUS GRAB").first()).toBeVisible();
    await expect(page.locator("text=BUNDARAN HI").first()).toBeVisible();
  });

  test("left panel should contain SVG rail line diagram", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const svg = page.locator("svg").first();
    await expect(svg).toBeVisible();
  });

  test("left panel should be hidden on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const stationText = page.locator("text=LEBAK BULUS GRAB").first();
    const isVisible = await stationText.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });
});

test.describe("Design — Dashboard", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("welcome banner should show Operations Center label and uppercase greeting", async ({ page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2000);

    await expect(page.locator("text=Operations Center").first()).toBeVisible();

    const greeting = page.locator("text=/GOOD (MORNING|AFTERNOON|EVENING)/i").first();
    await expect(greeting).toBeVisible();
  });

  test("stat cards should have accent bar and font-display number", async ({ page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2000);

    const accentBar = page.locator("div.w-1").first();
    await expect(accentBar).toBeVisible();

    const fontDisplayNum = page.locator(".font-display").first();
    await expect(fontDisplayNum).toBeVisible();

    const overflowCard = page.locator(".overflow-hidden").first();
    await expect(overflowCard).toBeVisible();
  });
});
