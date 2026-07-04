-- Preserve the 2-2 score after 90 minutes and record Belgium as the confirmed
-- knockout winner. The provider omitted the decisive shootout/extra-time data.
update public.live_scores
set penalty_home_score = 1,
    penalty_away_score = 0
where match_key = '31-2'
  and status = 'FT'
  and regular_time_home_score = regular_time_away_score;
