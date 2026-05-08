const CACHE_NAME = 'witness-culinary-v2.0';
const STATIC_CACHE = 'witness-static-v2.0';
const DYNAMIC_CACHE = 'witness-dynamic-v2.0';

const STATIC_ASSETS = [
  '/pt/index.html',
  '/pt/css/style.css',
  '/pt/js/app.js',
  '/pt/manifest.json',
  '/pt/images/splash-screen.png',
  '/pt/images/logo-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
          .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/pt/index.html'));
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'Witness Culinary', {
    body: data.body || 'Your order update is ready.',
    icon: '/pt/icons/icon-192.png',
    badge: '/pt/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/pt/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
