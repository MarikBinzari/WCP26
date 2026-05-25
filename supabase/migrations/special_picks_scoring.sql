-- Add scoring columns to special_picks
alter table public.special_picks
  add column if not exists champion_pts    int not null default 0,
  add column if not exists top_scorer_pts  int not null default 0;

-- Admin function: call after the final to score all picks
-- Usage: select score_special_picks('Argentina', 'L. Messi', 'Argentina');
create or replace function public.score_special_picks(
  p_champion          text,
  p_top_scorer_player text,
  p_top_scorer_team   text
) returns void language sql security definer as $$
  update public.special_picks
  set
    champion_pts   = case when champion = p_champion then 3 else 0 end,
    top_scorer_pts = case when top_scorer_player = p_top_scorer_player
                           and top_scorer_team   = p_top_scorer_team
                          then 3 else 0 end;
$$;

-- Helper view: total special pick pts per user per board (for leaderboard join)
create or replace view public.special_pick_pts as
  select user_id, board_id, (champion_pts + top_scorer_pts) as pts
  from public.special_picks;
