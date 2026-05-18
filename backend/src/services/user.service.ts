import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const userService = {
  async getAll(params: ListUsersParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.role) {
      where.role = params.role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateRole(userId: string, role: "ADMIN" | "OPERATOR") {
    const [user, roleRecord] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.role.findUnique({ where: { name: role } }),
    ]);
    if (!user) throw new Error("User not found");
    if (!roleRecord) throw new Error(`Role "${role}" not found in roles table`);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Sync model_has_roles: remove old role assignments, assign new role
      await tx.modelHasRole.deleteMany({ where: { userId } });
      await tx.modelHasRole.create({ data: { userId, roleId: roleRecord.id } });

      return updatedUser;
    });

    return updated;
  },

  async delete(userId: string, requestingUserId: string) {
    if (userId === requestingUserId) {
      throw new Error("Cannot delete your own account");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    await prisma.user.delete({ where: { id: userId } });
  },
};
