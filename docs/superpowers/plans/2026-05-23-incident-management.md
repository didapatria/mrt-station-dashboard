# Incident Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full incident lifecycle management (CRUD + resolve) with SSE real-time events, Dashboard stat card, OperationsStatusBanner CRITICAL override, and 6 Playwright E2E tests.

**Architecture:** Standard backend pattern (validator → service → controller → route) mirrors existing stations/schedules. Frontend follows TanStack Query + service layer + lazy-loaded page pattern with Framer Motion stagger. SSE event types added to existing `sseService`; frontend `useRealtimeNotifications` extended with 3 new listeners.

**Tech Stack:** Express 5 + Prisma + PostgreSQL (backend); React 19 + TanStack Query + Zustand + Framer Motion + Shadcn UI + react-i18next (frontend); Playwright (E2E).

**Spec:** `docs/superpowers/specs/2026-05-23-incident-management-design.md`

---

## File Map

### Create (new files)
- `backend/src/validators/incident.validator.ts` — Zod schemas + inferred types
- `backend/src/services/incident.service.ts` — CRUD + resolve business logic
- `backend/src/controllers/incident.controller.ts` — HTTP handlers
- `backend/src/routes/incident.routes.ts` — Express routes + Swagger JSDoc
- `frontend/src/services/incident.service.ts` — Axios API layer
- `frontend/src/hooks/use-incidents.ts` — TanStack Query hooks + mutations
- `frontend/src/pages/IncidentsPage.tsx` — Full page component
- `e2e/incidents.spec.ts` — 6 Playwright tests

### Modify (existing files)
- `backend/src/prisma/schema.prisma` — add enums + Incident model + relations on Station/User
- `backend/src/prisma/seed.ts` — add 5 incidents + 5 incident permissions
- `backend/src/services/sse.service.ts` — extend SseEventType union
- `backend/src/services/dashboard.service.ts` — add `openIncidents` to getStats
- `backend/src/routes/public.routes.ts` — incident-based CRITICAL override in system-status
- `backend/src/index.ts` — register incidentRouter
- `backend/src/config/swagger.ts` — Incidents tag + 5 schemas + bump to 2.18.0
- `frontend/src/types/index.ts` — Incident interface + enums + update SystemStatusData + DashboardStats
- `frontend/src/services/dashboard.service.ts` — add openIncidents to DashboardStats interface
- `frontend/src/hooks/use-sse.ts` — add 3 incident event listeners
- `frontend/src/i18n/locales/en.json` — incidents section + nav.incidents + dashboard.openIncidents
- `frontend/src/i18n/locales/id.json` — same in Indonesian
- `frontend/src/layouts/DashboardLayout.tsx` — add /incidents nav item (operations group)
- `frontend/src/App.tsx` — lazy import + Route for /incidents
- `frontend/src/pages/DashboardPage.tsx` — 7th stat card + SSE invalidation for incidents
- `frontend/src/components/OperationsStatusBanner.tsx` — openIncidents display + type update
- `frontend/src/pages/ChangelogPage.tsx` — v2.18.0 entry
- `backend/package.json` — version → 2.18.0
- `frontend/package.json` — version → 2.18.0

---

## Task 1: Prisma Schema + Migration + Seed

**Files:**
- Modify: `backend/src/prisma/schema.prisma`
- Modify: `backend/src/prisma/seed.ts`

- [ ] **Step 1: Add enums and Incident model to schema.prisma**

Add after the `DayType` enum (around line 27):

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
```

Add after the `Schedule` model:

```prisma
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

Add relations on existing models:

```prisma
// On Station model — add after arrivalSchedules field:
incidents Incident[]

// On User model — add after feedbacks field:
incidents Incident[]
```

- [ ] **Step 2: Run migration**

```bash
cd backend
npx prisma migrate dev --name add-incidents
```

Expected: `✓ Generated Prisma Client` with no errors. Migration file created in `backend/src/prisma/migrations/`.

- [ ] **Step 3: Add incidents seed data to seed.ts**

In `backend/src/prisma/seed.ts`, after the schedules seeding block and before permissions seeding, add:

```typescript
// Seed incidents
const incidentSeedData = [
  { title: "Signal failure at Bundaran HI", severity: "CRITICAL" as const, status: "OPEN" as const, stationCode: "BHI" },
  { title: "Platform overcrowding — weekend peak", severity: "HIGH" as const, status: "MONITORING" as const, stationCode: "IST" },
  { title: "Escalator maintenance delay", severity: "MEDIUM" as const, status: "MONITORING" as const, stationCode: "BLM" },
  { title: "Ticketing system slowdown", severity: "LOW" as const, status: "RESOLVED" as const, stationCode: null },
  { title: "Track inspection — North segment", severity: "HIGH" as const, status: "OPEN" as const, stationCode: null },
];

for (const inc of incidentSeedData) {
  const station = inc.stationCode
    ? await prisma.station.findUnique({ where: { code: inc.stationCode } })
    : null;
  await prisma.incident.create({
    data: {
      title: inc.title,
      severity: inc.severity,
      status: inc.status,
      stationId: station?.id ?? null,
      reportedById: admin.id,
      resolvedAt: inc.status === "RESOLVED" ? new Date() : null,
    },
  });
}
console.log("Seeded incidents:", incidentSeedData.length);
```

- [ ] **Step 4: Add incident permissions to permissionsData array in seed.ts**

