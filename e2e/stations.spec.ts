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
  
    // ── CREATE ──
    const addBtn = page.getByRole("button", { name: /add station/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
  
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await dialog.locator("#name").fill("Test Station E2E");
    await dialog.locator("#code").fill("TSE");
    await dialog.locator("#location").fill("Test Location");
    await dialog.locator("#latitude").fill("-6.2000");
    await dialog.locator("#longitude").fill("106.8000");
    await dialog.locator("#order").fill("99");
  
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 }); // ← increased + explicit wait
  
    // ── SEARCH & EDIT ──
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Test Station E2E");
    await expect(page.locator("tbody")).toContainText(/Test Station E2E/i);
  
    // Use precise aria-label or text matcher for edit button
    const row = page.locator("tbody tr", { hasText: /Test Station E2E/ });
    const editBtn = row.getByRole("button", { name: /edit/i }); // ← precise selector
    await expect(editBtn).toBeVisible();
    await editBtn.click();
  
    // Re-locate dialog to avoid stale reference
    const editDialog = page.locator("[role='dialog']");
    await expect(editDialog).toBeVisible({ timeout: 5000 }); // ← wait for animation
    await editDialog.locator("#name").clear();
    await editDialog.locator("#name").fill("Test Station Updated");
    await editDialog.getByRole("button", { name: /update|save/i }).click();
    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
  
    // ── DELETE ──
    await searchInput.clear();
    await searchInput.fill("Test Station Updated");
    await expect(page.locator("tbody")).toContainText(/Test Station Updated/i);
  
    const delRow = page.locator("tbody tr", { hasText: /Test Station Updated/ });
    const deleteBtn = delRow.getByRole("button", { name: /delete/i }); // ← precise selector
    await deleteBtn.click();
  
    const alertDialog = page.locator("[role='alertdialog'], [role='dialog']");
    await expect(alertDialog).toBeVisible();
    await alertDialog.getByRole("button", { name: /delete|confirm/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });
  });
});
