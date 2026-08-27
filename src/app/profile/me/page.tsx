import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile-data";
import { ScreenHeader } from "@/components/screen-header";
import { MyProfile } from "@/components/profile/my-profile";

/**
 * My Profile.
 *
 * The screen lives in MyProfile, which needs client state for the photo
 * picker and the name sheet; this stays a server component that only fetches.
 */
export default async function MyProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/welcome");

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/profile" title="My Profile" />
      <MyProfile profile={profile} />
    </div>
  );
}
