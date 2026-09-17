-- Anonymous product analytics (no PII). Inserts via API route; reads via service role only.

create table if not exists public.product_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_created_at_idx
  on public.product_events (created_at desc);

create index if not exists product_events_name_created_idx
  on public.product_events (event_name, created_at desc);

alter table public.product_events enable row level security;

-- Client/API may append events only (no reads through anon/authenticated policies).
create policy "product_events_insert_anon"
  on public.product_events for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete for anon or authenticated users.
