-- Add kickoff_utc timestamptz to matches table
alter table public.matches add column if not exists kickoff_utc timestamptz;

-- Populate kickoff_utc for all group stage matches from football-data.org API
-- Source: https://api.football-data.org/v4/competitions/2000/matches?matchday=1,2,3

update public.matches set kickoff_utc = '2026-06-11T19:00:00Z' where match_key = '11-0'; -- Mexico vs South Africa
update public.matches set kickoff_utc = '2026-06-12T02:00:00Z' where match_key = '11-1'; -- Korea Republic vs Czech Republic
update public.matches set kickoff_utc = '2026-06-12T19:00:00Z' where match_key = '12-0'; -- Canada vs Bosnia
update public.matches set kickoff_utc = '2026-06-13T01:00:00Z' where match_key = '12-2'; -- USA vs Paraguay
update public.matches set kickoff_utc = '2026-06-13T19:00:00Z' where match_key = '12-1'; -- Qatar vs Switzerland
update public.matches set kickoff_utc = '2026-06-13T22:00:00Z' where match_key = '13-0'; -- Brazil vs Morocco
update public.matches set kickoff_utc = '2026-06-14T01:00:00Z' where match_key = '13-1'; -- Haiti vs Scotland
update public.matches set kickoff_utc = '2026-06-14T04:00:00Z' where match_key = '12-3'; -- Australia vs Turkey
update public.matches set kickoff_utc = '2026-06-14T17:00:00Z' where match_key = '14-0'; -- Germany vs Curacao
update public.matches set kickoff_utc = '2026-06-14T20:00:00Z' where match_key = '14-2'; -- Netherlands vs Japan
update public.matches set kickoff_utc = '2026-06-14T23:00:00Z' where match_key = '14-1'; -- Ivory Coast vs Ecuador
update public.matches set kickoff_utc = '2026-06-15T02:00:00Z' where match_key = '14-3'; -- Sweden vs Tunisia
update public.matches set kickoff_utc = '2026-06-15T16:00:00Z' where match_key = '15-2'; -- Spain vs Cape Verde
update public.matches set kickoff_utc = '2026-06-15T19:00:00Z' where match_key = '15-0'; -- Belgium vs Egypt
update public.matches set kickoff_utc = '2026-06-15T22:00:00Z' where match_key = '15-3'; -- Saudi Arabia vs Uruguay
update public.matches set kickoff_utc = '2026-06-16T01:00:00Z' where match_key = '15-1'; -- Iran vs New Zealand
update public.matches set kickoff_utc = '2026-06-16T19:00:00Z' where match_key = '16-0'; -- France vs Senegal
update public.matches set kickoff_utc = '2026-06-16T22:00:00Z' where match_key = '16-1'; -- Iraq vs Norway
update public.matches set kickoff_utc = '2026-06-17T01:00:00Z' where match_key = '16-2'; -- Argentina vs Algeria
update public.matches set kickoff_utc = '2026-06-17T04:00:00Z' where match_key = '16-3'; -- Austria vs Jordan
update public.matches set kickoff_utc = '2026-06-17T17:00:00Z' where match_key = '17-0'; -- Portugal vs DR Congo
update public.matches set kickoff_utc = '2026-06-17T20:00:00Z' where match_key = '17-2'; -- England vs Croatia
update public.matches set kickoff_utc = '2026-06-17T23:00:00Z' where match_key = '17-3'; -- Ghana vs Panama
update public.matches set kickoff_utc = '2026-06-18T02:00:00Z' where match_key = '17-1'; -- Uzbekistan vs Colombia

-- Matchday 2
update public.matches set kickoff_utc = '2026-06-18T16:00:00Z' where match_key = '18-0'; -- Czech Republic vs South Africa
update public.matches set kickoff_utc = '2026-06-18T19:00:00Z' where match_key = '18-2'; -- Switzerland vs Bosnia
update public.matches set kickoff_utc = '2026-06-18T22:00:00Z' where match_key = '18-3'; -- Canada vs Qatar
update public.matches set kickoff_utc = '2026-06-19T01:00:00Z' where match_key = '18-1'; -- Mexico vs Korea Republic
update public.matches set kickoff_utc = '2026-06-19T19:00:00Z' where match_key = '19-3'; -- USA vs Australia
update public.matches set kickoff_utc = '2026-06-19T22:00:00Z' where match_key = '19-1'; -- Scotland vs Morocco
update public.matches set kickoff_utc = '2026-06-20T00:30:00Z' where match_key = '19-0'; -- Brazil vs Haiti
update public.matches set kickoff_utc = '2026-06-20T03:00:00Z' where match_key = '19-2'; -- Turkey vs Paraguay
update public.matches set kickoff_utc = '2026-06-20T17:00:00Z' where match_key = '20-2'; -- Netherlands vs Sweden
update public.matches set kickoff_utc = '2026-06-20T20:00:00Z' where match_key = '20-0'; -- Germany vs Ivory Coast
update public.matches set kickoff_utc = '2026-06-21T00:00:00Z' where match_key = '20-1'; -- Ecuador vs Curacao
update public.matches set kickoff_utc = '2026-06-21T04:00:00Z' where match_key = '20-3'; -- Tunisia vs Japan
update public.matches set kickoff_utc = '2026-06-21T16:00:00Z' where match_key = '21-2'; -- Spain vs Saudi Arabia
update public.matches set kickoff_utc = '2026-06-21T19:00:00Z' where match_key = '21-0'; -- Belgium vs Iran
update public.matches set kickoff_utc = '2026-06-21T22:00:00Z' where match_key = '21-3'; -- Uruguay vs Cape Verde
update public.matches set kickoff_utc = '2026-06-22T01:00:00Z' where match_key = '21-1'; -- New Zealand vs Egypt
update public.matches set kickoff_utc = '2026-06-22T17:00:00Z' where match_key = '22-2'; -- Argentina vs Austria
update public.matches set kickoff_utc = '2026-06-22T21:00:00Z' where match_key = '22-0'; -- France vs Iraq
update public.matches set kickoff_utc = '2026-06-23T00:00:00Z' where match_key = '22-1'; -- Norway vs Senegal
update public.matches set kickoff_utc = '2026-06-23T03:00:00Z' where match_key = '22-3'; -- Jordan vs Algeria
update public.matches set kickoff_utc = '2026-06-23T17:00:00Z' where match_key = '23-0'; -- Portugal vs Uzbekistan
update public.matches set kickoff_utc = '2026-06-23T20:00:00Z' where match_key = '23-2'; -- England vs Ghana
update public.matches set kickoff_utc = '2026-06-23T23:00:00Z' where match_key = '23-3'; -- Panama vs Croatia
update public.matches set kickoff_utc = '2026-06-24T02:00:00Z' where match_key = '23-1'; -- Colombia vs DR Congo

