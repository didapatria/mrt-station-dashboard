import { test, expect, navigateTo, API_URL } from "./fixtures/auth";

test.describe("Permissions API", () => {
  test("GET /permissions/me returns permission list for admin", async ({
    adminPage: page,
  }) => {
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const res = await page.request.get(`${API_URL}/permissions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toContain("stations.view");
    expect(body.data).toContain("users.view");
    expect(body.data.length).toBeGreaterThan(10);
  });

  test("GET /permissions/me returns fewer permissions for operator", async ({
    operatorPage: page,
  }) => {
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const res = await page.request.get(`${API_URL}/permissions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toContain("stations.view");
    expect(body.data).not.toContain("users.delete");
    expect(body.data).not.toContain("stations.delete");
  });

  test("GET /permissions returns all permissions for admin", async ({
    adminPage: page,
  }) => {
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const res = await page.request.get(`${API_URL}/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    // Each permission should have id, name, label, group, roles
    const perm = body.data[0];
    expect(perm).toHaveProperty("id");
    expect(perm).toHaveProperty("name");
    expect(perm).toHaveProperty("label");
    expect(perm).toHaveProperty("group");
    expect(perm).toHaveProperty("roles");
  });

  test("GET /permissions is forbidden for operator", async ({
    operatorPage: page,
  }) => {
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const res = await page.request.get(`${API_URL}/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe("Access Management Page", () => {
  test("permission matrix loads from DB for admin", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/access");

    await expect(page.locator("text=/permission matrix/i").first()).toBeVisible(
      { timeout: 8000 },
    );
    // Roles appear as column headers
    await expect(page.locator("text=ADMIN").first()).toBeVisible();
    await expect(page.locator("text=OPERATOR").first()).toBeVisible();
    // Permission groups loaded
    await expect(
      page.locator("text=/Stations|Dashboard/i").first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("operator is redirected away from /access", async ({
    operatorPage: page,
  }) => {
    await page.goto("/access");
    await page.waitForTimeout(2000);
    // Should redirect to dashboard or show no content
    const isAccessPage = await page
      .locator("text=/permission matrix/i")
      .isVisible()
      .catch(() => false);
    expect(isAccessPage).toBeFalsy();
  });
});
