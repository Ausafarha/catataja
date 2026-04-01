const CACHE_NAME = 'catataja-v1.0.1'; // <-- UPDATE VERSI INI SETIAP KALI KAMU GIT PUSH
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/customers.html',
    '/debts.html',
    '/payments.html',
    '/css/dashboard.css',
    '/css/customers.css',
    '/css/debts.css',
    '/css/payments.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.ico'
];

// 1. Install Service Worker & Cache Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching shell assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Memaksa SW baru langsung aktif
});

// 2. Aktivasi & Hapus Cache Lama (Agar perubahan code langsung terasa)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Strategi Fetch (Network First untuk data API, Cache First untuk Static)
self.addEventListener('fetch', (event) => {
    // Jangan cache permintaan API agar data transaksi selalu fresh
    if (event.request.url.includes('/api/') || event.request.url.includes('/customers/api')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});