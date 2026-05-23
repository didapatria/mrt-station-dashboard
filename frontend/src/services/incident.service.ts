import api from "./api";
import type { ApiResponse, Incident } from "@/types";

interface GetIncidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  stationId?: string;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  stationId?: string | null;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status?: "OPEN" | "MONITORING" | "RESOLVED";
  stationId?: string | null;
}

export const incidentService = {
  async getAll(params?: GetIncidentsParams) {
    const response = await api.get<ApiResponse<Incident[]>>("/incidents", { params });
    return response.data;
  },

  async create(data: CreateIncidentData) {
    const response = await api.post<ApiResponse<Incident>>("/incidents", data);
    return response.data;
  },

  async update(id: string, data: UpdateIncidentData) {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return response.data;
  },

  async resolve(id: string) {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}/resolve`);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/incidents/${id}`);
    return response.data;
  },
};
