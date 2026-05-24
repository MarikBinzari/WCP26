create table if not exists public.special_picks (
  id                  bigserial primary key,
  user_id             uuid references auth.users(id) on delete cascade,
  board_id            text not null,
  champion            text,
  top_scorer_team     text,
  top_scorer_player   text,
  updated_at          timestamptz default now(),
  unique(user_id, board_id)
);

alter table public.special_picks enable row level security;

create policy "users_manage_own_special_picks"
  on public.special_picks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
