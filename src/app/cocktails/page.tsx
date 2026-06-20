"use client";

import { useMemo, useState } from "react";
import { BestNextBuy } from "@/components/BestNextBuy";
import { CocktailSection } from "@/components/CocktailSection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { MenuPageSkeleton } from "@/components/LoadingState";
import { MyBarInventory } from "@/components/MyBarInventory";
import { RecentCocktails } from "@/components/RecentCocktails";
import { SearchField } from "@/components/SearchField";
import {
  cocktailCount,
  filterMatchesBySearch,
  getBestNextIngredient,
  getIngredientsByIds,
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
  const { barIds, toggleIngredient, loaded, error, clearError } = useMyBar();
  const [search, setSearch] = useState("");

  const allMatches = useMemo(() => matchCocktails(barIds), [barIds]);
  const filteredMatches = useMemo(
    () => filterMatchesBySearch(allMatches, search),
    [allMatches, search]
  );

  if (!loaded) {
    return <MenuPageSkeleton />;
  }

  const barIngredients = getIngredientsByIds(barIds);
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
    <div className="page-shell">
      <p className="eyebrow">Tonight&apos;s menu</p>
      <h1 className="display-lg mt-3">What can you pour?</h1>
      <p className="lead mt-3 max-w-xl">
        {cocktailCount} recipes in the catalogue — sorted by what your bar can handle.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {barIds.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your bar is empty"
            description="Hard to make a Negroni with nothing but ambition. Stock your bar first."
            actionLabel="Go to My Bar"
            actionHref="/bar"
          />
        </div>
      ) : (
        <>
          <div className="mt-8 sm:max-w-md">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search cocktails or ingredients…"
            />
          </div>

          {barIngredients.length > 0 && (
            <div className="mt-10">
              <MyBarInventory
                ingredients={barIngredients}
                onRemove={toggleIngredient}
              />
            </div>
          )}

          {recommendation && (
            <div className="mt-10">
              <BestNextBuy recommendation={recommendation} />
            </div>
          )}

          <RecentCocktails />

          {noSearchResults ? (
            <div className="mt-10">
              <EmptyState
                title={`No matches for “${search.trim()}”`}
                description="Try a cocktail name, spirit, or flavor — like gin, sour, or Negroni."
                icon="🔍"
              />
            </div>
          ) : (
            <>
              <CocktailSection
                title="You Can Make Tonight"
                subtitle={`${tonight.length} ready`}
                items={tonight.slice(0, SECTION_LIMIT)}
                empty="Not quite there yet — check the recommendation above."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={tonight.length} />

              <CocktailSection
                title="One Ingredient Away"
                subtitle="One bottle between you and glory."
                items={oneAway.slice(0, SECTION_LIMIT)}
                empty="Nothing teasing you tonight. Yet."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={oneAway.length} />

              <CocktailSection
                title="Two Ingredients Away"
                items={twoAway.slice(0, SECTION_LIMIT)}
                empty="Keep stocking — these will show up as your bar grows."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={twoAway.length} />

              <CocktailSection
                title="Three Ingredients Away"
                items={threeAway.slice(0, SECTION_LIMIT)}
                empty="Ambitious pours for a well-stocked bar."
              />
              <SectionTruncation shown={SECTION_LIMIT} total={threeAway.length} />

              {furtherAway.length > 0 && (
                <>
                  <CocktailSection
                    title="Still on the shopping list"
                    subtitle={`${furtherAway.length} more to dream about`}
                    items={furtherAway.slice(0, 12)}
                    empty=""
                    compact
                  />
                  {furtherAway.length > 12 && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Showing 12 of {furtherAway.length} long-shot cocktails.
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
