import { chromium, FullConfig } from "@playwright/test";

const ADMIN_EMAIL = "admin@mrtjakarta.co.id";
const ADMIN_PASSWORD = "admin123";
const OPERATOR_EMAIL = "operator@mrtjakarta.co.id";
const OPERATOR_PASSWORD = "operator123";

async function loginAndSave(
  email: string,
  password: string,
  storagePath: string,
  baseURL: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  await page.waitForLoadState("domcontentloaded");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.click("button[type='submit']");
  await page.waitForURL(/dashboard/, { timeout: 30000 });
  // Wait for permissions to be persisted to localStorage (non-empty array)
  // so storageState won't trigger a fresh fetch on every test load
  await page.waitForFunction(
    () => {
      const p = localStorage.getItem("permissions");
      if (!p) return false;
      try { return JSON.parse(p).length > 0; } catch { return false; }
    },
    { timeout: 8000 }
  ).catch(async () => {
    await page.waitForTimeout(2000);
  });

  await context.storageState({ path: storagePath });
  await browser.close();
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || "http://localhost:5173";

  await loginAndSave(
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    "e2e/.auth/admin.json",
    baseURL
  );

  await loginAndSave(
    OPERATOR_EMAIL,
    OPERATOR_PASSWORD,
    "e2e/.auth/operator.json",
    baseURL
  );
}

export default globalSetup;
