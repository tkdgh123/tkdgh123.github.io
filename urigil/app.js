import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { PICKS, INFO } from "./places.js";

/* 우리달과 같은 Firebase 프로젝트, 같은 커플 방(rooms/{코드}) — 코스는 rooms/{코드}/courses */
const CONFIG = {
  apiKey: "AIzaSyA4VJvIM9DwMB4D2KzhDwcekCIGMRSrmwI",
  authDomain: "uridal-43133.firebaseapp.com",
  projectId: "uridal-43133",
  storageBucket: "uridal-43133.firebasestorage.app",
  messagingSenderId: "704081943105",
  appId: "1:704081943105:web:aff91a36dae41a6bd5c4c0"
};
const KAKAO_KEY = "358283f945823ab37a1aa0778845e544";

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
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const today = () => ymd(new Date());
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const md = s => { const d = parse(s); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const mdw = s => `${md(s)} ${WEEK[parse(s).getDay()]}`;
const hm = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const r5 = m => Math.ceil(m / 5) * 5;
const pick = a => a[Math.floor(Math.random() * a.length)];
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const KEY = "urigil";
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2400);
}
const fail = () => toast("저장하지 못했어요. 인터넷을 확인해 주세요.");

const calm = matchMedia("(prefers-reduced-motion: reduce)");
function appear(el, dx = 0) {
  if (calm.matches || !el?.animate) return;
  el.animate([{ opacity: 0, transform: `translate(${dx}px, ${dx ? 0 : 10}px)` }, { opacity: 1, transform: "none" }],
             { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
}
function armed(btn) {
  if (btn.classList.contains("arm")) return true;
  const old = btn.textContent;
  btn.classList.add("arm"); btn.textContent = "한 번 더";
  setTimeout(() => { btn.classList.remove("arm"); btn.textContent = old; }, 3000);
  return false;
}

/* ---------- 서울 동네 ----------
   spots: [카카오 검색어, 종류, 머무는 분, { n: 밤에도 좋음, i: 실내, o: 여는 시각, c: 닫는 시각, off: 쉬는 요일 }] */
const H = h => h * 60;
const AREAS = {
  seongsu: { name: "성수", q: "성수동", in: 1, food: 2, near: ["kondae"], season: [5, 10, 11],
    spots: [["서울숲", "walk", 60, { n: 1 }], ["언더스탠드에비뉴", "sight", 30, { c: H(21) }], ["뚝섬한강공원", "walk", 50, { n: 1 }]] },
  yeonnam: { name: "연남·홍대", q: "연남동", in: 1, food: 2, near: ["mangwon"], season: [5, 9],
    spots: [["경의선숲길 연남동", "walk", 40, { n: 1 }], ["홍대 걷고싶은거리", "sight", 40, { n: 1 }], ["KT&G 상상마당 홍대", "show", 60, { o: H(12), c: H(22), i: 1 }]] },
  mangwon: { name: "망원", q: "망원동", in: 0, food: 2, near: ["yeonnam"], season: [4, 5, 6, 9, 10],
    spots: [["망원한강공원", "walk", 50, { n: 1 }], ["망원시장", "sight", 40, { o: H(10), c: H(20) }]] },
  ikseon: { name: "익선·종로", q: "익선동", in: 1, food: 2, near: ["euljiro", "bukchon"], season: [4, 10, 11],
    spots: [["익선동 한옥거리", "sight", 40, { n: 1 }], ["창덕궁", "show", 70, { o: H(9), c: H(17), off: 1 }], ["청계천 관수교", "walk", 40, { n: 1, label: "청계천" }], ["종묘", "show", 50, { o: H(9), c: H(17), off: 2 }]] },
  bukchon: { name: "북촌·삼청", q: "삼청동", in: 1, food: 1, near: ["seochon", "ikseon"], season: [4, 5, 10, 11],
    spots: [["북촌한옥마을", "sight", 50, { o: H(10), c: H(17) }], ["국립현대미술관 서울", "show", 90, { o: H(10), c: H(18), i: 1 }], ["정독도서관", "walk", 30, { o: H(9), c: H(18) }], ["삼청공원", "walk", 30, {}]] },
  seochon: { name: "서촌", q: "서촌", in: 0, food: 1, near: ["bukchon"], season: [4, 10, 11],
    spots: [["경복궁", "show", 80, { o: H(9), c: H(17), off: 2 }], ["통인시장", "sight", 30, { o: H(10), c: H(18) }], ["수성동계곡", "walk", 30, {}]] },
  euljiro: { name: "을지로", q: "을지로", in: 0, food: 2, near: ["ikseon"], season: [6, 7, 8, 9],
    spots: [["세운상가", "sight", 30, { c: H(22), n: 1 }], ["청계천 수표교", "walk", 40, { n: 1, label: "청계천" }], ["을지로 노가리골목", "sight", 30, { o: H(17), n: 1 }]] },
  hannam: { name: "한남·이태원", q: "한남동", in: 1, food: 2, near: ["namsan", "yongsan"], season: [3, 9],
    spots: [["리움미술관", "show", 90, { o: H(10), c: H(18), off: 1, i: 1 }], ["이태원 앤틱가구거리", "sight", 30, { c: H(20) }]] },
  namsan: { name: "남산·해방촌", q: "해방촌", in: 0, food: 1, near: ["hannam"], season: [4, 10, 11],
    spots: [["N서울타워", "view", 60, { o: H(10), c: H(23), n: 1, i: 1 }], ["남산공원", "walk", 50, { n: 1 }], ["해방촌 신흥시장", "sight", 30, { n: 1 }]] },
  jamsil: { name: "잠실·석촌", q: "송리단길", in: 2, food: 1, near: ["samseong"], season: [4, 12],
    spots: [["석촌호수", "walk", 50, { n: 1 }], ["롯데월드몰", "shop", 60, { o: H(10), c: H(22), i: 1 }], ["서울스카이", "view", 60, { o: H(10), c: H(22), i: 1, n: 1 }]] },
  yeouido: { name: "여의도", q: "여의도", in: 2, food: 1, near: ["mullae"], season: [4, 10],
    spots: [["여의도한강공원", "walk", 50, { n: 1 }], ["더현대 서울", "shop", 70, { o: H(10) + 30, c: H(20), i: 1 }], ["여의도공원", "walk", 30, { n: 1 }]] },
  sinsa: { name: "신사·압구정", q: "가로수길", in: 1, food: 2, near: ["banpo"], season: [3, 12],
    spots: [["신사동 가로수길", "sight", 40, { n: 1, at: [37.5207, 127.0229] }], ["도산공원", "walk", 30, { n: 1 }], ["압구정로데오거리", "sight", 30, { n: 1 }]] },
  hyehwa: { name: "혜화·대학로", q: "대학로", play: ["소극장 연극"], in: 0, food: 1, near: ["ikseon"], season: [5, 10, 11],
    spots: [["마로니에공원", "walk", 20, { n: 1 }], ["낙산공원", "view", 40, { n: 1 }], ["이화마을", "sight", 30, { o: H(10), c: H(18) }]] },
  mullae: { name: "문래", q: "문래동", in: 1, food: 1, near: ["yeouido"], season: [5, 9],
    spots: [["문래창작촌", "sight", 40, { n: 1 }], ["선유도공원", "walk", 50, { o: H(6), c: H(24), n: 1 }], ["타임스퀘어", "shop", 60, { o: H(10) + 30, c: H(22), i: 1 }]] },
  samseong: { name: "삼성·코엑스", q: "코엑스", in: 3, food: 1, near: ["jamsil"], season: [1, 2, 7, 8, 12],
    spots: [["별마당도서관", "sight", 30, { o: H(10) + 30, c: H(22), i: 1 }], ["코엑스아쿠아리움", "show", 90, { o: H(10), c: H(20), i: 1 }], ["봉은사", "walk", 30, { c: H(22) }]] },
  yongsan: { name: "용산", q: "용리단길", in: 2, food: 2, near: ["hannam"], season: [1, 2, 7, 8],
    spots: [["국립중앙박물관", "show", 100, { o: H(10), c: H(18), i: 1 }], ["용산가족공원", "walk", 30, {}], ["아이파크몰 용산점", "shop", 60, { o: H(10) + 30, c: H(22), i: 1 }]] },
  banpo: { name: "반포·서래", q: "서래마을", in: 1, food: 1, near: ["sinsa"], season: [5, 6, 7, 8, 9],
    spots: [["반포한강공원", "walk", 50, { n: 1 }], ["세빛섬", "view", 30, { n: 1 }], ["신세계백화점 강남점", "shop", 60, { o: H(10) + 30, c: H(20), i: 1 }]] },
  kondae: { name: "건대·뚝섬", q: "건대입구", in: 1, food: 2, near: ["seongsu"], season: [4, 5, 10],
    spots: [["커먼그라운드", "shop", 40, { o: H(11), c: H(22) }], ["서울어린이대공원", "walk", 50, { o: H(5), c: H(22) }]] }
};

const PICK_AS = { brunch: ["dessert"], sight: ["shop"] };

/* 종류: 이름, 머무는 분, 카카오 검색어(없으면 동네 명소만) */
const TYPES = {
  meal: ["식사", 60, ["맛집"]], brunch: ["브런치", 50, ["브런치", "베이글"]], cafe: ["카페", 50, ["카페", "디저트카페"]],
  dessert: ["디저트", 30, ["디저트", "베이커리", "소금빵"]], walk: ["산책", 40], sight: ["구경", 30], show: ["전시·팝업", 50, ["팝업스토어", "전시"]],
  play: ["놀거리", 60, ["방탈출", "보드게임카페", "오락실", "코인노래방", "공방", "만화카페"]], photo: ["사진", 20, ["인생네컷", "포토이즘", "포토그레이", "셀프사진관"]],
  shop: ["소품샵", 40, ["소품샵", "편집샵"]], view: ["야경", 30], bar: ["한잔", 70, ["포차", "요리주점", "이자카야"]], pick: ["가고 싶은 곳", 40]
};
const ICON = { meal: "🍽️", brunch: "🥯", cafe: "☕", dessert: "🍰", walk: "🌳", sight: "👀", show: "✨", play: "🎲", photo: "📸", shop: "🛍️", view: "🌃", bar: "🍻", pick: "💗" };
const PREFS = [["meal", "맛집"], ["cafe", "카페·디저트"], ["play", "놀거리"], ["photo", "인생네컷"], ["walk", "산책"], ["shop", "소품샵"], ["show", "팝업·전시"], ["view", "야경"], ["bar", "한잔"]];
const CHAIN = /스타벅스|투썸|이디야|메가MGC|메가커피|컴포즈|빽다방|할리스|파스쿠찌|커피빈|폴바셋|엔제리너스|맥도날드|버거킹|롯데리아|KFC|맘스터치|서브웨이|김밥천국|본죽|파리바게뜨|뚜레쥬르|배스킨|던킨|CU |GS25|세븐일레븐|이마트24|다이소|올리브영|교촌|BBQ|bhc|굽네|노랑통닭|백다방|더벤티|공차|설빙/;

/* ---------- 상태 ---------- */
const now = new Date();
const S = { room: null, me: "a", info: null, courses: [], photos: [], y: now.getFullYear(), m: now.getMonth(), sel: today(),
            unsub: [], view: null, draft: null, busy: false };
const name = w => S.info?.[w]?.name || (w === "a" ? "남자친구" : "여자친구");
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

/* ---------- 카카오맵 ---------- */
let kakaoP = null;
function kakaoReady() {
  if (kakaoP) return kakaoP;
  kakaoP = new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    s.onload = () => window.kakao ? kakao.maps.load(() => ok(kakao)) : no();
    s.onerror = no;
    document.head.append(s);
  });
  kakaoP.catch(() => { kakaoP = null; });
  return kakaoP;
}
const searchCache = new Map();
async function kSearch(query, at, radius = 2000) {
  const key = `${query}|${at ? at.lat.toFixed(3) + "," + at.lng.toFixed(3) + "," + radius : ""}`;
  if (searchCache.has(key)) return searchCache.get(key);
  const k = await kakaoReady();
  const ps = new k.maps.services.Places();
  const opt = { size: 15 };
  if (at) { opt.location = new k.maps.LatLng(at.lat, at.lng); opt.radius = radius; }
  const res = await new Promise(ok => ps.keywordSearch(query, (data, st) => ok(st === k.maps.services.Status.OK ? data : []), opt));
  const out = res.map(p => ({ id: p.id, name: p.place_name, lat: +p.y, lng: +p.x, url: p.place_url,
    addr: p.road_address_name || p.address_name, cat: p.category_name || "", g: p.category_group_code || "" }));
  searchCache.set(key, out);
  return out;
}
async function kStation(at) {
  const k = await kakaoReady();
  const ps = new k.maps.services.Places();
  const r = await new Promise(ok => ps.categorySearch("SW8", (d, st) => ok(st === k.maps.services.Status.OK ? d : []),
    { location: new k.maps.LatLng(at.lat, at.lng), radius: 1500, sort: k.maps.services.SortBy.DISTANCE }));
  return r[0] ? { name: r[0].place_name.split(" ")[0], lat: +r[0].y, lng: +r[0].x } : null;
}
const meetKey = s => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`;
async function meetOf(first) {
  const st = await kStation(first).catch(() => null);
  return st ? { ...st, min: Math.max(1, Math.round(dist(st, first) * 1.3 / 70)), for: meetKey(first) } : null;
}
/* 첫 장소가 바뀌면 만나는 역도 다시 */
const meetBusy = new Set();
async function ensureMeet(c) {
  const f = c.stops[0]; if (!f) return;
  const key = meetKey(f);
  if (c.meet?.for === key || meetBusy.has(key)) return;
  meetBusy.add(key);
  const m = await meetOf(f);
  meetBusy.delete(key);
  if (!m || c.stops[0] !== f) return;
  c.meet = m;
  if (S.view !== "draft" && c.id) updateDoc(ref("courses", c.id), { meet: m }).catch(() => {});
  if (viewCourse() === c) renderCourse();
}

/* 동네 명소 좌표(한 번 찾으면 기기에 저장) */
const ANCHOR_KEY = "urigil-anchors";
const anchors = store.get(ANCHOR_KEY) || {};
async function anchor([q, , , o]) {
  if (o.at) return { id: "", name: q, lat: o.at[0], lng: o.at[1], url: `https://map.kakao.com/?q=${encodeURIComponent(q)}`, addr: "", cat: "", g: "" };
  if (anchors[q]) return o.label ? { ...anchors[q], name: o.label, cat: "" } : anchors[q];
  const r = (await kSearch(q))[0];
  if (r && r.lat > 37.4 && r.lat < 37.7 && r.lng > 126.7 && r.lng < 127.2) { anchors[q] = r; store.set(ANCHOR_KEY, anchors); }
  return anchors[q] ? (o.label ? { ...anchors[q], name: o.label, cat: "" } : anchors[q]) : null;
}

