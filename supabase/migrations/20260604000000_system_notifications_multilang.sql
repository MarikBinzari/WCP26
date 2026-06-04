-- Add per-language title/body columns to system_notifications.
-- The existing title/body columns keep Romanian as the default fallback.
alter table public.system_notifications
  add column if not exists title_en text,
  add column if not exists title_fr text,
  add column if not exists body_en  text,
  add column if not exists body_fr  text;
