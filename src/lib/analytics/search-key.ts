/** Privacy-safe normalized search label for aggregate analytics (not raw user text). */
export function normalizeSearchKey(query: string): string {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return "";
  return trimmed
    .replace(/\s+/g, " ")
    .slice(0, 64);
}
