// 그림 전화 — 제시어를 그리면 옆 사람이 그림만 보고 낱말을 쓰고, 다음 사람은 그 낱말을 또 그린다. 한 바퀴 돌면 처음 낱말이 어떻게 변했는지 같이 본다 (4~8명)
// 점수 없이 웃는 게임. 봇 없음. 그림은 240×240 JPEG로 줄여서 보냄.
import { esc, shuffle, SEAT } from "../lib.js";
import { WORDS } from "./words.js";

const DRAW_S = 80, GUESS_S = 40;
const holder = (s, b, k) => (b + k - 1) % s.n;   // k번째 단계에 b번 책을 든 사람
const bookOf = (s, p, k) => (p - k + 1 + s.n * 2) % s.n;
const kind = k => k % 2 ? "draw" : "guess";

function startStep(s, now) { s.sub = {}; s.deadline = now + (kind(s.step) === "draw" ? DRAW_S : GUESS_S) * 1000; }
function submit(s, p, v) {
  const b = bookOf(s, p, s.step);
  s.books[b].push({ t: kind(s.step), by: p, v });
  s.sub[p] = true;
}
function advance(s, now) {
  if (Object.keys(s.sub).length < s.n) return;
  if (s.step >= s.n) { s.phase = "show"; s.showB = 0; s.showI = 0; return; }
  s.step++; startStep(s, now);
}

