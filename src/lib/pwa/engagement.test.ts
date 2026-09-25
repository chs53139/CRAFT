import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bumpSessionCount,
  detectInstallPlatform,
  incrementBarAdds,
  incrementCocktailViews,
  markInstallCompleted,
  markInstallDismissed,
  shouldOfferInstallPrompt,
} from "@/lib/pwa/engagement";

function mockBrowserStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", {});
  return store;
}

describe("shouldOfferInstallPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T12:00:00.000Z"));
    mockBrowserStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not offer on first visit with zero engagement", () => {
    expect(shouldOfferInstallPrompt()).toBe(false);
  });

  it("offers after second session", () => {
    bumpSessionCount();
    expect(shouldOfferInstallPrompt()).toBe(false);
    bumpSessionCount();
    expect(shouldOfferInstallPrompt()).toBe(true);
  });

  it("offers after four bar additions", () => {
    incrementBarAdds(4);
    expect(shouldOfferInstallPrompt()).toBe(true);
  });

  it("offers after five cocktail views", () => {
    incrementCocktailViews(5);
    expect(shouldOfferInstallPrompt()).toBe(true);
  });

  it("respects dismissal within 14 days", () => {
    bumpSessionCount();
    bumpSessionCount();
    expect(shouldOfferInstallPrompt()).toBe(true);
    markInstallDismissed();
    expect(shouldOfferInstallPrompt()).toBe(false);
    vi.advanceTimersByTime(13 * 24 * 60 * 60 * 1000);
    expect(shouldOfferInstallPrompt()).toBe(false);
    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
    expect(shouldOfferInstallPrompt()).toBe(true);
  });

  it("never offers after install completed marker", () => {
    incrementBarAdds(10);
    markInstallCompleted();
    expect(shouldOfferInstallPrompt()).toBe(false);
  });
});

describe("detectInstallPlatform", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects iOS Safari user agent", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" });
    expect(detectInstallPlatform()).toBe("ios");
  });

  it("detects Android", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Linux; Android 14)" });
    expect(detectInstallPlatform()).toBe("android");
  });
});
