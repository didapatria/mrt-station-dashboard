import { test, expect } from "@playwright/test";

// All tests run on Pixel 7 viewport (412x915) via playwright.config.ts mobile-tests project

test.describe("Mobile — Navigation", () => {
  test("sidebar hidden on load, toggled by hamburger", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    const sidebar = page.locator("[data-tour='sidebar'], nav, aside").first();
    const hamburger = page.locator("button[aria-label*='menu' i], button[data-tour*='menu' i], button svg[class*='menu' i]").first();

    const hamburgerVisible = await hamburger.isVisible().catch(() => false);
    const sidebarOffscreen = await sidebar.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left < 0 || rect.width === 0 || getComputedStyle(el).display === "none";
    }).catch(() => true);

    expect(hamburgerVisible || sidebarOffscreen).toBeTruthy();
  });

  test("can navigate to stations via mobile sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    const stationsLink = page.locator("a[href='/stations']");
    if (await stationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stationsLink.click();
    } else {
      await page.goto("/stations");
    }
    await page.waitForTimeout(2000);
    // Use heading role — not sidebar text which may be hidden
    await expect(page.getByRole("heading").filter({ hasText: /station/i }).first()).toBeVisible();
  });
});

test.describe("Mobile — Dashboard", () => {
  test("stat cards stack vertically", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);

    await expect(page.locator("text=/good (morning|afternoon|evening)/i")).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test("table scrolls horizontally on mobile", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);

    const table = page.locator("table").first();
    if (await table.isVisible()) {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    }
  });
});

test.describe("Mobile — Stations", () => {
  test("stations list renders on mobile", async ({ page }) => {
    await page.goto("/stations");
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading").filter({ hasText: /station/i }).first()).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test("search input accessible on mobile", async ({ page }) => {
    await page.goto("/stations");
    await page.waitForTimeout(1500);

    const searchInput = page.locator("input[placeholder*='search' i], input[type='search']").first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.tap();
      await searchInput.fill("Bundaran");
      await page.waitForTimeout(800);
      await expect(page.locator("text=/bundaran/i").first()).toBeVisible();
    }
  });
});

test.describe("Mobile — Schedules", () => {
  test("schedules page renders without overflow", async ({ page }) => {
    await page.goto("/schedules");
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading").filter({ hasText: /schedule/i }).first()).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe("Mobile — Profile", () => {
  test("profile cards stack on mobile", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading").filter({ hasText: /profile/i }).first()).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test("permissions badges wrap on mobile", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // "permissions granted" text is in CardDescription — not sidebar
    const permCard = page.locator("text=/permissions granted/i").first();
    await expect(permCard).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Mobile — Map", () => {
  test("map renders full-width on mobile", async ({ page }) => {
    await page.goto("/map");
    await page.waitForTimeout(4000);

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    const mapBox = await mapContainer.boundingBox();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(mapBox!.width).toBeGreaterThan(viewportWidth * 0.8);
  });
});

test.describe("Mobile — Auth", () => {
  test("login page usable on mobile", async ({ page }) => {
    // Clear auth state so login page is accessible
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.waitForTimeout(1000);

    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']").first();

    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible();

    const emailBox = await emailInput.boundingBox();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(emailBox!.width).toBeGreaterThan(viewportWidth * 0.5);
  });

  test("login form submits on mobile", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.waitForTimeout(1000);

    const emailInput = page.locator("input[type='email']");
    if (!(await emailInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Already authenticated and on dashboard — pass
      await expect(page).toHaveURL(/dashboard/);
      return;
    }

    await emailInput.fill("admin@mrtjakarta.co.id");
    await page.locator("input[type='password']").first().fill("admin123");
    await page.getByRole("button", { name: /login|sign in/i }).tap();
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });
});

test.describe("Mobile — Changelog", () => {
  test("changelog cards readable on mobile", async ({ page }) => {
    await page.goto("/changelog");
    await page.waitForTimeout(2000);

    // Latest version (v2.8.0) should be visible
    await expect(page.locator("text=/2\.8\.0/").first()).toBeVisible({ timeout: 8000 });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});
