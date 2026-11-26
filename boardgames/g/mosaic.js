// 모자이크 공방 — 가마에서 같은 색 조각을 한꺼번에 가져와 줄에 채우고, 다 찬 줄은 벽에 붙여 점수를 내는 게임 (2~4명)
// 넘친 조각은 바닥에 떨어져 감점. 누가 벽 가로 한 줄을 채우면 그 판으로 끝. 가로 줄 +2, 세로 줄 +7, 한 색 다섯 +10.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const MC = [["바다", "#2f6fb0"], ["노을", "#e0a526"], ["산호", "#d9472b"], ["먹", "#24272c"], ["옥", "#5fb3a8"]];
const FLOOR = [-1, -1, -2, -2, -2, -3, -3];
const FIRST = 9; // 먼저 하기 표
export const wallCol = (row, color) => (color + row) % 5;

function refill(s, rng) {
  for (const f of s.fac) {
    f.length = 0;
    for (let k = 0; k < 4; k++) {
      if (!s.bag.length) { s.bag = shuffle(s.lid, rng); s.lid = []; }
      if (!s.bag.length) break;
      f.push(s.bag.pop());
    }
  }
  s.center = [FIRST]; s.firstTaken = null;
}
function score(wall, r, c) {
  let h = 1, v = 1;
  for (let x = c - 1; x >= 0 && wall[r][x]; x--) h++;
  for (let x = c + 1; x < 5 && wall[r][x]; x++) h++;
  for (let y = r - 1; y >= 0 && wall[y][c]; y--) v++;
  for (let y = r + 1; y < 5 && wall[y][c]; y++) v++;
  if (h > 1 && v > 1) return h + v;
  return Math.max(h, v);
}
function endRound(s, rng) {
  for (const [p, b] of s.boards.entries()) {
    b.lines.forEach((ln, r) => {
      if (ln.n === r + 1) {
        const c = wallCol(r, ln.c); b.wall[r][c] = true;
        const g = score(b.wall, r, c); b.score += g; logPush(s, { k: "wall", s: p, g });
        for (let k = 0; k < r; k++) s.lid.push(ln.c);
        b.lines[r] = { c: null, n: 0 };
      }
    });
    let pen = 0;
    b.floor.forEach((t, i) => { pen += FLOOR[Math.min(i, 6)]; if (t !== FIRST) s.lid.push(t); });
    b.score = Math.max(0, b.score + pen); b.floor = [];
  }
  if (s.boards.some(b => b.wall.some(row => row.every(Boolean)))) {
    for (const b of s.boards) {
      b.score += b.wall.filter(r => r.every(Boolean)).length * 2;
      for (let c = 0; c < 5; c++) if (b.wall.every(r => r[c])) b.score += 7;
      for (let col = 0; col < 5; col++) if ([0, 1, 2, 3, 4].every(r => b.wall[r][wallCol(r, col)])) b.score += 10;
    }
    s.done = true; return;
  }
  s.cur = s.firstTaken ?? s.cur; s.round++;
  refill(s, rng);
}

