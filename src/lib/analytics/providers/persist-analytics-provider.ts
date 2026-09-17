import { getAnalyticsSessionId } from "@/lib/analytics/session-id";
import { AnalyticsProvider, ProductEvent } from "@/lib/analytics/types";

const FLUSH_MS = 1200;
const MAX_BATCH = 8;

const queue: ProductEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function postEvents(events: ProductEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getAnalyticsSessionId(), events }),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const batch = queue.splice(0, MAX_BATCH);
    void postEvents(batch);
    if (queue.length > 0) scheduleFlush();
  }, FLUSH_MS);
}

export const persistAnalyticsProvider: AnalyticsProvider = {
  id: "craft-supabase-api",
  track(event: ProductEvent) {
    queue.push(event);
    if (queue.length >= MAX_BATCH) {
      const batch = queue.splice(0, MAX_BATCH);
      void postEvents(batch);
    } else {
      scheduleFlush();
    }
  },
};
