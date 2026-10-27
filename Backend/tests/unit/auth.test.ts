import { describe, it, expect, vi } from "vitest";
import { registerUser, pickAvatarColor, toPublicUser } from "../../services/auth.service.js";
import { ApiError } from "../../utils/ApiError.js";
import * as userRepo from "../../repositories/user.repo.js";

describe("Unit Tests: Auth Service", () => {
  it("should deterministically pick avatar colors from seed string", () => {
    const c1 = pickAvatarColor("test@example.com");
    const c2 = pickAvatarColor("test@example.com");
    expect(c1).toBe(c2);
    expect(c1).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("should reject registration with name shorter than 2 characters", async () => {
    await expect(
      registerUser({ name: "A", email: "valid@example.com", password: "password123" })
    ).rejects.toThrow(ApiError);
  });

  it("should reject registration with invalid email", async () => {
    await expect(
      registerUser({ name: "Alice", email: "invalid-email", password: "password123" })
    ).rejects.toThrow(ApiError);
  });

  it("should reject registration with password shorter than 6 characters (Boundary)", async () => {
    await expect(
      registerUser({ name: "Alice", email: "alice@example.com", password: "12345" })
    ).rejects.toThrow(ApiError);
  });

  it("should reject registration when email already exists", async () => {
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      _id: "u1",
      id: "u1",
      name: "Existing User",
      email: "alice@example.com",
      password: "hashed",
      avatarColor: "#000",
      createdAt: new Date(),
    } as any);

    await expect(
      registerUser({ name: "Alice", email: "alice@example.com", password: "password123" })
    ).rejects.toThrow("An account with this email already exists");
  });

  it("should correctly format public user without leaking password", () => {
    const publicUser = toPublicUser({
      _id: "u1",
      id: "u1",
      name: "Alice",
      email: "alice@example.com",
      password: "secret_hash",
      avatarColor: "#4f46e5",
      createdAt: new Date(),
    } as any);

    expect(publicUser.id).toBe("u1");
    expect(publicUser.name).toBe("Alice");
    expect(publicUser.email).toBe("alice@example.com");
    expect((publicUser as any).password).toBeUndefined();
  });
});
