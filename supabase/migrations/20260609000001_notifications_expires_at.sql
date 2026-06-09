ALTER TABLE public.system_notifications
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
