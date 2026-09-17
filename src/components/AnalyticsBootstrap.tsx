"use client";

import { useEffect } from "react";
import { bootstrapAnalytics } from "@/lib/analytics/bootstrap-analytics";

export function AnalyticsBootstrap() {
  useEffect(() => {
    bootstrapAnalytics();
  }, []);
  return null;
}
