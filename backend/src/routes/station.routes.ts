import { Router } from "express";
import { stationController } from "../controllers/station.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createStationSchema,
  updateStationSchema,
} from "../validators/station.validator";

export const stationRouter = Router();

stationRouter.use(authMiddleware);

stationRouter.get("/", stationController.getAll);
stationRouter.get("/:id", stationController.getById);
stationRouter.post("/", validate(createStationSchema), stationController.create);
stationRouter.put("/:id", validate(updateStationSchema), stationController.update);
stationRouter.delete("/:id", stationController.delete);
