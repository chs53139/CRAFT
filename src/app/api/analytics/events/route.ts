import { readJsonObject } from "@/lib/request-json";
import { NextResponse } from "next/server";
import { enrichProductEvent } from "@/lib/analytics/enrich-event";
import {
  isPersistedProductEventName,
  sanitizeAnalyticsPayload,
} from "@/lib/analytics/sanitize-payload";
import { ProductEventName, ProductEventPayload } from "@/lib/analytics/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type IncomingEvent = {
  name: ProductEventName;
  payload: ProductEventPayload[ProductEventName];
  at: string;
};

export async function POST(request: Request) {
  const parsed = await readJsonObject(request, 24 * 1024);
  if (parsed.status !== 200) return NextResponse.json({ ok: false }, { status: parsed.status });
  const { sessionId: rawSessionId, events = [] } = parsed.body;
  if (typeof rawSessionId !== "string" || !Array.isArray(events) || events.length > 12 || events.some((event) => {
    return !event || typeof event !== "object" || Array.isArray(event) || typeof event.name !== "string" ||
      typeof event.at !== "string" || !Number.isFinite(Date.parse(event.at)) ||
      !event.payload || typeof event.payload !== "object" || Array.isArray(event.payload);
  })) return NextResponse.json({ ok: false }, { status: 400 });
  const sessionId = rawSessionId.trim().slice(0, 64);
  if (!sessionId || events.length === 0) {
    return NextResponse.json({ ok: true, stored: 0 });
  }

  const rows = (events as IncomingEvent[]).flatMap((raw) => {
    if (!isPersistedProductEventName(raw.name)) return [];
    const payload = enrichProductEvent(raw.name, raw.payload);
    return [
      {
        session_id: sessionId,
        event_name: raw.name,
        payload: sanitizeAnalyticsPayload(payload as Record<string, unknown>),
        created_at: raw.at,
      },
    ];
  });

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, stored: 0 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, stored: 0, reason: "analytics_backend_unconfigured" });
  }

  const { error } = await supabase.from("product_events").insert(rows);
  if (error) {
    return NextResponse.json({ ok: true, stored: 0, reason: "insert_failed" });
  }

  return NextResponse.json({ ok: true, stored: rows.length });
}
