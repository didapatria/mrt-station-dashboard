# Incident Management System — Design Spec (v2.18.0)

**Date:** 2026-05-23  
**Goal:** Add full incident lifecycle management (create, monitor, resolve) integrated with SSE, Dashboard stats, and OperationsStatusBanner.

---

## 1. Data Model

### Prisma schema additions

```prisma
enum IncidentSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentStatus {
  OPEN
  MONITORING
  RESOLVED
}

model Incident {
  id           String           @id @default(uuid())
  title        String
  description  String?
  severity     IncidentSeverity
  status       IncidentStatus   @default(OPEN)
  stationId    String?          @map("station_id")
  reportedById String           @map("reported_by_id")
  resolvedAt   DateTime?        @map("resolved_at")
  createdAt    DateTime         @default(now()) @map("created_at")
  updatedAt    DateTime         @updatedAt @map("updated_at")

  station    Station? @relation(fields: [stationId], references: [id], onDelete: SetNull)
  reportedBy User     @relation(fields: [reportedById], references: [id])

  @@index([status])
  @@index([severity])
  @@index([stationId])
  @@map("incidents")
}
```

### Relations to add on existing models

```prisma
// On Station model:
incidents Incident[]

// On User model:
incidents Incident[]
```

### onDelete behavior

- `stationId` uses `onDelete: SetNull` — when a station is deleted, existing incidents retain their data but `stationId` becomes null (displayed as "System-wide" in UI).
- User deletion is not supported in the app, so no cascade concern there.

### Seed data (3–5 realistic incidents)

```typescript
// In seed.ts — created after stations and users exist
const incidentSeed = [
  { title: "Signal failure at Bundaran HI", severity: "CRITICAL", status: "OPEN", stationCode: "BHI" },
  { title: "Platform overcrowding — weekend peak", severity: "HIGH", status: "MONITORING", stationCode: "IST" },
  { title: "Escalator maintenance delay", severity: "MEDIUM", status: "MONITORING", stationCode: "BLM" },
  { title: "Ticketing system slowdown", severity: "LOW", status: "RESOLVED", stationCode: null },
  { title: "Track inspection — North segment", severity: "HIGH", status: "OPEN", stationCode: null },
];
```

---

## 2. REST Endpoints

Base path: `/api/incidents`

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| GET | `/api/incidents` | authMiddleware | Paginated list with filters |
| POST | `/api/incidents` | authMiddleware | Create — any authenticated user |
| PATCH | `/api/incidents/:id` | authMiddleware + adminMiddleware | Edit title/description/severity/status |
| PATCH | `/api/incidents/:id/resolve` | authMiddleware + adminMiddleware | Shortcut: RESOLVED + resolvedAt=now() |
| DELETE | `/api/incidents/:id` | authMiddleware + adminMiddleware | Hard delete |

### GET query params

```
?page=1&limit=10&status=OPEN&severity=CRITICAL&stationId=<uuid>&search=<string>
```

### Response envelope

Standard `{ success: true, data: Incident[], meta: PaginationMeta }`.

Incident object includes nested `station: { id, name, code }` and `reportedBy: { id, name }`.

### Validation (Zod)

```typescript
// createIncidentSchema
{
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]),
  stationId: z.string().uuid().optional().nullable(),
}

// updateIncidentSchema (all optional)
{
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]).optional(),
  status: z.enum(["OPEN","MONITORING","RESOLVED"]).optional(),
  stationId: z.string().uuid().optional().nullable(),
}
```

---

## 3. SSE Integration

### New event types (add to existing `SseEventType` union)

```typescript
export type SseEventType =
  | "activity"
  | "station.updated"
  | "schedule.updated"
  | "incident.created"   // after POST
  | "incident.updated"   // after PATCH /:id
  | "incident.resolved"  // after PATCH /:id/resolve
  | "ping";
```

### Broadcast payloads

```typescript
sseService.broadcast("incident.created", incident);   // full incident object
sseService.broadcast("incident.updated", incident);
sseService.broadcast("incident.resolved", incident);
```

### Frontend consumption

In `useRealtimeNotifications` hook (or inline in `useIncidents` hook):

```typescript
eventSource.addEventListener("incident.created", () => {
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
});
// Same for incident.updated and incident.resolved
```

---

## 4. Permissions

New permission entries for seed:

```typescript
{ name: "incidents.view",    label: "View Incidents",    group: "Incidents" },
{ name: "incidents.create",  label: "Create Incidents",  group: "Incidents" },
{ name: "incidents.edit",    label: "Edit Incidents",    group: "Incidents" },
{ name: "incidents.resolve", label: "Resolve Incidents", group: "Incidents" },
{ name: "incidents.delete",  label: "Delete Incidents",  group: "Incidents" },
```

