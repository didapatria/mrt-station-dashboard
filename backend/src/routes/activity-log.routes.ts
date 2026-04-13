import { Router } from "express";
import { activityLogController } from "../controllers/activity-log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const activityLogRouter = Router();

activityLogRouter.use(authMiddleware);

activityLogRouter.get("/", activityLogController.getAll);
