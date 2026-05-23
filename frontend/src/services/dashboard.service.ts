import api from "./api";
import type { ApiResponse } from "@/types";

export interface DashboardStats {
  totalStations: number;
  activeStations: number;
  maintenanceStations: number;
  inactiveStations: number;
  totalSchedules: number;
  activeSchedules: number;
  delayedSchedules: number;
  cancelledSchedules: number;
  totalUsers: number;
  openIncidents: number;
}

export interface HourlySchedule {
  hour: string;
  count: number;
}

export const dashboardService = {
  async getStats() {
    const response =
      await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return response.data;
  },

  async getSchedulesByHour() {
    const response = await api.get<ApiResponse<HourlySchedule[]>>(
      "/dashboard/schedules-by-hour",
    );
    return response.data;
  },

  async exportStationsCSV() {
    const response = await api.get("/export/stations", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mrt-stations.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportSchedulesCSV(dayType?: string) {
    const response = await api.get("/export/schedules", {
      params: dayType ? { dayType } : undefined,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mrt-schedules.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
