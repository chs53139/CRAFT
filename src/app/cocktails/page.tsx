"use client";

import { useMemo, useState } from "react";
import { BestNextBuy } from "@/components/BestNextBuy";
import { CocktailSection } from "@/components/CocktailSection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { MenuPageSkeleton } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import {
  filterMatchesBySearch,
  getBestNextIngredient,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

const SECTION_LIMIT = 24;

function SectionTruncation({ shown, total }: { shown: number; total: number }) {
  if (total <= shown) return null;
  return (
    <p className="mt-2 text-xs text-[var(--muted)]">
      Showing {shown} of {total}. Use search to narrow down.
    </p>
  );
}

export default function CocktailsPage() {
  const { barIds, loaded, error, clearError } = useMyBar();
  const [search, setSearch] = useState("");

  const allMatches = useMemo(() => matchCocktails(barIds), [barIds]);
  const filteredMatches = useMemo(
    () => filterMatchesBySearch(allMatches, search),
    [allMatches, search]
  );

  if (!loaded) {
    return <MenuPageSkeleton />;
  }

  const tonight = filteredMatches.filter((m) => m.canMake);
  const oneAway = filteredMatches.filter((m) => m.missingCount === 1);
  const twoAway = filteredMatches.filter((m) => m.missingCount === 2);
  const threeAway = filteredMatches.filter((m) => m.missingCount === 3);
  const furtherAway = filteredMatches.filter((m) => m.missingCount >= 4);
  const recommendation = getBestNextIngredient(barIds);
  const searchActive = search.trim().length > 0;
  const noSearchResults =
    searchActive &&
    tonight.length === 0 &&
    oneAway.length === 0 &&
    twoAway.length === 0 &&
    threeAway.length === 0 &&
    furtherAway.length === 0;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Tonight"
        subtitle={
          barIds.length === 0
            ? "Stock your bar first"
            : `${tonight.length} ready · ${oneAway.length} one away`
        }
        large
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {barIds.length === 0 ? (
        <EmptyState
          title="Your bar is empty"
          description="Add ingredients in the Bar tab, then come back here for matches."
          actionLabel="Open My Bar"
          actionHref="/bar"
        />
      ) : (
        <>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search cocktails or ingredients…"
          />

          {noSearchResults ? (
            <div className="app-section">
              <EmptyState
                title={`No matches for “${search.trim()}”`}
                description="Try a cocktail name, spirit, or flavor — like gin, sour, or Negroni."
                icon="🔍"
              />
            </div>
          ) : (
            <>
              <CocktailSection
                title="Ready now"
                subtitle={`${tonight.length} cocktails`}
                items={tonight.slice(0, SECTION_LIMIT)}
                empty="Not quite there yet — check the recommendation below."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={tonight.length} />

              {recommendation && (
                <div className="app-section">
                  <BestNextBuy recommendation={recommendation} />
                </div>
              )}

              <CocktailSection
                title="One away"
                subtitle="One bottle from glory"
                items={oneAway.slice(0, SECTION_LIMIT)}
                empty="Nothing teasing you tonight. Yet."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={oneAway.length} />

              <CocktailSection
                title="Two away"
                items={twoAway.slice(0, SECTION_LIMIT)}
                empty="Keep stocking — these appear as your bar grows."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={twoAway.length} />

              <CocktailSection
                title="Three away"
                items={threeAway.slice(0, SECTION_LIMIT)}
                empty="Ambitious pours for a well-stocked bar."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={threeAway.length} />

              {furtherAway.length > 0 && (
                <>
                  <CocktailSection
                    title="Shopping list"
                    subtitle={`${furtherAway.length} long shots`}
                    items={furtherAway.slice(0, 12)}
                    empty=""
                    compact
                  />
                  {furtherAway.length > 12 && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Showing 12 of {furtherAway.length}.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
