import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getBufferedProductEvents,
  setAnalyticsProvider,
  trackProductEvent,
} from "@/lib/analytics/analytics-service";

describe("discovery_filter_used", () => {
  beforeEach(() => {
    setAnalyticsProvider({ id: "noop", track: vi.fn() });
  });

  it("records filter type and value on intentional change", () => {
    trackProductEvent("discovery_filter_used", { filter: "spirit", value: "gin" });
    const event = getBufferedProductEvents().find((e) => e.name === "discovery_filter_used");
    expect(event?.payload).toEqual({ filter: "spirit", value: "gin" });
  });
});
