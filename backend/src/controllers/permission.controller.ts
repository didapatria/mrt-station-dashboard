import { Response } from "express";
import { permissionService } from "../services/permission.service";
import { AuthRequest } from "../types";

export const permissionController = {
  async getMyPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await permissionService.getPermissionsForUser(
        req.user!.userId,
      );
      res.json({ success: true, data: permissions });
    } catch {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch permissions" });
    }
  },

  async getAllPermissions(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.json({ success: true, data: permissions });
    } catch {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch permissions" });
    }
  },
};
