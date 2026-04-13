import api from "./api";
import type { ApiResponse, User } from "@/types";

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const userService = {
  async getAll(params?: GetUsersParams) {
    const response = await api.get<ApiResponse<User[]>>("/users", { params });
    return response.data;
  },

  async updateRole(id: string, role: "ADMIN" | "OPERATOR") {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },
};
