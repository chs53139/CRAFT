import type { SupabaseClient } from "@supabase/supabase-js";
import { MadeHistoryEntry } from "@/lib/made-history/types";
import { withTimeout } from "@/lib/supabase/resilience";

const QUERY_TIMEOUT_MS = 8_000;
const MAX_ENTRIES = 50;

function timed<T extends PromiseLike<unknown>>(promise: T): Promise<Awaited<T>> {
  return withTimeout(Promise.resolve(promise), QUERY_TIMEOUT_MS);
}

export async function fetchMadeHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<MadeHistoryEntry[]> {
  const { data, error } = await timed(
    supabase
      .from("made_events")
      .select("id,cocktail_id,rating,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_ENTRIES)
  );

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    cocktailId: row.cocktail_id as string,
    madeAt: row.created_at as string,
    rating: row.rating ?? undefined,
  }));
}

export async function insertMadeEvent(
  supabase: SupabaseClient,
  userId: string,
  entry: Omit<MadeHistoryEntry, "id">
): Promise<MadeHistoryEntry> {
  const { data, error } = await timed(
    supabase
      .from("made_events")
      .insert({
        user_id: userId,
        cocktail_id: entry.cocktailId,
        rating: entry.rating ?? null,
        created_at: entry.madeAt,
      })
      .select("id,cocktail_id,rating,created_at")
      .single()
  );

  if (error) throw error;

  return {
    id: data.id as string,
    cocktailId: data.cocktail_id as string,
    madeAt: data.created_at as string,
    rating: data.rating ?? undefined,
  };
}
