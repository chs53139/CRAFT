import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_RECENT = 12;

export async function fetchBarItems(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("bar_items")
    .select("ingredient_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => row.ingredient_id);
}

export async function saveBarItems(
  supabase: SupabaseClient,
  userId: string,
  ingredientIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("bar_items")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  if (ingredientIds.length === 0) return;

  const { error: insertError } = await supabase.from("bar_items").insert(
    ingredientIds.map((ingredient_id) => ({
      user_id: userId,
      ingredient_id,
    }))
  );

  if (insertError) throw insertError;
}

export async function fetchFavorites(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("cocktail_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.cocktail_id);
}

export async function addFavorite(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  const { error } = await supabase.from("favorites").upsert(
    { user_id: userId, cocktail_id: cocktailId },
    { onConflict: "user_id,cocktail_id" }
  );
  if (error) throw error;
}

export async function removeFavorite(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("cocktail_id", cocktailId);
  if (error) throw error;
}

export async function syncFavoritesToServer(
  supabase: SupabaseClient,
  userId: string,
  favoriteIds: string[]
): Promise<void> {
  await Promise.all(
    favoriteIds.map((cocktailId) => addFavorite(supabase, userId, cocktailId))
  );
}

export async function fetchRecentCocktails(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("recent_cocktails")
    .select("cocktail_id, viewed_at")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(MAX_RECENT);

  if (error) throw error;
  return (data ?? []).map((row) => row.cocktail_id);
}

export async function trackRecentCocktail(
  supabase: SupabaseClient,
  userId: string,
  cocktailId: string
): Promise<void> {
  await supabase
    .from("recent_cocktails")
    .delete()
    .eq("user_id", userId)
    .eq("cocktail_id", cocktailId);

  const { error } = await supabase.from("recent_cocktails").insert({
    user_id: userId,
    cocktail_id: cocktailId,
    viewed_at: new Date().toISOString(),
  });

  if (error) throw error;

  const { data: overflow } = await supabase
    .from("recent_cocktails")
    .select("id")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .range(MAX_RECENT, MAX_RECENT + 50);

  if (overflow && overflow.length > 0) {
    await supabase
      .from("recent_cocktails")
      .delete()
      .in(
        "id",
        overflow.map((r) => r.id)
      );
  }
}
