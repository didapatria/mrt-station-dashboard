import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index";

describe("Health Check", () => {
  it("GET /api/health should return 200", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("running");
  });
});
