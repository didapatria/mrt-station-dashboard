import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitCommit } from "lucide-react";

const changelog = [
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
    commits: ["16aa9d8", "13949a0", "fc1c219", "55cd598", "fc6a2e3", "0b7604d", "393c4e8"],
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

export default function ChangelogPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Changelog</h2>
        <p className="text-muted-foreground">Version history and release notes</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {changelog.map((release, i) => (
          <Card key={release.version} className="shadow-sm">
            <CardContent className="p-6">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
                  <Badge variant={i === 0 ? "default" : "outline"} className="text-sm px-3 py-1">
                    v{release.version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                  {i === 0 && <Badge variant="success" className="text-[10px]">Latest</Badge>}
                </div>
                {release.commits && release.commits.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.25rem" }}>
                    {release.commits.map((hash) => (
                      <a
                        key={hash}
                        href={`https://github.com/didapatria/mrt-station-dashboard/commit/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <GitCommit className="h-3 w-3" />
                        {hash}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="mb-4" />
              <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-primary">
                {release.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
