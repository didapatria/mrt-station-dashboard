import api from "./api";
import type { ApiResponse, Schedule } from "@/types";

interface GetSchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  dayType?: string;
  status?: string;
  stationId?: string;
}

export const scheduleService = {
  async getAll(params?: GetSchedulesParams) {
    const response = await api.get<ApiResponse<Schedule[]>>("/schedules", {
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return response.data;
  },

  async create(data: Partial<Schedule>) {
    const response = await api.post<ApiResponse<Schedule>>("/schedules", data);
    return response.data;
  },

  async update(id: string, data: Partial<Schedule>) {
    const response = await api.put<ApiResponse<Schedule>>(
      `/schedules/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/schedules/${id}`);
    return response.data;
  },
};
