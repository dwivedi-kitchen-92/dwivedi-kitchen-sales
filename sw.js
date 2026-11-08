// Dwivedi Kitchens - Service Worker for PWA
const CACHE_NAME = 'dwivedi-kitchen-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './static/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-only for all external APIs (Google Sheets, Drive, Identity, Gemini AI)
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-first with cache fallback for app shell assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
