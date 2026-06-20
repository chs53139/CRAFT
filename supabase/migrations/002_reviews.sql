-- Cocktail reviews (run if not already created in Supabase Dashboard)

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  cocktail_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  review_text text not null default '',
  would_make_again boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, cocktail_id)
);

create index if not exists reviews_cocktail_id_idx on public.reviews (cocktail_id);
create index if not exists reviews_created_at_idx on public.reviews (cocktail_id, created_at desc);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Users insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);
