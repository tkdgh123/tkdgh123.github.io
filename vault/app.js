// 금고 페이지: 내용은 data.bin(AES-256-GCM 암호문)에만 있고, 열쇠는 등록한 브라우저의 IndexedDB에 꺼낼 수 없는 형태로만 있다.
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const url = u => /^https:\/\/[^\s"'<>]+$/.test(u || "") ? u : "#";
const AAD = new TextEncoder().encode("changupsil-vault-v1");
const b64 = s => Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0));
const b64url = s => b64(s.trim().replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - s.trim().length % 4) % 4));

const store = mode => new Promise((res, rej) => {
  const o = indexedDB.open("vault", 1);
  o.onupgradeneeded = () => o.result.createObjectStore("k");
  o.onsuccess = () => res(o.result.transaction("k", mode).objectStore("k"));
  o.onerror = rej;
});
const rq = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = rej; });

async function open(key) {
  const b = b64(await (await fetch("data.bin", { cache: "no-cache" })).text());
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12), additionalData: AAD }, key, b.slice(12));
  return JSON.parse(new TextDecoder().decode(plain));
}

// 노트북의 'vault.py enroll'이 2분 동안 127.0.0.1에서 열쇠를 한 번 넘겨준다(주소창엔 포트와 일회용 번호만)
async function pair() {
  const q = new URLSearchParams(location.search), port = q.get("pair"), n = q.get("n") || "";
  if (!port) return null;
  history.replaceState(null, "", location.pathname);
  if (!/^\d{2,5}$/.test(port)) return null;
  const raw = await fetch(`http://127.0.0.1:${port}/k?n=${encodeURIComponent(n)}`, { cache: "no-store", targetAddressSpace: "loopback" })
    .then(r => r.ok ? r.text() : null).catch(() => null);
  return raw && crypto.subtle.importKey("raw", b64url(raw), "AES-GCM", false, ["decrypt"]);
}

function locked(msg) {
  if (msg) $("#why").textContent = msg;
  $("#locked").hidden = false;
}

// ── 날짜 ──
const DAY = 864e5, now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const when = x => {
  if (x.due) return new Date(x.due);
  if (x.m == null) return null;
  const mo = Math.floor(x.m) - 1, d = Math.round((x.m % 1) * 30) + 1;
  let t = new Date(today.getFullYear(), mo, d);
  if (t < today) t = new Date(today.getFullYear() + 1, mo, d);
  return t;
};
const fmt = d => `${d.getMonth() + 1}/${d.getDate()}`;
const hm = d => (d.getHours() || d.getMinutes()) ? ` ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}` : "";
function dday(x) {
  if (!x.due) return "";
  const d = new Date(x.due), from = x.from && new Date(x.from);
  if (d < now) return `<span class="dd past">지남</span>`;
  if (from && from > now) return `<span class="dd">${fmt(from)} 시작</span>`;
  const n = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - today) / DAY);
  return `<span class="dd ${n <= 1 ? "hot" : n <= 7 ? "soon" : ""}">${n === 0 ? "오늘" + hm(d) : "D-" + n}</span>`;
}
const period = x => x.due ? `${x.from ? fmt(new Date(x.from)) + " ~ " : "~ "}${fmt(new Date(x.due))}${hm(new Date(x.due))}` : esc(x.when);

// ── 그리기 ──
const FIT = { ok: "맞아요", likely: "맞을 듯", check: "확인 필요" };
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem("vault-done") || "[]")); } catch {}

