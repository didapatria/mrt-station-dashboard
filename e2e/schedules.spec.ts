import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Schedules Page", () => {
  test("should display and search schedules", async ({ adminPage: page }) => {
    await navigateTo(page, "/schedules");

    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // Search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("MRT");
    await page.waitForTimeout(1000);
    await expect(page.locator("tbody")).toContainText(/MRT/);
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Switch to timeline tab
    const timelineTab = page.getByRole("tab", { name: /timeline/i });
    if (await timelineTab.isVisible()) {
      await timelineTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should create, edit, and delete a schedule", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/schedules");
    await page.waitForTimeout(1000);

    // CREATE
    const addBtn = page.getByRole("button", { name: /add schedule/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await dialog.locator("#trainNumber").fill("E2E-TEST-001");
    await dialog.locator("#departureTime").fill("10:00");
    await dialog.locator("#arrivalTime").fill("10:30");

    // Select stations
    const selects = dialog.locator("button[role='combobox']");
    const selectCount = await selects.count();
    if (selectCount >= 1) {
      await selects.first().click();
      await page.waitForTimeout(300);
      await page.getByRole("option").first().click();
      await page.waitForTimeout(300);
    }
    if (selectCount >= 2) {
      await selects.nth(1).click();
      await page.waitForTimeout(300);
      const options = page.getByRole("option");
      const optCount = await options.count();
      await options.nth(Math.min(1, optCount - 1)).click();
      await page.waitForTimeout(300);
    }

    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await page.waitForTimeout(2000);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // SEARCH and EDIT
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("E2E-TEST");
    await page.waitForTimeout(1000);

    const rows = page.locator("tbody tr");
    if ((await rows.count()) > 0) {
      await rows.first().locator("button").first().click();
      await page.waitForTimeout(500);
      await expect(dialog).toBeVisible();
      await dialog.locator("#trainNumber").clear();
      await dialog.locator("#trainNumber").fill("E2E-TEST-UPD");
      await dialog.getByRole("button", { name: /update|save/i }).click();
      await page.waitForTimeout(2000);
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }

    // DELETE
    await searchInput.clear();
    await searchInput.fill("E2E-TEST");
    await page.waitForTimeout(1000);
    const delRows = page.locator("tbody tr");
    if ((await delRows.count()) > 0) {
      const actionBtns = delRows.first().locator("button");
      const btnCount = await actionBtns.count();
      await actionBtns.nth(btnCount - 1).click();
      await page.waitForTimeout(500);
      const alertDialog = page.locator("[role='alertdialog'], [role='dialog']");
      const deleteBtn = alertDialog.getByRole("button", {
        name: /delete|confirm/i,
      });
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