Find the `permissionsData` array (around line 267) and add after the last existing entry:

```typescript
{ name: "incidents.view",    label: "View Incidents",    group: "Incidents" },
{ name: "incidents.create",  label: "Create Incidents",  group: "Incidents" },
{ name: "incidents.edit",    label: "Edit Incidents",    group: "Incidents" },
{ name: "incidents.resolve", label: "Resolve Incidents", group: "Incidents" },
{ name: "incidents.delete",  label: "Delete Incidents",  group: "Incidents" },
```

Find the `operatorPermNames` array (around line 360 — the list of perms the OPERATOR role gets) and add:

```typescript
"incidents.view",
"incidents.create",
```

(ADMIN already gets all permissions via `adminPermNames = permissionsData.map(p => p.name)`)

- [ ] **Step 5: Verify seed compiles**

```bash
cd backend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add backend/src/prisma/schema.prisma backend/src/prisma/seed.ts backend/src/prisma/migrations/
git commit -m "feat(backend): add Incident model, enums, migration, seed data"
```

---

## Task 2: Backend Validator, Service, Controller, Routes

**Files:**
- Create: `backend/src/validators/incident.validator.ts`
- Create: `backend/src/services/incident.service.ts`
- Create: `backend/src/controllers/incident.controller.ts`
- Create: `backend/src/routes/incident.routes.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create validator**

Create `backend/src/validators/incident.validator.ts`:

```typescript
import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  stationId: z.string().uuid().optional().nullable(),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["OPEN", "MONITORING", "RESOLVED"]).optional(),
  stationId: z.string().uuid().optional().nullable(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
```

- [ ] **Step 2: Create service**

Create `backend/src/services/incident.service.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { CreateIncidentInput, UpdateIncidentInput } from "../validators/incident.validator";

const prisma = new PrismaClient();

const incidentSelect = {
  id: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  stationId: true,
  reportedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  station: { select: { id: true, name: true, code: true } },
  reportedBy: { select: { id: true, name: true } },
} as const;

export const incidentService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    severity?: string;
    stationId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }
    if (params.status) where.status = params.status;
    if (params.severity) where.severity = params.severity;
    if (params.stationId) where.stationId = params.stationId;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        select: incidentSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(data: CreateIncidentInput, reportedById: string) {
    return prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        stationId: data.stationId ?? null,
        reportedById,
      },
      select: incidentSelect,
    });
  },

  async update(id: string, data: UpdateIncidentInput) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    return prisma.incident.update({
      where: { id },
      data,
      select: incidentSelect,
    });
  },

  async resolve(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    return prisma.incident.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
      select: incidentSelect,
    });
  },

  async delete(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    await prisma.incident.delete({ where: { id } });
  },
};
```

- [ ] **Step 3: Create controller**

Create `backend/src/controllers/incident.controller.ts`:

```typescript
import { Response } from "express";
import { incidentService } from "../services/incident.service";
import { activityLogService } from "../services/activity-log.service";
import { sseService } from "../services/sse.service";
import { AuthRequest } from "../types";

