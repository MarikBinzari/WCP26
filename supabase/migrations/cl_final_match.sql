-- UCL Final 2026: Paris Saint-Germain vs Arsenal
-- May 30, 2026 · Puskás Aréna, Budapest · 18:00 CEST
-- match_key = "-1-0"  (day encoding: May 30 = day -1, match index 0)

-- 1. match_day entry for May 30
INSERT INTO public.match_days (id, day_number, match_date, label)
VALUES (
  'b5c2a1d0-4e3f-4a2b-9c1d-0e5f6a7b8c9d',
  -1,
  '2026-05-30',
  '30 May'
)
ON CONFLICT (id) DO NOTHING;

-- 2. match entry for UCL Final
INSERT INTO public.matches (
  id,
  match_key,
  match_day_id,
  match_time,
  stage,
  group_id,
  venue
)
VALUES (
  'a1b2c3d4-e5f6-4a2b-9c1d-0e5f6a7b8c9d',
  '-1-0',
  'b5c2a1d0-4e3f-4a2b-9c1d-0e5f6a7b8c9d',
  '18:00',
  'UCL Final',
  NULL,
  'Puskás Aréna, Budapest'
)
ON CONFLICT (id) DO NOTHING;
