import { create } from "zustand";
import type { Station } from "@/types";
import { stationService } from "@/services/station.service";

interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  isLoading: boolean;
  error: string | null;
  meta: { page: number; limit: number; total: number; totalPages: number } | null;

  fetchStations: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  fetchStation: (id: string) => Promise<void>;
  createStation: (data: Partial<Station>) => Promise<void>;
  updateStation: (id: string, data: Partial<Station>) => Promise<void>;
  deleteStation: (id: string) => Promise<void>;
  clearError: () => void;
  setSelectedStation: (station: Station | null) => void;
}

export const useStationStore = create<StationState>((set) => ({
  stations: [],
  selectedStation: null,
  isLoading: false,
  error: null,
  meta: null,

  fetchStations: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stationService.getAll(params);
      if (response.success) {
        set({
          stations: response.data || [],
          meta: response.meta || null,
          isLoading: false,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch stations";
      set({ error: message, isLoading: false });
    }
  },

  fetchStation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stationService.getById(id);
      if (response.success && response.data) {
        set({ selectedStation: response.data, isLoading: false });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch station";
      set({ error: message, isLoading: false });
    }
  },

  createStation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await stationService.create(data);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create station";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  updateStation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await stationService.update(id, data);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update station";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  deleteStation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await stationService.delete(id);
      set((state) => ({
        stations: state.stations.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete station";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setSelectedStation: (station) => set({ selectedStation: station }),
}));
