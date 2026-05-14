import { Router } from "express";
import { permissionController } from "../controllers/permission.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export const permissionRouter = Router();

permissionRouter.get("/me", authMiddleware, permissionController.getMyPermissions);
permissionRouter.get("/", authMiddleware, adminMiddleware, permissionController.getAllPermissions);
