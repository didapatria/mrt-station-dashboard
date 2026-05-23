# Operations Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-screen `/command` Operations Command Center page showing a live 13-station LED grid, system status panel, and rolling SSE activity feed — giving the dashboard the feel of a real transit operations control room.

**Architecture:** No new backend needed. A new Zustand `activityFeedStore` captures non-simulated SSE `activity` events from the existing `useRealtimeNotifications` hook (single connection, shared state — no extra SSE connection). The page consumes `useStations({ limit: 50 })`, `useSystemStatus`, and `useActivityFeedStore` in a three-panel layout: system status left, station grid center, activity feed right, with a live clock in the header.

**Tech Stack:** React 19, TypeScript, Zustand 5, TanStack Query, Framer Motion, Tailwind CSS 4, Lucide React, Shadcn UI, Playwright (E2E)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/store/activity-feed.store.ts` | **Create** | Zustand store — rolling buffer of last 30 SSE activity events |
| `frontend/src/hooks/use-sse.ts` | **Modify** | Push non-simulated `activity` events to feed store inside `handleActivity` |
| `frontend/src/i18n/locales/en.json` | **Modify** | Add `nav.commandCenter: "Command Center"` |
| `frontend/src/i18n/locales/id.json` | **Modify** | Add `nav.commandCenter: "Pusat Komando"` |
| `frontend/src/layouts/DashboardLayout.tsx` | **Modify** | Import `Monitor` from lucide-react; add `/command` nav item to Operations group; bump version label to v2.17.0 |
| `frontend/src/App.tsx` | **Modify** | Lazy-import `CommandCenterPage`; add `/command` route inside `DashboardLayout` |
| `frontend/src/pages/CommandCenterPage.tsx` | **Create** | Full-screen control room page with header, 3-panel grid, live clock |
| `e2e/command-center.spec.ts` | **Create** | 5 E2E tests for the command center page |
| `frontend/src/pages/ChangelogPage.tsx` | **Modify** | Add v2.17.0 structured release entry |
| `README.md` | **Modify** | Bump version badge to 2.17.0; add v2.17.0 section |
| `frontend/src/layouts/AuthLayout.tsx` | **Modify** | Bump version label v2.16.0 → v2.17.0 |
| `.claude/rules/testing.md` | **Modify** | Update test count (116 → 121, 22 → 23 spec files) |

---

## Task 1: Create the activity feed Zustand store

**Files:**
- Create: `frontend/src/store/activity-feed.store.ts`

This store is the bridge between the SSE hook (which receives events) and the CommandCenterPage (which displays them). It holds the last 30 events in reverse-chronological order. It must be usable both as a React hook (`useActivityFeedStore`) and with `.getState()` from outside React (needed in `use-sse.ts`).

- [ ] **Step 1: Create the store file**

```typescript
// frontend/src/store/activity-feed.store.ts
import { create } from "zustand";

export interface FeedEntry {
  id: string;
  message: string;
  detail?: string;
  time: Date;
}

interface ActivityFeedStore {
  events: FeedEntry[];
  push: (entry: Pick<FeedEntry, "message" | "detail">) => void;
}

export const useActivityFeedStore = create<ActivityFeedStore>((set) => ({
  events: [],
  push: ({ message, detail }) =>
    set((state) => ({
      events: [
        { id: crypto.randomUUID(), message, detail, time: new Date() },
        ...state.events,
      ].slice(0, 30),
    })),
}));
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: `TypeScript: No errors found`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/store/activity-feed.store.ts
git commit -m "feat(frontend): activity feed Zustand store for SSE event rolling buffer"
```

---

## Task 2: Wire SSE hook to push events into the feed store

**Files:**
- Modify: `frontend/src/hooks/use-sse.ts`

The existing `handleActivity` callback already fires on each non-simulated SSE activity event. Add a single `useActivityFeedStore.getState().push(...)` call there. Use `.getState()` — not the React hook — because this code runs inside `useCallback`, not a component render.

- [ ] **Step 1: Add the import at the top of `use-sse.ts`**

Open `frontend/src/hooks/use-sse.ts`. After the existing imports, add:

```typescript
import { useActivityFeedStore } from "@/store/activity-feed.store";
```

- [ ] **Step 2: Update `handleActivity` to push to the feed store**

Find this block in `handleActivity` (around line 38–44):

```typescript
    if (!data.simulated) {
      toast.info(
        `${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`,
        { description: data.details },
      );
    }
