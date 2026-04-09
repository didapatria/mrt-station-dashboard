import { z } from "zod";

export const createStationSchema = z.object({
  name: z
    .string()
    .min(2, "Station name must be at least 2 characters")
    .max(100, "Station name must be at most 100 characters"),
  code: z
    .string()
    .min(2, "Station code must be at least 2 characters")
    .max(10, "Station code must be at most 10 characters")
    .toUpperCase(),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be at most 200 characters"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).default("ACTIVE"),
  order: z.number().int().min(1, "Order must be at least 1"),
});

export const updateStationSchema = createStationSchema.partial();

export type CreateStationInput = z.infer<typeof createStationSchema>;
export type UpdateStationInput = z.infer<typeof updateStationSchema>;
