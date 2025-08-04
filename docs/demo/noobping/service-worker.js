let isInstalled = false;
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime-imgs';
const MANIFEST = '/sitemap.xml';

self.addEventListener('install', (evt) => {
    self.skipWaiting();
    evt.waitUntil((async () => {
        const cache = await caches.open(PRECACHE);
        const empty_precache = await cache.keys().then(keys => keys.length === 0);
        const config = await caches.open('config-cache');
        const empty_config = await config.keys().then(keys => keys.length === 0);
        if (empty_precache || empty_config) await doPrecache();
    })());
});

self.addEventListener('message', (evt) => {
    if (evt.data) {
        console.log('Service worker received message:', evt.data);
        if (evt.data.type === 'PWA_INSTALLED') {
            isInstalled = true;
            doPrecache().catch(console.error);
        }
        else if (evt.data && evt.data.type === 'REFRESH_PAGE') {
            isInstalled = false;
            console.log('Refreshing PWA...');
            self.clients.matchAll({ includeUncontrolled: true }).then(clients => clients.forEach(c => c.navigate(c.url)).catch(console.error));
            doPrecache().catch(console.error);
        }
    }
});

async function doPrecache() {
    const cache = await caches.open(PRECACHE);
    const xml = await fetch(MANIFEST).then(r => r.text());
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => (new URL(m[1])).pathname);

    const cfgCache = await caches.open('config-cache');
    let configuration = {};
    try {
        const resp = await cfgCache.match('configuration');
        configuration = resp ? await resp.json() : {};
    } catch (e) {
        console.warn('Could not read config cache, using {}', e);
    }

    if (configuration.search) urls.push('/' + configuration.search);
    urls.push('/offline', '/index.html', '/404.html', '/css/style.css', '/favicon.ico',
        '/manifest.json', '/js/share.js', '/js/search-query.js', '/js/search-results.js'
    );
    const total = urls.length;
    let done = 0;

    for (const url of urls.slice()) {
        if (!url.endsWith('/')) continue;
        try {
            const html = await (await fetch(url)).text();
            const imgPaths = [...html.matchAll(/<img[^>]+src="(.*?)"/g)]
                .map(m => new URL(m[1], url).pathname);
            for (const p of imgPaths) if (!urls.includes(p)) urls.push(p);
        } catch (e) {
            console.warn(`Could not fetch ${url} to find images`, e);
        }

        try {
            const resp = await fetch(url, { mode: 'no-cors' });
            await cache.put(url, resp);
        } catch (e) {
            console.warn(`Could not cache ${url}`, e);
        }
        reportProgress(++done, total);
    }
    reportProgress(total, total);
}

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k.startsWith('precache-') && k !== PRECACHE)
                .map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    if (event.request.destination === 'image') {
        event.respondWith(cacheFirst(event.request, RUNTIME));
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(PRECACHE);

        let cached = await cache.match(event.request, { ignoreSearch: true });
        if (cached) return cached;

        const url = new URL(event.request.url);
        if (!url.pathname.endsWith('/')) {
            cached = await cache.match(url.pathname + '/', { ignoreSearch: true })
                || await cache.match(url.pathname + '/index.html', { ignoreSearch: true });
            if (cached) return cached;
        }

        try {
            const net = await fetch(event.request);
            if (net?.ok) return net;
        } catch (_) {
            console.warn(`Network fetch failed for ${event.request.url}`);
        }

        cached = await cache.match('/offline');
        return cached || new Response(
            '<h1>Offline</h1><p>Please reconnect and refresh.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
    })());
});

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const resp = await fetch(request, { mode: 'no-cors' });
    if (resp?.ok) cache.put(request, resp.clone());
    return resp;
}

function reportProgress(done, total) {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'CACHE_PROGRESS', done, total }))
    );
}
