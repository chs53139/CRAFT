"use client";

import { setAnalyticsProvider } from "@/lib/analytics/analytics-service";
import { persistAnalyticsProvider } from "@/lib/analytics/providers/persist-analytics-provider";

let booted = false;

/** Wire persistent provider when running in browser (API no-ops if backend unavailable). */
export function bootstrapAnalytics(): void {
  if (booted || typeof window === "undefined") return;
  booted = true;
  setAnalyticsProvider(persistAnalyticsProvider);
}
