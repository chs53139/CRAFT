import { getSupabaseConfigError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return Response.json({ ok: false, message: configError });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      return Response.json({
        ok: false,
        message: `Supabase connection failed: ${error.message}`,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({
      ok: false,
      message: "Could not reach Supabase. Check your API keys in Vercel and redeploy.",
    });
  }
}
