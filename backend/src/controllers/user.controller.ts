import { Response } from "express";
import { userService } from "../services/user.service";
import { AuthRequest } from "../types";

export const userController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, search, role } = req.query;
      const result = await userService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string | undefined,
        role: role as string | undefined,
      });
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      res.status(500).json({ success: false, error: message });
    }
  },

  async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const user = await userService.updateRole(id, role);
      res.json({ success: true, data: user, message: "Role updated" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update role";
      const status = message === "User not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await userService.delete(id, req.user!.userId);
      res.json({ success: true, message: "User deleted" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      const status = message === "User not found" ? 404 : 400;
      res.status(status).json({ success: false, error: message });
    }
  },
};
