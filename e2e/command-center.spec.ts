import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Command Center", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await navigateTo(page, "/command");
    await page.waitForTimeout(2000);
  });

  test("should render the command center page", async ({
    adminPage: page,
  }) => {
    await expect(
      page.locator("text=/COMMAND CENTER|PUSAT KOMANDO/i"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display the station grid with station tiles", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("text=/Station Grid/i")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=BL").first()).toBeVisible({
      timeout: 8000,
    });
  });

  test("should display the system status panel", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("text=System Status")).toBeVisible({
      timeout: 5000,
    });
    const statusLabel = page.locator(
      "text=/ALL SYSTEMS GO|DEGRADED|INCIDENT/",
    );
    await expect(statusLabel.first()).toBeVisible({ timeout: 8000 });
  });

  test("should show the activity feed section", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("text=Activity Feed")).toBeVisible({
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
