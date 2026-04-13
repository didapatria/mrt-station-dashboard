import { Router } from "express";
import { scheduleController } from "../controllers/schedule.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "../validators/schedule.validator";

export const scheduleRouter = Router();

scheduleRouter.use(authMiddleware);

/**
 * @swagger
 * /schedules:
 *   get:
 *     tags: [Schedules]
 *     summary: Get all schedules
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
 *         name: search
 *         schema: { type: string }
 *         description: Search by train number
 *       - in: query
 *         name: dayType
 *         schema: { type: string, enum: [WEEKDAY, WEEKEND, HOLIDAY] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, CANCELLED, DELAYED] }
 *       - in: query
 *         name: stationId
 *         schema: { type: string, format: uuid }
 *         description: Filter by departure or arrival station
 *     responses:
 *       200:
 *         description: List of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Schedule' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
scheduleRouter.get("/", scheduleController.getAll);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     tags: [Schedules]
 *     summary: Get schedule by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Schedule details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Schedule' }
 *       404:
 *         description: Schedule not found
 */
scheduleRouter.get("/:id", scheduleController.getById);

/**
 * @swagger
 * /schedules:
 *   post:
 *     tags: [Schedules]
 *     summary: Create a new schedule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScheduleRequest'
 *     responses:
 *       201:
 *         description: Schedule created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Schedule' }
 *       400:
 *         description: Invalid station IDs or same departure/arrival
 *       422:
 *         description: Validation error
 */
scheduleRouter.post("/", validate(createScheduleSchema), scheduleController.create);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     tags: [Schedules]
 *     summary: Update a schedule
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
 *           schema:
 *             $ref: '#/components/schemas/CreateScheduleRequest'
 *     responses:
 *       200:
 *         description: Schedule updated
 *       404:
 *         description: Schedule not found
 */
scheduleRouter.put("/:id", validate(updateScheduleSchema), scheduleController.update);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     tags: [Schedules]
 *     summary: Delete a schedule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Schedule deleted
 *       404:
 *         description: Schedule not found
 */
scheduleRouter.delete("/:id", scheduleController.delete);
