import api from "./api";
import type { ApiResponse, User, LoginForm, RegisterForm } from "@/types";

export const authService = {
  async login(data: LoginForm) {
    const response = await api.post<
      ApiResponse<{ user: User; token: string }>
    >("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterForm) {
    const response = await api.post<
      ApiResponse<{ user: User; token: string }>
    >("/auth/register", data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.post<ApiResponse>("/auth/change-password", data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    return response.data;
  },
};
