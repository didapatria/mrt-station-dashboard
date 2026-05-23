import { useQuery } from "@tanstack/react-query";
import { publicSystemService } from "@/services/public.service";
import type { SystemStatusData } from "@/types";

export function useSystemStatus() {
  return useQuery<SystemStatusData>({
    queryKey: ["system-status"],
    queryFn: () => publicSystemService.getStatus(),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    retry: false,
  });
}
