import { create } from "zustand";
import type { Schedule } from "@/types";
import { scheduleService } from "@/services/schedule.service";

interface ScheduleState {
  schedules: Schedule[];
  selectedSchedule: Schedule | null;
  isLoading: boolean;
  error: string | null;
  meta: { page: number; limit: number; total: number; totalPages: number } | null;

  fetchSchedules: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    dayType?: string;
    status?: string;
    stationId?: string;
  }) => Promise<void>;
  fetchSchedule: (id: string) => Promise<void>;
  createSchedule: (data: Partial<Schedule>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  clearError: () => void;
  setSelectedSchedule: (schedule: Schedule | null) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  selectedSchedule: null,
  isLoading: false,
  error: null,
  meta: null,

  fetchSchedules: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scheduleService.getAll(params);
      if (response.success) {
        set({
          schedules: response.data || [],
          meta: response.meta || null,
          isLoading: false,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch schedules";
      set({ error: message, isLoading: false });
    }
  },

  fetchSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scheduleService.getById(id);
      if (response.success && response.data) {
        set({ selectedSchedule: response.data, isLoading: false });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch schedule";
      set({ error: message, isLoading: false });
    }
  },

  createSchedule: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await scheduleService.create(data);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create schedule";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  updateSchedule: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await scheduleService.update(id, data);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update schedule";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await scheduleService.delete(id);
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete schedule";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
}));
