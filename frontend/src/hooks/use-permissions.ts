import { useQuery } from "@tanstack/react-query";
import { permissionService } from "@/services/permission.service";

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: permissionService.getAllPermissions,
    staleTime: 5 * 60 * 1000,
  });
}
