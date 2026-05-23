# MRT Jakarta — Agent Design Reference

> Single source of truth for agents building features. Read this before writing any UI, API, or test code. All patterns derive from the live codebase — no invention.

---

## 1. Design Philosophy & Hard Rules

**Aesthetic:** "Operations Terminal" — Bloomberg Terminal × Linear × Transit Control Room. High-density, dark-first, monospace data labels, subtle motion only.

**Hard rules:**
- Never use Inter, Roboto, Arial, or system-ui fonts
- Never use purple gradients or generic card shadows
- Dark mode is the primary design target; light mode is a clean variant
- Motion must be subtle — no gaming-dashboard bounce effects
- All user-facing strings go through `t()` (react-i18next) — no hardcoded English
- Named exports everywhere; only pages use `export default` (required for `lazy()`)
- Backend controllers are thin: parse → call service → send response. Logic goes in services.
- Never call protected API endpoints from `AuthLayout` or public routes

---

## 2. Project Structure

```
mrt-station-dashboard/
├── frontend/src/
│   ├── components/     # Reusable UI (Shadcn base + custom extensions)
│   ├── pages/          # 17 route pages (lazy-loaded via React.lazy)
│   ├── hooks/          # TanStack Query hooks + custom hooks
│   ├── store/          # Zustand stores: auth.store.ts, theme.store.ts
│   ├── services/       # Axios API layer (api.ts, public.service.ts, etc.)
│   ├── i18n/locales/   # en.json, id.json
│   ├── lib/            # tokens.ts, motion.ts, cn.ts, export-pdf.ts, permissions.ts
│   ├── types/          # index.ts — all shared TypeScript types
│   └── layouts/        # AuthLayout.tsx, DashboardLayout.tsx
├── backend/src/
│   ├── controllers/    # HTTP handlers (thin)
│   ├── services/       # Business logic + Prisma calls
│   ├── routes/         # Express route definitions (with JSDoc for Swagger)
│   ├── middlewares/    # auth.middleware.ts, admin.middleware.ts, validation
│   ├── validators/     # Zod schemas for request validation
│   └── prisma/         # schema.prisma, migrations/, seed.ts
├── e2e/                # Playwright specs (*.spec.ts), fixtures/, global-setup.ts
└── .claude/
    ├── rules/          # architecture.md, testing.md, commit-convention.md
    ├── skills/         # add-feature/, review-code/
    └── DESIGN.md       # this file
```

**Data flow:**
```
React Page → TanStack Query hook → API service (axios) → Express route → Controller → Service → Prisma → PostgreSQL
```

**Pages (all lazy-loaded):**
Dashboard, Stations, StationDetail, StationMap, Schedules, RoutePlanner, StationCompare, CommandCenter, Users (admin), AccessManagement (admin), ActivityLog, Settings, Changelog, Profile, Feedback, NotFound, 404

---

## 3. Color System

### Dark Mode (CSS class `.dark` on `<html>`)

| Token | oklch value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(0.115 0.022 245)` | Page background |
| card bg | `oklch(0.152 0.02 243)` | `.ops-card`, panels |
| sidebar bg | `oklch(0.09 0.022 245)` | Left nav |
| `--border` | blue-tinted dark | Card/input borders |
| `--primary` | blue accent | Buttons, accent line |
| `--muted` | dimmed | Secondary labels |

### Light Mode

| Token | oklch value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(0.974 0.007 248)` | Subtle blue-white tint |
| card bg | white/near-white | `.ops-card` |

### Status Colors (from `lib/tokens.ts`)

```typescript
import { statusColors } from "@/lib/tokens";

// statusColors.ACTIVE  = { text: "#22c55e", glow: "rgba(34,197,94,0.35)",  bg: "rgba(34,197,94,0.1)" }
// statusColors.MAINTENANCE = { text: "#f59e0b", glow: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.1)" }
// statusColors.INACTIVE = { text: "#ef4444", glow: "rgba(239,68,68,0.35)",  bg: "rgba(239,68,68,0.1)" }

// Schedule status colors:
// scheduleColors.ACTIVE    = { text: "#22c55e", ... }
// scheduleColors.CANCELLED = { text: "#ef4444", ... }
// scheduleColors.DELAYED   = { text: "#f59e0b", ... }
```

### Role Colors

