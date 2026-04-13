import { useQuery } from "@tanstack/react-query";
import { activityLogApiService } from "@/services/activity-log.service";

interface LogFilters {
  page?: number;
  limit?: number;
  entity?: string;
  userId?: string;
}

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityLogKeys.all, "list"] as const,
  list: (filters: LogFilters) =>
    [...activityLogKeys.lists(), filters] as const,
};

export function useActivityLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: activityLogKeys.list(filters),
    queryFn: async () => {
      const response = await activityLogApiService.getAll(filters);
      return { logs: response.data ?? [], meta: response.meta ?? null };
    },
  });
}
