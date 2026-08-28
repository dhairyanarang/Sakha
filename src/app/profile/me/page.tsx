import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/account";
import { getProfile } from "@/lib/profile-data";
import { ScreenHeader } from "@/components/screen-header";
import { MyProfile } from "@/components/profile/my-profile";
import { getMessages } from "@/lib/i18n/server";

/**
 * My Profile.
 *
 * The screen lives in MyProfile, which needs client state for the photo
 * picker and the name sheet; this stays a server component that only fetches.
 */
export default async function MyProfilePage() {
  // Owner only. This screen edits the account's own name and photo, which a
  // family member has no business changing — getProfile returns null for them
  // and requireOwner has already sent them home before we get here.
  await requireOwner();

  const profile = await getProfile();
  if (!profile) redirect("/welcome");
  const t = await getMessages();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/profile" title={t.profile.myProfile} />
      <MyProfile profile={profile} />
    </div>
  );
}
