// Al-Baik Zayka — Service Worker
// Handles push notification display and basic offline caching

const CACHE_NAME = "abz-v1";
const STATIC_ASSETS = ["/", "/logo.svg", "/manifest.webmanifest"];

// Install — cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Push notification received
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "Al-Baik Zayka",
      body: event.data.text(),
    };
  }

  const { title = "Al-Baik Zayka", body, icon = "/logo.svg", badge = "/logo.svg", tag, orderId } = payload;

  const options = {
    body,
    icon,
    badge,
    tag: tag || `abz-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
    data: { orderId, url: orderId ? `/dashboard` : "/" },
    actions: [
      { action: "view", title: "View Order" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click — focus or open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if available
        for (const client of clients) {
          if ("focus" in client) {
            client.focus();
            if (url) client.navigate(url);
            return;
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Only cache GET requests for same-origin
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/");
        });
      }),
  );
});
