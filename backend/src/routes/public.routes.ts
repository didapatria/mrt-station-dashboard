import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const publicRouter = Router();
const prisma = new PrismaClient();

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

export { publicRouter };
