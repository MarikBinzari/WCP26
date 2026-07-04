-- Preserve the 1-1 score after 90 minutes and record Egypt as the confirmed
-- knockout winner. The provider had persisted a non-decisive 0-0 shootout.
update public.live_scores
set penalty_home_score = 0,
    penalty_away_score = 1
where match_key = '33-2'
  and status = 'FT'
  and regular_time_home_score = regular_time_away_score;