function render(D) {
  const items = D.items.map(x => ({ ...x, at: when(x) })), live = items.filter(x => !x.due || new Date(x.due) >= now).sort((a, b) => (a.at || Infinity) - (b.at || Infinity)), past = items.filter(x => x.due && new Date(x.due) < now);
  const todo = D.todo.map(x => ({ ...x, at: x.due ? new Date(x.due) : null }));
  const notices = (D.notices || []).filter(n => !n.skip);
  const fresh = n => n.seen && (today - new Date(n.seen)) / DAY <= 7;
  const picked = notices.filter(n => n.hit.length || fresh(n));

  $("#app").innerHTML = `
  <h1><b>${esc(D.ui.h1[0])}</b> ${esc(D.ui.h1[1])}</h1>
  <p class="meta">${esc(D.updated)} 갱신 · ${esc(D.checked)}${D.notices ? ` · ${esc(D.ui.auto)}` : ""}</p>

  <section><h2>할 일 <small>${todo.filter(t => !done.has(t.id)).length}개 남음</small></h2>
    <ul class="todo">${todo.map(t => `<li class="${done.has(t.id) ? "done" : ""}"><input type="checkbox" data-id="${esc(t.id)}" aria-label="${esc(t.t)} 끝냄"${done.has(t.id) ? " checked" : ""}><span class="t">${esc(t.t)}</span>${dday(t)}<span class="w">${t.due ? period(t) : esc(t.when)}</span></li>`).join("")}</ul>
  </section>

  <section><h2>이번 학기 확인 결과</h2>
    <div class="status">${D.status.map(s => `<div class="${s.ok ? "y" : "n"}"><b>${esc(s.t)}<em>${esc(s.v)}</em></b><p>${esc(s.d)}</p></div>`).join("")}</div>
    <ul class="lesson">${D.missed.map(m => `<li>${esc(m)}</li>`).join("")}</ul>
  </section>

  <section><h2>${esc(D.ui.items)} <small>${live.length}개 · 가까운 순</small></h2>
    <div class="items">${live.map(item).join("")}</div>
    ${past.length ? `<p class="past-items">마감 지남: ${past.map(x => esc(x.name)).join(", ")}</p>` : ""}
    <p class="call">${esc(D.note)}</p>
  </section>

  ${D.notices ? `<section><h2>${esc(D.ui.notices[0])} <small>${esc(D.ui.notices[1])}</small></h2>
    <ul class="notices" id="nl">${list(picked, fresh)}</ul>
    <button class="btn" type="button" id="all">전체 ${notices.length}개 보기</button>
  </section>` : ""}

  <section><h2>해당 없음</h2><div class="no">${D.no.map(([n, w]) => `<div><b>${esc(n)}</b><span>${esc(w)}</span></div>`).join("")}</div></section>

  <section><h2>출처</h2><div class="src">${D.sources.map(([t, u]) => `<a href="${esc(url(u))}" rel="noopener noreferrer">${esc(t)}</a>`).join("")}</div></section>`;

  $("#app").onchange = e => {
    const id = e.target.dataset.id; if (!id) return;
    e.target.checked ? done.add(id) : done.delete(id);
    e.target.closest("li").classList.toggle("done", e.target.checked);
    try { localStorage.setItem("vault-done", JSON.stringify([...done])); } catch {}
  };
  const all = $("#all");
  if (all) all.onclick = () => { $("#nl").innerHTML = list(notices, fresh); all.remove(); };
}

const item = x => `<details class="it"><summary>
    <span class="nm"><b>${esc(x.name)}</b><small>${esc(x.kind)}</small></span>
    <span class="am">${esc(x.amount)}</span>
    <span class="wh">${period(x)}</span>
    <span class="fit ${esc(x.fit)}">${FIT[x.fit] || ""}</span></summary>
  <div class="body">
    <div><h3>조건</h3><ul>${(x.why || []).map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
    ${x.todo ? `<div><h3>할 일</h3><ul>${x.todo.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
    ${x.links ? `<p class="links">${x.links.map(([t, u]) => `<a href="${esc(url(u))}" rel="noopener noreferrer">${esc(t)}</a>`).join("")}</p>` : ""}
  </div></details>`;

const list = (ns, fresh) => ns.map(n => `<li>${fresh(n) ? `<span class="new">새</span>` : ""}<a href="${esc(url(n.u))}" rel="noopener noreferrer">${esc(n.t)}</a>${n.hit.length ? `<span class="tag">${esc(n.hit.slice(0, 3).join(" · "))}</span>` : ""}</li>`).join("") || `<li>아직 없어요</li>`;

(async () => {
  try {
    const paired = await pair();
    const key = paired || await store("readonly").then(s => rq(s.get("key"))).catch(() => null);
    if (!key) return locked();
    let D;
    try { D = await open(key); } catch { return locked(paired ? "등록에 실패했어요. 노트북에서 다시 실행하세요." : "이 기기의 열쇠가 바뀌었어요. 노트북에서 다시 등록하세요."); }
    if (paired) await store("readwrite").then(s => rq(s.put(key, "key")));
    $("#dev").hidden = false;
    render(D);
    $("#app").hidden = false;
  } catch { locked(); }
})();
