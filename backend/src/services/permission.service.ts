import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const permissionService = {
  async getPermissionsForRole(role: string): Promise<string[]> {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role: role as UserRole },
      include: { permission: true },
    });
    return rolePerms.map((rp) => rp.permission.name);
  },

  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({
      include: { rolePermissions: true },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
    return permissions.map((p) => ({
      id: p.id,
      name: p.name,
      label: p.label,
      group: p.group,
      roles: p.rolePermissions.map((rp) => rp.role as string),
    }));
  },
};
