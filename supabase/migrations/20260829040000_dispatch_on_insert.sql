-- Send it when it happens, not when the clock comes round.
--
-- The outbox row is written inside the transaction that caused it, so it
-- exists the instant she confirms a medicine. Nothing then looked at it until
-- pg_cron next fired, which is once a minute — so the delay her son felt was
-- not the push service being slow, it was the queue waiting for a tick. On
-- average thirty seconds, and up to sixty.
--
-- This adds one thing: the insert now pokes the dispatcher itself. The cron
-- job stays exactly as it was, because an event-driven send has one failure
-- mode a timer does not — if the poke is lost, nothing else is coming. The
-- timer remains the thing that guarantees delivery eventually; the poke is
-- what makes it usually immediate.
--
-- Which means both can now run at once, so the claim has to become atomic.
-- That is the other half of this migration and the more important half.

-- ---------------------------------------------------------------------------
-- 1. Claiming a batch, atomically.
--
-- The dispatcher used to SELECT the pending rows and then UPDATE them. With
-- one caller a minute that was fine. With a poke and a tick landing together
-- it is a race: both read the same rows as unsent, both send them, and she
-- gets told twice about one action.
--
-- A single UPDATE ... RETURNING closes it. FOR UPDATE SKIP LOCKED means a
-- second caller arriving mid-flight steps over the locked rows and takes the
-- next ones instead of blocking or duplicating. Whoever gets the row owns it.
--
-- sent_at is still stamped BEFORE the send, which keeps the original
-- at-most-once bias: a reminder that silently fails is a missed buzz, a
-- reminder sent twice is the phone crying wolf, and she is the one who has to
-- trust it.
-- ---------------------------------------------------------------------------
create or replace function private.claim_notifications(p_limit int)
returns setof public.notification_outbox
language sql security definer set search_path = public as $$
  update public.notification_outbox o
     set sent_at = now(),
         attempts = o.attempts + 1
   where o.id in (
     select id
       from public.notification_outbox
      where sent_at is null
      order by created_at
      limit p_limit
      for update skip locked
   )
  returning o.*;
$$;

-- The deliberate entry point. Wrapped in public because PostgREST cannot see
-- the private schema, and then revoked from everyone except the service role —
-- the same arrangement run_medicine_reminders already uses. No signed-in user
-- can drain the queue.
create or replace function public.claim_notifications(p_limit int default 50)
returns setof public.notification_outbox
language sql security definer set search_path = public as $$
  select * from private.claim_notifications(p_limit);
$$;

revoke all on function private.claim_notifications(int) from public, anon, authenticated;
revoke all on function public.claim_notifications(int) from public, anon, authenticated;
grant execute on function public.claim_notifications(int) to service_role;

-- ---------------------------------------------------------------------------
-- 2. The poke.
--
-- pg_net queues the request inside this transaction and its background worker
-- only sees committed rows, so the HTTP call cannot leave before the outbox
-- row it is about is visible. If the transaction rolls back, so does the poke.
--
-- Reminders are excluded, and not only because they are scheduled rather than
-- provoked. The dispatcher enqueues reminders itself as its first step, so a
-- reminder insert that poked the dispatcher would ask it to run again, which
-- would enqueue again — a loop that only stops because the dedupe key makes
-- the second pass insert nothing. Excluding them removes the cycle rather than
-- relying on it terminating.
--
-- Reminders lose nothing by this: they are enqueued by the same run that then
-- claims and sends them, so they never wait for a second tick.
-- ---------------------------------------------------------------------------
create or replace function private.dispatch_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform private.dispatch_notifications();
  return null;
end;
$$;

revoke all on function private.dispatch_on_insert() from public, anon, authenticated;

drop trigger if exists notification_outbox_dispatch on public.notification_outbox;
create trigger notification_outbox_dispatch
  after insert on public.notification_outbox
  for each row
  when (new.kind <> 'medicine_reminder')
  execute function private.dispatch_on_insert();

comment on trigger notification_outbox_dispatch on public.notification_outbox is
  'Asks the dispatcher to run now. The cron job still runs every minute and is what guarantees delivery if this poke is ever lost.';
