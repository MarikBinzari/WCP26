-- Exact Score is evaluated after 90 minutes. Argentina vs Cape Verde was
-- persisted with the 3-2 score after extra time instead of the 1-1 FT score.
-- Keep 3-2 in the decider fields so knockout winner propagation is unchanged.
update public.live_scores
set regular_time_home_score = 1,
    regular_time_away_score = 1,
    penalty_home_score = 3,
    penalty_away_score = 2
where match_key = '33-0'
  and status = 'FT';

select public.apply_exact_scores();
