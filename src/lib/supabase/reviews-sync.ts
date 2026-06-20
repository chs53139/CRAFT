import type { SupabaseClient } from "@supabase/supabase-js";
import { CocktailReview, CocktailReviewInput } from "@/lib/types";

type ReviewRow = {
  id: string;
  cocktail_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  would_make_again: boolean;
  created_at: string;
};

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
    authorLabel: isOwn ? "You" : "CRAFT member",
    isOwn,
  };
}

export async function fetchReviewsForCocktail(
  supabase: SupabaseClient,
  cocktailId: string,
  currentUserId?: string
): Promise<CocktailReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, cocktail_id, user_id, rating, review_text, would_make_again, created_at")
    .eq("cocktail_id", cocktailId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row) => mapReviewRow(row as ReviewRow, currentUserId));
}

export async function upsertCocktailReview(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string,
  input: CocktailReviewInput
): Promise<void> {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const review_text = input.text.trim().slice(0, 280);

  const { error } = await supabase.from("reviews").upsert(
    {
      cocktail_id: cocktailId,
      user_id: userId,
      rating,
      review_text,
      would_make_again: input.wouldMakeAgain,
    },
    { onConflict: "user_id,cocktail_id" }
  );

  if (error) throw error;
}
