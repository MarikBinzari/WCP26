-- Ensure poll-live-scores is called by pg_cron with the service role key.
-- The key must exist in Supabase Vault as "service_role_key".

do $$
declare
  service_key text;
begin
  select decrypted_secret
  into service_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if service_key is null or service_key = '' then
    raise exception 'Missing Vault secret: service_role_key';
  end if;

  if exists (select 1 from cron.job where jobname = 'poll-live-scores') then
    perform cron.unschedule('poll-live-scores');
  end if;

  perform cron.schedule(
    'poll-live-scores',
    '* * * * *',
    format(
      $cmd$
      select net.http_post(
        url     := 'https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/poll-live-scores',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || %L
        ),
        body    := '{}'::jsonb
      );
      $cmd$,
      service_key
    )
  );
end $$;
