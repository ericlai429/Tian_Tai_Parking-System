// Service Worker for Tian-Tai Management System PWA
const CACHE_NAME = 'tian-tai-pwa-v1.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for real-time schedule and parking verification
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache Google Sheets live queries
  if (url.hostname.includes('google.com') || url.pathname.includes('gviz')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
