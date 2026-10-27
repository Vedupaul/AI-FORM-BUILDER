import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import * as userRepo from "../../repositories/user.repo.js";
import bcrypt from "bcryptjs";

describe("Integration Tests: API Routes with Supertest", () => {
  it("GET /api/health should return 200 and healthy status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is healthy");
    expect(res.body.uptime).toBeDefined();
  });

  it("POST /api/auth/register should return 400 when body is missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login should return 401 when user is not found", async () => {
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("POST /api/auth/login should return 200 and JWT token on valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("validPassword123", 10);
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      _id: "user-123",
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      avatarColor: "#0c8b7c",
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "validPassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("test@example.com");
  });

  it("GET /api/forms should reject requests with no authorization header (401)", async () => {
    const res = await request(app).get("/api/forms");
    expect(res.status).toBe(401);
  });

  it("GET /api/unknown-route should return 404 for undefined endpoints", async () => {
    const res = await request(app).get("/api/non-existent-endpoint-xyz");
    expect(res.status).toBe(404);
  });
});
