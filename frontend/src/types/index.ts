export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
  createdAt: string;
  avatarUrl?: string;
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

export type PublicStation = Pick<Station, "id" | "name" | "code" | "order" | "status">;

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

export type SseStatus = "connected" | "disconnected" | "reconnecting";

export type OperationsStatus = "ACTIVE" | "DEGRADED" | "INCIDENT";

export interface SystemStatusData {
  status: OperationsStatus;
  maintenanceStations: number;
  totalStations: number;
  cancelledSchedules: number;
  totalSchedules: number;
  openIncidents: number;
  checkedAt: string;
}

export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "OPEN" | "MONITORING" | "RESOLVED";

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  stationId?: string | null;
  reportedById: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  station?: { id: string; name: string; code: string } | null;
  reportedBy: { id: string; name: string };
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
