import { PrismaClient } from "@prisma/client";
import { sseService } from "./sse.service";

const prisma = new PrismaClient();

interface ListLogsParams {
  page?: number;
  limit?: number;
  entity?: string;
  userId?: string;
}

export const activityLogService = {
  async log(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details?: string
  ) {
    const log = await prisma.activityLog.create({
      data: { userId, action, entity, entityId, details },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    sseService.broadcast("activity", { action, entity, entityId, details, user: log.user, createdAt: log.createdAt });
    return log;
  },

  async getAll(params: ListLogsParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.entity) where.entity = params.entity;
    if (params.userId) where.userId = params.userId;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
