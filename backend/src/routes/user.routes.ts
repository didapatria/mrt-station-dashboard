import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const userRouter = Router();

userRouter.use(authMiddleware, adminMiddleware);

userRouter.get("/", userController.getAll);
userRouter.patch("/:id/role", userController.updateRole);
userRouter.delete("/:id", userController.delete);
