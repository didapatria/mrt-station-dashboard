import { useAuthStore } from "@/store/auth.store";
import { hasPermission, getPermissions, type Permission } from "@/lib/permissions";

export function usePermission() {
  const { user } = useAuthStore();
  const role = user?.role ?? null;

  return {
    can: (permission: Permission) => hasPermission(role, permission),
    permissions: getPermissions(role),
    role,
  };
}
