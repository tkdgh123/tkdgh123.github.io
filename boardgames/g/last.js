// 마지막 한 장 — 같은 색이나 같은 숫자를 내며 손패를 먼저 털어 내는 카드 달리기 (2~10명)
// 한 장 남기는 순간 "한 장!"을 안 외치면 다른 사람이 잡아서 두 장을 먹일 수 있다.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const COL = [["바다", "#2f6fb0"], ["산호", "#d9472b"], ["모래", "#e0a526"], ["숲", "#3c8d5a"]];
const SYM = { s: "건너뛰기", r: "방향 바꾸기", d2: "두 장 더", w: "아무 색", w4: "아무 색 넷 더" };
const lab = c => typeof c.v === "number" ? String(c.v) : { s: "⊘", r: "⇄", d2: "+2", w: "★", w4: "+4" }[c.v];
const pts = c => typeof c.v === "number" ? c.v : c.c < 0 ? 50 : 20;

function newDeck(rng) {
  const d = []; let id = 0;
  for (let c = 0; c < 4; c++) {
    d.push({ id: id++, c, v: 0 });
    for (let k = 0; k < 2; k++) { for (let v = 1; v <= 9; v++) d.push({ id: id++, c, v }); for (const v of ["s", "r", "d2"]) d.push({ id: id++, c, v }); }
  }
  for (let k = 0; k < 4; k++) { d.push({ id: id++, c: -1, v: "w" }); d.push({ id: id++, c: -1, v: "w4" }); }
  return shuffle(d, rng);
}
const canPlay = (s, c) => c.c < 0 || c.c === s.color || c.v === s.top.v;
const step = (s, k = 1) => { let p = s.cur; for (let i = 0; i < k; i++) p = (p + s.dir + s.n) % s.n; return p; };
function draw(s, p, k, rng) {
  for (let i = 0; i < k; i++) {
    if (!s.pile.length) { const top = s.disc.pop(); s.pile = shuffle(s.disc, rng); s.disc = [top]; }
    if (!s.pile.length) return;
    s.hands[p].push(s.pile.pop());
  }
}

