import { PrismaClient } from "@prisma/client";
import {
  CreateStationInput,
  UpdateStationInput,
} from "../validators/station.validator";

const prisma = new PrismaClient();

export const stationService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { code: { contains: params.search, mode: "insensitive" } },
        { location: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const [stations, total] = await Promise.all([
      prisma.station.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: "asc" },
      }),
      prisma.station.count({ where }),
    ]);

    return {
      stations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const station = await prisma.station.findUnique({ where: { id } });

    if (!station) {
      throw new Error("Station not found");
    }

    return station;
  },

  async create(input: CreateStationInput) {
    const existingCode = await prisma.station.findUnique({
      where: { code: input.code },
    });

    if (existingCode) {
      throw new Error("Station code already exists");
    }

    return prisma.station.create({ data: input });
  },

  async update(id: string, input: UpdateStationInput) {
    const station = await prisma.station.findUnique({ where: { id } });

    if (!station) {
      throw new Error("Station not found");
    }

    if (input.code && input.code !== station.code) {
      const existingCode = await prisma.station.findUnique({
        where: { code: input.code },
      });
      if (existingCode) {
        throw new Error("Station code already exists");
      }
    }

    return prisma.station.update({ where: { id }, data: input });
  },

  async delete(id: string) {
    const station = await prisma.station.findUnique({ where: { id } });

    if (!station) {
      throw new Error("Station not found");
    }

    return prisma.station.delete({ where: { id } });
  },
};
