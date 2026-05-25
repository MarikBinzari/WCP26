-- Add per-category pts columns to board_scores
alter table public.board_scores
  add column if not exists pred_pts  int not null default 0,
  add column if not exists exact_pts int not null default 0;

-- Keep total_pts in sync: pred_pts + exact_pts
-- (total_pts already exists and is still used by get_leaderboard)
-- When scoring functions update board_scores they should now set
-- pred_pts and exact_pts separately; total_pts = pred_pts + exact_pts.

-- Backfill: move existing total_pts entirely into pred_pts
-- (safe assumption before exact scoring runs)
update public.board_scores
set pred_pts = total_pts
where pred_pts = 0 and total_pts > 0;
