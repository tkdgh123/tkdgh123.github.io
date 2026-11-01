import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, deleteField
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CONFIG = {
  apiKey: "AIzaSyA4VJvIM9DwMB4D2KzhDwcekCIGMRSrmwI",
  authDomain: "uridal-43133.firebaseapp.com",
  projectId: "uridal-43133",
  storageBucket: "uridal-43133.firebasestorage.app",
  messagingSenderId: "704081943105",
  appId: "1:704081943105:web:aff91a36dae41a6bd5c4c0"
};

const fb = initializeApp(CONFIG);
let db;
try { db = initializeFirestore(fb, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch { db = initializeFirestore(fb, {}); }

/* ---------- 작은 도구 ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const today = () => ymd(new Date());
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const md = s => { const d = parse(s); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const full = s => { const d = parse(s); return `${d.getFullYear()}년 ${md(s)} ${WEEK[d.getDay()]}요일`; };
const FACES = ["🥰", "😆", "😊", "🙂", "😐", "😢", "😠", "😴"];
const KIND = { place: "장소", food: "맛집", todo: "할 것" };
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const KEY = "uridal";
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const saveLocal = v => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch {} };

let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2400);
}
const fail = () => toast("저장하지 못했어요. 인터넷 연결을 확인해 주세요.");

/* 화면이 바뀔 때 살짝 떠오르며 나타나기 */
const calm = matchMedia("(prefers-reduced-motion: reduce)");
function appear(el, dx = 0) {
  if (calm.matches || !el?.animate) return;
  el.animate([{ opacity: 0, transform: `translate(${dx}px, ${dx ? 0 : 10}px) scale(${dx ? 1 : .985})` }, { opacity: 1, transform: "none" }],
             { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
}

/* 두 번 눌러야 지워지는 버튼 */
function armed(btn) {
  if (btn.classList.contains("arm")) return true;
  const old = btn.textContent;
  btn.classList.add("arm"); btn.textContent = "한 번 더";
  setTimeout(() => { btn.classList.remove("arm"); btn.textContent = old; }, 3000);
  return false;
}

/* ---------- 상태 ---------- */
const now = new Date();
const S = { room: null, me: "a", info: null, events: [], wishes: [], annivs: [], days: {},
            y: now.getFullYear(), m: now.getMonth(), sel: today(), unsub: [], kind: "place", photos: [] };
const name = w => S.info?.[w]?.name || (w === "a" ? "A" : "B");
const col = (...p) => collection(db, "rooms", S.room, ...p);
const ref = (...p) => doc(db, "rooms", S.room, ...p);
const link = code => `${location.origin}${location.pathname}#${code}`;

function newCode() {
  const r = crypto.getRandomValues(new Uint8Array(20));
  return [...r].map(v => ABC[v % 32]).join("").match(/.{4}/g).join("-");
}
function normCode(t) {
  const s = String(t || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 20 && [...s].every(c => ABC.includes(c)) ? s.match(/.{4}/g).join("-") : null;
}

/* ---------- 기념일 계산 ---------- */
function marksOn(d) {
  const out = [], st = S.info?.start;
  if (!st) return out;
  const n = diff(st, d) + 1;
  if (n > 0 && n % 100 === 0) out.push(`${n}일`);
  if (d > st && d.slice(5) === st.slice(5)) out.push(`${+d.slice(0, 4) - +st.slice(0, 4)}주년`);
  for (const a of S.annivs) if (a.md === d.slice(5)) out.push(a.title);
  return out;
}
function upcoming(k) {
  const out = [], t = today();
  for (let i = 0; i < 800 && out.length < k; i++) {
    const d = addDays(t, i);
    for (const title of marksOn(d)) out.push({ d, title, left: i });
  }
  return out.slice(0, k);
}
const eventsOn = d => S.events
  .filter(e => e.date <= d && d <= (e.end || e.date))
  .sort((x, y) => (x.time || "99").localeCompare(y.time || "99") || (x.at || 0) - (y.at || 0));
const dLabel = d => { const n = diff(S.info.start, d) + 1; return n > 0 ? `D+${n}` : `D-${1 - n}`; };

/* ---------- 그리기 ---------- */
function render() {
  if (!S.info) return;
  renderHead(); renderCal(); renderAgenda(); renderWish(); renderUs();
}

function renderHead() {
  $("hA").textContent = name("a");
  $("hB").textContent = name("b");
  $("hD").textContent = dLabel(today());
  const p = curPhoto(), pic = $("hPic");
  if (p) {
    pic.style.backgroundImage = `url("${p.data}")`; pic.classList.add("has");
  } else { pic.style.backgroundImage = ""; pic.classList.remove("has"); }
  const n = upcoming(1)[0];
  $("hNext").textContent = n ? (n.left ? `${n.title}까지 ${n.left}일` : `오늘은 ${n.title}`) : "";
}

function renderCal() {
  const { y, m } = S;
  $("mTitle").textContent = `${y}. ${pad(m + 1)}`;
  const first = new Date(y, m, 1);
  const cells = 42, t = today();
  let html = "";
  for (let i = 0; i < cells; i++) {
    const dt = new Date(y, m, 1 - first.getDay() + i), d = ymd(dt);
    const evs = eventsOn(d), dd = S.days[d] || {};
    const moods = (dd.a?.mood || "") + (dd.b?.mood || "");
    const cls = ["day", dt.getMonth() !== m && "out", dt.getDay() === 0 && "sun", d === t && "today", d === S.sel && "sel"].filter(Boolean).join(" ");
    html += `<button type="button" class="${cls}" data-d="${d}" aria-label="${md(d)}"><span class="n">${dt.getDate()}</span>`
      + (moods ? `<span class="moods">${esc(moods)}</span>` : "")
      + (marksOn(d).length ? `<span class="heart">♥</span>` : "")
      + evs.slice(0, 2).map(e => `<span class="bar ${e.who}">${esc(e.title)}</span>`).join("")
      + (evs.length > 2 ? `<span class="more">+${evs.length - 2}</span>` : "")
      + `</button>`;
  }
  $("grid").innerHTML = html;
}

function moodCard(w, v) {
  const mine = w === S.me;
  const tag = mine ? `button type="button" data-mood` : "div";
  return `<${tag} class="mood ${mine ? "mine" : ""}"><span class="who by ${w}">${esc(name(w))}${mine ? " (나)" : ""}</span>`
    + (v?.mood ? `<span class="face">${v.mood}</span>` : "")
    + (v?.memo ? `<p>${esc(v.memo)}</p>` : `<p class="empty">${mine ? "기분·한 줄 남기기" : "아직 없어요"}</p>`)
    + `</${mine ? "button" : "div"}>`;
}

function renderAgenda() {
  const d = S.sel, dt = parse(d), n = diff(S.info.start, d) + 1;
  const evs = eventsOn(d), marks = marksOn(d), dd = S.days[d] || {};
  $("agenda").innerHTML =
    `<div class="ahead"><h3>${md(d)} ${WEEK[dt.getDay()]}요일</h3>${n > 0 ? `<small>${n}일째</small>` : ""}</div>`
    + (marks.length ? `<div class="tags">${marks.map(t => `<span class="tag">♥ ${esc(t)}</span>`).join("")}</div>` : "")
    + (evs.length ? evs.map(e => {
        const sub = [e.time, e.end && e.end !== e.date ? `~ ${md(e.end)}` : "", e.memo].filter(Boolean).map(esc).join(" · ");
        return `<button type="button" class="ev ${e.who}" data-e="${e.id}">`
          + `<span><b>${esc(e.title)}</b>${sub ? `<small>${sub}</small>` : ""}</span>`
          + `<span class="by ${e.who}">${e.who === "both" ? "함께" : esc(name(e.who))}</span></button>`;
      }).join("") : `<p class="empty">이 날은 아직 일정이 없어요.</p>`)
    + `<button type="button" class="addbtn" data-add>+ 일정 추가</button>`
    + `<div class="moodrow">${moodCard("a", dd.a)}${moodCard("b", dd.b)}</div>`;
}

function renderWish() {
  const groups = [["want", "아직"], ["planned", "날짜 잡음"], ["done", "다녀옴"]];
  const sorted = [...S.wishes].sort((x, y) => (y.at || 0) - (x.at || 0));
  const html = groups.map(([st, label]) => {
    const list = sorted.filter(w => (w.status || "want") === st);
    if (!list.length) return "";
    return `<div class="wgroup"><h4>${label} ${list.length}</h4>` + list.map(w => {
      const btns = st === "want" ? `<button type="button" class="go" data-plan="${w.id}">날짜 잡기</button><button type="button" data-wdel="${w.id}">삭제</button>`
        : st === "planned" ? `<button type="button" class="go" data-wdone="${w.id}">다녀옴</button><button type="button" data-wgo="${w.id}">달력</button>`
        : `<button type="button" data-wback="${w.id}">되돌리기</button>`;
      const sub = [esc(name(w.by)), w.date && st !== "want" ? `${md(w.date)}${st === "planned" ? " 예정" : ""}` : ""].filter(Boolean).join(" · ");
      return `<div class="wish ${st}"><span class="k">${KIND[w.kind] || "할 것"}</span><div><b>${esc(w.title)}</b><small>${sub}</small></div><div class="wbtns">${btns}</div></div>`;
    }).join("") + `</div>`;
  }).join("");
  $("wishList").innerHTML = html || `<p class="empty">가고 싶은 곳, 먹고 싶은 것, 같이 해 보고 싶은 걸 적어 두세요. 날짜를 잡으면 달력에 들어가요.</p>`;
}

function renderUs() {
  $("usSince").textContent = full(S.info.start);
  $("soonList").innerHTML = upcoming(8).map(u =>
    `<li><b>${esc(u.title)}</b><small>${full(u.d)}</small><span class="left">${u.left ? `D-${u.left}` : "오늘"}</span></li>`).join("");
  $("annivList").innerHTML = S.annivs.map(a =>
    `<li><button type="button" data-an="${a.id}">${esc(a.title)} · ${+a.md.slice(0, 2)}/${+a.md.slice(3)}</button></li>`).join("");
  const set = (id, v) => { if (document.activeElement !== $(id)) $(id).value = v; };
  set("sA", name("a")); set("sB", name("b")); set("sStart", S.info.start);
  $("sCode").textContent = S.room;
  const on = curPhoto()?.id;
  $("picList").innerHTML = S.photos.map(p =>
    `<div class="pic${p.id === on ? " on" : ""}" style="background-image:url('${p.data}')">`
    + `<button type="button" data-pic="${p.id}" aria-label="맨 위에 걸기"></button>`
    + `<button type="button" class="x" data-pdel="${p.id}" aria-label="사진 지우기">×</button></div>`).join("");
}

/* ---------- 아래 창 ---------- */
const sheet = $("sheet"), sheetForm = $("sheetForm");
let onSheetSubmit = null;
function openSheet(html, onSubmit, init) {
  sheetForm.innerHTML = html;
  onSheetSubmit = onSubmit;
  init?.();
  sheet.showModal();
}
function closeSheet() {
  if (calm.matches || !sheet.animate) return sheet.close();
  sheet.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(60px)", opacity: 0 }], { duration: 200, easing: "ease-in" })
    .finished.then(() => sheet.close());
}
sheetForm.addEventListener("submit", e => {
  e.preventDefault();
  if (onSheetSubmit?.() !== false) closeSheet();
});
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
function seg(box, attr) {
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    box.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    box.dataset.v = b.dataset[attr];
  });
}

function openEvent(id) {
  const e = id ? S.events.find(x => x.id === id) : { date: S.sel, who: S.me };
  if (!e) return;
  openSheet(`<h3>${id ? "일정 고치기" : "일정 추가"}</h3>
    <label>무엇을 <input id="fT" required maxlength="40" autocomplete="off"></label>
    <div class="seg" id="fW">${["a", "both", "b"].map(w =>
      `<button type="button" class="${w}" data-w="${w}">${w === "both" ? "함께" : esc(name(w))}</button>`).join("")}</div>
    <div class="two"><label>날짜 <input type="date" id="fD" required></label><label>끝나는 날 <input type="date" id="fE"></label></div>
    <label>시간 <input type="time" id="fH"></label>
    <label>메모 <input id="fM" maxlength="80" autocomplete="off"></label>
    <div class="acts">${id ? `<button type="button" class="del" id="fDel">삭제</button>` : ""}<button class="big" type="submit">저장</button></div>`,
  () => {
    const date = $("fD").value, end = $("fE").value;
    const data = { title: $("fT").value.trim(), date, end: end > date ? end : "", time: $("fH").value,
                   memo: $("fM").value.trim(), who: $("fW").dataset.v };
    if (!data.title) return false;
    if (id) {
      updateDoc(ref("events", id), data).catch(fail);
      if (e.wishId) updateDoc(ref("wishes", e.wishId), { date }).catch(() => {});
    } else {
      setDoc(doc(col("events")), { ...data, by: S.me, at: Date.now() }).catch(fail);
    }
    S.sel = date; render();
  }, () => {
    $("fT").value = e.title || ""; $("fD").value = e.date; $("fE").value = e.end || "";
    $("fH").value = e.time || ""; $("fM").value = e.memo || "";
    const box = $("fW"); seg(box, "w"); box.querySelector(`[data-w="${e.who}"]`).click();
    $("fDel")?.addEventListener("click", ev => {
      if (!armed(ev.currentTarget)) return;
      deleteDoc(ref("events", id)).catch(fail);
      if (e.wishId) updateDoc(ref("wishes", e.wishId), { status: "want", date: deleteField(), eventId: deleteField() }).catch(() => {});
      closeSheet();
    });
    if (!id) $("fT").focus();
  });
}

function openMood() {
  const cur = S.days[S.sel]?.[S.me] || {};
  openSheet(`<h3>${md(S.sel)}의 나</h3>
    <div class="faces" id="fF">${FACES.map(f => `<button type="button" data-f="${f}">${f}</button>`).join("")}</div>
    <label>한 줄 <input id="fN" maxlength="60" autocomplete="off" placeholder="오늘 하고 싶은 말"></label>
    <div class="acts"><button type="button" class="del" id="fClr">지우기</button><button class="big" type="submit">남기기</button></div>`,
  () => {
    const mood = $("fF").dataset.v || "", memo = $("fN").value.trim();
    if (!mood && !memo) return false;
    setDoc(ref("days", S.sel), { [S.me]: { mood, memo } }, { merge: true }).catch(fail);
  }, () => {
    seg($("fF"), "f");
    if (cur.mood) $("fF").querySelector(`[data-f="${cur.mood}"]`)?.click();
    $("fN").value = cur.memo || "";
    $("fClr").addEventListener("click", () => {
      setDoc(ref("days", S.sel), { [S.me]: deleteField() }, { merge: true }).catch(fail);
      closeSheet();
    });
  });
}

function openPlan(wid) {
  const w = S.wishes.find(x => x.id === wid);
  if (!w) return;
  openSheet(`<h3>${esc(w.title)}</h3>
    <div class="two"><label>언제 <input type="date" id="pD" required></label><label>시간 <input type="time" id="pH"></label></div>
    <div class="acts"><button class="big" type="submit">달력에 넣기</button></div>`,
  () => {
    const date = $("pD").value, ev = doc(col("events"));
    setDoc(ev, { title: w.title, date, end: "", time: $("pH").value, memo: "", who: "both", by: S.me, at: Date.now(), wishId: wid }).catch(fail);
    updateDoc(ref("wishes", wid), { status: "planned", date, eventId: ev.id }).catch(fail);
    toast(`${md(date)}에 넣었어요`);
  }, () => { $("pD").value = S.sel >= today() ? S.sel : today(); });
}

function openAnniv(id) {
  const a = id ? S.annivs.find(x => x.id === id) : null;
  openSheet(`<h3>${a ? "기념일 고치기" : "기념일·생일 추가"}</h3>
    <label>이름 <input id="aT" required maxlength="20" placeholder="예: 여자친구 생일" autocomplete="off"></label>
    <label>날짜 (해마다 표시돼요) <input type="date" id="aD" required></label>
    <div class="acts">${a ? `<button type="button" class="del" id="aDel">삭제</button>` : ""}<button class="big" type="submit">저장</button></div>`,
  () => {
    const data = { title: $("aT").value.trim(), md: $("aD").value.slice(5) };
    if (!data.title) return false;
    (a ? updateDoc(ref("annivs", id), data) : setDoc(doc(col("annivs")), data)).catch(fail);
  }, () => {
    $("aT").value = a?.title || "";
    $("aD").value = a ? `${new Date().getFullYear()}-${a.md}` : today();
    $("aDel")?.addEventListener("click", ev => {
      if (!armed(ev.currentTarget)) return;
      deleteDoc(ref("annivs", id)).catch(fail); closeSheet();
    });
  });
}

/* ---------- 연결 ---------- */
/* 화면: 남자친구(하늘) · 여자친구(분홍) · 헬로키티. 기기마다 따로 고른다 */
const SKINS = { sky: ["남자친구", "#E2EEFF"], pink: ["여자친구", "#FFE6EE"], kitty: ["헬로키티", "#FFE9EF"] };
const SKIN_KEY = "uridal-skin";
const skinFor = me => (me === "a" ? "sky" : "pink");
function getSkin() {
  try { const v = localStorage.getItem(SKIN_KEY); if (SKINS[v]) return v; } catch {}
  return skinFor(S.me);
}
function applySkin(skin) {
  document.documentElement.dataset.skin = skin;
  document.querySelector('meta[name="theme-color"]').content = SKINS[skin][1];
  if (skin === "kitty") watchPhotos();
  if (S.info) { renderHead(); renderUs(); }
}
let photoUnsub = null;
/* 맨 위 동그라미 사진: 고른 사진(기기별), 없으면 날마다 바뀜 */
const PIC_KEY = "uridal-pic";
function curPhoto() {
  const ph = S.photos; if (!ph.length) return null;
  let id; try { id = localStorage.getItem(PIC_KEY); } catch {}
  return ph.find(p => p.id === id) || ph[diff("2026-01-01", today()) % ph.length];
}
function showPhoto(id) {
  try { localStorage.setItem(PIC_KEY, id); } catch {}
  renderHead(); renderUs(); appear($("hPic"));
}
function watchPhotos() {
  if (photoUnsub || !S.room) return;
  photoUnsub = onSnapshot(col("photos"), s => {
    S.photos = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((x, y) => (x.at || 0) - (y.at || 0));
    if (S.info) { renderHead(); renderUs(); }
  });
  S.unsub.push(photoUnsub);
}
function openSkins() {
  const cur = document.documentElement.dataset.skin;
  openSheet(`<h3>화면 고르기</h3>
    <div class="skins">${Object.entries(SKINS).map(([k, [label]]) =>
      `<button type="button" class="skin-card ${k}${k === cur ? " on" : ""}" data-skin="${k}"><span class="sw"></span>${label}</button>`).join("")}</div>
    <p class="hint">이 휴대폰에서만 바뀌어요.</p>`, null, () => {
    sheetForm.querySelector(".skins").addEventListener("click", e => {
      const b = e.target.closest("[data-skin]"); if (!b) return;
      try { localStorage.setItem(SKIN_KEY, b.dataset.skin); } catch {}
      applySkin(b.dataset.skin);
      b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    });
  });
}
async function shrink(file) {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 640 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0, c.width, c.height);
  let url = c.toDataURL("image/webp", 0.8);
  if (!url.startsWith("data:image/webp")) {
    g.globalCompositeOperation = "destination-over"; g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    url = c.toDataURL("image/jpeg", 0.82);
  }
  return url;
}

function enter(room, me) {
  S.room = room; S.me = me; saveLocal({ room, me }); applySkin(getSkin());
  $("setup").hidden = true; $("boot").hidden = false;
  const slow = setTimeout(() => { toast("연결이 느려요. 잠시만요…"); $("bootReset").hidden = false; }, 8000);
  S.unsub.push(onSnapshot(doc(db, "rooms", room), s => {
    if (!s.exists()) {
      if (!s.metadata.fromCache) { toast("달력을 찾을 수 없어요."); leave(); }
      return;
    }
    clearTimeout(slow);
    S.info = s.data();
    if (!$("boot").hidden) {
      $("boot").hidden = true; $("app").hidden = false;
      render(); appear($("app"));
    } else render();
  }, err => { clearTimeout(slow); toast(`불러오지 못했어요 (${err.code})`); $("bootReset").hidden = false; }));
  for (const c of ["events", "wishes", "annivs"]) {
    S.unsub.push(onSnapshot(col(c), s => { S[c] = s.docs.map(d => ({ id: d.id, ...d.data() })); render(); }));
  }
  S.unsub.push(onSnapshot(col("days"), s => { S.days = Object.fromEntries(s.docs.map(d => [d.id, d.data()])); render(); }));
}
function leave() {
  S.unsub.forEach(u => u()); saveLocal(null); location.reload();
}

/* 달력 화면에서 바로: 커플 코드 보기, 링크 보내기, 초기화 */
function openRoom() {
  openSheet(`<h3>커플 코드</h3>
    <output class="code">${S.room}</output>
    <button type="button" class="pill wide" data-r="share">링크 보내기</button>
    <button type="button" class="link danger" data-r="reset">초기화 (처음 화면으로)</button>
    <p class="hint">초기화해도 달력 내용은 그대로예요. 코드로 다시 들어오면 돼요.</p>`, null, () => {
    sheetForm.querySelector("[data-r=share]").onclick = () => share(S.room);
    sheetForm.querySelector("[data-r=reset]").onclick = e => { if (armed(e.currentTarget)) leave(); };
  });
}

async function share(code) {
  const url = link(code);
  if (navigator.share) {
    try { await navigator.share({ title: "우리달", text: "우리 달력에 들어와 줘", url }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("링크를 복사했어요"); }
  catch { toast("코드를 길게 눌러 복사해 주세요"); }
}

/* ---------- 처음 시작 화면 ---------- */
const STEPS = ["setupChoose", "newForm", "shareBox", "joinForm", "pickBox"];
const step = id => { STEPS.forEach(s => ($(s).hidden = s !== id)); appear($(id)); };
seg($("nMe"), "w");
$("nMe").addEventListener("click", () => applySkin(skinFor($("nMe").dataset.v)));
document.querySelectorAll(".back").forEach(b => b.addEventListener("click", () => { delete document.documentElement.dataset.skin; step("setupChoose"); }));
$("goNew").onclick = () => { applySkin(skinFor($("nMe").dataset.v || "a")); step("newForm"); $("nA").focus(); };
$("goJoin").onclick = () => { step("joinForm"); $("jCode").focus(); };
$("newForm").addEventListener("submit", async e => {
  e.preventDefault();
  const code = newCode(), btn = e.submitter;
  btn.disabled = true;
  try {
    await setDoc(doc(db, "rooms", code), { a: { name: $("nA").value.trim() }, b: { name: $("nB").value.trim() }, start: $("nStart").value, at: Date.now() });
    $("shareCode").textContent = code;
    $("copyLink").onclick = () => share(code);
    const me = $("nMe").dataset.v || "a";
    $("startApp").onclick = () => enter(code, me);
    step("shareBox");
  } catch { fail(); }
  btn.disabled = false;
});
$("joinForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = $("jErr"), code = normCode($("jCode").value);
  err.hidden = true;
  if (!code) { err.textContent = "코드는 영문·숫자 20글자예요."; err.hidden = false; return; }
  try {
    const s = await getDoc(doc(db, "rooms", code));
    if (!s.exists()) { err.textContent = "그런 코드가 없어요. 다시 확인해 주세요."; err.hidden = false; return; }
    const info = s.data();
    $("pickWho").innerHTML = ["a", "b"].map(w => `<button type="button" class="${w}" data-w="${w}"><small>${w === "a" ? "남자친구" : "여자친구"}</small>${esc(info[w]?.name)}</button>`).join("");
    $("pickWho").onclick = ev => { const b = ev.target.closest("button"); if (b) enter(code, b.dataset.w); };
    step("pickBox");
  } catch { err.textContent = "연결하지 못했어요. 인터넷을 확인해 주세요."; err.hidden = false; }
});

/* ---------- 앱 화면 동작 ---------- */
document.querySelector(".tabbar").addEventListener("click", e => {
  const b = e.target.closest("button"); if (b) showTab(b.dataset.tab);
});
function showTab(t) {
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  ["cal", "wish", "us"].forEach(x => ($(`tab-${x}`).hidden = x !== t));
  scrollTo({ top: 0, behavior: "instant" });
  appear($(`tab-${t}`));
}
let monthOut = null;
function goMonth(dm, from = 0) {
  const d = new Date(S.y, S.m + dm, 1); S.y = d.getFullYear(); S.m = d.getMonth();
  const g = $("grid");
  if (calm.matches || !g.animate) return renderCal();
  monthOut?.cancel();
  monthOut = g.animate([{ transform: `translateX(${from}px)`, opacity: 1 }, { transform: `translateX(${-dm * 28}px)`, opacity: 0 }], { duration: 120, easing: "ease-in", fill: "forwards" });
  monthOut.onfinish = () => { monthOut.cancel(); monthOut = null; renderCal(); appear(g, dm * 28); appear($("mTitle"), dm * 12); };
}
$("prevM").onclick = () => goMonth(-1);
$("nextM").onclick = () => goMonth(1);
$("todayBtn").onclick = () => { const t = new Date(); S.y = t.getFullYear(); S.m = t.getMonth(); S.sel = today(); renderCal(); renderAgenda(); };
let tx = null, ty = 0, drag = 0;
$("grid").addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; drag = 0; }, { passive: true });
$("grid").addEventListener("touchmove", e => {
  if (tx === null || calm.matches) return;
  const dx = e.touches[0].clientX - tx;
  if (Math.abs(dx) < Math.abs(e.touches[0].clientY - ty)) return;
  drag = dx * .5; $("grid").style.transform = `translateX(${drag}px)`;
}, { passive: true });
$("grid").addEventListener("touchcancel", () => { tx = null; $("grid").style.transform = ""; });
$("grid").addEventListener("touchend", e => {
  if (tx === null) return;
  const g = $("grid"), t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  tx = null; g.style.transform = "";
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) goMonth(dx < 0 ? 1 : -1, drag);
  else if (drag && g.animate) g.animate([{ transform: `translateX(${drag}px)` }, { transform: "none" }], { duration: 200, easing: "ease-out" });
});
$("grid").addEventListener("click", e => {
  const b = e.target.closest(".day"); if (!b) return;
  S.sel = b.dataset.d;
  const d = parse(S.sel);
  if (d.getMonth() !== S.m) { S.y = d.getFullYear(); S.m = d.getMonth(); }
  renderCal(); renderAgenda(); appear($("agenda"));
});
$("agenda").addEventListener("click", e => {
  const ev = e.target.closest("[data-e]"); if (ev) return openEvent(ev.dataset.e);
  if (e.target.closest("[data-add]")) return openEvent(null);
  if (e.target.closest("[data-mood]")) openMood();
});

