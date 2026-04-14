import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Station Compare Page", () => {
  test("should compare two stations", async ({ adminPage: page }) => {
    await navigateTo(page, "/compare");

    await expect(page.locator("text=/station comparison|compare/i").first()).toBeVisible();

    const comboboxes = page.locator("button[role='combobox']");
    expect(await comboboxes.count()).toBeGreaterThanOrEqual(2);

    // Select left station
    await comboboxes.first().click();
    await page.waitForTimeout(300);
    await page.getByRole("option").first().click();
    await page.waitForTimeout(500);

    // Select right station
    await comboboxes.nth(1).click();
    await page.waitForTimeout(300);
    const options = page.getByRole("option");
    const optCount = await options.count();
    await options.nth(Math.min(1, optCount - 1)).click();
    await page.waitForTimeout(1000);

    // Comparison data visible
    await expect(
      page.locator("text=/LBB|FTM|CPR|HJN|BLA|BLM|ASN|SNY|IST|BNH|STB|DKA|BHI/").first()
    ).toBeVisible();
  });
});
