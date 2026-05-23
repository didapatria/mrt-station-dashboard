import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Command Center", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await navigateTo(page, "/command");
    // navigateTo already waits 2000ms; wait for header to confirm render
    await expect(
      page.locator("h1, [class*='font-display']").filter({ hasText: /COMMAND CENTER|PUSAT KOMANDO/i }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should render the command center page", async ({
    adminPage: page,
  }) => {
    await expect(
      page.locator("h1").filter({ hasText: /COMMAND CENTER|PUSAT KOMANDO/i }).first(),
    ).toBeVisible();
  });

  test("should display the station grid with station tiles", async ({
    adminPage: page,
  }) => {
    await expect(page.getByText(/Station Grid/i).first()).toBeVisible({
      timeout: 5000,
    });
    // Any station code badge visible means grid loaded from API
    const stationCode = page.locator(".ops-card .font-mono").first();
    await expect(stationCode).toBeVisible({ timeout: 10000 });
  });

  test("should display the system status panel", async ({
    adminPage: page,
  }) => {
    await expect(page.getByText("System Status").first()).toBeVisible({
      timeout: 5000,
    });
    const statusLabel = page.locator(
      "text=/ALL SYSTEMS GO|DEGRADED|INCIDENT/",
    );
    await expect(statusLabel.first()).toBeVisible({ timeout: 10000 });
  });

  test("should show the activity feed section", async ({
    adminPage: page,
  }) => {
    await expect(page.getByText("Activity Feed").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show live connection indicator in header", async ({
    adminPage: page,
  }) => {
    const indicator = page.locator("text=/LIVE|RECONNECTING|OFFLINE/");
    await expect(indicator.first()).toBeVisible({ timeout: 5000 });
  });
});
