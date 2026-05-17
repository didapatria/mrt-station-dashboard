import { Router } from "express";
import { stationController } from "../controllers/station.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createStationSchema,
  updateStationSchema,
} from "../validators/station.validator";

export const stationRouter = Router();

stationRouter.use(authMiddleware);

/**
 * @swagger
 * /stations:
 *   get:
 *     tags: [Stations]
 *     summary: Get all stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, code, or location
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, MAINTENANCE, INACTIVE] }
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of stations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Station' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
stationRouter.get("/", stationController.getAll);

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     tags: [Stations]
 *     summary: Get station by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Station details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Station' }
 *       404:
 *         description: Station not found
 */
stationRouter.get("/:id", stationController.getById);

/**
 * @swagger
 * /stations:
 *   post:
 *     tags: [Stations]
 *     summary: Create a new station
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStationRequest'
 *     responses:
 *       201:
 *         description: Station created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Station' }
 *       409:
 *         description: Station code already exists
 *       422:
 *         description: Validation error
 */
stationRouter.post(
  "/",
  adminMiddleware,
  validate(createStationSchema),
  stationController.create,
);

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     tags: [Stations]
 *     summary: Update a station
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
 *             $ref: '#/components/schemas/CreateStationRequest'
 *     responses:
 *       200:
 *         description: Station updated
 *       404:
 *         description: Station not found
 *       422:
 *         description: Validation error
 */
stationRouter.put(
  "/:id",
  adminMiddleware,
  validate(updateStationSchema),
  stationController.update,
);

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     tags: [Stations]
 *     summary: Delete a station
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Station deleted
 *       404:
 *         description: Station not found
 */
stationRouter.delete("/:id", adminMiddleware, stationController.delete);
