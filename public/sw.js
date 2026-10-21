const CACHE_NAME = "palabra-static-v2";
const STATIC_ASSETS = ["/manifest.webmanifest", "/icon.png"];

const CACHEABLE_DESTINATIONS = new Set([
  "style",
  "script",
  "image",
  "font",
  "manifest",
  "worker"
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Never cache HTML pages so content updates are always visible.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(fetch(request));
    return;
  }

  // Skip non-static requests such as API calls.
  if (!CACHEABLE_DESTINATIONS.has(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (!response || !response.ok) {
            return response;
          }
          const clone = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)));
          return response;
        })
        .catch(() => cached);
    })
  );
});
