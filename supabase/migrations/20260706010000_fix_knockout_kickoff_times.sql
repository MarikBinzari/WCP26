-- Correct confirmed FIFA knockout kickoff times.
-- Keep both tables aligned because the client prefers live_scores.utc_date.
with corrected(match_key, kickoff_utc) as (
  values
    ('35-1', '2026-07-06T00:00:00Z'::timestamptz),
    ('40-0', '2026-07-10T19:00:00Z'::timestamptz),
    ('41-1', '2026-07-12T01:00:00Z'::timestamptz),
    ('44-0', '2026-07-14T19:00:00Z'::timestamptz),
    ('45-0', '2026-07-15T19:00:00Z'::timestamptz),
    ('48-0', '2026-07-18T21:00:00Z'::timestamptz),
    ('49-0', '2026-07-19T19:00:00Z'::timestamptz)
)
update public.matches m
set kickoff_utc = c.kickoff_utc
from corrected c
where m.match_key = c.match_key;

with corrected(match_key, kickoff_utc) as (
  values
    ('35-1', '2026-07-06T00:00:00Z'::timestamptz),
    ('40-0', '2026-07-10T19:00:00Z'::timestamptz),
    ('41-1', '2026-07-12T01:00:00Z'::timestamptz),
    ('44-0', '2026-07-14T19:00:00Z'::timestamptz),
    ('45-0', '2026-07-15T19:00:00Z'::timestamptz),
    ('48-0', '2026-07-18T21:00:00Z'::timestamptz),
    ('49-0', '2026-07-19T19:00:00Z'::timestamptz)
)
update public.live_scores ls
set utc_date = c.kickoff_utc
from corrected c
where ls.match_key = c.match_key
  and coalesce(upper(ls.status), 'NS') = 'NS';
