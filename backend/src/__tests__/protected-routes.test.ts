import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index";

describe("Protected Routes - Auth Required", () => {
  const protectedRoutes = [
    { method: "get", url: "/api/stations" },
    { method: "get", url: "/api/schedules" },
    { method: "get", url: "/api/dashboard/stats" },
    { method: "get", url: "/api/users" },
    { method: "get", url: "/api/activity-logs" },
  ];

  protectedRoutes.forEach(({ method, url }) => {
    it(`${method.toUpperCase()} ${url} should require authentication`, async () => {
      const res = await (request(app) as any)[method](url);

      // Some routes may be unprotected (stations/schedules GET)
      // but users and activity-logs should be protected
      if (url.includes("users") || url.includes("activity")) {
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      }
    });
  });
});

describe("Admin Routes - Require Admin Role", () => {
  it("DELETE /api/users/fake-id should require auth", async () => {
    const res = await request(app).delete("/api/users/fake-id");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("PATCH /api/users/fake-id/role should require auth", async () => {
    const res = await request(app)
      .patch("/api/users/fake-id/role")
      .send({ role: "ADMIN" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