```typescript
// roleColors.ADMIN    = { text: "#3b82f6", bg: "rgba(59,130,246,0.1)" }
// roleColors.OPERATOR = { text: "#8b5cf6", bg: "rgba(139,92,246,0.1)" }
```

---

## 4. Typography

### Fonts
| Class | Font | Usage |
|-------|------|-------|
| (default / no class) | Sora | Body text, paragraphs, labels |
| `font-display` | Bebas Neue | Stat numbers, headings, hero text |
| `font-mono` | JetBrains Mono | Station codes, data labels, timestamps |

Fonts loaded in `frontend/index.html` via Google Fonts. **Never import via CSS @import.**

### Font Size Tokens (`lib/tokens.ts`)
```typescript
fontSize = {
  label: 9.5,   // tiny caps labels
  sm: 12,
  base: 13.5,   // default body
  md: 15,
  title: 18,
  heading: 36,
  display: 76,  // hero numbers
}
```

### Patterns
```tsx
// Stat number
<span className="font-display text-4xl">{count}</span>

// Station code badge
<span className="font-mono text-xs">{station.code}</span>

// Section label
<span className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground">
  {t("label")}
</span>
```

---

## 5. CSS Utilities & Classes

All defined in `frontend/src/index.css`. Use these classes — do not recreate inline.

### Card System
```css
.ops-card          /* base card: border, bg (--card), rounded-xl, overflow-hidden */
.ops-card-accent   /* adds top accent gradient line support (pairs with .ops-accent-line) */
.ops-accent-line   /* 2px gradient top border: primary→transparent */
.ops-card-header   /* padding + border-bottom for card header region */
.ops-card-title    /* font-mono uppercase tracking-wide text-sm font-semibold */
.ops-card-subtitle /* text-xs text-muted-foreground mt-0.5 */
```

### Navigation
```css
.nav-link-item     /* sidebar nav item — has ::before pseudo for active 3px bar */
/* Active state: .nav-link-item[aria-current="page"]::before — spring-animated 3px left bar */
/* nav-collapsed class disables the ::before bar (collapsed sidebar) */
```

### Table
```css
/* tbody tr::after — 2px left primary accent bar on hover (opacity transition) */
```

### Status
```css
.led-dot           /* base LED dot: rounded-full, position relative */
/* Use ledDot(status) from tokens.ts for inline styles — provides size, color, box-shadow glow */
```

### Loading
```css
.skeleton-shimmer  /* animated shimmer: bg-muted, rounded-[6px], shimmer keyframe */
```

### Scrollbar (auto-applied)
Custom 6px scrollbar, blue-tinted in dark mode. Defined globally in `index.css`.

---

## 6. Design Tokens (`lib/tokens.ts`)

Import path: `import { ... } from "@/lib/tokens"`

### LED Dot Function
```typescript
import { ledDot, statusColors } from "@/lib/tokens";

// Generates complete inline style for a status LED dot
const dotStyle = ledDot("ACTIVE");
// Returns: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
//            boxShadow: "0 0 6px rgba(34,197,94,0.35)" }

// Usage in JSX:
<span className="led-dot" style={ledDot(station.status)} />
```

### z-Index Scale
```typescript
zIndex = { base: 0, raised: 10, dropdown: 100, sticky: 200, overlay: 300, modal: 400, toast: 500 }
```

### Space & Radius
```typescript
radius = { sm: "4px", base: "6px", md: "8px", lg: "12px", xl: "16px", full: "9999px" }
space  = { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px" }
```

### Breakpoints
```typescript
breakpoint = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
```

---

## 7. Motion & Animation (`lib/motion.ts`)

Import path: `import { ... } from "@/lib/motion"`

### Duration Tokens
```typescript
duration = { instant: 0.08, fast: 0.15, base: 0.22, slow: 0.35, slower: 0.5 }
```

### Easing Tokens
```typescript
ease = {
  smooth: [0.4, 0, 0.2, 1],   // default Material-style
  exit:   [0.4, 0, 1, 1],
  enter:  [0, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
}
```

### Spring Transitions
```typescript
spring       = { type: "spring", stiffness: 400, damping: 30 }  // snappy
springGentle = { type: "spring", stiffness: 260, damping: 24 }  // soft
```

