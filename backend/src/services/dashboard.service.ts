import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dashboardService = {
  async getStats() {
    const [
      totalStations,
      activeStations,
      maintenanceStations,
      inactiveStations,
      totalSchedules,
      activeSchedules,
      delayedSchedules,
      cancelledSchedules,
      totalUsers,
      openIncidents,
    ] = await Promise.all([
      prisma.station.count(),
      prisma.station.count({ where: { status: "ACTIVE" } }),
      prisma.station.count({ where: { status: "MAINTENANCE" } }),
      prisma.station.count({ where: { status: "INACTIVE" } }),
      prisma.schedule.count(),
      prisma.schedule.count({ where: { status: "ACTIVE" } }),
      prisma.schedule.count({ where: { status: "DELAYED" } }),
      prisma.schedule.count({ where: { status: "CANCELLED" } }),
      prisma.user.count(),
      prisma.incident.count({ where: { status: { in: ["OPEN", "MONITORING"] } } }),
    ]);

    return {
      totalStations,
      activeStations,
      maintenanceStations,
      inactiveStations,
      totalSchedules,
      activeSchedules,
      delayedSchedules,
      cancelledSchedules,
      totalUsers,
      openIncidents,
    };
  },

  async getStationStatusSummary() {
    const stations = await prisma.station.findMany({
      select: { name: true, code: true, status: true, order: true },
      orderBy: { order: "asc" },
    });
    return stations;
  },

  async getSchedulesByHour() {
    const schedules = await prisma.schedule.findMany({
      where: { status: "ACTIVE", dayType: "WEEKDAY" },
      select: { departureTime: true },
    });

    const hourCounts: Record<string, number> = {};
    for (let h = 5; h <= 23; h++) {
      hourCounts[`${String(h).padStart(2, "0")}:00`] = 0;
    }

    for (const s of schedules) {
      const hour = s.departureTime.split(":")[0];
      const key = `${hour}:00`;
      if (key in hourCounts) {
        hourCounts[key]++;
      }
    }

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour,
      count,
    }));
  },
};
