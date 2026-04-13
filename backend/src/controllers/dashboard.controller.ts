import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch stats";
      res.status(500).json({ success: false, error: message });
    }
  },

  async getStationSummary(_req: Request, res: Response): Promise<void> {
    try {
      const stations = await dashboardService.getStationStatusSummary();
      res.json({ success: true, data: stations });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch summary";
      res.status(500).json({ success: false, error: message });
    }
  },

  async getSchedulesByHour(_req: Request, res: Response): Promise<void> {
    try {
      const data = await dashboardService.getSchedulesByHour();
      res.json({ success: true, data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch data";
      res.status(500).json({ success: false, error: message });
    }
  },
};
