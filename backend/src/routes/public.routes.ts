import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const publicRouter = Router();
const prisma = new PrismaClient();

type OperationsStatus = "ACTIVE" | "DEGRADED" | "INCIDENT";

/**
 * @swagger
 * /public/stations:
 *   get:
 *     tags: [Public]
 *     summary: List active stations (no authentication required)
 *     description: |
 *       Returns all ACTIVE stations sorted by route order (`order ASC`).
 *       Exposes only public-safe fields: id, name, code, order, status.
 *       Internal coordinates, audit timestamps, and admin metadata are excluded.
 *
 *       **Auth:** None — safe to call from unauthenticated pages.
 *       **Cache:** `Cache-Control: public, max-age=300`
 *       **Use case:** Login page route diagram, public transit displays.
 *     security: []
 *     responses:
 *       200:
 *         description: Active stations in route order
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: public, max-age=300
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicStation'
 *             example:
 *               success: true
 *               data:
 *                 - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   name: "Lebak Bulus Bank Syariah Indonesia"
 *                   code: "LBB"
 *                   order: 1
 *                   status: "ACTIVE"
 *                 - id: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                   name: "Fatmawati Indomaret"
 *                   code: "FTM"
 *                   order: 2
 *                   status: "ACTIVE"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to fetch stations
 */
publicRouter.get("/stations", async (_req, res) => {
  try {
    const stations = await prisma.station.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        order: true,
        status: true,
      },
    });

    res.set("Cache-Control", "public, max-age=300");
    res.json({ success: true, data: stations });
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch stations" });
  }
});

/**
 * @swagger
 * /public/system-status:
 *   get:
 *     tags: [Public, Realtime]
 *     summary: Current operational status (no auth)
 *     description: |
 *       Returns system status derived from live DB stats.
 *       - **ACTIVE** — normal operations
 *       - **DEGRADED** — >20% stations in maintenance OR >10% schedules cancelled
 *       - **INCIDENT** — >30% schedules cancelled
 *
 *       **Cache:** `Cache-Control: public, max-age=60`
 *     security: []
 *     responses:
 *       200:
 *         description: System status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemStatus'
 *             example:
 *               success: true
 *               data:
 *                 status: ACTIVE
 *                 maintenanceStations: 1
 *                 totalStations: 13
 *                 cancelledSchedules: 0
 *                 totalSchedules: 24
 *                 checkedAt: "2026-05-23T10:00:00.000Z"
 *       500:
 *         description: Internal server error
 */
publicRouter.get("/system-status", async (_req, res) => {
  try {
    const [stationGroups, scheduleGroups] = await Promise.all([
      prisma.station.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.schedule.groupBy({ by: ["status"], _count: { status: true } }),
    ]);

    const stationMap = Object.fromEntries(
      stationGroups.map((g) => [g.status, g._count.status]),
    );
    const scheduleMap = Object.fromEntries(
      scheduleGroups.map((g) => [g.status, g._count.status]),
    );

    const totalStations = Object.values(stationMap).reduce((a, b) => a + b, 0);
    const maintenanceStations = stationMap["MAINTENANCE"] ?? 0;
    const totalSchedules = Object.values(scheduleMap).reduce((a, b) => a + b, 0);
    const cancelledSchedules = scheduleMap["CANCELLED"] ?? 0;

    const maintenanceRatio = totalStations > 0 ? maintenanceStations / totalStations : 0;
    const cancelledRatio = totalSchedules > 0 ? cancelledSchedules / totalSchedules : 0;

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

    res.set("Cache-Control", "public, max-age=60");
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
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch system status" });
  }
});

export { publicRouter };
