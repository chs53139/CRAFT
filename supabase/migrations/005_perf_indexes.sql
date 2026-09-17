-- Query-pattern indexes (safe to re-run)

-- Recents: one row per cocktail per user (enables upsert + faster lookups)
create unique index if not exists recent_cocktails_user_cocktail_uidx
  on public.recent_cocktails (user_id, cocktail_id);

-- Favorites: cocktail lookups when merging server data
create index if not exists favorites_user_cocktail_idx
  on public.favorites (user_id, cocktail_id);

-- Bar: ingredient lookups during diff sync
create index if not exists bar_items_user_ingredient_idx
  on public.bar_items (user_id, ingredient_id);

-- Reviews: already have cocktail_id + created_at indexes in 002
