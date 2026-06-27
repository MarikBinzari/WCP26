-- Allow anyone (authenticated or not) to read special_picks for ranking popup.
-- The existing "users_manage_own_special_picks" policy already restricts writes.
create policy "special_picks_public_read"
  on public.special_picks for select
  using (true);
