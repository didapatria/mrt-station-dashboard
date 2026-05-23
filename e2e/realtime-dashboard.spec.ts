import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Realtime Dashboard", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2000);
  });

  test("should show SSE connection indicator in welcome banner", async ({
    adminPage: page,
  }) => {
    // The welcome banner always shows one of: Live, Reconnecting…, Offline
    const connectionLabel = page.locator("text=/Live|Reconnecting|Offline/");
    await expect(connectionLabel.first()).toBeVisible({ timeout: 5000 });
  });

  test("should show notification bell in header", async ({
    adminPage: page,
  }) => {
    // Bell icon button in the top nav bar
    const bellButton = page.locator('button[aria-label="notifications"], button:has(> svg.lucide-bell), header button').filter({
      has: page.locator("svg"),
    });
    // Simpler: just look for the NotificationCenter button near the top
    const bell = page.locator(".lucide-bell").first();
    await expect(bell).toBeVisible({ timeout: 5000 });
  });

  test("should show operations status banner with valid status", async ({
    adminPage: page,
  }) => {
    // Banner shows one of the three operational states
    const banner = page.locator(
      "text=/All Systems Operational|Degraded Performance|Service Disruption/",
    );
    await expect(banner.first()).toBeVisible({ timeout: 8000 });
  });

  test("should show welcome banner with Operations Center label", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("text=Operations Center")).toBeVisible({
      timeout: 5000,
    });
  });
});
