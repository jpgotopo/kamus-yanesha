// Service worker del kamus. Generado por kamus-toolkit: no editar a mano.
// El nombre del cache lleva el scope y el hash del contenido publicado. El scope
// es imprescindible: todos los idiomas cuelgan del mismo origen
// (usuario.github.io/kamus-xxx/) y CacheStorage es por origen, no por scope, así
// que un prefijo común haría que cada idioma le borrase el cache offline a los
// demás al activarse. El hash hace que solo cambie cuando cambian las páginas.
const PREFIX = 'kamus' + new URL(self.registration.scope).pathname;
const CACHE = PREFIX + '56af84ca41';
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
// Caches del esquema viejo (kamus-<hash>, sin scope): huérfanos que ya no
// reclama nadie. Se limpian una vez y este bloque se puede quitar más adelante.
const LEGACY = /^kamus-[0-9a-f]{10}$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => (k.startsWith(PREFIX) || LEGACY.test(k)) && k !== CACHE)
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
