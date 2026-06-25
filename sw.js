/* Кубики — service worker для офлайн-роботи.
   Стратегія:
     • навігація (HTML)      → network-first (свіжа версія, кеш як запас офлайн);
     • статичні ресурси      → cache-first (іконки, маніфест);
   Кеш версіонований — змінюй VERSION при кожному релізі, щоб скинути старий кеш.
   Усі шляхи відносні, тож працює і в корені домену (Vercel), і в підпапці (GitHub Pages). */

var VERSION = "1.0.1";
var CACHE = "kubiky-" + VERSION;
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  // НЕ викликаємо skipWaiting() автоматично — чекаємо на згоду користувача
  // (повідомлення SKIP_WAITING зі сторінки), щоб не ламати відкриті вкладки.
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Сторінка може попросити новий SW активуватися негайно.
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  // Навігація → network-first: завжди тягнемо свіжий HTML, офлайн → з кешу.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match("./index.html");
          });
        })
    );
    return;
  }

  // Решта (іконки, маніфест тощо) → cache-first.
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      });
    })
  );
});
