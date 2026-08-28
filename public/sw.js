/**
 * Sakha's service worker.
 *
 * It does exactly two things: show a push, and open the right screen when the
 * push is tapped. There is no caching and no offline strategy here — the app
 * is server-rendered and the data must never be stale on a health screen, so
 * serving her yesterday's blood sugar from a cache would be worse than showing
 * her nothing. If offline support is ever wanted it belongs in its own pass.
 */

self.addEventListener("install", () => {
  // Take over straight away rather than waiting for every tab to close. A
  // notification permission granted now should work now.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // A push with no readable body still deserves to be shown as something,
    // rather than swallowed. Some platforms send a bare wake-up.
  }

  const title = data.title || "Sakha";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    // Replaces an older unopened notification of the same kind instead of
    // stacking them. Three unread reminders on a lock screen reads as nagging.
    tag: data.tag || "sakha",
    renotify: false,
    data: { url: data.url || "/" },
    // No requireInteraction: nothing here is urgent enough to sit on her
    // screen until dismissed, and this product does not manufacture alarm.
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Reuse a window she already has open rather than piling up tabs.
      for (const client of all) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(url);
              return;
            } catch {
              // Cross-origin or otherwise refused; fall through to openWindow.
            }
          }
        }
      }

      if (self.clients.openWindow) await self.clients.openWindow(url);
    })(),
  );
});
