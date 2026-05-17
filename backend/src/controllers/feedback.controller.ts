import { Response } from "express";
import { feedbackService } from "../services/feedback.service";
import { AuthRequest } from "../types";

export const feedbackController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { rating, category, message } = req.body;
      const feedback = await feedbackService.create({
        userId: req.user!.userId,
        rating,
        category,
        message,
      });
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to submit feedback";
      res.status(500).json({ success: false, error: msg });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await feedbackService.getAll(page, limit);
      res.json({ success: true, data: result.feedbacks, meta: result.meta });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to fetch feedback";
      res.status(500).json({ success: false, error: msg });
    }
  },
};
