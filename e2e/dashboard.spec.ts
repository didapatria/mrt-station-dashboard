import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Dashboard", () => {
  test("should display dashboard with stats and charts", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");

    // Welcome banner
    await expect(page.locator("text=/good (morning|afternoon|evening)/i")).toBeVisible();

    // Wait for API data
    await page.waitForTimeout(2000);

    // Stat cards - check for numbers that appear after data loads
    await expect(page.locator("text=13").first()).toBeVisible(); // Total stations count

    // Charts
    await expect(page.locator("text=/Stations Breakdown|Schedules Breakdown/i").first()).toBeVisible();

    // Tabs
    const stationsTab = page.getByRole("tab", { name: /station/i });
    await expect(stationsTab).toBeVisible();

    // Table data
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("should not show admin-only controls for operator", async ({ operatorPage: page }) => {
    await navigateTo(page, "/dashboard");
    await page.waitForTimeout(2000);
    // Operator sees dashboard but not user management link
    await expect(page.locator("text=/good (morning|afternoon|evening)/i")).toBeVisible();
    const usersLink = page.locator("a[href='/users']");
    expect(await usersLink.isVisible().catch(() => false)).toBeFalsy();
  });

  test("should switch data tabs and use export buttons", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");

    // Switch to schedules tab
    const schedulesTab = page.getByRole("tab", { name: /schedule/i });
    await schedulesTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator("table").first()).toBeVisible();

    // Export buttons should be clickable
    const exportStationsBtn = page.getByRole("button", { name: /export stations/i });
    await expect(exportStationsBtn).toBeVisible();

    const exportSchedulesBtn = page.getByRole("button", { name: /export schedules/i });
    await expect(exportSchedulesBtn).toBeVisible();

    // PDF Report button
    const pdfBtn = page.getByRole("button", { name: /pdf report/i });
    if (await pdfBtn.isVisible()) {
      await expect(pdfBtn).toBeEnabled();
    }
  });
});
