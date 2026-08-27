-- Family access is view-only. Split every data policy so that reading is for
-- anyone on the account and writing is the owner's alone.
--
-- Until now these tables carried a single FOR ALL policy gated on
-- is_account_member, which covers SELECT and every write with the same
-- predicate. The moment a family member existed they could have edited or
-- deleted her medicines, readings and documents. This has to land BEFORE
-- anyone can be invited, not alongside it.
--
-- Owner-writes is enforced here, in the database. The UI hides the controls as
-- well, but that is a courtesy: this is the part that holds if someone talks
-- to the API directly.

-- Her health data: members read, owner writes.
do $$
declare t text;
begin
  foreach t in array array[
    'daily_checkins', 'health_documents', 'health_measurements',
    'medication_logs', 'medications', 'walk_checkins'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_all', t);

    execute format($f$
      create policy %I on public.%I for select to authenticated
      using (private.is_account_member(account_id))
    $f$, t || '_select', t);

    execute format($f$
      create policy %I on public.%I for insert to authenticated
      with check (private.is_account_owner(account_id))
    $f$, t || '_insert', t);

    execute format($f$
      create policy %I on public.%I for update to authenticated
      using (private.is_account_owner(account_id))
      with check (private.is_account_owner(account_id))
    $f$, t || '_update', t);

    execute format($f$
      create policy %I on public.%I for delete to authenticated
      using (private.is_account_owner(account_id))
    $f$, t || '_delete', t);
  end loop;
end $$;

-- Push subscriptions are the exception: the row belongs to a DEVICE, not to
-- the account holder. A family member must be able to register and remove
-- their own, so writes are scoped to the signed-in user rather than the owner.
drop policy if exists push_subscriptions_all on public.push_subscriptions;

create policy push_subscriptions_select on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

create policy push_subscriptions_insert on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid() and private.is_account_member(account_id));

create policy push_subscriptions_update on public.push_subscriptions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy push_subscriptions_delete on public.push_subscriptions
  for delete to authenticated
  using (user_id = auth.uid());

-- Stored documents follow the same rule. Reading is for anyone on the account;
-- uploading, replacing and deleting a file is the owner's alone. The avatars
-- bucket was already written this way.
drop policy if exists documents_write on storage.objects;
create policy documents_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'health-documents'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists documents_update on storage.objects;
create policy documents_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'health-documents'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'health-documents'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists documents_delete on storage.objects;
create policy documents_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'health-documents'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );
