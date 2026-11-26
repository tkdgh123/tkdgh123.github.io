// 오목 — 15줄 바둑판에 돌 다섯 개를 먼저 한 줄로 잇는 전통 놀이 (2명)
import { esc, SEAT, logPush } from "../lib.js";

const N = 15, DIR = [[1, 0], [0, 1], [1, 1], [1, -1]];
function line(b, x, y, dx, dy, c) { let k = 0; for (let i = 1; i < 6; i++) { const X = x + dx * i, Y = y + dy * i; if (X < 0 || Y < 0 || X >= N || Y >= N || b[Y * N + X] !== c) break; k++; } return k; }
function five(b, x, y, c) { return DIR.some(([dx, dy]) => 1 + line(b, x, y, dx, dy, c) + line(b, x, y, -dx, -dy, c) >= 5); }

export default {
  id: "omok", name: "오목", color: "#7a5a3a", min: 2, max: 2, time: "10분", solo: 2,
  sub: "바둑판에 돌 다섯 개를 먼저 한 줄로 이어요. 가로, 세로, 대각선 다 돼요",
  setup() { return { b: Array(N * N).fill(-1), cur: 0, last: null, win: null, n: 2, moves: 0, log: [] }; },
  view(s) { return { ...s, b: [...s.b], turn: this.turn(s) }; },
  turn(s) { return s.win != null || s.moves >= N * N ? [] : [s.cur]; },
  apply(s, seat, a) {
    if (s.win != null || seat !== s.cur) throw new Error("내 차례가 아니에요");
    const i = a.i | 0;
    if (a.t !== "put" || i < 0 || i >= N * N || s.b[i] >= 0) throw new Error("빈 자리에 놓아요");
    s.b[i] = seat; s.last = i; s.moves++;
    if (five(s.b, i % N, Math.floor(i / N), seat)) s.win = seat;
    s.cur = 1 - seat;
  },
  over(s) {
    if (s.win == null && s.moves < N * N) return null;
    if (s.win == null) return { text: "무승부", rank: [[0, "비김"], [1, "비김"]] };
    return { text: `${s.win ? "흰" : "검은"} 돌 승리`, rank: [[s.win, "이김"], [1 - s.win, "짐"]] };
  },
  bot(s, seat, rng) {
    const b = s.b, opp = 1 - seat;
    if (!s.moves) return { delay: 600, a: { t: "put", i: 7 * N + 7 } };
    let best = -1, bv = -1;
    const W = [0, 2, 12, 120, 1500, 100000];
    for (let i = 0; i < N * N; i++) {
      if (b[i] >= 0) continue;
      const x = i % N, y = Math.floor(i / N);
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && b[Y * N + X] >= 0) { near = true; break; } }
      if (!near) continue;
      let v = 0;
      for (const [dx, dy] of DIR) for (const [c, w] of [[seat, 1.1], [opp, 1]]) {
        const k = 1 + line(b, x, y, dx, dy, c) + line(b, x, y, -dx, -dy, c);
        const openA = (() => { const X = x + dx * (line(b, x, y, dx, dy, c) + 1), Y = y + dy * (line(b, x, y, dx, dy, c) + 1); return X >= 0 && Y >= 0 && X < N && Y < N && b[Y * N + X] < 0; })();
        const openB = (() => { const l = line(b, x, y, -dx, -dy, c) + 1, X = x - dx * l, Y = y - dy * l; return X >= 0 && Y >= 0 && X < N && Y < N && b[Y * N + X] < 0; })();
        const open = openA + openB;
        v += W[Math.min(5, k)] * (k >= 5 ? 10 : open === 2 ? 1 : open === 1 ? .35 : .05) * w;
      }
      v += rng() * 2;
      if (v > bv) { bv = v; best = i; }
    }
    return { delay: 700 + rng() * 500, a: { t: "put", i: best } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.win == null;
    el.innerHTML = `<div class="omok">
      <p class="say">${v.win != null ? "판이 끝났어요" : my ? `내 차례 (${me ? "흰" : "검은"} 돌)` : `${esc(n[v.cur])} 차례`}</p>
      <div class="go15">${v.b.map((c, i) => `<button class="pt${c === 0 ? " bk" : c === 1 ? " wh" : ""}${v.last === i ? " last" : ""}" data-i="${i}" ${my && c < 0 ? "" : "disabled"} aria-label="${i % N + 1}, ${Math.floor(i / N) + 1}"></button>`).join("")}</div>
      <p class="dim small">검은 돌 ${esc(n[0])}, 흰 돌 ${esc(n[1] || "")}</p>
    </div>`;
    el.querySelectorAll(".pt:not([disabled])").forEach(b => b.onclick = () => send({ t: "put", i: +b.dataset.i }));
  }
};
