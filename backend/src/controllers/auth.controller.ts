import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../types";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      const status = message === "Email already registered" ? 409 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ success: false, error: message });
    }
  },

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      const status = message === "Current password is incorrect" ? 400 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get profile";
      res.status(404).json({ success: false, error: message });
    }
  },
};
