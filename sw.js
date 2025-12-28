
const CACHE_NAME = 'lmb-v3';
const OFFLINE_URL = './index.html';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore non-http requests (e.g. chrome-extension://)
  if (!event.request.url.startsWith('http')) return;
  
  // Ignore GenAI API calls
  if (event.request.url.includes('generativelanguage.googleapis.com')) return;

  // 1. Navigation Requests (HTML) -> Network First, Fallback to Offline
  // This ensures the user gets the latest version of the app structure, but falls back to cache if offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2. Asset Requests (JS, CSS, Images) -> Stale-While-Revalidate
  // Serve from cache immediately for speed, then update cache from network in background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Validation: Ensure response is valid and not an error
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // Fix for 0-byte images potentially corrupting cache
        const contentType = networkResponse.headers.get('content-type');
        const contentLength = networkResponse.headers.get('content-length');
        if (contentType && contentType.startsWith('image/') && contentLength === '0') {
           return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
          // Network failed, swallow error as we might return cachedResponse
      });

      return cachedResponse || fetchPromise;
    })
  );
});
