-- Trigger: trimite push la toți abonații când se inserează o notificare nouă în system_notifications
--
-- PASUL 1 — rulează o singură dată în SQL Editor (înlocuiește cheia):
--
--   select vault.create_secret('SERVICE_ROLE_KEY_TAU', 'service_role_key');
--
-- (cheia o găsești în Supabase → Project Settings → API → service_role)
--
-- PASUL 2 — aplică restul migration-ului de mai jos.

create extension if not exists pg_net;

create or replace function public.push_on_notification_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  service_key text;
  payload     jsonb;
begin
  -- Citește service role key din Vault
  select decrypted_secret into service_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if service_key is null or service_key = '' then
    raise warning '[push_on_notification_insert] service_role_key not in vault — push skipped';
    return NEW;
  end if;

  payload := jsonb_build_object(
    'title', NEW.title,
    'body',  coalesce(NEW.body, ''),
    'url',   '/'
  );

  perform net.http_post(
    url     := 'https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body    := payload
  );

  return NEW;
end;
$$;

drop trigger if exists trg_push_on_notification_insert on public.system_notifications;

create trigger trg_push_on_notification_insert
  after insert on public.system_notifications
  for each row
  execute function public.push_on_notification_insert();
