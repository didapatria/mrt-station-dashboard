import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const userRouter = Router();

userRouter.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (Admin only)
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
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, OPERATOR] }
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
userRouter.get("/", userController.getAll);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [ADMIN, OPERATOR] }
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: User not found
 */
userRouter.patch("/:id/role", userController.updateRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
userRouter.delete("/:id", userController.delete);
