-- Ensure Switzerland vs Algeria (R32 match '32-2') exists in matches table.
-- This match was missing from the initial seeding, causing saveExactScore to fail silently.
DO $$
DECLARE
  v_match_day_id uuid;
  v_t1_id        uuid;
  v_t2_id        uuid;
BEGIN
  -- Find the match_day_id used by other day-32 matches
  SELECT match_day_id INTO v_match_day_id
  FROM public.matches
  WHERE match_key IN ('32-0', '32-1')
  LIMIT 1;

  -- Fallback: look it up directly from match_days
  IF v_match_day_id IS NULL THEN
    SELECT id INTO v_match_day_id
    FROM public.match_days
    WHERE day_number = 32
    LIMIT 1;
  END IF;

  IF v_match_day_id IS NULL THEN
    RAISE WARNING 'match_day for day 32 not found — skipping 32-2 insert';
    RETURN;
  END IF;

  SELECT id INTO v_t1_id FROM public.teams WHERE name = 'Switzerland' LIMIT 1;
  SELECT id INTO v_t2_id FROM public.teams WHERE name = 'Algeria' LIMIT 1;

  IF v_t1_id IS NULL OR v_t2_id IS NULL THEN
    RAISE WARNING 'Switzerland or Algeria not found in teams — skipping 32-2 insert';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.matches WHERE match_key = '32-2') THEN
    -- Already exists — just make sure team IDs and kickoff are correct
    UPDATE public.matches
    SET team1_id    = v_t1_id,
        team2_id    = v_t2_id,
        kickoff_utc = '2026-07-03T03:00:00Z'::timestamptz
    WHERE match_key = '32-2'
      AND (team1_id IS NULL OR team2_id IS NULL);
    RETURN;
  END IF;

  INSERT INTO public.matches (id, match_key, match_day_id, match_time, stage, kickoff_utc, team1_id, team2_id, venue)
  VALUES (
    gen_random_uuid(),
    '32-2',
    v_match_day_id,
    '06:00',
    'r32',
    '2026-07-03T03:00:00Z'::timestamptz,
    v_t1_id,
    v_t2_id,
    'BC Place'
  );

  RAISE NOTICE 'Inserted 32-2 Switzerland vs Algeria';
END;
$$;
