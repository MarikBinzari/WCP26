-- Portugal vs Spain (R16) is played on 6 July at 22:00 Romania time.
-- Keep the existing match ID so all exact-score predictions remain attached.
update public.matches
set kickoff_utc = '2026-07-06T19:00:00Z'::timestamptz
where match_key = '36-0';

update public.live_scores
set utc_date = '2026-07-06T19:00:00Z'::timestamptz
where match_key = '36-0';
