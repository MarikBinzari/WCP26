-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Create live_scores table
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.live_scores (
  match_key   text        primary key,  -- format: "${day}-${matchIdx}" e.g. "11-0"
  status      text        not null default 'NS',  -- NS | LIVE | FT
  home_score  integer,    -- null until match starts
  away_score  integer,    -- null until match starts
  live_min    integer,    -- current minute if LIVE (null on free tier)
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.live_scores enable row level security;

-- Anyone can read live scores
create policy "public_read_live_scores"
  on public.live_scores for select
  using (true);

-- Only service role (Edge Function) can write
create policy "service_write_live_scores"
  on public.live_scores for all
  using (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Enable Realtime (so frontend gets push updates)
-- ═══════════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.live_scores;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Cron job — calls Edge Function every 60 seconds
-- Run AFTER deploying the Edge Function via Supabase CLI.
-- Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with real values.
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions (if not already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule: every minute
select cron.schedule(
  'poll-live-scores',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/poll-live-scores',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcWhyY29oemR3bXJyb2xnbmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjYyOTcsImV4cCI6MjA5MzUwMjI5N30.dBaSLIDIzwDbIxRFx7oM7Kc5hvN5Xd_6DQ17J2sCtcQ'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- To verify the cron was created:
-- select * from cron.job;

-- To remove it later:
-- select cron.unschedule('poll-live-scores');
