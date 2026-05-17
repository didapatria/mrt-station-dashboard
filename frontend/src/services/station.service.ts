import api from "./api";
import type { ApiResponse, Station } from "@/types";

interface GetStationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const stationService = {
  async getAll(params?: GetStationsParams) {
    const response = await api.get<ApiResponse<Station[]>>("/stations", {
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Station>>(`/stations/${id}`);
    return response.data;
  },

  async create(data: Partial<Station>) {
    const response = await api.post<ApiResponse<Station>>("/stations", data);
    return response.data;
  },

  async update(id: string, data: Partial<Station>) {
    const response = await api.put<ApiResponse<Station>>(
      `/stations/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/stations/${id}`);
    return response.data;
  },
};
