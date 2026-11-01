// 잠긴 파일(lock/list.json)을 요청하면, 이 기기에 열쇠가 있을 때만 .enc를 풀어서 돌려준다
const TYPES = { html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript", json: "application/json", webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml", pdf: "application/pdf" };
let list;
const getList = () => list ||= fetch("/lock/list.json", { cache: "no-cache" }).then(r => r.json()).then(j => new Set(j.files)).catch(e => { list = null; throw e; });
const getKey = () => new Promise(res => {
  const o = indexedDB.open("lock", 1);
  o.onupgradeneeded = () => o.result.createObjectStore("k");
  o.onsuccess = () => { const r = o.result.transaction("k").objectStore("k").get("key"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); };
  o.onerror = () => res(null);
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET") return;
  let p = decodeURIComponent(u.pathname.slice(1));
  if (p === "" || p.endsWith("/")) p += "index.html";
  e.respondWith(serve(e.request, p));
});

async function serve(req, p) {
  try {
    if (!(await getList()).has(p)) return fetch(req);
    const key = await getKey();
    const r = key && await fetch("/" + encodeURI(p) + ".enc", { cache: "no-cache" });
    if (!r || !r.ok) return fetch(req);
    const b = new Uint8Array(await r.arrayBuffer());
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12));
    return new Response(plain, { headers: { "Content-Type": TYPES[p.split(".").pop()] || "application/octet-stream" } });
  } catch {
    return fetch(req);
  }
}
