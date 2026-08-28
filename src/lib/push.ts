"use client";

/**
 * Turning notifications on, from the one place that is allowed to ask.
 *
 * Permission is only ever requested from a real tap — never on load. A prompt
 * she did not ask for is one she will refuse, and a refusal on this platform
 * is close to permanent.
 */

/** Why we cannot offer notifications, when we cannot. */
export type PushSupport =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "needs-install" };

/**
 * iOS grants Web Push ONLY to a web app added to the Home Screen, and only on
 * 16.4 and later. In Safari itself the APIs may be present and subscribing
 * still fails, so the install check comes first — asking her to allow
 * notifications that cannot arrive is worse than not offering.
 */
export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return { ok: false, reason: "unsupported" };
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac; the touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Safari's own flag, still the only reliable one on iOS.
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
    if (!installed) return { ok: false, reason: "needs-install" };
  }

  return { ok: true };
}

/** The public half of the VAPID pair. Public by design — it identifies us. */
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  // Backed by a plain ArrayBuffer, which is what applicationServerKey wants.
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "needs-install" }
  | { status: "failed" };

/**
 * Register, ask, subscribe, store.
 *
 * Safe to call again: the browser returns the existing PushSubscription when
 * there is one, and the server upserts on the endpoint, so a second tap on a
 * device that is already set up changes nothing but the timestamp.
 */
export async function enablePush(
  language: string,
  save: (sub: {
    endpoint: string;
    p256dh: string;
    auth: string;
    language: string;
  }) => Promise<string | null>,
): Promise<SubscribeResult> {
  const support = pushSupport();
  if (!support.ok) return { status: support.reason === "needs-install" ? "needs-install" : "unsupported" };
  if (!VAPID_PUBLIC) return { status: "unsupported" };

  let permission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch {
      return { status: "failed" };
    }
  }
  if (permission !== "granted") return { status: "denied" };

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;

    // An existing subscription is reused rather than replaced, so one device
    // keeps one endpoint however many times she taps.
    const existing = await registration.pushManager.getSubscription();
    const sub =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      }));

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return { status: "failed" };

    const error = await save({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      language,
    });
    return error ? { status: "failed" } : { status: "subscribed" };
  } catch {
    return { status: "failed" };
  }
}
