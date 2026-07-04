-- R16 fixtures on 7 July, expressed in UTC:
-- Argentina vs Egypt at 19:00 Romania time (16:00 UTC)
-- Switzerland vs Colombia at 23:00 Romania time (20:00 UTC)
update public.matches
set kickoff_utc = '2026-07-07T16:00:00Z'::timestamptz,
    team2_id = (select id from public.teams where name = 'Egypt')
where match_key = '37-0';

update public.matches
set kickoff_utc = '2026-07-07T20:00:00Z'::timestamptz
where match_key = '37-1';

update public.live_scores
set utc_date = case match_key
  when '37-0' then '2026-07-07T16:00:00Z'::timestamptz
  when '37-1' then '2026-07-07T20:00:00Z'::timestamptz
end
where match_key in ('37-0', '37-1');
