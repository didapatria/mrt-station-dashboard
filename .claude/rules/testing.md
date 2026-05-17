---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**/*.spec.ts"
---

# Testing Rules

## Unit Tests (Vitest + RTL)
- Use Vitest + React Testing Library (frontend)
- Co-locate test files with source: `foo.ts` → `foo.test.ts`
- Use descriptive test names: "should [expected] when [condition]"
- Group tests with `describe` blocks matching the module name
- Reset state in `beforeEach` (clear stores, localStorage)
- For Zustand stores: use `useStore.setState()` and `useStore.getState()` for direct testing
- For hooks: use `renderHook` from `@testing-library/react`
- Mock external services (API calls), not internal modules

## E2E Tests (Playwright)
- Test files live in `/e2e/*.spec.ts`, fixtures in `/e2e/fixtures/`
- Use `adminPage` fixture for authenticated tests (auto-login via storageState)
- Use `operatorPage` fixture to test operator role restrictions
- Use `navigateTo(page, "/path")` for SPA navigation — it clicks sidebar links
- Never use `waitForLoadState("networkidle")` — SSE keeps connections open
- Use `page.waitForTimeout(2000)` after navigation for data to load
- Combine related assertions in one test to reduce browser context creation
- For Radix/Shadcn selects: click `button[role='combobox']`, then `getByRole("option")`
- For dialogs: use `page.locator("[role='dialog']")`
- For ambiguous locators: always add `.first()` to avoid strict mode errors
- Global setup (`e2e/global-setup.ts`) logs in and saves storageState for both roles
- Config uses three projects: `auth-tests` (no auth), `admin-tests` (storageState), `mobile-tests` (Pixel 7 storageState)
- Mobile tests live in `e2e/mobile.spec.ts`, matched by `mobile.*\.spec\.ts` pattern
- Mobile tests use `page.tap()` not `page.click()` for touch interactions
- Mobile overflow check pattern: `document.body.scrollWidth <= window.innerWidth + 10`
- `screenshot: "on"` captures every test — visible in GitHub Pages report at https://didapatria.github.io/mrt-station-dashboard/
- `video: "retain-on-failure"` records video for failing tests
- 112 total tests across 21 spec files (as of v2.13.0 — 18 May 2026)
- Design tests in `ux-design.spec.ts` — auth panel, dashboard banner, stat card structure; run in admin-tests project only
- Theme tests in `theme.spec.ts` — ThemeToggle visibility, dark/light toggle, localStorage persistence, cross-page navigation persistence
- UI screenshot tests in `ui-screenshots.spec.ts` — captures full-page screenshots of all 13 pages; screenshots saved to `playwright-report/screenshots/`
