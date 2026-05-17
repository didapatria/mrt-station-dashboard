import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
    return;
  }

  next();
};
