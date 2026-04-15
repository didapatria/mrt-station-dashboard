import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const changelog = [
  {
    version: "2.4.0",
    date: "April 2026",
    items: [
      "User Access Management page — role-permission matrix (admin-only)",
      "RBAC permission system — permissions config, usePermission() hook",
      "Backend admin middleware on station and schedule CUD routes",
      "Confirm password field on register page",
      "Fix login page refresh on wrong credentials",
      "Register page eslint fix and typed error handling",
    ],
  },
  {
    version: "2.3.0",
    date: "April 2026",
    items: [
      "E2E automation testing — 46 Playwright tests across 15 spec files",
      "UX tests — password toggle, tab order, empty states, breadcrumbs",
      "Show/hide password toggle on login and register pages",
      "Tab focus fix — password eye buttons skipped in tab order",
      "Sidebar tour tooltip repositioned to prevent clipping",
      "React strict mode fixes (useMemo, pure render)",
      "Development rate limit increased (1000 req/15min)",
      "Database reset scripts (db:fresh, db:fresh:seed)",
      "Swagger API docs updated with new schemas",
    ],
  },
  {
    version: "2.2.0",
    date: "April 2026",
    items: [
      "Route Planner — find schedules between stations",
      "Station Comparison — side-by-side station compare",
      "Dashboard welcome banner with time-based greeting",
      "Data refresh button in header",
      "Table column visibility toggle",
      "Copy to clipboard (station code, coordinates)",
      "Print-friendly CSS for reports",
      "Activity log CSV export",
      "DiceBear avatar images",
      "System status API endpoint",
      "Grouped sidebar navigation",
    ],
  },
  {
    version: "2.1.0",
    date: "April 2026",
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
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Badge variant={i === 0 ? "default" : "outline"} className="text-sm px-3 py-1">
                  v{release.version}
                </Badge>
                <span className="text-sm text-muted-foreground">{release.date}</span>
                {i === 0 && <Badge variant="success" className="text-[10px]">Latest</Badge>}
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
