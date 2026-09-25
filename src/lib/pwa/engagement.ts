const SESSION_KEY = "craft-engagement-sessions";
const BAR_ADDS_KEY = "craft-engagement-bar-adds";
const COCKTAIL_VIEWS_KEY = "craft-engagement-cocktail-views";
const INSTALL_DISMISS_KEY = "craft-install-dismissed-at";
const INSTALL_DONE_KEY = "craft-install-completed";

export type InstallPlatform = "ios" | "android" | "other";

export function detectInstallPlatform(): InstallPlatform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function bumpSessionCount(): number {
  const count = readInt(SESSION_KEY) + 1;
  localStorage.setItem(SESSION_KEY, String(count));
  return count;
}

export function incrementBarAdds(delta = 1): number {
  const count = readInt(BAR_ADDS_KEY) + delta;
  localStorage.setItem(BAR_ADDS_KEY, String(count));
  return count;
}

export function incrementCocktailViews(delta = 1): number {
  const count = readInt(COCKTAIL_VIEWS_KEY) + delta;
  localStorage.setItem(COCKTAIL_VIEWS_KEY, String(count));
  return count;
}

export function getEngagementSnapshot() {
  return {
    sessions: readInt(SESSION_KEY),
    barAdds: readInt(BAR_ADDS_KEY),
    cocktailViews: readInt(COCKTAIL_VIEWS_KEY),
  };
}

/** Conservative: second session OR meaningful bar/cocktail use. Never first paint. */
export function shouldOfferInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(INSTALL_DONE_KEY) === "1") return false;
  const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
  if (dismissed) {
    const dismissedAt = Number(dismissed);
    if (!Number.isNaN(dismissedAt) && Date.now() - dismissedAt < 14 * 24 * 60 * 60 * 1000) {
      return false;
    }
  }

  const { sessions, barAdds, cocktailViews } = getEngagementSnapshot();
  if (sessions >= 2) return true;
  if (barAdds >= 4) return true;
  if (cocktailViews >= 5) return true;
  return false;
}

export function markInstallDismissed() {
  localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
}

export function markInstallCompleted() {
  localStorage.setItem(INSTALL_DONE_KEY, "1");
}

function readInt(key: string): number {
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}
