// 여섯째 소 — 모두 동시에 카드 한 장을 내고, 줄의 여섯 번째가 되면 그 줄 소를 다 떠안는 게임 (2~10명)
// 카드 1~104, 카드마다 소 머리(벌점) 1~7. 열 장씩 받아 열 번 내면 한 판. 누가 66점을 넘으면 끝, 벌점이 적은 사람이 이김.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const heads = c => c === 55 ? 7 : c % 11 === 0 ? 5 : c % 10 === 0 ? 3 : c % 5 === 0 ? 2 : 1;
const END = 66;

function deal(s, rng) {
  const deck = shuffle([...Array(104).keys()].map(i => i + 1), rng);
  s.hands = Array.from({ length: s.n }, () => deck.splice(0, 10).sort((a, b) => a - b));
  s.rows = [0, 1, 2, 3].map(() => [deck.pop()]);
  s.pick = Array(s.n).fill(null); s.queue = null; s.phase = "pick"; s.round++;
}
// 고른 카드를 작은 것부터 놓는다. 어느 줄보다 작으면 그 사람이 가져갈 줄을 골라야 해서 멈춘다
function resolve(s) {
  while (s.queue.length) {
    const [p, c] = s.queue[0];
    let best = -1;
    s.rows.forEach((r, i) => { const last = r[r.length - 1]; if (last < c && (best < 0 || last > s.rows[best][s.rows[best].length - 1])) best = i; });
    if (best < 0) { s.phase = "take"; s.taker = p; return; }
    const r = s.rows[best];
    if (r.length === 5) { const h = r.reduce((a, x) => a + heads(x), 0); s.score[p] += h; logPush(s, { k: "six", s: p, h, c }); s.rows[best] = [c]; }
    else r.push(c);
    s.queue.shift();
  }
  s.last = s.pick; s.pick = Array(s.n).fill(null); s.phase = "pick";
  if (!s.hands[0].length) {
    if (Math.max(...s.score) >= END) { s.phase = "end"; return; }
    deal(s, Math.random);
  }
}

