self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('audio-cache').then((cache) => {
            return cache.addAll(['/OogoeAlarm/', '/OogoeAlarm/index.html']);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
