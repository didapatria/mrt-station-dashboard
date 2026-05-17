import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/DashboardStats' }
 */
dashboardRouter.get("/stats", dashboardController.getStats);

/**
 * @swagger
 * /dashboard/stations-summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get station status summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stations with status
 */
dashboardRouter.get("/stations-summary", dashboardController.getStationSummary);

/**
 * @swagger
 * /dashboard/schedules-by-hour:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get weekday schedule distribution by hour
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedule count per hour
 */
dashboardRouter.get(
  "/schedules-by-hour",
  dashboardController.getSchedulesByHour,
);
