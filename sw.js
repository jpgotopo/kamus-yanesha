// Service worker del kamus. Generado por kamus-toolkit: no editar a mano.
// El nombre del cache lleva el hash del contenido publicado, así que solo
// cambia cuando cambian las páginas.
const CACHE = 'kamus-56af84ca41';
const ASSETS = [
  "./",
  "./Diccionario-Yanesha-Espanol.html",
  "./Interlineal-Yanesha-Espanol.html",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('kamus-') && k !== CACHE)
                              .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Cache-first: el diccionario es estático y pesado, y el caso de uso es trabajar
// sin cobertura. Lo que no esté precacheado se busca en red y se guarda.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req)
    .then(res => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    })
    .catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
