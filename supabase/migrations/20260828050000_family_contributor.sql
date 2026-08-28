-- Family access becomes a LIMITED CONTRIBUTOR, not a reader.
--
-- Until now the rule was binary: a member reads, an owner writes. That made a
-- son unable to do the one thing he is actually there for — taking his
-- mother's sugar reading on her behalf and putting her lab report where she
-- can find it.
--
-- The rule is now three-way:
--
--   READ    is_account_member   everything on the account, unchanged
--   CREATE  is_account_member   readings and documents, and nothing else
--   MUTATE  is_account_owner    every UPDATE and DELETE, unchanged
--
-- So a family member can add to her record and can never alter it. Not even
-- the row he added himself: correcting a reading is hers to do, and a son who
-- mistypes asks her rather than quietly rewriting her history.
--
-- Note what is NOT here. medications, medication_logs, daily_checkins,
-- walk_checkins, accounts, account_members, family_invitations and the
-- avatars bucket keep owner-only writes. Her medicines, whether she took
-- them, how she feels, her name, her photo, her language and who else can see
-- the account are all still hers alone.
--
-- WITH CHECK is evaluated against the row being INSERTED, with auth.uid()
-- taken from the JWT rather than anything the client sent. So a forged
-- account_id in the payload fails unless that user is genuinely a member of
-- that account — the membership test IS the validation of the id.

-- 1. Readings: blood sugar, blood pressure and weight all live here.
drop policy if exists health_measurements_insert on public.health_measurements;
create policy health_measurements_insert on public.health_measurements
  for insert to authenticated
  with check (private.is_account_member(account_id));

-- 2. Documents: the row. The file itself is policy 3.
drop policy if exists health_documents_insert on public.health_documents;
create policy health_documents_insert on public.health_documents
  for insert to authenticated
  with check (private.is_account_member(account_id));

-- 3. The document file in storage.
--
-- Keyed on the first path segment, which is the account id — the same shape
-- the read policy already uses. UPDATE stays owner-only on purpose: an upload
-- to a fresh uuid needs INSERT and SELECT only, and leaving UPDATE alone means
-- a family member cannot overwrite a file that is already there.
drop policy if exists documents_write on storage.objects;
create policy documents_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'health-documents'
    and private.is_account_member(((storage.foldername(name))[1])::uuid)
  );

comment on policy health_measurements_insert on public.health_measurements is
  'Owner or family may record a reading. Editing and deleting stay owner-only.';
comment on policy health_documents_insert on public.health_documents is
  'Owner or family may add a document. Deleting stays owner-only.';
