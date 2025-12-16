const CACHE_NAME = 'lmb-v1';
// Use relative paths for assets to avoid origin mismatch issues
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Stale-while-revalidate strategy:
      // Return cached response immediately if available, but fetch update in background
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache valid responses. 
        // We include 'cors' type to allow caching of CDN assets (esm.sh, tailwindcss, fonts)
        if (networkResponse && networkResponse.status === 200 && 
           (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and no cache, we just fail for now (or could return fallback)
      });

      return cachedResponse || fetchPromise;
    })
  );
});