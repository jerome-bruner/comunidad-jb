/* ==========================================================
   Comunidad JB — sw.js
   ----------------------------------------------------------
   El "service worker": lo que hace que la app se pueda
   instalar como ícono en el celular.

   QUÉ GUARDA Y QUÉ NO
   Guarda SOLO la cáscara (HTML, CSS, JS, iconos) para que
   abra rápido y no se vea una pantalla en blanco sin señal.
   NUNCA guarda respuestas de Apps Script: las calificaciones
   y los datos siempre se piden frescos. Si se guardaran,
   un papá podría quedarse viendo un reporte viejo sin saberlo,
   o peor, ver datos después de que le quitaron el acceso.

   CÓMO SE ACTUALIZA
   Sube VERSION cada vez que cambies cualquier archivo de la
   app. Eso bota el guardado anterior y los celulares toman
   la versión nueva la próxima vez que abran. Si no la subes,
   los papás siguen viendo la versión vieja aunque tú ya hayas
   subido los archivos a GitHub, y vas a creer que el cambio
   no se aplicó.
   ========================================================== */

var VERSION = 'jb-1.1.0';

var CASCARA = [
  './',
  './index.html',
  './manifest.json',
  './css/estilos.css',
  './js/config.js',
  './js/api.js',
  './js/instalar.js',
  './js/avisos.js',
  './js/app.js',
  './iconos/icono-192.png',
  './iconos/icono-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll(CASCARA); })
      // Si un archivo de la lista falla (un nombre mal escrito),
      // addAll tumba toda la instalación. Mejor que la app quede
      // sin guardado a que no se instale.
      .catch(function () { return null; })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (llaves) {
      return Promise.all(llaves.map(function (k) {
        return k === VERSION ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Solo se toca lo que la app pide a su propio servidor y nada
  // más de lectura. Todo lo que va a Apps Script pasa de largo.
  if (req.method !== 'GET') return;
  if (req.url.indexOf(self.location.origin) !== 0) return;

  // Primero la red, y el guardado como red de seguridad: así un
  // cambio que subas a GitHub se ve de inmediato, y sin señal la
  // app abre igual con lo último que alcanzó a guardar.
  e.respondWith(
    fetch(req)
      .then(function (r) {
        if (r && r.status === 200) {
          var copia = r.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copia); });
        }
        return r;
      })
      .catch(function () {
        return caches.match(req).then(function (g) {
          return g || caches.match('./index.html');
        });
      })
  );
});
