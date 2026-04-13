import { Router } from "express";
import { activityLogController } from "../controllers/activity-log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const activityLogRouter = Router();

activityLogRouter.use(authMiddleware);

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     tags: [Activity]
 *     summary: Get activity logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: entity
 *         schema: { type: string, enum: [Station, Schedule] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of activity logs
 *       401:
 *         description: Unauthorized
 */
activityLogRouter.get("/", activityLogController.getAll);
