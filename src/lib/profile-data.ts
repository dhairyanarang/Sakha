import { createClient } from "@/lib/supabase/server";
import { getActiveAccount, getViewer, type Membership } from "@/lib/account";

export type ProfileView = {
  accountId: string;
  displayName: string;
  language: string;
  /** From the signed-in Google account. Read-only — she changes it there. */
  email: string | null;
  /** Her own upload if there is one, otherwise whatever Google had. */
  avatarUrl: string | null;
  /** True when the photo is hers rather than Google's. */
  hasOwnPhoto: boolean;
  /** Everyone who can see this account, her included. */
  members: Membership[];
};

/** Google's picture for the signed-in person, when it has one. */
function googlePicture(user: { user_metadata: unknown } | null): string | null {
  const meta = user?.user_metadata as Record<string, unknown> | null;
  // Google puts it under one of these two depending on the provider payload.
  return ((meta?.avatar_url ?? meta?.picture) as string | undefined) ?? null;
}

/**
 * Her Profile — the OWNER's, and only the owner's.
 *
 * This used to fall back to `memberships[0]` when the signed-in person owned
 * nothing, which meant a family member opening /profile was handed HER
 * profile: her name in the edit field, her invitation list, her language
 * chips. Every write behind it failed at RLS, so nothing could actually be
 * changed — but the screen was still a lie, and a confusing one. A family
 * member has their own Profile now (getFamilyProfile) and this returns null
 * for them.
 */
export async function getProfile(): Promise<ProfileView | null> {
  const { user, memberships } = await getViewer();
  if (!user) return null;

  const owned = memberships.find((m) => m.role === "owner");
  if (!owned) return null;

  let avatarUrl: string | null = null;
  let hasOwnPhoto = false;

  // avatar_path rides along on the membership query, so this costs a round
  // trip only when she actually has a photo of her own to sign.
  if (owned.avatarPath) {
    const supabase = await createClient();
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(owned.avatarPath, 60 * 10);
    avatarUrl = signed?.signedUrl ?? null;
    hasOwnPhoto = Boolean(avatarUrl);
  }

  if (!avatarUrl) avatarUrl = googlePicture(user);

  return {
    accountId: owned.accountId,
    displayName: owned.displayName,
    language: owned.language,
    email: user.email ?? null,
    avatarUrl,
    hasOwnPhoto,
    members: memberships,
  };
}

export type FamilyProfile = {
  /** Their own name from Google, which is the only one we ever have for them. */
  name: string | null;
  email: string | null;
  /** Their own Google picture. Never hers. */
  avatarUrl: string | null;
  /** Whose account they can see. */
  accountName: string;
  accountId: string;
  /** How the owner described them when inviting: "Son". */
  relation: string | null;
};

/**
 * A family member's own Profile.
 *
 * Deliberately not a subset of hers. It holds who THEY are signed in as and
 * what access they have — nothing about her beyond whose account it is, which
 * they need in order to understand what they are looking at.
 */
export async function getFamilyProfile(): Promise<FamilyProfile | null> {
  const { user } = await getViewer();
  if (!user) return null;

  const account = await getActiveAccount();
  if (!account || account.role === "owner") return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("account_members")
    .select("relation, invited_name")
    .eq("account_id", account.accountId)
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    // Google's name wins over the one she typed, because it is theirs. Hers is
    // the fallback for the gap before they have ever signed in.
    name: profile?.full_name ?? membership?.invited_name ?? null,
    email: user.email ?? null,
    avatarUrl: googlePicture(user),
    accountName: account.displayName,
    accountId: account.accountId,
    relation: membership?.relation ?? null,
  };
}

/**
 * The picture in the header, for whoever is signed in.
 *
 * For her that is her own upload or her Google photo. For a family member it
 * is THEIR Google photo — the header avatar is the way to their own Profile,
 * so showing her face on it would be wrong twice over.
 */
export async function getHeaderAvatar(): Promise<string | null> {
  const { user, memberships } = await getViewer();
  if (!user) return null;

  const owned = memberships.find((m) => m.role === "owner");
  if (owned?.avatarPath) {
    const supabase = await createClient();
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(owned.avatarPath, 60 * 10);
    if (signed?.signedUrl) return signed.signedUrl;
  }

  return googlePicture(user);
}

export type PendingInvitation = {
  id: string;
  name: string;
  relation: string;
  expiresAt: string;
  /**
   * True once the 14 days have run out.
   *
   * These used to be filtered out of the query entirely, which meant a link
   * nobody opened simply disappeared from her screen after two weeks with no
   * explanation — she would have had to remember she ever sent it. The card
   * stays, says so, and Send again puts it back in date.
   */
  expired: boolean;
};

export type FamilyMember = {
  userId: string;
  /** Null until we have either name — the fallback is UI copy. */
  name: string | null;
  relation: string | null;
};

/**
 * Who is on the account, and who has been asked.
 *
 * Accepted members and still-pending invitations are separate lists because
 * they mean different things to her: one is someone who can see her data now,
 * the other is a link she sent that nobody has opened yet.
 *
 * Each is independent. There is no group here — revoking one person touches
 * exactly one row and leaves everyone else's access untouched.
 */
export async function getInvitations(accountId: string): Promise<{
  members: FamilyMember[];
  pending: PendingInvitation[];
}> {
  const supabase = await createClient();

  const [membersResult, pendingResult] = await Promise.all([
    supabase
      .from("account_members")
      .select("user_id, relation, invited_name, profiles(full_name)")
      .eq("account_id", accountId)
      .eq("role", "family"),
    supabase
      .from("family_invitations")
      .select("id, name, relation, expires_at")
      .eq("account_id", accountId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const now = Date.now();

  return {
    members: (membersResult.data ?? []).map((row) => {
      const p = row.profiles as unknown as { full_name: string | null } | null;
      return {
        userId: row.user_id,
        // The name she typed when inviting comes first: she wrote "Rahul" and
        // that is who this is to her, even if Google calls him Rahul Sharma.
        // Null only when we have neither, and then the fallback is copy — so
        // it is chosen at render time in whichever language she reads.
        name: row.invited_name ?? p?.full_name ?? null,
        relation: row.relation,
      };
    }),
    pending: (pendingResult.data ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      relation: i.relation,
      expiresAt: i.expires_at,
      expired: Date.parse(i.expires_at) <= now,
    })),
  };
}
