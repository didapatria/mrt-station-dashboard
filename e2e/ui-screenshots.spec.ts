/**
 * UI Screenshots — captures a full-page screenshot of every key page.
 * Screenshots are visible in the HTML report deployed to GitHub Pages:
 * https://didapatria.github.io/mrt-station-dashboard/
 *
 * All tests run in the admin-tests project (pre-authenticated).
 * `screenshot: "on"` in playwright.config.ts captures automatically.
 */
import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("UI Screenshots", () => {
  test("dashboard page", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2500);
    await expect(page.locator("text=/good (morning|afternoon|evening)/i")).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/dashboard.png", fullPage: true });
  });

  test("stations page", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    await page.waitForTimeout(2000);
    await expect(page.locator("table").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/stations.png", fullPage: true });
  });

  test("schedules page", async ({ adminPage: page }) => {
    await navigateTo(page, "/schedules");
    await page.waitForTimeout(2000);
    await expect(page.locator("table").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/schedules.png", fullPage: true });
  });

  test("station map page", async ({ adminPage: page }) => {
    await navigateTo(page, "/map");
    await page.waitForTimeout(2500);
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/map.png", fullPage: true });
  });

  test("route planner page", async ({ adminPage: page }) => {
    await navigateTo(page, "/route-planner");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=/ROUTE PLANNER/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/route-planner.png", fullPage: true });
  });

  test("station compare page", async ({ adminPage: page }) => {
    await navigateTo(page, "/compare");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=/STATION COMPARE/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/station-compare.png", fullPage: true });
  });

  test("users page", async ({ adminPage: page }) => {
    await navigateTo(page, "/users");
    await page.waitForTimeout(2000);
    await expect(page.locator("table").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/users.png", fullPage: true });
  });

  test("access management page", async ({ adminPage: page }) => {
    await navigateTo(page, "/access");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=/ACCESS CONTROL/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/access-management.png", fullPage: true });
  });

  test("activity log page", async ({ adminPage: page }) => {
    await navigateTo(page, "/activity");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=/ACTIVITY LOG/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/activity-log.png", fullPage: true });
  });

  test("settings page", async ({ adminPage: page }) => {
    await navigateTo(page, "/settings");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=/SETTINGS/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/settings.png", fullPage: true });
  });

  test("profile page", async ({ adminPage: page }) => {
    await navigateTo(page, "/profile");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=/PROFILE/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/profile.png", fullPage: true });
  });

  test("changelog page", async ({ adminPage: page }) => {
    await navigateTo(page, "/changelog");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=/CHANGELOG/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/changelog.png", fullPage: true });
  });

  test("404 not found page", async ({ adminPage: page }) => {
    await page.goto("/this-page-does-not-exist");
    await page.waitForTimeout(1000);
    await expect(page.locator("text=/404/i").first()).toBeVisible();
    await page.screenshot({ path: "playwright-report/screenshots/404.png", fullPage: true });
  });
});
