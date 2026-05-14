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

  // Create MRT Jakarta stations (North-South Line)
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

  // Create schedules: consecutive station pairs + full line
  const schedulesData: Array<{
    trainNumber: string;
    departureStationId: string;
    arrivalStationId: string;
    departureTime: string;
    arrivalTime: string;
    dayType: "WEEKDAY" | "WEEKEND" | "HOLIDAY";
    status: "ACTIVE" | "CANCELLED" | "DELAYED";
  }> = [];

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  // Full-line schedules: LBB → BHI (Northbound)
  for (const hour of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]) {
    for (const minute of [0, 20, 40]) {
      const arrMin = minute + 30;
      const arrHour = hour + Math.floor(arrMin / 60);
      if (arrHour >= 24) continue;
      schedulesData.push({
        trainNumber: `MRT-${fmt(hour, minute)}-NS`,
        departureStationId: stations[0].id,
        arrivalStationId: stations[12].id,
        departureTime: fmt(hour, minute),
        arrivalTime: fmt(arrHour, arrMin % 60),
        dayType: "WEEKDAY",
        status: "ACTIVE",
      });
    }
  }

  // Full-line schedules: BHI → LBB (Southbound)
  for (const hour of [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]) {
    for (const minute of [10, 30, 50]) {
      const arrMin = minute + 30;
      const arrHour = hour + Math.floor(arrMin / 60);
      if (arrHour >= 24) continue;
      schedulesData.push({
        trainNumber: `MRT-${fmt(hour, minute)}-SN`,
        departureStationId: stations[12].id,
        arrivalStationId: stations[0].id,
        departureTime: fmt(hour, minute),
        arrivalTime: fmt(arrHour, arrMin % 60),
        dayType: "WEEKDAY",
        status: "ACTIVE",
      });
    }
  }

  // Intermediate schedules: between consecutive stations (short routes)
  for (let i = 0; i < stations.length - 1; i++) {
    for (const hour of [6, 8, 12, 17, 20]) {
      schedulesData.push({
        trainNumber: `MRT-${fmt(hour, 15)}-${stations[i].code}`,
        departureStationId: stations[i].id,
        arrivalStationId: stations[i + 1].id,
        departureTime: fmt(hour, 15),
        arrivalTime: fmt(hour, 19),
        dayType: "WEEKDAY",
        status: "ACTIVE",
      });
    }
  }

  // Weekend schedules (reduced frequency)
  for (const hour of [7, 9, 11, 13, 15, 17, 19]) {
    schedulesData.push({
      trainNumber: `MRT-${fmt(hour, 0)}-WE-NS`,
      departureStationId: stations[0].id,
      arrivalStationId: stations[12].id,
      departureTime: fmt(hour, 0),
      arrivalTime: fmt(hour, 30),
      dayType: "WEEKEND",
      status: "ACTIVE",
    });
    schedulesData.push({
      trainNumber: `MRT-${fmt(hour, 30)}-WE-SN`,
      departureStationId: stations[12].id,
      arrivalStationId: stations[0].id,
      departureTime: fmt(hour, 30),
      arrivalTime: fmt(hour + 1, 0),
      dayType: "WEEKEND",
      status: "ACTIVE",
    });
  }

  // A few delayed/cancelled for variety
  if (schedulesData.length > 5) {
    schedulesData[3].status = "DELAYED";
    schedulesData[8].status = "DELAYED";
    schedulesData[15].status = "CANCELLED";
  }

  let scheduleCount = 0;
  for (const data of schedulesData) {
    const existing = await prisma.schedule.findFirst({
      where: { trainNumber: data.trainNumber, dayType: data.dayType },
    });
    if (!existing) {
      await prisma.schedule.create({ data });
      scheduleCount++;
    }
  }
  console.log(`Created ${scheduleCount} schedules`);

  // Seed permissions
  const permissionsData = [
    { name: "dashboard.view", label: "View Dashboard", group: "Dashboard" },
    { name: "dashboard.export", label: "Export Reports (CSV/PDF)", group: "Dashboard" },
    { name: "stations.view", label: "View Stations", group: "Stations" },
    { name: "stations.create", label: "Create Stations", group: "Stations" },
    { name: "stations.edit", label: "Edit Stations", group: "Stations" },
    { name: "stations.delete", label: "Delete Stations", group: "Stations" },
    { name: "schedules.view", label: "View Schedules", group: "Schedules" },
    { name: "schedules.create", label: "Create Schedules", group: "Schedules" },
    { name: "schedules.edit", label: "Edit Schedules", group: "Schedules" },
    { name: "schedules.delete", label: "Delete Schedules", group: "Schedules" },
    { name: "users.view", label: "View Users", group: "Users" },
    { name: "users.edit_role", label: "Change User Roles", group: "Users" },
    { name: "users.delete", label: "Delete Users", group: "Users" },
    { name: "activity_logs.view", label: "View Activity Logs", group: "Activity Logs" },
    { name: "map.view", label: "View Station Map", group: "Map" },
    { name: "settings.view", label: "View Settings", group: "Settings" },
    { name: "settings.edit", label: "Change Settings", group: "Settings" },
  ];

  const adminPermissions = permissionsData.map(p => p.name);
  const operatorPermissions = [
    "dashboard.view", "stations.view", "schedules.view",
    "activity_logs.view", "map.view", "settings.view", "settings.edit",
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { label: perm.label, group: perm.group },
      create: perm,
    });
  }
  console.log("Seeded permissions:", permissionsData.length);

  // Seed role_permissions
  for (const permName of adminPermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: "ADMIN", permissionId: perm.id } },
        update: {},
        create: { role: "ADMIN", permissionId: perm.id },
      });
    }
  }
  for (const permName of operatorPermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: "OPERATOR", permissionId: perm.id } },
        update: {},
        create: { role: "OPERATOR", permissionId: perm.id },
      });
    }
  }
  console.log("Seeded role permissions");

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
