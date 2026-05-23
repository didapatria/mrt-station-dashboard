import { Response } from "express";
import { incidentService } from "../services/incident.service";
import { activityLogService } from "../services/activity-log.service";
import { sseService } from "../services/sse.service";
import { AuthRequest } from "../types";

export const incidentController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, severity, stationId } = req.query;
      const result = await incidentService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        severity: severity as string,
        stationId: stationId as string,
      });
      res.json({ success: true, data: result.incidents, meta: result.meta });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch incidents";
      res.status(500).json({ success: false, error: message });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.create(req.body, req.user!.userId);
      await activityLogService.log(
        req.user!.userId,
        "CREATE",
        "Incident",
        incident.id,
        `Reported incident: ${incident.title}`,
      );
      sseService.broadcast("incident.created", incident);
      res.status(201).json({ success: true, message: "Incident reported", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create incident";
      res.status(500).json({ success: false, error: message });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.update(req.params.id as string, req.body);
      await activityLogService.log(
        req.user!.userId,
        "UPDATE",
        "Incident",
        incident.id,
        `Updated incident: ${incident.title}`,
      );
      sseService.broadcast("incident.updated", incident);
      res.json({ success: true, message: "Incident updated", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async resolve(req: AuthRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.resolve(req.params.id as string);
      await activityLogService.log(
        req.user!.userId,
        "UPDATE",
        "Incident",
        incident.id,
        `Resolved incident: ${incident.title}`,
      );
      sseService.broadcast("incident.resolved", incident);
      res.json({ success: true, message: "Incident resolved", data: incident });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await incidentService.delete(id);
      await activityLogService.log(
        req.user!.userId,
        "DELETE",
        "Incident",
        id,
        `Deleted incident`,
      );
      sseService.broadcast("incident.updated", { id, action: "DELETE" });
      res.json({ success: true, message: "Incident deleted" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete incident";
      const status = message === "Incident not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },
};
