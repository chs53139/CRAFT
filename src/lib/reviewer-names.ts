import type { User } from "@supabase/supabase-js";

export function resolveReviewerDisplayName(user: Pick<User, "email" | "user_metadata">): string {
  const displayName = user.user_metadata?.display_name;
  if (typeof displayName === "string" && displayName.trim()) {
    return displayName.trim();
  }

  const email = user.email?.trim();
  if (email) {
    return email.split("@")[0] ?? "CRAFT member";
  }

  return "CRAFT member";
}

export function formatReviewAuthorLabel(
  authorName: string | undefined,
  isOwn: boolean
): string {
  const trimmed = authorName?.trim();
  if (trimmed) return trimmed;
  if (isOwn) return "You";
  return "CRAFT member";
}
