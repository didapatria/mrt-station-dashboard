import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const permissionService = {
  async getPermissionsForRole(roleName: string): Promise<string[]> {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
    return role?.rolePermissions.map((rp) => rp.permission.name) ?? [];
  },

  async getPermissionsForUser(userId: string): Promise<string[]> {
    const [rolePerms, directPerms] = await Promise.all([
      prisma.modelHasRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: { include: { permission: true } },
            },
          },
        },
      }),
      prisma.modelHasPermission.findMany({
        where: { userId },
        include: { permission: true },
      }),
    ]);

    const fromRoles = rolePerms.flatMap((mr) =>
      mr.role.rolePermissions.map((rp) => rp.permission.name),
    );
    const fromDirect = directPerms.map((mp) => mp.permission.name);

    return [...new Set([...fromRoles, ...fromDirect])];
  },

  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({
      include: {
        rolePermissions: { include: { role: true } },
      },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
    return permissions.map((p) => ({
      id: p.id,
      name: p.name,
      label: p.label,
      group: p.group,
      roles: p.rolePermissions.map((rp) => rp.role.name),
    }));
  },

  async getAllRoles() {
    return prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
      },
      orderBy: { name: "asc" },
    });
  },
};