-- Matchday 3
update public.matches set kickoff_utc = '2026-06-24T19:00:00Z' where match_key = '24-2'; -- Switzerland vs Canada
update public.matches set kickoff_utc = '2026-06-24T19:00:00Z' where match_key = '24-3'; -- Bosnia vs Qatar
update public.matches set kickoff_utc = '2026-06-24T22:00:00Z' where match_key = '24-5'; -- Morocco vs Haiti
update public.matches set kickoff_utc = '2026-06-24T22:00:00Z' where match_key = '24-4'; -- Scotland vs Brazil
update public.matches set kickoff_utc = '2026-06-25T01:00:00Z' where match_key = '24-0'; -- Czech Republic vs Mexico
update public.matches set kickoff_utc = '2026-06-25T01:00:00Z' where match_key = '24-1'; -- South Africa vs Korea Republic
update public.matches set kickoff_utc = '2026-06-25T20:00:00Z' where match_key = '25-2'; -- Ecuador vs Germany
update public.matches set kickoff_utc = '2026-06-25T20:00:00Z' where match_key = '25-3'; -- Curacao vs Ivory Coast
update public.matches set kickoff_utc = '2026-06-25T23:00:00Z' where match_key = '25-4'; -- Tunisia vs Netherlands
update public.matches set kickoff_utc = '2026-06-25T23:00:00Z' where match_key = '25-5'; -- Japan vs Sweden
update public.matches set kickoff_utc = '2026-06-26T02:00:00Z' where match_key = '25-0'; -- Turkey vs USA
update public.matches set kickoff_utc = '2026-06-26T02:00:00Z' where match_key = '25-1'; -- Paraguay vs Australia
update public.matches set kickoff_utc = '2026-06-26T19:00:00Z' where match_key = '26-0'; -- Norway vs France
update public.matches set kickoff_utc = '2026-06-26T19:00:00Z' where match_key = '26-1'; -- Senegal vs Iraq
update public.matches set kickoff_utc = '2026-06-27T00:00:00Z' where match_key = '25-8'; -- Uruguay vs Spain
update public.matches set kickoff_utc = '2026-06-27T00:00:00Z' where match_key = '25-9'; -- Cape Verde vs Saudi Arabia
update public.matches set kickoff_utc = '2026-06-27T03:00:00Z' where match_key = '25-6'; -- New Zealand vs Belgium
update public.matches set kickoff_utc = '2026-06-27T03:00:00Z' where match_key = '25-7'; -- Egypt vs Iran
update public.matches set kickoff_utc = '2026-06-27T21:00:00Z' where match_key = '26-4'; -- Panama vs England
update public.matches set kickoff_utc = '2026-06-27T21:00:00Z' where match_key = '26-5'; -- Croatia vs Ghana
update public.matches set kickoff_utc = '2026-06-27T23:30:00Z' where match_key = '26-2'; -- Colombia vs Portugal
update public.matches set kickoff_utc = '2026-06-27T23:30:00Z' where match_key = '26-3'; -- DR Congo vs Uzbekistan
update public.matches set kickoff_utc = '2026-06-28T02:00:00Z' where match_key = '27-0'; -- Jordan vs Argentina
update public.matches set kickoff_utc = '2026-06-28T02:00:00Z' where match_key = '27-1'; -- Algeria vs Austria

-- Update the exact score lock trigger to also check kickoff_utc as fallback
-- (protects even if live_scores API fails to update)
create or replace function public.check_exact_score_lock()
returns trigger language plpgsql security definer as $$
declare
  v_match_key  text;
  v_status     text;
  v_kickoff    timestamptz;
begin
  select m.match_key, m.kickoff_utc
    into v_match_key, v_kickoff
  from public.matches m where m.id = NEW.match_id;

  select ls.status into v_status
  from public.live_scores ls where ls.match_key = v_match_key;

  -- Locked if live_scores says started
  if v_status is not null and v_status != 'NS' then
    raise exception 'Match % has already started (status: %). Predictions are locked.', v_match_key, v_status;
  end if;

  -- Locked if kickoff_utc has passed (fallback when API is down)
  if v_kickoff is not null and v_kickoff <= now() then
    raise exception 'Match % kickoff was at %. Predictions are locked.', v_match_key, v_kickoff;
  end if;

  return NEW;
end;
$$;
