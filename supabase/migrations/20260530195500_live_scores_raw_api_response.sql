alter table public.live_scores
  add column if not exists raw_api_response jsonb;
