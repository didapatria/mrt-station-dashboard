import { PrismaClient } from "@prisma/client";
import { sseService } from "./sse.service";

const prisma = new PrismaClient();

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateStationUpdate() {
  try {
    const count = await prisma.station.count();
    if (count === 0) return;
    const [station] = await prisma.station.findMany({
      skip: rand(0, count - 1),
      take: 1,
      select: { id: true, name: true, code: true, status: true },
    });
    if (!station) return;

    const newStatus = station.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
    await prisma.station.update({
      where: { id: station.id },
      data: { status: newStatus },
    });

    sseService.broadcast("station.updated", {
      id: station.id,
      name: station.name,
      code: station.code,
      status: newStatus,
      action: "UPDATE",
      simulated: true,
    });
    sseService.broadcast("activity", {
      action: "UPDATE",
      entity: "Station",
      entityId: station.id,
      details: `[SIM] ${station.name} status → ${newStatus}`,
      user: { name: "System Simulator" },
      createdAt: new Date(),
      simulated: true,
    });
  } catch (err) {
    console.error("[Simulator] station update error:", err);
  }
}

async function simulateScheduleUpdate() {
  try {
    const count = await prisma.schedule.count({ where: { status: { not: "CANCELLED" } } });
    if (count === 0) return;
    const [schedule] = await prisma.schedule.findMany({
      where: { status: { not: "CANCELLED" } },
      skip: rand(0, count - 1),
      take: 1,
      select: { id: true, trainNumber: true, status: true },
    });
    if (!schedule) return;

    const newStatus = schedule.status === "ACTIVE" ? "DELAYED" : "ACTIVE";
    await prisma.schedule.update({
      where: { id: schedule.id },
      data: { status: newStatus },
    });

    sseService.broadcast("schedule.updated", {
      id: schedule.id,
      trainNumber: schedule.trainNumber,
      status: newStatus,
      action: "UPDATE",
      simulated: true,
    });
  } catch (err) {
    console.error("[Simulator] schedule update error:", err);
  }
}

export function startSimulator() {
  if (process.env.NODE_ENV === "production") return;

  console.log("[Simulator] Realtime simulator started (dev only)");

  function loopStation() {
    setTimeout(async () => {
      await simulateStationUpdate();
      loopStation();
    }, rand(15_000, 30_000));
  }

  function loopSchedule() {
    setTimeout(async () => {
      await simulateScheduleUpdate();
      loopSchedule();
    }, rand(25_000, 45_000));
  }

  setTimeout(loopStation, rand(8_000, 15_000));
  setTimeout(loopSchedule, rand(20_000, 35_000));
}
