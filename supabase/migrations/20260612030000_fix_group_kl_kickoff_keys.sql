-- Correct kickoff_utc keys for the final Group K/L matches.
-- Predictions and match-team mappings use 27-2..27-5; a previous migration
-- assigned these kickoffs to 26-2..26-5, which are not the same matches.

update public.matches set kickoff_utc = '2026-06-27T23:30:00Z' where match_key = '27-2'; -- Colombia vs Portugal
update public.matches set kickoff_utc = '2026-06-27T23:30:00Z' where match_key = '27-3'; -- DR Congo vs Uzbekistan
update public.matches set kickoff_utc = '2026-06-27T21:00:00Z' where match_key = '27-4'; -- Panama vs England
update public.matches set kickoff_utc = '2026-06-27T21:00:00Z' where match_key = '27-5'; -- Croatia vs Ghana

update public.matches set kickoff_utc = null where match_key in ('26-2', '26-3', '26-4', '26-5');
