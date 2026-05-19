import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Stations Page", () => {
  test("should display and interact with stations", async ({
    adminPage: page,
  }) => {
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
    const orderHeader = page
      .locator("th")
      .filter({ hasText: /order/i })
      .first();
    if (await orderHeader.isVisible()) {
      await orderHeader.click();
      await page.waitForTimeout(500);
    }

    // Pagination
    const nextBtn = page.getByRole("button", { name: /next/i }).first();
    if ((await nextBtn.isVisible()) && (await nextBtn.isEnabled())) {
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
      await expect(
        page
          .locator("text=/LBB|FTM|CPR|HJN|BLA|BLM|ASN|SNY|IST|BNH|STB|DKA|BHI/")
          .first(),
      ).toBeVisible();
      // Should show location info
      await expect(page.locator("text=/Jakarta/i").first()).toBeVisible();
      // Should show schedules section or map
      const hasSchedules = await page
        .locator("text=/schedule|train/i")
        .first()
        .isVisible()
        .catch(() => false);
      const hasMap = await page
        .locator(".leaflet-container")
        .isVisible()
        .catch(() => false);
      expect(hasSchedules || hasMap).toBeTruthy();
    }
  });

  test("should create, edit, and delete a station", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/stations");
    await expect(page.locator("table")).toBeVisible();
  
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.clear();
  
    // ── CREATE ──
    const addBtn = page.getByRole("button", { name: /add station/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
  
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
  
    const uniqueId = Date.now().toString(36);
    const stationName = `Test Station E2E ${uniqueId}`;
    const stationCode = `T${uniqueId.slice(-3).toUpperCase()}`;
  
    await dialog.locator("#name").fill(stationName);
    await dialog.locator("#code").fill(stationCode);
    await dialog.locator("#location").fill("Test Location");
    await dialog.locator("#latitude").fill("-6.2000");
    await dialog.locator("#longitude").fill("106.8000");
    await dialog.locator("#order").fill("99");
  
    const createBtn = dialog.getByRole("button", { name: "Create" });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();
  
    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 15000 });
  
    // CRITICAL: Search for the station instead of scanning paginated table
    await searchInput.fill(stationName);
    await expect(page.locator("tbody")).toContainText(stationName, { timeout: 10000 });
  
    // ── EDIT ──
    const row = page.locator("tbody tr", { hasText: stationName });
    const actionsCell = row.locator("td").last();
    const editBtn = actionsCell.locator("button").nth(0);
    await expect(editBtn).toBeVisible();
    await editBtn.click();
  
    const editDialog = page.locator("[role='dialog']");
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    await editDialog.locator("#name").clear();
    const updatedName = `Updated ${stationName}`;
    await editDialog.locator("#name").fill(updatedName);
  
    const saveBtn = editDialog.getByRole("button", { name: /save|update/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(editDialog).not.toBeVisible({ timeout: 15000 });
  
    // Verify update via search
    await searchInput.clear();
    await searchInput.fill(updatedName);
    await expect(page.locator("tbody")).toContainText(updatedName, { timeout: 10000 });
  
    // ── DELETE ──
    const delRow = page.locator("tbody tr", { hasText: updatedName });
    const delActionsCell = delRow.locator("td").last();
    const deleteBtn = delActionsCell.locator("button").nth(1);
    await deleteBtn.click();
  
    const alertDialog = page.locator("[role='alertdialog'], [role='dialog']");
    await expect(alertDialog).toBeVisible();
    await alertDialog.getByRole("button", { name: /delete|confirm/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });
  
    // Verify deletion via search
    await searchInput.clear();
    await searchInput.fill(updatedName);
    // After deletion, search should show no results or "No results" message
    await expect(page.locator("tbody")).not.toContainText(updatedName, { timeout: 10000 });
  });
});
