-- Registering a device, when the device has been used by someone else.
--
-- A push endpoint identifies a BROWSER, not a person. It survives signing out.
-- So on a shared phone — or a test device, or a family member borrowing a
-- tablet — the second person to enable notifications collides with the first
-- person's row, and the plain upsert fails: the UPDATE policy quite correctly
-- refuses to let anyone touch a row that is not theirs.
--
-- The old row is genuinely obsolete at that point. The browser delivers to
-- whoever is subscribed now, and the previous user is no longer here. So this
-- takes ownership of the endpoint rather than duplicating or failing.
--
-- Security definer, but it can only ever write auth.uid() into user_id, and
-- only for an account the caller is a member of. The endpoint is not a
-- capability: the caller got it from their own browser's PushManager, and
-- claiming one they do not hold would only redirect notifications to a device
-- they cannot read.
create or replace function public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_language text,
  p_account_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- The account is re-checked here even though the caller is a server action
  -- that already resolved it from the session. Two gates, because the cost of
  -- being wrong is somebody else's health notifications on this phone.
  if not private.is_account_member(p_account_id) then
    raise exception 'not a member of this account';
  end if;

  insert into public.push_subscriptions
    (user_id, account_id, endpoint, p256dh, auth, language, updated_at)
  values
    (auth.uid(), p_account_id, p_endpoint, p_p256dh, p_auth,
     case when p_language in ('en','hi') then p_language else 'en' end, now())
  on conflict (endpoint) do update set
    user_id = auth.uid(),
    account_id = excluded.account_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    language = excluded.language,
    updated_at = now();
end;
$$;

revoke all on function public.register_push_subscription(text, text, text, text, uuid) from public, anon;
grant execute on function public.register_push_subscription(text, text, text, text, uuid) to authenticated;
