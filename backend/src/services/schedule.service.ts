import { PrismaClient } from "@prisma/client";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../validators/schedule.validator";

const prisma = new PrismaClient();

export const scheduleService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    dayType?: string;
    status?: string;
    stationId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.trainNumber = { contains: params.search, mode: "insensitive" };
    }

    if (params.dayType) {
      where.dayType = params.dayType;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.stationId) {
      where.OR = [
        { departureStationId: params.stationId },
        { arrivalStationId: params.stationId },
      ];
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: "asc" },
        include: {
          departureStation: {
            select: { id: true, name: true, code: true },
          },
          arrivalStation: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.schedule.count({ where }),
    ]);

    return {
      schedules,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        departureStation: true,
        arrivalStation: true,
      },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule;
  },

  async create(input: CreateScheduleInput) {
    const [departureStation, arrivalStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: input.departureStationId } }),
      prisma.station.findUnique({ where: { id: input.arrivalStationId } }),
    ]);

    if (!departureStation) throw new Error("Departure station not found");
    if (!arrivalStation) throw new Error("Arrival station not found");
    if (input.departureStationId === input.arrivalStationId) {
      throw new Error("Departure and arrival stations must be different");
    }

    // Conflict detection: same train, same day, overlapping time
    const conflict = await prisma.schedule.findFirst({
      where: {
        trainNumber: input.trainNumber,
        dayType: input.dayType,
        departureTime: input.departureTime,
      },
    });
    if (conflict) {
      throw new Error(`Schedule conflict: ${input.trainNumber} already departs at ${input.departureTime} on ${input.dayType}`);
    }

    return prisma.schedule.create({
      data: input,
      include: {
        departureStation: { select: { id: true, name: true, code: true } },
        arrivalStation: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async update(id: string, input: UpdateScheduleInput) {
    const schedule = await prisma.schedule.findUnique({ where: { id } });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return prisma.schedule.update({
      where: { id },
      data: input,
      include: {
        departureStation: { select: { id: true, name: true, code: true } },
        arrivalStation: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async delete(id: string) {
    const schedule = await prisma.schedule.findUnique({ where: { id } });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return prisma.schedule.delete({ where: { id } });
  },
};
