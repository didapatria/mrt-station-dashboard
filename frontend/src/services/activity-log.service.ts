import api from "./api";
import type { ApiResponse } from "@/types";

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface GetLogsParams {
  page?: number;
  limit?: number;
  entity?: string;
  userId?: string;
}

export const activityLogApiService = {
  async getAll(params?: GetLogsParams) {
    const response = await api.get<ApiResponse<ActivityLog[]>>(
      "/activity-logs",
      { params },
    );
    return response.data;
  },
};
