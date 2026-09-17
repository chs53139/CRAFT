import { describe, expect, it } from "vitest";
import {
  humanizeSupabaseUnavailable,
  isSupabaseUnavailableError,
  SupabaseTimeoutError,
  withTimeout,
} from "@/lib/supabase/resilience";

describe("supabase resilience", () => {
  it("detects timeout and network failures", () => {
    expect(isSupabaseUnavailableError(new SupabaseTimeoutError())).toBe(true);
    expect(isSupabaseUnavailableError({ message: "fetch failed" })).toBe(true);
    expect(isSupabaseUnavailableError({ message: "Project is inactive" })).toBe(true);
  });

  it("times out long-running promises", async () => {
    await expect(
      withTimeout(new Promise(() => {}), 20)
    ).rejects.toBeInstanceOf(SupabaseTimeoutError);
  });

  it("returns a friendly offline message", () => {
    expect(humanizeSupabaseUnavailable(new SupabaseTimeoutError())).toContain("device");
  });
});
