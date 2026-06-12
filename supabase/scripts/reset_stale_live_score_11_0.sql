-- Emergency cleanup for the first WC match if a stale live score was inserted.
-- Safe for live/half-time/extra-time stale rows; it does not touch final scores.

update public.live_scores
set
  status = 'NS',
  regular_time_home_score = null,
  regular_time_away_score = null,
  penalty_home_score = null,
  penalty_away_score = null,
  api_minute = null,
  raw_api_response = jsonb_build_object('manual_reset', true, 'reason', 'api_returned_no_live_score'),
  updated_at = now()
where match_key = '11-0'
  and status in ('LIVE', 'HT', 'ET', 'PEN');

select
  match_key,
  status,
  regular_time_home_score,
  regular_time_away_score,
  penalty_home_score,
  penalty_away_score,
  api_minute,
  updated_at
from public.live_scores
where match_key = '11-0';