```

Replace with:

```typescript
    if (!data.simulated) {
      toast.info(
        `${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`,
        { description: data.details },
      );
      useActivityFeedStore.getState().push({
        message: `${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`,
        detail: data.details,
      });
    }
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: `TypeScript: No errors found`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/use-sse.ts
git commit -m "feat(frontend): wire SSE activity events into activity feed store"
```

---

## Task 3: Add i18n keys, nav item, and route

**Files:**
- Modify: `frontend/src/i18n/locales/en.json`
- Modify: `frontend/src/i18n/locales/id.json`
- Modify: `frontend/src/layouts/DashboardLayout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add i18n key to `en.json`**

In `frontend/src/i18n/locales/en.json`, find the `"nav"` block. Add `"commandCenter"` after `"compare"`:

```json
"nav": {
  "dashboard": "Dashboard",
  "stations": "Stations",
  "schedules": "Schedules",
  "stationMap": "Station Map",
  "commandCenter": "Command Center",
  "users": "Users",
  "activityLog": "Activity Log",
  "accessManagement": "Access Management",
  "profile": "Profile",
  "routePlanner": "Route Planner",
  "compare": "Compare",
  "settings": "Settings",
  "changelog": "Changelog",
  "menu": "Menu",
  "operations": "Operations",
  "management": "Management",
  "system": "System"
}
```

- [ ] **Step 2: Add i18n key to `id.json`**

In `frontend/src/i18n/locales/id.json`, add `"commandCenter"` in the same position:

```json
"nav": {
  "dashboard": "Dasbor",
  "stations": "Stasiun",
  "schedules": "Jadwal",
  "stationMap": "Peta Stasiun",
  "commandCenter": "Pusat Komando",
  "users": "Pengguna",
  "activityLog": "Log Aktivitas",
  "accessManagement": "Manajemen Akses",
  "profile": "Profil",
  "routePlanner": "Pencarian Rute",
  "compare": "Bandingkan",
  "settings": "Pengaturan",
  "changelog": "Riwayat Perubahan",
  "menu": "Menu",
  "operations": "Operasional",
  "management": "Manajemen",
  "system": "Sistem"
}
```

- [ ] **Step 3: Add `Monitor` import and nav item to `DashboardLayout.tsx`**

Open `frontend/src/layouts/DashboardLayout.tsx`.

**3a — Add `Monitor` to the lucide-react import:**

Find the existing import block and add `Monitor`:

```typescript
import {
  Train,
  LayoutDashboard,
  MapPin,
  Clock,
  LogOut,
  Menu,
  User,
  Settings,
  Map,
  ChevronDown,
  Search,
  Users,
  Activity,
  PanelLeftClose,
  PanelLeft,
  History,
  RefreshCw,
  Navigation,
  KeyRound,
  MessageSquare,
  Monitor,
} from "lucide-react";
```

**3b — Add the nav item to the Operations group:**

Find the `navGroups` array, specifically the `"nav.operations"` group:

```typescript
  {
    labelKey: "nav.operations",
    items: [
      { to: "/stations", icon: MapPin, labelKey: "nav.stations" },
      { to: "/schedules", icon: Clock, labelKey: "nav.schedules" },
      { to: "/map", icon: Map, labelKey: "nav.stationMap" },
      { to: "/route-planner", icon: Navigation, labelKey: "nav.routePlanner" },
      { to: "/compare", icon: LayoutDashboard, labelKey: "nav.compare" },
      { to: "/command", icon: Monitor, labelKey: "nav.commandCenter" },
    ],
  },
```

- [ ] **Step 4: Add lazy import and route to `App.tsx`**

Open `frontend/src/App.tsx`.

**4a — Add lazy import** (after the last existing lazy import, e.g. after `AccessManagementPage`):

```typescript
const CommandCenterPage = lazy(() => import("@/pages/CommandCenterPage"));
```

**4b — Add route** inside the `<Route element={<DashboardLayout />}>` block, after `/changelog`:

```tsx
<Route path="/command" element={<CommandCenterPage />} />
```

