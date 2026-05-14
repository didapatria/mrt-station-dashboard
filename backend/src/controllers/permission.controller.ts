import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { permissionService } from "../services/permission.service";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

export const permissionController = {
  async getMyPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { role: true },
      });
      if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
      const permissions = await permissionService.getPermissionsForRole(user.role);
      res.json({ success: true, data: permissions });
    } catch {
      res.status(500).json({ success: false, error: "Failed to fetch permissions" });
    }
  },

  async getAllPermissions(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.json({ success: true, data: permissions });
    } catch {
      res.status(500).json({ success: false, error: "Failed to fetch permissions" });
    }
  },
};
