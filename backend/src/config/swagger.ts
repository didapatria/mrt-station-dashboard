import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MRT Jakarta - Station Management API",
      version: "2.4.0",
      description:
        "REST API for managing MRT Jakarta stations and train schedules. Features JWT authentication, RBAC (Admin/Operator), activity logging, real-time SSE notifications, CSV/PDF export, and rate limiting. Built with Express.js 5, TypeScript, Prisma ORM, and PostgreSQL.",
      contact: {
        name: "Dida",
        email: "didapatria3@gmail.com",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Admin MRT" },
            email: {
              type: "string",
              format: "email",
              example: "admin@mrtjakarta.co.id",
            },
            role: { type: "string", enum: ["ADMIN", "OPERATOR"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Station: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Lebak Bulus Grab" },
            code: { type: "string", example: "LBB" },
            location: {
              type: "string",
              example: "Lebak Bulus, Jakarta Selatan",
            },
            latitude: { type: "number", example: -6.2893 },
            longitude: { type: "number", example: 106.7742 },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
            },
            order: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Schedule: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            trainNumber: { type: "string", example: "MRT-0600-NS" },
            departureStationId: { type: "string", format: "uuid" },
            arrivalStationId: { type: "string", format: "uuid" },
            departureTime: { type: "string", example: "06:00" },
            arrivalTime: { type: "string", example: "06:30" },
            dayType: {
              type: "string",
              enum: ["WEEKDAY", "WEEKEND", "HOLIDAY"],
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "CANCELLED", "DELAYED"],
            },
            departureStation: { $ref: "#/components/schemas/StationRef" },
            arrivalStation: { $ref: "#/components/schemas/StationRef" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        StationRef: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            code: { type: "string" },
          },
        },
        DashboardStats: {
          type: "object",
          properties: {
            totalStations: { type: "integer" },
            activeStations: { type: "integer" },
            maintenanceStations: { type: "integer" },
            inactiveStations: { type: "integer" },
            totalSchedules: { type: "integer" },
            activeSchedules: { type: "integer" },
            delayedSchedules: { type: "integer" },
            cancelledSchedules: { type: "integer" },
            totalUsers: { type: "integer" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "object" },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "admin@mrtjakarta.co.id",
            },
            password: { type: "string", example: "admin123" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@mrtjakarta.co.id",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123",
            },
          },
        },
        GoogleAuthRequest: {
          type: "object",
          required: ["credential"],
          properties: {
            credential: {
              type: "string",
              description: "Google OAuth ID token from Google Sign-In",
              example: "eyJhbGciOiJSUzI1NiIs...",
            },
          },
        },
        CreateStationRequest: {
          type: "object",
          required: ["name", "code", "location", "order"],
          properties: {
            name: { type: "string", example: "Kota Baru" },
            code: { type: "string", example: "KTB" },
            location: { type: "string", example: "Jakarta Utara" },
            latitude: { type: "number", example: -6.15 },
            longitude: { type: "number", example: 106.845 },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
              default: "ACTIVE",
            },
            order: { type: "integer", example: 14 },
          },
        },
        ActivityLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            action: { type: "string", enum: ["CREATE", "UPDATE", "DELETE"] },
            entity: { type: "string", enum: ["Station", "Schedule", "User"] },
            entityId: { type: "string", format: "uuid" },
            details: { type: "string", example: "Created station Lebak Bulus Grab (LBB)" },
            createdAt: { type: "string", format: "date-time" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", example: "admin123" },
            newPassword: { type: "string", minLength: 6, example: "newpassword123" },
          },
        },
        UpdateRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["ADMIN", "OPERATOR"] },
          },
        },
        CreateScheduleRequest: {
          type: "object",
          required: [
            "trainNumber",
            "departureStationId",
            "arrivalStationId",
            "departureTime",
            "arrivalTime",
          ],
          properties: {
            trainNumber: { type: "string", example: "MRT-0700-NS" },
            departureStationId: { type: "string", format: "uuid" },
            arrivalStationId: { type: "string", format: "uuid" },
            departureTime: { type: "string", example: "07:00" },
            arrivalTime: { type: "string", example: "07:30" },
            dayType: {
              type: "string",
              enum: ["WEEKDAY", "WEEKEND", "HOLIDAY"],
              default: "WEEKDAY",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "CANCELLED", "DELAYED"],
              default: "ACTIVE",
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../routes/*.{ts,js}"),
    path.join(__dirname, "../index.{ts,js}"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
