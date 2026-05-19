import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PageHeader } from "@/components/PageHeader";

const changelog = [
  {
    version: "2.13.0",
    date: "18 May 2026",
    commits: [
      "4a87811",
      "f03a4e7",
      "48c5152",
      "9b9541a",
      "380ed4e",
      "8dff0ad",
      "055810e",
      "e792cef",
    ],
    items: [
      "Google OAuth profile photo — avatarUrl stored on OAuth login, displayed in header avatar + ProfilePage",
      "Theme toggle auth fix — right panel uses CSS vars (var(--color-background/foreground)), responds to dark/light toggle",
      "ThemeToggle icon fix — inherits var(--color-foreground) instead of hardcoded white, visible in both modes",
      "Auth pages theme-aware — login/register text, inputs, borders use CSS variables; left panel stays intentionally dark",
      "SettingsPage layout fix — 2-column grid (was auto-fit unbounded), card accent via inset boxShadow (borderImage disabled borderRadius)",
      "E2E theme tests — 6 new Playwright tests: ThemeToggle visibility, dark/light toggle, localStorage persistence, navigation persistence (112 total)",
      "Version bump to v2.13.0 across swagger, sidebar footer, auth panel, settings",
    ],
  },
  {
    version: "2.12.0",
    date: "18 May 2026",
    commits: [
      "f32f1db",
      "7835b47",
      "40c87f1",
      "31bfc13",
      "21f754c",
      "8ff2062",
      "2d0a7c7",
      "4d1344a",
      "186c6f4",
      "d6e28ee",
      "76b22e6",
      "0986185",
    ],
    items: [
      "APEX SIGNAL design elevation — top accent gradient lines on all cards, horizontal fade lines on page headers, animated pulse on ACTIVE status LEDs, sidebar dot-grid texture",
      "Operations Terminal design system across all 13 dashboard pages — Bebas Neue section headers, JetBrains Mono data labels, LED status dots with glow, card containers",
      "Station Register aesthetic — code plate badges with glow, order circle badges (terminal stations 24px+glow), AnimatePresence floating bulk action bar",
      "Control Terminal auth redesign — dark left panel with MRT route diagram, live clock with blinking colons, scanline overlay, corner bracket decorations",
      "MERIDIAN dashboard redesign — dot-matrix + diagonal stripe welcome banner, pulsing stat accent bars, ghost icons, real-time Operations Center label",
      "DashboardLayout — sidebar dot-grid texture overlay, SYS ONLINE footer strip with version, gradient logo border, 0.25s snappy page transitions",
      "ThemeToggle split — desktop from AuthLayout, mobile from LoginPage/RegisterPage header row (no duplicate)",
      "LanguageToggle desktop fix — invalid xs: breakpoint replaced with sm:",
      "Auth store sync init — synchronous localStorage read prevents login redirect flash",
      "/access route guard — non-admin redirects to /dashboard before render",
      "React Compiler warnings resolved — useWatch() replacing watch(), if/else for void ternary",
      "Prettier formatting applied across 54 frontend files",
    ],
  },
  {
    version: "2.11.0",
    date: "17 May 2026",
    commits: ["09df222", "387cba4", "fc17cc7"],
    items: [
      "Fixed 10 Playwright test failures — ux-design auth tests (beforeEach clears localStorage), dashboard tests (page.goto replaces navigateTo on blank page)",
      "global-setup.ts waits for non-empty permissions in localStorage before saving storageState — prevents getMyPermissions() re-fetch + 401 redirect on expired tokens",
      "App.tsx auto-fetches permissions on startup when store is empty (fixes ProfilePage showing 0 permissions for pre-RBAC sessions)",
      "DashboardPage welcome banner — conditional dark/light gradient using useThemeStore (isDark)",
      "Fixed dark map tiles — CSS filter invert+hue-rotate on .dark .leaflet-tile-pane",
      "AccessManagementPage permission matrix — proportional columns via table-fixed + colgroup (22% / 44% / 34% split)",
      "SettingsPage version corrected to 2.10.0",
    ],
  },
  {
    version: "2.10.0",
    date: "17 May 2026",
    commits: ["e3afc85", "851fc2c"],
    items: [
      "Dark mode overhaul — deep blue-black system (#0a1523 family), matches auth panel aesthetic",
      "Light mode — subtle blue-white tint instead of clinical pure white",
      "Sidebar: transit-line active indicator (3px left bar with spring animation via CSS ::before)",
      "Sidebar: nav group labels with JetBrains Mono + horizontal rule separator",
      "Sidebar: distinct collapsed vs expanded active states",
      "Table rows: left accent reveal on hover (2px primary bar via CSS ::after)",
      "Custom scrollbar — 6px, blue-tinted in dark mode",
      "Card titles use Bebas Neue font-display for visual hierarchy",
      "Header: stronger backdrop blur (backdrop-blur-xl)",
      "Chart cards: overflow-hidden for cleaner borders",
    ],
  },
  {
    version: "2.9.0",
    date: "17 May 2026",
    commits: ["c105a77", "b6025f3", "b7f3637", "9e87c25"],
    items: [
      "Frontend design overhaul — Sora (body), Bebas Neue (display), JetBrains Mono (data labels)",
      "Auth page left panel redesigned — dark navy gradient, animated SVG MRT N–S line diagram with 13 stations",
      "Station dots pulse animation + line draw-in on auth page load",
      "Dashboard welcome banner — dark architectural gradient, 'Operations Center' label, monospace details",
      "Stat cards — left accent color bar, Bebas Neue number at 40px, icon scales on hover",
      "Sidebar logo — gradient glow + Bebas Neue 'MRT JAKARTA' wordmark",
      "6 new E2E design tests — auth panel branding, mobile hidden check, stat card structure (93 total)",
      "Fixed mobile test selectors — heading role filter, clear auth state for login tests",
      "Fixed Vercel monorepo deployment — root vercel.json with buildCommand + outputDirectory",
    ],
  },
  {
    version: "2.8.0",
    date: "17 May 2026",
    commits: ["19ac23a", "87a082e"],
    items: [
      "Mobile E2E tests — 15 Playwright tests on Pixel 7 viewport (412×915)",
      "Mobile viewport overflow checks across all pages",
      "Mobile sidebar toggle, tap-based navigation",
      "Mobile auth — login form full-width, submit via tap",
      "Mobile map — Leaflet renders full-width on small screen",
      "Live deployment links added to README (Vercel, Fly.io, GitHub Pages)",
      "Vercel production redeployed with all May 2026 changes",
    ],
  },
  {
    version: "2.7.0",
    date: "14 May 2026",
    commits: [
      "16aa9d8",
      "13949a0",
      "fc1c219",
      "55cd598",
      "fc6a2e3",
      "0b7604d",
      "393c4e8",
    ],
    items: [
      "Spatie-style 5-table RBAC — roles, permissions, model_has_roles, model_has_permissions, role_has_permissions",
      "permissionService.getPermissionsForUser() merges role + direct permissions (Set dedup)",
      "Profile page shows user's assigned permissions as badges",
      "Playwright screenshots captured for every test (visible on GitHub Pages report)",
      "GitHub Pages deployment for Playwright E2E report — QA accessible",
      "Swagger API v2.6.0 — tagged endpoints, Permissions routes documented",
      "Changelog shows commit hashes with links to GitHub per release",
      "README database schema updated to 5-table RBAC diagram",
    ],
  },
  {
    version: "2.6.0",
    date: "13–14 May 2026",
    commits: ["085c0cd", "1703307", "bfc4ecd", "3e6c746", "61ba943"],
    items: [
      "Migrated deployment — Fly.io (backend) + Supabase (PostgreSQL) + Vercel (frontend)",
      "Feedback system — star rating, category, message stored in DB",
      "Map location picker — Leaflet click-to-set lat/lng on station form",
      "Native time picker on schedule create/edit",
      "Mobile layout fixes across pages",
      "CI/CD fixed — root prisma schema for E2E migrations, browser install order",
      "Docker build fix — correct prisma migrations copied to dist/",
    ],
  },
  {
    version: "2.5.0",
    date: "15 April 2026",
    commits: ["6c963ae", "7550903", "6c50566", "ff1179b"],
    items: [
      "Google OAuth — login and register with Google account",
      "Google Sign-In button on login and register pages with divider",
      "Backend Google token verification with google-auth-library",
      "Auto-register new users from Google OAuth",
      "GoogleOAuthProvider integrated in app root",
    ],
  },
  {
    version: "2.4.0",
    date: "15 April 2026",
    commits: ["c415e23", "cb2f762", "d25bc51", "8c9ce5c", "559a227"],
    items: [
      "User Access Management page — role-permission matrix (admin-only)",
      "RBAC permission system — usePermission() hook, no hardcoded config",
      "Backend admin middleware on station and schedule CUD routes",
      "Confirm password field on register page",
      "Fix login page refresh on wrong credentials",
    ],
  },
  {
    version: "2.3.0",
    date: "15 April 2026",
    commits: ["2e2dd12", "e5c0cfc", "3144662", "916713d"],
    items: [
      "E2E automation testing — 87 Playwright tests across 18 spec files",
      "UX tests — password toggle, tab order, empty states, breadcrumbs",
      "Show/hide password toggle on login and register pages",
      "Tab focus fix — password eye buttons skipped in tab order",
      "Development rate limit increased (1000 req/15min)",
      "Database reset scripts (db:fresh, db:fresh:seed)",
    ],
  },
  {
    version: "2.2.0",
    date: "15 April 2026",
    commits: ["23910e8"],
    items: [
      "Route Planner — find schedules between stations",
      "Station Comparison — side-by-side station compare",
      "Dashboard welcome banner with time-based greeting",
      "Data refresh button in header",
      "Table column visibility toggle",
      "Copy to clipboard (station code, coordinates)",
      "Activity log CSV export",
      "DiceBear avatar images",
      "System status API endpoint",
      "Grouped sidebar navigation",
    ],
  },
  {
    version: "2.1.0",
    date: "15 April 2026",
    commits: [],
    items: [
      "Dashboard analytics with pie charts",
      "Notification center with real-time bell icon",
      "Keyboard shortcuts help modal (?)",
      "Changelog page",
      "Profile page two-column layout with preferences",
      "CSV import for bulk station creation",
      "Schedule timeline view",
      "Settings page",
      "Station detail page with schedules and map",
      "Schedule conflict detection",
      "Onboarding tour for new users",
    ],
  },
  {
    version: "2.0.0",
    date: "April 2026",
    commits: [],
    items: [
      "Real-time notifications via Server-Sent Events (SSE)",
      "Internationalization (English/Indonesian)",
      "PWA support — installable, offline map tiles",
      "PDF dashboard report export",
      "Bulk select and delete for stations",
      "Breadcrumb navigation",
      "Map search filter",
      "Swagger API documentation update",
      "E2E testing with Playwright",
    ],
  },
  {
    version: "1.5.0",
    date: "April 2026",
    commits: [],
    items: [
      "Interactive station map with Leaflet",
      "Role-based UI (Admin vs Operator)",
      "Activity/audit log tracking",
      "User management page (Admin CRUD)",
      "Command search (Cmd+K)",
      "Change password feature",
      "Rate limiting on API",
    ],
  },
  {
    version: "1.0.0",
    date: "April 2026",
    commits: [],
    items: [
      "TanStack Query for server state management",
      "Shadcn UI component library with 19+ components",
      "Sortable tables with asc/desc toggle",
      "Debounced search with URL-synced filters",
      "Empty states with contextual messages",
      "Error boundary and 404 page",
      "Lazy loading with code splitting",
      "GitHub Actions CI/CD pipeline",
      "Vitest + React Testing Library (frontend tests)",
      "Vitest + Supertest (backend API tests)",
    ],
  },
  {
    version: "0.1.0",
    date: "April 2026",
    commits: [],
    items: [
      "Initial release",
      "Authentication (JWT login/register)",
      "Station CRUD with search, filter, pagination",
      "Schedule CRUD with station relations",
      "Dashboard with stats and hourly chart",
      "Dark mode toggle",
      "CSV export (stations & schedules)",
      "Docker containerization",
      "Swagger API documentation",
    ],
  },
];

