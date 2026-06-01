alter table public.live_scores
  rename column home_score to regular_time_home_score;

alter table public.live_scores
  rename column away_score to regular_time_away_score;

alter table public.live_scores
  rename column home_penalty_score to penalty_home_score;

alter table public.live_scores
  rename column away_penalty_score to penalty_away_score;

alter table public.live_scores
  rename column live_min to api_minute;
