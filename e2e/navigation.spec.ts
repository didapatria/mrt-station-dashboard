import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Navigation", () => {
  test("should navigate to all pages via sidebar", async ({
    adminPage: page,
  }) => {
    const routes = [
      "/stations",
      "/schedules",
      "/map",
      "/route-planner",
      "/compare",
      "/access",
      "/activity",
      "/changelog",
      "/profile",
      "/dashboard",
    ];
    for (const route of routes) {
      await navigateTo(page, route);
      expect(page.url()).toContain(route);
    }
  });

  test("should show admin sidebar items for admin", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("a[href='/users']")).toBeVisible();
  });

  test("should hide admin items for operator", async ({
    operatorPage: page,
  }) => {
    const isVisible = await page
      .locator("a[href='/users']")
      .isVisible()
      .catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test("should logout successfully", async ({ adminPage: page }) => {
    const userMenu = page.locator("[data-tour='user-menu']");
    await userMenu.click();
    await page.waitForTimeout(300);
    await page.locator("text=/logout|sign out/i").first().click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/login/);
  });
});
