// 섬 지도 잇기 — 땅 조각을 한 장씩 이어 붙여 길과 마을과 절을 만들고, 일꾼을 올려 완성되면 점수를 받는 게임 (2~5명)
// 길은 조각당 1점, 마을은 조각당 2점, 절은 둘레 여덟 칸이 다 차면 9점. 가장 많은 일꾼을 올린 사람이 점수(비기면 모두). 끝나면 안 끝난 것도 반값.
// 조각 18종 65장은 이 게임용으로 새로 짰다. 들판 점수는 없음.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const TILE = {
  A: { e: "ffff", temple: 1, n: 4 }, B: { e: "ffrf", temple: 1, road: [[2]], n: 2 },
  R1: { e: "rfrf", road: [[0, 2]], n: 8 }, R2: { e: "ffrr", road: [[2, 3]], n: 9 }, R3: { e: "frrr", road: [[1], [2], [3]], n: 4 }, R4: { e: "rrrr", road: [[0], [1], [2], [3]], n: 1 },
  C1: { e: "tfff", town: [[0]], n: 5 }, C2: { e: "trfr", town: [[0]], road: [[1, 3]], n: 3 }, C3: { e: "tfrr", town: [[0]], road: [[2, 3]], n: 3 },
  C4: { e: "trrf", town: [[0]], road: [[1, 2]], n: 3 }, C5: { e: "tftf", town: [[0], [2]], n: 3 }, C6: { e: "ttff", town: [[0], [1]], n: 2 },
  C7: { e: "tftf", town: [[0, 2]], n: 3 }, C8: { e: "tfft", town: [[0, 3]], n: 5 }, C9: { e: "trrt", town: [[0, 3]], road: [[1, 2]], n: 4 },
  C10: { e: "ttft", town: [[0, 1, 3]], n: 3 }, C11: { e: "ttrt", town: [[0, 1, 3]], road: [[2]], n: 2 }, C12: { e: "tttt", town: [[0, 1, 2, 3]], n: 1 }
};
const D = [[0, -1], [1, 0], [0, 1], [-1, 0]], MEN = 7;
const key = (x, y) => x + "," + y;
export const edgeOf = (k, r, d) => TILE[k].e[(d - r + 4) % 4];
export function feats(k, r) { // 돌린 조각의 길, 마을, 절
  const t = TILE[k], out = [];
  (t.town || []).forEach(g => out.push({ t: "town", e: g.map(d => (d + r) % 4) }));
  (t.road || []).forEach(g => out.push({ t: "road", e: g.map(d => (d + r) % 4) }));
  if (t.temple) out.push({ t: "temple", e: [] });
  return out;
}
export function fits(board, x, y, k, r) {
  if (board[key(x, y)]) return false;
  let touch = false;
  for (let d = 0; d < 4; d++) {
    const nb = board[key(x + D[d][0], y + D[d][1])];
    if (!nb) continue;
    touch = true;
    if (edgeOf(k, r, d) !== edgeOf(nb.k, nb.r, (d + 2) % 4)) return false;
  }
  return touch;
}
export function spots(board, k) {
  const cand = new Set();
  for (const t of Object.values(board)) for (const [dx, dy] of D) { const kk = key(t.x + dx, t.y + dy); if (!board[kk]) cand.add(kk); }
  const out = [];
  for (const c of cand) { const [x, y] = c.split(",").map(Number); for (let r = 0; r < 4; r++) if (fits(board, x, y, k, r)) out.push({ x, y, r }); }
  return out;
}
const root = (s, i) => { while (s.seg[i].p !== i) i = s.seg[i].p = s.seg[s.seg[i].p].p; return i; };
function union(s, a, b) {
  a = root(s, a); b = root(s, b);
  if (a === b) { s.seg[a].open -= 2; return; }
  const A = s.seg[a], B = s.seg[b];
  B.p = a; A.open += B.open - 2; Object.assign(A.tiles, B.tiles);
  for (const [p, n] of Object.entries(B.men)) A.men[p] = (A.men[p] || 0) + n;
  B.men = {};
}
function putTile(s, x, y, k, r) {
  const t = { x, y, k, r, f: [], men: [] };
  for (const f of feats(k, r)) { const id = s.seg.length; s.seg.push({ t: f.t, p: id, open: f.e.length, tiles: { [key(x, y)]: 1 }, men: {}, done: false, x, y }); t.f.push(id); }
  s.board[key(x, y)] = t;
  const F = feats(k, r);
  for (let d = 0; d < 4; d++) {
    const nb = s.board[key(x + D[d][0], y + D[d][1])];
    if (!nb) continue;
    const i = F.findIndex(f => f.e.includes(d)); if (i < 0) continue;
    const NF = feats(nb.k, nb.r), j = NF.findIndex(f => f.e.includes((d + 2) % 4)); if (j < 0) continue;
    union(s, t.f[i], nb.f[j]);
  }
  return t;
}
function award(s, segRoot, pts, why) {
  const men = s.seg[segRoot].men, mx = Math.max(0, ...Object.values(men));
  if (!mx) return;
  for (const [p, n] of Object.entries(men)) { if (n === mx) { s.score[p] += pts; logPush(s, { k: "score", s: +p, pts, why }); } s.men[p] += n; }
  s.seg[segRoot].men = {};
  // 조각 위 일꾼 그림 지우기
  for (const t of Object.values(s.board)) t.men = t.men.filter(m => root(s, t.f[m.f]) !== segRoot);
}
function templeN(s, x, y) { let c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (s.board[key(x + dx, y + dy)]) c++; return c; }
function checkDone(s, t) {
  const roots = new Set(t.f.map(i => root(s, i)));
  for (const ro of roots) {
    const g = s.seg[ro];
    if (g.t === "temple" || g.done || g.open > 0) continue;
    g.done = true;
    const n = Object.keys(g.tiles).length;
    award(s, ro, g.t === "town" ? n * 2 : n, g.t === "town" ? `마을 ${n}조각` : `길 ${n}조각`);
  }
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nb = s.board[key(t.x + dx, t.y + dy)];
    if (!nb || !TILE[nb.k].temple) continue;
    const ti = feats(nb.k, nb.r).findIndex(f => f.t === "temple"), ro = root(s, nb.f[ti]);
    if (!s.seg[ro].done && templeN(s, nb.x, nb.y) === 9) { s.seg[ro].done = true; award(s, ro, 9, "절"); }
  }
}
function drawNext(s) {
  while (s.deck.length) {
    const k = s.deck.pop();
    if (spots(s.board, k).length) { s.tile = k; s.phase = "place"; return; }
    logPush(s, { k: "skip", tile: k });
  }
  // 끝: 안 끝난 것 반값
  for (let i = 0; i < s.seg.length; i++) {
    if (root(s, i) !== i) continue;
    const g = s.seg[i];
    if (g.done || !Object.keys(g.men).length) continue;
    const pts = g.t === "temple" ? templeN(s, g.x, g.y) : Object.keys(g.tiles).length;
    award(s, i, pts, g.t === "temple" ? "안 끝난 절" : g.t === "town" ? "안 끝난 마을" : "안 끝난 길");
  }
  s.phase = "end"; s.tile = null;
}

