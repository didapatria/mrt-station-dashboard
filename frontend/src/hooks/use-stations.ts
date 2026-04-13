import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stationService } from "@/services/station.service";
import type { Station } from "@/types";

interface StationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const stationKeys = {
  all: ["stations"] as const,
  lists: () => [...stationKeys.all, "list"] as const,
  list: (filters: StationFilters) => [...stationKeys.lists(), filters] as const,
  details: () => [...stationKeys.all, "detail"] as const,
  detail: (id: string) => [...stationKeys.details(), id] as const,
};

export function useStations(filters: StationFilters = {}) {
  return useQuery({
    queryKey: stationKeys.list(filters),
    queryFn: async () => {
      const response = await stationService.getAll(filters);
      return { stations: response.data ?? [], meta: response.meta ?? null };
    },
  });
}

export function useStation(id: string) {
  return useQuery({
    queryKey: stationKeys.detail(id),
    queryFn: async () => {
      const response = await stationService.getById(id);
      return response.data!;
    },
    enabled: !!id,
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Station>) => stationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stationKeys.lists() });
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Station> }) =>
      stationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stationKeys.all });
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stationKeys.lists() });
    },
  });
}
