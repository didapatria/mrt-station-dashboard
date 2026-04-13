import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();
export const exportRouter = Router();

exportRouter.use(authMiddleware);

/**
 * @swagger
 * /export/stations:
 *   get:
 *     tags: [Export]
 *     summary: Export stations as CSV
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
exportRouter.get("/stations", async (_req: Request, res: Response) => {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { order: "asc" },
    });

    const header = "Code,Name,Location,Status,Order,Latitude,Longitude\n";
    const rows = stations
      .map(
        (s) =>
          `${s.code},"${s.name}","${s.location}",${s.status},${s.order},${s.latitude ?? ""},${s.longitude ?? ""}`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mrt-stations.csv"
    );
    res.send(header + rows);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Export failed";
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * @swagger
 * /export/schedules:
 *   get:
 *     tags: [Export]
 *     summary: Export schedules as CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dayType
 *         schema: { type: string, enum: [WEEKDAY, WEEKEND, HOLIDAY] }
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
exportRouter.get("/schedules", async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.dayType) {
      where.dayType = req.query.dayType;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { departureTime: "asc" },
      include: {
        departureStation: { select: { name: true, code: true } },
        arrivalStation: { select: { name: true, code: true } },
      },
    });

    const header =
      "Train Number,Departure Station,Arrival Station,Departure Time,Arrival Time,Day Type,Status\n";
    const rows = schedules
      .map(
        (s) =>
          `${s.trainNumber},"${s.departureStation.name} (${s.departureStation.code})","${s.arrivalStation.name} (${s.arrivalStation.code})",${s.departureTime},${s.arrivalTime},${s.dayType},${s.status}`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mrt-schedules.csv"
    );
    res.send(header + rows);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Export failed";
    res.status(500).json({ success: false, error: message });
  }
});
