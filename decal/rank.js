// 데칼코마니 순위 — 만든 사람: Claude (사용자 김창식 요청, 2026-11-11)
// 저장: Firebase(게임 전용 프로젝트 changupsil-games)의 게임 칸 gameuser·gamename·decal
// 누가 무엇을 할 수 있는지는 Firestore 규칙이 정한다: 구글 로그인 + 게임 닉네임, 한 판 끝날 때 한 번(100초 간격),
// 순위 칸은 같이 저장한 판 기록과 점수가 같아야 하고 더 높을 때만 바뀜. 구글 이름·이메일은 저장하지 않음
// 11-12: 이름 바꾸기(전 닉네임은 이름 옆에 옅게) · 계정 삭제(닉네임·판 기록·랭킹 칸·구글 로그인 계정까지)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, connectAuthEmulator, reauthenticateWithPopup, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, connectFirestoreEmulator, collection, doc, getDoc, getDocs, getCount, query, where, orderBy, limit,
  writeBatch, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";

const app = initializeApp({
  apiKey: "AIzaSyDV8DhPAFyWoOHUanZ6RLLWuvZZzWB2hjg",
  authDomain: "changupsil-games.firebaseapp.com",
  projectId: "changupsil-games",
  appId: "1:888585396327:web:c53163e6006370c258f4c2"
});
const auth = getAuth(app), db = getFirestore(app);
// 내 노트북 테스트용: 127.0.0.1/decal/?emu 로 열면 로컬 에뮬레이터에 붙는다
if (location.hostname === "127.0.0.1" && location.search.includes("emu")) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const MODES = { easy: "쉬움", normal: "보통" };
const RESERVED = ["운영자", "관리자", "운영진", "admin", "administrator"];
const NET = "연결이 안 돼요. 잠시 뒤 다시 해 주세요.";
// 한국 날짜(규칙과 같은 계산)
const today = () => { const d = new Date(Date.now() + 9 * 36e5); return "d" + d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) };
const when = ts => { const d = ts.toDate(); return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` };
const listRef = (m, l) => collection(db, "decal", m, l);
// 이름 + 옅은 전 닉네임
const nm = (name, prev) => esc(name) + (prev ? ` <small class="rk-prev">전 ${esc(prev)}</small>` : "");
const whoAttr = (uid, x) => `data-who="${uid}" data-name="${esc(x.name)}" data-prev="${esc(x.prev || "")}"`;
// 카카오톡 안 브라우저는 구글이 로그인을 막는다 → 바깥 브라우저로 다시 열기
const inKakao = /KAKAOTALK/i.test(navigator.userAgent);

let me = null;        // { uid, name, prev, admin }
let pending = null;   // 로그인 전에 끝난 판 { mode, score, t }
let lastRes = null;   // 방금 저장한 판 { mode } — 끝 화면 '랭킹'이 그 모드로 열림
let view = { mode: "easy", list: "day" };
let renaming = false; // 내 줄이 이름 바꾸기 칸으로
let bye = "";         // 계정을 지운 뒤 로그인 칸에 남길 한 줄

/* ---------- 로그인 ---------- */
async function login() {
  if (inKakao) { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(location.href); return; }
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { if (!/popup-closed|cancelled-popup/.test(e?.code)) note("로그인하지 못했어요. 팝업 차단을 풀고 다시 해 주세요."); }
}
const note = msg => { const n = $("rk-note"); if (n) n.textContent = msg; };

onAuthStateChanged(auth, async u => {
  me = null;
  if (u) {
    bye = "";
    me = { uid: u.uid };
    // 운영자만 읽을 수 있는 자리 — 읽히면 운영자
    me.admin = await getDoc(doc(db, "gameadmin", "check")).then(() => true, () => false);
    const d = await getDoc(doc(db, "gameuser", u.uid)).catch(() => null);
    if (d?.exists()) { me.name = d.data().name; me.prev = d.data().prev || ""; }
    if (me.name) { await syncBest(); await savePending(); }
  }
  renaming = false;
  mountOv();
  if (!$("rk").hidden) drawSheet();
});

// 다른 기기에서 낸 최고 점수를 이 기기 '최고'에도 (게임 쪽 localStorage)
async function syncBest() {
  for (const m of Object.keys(MODES)) {
    const d = await getDoc(doc(db, "decal", m, "best", me.uid)).catch(() => null);
    const s = d?.exists() ? d.data().score : 0;
    try { if (s > (+localStorage.getItem(KEY[m]) || 0)) localStorage.setItem(KEY[m], s) } catch {}
  }
  if (!playing) loadBest();
}

/* ---------- 저장: 판 기록 + 마지막 시각 + 순위 칸(전체·오늘, 더 높을 때만) ---------- */
async function save(m, score) {
  const g = doc(collection(db, "gameuser", me.uid, "decal")), day = today();
  const [all, td] = await Promise.all(["best", day].map(l => getDoc(doc(db, "decal", m, l, me.uid)).then(d => d.exists() ? d.data().score : 0)));
  const commit = withDay => {
    const b = writeBatch(db), row = { name: me.name, ...(me.prev ? { prev: me.prev } : {}), score, at: serverTimestamp(), g: g.id };
    b.set(g, { mode: m, score, at: serverTimestamp() });
    b.update(doc(db, "gameuser", me.uid), { lt: serverTimestamp() });
    if (score > all) b.set(doc(db, "decal", m, "best", me.uid), row);
    if (withDay && score > td) b.set(doc(db, "decal", m, day, me.uid), row);
    return b.commit();
  };
  // 기기 시계가 틀려 '오늘' 칸이 막히면 전체 순위만이라도 남긴다
  try { await commit(true); } catch (e) { if (e?.code !== "permission-denied") throw e; await commit(false); }
  lastRes = { mode: m };
}
async function savePending() {
  if (!pending || !me?.name) return;
  const p = pending; pending = null;
  if (Date.now() - p.t > 10 * 60e3) return;
  ovState = "saving"; mountOv();
  try { await save(p.mode, p.score); ovState = "saved"; }
  catch { ovState = "fail"; }
  mountOv();
}

/* ---------- 판 위 덮개(시작·끝 화면) 한 줄 ---------- */
let ovState = "";   // "", saving, saved, fail, guest
function mountOv() {
  const box = $("ov-rk"); if (!box) return;
  let s = "";
  if (ovState === "saving") s = `<span>저장 중…</span>`;
  else if (ovState === "fail") s = `<span>저장하지 못했어요</span> <button class="rk-link" data-open>랭킹</button>`;
  else if (ovState === "guest") s = `<button class="rk-link" data-open data-join>로그인하고 랭킹에 올리기</button>`;
  else s = `<button class="rk-link" data-open="${lastRes?.mode || ""}">랭킹</button>${me?.name ? `<span>${esc(me.name)}</span>` : ""}`;
  box.innerHTML = s;
  box.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openSheet(b.dataset.open || mode));
}
// 게임이 부르는 곳: 한 판이 끝나 끝 화면이 그려졌을 때
window.RK = {
  async ended(m, score) {
    if (me?.name) {
      ovState = "saving"; mountOv();
      try { await save(m, score); ovState = "saved"; } catch { ovState = "fail"; }
    } else { pending = { mode: m, score, t: Date.now() }; ovState = "guest"; }
    mountOv();
  },
};

/* ---------- 랭킹 화면 ---------- */
const sheet = document.createElement("section");
sheet.id = "rk"; sheet.hidden = true; sheet.setAttribute("aria-label", "랭킹");
document.body.append(sheet);
addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet() });
function openSheet(m) { view = { mode: MODES[m] ? m : "easy", list: "day" }; sheet.hidden = false; drawSheet(); }
function closeSheet() { sheet.hidden = true; }

function meBar() {
  if (!me) return `<div class="rk-me">${bye ? `<p class="rk-ok">${bye}</p>` : ""}<p>구글로 로그인하면 내 점수가 랭킹에 올라가요.${pending ? " 방금 판도 같이 올라가요." : ""}</p><button class="rk-btn" data-login>구글로 로그인</button><p class="rk-note" id="rk-note"></p></div>`;
  if (!me.name) return `<form class="rk-me" id="rk-nick"><p>랭킹에 보일 닉네임을 정해 주세요.</p>
    <div class="rk-row"><input name="name" maxlength="12" required placeholder="닉네임" autocomplete="off"><button class="rk-btn">정하기</button></div>
    <p class="rk-note" id="rk-note"></p><p class="rk-sub"><button type="button" class="rk-link" data-out>로그아웃</button>${delBox()}</p></form>`;
  if (renaming) return `<form class="rk-me" id="rk-nick" data-rename><p>새 닉네임을 정해 주세요. 바꾸면 이름 옆에 지금 닉네임이 옅게 남아요.</p>
    <div class="rk-row"><input name="name" maxlength="12" required value="${esc(me.name)}" autocomplete="off"><button class="rk-btn">바꾸기</button></div>
    <p class="rk-note" id="rk-note"></p><p class="rk-sub"><button type="button" class="rk-link" data-unrename>취소</button></p></form>`;
  return `<div class="rk-me rk-in"><b>${nm(me.name, me.prev)}</b><span class="rk-acts"><button class="rk-link" ${whoAttr(me.uid, me)}>내 기록</button><button class="rk-link" data-rename>이름 바꾸기</button>${delBox()}<button class="rk-link" data-out>로그아웃</button></span></div>`;
}

async function drawSheet() {
  const v = view = { ...view }, day = today();   // 새 그리기마다 새 표 → 늦게 온 옛 결과는 버림
  sheet.innerHTML = `<div class="rk-in-wrap">
    <header class="rk-top"><h2>랭킹</h2><button class="rk-x" data-close aria-label="닫기">✕</button></header>
    ${meBar()}
    <div class="rk-tabs">
      <div class="rk-seg">${Object.entries(MODES).map(([k, n]) => `<button data-m="${k}" class="${k === v.mode ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="rk-seg">${[["day", "오늘"], ["best", "전체"]].map(([k, n]) => `<button data-l="${k}" class="${k === v.list ? "on" : ""}">${n}</button>`).join("")}</div>
    </div>
    <ol class="rk-list" id="rk-list"><li class="rk-empty">불러오는 중…</li></ol></div>`;
  bindSheet();
  let snap;
  try { snap = await getDocs(query(listRef(v.mode, v.list === "day" ? day : "best"), orderBy("score", "desc"), limit(50))); }
  catch { if (view === v) $("rk-list").innerHTML = `<li class="rk-empty">${NET}</li>`; return; }
  if (view !== v || sheet.hidden) return;
  let rank = 0, prev = -1;
  const rows = snap.docs.map((d, i) => {
    const x = d.data();
    if (x.score !== prev) { rank = i + 1; prev = x.score; }
    return `<li class="${d.id === me?.uid ? "mine" : ""}"><button ${whoAttr(d.id, x)}><i>${rank}</i><span>${nm(x.name, x.prev)}</span><b>${x.score.toLocaleString()}</b></button></li>`;
  });
  $("rk-list").innerHTML = rows.join("") || `<li class="rk-empty">${v.list === "day" ? "오늘은 아직 아무도 없어요. 첫 1위가 되어 보세요." : "아직 기록이 없어요."}</li>`;
  // 내가 50위 밖이면 맨 아래에 내 자리
  if (me?.name && !snap.docs.some(d => d.id === me.uid)) {
    const mine = await getDoc(doc(db, "decal", v.mode, v.list === "day" ? day : "best", me.uid)).catch(() => null);
    if (mine?.exists() && view === v) {
      const x = mine.data(), n = (await getCount(query(listRef(v.mode, v.list === "day" ? day : "best"), where("score", ">", x.score)))).data().count + 1;
      $("rk-list").insertAdjacentHTML("beforeend", `<li class="mine gap"><button ${whoAttr(me.uid, x)}><i>${n}</i><span>${nm(x.name, x.prev)}</span><b>${x.score.toLocaleString()}</b></button></li>`);
    }
  }
  bindSheet();
}

function bindSheet() {
  sheet.querySelector("[data-close]")?.addEventListener("click", closeSheet);
  sheet.querySelector("[data-login]")?.addEventListener("click", login);
  sheet.querySelector("[data-out]")?.addEventListener("click", () => signOut(auth));
  sheet.querySelector("button[data-rename]")?.addEventListener("click", () => { renaming = true; drawSheet(); sheet.querySelector("#rk-nick input")?.select() });
  sheet.querySelector("[data-unrename]")?.addEventListener("click", () => { renaming = false; drawSheet() });
  bindDel();
  sheet.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { view = { ...view, mode: b.dataset.m }; drawSheet() });
  sheet.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { view = { ...view, list: b.dataset.l }; drawSheet() });
  sheet.querySelectorAll("[data-who]").forEach(b => b.onclick = () => showWho(b.dataset.who, b.dataset.name, b.dataset.prev));
  const f = $("rk-nick");
  if (f && !f.onsubmit) f.onsubmit = async e => {
    e.preventDefault();
    const name = f.name.value.trim().replace(/\s+/g, " "), key = name.toLowerCase(), btn = f.querySelector(".rk-btn");
    if (!name || name.includes("/") || /^\.+$/.test(name) || /^__.*__$/.test(name)) return note("쓸 수 없는 닉네임이에요.");
    if (RESERVED.includes(key)) return note("쓸 수 없는 닉네임이에요.");
    if ("rename" in f.dataset) return rename(name, btn);
    btn.disabled = true;
    try {
      if ((await getDoc(doc(db, "gamename", key))).exists()) { btn.disabled = false; return note("이미 누가 쓰고 있는 닉네임이에요."); }
      const b = writeBatch(db);
      b.set(doc(db, "gameuser", me.uid), { name, lt: Timestamp.fromMillis(0) });
      b.set(doc(db, "gamename", key), { uid: me.uid });
      await b.commit();
      me.name = name;
      await syncBest(); await savePending();
      if (lastRes) view = { mode: lastRes.mode, list: "day" };
      drawSheet();
    } catch (e) { btn.disabled = false; note(e?.code === "permission-denied" ? "이미 누가 쓰고 있거나 쓸 수 없는 닉네임이에요." : NET); }
  };
}