### Ready-to-Use Variants
```typescript
// Full page transition (use on <motion.div> wrapping page content)
pageTransition = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: smooth } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

// Card/element fade-up
fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// List stagger (children stagger by 60ms)
stagger = {
  container: { visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } },
  item:       { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } },
}

// Fast stagger for dense lists (children stagger by 35ms, slide from left)
staggerFast = {
  container: { visible: { transition: { staggerChildren: 0.035 } } },
  item:       { hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } },
}
```

### Reduced Motion Guard
```typescript
import { safeVariants } from "@/lib/motion";
import { useReducedMotion } from "framer-motion";

// Usage
const prefersReduced = useReducedMotion();
const variants = safeVariants(stagger.container, prefersReduced ?? false);
```

### Usage Pattern
```tsx
import { motion } from "framer-motion";
import { pageTransition, stagger, fadeUp } from "@/lib/motion";

// Page wrapper
<motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">

// Staggered list
<motion.ul variants={stagger.container} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={stagger.item}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

---

## 8. OpsCard Component

Import: `import { OpsCard } from "@/components/OpsCard"`

### Props
```typescript
interface OpsCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  noHeader?: boolean;
}
```

### DOM Structure
```tsx
<div className="ops-card ops-card-accent [className]">
  <div className="ops-accent-line" />           {/* gradient top border */}
  {!noHeader && title && (
    <div className="ops-card-header flex items-start justify-between">
      <div>
        <div className="ops-card-title flex items-center gap-2">
          {icon}{title}
        </div>
        {subtitle && <div className="ops-card-subtitle">{subtitle}</div>}
      </div>
      {headerRight && <div>{headerRight}</div>}
    </div>
  )}
  {children}
</div>
```

### Usage Patterns
```tsx
// With header
<OpsCard
  title="Station Status"
  subtitle="North-South Line"
  icon={<Train className="w-4 h-4" />}
  headerRight={<Badge>{count}</Badge>}
>
  {/* content */}
</OpsCard>

// Content-only (no header)
<OpsCard noHeader className="p-4">
  {/* raw content */}
</OpsCard>

// Never manually write the ops-card DOM — always use the component
```

---

## 9. LED Status Dots

Three canonical patterns — pick based on context.

### Pattern A: LED + label (table/list rows)
```tsx
import { ledDot } from "@/lib/tokens";

<div className="flex items-center gap-2">
  <span className="led-dot" style={ledDot(station.status)} />
  <span className="font-mono text-xs">{station.status}</span>
</div>
```

### Pattern B: Colored status badge (form/detail views)
```tsx
import { statusColors } from "@/lib/tokens";

const colors = statusColors[station.status];
<span
  className="font-mono text-xs px-2 py-0.5 rounded-full border"
  style={{
    color: colors.text,
    background: colors.bg,
    borderColor: colors.text + "40",
  }}
>
  {station.status}
</span>
```

### Pattern C: Inline dot only (compact)
```tsx
<span
  className="inline-block rounded-full"
  style={{ width: 6, height: 6, background: statusColors[status].text }}
