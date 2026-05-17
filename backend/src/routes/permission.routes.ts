import { Router } from "express";
import { permissionController } from "../controllers/permission.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const permissionRouter = Router();

/**
 * @swagger
 * /permissions/me:
 *   get:
 *     summary: Get current user's permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permission names for the current user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["stations.view", "schedules.view", "dashboard.view"]
 *       401:
 *         description: Unauthorized
 */
permissionRouter.get(
  "/me",
  authMiddleware,
  permissionController.getMyPermissions,
);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions with role assignments (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All permissions with their role assignments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
permissionRouter.get(
  "/",
  authMiddleware,
  adminMiddleware,
  permissionController.getAllPermissions,
);