export default {
  id: "cow", name: "여섯째 소", color: "#b8355e", min: 2, max: 10, time: "20분", solo: 4,
  sub: "모두 동시에 카드를 내요. 줄의 여섯 번째가 되면 그 줄 소 머리를 다 벌점으로",
  setup(n, rng) { const s = { n, score: Array(n).fill(0), round: 0, log: [], last: null, taker: null }; deal(s, rng); return s; },
  view(s, seat) {
    return {
      n: s.n, rows: s.rows, score: s.score, round: s.round, phase: s.phase, taker: s.taker, log: s.log,
      left: s.hands[0]?.length ?? 0, hand: seat >= 0 ? s.hands[seat] : null,
      picked: s.pick.map(x => x != null), mine: seat >= 0 ? s.pick[seat] : null,
      shown: s.queue ? s.queue.map(([p, c]) => [p, c]) : null, last: s.last, turn: this.turn(s)
    };
  },
  turn(s) { return s.phase === "pick" ? [...Array(s.n).keys()].filter(p => s.pick[p] == null) : s.phase === "take" ? [s.taker] : []; },
  apply(s, seat, a) {
    if (s.phase === "pick" && a.t === "pick") {
      if (s.pick[seat] != null) throw new Error("이미 냈어요");
      const i = s.hands[seat].indexOf(a.c);
      if (i < 0) throw new Error("그 카드가 없어요");
      s.hands[seat].splice(i, 1); s.pick[seat] = a.c;
      if (s.pick.every(x => x != null)) { s.queue = s.pick.map((c, p) => [p, c]).sort((x, y) => x[1] - y[1]); resolve(s); }
      return;
    }
    if (s.phase === "take" && a.t === "take") {
      if (seat !== s.taker) throw new Error("가져갈 사람이 고르는 중이에요");
      const r = s.rows[a.r]; if (!r) throw new Error("줄을 골라요");
      const h = r.reduce((x, c) => x + heads(c), 0), c = s.queue[0][1];
      s.score[seat] += h; logPush(s, { k: "take", s: seat, h, c }); s.rows[a.r] = [c]; s.queue.shift(); s.taker = null;
      return resolve(s);
    }
    throw new Error("지금은 할 수 없어요");
  },
  over(s) {
    if (s.phase !== "end") return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.score[a] - s.score[b]);
    return { text: "소를 가장 적게 떠안은 사람", rank: o.map((p, i) => [p, `${i + 1}등, 벌점 ${s.score[p]}`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 700 + rng() * 900 };
    if (s.phase === "take") {
      const h = s.rows.map(r => r.reduce((x, c) => x + heads(c), 0));
      return { ...d, a: { t: "take", r: h.indexOf(Math.min(...h)) } };
    }
    let best = null, bv = 1e9;
    for (const c of s.hands[seat]) {
      let row = -1;
      s.rows.forEach((r, i) => { const l = r[r.length - 1]; if (l < c && (row < 0 || l > s.rows[row][s.rows[row].length - 1])) row = i; });
      let risk;
      if (row < 0) risk = Math.min(...s.rows.map(r => r.reduce((x, k) => x + heads(k), 0))) + 1;
      else { const r = s.rows[row], gap = c - r[r.length - 1]; risk = r.length >= 5 ? r.reduce((x, k) => x + heads(k), 0) * 2 : (r.length - 1) * .6 + gap * .04 * s.n; }
      risk += rng() * .5;
      if (risk < bv) { bv = risk; best = c; }
    }
    return { ...d, a: { t: "pick", c: best } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, H = c => `<span class="cw h${heads(c)}"><b>${c}</b><i>${"▲".repeat(heads(c))}</i></span>`;
    const mustTake = v.phase === "take" && v.taker === me;
    let say = v.phase === "end" ? "판이 끝났어요" : mustTake ? `내 카드 ${v.shown[0][1]}은(는) 어느 줄보다 작아요. 가져갈 줄을 눌러요` :
      v.phase === "take" ? `${esc(n[v.taker])}이(가) 가져갈 줄을 고르는 중` : v.mine != null ? "냈어요. 다른 사람을 기다려요" : "낼 카드를 골라요";
    el.innerHTML = `<div class="cow">
      <p class="say">${say}<small>${v.round}판째, 남은 카드 ${v.left}장</small></p>
      <div class="rows">${v.rows.map((r, i) => `<div class="crow${mustTake ? " pickable" : ""}" data-r="${i}">${r.map(H).join("")}${Array(5 - r.length).fill('<span class="cw empty"></span>').join("")}<span class="cw six">6</span><small>${r.reduce((a, c) => a + heads(c), 0)}</small></div>`).join("")}</div>
      ${v.shown ? `<div class="shown">${v.shown.map(([p, c]) => `<span style="--s:${SEAT[p]}">${esc(n[p])} ${c}</span>`).join("")}</div>` : v.last ? `<div class="shown dim">지난번: ${v.last.map((c, p) => `${esc(n[p])} ${c}`).join(", ")}</div>` : ""}
      <div class="picked">${v.picked.map((x, p) => `<span class="${x ? "on" : ""}" style="--s:${SEAT[p]}">${esc(n[p])}</span>`).join("")}</div>
      ${v.hand ? `<div class="hand cows">${v.hand.map(c => `<button class="cwb" data-c="${c}" ${v.phase !== "pick" || v.mine != null ? "disabled" : ""}>${H(c)}</button>`).join("")}${v.mine != null ? `<span class="mine">낸 카드 ${H(v.mine)}</span>` : ""}</div>` : ""}
      <ol class="score">${v.score.map((x, p) => `<li style="--s:${SEAT[p]}"><b>${esc(n[p])}</b><span>벌점 ${x}</span></li>`).join("")}</ol>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.c}${x.k === "six" ? "이(가) 여섯 번째" : "이(가) 너무 작아"} 소 ${x.h}마리</li>`).join("")}</ol>
    </div>`;
    el.querySelectorAll(".cwb:not([disabled])").forEach(b => b.onclick = () => send({ t: "pick", c: +b.dataset.c }));
    if (mustTake) el.querySelectorAll(".crow").forEach(b => b.onclick = () => send({ t: "take", r: +b.dataset.r }));
  }
};
