// 등대 금고 — 상대 번호패를 맞히는 추리 게임 (2~4명)
// 번호패: 검정, 흰색 0~11 한 벌씩 + 별패 두 개(어디든 놓을 수 있음). 내 패는 작은 수부터, 같은 수면 검정이 왼쪽.
import { esc, shuffle, pick, SEAT } from "../lib.js";

const J = -1; // 별패
const key = t => t.v * 2 + t.c;

function insertSorted(rack, t) {
  let j = rack.findIndex(x => x.v !== J && key(x) > key(t));
  if (j < 0) j = rack.length;
  rack.splice(j, 0, t);
  return j;
}

function nextTurn(s) {
  for (const r of s.racks[s.cur]) r.nw = false;
  s.held = -1;
  let c = s.cur;
  do c = (c + 1) % s.n; while (s.out.includes(c));
  s.cur = c;
  s.phase = s.pool.length ? "draw" : "guess";
}
const alive = s => [...Array(s.n).keys()].filter(i => !s.out.includes(i));
function checkOut(s, seat) {
  if (!s.out.includes(seat) && s.racks[seat].every(t => t.open)) {
    s.out.push(seat);
    s.log.unshift({ k: "out", s: seat });
  }
}
const log = (s, x) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, 14); };

export default {
  id: "vault", name: "등대 금고", color: "#2a2f6b", min: 2, max: 4, time: "15분", solo: 3,
  sub: "상대가 숨긴 번호패를 하나씩 맞혀 금고를 여는 추리 게임",

  setup(n, rng) {
    const pool = [];
    for (const c of [0, 1]) { for (let v = 0; v < 12; v++) pool.push({ c, v }); pool.push({ c, v: J }); }
    shuffle(pool, rng).forEach((t, i) => { t.id = i; t.open = false; t.nw = false; });
    const each = n === 4 ? 3 : 4, racks = [];
    for (let p = 0; p < n; p++) {
      const r = [];
      for (let k = 0; k < each; k++) {
        const t = pool.pop();
        if (t.v === J) r.splice(Math.floor(rng() * (r.length + 1)), 0, t); else insertSorted(r, t);
      }
      racks.push(r);
    }
    return { n, pool, racks, cur: 0, phase: "draw", held: -1, out: [], log: [], hist: [] };
  },

  view(s, seat) {
    return {
      n: s.n, cur: s.cur, phase: s.phase, held: s.held, out: s.out, log: s.log, hist: s.hist,
      pool: [s.pool.filter(t => t.c === 0).length, s.pool.filter(t => t.c === 1).length],
      racks: s.racks.map((r, p) => r.map(t => p === seat || t.open ? { ...t } : { id: t.id, c: t.c, open: false, nw: t.nw })),
      turn: this.turn(s)
    };
  },

  turn(s) { return alive(s).length > 1 ? [s.cur] : []; },

  apply(s, seat, a) {
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    const me = s.racks[seat];
    if (a.t === "draw") {
      if (s.phase !== "draw") throw new Error("지금은 가져올 때가 아니에요");
      const i = s.pool.findIndex(t => t.c === a.c);
      if (i < 0) throw new Error("그 색은 다 떨어졌어요");
      const t = s.pool.splice(i, 1)[0];
      t.nw = true;
      log(s, { k: "draw", s: seat, c: t.c });
      if (t.v === J) { s.joker = t; s.phase = "joker"; }
      else { s.held = insertSorted(me, t); s.phase = "guess"; }
      return;
    }
    if (a.t === "jpos") {
      if (s.phase !== "joker") throw new Error("별패를 놓을 때가 아니에요");
      const pos = Math.max(0, Math.min(me.length, a.pos | 0));
      me.splice(pos, 0, s.joker); s.held = pos; s.joker = null; s.phase = "guess";
      return;
    }
    if (a.t === "guess") {
      if (s.phase !== "guess" && s.phase !== "more") throw new Error("지금은 맞힐 때가 아니에요");
      const r = s.racks[a.to], t = r?.[a.idx];
      if (a.to === seat || !t || t.open || s.out.includes(a.to)) throw new Error("그 패는 고를 수 없어요");
      if (!(a.num === J || (Number.isInteger(a.num) && a.num >= 0 && a.num < 12))) throw new Error("번호가 이상해요");
      const ok = t.v === a.num;
      s.hist.push({ by: seat, to: a.to, id: t.id, num: a.num, ok });
      log(s, { k: "guess", s: seat, to: a.to, idx: a.idx, num: a.num, ok });
      if (ok) {
        t.open = true; checkOut(s, a.to);
        s.phase = alive(s).length > 1 ? "more" : "end";
        return;
      }
      if (s.held >= 0 && !me[s.held].open) {
        me[s.held].open = true; log(s, { k: "show", s: seat, v: me[s.held].v, c: me[s.held].c });
        checkOut(s, seat);
        return alive(s).length > 1 ? nextTurn(s) : (s.phase = "end");
      }
      s.phase = "reveal";
      return;
    }
    if (a.t === "reveal") {
      if (s.phase !== "reveal") throw new Error("지금은 열 때가 아니에요");
      const t = me[a.idx];
      if (!t || t.open) throw new Error("닫힌 내 패를 골라 주세요");
      t.open = true; log(s, { k: "show", s: seat, v: t.v, c: t.c });
      checkOut(s, seat);
      return alive(s).length > 1 ? nextTurn(s) : (s.phase = "end");
    }
    if (a.t === "stop") {
      if (s.phase !== "more") throw new Error("맞힌 뒤에만 멈출 수 있어요");
      log(s, { k: "stop", s: seat });
      return nextTurn(s);
    }
    throw new Error("모르는 행동이에요");
  },

  over(s) {
    const al = alive(s);
    if (al.length > 1) return null;
    return { text: "금고를 끝까지 지킨 사람", rank: [[al[0], "1등"], ...[...s.out].reverse().map((p, i) => [p, `${i + 2}등`])] };
  },

  // 봇: 보이는 정보로 칸마다 가능한 번호를 좁혀 가장 확실한 칸을 짚는다
  bot(s, seat, rng) {
    const v = this.view(s, seat), me = v.racks[seat];
    const d = { delay: 900 + rng() * 700 };
    if (v.phase === "draw") {
      const cs = [0, 1].filter(c => v.pool[c] > 0);
      return { ...d, a: { t: "draw", c: pick(cs, rng) } };
    }
    if (v.phase === "joker") return { ...d, a: { t: "jpos", pos: Math.floor(rng() * (me.length + 1)) } };
    if (v.phase === "reveal") {
      const idx = me.map((t, i) => t.open ? -1 : i).filter(i => i >= 0);
      return { ...d, a: { t: "reveal", idx: pick(idx, rng) } };
    }
    const cands = candidates(v, seat);
    if (!cands.length) return { ...d, a: { t: "stop" } };
    cands.sort((x, y) => x.nums.length - y.nums.length || rng() - .5);
    const best = cands[0];
    if (v.phase === "more" && !(best.nums.length === 1 || (best.nums.length === 2 && rng() < .35))) return { ...d, a: { t: "stop" } };
    return { ...d, a: { t: "guess", to: best.to, idx: best.idx, num: pick(best.nums, rng) } };
  },

  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// 보이는 것만으로 칸마다 가능한 번호 목록
export function candidates(v, seat) {
  const seen = new Set();
  for (const r of v.racks) for (const t of r) if (t.v !== undefined) seen.add(t.c + ":" + t.v);
  const wrong = new Set(v.hist.filter(h => !h.ok).map(h => h.id + ":" + h.num));
  const out = [];
  v.racks.forEach((r, p) => {
    if (p === seat || v.out.includes(p)) return;
    r.forEach((t, i) => {
      if (t.open) return;
      let lo = -1, hi = 99;
      for (let j = i - 1; j >= 0; j--) if (r[j].v !== undefined && r[j].v !== J) { lo = key(r[j]); break; }
      for (let j = i + 1; j < r.length; j++) if (r[j].v !== undefined && r[j].v !== J) { hi = key(r[j]); break; }
      const nums = [];
      for (let n = 0; n < 12; n++) { const k = n * 2 + t.c; if (k > lo && k < hi && !seen.has(t.c + ":" + n) && !wrong.has(t.id + ":" + n)) nums.push(n); }
      if (!seen.has(t.c + ":" + J) && !wrong.has(t.id + ":" + J)) nums.push(J);
      if (nums.length) out.push({ to: p, idx: i, nums });
    });
  });
  return out;
}

// ───────── 화면 ─────────
const UI = { sel: null };
const lab = n => n === J ? "★" : n;
const tileHTML = (t, attrs = "") => `<button class="vt ${t.c ? "w" : "b"}${t.open ? " op" : ""}${t.nw ? " nw" : ""}" ${attrs}>${t.v !== undefined ? lab(t.v) : ""}</button>`;

function say(v, me, names) {
  const who = names[v.cur];
  if (v.phase === "end") return "판이 끝났어요";
  if (v.cur !== me) return `${esc(who)} 차례예요`;
  return {
    draw: "가져올 패의 색을 골라요",
    joker: "별패를 뽑았어요. 놓을 자리를 눌러요",
    guess: "상대 패 하나를 누르고 번호를 맞혀요",
    more: "맞혔어요! 더 맞힐지, 여기서 멈출지 골라요",
    reveal: "틀렸어요. 가져올 패가 없으니 내 패 하나를 열어요"
  }[v.phase];
}

function logLine(x, names) {
  const n = i => `<b style="color:${SEAT[i]}">${esc(names[i])}</b>`;
  const col = c => c ? "흰" : "검은";
  switch (x.k) {
    case "draw": return `${n(x.s)} ${col(x.c)} 패를 가져옴`;
    case "guess": return `${n(x.s)}: ${n(x.to)}의 ${x.idx + 1}번째 패를 ${lab(x.num)}로 짚음, ${x.ok ? "맞음" : "틀림"}`;
    case "show": return `${n(x.s)} 자기 ${col(x.c)} ${lab(x.v)} 패가 열림`;
    case "stop": return `${n(x.s)} 멈춤`;
    case "out": return `${n(x.s)} 금고가 다 열림`;
  }
  return "";
}

function render(el, v, me, send, ui) {
  const mine = v.cur === me && v.phase !== "end";
  if (!mine || !["guess", "more"].includes(v.phase)) UI.sel = null;
  const opp = v.racks.map((r, p) => p).filter(p => p !== me);
  el.innerHTML = `<div class="vault">
    <p class="say">${say(v, me, ui.names)}</p>
    <div class="opps">${opp.map(p => `<div class="rack${v.out.includes(p) ? " gone" : ""}${v.cur === p ? " cur" : ""}">
      <span class="who" style="--s:${SEAT[p]}">${esc(ui.names[p])}</span>
      <div class="tiles">${v.racks[p].map((t, i) => tileHTML(t, `data-p="${p}" data-i="${i}" ${UI.sel && UI.sel.p === p && UI.sel.i === i ? 'aria-pressed="true"' : ""}`)).join("")}</div>
    </div>`).join("")}</div>
    <div class="mid">
      ${UI.sel ? `<div class="pad"><p>${esc(ui.names[UI.sel.p])}의 ${UI.sel.i + 1}번째 패는?</p>${[...Array(12).keys(), J].map(n => `<button data-n="${n}">${lab(n)}</button>`).join("")}<button class="ghost x">취소</button></div>`
        : `<div class="pool">
          <button class="vt b big" data-c="0" ${mine && v.phase === "draw" && v.pool[0] ? "" : "disabled"}><small>검정</small>${v.pool[0]}</button>
          <button class="vt w big" data-c="1" ${mine && v.phase === "draw" && v.pool[1] ? "" : "disabled"}><small>흰색</small>${v.pool[1]}</button>
          ${mine && v.phase === "more" ? `<button class="stop">여기서 멈추기</button>` : ""}
        </div>`}
    </div>
    ${me >= 0 ? `<div class="rack mine${v.out.includes(me) ? " gone" : ""}">
      <span class="who" style="--s:${SEAT[me]}">내 금고</span>
      <div class="tiles">${mine && v.phase === "joker"
        ? v.racks[me].map((t, i) => `<button class="slot" data-pos="${i}">여기</button>` + tileHTML(t)).join("") + `<button class="slot" data-pos="${v.racks[me].length}">여기</button>`
        : v.racks[me].map((t, i) => tileHTML(t, `data-mi="${i}"`)).join("")}</div>
      <small class="dim">흐린 패는 남들도 아는 패예요</small>
    </div>` : ""}
    <ol class="log">${v.log.map(x => `<li>${logLine(x, ui.names)}</li>`).join("")}</ol>
  </div>`;
  el.querySelectorAll(".pool [data-c]").forEach(b => b.onclick = () => send({ t: "draw", c: +b.dataset.c }));
  el.querySelector(".stop")?.addEventListener("click", () => send({ t: "stop" }));
  el.querySelectorAll(".slot").forEach(b => b.onclick = () => send({ t: "jpos", pos: +b.dataset.pos }));
  if (mine && ["guess", "more"].includes(v.phase))
    el.querySelectorAll(".opps .vt:not(.op)").forEach(b => b.onclick = () => { UI.sel = { p: +b.dataset.p, i: +b.dataset.i }; render(el, v, me, send, ui); });
  el.querySelectorAll(".pad [data-n]").forEach(b => b.onclick = () => { const s = UI.sel; UI.sel = null; send({ t: "guess", to: s.p, idx: s.i, num: +b.dataset.n }); });
  el.querySelector(".pad .x")?.addEventListener("click", () => { UI.sel = null; render(el, v, me, send, ui); });
  if (mine && v.phase === "reveal") el.querySelectorAll(".mine .vt:not(.op)").forEach(b => b.onclick = () => send({ t: "reveal", idx: +b.dataset.mi }));
}
