-- Fix RLS policies for predictions table
-- Allows authenticated users to insert and update their own rows

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "predictions_public_read" ON public.predictions;
DROP POLICY IF EXISTS "predictions_insert_own" ON public.predictions;
DROP POLICY IF EXISTS "predictions_update_own" ON public.predictions;
DROP POLICY IF EXISTS "users can view all predictions" ON public.predictions;
DROP POLICY IF EXISTS "users can insert own predictions" ON public.predictions;
DROP POLICY IF EXISTS "users can update own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.predictions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.predictions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.predictions;

-- Read: anyone (for leaderboard/stats)
CREATE POLICY "predictions_public_read" ON public.predictions
  FOR SELECT USING (true);

-- Insert: authenticated user can insert their own row
CREATE POLICY "predictions_insert_own" ON public.predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update: authenticated user can update their own row
CREATE POLICY "predictions_update_own" ON public.predictions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
