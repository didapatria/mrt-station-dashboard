import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const feedbackRouter = Router();

feedbackRouter.use(authMiddleware);

feedbackRouter.post("/", feedbackController.create);
feedbackRouter.get("/", adminMiddleware, feedbackController.getAll);
