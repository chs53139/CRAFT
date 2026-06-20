"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BestNextBuy } from "@/components/BestNextBuy";
import { CocktailSection } from "@/components/CocktailSection";
import { CollectionFilter } from "@/components/CollectionFilter";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { MenuPageSkeleton, PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import { SubstitutionModeFilter } from "@/components/SubstitutionModeFilter";
import { SurpriseMe } from "@/components/SurpriseMe";
import { getHiddenGems } from "@/lib/cocktail-discovery";
import {
  filterMatchesBySearch,
  getBestNextIngredient,
  groupCocktailMatches,
  matchCocktails,
} from "@/lib/cocktail-matching";
import {
  matchPassesSubstitutionMode,
  SubstitutionMode,
} from "@/lib/substitution-display";
import { CocktailCollection } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

const SECTION_LIMIT = 24;

type TonightView = "all" | "ready" | "one-away";

const VIEW_TABS: Array<{ id: TonightView; label: string; href: string }> = [
  { id: "all", label: "All", href: "/cocktails" },
  { id: "ready", label: "Ready now", href: "/cocktails?view=ready" },
  { id: "one-away", label: "One away", href: "/cocktails?view=one-away" },
];

function parseView(value: string | null): TonightView {
  if (value === "ready" || value === "one-away") return value;
  return "all";
}

function SectionTruncation({ shown, total }: { shown: number; total: number }) {
  if (total <= shown) return null;
  return (
    <p className="mt-2 text-xs text-[var(--muted)]">
      Showing {shown} of {total}. Use search to narrow down.
    </p>
  );
}

function TonightViewTabs({ active }: { active: TonightView }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {VIEW_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`surprise-chip shrink-0 ${active === tab.id ? "surprise-chip-active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function CocktailsContent() {
  const searchParams = useSearchParams();
  const view = parseView(searchParams.get("view"));
  const { barIds, loaded, error, clearError } = useMyBar();
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState<"all" | CocktailCollection>("all");
  const [substitutionMode, setSubstitutionMode] =
    useState<SubstitutionMode>("include-substitutions");

  const allMatches = useMemo(() => matchCocktails(barIds), [barIds]);
  const searchedMatches = useMemo(
    () => filterMatchesBySearch(allMatches, search),
    [allMatches, search]
  );
  const filteredMatches = useMemo(() => {
    if (collection === "all") return searchedMatches;
    return searchedMatches.filter((m) => m.cocktail.collections.includes(collection));
  }, [searchedMatches, collection]);
  const { exactMatches, availableWithSubstitutions, experimentalMatches, stillMissing } = useMemo(
    () => groupCocktailMatches(filteredMatches),
    [filteredMatches]
  );

  const visibleExact = useMemo(
    () => exactMatches.filter((match) => matchPassesSubstitutionMode(match, substitutionMode)),
    [exactMatches, substitutionMode]
  );
  const visibleSubstitutions = useMemo(
    () =>
      availableWithSubstitutions.filter((match) =>
        matchPassesSubstitutionMode(match, substitutionMode)
      ),
    [availableWithSubstitutions, substitutionMode]
  );
  const visibleExperimental = useMemo(
    () =>
      experimentalMatches.filter((match) =>
        matchPassesSubstitutionMode(match, substitutionMode)
      ),
    [experimentalMatches, substitutionMode]
  );

  if (!loaded) {
    return <MenuPageSkeleton />;
  }

  const oneAway = stillMissing.filter((m) => m.missingCount === 1);
  const hiddenGems = getHiddenGems(barIds, 12).filter(
    (m) =>
      (collection === "all" || m.cocktail.collections.includes(collection)) &&
      matchPassesSubstitutionMode(m, substitutionMode)
  );
  const recommendation = getBestNextIngredient(barIds);
  const searchActive = search.trim().length > 0;
  const showAllSections = view === "all";
  const showReady = view === "all" || view === "ready";
  const showOneAway = view === "all" || view === "one-away";

  const hasVisibleResults =
    (showReady &&
      (visibleExact.length > 0 ||
        hiddenGems.length > 0 ||
        visibleSubstitutions.length > 0 ||
        visibleExperimental.length > 0)) ||
    (showOneAway && oneAway.length > 0) ||
    (showAllSections && stillMissing.length > 0);

  const noSearchResults = searchActive && !hasVisibleResults;

  const headerSubtitle =
    view === "ready"
      ? `${visibleExact.length} exact · ${visibleSubstitutions.length} with subs`
      : view === "one-away"
        ? `${oneAway.length} one bottle away`
        : barIds.length === 0
          ? "Stock your bar first"
          : `${visibleExact.length} exact · ${visibleSubstitutions.length} subs · ${stillMissing.length} missing`;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="Tonight" subtitle={headerSubtitle} large />

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
          <TonightViewTabs active={view} />

          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search cocktails, eras, or collections…"
          />

          <div className="app-section space-y-4">
            <SubstitutionModeFilter value={substitutionMode} onChange={setSubstitutionMode} />
            <CollectionFilter value={collection} onChange={setCollection} />
          </div>

          {noSearchResults ? (
            <div className="app-section">
              <EmptyState
                title={`No matches for “${search.trim()}”`}
                description="Try a cocktail name, spirit, flavor, or collection."
                icon="🔍"
              />
            </div>
          ) : (
            <>
              {showReady && (
                <>
                  <CocktailSection
                    title="Exact matches"
                    subtitle={`${visibleExact.length} cocktails — everything in your bar`}
                    items={visibleExact.slice(0, SECTION_LIMIT)}
                    empty="Not quite there yet — check the recommendation below."
                  />
                  <SectionTruncation shown={SECTION_LIMIT} total={visibleExact.length} />
                </>
              )}

              {showReady && recommendation && collection === "all" && (
                <div className="app-section">
                  <BestNextBuy recommendation={recommendation} />
                </div>
              )}

              {showReady && hiddenGems.length > 0 && (
                <CocktailSection
                  title="Hidden gems"
                  subtitle="Unusual pours you can make now"
                  items={hiddenGems}
                  showObscurity
                  empty=""
                />
              )}

              {showReady && visibleSubstitutions.length > 0 && (
                <>
                  <CocktailSection
                    title="Available with substitutions"
                    subtitle="Owned substitutes fill the gaps — not identical, but in the ballpark"
                    items={visibleSubstitutions.slice(0, SECTION_LIMIT)}
                    empty=""
                  />
                  <SectionTruncation
                    shown={SECTION_LIMIT}
                    total={visibleSubstitutions.length}
                  />
                </>
              )}

              {showReady && visibleExperimental.length > 0 && (
                <>
                  <CocktailSection
                    title="Experimental"
                    subtitle="Low-confidence swaps or homemade builds — expect a different drink"
                    items={visibleExperimental.slice(0, SECTION_LIMIT)}
                    empty=""
                  />
                  <SectionTruncation
                    shown={SECTION_LIMIT}
                    total={visibleExperimental.length}
                  />
                </>
              )}

              {showOneAway && view === "one-away" && (
                <>
                  <CocktailSection
                    title="One away"
                    subtitle="One bottle from an exact match"
                    items={oneAway.slice(0, SECTION_LIMIT)}
                    empty="Nothing teasing you tonight. Yet."
                  />
                  <SectionTruncation shown={SECTION_LIMIT} total={oneAway.length} />
                </>
              )}

              {showAllSections && view === "all" && stillMissing.length > 0 && (
                <>
                  <CocktailSection
                    title="Still missing ingredients"
                    subtitle={`${stillMissing.length} cocktails need bottles you don't have (or substitutes for)`}
                    items={stillMissing.slice(0, SECTION_LIMIT)}
                    empty=""
                    compact
                  />
                  <SectionTruncation shown={SECTION_LIMIT} total={stillMissing.length} />

                  {collection === "all" && (
                    <div className="app-section">
                      <SurpriseMe barIds={barIds} />
                    </div>
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

export default function CocktailsPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading tonight…" />}>
      <CocktailsContent />
    </Suspense>
  );
}
