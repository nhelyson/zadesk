/**
 * Zadesk Progressive Web App — High Performance & Secure Service Worker
 * Version: 1.0.0
 */

const CACHE_NAME = "zadesk-app-v1.0.1";
const OFFLINE_URL = "/offline";

// Static App Shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/manifest.json",
  "/zadesk-icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32x32.png",
  "/icons/favicon-16x16.png",
];

// Install Event: Precache core shell assets resiliently
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual caching so if one asset fails, others still succeed
      await Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Warning caching asset ${asset}:`, err);
          })
        )
      );
    })
  );
});

// Activate Event: Clean up old cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting legacy cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event: Allow client UI to trigger immediate update
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch Event: Intelligent routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only process same-origin requests (or specific allowed CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. NEVER cache API requests, auth pages or dynamic workspace app routes - Network Only
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/app") ||
    url.pathname === "/login" ||
    url.pathname === "/register" ||
    url.pathname === "/forgot-password" ||
    url.pathname.startsWith("/invite")
  ) {
    return; // Standard network fetch
  }

  // 3. Only intercept GET requests
  if (request.method !== "GET") {
    return;
  }

  // 4. HTML Navigation requests: Network-First with graceful Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful page navigations for offline review
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, check cache for the requested URL
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to dedicated Offline UI page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response("Application hors-ligne. Veuillez vérifier votre connexion.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 5. Static Assets (Next.js static chunks, public icons, images, fonts): Cache-First with Network Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached asset immediately, but revalidate in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              // Ignore background fetch error when offline
            });
          return cachedResponse;
        }

        // If not in cache, fetch from network and store
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response("", { status: 404, statusText: "Asset Not Found" });
          });
      })
    );
    return;
  }

  // 6. Default: Network with Cache Fallback (Never return undefined to respondWith)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response("", { status: 408, statusText: "Network Request Failed" });
      })
  );
});

