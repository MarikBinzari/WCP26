-- Keep the existing match IDs (and exact-score foreign keys), but align the
-- knockout match keys with the canonical calendar used by the application.

update public.matches
set match_key = 'tmp-' || match_key
where stage in ('r16', 'qf', 'sf');

update public.matches
set match_key = case match_key
  when 'tmp-38-0' then '34-0'
  when 'tmp-38-1' then '34-1'
  when 'tmp-39-0' then '35-0'
  when 'tmp-39-1' then '35-1'
  when 'tmp-40-0' then '36-0'
  when 'tmp-40-1' then '36-1'
  when 'tmp-41-0' then '37-0'
  when 'tmp-41-1' then '37-1'
  when 'tmp-44-0' then '39-0'
  when 'tmp-44-1' then '40-0'
  when 'tmp-45-0' then '41-0'
  when 'tmp-45-1' then '41-1'
  when 'tmp-48-0' then '44-0'
  when 'tmp-48-1' then '45-0'
  else match_key
end
where match_key like 'tmp-%';

update public.matches
set kickoff_utc = case match_key
  when '34-0' then '2026-07-04T21:00:00Z'::timestamptz
  when '34-1' then '2026-07-04T17:00:00Z'::timestamptz
  when '35-0' then '2026-07-05T20:00:00Z'::timestamptz
  when '35-1' then '2026-07-05T22:00:00Z'::timestamptz
  when '36-0' then '2026-07-06T23:00:00Z'::timestamptz
  when '36-1' then '2026-07-06T23:00:00Z'::timestamptz
  when '37-0' then '2026-07-07T20:00:00Z'::timestamptz
  when '37-1' then '2026-07-07T23:00:00Z'::timestamptz
  when '39-0' then '2026-07-09T20:00:00Z'::timestamptz
  when '40-0' then '2026-07-10T23:00:00Z'::timestamptz
  when '41-0' then '2026-07-11T21:00:00Z'::timestamptz
  when '41-1' then '2026-07-12T00:00:00Z'::timestamptz
  when '44-0' then '2026-07-15T01:00:00Z'::timestamptz
  when '45-0' then '2026-07-16T01:00:00Z'::timestamptz
  when '49-0' then '2026-07-20T01:00:00Z'::timestamptz
  else kickoff_utc
end
where match_key in (
  '34-0','34-1','35-0','35-1','36-0','36-1','37-0','37-1',
  '39-0','40-0','41-0','41-1','44-0','45-0','49-0'
);

-- Old seeds contained partially propagated teams in different bracket slots.
-- The live-score function repopulates these columns from confirmed winners.
update public.matches
set team1_id = null, team2_id = null
where stage in ('r16', 'qf', 'sf', 'final')
  and match_key <> '-1-0';
