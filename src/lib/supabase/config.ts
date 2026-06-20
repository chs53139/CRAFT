export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return "This site is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.";
  }

  if (url.includes("your-project") || key === "your-anon-key") {
    return "Supabase keys are still placeholders. In Vercel → Settings → Environment Variables, paste your real Project URL and anon key from Supabase → Project Settings → API, then redeploy.";
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
    return "Supabase URL looks wrong. It should look like https://abcdefgh.supabase.co (from Supabase → Project Settings → API).";
  }

  return null;
}

export function humanizeAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid path specified")) {
    return "Supabase rejected this site's URL. In Supabase → Authentication → URL Configuration, set Site URL to your Vercel link and add https://YOUR-SITE.vercel.app/auth/callback under Redirect URLs.";
  }

  if (lower.includes("invalid api key")) {
    return "Supabase API key is wrong. Copy the anon public key from Supabase → Project Settings → API into Vercel, then redeploy.";
  }

  if (lower.includes("signup is disabled")) {
    return "Sign-ups are turned off in Supabase. Go to Authentication → Providers → Email and enable sign-ups.";
  }

  return message;
}
