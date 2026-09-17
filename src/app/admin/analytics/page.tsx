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
        <p className="mt-4 text-sm text-[var(--muted)]">
          Set <code className="text-[var(--foreground)]">CRAFT_ANALYTICS_ADMIN_TOKEN</code> and{" "}
          <code className="text-[var(--foreground)]">SUPABASE_SERVICE_ROLE_KEY</code> on the server,
          apply migration <code className="text-[var(--foreground)]">006_product_events.sql</code>,
          then reload.
        </p>
      </div>
    );
  }

  const allowed = await verifyAnalyticsAdminCookie();
  if (!allowed) {
    redirect("/admin/analytics/login");
  }

  return <CraftPulseClient />;
}
