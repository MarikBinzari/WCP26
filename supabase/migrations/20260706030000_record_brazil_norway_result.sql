-- Record the confirmed Round of 16 result: Brazil 1-2 Norway.
-- Norway advances, so downstream bracket slots can be propagated.

update public.matches
set team1_id = (select id from public.teams where name = 'Brazil' limit 1),
    team2_id = (select id from public.teams where name = 'Norway' limit 1)
where match_key = '35-0';

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
  '35-0',
  'FT',
  1,
  2,
  null,
  null,
  null,
  '2026-07-05T20:00:00Z'::timestamptz,
  now()
)
on conflict (match_key) do update
set status = 'FT',
    regular_time_home_score = 1,
    regular_time_away_score = 2,
    penalty_home_score = null,
    penalty_away_score = null,
    api_minute = null,
    utc_date = '2026-07-05T20:00:00Z'::timestamptz,
    updated_at = now();

select public.apply_bracket_scores();
select public.apply_exact_scores();

update public.matches
set team1_id = (select id from public.teams where name = 'Norway' limit 1),
    team2_id = (select id from public.teams where name = 'England' limit 1)
where match_key = '41-0';
