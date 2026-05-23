import { PrismaClient } from "@prisma/client";
import { CreateIncidentInput, UpdateIncidentInput } from "../validators/incident.validator";

const prisma = new PrismaClient();

const incidentSelect = {
  id: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  stationId: true,
  reportedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  station: { select: { id: true, name: true, code: true } },
  reportedBy: { select: { id: true, name: true } },
} as const;

export const incidentService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    severity?: string;
    stationId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }
    if (params.status) where.status = params.status;
    if (params.severity) where.severity = params.severity;
    if (params.stationId) where.stationId = params.stationId;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        select: incidentSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(data: CreateIncidentInput, reportedById: string) {
    return prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        stationId: data.stationId ?? null,
        reportedById,
      },
      select: incidentSelect,
    });
  },

  async update(id: string, data: UpdateIncidentInput) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    return prisma.incident.update({
      where: { id },
      data,
      select: incidentSelect,
    });
  },

  async resolve(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    return prisma.incident.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
      select: incidentSelect,
    });
  },

  async delete(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");
    await prisma.incident.delete({ where: { id } });
  },
};
