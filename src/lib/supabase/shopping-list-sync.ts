import type { SupabaseClient } from "@supabase/supabase-js";
import { ShoppingListItem } from "@/lib/shopping-list/types";
import { withTimeout } from "@/lib/supabase/resilience";

const QUERY_TIMEOUT_MS = 8_000;

function timed<T extends PromiseLike<unknown>>(promise: T): Promise<Awaited<T>> {
  return withTimeout(Promise.resolve(promise), QUERY_TIMEOUT_MS);
}

export async function fetchShoppingList(
  supabase: SupabaseClient,
  userId: string
): Promise<ShoppingListItem[]> {
  const { data, error } = await timed(
    supabase
      .from("shopping_list_items")
      .select("ingredient_id,source_context,cocktail_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ingredientId: row.ingredient_id as string,
    addedAt: row.created_at as string,
    source: (row.source_context as ShoppingListItem["source"]) ?? undefined,
    cocktailId: (row.cocktail_id as string) ?? undefined,
  }));
}

export async function upsertShoppingListItem(
  supabase: SupabaseClient,
  userId: string,
  item: ShoppingListItem
): Promise<void> {
  const { error } = await timed(
    supabase.from("shopping_list_items").upsert(
      {
        user_id: userId,
        ingredient_id: item.ingredientId,
        source_context: item.source ?? null,
        cocktail_id: item.cocktailId ?? null,
        created_at: item.addedAt,
      },
      { onConflict: "user_id,ingredient_id" }
    )
  );
  if (error) throw error;
}

export async function removeShoppingListItem(
  supabase: SupabaseClient,
  userId: string,
  ingredientId: string
): Promise<void> {
  const { error } = await timed(
    supabase
      .from("shopping_list_items")
      .delete()
      .eq("user_id", userId)
      .eq("ingredient_id", ingredientId)
  );
  if (error) throw error;
}
