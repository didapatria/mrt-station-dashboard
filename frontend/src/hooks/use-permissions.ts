import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { permissionService } from "@/services/permission.service";
import { useAuthStore } from "@/store/auth.store";

export function useMyPermissions() {
  const { token, setPermissions } = useAuthStore();

  const query = useQuery({
    queryKey: ["permissions", "me"],
    queryFn: permissionService.getMyPermissions,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setPermissions(query.data);
      localStorage.setItem("permissions", JSON.stringify(query.data));
    }
  }, [query.data, setPermissions]);

  return query;
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: permissionService.getAllPermissions,
    staleTime: 5 * 60 * 1000,
  });
}
