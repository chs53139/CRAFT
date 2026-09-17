import { NextResponse } from "next/server";
import {
  ANALYTICS_ADMIN_COOKIE_NAME,
  analyticsAdminCookieValue,
  getAnalyticsAdminTokenEnv,
  isAnalyticsAdminConfigured,
} from "@/lib/admin/analytics-auth";

export async function POST(request: Request) {
  if (!isAnalyticsAdminConfigured()) {
    return NextResponse.json({ error: "admin_not_configured" }, { status: 503 });
  }

  let token = "";
  try {
    const body = (await request.json()) as { token?: string };
    token = (body.token ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const expected = getAnalyticsAdminTokenEnv();
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ANALYTICS_ADMIN_COOKIE_NAME, analyticsAdminCookieValue(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
