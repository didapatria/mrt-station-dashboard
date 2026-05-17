import { test as base, expect, Page } from "@playwright/test";
import path from "path";

const ADMIN_EMAIL = "admin@mrtjakarta.co.id";
const ADMIN_PASSWORD = "admin123";
const OPERATOR_EMAIL = "operator@mrtjakarta.co.id";
const OPERATOR_PASSWORD = "operator123";
const API_URL = "http://localhost:3000/api";

async function navigateTo(page: Page, targetPath: string): Promise<void> {
  const currentPath = new URL(page.url()).pathname;
  if (currentPath === targetPath) {
    await page.waitForTimeout(500);
    return;
  }
  const link = page.locator(`a[href='${targetPath}']`).first();
  if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
    await link.click();
  } else {
    await link.click({ force: true }).catch(async () => {
      await page.evaluate((p) => {
        window.history.pushState(null, "", p);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, targetPath);
    });
  }
  await page.waitForTimeout(2000);
}

type AuthFixtures = {
  adminPage: Page;
  operatorPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    // Navigate to /settings (no API data calls) to initialize auth
    // without consuming rate limit. Tests navigate to their target page.
    await page.goto("/settings");
    await page.waitForURL(/settings|dashboard/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await use(page);
  },
  operatorPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve("e2e/.auth/operator.json"),
    });
    const page = await context.newPage();
    await page.goto("/settings");
    await page.waitForURL(/settings|dashboard/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await use(page);
    await context.close();
  },
});

export {
  expect,
  navigateTo,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  OPERATOR_EMAIL,
  OPERATOR_PASSWORD,
  API_URL,
};
