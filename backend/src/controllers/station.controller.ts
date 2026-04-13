import { Request, Response } from "express";
import { stationService } from "../services/station.service";

export const stationController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, status } = req.query;
      const result = await stationService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
      });
      res.json({ success: true, data: result.stations, meta: result.meta });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch stations";
      res.status(500).json({ success: false, error: message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const station = await stationService.getById(req.params.id as string);
      res.json({ success: true, data: station });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch station";
      const status = message === "Station not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const station = await stationService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Station created successfully",
        data: station,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create station";
      const status = message === "Station code already exists" ? 409 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const station = await stationService.update(req.params.id as string, req.body);
      res.json({
        success: true,
        message: "Station updated successfully",
        data: station,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update station";
      const status = message === "Station not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await stationService.delete(req.params.id as string);
      res.json({ success: true, message: "Station deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete station";
      const status = message === "Station not found" ? 404 : 500;
      res.status(status).json({ success: false, error: message });
    }
  },
};
