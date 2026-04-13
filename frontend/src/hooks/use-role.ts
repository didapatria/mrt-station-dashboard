import { useAuthStore } from "@/store/auth.store";

export function useRole() {
  const { user } = useAuthStore();

  return {
    role: user?.role ?? null,
    isAdmin: user?.role === "ADMIN",
    isOperator: user?.role === "OPERATOR",
  };
}
