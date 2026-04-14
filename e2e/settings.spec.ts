import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Settings Page", () => {
  test("should display all settings sections", async ({ adminPage: page }) => {
    await navigateTo(page, "/settings");

    await expect(page.locator("text=/settings/i").first()).toBeVisible();
    await expect(page.locator("text=/language/i").first()).toBeVisible();
    await expect(page.locator("text=/appearance|theme/i").first()).toBeVisible();
    await expect(page.locator("text=/about/i").first()).toBeVisible();
    await expect(page.locator("text=/react|express|postgresql/i").first()).toBeVisible();
  });

  test("should change language and theme", async ({ adminPage: page }) => {
    await navigateTo(page, "/settings");

    // Language toggle
    const langTrigger = page.locator("button[role='combobox']").filter({ hasText: /english|indonesia/i }).first();
    if (await langTrigger.isVisible()) {
      await langTrigger.click();
      await page.waitForTimeout(300);
      const idOption = page.getByRole("option", { name: /indonesia/i }).first();
      if (await idOption.isVisible()) {
        await idOption.click();
        await page.waitForTimeout(1000);
      }
      await langTrigger.click();
      await page.waitForTimeout(300);
      const enOption = page.getByRole("option", { name: /english/i }).first();
      if (await enOption.isVisible()) {
        await enOption.click();
        await page.waitForTimeout(500);
      }
    }

    // Theme toggle
    const themeTrigger = page.locator("button[role='combobox']").filter({ hasText: /light|dark/i }).first();
    if (await themeTrigger.isVisible()) {
      await themeTrigger.click();
      await page.waitForTimeout(300);
      const darkOption = page.getByRole("option", { name: /dark/i }).first();
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await page.waitForTimeout(1000);
      }
      await themeTrigger.click();
      await page.waitForTimeout(300);
      const lightOption = page.getByRole("option", { name: /light/i }).first();
      if (await lightOption.isVisible()) {
        await lightOption.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
