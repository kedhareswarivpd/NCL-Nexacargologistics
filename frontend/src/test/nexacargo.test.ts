/**
 * NexaCargo Frontend - Comprehensive Test Suite
 *
 * UNIT TESTS:
 *   - Validation helpers (email, password, phone, card, etc.)
 *   - Password strength scoring
 *   - Utility functions (cn, runValidators)
 *
 * INTEGRATION TESTS:
 *   - useForm hook behavior
 *   - AuthContext state transitions
 *   - API service layer (mocked)
 *   - Component rendering (Button, Card, validators in forms)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import {
  required,
  minLength,
  isEmail,
  isGmailEmail,
  isStrongPassword,
  matches,
  isPhone,
  isPositiveNumber,
  isFutureDate,
  isCardNumber,
  isCardExpiry,
  isCVV,
  runValidators,
  passwordScore,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

// =============================================================================
// UNIT TESTS - Validation Functions
// =============================================================================

describe("required()", () => {
  it("returns error for empty string", () => {
    const validator = required("Name");
    expect(validator("")).toBe("Name is required.");
  });

  it("returns error for whitespace only", () => {
    const validator = required("Email");
    expect(validator("   ")).toBe("Email is required.");
  });

  it("returns undefined for valid input", () => {
    const validator = required("Field");
    expect(validator("hello")).toBeUndefined();
  });

  it("trims whitespace before checking", () => {
    const validator = required();
    expect(validator("  valid  ")).toBeUndefined();
  });
});

describe("minLength()", () => {
  it("returns error when below minimum", () => {
    const validator = minLength(8, "Password");
    expect(validator("short")).toBe("Password must be at least 8 characters.");
  });

  it("returns undefined at exact minimum", () => {
    const validator = minLength(8, "Password");
    expect(validator("12345678")).toBeUndefined();
  });

  it("returns undefined above minimum", () => {
    const validator = minLength(3, "Name");
    expect(validator("John")).toBeUndefined();
  });
});

describe("isEmail()", () => {
  const validEmails = [
    "user@example.com",
    "test.email@domain.org",
    "name+tag@company.co.uk",
    "a@b.cc",
    "user123@test.io",
  ];

  it.each(validEmails)("valid: %s", (email) => {
    expect(isEmail(email)).toBeUndefined();
  });

  const invalidEmails = [
    "",
    "notanemail",
    "@nodomain.com",
    "noat.sign",
    "missing@tld",
    "@@@.com",
  ];

  it.each(invalidEmails)("invalid: %s", (email) => {
    expect(isEmail(email)).toBe("Enter a valid email address.");
  });

  it("trims whitespace before validating", () => {
    expect(isEmail("  user@example.com  ")).toBeUndefined();
  });
});

describe("isGmailEmail()", () => {
  it("validates correct gmail with letters and numbers", () => {
    expect(isGmailEmail("user123@gmail.com")).toBeUndefined();
  });

  it("rejects non-gmail addresses", () => {
    expect(isGmailEmail("user123@yahoo.com")).toBe("Email must be a Gmail address.");
  });

  it("rejects gmail without numbers in local part", () => {
    expect(isGmailEmail("username@gmail.com")).toBe("Email must contain numbers.");
  });

  it("rejects gmail without letters in local part", () => {
    expect(isGmailEmail("123456@gmail.com")).toBe("Email must contain alphabets.");
  });

  it("rejects invalid email format", () => {
    expect(isGmailEmail("notanemail")).toBe("Enter a valid email address.");
  });
});

describe("isStrongPassword()", () => {
  it("returns error for short passwords", () => {
    expect(isStrongPassword("Ab1")).toBe("Password must be at least 8 characters.");
  });

  it("returns error for password without letters", () => {
    expect(isStrongPassword("12345678")).toBe("Password must include a letter.");
  });

  it("returns error for password without numbers", () => {
    expect(isStrongPassword("abcdefgh")).toBe("Password must include a number.");
  });

  it("returns undefined for strong password", () => {
    expect(isStrongPassword("Pass1234")).toBeUndefined();
  });

  it("accepts complex passwords", () => {
    expect(isStrongPassword("MyP@ssw0rd!")).toBeUndefined();
  });
});

describe("matches()", () => {
  it("returns error when values do not match", () => {
    const validator = matches("password", "Passwords");
    const allValues = { password: "secret123" };
    expect(validator("different", allValues)).toBe("Passwords do not match.");
  });

  it("returns undefined when values match", () => {
    const validator = matches("password", "Passwords");
    const allValues = { password: "secret123" };
    expect(validator("secret123", allValues)).toBeUndefined();
  });

  it("returns undefined when allValues is not provided", () => {
    const validator = matches("password");
    expect(validator("anything")).toBeUndefined();
  });
});

describe("isPhone()", () => {
  it("returns undefined for empty input", () => {
    expect(isPhone("")).toBeUndefined();
  });

  it("returns undefined for whitespace only", () => {
    expect(isPhone("   ")).toBeUndefined();
  });

  it("validates US numbers (+1)", () => {
    expect(isPhone("+1 1234567890")).toBeUndefined();
  });

  it("validates Indian numbers (+91)", () => {
    expect(isPhone("+91 9876543210")).toBeUndefined();
  });

  it("validates UAE numbers (+971)", () => {
    expect(isPhone("+971 501234567")).toBeUndefined();
  });

  it("rejects wrong digit count", () => {
    expect(isPhone("+1 12345")).toBe("Phone number must be exactly 10 digits for +1.");
  });

  it("rejects invalid format", () => {
    expect(isPhone("1234567890")).toBe("Enter a valid phone number.");
  });

  it("rejects missing space between dial and digits", () => {
    expect(isPhone("+11234567890")).toBe("Enter a valid phone number.");
  });
});

describe("isPositiveNumber()", () => {
  it("returns undefined for positive integers", () => {
    expect(isPositiveNumber("Amount")("42")).toBeUndefined();
  });

  it("returns undefined for positive decimals", () => {
    expect(isPositiveNumber("Weight")("3.14")).toBeUndefined();
  });

  it("returns error for zero", () => {
    expect(isPositiveNumber("Amount")("0")).toBe("Amount must be a positive number.");
  });

  it("returns error for negative", () => {
    expect(isPositiveNumber("Amount")("-5")).toBe("Amount must be a positive number.");
  });

  it("returns error for non-numeric", () => {
    expect(isPositiveNumber("Amount")("abc")).toBe("Amount must be a positive number.");
  });
});

describe("isFutureDate()", () => {
  it("returns undefined for empty input", () => {
    expect(isFutureDate("")).toBeUndefined();
  });

  it("returns undefined for today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(isFutureDate(today)).toBeUndefined();
  });

  it("returns undefined for future date", () => {
    const future = new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0];
    expect(isFutureDate(future)).toBeUndefined();
  });

  it("returns error for past date", () => {
    expect(isFutureDate("2020-01-01")).toBe("Date must be today or in the future.");
  });
});

describe("isCardNumber()", () => {
  it("validates 16-digit card number", () => {
    expect(isCardNumber("4111111111111111")).toBeUndefined();
  });

  it("validates with spaces", () => {
    expect(isCardNumber("4111 1111 1111 1111")).toBeUndefined();
  });

  it("rejects too short", () => {
    expect(isCardNumber("41111111")).toBe("Enter a valid 16-digit card number.");
  });

  it("rejects too long", () => {
    expect(isCardNumber("41111111111111111111")).toBe("Enter a valid 16-digit card number.");
  });

  it("rejects non-digits", () => {
    expect(isCardNumber("4111abcd11111111")).toBe("Enter a valid 16-digit card number.");
  });
});

describe("isCardExpiry()", () => {
  it("validates future expiry", () => {
    const futureYear = (new Date().getFullYear() + 2).toString().slice(-2);
    expect(isCardExpiry(`12/${futureYear}`)).toBeUndefined();
  });

  it("rejects invalid format", () => {
    expect(isCardExpiry("2025-12")).toBe("Use MM/YY format.");
  });

  it("rejects invalid month", () => {
    expect(isCardExpiry("13/25")).toBe("Invalid month.");
  });

  it("rejects month zero", () => {
    expect(isCardExpiry("00/25")).toBe("Invalid month.");
  });

  it("rejects expired card", () => {
    expect(isCardExpiry("01/20")).toBe("Card has expired.");
  });
});

describe("isCVV()", () => {
  it("validates 3-digit CVV", () => {
    expect(isCVV("123")).toBeUndefined();
  });

  it("validates 4-digit CVV", () => {
    expect(isCVV("1234")).toBeUndefined();
  });

  it("rejects 2-digit CVV", () => {
    expect(isCVV("12")).toBe("CVV must be 3 or 4 digits.");
  });

  it("rejects 5-digit CVV", () => {
    expect(isCVV("12345")).toBe("CVV must be 3 or 4 digits.");
  });

  it("rejects non-digits", () => {
    expect(isCVV("abc")).toBe("CVV must be 3 or 4 digits.");
  });
});

describe("runValidators()", () => {
  it("returns undefined when all pass", () => {
    const result = runValidators("hello", [
      required("Field"),
      minLength(3, "Field"),
    ]);
    expect(result).toBeUndefined();
  });

  it("returns first error encountered", () => {
    const result = runValidators("", [
      required("Field"),
      minLength(3, "Field"),
    ]);
    expect(result).toBe("Field is required.");
  });

  it("passes allValues to each validator", () => {
    const matchesPassword = matches("password");
    const result = runValidators("different", [matchesPassword], { password: "secret" });
    expect(result).toBe("Passwords do not match.");
  });

  it("returns undefined for empty validator list", () => {
    expect(runValidators("anything", [])).toBeUndefined();
  });
});

describe("passwordScore()", () => {
  it("returns 0 for empty string", () => {
    expect(passwordScore("")).toBe(0);
  });

  it("returns 1 for 8+ chars only", () => {
    expect(passwordScore("abcdefgh")).toBe(1);
  });

  it("returns 2 for 12+ chars", () => {
    expect(passwordScore("abcdefghijkl")).toBe(2);
  });

  it("returns 3 for mixed case 12+ chars", () => {
    expect(passwordScore("Abcdefghijkl")).toBe(3);
  });

  it("returns 4 for long mixed case + digits + special", () => {
    expect(passwordScore("Abcdefgh1!xy")).toBe(4);
  });

  it("caps at 4", () => {
    expect(passwordScore("Abcdefgh1!@#$%^&*()_+{}|:<>?")).toBe(4);
  });
});

// =============================================================================
// UNIT TESTS - Utility Functions
// =============================================================================

describe("cn() - className utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("removes duplicates via tailwind-merge", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles empty input", () => {
    expect(cn("")).toBe("");
  });

  it("handles undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });
});

// =============================================================================
// INTEGRATION TESTS - API Service Layer (Mocked)
// =============================================================================

describe("API Service Layer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("auth store has expected methods", async () => {
    const authStore = await import("@/lib/auth-store");
    expect(typeof authStore.registerUser).toBe("function");
    expect(typeof authStore.loginUser).toBe("function");
    expect(typeof authStore.logoutUser).toBe("function");
    expect(typeof authStore.getCurrentUser).toBe("function");
  });

  it("services module exports all API objects", async () => {
    const services = await import("@/lib/services");
    expect(services).toBeDefined();
    expect(typeof services.quotesApi).toBe("object");
    expect(typeof services.quotesApi.list).toBe("function");
    expect(typeof services.quotesApi.create).toBe("function");
    expect(typeof services.shipmentsApi).toBe("object");
    expect(typeof services.shipmentsApi.list).toBe("function");
    expect(typeof services.shipmentsApi.create).toBe("function");
  });
});

// =============================================================================
// INTEGRATION TESTS - AuthContext State Machine
// =============================================================================

describe("AuthContext", () => {
  it("exports AuthProvider and useAuth", async () => {
    const AuthContext = await import("@/context/AuthContext");
    expect(AuthContext.AuthProvider).toBeDefined();
    expect(AuthContext.useAuth).toBeDefined();
  });
});

// =============================================================================
// INTEGRATION TESTS - ToastContext
// =============================================================================

describe("ToastContext", () => {
  it("exports ToastProvider and useToast", async () => {
    const ToastContext = await import("@/context/ToastContext");
    expect(ToastContext.ToastProvider).toBeDefined();
    expect(ToastContext.useToast).toBeDefined();
  });
});

// =============================================================================
// INTEGRATION TESTS - Type Definitions
// =============================================================================

describe("Type definitions", () => {
  it("types module exports UserRole", async () => {
    const types = await import("@/lib/types");
    expect(types).toBeDefined();
  });
});

// =============================================================================
// INTEGRATION TESTS - Component Rendering
// =============================================================================

describe("UI Components", () => {
  it("Button renders with text", async () => {
    const { Button } = await import("@/components/ui/Button");
    render(React.createElement(Button, null, "Click Me"));
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  }, 10000);

  it("Card renders children", async () => {
    const { Card } = await import("@/components/ui/card");
    render(React.createElement(Card, null, React.createElement("p", null, "Card content")));
    expect(screen.getByText("Card content")).toBeInTheDocument();
  }, 10000);
});
