// 주사위섬 보드게임방 — 첫 화면, 방, 방장 진행 — 만든 사람: Claude (사용자 김창식 요청, 2026-11-26)
// 방장 폰이 판 전체를 들고 규칙을 돌린다. 다른 사람은 act로 하고 싶은 것을 보내고, 방 문서에서 자기 몫(잠긴 것)을 풀어 본다.
import { esc, myKeys, sharedKey, seal, open, myPid, getName, setName, SEAT, clone, hash } from "./lib.js";
import { fireNet, localNet } from "./net.js";
import vault from "./g/vault.js";
import crab from "./g/crab.js";
import bell from "./g/bell.js";
import gems from "./g/gems.js";
import isle from "./g/isle.js";

export const GAMES = { isle, bell, crab, gems, vault };
const $ = s => document.querySelector(s);
const app = $("#app");
const Q = new URLSearchParams(location.search);
let LOCAL = Q.has("local");
const ME = myPid();
let net, netFire = null, netLocal = null, keys, host = null, unwatch = null, room = null, code = null, last = null;

const CODECH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from({ length: 4 }, () => CODECH[Math.floor(Math.random() * CODECH.length)]).join("");
const url = (c, extra = "") => location.pathname + "?" + (LOCAL ? "local&" : "") + "r=" + c + extra;

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600);
}

// ───────── 방장 ─────────
class Host {
  constructor(c, s) {
    this.c = c; this.s = s; this.ver = s.ver || 0; this.timers = []; this.busy = Promise.resolve();
    this.off = net.acts(c, a => this.onAct(a));
  }
  static fresh(c, g) {
    return new Host(c, { g, st: "wait", seats: [{ pid: ME, name: getName(), pub: keys.pub }], gs: null, res: null, ver: 0 });
  }
  get G() { return GAMES[this.s.g]; }
  seatOf(pid) { return this.s.seats.findIndex(x => x.pid === pid); }
  onAct(a) {
    const s = this.s;
    if (a.k === "join") {
      const i = this.seatOf(a.pid);
      if (i >= 0) { s.seats[i].name = a.name; s.seats[i].pub = a.pub; }
      else if (s.st === "wait" && s.seats.length < this.G.max) s.seats.push({ pid: a.pid, name: a.name, pub: a.pub });
      else { s.watch = s.watch || {}; s.watch[a.pid] = { name: a.name, pub: a.pub }; }
      return this.publish();
    }
    if (a.k === "leave" && s.st === "wait") { const i = this.seatOf(a.pid); if (i > 0) s.seats.splice(i, 1); return this.publish(); }
    if (a.k === "move") return this.move(this.seatOf(a.pid), a.a, a.pid);
  }
  move(seat, a, pid) {
    const s = this.s;
    if (s.st !== "play" || seat < 0) return;
    try { this.G.apply(s.gs, seat, a, { now: Date.now(), rng: Math.random }); }
    catch (e) { s.err = { pid, msg: e.message, n: (s.err?.n || 0) + 1 }; return this.publish(); }
    this.after();
  }
  after() {
    const s = this.s, o = this.G.over(s.gs);
    if (o) { s.st = "end"; s.res = o; }
    this.publish();
  }
  addBot() {
    const s = this.s;
    if (s.st !== "wait" || s.seats.length >= this.G.max) return;
    const used = new Set(s.seats.map(x => x.name));
    const name = BOTNAMES.find(n => !used.has(n)) || "봇";
    s.seats.push({ pid: "bot" + Math.random().toString(36).slice(2, 7), name, bot: true });
    this.publish();
  }
  kick(i) { if (i > 0 && this.s.st === "wait") { this.s.seats.splice(i, 1); this.publish(); } }
  toBot(i) { const x = this.s.seats[i]; if (i > 0 && x && !x.bot) { x.bot = true; x.name += " (봇)"; this.publish(); } }
  start() {
    const s = this.s, n = s.seats.length;
    if (n < this.G.min || n > this.G.max) return toast(`${this.G.name}은 ${this.G.min}~${this.G.max}명이 해요`);
    s.gs = this.G.setup(n, Math.random, { now: Date.now() }); s.st = "play"; s.res = null; s.err = null;
    this.publish();
  }
  again(g) {
    const s = this.s;
    if (g) s.g = g;
    s.st = "wait"; s.gs = null; s.res = null;
    while (s.seats.length > this.G.max) s.seats.pop();
    this.publish();
  }
  async publish() {
    const s = this.s; s.ver = ++this.ver;
    try { localStorage.setItem("bg-host:" + this.c, JSON.stringify(s)); } catch {}
    this.schedule();
    const G = this.G, doc = {
      g: s.g, host: ME, hpub: keys.pub, st: s.st, ver: s.ver, res: s.res ? JSON.stringify(s.res) : null, err: s.err || null,
      seats: s.seats.map(x => ({ pid: x.pid, name: x.name, bot: !!x.bot, pub: x.pub || null })),
      pub: s.gs ? JSON.stringify(G.view(s.gs, -1)) : null, priv: {} // 파이어스토어는 배열 속 배열을 못 담아서 글자로
    };
    if (s.gs) for (const [i, x] of s.seats.entries()) {
      if (x.bot || x.pid === ME || !x.pub) continue;
      doc.priv[x.pid] = await seal(await sharedKey(keys.priv, x.pub), G.view(s.gs, i));
    }
    const ver = s.ver;
    this.busy = this.busy.then(() => ver === this.ver ? net.write(this.c, doc) : null).catch(e => toast("저장이 안 돼요: " + e.message));
    show(doc);
  }
  schedule() {
    this.timers.forEach(clearTimeout); this.timers = [];
    const s = this.s, G = this.G;
    if (s.st !== "play") return;
    const ver = this.ver, now = Date.now();
    for (const i of G.turn(s.gs)) {
      if (!s.seats[i]?.bot) continue;
      const b = G.bot(s.gs, i, Math.random, { now });
      if (!b) continue;
      this.timers.push(setTimeout(() => { if (ver === this.ver) this.move(i, b.a, s.seats[i].pid); }, b.delay ?? 900));
    }
    const t = G.nextTick?.(s.gs, now);
    if (t != null) this.timers.push(setTimeout(() => {
      if (ver !== this.ver) return;
      if (G.tick(s.gs, { now: Date.now(), rng: Math.random })) this.after(); else this.schedule();
    }, Math.max(0, t)));
  }
}
const BOTNAMES = ["바다봇", "모래봇", "파도봇", "갈매기봇", "조개봇", "등대봇", "소라봇", "물개봇", "해초봇"];