export default {
  id: "tele", name: "그림 전화", color: "#7a4fb0", min: 4, max: 8, time: "20분", party: true,
  sub: "제시어를 그리면 옆 사람은 그림만 보고 맞히고, 다음 사람은 그걸 또 그려요. 끝에 같이 넘겨 봐요",
  setup(n, rng, ctx) {
    const pool = shuffle([...WORDS], rng);
    return { n, phase: "pick", offers: Array.from({ length: n }, () => pool.splice(0, 2)), books: Array.from({ length: n }, () => []), step: 0, sub: {}, deadline: null, showB: 0, showI: 0 };
  },
  view(s) {
    const o = { n: s.n, phase: s.phase, step: s.step, sub: Object.keys(s.sub).map(Number), deadline: s.deadline, showB: s.showB, showI: s.showI, turn: this.turn(s), kind: s.step ? kind(s.step) : "pick" };
    if (s.phase === "show" || s.phase === "end") o.books = s.books.map((b, i) => s.phase === "end" || i < s.showB ? b : i === s.showB ? b.slice(0, s.showI + 1) : []);
    return o;
  },
  secret(s, seat) {
    if (seat < 0) return {};
    if (s.phase === "pick") return { offer: s.offers[seat], picked: s.books[seat].length > 0 };
    if (s.phase === "play") { const b = bookOf(s, seat, s.step), prev = s.books[b][s.books[b].length - (s.sub[seat] ? 2 : 1)]; return { task: { kind: kind(s.step), prev: prev?.v ?? "", done: !!s.sub[seat] } }; }
    return {};
  },
  turn(s) {
    if (s.phase === "pick") return [...Array(s.n).keys()].filter(p => !s.books[p].length);
    if (s.phase === "play") return [...Array(s.n).keys()].filter(p => !s.sub[p]);
    if (s.phase === "show") return [0];
    return [];
  },
  apply(s, seat, a, ctx) {
    if (s.phase === "pick") {
      if (a.t !== "pick" || s.books[seat].length || !s.offers[seat].includes(a.w)) throw new Error("두 낱말 중 하나를 골라요");
      s.books[seat].push({ t: "word", by: seat, v: a.w });
      if (s.books.every(b => b.length)) { s.phase = "play"; s.step = 1; startStep(s, ctx.now); }
      return;
    }
    if (s.phase === "play") {
      if (s.sub[seat]) throw new Error("이미 냈어요");
      if (kind(s.step) === "draw") { if (a.t !== "draw" || typeof a.img !== "string" || (a.img && !a.img.startsWith("data:image/")) || a.img.length > 120000) throw new Error("그림이 너무 크거나 이상해요"); submit(s, seat, a.img); }
      else { if (a.t !== "guess") throw new Error("낱말을 적어요"); submit(s, seat, String(a.w || "").trim().slice(0, 20) || "(모르겠음)"); }
      return advance(s, ctx.now);
    }
    if (s.phase === "show") {
      if (seat !== 0 || a.t !== "next") throw new Error("방장이 넘겨요");
      if (s.showI < s.books[s.showB].length - 1) s.showI++;
      else if (s.showB < s.n - 1) { s.showB++; s.showI = 0; }
      else s.phase = "end";
      return;
    }
    throw new Error("지금은 할 수 없어요");
  },
  nextTick(s, now) { return s.phase === "play" && s.deadline ? s.deadline - now : null; },
  tick(s, ctx) {
    if (s.phase !== "play" || ctx.now < s.deadline) return false;
    for (let p = 0; p < s.n; p++) if (!s.sub[p]) submit(s, p, kind(s.step) === "draw" ? "" : "(시간이 다 됨)");
    advance(s, ctx.now); return true;
  },
  over(s) { return s.phase === "end" ? { text: "다 같이 넘겨 봤어요", rank: [...Array(s.n).keys()].map(p => [p, "함께 웃음"]) } : null; },
  bot(s, seat, rng) {
    if (s.phase === "pick") return { delay: 500, a: { t: "pick", w: s.offers[seat][0] } };
    if (s.phase === "play") return { delay: 600, a: kind(s.step) === "draw" ? { t: "draw", img: "" } : { t: "guess", w: WORDS[Math.floor(rng() * WORDS.length)] } };
    if (s.phase === "show") return { delay: 300, a: { t: "next" } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names;
    const left = v.deadline ? Math.max(0, Math.ceil((v.deadline - Date.now()) / 1000)) : 0;
    let body = "";
    if (v.phase === "pick") body = v.picked ? `<p class="say">골랐어요. 다른 사람을 기다려요</p>` : `<p class="say">그릴 제시어를 골라요 (남은 사람에게는 비밀)</p><div class="acts">${(v.offer || []).map(w => `<button data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div>`;
    else if (v.phase === "play" && v.task) {
      const t = v.task;
      if (t.done) body = `<p class="say">냈어요. ${v.n - v.sub.length}명 기다리는 중 <small>${left}초</small></p>`;
      else if (t.kind === "draw") body = `<p class="say">이걸 그려요: <b class="word">${esc(t.prev)}</b><small>${left}초</small></p><div class="pad" id="padw"></div><div class="acts"><button class="ghost clr">다 지우기</button><button class="sendd">다 그렸어요</button></div>`;
      else body = `<p class="say">이 그림은 뭘까요? <small>${left}초</small></p><div class="pic">${t.prev ? `<img src="${t.prev}" alt="앞사람 그림">` : `<span class="dim">앞사람이 시간 안에 못 그렸어요</span>`}</div><form class="gform"><input name="w" maxlength="20" placeholder="낱말" autocomplete="off" required><button>내기</button></form>`;
    } else if (v.phase === "play") body = `<p class="say">구경 중이에요</p>`;
    else {
      body = `<p class="say">${v.phase === "end" ? "다 넘겨 봤어요" : `${esc(n[v.showB])}의 책 (${v.showB + 1}/${v.n})`}</p>
        <div class="books">${(v.books || []).map((b, i) => b.length ? `<div class="book${i === v.showB && v.phase === "show" ? " now" : ""}"><b style="color:${SEAT[i]}">${esc(n[i])}의 책</b>${b.map(e => `<div class="ent"><small>${esc(n[e.by])} ${e.t === "word" ? "제시어" : e.t === "draw" ? "그림" : "추측"}</small>${e.t === "draw" ? (e.v ? `<img src="${e.v}" alt="그림">` : `<span class="dim">(빈 그림)</span>`) : `<p>${esc(e.v)}</p>`}</div>`).join("")}</div>` : "").join("")}</div>
        ${v.phase === "show" && ui.isHost ? `<div class="acts"><button class="nx">다음 장</button></div>` : v.phase === "show" ? `<p class="dim">방장이 넘겨요</p>` : ""}`;
    }
    const keep = v.phase === "play" && v.task?.kind === "draw" && !v.task.done && UI.step === v.step ? UI.canvas : null;
    el.innerHTML = `<div class="tele"><div class="steps">${v.phase === "play" ? `${v.step}/${v.n}단계, ${v.kind === "draw" ? "그리기" : "맞히기"}` : ""}</div>${body}
      <div class="who">${[...Array(v.n).keys()].map(p => `<span class="${v.sub.includes(p) ? "on" : ""}" style="--s:${SEAT[p]}">${esc(n[p])}</span>`).join("")}</div></div>`;
    el.querySelectorAll("[data-w]").forEach(b => b.onclick = () => send({ t: "pick", w: b.dataset.w }));
    el.querySelector(".nx")?.addEventListener("click", () => send({ t: "next" }));
    const gi = el.querySelector(".gform input");
    if (gi) { // 다른 사람이 낼 때마다 화면이 다시 그려져도 적던 글자가 남게
      gi.value = UI.g[v.step] || ""; if (UI.focus) { gi.focus(); gi.setSelectionRange(gi.value.length, gi.value.length); }
      gi.oninput = () => UI.g[v.step] = gi.value; gi.onfocus = () => UI.focus = true; gi.onblur = () => UI.focus = false;
    }
    el.querySelector(".gform")?.addEventListener("submit", e => { e.preventDefault(); UI.focus = false; send({ t: "guess", w: new FormData(e.target).get("w") }); });
    const pw = el.querySelector("#padw");
    if (pw) {
      const cv = keep || makeCanvas();
      UI.canvas = cv; UI.step = v.step; pw.appendChild(cv);
      el.querySelector(".clr").onclick = () => { const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); };
      el.querySelector(".sendd").onclick = () => send({ t: "draw", img: cv.toDataURL("image/jpeg", .6) });
    }
    clearInterval(UI.t);
    if (v.phase === "play") UI.t = setInterval(() => { const s = el.querySelector(".say small"); if (s && v.deadline) s.textContent = Math.max(0, Math.ceil((v.deadline - Date.now()) / 1000)) + "초"; else clearInterval(UI.t); }, 1000);
  }
};
const UI = { canvas: null, step: -1, t: 0, g: {}, focus: false };
function makeCanvas() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 240;
  const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, 240, 240);
  g.lineCap = g.lineJoin = "round"; g.lineWidth = 3.2; g.strokeStyle = "#16181d";
  let last = null;
  const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 240 / r.width, (e.clientY - r.top) * 240 / r.height]; };
  cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); last = at(e); g.beginPath(); g.arc(last[0], last[1], 1.4, 0, 7); g.fillStyle = "#16181d"; g.fill(); });
  cv.addEventListener("pointermove", e => { if (!last) return; const p = at(e); g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke(); last = p; });
  const up = () => last = null;
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.style.touchAction = "none";
  return cv;
}
