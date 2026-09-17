const STORAGE_KEY = "craft_analytics_session_id";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Stable anonymous session id stored in localStorage under `craft_analytics_session_id`.
 * Lifetime: until the user clears site data or the browser evicts storage — not tied to login.
 * Used only to count sessions and returning usage in aggregate; never sent to third parties.
 */
export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = randomId();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}
