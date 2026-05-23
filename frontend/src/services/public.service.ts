import axios from "axios";
import type { PublicStation, SystemStatusData } from "@/types";

// Dedicated client — no auth interceptor so public routes stay 401-free
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export const publicStationService = {
  async getAll(): Promise<PublicStation[]> {
    const response = await publicApi.get<{
      success: boolean;
      data: PublicStation[];
    }>("/public/stations");
    return response.data.data ?? [];
  },
};

export const publicSystemService = {
  async getStatus(): Promise<SystemStatusData> {
    const response = await publicApi.get<{
      success: boolean;
      data: SystemStatusData;
    }>("/public/system-status");
    return response.data.data;
  },
};
