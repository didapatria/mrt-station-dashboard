import { Request, Response } from "express";
import { scheduleService } from "../services/schedule.service";
import { activityLogService } from "../services/activity-log.service";
import { AuthRequest } from "../types";

export const scheduleController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, dayType, status, stationId } = req.query;
      const result = await scheduleService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        dayType: dayType as string,
        status: status as string,
        stationId: stationId as string,
      });
      res.json({ success: true, data: result.schedules, meta: result.meta });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch schedules";
      res.status(500).json({ success: false, error: message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await scheduleService.getById(req.params.id as string);
      res.json({ success: true, data: schedule });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch schedule";
      const status = message === "Schedule not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schedule = await scheduleService.create(req.body);
      await activityLogService.log(
        req.user!.userId,
        "CREATE",
        "Schedule",
        schedule.id,
        `Created schedule ${schedule.trainNumber}`
      );
      res.status(201).json({
        success: true,
        message: "Schedule created successfully",
        data: schedule,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create schedule";
      res.status(400).json({ success: false, error: message });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const schedule = await scheduleService.update(
        req.params.id as string,
        req.body
      );
      await activityLogService.log(
        req.user!.userId,
        "UPDATE",
        "Schedule",
        schedule.id,
        `Updated schedule ${schedule.trainNumber}`
      );
      res.json({
        success: true,
        message: "Schedule updated successfully",
        data: schedule,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update schedule";
      const status = message === "Schedule not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const schedule = await scheduleService.getById(id);
      await scheduleService.delete(id);
      await activityLogService.log(
        req.user!.userId,
        "DELETE",
        "Schedule",
        id,
        `Deleted schedule ${schedule.trainNumber}`
      );
      res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete schedule";
      const status = message === "Schedule not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },
};
