-- Family access, V1.
--
-- The write-side rules already landed in 20260828010000: every health table
-- reads on is_account_member and writes on is_account_owner, and both storage
-- buckets do the same. Nothing here loosens any of that. This migration
-- finishes three smaller things that the family EXPERIENCE needs.

-- 1. The invitation ledger is the owner's alone.
--
-- It was readable by anyone on the account, which meant a family member could
-- list who else had been invited and read their token hashes. The hashes are
-- SHA-256 of 32 random bytes and are not reversible, so this was never an
-- access path — but the guest list is hers, and only the Profile screen she
-- owns ever renders it.
drop policy if exists family_invitations_select on public.family_invitations;
create policy family_invitations_select on public.family_invitations
  for select to authenticated using (private.is_account_owner(account_id));

-- 2. The name she typed, kept on the membership.
--
-- She invites "Rahul". Until Rahul signs in with Google we have no profile row
-- for him, so the Family card had nothing to show but a generic fallback. The
-- name she chose is the better answer and it is already sitting on the
-- invitation — this carries it across at the moment of acceptance.
alter table public.account_members
  add column if not exists invited_name text;

comment on column public.account_members.invited_name is
  'What the owner called this person when inviting them. Falls back to their Google profile name only if absent.';

-- 3. invitation_preview also answers "is this person already on the account?"
--
-- Return type changes, so it has to be dropped rather than replaced. Still
-- answering only to a token hash, still returning nothing about the account
-- beyond the inviter's name — the account id it now returns is not a secret
-- (RLS gates every row behind it) and is used only to recognise someone who
-- already has access, so they get "you already have access" rather than a
-- dead "already used" wall.
drop function if exists public.invitation_preview(text);

create function public.invitation_preview(p_token_hash text)
returns table (
  account_id uuid,
  inviter_name text,
  relation text,
  invitee_name text,
  state text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.account_id,
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

-- Whoever opens the link is a member of nothing yet, so this has to be
-- reachable before sign-in. That is the whole reason it is security definer.
revoke all on function public.invitation_preview(text) from public;
grant execute on function public.invitation_preview(text) to anon, authenticated, service_role;

-- 4. accept_invitation carries the name across.
--
-- Otherwise unchanged, and deliberately so: the row is still locked with FOR
-- UPDATE and re-checked inside the transaction, membership is still hardcoded
-- to 'family', and an existing member still gets no second row. Two people
-- opening the same forwarded link cannot both become members.
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
    insert into public.account_members (account_id, user_id, role, relation, invited_name)
    values (
      v_invitation.account_id, auth.uid(), 'family',
      v_invitation.relation, v_invitation.name
    );
  end if;

  update public.family_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = v_invitation.id;

  return v_invitation.account_id;
end;
$$;

revoke all on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to anon, authenticated, service_role;

-- A NOTE ON WHAT IS DELIBERATELY ABSENT.
--
-- There is no UPDATE policy on account_members, and none is added here. RLS
-- denies by default, so with no policy at all NOBODY can update that table
-- through PostgREST — which is precisely the guarantee we want: a family
-- member cannot promote their own row to 'owner', and neither can anyone else.
-- Adding a policy to express that would only weaken it. Membership is created
-- by accept_invitation (hardcoded 'family') or create_account (hardcoded
-- 'owner'), and otherwise only inserted by an existing owner.
