import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateFeedbackParams {
  userId: string;
  rating: number;
  category: string;
  message: string;
}

export const feedbackService = {
  async create(params: CreateFeedbackParams) {
    return prisma.feedback.create({
      data: params,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.feedback.count(),
    ]);
    return {
      feedbacks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },
};
