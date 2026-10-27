import { describe, it, expect } from "vitest";
import { validateAnswer } from "../../services/response.service.js";
import { Question } from "../../types/index.js";
import { ApiError } from "../../utils/ApiError.js";

describe("Unit Tests: Form Answer Validation (validateAnswer)", () => {
  it("should pass for valid email", () => {
    const q: Question = {
      id: "q1",
      type: "email",
      label: "Email",
      required: true,
      options: [],
    };
    expect(() => validateAnswer(q, "test@example.com")).not.toThrow();
  });

  it("should fail for invalid email format", () => {
    const q: Question = {
      id: "q1",
      type: "email",
      label: "Email",
      required: true,
      options: [],
    };
    expect(() => validateAnswer(q, "invalid-email")).toThrow(ApiError);
    expect(() => validateAnswer(q, "user@domain")).toThrow(ApiError);
  });

  it("should enforce string length boundaries (minLength & maxLength)", () => {
    const q: Question = {
      id: "q2",
      type: "short_text",
      label: "Username",
      required: true,
      options: [],
      validation: { minLength: 3, maxLength: 8, message: "Length invalid" },
    };

    // Below minimum
    expect(() => validateAnswer(q, "ab")).toThrow(ApiError);

    // Exact minimum
    expect(() => validateAnswer(q, "abc")).not.toThrow();

    // Exact maximum
    expect(() => validateAnswer(q, "12345678")).not.toThrow();

    // Above maximum
    expect(() => validateAnswer(q, "123456789")).toThrow(ApiError);
  });

  it("should enforce number boundaries (min, max, NaN)", () => {
    const q: Question = {
      id: "q3",
      type: "number",
      label: "Age",
      required: true,
      options: [],
      validation: { min: 18, max: 65 },
    };

    expect(() => validateAnswer(q, "not-a-number")).toThrow(ApiError);
    expect(() => validateAnswer(q, 17)).toThrow(ApiError);
    expect(() => validateAnswer(q, 18)).not.toThrow();
    expect(() => validateAnswer(q, 40)).not.toThrow();
    expect(() => validateAnswer(q, 65)).not.toThrow();
    expect(() => validateAnswer(q, 66)).toThrow(ApiError);
  });

  it("should validate option field against allowed choices", () => {
    const q: Question = {
      id: "q4",
      type: "dropdown",
      label: "Plan",
      required: true,
      options: [
        { id: "o1", label: "Free", value: "" },
        { id: "o2", label: "Pro", value: "" },
      ],
    };

    expect(() => validateAnswer(q, "Free")).not.toThrow();
    expect(() => validateAnswer(q, "Pro")).not.toThrow();
    // Tampered choice
    expect(() => validateAnswer(q, "Enterprise")).toThrow(ApiError);
  });

  it("should match custom regex patterns", () => {
    const q: Question = {
      id: "q5",
      type: "short_text",
      label: "Zip Code",
      required: true,
      options: [],
      validation: { pattern: "^[0-9]{5}$", message: "Must be 5 digits" },
    };

    expect(() => validateAnswer(q, "12345")).not.toThrow();
    expect(() => validateAnswer(q, "1234")).toThrow(ApiError);
    expect(() => validateAnswer(q, "123456")).toThrow(ApiError);
    expect(() => validateAnswer(q, "abcde")).toThrow(ApiError);
  });
});
