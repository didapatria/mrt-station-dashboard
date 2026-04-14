import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Stations Page", () => {
  test("should display and interact with stations", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");

    // Verify table loaded
    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Lebak");
    await page.waitForTimeout(1000);
    await expect(page.locator("tbody")).toContainText(/Lebak/i);
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Sort by clicking column header
    const orderHeader = page.locator("th").filter({ hasText: /order/i }).first();
    if (await orderHeader.isVisible()) {
      await orderHeader.click();
      await page.waitForTimeout(500);
    }

    // Pagination
    const nextBtn = page.getByRole("button", { name: /next/i }).first();
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator("table")).toBeVisible();
    }
  });

  test("should view station detail page", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");

    // Click on a station name link to go to detail
    const stationLink = page.locator("tbody tr a").first();
    if (await stationLink.isVisible()) {
      await stationLink.click();
      await page.waitForTimeout(2000);

      // Should show station detail with code, name, status
      await expect(page.locator("text=/LBB|FTM|CPR|HJN|BLA|BLM|ASN|SNY|IST|BNH|STB|DKA|BHI/").first()).toBeVisible();
      // Should show location info
      await expect(page.locator("text=/Jakarta/i").first()).toBeVisible();
      // Should show schedules section or map
      const hasSchedules = await page.locator("text=/schedule|train/i").first().isVisible().catch(() => false);
      const hasMap = await page.locator(".leaflet-container").isVisible().catch(() => false);
      expect(hasSchedules || hasMap).toBeTruthy();
    }
  });

  test("should create, edit, and delete a station", async ({ adminPage: page }) => {
    await navigateTo(page, "/stations");
    await page.waitForTimeout(1000);

    // CREATE
    const addBtn = page.getByRole("button", { name: /add station/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await dialog.locator("#name").fill("Test Station E2E");
    await dialog.locator("#code").fill("TSE");
    await dialog.locator("#location").fill("Test Location");
    await dialog.locator("#latitude").fill("-6.2000");
    await dialog.locator("#longitude").fill("106.8000");
    await dialog.locator("#order").fill("99");

    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await page.waitForTimeout(2000);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // SEARCH for created station
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Test Station E2E");
    await page.waitForTimeout(1000);

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // EDIT
    const editBtn = rows.first().locator("button").first();
    await editBtn.click();
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    await dialog.locator("#name").clear();
    await dialog.locator("#name").fill("Test Station Updated");
    await dialog.getByRole("button", { name: /update|save/i }).click();
    await page.waitForTimeout(2000);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // DELETE
    await searchInput.clear();
    await searchInput.fill("Test Station Updated");
    await page.waitForTimeout(1000);

    const delRows = page.locator("tbody tr");
    if ((await delRows.count()) > 0) {
      const actionBtns = delRows.first().locator("button");
      const btnCount = await actionBtns.count();
      await actionBtns.nth(btnCount - 1).click();
      await page.waitForTimeout(500);
      const alertDialog = page.locator("[role='alertdialog'], [role='dialog']");
      const deleteBtn = alertDialog.getByRole("button", { name: /delete|confirm/i });
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
