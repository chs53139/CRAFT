const STORAGE_KEY = "craft_analytics_session_id";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable anonymous session id (local only, not PII). */
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
