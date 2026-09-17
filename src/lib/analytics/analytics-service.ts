import { enrichProductEvent } from "@/lib/analytics/enrich-event";
import { AnalyticsProvider, ProductEvent, ProductEventName, ProductEventPayload } from "@/lib/analytics/types";

const noopProvider: AnalyticsProvider = {
  id: "noop",
  track() {},
};

let provider: AnalyticsProvider = noopProvider;
const buffer: ProductEvent[] = [];
const MAX_BUFFER = 40;

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

export function getBufferedProductEvents(): readonly ProductEvent[] {
  return buffer;
}

/** Non-blocking; never throws to callers. ZIP and precise geo are never attached. */
export function trackProductEvent<Name extends ProductEventName>(
  name: Name,
  payload: ProductEventPayload[Name]
): void {
  const event = {
    name,
    payload: enrichProductEvent(name, payload),
    at: new Date().toISOString(),
  } as ProductEvent;

  buffer.push(event);
  if (buffer.length > MAX_BUFFER) buffer.shift();

  queueMicrotask(() => {
    try {
      void provider.track(event);
    } catch {
      /* analytics must not break UI */
    }
  });
}