/* ---------- 거리·길 ---------- */
function dist(a, b) {
  const R = 6371e3, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lng - a.lng) * t;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function legOf(a, b) {
  const d = dist(a, b) * 1.3;
  return d <= 1600 ? { mode: "walk", min: Math.max(3, Math.round(d / 70)), m: Math.round(d) }
                   : { mode: "ride", min: Math.round(12 + d / 380), m: Math.round(d) };
}
const PATH_KEY = "urigil-paths";
const paths = store.get(PATH_KEY) || {};
let pathQ = Promise.resolve();
const pending = new Map();
function walkPath(a, b) {
  const k = [a.lng, a.lat, b.lng, b.lat].map(v => v.toFixed(5)).join(",");
  if (paths[k]) return Promise.resolve(paths[k]);
  if (!pending.has(k)) {
    const job = pathQ.then(() => fetchPath(a, b, k));
    pathQ = job.then(() => new Promise(r => setTimeout(r, 1100)));
    pending.set(k, job); job.finally(() => pending.delete(k));
  }
  return pending.get(k);
}
async function fetchPath(a, b, k) {
  if (paths[k]) return paths[k];
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a.lng},${a.lat};${b.lng},${b.lat}?overview=simplified&geometries=geojson`, { signal: ctl.signal });
    const j = await r.json();
    const line = j.routes?.[0]?.geometry?.coordinates;
    if (!line) return null;
    paths[k] = line.map(([x, y]) => [+y.toFixed(5), +x.toFixed(5)]);
    const keys = Object.keys(paths); if (keys.length > 150) delete paths[keys[0]];
    store.set(PATH_KEY, paths);
    return paths[k];
  } catch { return null; }
}

/* ---------- 날씨(16일 안쪽만) ---------- */
async function weather(date, from, to) {
  if (diff(today(), date) < 0 || diff(today(), date) > 15) return null;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.978&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FSeoul&start_date=${date}&end_date=${date}`, { signal: ctl.signal });
    const h = (await r.json()).hourly;
    const hs = h.time.map((_, i) => i).filter(i => i >= Math.floor(from / 60) && i <= Math.min(23, Math.floor(to / 60)));
    if (!hs.length) return null;
    const p = Math.max(...hs.map(i => h.precipitation_probability[i] ?? 0));
    const temps = hs.map(i => h.temperature_2m[i]);
    const t = Math.round(temps.reduce((s, v) => s + v, 0) / temps.length);
    const code = Math.max(...hs.map(i => h.weather_code[i]));
    const icon = code >= 95 ? "⛈️" : code >= 71 && code <= 86 && !(code >= 80 && code <= 82) ? "❄️" : p >= 50 || code >= 51 ? "☔" : code >= 2 ? "⛅" : "☀️";
    return { label: `${icon} ${t}°${p >= 30 ? ` · 비 ${p}%` : ""}`, wet: p >= 55 || t <= -5 || t >= 32 };
  } catch { return null; }
}
/* 서울 해 지는 시각(분) — 태양 적위·균시차로 계산 */
function sunset(date) {
  const d = parse(date), n = (d - new Date(d.getFullYear(), 0, 0)) / 864e5, r = Math.PI / 180;
  const B = 2 * Math.PI * (n - 81) / 364, eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const dec = 23.44 * r * Math.sin(B), lat = 37.57 * r;
  const w = Math.acos((Math.sin(-.833 * r) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / r;
  return Math.round(720 + (135 - 126.98) * 4 - eot + w * 4);
}

/* ---------- 코스 짜기 ---------- */
function chooseArea(date, from, to, prefs, wet) {
  const mon = parse(date).getMonth() + 1, night = to >= sunset(date) + 30;
  const recent = new Set(S.courses.filter(c => Math.abs(diff(c.date, date)) <= 60).flatMap(c => [c.area, c.area2]));
  let best = null, bestS = -1e9;
  for (const [id, a] of Object.entries(AREAS)) {
    const types = new Set(a.spots.map(s => s[1]));
    let s = Math.random() * 2.2;
    if (a.season.includes(mon)) s += 1.6;
    if (wet) s += a.in * 1.4 - 1.5;
    if (prefs.includes("meal")) s += a.food * .5;
    for (const p of prefs) if (types.has(p)) s += .5;
    if (night && prefs.includes("view") && (types.has("view") || a.spots.some(x => x[3].n))) s += .8;
    if (recent.has(id)) s -= 2.6;
    if (to - from >= 420 && a.near.length) s += .4;
    if (s > bestS) { bestS = s; best = id; }
  }
  return best;
}

const opensAt = (o, t, stay, wd) => (o.off === undefined || o.off !== wd) && (o.o ?? 0) <= t && t + Math.min(stay, 40) <= (o.c ?? H(26));
const HOURS = { meal: [H(11), H(21)], brunch: [H(9), H(15)], cafe: [H(10), H(22)], dessert: [H(11), H(22)], show: [H(11), H(20)],
                play: [H(11), H(23)], photo: [H(9), H(26)], shop: [H(11), H(21)], bar: [H(17), H(26)] };

/* 별점 4.3 이하·후기 5개 미만(★5.0 후기 1개 같은 곳)은 웬만하면 빼기: 추천 목록 → 카카오에서 찾기 → 그래도 없을 때만. 네 컷 사진관은 후기가 원래 적어서 예외 */
const low = (id, type) => INFO[id]?.r <= 4.3 || (type !== "photo" && INFO[id]?.n < 5);
const fine = (list, id, type) => { list = list.filter(x => !(INFO[id(x)]?.r < 3.5)); const ok = list.filter(x => !low(id(x), type)); return ok.length ? ok : list; };   // 3.5 미만은 끝까지 안 넣음
/* 하루에 같은 종류 두 번 안 가기(코인노래방 두 번, 베이글 다음 식빵집 같은 것) */
const kindOf = (name, cat) => /베이커리|제과|빵|베이글|브레드|bread|bagel/i.test(name + cat) ? "빵" : cat;
async function fromPicks(type, ctx, t, lowOk) {
  const hrs = HOURS[type];
  if (hrs && (t < hrs[0] || t + 20 > hrs[1])) return null;
  const want = [type, ...(PICK_AS[type] || [])];
  const center = ctx.pos || await areaPos(ctx.area);
  const open = x => !HOURS[x[1]] || (t >= HOURS[x[1]][0] && t + 20 <= HOURS[x[1]][1]);
  const found = (PICKS[ctx.area] || []).filter(x => want.includes(x[1]) && open(x) && !closedWhy(x[6], ctx.date, t + 10, TYPES[type][1]) && !ctx.used.has(x[0]) && !ctx.used.has(x[6])
    && (!center || dist(center, { lat: x[4], lng: x[5] }) <= (ctx.pos ? 1500 : 3000)) && (lowOk ? !(INFO[x[6]]?.r < 3.5) : !low(x[6], type)) && !ctx.kinds?.has(kindOf(x[0], x[7])));
  if (!found.length) return null;
  const good = x => { const f = INFO[x[6]]; return f?.n ? Math.max(.4, (f.r * f.n + 31.2) / (f.n + 8) - 3.4) : .6; };
  const wt = x => (x[3] ? 1.3 : 1) * good(x) / (1 + (ctx.pos ? dist(ctx.pos, { lat: x[4], lng: x[5] }) / 700 : 0));
  let r = Math.random() * found.reduce((s2, x) => s2 + wt(x), 0), x = found[0];
  for (const f of found) if ((r -= wt(f)) <= 0) { x = f; break; }
  ctx.used.add(x[0]); ctx.used.add(x[6]); ctx.used.add(x[0].replace(/\s/g, ""));
  return { id: x[6], name: x[0], lat: x[4], lng: x[5], url: `https://place.map.kakao.com/${x[6]}`, addr: "", cat: x[7], g: "",
           stay: TYPES[type][1], why: x[2], hot: !!x[3] };
}
const findPlace = async (type, ctx, t) => await fromPicks(type, ctx, t) || await searchPlace(type, ctx, t) || fromPicks(type, ctx, t, true);
async function searchPlace(type, ctx, t) {
  const area = AREAS[ctx.area], wd = parse(ctx.date).getDay(), dark = t >= ctx.sun;
  const pool = type === "view" ? [area, ...area.near.map(n => AREAS[n])].flatMap(a => a.spots) : area.spots;
  let spots = pool.filter(s => (s[1] === type || (type === "view" && s[1] === "walk" && s[3].n))
    && !ctx.used.has(s[0]) && !ctx.used.has(s[3].label) && opensAt(s[3], t, s[2], wd) && (!dark || s[3].n || s[3].i));
  if (spots.length) {
    const far = type === "view" ? 3000 : 1600;
    const found = fine((await Promise.all(spots.map(s => anchor(s).then(p => p && { p, s })))).filter(x => x && !closedWhy(x.p.id, ctx.date, t + 10, x.s[2]) && !ctx.used.has(x.p.id) && !ctx.used.has(x.p.name.replace(/\s/g, "")) && (!ctx.pos || dist(ctx.pos, x.p) <= far) && !ctx.kinds?.has(kindOf(x.p.name, (x.p.cat || "").split(">").pop().trim()))), x => x.p.id, type);
    if (found.length) {
      const near = ctx.pos ? found.sort((x, y) => dist(ctx.pos, x.p) - dist(ctx.pos, y.p)) : found.sort(() => Math.random() - .5);
      const { p, s } = near[0];
      ctx.used.add(s[0]); ctx.used.add(p.name); ctx.used.add(p.name.replace(/\s/g, "")); if (p.id) ctx.used.add(p.id);
      return { ...p, stay: s[2], name: p.name };
    }
  }
  const words = type === "play" && area.play ? [...TYPES[type][2], ...area.play] : TYPES[type][2];
  if (!words) return null;
  const hrs = HOURS[type];
  if (hrs && (t < hrs[0] || t + 30 > hrs[1])) return null;
  const at = ctx.pos || await areaPos(ctx.area);
  if (!at) return null;
  const list = await kSearch(`${area.q} ${pick(words)}`, at, 1500);
  const ok = fine(list.filter(p => !closedWhy(p.id, ctx.date, t + 10, TYPES[type][1]) && !ctx.used.has(p.id) && !ctx.used.has(p.name) && !CHAIN.test(p.name) && fits(type, p) && !ctx.kinds?.has(kindOf(p.name, p.cat.split(">").pop().trim()))), p => p.id, type);
  if (!ok.length) return null;
  const scored = ok.map((p, i) => ({ p, s: i * .8 + dist(at, p) / 220 + Math.random() * 4
    + (ctx.lastCat && p.cat.split(">").pop().trim() === ctx.lastCat ? 6 : 0) })).sort((x, y) => x.s - y.s);
  const p = scored[0].p;
  ctx.used.add(p.id); ctx.used.add(p.name);
  return { ...p, stay: TYPES[type][1] };
}
function fits(type, p) {
  const c = p.cat;
  switch (type) {
    case "meal": return p.g === "FD6" && !/술집|카페|간식|제과|뷔페|코스요리|오마카세/.test(c);
    case "brunch": return (p.g === "FD6" || p.g === "CE7") && !/술집|주점/.test(c);
    case "cafe": return p.g === "CE7" && !/여가시설|만화|보드/.test(c);
    case "dessert": return (p.g === "CE7" || /간식|제과|디저트|베이커리|도넛|아이스크림/.test(c)) && !/여가시설/.test(c);
    case "bar": return /포장마차|요리주점|호프|이자카야|일본식주점|술집/.test(c) && !/와인|칵테일|바$/.test(c);
    case "show": return /팝업스토어|전시|미술관|박물관|문화시설/.test(c) && !/갤러리|화랑/.test(c + p.name);
    case "play": return /여가시설|방탈출|보드카페|오락실|노래방|만화카페|공방|미술,공예|볼링|체험|연극극장/.test(c) && !/화랑|갤러리|화방/.test(c);
    case "photo": return /즉석사진|셀프사진|셀프스튜디오/.test(c);
    case "shop": return p.g !== "FD6" && p.g !== "CE7" && (/소품|생활용품|잡화|문구|선물|인테리어|편집|팝업/.test(c) || /소품|편집|문구/.test(p.name)) && !/신발|의류|안경/.test(c);
    default: return true;
  }
}
async function areaPos(id) {
  for (const s of AREAS[id].spots) { const p = await anchor(s); if (p) return p; }
  return null;
}

function pickType(ctx, t, rem, last) {
  const no = k => ctx.no.has(k) && t - ctx.no.get(k) < 90;
  const P = ctx.prefs, has = p => P.includes(p), sinceRest = t - ctx.restAt;
  if (!ctx.lunch && t >= H(11) + 30 && t < H(14) && rem >= 55) return "meal";
  if (!ctx.dinner && t >= H(17) + 30 && t < H(20) + 30 && rem >= 55) return "meal";
  if (!ctx.lunch && t >= H(9) && t < H(11) + 30 && rem >= 50) return "brunch";
  const barOk = has("bar") && !ctx.bar && rem >= 60 && (t >= H(21) || (ctx.dinner && t >= H(19)));
  if (has("view") && !ctx.view && rem >= 30 && t >= ctx.sun + 15 && t < H(23) && (!barOk || rem >= 110)) return "view";
  if (barOk) return "bar";
  if (t >= H(23) + 30) return null;
  if (t < H(21) + 30 && ctx.cafes < 2 && !ctx.bar && !no("cafe") && !(last === "cafe" || last === "dessert")
      && (last === "meal" ? ctx.cafes === 0 || sinceRest >= 150 : (ctx.cafes === 0 && rem <= 100 && last !== "brunch") || sinceRest >= 170))
    return ctx.cafes && !ctx.dessert ? "dessert" : "cafe";
  if (has("photo") && !ctx.count.photo && t - ctx.from >= 80 && rem >= 45 && last !== "photo" && !no("photo") && Math.random() < .5) return "photo";
  const untilMeal = !ctx.lunch && t < H(11) + 30 && ctx.to >= H(13) ? H(11) + 50 - t : !ctx.dinner && t < H(17) + 30 && ctx.to >= H(19) ? H(17) + 50 - t : 999;
  const w = { walk: .9, sight: .6, show: .35, play: 1, shop: .6 };
  for (const k in w) {
    if (has(k === "sight" ? "shop" : k)) w[k] *= 3;
    if (ctx.wet) w[k] *= k === "walk" || k === "sight" ? .15 : 2;
    if ((ctx.count[k] || 0) >= (k === "walk" && ctx.len > 420 ? 2 : 1) || k === last || no(k)) w[k] = 0;
    if (k === "play" && (ctx.count.play || 0) < (ctx.len > 420 ? 2 : 1) && k !== last && !no(k)) w[k] = has("play") ? 3 : 1;
    if ((k === "show" || k === "play") && (rem < 60 || untilMeal < 65)) w[k] = 0;
  }
  const sum = Object.values(w).reduce((s, v) => s + v, 0);
  if (sum > 0) {
    let r = Math.random() * sum;
    for (const [k, v] of Object.entries(w)) if ((r -= v) <= 0) return k;
  }
  if (t < H(21) + 30 && ctx.cafes < 2 && !ctx.bar && last !== "cafe" && !no("cafe")) return "cafe";
  if (!ctx.dessert && t < H(21) && last !== "dessert" && !no("dessert")) return "dessert";
  if (has("photo") && !ctx.count.photo && !no("photo") && last !== "photo") return "photo";
  if (!ctx.dinner && t >= H(17) && t < H(20) + 30 && rem >= 55) return "meal";   // 17:30 전에 넣을 게 다 떨어져도 저녁 없이 끝내지 않음
  return null;
}

async function plan({ date, from, to, prefs, area: chosen, replaces }) {
  const len = to - from, w = await weather(date, from, to);
  const area = chosen || chooseArea(date, from, to, prefs, w?.wet);
  const a2 = len >= 420 && !chosen ? pick(AREAS[area].near) : null;
  const ctx = { date, area, prefs, wet: !!w?.wet, sun: sunset(date), used: new Set(), kinds: new Set(), count: {}, no: new Map(),
                lunch: from >= H(14), dinner: from >= H(20) + 30, cafes: 0, restAt: from, pos: null, len, to, from };
  const stops = [], legs = [];
  let t = from, last = null, switched = !a2, guard = 0;
  while (guard++ < 24) {
    if (!switched && t - from >= len * .45 && (last === "meal" || last === "cafe" || t - from >= len * .6)) {
      switched = true; ctx.area = a2; ctx.no.clear();
    }
    const rem = to - t;
    if (rem < 35) break;
    const type = pickType(ctx, t, rem, last);
    if (!type) break;
    const p = await findPlace(type, ctx, t);
    if (!p) { ctx.no.set(type, t); if (type === "meal") ctx[t < H(15) ? "lunch" : "dinner"] = true; if (type === "brunch") ctx.lunch = true;
              if (type === "view") ctx.view = true; if (type === "bar") ctx.bar = true; continue; }
    const leg = ctx.pos ? legOf(ctx.pos, p) : null;
    const at = leg ? r5(t + leg.min) : t;
    let stay = Math.min(p.stay, to - at);
    if (!["meal", "brunch", "bar"].includes(type)) {
      const nextMeal = !ctx.lunch && at < H(11) + 30 && to >= H(13) ? H(11) + 40 : !ctx.dinner && at < H(17) + 30 && to >= H(19) ? H(17) + 50 : null;
      if (nextMeal) stay = Math.min(stay, Math.max(25, nextMeal - at));
    }
    if (stay < Math.min(25, p.stay)) break;
    stay = Math.round(stay / 5) * 5;
    if (p.id && closedWhy(p.id, date, at, stay)) continue;   // 고를 땐 지금 시각으로 봤지만 이동해서 도착하면 브레이크 타임·마감일 수 있다 (이미 used라 다른 곳을 찾음)
    stops.push({ id: p.id || "", name: p.name, type, lat: p.lat, lng: p.lng, url: p.url || "", addr: p.addr || "", cat: (p.cat || "").split(">").pop().trim(), why: p.why || "", hot: !!p.hot, t: at, stay, likes: {} });
    legs.push(leg);
    ctx.kinds.add(kindOf(p.name, stops.at(-1).cat));
    ctx.count[type] = (ctx.count[type] || 0) + 1;
    if (type === "meal") { ctx[at < H(15) ? "lunch" : "dinner"] = true; ctx.restAt = at + stay; ctx.lastCat = stops.at(-1).cat; }
    if (type === "brunch") { ctx.lunch = true; ctx.restAt = at + stay; if (p.g === "CE7" || /카페|커피|디저트|빵/.test(kindOf(p.name, p.cat || ""))) ctx.cafes++; }
    if (type === "cafe" || type === "dessert") { ctx.cafes++; ctx.restAt = at + stay; if (type === "dessert") ctx.dessert = true; }
    if (type === "view") ctx.view = true;
    if (type === "bar") ctx.bar = true;
    if (type === "walk" && at >= ctx.sun) ctx.view = true;
    ctx.pos = p; last = type; t = at + stay;
  }
  const meet = stops[0] ? await meetOf(stops[0]) : null;
  return { date, from, to, meet, area, area2: a2 && switched ? a2 : null,
           prefs, picked: chosen || null, weather: w?.label || "", stops, legs, replaces: replaces || null };
}

/* ---------- 코스 점검: 짠 코스가 말이 되는지 규칙으로 따져 문제 목록을 낸다 (w = 무게, 합이 0이면 문제 없음).
   makeCourse가 여러 번 짜서 가장 나은 걸 고르고, 테스트(~/urigil-tools/course_test.py)도 같은 함수로 수백 개 코스를 검사한다 ---------- */
const CAFEISH = s => ["cafe", "dessert"].includes(s.type) || (s.type === "brunch" && /카페|커피|디저트|빵/.test(kindOf(s.name, s.cat || "")));
function checkCourse(c) {
  const out = [], add = (code, w, i, msg) => out.push({ code, w, i, msg });
  const st = c.stops, end = st.length ? st.at(-1).t + st.at(-1).stay : c.from, kinds = new Map();
  st.forEach((s, i) => {
    const f = INFO[s.id] || {}, k = kindOf(s.name, s.cat || ""), l = c.legs[i];
    if (s.type !== "pick" && kinds.has(k)) add("same-kind", 10, i, `${st[kinds.get(k)].name}와 같은 종류(${k})`);
    kinds.set(k, i);
    if (i && st[i - 1].type === s.type && s.type !== "pick") add("back-to-back", 8, i, `${TYPES[s.type][0]} 연달아`);
    const why = s.id ? closedWhy(s.id, c.date, s.t, s.stay) : "";
    if (why) add("closed", 10, i, { off: "쉬는 날", shut: "닫힌 시간", break: "브레이크 타임" }[why]);
    if (f.r && f.r < 3.5) add("bad-star", 10, i, `★${f.r}`);
    else if (f.r && f.r <= 4.3 && !FREE.includes(s.type)) add("low-star", 2, i, `★${f.r}`);
    if (f.n < 5 && s.type !== "photo") add("few-reviews", 2, i, `후기 ${f.n}개`);
    if (!pic(s)) add("no-photo", 1, i, "사진 없음");
    if (s.type === "meal" && !((s.t >= H(11) && s.t <= H(14) + 30) || (s.t >= H(17) && s.t <= H(20) + 30))) add("meal-time", 8, i, `${hm(s.t)}에 식사`);
    if (s.type === "bar" && s.t < H(18)) add("bar-early", 8, i, `${hm(s.t)}에 술집`);
    if (s.stay < 20) add("short-stay", 4, i, `${s.stay}분만 머묾`);
    if (l?.mode === "walk" && l.min > 20) add("long-walk", 5, i, `걸어서 ${l.min}분`);
    if (l?.mode === "ride" && l.min > 35) add("long-ride", 5, i, `이동 ${l.min}분`);
  });
  const cafes = st.filter(CAFEISH).length;
  if (cafes > 2) add("cafes", 10, -1, `카페·디저트 ${cafes}번`);
  const covers = (a, b) => c.from <= a && c.to >= b;
  if (covers(H(12), H(13) + 30) && !st.some(s => ["meal", "brunch"].includes(s.type) && s.t >= H(10) + 30 && s.t <= H(14) + 30)) add("no-lunch", 10, -1, "점심이 없음");
  if (covers(H(18), H(19) + 30) && !st.some(s => ["meal", "bar"].includes(s.type) && s.t >= H(17) && s.t <= H(20) + 30)) add("no-dinner", 10, -1, "저녁이 없음");
  const walk = c.legs.reduce((m, l) => m + (l?.mode === "walk" ? l.m : 0), 0);
  if (walk > 1300 * (c.to - c.from) / 60 + 1500) add("walk-total", 4, -1, `하루 걷기 ${(walk / 1000).toFixed(1)}km`);
  if (c.to - end > 90) add("early-end", 3, -1, `${hm(end)}에 끝남`);
  if (st.length > Math.ceil((c.to - c.from) / 55)) add("too-many", 3, -1, `${st.length}곳`);
  return out;
}
const scoreOf = c => checkCourse(c).reduce((n, p) => n + p.w, 0);

/* 장소를 바꾸거나 넣고 뺀 뒤 시간 다시 맞추기 */
function retime(c) {
  let t = c.from;
  c.legs = c.stops.map((s, i) => {
    const leg = i ? legOf(c.stops[i - 1], s) : null;
    s.t = leg ? r5(t + leg.min) : t;
    t = s.t + s.stay;
    return leg;
  });
}
async function swapStop(c, i) {
  const s = c.stops[i];
  const ctx = { date: c.date, area: c.area2 && i >= c.stops.length / 2 ? c.area2 : c.area, prefs: c.prefs || [], sun: sunset(c.date),
                used: new Set(c.stops.flatMap(x => [x.id, x.name])), kinds: new Set(c.stops.filter((_, j) => j !== i).map(x => kindOf(x.name, x.cat))),
                pos: c.stops[i - 1] || c.stops[i + 1] || null, lastCat: s.cat };
  const type = s.type === "pick" ? "cafe" : s.type;
  let p = await findPlace(type, ctx, s.t);
  if (!p && type === "view") p = await findPlace("walk", ctx, s.t);
  if (!p) return false;
  c.stops[i] = { ...s, id: p.id || "", name: p.name, lat: p.lat, lng: p.lng, url: p.url || "", addr: p.addr || "", cat: (p.cat || "").split(">").pop().trim(), why: p.why || "", hot: !!p.hot, likes: {} };
  retime(c);
  return true;
}

/* ---------- 그리기 ---------- */
function render() {
  if (!S.info) return;
  renderHead(); renderCal(); renderAgenda(); renderUs();
  if (!$("tab-course").hidden) renderCourse();
}
const upcomingCourse = () => S.courses.filter(c => !c.done && c.date >= today()).sort((x, y) => x.date.localeCompare(y.date) || x.from - y.from)[0];
const areaName = c => AREAS[c.area]?.name + (c.area2 ? ` → ${AREAS[c.area2]?.name}` : "");
function renderHead() {
  const n = upcomingCourse();
  if (n) {
    const left = diff(today(), n.date);
    $("hD").textContent = left ? `D-${left}` : "D-DAY";
    $("hNext").textContent = left ? `${mdw(n.date)} · ${AREAS[n.area]?.name}` : `오늘 ${hm(n.from)} · ${AREAS[n.area]?.name}`;
  } else {
    const st = S.info.start, d = st ? diff(st, today()) + 1 : 0;
    $("hD").textContent = d > 0 ? `D+${d}` : "우리길";
    $("hNext").textContent = "다음 데이트 짜 볼까요?";
  }
  const p = curPhoto(), pic = $("hPic");
  pic.style.backgroundImage = p ? `url("${p.data}")` : ""; pic.classList.toggle("has", !!p);
}
const coursesOn = d => S.courses.filter(c => c.date === d).sort((x, y) => x.from - y.from);
function renderCal() {
  const { y, m } = S;
  $("mTitle").textContent = `${y}. ${pad(m + 1)}`;
  const first = new Date(y, m, 1), t = today();
  let html = "";
  for (let i = 0; i < 42; i++) {
    const dt = new Date(y, m, 1 - first.getDay() + i), d = ymd(dt), cs = coursesOn(d);
    const cls = ["day", dt.getMonth() !== m && "out", dt.getDay() === 0 && "sun", d === t && "today", d === S.sel && "sel"].filter(Boolean).join(" ");
    html += `<button type="button" class="${cls}" data-d="${d}" aria-label="${md(d)}"><span class="n">${dt.getDate()}</span>`
      + cs.slice(0, 2).map(c => `<span class="bar${c.done ? " done" : ""}">${esc(AREAS[c.area]?.name.split("·")[0])}</span>`).join("") + `</button>`;
  }
  $("grid").innerHTML = html;
}
/* 장소 사진: 카카오맵 사진 칸(음식·분위기·외관)에서 고른 최대 4장 (img/{id}.webp, {id}-2… , INFO.p = 장 수, photos.py) */
const pic = s => INFO[s.id]?.p ? `img/${encodeURIComponent(s.id)}.webp` : "";
function gallery(s) {   // 옆으로 넘기거나 누르면 다음 장
  const n = INFO[s.id].p, imgs = Array.from({ length: n }, (_, i) => `<img src="img/${encodeURIComponent(s.id)}${i ? `-${i + 1}` : ""}.webp" alt="" loading="lazy" decoding="async">`).join("");
  return n > 1 ? `<div class="gal">${imgs}</div><span class="gdots">${"<i></i>".repeat(n)}</span>` : imgs;
}
/* 영업시간: INFO.h = 일~토 [여는, 닫는, 브레이크 시작, 끝, 주문 마감](분), 0 = 쉬는 날 */
const hoursOn = (id, date) => INFO[id]?.h?.[parse(date).getDay()];
function closedWhy(id, date, t, stay) {
  const h = hoursOn(id, date), end = t + Math.min(stay, 40);
  if (h == null) return "";
  if (h === 0) return "off";
  const [o, c, bs, be] = h;
  if (t < o || end > c) return "shut";
  return bs != null && t < be && end > bs ? "break" : "";
}
const won = n => n >= 10000 ? `${+(n / 10000).toFixed(1)}만 원` : `${Math.max(1, Math.round(n / 1000))}천 원`;
const FREE = ["walk", "view", "sight"];
function courseCard(c) {
  const more = c.stops.length - 5;
  return `<button type="button" class="ccard${c.done ? " done" : ""}" data-c="${esc(c.id)}">
    <span class="cc-pics">${c.stops.slice(0, 5).map(s => pic(s) ? `<img src="${pic(s)}" alt="" loading="lazy">` : `<i>${ICON[s.type]}</i>`).join("")}${more > 0 ? `<i class="more">+${more}</i>` : ""}</span>
    <b class="cc-top">${esc(areaName(c))}</b>
    <small>${mdw(c.date)} · ${hm(c.from)}–${hm(c.to)} · ${c.stops.length}곳${c.done ? " · 다녀옴" : ""}</small>
    <span class="cc-route">${c.stops.map(s => esc(s.name)).join(" → ")}</span></button>`;
}
function renderAgenda() {
  const d = S.sel, cs = coursesOn(d);
  $("agenda").innerHTML = `<div class="ahead"><h3>${mdw(d)}요일</h3></div>`
    + cs.map(courseCard).join("")
    + `<button type="button" class="addbtn" data-plan>+ 이 날 데이트 짜기</button>`;
}

function renderUs() {
  const done = S.courses.filter(c => c.done), seen = new Set(done.flatMap(c => [c.area, c.area2]).filter(Boolean));
  $("stats").innerHTML = `<div><b>${done.length}</b><small>다녀온 데이트</small></div><div><b>${seen.size}<i>/${Object.keys(AREAS).length}</i></b><small>가 본 동네</small></div>`;
  $("areaDots").innerHTML = Object.entries(AREAS).map(([id, a]) => `<span class="${seen.has(id) ? "on" : ""}">${a.name}</span>`).join("");
  const list = [...S.courses].sort((x, y) => y.date.localeCompare(x.date));
  $("courseList").innerHTML = list.length ? list.map(courseCard).join("") : `<p class="empty">달력에서 날짜를 누르고 첫 코스를 짜 보세요.</p>`;
  const set = (id, v) => { if (document.activeElement !== $(id)) $(id).value = v; };
  set("sA", name("a")); set("sB", name("b"));
  $("sCode").textContent = S.room;
  const on = curPhoto()?.id;
  $("picList").innerHTML = S.photos.map(p =>
    `<div class="pic${p.id === on ? " on" : ""}" style="background-image:url('${esc(p.data)}')">`
    + `<button type="button" data-pic="${esc(p.id)}" aria-label="맨 위에 걸기"></button>`
    + `<button type="button" class="x" data-pdel="${esc(p.id)}" aria-label="사진 지우기">×</button></div>`).join("");
}

/* ---------- 코스 화면 ---------- */
const viewCourse = () => S.view === "draft" ? S.draft : S.courses.find(c => c.id === S.view);
function renderCourse() {
  const c = viewCourse(), head = $("cHead"), body = $("cBody");
  if (S.busy) {
    $("mapWrap").hidden = true;
    head.innerHTML = "";
    body.innerHTML = `<div class="making"><span class="dots"><i></i><i></i><i></i></span><b>코스 짜는 중</b></div>`;
    return;
  }
  if (!c) {
    $("mapWrap").hidden = true; head.innerHTML = "";
    body.innerHTML = `<div class="blank"><p>날짜와 시간을 고르면 코스를 짜 줘요.</p><button type="button" class="big" data-plan>데이트 짜기</button></div>`;
    return;
  }
  const draft = S.view === "draft", nowM = c.date === today() ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
  const walkM = c.legs.reduce((s, l) => s + (l?.mode === "walk" ? l.m : 0), 0);
  const cost = c.stops.reduce((n, s) => n + (INFO[s.id]?.c || 0), 0), costMore = c.stops.some(s => !INFO[s.id]?.c && !FREE.includes(s.type));
  head.innerHTML = `<div class="chead"><small>${mdw(c.date)}요일 · ${hm(c.from)}–${hm(c.to)}</small>
    <h2>${esc(areaName(c))}</h2>
    ${c.meet ? `<a class="meet" href="https://map.kakao.com/link/to/${encodeURIComponent(clean(c.meet.name))},${c.meet.lat},${c.meet.lng}" target="_blank" rel="noopener"><span class="flag">출발</span><span><b>${esc(c.meet.name)}에서 만나요</b><small>${hm(c.from)} · ${esc(c.stops[0].name)}까지 ${c.meet.min > 15 ? `버스·택시 ${Math.round(6 + c.meet.min / 3)}분` : `걸어서 ${c.meet.min}분`}</small></span><em>길찾기</em></a>` : ""}
    <div class="chips">${c.weather ? `<span class="chip">${esc(c.weather)}</span>` : ""}<span class="chip">걷기 ${(walkM / 1000).toFixed(1)}km</span>${cost ? `<span class="chip">둘이 약 ${won(cost)}${costMore ? "+" : ""}</span>` : ""}${draft ? `<span class="chip new">미리보기</span>` : ""}</div></div>`;
  $("mapWrap").hidden = false;
  body.innerHTML = `<ol class="stops">${c.stops.map((s, i) => {
      const l = c.legs[i], live = nowM >= s.t && nowM < s.t + s.stay;
      const likes = ["a", "b"].map(w => `<button type="button" class="heart ${w}${s.likes?.[w] ? " on" : ""}" data-like="${i}" data-w="${w}" ${w === S.me ? "" : "disabled"} aria-label="${esc(name(w))} 좋아요">♥</button>`).join("");
      return (l ? `<li class="leg ${esc(l.mode)}"><span>${l.mode === "walk" ? `걸어서 ${l.min}분 · ${l.m < 1000 ? l.m + "m" : (l.m / 1000).toFixed(1) + "km"}` : `지하철·택시 ${l.min}분 정도`}</span>`
          + `<a href="${esc(routeUrl(c.stops[i - 1], s, l.mode))}" target="_blank" rel="noopener">길찾기</a></li>` : "")
        + `<li class="stop${live ? " now" : ""}${s.likes?.a && s.likes?.b ? " both" : ""}" data-i="${i}">
          <div class="ph${pic(s) ? "" : " none"}">${pic(s) ? gallery(s) : `<span class="ph-ico">${ICON[s.type]}</span>`}
            <span class="when"><span class="num">${i + 1}</span><b>${hm(s.t)}</b><small>${s.stay}분</small></span>
            ${live ? `<em class="tag now">지금 여기</em>` : s.hot ? `<em class="tag">요즘 뜨는 곳</em>` : ""}</div>
          <div class="sbody">${stopText(s, c.date)}
            <div class="sacts"><span class="links">${INFO[s.id]?.mn ? `<button type="button" data-menu="${i}">메뉴</button>` : ""}${/^https?:\/\//.test(s.url || "") ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">카카오맵</a>` : ""}<a href="https://map.naver.com/p/search/${encodeURIComponent(s.name)}" target="_blank" rel="noopener">네이버지도</a>${FREE.includes(s.type) ? "" : `<button type="button" data-rev="${i}">후기</button>`}</span>${likes}<button type="button" data-swap="${i}">바꾸기</button><button type="button" data-drop="${i}">빼기</button></div></div></li>`;
    }).join("")}</ol>
    <button type="button" class="addbtn" data-addplace>+ 가고 싶은 곳 넣기</button>
    ${c.done ? `<div class="notes">${["a", "b"].map(w => `<div class="note ${w}"><span class="by ${w}">${esc(name(w))}</span><p>${esc(c.notes?.[w] || "아직 한 줄이 없어요")}</p></div>`).join("")}</div>` : ""}
    <div class="acts course-acts">${draft
      ? `<button type="button" class="big ghost" data-again>다시 짜기</button><button type="button" class="big" data-keep>이걸로 정하기</button>`
      : `<button type="button" class="del" data-cdel>지우기</button><button type="button" class="big ghost" data-again>다시 짜기</button><button type="button" class="big" data-done>${c.done ? "한 줄 고치기" : "다녀왔어요"}</button>`}</div>`;
  drawMap(c);
  ensureMeet(c);
}
function hoursLine(s, date) {
  const h = hoursOn(s.id, date);
  if (h == null) return "";
  if (h === 0) return `<p class="hours bad">${WEEK[parse(date).getDay()]}요일은 쉬는 날이에요</p>`;
  const [o, c, bs, be, lo] = h, why = closedWhy(s.id, date, s.t, s.stay);
  const open = o === 0 && c >= H(24) ? "24시간" : `${hm(o)}–${hm(c)}`;
  return `<p class="hours${why ? " bad" : ""}">${why === "break" ? "브레이크타임에 걸려요 · " : why ? "이 시간엔 문을 닫아요 · " : ""}${open}${bs != null ? ` · 브레이크 ${hm(bs)}–${hm(be)}` : ""}${lo ? ` · 주문 마감 ${hm(lo)}` : ""}</p>`;
}
function stopText(s, date) {
  const f = INFO[s.id] || {}, what = f.s || s.why, kind = `${ICON[s.type]} ${TYPES[s.type][0]}${s.cat && s.cat !== TYPES[s.type][0] ? ` · ${esc(s.cat)}` : ""}`;
  const tip = s.why && s.why !== what && s.why !== s.cat && !/^(한식|양식|카페|제과·베이커리)$/.test(s.why) ? s.why : f.k;
  const facts = [f.r && !(f.n < 5) ? `<span class="star">★ ${f.r.toFixed(1)}</span>` : "", f.n ? `<span>후기 ${f.n.toLocaleString()}</span>` : "", f.c ? `<span class="cost">둘이 약 ${won(f.c)}</span>` : "", f.b ? `<span class="rank">${esc(f.b)}</span>` : ""].join("");
  return `<small class="kind">${kind}</small><b class="nm">${esc(s.name)}</b>
    ${what ? `<p class="what">${esc(what)}</p>` : ""}
    ${facts ? `<p class="facts">${facts}</p>` : ""}
    ${f.u ? `<p class="extra"><span>대표 메뉴</span>${esc(f.u)}</p>` : tip ? `<p class="extra"><span>추천</span>${esc(tip)}</p>` : ""}
    ${f.m ? `<p class="extra"><span>분위기</span>${esc(f.m)}</p>` : ""}
    ${hoursLine(s, date)}`;
}
let menusP = null;
const menus = () => menusP ||= fetch("menus.json").then(r => r.json()).catch(() => { menusP = null; return {}; });
/* 식당 메뉴판처럼: 종이 위에 이름 ····· 값, 추천은 '대표' 칸으로 먼저. 휴대폰은 한 단, 넓은 화면은 두 단 */
async function openMenu(s) {
  openSheet(`<div class="menu-paper"><p class="mp-top">MENU</p><h3>${esc(s.name)}</h3>
    <div class="mlist" id="mList"><p class="empty">불러오는 중…</p></div></div>
    <button class="big ghost" type="submit">닫기</button>`, null);
  const m = (await menus())[s.id] || [];
  if (!$("mList")) return;
  const row = ([n, p, d]) => `<div class="mi${d ? " has" : ""}"><p><b>${esc(n)}</b><i></i><span>${esc(/^[\d,]+원$/.test(p) ? p.slice(0, -1) : p)}</span></p>${d ? `<small>${esc(d)}</small>` : ""}</div>`;
  const best = m.filter(x => x[3]), rest = m.filter(x => !x[3]);
  $("mList").innerHTML = !m.length ? `<p class="empty">등록된 메뉴가 없어요</p>`
    : best.length && rest.length ? `<h4>대표</h4>${best.map(row).join("")}<h4>메뉴</h4>${rest.map(row).join("")}` : m.map(row).join("");
  $("mList").onclick = e => e.target.closest(".mi.has")?.classList.toggle("open");   // 설명은 누르면 펼침
}
/* 블로그 후기: 장소마다 최대 10개, 제목·두 줄·출처 링크 (reviews/{id}.json, 카카오 검색 API, media.py). 더 보기는 각 서비스 검색으로 */
const revUrl = u => /^https?:/.test(u) ? u : `https://blog.naver.com/${u}`;
async function openReviews(s) {
  const q = encodeURIComponent(s.name);
  openSheet(`<h3>${esc(s.name)} 후기</h3><div class="rlist" id="rList"><p class="empty">불러오는 중…</p></div>
    <p class="rmore"><a href="https://search.naver.com/search.naver?ssc=tab.blog.all&query=${q}" target="_blank" rel="noopener">네이버 블로그</a><a href="https://www.instagram.com/explore/search/keyword/?q=${q}" target="_blank" rel="noopener">인스타그램</a><a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">유튜브</a></p>
    <button class="big ghost" type="submit">닫기</button>`, null);
  const r = await fetch(`reviews/${s.id}.json`).then(x => x.ok ? x.json() : []).catch(() => []);
  if (!$("rList")) return;
  $("rList").innerHTML = r.length ? r.map(x => `<a class="rv" href="${esc(revUrl(x.u))}" target="_blank" rel="noopener"><small>${esc(x.b)} · ${esc(x.w.replaceAll("-", "."))}</small><b>${esc(x.t)}</b><span>${esc(x.d)}</span></a>`).join("")
    : `<p class="empty">아직 모은 후기가 없어요. 아래에서 찾아보세요</p>`;
}
const clean = s => String(s).replace(/[,/]/g, " ");
const routeUrl = (a, b, mode) => `https://map.kakao.com/link/by/${mode === "walk" ? "walk" : "traffic"}/${encodeURIComponent(clean(a.name))},${a.lat},${a.lng}/${encodeURIComponent(clean(b.name))},${b.lat},${b.lng}`;

let map = null, drawn = [], drawId = 0, drawnSig = "";
async function drawMap(c) {
  const css = getComputedStyle(document.documentElement), acc = css.getPropertyValue("--acc-ink").trim(), soft = css.getPropertyValue("--soft").trim();
  const sig = c.stops.map(s => `${s.lat},${s.lng}`).join("|") + acc + (c.meet ? c.meet.name : "");
  if (map && sig === drawnSig) return map.relayout();
  const my = ++drawId;
  let k;
  try { k = await kakaoReady(); } catch { $("map").innerHTML = `<p class="maperr">지도를 불러오지 못했어요</p>`; return; }
  if (my !== drawId) return;
  drawnSig = sig;
  if (!map) map = new k.maps.Map($("map"), { center: new k.maps.LatLng(37.55, 126.99), level: 6 });
  map.relayout();
  drawn.forEach(o => o.setMap(null)); drawn = [];
  const bounds = new k.maps.LatLngBounds(), L = s => new k.maps.LatLng(s.lat, s.lng);
  c.stops.forEach((s, i) => {
    const el = document.createElement("button");
    el.type = "button"; el.className = pic(s) ? "pin has" : "pin"; el.innerHTML = (pic(s) ? `<img src="${pic(s)}" alt="">` : "") + `<span>${i + 1}</span>`; el.onclick = () => focusStop(i);
    drawn.push(new k.maps.CustomOverlay({ position: L(s), content: el, yAnchor: 1.1, zIndex: 3, map }));
    bounds.extend(L(s));
  });
  if (c.meet && c.stops[0]) {
    const el = document.createElement("div"); el.className = "startpin"; el.textContent = `출발 · ${c.meet.name}`;
    drawn.push(new k.maps.CustomOverlay({ position: L(c.meet), content: el, yAnchor: 1.4, zIndex: 4, map }));
    const first = c.stops[0], line = new k.maps.Polyline({ map, path: [L(c.meet), L(first)], strokeWeight: 4, strokeColor: soft, strokeOpacity: .9, strokeStyle: "shortdot" });
    drawn.push(line); bounds.extend(L(c.meet));
    walkPath(c.meet, first).then(p => { if (p && my === drawId) line.setPath([L(c.meet), ...p.map(([lat, lng]) => new k.maps.LatLng(lat, lng)), L(first)]); });
  }
  const fit = () => { map.relayout(); if (c.stops.length) map.setBounds(bounds, 40, 30, 40, 30); };
  fit(); requestAnimationFrame(fit); setTimeout(fit, 350);
  for (let i = 1; i < c.stops.length; i++) {
    const a = c.stops[i - 1], b = c.stops[i], walk = c.legs[i]?.mode === "walk";
    const line = new k.maps.Polyline({ map, path: [L(a), L(b)], strokeWeight: walk ? 5 : 4, strokeColor: walk ? acc : soft, strokeOpacity: .85, strokeStyle: walk ? "solid" : "shortdash" });
    drawn.push(line);
    if (walk) walkPath(a, b).then(p => { if (p && my === drawId) line.setPath([L(a), ...p.map(([lat, lng]) => new k.maps.LatLng(lat, lng)), L(b)]); });
  }
}
function focusStop(i) {
  const el = document.querySelector(`.stop[data-i="${i}"]`); if (!el) return;
  el.scrollIntoView({ behavior: calm.matches ? "auto" : "smooth", block: "center" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
}

/* ---------- 아래 창 ---------- */
const sheet = $("sheet"), sheetForm = $("sheetForm");
let onSheetSubmit = null;
function openSheet(html, onSubmit, init) {
  sheetForm.innerHTML = html; onSheetSubmit = onSubmit; init?.(); sheet.showModal();
}
function closeSheet() {
  if (calm.matches || !sheet.animate) return sheet.close();
  sheet.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(60px)", opacity: 0 }], { duration: 200, easing: "ease-in" })
    .finished.then(() => sheet.close());
}
sheetForm.addEventListener("submit", e => { e.preventDefault(); if (onSheetSubmit?.() !== false) closeSheet(); });
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
function seg(box, attr) {
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    box.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    box.dataset.v = b.dataset[attr];
  });
}

const TIMES = Array.from({ length: 41 }, (_, i) => H(6) + i * 30);
const tLabel = m => m >= H(24) ? `새벽 ${hm(m)}` : hm(m);
function openPlanSheet(date, base) {
  const last = store.get("urigil-last") || {};
  const prefs = base?.prefs || store.get("urigil-prefs") || ["meal", "cafe", "play", "photo", "walk"];
  const from = base?.from ?? last.from ?? H(13), to = base?.to ?? last.to ?? H(20);
  openSheet(`<h3>데이트 짜기</h3>
    <label>날짜 <input type="date" id="pD" required></label>
    <div class="two"><label>몇 시부터 <select id="pF">${TIMES.slice(0, -2).map(m => `<option value="${m}">${tLabel(m)}</option>`).join("")}</select></label>
      <label>몇 시까지 <select id="pT">${TIMES.slice(2).map(m => `<option value="${m}">${tLabel(m)}</option>`).join("")}</select></label></div>
    <span class="flabel">하고 싶은 것</span>
    <div class="chipset" id="pP">${PREFS.map(([k, l]) => `<button type="button" data-p="${k}" class="${prefs.includes(k) ? "on" : ""}">${ICON[k]} ${l}</button>`).join("")}</div>
    <span class="flabel">동네</span>
    <div class="chipset one" id="pA"><button type="button" data-a="" class="on">알아서</button>${Object.entries(AREAS).map(([id, a]) => `<button type="button" data-a="${id}">${a.name}</button>`).join("")}</div>
    <div class="acts"><button class="big" type="submit">짜 줘</button></div>`,
  () => {
    const f = +$("pF").value, t = +$("pT").value;
    if (t - f < 60) { toast("한 시간은 넘게 잡아 주세요"); return false; }
    const ps = [...$("pP").querySelectorAll(".on")].map(b => b.dataset.p);
    store.set("urigil-prefs", ps); store.set("urigil-last", { from: f, to: t });
    makeCourse({ date: $("pD").value, from: f, to: t, prefs: ps, area: $("pA").querySelector(".on").dataset.a || null, replaces: base?.id || null });
  }, () => {
    $("pD").value = date; $("pF").value = from; $("pT").value = to;
    $("pP").addEventListener("click", e => { const b = e.target.closest("button"); if (b) b.classList.toggle("on"); });
    $("pA").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $("pA").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    if (base?.area) $("pA").querySelector(`[data-a="${base.area}"]`)?.click();
  });
}
async function makeCourse(opts) {
  S.busy = true; S.view = "draft"; showTab("course");
  try {
    let best = null;   // 최대 4번 짜서 점검 점수가 가장 낮은 것 (문제 없으면 바로)
    for (let k = 0; k < 4 && !(best?.score === 0); k++) {
      const c = await plan(opts);
      c.score = scoreOf(c);
      if (c.stops.length >= 2 && (!best || c.score < best.score)) best = c;
    }
    if (!best) throw new Error("few");
    S.draft = best;
  } catch (e) {
    S.view = opts.replaces || null;
    toast(e?.message === "few" ? "코스를 못 짰어요. 시간을 늘리거나 동네를 바꿔 보세요." : "장소를 찾지 못했어요. 인터넷을 확인해 주세요.");
  }
  S.busy = false; renderCourse(); appear($("tab-course"));
}
function eventFor(c) {
  return { title: `${AREAS[c.area]?.name} 데이트`, date: c.date, end: "", time: c.from < H(24) ? hm(c.from) : "", who: "both",
           memo: c.stops.map(s => s.name).join(" → ").slice(0, 80) };
}
async function keepDraft() {
  const c = S.draft; if (!c) return;
  const data = { date: c.date, from: c.from, to: c.to, meet: c.meet || null, area: c.area, area2: c.area2 || null, prefs: c.prefs, picked: c.picked || null,
                 weather: c.weather, stops: c.stops, legs: c.legs, done: false, by: S.me, at: Date.now() };
  try {
    if (c.replaces && S.courses.some(x => x.id === c.replaces)) {
      const old = S.courses.find(x => x.id === c.replaces);
      await updateDoc(ref("courses", c.replaces), { ...data, done: old.done || false });
      if (old.eventId) updateDoc(ref("events", old.eventId), eventFor(c)).catch(() => {});
      S.view = c.replaces;
    } else {
      const d = doc(col("courses")), ev = doc(col("events"));
      await setDoc(d, { ...data, eventId: ev.id });
      setDoc(ev, { ...eventFor(c), by: S.me, at: Date.now(), course: d.id }).catch(() => {});
      S.view = d.id;
    }
    S.draft = null; toast("저장했어요");
    S.sel = c.date; const dt = parse(c.date); S.y = dt.getFullYear(); S.m = dt.getMonth();
    render();
  } catch { fail(); }
}
function saveCourse(c) {
  if (S.view === "draft") return renderCourse();
  updateDoc(ref("courses", c.id), { stops: c.stops, legs: c.legs }).catch(fail);
  if (c.eventId) updateDoc(ref("events", c.eventId), { memo: eventFor(c).memo }).catch(() => {});
  renderCourse();
}
function openDone(c) {
  openSheet(`<h3>${esc(areaName(c))}, 어땠어요?</h3>
    <label>내 한 줄 <input id="dN" maxlength="60" autocomplete="off" placeholder="오늘 제일 좋았던 것"></label>
    <div class="acts">${c.done ? `<button type="button" class="del" id="dUndo">아직 안 갔어요</button>` : ""}<button class="big" type="submit">남기기</button></div>`,
  () => {
    updateDoc(ref("courses", c.id), { done: true, [`notes.${S.me}`]: $("dN").value.trim() }).catch(fail);
    toast("남겼어요");
  }, () => {
    $("dN").value = c.notes?.[S.me] || "";
    $("dUndo")?.addEventListener("click", () => { updateDoc(ref("courses", c.id), { done: false }).catch(fail); closeSheet(); });
  });
}
function openAddPlace(c) {
  openSheet(`<h3>가고 싶은 곳 넣기</h3>
    <div class="inline"><input id="qIn" required maxlength="40" autocomplete="off" placeholder="가게·장소 이름"><button class="add" type="submit">찾기</button></div>
    <div class="results" id="qRes"></div>`,
  () => {
    const q = $("qIn").value.trim(); if (!q) return false;
    const at = c.stops[0];
    $("qRes").innerHTML = `<p class="empty">찾는 중…</p>`;
    kSearch(q, at, 8000).then(r => r.length ? r : kSearch(q)).then(r => {
      $("qRes").innerHTML = r.length ? r.slice(0, 8).map((p, i) => `<button type="button" data-r="${i}"><b>${esc(p.name)}</b><small>${esc(p.addr)}</small></button>`).join("") : `<p class="empty">찾지 못했어요. 이름을 바꿔 보세요.</p>`;
      $("qRes").onclick = e => {
        const b = e.target.closest("[data-r]"); if (!b) return;
        const p = r[+b.dataset.r];
        const st = { id: p.id, name: p.name, type: "pick", lat: p.lat, lng: p.lng, url: p.url, addr: p.addr, cat: p.cat.split(">").pop().trim(), t: 0, stay: 40, likes: { [S.me]: true } };
        let best = c.stops.length, bestD = Infinity;
        for (let i = 0; i <= c.stops.length; i++) {
          const a = c.stops[i - 1], z = c.stops[i];
          const d = (a ? dist(a, st) : 0) + (z ? dist(st, z) : 0) - (a && z ? dist(a, z) : 0);
          if (d < bestD) { bestD = d; best = i; }
        }
        c.stops.splice(best, 0, st); retime(c); saveCourse(c); closeSheet(); toast("넣었어요");
      };
    });
    return false;
  }, () => $("qIn").focus());
}

/* ---------- 화면 고르기 ---------- */
const SKINS = { sky: ["남자친구", "#E2EEFF"], pink: ["여자친구", "#FFE6EE"], lav: ["함께", "#EDE6FF"], kitty: ["헬로키티", "#FFE9EF"] };
const SKIN_KEY = "urigil-skin";
const skinFor = me => (me === "a" ? "sky" : "pink");
function getSkin() { const v = store.get(SKIN_KEY); return SKINS[v] ? v : skinFor(S.me); }
function applySkin(skin) {
  document.documentElement.dataset.skin = skin;
  document.querySelector('meta[name="theme-color"]').content = SKINS[skin][1];
  if (skin === "kitty") watchPhotos();
  if (S.info) { renderHead(); renderUs(); if (!$("tab-course").hidden) renderCourse(); }
}
function openSkins() {
  const cur = document.documentElement.dataset.skin;
  openSheet(`<h3>화면 고르기</h3>
    <div class="skins">${Object.entries(SKINS).map(([k, [label]]) =>
      `<button type="button" class="skin-card ${k}${k === cur ? " on" : ""}" data-skin="${k}"><span class="sw"></span>${label}</button>`).join("")}</div>`, null, () => {
    sheetForm.querySelector(".skins").addEventListener("click", e => {
      const b = e.target.closest("[data-skin]"); if (!b) return;
      store.set(SKIN_KEY, b.dataset.skin); applySkin(b.dataset.skin);
      b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    });
  });
}
/* 키티 화면: 우리달과 같은 사진첩(rooms/{코드}/photos) */
let photoUnsub = null;
const PIC_KEY = "urigil-pic";
function curPhoto() {
  const ph = S.photos; if (!ph.length) return null;
  const id = store.get(PIC_KEY);
  return ph.find(p => p.id === id) || ph[Math.abs(diff("2026-01-01", today())) % ph.length];
}
function watchPhotos() {
  if (photoUnsub || !S.room) return;
  photoUnsub = onSnapshot(col("photos"), s => {
    S.photos = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((x, y) => (x.at || 0) - (y.at || 0));
    if (S.info) { renderHead(); renderUs(); }
  });
  S.unsub.push(photoUnsub);
}
async function shrink(file) {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 640 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const g = c.getContext("2d"); g.drawImage(img, 0, 0, c.width, c.height);
  let url = c.toDataURL("image/webp", .8);
  if (!url.startsWith("data:image/webp")) { g.globalCompositeOperation = "destination-over"; g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); url = c.toDataURL("image/jpeg", .82); }
  return url;
}

