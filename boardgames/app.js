// 주사위섬 보드게임방 — 첫 화면, 방, 방장 진행 — 만든 사람: Claude (사용자 김창식 요청, 2026-11-26)
// 방장 폰이 판 전체를 들고 규칙을 돌린다. 다른 사람은 act로 하고 싶은 것을 보내고, 방 문서에서 자기 몫(잠긴 것)을 풀어 본다.
// 11-26 밤: 닉네임 따로, 나가기, 방장 메뉴(다시 시작, 대기실, 구경꾼 자리, 방 닫기), 판 중간에 온 사람은 구경꾼, 게임마다 규칙 설명
import { esc, myKeys, sharedKey, seal, open, myPid, getName, setName, SEAT } from "./lib.js";
import { fireNet, localNet } from "./net.js";
import { RULES } from "./rules.js";
import vault from "./g/vault.js";
import crab from "./g/crab.js";
import bell from "./g/bell.js";
import gems from "./g/gems.js";
import isle from "./g/isle.js";
import cow from "./g/cow.js";
import codeG from "./g/code.js";
import tele from "./g/tele.js";
import castle from "./g/castle.js";
import fire from "./g/fire.js";
import tile from "./g/tile.js";
import lastG from "./g/last.js";
import rank from "./g/rank.js";
import bug from "./g/bug.js";
import race from "./g/race.js";
import yacht from "./g/yacht.js";
import duel from "./g/duel.js";
import nope from "./g/nope.js";
import omok from "./g/omok.js";
import vegas from "./g/vegas.js";
import five from "./g/five.js";
import odd from "./g/odd.js";
import yut from "./g/yut.js";
import mosaic from "./g/mosaic.js";
import gostop from "./g/gostop.js";
import mapG from "./g/map.js";

export const GAMES = { isle, bell, crab, gems, vault, cow, code: codeG, tele, castle, fire, tile, last: lastG, rank, bug, race, yacht, duel, nope, omok, vegas, five, odd, yut, mosaic, gostop, map: mapG };
// 비밀이 큰 게임(그림 전화)은 공개 칸과 내 몫(secret)을 나눠 보내고, 받는 쪽에서 합친다
const viewFor = (G, s, seat) => G.secret ? { ...G.view(s, -1), ...G.secret(s, seat) } : G.view(s, seat);
const $ = s => document.querySelector(s);
const app = $("#app");
const Q = new URLSearchParams(location.search);
let LOCAL = Q.has("local");
const ME = myPid();
let net, netFire = null, netLocal = null, keys, host = null, unwatch = null, room = null, code = null;
let gen = 0; // 첫 화면이나 다른 방으로 가면 늘어남. 늦게 도착한 옛 방 그리기는 버린다

