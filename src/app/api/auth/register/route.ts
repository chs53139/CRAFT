import { getSupabaseConfigError, humanizeAuthError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return Response.json({ error: configError }, { status: 503 });
  }

  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name || null },
    },
  });

  if (error) {
    return Response.json({ error: humanizeAuthError(error.message) }, { status: 400 });
  }

  return Response.json({
    session: !!data.session,
    needsEmailConfirmation: !data.session && !!data.user,
  });
}
