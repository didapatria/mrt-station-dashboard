import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Feedback", () => {
  test("should open feedback dialog and submit", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");

    // Open user dropdown
    const userMenu = page.locator("[data-tour='user-menu']");
    await expect(userMenu).toBeVisible({ timeout: 5000 });
    await userMenu.click();
    await page.waitForTimeout(300);

    // Click "Send Feedback"
    const feedbackItem = page.getByRole("menuitem", { name: /feedback/i });
    await expect(feedbackItem).toBeVisible({ timeout: 3000 });
    await feedbackItem.click();
    await page.waitForTimeout(500);

    // Dialog should open
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/feedback/i);

    // Star rating — click 4th star
    const stars = dialog.locator("button").filter({ has: page.locator("svg") });
    await stars.nth(3).click();
    await page.waitForTimeout(200);

    // Category select
    const categoryTrigger = dialog.locator("button[role='combobox']");
    await categoryTrigger.click();
    await page.waitForTimeout(200);
    await page.getByRole("option", { name: /general/i }).click();
    await page.waitForTimeout(200);

    // Message
    await dialog.locator("textarea").fill("Great dashboard, very useful for managing MRT stations.");

    // Submit button should be enabled
    const submitBtn = dialog.getByRole("button", { name: /send feedback/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Dialog should close and toast appear
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test("should not submit without rating or message", async ({ adminPage: page }) => {
    await navigateTo(page, "/dashboard");

    const userMenu = page.locator("[data-tour='user-menu']");
    await userMenu.click();
    await page.waitForTimeout(300);

    const feedbackItem = page.getByRole("menuitem", { name: /feedback/i });
    await feedbackItem.click();
    await page.waitForTimeout(500);

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Submit without filling anything
    const submitBtn = dialog.getByRole("button", { name: /send feedback/i });
    await expect(submitBtn).toBeDisabled();
  });
});