/* ---------- 이름 바꾸기: 새 이름 칸 잡기 + 옛 칸 놓기 + 내 이름·전 이름 + 보이는 랭킹 칸(전체·오늘)을 한 묶음으로 ---------- */
async function rename(name, btn) {
  const old = me.name, key = name.toLowerCase(), oldKey = old.toLowerCase();
  if (name === old) return note("지금 닉네임이에요.");
  btn.disabled = true;
  try {
    const rows = Object.keys(MODES).flatMap(m => ["best", today()].map(l => doc(db, "decal", m, l, me.uid)));
    const [taken, oldDoc, ...have] = await Promise.all([
      key === oldKey ? null : getDoc(doc(db, "gamename", key)),
      getDoc(doc(db, "gamename", oldKey)),
      ...rows.map(r => getDoc(r)),
    ]);
    if (taken?.exists()) { btn.disabled = false; return note("이미 누가 쓰고 있는 닉네임이에요."); }
    const b = writeBatch(db), next = { name, prev: old };
    if (key !== oldKey) {
      b.set(doc(db, "gamename", key), { uid: me.uid });
      if (oldDoc.exists() && oldDoc.data().uid === me.uid) b.delete(oldDoc.ref);
    }
    b.update(doc(db, "gameuser", me.uid), next);
    have.forEach((d, i) => d.exists() && b.update(rows[i], next));
    await b.commit();
    Object.assign(me, next); renaming = false;
    mountOv(); drawSheet();
  } catch (e) { btn.disabled = false; note(e?.code === "permission-denied" ? "이미 누가 쓰고 있거나 쓸 수 없는 닉네임이에요." : NET); }
}

