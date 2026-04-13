import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index";

describe("Auth Endpoints", () => {
  it("POST /api/auth/login should reject empty body", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login should reject invalid email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register should reject short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@test.com",
      password: "12",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/profile should require auth", async () => {
    const res = await request(app).get("/api/auth/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("token");
  });

  it("GET /api/auth/profile should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
