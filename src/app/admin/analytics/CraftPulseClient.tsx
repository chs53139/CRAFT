"use client";

import { useEffect, useState } from "react";
import type { CraftPulseSummary } from "@/lib/analytics/aggregates";

export function CraftPulseClient() {
  const [data, setData] = useState<CraftPulseSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/analytics/summary")
      .then(async (res) => {
        if (res.status === 503) throw new Error("backend");
        if (!res.ok) throw new Error("unauthorized");
        return res.json() as Promise<CraftPulseSummary>;
      })
      .then(setData)
      .catch((e: Error) => {
        setError(
          e.message === "backend"
            ? "Analytics storage is not configured on the server (service role + migration)."
            : "Could not load analytics."
        );
      });
  }, []);

  if (error) {
    return (
      <div className="app-screen">
        <p className="text-sm text-[var(--muted)]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-screen">
        <p className="text-sm text-[var(--muted)]">Loading CRAFT Pulse…</p>
      </div>
    );
  }

  return (
    <div className="app-screen space-y-8 pb-10">
      <div>
        <p className="eyebrow text-[var(--accent-dim)]">CRAFT Pulse</p>
        <h1 className="screen-title-large mt-2">Last {data.windowDays} days</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Anonymous product events only. Retention: purge events older than 90 days via{" "}
          <code className="text-[var(--foreground)]">purge_product_events_older_than</code>{" "}
          (migration 007).
        </p>
      </div>

      <section>
        <h2 className="section-row-title">Active / sessions</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Sessions" value={data.sessions} />
          <Stat label="Returning (2+ days)" value={data.returningSessions} />
        </div>
      </section>

      <section>
        <h2 className="section-row-title">Discovery</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Cocktail views" value={data.cocktailViews} />
          <Stat label="Searches" value={data.searches} />
          <Stat label="Zero-result searches" value={data.zeroResultSearches} />
          <Stat label="Favorites" value={data.favorites} />
          <Stat label="Shares" value={data.shares} />
        </div>
        <RateRow label="Zero-result rate (searches)" value={data.rates.zeroResultSearchRate} />
        <RateRow label="Favorite adds per view" value={data.rates.favoriteAddsPerView} />
        <RateRow label="Shares per view" value={data.rates.sharesPerView} />
      </section>

      <section>
        <h2 className="section-row-title">Commerce intent</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="One Away views" value={data.oneAwayViews} />
          <Stat label="Missing ingredient taps" value={data.missingIngredientSelections} />
          <Stat label="Best Next Purchase views" value={data.bestNextPurchaseViews} />
          <Stat label="Find Nearby actions" value={data.findNearbyClicks} />
        </div>
        <RateRow
          label="Find Nearby / Best Next Purchase views"
          value={data.rates.findNearbyPerBnpView}
        />
        <RateRow label="Find Nearby / One Away views" value={data.rates.findNearbyPerOneAwayView} />
      </section>

      <RankList
        title="Top cocktails (views)"
        items={data.topViewed.map((x) => `${x.cocktailId} (${x.count})`)}
      />
      <RankList
        title="Top favorited"
        items={data.topFavorited.map((x) => `${x.cocktailId} (${x.count})`)}
      />
      <RankList
        title="Top shared"
        items={data.topShared.map((x) => `${x.cocktailId} (${x.count})`)}
      />
      <RankList title="Top searches" items={data.topSearches.map((x) => `${x.searchKey} (${x.count})`)} />

      {data.zeroResultSearchRows.length > 0 ? (
        <section>
          <h2 className="section-row-title">Zero-result searches (catalogue signals)</h2>
          <ol className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
            {data.zeroResultSearchRows.map((row, i) => (
              <li key={row.query}>
                {i + 1}. &ldquo;{row.query}&rdquo; · {row.count} search{row.count === 1 ? "" : "es"} ·
                last {formatShortDate(row.lastSeen)}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <RankList
        title="One Away — common missing"
        items={data.topMissingIngredients.map((x) => `${x.ingredientId} (${x.count})`)}
      />
      <RankList
        title="Best next purchase"
        items={data.bestNextPurchase.map(
          (x) => `${x.ingredientId} · ${x.appearances} views · ~${x.avgUnlock} unlocks`
        )}
      />
      <RankList
        title="Find Nearby"
        items={data.commerceIntent.map((x) => `${x.ingredientId} · ${x.context} (${x.count})`)}
      />
    </div>
  );
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="premium-card px-4 py-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function RateRow({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <p className="mt-2 text-xs text-[var(--muted)]">
      {label}: <span className="text-[var(--foreground)]">{value}</span>
    </p>
  );
}

function RankList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="section-row-title">{title}</h2>
      <ol className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>
            {i + 1}. {item}
          </li>
        ))}
      </ol>
    </section>
  );
}