/* ---------- 계정 삭제: 판 기록·랭킹 칸(전체·지난 날짜 전부) → 닉네임 칸·내 정보 → 구글 로그인 계정 ---------- */
const DEL_ASK = `<button type="button" class="rk-link rk-muted" data-k="ask">계정 삭제</button>`;
const delBox = () => `<span class="rk-del" id="rk-del">${DEL_ASK}</span>`;
function bindDel() {
  const box = $("rk-del"); if (!box || box.onclick) return;
  box.onclick = e => {
    const k = e.target.dataset.k;
    if (k === "ask" || k === "no") box.classList.toggle("open", k === "ask");
    if (k === "ask") box.innerHTML = `<span>닉네임·랭킹·판 기록이 모두 지워지고 되돌릴 수 없어요.</span> <button type="button" class="rk-link rk-danger" data-k="yes">지우기</button> <button type="button" class="rk-link" data-k="no">취소</button>`;
    if (k === "no") box.innerHTML = DEL_ASK;
    if (k === "yes") delAccount(box);
  };
}
async function delAccount(box) {
  const u = auth.currentUser; if (!u) return;
  const say = t => { box.innerHTML = `<span>${t}</span>` };
  try {
    // 구글은 로그인한 지 오래되면 계정 삭제를 막는다 → 누른 그 자리에서 다시 확인(팝업은 누른 직후에만 열림)
    if (Date.now() - Date.parse(u.metadata.lastSignInTime) > 3 * 60e3) await reauthenticateWithPopup(u, new GoogleAuthProvider());
  } catch (e) {
    return say(/popup-closed|cancelled-popup/.test(e?.code) ? "취소했어요." : e?.code === "auth/user-mismatch" ? "지금 로그인한 구글 계정을 골라 주세요." : "확인하지 못했어요. 팝업 차단을 풀고 다시 해 주세요.");
  }
  say("지우는 중…");
  try {
    const uid = u.uid, kst = ms => { const d = new Date(ms + 9 * 36e5); return "d" + d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) };
    const games = await getDocs(collection(db, "gameuser", uid, "decal"));
    // 하루 랭킹 칸은 그날 판이 있을 때만 생기므로 판 기록 날짜로 찾는다(규칙이 5분 전 날짜도 받아서 둘 다)
    const lists = new Set(["best", today()]);
    games.docs.forEach(d => { const t = d.data().at?.toMillis(); if (t) { lists.add(kst(t)); lists.add(kst(t - 5 * 60e3)); } });
    const refs = [...games.docs.map(d => d.ref), ...Object.keys(MODES).flatMap(m => [...lists].map(l => doc(db, "decal", m, l, uid)))];
    for (let i = 0; i < refs.length; i += 400) { const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit(); }
    const b = writeBatch(db);
    if (me?.name) { const n = await getDoc(doc(db, "gamename", me.name.toLowerCase())); if (n.exists() && n.data().uid === uid) b.delete(n.ref); }
    b.delete(doc(db, "gameuser", uid));
    await b.commit();
    pending = null; lastRes = null; bye = "계정을 지웠어요.";
    await deleteUser(u);   // onAuthStateChanged가 로그인 전 화면으로 다시 그림
  } catch (e) {
    bye = "";
    say(e?.code === "auth/requires-recent-login" ? "게임 기록은 지웠어요. 다시 로그인한 뒤 계정 삭제를 한 번 더 눌러 주세요." : NET);
  }
}

