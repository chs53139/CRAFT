import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";

function trim(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getSupabaseServiceRoleKey(): string {
  return trim(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createServiceRoleClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
