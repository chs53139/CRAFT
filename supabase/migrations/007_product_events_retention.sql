-- Optional retention for anonymous product_events (run manually or via Supabase scheduled job).
-- Default 90 days keeps free-tier storage predictable without touching core app tables.

create or replace function public.purge_product_events_older_than(days integer default 90)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  if days is null or days < 7 then
    raise exception 'days must be at least 7';
  end if;
  with deleted as (
    delete from public.product_events
    where created_at < now() - make_interval(days => days)
    returning 1
  )
  select count(*)::bigint into removed from deleted;
  return removed;
end;
$$;

comment on function public.purge_product_events_older_than(integer) is
  'Deletes product_events older than N days (default 90). Run monthly on Supabase free tier.';