export const incidentController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, severity, stationId } = req.query;
      const result = await incidentService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        severity: severity as string,
        stationId: stationId as string,
      });
      res.json({ success: true, data: result.incidents, meta: result.meta });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch incidents";
      res.status(500).json({ success: false, error: message });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.create(req.body, req.user!.userId);
      await activityLogService.log(
        req.user!.userId,
        "CREATE",
        "Incident",
        incident.id,
        `Reported incident: ${incident.title}`,
      );
      sseService.broadcast("incident.created", incident);
      res.status(201).json({ success: true, message: "Incident reported", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create incident";
      res.status(500).json({ success: false, error: message });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.update(req.params.id, req.body);
      await activityLogService.log(
        req.user!.userId,
        "UPDATE",
        "Incident",
        incident.id,
        `Updated incident: ${incident.title}`,
      );
      sseService.broadcast("incident.updated", incident);
      res.json({ success: true, message: "Incident updated", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async resolve(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.resolve(req.params.id);
      await activityLogService.log(
        req.user!.userId,
        "UPDATE",
        "Incident",
        incident.id,
        `Resolved incident: ${incident.title}`,
      );
      sseService.broadcast("incident.resolved", incident);
      res.json({ success: true, message: "Incident resolved", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await incidentService.delete(req.params.id);
      await activityLogService.log(
        req.user!.userId,
        "DELETE",
        "Incident",
        req.params.id,
        `Deleted incident`,
      );
      sseService.broadcast("incident.updated", { id: req.params.id, action: "DELETE" });
      res.json({ success: true, message: "Incident deleted" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },
};
```

- [ ] **Step 4: Create routes file**

Create `backend/src/routes/incident.routes.ts`:

```typescript
import { Router } from "express";
import { incidentController } from "../controllers/incident.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createIncidentSchema, updateIncidentSchema } from "../validators/incident.validator";

export const incidentRouter = Router();

incidentRouter.use(authMiddleware);

/**
 * @swagger
 * /incidents:
 *   get:
 *     tags: [Incidents]
 *     summary: Get all incidents (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, MONITORING, RESOLVED] }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [CRITICAL, HIGH, MEDIUM, LOW] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Incident' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
incidentRouter.get("/", incidentController.getAll);

/**
 * @swagger
 * /incidents:
 *   post:
 *     tags: [Incidents]
 *     summary: Report a new incident
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateIncidentRequest' }
 *     responses:
 *       201:
 *         description: Incident created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Incident' }
 */
incidentRouter.post("/", validate(createIncidentSchema), incidentController.create);

/**
 * @swagger
 * /incidents/{id}:
 *   patch:
 *     tags: [Incidents]
 *     summary: Update an incident (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateIncidentRequest' }
 *     responses:
 *       200:
 *         description: Incident updated
 *       404:
 *         description: Incident not found
 */
incidentRouter.patch("/:id", adminMiddleware, validate(updateIncidentSchema), incidentController.update);

/**
 * @swagger
 * /incidents/{id}/resolve:
 *   patch:
 *     tags: [Incidents]
 *     summary: Resolve an incident (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incident resolved
 *       404:
 *         description: Incident not found
 */
incidentRouter.patch("/:id/resolve", adminMiddleware, incidentController.resolve);

/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     tags: [Incidents]
 *     summary: Delete an incident (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incident deleted
 *       404:
 *         description: Incident not found
 */
incidentRouter.delete("/:id", adminMiddleware, incidentController.delete);
```

- [ ] **Step 5: Register route in index.ts**

Find `backend/src/index.ts` where other routers are registered (look for `app.use("/api/stations", stationRouter)` pattern) and add:

```typescript
import { incidentRouter } from "./routes/incident.routes";
// ...
app.use("/api/incidents", incidentRouter);
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd backend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add backend/src/validators/incident.validator.ts backend/src/services/incident.service.ts backend/src/controllers/incident.controller.ts backend/src/routes/incident.routes.ts backend/src/index.ts
git commit -m "feat(backend): add incident CRUD endpoints (validator, service, controller, routes)"
```

---

## Task 3: SSE Integration

**Files:**
- Modify: `backend/src/services/sse.service.ts`

- [ ] **Step 1: Extend SseEventType union**

In `backend/src/services/sse.service.ts`, find the `SseEventType` union (line 3) and replace it:

```typescript
export type SseEventType =
  | "activity"
  | "station.updated"
  | "schedule.updated"
  | "incident.created"
  | "incident.updated"
  | "incident.resolved"
  | "ping";
```

- [ ] **Step 2: Verify TypeScript (incident.controller.ts already uses these types)**

```bash
cd backend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/sse.service.ts
git commit -m "feat(backend): extend SSE event types for incident lifecycle"
```

---

## Task 4: Swagger — Incidents Tag + Schemas + Version Bump

**Files:**
- Modify: `backend/src/config/swagger.ts`

- [ ] **Step 1: Add Incidents tag**

Find the `tags` array and add:

```typescript
{ name: "Incidents", description: "Incident management" },
```

- [ ] **Step 2: Add schemas**

Find the `schemas` object inside `components` and add after the existing `FeedbackRequest` schema:

```typescript
IncidentSeverity: {
  type: "string",
  enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
},
IncidentStatus: {
  type: "string",
  enum: ["OPEN", "MONITORING", "RESOLVED"],
},
Incident: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", example: "Signal failure at Bundaran HI" },
    description: { type: "string", nullable: true },
    severity: { $ref: "#/components/schemas/IncidentSeverity" },
    status: { $ref: "#/components/schemas/IncidentStatus" },
    stationId: { type: "string", format: "uuid", nullable: true },
    reportedById: { type: "string", format: "uuid" },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    station: {
      nullable: true,
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        code: { type: "string" },
      },
    },
    reportedBy: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
      },
    },
  },
},
CreateIncidentRequest: {
  type: "object",
  required: ["title", "severity"],
  properties: {
    title: { type: "string", example: "Platform overcrowding" },
    description: { type: "string" },
    severity: { $ref: "#/components/schemas/IncidentSeverity" },
    stationId: { type: "string", format: "uuid", nullable: true },
  },
},
UpdateIncidentRequest: {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    severity: { $ref: "#/components/schemas/IncidentSeverity" },
    status: { $ref: "#/components/schemas/IncidentStatus" },
    stationId: { type: "string", format: "uuid", nullable: true },
  },
},
```

- [ ] **Step 3: Update DashboardStats schema to include openIncidents**

Find `DashboardStats` in schemas and add:

```typescript
openIncidents: { type: "integer", example: 2 },
```

- [ ] **Step 4: Update SystemStatus schema to include openIncidents**

Find `SystemStatus` in schemas and add:

```typescript
openIncidents: { type: "integer", example: 2 },
```

- [ ] **Step 5: Bump version to 2.18.0**

Find `version: "2.17.0"` and change to `version: "2.18.0"`.

Also update the description string — find `"14 pages, 112 E2E tests"` and update to `"15 pages, 121 E2E tests"`.

- [ ] **Step 6: Verify TypeScript**

```bash
cd backend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add backend/src/config/swagger.ts
git commit -m "feat(backend): Swagger 2.18.0 — Incidents tag, schemas, openIncidents fields"
```

---

## Task 5: Dashboard Service + system-status CRITICAL Override

**Files:**
- Modify: `backend/src/services/dashboard.service.ts`
- Modify: `backend/src/routes/public.routes.ts`

- [ ] **Step 1: Add openIncidents to dashboard stats**

In `backend/src/services/dashboard.service.ts`, find the `Promise.all` array in `getStats()` and add `openIncidents` as the 10th item:

```typescript
const [
  totalStations,
  activeStations,
  maintenanceStations,
  inactiveStations,
  totalSchedules,
  activeSchedules,
  delayedSchedules,
  cancelledSchedules,
  totalUsers,
  openIncidents,
] = await Promise.all([
  prisma.station.count(),
  prisma.station.count({ where: { status: "ACTIVE" } }),
  prisma.station.count({ where: { status: "MAINTENANCE" } }),
  prisma.station.count({ where: { status: "INACTIVE" } }),
  prisma.schedule.count(),
  prisma.schedule.count({ where: { status: "ACTIVE" } }),
  prisma.schedule.count({ where: { status: "DELAYED" } }),
  prisma.schedule.count({ where: { status: "CANCELLED" } }),
  prisma.user.count(),
  prisma.incident.count({ where: { status: { in: ["OPEN", "MONITORING"] } } }),
]);

return {
  totalStations,
  activeStations,
  maintenanceStations,
  inactiveStations,
  totalSchedules,
  activeSchedules,
  delayedSchedules,
  cancelledSchedules,
  totalUsers,
  openIncidents,
};
```

- [ ] **Step 2: Add incident CRITICAL override to system-status endpoint**

In `backend/src/routes/public.routes.ts`, find the `publicRouter.get("/system-status", ...)` handler. Replace the existing status derivation logic:

```typescript
// Replace this block:
//   let status: OperationsStatus = "ACTIVE";
//   if (cancelledRatio > 0.3) status = "INCIDENT";
//   else if (maintenanceRatio > 0.2 || cancelledRatio > 0.1) status = "DEGRADED";

// With:
const [criticalOpen, anyOpen] = await Promise.all([
  prisma.incident.count({
    where: { status: { in: ["OPEN", "MONITORING"] }, severity: "CRITICAL" },
  }),
  prisma.incident.count({
    where: { status: { in: ["OPEN", "MONITORING"] } },
  }),
]);

let status: OperationsStatus = "ACTIVE";
if (criticalOpen > 0) {
  status = "INCIDENT";
} else if (anyOpen > 0 || cancelledRatio > 0.3 || maintenanceRatio > 0.2 || cancelledRatio > 0.1) {
  status = "DEGRADED";
}
```

Also add `openIncidents: anyOpen` to the response data object:

```typescript
res.json({
  success: true,
  data: {
    status,
    maintenanceStations,
    totalStations,
    cancelledSchedules,
    totalSchedules,
    openIncidents: anyOpen,
    checkedAt: new Date().toISOString(),
  },
});
```

Note: `prisma` is already imported at the top of `public.routes.ts`.

- [ ] **Step 3: Verify TypeScript**

```bash
cd backend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/dashboard.service.ts backend/src/routes/public.routes.ts
git commit -m "feat(backend): add openIncidents to dashboard stats + CRITICAL override in system-status"
```

---

## Task 6: Frontend Types + i18n + Routing

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/services/dashboard.service.ts`
- Modify: `frontend/src/i18n/locales/en.json`
- Modify: `frontend/src/i18n/locales/id.json`
- Modify: `frontend/src/layouts/DashboardLayout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add Incident types to types/index.ts**

Add after the `SystemStatusData` interface:

```typescript
export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "OPEN" | "MONITORING" | "RESOLVED";

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  stationId?: string | null;
  reportedById: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  station?: { id: string; name: string; code: string } | null;
  reportedBy: { id: string; name: string };
}
```

Also add `openIncidents: number` to `SystemStatusData`:

```typescript
export interface SystemStatusData {
  status: OperationsStatus;
  maintenanceStations: number;
  totalStations: number;
  cancelledSchedules: number;
  totalSchedules: number;
  openIncidents: number;   // ← add this
  checkedAt: string;
}
```

- [ ] **Step 2: Update DashboardStats in dashboard.service.ts**

In `frontend/src/services/dashboard.service.ts`, add `openIncidents` to the `DashboardStats` interface:

```typescript
export interface DashboardStats {
  totalStations: number;
  activeStations: number;
  maintenanceStations: number;
  inactiveStations: number;
  totalSchedules: number;
  activeSchedules: number;
  delayedSchedules: number;
  cancelledSchedules: number;
  totalUsers: number;
  openIncidents: number;   // ← add this
}
```

- [ ] **Step 3: Add i18n keys to en.json**

In `frontend/src/i18n/locales/en.json`, add to the `"nav"` object:

```json
"incidents": "Incidents"
```

Add a new top-level `"incidents"` object:

```json
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
}
```

Add to the `"dashboard"` object:

```json
"openIncidents": "Open Incidents"
```

- [ ] **Step 4: Add i18n keys to id.json**

In `frontend/src/i18n/locales/id.json`, add to the `"nav"` object:

```json
"incidents": "Insiden"
```

Add a new top-level `"incidents"` object:

```json
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
}
```

Add to the `"dashboard"` object:

```json
"openIncidents": "Insiden Terbuka"
```

- [ ] **Step 5: Add /incidents nav item to DashboardLayout.tsx**

In `frontend/src/layouts/DashboardLayout.tsx`, find the `AlertTriangle` import (or add it to the existing Lucide imports). Then find the operations `navGroups` array (around line 87) — the operations group entry — and add after the `/command` nav item:

```typescript
{ to: "/incidents", icon: AlertTriangle, labelKey: "nav.incidents" },
```

Make sure `AlertTriangle` is imported from `lucide-react`.

- [ ] **Step 6: Add lazy import and Route in App.tsx**

In `frontend/src/App.tsx`, add after the existing lazy imports (around line 31):

```typescript
const IncidentsPage = lazy(() => import("@/pages/IncidentsPage"));
```

Find the DashboardLayout routes block and add:

```tsx
<Route path="/incidents" element={<IncidentsPage />} />
```

Place it after the `/command` route.

- [ ] **Step 7: Verify TypeScript**

```bash
cd frontend
npm run build 2>&1 | tail -20
```

Expected: Build succeeds (IncidentsPage doesn't exist yet — this will fail, which is OK. Verify no OTHER type errors first by checking the `tsc` output excludes IncidentsPage errors).

Actually just run `npx tsc --noEmit` in frontend at this point:

```bash
cd frontend
npx tsc --noEmit 2>&1 | grep -v "IncidentsPage"
```

Expected: no errors unrelated to the missing IncidentsPage file.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/services/dashboard.service.ts frontend/src/i18n/locales/en.json frontend/src/i18n/locales/id.json frontend/src/layouts/DashboardLayout.tsx frontend/src/App.tsx
git commit -m "feat(frontend): add Incident types, i18n, sidebar nav, routing"
```

