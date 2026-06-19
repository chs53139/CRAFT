-- CRAFT Supabase schema
-- Run in Supabase Dashboard → SQL Editor (or via Supabase CLI)

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Bar inventory (one row per ingredient per user)
-- ---------------------------------------------------------------------------
create table public.bar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ingredient_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

create index bar_items_user_id_idx on public.bar_items (user_id);

alter table public.bar_items enable row level security;

create policy "Users read own bar"
  on public.bar_items for select
  using (auth.uid() = user_id);

create policy "Users insert own bar items"
  on public.bar_items for insert
  with check (auth.uid() = user_id);

create policy "Users delete own bar items"
  on public.bar_items for delete
  using (auth.uid() = user_id);

create policy "Users update own bar items"
  on public.bar_items for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cocktail_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, cocktail_id)
);

create index favorites_user_id_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

create policy "Users read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Recently viewed cocktails
-- ---------------------------------------------------------------------------
create table public.recent_cocktails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cocktail_id text not null,
  viewed_at timestamptz not null default now()
);

create index recent_cocktails_user_viewed_idx
  on public.recent_cocktails (user_id, viewed_at desc);

alter table public.recent_cocktails enable row level security;

create policy "Users read own recents"
  on public.recent_cocktails for select
  using (auth.uid() = user_id);

create policy "Users insert own recents"
  on public.recent_cocktails for insert
  with check (auth.uid() = user_id);

create policy "Users delete own recents"
  on public.recent_cocktails for delete
  using (auth.uid() = user_id);

create policy "Users update own recents"
  on public.recent_cocktails for update
  using (auth.uid() = user_id);
