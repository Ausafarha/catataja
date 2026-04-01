const CACHE_NAME = 'catataja-v1.0.5'; 
const ASSETS_TO_CACHE = [
    '/',
    '/dashboard',
    '/customers',
    '/debts',
    '/payments',
    '/css/dashboard.css',
    '/css/customers.css',
    '/css/debts.css',
    '/css/payments.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
    // Abaikan permintaan selain GET (seperti POST login/tambah data)
    if (event.request.method !== 'GET') return;

    // Abaikan permintaan API agar tidak bentrok dengan database
    if (event.request.url.includes('/api/') || event.request.url.includes('/customers/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Opsional: berikan halaman offline jika gagal
            });
        })
    );
});