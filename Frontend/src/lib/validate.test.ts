import { describe, it, expect } from "vitest";
import { validateField, validateForm } from "./validate";

describe("Frontend Unit Tests: Client Validation Engine", () => {
  it("should return required error when value is empty and required=true", () => {
    const field = { id: "f1", label: "Full Name", required: true, type: "short_text" };
    expect(validateField(field, "")).toBe("Full Name is required");
    expect(validateField(field, null)).toBe("Full Name is required");
    expect(validateField(field, undefined)).toBe("Full Name is required");
    expect(validateField(field, [])).toBe("Full Name is required");
  });

  it("should return null for optional empty fields", () => {
    const field = { id: "f1", label: "Nickname", required: false, type: "short_text" };
    expect(validateField(field, "")).toBeNull();
    expect(validateField(field, null)).toBeNull();
  });

  it("should validate email format", () => {
    const field = { id: "f2", label: "Email", required: true, type: "email" };
    expect(validateField(field, "hello@world.com")).toBeNull();
    expect(validateField(field, "plainaddress")).toBe("Please enter a valid email address");
  });

  it("should validate URL format", () => {
    const field = { id: "f3", label: "Website", required: true, type: "url" };
    expect(validateField(field, "https://example.com")).toBeNull();
    expect(validateField(field, "http://localhost:3000")).toBeNull();
    expect(validateField(field, "ftp://invalid")).toBe("Please enter a valid URL (https://…)");
    expect(validateField(field, "not-a-url")).toBe("Please enter a valid URL (https://…)");
  });

  it("should validate length boundaries", () => {
    const field = {
      id: "f4",
      label: "Bio",
      type: "long_text",
      validation: { minLength: 5, maxLength: 10 },
    };
    expect(validateField(field, "1234")).toBe("Must be at least 5 characters");
    expect(validateField(field, "12345")).toBeNull();
    expect(validateField(field, "1234567890")).toBeNull();
    expect(validateField(field, "12345678901")).toBe("Must be at most 10 characters");
  });

  it("should validate entire form questions and skip static content fields", () => {
    const questions = [
      { id: "q_head", type: "heading", label: "Header", required: true },
      { id: "q1", type: "short_text", label: "Name", required: true },
      { id: "q2", type: "email", label: "Email", required: true },
    ];

    const errors = validateForm(questions, { q1: "Alice", q2: "" });
    expect(errors["q_head"]).toBeUndefined(); // skipped because it's static
    expect(errors["q1"]).toBeUndefined();
    expect(errors["q2"]).toBe("Email is required");
  });
});
