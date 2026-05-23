import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PageHeader } from "@/components/PageHeader";

type ChangeCategory = "feat" | "fix" | "ci" | "refactor" | "docs" | "chore";

interface ChangeEntry {
  category: ChangeCategory;
  text: string;
}

interface StructuredRelease {
  version: string;
  date: string;
  commits: string[];
  entries: ChangeEntry[];
}

interface LegacyRelease {
  version: string;
  date: string;
  commits: string[];
  items: string[];
}

type Release = StructuredRelease | LegacyRelease;

function isStructured(r: Release): r is StructuredRelease {
  return "entries" in r;
}

const CATEGORY_META: Record<ChangeCategory, { label: string; color: string }> =
  {
    feat: { label: "feat", color: "#3b82f6" },
    fix: { label: "fix", color: "#f97316" },
    ci: { label: "ci", color: "#a855f7" },
    refactor: { label: "refactor", color: "#eab308" },
    docs: { label: "docs", color: "#22c55e" },
    chore: { label: "chore", color: "#6b7280" },
  };

const CATEGORY_ORDER: ChangeCategory[] = [
  "feat",
  "fix",
  "ci",
  "refactor",
  "docs",
  "chore",
];

const changelog: Release[] = [
  {
    version: "2.17.0",
    date: "23 May 2026",
    commits: [
      "6496840",
      "7752d51",
      "bd115c4",
      "bf0f407",
      "e009ecb",
      "549bfdc",
      "b88683c",
      "ab5ebdb",
      "fc61578",
      "6c89f9f",
      "34e04ec",
      "0074dd2",
      "3b05246",
    ],
    entries: [
      {
        category: "feat",
        text: "CommandCenterPage — full-screen /command page with 3-panel layout: system status, station LED grid, activity feed",
      },
      {
        category: "feat",
        text: "StationTile — LED dot with glow, station code badge, status label; staggered reveal animation",
      },
      {
        category: "feat",
        text: "SystemStatusPanel — ACTIVE/DEGRADED/INCIDENT pulsing LED, stations operational count, maintenance + cancelled stats",
      },
      {
        category: "feat",
        text: "ActivityFeed — rolling display of last 30 SSE activity events with relative timestamps",
      },
      {
        category: "feat",
        text: "Activity feed Zustand store — shared rolling buffer populated from useRealtimeNotifications (no extra SSE connection)",
      },
      {
        category: "feat",
        text: "Live clock in Command Center header — second-precision HH:MM:SS display",
      },
      {
        category: "feat",
        text: "Command Center nav item — Monitor icon in Operations group, i18n keys for EN + ID",
      },
      {
        category: "ci",
        text: "command-center.spec.ts — 5 E2E tests: page render, station grid, system status, activity feed, live indicator",
      },
    ],
  },
  {
    version: "2.16.0",
    date: "23 May 2026",
    commits: [
      "c97db8f",
      "df7837b",
      "97c79b9",
      "b56461e",
      "e9c0150",
      "e71f237",
      "38f96ef",
      "feb66ea",
      "0fc7c8f",
      "d85619f",
    ],
    entries: [
      {
        category: "feat",
        text: "Live Operations Center — typed SSE events (station.updated, schedule.updated, ping heartbeat), token auth on /api/events",
      },
      {
        category: "feat",
        text: "/api/public/system-status endpoint — ACTIVE/DEGRADED/INCIDENT derived from live DB ratios, Cache-Control 60s",
      },
      {
        category: "feat",
        text: "OperationsStatusBanner — animated LED dot, contextual status label and counts, rendered above Dashboard stats",
      },
      {
        category: "feat",
        text: "Dashboard live mode — SSE status dot (green/amber/grey) + last-activity timestamp in welcome banner",
      },
      {
        category: "feat",
        text: "useRealtimeNotifications — token-authenticated EventSource, exponential backoff reconnect (1s→30s), connection state",
      },
      {
        category: "feat",
        text: "useSystemStatus hook — polls /public/system-status every 60s, SSE-triggered invalidation on data changes",
      },
      {
        category: "feat",
        text: "Dev-only simulator — random station/schedule mutations every 15–45s with simulated:true flag to suppress UI noise",
      },
      {
        category: "fix",
        text: "NotificationCenter — token-authenticated SSE URL, skips simulated events from dev simulator",
      },
      {
        category: "ci",
        text: "realtime-dashboard.spec.ts — 4 E2E tests: SSE indicator, notification bell, ops status banner, welcome banner label",
      },
      {
        category: "docs",
        text: "Swagger v2.16.0 — Realtime tag, SystemStatus schema, /public/system-status documented",
      },
      {
        category: "docs",
        text: "README v2.16.0 — version badge, release summary table, What's New section",
      },
      {
        category: "chore",
        text: "Version labels bumped to v2.16.0 across AuthLayout, DashboardLayout, testing rules",
      },
    ],
  },
  {
    version: "2.15.0",
    date: "22 May 2026",
    commits: [
      "c047ff9",
      "6177370",
      "bde4995",
      "50d42ac",
      "6141961",
      "7c05bc5",
      "e5850d1",
      "3d13c91",
      "c17e842",
      "931eebf",
    ],
    entries: [
      {
        category: "feat",
        text: "Public /api/public/stations endpoint — no auth, Cache-Control 5min, full Swagger documentation",
      },
      {
        category: "feat",
        text: "AuthLayout live station data — usePublicStations hook replaces hardcoded ROUTE_STATIONS array",
      },
      {
        category: "feat",
        text: "publicApi axios instance — dedicated client without auth interceptor for public routes",
      },
      {
        category: "fix",
        text: "Axios 401 redirect loop — interceptor skips redirect when already on /login or /register",
      },
      {
        category: "fix",
        text: "Playwright global-setup race — reducedMotion context eliminates Framer Motion timing issues in CI",
      },
      {
        category: "fix",
        text: "MRT favicon and icon colors — correct inline SVG for all display contexts",
      },
      {
        category: "fix",
        text: "Station name correction — 'Blok A Visa' renamed to 'Blok A'",
      },
      {
        category: "ci",
        text: "Fly.io auth verify — flyctl auth whoami step before deploy for early token detection",
      },
      {
        category: "ci",
        text: "Vite compilation buffer — sleep 8 after health check ensures ESM bundle ready in CI",
      },
      {
        category: "ci",
        text: "test-results artifact — Playwright traces and videos uploaded with 7-day retention",
      },
      {
        category: "ci",
        text: "E2E job summary — test results and artifact links written to $GITHUB_STEP_SUMMARY",
      },
      {
        category: "docs",
        text: "Swagger PublicStation schema + Public tag — v2.15.0 with full JSDoc annotations on new endpoint",
      },
      {
        category: "docs",
        text: "CLAUDE.md + README — Public API pattern, axios interceptor rules, CI troubleshooting, E2E auth stability",
      },
      {
        category: "chore",
        text: "Root package.json — playwright:ci, docker:up, docker:down scripts + version bump to v2.15.0",
      },
    ],
  },
  {
    version: "2.14.0",
    date: "19 May 2026",
    commits: [
      "324355d",
      "76f6886",
      "ab7b863",
      "eb56a19",
      "675c71f",
      "0e11847",
      "64da6ab",
      "7ff79df",
      "8d12bc4",
      "21b826e",
      "c08ba1c",
      "a8c8b47",
      "59a821d",
      "517d9e5",
      "38aae7f",
      "ba3324f",
      "83dc9b3",
      "a8520d4",
      "e7ec0a9",
      "2a37879",
      "a0993f6",
      "798fdf2",
      "578636d",
      "7c14ae3",
      "1a99743",
      "2ad2088",
      "89b4ed6",
      "aa9dcd3",
      "f8127b5",
      "404c127",
      "fcc11af",
      "0539b1a",
    ],
    entries: [
      {
        category: "feat",
        text: "Avatar upload — ProfilePage file picker with 2MB validation, preview, and PATCH /auth/avatar backend endpoint",
      },
      {
        category: "feat",
        text: "AnimatePresence page transitions — exit animation on route change with motion variants library",
      },
      {
        category: "feat",
        text: "Stagger animation on changelog cards — sequential fade-in with framer-motion staggerChildren",
      },
      {
        category: "feat",
        text: "Design system motion variants + design tokens — reusable animation presets across all pages",
      },
      {
        category: "feat",
        text: "usePageMeta hook — dynamic <title>, Open Graph, and Twitter card per route",
      },
      {
        category: "feat",
        text: "SEO meta tags wired to all 12 pages — canonical URL, OG image, description per page",
      },
      {
        category: "feat",
        text: "Open Graph + Twitter card in index.html — og:title, og:image, twitter:card for social sharing",
      },
      {
        category: "feat",
        text: "Skeleton component system — SkeletonStatCard, SkeletonTable, SkeletonCard, SkeletonProfile, SkeletonText, SkeletonAvatar",
      },
      {
        category: "feat",
        text: "Skeleton shimmer keyframe + prefers-reduced-motion override in index.css",
      },
      {
        category: "feat",
        text: "Design system utilities + new Shadcn components (Badge, Separator, Tooltip, ToggleGroup)",
      },
      {
        category: "feat",
        text: "Auth left panel light/dark mode — theme-aware color palette for both modes",
      },
      {
        category: "feat",
        text: "Permissions empty state onboarding guidance — contextual message when no permissions assigned",
      },
      {
        category: "fix",
        text: "9 UI/UX fixes — RoutePlanner station order, ActivityLog timeline, DashboardPage stat card layout",
      },
      {
        category: "fix",
        text: "SettingsPage mobile 1-column layout + UsersPage avatar image display",
      },
      {
        category: "fix",
        text: "Backend: sync model_has_roles on role change and user creation (Spatie RBAC consistency)",
      },
      {
        category: "refactor",
        text: "Tailwind inline style refactor — replaced static inline styles with utility classes across all 14 pages, AuthLayout, DashboardLayout, and Skeleton component",
      },
      {
        category: "refactor",
        text: "E2E station tests refactored — clearer selectors, precise assertions, split into focused per-action specs (112 tests total)",
      },
      {
        category: "ci",
        text: "Cancel in-progress runs on new push to same branch (GitHub Actions concurrency)",
      },
    ],
  },
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

function CategoryBadge({ category }: { category: ChangeCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0 leading-tight"
      style={{
        color: meta.color,
        borderColor: `${meta.color}50`,
        background: `${meta.color}18`,
      }}
    >
      {meta.label}
    </span>
  );
}

function ReleaseSummary({ entries }: { entries: ChangeEntry[] }) {
  const counts = entries.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<ChangeCategory, number>>,
  );

  const ordered = CATEGORY_ORDER.filter((cat) => counts[cat]);

  return (
    <div className="flex items-center gap-3 px-6 pt-3 pb-3 flex-wrap">
      {ordered.map((cat) => (
        <span key={cat} className="flex items-center gap-1.5">
          <CategoryBadge category={cat} />
          <span className="text-xs text-muted-foreground">{counts[cat]}</span>
        </span>
      ))}
    </div>
  );
}

