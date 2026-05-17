import api from "./api";
import type { ApiResponse } from "@/types";

export interface PermissionWithRoles {
  id: string;
  name: string;
  label: string;
  group: string;
  roles: string[];
}

export const permissionService = {
  async getMyPermissions(): Promise<string[]> {
    const res = await api.get<ApiResponse<string[]>>("/permissions/me");
    return res.data.data ?? [];
  },

  async getAllPermissions(): Promise<PermissionWithRoles[]> {
    const res =
      await api.get<ApiResponse<PermissionWithRoles[]>>("/permissions");
    return res.data.data ?? [];
  },
};
