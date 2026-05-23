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

type Release = StructuredRelease;

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
    version: "2.18.0",
    date: "23 May 2026",
    commits: [
      "96bef49",
      "0747b7e",
      "00cf5da",
      "fa60283",
      "2ed21a0",
      "a557aec",
      "cf7c3d0",
      "58f3560",
      "241d800",
      "38de3bd",
      "91167ae",
      "0918cd3",
      "000e90d",
      "ba53a52",
      "b4ef398",
      "5c54af9",
      "dd1cc77",
      "b17baa0",
      "f7061dc",
      "29b8412",
      "84a6dde",
      "7dc2f64",
      "569aace",
      "2fae5db",
      "0576689",
      "b28480d",
    ],
    entries: [
      {
        category: "feat",
        text: "Incident Management System — full CRUD with severity (CRITICAL/HIGH/MEDIUM/LOW) and status (OPEN/MONITORING/RESOLVED) lifecycle",
      },
      {
        category: "feat",
        text: "IncidentsPage — filterable table with severity/status badges, stagger animation, create/edit/resolve/delete dialogs",
      },
      {
        category: "feat",
        text: "SSE events — incident.created, incident.updated, incident.resolved broadcast on mutations",
      },
      {
        category: "feat",
        text: "Dashboard stat card — Open Incidents with pulsing red LED dot when count > 0",
      },
      {
        category: "feat",
        text: "OperationsStatusBanner — CRITICAL incident overrides status to INCIDENT; open incident count shown in metadata",
      },
      {
        category: "feat",
        text: "Incident permissions — incidents.view/create/edit/resolve/delete seeded for ADMIN and OPERATOR roles",
      },
      {
        category: "ci",
        text: "incidents.spec.ts — 6 E2E tests: page render, create, edit, resolve, delete, severity filter",
      },
      {
        category: "chore",
        text: "Version bump to v2.18.0 — swagger, package.json frontend + backend",
      },
    ],
  },
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
    entries: [
      {
        category: "feat",
        text: "Google OAuth profile photo — avatarUrl stored on OAuth login, displayed in header avatar + ProfilePage",
      },
      {
        category: "fix",
        text: "Theme toggle auth fix — right panel uses CSS vars (var(--color-background/foreground)), responds to dark/light toggle",
      },
      {
        category: "fix",
        text: "ThemeToggle icon fix — inherits var(--color-foreground) instead of hardcoded white, visible in both modes",
      },
      {
        category: "feat",
        text: "Auth pages theme-aware — login/register text, inputs, borders use CSS variables; left panel stays intentionally dark",
      },
      {
        category: "fix",
        text: "SettingsPage layout fix — 2-column grid (was auto-fit unbounded), card accent via inset boxShadow (borderImage disabled borderRadius)",
      },
      {
        category: "ci",
        text: "E2E theme tests — 6 new Playwright tests: ThemeToggle visibility, dark/light toggle, localStorage persistence, navigation persistence (112 total)",
      },
      {
        category: "chore",
        text: "Version bump to v2.13.0 across swagger, sidebar footer, auth panel, settings",
      },
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
    entries: [
      {
        category: "feat",
        text: "APEX SIGNAL design elevation — top accent gradient lines on all cards, horizontal fade lines on page headers, animated pulse on ACTIVE status LEDs, sidebar dot-grid texture",
      },
      {
        category: "feat",
        text: "Operations Terminal design system across all 13 dashboard pages — Bebas Neue section headers, JetBrains Mono data labels, LED status dots with glow, card containers",
      },
      {
        category: "feat",
        text: "Station Register aesthetic — code plate badges with glow, order circle badges (terminal stations 24px+glow), AnimatePresence floating bulk action bar",
      },
      {
        category: "feat",
        text: "Control Terminal auth redesign — dark left panel with MRT route diagram, live clock with blinking colons, scanline overlay, corner bracket decorations",
      },
      {
        category: "feat",
        text: "MERIDIAN dashboard redesign — dot-matrix + diagonal stripe welcome banner, pulsing stat accent bars, ghost icons, real-time Operations Center label",
      },
      {
        category: "feat",
        text: "DashboardLayout — sidebar dot-grid texture overlay, SYS ONLINE footer strip with version, gradient logo border, 0.25s snappy page transitions",
      },
      {
        category: "refactor",
        text: "ThemeToggle split — desktop from AuthLayout, mobile from LoginPage/RegisterPage header row (no duplicate)",
      },
      {
        category: "fix",
        text: "LanguageToggle desktop fix — invalid xs: breakpoint replaced with sm:",
      },
      {
        category: "fix",
        text: "Auth store sync init — synchronous localStorage read prevents login redirect flash",
      },
      {
        category: "feat",
        text: "/access route guard — non-admin redirects to /dashboard before render",
      },
      {
        category: "fix",
        text: "React Compiler warnings resolved — useWatch() replacing watch(), if/else for void ternary",
      },
      {
        category: "chore",
        text: "Prettier formatting applied across 54 frontend files",
      },
    ],
  },
  {
    version: "2.11.0",
    date: "17 May 2026",
    commits: ["09df222", "387cba4", "fc17cc7"],
    entries: [
      {
        category: "fix",
        text: "Fixed 10 Playwright test failures — ux-design auth tests (beforeEach clears localStorage), dashboard tests (page.goto replaces navigateTo on blank page)",
      },
      {
        category: "fix",
        text: "global-setup.ts waits for non-empty permissions in localStorage before saving storageState — prevents getMyPermissions() re-fetch + 401 redirect on expired tokens",
      },
      {
        category: "fix",
        text: "App.tsx auto-fetches permissions on startup when store is empty (fixes ProfilePage showing 0 permissions for pre-RBAC sessions)",
      },
      {
        category: "feat",
        text: "DashboardPage welcome banner — conditional dark/light gradient using useThemeStore (isDark)",
      },
      {
        category: "fix",
        text: "Fixed dark map tiles — CSS filter invert+hue-rotate on .dark .leaflet-tile-pane",
      },
      {
        category: "fix",
        text: "AccessManagementPage permission matrix — proportional columns via table-fixed + colgroup (22% / 44% / 34% split)",
      },
      {
        category: "fix",
        text: "SettingsPage version corrected to 2.10.0",
      },
    ],
  },
  {
    version: "2.10.0",
    date: "17 May 2026",
    commits: ["e3afc85", "851fc2c"],
    entries: [
      {
        category: "feat",
        text: "Dark mode overhaul — deep blue-black system (#0a1523 family), matches auth panel aesthetic",
      },
      {
        category: "feat",
        text: "Light mode — subtle blue-white tint instead of clinical pure white",
      },
      {
        category: "feat",
        text: "Sidebar: transit-line active indicator (3px left bar with spring animation via CSS ::before)",
      },
      {
        category: "feat",
        text: "Sidebar: nav group labels with JetBrains Mono + horizontal rule separator",
      },
      {
        category: "feat",
        text: "Sidebar: distinct collapsed vs expanded active states",
      },
      {
        category: "feat",
        text: "Table rows: left accent reveal on hover (2px primary bar via CSS ::after)",
      },
      {
        category: "feat",
        text: "Custom scrollbar — 6px, blue-tinted in dark mode",
      },
      {
        category: "feat",
        text: "Card titles use Bebas Neue font-display for visual hierarchy",
      },
      {
        category: "feat",
        text: "Header: stronger backdrop blur (backdrop-blur-xl)",
      },
      {
        category: "feat",
        text: "Chart cards: overflow-hidden for cleaner borders",
      },
    ],
  },
  {
    version: "2.9.0",
    date: "17 May 2026",
    commits: ["c105a77", "b6025f3", "b7f3637", "9e87c25"],
    entries: [
      {
        category: "feat",
        text: "Frontend design overhaul — Sora (body), Bebas Neue (display), JetBrains Mono (data labels)",
      },
      {
        category: "feat",
        text: "Auth page left panel redesigned — dark navy gradient, animated SVG MRT N–S line diagram with 13 stations",
      },
      {
        category: "feat",
        text: "Station dots pulse animation + line draw-in on auth page load",
      },
      {
        category: "feat",
        text: "Dashboard welcome banner — dark architectural gradient, 'Operations Center' label, monospace details",
      },
      {
        category: "feat",
        text: "Stat cards — left accent color bar, Bebas Neue number at 40px, icon scales on hover",
      },
      {
        category: "feat",
        text: "Sidebar logo — gradient glow + Bebas Neue 'MRT JAKARTA' wordmark",
      },
      {
        category: "ci",
        text: "6 new E2E design tests — auth panel branding, mobile hidden check, stat card structure (93 total)",
      },
      {
        category: "fix",
        text: "Fixed mobile test selectors — heading role filter, clear auth state for login tests",
      },
      {
        category: "fix",
        text: "Fixed Vercel monorepo deployment — root vercel.json with buildCommand + outputDirectory",
      },
    ],
  },
  {
    version: "2.8.0",
    date: "17 May 2026",
    commits: ["19ac23a", "87a082e"],
    entries: [
      {
        category: "ci",
        text: "Mobile E2E tests — 15 Playwright tests on Pixel 7 viewport (412×915)",
      },
      {
        category: "ci",
        text: "Mobile viewport overflow checks across all pages",
      },
      {
        category: "ci",
        text: "Mobile sidebar toggle, tap-based navigation",
      },
      {
        category: "ci",
        text: "Mobile auth — login form full-width, submit via tap",
      },
      {
        category: "ci",
        text: "Mobile map — Leaflet renders full-width on small screen",
      },
      {
        category: "docs",
        text: "Live deployment links added to README (Vercel, Fly.io, GitHub Pages)",
      },
      {
        category: "ci",
        text: "Vercel production redeployed with all May 2026 changes",
      },
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
    entries: [
      {
        category: "feat",
        text: "Spatie-style 5-table RBAC — roles, permissions, model_has_roles, model_has_permissions, role_has_permissions",
      },
      {
        category: "feat",
        text: "permissionService.getPermissionsForUser() merges role + direct permissions (Set dedup)",
      },
      {
        category: "feat",
        text: "Profile page shows user's assigned permissions as badges",
      },
      {
        category: "ci",
        text: "Playwright screenshots captured for every test (visible on GitHub Pages report)",
      },
      {
        category: "ci",
        text: "GitHub Pages deployment for Playwright E2E report — QA accessible",
      },
      {
        category: "docs",
        text: "Swagger API v2.6.0 — tagged endpoints, Permissions routes documented",
      },
      {
        category: "feat",
        text: "Changelog shows commit hashes with links to GitHub per release",
      },
      {
        category: "docs",
        text: "README database schema updated to 5-table RBAC diagram",
      },
    ],
  },
  {
    version: "2.6.0",
    date: "13–14 May 2026",
    commits: ["085c0cd", "1703307", "bfc4ecd", "3e6c746", "61ba943"],
    entries: [
      {
        category: "ci",
        text: "Migrated deployment — Fly.io (backend) + Supabase (PostgreSQL) + Vercel (frontend)",
      },
      {
        category: "feat",
        text: "Feedback system — star rating, category, message stored in DB",
      },
      {
        category: "feat",
        text: "Map location picker — Leaflet click-to-set lat/lng on station form",
      },
      {
        category: "feat",
        text: "Native time picker on schedule create/edit",
      },
      {
        category: "fix",
        text: "Mobile layout fixes across pages",
      },
      {
        category: "ci",
        text: "CI/CD fixed — root prisma schema for E2E migrations, browser install order",
      },
      {
        category: "fix",
        text: "Docker build fix — correct prisma migrations copied to dist/",
      },
    ],
  },
  {
    version: "2.5.0",
    date: "15 April 2026",
    commits: ["6c963ae", "7550903", "6c50566", "ff1179b"],
    entries: [
      {
        category: "feat",
        text: "Google OAuth — login and register with Google account",
      },
      {
        category: "feat",
        text: "Google Sign-In button on login and register pages with divider",
      },
      {
        category: "feat",
        text: "Backend Google token verification with google-auth-library",
      },
      {
        category: "feat",
        text: "Auto-register new users from Google OAuth",
      },
      {
        category: "feat",
        text: "GoogleOAuthProvider integrated in app root",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "15 April 2026",
    commits: ["c415e23", "cb2f762", "d25bc51", "8c9ce5c", "559a227"],
    entries: [
      {
        category: "feat",
        text: "User Access Management page — role-permission matrix (admin-only)",
      },
      {
        category: "feat",
        text: "RBAC permission system — usePermission() hook, no hardcoded config",
      },
      {
        category: "feat",
        text: "Backend admin middleware on station and schedule CUD routes",
      },
      {
        category: "feat",
        text: "Confirm password field on register page",
      },
      {
        category: "fix",
        text: "Fix login page refresh on wrong credentials",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "15 April 2026",
    commits: ["2e2dd12", "e5c0cfc", "3144662", "916713d"],
    entries: [
      {
        category: "ci",
        text: "E2E automation testing — 87 Playwright tests across 18 spec files",
      },
      {
        category: "ci",
        text: "UX tests — password toggle, tab order, empty states, breadcrumbs",
      },
      {
        category: "feat",
        text: "Show/hide password toggle on login and register pages",
      },
      {
        category: "fix",
        text: "Tab focus fix — password eye buttons skipped in tab order",
      },
      {
        category: "chore",
        text: "Development rate limit increased (1000 req/15min)",
      },
      {
        category: "chore",
        text: "Database reset scripts (db:fresh, db:fresh:seed)",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "15 April 2026",
    commits: ["23910e8"],
    entries: [
      {
        category: "feat",
        text: "Route Planner — find schedules between stations",
      },
      {
        category: "feat",
        text: "Station Comparison — side-by-side station compare",
      },
      {
        category: "feat",
        text: "Dashboard welcome banner with time-based greeting",
      },
      {
        category: "feat",
        text: "Data refresh button in header",
      },
      {
        category: "feat",
        text: "Table column visibility toggle",
      },
      {
        category: "feat",
        text: "Copy to clipboard (station code, coordinates)",
      },
      {
        category: "feat",
        text: "Activity log CSV export",
      },
      {
        category: "feat",
        text: "DiceBear avatar images",
      },
      {
        category: "feat",
        text: "System status API endpoint",
      },
      {
        category: "feat",
        text: "Grouped sidebar navigation",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "15 April 2026",
    commits: [
      "5e3d25c",
      "0f81fdc",
      "6cdfb26",
      "1310e44",
      "215ebfe",
      "32a5f06",
      "19d3f80",
      "151e70e",
      "f6fa6e2",
      "ff479cd",
      "2d108f6",
      "87e44f5",
      "a8ce713",
      "4c3a087",
      "942e9d6",
      "40a0d9c",
      "0f1b0ec",
    ],
    entries: [
      {
        category: "feat",
        text: "Dashboard analytics with pie charts",
      },
      {
        category: "feat",
        text: "Notification center with real-time bell icon",
      },
      {
        category: "feat",
        text: "Keyboard shortcuts help modal (?)",
      },
      {
        category: "feat",
        text: "Changelog page",
      },
      {
        category: "feat",
        text: "Profile page two-column layout with preferences",
      },
      {
        category: "feat",
        text: "CSV import for bulk station creation",
      },
      {
        category: "feat",
        text: "Schedule timeline view",
      },
      {
        category: "feat",
        text: "Settings page",
      },
      {
        category: "feat",
        text: "Station detail page with schedules and map",
      },
      {
        category: "feat",
        text: "Schedule conflict detection",
      },
      {
        category: "feat",
        text: "Onboarding tour for new users",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "April 2026",
    commits: [
      "80a463b",
      "8038e4d",
      "83e2e4b",
      "e78fb94",
      "cbd789b",
      "e923ecc",
      "f7293a2",
      "9f392b4",
      "5223081",
      "affc19f",
      "bb98ebf",
    ],
    entries: [
      {
        category: "feat",
        text: "Real-time notifications via Server-Sent Events (SSE)",
      },
      {
        category: "feat",
        text: "Internationalization (English/Indonesian)",
      },
      {
        category: "feat",
        text: "PWA support — installable, offline map tiles",
      },
      {
        category: "feat",
        text: "PDF dashboard report export",
      },
      {
        category: "feat",
        text: "Bulk select and delete for stations",
      },
      {
        category: "feat",
        text: "Breadcrumb navigation",
      },
      {
        category: "feat",
        text: "Map search filter",
      },
      {
        category: "docs",
        text: "Swagger API documentation update",
      },
      {
        category: "ci",
        text: "E2E testing with Playwright",
      },
    ],
  },
  {
    version: "1.5.0",
    date: "April 2026",
    commits: [
      "4a4c1e1",
      "433c5ee",
      "7630cd2",
      "9b99ac6",
      "7d1eefb",
      "799db08",
      "daf938c",
    ],
    entries: [
      {
        category: "feat",
        text: "Interactive station map with Leaflet",
      },
      {
        category: "feat",
        text: "Role-based UI (Admin vs Operator)",
      },
      {
        category: "feat",
        text: "Activity/audit log tracking",
      },
      {
        category: "feat",
        text: "User management page (Admin CRUD)",
      },
      {
        category: "feat",
        text: "Command search (Cmd+K)",
      },
      {
        category: "feat",
        text: "Change password feature",
      },
      {
        category: "feat",
        text: "Rate limiting on API",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "April 2026",
    commits: [
      "a37a860",
      "4976df5",
      "d14bf92",
      "3bc2098",
      "13f8c0a",
      "662c8a6",
      "3116152",
      "65aa5da",
      "5010b2a",
      "31e2a81",
      "f932000",
      "60cfc6d",
      "d1d1c2f",
      "c94f795",
    ],
    entries: [
      {
        category: "feat",
        text: "TanStack Query for server state management",
      },
      {
        category: "feat",
        text: "Shadcn UI component library with 19+ components",
      },
      {
        category: "feat",
        text: "Sortable tables with asc/desc toggle",
      },
      {
        category: "feat",
        text: "Debounced search with URL-synced filters",
      },
      {
        category: "feat",
        text: "Empty states with contextual messages",
      },
      {
        category: "feat",
        text: "Error boundary and 404 page",
      },
      {
        category: "feat",
        text: "Lazy loading with code splitting",
      },
      {
        category: "ci",
        text: "GitHub Actions CI/CD pipeline",
      },
      {
        category: "ci",
        text: "Vitest + React Testing Library (frontend tests)",
      },
      {
        category: "ci",
        text: "Vitest + Supertest (backend API tests)",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "April 2026",
    commits: [
      "174e44c",
      "34f959b",
      "140fa32",
      "ddd5cbb",
      "bfe8ccd",
      "b02a132",
      "c3e865d",
      "7fff2fd",
      "52b961b",
      "0c6646c",
      "cacd84d",
      "abaf21c",
      "554156d",
      "6ce37bd",
      "911a5dc",
      "54db5bd",
      "4b6a96e",
      "082609f",
      "cf4f10c",
      "3a61a15",
      "fd35698",
      "15e5896",
    ],
    entries: [
      {
        category: "feat",
        text: "Initial release",
      },
      {
        category: "feat",
        text: "Authentication (JWT login/register)",
      },
      {
        category: "feat",
        text: "Station CRUD with search, filter, pagination",
      },
      {
        category: "feat",
        text: "Schedule CRUD with station relations",
      },
      {
        category: "feat",
        text: "Dashboard with stats and hourly chart",
      },
      {
        category: "feat",
        text: "Dark mode toggle",
      },
      {
        category: "feat",
        text: "CSV export (stations & schedules)",
      },
      {
        category: "ci",
        text: "Docker containerization",
      },
      {
        category: "docs",
        text: "Swagger API documentation",
      },
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

                  {/* Category summary */}
                  <ReleaseSummary entries={release.entries} />

                  {/* Change list */}
                  <div className="px-6 pt-2 pb-5 flex flex-col gap-2">
                    {release.entries.map((entry) => (
                      <div
                        key={entry.text}
                        className="flex items-start gap-2.5"
                      >
                        <CategoryBadge category={entry.category} />
                        <span className="changelog-item-text">
                          {entry.text}
                        </span>
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
