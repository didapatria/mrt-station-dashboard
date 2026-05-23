import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Incidents Page", () => {
  test("should load incidents page with table and report button", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });
    await expect(
      page.getByRole("button", { name: /report incident/i }).first()
    ).toBeVisible();
  });

  test("should create a new incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    const uniqueId = Date.now().toString(36);
    const incidentTitle = `E2E Incident ${uniqueId}`;

    await page.getByRole("button", { name: /report incident/i }).first().click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("input[name='title'], #title").fill(incidentTitle);

    // Select severity — first combobox in dialog is severity (stationId is second)
    await dialog.locator("button[role='combobox']").first().click();
    await page.getByRole("option", { name: /high/i }).first().click();

    await dialog.getByRole("button", { name: /report incident/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Verify in table
    await expect(page.locator("tbody")).toContainText(incidentTitle, { timeout: 8000 });
  });

  test("should edit an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Click edit on first incident
    const editBtn = page.locator("tbody tr").first().getByTitle("Edit");
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Change severity to LOW
    await dialog.locator("button[role='combobox']").first().click();
    await page.getByRole("option", { name: /low/i }).first().click();

    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Verify row now shows LOW badge
    await expect(page.locator("tbody tr").first()).toContainText("LOW", { timeout: 5000 });
  });

  test("should resolve an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Find first non-resolved incident's resolve button
    const resolveBtn = page
      .locator("tbody tr")
      .filter({ hasNot: page.locator("span:text('RESOLVED')") })
      .first()
      .getByTitle("Resolve");
    await expect(resolveBtn).toBeVisible({ timeout: 8000 });
    await resolveBtn.click();

    const alertDialog = page.locator("[role='alertdialog']");
    await expect(alertDialog).toBeVisible({ timeout: 5000 });
    await alertDialog.getByRole("button", { name: /^resolve$/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });

    // Table should reflect RESOLVED
    await expect(page.locator("tbody")).toContainText("RESOLVED", { timeout: 8000 });
  });

  test("should delete an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Get title of first incident before deleting
    const firstRow = page.locator("tbody tr").first();
    const titleText = await firstRow.locator("td").nth(1).textContent();

    const deleteBtn = firstRow.getByTitle("Delete");
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();

    const alertDialog = page.locator("[role='alertdialog']");
    await expect(alertDialog).toBeVisible({ timeout: 5000 });
    await alertDialog.getByRole("button", { name: /^delete$/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });

    if (titleText) {
      await expect(page.locator("tbody")).not.toContainText(titleText, { timeout: 8000 });
    }
  });

  test("should filter incidents by severity", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Select CRITICAL from first filter combobox (severity)
    const severitySelect = page.locator("button[role='combobox']").first();
    await severitySelect.click();
    await page.getByRole("option", { name: /critical/i }).first().click();

    await page.waitForTimeout(1000);

    // All visible severity badges should be CRITICAL (or table empty)
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count > 0) {
      const nonCritical = page.locator("tbody span").filter({ hasText: /^(HIGH|MEDIUM|LOW)$/ });
      await expect(nonCritical).toHaveCount(0);
    }
  });
});