function getVersionAccentColor(version: string): string {
  const parts = version.split(".");
  const minor = parts[1] ?? "0";
  const patch = parts[2] ?? "0";
  if (minor === "0" && patch === "0") return "#22c55e";
  if (patch === "0") return "#3b82f6";
  return "rgba(148,163,184,0.3)";
}

export default function ChangelogPage() {
  usePageMeta({ title: "Changelog", path: "/changelog" });
  return (
    <div>
      <PageHeader title="CHANGELOG" subtitle="Release History · MRT Jakarta" />

      <style>
        {"@keyframes pulse-led { 0%,100%{opacity:1} 50%{opacity:0.6} }"}
      </style>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="flex flex-col gap-5"
      >
        {changelog.map((release, i) => {
          const accentColor = getVersionAccentColor(release.version);
          return (
            <motion.div
              key={release.version}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              className="ops-card"
            >
              {/* Version-typed accent line */}
              <div
                className="h-0.5"
                style={{
                  background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
                }}
              />

              {/* Card Header */}
              <div className="ops-card-header flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="changelog-version">v{release.version}</span>
                  <span className="changelog-date">{release.date}</span>
                  {i === 0 && (
                    <span className="ops-badge-latest">LATEST</span>
                  )}
                </div>
                {release.commits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {release.commits.map((hash) => (
                      <a
                        key={hash}
                        href={`https://github.com/didapatria/mrt-station-dashboard/commit/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="commit-chip"
                      >
                        <GitCommit size={10} />
                        {hash}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Change list */}
              <div className="px-6 pt-4 pb-5 flex flex-col gap-2">
                {release.items.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="changelog-dot" />
                    <span className="changelog-item-text">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