---

## Task 7: Frontend Service + Query Hooks + SSE Listeners

**Files:**
- Create: `frontend/src/services/incident.service.ts`
- Create: `frontend/src/hooks/use-incidents.ts`
- Modify: `frontend/src/hooks/use-sse.ts`

- [ ] **Step 1: Create incident service**

Create `frontend/src/services/incident.service.ts`:

```typescript
import api from "./api";
import type { ApiResponse, Incident } from "@/types";

interface GetIncidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  stationId?: string;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  stationId?: string | null;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status?: "OPEN" | "MONITORING" | "RESOLVED";
  stationId?: string | null;
}

export const incidentService = {
  async getAll(params?: GetIncidentsParams) {
    const response = await api.get<ApiResponse<Incident[]>>("/incidents", { params });
    return response.data;
  },

  async create(data: CreateIncidentData) {
    const response = await api.post<ApiResponse<Incident>>("/incidents", data);
    return response.data;
  },

  async update(id: string, data: UpdateIncidentData) {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return response.data;
  },

  async resolve(id: string) {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}/resolve`);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/incidents/${id}`);
    return response.data;
  },
};
```

- [ ] **Step 2: Create TanStack Query hooks**

Create `frontend/src/hooks/use-incidents.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { incidentService, type CreateIncidentData, type UpdateIncidentData } from "@/services/incident.service";

interface IncidentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  stationId?: string;
}

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: IncidentFilters) => [...incidentKeys.lists(), filters] as const,
};

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: async () => {
      const response = await incidentService.getAll(filters);
      return { incidents: response.data ?? [], meta: response.meta ?? null };
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: CreateIncidentData) => incidentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.created"));
    },
    onError: () => toast.error("Failed to report incident"),
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentData }) =>
      incidentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      toast.success(t("incidents.updated"));
    },
    onError: () => toast.error("Failed to update incident"),
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => incidentService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.resolved"));
    },
    onError: () => toast.error("Failed to resolve incident"),
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => incidentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.deleted"));
    },
    onError: () => toast.error("Failed to delete incident"),
  });
}
```