export default {
  id: "map", name: "섬 지도 잇기", color: "#6d6a2f", min: 2, max: 5, time: "35분", solo: 3,
  sub: "땅 조각을 이어 붙여 길과 마을과 절을 만들고, 일꾼을 올려 완성되면 점수를 받아요",
  setup(n, rng) {
    const deck = [];
    for (const [k, t] of Object.entries(TILE)) for (let i = 0; i < t.n - (k === "C2" ? 1 : 0); i++) deck.push(k);
    const s = { n, deck: shuffle(deck, rng), board: {}, seg: [], score: Array(n).fill(0), men: Array(n).fill(MEN), cur: 0, phase: "place", tile: null, last: null, log: [] };
    putTile(s, 0, 0, "C2", 0);
    drawNext(s); return s;
  },
  view(s) { const { deck, seg, ...r } = s; const o = JSON.parse(JSON.stringify(r)); o.deckN = deck.length; o.turn = this.turn(s);
    if (s.phase === "man" && s.last) { const t = s.board[key(s.last.x, s.last.y)]; o.free = t.f.map(i => !Object.keys(s.seg[root(s, i)].men).length && !s.seg[root(s, i)].done); }
    return o; },
  turn(s) { return s.phase === "end" ? [] : [s.cur]; },
  apply(s, seat, a) {
    if (s.phase === "end" || seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.phase === "place") {
      if (a.t !== "place" || !fits(s.board, a.x, a.y, s.tile, a.r & 3)) throw new Error("이웃 조각과 가장자리가 맞는 곳에 놓아요");
      putTile(s, a.x, a.y, s.tile, a.r & 3); s.last = { x: a.x, y: a.y }; s.phase = "man";
      logPush(s, { k: "place", s: seat }); return;
    }
    if (s.phase === "man") {
      if (a.t !== "man") throw new Error("일꾼을 올릴지 골라요");
      const t = s.board[key(s.last.x, s.last.y)];
      if (a.f >= 0) {
        const id = t.f[a.f]; if (id == null) throw new Error("그런 곳이 없어요");
        const ro = root(s, id);
        if (!s.men[seat]) throw new Error("일꾼이 다 나갔어요");
        if (Object.keys(s.seg[ro].men).length || s.seg[ro].done) throw new Error("이미 누가 있는 곳이에요");
        s.seg[ro].men[seat] = 1; s.men[seat]--; t.men.push({ f: a.f, p: seat });
      }
      checkDone(s, t);
      s.cur = (s.cur + 1) % s.n; drawNext(s); return;
    }
    throw new Error("지금은 할 수 없어요");
  },
  over(s) {
    if (s.phase !== "end") return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.score[b] - s.score[a]);
    return { text: "점수가 가장 높은 개척자", rank: o.map((p, i) => [p, `${i + 1}등, ${s.score[p]}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 600 };
    if (s.phase === "man") {
      const t = s.board[key(s.last.x, s.last.y)];
      if (!s.men[seat]) return { ...d, a: { t: "man", f: -1 } };
      let bf = -1, bv = s.men[seat] <= 2 ? 3.5 : 1.2;
      t.f.forEach((id, i) => {
        const ro = root(s, id), g = s.seg[ro];
        if (Object.keys(g.men).length || g.done) return;
        const n = Object.keys(g.tiles).length;
        const v = g.t === "temple" ? templeN(s, t.x, t.y) * .8 : g.t === "town" ? n * 1.6 + (g.open <= 1 ? 3 : 0) : n * .8 + (g.open === 0 ? 3 : 0);
        if (v + rng() * .4 > bv) { bv = v; bf = i; }
      });
      return { ...d, a: { t: "man", f: bf } };
    }
    const all = spots(s.board, s.tile);
    let best = all[0], bv = -1e9;
    for (const sp of all) {
      let v = 0;
      for (let dd = 0; dd < 4; dd++) if (s.board[key(sp.x + D[dd][0], sp.y + D[dd][1])]) v += 1;
      for (const f of feats(s.tile, sp.r)) for (const dd of f.e) {
        const nb = s.board[key(sp.x + D[dd][0], sp.y + D[dd][1])]; if (!nb) continue;
        const j = feats(nb.k, nb.r).findIndex(g => g.e.includes((dd + 2) % 4)); if (j < 0) continue;
        const g = s.seg[root(s, nb.f[j])], mine = g.men[seat] || 0, other = Math.max(0, ...Object.entries(g.men).filter(([p]) => +p !== seat).map(([, n]) => n));
        v += mine > other ? 3 : other > mine ? -1.5 : .5;
      }
      v += rng() * .5;
      if (v > bv) { bv = v; best = sp; }
    }
    return { ...d, a: { t: "place", x: best.x, y: best.y, r: best.r } };
  },
  badge(v, i) { return `${v.score[i]}점, 일꾼 ${v.men[i]}`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.phase !== "end";
    if (!my || v.phase !== "place") UI.rot = UI.rot || 0;
    const all = my && v.phase === "place" ? spots(v.board, v.tile) : [];
    if (my && v.phase === "place" && !all.some(s => s.r === UI.rot) && all.length) UI.rot = all[0].r;
    const here = all.filter(s => s.r === UI.rot);
    const tiles = Object.values(v.board);
    const xs = [...tiles.map(t => t.x), ...here.map(s => s.x)], ys = [...tiles.map(t => t.y), ...here.map(s => s.y)];
    const x0 = Math.min(...xs) - 1, y0 = Math.min(...ys) - 1, W = Math.max(...xs) - x0 + 2, H = Math.max(...ys) - y0 + 2;
    let g = "";
    for (const t of tiles) g += tileSVG(t.k, t.r, t.x * 100, t.y * 100, t.men, v.last && t.x === v.last.x && t.y === v.last.y);
    for (const sp of here) g += `<rect class="spot" x="${sp.x * 100 + 4}" y="${sp.y * 100 + 4}" width="92" height="92" rx="8" data-x="${sp.x}" data-y="${sp.y}"/>`;
    const t = v.last && v.board[key(v.last.x, v.last.y)];
    el.innerHTML = `<div class="map">
      <p class="say">${v.phase === "end" ? "판이 끝났어요" : !my ? `${esc(n[v.cur])} 차례` : v.phase === "place" ? "조각을 돌려 보고, 점선 칸을 눌러 놓아요" : "방금 놓은 조각에 일꾼을 올릴까요?"}<small>남은 조각 ${v.deckN}</small></p>
      <div class="mapwrap${UI.big ? " big" : ""}"><svg viewBox="${x0 * 100} ${y0 * 100} ${W * 100} ${H * 100}" class="mapsvg">${g}</svg></div>
      <div class="mtool">${v.tile ? `<div class="cur"><svg viewBox="0 0 100 100">${tileSVG(v.tile, my && v.phase === "place" ? UI.rot : 0, 0, 0, [], false)}</svg><small>${my && v.phase === "place" ? "놓을 조각" : "지금 조각"}</small></div>` : ""}
        ${my && v.phase === "place" ? `<button class="rot">돌리기</button>` : ""}<button class="ghost zoom">${UI.big ? "작게 보기" : "크게 보기"}</button></div>
      ${my && v.phase === "man" && t ? `<div class="acts">${feats(t.k, t.r).map((f, i) => v.free?.[i] && v.men[me] ? `<button data-f="${i}">${({ town: "마을", road: "길", temple: "절" })[f.t]}에 올리기</button>` : "").join("")}<button class="ghost" data-f="-1">안 올리기</button></div>` : ""}
      <ol class="score">${v.score.map((x, p) => `<li style="--s:${SEAT[p]}" class="${p === v.cur ? "cur" : ""}"><b>${esc(n[p])}</b><span>${x}점, 일꾼 ${v.men[p]}</span></li>`).join("")}</ol>
      <ol class="log">${v.log.map(x => `<li>${x.k === "score" ? `${nameB(n, x.s)} ${x.why} ${x.pts}점` : x.k === "skip" ? "놓을 곳이 없는 조각이 나와 버림" : `${nameB(n, x.s)} 조각을 놓음`}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelector(".rot")?.addEventListener("click", () => { const rs = [...new Set(all.map(s => s.r))].sort(); const i = rs.indexOf(UI.rot); UI.rot = rs[(i + 1) % rs.length] ?? 0; re(); });
    el.querySelector(".zoom")?.addEventListener("click", () => { UI.big = !UI.big; re(); });
    el.querySelectorAll(".spot").forEach(b => b.onclick = () => send({ t: "place", x: +b.dataset.x, y: +b.dataset.y, r: UI.rot }));
    el.querySelectorAll("[data-f]").forEach(b => b.onclick = () => send({ t: "man", f: +b.dataset.f }));
  }
};
const UI = { rot: 0, big: false };

// 조각 그림: 들판 바탕, 마을은 가장자리에서 안쪽으로, 길은 가장자리 가운데에서 중심으로
const MID = [[50, 0], [100, 50], [50, 100], [0, 50]];
const CORN = [[[0, 0], [100, 0]], [[100, 0], [100, 100]], [[100, 100], [0, 100]], [[0, 100], [0, 0]]];
function tileSVG(k, r, ox, oy, men, last) {
  const F = feats(k, r);
  let s = `<g transform="translate(${ox} ${oy})"><rect width="100" height="100" class="fld${last ? " last" : ""}"/>`;
  for (const f of F.filter(f => f.t === "town")) {
    if (f.e.length === 1) { const [[ax, ay], [bx, by]] = CORN[f.e[0]], [mx, my] = MID[f.e[0]], cx = mx + (50 - mx) * .62, cy = my + (50 - my) * .62; s += `<path class="town" d="M${ax} ${ay} Q${cx} ${cy} ${bx} ${by} Z"/>`; }
    else { const pts = []; f.e.sort((a, b) => a - b).forEach(d => pts.push(...CORN[d])); s += `<polygon class="town" points="${f.e.length === 4 ? "0,0 100,0 100,100 0,100" : [...pts, [50, 50]].map(p => p.join(",")).join(" ")}"/>`; if (f.e.length === 2 && Math.abs(f.e[0] - f.e[1]) === 2) s += `<rect class="town" x="${f.e[0] % 2 ? 15 : 0}" y="${f.e[0] % 2 ? 0 : 15}" width="${f.e[0] % 2 ? 70 : 100}" height="${f.e[0] % 2 ? 100 : 70}"/>`; }
  }
  for (const f of F.filter(f => f.t === "road")) {
    if (f.e.length === 2) { const [a, b] = f.e.map(d => MID[d]); s += `<path class="road" d="M${a[0]} ${a[1]} Q50 50 ${b[0]} ${b[1]}"/>`; }
    else { const [a] = f.e.map(d => MID[d]); s += `<line class="road" x1="${a[0]}" y1="${a[1]}" x2="50" y2="50"/>`; }
  }
  if (F.some(f => f.t === "road" && f.e.length === 1) && !TILE[k].temple) s += `<rect class="cross" x="42" y="42" width="16" height="16"/>`;
  if (TILE[k].temple) s += `<g class="temple"><rect x="36" y="40" width="28" height="22"/><path d="M32 42 L50 28 L68 42 Z"/></g>`;
  for (const m of men) {
    const f = F[m.f]; let cx = 50, cy = 50;
    if (f && f.e.length) { const [mx, my] = MID[f.e[0]]; cx = mx + (50 - mx) * (f.t === "town" ? .35 : .55); cy = my + (50 - my) * (f.t === "town" ? .35 : .55); }
    s += `<circle class="man" cx="${cx}" cy="${cy}" r="11" style="fill:${SEAT[m.p]}"/>`;
  }
  return s + `</g>`;
}
