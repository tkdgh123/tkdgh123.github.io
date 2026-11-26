// 윷놀이 — 윷을 던져 말 넷을 먼저 다 내보내는 전통 놀이 (2~4명, 한 사람이 한 편)
// 도 1, 개 2, 걸 3, 윷 4, 모 5, 빽도 뒤로 1. 윷과 모, 잡기는 한 번 더. 모서리나 방에 멈추면 지름길로. 내 말끼리는 업고 감.
import { esc, SEAT, logPush, nameB } from "../lib.js";

const NAME = { 1: "도", 2: "개", 3: "걸", 4: "윷", 5: "모", "-1": "빽도" };
const F = 99, HOME = -1;
// 판 점 좌표 (0 = 참먹이, 오른쪽 아래)
export const PT = (() => {
  const p = [];
  for (let i = 0; i < 20; i++) {
    if (i <= 5) p[i] = [100, 100 - 20 * i]; else if (i <= 10) p[i] = [100 - 20 * (i - 5), 0]; else if (i <= 15) p[i] = [0, 20 * (i - 10)]; else p[i] = [20 * (i - 15), 100];
  }
  const t = k => k / 3;
  p[20] = [100 - 50 * t(1), 50 * t(1)]; p[21] = [100 - 50 * t(2), 50 * t(2)]; p[22] = [50, 50]; p[23] = [50 - 50 * t(1), 50 + 50 * t(1)]; p[24] = [50 - 50 * t(2), 50 + 50 * t(2)];
  p[25] = [50 * t(1), 50 * t(1)]; p[26] = [50 * t(2), 50 * t(2)]; p[27] = [50 + 50 * t(1), 50 + 50 * t(1)]; p[28] = [50 + 50 * t(2), 50 + 50 * t(2)];
  return p;
})();
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export function path(pos) {
  if (pos === HOME) return [...range(1, 19), F];
  if (pos === 0) return [F];
  if (pos === 5) return [20, 21, 22, 23, 24, 15, 16, 17, 18, 19, F];
  if (pos === 10) return [25, 26, 22, 27, 28, F];
  if (pos === 22) return [27, 28, F];
  if (pos === 20) return [21, 22, 23, 24, 15, 16, 17, 18, 19, F];
  if (pos === 21) return [22, 23, 24, 15, 16, 17, 18, 19, F];
  if (pos === 23) return [24, 15, 16, 17, 18, 19, F];
  if (pos === 24) return [15, 16, 17, 18, 19, F];
  if (pos === 25) return [26, 22, 27, 28, F];
  if (pos === 26) return [22, 27, 28, F];
  if (pos === 27) return [28, F];
  if (pos === 28) return [F];
  return [...range(pos + 1, 19), F];
}
const BACK = { 1: 0, 20: 5, 21: 20, 22: 21, 23: 22, 24: 23, 25: 10, 26: 25, 27: 22, 28: 27, 15: 14 };
const back = pos => pos in BACK ? BACK[pos] : pos - 1;
export const dest = (pos, r) => r < 0 ? (pos === HOME ? null : back(pos)) : path(pos)[Math.min(r, path(pos).length) - 1];

function throwYut(rng) {
  const flat = [0, 1, 2, 3].map(() => rng() < .5); // 넓적한 면이 위
  const k = flat.filter(Boolean).length;
  if (k === 1 && flat[0]) return -1; // 표시된 막대 하나만 → 빽도
  return k === 0 ? 5 : k;
}
const usable = (s, p, r) => r > 0 || s.pc[p].some(x => x !== HOME && x !== F);

