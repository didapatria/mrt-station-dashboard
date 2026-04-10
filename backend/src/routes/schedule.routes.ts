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

scheduleRouter.get("/", scheduleController.getAll);
scheduleRouter.get("/:id", scheduleController.getById);
scheduleRouter.post("/", validate(createScheduleSchema), scheduleController.create);
scheduleRouter.put("/:id", validate(updateScheduleSchema), scheduleController.update);
scheduleRouter.delete("/:id", scheduleController.delete);
