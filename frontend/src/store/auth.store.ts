import { create } from "zustand";
import type { User } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initFromStorage: () => void;
  setPermissions: (permissions: string[]) => void;
}

function getInitialAuthState(): { token: string | null; user: User | null; permissions: string[] } {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return { token: null, user: null, permissions: [] };
    const user = JSON.parse(userStr) as User;
    const permsStr = localStorage.getItem("permissions");
    const permissions = permsStr ? (JSON.parse(permsStr) as string[]) : [];
    return { token, user, permissions };
  } catch {
    return { token: null, user: null, permissions: [] };
  }
}

const initial = getInitialAuthState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  permissions: initial.permissions,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      const { user, token, permissions } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("permissions", JSON.stringify(permissions ?? []));
      set({ user, token, permissions: permissions ?? [] });
    }
  },

  register: async (name, email, password) => {
    const response = await authService.register({ name, email, password });
    if (response.success && response.data) {
      const { user, token, permissions } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("permissions", JSON.stringify(permissions ?? []));
      set({ user, token, permissions: permissions ?? [] });
    }
  },

  googleLogin: async (credential) => {
    const response = await authService.googleAuth(credential);
    if (response.success && response.data) {
      const { user, token, permissions } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("permissions", JSON.stringify(permissions ?? []));
      set({ user, token, permissions: permissions ?? [] });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    set({ user: null, token: null, permissions: [] });
  },

  clearError: () => set({ error: null }),

  initFromStorage: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        const permsStr = localStorage.getItem("permissions");
        const permissions = permsStr ? JSON.parse(permsStr) as string[] : [];
        set({ user, token, permissions });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
      }
    }
  },

  setPermissions: (permissions) => set({ permissions }),
}));