/>
```

### Operations Status Banner
```tsx
// For system-level status (ACTIVE / DEGRADED / INCIDENT)
const opsColors = {
  ACTIVE:   { text: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  DEGRADED: { text: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  INCIDENT: { text: "#ef4444", glow: "rgba(239,68,68,0.5)" },
};
// Note: glow alpha is 0.5 here (vs 0.35 in statusColors) — ops banner uses higher intensity
```

---

## 10. Skeleton Loading

Import: `import { Skeleton... } from "@/components/Skeleton"`

### Available Components
```typescript
SkeletonBase       // single bar — className + style passthrough
SkeletonText       // text-line placeholder
SkeletonAvatar     // circular avatar placeholder
SkeletonStatCard   // stat card with number + label
SkeletonRow        // single table/list row
SkeletonCard       // generic card block
SkeletonTable      // full table with header + rows: <SkeletonTable rows={5} columns={4} />
SkeletonProfile    // profile page layout
```

### Usage Pattern
```tsx
import { useQuery } from "@tanstack/react-query";
import { SkeletonTable } from "@/components/Skeleton";

export function StationList() {
  const { data, isLoading } = useStations();

  if (isLoading) return <SkeletonTable rows={8} columns={5} />;
  return <table>...</table>;
}
```

All skeletons use `skeleton-shimmer bg-muted rounded-[6px]` — never write custom skeleton shimmer animations.

---

## 11. Forms & Validation

### Stack
- React Hook Form + Zod resolver
- Shadcn UI `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`

### Pattern
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(2).max(4).toUpperCase(),
});
type FormValues = z.infer<typeof schema>;

function StationForm({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("stations.name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("common.save")}
        </Button>
      </form>
    </Form>
  );
}
```

### Select (Radix/Shadcn)
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ACTIVE">Active</SelectItem>
    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
  </SelectContent>
</Select>
```

---

## 12. Tables & Dialogs

### Table Pattern
```tsx
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="font-mono text-[10px] uppercase tracking-widest">
        {t("stations.code")}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {stations.map((s) => (
      <TableRow key={s.id}>
        <TableCell className="font-mono">{s.code}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Table hover effect (2px left accent bar) is handled by CSS `::after` on `tbody tr` — automatic.

### Dialog Pattern
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t("stations.addStation")}</DialogTitle>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
      <Button onClick={handleSubmit}>{t("common.create")}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Delete Confirmation (AlertDialog)
```tsx
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
      <AlertDialogDescription>{t("common.deleteWarning")}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
        {t("common.delete")}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 13. Backend Patterns

### Controller (thin)
```typescript
// controllers/station.controller.ts
export const getStations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const result = await stationService.getStations({ page, limit, search, status });
    res.json({ success: true, data: result.stations, meta: result.meta });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
```

### Service (business logic)
```typescript
// services/station.service.ts
export const stationService = {
  async getStations({ page, limit, search, status }) {
    const where = {
      ...(search && { OR: [{ name: { contains: search } }, { code: { contains: search } }] }),
      ...(status && { status }),
    };
    const [stations, total] = await Promise.all([
      prisma.station.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { order: "asc" } }),
      prisma.station.count({ where }),
    ]);
    return { stations, meta: { page, limit, total, totalPages: Math.ceil(total/limit) } };
  },
};
```

### API Response Envelope
```typescript
// Success
res.json({ success: true, data: result });
res.json({ success: true, data: result, meta: paginationMeta });

// Error
res.status(400).json({ success: false, error: "Validation failed" });
res.status(404).json({ success: false, error: "Station not found" });
res.status(403).json({ success: false, error: "Access denied. Admin privileges required." });
```

### Middleware Stack (route order)
```typescript
// Protected route
router.get("/stations", authMiddleware, stationController.getStations);

// Admin-only CUD
router.post("/stations", authMiddleware, adminMiddleware, validate(createStationSchema), stationController.createStation);

// authMiddleware: extracts JWT → attaches req.user (userId, role)
// adminMiddleware: queries DB to confirm role === "ADMIN"
// validate(schema): Zod validation middleware
```

### Activity Logging (all CUD operations)
```typescript
import { activityLogService } from "./activity-log.service";

// After successful mutation:
await activityLogService.log({
  userId: req.user!.userId,
  action: "CREATE", // CREATE | UPDATE | DELETE
  entity: "Station",
  entityId: station.id,
  details: `Created station ${station.name} (${station.code})`,
});
```

### SSE Broadcast (after data changes)
```typescript
import { sseService } from "./sse.service";

// After station update:
sseService.broadcast({ type: "STATION_UPDATED", data: station });
// Types: STATION_CREATED, STATION_UPDATED, STATION_DELETED,
//        SCHEDULE_CREATED, SCHEDULE_UPDATED, SCHEDULE_DELETED,
//        USER_UPDATED
```

### Public Endpoint Pattern
```typescript
// No auth, cached 5 minutes
router.get("/public/stations", publicController.getStations);
// Returns: { id, name, code, order, status } for ACTIVE stations only, ordered by order ASC
// Response header: Cache-Control: public, max-age=300
```

---

## 14. State Management

### Server State (TanStack Query)
```typescript
// QueryClient defaults (App.tsx):
// staleTime: 5 minutes, retry: 1, refetchOnWindowFocus: false

// Hook pattern
export function useStations(params?: StationParams) {
  return useQuery({
    queryKey: ["stations", params],
    queryFn: () => stationService.getStations(params),
  });
}

// Mutation pattern
export function useCreateStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stationService.createStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success(t("stations.created"));
    },
  });
}
```

### Client State (Zustand)
```typescript
// Auth store: frontend/src/store/auth.store.ts
const { user, token, permissions, setAuth, clearAuth } = useAuthStore();