export default {
  id: "yut", name: "윷놀이", color: "#b5562f", min: 2, max: 4, time: "20분", solo: 2,
  sub: "윷을 던져 말 넷을 먼저 다 내보내요. 윷과 모, 잡으면 한 번 더. 모서리에 서면 지름길",
  setup(n) { return { n, pc: Array.from({ length: n }, () => [HOME, HOME, HOME, HOME]), cur: 0, phase: "throw", res: [], bonus: 0, log: [], win: null }; },
  view(s) { return { ...JSON.parse(JSON.stringify(s)), turn: this.turn(s) }; },
  turn(s) { return s.win != null ? [] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (s.win != null || seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.phase === "throw") {
      if (a.t !== "throw") throw new Error("윷을 던져요");
      const r = throwYut(ctx.rng);
      logPush(s, { k: "throw", s: seat, r });
      if (!usable(s, seat, r)) { logPush(s, { k: "void", s: seat }); }
      else s.res.push(r);
      if (r === 4 || r === 5) return; // 한 번 더
      return this.afterMove(s);
    }
    if (s.phase === "move") {
      if (a.t !== "move") throw new Error("말을 움직여요");
      const r = s.res[a.ri], pc = s.pc[seat];
      if (r == null || !(a.p >= 0 && a.p < 4) || pc[a.p] === F) throw new Error("움직일 말과 윷을 골라요");
      const from = pc[a.p];
      if (r < 0 && from === HOME) throw new Error("빽도는 판 위 말만 돼요");
      const to = dest(from, r);
      const group = from === HOME ? [a.p] : pc.map((x, i) => x === from ? i : -1).filter(i => i >= 0);
      group.forEach(i => pc[i] = to);
      s.res.splice(a.ri, 1);
      let caught = 0;
      if (to !== F) s.pc.forEach((q, o) => { if (o !== seat) q.forEach((x, i) => { if (x === to) { q[i] = HOME; caught++; } }); });
      logPush(s, { k: "move", s: seat, r, n: group.length, to, caught });
      if (pc.every(x => x === F)) { s.win = seat; return; }
      if (caught) s.bonus++;
      return this.afterMove(s);
    }
    throw new Error("지금은 할 수 없어요");
  },
  afterMove(s) {
    s.res = s.res.filter(r => usable(s, s.cur, r));
    if (s.res.length) { s.phase = "move"; return; }
    if (s.bonus > 0) { s.bonus--; s.phase = "throw"; return; }
    s.cur = (s.cur + 1) % s.n; s.phase = "throw"; s.res = [];
  },
  over(s) {
    if (s.win == null) return null;
    const left = p => s.pc[p].filter(x => x !== F).length;
    const o = [...Array(s.n).keys()].sort((a, b) => left(a) - left(b));
    return { text: "말을 먼저 다 내보낸 사람", rank: o.map((p, i) => [p, p === s.win ? "다 났음" : `${i + 1}등, 남은 말 ${left(p)}`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 500 };
    if (s.phase === "throw") return { ...d, a: { t: "throw" } };
    const pc = s.pc[seat];
    let best = null, bv = -1e9;
    s.res.forEach((r, ri) => pc.forEach((x, p) => {
      if (x === F || (r < 0 && x === HOME)) return;
      if (x === HOME && pc.indexOf(HOME) !== p) return; // 집에 있는 말은 하나만 따져 봄
      const to = dest(x, r);
      let v = 0;
      if (to === F) v += 30 * pc.filter(y => y === x).length;
      s.pc.forEach((q, o) => { if (o !== seat && q.some(y => y === to)) v += 40; });
      if ([5, 10, 22].includes(to)) v += 12;
      if (x !== HOME) v += 3; else v += 6;
      const danger = s.pc.some((q, o) => o !== seat && q.some(y => y !== F && y !== HOME && [1, 2, 3, 4, 5].some(k => dest(y, k) === to)));
      if (danger && to !== F) v -= 10;
      v += rng();
      if (v > bv) { bv = v; best = { t: "move", ri, p }; }
    }));
    return { ...d, a: best };
  },
  badge(v, i) { return `${v.pc[i].filter(x => x === 99).length}개 났음`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.win == null;
    if (!my || v.phase !== "move") UI.ri = null;
    if (my && v.phase === "move" && (UI.ri == null || UI.ri >= v.res.length)) UI.ri = 0;
    const r = UI.ri != null ? v.res[UI.ri] : null;
    const stacks = {};
    v.pc.forEach((q, p) => q.forEach((x, i) => { if (x !== HOME && x !== F) (stacks[x] = stacks[x] || []).push([p, i]); }));
    const canMove = (p, i) => my && v.phase === "move" && p === me && v.pc[p][i] !== F && !(r < 0 && v.pc[p][i] === HOME);
    const target = (p, i) => canMove(p, i) && r != null ? dest(v.pc[p][i], r) : null;
    let svg = `<svg viewBox="-10 -10 120 120" class="yutb"><rect x="0" y="0" width="100" height="100" class="sq"/><line x1="100" y1="0" x2="0" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/>`;
    PT.forEach(([x, y], i) => { svg += `<circle cx="${x}" cy="${y}" r="${[0, 5, 10, 15, 22].includes(i) ? 5.2 : 3.4}" class="dot${i === 0 ? " start" : ""}"/>`; });
    for (const [pos, list] of Object.entries(stacks)) {
      const [x, y] = PT[pos], [p, i] = list[0], cnt = list.length;
      svg += `<g class="tok${canMove(p, i) ? " can" : ""}" data-p="${p}" data-i="${i}"><circle cx="${x}" cy="${y}" r="5.6" style="fill:${SEAT[p]}"/>${cnt > 1 ? `<text x="${x}" y="${y + 2.4}">${cnt}</text>` : ""}</g>`;
    }
    if (my && v.phase === "move" && r != null) {
      const seen = new Set();
      v.pc[me].forEach((x, i) => { const t = target(me, i); if (t != null && t !== F && !seen.has(t)) { seen.add(t); const [X, Y] = PT[t]; svg += `<circle cx="${X}" cy="${Y}" r="6.5" class="ghostdot"/>`; } });
    }
    svg += `<text x="100" y="112" class="lbl">참먹이 (출발, 도착)</text></svg>`;
    el.innerHTML = `<div class="yut">
      <p class="say">${v.win != null ? "판이 끝났어요" : !my ? `${esc(n[v.cur])} 차례` : v.phase === "throw" ? "윷을 던져요" : "쓸 윷을 고르고, 움직일 말을 눌러요 (집에 있는 말은 아래)"}</p>
      ${svg}
      ${my && v.phase === "move" ? `<div class="ress">${v.res.map((x, i) => `<button class="rs${UI.ri === i ? " on" : ""}" data-ri="${i}">${NAME[x]}</button>`).join("")}</div>` : ""}
      ${my && v.phase === "throw" ? `<div class="acts"><button class="th">윷 던지기</button></div>` : ""}
      <div class="homes">${[...Array(v.n).keys()].map(p => `<div class="hm${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]}"><b>${esc(n[p])}</b>
        ${v.pc[p].map((x, i) => x === HOME ? `<button class="hp" data-p="${p}" data-i="${i}" ${canMove(p, i) ? "" : "disabled"}></button>` : "").join("")}<small>${v.pc[p].filter(x => x === F).length}개 남</small></div>`).join("")}</div>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.k === "throw" ? NAME[x.r] + "!" : x.k === "void" ? "쓸 수 없어서 버림" : `${NAME[x.r]}로 ${x.n > 1 ? x.n + "개 업고 " : ""}${x.to === F ? "나감" : "이동"}${x.caught ? `, ${x.caught}개 잡음` : ""}`}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelector(".th")?.addEventListener("click", () => send({ t: "throw" }));
    el.querySelectorAll(".rs").forEach(b => b.onclick = () => { UI.ri = +b.dataset.ri; re(); });
    el.querySelectorAll(".tok.can, .hp:not([disabled])").forEach(b => b.onclick = () => send({ t: "move", ri: UI.ri, p: +b.dataset.i }));
  }
};
const UI = { ri: null };
