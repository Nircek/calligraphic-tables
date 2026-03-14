const CACHE_NAME = 'calligraphic-tables-v1';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => {
      return new Response('Offline: resource not available', { status: 503, statusText: 'Service Unavailable' });
    }))
  );
});