// permissions[] comes from GET /api/permissions/me on login
// Stored as string[] e.g. ["stations.view", "stations.create", "users.manage"]

// Theme store: frontend/src/store/theme.store.ts
const { theme, toggleTheme } = useThemeStore();
// Values: "light" | "dark"
// Applied via: document.documentElement.classList.toggle("dark")
```

### RBAC Hooks
```typescript
import { usePermission } from "@/hooks/use-permission";
import { useRole } from "@/hooks/use-role";

// Permission-based (preferred — granular)
const { can } = usePermission();
{can("stations.create") && <Button>Add Station</Button>}

// Role-based (for coarse admin-only gating)
const { isAdmin } = useRole();
{isAdmin && <AdminPanel />}
```

### Public API (no auth)
```typescript
// frontend/src/services/public.service.ts uses a separate publicApi axios instance
// Hook: usePublicStations() — staleTime: 10min, retry: false
// Only for AuthLayout and public routes — never for authenticated pages
```

### Axios Interceptor Rules (`services/api.ts`)
- 401 response → clear localStorage (token/user) → redirect `/login`
- **Skip redirect if:** `error.config.url` starts with `/auth/` OR current path is `/login` or `/register`

---

## 15. i18n Pattern

All user-facing strings must use `t()`. Structure of `frontend/src/i18n/locales/en.json`:

```
nav.*           — sidebar nav labels (dashboard, stations, schedules, map, etc.)
common.*        — shared labels (save, cancel, delete, confirm, search, loading, etc.)
auth.*          — login/register page strings
dashboard.*     — dashboard page (welcomeBack, totalStations, etc.)
stations.*      — stations page (addStation, editStation, name, code, location, etc.)
schedules.*     — schedules page (trainNumber, departureTime, arrivalTime, etc.)
profile.*       — profile page strings
users.*         — users management strings
map.*           — map page strings
notFound.*      — 404 page strings
feedback.*      — feedback form strings
activity.*      — activity log strings
```

### Usage
```tsx
import { useTranslation } from "react-i18next";

