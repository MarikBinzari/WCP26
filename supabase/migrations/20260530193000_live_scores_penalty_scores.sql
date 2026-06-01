alter table public.live_scores
  add column if not exists home_penalty_score integer,
  add column if not exists away_penalty_score integer;
