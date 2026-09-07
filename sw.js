const CACHE_NAME = 'shirakawago-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './img/chubu_centrair_airport.jpg',
  './img/nagoya_gate_tower.jpg',
  './img/gujo_sample_kobo.jpg',
  './img/takayama_old_town.jpg',
  './img/shirakawago_village.jpg',
  './img/shirakawago_viewpoint.jpg',
  './img/hida_beef_yakiniku.jpg',
  './img/miyagawa_morning_market.jpg',
  './img/takayama_jinya_snow.jpg',
  './img/gero_onsen.jpg',
  './img/gero_onsen_town.jpg',
  './img/nagoya_oasis21_night.jpg',
  './img/nagoya_hitsumabushi.jpg',
  './img/scmaglev_museum.jpg',
  './img/tokoname_manekineko.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for HTML, Cache-first for images/assets
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (url.pathname.includes('/img/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        });
      })
    );
  }
});
