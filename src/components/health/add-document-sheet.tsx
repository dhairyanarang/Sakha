"use client";

import { useRef, useState, useTransition } from "react";
import { Calendar, FileCheck2, Upload } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { Button, Chip, TextInput } from "@/components/ui";
import { addDocument } from "@/app/health/actions";
import { extensionFor, uploadToStorage } from "@/lib/upload";
import { localDate } from "@/lib/today";
import { useT } from "@/lib/i18n/client";

/**
 * Add Document.
 *
 * DESIGNED IN CODE. Figma has the Documents section on the Health screen but
 * no frame for adding one, and the user asked for this to be built from the
 * existing system rather than waiting on a design. Everything here is an
 * existing part — the Add Medicine sheet's shape, Text Input, Chip, Button —
 * so nothing new was invented visually.
 *
 * The file chooser is the one genuinely new element, and it is deliberately a
 * large tap target with a plain label rather than a bare file input: the
 * native control is small, differently worded on every platform, and reads as
 * nothing in particular. Once a file is picked its name is shown back, because
 * on a phone the picker closes and there is otherwise no evidence it worked.
 *
 * Accepts photos and PDFs. Note the known open issue: file upload inside an
 * installed iOS PWA has never been tested on a real device.
 */
/** Stored English; only the chip label is translated. */
const TYPES = ["Prescription", "Lab Report", "Scan", "Bill", "Other"];

export function AddDocumentSheet({
  open,
  onClose,
  onSaved,
  accountId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  /** Storage paths are keyed on this; the server re-checks it. */
  accountId: string;
}) {
  const t = useT();
  const TYPE_LABEL: Record<string, string> = {
    Prescription: t.documents.types.prescription,
    "Lab Report": t.documents.types.labReport,
    Scan: t.documents.types.scan,
    Bill: t.documents.types.bill,
    Other: t.documents.types.other,
  };
  const fileRef = useRef<HTMLInputElement>(null);
  // Held in state rather than read back off the input, so the chosen file
  // survives anything that resets the element.
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate());
  const [docType, setDocType] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const file = pickedFile;
    if (!file) {
      setError(t.errors.chooseFile);
      return;
    }
    if (!title.trim()) {
      setError(t.errors.nameDocument);
      return;
    }
    const isAllowed = file.type.startsWith("image/") || file.type === "application/pdf";
    if (file.type && !isAllowed) {
      setError(t.errors.choosePhotoOrPdf);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError(t.errors.documentTooLarge);
      return;
    }

    // Uploaded straight to Storage; only the path goes to the server.
    const path = `${accountId}/${crypto.randomUUID()}.${extensionFor(file, "jpg")}`;

    startTransition(async () => {
      const uploadError = await uploadToStorage({
        bucket: "health-documents",
        path,
        file,
        t,
      });
      if (uploadError) {
        setError(uploadError);
        return;
      }
      const err = await addDocument({
        storagePath: path,
        title,
        docDate: date,
        docType,
        notes,
      });
      if (err) setError(err);
      else {
        onSaved(t.documents.added);
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.documents.addDocument}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <FieldLabel>{t.documents.fileFieldLabel}</FieldLabel>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              setPickedFile(picked);
              setFileName(picked?.name ?? null);
              // Offer the file's own name as a starting title rather than
              // making her type one from scratch. She can still change it.
              if (picked && !title) {
                setTitle(picked.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-surface-default border-action-primary text-action-primary active:bg-surface-tinted flex min-h-[60px] w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-[16px] leading-[1.4] font-medium transition-colors"
          >
            {fileName ? (
              <>
                <FileCheck2 size={22} className="shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{fileName}</span>
              </>
            ) : (
              <>
                <Upload size={22} className="shrink-0" aria-hidden />
                {t.documents.chooseFile}
              </>
            )}
          </button>
        </div>

        <TextInput
          label={t.documents.nameLabel}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.documents.namePlaceholder}
          autoComplete="off"
        />

        <div className="flex w-full flex-col gap-2">
          <FieldLabel>{t.documents.dateLabel}</FieldLabel>
          <div className="bg-surface-default border-border-default focus-within:border-action-primary relative flex h-[54px] items-center gap-3 rounded-md border px-4 transition-colors">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              /* Same treatment as the measurement sheet: the browser's own
                 picker button is stretched invisibly over the row so there is
                 one calendar icon and a full-width tap target. */
              className="text-text-primary min-w-0 flex-1 text-[16px] leading-[1.2] font-medium outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            <Calendar size={22} className="text-text-tertiary shrink-0" aria-hidden />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Optional, like the medicine condition tag — never blocks saving. */}
          <FieldLabel>{t.documents.kindLabel}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <Chip
                key={type}
                selected={docType === type}
                onClick={() => setDocType(docType === type ? "" : type)}
              >
                {TYPE_LABEL[type] ?? type}
              </Chip>
            ))}
          </div>
        </div>

        <TextInput
          label={t.documents.notesLabel}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.documents.notesPlaceholder}
        />

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <Button variant="tertiary" onClick={onClose} disabled={pending} className="flex-1">
          {t.common.cancel}
        </Button>
        <Button onClick={save} disabled={pending} className="flex-1">
          {pending ? t.common.adding : t.common.save}
        </Button>
      </div>
    </Sheet>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  /* rgba(0,0,0,0.6) over surface/default, resolved to a solid value. */
  return (
    <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">{children}</span>
  );
}
