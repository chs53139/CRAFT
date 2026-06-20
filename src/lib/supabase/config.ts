function trim(value: string | undefined): string {
  return (value ?? "").trim();
}

export function normalizeSupabaseUrl(raw: string): string | null {
  const trimmed = trim(raw);
  if (!trimmed) return null;

  if (trimmed.includes("supabase.com/dashboard") || trimmed.includes("app.supabase.com")) {
    return null;
  }

  const baseMatch = trimmed.match(/^(https?:\/\/[a-z0-9-]+\.supabase\.co)/i);
  if (baseMatch) return baseMatch[1];

  if (/^[a-z0-9-]+\.supabase\.co\/?$/i.test(trimmed)) {
    return `https://${trimmed.replace(/\/+$/, "")}`;
  }

  return null;
}

export function getSupabaseUrl(): string {
  return normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") ?? "";
}

export function getSupabaseAnonKey(): string {
  return trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseConfigError(): string | null {
  const rawUrl = trim(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseAnonKey();

  if (!rawUrl || !key) {
    return "This site is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.";
  }

  if (rawUrl.includes("your-project") || key === "your-anon-key") {
    return "Supabase keys are still placeholders. In Vercel → Settings → Environment Variables, paste your real Project URL and anon key from Supabase → Project Settings → Data API, then redeploy.";
  }

  if (rawUrl.includes("vercel.app")) {
    return "That looks like your CRAFT website URL. For NEXT_PUBLIC_SUPABASE_URL, paste the Supabase Project URL from Supabase → Project Settings → Data API (ends in .supabase.co).";
  }

  if (rawUrl.includes("supabase.com/dashboard") || rawUrl.includes("app.supabase.com")) {
    return "That looks like a Supabase dashboard link. Copy the Project URL from Project Settings → Data API instead (looks like https://abcdefgh.supabase.co).";
  }

  if (!normalizeSupabaseUrl(rawUrl)) {
    if (rawUrl.includes("/rest/v1") || rawUrl.includes("/auth/v1")) {
      return "Use only the base Project URL, without /rest/v1 or /auth/v1. Example: https://abcdefgh.supabase.co";
    }

    return "Supabase URL looks wrong. In Supabase → Project Settings → Data API, copy the Project URL. It should look like https://abcdefgh.supabase.co";
  }

  if (!key.startsWith("eyJ") && !key.startsWith("sb_publishable_")) {
    return "API key looks wrong. Copy the anon or publishable key from Supabase → API keys (not the secret or service_role key).";
  }

  return null;
}

export function humanizeAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid path specified")) {
    return "Supabase rejected this site's URL. In Supabase → Authentication → URL Configuration, set Site URL to your Vercel link and add https://YOUR-SITE.vercel.app/auth/callback under Redirect URLs.";
  }

  if (lower.includes("invalid api key")) {
    return "Supabase API key is wrong. Copy the anon or publishable key from Supabase → API keys into Vercel, then redeploy.";
  }

  if (lower.includes("signup is disabled")) {
    return "Sign-ups are turned off in Supabase. Go to Authentication → Providers → Email and enable sign-ups.";
  }

  return message;
}
