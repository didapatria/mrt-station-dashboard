import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
