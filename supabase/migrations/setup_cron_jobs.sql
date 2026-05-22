-- ═══════════════════════════════════════════════════════════════════════════
-- Extensions
-- ═══════════════════════════════════════════════════════════════════════════
create extension if not exists pg_cron  with schema extensions;
create extension if not exists pg_net   with schema extensions;

-- ═══════════════════════════════════════════════════════════════════════════
-- Helper: lets the edge function remove its own cron job when seeding is done
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.unschedule_cron(job_name text)
returns void
language sql
security definer
as $$
  select cron.unschedule(job_name);
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED INITIAL — rulează la 00:05 UTC, la fiecare 3 minute (6 batch-uri × 8 echipe)
-- Se dezactivează singur după ce toate 48 de echipe sunt salvate.
--
-- ÎNLOCUIEȘTE <SERVICE_ROLE_KEY> cu cheia din:
-- Supabase Dashboard → Settings → API → service_role (secret)
-- ═══════════════════════════════════════════════════════════════════════════
select cron.schedule(
  'seed-players-initial',
  '5,8,11,14,17,20 0 * * *',
  $$
    select net.http_post(
      url     := 'https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/seed-players-apifootball',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATE ZILNIC — rulează la 23:30 UTC în fiecare zi
-- Aduce statisticile (goluri, assist-uri, cartonașe, minute) pentru echipele
-- care au jucat în ziua respectivă.
--
-- ÎNLOCUIEȘTE <SERVICE_ROLE_KEY> cu aceeași cheie de mai sus.
-- ═══════════════════════════════════════════════════════════════════════════
select cron.schedule(
  'update-player-stats-daily',
  '30 23 * * *',
  $$
    select net.http_post(
      url     := 'https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/update-player-stats',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);