const CODECH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from({ length: 4 }, () => CODECH[Math.floor(Math.random() * CODECH.length)]).join("");
const url = c => location.pathname + "?" + (LOCAL ? "local&" : "") + "r=" + c;

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600);
}
// 페이지 안 확인 창 (브라우저 confirm 대신)
function sheet(html, bind) {
  document.querySelector(".appsheet")?.remove();
  const el = document.createElement("div");
  el.className = "sheet appsheet";
  el.innerHTML = `<div class="in">${html}<button class="ghost x">닫기</button></div>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  el.querySelector(".x").onclick = close;
  el.onclick = e => { if (e.target === el) close(); };
  bind?.(el, close);
  return el;
}

// ───────── 방장 ─────────
class Host {
  constructor(c, s) {
    this.c = c; this.s = s; this.s.watch = this.s.watch || {}; this.ver = s.ver || 0; this.timers = []; this.busy = Promise.resolve();
    this.off = net.acts(c, a => this.onAct(a));
  }
  static fresh(c, g) {
    return new Host(c, { g, st: "wait", seats: [{ pid: ME, name: getName(), pub: keys.pub }], gs: null, res: null, ver: 0, watch: {} });
  }
  get G() { return GAMES[this.s.g]; }
  seatOf(pid) { return this.s.seats.findIndex(x => x.pid === pid); }
  onAct(a) {
    const s = this.s;
    if (s.closed) return;
    if (a.k === "join") {
      const i = this.seatOf(a.pid);
      if (i >= 0) { s.seats[i].name = a.name; s.seats[i].pub = a.pub; }
      else if (s.st === "wait" && s.seats.length < this.G.max) { s.seats.push({ pid: a.pid, name: a.name, pub: a.pub }); delete s.watch[a.pid]; }
      else s.watch[a.pid] = { name: a.name, pub: a.pub };
      return this.publish();
    }
    if (a.k === "leave") {
      delete s.watch[a.pid];
      const i = this.seatOf(a.pid);
      if (i > 0) {
        if (s.st === "wait") s.seats.splice(i, 1);
        else { const x = s.seats[i]; x.bot = true; x.pid = "bot" + Math.random().toString(36).slice(2, 7); x.name = x.name + "(봇)"; x.pub = null; }
        if (s.st !== "wait") s.info = { ...(s.info || {}), note: `${a.name || "누군가"}이(가) 나가서 봇이 이어 해요` };
      }
      return this.publish();
    }
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
    if (this.G.party) return toast("말로 하는 게임이라 봇을 넣을 수 없어요");
    const used = new Set(s.seats.map(x => x.name));
    const name = BOTNAMES.find(n => !used.has(n)) || "봇";
    s.seats.push({ pid: "bot" + Math.random().toString(36).slice(2, 7), name, bot: true });
    this.publish();
  }
  kick(i) { if (i > 0 && this.s.st === "wait") { this.s.seats.splice(i, 1); this.publish(); } }
  // 구경꾼을 판 중간에 자리에 앉힌다(봇이나 나간 사람 자리)
  seatWatcher(pid, i) {
    const s = this.s, w = s.watch[pid], x = s.seats[i];
    if (!w || !x || i === 0) return;
    if (!x.bot) s.watch[x.pid] = { name: x.name, pub: x.pub };
    s.seats[i] = { pid, name: w.name, pub: w.pub };
    delete s.watch[pid];
    s.info = { ...(s.info || {}), note: `${w.name}이(가) ${x.name.replace("(봇)", "")} 자리를 이어받았어요` };
    this.publish();
  }
  start() {
    const s = this.s, n = s.seats.length;
    if (n < this.G.min || n > this.G.max) return toast(`${this.G.name}은 ${this.G.min}~${this.G.max}명이 해요`);
    s.gs = this.G.setup(n, Math.random, { now: Date.now() }); s.st = "play"; s.res = null; s.err = null; s.info = null;
    this.publish();
  }
  again() {
    const s = this.s;
    s.st = "wait"; s.gs = null; s.res = null; s.info = null;
    while (s.seats.length > this.G.max) s.seats.pop();
    // 기다리던 구경꾼부터 빈자리에(봇 자리도 사람에게 먼저)
    for (const [pid, w] of Object.entries(s.watch)) {
      const bi = s.seats.findIndex((x, i) => i > 0 && x.bot);
      if (s.seats.length < this.G.max) s.seats.push({ pid, name: w.name, pub: w.pub });
      else if (bi > 0) s.seats[bi] = { pid, name: w.name, pub: w.pub };
      else continue;
      delete s.watch[pid];
    }
    this.publish();
  }
  close() { this.s.closed = true; this.publish(); }
  async publish() {
    const s = this.s; s.ver = ++this.ver;
    try { localStorage.setItem("bg-host:" + this.c, JSON.stringify(s)); } catch {}
    this.schedule();
    const G = this.G;
    // err 칸 하나에 오류, 구경꾼, 알림, 방 닫힘을 같이 담는다(파이어스토어 규칙의 칸 목록을 바꾸지 않으려고)
    const info = { e: s.err || null, w: Object.entries(s.watch).map(([pid, w]) => ({ pid, name: w.name })), note: s.info?.note || null, closed: !!s.closed };
    const doc = {
      g: s.g, host: ME, hpub: keys.pub, st: s.st, ver: s.ver, res: s.res ? JSON.stringify(s.res) : null, err: info,
      seats: s.seats.map(x => ({ pid: x.pid, name: x.name, bot: !!x.bot, pub: x.pub || null })),
      pub: s.gs ? JSON.stringify(G.view(s.gs, -1)) : null, priv: {} // 파이어스토어는 배열 속 배열을 못 담아서 글자로
    };
    if (s.gs) for (const [i, x] of s.seats.entries()) {
      if (x.bot || x.pid === ME || !x.pub) continue;
      doc.priv[x.pid] = await seal(await sharedKey(keys.priv, x.pub), G.secret ? G.secret(s.gs, i) : G.view(s.gs, i));
    }
    const ver = s.ver;
    this.busy = this.busy.then(() => ver === this.ver ? net.write(this.c, doc) : null).catch(e => toast("저장이 안 돼요: " + e.message));
    show(doc);
  }
  schedule() {
    this.timers.forEach(clearTimeout); this.timers = [];
    const s = this.s, G = this.G;
    if (s.st !== "play" || s.closed) return;
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
// 주사위섬의 장소마다 게임 하나
const PLACES = [
  ["isle", "개척지", "섬 안쪽 빈 땅"], ["bell", "시장", "부두 옆 과일 골목"], ["crab", "해변", "섬 남쪽 모래밭"],
  ["gems", "항구", "배가 드나드는 상회 거리"], ["vault", "등대", "섬 끝 바위 위"],
  ["cow", "목장", "언덕 위 소 우리"], ["last", "대합실", "배 기다리는 선착장 의자"], ["yacht", "주막", "부두 앞 주사위 소리 나는 집"],
  ["bug", "갯벌", "물 빠진 바닷가"], ["rank", "옛 궁궐", "섬 한가운데 낡은 궁궐"], ["fire", "광장", "여름밤 축제 자리"],
  ["tile", "찻집", "골목 안 조용한 가게"], ["race", "운동장", "섬 학교 마당"], ["duel", "해적선", "앞바다에 닻 내린 배"],
  ["castle", "성터", "바위 언덕 옛 성"], ["code", "망루", "섬 꼭대기 망보는 탑"], ["tele", "우체국", "편지 오가는 작은 집"],
  ["nope", "어시장", "새벽 생선 경매"], ["omok", "정자", "마을 어귀 느티나무 아래"], ["vegas", "선술집 거리", "주사위 소리 나는 골목"],
  ["yut", "마당", "이장님 댁 앞마당"], ["gostop", "사랑방", "할머니 댁 아랫목"], ["mosaic", "공방", "조개껍데기 모자이크 가게"],
  ["map", "지도방", "섬 지도를 그리는 방"], ["five", "교실", "섬 분교"], ["odd", "파출소", "섬에 하나뿐인 경찰서"]
];
let want = 0; // 첫 화면 인원 거르기 (0 = 전부)
try { want = +sessionStorage.getItem("bg-want") || 0; } catch {}

function nickSheet(after) {
  sheet(`<p>닉네임</p><input class="nickin" maxlength="10" value="${esc(getName())}" placeholder="친구들에게 보일 이름" autocomplete="nickname"><button class="ok">저장</button>`, (el, close) => {
    const inp = el.querySelector(".nickin"); inp.focus(); inp.select();
    const ok = () => { const n = inp.value.trim(); if (!n) return toast("한 글자 이상 적어 주세요"); setName(n); close(); after?.(n); };
    el.querySelector(".ok").onclick = ok;
    inp.onkeydown = e => { if (e.key === "Enter") ok(); };
  });
}

function lobby() {
  gen++;
  if (unwatch) { unwatch(); unwatch = null; }
  host?.off?.(); host = null; room = null; code = null;
  document.querySelector(".appsheet")?.remove();
  document.title = "주사위섬 보드게임방";
  app.className = "lobby";
  const nick = getName();
  app.innerHTML = `
  <header class="top">
    <img src="art/island.webp" alt="주사위섬 지도: 등대, 항구, 해변, 옛 궁궐, 성터, 목장, 갯벌과 앞바다의 해적선">
    <div class="tt"><h1>주사위섬</h1>
    <p>친구들과 각자 폰으로 같은 방에 들어와 해요. 방을 만들고 코드나 링크를 보내 주세요.</p></div>
  </header>
  <div class="nick"><span>닉네임</span><b>${nick ? esc(nick) : "아직 없음"}</b><button class="ghost nickb">${nick ? "바꾸기" : "정하기"}</button></div>
  <form class="join" id="joinF">
    <label>방 코드로 들어가기<input id="cd" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off"></label>
    <button>들어가기</button>
  </form>
  <div class="want" role="group" aria-label="모인 사람 수"><span>몇 명이에요?</span>${[0, 2, 3, 4, 5, 6, 7, 8].map(k => `<button class="${want === k ? "on" : ""}" data-want="${k}">${k ? (k === 8 ? "8명 이상" : k + "명") : "전부"}</button>`).join("")}</div>
  <ol class="places">${PLACES.map(([g, place, where]) => {
    const G = GAMES[g], fit = !want || (G.min <= want && (want === 8 ? G.max >= 8 : G.max >= want));
    return `<li style="--c:${G.color}" ${fit ? "" : "hidden"}>
      <div class="pl"><b>${place}</b><small>${where}</small></div>
      <div class="gm"><h2>${G.name}</h2><p>${G.sub}</p><span>${G.min}~${G.max}명, ${G.time}${G.party ? ", 사람끼리만" : ""}</span></div>
      <div class="bt"><button data-make="${g}">방 만들기</button>${G.party ? "" : `<button class="ghost" data-solo="${g}">봇이랑 혼자</button>`}<button class="ghost" data-rule="${g}">규칙</button></div>
    </li>`;
  }).join("")}</ol>
  ${LOCAL ? `<p class="note">이 브라우저 안에서만 도는 시험 모드예요.</p>` : ""}`;
  app.querySelector(".nickb").onclick = () => nickSheet(() => lobby());
  app.querySelectorAll("[data-want]").forEach(b => b.onclick = () => { want = +b.dataset.want; try { sessionStorage.setItem("bg-want", want); } catch {} lobby(); });
  app.querySelectorAll("[data-rule]").forEach(b => b.onclick = () => showRules(b.dataset.rule));
  const withNick = fn => getName() ? fn() : nickSheet(() => { lobby(); fn(); });
  $("#joinF").onsubmit = e => {
    e.preventDefault();
    const c = $("#cd").value.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(c)) return toast("방 코드 4자리를 적어 주세요");
    withNick(() => go(c));
  };
  app.querySelectorAll("[data-make]").forEach(b => b.onclick = () => withNick(async () => {
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
  }));
  app.querySelectorAll("[data-solo]").forEach(b => b.onclick = () => withNick(() => {
    const g = b.dataset.solo, G = GAMES[g];
    LOCAL = true; net = netLocal; const c = newCode();
    host = Host.fresh(c, g);
    for (let i = 1; i < Math.min(G.max, Math.max(G.min, G.solo || 3)); i++) host.addBot();
    history.pushState(null, "", url(c)); enter(c);
    host.start();
  }));
}

// 규칙 설명: 처음 들어온 게임이면 저절로, 그다음엔 '규칙' 단추로
function showRules(g, auto) {
  const G = GAMES[g], R = RULES[g] || [];
  if (auto) { try { if (localStorage.getItem("bg-rule:" + g)) return; localStorage.setItem("bg-rule:" + g, "1"); } catch {} }
  let i = 0;
  const el = sheet("", () => {});
  el.classList.add("rules");
  const paint = () => {
    el.querySelector(".in").innerHTML = `<p class="rt" style="--c:${G.color}">${esc(G.name)} <small>${G.min}~${G.max}명, ${G.time}</small></p>
      <div class="rstep"><b>${i + 1}/${R.length}</b><p>${R[i]}</p></div>
      <div class="row"><button class="ghost prev" ${i ? "" : "disabled"}>앞으로</button><button class="next">${i === R.length - 1 ? "알겠어요" : "다음"}</button></div>`;
    el.querySelector(".prev").onclick = () => { i--; paint(); };
    el.querySelector(".next").onclick = () => { if (i === R.length - 1) el.remove(); else { i++; paint(); } };
  };
  paint();
}

// ───────── 화면: 방 ─────────
function go(c) { history.pushState(null, "", url(c)); enter(c); }

function enter(c) {
  gen++;
  code = c;
  app.className = "room";
  delete app.dataset.g;
  app.innerHTML = `<div class="wait"><p>방 ${esc(c)}에 들어가는 중이에요</p></div>`;
  if (unwatch) unwatch();
  let first = true;
  unwatch = net.watch(c, d => {
    if (host) return; // 방장은 publish에서 바로 그림
    if (!d) { app.innerHTML = `<div class="wait"><p>방 ${esc(c)}이 없어요. 코드를 다시 확인해 주세요.</p><button class="goh">첫 화면으로</button></div>`; app.querySelector(".goh").onclick = leaveRoom; return; }
    if (d.host === ME && !host) {
      let s = null; try { s = JSON.parse(localStorage.getItem("bg-host:" + c) || "null"); } catch {}
      if (s && !s.closed) { host = new Host(c, s); host.publish(); return; }
    }
    if (first && !d.seats.some(x => x.pid === ME)) {
      if (!getName()) return nickSheet(() => enter(c));
      net.send(c, { k: "join", pid: ME, name: getName(), pub: keys.pub });
    }
    first = false;
    show(d);
  }, e => toast("연결이 안 돼요: " + e.message));
}

// 나가기: 방장에게 알리고 첫 화면으로. 방장이면 방을 닫는다
function leaveRoom() {
  const c = code;
  if (host && c) host.close();
  else if (c && room) net.send(c, { k: "leave", pid: ME, name: getName() }).catch(() => {});
  history.pushState(null, "", location.pathname + (Q.has("local") ? "?local" : ""));
  route();
}

let showing = Promise.resolve();
function show(d) { const g = gen; showing = showing.then(() => g === gen ? draw(d) : null).catch(e => console.error(e)); }

async function draw(d) {
  const g0 = gen;
  room = d;
  const G = GAMES[d.g], me = d.seats.findIndex(x => x.pid === ME), isHost = d.host === ME;
  const info = d.err && "w" in d.err ? d.err : { e: d.err || null, w: [] };
  if (info.closed && !isHost) { app.innerHTML = `<div class="wait"><p>방장이 방을 닫았어요.</p><button class="goh">첫 화면으로</button></div>`; app.querySelector(".goh").onclick = leaveRoom; unwatch?.(); return; }
  let v = null;
  if (d.st !== "wait") {
    const pub = typeof d.pub === "string" ? JSON.parse(d.pub) : d.pub;
    if (isHost && host?.s.gs) v = viewFor(G, host.s.gs, me);
    else if (me >= 0 && d.priv?.[ME]) {
      try { const mine = await open(await sharedKey(keys.priv, d.hpub), d.priv[ME]); v = G.secret ? { ...pub, ...mine } : mine; } catch (e) { console.warn("내 몫을 못 풀었어요", e); v = pub; }
    } else v = pub;
  }
  if (room !== d || g0 !== gen) return;
  document.title = `${G.name} - 주사위섬`;
  if (!app.querySelector(".bar") || app.dataset.g !== d.g) {
    app.dataset.g = d.g;
    app.innerHTML = `<div class="bar" style="--c:${G.color}">
      <button class="out" aria-label="방에서 나가기">나가기</button>
      <b class="gname"></b>
      <button class="rule">규칙</button>
      <button class="code" title="초대 링크 보내기"></button>
    </div><div class="seats"></div><div class="banner" hidden></div><div class="stage"></div>`;
    app.querySelector(".out").onclick = () => sheet(`<p>${host ? "방을 닫고 나갈까요? 다른 사람들도 방에서 나가게 돼요." : room?.st === "play" ? "나갈까요? 내 자리는 봇이 이어서 해요." : "방에서 나갈까요?"}</p><button class="yes">나가기</button>`, (el, close) => { el.querySelector(".yes").onclick = () => { close(); leaveRoom(); }; });
    app.querySelector(".code").onclick = share;
    app.querySelector(".rule").onclick = () => showRules(room.g);
  }
  if (d.st === "play") showRules(d.g, true); // 이 게임을 처음 하는 기기면 한 번
  app.querySelector(".gname").textContent = G.name;
  app.querySelector(".code").textContent = code;
  const bar = app.querySelector(".bar");
  if (isHost && !bar.querySelector(".hostb")) { const b = document.createElement("button"); b.className = "hostb"; b.textContent = "방장"; b.onclick = hostMenu; bar.insertBefore(b, bar.querySelector(".code")); }
  // 이름표: 닉네임과 점수를 나눠 보이고, 내 이름을 누르면 닉네임 바꾸기
  const turn = v && d.st === "play" ? v.turn || [] : [];
  app.querySelector(".seats").innerHTML = d.seats.map((x, i) => { const b = v && G.badge ? G.badge(v, i) : ""; return `<span class="${turn.includes(i) ? "on" : ""}${i === me ? " me" : ""}" style="--s:${SEAT[i]}" ${i === me ? 'data-me="1" title="눌러서 닉네임 바꾸기"' : ""}><b>${esc(x.name)}</b>${b ? `<em>${esc(b)}</em>` : ""}</span>`; }).join("")
    + (info.w.length ? `<span class="watch">구경 ${info.w.length}</span>` : "");
  app.querySelector(".seats [data-me]")?.addEventListener("click", () => nickSheet(n => { if (isHost) { host.s.seats[0].name = n; host.publish(); } else net.send(code, { k: "join", pid: ME, name: n, pub: keys.pub }); }));
  const banner = app.querySelector(".banner");
  const note = me < 0 && d.st !== "wait" ? "구경하는 중이에요. 판이 끝나면 다음 판에 자리를 받고, 방장이 빈자리를 넘겨줄 수도 있어요." : info.note;
  banner.hidden = !note; banner.textContent = note || "";
  const st = app.querySelector(".stage");
  if (d.st === "wait") { st.dataset.sig = ""; return waitRoom(st, d, G, me, isHost, info); }
  const e = info.e;
  if (e && e.pid === ME && e.n !== draw.errN) { draw.errN = e.n; toast(e.msg); }
  const send = a => {
    if (me < 0) return toast("구경 중이라 둘 수 없어요");
    if (isHost) host.move(me, a, ME);
    else net.send(code, { k: "move", pid: ME, a });
  };
  st.classList.toggle("over", d.st === "end");
  // 내 화면에 바뀐 게 없으면 다시 그리지 않는다(다시 그리는 순간 누른 단추가 씹히지 않게)
  const sig = JSON.stringify([d.g, d.st, me, d.seats.map(x => x.name), v]);
  if (sig === st.dataset.sig && d.st !== "end") return;
  st.dataset.sig = sig;
  // 둘러앉은 순서: 내 자리부터 시계 방향(구경꾼은 방장 자리부터)
  const order = d.seats.map((_, k) => ((me < 0 ? 0 : me) + k) % d.seats.length);
  const before = rects(st);
  G.render(st, v, me, send, { names: d.seats.map(x => x.name), toast, isHost, order });
  animate(st, before);
  // 진행 기록은 맨 아래 한 줄, 누르면 펼침
  const lg = st.querySelector(".log");
  if (lg) { lg.classList.toggle("open", !!draw.logOpen); lg.onclick = () => { draw.logOpen = !draw.logOpen; lg.classList.toggle("open", draw.logOpen); }; }
  if (d.st === "end") endBox(st, d, G, isHost);
}

// 움직임: data-k가 같은 것은 옛 자리에서 새 자리로 미끄러지고(FLIP), 처음 나온 것은 튀어나온다.
// data-anim="flip"이면 카드 뒤집기, "drop"이면 위에서 떨어지기. 게임 render는 data-k만 붙이면 된다.
function rects(root) {
  const m = new Map();
  root.querySelectorAll("[data-k]").forEach(e => m.set(e.dataset.k, e.getBoundingClientRect()));
  return m;
}
function animate(root, before) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !before.size) { root.querySelectorAll("[data-k]").forEach(e => e.classList.add("seen")); return; }
  root.querySelectorAll("[data-k]").forEach(e => {
    const old = before.get(e.dataset.k), now = e.getBoundingClientRect();
    if (old) {
      let dx = old.left - now.left, dy = old.top - now.top;
      if (e instanceof SVGElement) { const m = (e.ownerSVGElement || e).getScreenCTM(); if (m) { dx /= m.a; dy /= m.d; } } // SVG 안은 판 좌표로
      if (Math.abs(dx) + Math.abs(dy) > 0.01 && now.width) {
        e.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    } else {
      const kind = e.dataset.anim || "pop";
      const K = { pop: [{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.08)", opacity: 1, offset: .7 }, { transform: "none" }],
        flip: [{ transform: "perspective(600px) rotateY(180deg)", filter: "brightness(.6)" }, { transform: "perspective(600px) rotateY(90deg)", filter: "brightness(.8)", offset: .5 }, { transform: "none" }],
        drop: [{ transform: "translateY(-40px) scale(1.15)", opacity: 0 }, { transform: "translateY(4px)", opacity: 1, offset: .75 }, { transform: "none" }],
        slide: [{ transform: "translateY(60px)", opacity: 0 }, { transform: "none", opacity: 1 }] }[kind] || [];
      e.animate(K, { duration: kind === "flip" ? 420 : 320, easing: "ease-out" });
    }
  });
}

function hostMenu() {
  const s = host?.s; if (!s) return;
  const W = Object.entries(s.watch);
  const seatsFor = s.seats.map((x, i) => [x, i]).filter(([x, i]) => i > 0);
  sheet(`<p>방장 메뉴</p>
    ${s.st !== "wait" ? `<button class="m-restart">처음부터 다시 하기</button><button class="ghost m-wait">대기실로 돌아가기</button>` : ""}
    ${W.length ? `<p class="small">구경하는 사람</p>${W.map(([pid, w]) => `<div class="wrow"><b>${esc(w.name)}</b>${s.st === "play" ? seatsFor.map(([x, i]) => `<button class="ghost m-seat" data-pid="${pid}" data-i="${i}">${esc(x.name)} 자리에</button>`).join("") : "<small>다음 판에 들어가요</small>"}</div>`).join("")}` : ""}
    <button class="ghost m-close">방 닫기</button>`, (el, close) => {
    el.querySelector(".m-restart")?.addEventListener("click", () => sheet(`<p>지금 판을 버리고 처음부터 다시 할까요?</p><button class="yes">다시 하기</button>`, (e2, c2) => { e2.querySelector(".yes").onclick = () => { c2(); host.start(); }; }));
    el.querySelector(".m-wait")?.addEventListener("click", () => { close(); host.again(); });
    el.querySelectorAll(".m-seat").forEach(b => b.onclick = () => { close(); host.seatWatcher(b.dataset.pid, +b.dataset.i); });
    el.querySelector(".m-close").onclick = () => sheet(`<p>방을 닫을까요? 모두 첫 화면으로 돌아가요.</p><button class="yes">방 닫기</button>`, (e2, c2) => { e2.querySelector(".yes").onclick = () => { c2(); leaveRoom(); }; });
  });
}

function waitRoom(st, d, G, me, isHost, info) {
  const n = d.seats.length, R = RULES[d.g] || [];
  st.innerHTML = `<div class="lobbywait">
    <p class="wtitle" style="--c:${G.color}">${esc(G.name)}<small>${G.min}~${G.max}명</small></p>
    <p class="big">방 코드 <b>${esc(code)}</b></p>
    <div class="row"><button class="share">초대 링크 보내기</button>${isHost && !G.party ? `<button class="ghost addbot" ${n >= G.max ? "disabled" : ""}>봇 넣기</button>` : ""}</div>
    <p class="wcount">들어온 사람 ${n}/${G.max}${n < G.min ? `, ${G.min - n}명 더 오면 시작할 수 있어요` : ""}</p>
    <ol class="wlist">${d.seats.map((x, i) => `<li style="--s:${SEAT[i]}" class="${i === me ? "me" : ""}"><b>${esc(x.name)}</b>${i === 0 ? "<small>방장</small>" : x.bot ? "<small>봇</small>" : ""}${isHost && i > 0 ? `<button class="ghost kick" data-i="${i}">빼기</button>` : ""}</li>`).join("")}
      ${Array.from({ length: Math.max(0, G.min - n) }, () => `<li class="empty"><b>기다리는 중</b></li>`).join("")}</ol>
    ${info.w.length ? `<p class="dim small">자리가 다 차서 구경하는 사람: ${info.w.map(w => esc(w.name)).join(", ")}</p>` : ""}
    ${isHost ? `<button class="go" ${n < G.min || n > G.max ? "disabled" : ""}>시작하기</button>` : `<p class="dim">방장이 시작하면 바로 판이 열려요.</p>`}
    <div class="wrules"><p>어떻게 해요?</p><ol>${R.map(r => `<li>${r}</li>`).join("")}</ol></div>
  </div>`;
  st.querySelector(".share").onclick = share;
  if (!isHost) return;
  st.querySelector(".addbot")?.addEventListener("click", () => host.addBot());
  st.querySelectorAll(".kick").forEach(b => b.onclick = () => host.kick(+b.dataset.i));
  st.querySelector(".go").onclick = () => host.start();
}

function endBox(st, d, G, isHost) {
  const r = typeof d.res === "string" ? JSON.parse(d.res) : d.res;
  const box = document.createElement("div");
  box.className = "endbox";
  box.innerHTML = `<h2>${esc(r.text || "끝")}</h2>
    <ol>${r.rank.map(([s, sc]) => `<li style="--s:${SEAT[s]}"><b>${esc(d.seats[s]?.name)}</b><span>${esc(sc ?? "")}</span></li>`).join("")}</ol>
    ${isHost ? `<div class="row"><button class="again">같은 사람들로 다시</button><button class="ghost back">대기실로</button></div>` : `<p class="dim">방장이 다음 판을 열 거예요.</p>`}
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