- [ ] **Step 5: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: `TypeScript: No errors found` (the page import will error until the file exists — that's OK, create an empty placeholder first if needed)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/i18n/locales/en.json \
        frontend/src/i18n/locales/id.json \
        frontend/src/layouts/DashboardLayout.tsx \
        frontend/src/App.tsx
git commit -m "feat(frontend): add /command route, nav item, i18n keys for Command Center"
```

---

## Task 4: Build CommandCenterPage

**Files:**
- Create: `frontend/src/pages/CommandCenterPage.tsx`

Three inline sub-components keep the file focused:
- `StationTile` — renders one station card with LED dot
- `SystemStatusPanel` — ACTIVE/DEGRADED/INCIDENT gauge with stats
- `ActivityFeed` — scrollable rolling event list with relative timestamps

- [ ] **Step 1: Create the file**

```typescript
// frontend/src/pages/CommandCenterPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStations } from "@/hooks/use-stations";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useRealtimeNotifications } from "@/hooks/use-sse";
import { useActivityFeedStore, type FeedEntry } from "@/store/activity-feed.store";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Skeleton } from "@/components/ui/skeleton";
import type { Station, SystemStatusData, OperationsStatus } from "@/types";

// ── Station tile ──────────────────────────────────────────────────────────────

const STATUS_DOT: Record<Station["status"], { color: string; glow?: string }> = {
  ACTIVE: { color: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  MAINTENANCE: { color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  INACTIVE: { color: "#6b7280" },
};

function StationTile({ station }: { station: Station }) {
  const dot = STATUS_DOT[station.status];
  return (
    <div className="ops-card relative p-3 flex flex-col gap-1.5 cursor-default select-none hover:bg-muted/30 transition-colors">
      <div className="ops-accent-line" />
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: dot.color,
            boxShadow: dot.glow ? `0 0 6px ${dot.glow}` : undefined,
          }}
        />
        <span className="font-mono text-[10px] font-bold text-primary tracking-[-0.02em]">
          {station.code}
        </span>
      </div>
      <p className="font-['Sora',sans-serif] text-[11.5px] leading-tight line-clamp-2">
        {station.name}
      </p>
      <span
        className="font-mono text-[9px] tracking-wide mt-auto"
        style={{ color: dot.color }}
      >
        {station.status}
      </span>
    </div>
  );
}

// ── System status panel ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OperationsStatus,
  { label: string; dot: string; glow: string }
