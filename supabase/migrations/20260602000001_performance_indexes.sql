-- ─────────────────────────────────────────────────────────────────────────────
-- Indexuri pentru performanță la scară
-- ─────────────────────────────────────────────────────────────────────────────

-- exact_scores: filtrat des după user_id + board_id în score_exact_picks și breakdown
CREATE INDEX IF NOT EXISTS idx_exact_scores_user_board
  ON public.exact_scores(user_id, board_id);

-- exact_scores: filtrat după match_id în join-uri
CREATE INDEX IF NOT EXISTS idx_exact_scores_match_id
  ON public.exact_scores(match_id);

-- live_scores: filtrat des după status = 'FT' în toate funcțiile de scoring
CREATE INDEX IF NOT EXISTS idx_live_scores_status
  ON public.live_scores(status);

-- board_scores: filtrat des după board_id în get_leaderboard
CREATE INDEX IF NOT EXISTS idx_board_scores_board_id
  ON public.board_scores(board_id);

-- board_scores: filtrat după user_id + board_id în apply_exact_scores
CREATE INDEX IF NOT EXISTS idx_board_scores_user_board
  ON public.board_scores(user_id, board_id);

-- matches: filtrat după stage în score_bracket_predictions și poll-live-scores
CREATE INDEX IF NOT EXISTS idx_matches_stage
  ON public.matches(stage);

-- matches: filtrat după group_id în score_bracket_predictions
CREATE INDEX IF NOT EXISTS idx_matches_group_id
  ON public.matches(group_id);

-- predictions: filtrat după user_id + board_id în score_bracket_predictions și breakdown
CREATE INDEX IF NOT EXISTS idx_predictions_user_board
  ON public.predictions(user_id, board_id);
