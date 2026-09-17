import { describe, expect, it } from "vitest";
import { normalizeSearchKey } from "@/lib/analytics/search-key";

describe("normalizeSearchKey", () => {
  it("aggregates case and whitespace variants", () => {
    expect(normalizeSearchKey("division bell")).toBe("division bell");
    expect(normalizeSearchKey("Division Bell")).toBe("division bell");
    expect(normalizeSearchKey(" division bell ")).toBe("division bell");
    expect(normalizeSearchKey("division   bell")).toBe("division bell");
  });

  it("preserves distinct queries", () => {
    expect(normalizeSearchKey("division bell")).not.toBe(normalizeSearchKey("bell division"));
  });
});
