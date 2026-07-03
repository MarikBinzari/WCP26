-- USA vs Belgium (R16), 7 July at 03:00 Romania time.
-- Preserve the match ID so all existing exact-score predictions stay attached.
update public.matches
set kickoff_utc = '2026-07-07T00:00:00Z'::timestamptz,
    team2_id = (select id from public.teams where name = 'Belgium')
where match_key = '36-1';

update public.live_scores
set utc_date = '2026-07-07T00:00:00Z'::timestamptz
where match_key = '36-1';
