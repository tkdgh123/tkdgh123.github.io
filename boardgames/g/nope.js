// 어시장 떠넘기기 — 벌점 생선 카드를 받거나, 조개 하나를 얹고 다음 사람에게 넘기는 눈치 게임 (3~7명)
// 카드 3~35 중 9장은 빼고 시작. 이어진 숫자는 가장 작은 것만 벌점. 남은 조개는 1개당 -1점. 점수가 가장 낮은 사람이 이김.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export function points(cards, chips) {
  const c = [...cards].sort((a, b) => a - b);
  let sum = 0;
  c.forEach((x, i) => { if (i === 0 || c[i - 1] !== x - 1) sum += x; });
  return sum - chips;
}
const runs = cards => { const c = [...cards].sort((a, b) => a - b), out = []; c.forEach((x, i) => { if (i && c[i - 1] === x - 1) out[out.length - 1].push(x); else out.push([x]); }); return out; };

export default {
  id: "nope", name: "어시장 떠넘기기", color: "#8a3b2b", min: 3, max: 7, time: "15분", solo: 4,
  sub: "벌점 생선을 받을까, 조개 하나를 얹고 넘길까. 이어진 숫자는 가장 작은 것만 벌점",
  setup(n, rng) {
    const deck = shuffle([...Array(33).keys()].map(i => i + 3), rng).slice(9);
    const chips = n <= 5 ? 11 : n === 6 ? 9 : 7;
    return { n, deck, top: deck.pop(), pot: 0, cards: Array.from({ length: n }, () => []), chips: Array(n).fill(chips), cur: 0, log: [], done: false };
  },
  view(s, seat) {
    return { n: s.n, top: s.top, pot: s.pot, left: s.deck.length, cards: s.cards, cur: s.cur, log: s.log, done: s.done,
      chips: s.chips.map((c, p) => p === seat || s.done ? c : null), score: s.done ? s.cards.map((c, p) => points(c, s.chips[p])) : null, turn: this.turn(s) };
  },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a) {
    if (s.done || seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (a.t === "pass") {
      if (!s.chips[seat]) throw new Error("조개가 없어서 받아야 해요");
      s.chips[seat]--; s.pot++; logPush(s, { k: "pass", s: seat, c: s.top });
      s.cur = (s.cur + 1) % s.n; return;
    }
    if (a.t === "take") {
      s.cards[seat].push(s.top); s.chips[seat] += s.pot; logPush(s, { k: "take", s: seat, c: s.top, pot: s.pot });
      s.pot = 0;
      if (!s.deck.length) { s.done = true; s.top = null; return; }
      s.top = s.deck.pop(); return; // 받은 사람이 이어서 차례
    }
    throw new Error("모르는 행동이에요");
  },
  over(s) {
    if (!s.done) return null;
    const sc = p => points(s.cards[p], s.chips[p]);
    const o = [...Array(s.n).keys()].sort((a, b) => sc(a) - sc(b));
    return { text: "벌점이 가장 적은 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${sc(p)}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 800 + rng() * 700 }, mine = s.cards[seat];
    if (!s.chips[seat]) return { ...d, a: { t: "take" } };
    const fits = mine.includes(s.top - 1) || mine.includes(s.top + 1);
    const cost = (fits ? Math.min(...[s.top - 1, s.top + 1].filter(x => mine.includes(x)).map(() => 0), 0) : s.top) - s.pot;
    const want = fits ? s.pot >= 1 || rng() < .5 : cost <= 8 + (s.chips[seat] < 3 ? 6 : 0) + rng() * 4;
    return { ...d, a: { t: want ? "take" : "pass" } };
  },
  badge(v, i) { return `${v.cards[i].length}장`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && !v.done;
    el.innerHTML = `<div class="nope">
      <p class="say">${v.done ? "판이 끝났어요" : my ? "받을까요, 조개 하나 얹고 넘길까요?" : `${esc(n[v.cur])}이(가) 고민 중`}<small>더미 ${v.left}장</small></p>
      <div class="ntop">${v.top != null ? `<div class="fish"><b>${v.top}</b><small>벌점</small></div><div class="pot"><b>${v.pot}</b><small>얹힌 조개</small></div>` : ""}</div>
      ${my ? `<div class="acts"><button class="tk">받기 (${v.top}점, 조개 ${v.pot}개)</button><button class="ghost ps" ${v.chips[me] ? "" : "disabled"}>조개 얹고 넘기기</button></div>` : ""}
      ${me >= 0 ? `<p class="mine">내 조개 <b>${v.chips[me]}</b>개</p>` : ""}
      <div class="nrows">${[...Array(v.n).keys()].map(p => `<div class="nr${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]}"><b>${esc(n[p])}</b>${runs(v.cards[p]).map(r => `<span class="run">${r.map((x, i) => `<i class="${i ? "free" : ""}">${x}</i>`).join("")}</span>`).join("")}${v.score ? `<small>${v.score[p]}점</small>` : ""}</div>`).join("")}</div>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.k === "take" ? `${x.c} 받음${x.pot ? `, 조개 ${x.pot}개` : ""}` : `${x.c} 넘김`}</li>`).join("")}</ol>
    </div>`;
    el.querySelector(".tk")?.addEventListener("click", () => send({ t: "take" }));
    el.querySelector(".ps")?.addEventListener("click", () => send({ t: "pass" }));
  }
};