function StationPage() {
  const { t } = useTranslation();
  return <h1>{t("stations.title")}</h1>;
}
```

### Adding a New String
1. Add to `frontend/src/i18n/locales/en.json` under the appropriate section
2. Add the same key to `frontend/src/i18n/locales/id.json` with Indonesian translation
3. Use `t("section.key")` in the component

---

## 16. E2E Testing Pattern

Test files: `e2e/*.spec.ts` | Fixtures: `e2e/fixtures/auth.ts` | Config: `playwright.config.ts`

### Fixtures
```typescript
import { test, expect, navigateTo } from "./fixtures/auth";

// adminPage  — admin role (auto-logged in via storageState)
// operatorPage — operator role (auto-logged in via storageState)

test("should create station", async ({ adminPage: page }) => {
  await navigateTo(page, "/stations");  // SPA navigation via sidebar click
  // ...
});
```

### Core Rules
```typescript
// ✅ SPA navigation — always use navigateTo (not page.goto for internal routes)
await navigateTo(page, "/stations");

// ✅ Wait after navigation
await page.waitForTimeout(2000);

// ✅ For dialogs
const dialog = page.locator("[role='dialog']");

// ✅ For Shadcn Select
await page.locator("button[role='combobox']").click();
await page.getByRole("option", { name: "Active" }).click();

// ✅ Avoid strict mode errors
await page.locator("text=Something").first();

// ✅ Mobile tests
await page.tap(".button");  // not .click()

// ❌ NEVER — SSE connections keep network open forever
await page.waitForLoadState("networkidle");

// ❌ NEVER — use navigateTo instead
await page.goto("/stations");
```

### Project Structure (playwright.config.ts)
```
auth-tests    → no storageState (login tests, public routes)
admin-tests   → e2e/.auth/admin.json storageState
mobile-tests  → Pixel 7 emulation + e2e/.auth/admin.json
```

### Selectors — Stable vs Fragile
```typescript
// ✅ Stable (structure-based)
page.locator("span.font-mono").filter({ hasText: /[A-Z]{4,}/ })
page.locator("[role='dialog']")
page.locator("tbody tr").first()

// ⚠️ Fragile (text-based — breaks on translation/seed changes)
page.locator("text=LEBAK BULUS")  // breaks if station has MAINTENANCE status

// ✅ Seed-safe station code pattern (all 13 stations)
page.locator("text=/LBB|FTM|CPR|HJN|BLA|BLM|ASN|SNY|IST|BNH|STB|DKA|BHI/")
```

### Writing a New Spec File
```typescript
import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Feature Name", () => {
  test("should [expected behavior]", async ({ adminPage: page }) => {
    await navigateTo(page, "/route");
    await page.waitForTimeout(2000);

    // assertions...
  });
});
```

---

## 17. Version Bump Checklist

When bumping from vX.Y.Z to vA.B.C, update ALL 7 locations:

```
1. frontend/package.json         → "version": "A.B.C"
2. backend/package.json          → "version": "A.B.C"
3. backend/src/config/swagger.ts → version: "A.B.C"
4. frontend/src/pages/ChangelogPage.tsx → new entry at top of releases[] array:
   {
     version: "vA.B.C",
     date: "YYYY-MM-DD",
     commits: [],       ← populate with: git log vX.Y.Z..HEAD --oneline (short hashes)
     changes: [
       { type: "feat", description: "..." },
       { type: "fix",  description: "..." },
     ],
   }
5. README.md                     → version badge + "What's New" section
6. CLAUDE.md (project root)      → update version mentions if any
7. GitHub Release                → gh release create vA.B.C --title "vA.B.C" --notes "..."
```

### Populate commits[] array
```bash
rtk git log vX.Y.Z..HEAD --oneline
# Copy the 7-char short hashes into commits: ["abc1234", "def5678", ...]
```

---

## 18. What NOT To Do

### Frontend Anti-Patterns

```tsx
// ❌ Hardcoded role→permission mapping in frontend
if (user.role === "ADMIN") { ... }
// ✅ Use permission check
if (can("users.manage")) { ... }

// ❌ Calling protected API from AuthLayout or public routes
const { data } = useQuery({ queryFn: () => api.get("/stations") });
// ✅ Use publicApi service for public routes
const { data } = usePublicStations();

// ❌ Direct API calls in components
const res = await axios.get("/api/stations");
// ✅ Go through services/ layer
const { data } = useStations();

// ❌ Server state in Zustand
const useStationStore = create(() => ({ stations: [] }));
// ✅ TanStack Query for server state
const { data: stations } = useStations();

// ❌ Custom skeleton animations
<div className="animate-pulse bg-gray-200" />
// ✅ Use Skeleton components
<SkeletonTable rows={5} columns={4} />

// ❌ Hardcoded English strings
<button>Save Changes</button>
// ✅ i18n
<button>{t("common.save")}</button>

// ❌ Generic font families
style={{ fontFamily: "Inter, sans-serif" }}
// ✅ Use Tailwind class
className="font-mono"

// ❌ Purple gradient backgrounds
className="bg-gradient-to-r from-purple-500 to-pink-500"
// ✅ Use primary accent
className="bg-primary"

// ❌ default export for non-page components
export default function OpsCard() { ... }
// ✅ Named export
export function OpsCard() { ... }
```

### Backend Anti-Patterns

```typescript
// ❌ Business logic in controllers
export const createStation = async (req, res) => {
  const station = await prisma.station.create({ ... }); // ← move to service
};

// ❌ Missing activity log on mutations
await prisma.station.delete({ where: { id } });
// ✅ Always log CUD operations
await activityLogService.log({ userId, action: "DELETE", entity: "Station", ... });

// ❌ Missing SSE broadcast after data changes
await stationService.updateStation(id, data);
// ✅ Broadcast after mutations
sseService.broadcast({ type: "STATION_UPDATED", data: updated });

// ❌ Unprotected mutation routes
router.post("/stations", stationController.createStation);
// ✅ Middleware chain
router.post("/stations", authMiddleware, adminMiddleware, validate(schema), stationController.createStation);
```

### E2E Anti-Patterns

```typescript
// ❌ networkidle — SSE never closes
await page.waitForLoadState("networkidle");

// ❌ Direct goto for internal routes
await page.goto("/stations");
// ✅ SPA navigation
await navigateTo(page, "/stations");

// ❌ Fragile text selectors for seed data
page.locator("text=LEBAK BULUS")  // fails if station is MAINTENANCE in CI

// ❌ Mobile click
await page.click(".mobile-menu");
// ✅ Mobile tap
await page.tap(".mobile-menu");
```