- [ ] **Step 3: Add incident event listeners to use-sse.ts**

In `frontend/src/hooks/use-sse.ts`, find the block with `es.addEventListener("schedule.updated", ...)` and add after it:

```typescript
es.addEventListener("incident.created", () => {
  if (!state.active) return;
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["system-status"] });
  setLastActivityAt(new Date());
});

es.addEventListener("incident.updated", () => {
  if (!state.active) return;
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["system-status"] });
  setLastActivityAt(new Date());
});

es.addEventListener("incident.resolved", () => {
  if (!state.active) return;
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["system-status"] });
  setLastActivityAt(new Date());
});
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd frontend
npx tsc --noEmit 2>&1 | grep -v "IncidentsPage"
```

Expected: no errors (aside from missing IncidentsPage which doesn't exist yet).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/incident.service.ts frontend/src/hooks/use-incidents.ts frontend/src/hooks/use-sse.ts
git commit -m "feat(frontend): incident service, TanStack Query hooks, SSE listeners"
```

---

## Task 8: IncidentsPage — Full Implementation

**Files:**
- Create: `frontend/src/pages/IncidentsPage.tsx`

- [ ] **Step 1: Create the full page**

Create `frontend/src/pages/IncidentsPage.tsx`:

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, AlertTriangle, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { OpsCard } from "@/components/OpsCard";
import { SkeletonTable } from "@/components/Skeleton";
import { usePublicStations } from "@/hooks/use-stations";
import { usePermission } from "@/hooks/use-permission";
import { usePageMeta } from "@/hooks/use-page-meta";
import {
  useIncidents,
  useCreateIncident,
  useUpdateIncident,
  useResolveIncident,
  useDeleteIncident,
} from "@/hooks/use-incidents";
import type { Incident } from "@/types";

const SEVERITY_COLORS = {
  CRITICAL: { text: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  HIGH:     { text: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
  MEDIUM:   { text: "#eab308", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.3)" },
  LOW:      { text: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)" },
} as const;

const STATUS_COLORS = {
  OPEN:       { text: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)" },
  MONITORING: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  RESOLVED:   { text: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)" },
} as const;

function SeverityBadge({ severity }: { severity: keyof typeof SEVERITY_COLORS }) {
  const c = SEVERITY_COLORS[severity];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: keyof typeof STATUS_COLORS }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      {status}
    </span>
  );
}

function formatRelative(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  stationId: z.string().optional(),
});
type FormValues = z.infer<typeof createSchema>;

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const row = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

export default function IncidentsPage() {
  usePageMeta({ title: "Incidents", path: "/incidents" });
  const { t } = useTranslation();
  const { can } = usePermission();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Incident | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);

  const { data, isLoading } = useIncidents({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });

  const { data: stationsData } = usePublicStations();
  const stations = stationsData ?? [];

  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident();
  const resolveMutation = useResolveIncident();
  const deleteMutation = useDeleteIncident();

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", description: "", severity: "MEDIUM", stationId: "" },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", description: "", severity: "MEDIUM", stationId: "" },
  });

  function openEdit(incident: Incident) {
    setEditTarget(incident);
    editForm.reset({
      title: incident.title,
      description: incident.description ?? "",
      severity: incident.severity,
      stationId: incident.stationId ?? "",
    });
  }

  async function handleCreate(values: FormValues) {
    await createMutation.mutateAsync({
      title: values.title,
      description: values.description || undefined,
      severity: values.severity,
      stationId: values.stationId || null,
    });
    setCreateOpen(false);
    form.reset();
  }

  async function handleEdit(values: FormValues) {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: {
        title: values.title,
        description: values.description || undefined,
        severity: values.severity,
        stationId: values.stationId || null,
      },
    });
    setEditTarget(null);
  }

  async function handleResolve() {
    if (!resolveTarget) return;
    await resolveMutation.mutateAsync(resolveTarget.id);
    setResolveTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const incidents = data?.incidents ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("incidents.title")}
        subtitle={t("incidents.subtitle")}
        action={
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            {t("incidents.reportIncident")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs font-mono">
            <SelectValue placeholder={t("incidents.severity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            <SelectItem value="HIGH">HIGH</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs font-mono">
            <SelectValue placeholder={t("incidents.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">OPEN</SelectItem>
            <SelectItem value="MONITORING">MONITORING</SelectItem>
            <SelectItem value="RESOLVED">RESOLVED</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-52 h-8 text-xs"
          placeholder={t("incidents.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        {(search || statusFilter || severityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => { setSearch(""); setStatusFilter(""); setSeverityFilter(""); setPage(1); }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <OpsCard>
        {isLoading ? (
          <SkeletonTable rows={6} columns={7} />
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 opacity-30" />
            <p className="text-sm">{t("incidents.noIncidents")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24">{t("incidents.severity")}</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">{t("common.title", { defaultValue: "Title" })}</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-32">{t("incidents.station")}</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-28">{t("incidents.status")}</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-28">{t("incidents.reporter")}</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24">Time</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <motion.tbody variants={stagger} initial="hidden" animate="show">
              <AnimatePresence>
                {incidents.map((incident) => (
                  <motion.tr
                    key={incident.id}
                    variants={row}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <TableCell><SeverityBadge severity={incident.severity} /></TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm">{incident.title}</TableCell>
                    <TableCell>
                      {incident.station ? (
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {incident.station.code}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("incidents.systemWide")}</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={incident.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{incident.reportedBy.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{formatRelative(incident.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {can("incidents.resolve") && incident.status !== "RESOLVED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Resolve"
                            onClick={() => setResolveTarget(incident)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          </Button>
                        )}
                        {can("incidents.edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Edit"
                            onClick={() => openEdit(incident)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {can("incidents.delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Delete"
                            onClick={() => setDeleteTarget(incident)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </OpsCard>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incidents.createIncident")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="severity" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incidents.severity")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incidents.station")}</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t("incidents.systemWide")} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("incidents.systemWide")}</SelectItem>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Reporting..." : t("incidents.reportIncident")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incidents.editIncident")}</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={editForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="severity" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incidents.severity")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="stationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incidents.station")}</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t("incidents.systemWide")} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("incidents.systemWide")}</SelectItem>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Resolve AlertDialog */}
      <AlertDialog open={!!resolveTarget} onOpenChange={(open) => !open && setResolveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incidents.confirmResolve")}</AlertDialogTitle>
            <AlertDialogDescription>{t("incidents.resolveWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolve} disabled={resolveMutation.isPending}>
              {resolveMutation.isPending ? "Resolving..." : "Resolve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incidents.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("incidents.deleteWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/IncidentsPage.tsx
git commit -m "feat(frontend): IncidentsPage — table, filters, create/edit/resolve/delete dialogs"
```

---

## Task 9: Dashboard Stat Card + SSE Invalidation

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add openIncidents stat card**

In `frontend/src/pages/DashboardPage.tsx`, find the `statCards` array (around line 110). The current 6 cards use `stats.delayedSchedules + stats.maintenanceStations` for the 5th card. Add a 7th card at the end of the array:

```typescript
{
  title: t("dashboard.openIncidents"),
  value: stats.openIncidents,
  icon: AlertTriangle,
  accent: stats.openIncidents > 0 ? "#ef4444" : ACCENT_COLORS[0],
},
```

- [ ] **Step 2: Add pulsing LED indicator for open incidents**

In DashboardPage, find where the stat cards are rendered (look for `.map((card) => ...)` pattern). Inside the card rendering where the `value` number is displayed, add a conditional LED dot next to the value when the card is the openIncidents card. The easiest approach is to find the stat card render loop and add a special case:

In the stat card value display area, the value is rendered with `font-display`. After the value `<span>`, add (within the same card render):

```tsx
{card.title === t("dashboard.openIncidents") && stats.openIncidents > 0 && (
  <span className="relative flex h-2 w-2 ml-1 shrink-0">
    <span
      className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
      style={{ background: "#ef4444" }}
    />
    <span
      className="relative inline-flex h-2 w-2 rounded-full"
      style={{ background: "#ef4444" }}
    />
  </span>
)}
```

Note: Look at how the stat card value is currently rendered in DashboardPage (grep for `font-display` in the file) and add the LED alongside that value display.

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx
git commit -m "feat(frontend): add openIncidents stat card to dashboard with pulsing LED"
```

---

## Task 10: OperationsStatusBanner — openIncidents Display

**Files:**
- Modify: `frontend/src/components/OperationsStatusBanner.tsx`

- [ ] **Step 1: Update Props and display openIncidents**

In `frontend/src/components/OperationsStatusBanner.tsx`, the `Props` interface references `SystemStatusData` which now has `openIncidents`. The `data` prop already carries this field — no type change needed.

Find the right-side metadata section (around line 78 — the flex container with `maintenanceStations` and `cancelledSchedules` counts) and add:

```tsx
{data.openIncidents > 0 && (
  <span>
    <span className="text-[#ef4444] font-semibold">{data.openIncidents}</span>{" "}
    incident{data.openIncidents !== 1 ? "s" : ""}
  </span>
)}
```

Add this before the existing `{data.maintenanceStations > 0 && ...}` block so incidents appear first.

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify frontend builds cleanly**

```bash
cd frontend
npm run build 2>&1 | tail -10
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/OperationsStatusBanner.tsx
git commit -m "feat(frontend): show openIncidents count in OperationsStatusBanner"
```

---

## Task 11: E2E Tests

**Files:**
- Create: `e2e/incidents.spec.ts`

- [ ] **Step 1: Create the E2E spec**

Create `e2e/incidents.spec.ts`:

```typescript
import { test, expect, navigateTo } from "./fixtures/auth";

test.describe("Incidents Page", () => {
  test("should load incidents page with table and report button", async ({
    adminPage: page,
  }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });
    await expect(
      page.getByRole("button", { name: /report incident/i }).first()
    ).toBeVisible();
  });

  test("should create a new incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    const uniqueId = Date.now().toString(36);
    const incidentTitle = `E2E Incident ${uniqueId}`;

    await page.getByRole("button", { name: /report incident/i }).first().click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("input[name='title'], #title").fill(incidentTitle);

    // Select severity
    await dialog.locator("button[role='combobox']").first().click();
    await page.getByRole("option", { name: /high/i }).first().click();

    await dialog.getByRole("button", { name: /report incident/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Verify in table
    await expect(page.locator("tbody")).toContainText(incidentTitle, { timeout: 8000 });
  });

  test("should edit an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Click edit on first incident
    const editBtn = page.locator("tbody tr").first().getByTitle("Edit");
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Change severity to LOW
    await dialog.locator("button[role='combobox']").first().click();
    await page.getByRole("option", { name: /low/i }).first().click();

    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Verify row now shows LOW badge
    await expect(page.locator("tbody tr").first()).toContainText("LOW", { timeout: 5000 });
  });

  test("should resolve an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Find first non-resolved incident
    const resolveBtn = page.locator("tbody tr").filter({ hasNot: page.locator("span:text('RESOLVED')") }).first().getByTitle("Resolve");
    await expect(resolveBtn).toBeVisible({ timeout: 8000 });
    await resolveBtn.click();

    const alertDialog = page.locator("[role='alertdialog']");
    await expect(alertDialog).toBeVisible({ timeout: 5000 });
    await alertDialog.getByRole("button", { name: /resolve/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });

    // Toast or table should reflect RESOLVED
    await expect(page.locator("tbody")).toContainText("RESOLVED", { timeout: 8000 });
  });

  test("should delete an incident", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Get title of first incident before deleting
    const firstRow = page.locator("tbody tr").first();
    const titleText = await firstRow.locator("td").nth(1).textContent();

    const deleteBtn = firstRow.getByTitle("Delete");
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();

    const alertDialog = page.locator("[role='alertdialog']");
    await expect(alertDialog).toBeVisible({ timeout: 5000 });
    await alertDialog.getByRole("button", { name: /delete/i }).click();
    await expect(alertDialog).not.toBeVisible({ timeout: 10000 });

    if (titleText) {
      await expect(page.locator("tbody")).not.toContainText(titleText, { timeout: 8000 });
    }
  });

  test("should filter incidents by severity", async ({ adminPage: page }) => {
    await navigateTo(page, "/incidents");
    await page.waitForTimeout(2000);

    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });

    // Select CRITICAL from severity filter
    const severitySelect = page.locator("button[role='combobox']").first();
    await severitySelect.click();
    await page.getByRole("option", { name: /critical/i }).first().click();

    await page.waitForTimeout(1000);

    // All visible badges should be CRITICAL (or table should be empty)
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count > 0) {
      const badges = page.locator("tbody span").filter({ hasText: "CRITICAL" });
      const badgeCount = await badges.count();
      const nonCritical = page.locator("tbody span").filter({ hasText: /^(HIGH|MEDIUM|LOW)$/ });
      await expect(nonCritical).toHaveCount(0);
    }
  });
});
```

- [ ] **Step 2: Run E2E tests (requires both backend and frontend running)**

```bash
# From project root — backend and frontend must be running
npx playwright test e2e/incidents.spec.ts --reporter=list
```

Expected: 6 tests pass. If any fail due to seed data state, check that `npm run db:fresh:seed` was run and incidents are present.

- [ ] **Step 3: Commit**

```bash
git add e2e/incidents.spec.ts
git commit -m "test(e2e): add 6 incident management E2E tests"
```

---

## Task 12: Changelog Entry

**Files:**
- Modify: `frontend/src/pages/ChangelogPage.tsx`

- [ ] **Step 1: Add v2.18.0 entry at top of changelog array**

In `frontend/src/pages/ChangelogPage.tsx`, find the `const changelog: Release[] = [` line. Insert at the very top of the array (before the v2.17.0 entry):

```typescript
{
  version: "2.18.0",
  date: "23 May 2026",
  commits: [],
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
      category: "chore",
      text: "Version bump to v2.18.0 — swagger, package.json frontend + backend",
    },
  ],
},
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ChangelogPage.tsx
git commit -m "docs: add v2.18.0 changelog entry — Incident Management System"
```

---

## Task 13: Version Bumps

**Files:**
- Modify: `backend/package.json`
- Modify: `frontend/package.json`

- [ ] **Step 1: Bump backend package.json**

In `backend/package.json`, change `"version": "2.17.0"` to `"version": "2.18.0"`.

- [ ] **Step 2: Bump frontend package.json**

In `frontend/package.json`, change `"version": "2.17.0"` to `"version": "2.18.0"`.

(Swagger version was already bumped in Task 4.)

- [ ] **Step 3: Final TypeScript check**

```bash
cd backend && npx tsc --noEmit && echo "backend OK"
cd ../frontend && npx tsc --noEmit && echo "frontend OK"
```

Expected: both print OK.

- [ ] **Step 4: Final build check**

```bash
cd frontend
npm run build 2>&1 | tail -5
```

Expected: `✓ built in Xs`

- [ ] **Step 5: Run full migration + seed**

```bash
cd backend
npm run db:fresh:seed
```

Expected: seed completes, logs include "Seeded incidents: 5" and "Seeded permissions: 22" (17 existing + 5 new).

- [ ] **Step 6: Run E2E suite**

```bash
# From project root — ensure backend (port 3000) and frontend (port 5173) are running
npx playwright test e2e/incidents.spec.ts --reporter=list
```

Expected: 6/6 pass.

- [ ] **Step 7: Final commit**

```bash
git add backend/package.json frontend/package.json
git commit -m "feat: v2.18.0 — Incident Management System (CRUD, SSE events, dashboard stat, E2E)"
```

---

## Self-Review

**Spec coverage check:**
- [x] Incident model + enums + relations (Task 1)
- [x] `onDelete: SetNull` on stationId (Task 1)
- [x] 5 REST endpoints with correct auth (Task 2)
- [x] SSE 3 new event types + broadcast (Task 3)
- [x] Swagger Incidents tag + schemas + version bump (Task 4)
- [x] openIncidents in dashboard stats (Task 5)
- [x] system-status CRITICAL override (Task 5)
- [x] Frontend types (Task 6)
- [x] i18n EN + ID (Task 6)
- [x] Sidebar nav (Task 6)
- [x] App routing (Task 6)
- [x] Service layer (Task 7)
- [x] TanStack Query hooks (Task 7)
- [x] SSE listeners in use-sse.ts (Task 7)
- [x] IncidentsPage — table, filters, severity/status badges (Task 8)
- [x] Create/Edit dialogs with station select from usePublicStations (Task 8)
- [x] Resolve AlertDialog (Task 8)
- [x] Delete AlertDialog (Task 8)
- [x] Framer Motion stagger (staggerChildren: 0.04) (Task 8)
- [x] Skeleton + empty state (Task 8)
- [x] usePermission gates for edit/resolve/delete (Task 8)
- [x] Dashboard stat card 7th entry (Task 9)
- [x] Pulsing LED on openIncidents > 0 (Task 9)
- [x] OperationsStatusBanner openIncidents display (Task 10)
- [x] 6 E2E tests (Task 11)
- [x] Changelog entry (Task 12)
- [x] Version bumps (Task 13)
- [x] 5 incident permissions seeded (Task 1 + Task 6 routing handles permission check)

**Placeholder scan:** None found.

**Type consistency:** `Incident`, `IncidentSeverity`, `IncidentStatus` defined in Task 6 `types/index.ts`, referenced in Tasks 7 and 8. `incidentService` created in Task 7 service file, imported in Task 7 hooks file. `useIncidents` / `useCreateIncident` etc. created in Task 7 hooks, imported in Task 8 page. `DashboardStats.openIncidents` added in Task 6 service, used in Task 9 page. All consistent.
