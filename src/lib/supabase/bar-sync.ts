import type { SupabaseClient } from "@supabase/supabase-js";
import { withTimeout } from "@/lib/supabase/resilience";

const MAX_RECENT = 12;
const QUERY_TIMEOUT_MS = 8_000;

function timed<T extends PromiseLike<unknown>>(promise: T): Promise<Awaited<T>> {
  return withTimeout(Promise.resolve(promise), QUERY_TIMEOUT_MS);
}

export async function fetchBarItems(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await timed(
    supabase
      .from("bar_items")
      .select("ingredient_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
  );

  if (error) throw error;
  return (data ?? []).map((row) => row.ingredient_id);
}

export async function saveBarItems(
  supabase: SupabaseClient,
  userId: string,
  ingredientIds: string[]
): Promise<void> {
  const desired = [...new Set(ingredientIds)];

  const { data: existingRows, error: fetchError } = await timed(
    supabase.from("bar_items").select("ingredient_id").eq("user_id", userId)
  );

  if (fetchError) throw fetchError;

  const existing = new Set((existingRows ?? []).map((row) => row.ingredient_id));
  const desiredSet = new Set(desired);

  const toRemove = [...existing].filter((id) => !desiredSet.has(id));
  const toAdd = desired.filter((id) => !existing.has(id));

  if (toRemove.length === 0 && toAdd.length === 0) return;

  if (toRemove.length > 0) {
    const { error: deleteError } = await timed(
      supabase
        .from("bar_items")
        .delete()
        .eq("user_id", userId)
        .in("ingredient_id", toRemove)
    );
    if (deleteError) throw deleteError;
  }

  if (toAdd.length === 0) return;

  const { error: insertError } = await timed(
    supabase.from("bar_items").insert(
      toAdd.map((ingredient_id) => ({
        user_id: userId,
        ingredient_id,
      }))
    )
  );

  if (insertError) throw insertError;
}

export async function fetchFavorites(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await timed(
    supabase
      .from("favorites")
      .select("cocktail_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );

  if (error) throw error;
  return (data ?? []).map((row) => row.cocktail_id);
}

export async function addFavorite(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  const { error } = await timed(
    supabase.from("favorites").upsert(
      { user_id: userId, cocktail_id: cocktailId },
      { onConflict: "user_id,cocktail_id" }
    )
  );
  if (error) throw error;
}

export async function removeFavorite(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  const { error } = await timed(
    supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("cocktail_id", cocktailId)
  );
  if (error) throw error;
}

export async function syncFavoritesToServer(
  supabase: SupabaseClient,
  userId: string,
  favoriteIds: string[]
): Promise<void> {
  if (favoriteIds.length === 0) return;

  const { error } = await timed(
    supabase.from("favorites").upsert(
      favoriteIds.map((cocktail_id) => ({ user_id: userId, cocktail_id })),
      { onConflict: "user_id,cocktail_id" }
    )
  );

  if (error) throw error;
}

export async function fetchRecentCocktails(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await timed(
    supabase
      .from("recent_cocktails")
      .select("cocktail_id, viewed_at")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(MAX_RECENT)
  );

  if (error) throw error;
  return (data ?? []).map((row) => row.cocktail_id);
}

function isRecentUpsertUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "42P10" ||
    (typeof e.message === "string" &&
      e.message.toLowerCase().includes("on conflict") &&
      e.message.toLowerCase().includes("unique"))
  );
}

async function trackRecentLegacy(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string,
  viewed_at: string
): Promise<void> {
  await timed(
    supabase
      .from("recent_cocktails")
      .delete()
      .eq("user_id", userId)
      .eq("cocktail_id", cocktailId)
  );

  const { error } = await timed(
    supabase.from("recent_cocktails").insert({
      user_id: userId,
      cocktail_id: cocktailId,
      viewed_at,
    })
  );

  if (error) throw error;
}

export async function trackRecentCocktail(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  const viewed_at = new Date().toISOString();

  const { error } = await timed(
    supabase.from("recent_cocktails").upsert(
      { user_id: userId, cocktail_id: cocktailId, viewed_at },
      { onConflict: "user_id,cocktail_id" }
    )
  );

  if (error) {
    if (isRecentUpsertUnavailable(error)) {
      await trackRecentLegacy(supabase, userId, cocktailId, viewed_at);
    } else {
      throw error;
    }
  }

  const { data: overflow, error: overflowError } = await timed(
    supabase
      .from("recent_cocktails")
      .select("id")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .range(MAX_RECENT, MAX_RECENT + 50)
  );

  if (overflowError) throw overflowError;

  if (overflow && overflow.length > 0) {
    const { error: trimError } = await timed(
      supabase
        .from("recent_cocktails")
        .delete()
        .in(
          "id",
          overflow.map((r) => r.id)
        )
    );
    if (trimError) throw trimError;
  }
}
