import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: "auth-tests",
      testMatch: /auth.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin-tests",
      testIgnore: /auth.*\.spec\.ts|mobile.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
    },
    {
      name: "mobile-tests",
      testMatch: /mobile.*\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        storageState: "e2e/.auth/admin.json",
      },
    },
  ],
});
