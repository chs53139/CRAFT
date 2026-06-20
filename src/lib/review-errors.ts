import type { PostgrestError } from "@supabase/supabase-js";
import { isReviewsTableMissing } from "@/lib/supabase/reviews-sync";

export function humanizeReviewError(error: unknown): string {
  if (isReviewsTableMissing(error)) {
    return "Reviews are not enabled on this server yet.";
  }

  if (!error || typeof error !== "object") {
    return "Could not save your review. Try again.";
  }

  const e = error as PostgrestError & { status?: number };

  if (e.code === "42501" || e.message?.includes("row-level security")) {
    return "You do not have permission to save this review. Try signing in again.";
  }

  if (e.code === "PGRST301" || e.message?.toLowerCase().includes("jwt")) {
    return "Your session expired. Sign in again and retry.";
  }

  if (e.code === "23514") {
    return "Pick a rating between 1 and 5 stars.";
  }

  if (typeof e.message === "string" && e.message.length > 0) {
    return e.message;
  }

  return "Could not save your review. Try again.";
}