export default function ChangelogPage() {
  usePageMeta({ title: "Changelog", path: "/changelog" });

  return (
    <div>
      <PageHeader title="CHANGELOG" subtitle="Release History · MRT Jakarta" />

      <style>
        {"@keyframes pulse-led { 0%,100%{opacity:1} 50%{opacity:0.6} }"}
      </style>

      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-3 top-6 bottom-6 w-px bg-linear-to-b from-primary/30 via-border/50 to-transparent pointer-events-none" />

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
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3 },
                  },
                }}
                className="relative pl-10"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-1 top-4.5 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center"
                  style={{
                    borderColor: `${accentColor}80`,
                    boxShadow:
                      i === 0 ? `0 0 10px ${accentColor}60` : undefined,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: accentColor }}
                  />
                </div>

                <div className="ops-card">
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
                      <span className="changelog-version">
                        v{release.version}
                      </span>
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

                  {/* Category summary (structured releases only) */}
                  {isStructured(release) && (
                    <ReleaseSummary entries={release.entries} />
                  )}

                  {/* Change list */}
                  <div className="px-6 pt-2 pb-5 flex flex-col gap-2">
                    {isStructured(release)
                      ? release.entries.map((entry) => (
                          <div
                            key={entry.text}
                            className="flex items-start gap-2.5"
                          >
                            <CategoryBadge category={entry.category} />
                            <span className="changelog-item-text">
                              {entry.text}
                            </span>
                          </div>
                        ))
                      : release.items.map((item) => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="changelog-dot" />
                            <span className="changelog-item-text">{item}</span>
                          </div>
                        ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
