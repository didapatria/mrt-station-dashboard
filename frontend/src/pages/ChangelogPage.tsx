import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";

const changelog = [
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

const hashChipStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  background: "rgba(29,111,232,0.1)",
  border: "1px solid rgba(29,111,232,0.2)",
  borderRadius: 3,
  padding: "2px 6px",
  color: "#60a5fa",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  transition: "background 0.15s",
};

function getVersionAccentColor(version: string): string {
  const parts = version.split(".");
  const minor = parts[1] ?? "0";
  const patch = parts[2] ?? "0";
  if (minor === "0" && patch === "0") return "#22c55e"; // major x.0.0
  if (patch === "0") return "#3b82f6"; // minor x.y.0
  return "rgba(148,163,184,0.3)"; // patch x.y.z
}

export default function ChangelogPage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36,
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: "var(--color-foreground)",
            margin: 0,
          }}
        >
          CHANGELOG
        </h2>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: "0.1em",
            color: "var(--color-muted-foreground)",
            marginTop: 4,
          }}
        >
          Release History · MRT Jakarta
        </p>
        {/* Horizontal fade line */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.3) 0%, transparent 70%)",
            marginTop: 14,
          }}
        />
      </div>

      <style>
        {"@keyframes pulse-led { 0%,100%{opacity:1} 50%{opacity:0.6} }"}
      </style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {changelog.map((release, i) => {
          const accentColor = getVersionAccentColor(release.version);
          return (
            <div
              key={release.version}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Version-typed accent line */}
              <div
                style={{
                  height: 2,
                  background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
                }}
              />

              {/* Card Header */}
              <div
                style={{
                  padding: "18px 24px 14px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      letterSpacing: "0.05em",
                      color: "var(--color-foreground)",
                    }}
                  >
                    v{release.version}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "var(--color-muted-foreground)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {release.date}
                  </span>
                  {i === 0 && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: 3,
                        padding: "2px 7px",
                        color: "#22c55e",
                        fontWeight: 600,
                        animation: "pulse-led 2s ease-in-out infinite",
                        display: "inline-block",
                      }}
                    >
                      LATEST
                    </span>
                  )}
                </div>
                {release.commits.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {release.commits.map((hash) => (
                      <a
                        key={hash}
                        href={`https://github.com/didapatria/mrt-station-dashboard/commit/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={hashChipStyle}
                      >
                        <GitCommit size={10} />
                        {hash}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Change list */}
              <div
                style={{
                  padding: "16px 24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {release.items.map((item) => (
                  <div
                    key={item}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        opacity: 0.6,
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 13,
                        color: "var(--color-foreground)",
                        lineHeight: 1.55,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
