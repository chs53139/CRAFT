"use client";

import { useEffect, useState, type ReactNode } from "react";
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
      <div className="pulse-shell">
        <p className="text-sm text-[var(--muted)]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pulse-shell">
        <p className="text-sm text-[var(--muted)]">Loading CRAFT Pulse…</p>
      </div>
    );
  }

  const hasActivity =
    data.sessions > 0 ||
    data.cocktailViews > 0 ||
    data.searches > 0 ||
    data.findNearbyClicks > 0;

  return (
    <div className="pulse-shell space-y-10 pb-12">
      <header className="pulse-header">
        <p className="eyebrow text-[var(--accent-dim)]">CRAFT Pulse</p>
        <h1 className="screen-title-large mt-2">Last {data.windowDays} days</h1>
        <p className="pulse-lede mt-3">
          Anonymous product behavior — what people explore, what they cannot find, and where commerce
          intent shows up.
        </p>
      </header>

      {!hasActivity ? (
        <div className="pulse-panel">
          <p className="text-sm text-[var(--muted)]">
            No events in this window yet. Use the app and check back — metrics appear as real
            sessions accumulate.
          </p>
        </div>
      ) : null}

      <PulseSection title="Overview">
        <div className="pulse-stat-grid pulse-stat-grid-3">
          <Stat label="Sessions" value={data.sessions} />
          <Stat label="Returning (2+ days)" value={data.returningSessions} />
          <Stat label="Cocktail views" value={data.cocktailViews} />
        </div>
      </PulseSection>

      <PulseSection title="Discovery">
        <div className="pulse-stat-grid">
          <Stat label="Searches" value={data.searches} />
          <Stat label="Zero-result searches" value={data.zeroResultSearches} highlight={data.zeroResultSearches > 0} />
          <Stat label="Favorites" value={data.favorites} />
          <Stat label="Shares" value={data.shares} />
        </div>
        <RateRow label="Zero-result rate (of searches)" value={data.rates.zeroResultSearchRate} />
        <RateRow label="Favorite adds per cocktail view" value={data.rates.favoriteAddsPerView} />
        <RateRow label="Shares per cocktail view" value={data.rates.sharesPerView} />
        <RankTable
          title="Most viewed cocktails"
          rows={data.topViewed.map((x) => ({ primary: x.cocktailId, metric: String(x.count) }))}
        />
        <RankTable
          title="Top searches"
          rows={data.topSearches.map((x) => ({ primary: x.searchKey, metric: String(x.count) }))}
        />
        {data.zeroResultSearchRows.length > 0 ? (
          <div className="pulse-subpanel">
            <h3 className="pulse-subtitle">Zero-result searches</h3>
            <p className="pulse-hint">Catalogue expansion signals — drinks people look for but cannot find.</p>
            <ol className="pulse-rank-list">
              {data.zeroResultSearchRows.map((row, i) => (
                <li key={row.query} className="pulse-rank-row">
                  <span className="pulse-rank-index">{i + 1}</span>
                  <span className="pulse-rank-primary">&ldquo;{row.query}&rdquo;</span>
                  <span className="pulse-rank-metric">
                    {row.count} · last {formatShortDate(row.lastSeen)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </PulseSection>

      <PulseSection title="Activation">
        <div className="pulse-stat-grid">
          <Stat label="Bar scan confirmations" value={data.barScanConfirmed} />
          <Stat label="Install prompts shown" value={data.installPrompts} />
          <Stat label="Cocktails made" value={data.cocktailsMade} />
          <Stat label="Shopping list adds" value={data.shoppingListAdds} />
        </div>
      </PulseSection>

      <PulseSection title="Opportunity">
        <div className="pulse-stat-grid pulse-stat-grid-3">
          <Stat label="One Away views" value={data.oneAwayViews} />
          <Stat label="Missing ingredient taps" value={data.missingIngredientSelections} />
          <Stat label="Best Next Purchase views" value={data.bestNextPurchaseViews} />
        </div>
        <RankTable
          title="Most common One Away missing ingredients"
          rows={data.topMissingIngredients.map((x) => ({
            primary: x.ingredientId,
            metric: String(x.count),
          }))}
        />
        <RankTable
          title="Best Next Purchase (ingredient · views · avg unlock)"
          rows={data.bestNextPurchase.map((x) => ({
            primary: x.ingredientId,
            metric: `${x.appearances} · ~${x.avgUnlock}`,
          }))}
        />
      </PulseSection>

      <PulseSection title="Commerce intent">
        <div className="pulse-stat-grid pulse-stat-grid-3">
          <Stat label="Find Nearby actions" value={data.findNearbyClicks} />
          <Stat label="Shopping list → bar" value={data.shoppingListPurchased} />
        </div>
        <RateRow label="Find Nearby / Best Next Purchase views" value={data.rates.findNearbyPerBnpView} />
        <RateRow label="Find Nearby / One Away views" value={data.rates.findNearbyPerOneAwayView} />
        <RankTable
          title="Find Nearby by ingredient · context"
          rows={data.commerceIntent.map((x) => ({
            primary: x.ingredientId,
            secondary: x.context,
            metric: String(x.count),
          }))}
        />
      </PulseSection>

      <PulseSection title="Engagement highlights">
        <RankTable
          title="Most favorited"
          rows={data.topFavorited.map((x) => ({ primary: x.cocktailId, metric: String(x.count) }))}
        />
        <RankTable
          title="Most shared"
          rows={data.topShared.map((x) => ({ primary: x.cocktailId, metric: String(x.count) }))}
        />
      </PulseSection>
    </div>
  );
}

function PulseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pulse-section">
      <h2 className="pulse-section-title">{title}</h2>
      <div className="pulse-section-body">{children}</div>
    </section>
  );
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`pulse-stat ${highlight ? "pulse-stat-highlight" : ""}`}>
      <p className="pulse-stat-label">{label}</p>
      <p className="pulse-stat-value">{value}</p>
    </div>
  );
}

function RateRow({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <p className="pulse-rate">
      {label}: <span>{value}</span>
    </p>
  );
}

function RankTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ primary: string; secondary?: string; metric: string }>;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="pulse-subpanel">
      <h3 className="pulse-subtitle">{title}</h3>
      <ol className="pulse-rank-list">
        {rows.map((row, i) => (
          <li key={`${title}-${row.primary}-${i}`} className="pulse-rank-row">
            <span className="pulse-rank-index">{i + 1}</span>
            <span className="pulse-rank-primary">
              {row.primary}
              {row.secondary ? (
                <span className="pulse-rank-secondary"> · {row.secondary}</span>
              ) : null}
            </span>
            <span className="pulse-rank-metric">{row.metric}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
