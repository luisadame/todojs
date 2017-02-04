var CACHE = 'cache-and-network';

self.addEventListener('install', function(evt) {
    console.log('The service worker is being installed.');

    evt.waitUntil(precache());
});

self.addEventListener('fetch', function(evt) {
    console.log('The service worker is serving the asset.');
    evt.respondWith(fromCache(evt.request));
});

function precache() {
    return caches.open(CACHE).then(function(cache) {
        return cache.addAll([
            '/',
            './index.html',
            './css/app.css',
            './js/main.js',
            '/todojs/',
            '/todojs/index.html',
            '/todojs/css/app.css',
            '/todojs/js/main.js',
        ]);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function(cache) {
        return cache.match(request).then(function(matching) {
            return matching || fromNetwork(request);
        });
    });
}

function fromNetwork(request) {
    return fetch(request).catch(function(error) {
        return caches.open(CACHE).then(function(cache) {
            return cache.match('/index.html').then(match => {
                return match;
            });
        });
    });
}