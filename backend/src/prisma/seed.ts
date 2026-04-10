import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mrtjakarta.co.id" },
    update: {},
    create: {
      name: "Admin MRT",
      email: "admin@mrtjakarta.co.id",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create operator user
  const operatorPassword = await bcrypt.hash("operator123", 12);
  const operator = await prisma.user.upsert({
    where: { email: "operator@mrtjakarta.co.id" },
    update: {},
    create: {
      name: "Operator MRT",
      email: "operator@mrtjakarta.co.id",
      password: operatorPassword,
      role: "OPERATOR",
    },
  });
  console.log("Created operator user:", operator.email);

  // Create MRT Jakarta stations (North-South Line / Fase 1 & 2)
  const stationsData = [
    { name: "Lebak Bulus Grab", code: "LBB", location: "Lebak Bulus, Jakarta Selatan", latitude: -6.2893, longitude: 106.7742, order: 1 },
    { name: "Fatmawati Indomaret", code: "FTM", location: "Fatmawati, Jakarta Selatan", latitude: -6.2925, longitude: 106.7935, order: 2 },
    { name: "Cipete Raya", code: "CPR", location: "Cipete, Jakarta Selatan", latitude: -6.2782, longitude: 106.7968, order: 3 },
    { name: "Haji Nawi", code: "HJN", location: "Haji Nawi, Jakarta Selatan", latitude: -6.2665, longitude: 106.7971, order: 4 },
    { name: "Blok A", code: "BLA", location: "Blok A, Jakarta Selatan", latitude: -6.2554, longitude: 106.7975, order: 5 },
    { name: "Blok M BCA", code: "BLM", location: "Blok M, Jakarta Selatan", latitude: -6.2441, longitude: 106.7979, order: 6 },
    { name: "ASEAN", code: "ASN", location: "Jl. Sisingamangaraja, Jakarta Selatan", latitude: -6.2384, longitude: 106.7984, order: 7 },
    { name: "Senayan", code: "SNY", location: "Senayan, Jakarta Selatan", latitude: -6.2271, longitude: 106.8020, order: 8 },
    { name: "Istora Mandiri", code: "IST", location: "Istora, Jakarta Pusat", latitude: -6.2222, longitude: 106.8092, order: 9 },
    { name: "Bendungan Hilir", code: "BNH", location: "Bendungan Hilir, Jakarta Pusat", latitude: -6.2152, longitude: 106.8175, order: 10 },
    { name: "Setiabudi Astra", code: "STB", location: "Setiabudi, Jakarta Selatan", latitude: -6.2095, longitude: 106.8223, order: 11 },
    { name: "Dukuh Atas BNI", code: "DKA", location: "Dukuh Atas, Jakarta Pusat", latitude: -6.2006, longitude: 106.8228, order: 12 },
    { name: "Bundaran HI", code: "BHI", location: "Bundaran HI, Jakarta Pusat", latitude: -6.1921, longitude: 106.8230, order: 13 },
  ];

  const stations = [];
  for (const data of stationsData) {
    const station = await prisma.station.upsert({
      where: { code: data.code },
      update: {},
      create: { ...data, status: "ACTIVE" },
    });
    stations.push(station);
  }
  console.log(`Created ${stations.length} stations`);

  // Create schedules (sample weekday schedules)
  const schedulesData = [];
  const baseHours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  for (const hour of baseHours) {
    for (const minute of [0, 20, 40]) {
      const depTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const arrMinute = minute + 30;
      const arrHour = hour + Math.floor(arrMinute / 60);
      const arrMin = arrMinute % 60;

      if (arrHour < 24) {
        const arrTime = `${String(arrHour).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}`;
        const trainNum = `MRT-${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}-NS`;

        schedulesData.push({
          trainNumber: trainNum,
          departureStationId: stations[0].id, // Lebak Bulus
          arrivalStationId: stations[12].id,  // Bundaran HI
          departureTime: depTime,
          arrivalTime: arrTime,
          dayType: "WEEKDAY" as const,
          status: "ACTIVE" as const,
        });
      }
    }
  }

  // Also add some reverse direction schedules
  for (const hour of [6, 7, 8, 9, 17, 18, 19]) {
    for (const minute of [10, 30, 50]) {
      const depTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const arrMinute = minute + 30;
      const arrHour = hour + Math.floor(arrMinute / 60);
      const arrMin = arrMinute % 60;
      const arrTime = `${String(arrHour).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}`;
      const trainNum = `MRT-${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}-SN`;

      schedulesData.push({
        trainNumber: trainNum,
        departureStationId: stations[12].id, // Bundaran HI
        arrivalStationId: stations[0].id,    // Lebak Bulus
        departureTime: depTime,
        arrivalTime: arrTime,
        dayType: "WEEKDAY" as const,
        status: "ACTIVE" as const,
      });
    }
  }

  let scheduleCount = 0;
  for (const data of schedulesData) {
    const existing = await prisma.schedule.findFirst({
      where: { trainNumber: data.trainNumber },
    });
    if (!existing) {
      await prisma.schedule.create({ data });
      scheduleCount++;
    }
  }
  console.log(`Created ${scheduleCount} schedules`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
