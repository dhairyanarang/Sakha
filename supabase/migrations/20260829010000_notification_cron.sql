-- The clock behind the notifications.
--
-- pg_cron wakes every minute and asks the edge function to drain the outbox;
-- the function asks the database, in the same pass, to queue any medicine
-- reminder that has just come due. One moving part, not two.
--
-- Nothing here is load-bearing for correctness. If the schedule stops, the
-- outbox simply fills and drains later, and the app carries on being right.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- The reminder pass, reachable by the service role only.
--
-- Wrapped in public because PostgREST cannot see the private schema, which is
-- exactly the arrangement the rest of this project uses: helpers stay private,
-- and only the deliberate entry point is exposed. EXECUTE is then revoked from
-- everyone except service_role, so no signed-in user can drive the scheduler.
-- ---------------------------------------------------------------------------
create or replace function public.run_medicine_reminders()
returns int language sql security definer set search_path = public as $$
  select private.enqueue_medicine_reminders();
$$;

revoke all on function public.run_medicine_reminders() from public, anon, authenticated;
grant execute on function public.run_medicine_reminders() to service_role;

-- ---------------------------------------------------------------------------
-- The dispatch secret lives in Vault, never in a table anyone can select.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'dispatch_secret') then
    perform vault.create_secret(
      current_setting('sakha.dispatch_secret', true),
      'dispatch_secret',
      'Shared secret the cron job presents to the push-dispatch function.'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Every minute: drain.
--
-- A minute is frequent enough that a reminder lands within a minute of its
-- hour, and cheap enough to be uninteresting — an empty outbox is one indexed
-- query returning nothing.
-- ---------------------------------------------------------------------------
create or replace function private.dispatch_notifications()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'dispatch_secret';

  if v_secret is null then
    return; -- Not configured yet; do nothing rather than call unauthenticated.
  end if;

  -- pg_net exposes its functions in the `net` schema whatever schema the
  -- extension itself was installed into.
  perform net.http_post(
    url := 'https://yfuihfgvheavodrzxiwh.supabase.co/functions/v1/push-dispatch',
    body := '{}'::jsonb,
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-dispatch-secret', v_secret
    ),
    timeout_milliseconds := 20000
  );
end;
$$;

revoke all on function private.dispatch_notifications() from public, anon, authenticated;

select cron.schedule(
  'sakha-push-dispatch',
  '* * * * *',
  $$select private.dispatch_notifications()$$
);
