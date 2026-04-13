import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  hourly: () => [...dashboardKeys.all, "hourly"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await dashboardService.getStats();
      return response.data!;
    },
  });
}

export function useSchedulesByHour() {
  return useQuery({
    queryKey: dashboardKeys.hourly(),
    queryFn: async () => {
      const response = await dashboardService.getSchedulesByHour();
      return response.data ?? [];
    },
  });
}
