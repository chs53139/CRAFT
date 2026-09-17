import { NextResponse } from "next/server";
import { enrichProductEvent } from "@/lib/analytics/enrich-event";
import { ProductEventName, ProductEventPayload } from "@/lib/analytics/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type IncomingEvent = {
  name: ProductEventName;
  payload: ProductEventPayload[ProductEventName];
  at: string;
};

type Body = {
  events?: IncomingEvent[];
  sessionId?: string;
};

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...payload };
  for (const key of Object.keys(copy)) {
    if (/zip|postal|email|lat|lng|geo|location/i.test(key)) {
      delete copy[key];
    }
  }
  return copy;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = (body.sessionId ?? "").trim().slice(0, 64);
  const events = body.events ?? [];
  if (!sessionId || events.length === 0) {
    return NextResponse.json({ ok: true, stored: 0 });
  }

  const rows = events.slice(0, 12).map((raw) => {
    const payload = enrichProductEvent(raw.name, raw.payload);
    return {
      session_id: sessionId,
      event_name: raw.name,
      payload: sanitizePayload(payload as Record<string, unknown>),
      created_at: raw.at,
    };
  });

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
