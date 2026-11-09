# Ingredient Intelligence Pass

Base: clean local main at 135e001 (newer than the supplied 5b39273). GitHub main could not be verified because github.com DNS resolution failed, including outside the sandbox.

## Audit and implementation

- Inventory migration previously validated and deduplicated literal IDs. Catalogue construction, recipe matching, bottle scan mapping and Shopping List each compared IDs independently. Search discovery aliases remain discovery hints, not evidence of ownership.
- ingredient-intelligence.ts now owns exact identity normalization and directional supply. Soda water and club soda share club-soda; whole limes and lemons keep fruit identity, and fresh juice spellings share the corresponding juice identity.
- Fruit supplies juice in one direction only. Juice never supplies fruit; neither path grants peel, zest, discs, cordial, or garnish. Derived IDs are virtual matching capabilities, never persisted as owned ingredients.
- Curated substitutions remain separate, canonicalized rules. Generic whiskey/whisky is unresolved rather than silently promoted to bourbon. Broad bottle detections require review even when the vision response suggests a specific style. Existing rye-for-bourbon swaps still report substitutions rather than Ready.
- Exact identity is applied to catalogue ingredient IDs, inventory hydrate/save/toggle/add, match caching, missing-ingredient deduplication, scan deduplication, and Shopping List membership and merging. Shopping List rows retain their stored IDs when merging so existing remote deletions still address the original row.
- Best Next Purchase candidate checks understand directional supply and exclude capabilities already covered by owned fruit. Shopping List unlock previews and union counts use the same matcher. The existing UI and local-first sync lifecycle are retained.
- Repeated capability normalization is cached for the current bar during catalogue analysis to avoid purchase-analysis timeouts.

## Migrations

No SQL, Supabase schema, or environment-variable changes. Existing inventory migration canonicalizes soda-water to club-soda and removes equivalent duplicates on hydrate/save through the existing localStorage and Supabase full-replace path. Whole fruit remains owned fruit. Shopping List merges aliases by identity while preserving row metadata and stored IDs. No catalogue recipes added or removed: 672 cocktails.

## Validation

Full Vitest suite: 41 files, 161 tests passed. New regression cases cover exact alias deduplication, scan ambiguity, one-way citrus supply, negative garnish cases, honest counts, Shopping List unlocks and purchase recommendations. Standalone TypeScript check passes after correcting pre-existing test payload values and a narrow test variable annotation. Production build passes using the existing checkout's uncommitted local environment. Existing lint and metadataBase warnings remain.

No credentials or local environment files are included in the change.
