import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { DocumentsSection } from "@/components/health/documents-section";
import { getHealthOverview } from "@/lib/health-data";
import { getMedicinesBySlot } from "@/lib/family-data";
import { getHeaderAvatar } from "@/lib/profile-data";
import { getT } from "@/lib/i18n/server";
import { ViewingBanner } from "./viewing-banner";
import { FamilyMedicines } from "./family-medicines";
import { FamilyHealthOverview } from "./health-overview";

/**
 * Her health, on one page, for the person helping her keep it.
 *
 * Everything he came for is here in one scroll — what she takes, how her
 * readings are going, and the documents — with no intermediate screens to
 * discover. He is checking in, often quickly and often about one specific
 * thing; making him find a Medicines screen before he can see whether she took
 * her tablets this morning is a level of navigation that earns nothing.
 *
 * It is deliberately NOT her Health page with buttons removed. Hers is built
 * to act on: a card that leads into managing medicines, an Add tile, a Record
 * button per reading. This is built to read, with exactly two places to
 * contribute — a reading, and a document — because those are the two things a
 * son can genuinely do for his mother from his own phone.
 *
 * The order matches hers, though. Medicines, measurements, documents is the
 * right order for looking something up whoever is looking, and a family member
 * should not have to learn a second arrangement of the same three things.
 */
export async function FamilyHealth({
  accountId,
  ownerName,
}: {
  accountId: string;
  ownerName: string;
}) {
  const { t } = await getT();
  const [{ latest, documents }, medicines, avatarUrl] = await Promise.all([
    getHealthOverview(accountId),
    getMedicinesBySlot(accountId),
    getHeaderAvatar(),
  ]);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <AppHeader avatarUrl={avatarUrl}>
        <p className="text-text-primary truncate text-[20px] leading-[1.2] font-medium">
          {t.family.theirHealth(ownerName)}
        </p>
        <p className="mt-0.5 text-[14px] leading-[1.2] text-[#636366]">
          {t.family.healthSubtitleContribute}
        </p>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-6 p-4">
        <ViewingBanner name={ownerName} />

        <FamilyMedicines groups={medicines} />

        {/* The same three rows she has, leading to the same three history
            screens — where he can also add a reading. `medicines` is null
            because the section above already covers them in full. */}
        <FamilyHealthOverview
          latest={latest}
          medicines={null}
          heading={t.health.measurements}
          note={t.family.youCanRecord}
        />

        {/* Her documents, and a way to put one there. Same component she uses,
            with delete withheld — he adds, he never removes. */}
        <DocumentsSection
          documents={documents}
          accountId={accountId}
          canAdd
          addLabel={t.documents.uploadDocument}
          emptyMessage={t.family.noDocumentsYet}
        />
      </main>

      <BottomNav active="health" variant="family" className="shrink-0" />
    </div>
  );
}
