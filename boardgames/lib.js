// 주사위섬 보드게임방 공용 도구 — 만든 사람: Claude (사용자 김창식 요청, 2026-11-26)

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// 섞기, 고르기 — rng는 0 이상 1 미만을 돌려주는 함수
export function shuffle(a, rng = Math.random) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pick = (a, rng = Math.random) => a[Math.floor(rng() * a.length)];
export const randInt = (lo, hi, rng = Math.random) => lo + Math.floor(rng() * (hi - lo + 1));

// 씨앗 난수 (같은 씨앗이면 같은 줄)
export function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hash(...xs) {
  let h = 2166136261;
  for (const c of xs.join("|")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const clone = o => JSON.parse(JSON.stringify(o));

// 패 잠그기: 폰마다 ECDH 열쇠 한 쌍, 방장과 나눈 AES 열쇠로 내 몫만 잠금
const ECDH = { name: "ECDH", namedCurve: "P-256" };
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function myKeys() {
  let j = null;
  try { j = JSON.parse(localStorage.getItem("bg-key") || "null"); } catch {}
  if (!j) {
    const kp = await crypto.subtle.generateKey(ECDH, true, ["deriveKey"]);
    j = { pub: await crypto.subtle.exportKey("jwk", kp.publicKey), priv: await crypto.subtle.exportKey("jwk", kp.privateKey) };
    try { localStorage.setItem("bg-key", JSON.stringify(j)); } catch {}
  }
  return { pub: { kty: j.pub.kty, crv: j.pub.crv, x: j.pub.x, y: j.pub.y }, priv: await crypto.subtle.importKey("jwk", j.priv, ECDH, false, ["deriveKey"]) };
}
const shared = new Map();
export async function sharedKey(priv, pub) {
  const k = pub.x + pub.y;
  if (!shared.has(k)) {
    const p = await crypto.subtle.importKey("jwk", { ...pub, ext: true }, ECDH, false, []);
    shared.set(k, await crypto.subtle.deriveKey({ name: "ECDH", public: p }, priv, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]));
  }
  return shared.get(k);
}
export async function seal(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  return b64(iv) + "." + b64(ct);
}
export async function open(key, s) {
  const [iv, ct] = s.split(".");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

// 내 번호와 이름(이 폰에 저장)
// 시험용: ?local&as=이름 이면 탭마다 다른 사람으로 (같은 브라우저 안에서 여럿 흉내)
const AS = typeof location !== "undefined" && /[?&]local(&|=|$)/.test(location.search) ? new URLSearchParams(location.search).get("as") : null;
export function myPid() {
  if (AS) return "p" + AS.replace(/[^0-9A-Za-z가-힣]/g, "").slice(0, 12);
  let p = null;
  try { p = localStorage.getItem("bg-pid"); } catch {}
  if (!p) { p = "p" + Math.random().toString(36).slice(2, 12); try { localStorage.setItem("bg-pid", p); } catch {} }
  return p;
}
export function getName() { if (AS) return AS; try { return localStorage.getItem("bg-name") || ""; } catch { return ""; } }
export function setName(n) { try { localStorage.setItem("bg-name", n); } catch {} }

// 자리 색 (최대 10자리)
export const SEAT = ["#d9472b", "#2f6fb0", "#e0a526", "#3c8d5a", "#8a4fb0", "#d26a9a", "#2a9d9b", "#7a5a3a", "#5b6b7a", "#a3b23a"];

// 작은 DOM 도우미
export function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

// 주사위 한 개 그림(점 9칸)
const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
export const dieHTML = (n, cls = "", attrs = "") => `<span class="die ${cls}" ${attrs}>${[...Array(9).keys()].map(i => `<i${PIPS[n]?.includes(i + 1) ? ' class="on"' : ""}></i>`).join("")}</span>`;
export const logPush = (s, x, max = 12) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, max); };
export const nameB = (n, i) => `<b style="color:${SEAT[i]}">${esc(n[i])}</b>`;