/* ---------- 방 들어가기 ---------- */
function enter(room, me) {
  S.room = room; S.me = me; store.set(KEY, { room, me }); applySkin(getSkin());
  $("setup").hidden = true; $("boot").hidden = false;
  const slow = setTimeout(() => { toast("연결이 느려요. 잠시만요…"); $("bootReset").hidden = false; }, 8000);
  S.unsub.push(onSnapshot(doc(db, "rooms", room), s => {
    if (!s.exists()) { if (!s.metadata.fromCache) { toast("방을 찾을 수 없어요."); leave(); } return; }
    clearTimeout(slow);
    S.info = s.data();
    if (!$("boot").hidden) { $("boot").hidden = true; $("app").hidden = false; render(); appear($("app")); }
    else render();
  }, err => { clearTimeout(slow); toast(`불러오지 못했어요 (${err.code})`); $("bootReset").hidden = false; }));
  S.unsub.push(onSnapshot(col("courses"), s => {
    S.courses = s.docs.map(d => ({ id: d.id, ...d.data() }));
    if (S.view && S.view !== "draft" && !S.courses.some(c => c.id === S.view)) S.view = null;
    render();
  }));
  kakaoReady().catch(() => {});
}
function leave() { S.unsub.forEach(u => u()); store.set(KEY, null); location.reload(); }
function openRoom() {
  openSheet(`<h3>커플 코드</h3>
    <output class="code">${S.room}</output>
    <button type="button" class="pill wide" data-r="share">링크 보내기</button>
    <button type="button" class="link danger" data-r="reset">초기화 (처음 화면으로)</button>`, null, () => {
    sheetForm.querySelector("[data-r=share]").onclick = () => share(S.room);
    sheetForm.querySelector("[data-r=reset]").onclick = e => { if (armed(e.currentTarget)) leave(); };
  });
}
async function share(code) {
  const url = link(code);
  if (navigator.share) {
    try { await navigator.share({ title: "우리길", text: "우리 데이트 코스 같이 보자", url }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("링크를 복사했어요"); }
  catch { toast("코드를 길게 눌러 복사해 주세요"); }
}

/* ---------- 처음 화면 ---------- */
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

/* ---------- 앱 동작 ---------- */
document.querySelector(".tabbar").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showTab(b.dataset.tab); });
function showTab(t) {
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  ["cal", "course", "us"].forEach(x => ($(`tab-${x}`).hidden = x !== t));
  scrollTo({ top: 0, behavior: "instant" });
  if (t === "course") {
    if (!S.view && !S.busy) { const n = upcomingCourse(); if (n) S.view = n.id; }
    renderCourse();
  }
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
function openCourse(id) { S.view = id; showTab("course"); }
$("agenda").addEventListener("click", e => {
  const c = e.target.closest("[data-c]"); if (c) return openCourse(c.dataset.c);
  if (e.target.closest("[data-plan]")) openPlanSheet(S.sel);
});
$("courseList").addEventListener("click", e => { const c = e.target.closest("[data-c]"); if (c) openCourse(c.dataset.c); });
$("tab-course").addEventListener("scroll", e => {
  const g = e.target; if (!g.classList?.contains("gal")) return;
  const k = Math.round(g.scrollLeft / g.clientWidth);
  g.nextElementSibling.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i === k));
}, true);
$("tab-course").addEventListener("click", async e => {
  const g = e.target.closest(".gal");
  if (g) return g.scrollTo({ left: g.scrollLeft + g.clientWidth >= g.scrollWidth - 4 ? 0 : g.scrollLeft + g.clientWidth, behavior: calm.matches ? "auto" : "smooth" });
  const b = e.target.closest("button"); if (!b) return;
  const c = viewCourse();
  if (b.dataset.plan !== undefined) return openPlanSheet(S.sel >= today() ? S.sel : today());
  if (!c) return;
  if (b.dataset.like !== undefined) {
    const s = c.stops[+b.dataset.like]; s.likes = { ...s.likes, [S.me]: !s.likes?.[S.me] };
    return S.view === "draft" ? renderCourse() : updateDoc(ref("courses", c.id), { stops: c.stops }).catch(fail);
  }
  if (b.dataset.swap !== undefined) {
    b.disabled = true; b.textContent = "찾는 중";
    const ok = await swapStop(c, +b.dataset.swap).catch(() => false);
    if (ok) { saveCourse(c); toast("바꿨어요"); } else { b.disabled = false; b.textContent = "바꾸기"; toast("근처에 다른 곳이 없어요"); }
    return;
  }
  if (b.dataset.drop !== undefined) {
    if (c.stops.length <= 1) return toast("한 곳은 남겨 주세요");
    if (!armed(b)) return;
    c.stops.splice(+b.dataset.drop, 1); retime(c); saveCourse(c); return;
  }
  if (b.dataset.menu !== undefined) return openMenu(c.stops[+b.dataset.menu]);
  if (b.dataset.rev !== undefined) return openReviews(c.stops[+b.dataset.rev]);
  if (b.dataset.addplace !== undefined) return openAddPlace(c);
  if (b.dataset.again !== undefined) return makeCourse({ date: c.date, from: c.from, to: c.to, prefs: c.prefs || [], area: c.picked || null, replaces: c.replaces || (S.view !== "draft" ? c.id : null) });
  if (b.dataset.keep !== undefined) return keepDraft();
  if (b.dataset.done !== undefined) return openDone(c);
  if (b.dataset.cdel !== undefined) {
    if (!armed(b)) return;
    deleteDoc(ref("courses", c.id)).catch(fail);
    if (c.eventId) deleteDoc(ref("events", c.eventId)).catch(() => {});
    S.view = null; toast("지웠어요");
  }
});
$("saveSet").onclick = () => {
  const a = $("sA").value.trim(), b = $("sB").value.trim();
  if (!a || !b) return toast("이름을 모두 적어 주세요");
  updateDoc(doc(db, "rooms", S.room), { "a.name": a, "b.name": b }).catch(fail);
  toast("저장했어요");
};
$("sCopy").onclick = () => share(S.room);
$("leave").onclick = e => { if (armed(e.currentTarget)) leave(); };
$("skinBtn").onclick = openSkins;
$("skinBtn2").onclick = openSkins;
$("codeBtn").onclick = openRoom;
$("bootReset").onclick = leave;
$("hPic").onclick = () => {
  if (!S.photos.length) { showTab("us"); return $("album").scrollIntoView({ behavior: "smooth" }); }
  const ph = S.photos; store.set(PIC_KEY, ph[(ph.indexOf(curPhoto()) + 1) % ph.length].id);
  renderHead(); renderUs(); appear($("hPic"));
};
$("picIn").addEventListener("change", async e => {
  const files = [...e.target.files].slice(0, Math.max(0, 30 - S.photos.length));
  e.target.value = "";
  if (!files.length) return toast("사진은 30장까지 넣을 수 있어요");
  toast("사진 넣는 중…");
  let last;
  for (const f of files) {
    last = doc(col("photos"));
    try { await setDoc(last, { data: await shrink(f), by: S.me, at: Date.now() }); } catch { return toast("사진을 넣지 못했어요"); }
  }
  store.set(PIC_KEY, last.id); renderHead(); renderUs(); toast("사진을 넣었어요");
});
$("picList").addEventListener("click", e => {
  const b = e.target.closest("[data-pic], [data-pdel]"); if (!b) return;
  if (b.dataset.pic) { store.set(PIC_KEY, b.dataset.pic); renderHead(); renderUs(); scrollTo({ top: 0, behavior: "smooth" }); }
  else if (armed(b)) deleteDoc(ref("photos", b.dataset.pdel)).catch(fail);
});

let installEv = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEv = e; $("installBtn").hidden = false; });
$("installBtn").onclick = async () => { if (!installEv) return; installEv.prompt(); await installEv.userChoice; installEv = null; $("installBtn").hidden = true; };
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
$("iosHint").hidden = !(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- 시작 ---------- */
const saved = store.get(KEY);
const hashCode = normCode(decodeURIComponent(location.hash.slice(1)));
if (location.hash) history.replaceState(null, "", location.pathname);
if (saved?.room && (!hashCode || hashCode === saved.room)) enter(saved.room, saved.me);
else {
  $("boot").hidden = true; $("setup").hidden = false;
  if (hashCode) { step("joinForm"); $("jCode").value = hashCode; }
  else step("setupChoose");
}
if (new URLSearchParams(location.search).has("test")) window.urigilTest = { plan, checkCourse, scoreOf };   // course_test.py가 부름
