"use client";

import { useEffect, useState } from "react";
import type { CraftPulseSummary } from "@/lib/analytics/aggregates";

export function CraftPulseClient() {
  const [data, setData] = useState<CraftPulseSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/analytics/summary")
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json() as Promise<CraftPulseSummary>;
      })
      .then(setData)
      .catch(() => setError("Could not load analytics."));
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
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sessions" value={data.sessions} />
        <Stat label="Cocktail views" value={data.cocktailViews} />
        <Stat label="Searches" value={data.searches} />
        <Stat label="Zero-result searches" value={data.zeroResultSearches} />
        <Stat label="Favorites" value={data.favorites} />
        <Stat label="Shares" value={data.shares} />
        <Stat label="Find Nearby" value={data.findNearbyClicks} />
      </section>

      <RankList title="Top discovered" items={data.topViewed.map((x) => `${x.cocktailId} (${x.count})`)} />
      <RankList title="Top searches" items={data.topSearches.map((x) => `${x.searchKey} (${x.count})`)} />
      <RankList
        title="Zero-result searches"
        items={data.zeroResultSearchKeys.map((x) => `${x.searchKey} (${x.count})`)}
      />
      <RankList
        title="One away — common missing"
        items={data.topMissingIngredients.map((x) => `${x.ingredientId} (${x.count})`)}
      />
      <RankList
        title="Best next purchase"
        items={data.bestNextPurchase.map(
          (x) => `${x.ingredientId} · ${x.appearances} views · ~${x.avgUnlock} unlocks`
        )}
      />
      <RankList
        title="Commerce intent"
        items={data.commerceIntent.map((x) => `${x.ingredientId} · ${x.context} (${x.count})`)}
      />
    </div>
  );
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
