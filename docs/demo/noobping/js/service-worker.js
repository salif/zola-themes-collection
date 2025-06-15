const CACHE_NAME = 'site-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        fetch('/sitemap.xml')
            .then(res => res.text())
            .then(str => new DOMParser().parseFromString(str, 'application/xml'))
            .then(xml => {
                const urls = Array.from(xml.querySelectorAll('loc'))
                    .map(el => {
                        const url = el.textContent.trim();
                        const u = new URL(url, self.location.origin);
                        return u.pathname + u.search;
                    });
                return caches.open(CACHE_NAME).then(cache => cache.addAll(urls));
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('SW install failed:', err);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
