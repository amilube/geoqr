// sw.js - Service Worker para PWA Dumanity
// Permite funcionamiento offline y caché de recursos

const CACHE_NAME = 'soy-socio-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './fallback.css',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/htmx.org@2.0.0',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Intentando cachear archivos');
      // Cachear recursos uno por uno. Usamos mode: 'no-cors' para recursos CDN
      // externos y atrapamos errores para evitar que la instalación falle.
      const promises = urlsToCache.map(async (url) => {
        try {
          const req = new Request(url, { mode: 'no-cors' });
          const response = await fetch(req);
          if (response) {
            // Algunos responses serán opaques (cross-origin); igual se pueden cachear
            await cache.put(url, response.clone());
            console.log('Service Worker: Cacheado', url);
          }
        } catch (err) {
          console.warn('Service Worker: no se pudo cachear', url, err);
        }
      });
      await Promise.all(promises);
    })
  );
  
  // Activar el service worker inmediatamente
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguas
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control de todas las páginas inmediatamente
  return self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en caché, devolver la versión cacheada
        if (response) {
          return response;
        }
        
        // Si no está en caché, hacer la petición de red
        return fetch(event.request)
          .then((response) => {
            // Verificar que la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta porque es un stream que solo puede leerse una vez
            const responseToCache = response.clone();
            
            // Agregar la respuesta al caché para futuras peticiones
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Error en fetch', error);
            // Aquí podrías retornar una página offline personalizada
          });
      })
  );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronización en segundo plano');
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí podrías sincronizar datos cuando vuelva la conexión
      Promise.resolve()
    );
  }
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error("Service Worker: Error al parsear JSON", e);
  }

  const title = data.title || 'Dumanity';
  
  const options = {
    body: data.body || 'Nueva notificación',
    icon: data.icon || '/static/icons/icon-192x192.png',
    badge: data.badge || '/static/icons/icon-72x72.png',
    image: data.image || undefined,
    data: data.data || {},        // para deep links
    vibrate: data.vibrate || [200, 100, 200],
    actions: data.actions || []    // soporte para botones
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data.url || '/';
  event.waitUntil(clients.openWindow(url));
});