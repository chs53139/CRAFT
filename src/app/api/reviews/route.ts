import { NextRequest } from "next/server";
import { humanizeReviewError } from "@/lib/review-errors";
import { getSupabaseConfigError } from "@/lib/supabase/config";
import {
  fetchReviewsForCocktail,
  isReviewsTableMissing,
  upsertCocktailReview,
} from "@/lib/supabase/reviews-sync";
import { createClient } from "@/lib/supabase/server";
import { CocktailReviewInput } from "@/lib/types";

type ReviewBody = {
  cocktailId?: string;
  rating?: number;
  text?: string;
  wouldMakeAgain?: boolean;
};

function parseReviewInput(body: ReviewBody): { cocktailId: string; input: CocktailReviewInput } | null {
  const cocktailId = body.cocktailId?.trim();
  const rating = body.rating;
  const wouldMakeAgain = body.wouldMakeAgain;

  if (!cocktailId || typeof rating !== "number" || typeof wouldMakeAgain !== "boolean") {
    return null;
  }

  if (rating < 1 || rating > 5) return null;

  return {
    cocktailId,
    input: {
      rating,
      text: typeof body.text === "string" ? body.text : "",
      wouldMakeAgain,
    },
  };
}

export async function GET(request: NextRequest) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return Response.json({ error: configError }, { status: 503 });
  }

  const cocktailId = request.nextUrl.searchParams.get("cocktailId")?.trim();
  if (!cocktailId) {
    return Response.json({ error: "cocktailId is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const reviews = await fetchReviewsForCocktail(supabase, cocktailId, user?.id);
    return Response.json({ reviews });
  } catch (error) {
    if (isReviewsTableMissing(error)) {
      return Response.json({ reviewsUnavailable: true, reviews: [] });
    }
    return Response.json(
      { error: humanizeReviewError(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return Response.json({ error: configError }, { status: 503 });
  }

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseReviewInput(body);
  if (!parsed) {
    return Response.json(
      { error: "cocktailId, rating (1–5), and wouldMakeAgain are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to review." }, { status: 401 });
  }

  try {
    await upsertCocktailReview(supabase, user.id, parsed.cocktailId, parsed.input);
    const reviews = await fetchReviewsForCocktail(supabase, parsed.cocktailId, user.id);
    return Response.json({ ok: true, reviews });
  } catch (error) {
    if (isReviewsTableMissing(error)) {
      return Response.json(
        { error: "Reviews are not enabled on this server yet.", reviewsUnavailable: true },
        { status: 503 }
      );
    }

    return Response.json({ error: humanizeReviewError(error) }, { status: 400 });
  }
}
