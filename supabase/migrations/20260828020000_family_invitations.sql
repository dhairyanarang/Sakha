-- Family invitations: the one way someone else gets to see this account.
--
-- Only a HASH of the token is stored. The link she shares carries the raw
-- token, and it is never written down anywhere on our side — so a leaked
-- database yields no working invitation links.
create table if not exists public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  relation text not null,
  token_hash text not null unique,
  status text not null default 'pending',
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  constraint family_invitations_status_check
    check (status in ('pending', 'accepted', 'cancelled'))
);

create index if not exists family_invitations_account_idx
  on public.family_invitations (account_id, created_at desc);

alter table public.family_invitations enable row level security;

-- She sees her own invitations; only she creates, cancels or edits them.
drop policy if exists family_invitations_select on public.family_invitations;
create policy family_invitations_select on public.family_invitations
  for select to authenticated using (private.is_account_member(account_id));

drop policy if exists family_invitations_insert on public.family_invitations;
create policy family_invitations_insert on public.family_invitations
  for insert to authenticated with check (private.is_account_owner(account_id));

drop policy if exists family_invitations_update on public.family_invitations;
create policy family_invitations_update on public.family_invitations
  for update to authenticated
  using (private.is_account_owner(account_id))
  with check (private.is_account_owner(account_id));

drop policy if exists family_invitations_delete on public.family_invitations;
create policy family_invitations_delete on public.family_invitations
  for delete to authenticated using (private.is_account_owner(account_id));

/**
 * What the person opening a link is shown, before they decide.
 *
 * Deliberately in public, unlike the is_account_member helpers: this one HAS
 * to be reachable over RPC, because whoever opens the link is not a member of
 * anything yet and RLS would show them nothing. It is safe to expose — it
 * answers only to a token hash, and the hash cannot be produced without the
 * token from the link itself. It returns the inviter's name and nothing else
 * about the account.
 */
create or replace function public.invitation_preview(p_token_hash text)
returns table (inviter_name text, relation text, invitee_name text, state text)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.display_name,
    i.relation,
    i.name,
    case
      when i.status = 'accepted' then 'accepted'
      when i.status = 'cancelled' then 'cancelled'
      when i.expires_at < now() then 'expired'
      else 'pending'
    end
  from public.family_invitations i
  join public.accounts a on a.id = i.account_id
  where i.token_hash = p_token_hash;
$$;

/**
 * Claims an invitation, once.
 *
 * The row is locked and re-checked inside the transaction, so two people
 * opening the same forwarded link cannot both become members — the second
 * finds it already accepted. Membership is always created as 'family', never
 * anything else, so a crafted call cannot grant ownership.
 */
create or replace function public.accept_invitation(p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.family_invitations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_invitation
  from public.family_invitations
  where token_hash = p_token_hash
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    return null;
  end if;

  -- Already on the account (she opened her own link, or he accepted twice):
  -- burn the invitation and send them in, without a second membership.
  if not exists (
    select 1 from public.account_members
    where account_id = v_invitation.account_id and user_id = auth.uid()
  ) then
    insert into public.account_members (account_id, user_id, role, relation)
    values (v_invitation.account_id, auth.uid(), 'family', v_invitation.relation);
  end if;

  update public.family_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = v_invitation.id;

  return v_invitation.account_id;
end;
$$;