/* ---------- 한 사람의 기록: 모드별 최고·판 수·최근 10판 ---------- */
async function showWho(uid, name, prev) {
  const v = view;
  sheet.innerHTML = `<div class="rk-in-wrap">
    <header class="rk-top"><button class="rk-link" data-back>← 랭킹</button><button class="rk-x" data-close aria-label="닫기">✕</button></header>
    <h2 class="rk-name">${nm(name, prev)}</h2><div id="rk-who"><p class="rk-empty">불러오는 중…</p></div></div>`;
  sheet.querySelector("[data-back]").onclick = () => { view = v; drawSheet() };
  sheet.querySelector("[data-close]").onclick = closeSheet;
  const games = collection(db, "gameuser", uid, "decal");
  let bests, n, recent;
  try {
    [bests, n, recent] = await Promise.all([
      Promise.all(Object.keys(MODES).map(m => getDoc(doc(db, "decal", m, "best", uid)))),
      getCount(games),
      getDocs(query(games, orderBy("at", "desc"), limit(10))),
    ]);
  } catch { if ($("rk-who")) $("rk-who").innerHTML = `<p class="rk-empty">${NET}</p>`; return; }
  if (!$("rk-who")) return;
  $("rk-who").innerHTML = `
    <dl class="rk-stats">${Object.values(MODES).map((label, i) => `<div><dt>${label} 최고</dt><dd>${bests[i].exists() ? bests[i].data().score.toLocaleString() : "—"}</dd></div>`).join("")}
      <div><dt>판 수</dt><dd>${n.data().count}</dd></div></dl>
    <h3 class="rk-h">최근 판</h3>
    <ol class="rk-recent">${recent.docs.map(d => { const x = d.data(); return `<li><span>${when(x.at)}</span><span>${MODES[x.mode]}</span><b>${x.score.toLocaleString()}</b></li>` }).join("") || `<li class="rk-empty">아직 없어요.</li>`}</ol>
    ${me?.admin ? `<p class="rk-adm" id="rk-adm"><button class="rk-link" data-k="ask">순위에서 빼기</button></p>` : ""}`;
  // 운영자: 꾸며 넣은 점수를 모드별 전체·오늘 순위에서 지운다(판 기록은 남김)
  $("rk-adm")?.addEventListener("click", async e => {
    const k = e.target.dataset.k, box = $("rk-adm");
    if (k === "ask") box.innerHTML = `정말 뺄까요? <button class="rk-link" data-k="yes">빼기</button> <button class="rk-link" data-k="no">취소</button>`;
    if (k === "no") box.innerHTML = `<button class="rk-link" data-k="ask">순위에서 빼기</button>`;
    if (k !== "yes") return;
    const b = writeBatch(db);
    for (const m of Object.keys(MODES)) for (const l of ["best", today()]) b.delete(doc(db, "decal", m, l, uid));
    try { await b.commit(); box.textContent = "순위에서 뺐어요."; } catch { box.textContent = "빼지 못했어요."; }
  });
}

mountOv();
