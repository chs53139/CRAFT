import { NextResponse } from "next/server";
import { buildCraftPulseSummary, ProductEventRow } from "@/lib/analytics/aggregates";
import { verifyAnalyticsAdminCookie } from "@/lib/admin/analytics-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET() {
  const allowed = await verifyAnalyticsAdminCookie();
  if (!allowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "analytics_backend_unconfigured" }, { status: 503 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("product_events")
    .select("event_name,payload,created_at,session_id")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const summary = buildCraftPulseSummary((data ?? []) as ProductEventRow[], 7);
  return NextResponse.json(summary);
}
