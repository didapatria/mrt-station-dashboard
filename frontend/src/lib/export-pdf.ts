import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Station, Schedule } from "@/types";
import type { DashboardStats } from "@/services/dashboard.service";

export function exportDashboardPDF(
  stats: DashboardStats,
  stations: Station[],
  schedules: Schedule[]
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MRT Jakarta - Dashboard Report", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${now}`, 14, 30);

  // Stats
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Overview", 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Metric", "Value"]],
    body: [
      ["Total Stations", String(stats.totalStations)],
      ["Active Stations", String(stats.activeStations)],
      ["Maintenance Stations", String(stats.maintenanceStations)],
      ["Inactive Stations", String(stats.inactiveStations)],
      ["Total Schedules", String(stats.totalSchedules)],
      ["Active Schedules", String(stats.activeSchedules)],
      ["Delayed Schedules", String(stats.delayedSchedules)],
      ["Cancelled Schedules", String(stats.cancelledSchedules)],
      ["Total Users", String(stats.totalUsers)],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 102, 204] },
    styles: { fontSize: 9 },
  });

  // Stations table
  const stationsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Stations", 14, stationsY);

  autoTable(doc, {
    startY: stationsY + 4,
    head: [["#", "Code", "Name", "Location", "Status"]],
    body: stations.map((s, i) => [
      String(i + 1),
      s.code,
      s.name,
      s.location,
      s.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: [0, 102, 204] },
    styles: { fontSize: 8 },
  });

  // Schedules table (new page if needed)
  const schedulesY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  if (schedulesY > 250) doc.addPage();
  const sY = schedulesY > 250 ? 20 : schedulesY;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Schedules", 14, sY);

  autoTable(doc, {
    startY: sY + 4,
    head: [["Train", "From", "To", "Departure", "Arrival", "Day", "Status"]],
    body: schedules.slice(0, 50).map((s) => [
      s.trainNumber,
      s.departureStation?.code || s.departureStationId,
      s.arrivalStation?.code || s.arrivalStationId,
      s.departureTime,
      s.arrivalTime,
      s.dayType,
      s.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: [0, 102, 204] },
    styles: { fontSize: 7 },
  });

  doc.save("mrt-jakarta-report.pdf");
}
