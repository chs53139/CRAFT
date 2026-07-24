-- Store reviewer display name on each review for fast reads without auth admin lookups

alter table public.reviews
  add column if not exists author_name text not null default '';