export default {
  id: "mosaic", name: "모자이크 공방", color: "#5fb3a8", min: 2, max: 4, time: "35분", solo: 2,
  sub: "가마에서 같은 색 조각을 한꺼번에 가져와 줄을 채워요. 다 찬 줄은 벽에 붙여 점수",
  setup(n, rng) {
    const s = { n, bag: shuffle([0, 1, 2, 3, 4].flatMap(c => Array(20).fill(c)), rng), lid: [], fac: Array.from({ length: n * 2 + 1 }, () => []), center: [], cur: 0, round: 1,
      boards: Array.from({ length: n }, () => ({ lines: Array.from({ length: 5 }, () => ({ c: null, n: 0 })), wall: Array.from({ length: 5 }, () => Array(5).fill(false)), floor: [], score: 0 })), log: [], done: false, firstTaken: null };
    refill(s, rng); return s;
  },
  view(s) { const { bag, lid, ...r } = s; return { ...JSON.parse(JSON.stringify(r)), bagN: bag.length, turn: this.turn(s) }; },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (s.done || seat !== s.cur || a.t !== "take") throw new Error("내 차례가 아니에요");
    const src = a.f === -1 ? s.center : s.fac[a.f];
    if (!src || !src.includes(a.c) || a.c === FIRST) throw new Error("가마나 가운데에서 있는 색을 골라요");
    const b = s.boards[seat];
    const row = a.row; // -1 = 바로 바닥
    if (row !== -1) {
      const ln = b.lines[row];
      if (!ln || (ln.c != null && ln.c !== a.c) || ln.n >= row + 1 || b.wall[row][wallCol(row, a.c)]) throw new Error("그 줄엔 이 색을 못 놓아요");
    }
    const got = src.filter(t => t === a.c);
    if (a.f === -1) { s.center = s.center.filter(t => t !== a.c); if (s.center.includes(FIRST)) { s.center = s.center.filter(t => t !== FIRST); b.floor.push(FIRST); s.firstTaken = seat; } }
    else { s.center.push(...src.filter(t => t !== a.c)); src.length = 0; }
    let k = got.length;
    if (row !== -1) { const ln = b.lines[row]; const room = row + 1 - ln.n, put = Math.min(room, k); ln.c = a.c; ln.n += put; k -= put; }
    for (let i = 0; i < k; i++) { if (b.floor.length < 7) b.floor.push(a.c); else s.lid.push(a.c); }
    logPush(s, { k: "take", s: seat, c: a.c, n: got.length, row, from: a.f });
    if (s.fac.every(f => !f.length) && !s.center.some(t => t !== FIRST)) return endRound(s, ctx.rng);
    s.cur = (s.cur + 1) % s.n;
  },
  over(s) {
    if (!s.done) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.boards[b].score - s.boards[a].score);
    return { text: "벽을 가장 잘 꾸민 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${s.boards[p].score}점`]) };
  },
  bot(s, seat, rng) {
    const b = s.boards[seat];
    let best = null, bv = -1e9;
    const srcs = [[-1, s.center], ...s.fac.map((f, i) => [i, f])];
    for (const [f, src] of srcs) for (const c of new Set(src.filter(t => t !== FIRST))) {
      const k = src.filter(t => t === c).length;
      for (let row = -1; row < 5; row++) {
        let v;
        if (row === -1) v = -k * 2 - 3;
        else {
          const ln = b.lines[row];
          if ((ln.c != null && ln.c !== c) || ln.n >= row + 1 || b.wall[row][wallCol(row, c)]) continue;
          const room = row + 1 - ln.n, over = Math.max(0, k - room);
          v = Math.min(k, room) * 1.5 + (k >= room ? 4 + row : 0) - over * 2.2 - (row > 2 && ln.n === 0 && k < 2 ? 2 : 0);
        }
        if (f === -1 && s.center.includes(FIRST)) v -= 1;
        v += rng() * .3;
        if (v > bv) { bv = v; best = { t: "take", f, c, row }; }
      }
    }
    return { delay: 900 + rng() * 600, a: best };
  },
  badge(v, i) { return `${v.boards[i].score}점`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && !v.done;
    if (!my) UI.pick = null;
    const tile = (c, attrs = "", cls = "") => c === FIRST ? `<span class="mt first" ${attrs}>1</span>` : `<span class="mt ${cls}" style="--m:${MC[c][1]}" ${attrs}></span>`;
    const B = me >= 0 ? v.boards[me] : null, pk = UI.pick;
    const okRow = r => { if (!pk || !B) return false; const ln = B.lines[r]; return !((ln.c != null && ln.c !== pk.c) || ln.n >= r + 1 || B.wall[r][wallCol(r, pk.c)]); };
    const board = (b, p, mine) => `<div class="mb${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]}"><div class="mh"><b>${esc(n[p])}</b><span>${b.score}점</span></div>
      <div class="mg">${b.lines.map((ln, r) => `<div class="mline${mine && okRow(r) ? " ok" : ""}" data-row="${r}">${Array.from({ length: r + 1 }, (_, k) => k < ln.n ? tile(ln.c) : `<span class="mt empty"></span>`).reverse().join("")}</div>
        <div class="mwall">${[0, 1, 2, 3, 4].map(c => { const col = (c - r + 5) % 5; return `<span class="mt w${b.wall[r][c] ? " on" : ""}" style="--m:${MC[col][1]}"></span>`; }).join("")}</div>`).join("")}</div>
      <div class="mfloor${mine && pk ? " ok" : ""}" data-row="-1"><small>바닥</small>${b.floor.map(t => tile(t)).join("")}${FLOOR.slice(b.floor.length).map(x => `<span class="mt empty"><i>${x}</i></span>`).join("")}</div></div>`;
    el.innerHTML = `<div class="mosaic">
      <p class="say">${v.done ? "판이 끝났어요" : my ? (pk ? "놓을 줄을 눌러요 (바닥에 바로 버려도 돼요)" : "가마나 가운데에서 한 색을 골라요") : `${esc(n[v.cur])} 차례`}<small>${v.round}판</small></p>
      <div class="facs">${v.fac.map((f, i) => `<div class="fac">${f.map(c => tile(c, my ? `data-f="${i}" data-c="${c}"` : "", pk && pk.f === i && pk.c === c ? "sel" : "")).join("")}</div>`).join("")}
        <div class="fac center"><small>가운데</small>${v.center.map(c => tile(c, my && c !== FIRST ? `data-f="-1" data-c="${c}"` : "", pk && pk.f === -1 && pk.c === c ? "sel" : "")).join("")}</div></div>
      ${B ? board(B, me, true) : ""}
      <div class="others2">${v.boards.map((b, p) => p === me ? "" : board(b, p, false)).join("")}</div>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.k === "take" ? `${MC[x.c][0]} ${x.n}개${x.row < 0 ? " 바닥으로" : `, ${x.row + 1}줄`}` : `벽에 붙여 ${x.g}점`}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll("[data-f]").forEach(t => t.onclick = () => { UI.pick = { f: +t.dataset.f, c: +t.dataset.c }; re(); });
    if (pk) el.querySelectorAll(".mb .mline.ok, .mb .mfloor.ok").forEach(r => r.onclick = () => { const p = UI.pick; UI.pick = null; send({ t: "take", f: p.f, c: p.c, row: +r.dataset.row }); });
  }
};
const UI = { pick: null };