// ───────── 화면: 첫 화면 ─────────
const PLACES = [
  ["isle", "개척지", "섬 안쪽 빈 땅"], ["bell", "시장", "부두 옆 과일 골목"], ["crab", "해변", "섬 남쪽 모래밭"],
  ["gems", "항구", "배가 드나드는 상회 거리"], ["vault", "등대", "섬 끝 바위 위"]
];

function lobby() {
  if (unwatch) { unwatch(); unwatch = null; }
  host?.off?.(); host = null; room = null; code = null;
  document.title = "주사위섬 보드게임방";
  app.className = "lobby";
  app.innerHTML = `
  <header class="top">
    <h1>주사위섬</h1>
    <p>친구들과 각자 폰으로 같은 방에 들어와 해요. 방을 만들고 코드나 링크를 보내 주세요.</p>
  </header>
  <form class="join" id="joinF">
    <label>내 이름<input id="nm" maxlength="10" value="${esc(getName())}" placeholder="이름" autocomplete="nickname" required></label>
    <label>방 코드<input id="cd" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off"></label>
    <button>들어가기</button>
  </form>
  <ol class="places">${PLACES.map(([g, place, where]) => {
    const G = GAMES[g];
    return `<li style="--c:${G.color}">
      <div class="pl"><b>${place}</b><small>${where}</small></div>
      <div class="gm"><h2>${G.name}</h2><p>${G.sub}</p><span>${G.min}~${G.max}명, ${G.time}</span></div>
      <div class="bt"><button data-make="${g}">방 만들기</button><button class="ghost" data-solo="${g}">봇이랑 혼자</button></div>
    </li>`;
  }).join("")}</ol>
  ${LOCAL ? `<p class="note">이 브라우저 안에서만 도는 시험 모드예요.</p>` : ""}`;
  const nameOk = () => {
    const n = $("#nm").value.trim();
    if (!n) { $("#nm").focus(); toast("이름을 먼저 적어 주세요"); return null; }
    setName(n); return n;
  };
  $("#joinF").onsubmit = e => {
    e.preventDefault();
    if (!nameOk()) return;
    const c = $("#cd").value.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(c)) return toast("방 코드 4자리를 적어 주세요");
    go(c);
  };
  app.querySelectorAll("[data-make]").forEach(b => b.onclick = async () => {
    if (!nameOk()) return;
    b.disabled = true;
    try {
      let c; do c = newCode(); while (await net.exists(c));
      host = Host.fresh(c, b.dataset.make);
      history.pushState(null, "", url(c)); enter(c);
      await host.publish();
    } catch (e) {
      host = null; b.disabled = false; history.pushState(null, "", location.pathname); lobby();
      toast(e.code === "permission-denied" ? "인터넷 방이 아직 준비 중이에요. 봇이랑 혼자는 바로 돼요" : "방을 못 만들었어요: " + e.message);
    }
  });
  app.querySelectorAll("[data-solo]").forEach(b => b.onclick = async () => {
    if (!nameOk()) return;
    const g = b.dataset.solo, G = GAMES[g];
    LOCAL = true; net = netLocal; const c = newCode();
    host = Host.fresh(c, g);
    for (let i = 1; i < Math.min(G.max, Math.max(G.min, G.solo || 3)); i++) host.addBot();
    location.hash = "";
    history.pushState(null, "", url(c)); enter(c);
    host.start();
  });
}

