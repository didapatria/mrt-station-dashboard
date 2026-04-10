import { z } from "zod";

export const createScheduleSchema = z.object({
  trainNumber: z
    .string()
    .min(1, "Train number is required")
    .max(20, "Train number must be at most 20 characters"),
  departureStationId: z.string().uuid("Invalid departure station ID"),
  arrivalStationId: z.string().uuid("Invalid arrival station ID"),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:mm"),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:mm"),
  dayType: z.enum(["WEEKDAY", "WEEKEND", "HOLIDAY"]).default("WEEKDAY"),
  status: z.enum(["ACTIVE", "CANCELLED", "DELAYED"]).default("ACTIVE"),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