export default {
  id: "last", name: "원카드", color: "#2a9d9b", min: 2, max: 10, time: "15분", solo: 4,
  sub: "같은 색이나 숫자를 내며 손패를 먼저 털어요. 한 장 남으면 \"한 장!\"",
  setup(n, rng) {
    const pile = newDeck(rng), hands = Array.from({ length: n }, () => pile.splice(0, 7));
    let i = pile.findIndex(c => typeof c.v === "number");
    const top = pile.splice(i, 1)[0];
    return { n, pile, disc: [top], top, color: top.c, dir: 1, cur: 0, hands, drawn: null, uncalled: null, log: [], win: null };
  },
  view(s, seat) {
    return {
      n: s.n, top: s.top, color: s.color, dir: s.dir, cur: s.cur, drawn: s.cur === seat ? s.drawn : null, uncalled: s.uncalled, log: s.log, win: s.win,
      counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, pileN: s.pile.length, turn: this.turn(s)
    };
  },
  turn(s) {
    if (s.win != null) return [];
    const t = [s.cur];
    if (s.uncalled != null) for (let p = 0; p < s.n; p++) if (p !== s.uncalled && p !== s.cur) t.push(p);
    return t;
  },
  apply(s, seat, a, ctx) {
    if (s.win != null) throw new Error("판이 끝났어요");
    if (a.t === "catch") {
      if (s.uncalled == null || seat === s.uncalled) throw new Error("잡을 사람이 없어요");
      draw(s, s.uncalled, 2, ctx.rng); logPush(s, { k: "catch", s: seat, p: s.uncalled }); s.uncalled = null; return;
    }
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.uncalled != null && s.uncalled !== seat) s.uncalled = null; // 다음 사람이 움직이면 못 잡음
    const H = s.hands[seat];
    if (a.t === "draw") {
      if (s.drawn != null) throw new Error("이미 한 장 가져왔어요");
      draw(s, seat, 1, ctx.rng); s.drawn = H[H.length - 1]?.id ?? -1; logPush(s, { k: "draw", s: seat });
      return;
    }
    if (a.t === "pass") {
      if (s.drawn == null) throw new Error("먼저 한 장 가져와요");
      s.drawn = null; s.cur = step(s); return;
    }
    if (a.t === "play") {
      const i = H.findIndex(c => c.id === a.id);
      if (i < 0) throw new Error("그 카드가 없어요");
      const c = H[i];
      if (s.drawn != null && c.id !== s.drawn) throw new Error("가져온 카드만 낼 수 있어요");
      if (!canPlay(s, c)) throw new Error("색이나 숫자가 같아야 해요");
      if (c.c < 0 && !(a.color >= 0 && a.color < 4)) throw new Error("색을 골라요");
      H.splice(i, 1); s.disc.push(c); s.top = c; s.color = c.c < 0 ? a.color : c.c; s.drawn = null;
      logPush(s, { k: "play", s: seat, c, col: s.color });
      if (!H.length) { s.win = seat; return; }
      if (H.length === 1) { if (a.call) logPush(s, { k: "call", s: seat }); else s.uncalled = seat; }
      let skip = 1;
      if (c.v === "r") { s.dir *= -1; if (s.n === 2) skip = 2; }
      if (c.v === "s") skip = 2;
      if (c.v === "d2" || c.v === "w4") { const nx = step(s); draw(s, nx, c.v === "d2" ? 2 : 4, ctx.rng); logPush(s, { k: "eat", s: nx, n: c.v === "d2" ? 2 : 4 }); skip = 2; }
      s.cur = step(s, skip);
      return;
    }
    throw new Error("모르는 행동이에요");
  },
  over(s) {
    if (s.win == null) return null;
    const left = p => s.hands[p].reduce((a, c) => a + pts(c), 0);
    const o = [...Array(s.n).keys()].sort((a, b) => (b === s.win) - (a === s.win) || left(a) - left(b));
    return { text: "손패를 먼저 턴 사람", rank: o.map((p, i) => [p, p === s.win ? "다 털었음" : `${i + 1}등, 남은 ${s.hands[p].length}장`]) };
  },
  bot(s, seat, rng) {
    if (seat !== s.cur) return s.uncalled != null ? { delay: 1400 + rng() * 2200, a: { t: "catch" } } : null;
    const d = { delay: 800 + rng() * 600 }, H = s.hands[seat];
    let ok = H.filter(c => canPlay(s, c) && (s.drawn == null || c.id === s.drawn));
    if (!ok.length) return { ...d, a: { t: s.drawn == null ? "draw" : "pass" } };
    const nextFew = s.hands[step(s)].length <= 2;
    ok.sort((x, y) => sc(y) - sc(x));
    function sc(c) { return (c.c < 0 ? -5 : 0) + (typeof c.v !== "number" ? (nextFew ? 6 : 1) : c.v * .2) + H.filter(h => h.c === c.c).length * .5; }
    const c = ok[0], cnt = [0, 0, 0, 0]; H.forEach(h => h.c >= 0 && h.id !== c.id && cnt[h.c]++);
    return { ...d, a: { t: "play", id: c.id, color: cnt.indexOf(Math.max(...cnt)), call: rng() < .92 } };
  },
  badge(v, i) { return `${v.counts[i]}장`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.win == null;
    const card = (c, attrs = "", cls = "") => `<button class="lc ${cls}" style="--c:${c.c < 0 ? "#222" : COL[c.c][1]}" ${attrs}><b>${lab(c)}</b><small>${typeof c.v === "number" ? "" : SYM[c.v]}</small></button>`;
    const playable = c => my && (c.c < 0 || c.c === v.color || c.v === v.top.v) && (v.drawn == null || c.id === v.drawn);
    el.innerHTML = `<div class="last">
      <p class="say">${v.win != null ? "판이 끝났어요" : my ? (v.drawn != null ? "가져온 카드를 내거나 넘겨요" : "낼 카드를 누르거나 한 장 가져와요") : `${esc(n[v.cur])} 차례예요`}</p>
      <div class="ring">${v.counts.map((k, p) => `<span class="${p === v.cur ? "cur" : ""}${p === me ? " me" : ""}" style="--s:${SEAT[p]}">${esc(n[p])} <b>${k}</b>${k === 1 ? "<i>한 장</i>" : ""}</span>`).join(v.dir > 0 ? "" : "")}<small>${v.dir > 0 ? "순서: 오른쪽으로" : "순서: 왼쪽으로"}</small></div>
      <div class="table">
        <button class="lc back" ${my && v.drawn == null ? "" : "disabled"} data-draw><b>${v.pileN}</b><small>한 장 가져오기</small></button>
        ${card(v.top, "disabled", "top")}
        <div class="nowc" style="--c:${COL[v.color][1]}">지금 색<b>${COL[v.color][0]}</b></div>
      </div>
      ${v.uncalled != null && v.uncalled !== me && me >= 0 ? `<button class="catch">${esc(n[v.uncalled])} "한 장!" 안 외침, 잡기</button>` : ""}
      ${my && v.drawn != null ? `<div class="acts"><button class="ghost pass">넘기기</button></div>` : ""}
      ${v.hand ? `<div class="lhand">${v.hand.map(c => card(c, `data-id="${c.id}" ${playable(c) ? "" : "disabled"}`, playable(c) ? "ok" : "")).join("")}</div>
        ${my && v.hand.length === 2 ? `<label class="callb"><input type="checkbox" ${UI.call ? "checked" : ""}> 이번에 내면 한 장 남아요. "한 장!" 외치기</label>` : ""}` : ""}
      ${UI.pick != null ? `<div class="sheet"><div class="in"><p>바꿀 색을 골라요</p>${COL.map(([nm, c], i) => `<button data-col="${i}" style="background:${c}">${nm}</button>`).join("")}<button class="ghost x">취소</button></div></div>` : ""}
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    if (!my) { UI.pick = null; }
    if (!(my && v.hand?.length === 2)) UI.call = false;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelector("[data-draw]")?.addEventListener("click", () => send({ t: "draw" }));
    el.querySelector(".pass")?.addEventListener("click", () => send({ t: "pass" }));
    el.querySelector(".catch")?.addEventListener("click", () => send({ t: "catch" }));
    el.querySelector(".callb input")?.addEventListener("change", e => { UI.call = e.target.checked; });
    el.querySelectorAll(".lhand .lc:not([disabled])").forEach(b => b.onclick = () => {
      const c = v.hand.find(x => x.id === +b.dataset.id);
      if (c.c < 0) { UI.pick = c.id; return re(); }
      send({ t: "play", id: c.id, call: UI.call });
    });
    el.querySelectorAll("[data-col]").forEach(b => b.onclick = () => { const id = UI.pick; UI.pick = null; send({ t: "play", id, color: +b.dataset.col, call: UI.call }); });
    el.querySelector(".sheet .x")?.addEventListener("click", () => { UI.pick = null; re(); });
  }
};
const UI = { pick: null, call: false };
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "play": return `${b(x.s)} ${x.c.c < 0 ? SYM[x.c.v] + `, ${COL[x.col][0]}색으로` : `${COL[x.c.c][0]} ${typeof x.c.v === "number" ? x.c.v : SYM[x.c.v]}`}`;
    case "draw": return `${b(x.s)} 한 장 가져옴`;
    case "eat": return `${b(x.s)} ${x.n}장 먹음`;
    case "call": return `${b(x.s)} "한 장!"`;
    case "catch": return `${b(x.s)}이(가) ${b(x.p)}을(를) 잡음, 두 장`;
  }
  return "";
}
