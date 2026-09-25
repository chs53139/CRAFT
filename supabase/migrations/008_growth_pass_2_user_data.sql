-- Shopping list + made history (signed-in sync). Guests use localStorage only.

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ingredient_id text not null,
  source_context text,
  cocktail_id text,
  created_at timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

create index if not exists shopping_list_items_user_idx
  on public.shopping_list_items (user_id, created_at desc);

alter table public.shopping_list_items enable row level security;

create policy "shopping_list_select_own"
  on public.shopping_list_items for select
  using (auth.uid() = user_id);

create policy "shopping_list_insert_own"
  on public.shopping_list_items for insert
  with check (auth.uid() = user_id);

create policy "shopping_list_delete_own"
  on public.shopping_list_items for delete
  using (auth.uid() = user_id);

create table if not exists public.made_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cocktail_id text not null,
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  created_at timestamptz not null default now()
);

create index if not exists made_events_user_created_idx
  on public.made_events (user_id, created_at desc);

alter table public.made_events enable row level security;

create policy "made_events_select_own"
  on public.made_events for select
  using (auth.uid() = user_id);

create policy "made_events_insert_own"
  on public.made_events for insert
  with check (auth.uid() = user_id);