// ───────── 화면: 방 ─────────
function go(c) { history.pushState(null, "", url(c)); enter(c); }

function enter(c) {
  code = c; last = null;
  app.className = "room";
  app.innerHTML = `<div class="wait"><p>방 ${esc(c)}에 들어가는 중이에요</p></div>`;
  if (unwatch) unwatch();
  let first = true;
  unwatch = net.watch(c, d => {
    if (host) return; // 방장은 publish에서 바로 그림
    if (!d) { app.innerHTML = `<div class="wait"><p>방 ${esc(c)}이 없어요. 코드를 다시 확인해 주세요.</p><button onclick="history.back()">돌아가기</button></div>`; return; }
    if (d.host === ME && !host) {
      let s = null; try { s = JSON.parse(localStorage.getItem("bg-host:" + c) || "null"); } catch {}
      if (s) { host = new Host(c, s); host.publish(); return; }
    }
    if (first && !d.seats.some(x => x.pid === ME)) {
      if (!getName()) return askName(c);
      net.send(c, { k: "join", pid: ME, name: getName(), pub: keys.pub });
    }
    first = false;
    show(d);
  }, e => toast("연결이 안 돼요: " + e.message));
}

function askName(c) {
  app.innerHTML = `<form class="wait" id="nf"><p>방 ${esc(c)}에 들어갈 이름을 적어 주세요</p><input id="nm2" maxlength="10" required autofocus><button>들어가기</button></form>`;
  $("#nf").onsubmit = e => { e.preventDefault(); setName($("#nm2").value.trim()); enter(c); };
}

let showing = Promise.resolve();
function show(d) { showing = showing.then(() => draw(d)).catch(e => console.error(e)); }

async function draw(d) {
  room = d;
  const G = GAMES[d.g], me = d.seats.findIndex(x => x.pid === ME), isHost = d.host === ME;
  let v = null;
  if (d.st !== "wait") {
    if (isHost && host?.s.gs) v = G.view(host.s.gs, me);
    else if (me >= 0 && d.priv?.[ME]) {
      try { v = await open(await sharedKey(keys.priv, d.hpub), d.priv[ME]); } catch (e) { console.warn("내 몫을 못 풀었어요", e); v = d.pub; }
    } else v = d.pub;
    if (typeof v === "string") v = JSON.parse(v);
  }
  if (room !== d) return;
  document.title = `${G.name} ${d.st === "wait" ? "대기" : ""} · 주사위섬`.replace(" ·", "");
  if (!app.querySelector(".bar") || app.dataset.g !== d.g) {
    app.dataset.g = d.g;
    app.innerHTML = `<div class="bar" style="--c:${G.color}">
      <button class="home" aria-label="첫 화면">주사위섬</button>
      <b class="gname"></b>
      <button class="code" title="초대 링크 복사"></button>
    </div><div class="seats"></div><div class="stage"></div>`;
    app.querySelector(".home").onclick = () => { history.pushState(null, "", location.pathname + (Q.has("local") ? "?local" : "")); route(); };
    app.querySelector(".code").onclick = share;
  }
  app.querySelector(".gname").textContent = G.name;
  app.querySelector(".code").textContent = "방 " + code;
  const turn = v && d.st === "play" ? v.turn || [] : [];
  app.querySelector(".seats").innerHTML = d.seats.map((x, i) =>
    `<span class="${turn.includes(i) ? "on" : ""}${i === me ? " me" : ""}" style="--s:${SEAT[i]}">${esc(x.name)}${x.bot ? "" : ""}${i === 0 ? '<i>방장</i>' : ""}</span>`).join("");
  const st = app.querySelector(".stage");
  if (d.st === "wait") return waitRoom(st, d, G, me, isHost);
  if (d.err && d.err.pid === ME && d.err.n !== draw.errN) { draw.errN = d.err.n; toast(d.err.msg); }
  const send = a => {
    if (isHost) host.move(me, a, ME);
    else net.send(code, { k: "move", pid: ME, a });
  };
  st.classList.toggle("over", d.st === "end");
  G.render(st, v, me, send, { names: d.seats.map(x => x.name), toast, isHost });
  if (d.st === "end") endBox(st, d, G, isHost);
}

