import { getSupabaseConfigError, humanizeAuthError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return Response.json({ error: configError }, { status: 503 });
  }

  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return Response.json({ error: humanizeAuthError(error.message) }, { status: 400 });
  }

  return Response.json({ ok: true });
}
