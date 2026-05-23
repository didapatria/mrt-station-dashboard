import { Router } from "express";
import { incidentController } from "../controllers/incident.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createIncidentSchema, updateIncidentSchema } from "../validators/incident.validator";

export const incidentRouter = Router();

incidentRouter.use(authMiddleware);

/**
 * @swagger
 * /incidents:
 *   get:
 *     tags: [Incidents]
 *     summary: Get all incidents (paginated)
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
 *         name: status
 *         schema: { type: string, enum: [OPEN, MONITORING, RESOLVED] }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [CRITICAL, HIGH, MEDIUM, LOW] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Incident' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
incidentRouter.get("/", incidentController.getAll);

/**
 * @swagger
 * /incidents:
 *   post:
 *     tags: [Incidents]
 *     summary: Report a new incident
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateIncidentRequest' }
 *     responses:
 *       201:
 *         description: Incident created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Incident' }
 */
incidentRouter.post("/", validate(createIncidentSchema), incidentController.create);

/**
 * @swagger
 * /incidents/{id}:
 *   patch:
 *     tags: [Incidents]
 *     summary: Update an incident (admin only)
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
 *           schema: { $ref: '#/components/schemas/UpdateIncidentRequest' }
 *     responses:
 *       200:
 *         description: Incident updated
 *       404:
 *         description: Incident not found
 */
incidentRouter.patch("/:id", adminMiddleware, validate(updateIncidentSchema), incidentController.update);

/**
 * @swagger
 * /incidents/{id}/resolve:
 *   patch:
 *     tags: [Incidents]
 *     summary: Resolve an incident (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incident resolved
 *       404:
 *         description: Incident not found
 */
incidentRouter.patch("/:id/resolve", adminMiddleware, incidentController.resolve);

/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     tags: [Incidents]
 *     summary: Delete an incident (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incident deleted
 *       404:
 *         description: Incident not found
 */
incidentRouter.delete("/:id", adminMiddleware, incidentController.delete);
