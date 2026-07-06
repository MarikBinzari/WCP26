-- Record the confirmed Round of 16 result: Mexico 2-3 England.
-- This makes the match visible in Central Stats, unlocks Exact Score display,
-- and recalculates bracket/exact-score points immediately after migration.

update public.matches
set team1_id = (select id from public.teams where name = 'Mexico' limit 1),
    team2_id = (select id from public.teams where name = 'England' limit 1)
where match_key = '35-1';

insert into public.live_scores (
  match_key,
  status,
  regular_time_home_score,
  regular_time_away_score,
  penalty_home_score,
  penalty_away_score,
  api_minute,
  utc_date,
  updated_at
) values (
  '35-1',
  'FT',
  2,
  3,
  null,
  null,
  null,
  '2026-07-06T00:00:00Z'::timestamptz,
  now()
)
on conflict (match_key) do update
set status = 'FT',
    regular_time_home_score = 2,
    regular_time_away_score = 3,
    penalty_home_score = null,
    penalty_away_score = null,
    api_minute = null,
    utc_date = '2026-07-06T00:00:00Z'::timestamptz,
    updated_at = now();

select public.apply_bracket_scores();
select public.apply_exact_scores();
