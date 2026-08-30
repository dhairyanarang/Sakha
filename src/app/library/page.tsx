import { requireOwner } from "@/lib/account";
import { getLibrary } from "@/lib/library-data";
import { getHeaderAvatar } from "@/lib/profile-data";
import { BottomNav, EmptyState } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { LibraryShelf } from "@/components/library/library-shelf";
import { getMessages } from "@/lib/i18n/server";

/**
 * Library — a short, hand-picked shelf of things she can watch or read.
 *
 * Not health documents: those are hers and live under Health. This is the same
 * shelf for everyone, curated by us.
 *
 * Subject first, then the thing itself: she picks a shelf, sees what is on
 * it, and taps through to watch it inside Sakha. Three steps, no search, and
 * nothing anywhere that guesses at what she wants.
 */
export default async function LibraryPage() {
  // Owner only. The shelf is curated for the person living the day it is meant
  // to improve, not for someone checking in on her — and there is no Library
  // tab in a family member's nav, so this only catches a stale link or a typed
  // URL. requireOwner sends them home rather than showing an error.
  await requireOwner();

  const [items, avatarUrl] = await Promise.all([getLibrary(), getHeaderAvatar()]);
  const t = await getMessages();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <AppHeader avatarUrl={avatarUrl}>
        <p className="text-text-primary text-[20px] leading-[1.2] font-medium">
          {t.library.title}
        </p>
        <p className="text-text-primary mt-0.5 text-[14px] leading-[1.2]">
          {t.library.subtitle}
        </p>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-6 p-4">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center">
            <EmptyState message={t.library.comingSoon} />
          </div>
        ) : (
          <LibraryShelf items={items} />
        )}
      </main>

      <BottomNav active="library" className="shrink-0" />
    </div>
  );
}
