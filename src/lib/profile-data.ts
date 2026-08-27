import { createClient } from "@/lib/supabase/server";
import { getViewer, type Membership } from "@/lib/account";

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

/**
 * Everything the Profile screens show.
 *
 * The photo has two sources and a clear precedence: if she has uploaded one it
 * wins, and until then the picture already attached to her Google account is
 * used, so a brand new profile is not faceless. Google's URL is public and
 * needs no signing; hers lives in a private bucket and gets a short-lived link
 * like every other file in this app.
 */
export async function getProfile(): Promise<ProfileView | null> {
  const { user, memberships } = await getViewer();
  if (!user) return null;

  const owned = memberships.find((m) => m.role === "owner") ?? memberships[0];
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

  if (!avatarUrl) {
    // Google puts it under one of these two depending on the provider payload.
    const meta = user.user_metadata as Record<string, unknown> | null;
    const fromGoogle = (meta?.avatar_url ?? meta?.picture) as string | undefined;
    avatarUrl = fromGoogle ?? null;
  }

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

/** Just the picture, for the header avatar on Home and Health. */
export async function getHeaderAvatar(): Promise<string | null> {
  return (await getProfile())?.avatarUrl ?? null;
}
