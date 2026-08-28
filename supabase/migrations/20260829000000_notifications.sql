-- Notifications, V1.
--
-- Two things have to be true and neither is about push:
--
--   1. A notification is never required for correctness. The app is the source
--      of truth; if every push in this file failed forever, she would still
--      open Sakha and see exactly the right thing.
--   2. A notification is never sent for something that did not happen. That is
--      why events are written by TRIGGERS into an outbox in the SAME
--      transaction as the row that caused them — a rolled-back reading
--      enqueues nothing, because the enqueue rolls back with it.
--
-- Sending is a separate, later, retryable step. It cannot corrupt anything.

-- ---------------------------------------------------------------------------
-- 1. Which language this DEVICE reads.
--
-- Not the account's. accounts.language is hers; a family member's language
-- lives in a cookie on his own phone and has no row anywhere. A notification
-- goes to a device, so the device is what carries the language.
-- ---------------------------------------------------------------------------
alter table public.push_subscriptions
  add column if not exists language text not null default 'en',
  -- Bumped on every re-subscribe, so a long-dead endpoint is identifiable
  -- even before the push service tells us it is gone.
  add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 2. The outbox.
--
-- One row per thing worth telling someone about. Deliberately NOT one row per
-- recipient: who should receive it is a question answered at send time, from
-- account_members, so that access revoked between the event and the send is
-- honoured. A queued notification for a removed family member is never sent.
-- ---------------------------------------------------------------------------
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,

  -- medicine_reminder | medicine_confirmed | measurement | document
  kind text not null,

  -- Who did it. Null for a reminder, which nobody did. Excluded from the
  -- recipients, because being told about your own action is noise.
  actor_id uuid references auth.users (id) on delete set null,

  -- Enough to render the copy without reading the health tables again at send
  -- time. Values are already formatted ("124 mg/dL"): units are Latin in both
  -- languages, and medicine names are hers and never translated.
  slot public.time_of_day,
  measurement_type public.measurement_type,
  body_value text,
  medicine_names text,

  /**
   * The idempotency key.
   *
   * A reminder is keyed on the dose it is about, so the scheduler may run as
   * often as it likes and the second insert simply does nothing. An event is
   * keyed on the row that caused it, so a retried write cannot notify twice.
   */
  dedupe_key text not null unique,

  created_at timestamptz not null default now(),
  -- Null until delivery has been attempted. Not a success flag: a push that
  -- reaches nobody is still done being tried.
  sent_at timestamptz,
  attempts int not null default 0,
  last_error text
);

create index if not exists notification_outbox_pending
  on public.notification_outbox (created_at)
  where sent_at is null;

-- RLS: nobody reads this over PostgREST. It is drained by the edge function
-- using the service role, which bypasses RLS. No policy = no access, which is
-- the correct answer for a queue containing health values.
alter table public.notification_outbox enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Triggers. The event is born inside the transaction that caused it.
-- ---------------------------------------------------------------------------

create or replace function private.enqueue_medicine_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_names text;
begin
  if new.status is distinct from 'confirmed' then
    return new;
  end if;

  -- Every medicine confirmed for this slot today, so the notification can say
  -- what she took rather than that something happened.
  select string_agg(m.name, ', ' order by m.name) into v_names
  from public.medication_logs l
  join public.medications m on m.id = l.medication_id
  where l.account_id = new.account_id
    and l.local_date = new.local_date
    and l.slot = new.slot
    and l.status = 'confirmed';

  insert into public.notification_outbox
    (account_id, kind, actor_id, slot, medicine_names, dedupe_key)
  values
    (new.account_id, 'medicine_confirmed', new.created_by, new.slot, v_names,
     'confirmed:' || new.account_id || ':' || new.local_date || ':' || new.slot)
  -- One notification per slot, however many medicines are in it: confirming
  -- three tablets is one action to her and should be one buzz to him.
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

drop trigger if exists medication_logs_notify on public.medication_logs;
create trigger medication_logs_notify
  after insert or update of status on public.medication_logs
  for each row execute function private.enqueue_medicine_confirmed();

create or replace function private.enqueue_measurement()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_body text;
begin
  v_body := case new.type
    when 'blood_pressure' then new.value::text || ' / ' || coalesce(new.value_secondary::text, '') || ' ' || new.unit
    else trim(trailing '.0' from new.value::text) || ' ' || new.unit
  end;

  insert into public.notification_outbox
    (account_id, kind, actor_id, measurement_type, body_value, dedupe_key)
  values
    (new.account_id, 'measurement', new.created_by, new.type, v_body,
     'measurement:' || new.id)
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

drop trigger if exists health_measurements_notify on public.health_measurements;
create trigger health_measurements_notify
  after insert on public.health_measurements
  for each row execute function private.enqueue_measurement();

create or replace function private.enqueue_document()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- The document's TITLE is deliberately absent. It lands on a lock screen,
  -- and "Biopsy result" is not something to announce to a room.
  insert into public.notification_outbox (account_id, kind, actor_id, dedupe_key)
  values (new.account_id, 'document', new.created_by, 'document:' || new.id)
  on conflict (dedupe_key) do nothing;
  return new;
end;
$$;

drop trigger if exists health_documents_notify on public.health_documents;
create trigger health_documents_notify
  after insert on public.health_documents
  for each row execute function private.enqueue_document();

-- ---------------------------------------------------------------------------
-- 4. The reminder scheduler.
--
-- Runs often and enqueues rarely. For each account and each slot whose time
-- has arrived in HER timezone, one grouped reminder — but only while at least
-- one medicine in that slot is still unanswered.
--
-- "Unanswered" is the ABSENCE of a log row, which is the same rule the Home
-- screen uses. So confirming late does not earn a second reminder: the row
-- exists, the slot drops out, and nothing more is queued. And because the
-- dedupe key names the dose, a slot can only ever produce one.
-- ---------------------------------------------------------------------------
create or replace function private.enqueue_medicine_reminders(p_now timestamptz default now())
returns int language plpgsql security definer set search_path = public as $$
declare
  -- The clock is a parameter so the schedule can actually be tested. Cron
  -- always passes nothing and gets now(); a test can ask what happens at half
  -- past nine without waiting until half past nine.
  v_now timestamptz := p_now;
  v_today date := (v_now at time zone 'Asia/Kolkata')::date;
  v_hour int := extract(hour from (v_now at time zone 'Asia/Kolkata'));
  v_count int := 0;
begin
  with due as (
    select
      m.account_id,
      s.slot,
      string_agg(m.name, ', ' order by m.name) as names
    from public.medications m
    cross join lateral (values
      ('morning'::public.time_of_day, 9),
      ('afternoon'::public.time_of_day, 14),
      ('evening'::public.time_of_day, 20)
    ) as s(slot, at_hour)
    where m.archived_at is null
      and m.times_of_day @> array[s.slot]
      -- The hour has arrived, and we do not reach back more than three hours:
      -- a reminder for this morning delivered at eight at night is worse than
      -- no reminder, and she has the app for the rest.
      and v_hour >= s.at_hour
      and v_hour < s.at_hour + 3
      and not exists (
        select 1 from public.medication_logs l
        where l.medication_id = m.id
          and l.local_date = v_today
          and l.slot = s.slot
      )
    group by m.account_id, s.slot
  )
  insert into public.notification_outbox
    (account_id, kind, slot, medicine_names, dedupe_key)
  select
    d.account_id, 'medicine_reminder', d.slot, d.names,
    'reminder:' || d.account_id || ':' || v_today || ':' || d.slot
  from due d
  on conflict (dedupe_key) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function private.enqueue_medicine_reminders(timestamptz) from public;
