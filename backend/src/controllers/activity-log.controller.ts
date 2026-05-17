import { Response } from "express";
import { activityLogService } from "../services/activity-log.service";
import { AuthRequest } from "../types";

export const activityLogController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, entity, userId } = req.query;
      const result = await activityLogService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        entity: entity as string | undefined,
        userId: userId as string | undefined,
      });
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch activity logs";
      res.status(500).json({ success: false, error: message });
    }
  },
};
