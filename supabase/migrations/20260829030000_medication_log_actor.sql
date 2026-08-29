-- Who confirmed the dose?
--
-- medication_logs has carried a created_by column since the initial schema,
-- but with no default and nothing writing it — so every row was NULL. The
-- notification trigger reads that column as the actor, and the dispatcher
-- excludes the actor from the recipients. With a NULL actor there is nobody
-- to exclude, so "Asha took the morning medicine" went to Asha as well.
--
-- The two tables the provenance migration touched already default to
-- auth.uid(). This brings the third into line, so an actor is recorded by the
-- database rather than depending on every caller remembering to send one.
alter table public.medication_logs
  alter column created_by set default auth.uid();

comment on column public.medication_logs.created_by is
  'Who recorded this dose. Defaults to the caller. Null only on rows written before this default existed.';

-- Existing rows stay NULL, in keeping with how provenance was handled
-- everywhere else: they predate the column being written, and inferring an
-- author for a medical record is not the same as knowing one. They have all
-- been dispatched already, so nothing re-reads them.
