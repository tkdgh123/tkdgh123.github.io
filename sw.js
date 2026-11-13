// 잠긴 파일을 요청하면, 이 기기에 열쇠가 있을 때만 암호문(lock/f/*.enc)을 풀어서 돌려준다.
// 어떤 파일이 잠겼는지 목록도 암호문(lock/files.enc)이라 열쇠 없이는 이름조차 모른다.
const TYPES = { html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript", json: "application/json", webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml", pdf: "application/pdf", gif: "image/gif", ico: "image/x-icon", avif: "image/avif", mjs: "text/javascript", txt: "text/plain; charset=utf-8", md: "text/plain; charset=utf-8", csv: "text/csv; charset=utf-8", woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", mp4: "video/mp4", webm: "video/webm", glb: "model/gltf-binary", wasm: "application/wasm" };
const dec = (key, b) => crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12));
const getKey = () => new Promise(res => {
  const o = indexedDB.open("lock", 1);
  o.onupgradeneeded = () => o.result.createObjectStore("k");
  o.onsuccess = () => { const r = o.result.transaction("k").objectStore("k").get("key"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); };
  o.onerror = () => res(null);
});
let man = null, manAt = 0;
async function manifest(key) {
  if (man && Date.now() - manAt < 60e3) return man;
  const r = await fetch("/lock/files.enc", { cache: "no-cache" });
  man = r.ok ? JSON.parse(new TextDecoder().decode(await dec(key, new Uint8Array(await r.arrayBuffer())))) : {};
  manAt = Date.now();
  return man;
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET" || u.pathname.startsWith("/lock/") || u.pathname.startsWith("/vault/")) return;
  let p = decodeURIComponent(u.pathname.slice(1));
  if (p === "" || p.endsWith("/")) p += "index.html";
  e.respondWith(serve(e.request, p));
});

async function serve(req, p) {
  try {
    const key = await getKey();
    const id = key && (await manifest(key))[p];
    if (!id) return fetch(req);
    const r = await fetch(`/lock/f/${id}.enc`, { cache: "no-cache" });
    if (!r.ok) return fetch(req);
    const plain = await dec(key, new Uint8Array(await r.arrayBuffer()));
    return new Response(plain, { headers: { "Content-Type": TYPES[p.split(".").pop()] || "application/octet-stream" } });
  } catch {
    return fetch(req);
  }
}
