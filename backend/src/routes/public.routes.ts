import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const publicRouter = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /public/stations:
 *   get:
 *     tags: [Public]
 *     summary: Get station list for route visualization (no auth required)
 *     description: Returns active stations ordered by route position. Used for login page diagram.
 *     responses:
 *       200:
 *         description: Active stations in route order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       code: { type: string }
 *                       order: { type: number }
 *                       status: { type: string }
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

export { publicRouter };
