import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "craft_analytics_admin";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getAnalyticsAdminTokenEnv(): string {
  return (process.env.CRAFT_ANALYTICS_ADMIN_TOKEN ?? "").trim();
}

export function isAnalyticsAdminConfigured(): boolean {
  return getAnalyticsAdminTokenEnv().length >= 16;
}

export async function verifyAnalyticsAdminCookie(): Promise<boolean> {
  const expected = getAnalyticsAdminTokenEnv();
  if (!expected) return false;
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value ?? "";
  if (!raw) return false;
  try {
    const a = Buffer.from(hashToken(raw));
    const b = Buffer.from(hashToken(expected));
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function analyticsAdminCookieValue(token: string): string {
  return token.trim();
}

export { COOKIE_NAME as ANALYTICS_ADMIN_COOKIE_NAME };
