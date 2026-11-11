/* Service Worker - Actividades Académicas
   Para publicar una nueva versión, cambia el número de VERSION. */
const VERSION = 'v10';
const CACHE = `actividades-${VERSION}`;
const API_CONSEJO = 'https://dummyjson.com/quotes/random';

const ARCHIVOS = [
  './',
  'index.html',
  'styles.css',
  'app.min.js',
  'manifest.webmanifest',
  'data/consejos.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

async function guardarRespuesta(request, response) {
  const cacheControl = response.headers.get('Cache-Control') || '';
  if (
    !response.ok ||
    response.type === 'opaque' ||
    /\b(?:no-store|private)\b/i.test(cacheControl) ||
    request.headers.has('Authorization')
  ) {
    return response;
  }

  const cache = await caches.open(CACHE);
  try {
    await cache.put(request, response.clone());
  } catch (error) {
    console.error(`No se pudo guardar en caché ${request.url}`, error);
    throw error;
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.href === API_CONSEJO) {
    const cachedResponse = caches.open(CACHE).then(cache => cache.match(request));
    const networkResponse = Promise.race([
      fetch(request, { signal: AbortSignal.timeout(3500) })
        .then(response => {
          if (!response.ok) throw new Error(`Servicio de consejos: HTTP ${response.status}`);
          return guardarRespuesta(request, response);
        })
        .catch(() => null),
      new Promise(resolve => setTimeout(() => resolve(null), 3500))
    ]);
    event.waitUntil(networkResponse.then(() => undefined));
    event.respondWith(
      cachedResponse.then(response => response || networkResponse.then(result =>
        result || new Response('', { status: 503, statusText: 'Servicio no disponible' })
      ))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => guardarRespuesta(request, response))
        .catch(() => caches.match(request).then(response => response || caches.match('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        event.waitUntil(
          fetch(request)
            .then(response => guardarRespuesta(request, response))
            .catch(() => undefined)
        );
        return cachedResponse;
      }

      try {
        return await guardarRespuesta(request, await fetch(request));
      } catch (error) {
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        throw error;
      }
    })
  );
});

self.addEventListener('install', (event) => {
  // No se llama a skipWaiting() aquí: la app avisa al usuario y él decide actualizar.
  event.waitUntil(
    caches.open(CACHE).then(c => Promise.all(ARCHIVOS.map(async archivo => {
      const request = new Request(archivo, { cache: 'reload' });
      const response = await fetch(request);
      if (!response.ok) throw new Error(`No se pudo precargar ${archivo}: HTTP ${response.status}`);
      await c.put(request, response);
    })))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.tipo === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientes => {
      if (clientes.length) return clientes[0].focus();
      return self.clients.openWindow('./#/actividades');
    })
  );
});
