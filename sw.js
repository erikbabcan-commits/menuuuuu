
const CACHE_NAME = 'lmb-v2';
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
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Oprava: Validujeme odpoveď predtým než ju kešujeme.
        // Zabránime ukladaniu poškodených alebo 0-byte súborov, ktoré vyvolávajú chybu PNG.
        if (networkResponse && networkResponse.status === 200) {
          const contentType = networkResponse.headers.get('content-type');
          const contentLength = networkResponse.headers.get('content-length');
          
          // Ak je to obrázok, skontrolujeme či nie je prázdny
          if (contentType && contentType.startsWith('image/') && contentLength === '0') {
            return networkResponse;
          }

          if (networkResponse.type === 'basic' || networkResponse.type === 'cors') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      }).catch(() => {
        // Fallback pre offline režim
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
