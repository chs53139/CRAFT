"use client";

import { useEffect, useRef } from "react";
import { bumpSessionCount } from "@/lib/pwa/engagement";

/** One session bump per browser tab load (not every render). */
export function EngagementTracker() {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    bumpSessionCount();
  }, []);

  return null;
}
