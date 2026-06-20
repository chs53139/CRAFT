-- Fix reviews table permissions and update policy (run if review submit fails)

-- Ensure roles can access the table
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

-- Upserts need both USING and WITH CHECK on update
drop policy if exists "Users update own reviews" on public.reviews;
create policy "Users update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
