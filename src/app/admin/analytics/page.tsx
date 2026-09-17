import { redirect } from "next/navigation";
import { CraftPulseClient } from "@/app/admin/analytics/CraftPulseClient";
import {
  isAnalyticsAdminConfigured,
  verifyAnalyticsAdminCookie,
} from "@/lib/admin/analytics-auth";

export default async function AdminAnalyticsPage() {
  if (!isAnalyticsAdminConfigured()) {
    return (
      <div className="app-screen">
        <h1 className="screen-title-large">CRAFT Pulse</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>
            In Supabase SQL editor, run{" "}
            <code className="text-[var(--foreground)]">006_product_events.sql</code> then{" "}
            <code className="text-[var(--foreground)]">007_product_events_retention.sql</code>.
          </li>
          <li>
            In Vercel → Project → Settings → Environment Variables, set{" "}
            <code className="text-[var(--foreground)]">SUPABASE_SERVICE_ROLE_KEY</code> (secret,
            from Supabase → Settings → API) and{" "}
            <code className="text-[var(--foreground)]">CRAFT_ANALYTICS_ADMIN_TOKEN</code> (choose a
            long random string, ≥16 characters).
          </li>
          <li>Redeploy, then sign in at /admin/analytics/login.</li>
        </ol>
      </div>
    );
  }

  const allowed = await verifyAnalyticsAdminCookie();
  if (!allowed) {
    redirect("/admin/analytics/login");
  }

  return <CraftPulseClient />;
}