Role assignment:
- ADMIN: all 5 permissions
- OPERATOR: `incidents.view` + `incidents.create` only

Frontend gates:
- `can("incidents.edit")` → show Edit button
- `can("incidents.resolve")` → show Resolve button
- `can("incidents.delete")` → show Delete button

---

## 5. Frontend — IncidentsPage

### Route & lazy loading

```typescript
// App.tsx
const IncidentsPage = lazy(() => import("@/pages/IncidentsPage"));
// Route: <Route path="/incidents" element={<IncidentsPage />} />
```

### Sidebar nav

```typescript
// DashboardLayout.tsx — operations group, after /command
{ to: "/incidents", icon: AlertTriangle, labelKey: "nav.incidents" }
```

### Page layout

```
PageHeader
  title: t("incidents.title")           // "Incidents"
  subtitle: t("incidents.subtitle")     // "Operational incident tracking"
  action: <Button onClick={() => setCreateOpen(true)}>
            <Plus /> {t("incidents.reportIncident")}
          </Button>

Filter bar (flex gap-2)
  <Select> severity: ALL / CRITICAL / HIGH / MEDIUM / LOW
  <Select> status:   ALL / OPEN / MONITORING / RESOLVED
  <Input> search placeholder={t("incidents.searchPlaceholder")}
  <Button variant="ghost"> Reset

OpsCard (wraps table)
  <Table>
    <TableHeader> Severity | Title | Station | Status | Reporter | Time | Actions
    <TableBody> stagger animation, staggerChildren: 0.04
  Pagination (page/totalPages)

Create/Edit Dialog
Resolve AlertDialog
Delete AlertDialog
```

### Severity badge component (inline, no new file)

```tsx
const SEVERITY_COLORS = {
  CRITICAL: { text: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  HIGH:     { text: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
  MEDIUM:   { text: "#eab308", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.3)" },
  LOW:      { text: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)" },
};

// Render:
<span
  className="font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide"
  style={{ color: c.text, background: c.bg, borderColor: c.border }}
>
  {severity}
</span>
```

### Status badge (inline)

```tsx
const STATUS_COLORS = {
  OPEN:       { text: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)" },
  MONITORING: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  RESOLVED:   { text: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)" },
};
```

### Create/Edit dialog fields

```
title*        <Input id="title" />
description   <Textarea id="description" rows={3} />
severity*     <Select> CRITICAL / HIGH / MEDIUM / LOW
stationId     <Select> "System-wide" (value="") + station options from usePublicStations()
```

### Resolve action

```
Resolve button: <CheckCircle className="h-4 w-4" /> (admin only)
AlertDialog title: t("incidents.confirmResolve")
AlertDialog description: t("incidents.resolveWarning")
On confirm → PATCH /api/incidents/:id/resolve
Toast: t("incidents.resolved")
```

### Skeleton & empty state

- Loading: `<SkeletonTable rows={6} columns={7} />`
- Empty: centered `AlertTriangle` icon + `t("incidents.noIncidents")`

---

## 6. Dashboard Integration

### `GET /api/dashboard/stats` — new field

```typescript
// DashboardStats type addition
openIncidents: number   // count WHERE status IN ('OPEN','MONITORING')
```

Backend: add `prisma.incident.count({ where: { status: { in: ["OPEN","MONITORING"] } } })` to dashboard service.

### Stat card

Replace or add after existing 6 cards. New card (7th):

```typescript
{
  title: t("dashboard.openIncidents"),
  value: stats.openIncidents,
  icon: AlertTriangle,
  accent: stats.openIncidents > 0 ? "#ef4444" : ACCENT_COLORS[0],
}
```

When `openIncidents > 0`, render pulsing LED dot (animate-ping pair) next to the value in red. When 0, render normal green LED dot.

### SSE query invalidation in Dashboard

```typescript
// In DashboardPage — useRealtimeNotifications usage
// Add: invalidate ["dashboard-stats"] on incident.* events
```

---

## 7. OperationsStatusBanner CRITICAL Override

### `GET /api/public/system-status` — updated logic

```typescript
// Current: derive from station/schedule ratios
// New: check incidents first

const criticalOpen = await prisma.incident.count({
  where: { status: { in: ["OPEN","MONITORING"] }, severity: "CRITICAL" },
});
const anyOpen = await prisma.incident.count({
  where: { status: { in: ["OPEN","MONITORING"] } },
});

let status: OperationsStatus;
if (criticalOpen > 0) {
  status = "INCIDENT";
} else if (anyOpen > 0 || maintenanceRatio > threshold || cancelledRatio > threshold) {
  status = "DEGRADED";
} else {
  status = "ACTIVE";
}
```

### Banner metadata

