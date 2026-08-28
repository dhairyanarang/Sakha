"use client";

import { createClient } from "@/lib/supabase/client";
import type { Messages } from "@/lib/i18n";

/**
 * Puts a file in Storage straight from the browser.
 *
 * Deliberately NOT through a Server Action. Action requests are capped at 1MB,
 * so any ordinary phone photo threw before our own size check ever ran — which
 * is what produced the bare "a server error occurred" with a digest, in both
 * the document and profile-photo flows.
 *
 * Nothing is loosened by moving it: the browser client carries her session, so
 * storage RLS still decides, and those policies allow writes only to the
 * account's OWNER, keyed on the first segment of the path. A family member
 * uploading here is refused by the database exactly as before.
 */
export async function uploadToStorage({
  bucket,
  path,
  file,
  upsert = false,
  t,
}: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
  /** Passed in rather than hooked: this is a plain function, not a component. */
  t: Messages;
}): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert,
  });
  if (!error) return null;

  // RLS refusals come back as a storage error, not an HTTP status we can read.
  if (/row-level security|not authorized|Unauthorized/i.test(error.message)) {
    return t.errors.notAllowed;
  }
  if (/exceeded|too large|Payload/i.test(error.message)) {
    return t.errors.fileTooLarge;
  }
  return t.errors.uploadFailed;
}

/** Extension from the file's own name, defaulting sensibly. */
export function extensionFor(file: File, fallback: string): string {
  const name = file.name ?? "";
  const ext = name.includes(".") ? name.split(".").pop() : null;
  return (ext ?? fallback).toLowerCase().replace(/[^a-z0-9]/g, "") || fallback;
}
