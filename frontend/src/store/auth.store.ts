import { create } from "zustand";
import type { User } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, token, isLoading: false });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ name, email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, token, isLoading: false });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any)?.response?.data?.error;
      set({ error: apiError || message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        set({ user: response.data });
      }
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  clearError: () => set({ error: null }),

  initFromStorage: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },
}));
