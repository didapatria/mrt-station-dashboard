import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { incidentService, type CreateIncidentData, type UpdateIncidentData } from "@/services/incident.service";

interface IncidentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  stationId?: string;
}

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: IncidentFilters) => [...incidentKeys.lists(), filters] as const,
};

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: async () => {
      const response = await incidentService.getAll(filters);
      return { incidents: response.data ?? [], meta: response.meta ?? null };
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: CreateIncidentData) => incidentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.created"));
    },
    onError: () => toast.error("Failed to report incident"),
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentData }) =>
      incidentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      toast.success(t("incidents.updated"));
    },
    onError: () => toast.error("Failed to update incident"),
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => incidentService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.resolved"));
    },
    onError: () => toast.error("Failed to resolve incident"),
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => incidentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("incidents.deleted"));
    },
    onError: () => toast.error("Failed to delete incident"),
  });
}