Add `openIncidents: number` to `SystemStatusData` type. Display in right side of banner:

```tsx
{data.openIncidents > 0 && (
  <span>
    <span className="text-[#ef4444] font-semibold">{data.openIncidents}</span>{" "}
    incident{data.openIncidents !== 1 ? "s" : ""}
  </span>
)}
```

---

## 8. i18n Keys

### `en.json` additions

```json
"nav": {
  "incidents": "Incidents"
},
"incidents": {
  "title": "Incidents",
  "subtitle": "Operational incident tracking",
  "reportIncident": "Report Incident",
  "searchPlaceholder": "Search incidents...",
  "editIncident": "Edit Incident",
  "createIncident": "Report Incident",
  "noIncidents": "No incidents found",
  "confirmResolve": "Resolve Incident",
  "resolveWarning": "This will mark the incident as resolved and record the timestamp.",
  "resolved": "Incident resolved",
  "created": "Incident reported",
  "updated": "Incident updated",
  "deleted": "Incident deleted",
  "confirmDelete": "Delete Incident",
  "deleteWarning": "This will permanently delete the incident record.",
  "severity": "Severity",
  "status": "Status",
  "station": "Station",
  "systemWide": "System-wide",
  "reporter": "Reporter"
},
"dashboard": {
  "openIncidents": "Open Incidents"
}
```

### `id.json` — same keys in Indonesian

```json
"nav": { "incidents": "Insiden" },
"incidents": {
  "title": "Insiden",
  "subtitle": "Pelacakan insiden operasional",
  "reportIncident": "Laporkan Insiden",
  "searchPlaceholder": "Cari insiden...",
  "editIncident": "Edit Insiden",
  "createIncident": "Laporkan Insiden",
  "noIncidents": "Tidak ada insiden",
  "confirmResolve": "Selesaikan Insiden",
  "resolveWarning": "Ini akan menandai insiden sebagai selesai dan mencatat waktu penyelesaian.",
  "resolved": "Insiden diselesaikan",
  "created": "Insiden dilaporkan",
  "updated": "Insiden diperbarui",
  "deleted": "Insiden dihapus",
  "confirmDelete": "Hapus Insiden",
  "deleteWarning": "Ini akan menghapus catatan insiden secara permanen.",
  "severity": "Tingkat Keparahan",
  "status": "Status",
  "station": "Stasiun",
  "systemWide": "Seluruh Sistem",
  "reporter": "Pelapor"
},
"dashboard": { "openIncidents": "Insiden Terbuka" }
```

---

## 9. E2E Tests (6 scenarios)

File: `e2e/incidents.spec.ts`

```
1. Navigate to /incidents — page loads, table visible, "Report Incident" button present
2. Create incident — fill title + severity, submit, row appears in table
3. Edit incident — open edit dialog, change severity, save, row reflects update
4. Resolve incident — click Resolve, confirm AlertDialog, row shows RESOLVED badge
5. Delete incident — click Delete, confirm, row disappears from table
6. Filter by severity — select CRITICAL from severity filter, only CRITICAL rows visible
```

All tests use `adminPage` fixture (admin storageState). Tests 3–5 require an existing incident — create one in `beforeAll` or reuse from test 2 via search.

---

## 10. Edge Cases

| Scenario | Handling |
|----------|----------|
| Station deleted, incident references it | `onDelete: SetNull` → `stationId=null` → shows "System-wide" |
| CRITICAL incident + DEGRADED from ratios | CRITICAL wins — forces "INCIDENT" status |
| Operator tries to resolve | Backend: `adminMiddleware` returns 403. Frontend: button hidden via `can("incidents.resolve")` |
| Concurrent resolve + edit | Prisma atomic PATCH; `resolvedAt` only set by `/resolve` endpoint |
| `openIncidents` query performance | Index on `status` column; single count query |
| Empty incident list | Empty state with icon + message, not broken table |
| Incident with very long title | Truncate at ~40ch with `truncate` class |

---

## 11. Version & Swagger

- Swagger version: `2.18.0`
- New Swagger tag: `Incidents`
- New schemas: `IncidentSeverity`, `IncidentStatus`, `Incident`, `CreateIncidentRequest`, `UpdateIncidentRequest`
- `DashboardStats` schema: add `openIncidents: integer`
- `SystemStatus` schema: add `openIncidents: integer`

---

## 12. Version Bump Files

1. `backend/package.json` → `2.18.0`
2. `frontend/package.json` → `2.18.0`
3. `backend/src/config/swagger.ts` → version `2.18.0`
4. `frontend/src/pages/ChangelogPage.tsx` → new entry `v2.18.0`
5. `README.md` → version badge + What's New
6. GitHub Release → `gh release create v2.18.0`
