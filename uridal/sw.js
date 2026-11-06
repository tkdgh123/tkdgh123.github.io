// 인터넷이 없을 때도 앱 화면이 열리도록: 먼저 새로 받아 보고, 안 되면 저장해 둔 걸 보여 준다.
const CACHE = "uridal-v13";
const SHELL = ["./", "index.html", "style.css", "app.js", "push.js", "manifest.webmanifest", "icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname.endsWith("googleapis.com")) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});

// 상대가 바꾸면 오는 알림. 누르면 앱을 연다
self.addEventListener("push", e => {
  let m = {}; try { m = e.data.json(); } catch {}
  e.waitUntil(self.registration.showNotification(m.title || "우리달", { body: m.body || "", icon: "icon-192.png", badge: "badge.png", lang: "ko" }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(ws => (ws[0] ? ws[0].focus() : self.clients.openWindow("./"))));
});
