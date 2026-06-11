-- Add utc_date column to live_scores so the frontend can compute
-- elapsed minutes accurately without timezone guesswork.
alter table public.live_scores
  add column if not exists utc_date timestamptz;
