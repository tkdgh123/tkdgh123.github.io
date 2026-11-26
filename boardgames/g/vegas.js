// 주사위 내기 — 주사위 여덟 개를 굴려 같은 눈을 모두 그 번호 술집에 건다. 가장 많이 건 사람이 큰돈, 같은 수로 비기면 둘 다 못 받음 (2~5명)
// 네 판. 판마다 술집 여섯 곳에 5만 원 넘게 상금을 깔고 시작. 돈이 가장 많은 사람이 이김.
import { esc, shuffle, SEAT, dieHTML, logPush, nameB } from "../lib.js";

const ROUNDS = 4, DICE = 8;
function newRound(s, rng) {
  s.round++;
  if (s.bills.length < 30) s.bills = shuffle([...Array(6).fill(1), ...Array(8).fill(2), ...Array(8).fill(3), ...Array(6).fill(4), ...Array(6).fill(5), ...Array(5).fill(6), ...Array(5).fill(7), ...Array(5).fill(8), ...Array(5).fill(9)], rng);
  s.casino = [0, 1, 2, 3, 4, 5].map(() => { const m = []; while (m.reduce((a, b) => a + b, 0) < 5) m.push(s.bills.pop()); return m.sort((a, b) => b - a); });
  s.bets = [0, 1, 2, 3, 4, 5].map(() => Array(s.n).fill(0));
  s.left = Array(s.n).fill(DICE); s.roll = null; s.cur = (s.round - 1) % s.n;
}
function resolve(s) {
  const pay = [];
  s.casino.forEach((bills, c) => {
    const cnt = s.bets[c];
    const by = {}; cnt.forEach((k, p) => { if (k) (by[k] = by[k] || []).push(p); });
    const order = Object.keys(by).map(Number).sort((a, b) => b - a).filter(k => by[k].length === 1).map(k => by[k][0]);
    order.forEach((p, i) => { if (bills[i] != null) { s.money[p] += bills[i]; pay.push([c, p, bills[i]]); } });
  });
  logPush(s, { k: "pay", pay, round: s.round }, 20);
}

export default {
  id: "vegas", name: "주사위 내기", color: "#5a7d2a", min: 2, max: 5, time: "25분", solo: 3,
  sub: "주사위를 굴려 같은 눈을 모두 그 번호 술집에 걸어요. 가장 많이 건 사람이 큰돈, 비기면 둘 다 꽝",
  setup(n, rng) { const s = { n, round: 0, money: Array(n).fill(0), bills: [], log: [], done: false }; newRound(s, rng); return s; },
  view(s) { const { bills, ...r } = s; return { ...JSON.parse(JSON.stringify(r)), turn: this.turn(s) }; },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (s.done || seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (a.t === "roll") {
      if (s.roll) throw new Error("이미 굴렸어요");
      s.roll = Array.from({ length: s.left[seat] }, () => 1 + Math.floor(ctx.rng() * 6)).sort(); return;
    }
    if (a.t === "bet") {
      if (!s.roll || !s.roll.includes(a.v)) throw new Error("굴린 눈 중에 골라요");
      const k = s.roll.filter(x => x === a.v).length;
      s.bets[a.v - 1][seat] += k; s.left[seat] -= k; s.roll = null;
      logPush(s, { k: "bet", s: seat, v: a.v, n: k }, 20);
      if (s.left.every(x => !x)) { resolve(s); if (s.round >= ROUNDS) { s.done = true; return; } return newRound(s, ctx.rng); }
      let c = s.cur; do c = (c + 1) % s.n; while (!s.left[c]); s.cur = c; return;
    }
    throw new Error("모르는 행동이에요");
  },
  over(s) {
    if (!s.done) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.money[b] - s.money[a]);
    return { text: "돈을 가장 많이 딴 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${s.money[p]}만 원`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 500 };
    if (!s.roll) return { ...d, a: { t: "roll" } };
    let best = s.roll[0], bv = -1e9;
    for (const v of [...new Set(s.roll)]) {
      const k = s.roll.filter(x => x === v).length, c = v - 1, mine = s.bets[c][seat] + k;
      const others = s.bets[c].filter((_, p) => p !== seat);
      const top = Math.max(0, ...others);
      const val = mine > top ? s.casino[c][0] : mine === top ? -1 : (s.casino[c][1] || 0) * .5;
      const score = val * 1.2 - k * .6 + rng() * .5 + (others.includes(mine) ? -2 : 0);
      if (score > bv) { bv = score; best = v; }
    }
    return { ...d, a: { t: "bet", v: best } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && !v.done;
    el.innerHTML = `<div class="vegas">
      <p class="say">${v.done ? "판이 끝났어요" : my ? (v.roll ? "걸 눈을 골라요. 같은 눈은 모두 그 술집으로 가요" : `주사위 ${v.left[me]}개를 굴려요`) : `${esc(n[v.cur])} 차례`}<small>${v.round}/${ROUNDS}판</small></p>
      <div class="pubs">${v.casino.map((bills, c) => `<div class="pub${my && v.roll?.includes(c + 1) ? " can" : ""}" ${my && v.roll?.includes(c + 1) ? `data-v="${c + 1}"` : ""}>
        ${dieHTML(c + 1)}<div class="bills">${bills.map(b => `<span>${b}만</span>`).join("")}</div>
        <div class="bets">${v.bets[c].map((k, p) => k ? `<i style="--s:${SEAT[p]}">${k}</i>` : "").join("")}</div></div>`).join("")}</div>
      ${my && v.roll ? `<div class="vroll">${v.roll.map(x => dieHTML(x, "", `data-v="${x}"`)).join("")}</div>` : my ? `<div class="acts"><button class="rl">굴리기</button></div>` : ""}
      <ol class="score">${v.money.map((m, p) => `<li style="--s:${SEAT[p]}" class="${p === v.cur ? "cur" : ""}"><b>${esc(n[p])}</b><span>${m}만, 남은 주사위 ${v.left[p]}</span></li>`).join("")}</ol>
      <ol class="log">${v.log.map(x => `<li>${x.k === "bet" ? `${nameB(n, x.s)} ${x.v}번 술집에 ${x.n}개` : `${x.round}판 정산: ${x.pay.map(([c, p, b]) => `${c + 1}번 ${esc(n[p])} ${b}만`).join(", ") || "아무도 못 받음"}`}</li>`).join("")}</ol>
    </div>`;
    el.querySelector(".rl")?.addEventListener("click", () => send({ t: "roll" }));
    el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => send({ t: "bet", v: +b.dataset.v }));
  }
};
