-- Profile: her photo, and the end of trusted contacts.
--
-- Trusted contacts were a separate idea from family sharing and never had a
-- consumer: Get Help is out of P0, nothing read the table, and the product now
-- has exactly one sharing concept — a family member invited to VIEW the
-- account. Keeping a second, unused notion of "someone close to her" would
-- only confuse whoever builds invitations next.
drop table if exists public.trusted_contacts;

-- Her photo. Null means use whatever Google gave us at sign-in; a value here
-- means she chose her own and it wins.
alter table public.accounts add column if not exists avatar_path text;

-- Avatars sit beside documents: private, and keyed on the account id in the
-- first path segment so the same membership check applies.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Reading is for anyone on the account; writing is the owner's alone. Family
-- access is view-only, and this is the first policy to say so.
drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and private.is_account_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists avatars_write on storage.objects;
create policy avatars_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'avatars'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and private.is_account_owner(((storage.foldername(name))[1])::uuid)
  );
