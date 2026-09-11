// Service worker for fraværsappen.
// Strategi: app-skallet caches, alle kall til Supabase går alltid på nett.
const CACHE = 'fravaer-v2';
const SKALL = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png', './supabase.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SKALL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((n) => Promise.all(n.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Aldri cache data eller innlogging
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('jsdelivr.net')) return;
  if (url.origin !== self.location.origin) return;

  // Navigasjon: nett først, fall tilbake til cachet skall når man er offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
