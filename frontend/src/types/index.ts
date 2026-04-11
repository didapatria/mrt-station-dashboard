export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
  createdAt: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  trainNumber: string;
  departureStationId: string;
  arrivalStationId: string;
  departureTime: string;
  arrivalTime: string;
  dayType: "WEEKDAY" | "WEEKEND" | "HOLIDAY";
  status: "ACTIVE" | "CANCELLED" | "DELAYED";
  createdAt: string;
  updatedAt: string;
  departureStation?: Pick<Station, "id" | "name" | "code">;
  arrivalStation?: Pick<Station, "id" | "name" | "code">;
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

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}
