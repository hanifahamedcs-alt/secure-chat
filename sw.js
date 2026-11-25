// ==================== ONE CHAT — SERVICE WORKER (V4 — FRESH CACHE TAKEOVER) ====================
const CACHE_NAME = 'onechat-pwa-v4';
const CORE_ASSETS = [
  './',
  './index.html',
  './theme.css',
  './connection.js',
  './games.js',
  './license.js',
  './couples.js',
  './i18n.js',
  './nfc-pair.js',
  './pwa.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>One Chat — Offline</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0618;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px}.card{max-width:340px;padding:28px;border-radius:24px;background:#180e30;border:1px solid rgba(244,114,182,.35)}button{width:100%;padding:12px;border:none;border-radius:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,#f43f5e,#d946ef,#f59e0b);margin-top:16px}</style></head><body><div class="card"><h2>One Chat • Offline</h2><p>Reconnect to Wi-Fi or mobile data to enter your private room.</p><button onclick="location.reload()">Retry Connection</button></div></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })
  );
});
