import { describe, expect, it } from "vitest";
import { isValidPostalCode, normalizePostalCode } from "@/lib/commerce/postal-code";

describe("postal code validation", () => {
  it("accepts 5-digit and ZIP+4", () => {
    expect(isValidPostalCode("91384")).toBe(true);
    expect(isValidPostalCode("94110-1234")).toBe(true);
    expect(isValidPostalCode("abc")).toBe(false);
  });

  it("normalizes trimmed input", () => {
    expect(normalizePostalCode("  91384  ")).toBe("91384");
  });
});
