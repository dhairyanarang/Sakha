-- Who recorded this?
--
-- Since family access became a contributor model, a reading on her account may
-- have been taken by her or written down by her son, and until now the row
-- said nothing about which. That is a small gap with a real consequence: a
-- number she does not remember entering is unsettling, and "your son added
-- this" is the difference between a mystery and a kindness.
--
-- Deliberately one nullable column on two tables, and nothing else. No
-- activity log, no audit trail, no second table to keep in step.

alter table public.health_measurements
  add column if not exists created_by uuid
    -- SET NULL, never CASCADE: if a family member's login is ever deleted, her
    -- readings must survive it. The reading is hers; only the attribution was
    -- ever his.
    references auth.users (id) on delete set null
    default auth.uid();

alter table public.health_documents
  add column if not exists created_by uuid
    references auth.users (id) on delete set null
    default auth.uid();

comment on column public.health_measurements.created_by is
  'Who recorded this reading. Null on rows that predate the column — honestly unknown rather than guessed at.';
comment on column public.health_documents.created_by is
  'Who uploaded this document. Null on rows that predate the column.';

-- Existing rows are left NULL on purpose.
--
-- Every one of them was created before family members could write anything, so
-- the owner is the only possible author — but "almost certainly her" is not
-- the same as knowing, and backfilling would turn an inference into a stated
-- fact on her medical history. Unknown is the truthful value.

-- The column cannot be forged.
--
-- WITH CHECK now pins created_by to auth.uid(), so a client that sends
-- somebody else's id is rejected, and one that sends an explicit null is too
-- (an explicit null suppresses the default). Omitting the field — which is
-- what every code path in the app does — lets the default stamp the real
-- caller. So new rows are always attributed, and always attributed correctly.
drop policy if exists health_measurements_insert on public.health_measurements;
create policy health_measurements_insert on public.health_measurements
  for insert to authenticated
  with check (
    private.is_account_member(account_id)
    and created_by = auth.uid()
  );

drop policy if exists health_documents_insert on public.health_documents;
create policy health_documents_insert on public.health_documents
  for insert to authenticated
  with check (
    private.is_account_member(account_id)
    and created_by = auth.uid()
  );

-- UPDATE stays owner-only and is untouched, which means created_by cannot be
-- rewritten after the fact by anyone except the account owner, and a family
-- member cannot relabel his own contribution as hers.
