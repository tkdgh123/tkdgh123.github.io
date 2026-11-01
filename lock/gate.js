// 잠긴 페이지: 비밀번호로 열쇠를 만들어 이 기기에 두고, 서비스 워커가 잠긴 파일을 풀어 준다
const store = mode => new Promise((res, rej) => {
  const o = indexedDB.open("lock", 1);
  o.onupgradeneeded = () => o.result.createObjectStore("k");
  o.onsuccess = () => res(o.result.transaction("k", mode).objectStore("k"));
  o.onerror = rej;
});
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = rej; });
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const dec = (key, b) => crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12));
const works = (key, l) => dec(key, b64(l.check)).then(() => true, () => false);

async function derive(pw, l) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(l.salt), iterations: l.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
}

async function open(key) {
  if ("serviceWorker" in navigator && !sessionStorage.lockTried) {
    sessionStorage.lockTried = 1;
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(r => { navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }); setTimeout(r, 3000); });
    if (navigator.serviceWorker.controller) return location.reload();
  }
  // 워커를 못 쓰면(강력 새로고침 등) 이 페이지만 직접 푼다
  let p = location.pathname;
  if (p.endsWith("/")) p += "index.html";
  const b = new Uint8Array(await (await fetch(p + ".enc")).arrayBuffer());
  const html = new TextDecoder().decode(await dec(key, b));
  document.open(); document.write(html); document.close();
}

(async () => {
  const l = await (await fetch("/lock/list.json", { cache: "no-cache" })).json();
  const saved = await store("readonly").then(s => req(s.get("key"))).catch(() => null);
  if (saved && await works(saved, l)) return open(saved);
  document.body.classList.add("ask");
  f.onsubmit = async e => {
    e.preventDefault();
    msg.textContent = ""; go.disabled = true;
    const key = await derive(pw.value, l);
    if (!await works(key, l)) { msg.textContent = "비밀번호가 달라요"; go.disabled = false; pw.select(); return; }
    await store("readwrite").then(s => req(s.put(key, "key")));
    open(key);
  };
})();
