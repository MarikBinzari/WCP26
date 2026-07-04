-- Complete the two final-week fixtures so polling can resolve them by the same
-- canonical keys and kickoff times used by the app calendar.
update public.matches
set kickoff_utc = '2026-07-20T01:00:00Z'::timestamptz
where match_key = '49-0';

insert into public.matches (
  match_key,
  match_day_id,
  match_time,
  kickoff_utc,
  stage,
  team1_slot,
  team2_slot,
  venue,
  match_order
)
select
  '48-0',
  md.id,
  '21:00',
  '2026-07-19T01:00:00Z'::timestamptz,
  'final',
  'SF L1',
  'SF L2',
  'Hard Rock Stadium',
  0
from public.match_days md
where md.day_number = 48
on conflict (match_key) do update
set kickoff_utc = excluded.kickoff_utc,
    match_time = excluded.match_time,
    venue = excluded.venue;
