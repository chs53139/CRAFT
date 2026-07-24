import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReviewAuthorLabel } from "@/lib/reviewer-names";
import { CocktailReview, CocktailReviewInput } from "@/lib/types";

type ReviewRow = {
  id: string;
  cocktail_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  would_make_again: boolean;
  created_at: string;
  author_name?: string | null;
};

const REVIEW_COLUMNS =
  "id, cocktail_id, user_id, rating, review_text, would_make_again, created_at, author_name";

function mapReviewRow(row: ReviewRow, currentUserId?: string): CocktailReview {
  const isOwn = !!currentUserId && row.user_id === currentUserId;

  return {
    id: row.id,
    cocktailId: row.cocktail_id,
    userId: row.user_id,
    rating: row.rating,
    text: row.review_text ?? "",
    wouldMakeAgain: row.would_make_again,
    createdAt: row.created_at,
    authorLabel: formatReviewAuthorLabel(row.author_name ?? undefined, isOwn),
    isOwn,
  };
}

export function isReviewsTableMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "42P01" ||
    e.code === "PGRST205" ||
    (typeof e.message === "string" &&
      e.message.toLowerCase().includes("reviews") &&
      (e.message.includes("does not exist") || e.message.includes("Could not find")))
  );
}

function isAuthorNameColumnMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "42703" ||
    (typeof e.message === "string" &&
      e.message.toLowerCase().includes("author_name") &&
      e.message.toLowerCase().includes("does not exist"))
  );
}

export async function fetchReviewsForCocktail(
  supabase: SupabaseClient,
  cocktailId: string,
  currentUserId?: string
): Promise<CocktailReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("cocktail_id", cocktailId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isAuthorNameColumnMissing(error)) {
      const fallback = await supabase
        .from("reviews")
        .select("id, cocktail_id, user_id, rating, review_text, would_make_again, created_at")
        .eq("cocktail_id", cocktailId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (fallback.error) throw fallback.error;
      return (fallback.data ?? []).map((row) => mapReviewRow(row as ReviewRow, currentUserId));
    }
    throw error;
  }

  return (data ?? []).map((row) => mapReviewRow(row as ReviewRow, currentUserId));
}

export async function fetchUserReviews(
  supabase: SupabaseClient,
  userId: string
): Promise<CocktailReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isAuthorNameColumnMissing(error)) {
      const fallback = await supabase
        .from("reviews")
        .select("id, cocktail_id, user_id, rating, review_text, would_make_again, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (fallback.error) throw fallback.error;
      return (fallback.data ?? []).map((row) => mapReviewRow(row as ReviewRow, userId));
    }
    throw error;
  }

  return (data ?? []).map((row) => mapReviewRow(row as ReviewRow, userId));
}

export async function upsertCocktailReview(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string,
  input: CocktailReviewInput,
  authorName?: string
): Promise<void> {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const review_text = input.text.trim().slice(0, 280);
  const author_name = authorName?.trim() ?? "";
  const payload = {
    cocktail_id: cocktailId,
    user_id: userId,
    rating,
    review_text,
    would_make_again: input.wouldMakeAgain,
    author_name,
  };

  const { data: existing, error: lookupError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("cocktail_id", cocktailId)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await supabase
      .from("reviews")
      .update({
        rating,
        review_text,
        would_make_again: input.wouldMakeAgain,
        author_name,
      })
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (error) {
      if (isAuthorNameColumnMissing(error)) {
        const { error: fallbackError } = await supabase
          .from("reviews")
          .update({
            rating,
            review_text,
            would_make_again: input.wouldMakeAgain,
          })
          .eq("id", existing.id)
          .eq("user_id", userId);
        if (fallbackError) throw fallbackError;
        return;
      }
      throw error;
    }
    return;
  }

  const { error } = await supabase.from("reviews").insert(payload);
  if (error) {
    if (isAuthorNameColumnMissing(error)) {
      const { error: fallbackError } = await supabase.from("reviews").insert({
        cocktail_id: cocktailId,
        user_id: userId,
        rating,
        review_text,
        would_make_again: input.wouldMakeAgain,
      });
      if (fallbackError) throw fallbackError;
      return;
    }
    throw error;
  }
}
