// ==================== ONE CHAT — SERVICE WORKER & OFFLINE SPLASH ====================
const CACHE_NAME = 'onechat-pwa-v1';
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

  // Network-first so latest Vercel deployments always apply immediately
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Offline Splash Screen for navigation requests when completely offline
        if (event.request.mode === 'navigate') {
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>One Chat — Offline</title>
              <style>
                body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
                  background:radial-gradient(circle at top, #1e113e, #0c0618); color:#fff;
                  font-family:system-ui,-apple-system,sans-serif; text-align:center; padding:24px; }
                .card { max-width:340px; padding:28px; border-radius:24px; background:rgba(24,14,48,0.9);
                  border:1px solid rgba(244,114,182,0.35); box-shadow:0 20px 50px rgba(0,0,0,0.7); }
                .badge { display:inline-block; padding:6px 14px; border-radius:999px; font-size:11px;
                  font-weight:700; background:rgba(236,72,153,0.2); color:#f9a8d4; margin-bottom:12px; }
                h1 { margin:0 0 8px; font-size:24px; }
                p { margin:0 0 20px; font-size:13px; color:#d8b4fe; line-height:1.5; }
                button { width:100%; padding:12px; border:none; border-radius:14px; font-weight:700; font-size:13px;
                  color:#fff; background:linear-gradient(135deg,#f43f5e,#d946ef,#f59e0b); cursor:pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="badge">📡 OFFLINE • ஆஃப்லைன்</div>
                <h1>One Chat</h1>
                <p>No internet connection detected. Reconnect to Wi-Fi or mobile data to enter your encrypted room.<br/><br/>இணைய இணைப்பு இல்லை. மீண்டும் இணைத்து அறைக்குள் நுழையவும்.</p>
                <button onclick="location.reload()">Retry Connection • மீண்டும் முயற்சி</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })
  );
});