> = {
  ACTIVE: { label: "ALL SYSTEMS GO", dot: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  DEGRADED: { label: "DEGRADED", dot: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  INCIDENT: { label: "INCIDENT", dot: "#ef4444", glow: "rgba(239,68,68,0.5)" },
};

function SystemStatusPanel({
  data,
  isLoading,
}: {
  data: SystemStatusData | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const cfg = STATUS_CONFIG[data.status];
  const operational = data.totalStations - data.maintenanceStations;

  const statRows = [
    {
      label: "STATIONS",
      value: `${operational}/${data.totalStations}`,
      sub: "operational",
      color: undefined as string | undefined,
    },
    {
      label: "MAINTENANCE",
      value: String(data.maintenanceStations),
      sub: undefined,
      color: data.maintenanceStations > 0 ? "#f59e0b" : undefined,
    },
    {
      label: "CANCELLED",
      value: String(data.cancelledSchedules),
      sub: undefined,
      color: data.cancelledSchedules > 0 ? "#ef4444" : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
          System Status
        </div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50"
              style={{ background: cfg.dot }}
            />
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.glow}` }}
            />
          </span>
          <span
            className="font-display text-[20px] leading-none tracking-wide"
            style={{ color: cfg.dot }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {statRows.map(({ label, value, sub, color }) => (
          <div key={label} className="border border-border rounded-md px-3 py-2">
            <div className="font-mono text-[8.5px] tracking-[0.15em] text-muted-foreground mb-0.5">
              {label}
            </div>
            <div
              className="font-display text-[26px] leading-none"
              style={color ? { color } : undefined}
            >
              {value}
            </div>
            {sub && (
              <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────

function timeAgo(d: Date, now: number): string {
  const s = Math.floor((now - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function ActivityFeed({ events }: { events: FeedEntry[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
        Activity Feed
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Waiting for activity…
        </p>
      ) : (
        <div className="flex flex-col overflow-y-auto">
          {events.map((e) => (
            <div
              key={e.id}
              className="border-b border-border/50 py-2.5 last:border-0"
            >
              <p className="text-[12.5px] font-medium leading-snug">{e.message}</p>
              {e.detail && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {e.detail}
                </p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground mt-1">
                {timeAgo(e.time, now)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  usePageMeta({ title: "Command Center", path: "/command" });
  const { t } = useTranslation();

  // Live clock — updates every second
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  const { data: stationsData, isLoading: stationsLoading } = useStations({ limit: 50 });
  const { data: systemStatus, isLoading: systemStatusLoading } = useSystemStatus();
  const { status: sseStatus } = useRealtimeNotifications();
  const feedEvents = useActivityFeedStore((s) => s.events);

  const stations = stationsData?.stations ?? [];

  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const sseDotStyle =
    sseStatus === "connected"
      ? { background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.8)" }
      : sseStatus === "reconnecting"
        ? { background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }
        : { background: "#6b7280" };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-6 py-4 border-b border-border mb-5"
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">
            Operations Terminal · N–S Line · Jakarta MRT
          </div>
          <h1 className="font-display text-[34px] leading-none tracking-[0.04em]">
            {t("nav.commandCenter").toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
            {timeStr}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={sseDotStyle}
            />
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.12em]">
              {sseStatus === "connected"
                ? "LIVE"
                : sseStatus === "reconnecting"
                  ? "RECONNECTING"
                  : "OFFLINE"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Three-panel body ────────────────────────────────────── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "220px 1fr 260px" }}
      >
        {/* Left: System status */}
        <div>
          <SystemStatusPanel data={systemStatus} isLoading={systemStatusLoading} />
        </div>

        {/* Center: Station grid */}
        <div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
            Station Grid · {stations.length} stations
          </div>
          {stationsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 13 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {stations.map((station) => (
                <motion.div
                  key={station.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
                  }}
                >
                  <StationTile station={station} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: Activity feed */}
        <div>
          <ActivityFeed events={feedEvents} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: `TypeScript: No errors found`

- [ ] **Step 3: Run lint**

```bash
cd frontend && npm run lint
```

Expected: no errors (fix any if found before committing)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/CommandCenterPage.tsx
git commit -m "feat(frontend): Operations Command Center — station grid, system status, activity feed"
```

---

## Task 5: E2E tests

**Files:**
- Create: `e2e/command-center.spec.ts`

Prerequisites: both backend and frontend dev servers must be running before running E2E tests. See `CLAUDE.md` Commands section.

- [ ] **Step 1: Create the spec file**

```typescript
// e2e/command-center.spec.ts
import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Command Center", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await navigateTo(page, "/command");
    await page.waitForTimeout(2000);
  });

  test("should render the command center page", async ({
    adminPage: page,
  }) => {
    await expect(
      page.locator("text=/COMMAND CENTER|PUSAT KOMANDO/i"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display the station grid with station tiles", async ({
    adminPage: page,
  }) => {
    // Station Grid heading visible
    await expect(page.locator("text=/Station Grid/i")).toBeVisible({
      timeout: 5000,
    });
    // At least one station code tile (BL is Bundaran HI, first station)
    await expect(page.locator("text=BL").first()).toBeVisible({
      timeout: 8000,
    });
  });

  test("should display the system status panel", async ({
    adminPage: page,
  }) => {
    // System Status label
    await expect(page.locator("text=System Status")).toBeVisible({
      timeout: 5000,
    });
    // One of the three status labels
    const statusLabel = page.locator(
      "text=/ALL SYSTEMS GO|DEGRADED|INCIDENT/",
    );
    await expect(statusLabel.first()).toBeVisible({ timeout: 8000 });
  });

  test("should show the activity feed section", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("text=Activity Feed")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show live connection indicator in header", async ({
    adminPage: page,
  }) => {
    const indicator = page.locator("text=/LIVE|RECONNECTING|OFFLINE/");
    await expect(indicator.first()).toBeVisible({ timeout: 5000 });
  });
});
```

- [ ] **Step 2: Run the spec (requires backend + frontend running)**

```bash
npx playwright test e2e/command-center.spec.ts --reporter=line
```

Expected: 5 passed

- [ ] **Step 3: Commit**

```bash
git add e2e/command-center.spec.ts
git commit -m "test(e2e): command center — page render, station grid, system status, activity feed, live indicator"
```

---

## Task 6: Docs and version bumps

**Files:**
- Modify: `frontend/src/pages/ChangelogPage.tsx`
- Modify: `README.md`
- Modify: `frontend/src/layouts/AuthLayout.tsx`
- Modify: `frontend/src/layouts/DashboardLayout.tsx`
- Modify: `.claude/rules/testing.md`

- [ ] **Step 1: Add v2.17.0 entry to `ChangelogPage.tsx`**

In `frontend/src/pages/ChangelogPage.tsx`, find `const changelog: Release[] = [` and insert the new release at the top (before v2.16.0):

```typescript
  {
    version: "2.17.0",
    date: "23 May 2026",
    commits: [], // fill after tagging
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
```

- [ ] **Step 2: Bump version badge in `README.md`**

Find `img.shields.io/badge/version-2.16.0-blue` and change to `2.17.0`.

Also insert a new `## What's New in v2.17.0` section above the existing `## What's New in v2.16.0`:

```markdown
## What's New in v2.17.0

| Area | Change |
|------|--------|
| **Command Center** | New `/command` page — full-screen ops control room with system status, 13-station LED grid, live activity feed |
| **Station Grid** | LED tiles for all 13 stations — color-coded ACTIVE/MAINTENANCE/INACTIVE with glow, stagger animation |
| **Activity Feed** | Rolling SSE event display — Zustand store fed from existing `useRealtimeNotifications` (no extra connection) |
| **Nav** | "Command Center" entry in Operations sidebar group with `Monitor` icon (EN + ID i18n) |
| **E2E** | `command-center.spec.ts` — 5 tests (page, grid, status, feed, live indicator) |
```

- [ ] **Step 3: Bump version labels in layout files**

In `frontend/src/layouts/AuthLayout.tsx`, find `v2.16.0` and change to `v2.17.0`.

In `frontend/src/layouts/DashboardLayout.tsx`, find `v2.16.0` and change to `v2.17.0`.

- [ ] **Step 4: Update test count in `.claude/rules/testing.md`**

Find:
```
116 total tests across 22 spec files (as of v2.16.0 — 23 May 2026)
```

Replace with:
```
121 total tests across 23 spec files (as of v2.17.0 — 23 May 2026)
```

- [ ] **Step 5: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: `TypeScript: No errors found`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/ChangelogPage.tsx \
        README.md \
        frontend/src/layouts/AuthLayout.tsx \
        frontend/src/layouts/DashboardLayout.tsx \
        .claude/rules/testing.md
git commit -m "docs: v2.17.0 changelog, README, version labels, test count"
```

- [ ] **Step 7: Push and tag**

```bash
git push origin main
git tag v2.17.0
git push origin v2.17.0
```

---

## Self-Review

**Spec coverage:** All items from the brainstorm are addressed:
- ✅ Station LED grid (13 tiles, ACTIVE/MAINTENANCE/INACTIVE) — Task 4 `StationTile`
- ✅ System status ACTIVE/DEGRADED/INCIDENT — Task 4 `SystemStatusPanel`
- ✅ SSE activity feed — Task 1 (store) + Task 2 (wire) + Task 4 (`ActivityFeed`)
- ✅ Live connection indicator — Task 4 header SSE dot
- ✅ Live clock — Task 4 `setInterval` every 1s
- ✅ Nav item + route — Task 3
- ✅ i18n EN + ID — Task 3
- ✅ E2E tests (5) — Task 5
- ✅ Docs — Task 6

**Placeholder scan:** No TBD, TODO, or vague steps. Every code step shows the full code block.

**Type consistency:**
- `FeedEntry` defined in Task 1, imported in Task 4 as `type FeedEntry` ✅
- `useActivityFeedStore` defined in Task 1, used in Task 2 with `.getState()` and in Task 4 with React hook ✅
- `Station`, `SystemStatusData`, `OperationsStatus` all from `@/types` ✅
- `useStations({ limit: 50 })` returns `{ stations: Station[], meta }` — destructured as `stationsData?.stations ?? []` ✅
- `useSystemStatus()` returns `{ data: SystemStatusData | undefined, isLoading }` ✅
- `useRealtimeNotifications()` returns `{ status: SseStatus, lastActivityAt }` — only `status` used ✅