$("wishKinds").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  S.kind = b.dataset.k;
  $("wishKinds").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
});
$("wishForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("wishIn").value.trim(); if (!title) return;
  setDoc(doc(col("wishes")), { title, kind: S.kind, by: S.me, status: "want", at: Date.now() }).catch(fail);
  $("wishIn").value = "";
});
$("wishList").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const { plan, wdel, wdone, wgo, wback } = b.dataset;
  if (plan) openPlan(plan);
  else if (wdel) { if (armed(b)) deleteDoc(ref("wishes", wdel)).catch(fail); }
  else if (wdone) updateDoc(ref("wishes", wdone), { status: "done" }).catch(fail);
  else if (wback) updateDoc(ref("wishes", wback), { status: "want", date: deleteField(), eventId: deleteField() }).catch(fail);
  else if (wgo) {
    const w = S.wishes.find(x => x.id === wgo); if (!w?.date) return;
    S.sel = w.date; const d = parse(w.date); S.y = d.getFullYear(); S.m = d.getMonth();
    render(); showTab("cal");
  }
});

$("addAnniv").onclick = () => openAnniv(null);
$("annivList").addEventListener("click", e => { const b = e.target.closest("[data-an]"); if (b) openAnniv(b.dataset.an); });
$("saveSet").onclick = () => {
  const a = $("sA").value.trim(), b = $("sB").value.trim(), start = $("sStart").value;
  if (!a || !b || !start) return toast("이름과 날짜를 모두 적어 주세요");
  updateDoc(doc(db, "rooms", S.room), { "a.name": a, "b.name": b, start }).catch(fail);
  toast("저장했어요");
};
$("sCopy").onclick = () => share(S.room);
$("leave").onclick = e => { if (armed(e.currentTarget)) leave(); };
$("skinBtn").onclick = openSkins;
$("codeBtn").onclick = openRoom;
$("bootReset").onclick = leave;
$("skinBtn2").onclick = openSkins;
$("hPic").onclick = () => {
  if (!S.photos.length) { showTab("us"); return $("album").scrollIntoView({ behavior: "smooth" }); }
  const ph = S.photos;
  showPhoto(ph[(ph.indexOf(curPhoto()) + 1) % ph.length].id);
};
$("picIn").addEventListener("change", async e => {
  const files = [...e.target.files].slice(0, Math.max(0, 30 - S.photos.length));
  e.target.value = "";
  if (!files.length) return toast("사진은 30장까지 넣을 수 있어요");
  toast("사진 넣는 중…");
  let last;
  for (const f of files) {
    last = doc(col("photos"));
    try { await setDoc(last, { data: await shrink(f), by: S.me, at: Date.now() }); }
    catch { toast("사진을 넣지 못했어요"); return; }
  }
  showPhoto(last.id);
  toast("사진을 넣었어요");
});
$("picList").addEventListener("click", e => {
  const b = e.target.closest("[data-pic], [data-pdel]"); if (!b) return;
  if (b.dataset.pic) { showPhoto(b.dataset.pic); scrollTo({ top: 0, behavior: "smooth" }); }
  else if (armed(b)) deleteDoc(ref("photos", b.dataset.pdel)).catch(fail);
});

let installEv = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEv = e; $("installBtn").hidden = false; });
$("installBtn").onclick = async () => { if (!installEv) return; installEv.prompt(); await installEv.userChoice; installEv = null; $("installBtn").hidden = true; };
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
$("iosHint").hidden = !(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- 시작 ---------- */
const saved = loadLocal();
const hashCode = normCode(decodeURIComponent(location.hash.slice(1)));
if (location.hash) history.replaceState(null, "", location.pathname);
if (saved?.room) enter(saved.room, saved.me);
else {
  $("boot").hidden = true; $("setup").hidden = false;
  if (hashCode) { step("joinForm"); $("jCode").value = hashCode; }
  else step("setupChoose");
}