function waitRoom(st, d, G, me, isHost) {
  const n = d.seats.length, link = location.origin + url(code);
  st.innerHTML = `<div class="lobbywait">
    <p class="big">방 코드 <b>${esc(code)}</b></p>
    <p>${G.name}, ${G.min}~${G.max}명. 지금 ${n}명이에요.</p>
    <div class="row"><button class="share">초대 링크 보내기</button>${isHost ? `<button class="ghost addbot" ${n >= G.max ? "disabled" : ""}>봇 넣기</button>` : ""}</div>
    <ol class="wlist">${d.seats.map((x, i) => `<li style="--s:${SEAT[i]}"><b>${esc(x.name)}</b>${x.bot ? "<small>봇</small>" : ""}${isHost && i > 0 ? `<button class="ghost kick" data-i="${i}">빼기</button>` : ""}</li>`).join("")}</ol>
    ${isHost ? `<div class="row">${Object.entries(GAMES).map(([g, X]) => `<button class="ghost gsel${g === d.g ? " sel" : ""}" data-g="${g}">${X.name}</button>`).join("")}</div>
      <button class="go" ${n < G.min || n > G.max ? "disabled" : ""}>시작하기</button>` : `<p class="dim">방장이 시작하면 바로 판이 열려요.</p>`}
    ${me < 0 && d.seats.length >= G.max ? `<p class="dim">자리가 다 찼어요. 구경만 할 수 있어요.</p>` : ""}
    <p class="dim small">링크: ${esc(link)}</p>
  </div>`;
  st.querySelector(".share").onclick = share;
  if (!isHost) return;
  st.querySelector(".addbot").onclick = () => host.addBot();
  st.querySelectorAll(".kick").forEach(b => b.onclick = () => host.kick(+b.dataset.i));
  st.querySelectorAll(".gsel").forEach(b => b.onclick = () => host.again(b.dataset.g));
  st.querySelector(".go").onclick = () => host.start();
}

function endBox(st, d, G, isHost) {
  const r = typeof d.res === "string" ? JSON.parse(d.res) : d.res;
  const box = document.createElement("div");
  box.className = "endbox";
  box.innerHTML = `<h2>${esc(r.text || "끝")}</h2>
    <ol>${r.rank.map(([s, sc]) => `<li style="--s:${SEAT[s]}"><b>${esc(d.seats[s]?.name)}</b><span>${esc(sc ?? "")}</span></li>`).join("")}</ol>
    ${isHost ? `<div class="row"><button class="again">같은 사람들로 다시</button><button class="ghost back">방으로</button></div>` : `<p class="dim">방장이 다음 판을 열 거예요.</p>`}
    <button class="ghost peek">판 보기</button>`;
  st.appendChild(box);
  box.querySelector(".peek").onclick = () => box.classList.toggle("min");
  if (isHost) {
    box.querySelector(".again").onclick = () => host.start();
    box.querySelector(".back").onclick = () => host.again();
  }
}

async function share() {
  const link = location.origin + url(code);
  const G = GAMES[room?.g];
  try {
    if (navigator.share) await navigator.share({ title: "주사위섬 " + (G?.name || ""), text: `주사위섬 ${G?.name || ""} 방 ${code}`, url: link });
    else { await navigator.clipboard.writeText(link); toast("링크를 복사했어요"); }
  } catch {}
}

addEventListener("popstate", () => route());
function route() {
  const U = new URLSearchParams(location.search), c = U.get("r");
  LOCAL = U.has("local") || !netFire; net = LOCAL ? netLocal : netFire;
  if (c && /^[A-Z0-9]{4}$/.test(c)) {
    if (c !== code) { host?.off?.(); host = null; enter(c); }
  } else lobby();
}

(async () => {
  keys = await myKeys();
  netLocal = localNet();
  if (!Q.has("local")) try { netFire = await fireNet(); } catch (e) { toast("인터넷 방에 못 붙어서 이 기기 안에서만 돌아요"); }
  route();
})();
