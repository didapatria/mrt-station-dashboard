import { useAuthStore } from "@/store/auth.store";

export function usePermission() {
  const { user, permissions } = useAuthStore();

  return {
    can: (permission: string) => permissions.includes(permission),
    permissions,
    role: user?.role ?? null,
  };
}
