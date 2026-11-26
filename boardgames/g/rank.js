// 궁궐 신분전 — 같은 숫자 묶음을 더 작은 숫자로 덮으며 손패를 먼저 털면 다음 판 왕이 되는 게임 (4~8명)
// 카드: 숫자 k가 k장(1~10, 55장) + 광대 2장(아무 숫자로 같이 냄). 작은 숫자가 셈.
// 판이 끝나면 꼴찌가 제일 좋은 카드 둘을 왕에게, 왕은 아무 카드 둘을 꼴찌에게. 세 판 점수로 순위.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

const J = 13, ROUNDS = 3, TITLE = ["왕", "대신", "선비", "장인", "상인", "농부", "머슴", "노비"];
const titleOf = (place, n) => place === 0 ? "왕" : place === n - 1 ? "노비" : TITLE[Math.min(place, 6)];

function deal(s, rng) {
  const d = [];
  for (let k = 1; k <= 10; k++) for (let i = 0; i < k; i++) d.push(k);
  d.push(J, J);
  shuffle(d, rng);
  const order = s.order; // 자리 순서 = 지난 판 등수 (첫 판은 자리 번호)
  s.hands = Array.from({ length: s.n }, () => []);
  d.forEach((c, i) => s.hands[order[i % s.n]].push(c));
  s.hands.forEach(h => h.sort((a, b) => a - b));
  if (s.round > 1) { // 세금: 꼴찌 → 왕 좋은 카드 둘, 왕 → 꼴찌 나쁜 카드 둘 (자동)
    const king = order[0], low = order[s.n - 1];
    const good = s.hands[low].splice(0, 2), bad = s.hands[king].splice(-2, 2);
    s.hands[king].push(...good); s.hands[low].push(...bad);
    s.hands.forEach(h => h.sort((a, b) => a - b));
    logPush(s, { k: "tax", king, low, good });
  }
  s.cur = order[0]; s.lead = order[0]; s.top = null; s.passed = []; s.out = [];
}
const value = (cards) => { const nj = cards.filter(c => c !== J); return nj.length ? nj[0] : J; };

export default {
  id: "rank", name: "대부호", color: "#6b3f78", min: 4, max: 8, time: "25분", solo: 5,
  sub: "같은 숫자 묶음을 더 작은 숫자로 덮어요. 먼저 턴 사람이 다음 판 왕, 늦은 사람은 노비",
  setup(n, rng) { const s = { n, round: 1, order: [...Array(n).keys()], score: Array(n).fill(0), log: [], phase: "play" }; deal(s, rng); return s; },
  view(s, seat) {
    return { n: s.n, round: s.round, order: s.order, score: s.score, log: s.log, phase: s.phase, cur: s.cur, top: s.top, passed: s.passed, out: s.out,
      counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, turn: this.turn(s) };
  },
  turn(s) { return s.phase === "play" ? [s.cur] : []; },
  apply(s, seat, a, ctx) {
    if (s.phase !== "play" || seat !== s.cur) throw new Error("내 차례가 아니에요");
    const H = s.hands[seat];
    if (a.t === "pass") {
      if (!s.top) throw new Error("처음 내는 사람은 넘길 수 없어요");
      s.passed.push(seat); logPush(s, { k: "pass", s: seat });
    } else if (a.t === "play") {
      const cards = a.cards;
      if (!Array.isArray(cards) || !cards.length) throw new Error("낼 카드를 골라요");
      const v = value(cards);
      if (cards.some(c => c !== J && c !== v)) throw new Error("같은 숫자끼리만 (광대는 아무 숫자)");
      const left = [...H];
      for (const c of cards) { const i = left.indexOf(c); if (i < 0) throw new Error("그 카드가 없어요"); left.splice(i, 1); }
      if (s.top && (cards.length !== s.top.cards.length || v >= s.top.v)) throw new Error(`${s.top.cards.length}장을 ${s.top.v === J ? "" : s.top.v + "보다 "}작은 숫자로 내야 해요`);
      s.hands[seat] = left; s.top = { cards, v, by: seat }; s.passed = [];
      logPush(s, { k: "play", s: seat, v, c: cards.length });
      if (!left.length) {
        s.out.push(seat); logPush(s, { k: "out", s: seat, place: s.out.length });
        if (s.out.length === s.n - 1) {
          const last = [...Array(s.n).keys()].find(p => !s.out.includes(p)); s.out.push(last);
          s.out.forEach((p, i) => s.score[p] += s.n - i);
          s.order = [...s.out];
          if (s.round >= ROUNDS) { s.phase = "end"; return; }
          s.round++; deal(s, ctx.rng); return;
        }
      }
    } else throw new Error("모르는 행동이에요");
    // 다음 사람: 넘긴 사람은 이번 묶음에서 빠짐. 남은 사람이 없으면 마지막에 낸 사람(나갔으면 그다음)이 새로 시작
    const act = [...Array(s.n).keys()].filter(p => !s.out.includes(p));
    const after = (x, set) => { for (let k = 1; k <= s.n; k++) { const p = (x + k) % s.n; if (set.includes(p)) return p; } return null; };
    const others = act.filter(p => p !== s.top.by && !s.passed.includes(p));
    if (!others.length) { s.cur = act.includes(s.top.by) ? s.top.by : after(s.top.by, act); s.top = null; s.passed = []; return; }
    s.cur = after(seat, others);
  },
  over(s) {
    if (s.phase !== "end") return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.score[b] - s.score[a]);
    return { text: "세 판 동안 가장 높은 신분", rank: o.map((p, i) => [p, `${i + 1}등, ${s.score[p]}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 700 }, H = s.hands[seat];
    const groups = {}; H.forEach(c => groups[c] = (groups[c] || 0) + 1);
    const jokers = groups[J] || 0;
    if (!s.top) { // 가장 나쁜(큰) 숫자를 많이
      const ks = Object.keys(groups).map(Number).filter(k => k !== J).sort((a, b) => b - a);
      const k = ks[0] ?? J;
      return { ...d, a: { t: "play", cards: Array(groups[k] || jokers).fill(k) } };
    }
    const need = s.top.cards.length;
    const ks = Object.keys(groups).map(Number).filter(k => k !== J && k < s.top.v).sort((a, b) => b - a);
    for (const k of ks) {
      if (groups[k] >= need) return { ...d, a: { t: "play", cards: Array(need).fill(k) } };
      if (groups[k] + jokers >= need && (H.length <= need + 2 || rng() < .3)) return { ...d, a: { t: "play", cards: [...Array(groups[k]).fill(k), ...Array(need - groups[k]).fill(J)] } };
    }
    return { ...d, a: { t: "pass" } };
  },
  badge(v, i) { return v.out.includes(i) ? `${v.out.indexOf(i) + 1}등` : `${v.counts[i]}장, ${v.score[i]}점`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.phase === "play";
    if (!my) UI.sel = [];
    const sel = UI.sel;
    el.innerHTML = `<div class="rank">
      <p class="say">${v.phase === "end" ? "판이 끝났어요" : my ? (v.top ? `${v.top.cards.length}장, ${v.top.v === J ? "광대" : v.top.v}보다 작은 숫자로 덮거나 넘겨요` : "새로 시작해요. 같은 숫자 묶음을 내요") : `${esc(n[v.cur])} 차례예요`}<small>${v.round}/${ROUNDS}판</small></p>
      <ol class="court">${v.order.map((p, i) => `<li class="${p === v.cur ? "cur" : ""}${v.out.includes(p) ? " gone" : ""}${v.passed.includes(p) ? " pass" : ""}" style="--s:${SEAT[p]}"><i>${titleOf(i, v.n)}</i><b>${esc(n[p])}</b><span>${v.out.includes(p) ? `${v.out.indexOf(p) + 1}등으로 나감` : `${v.counts[p]}장`}${v.passed.includes(p) ? ", 넘김" : ""}</span><small>${v.score[p]}점</small></li>`).join("")}</ol>
      <div class="pit">${v.top ? v.top.cards.map((c, i) => `<span data-k="p${v.log.length}-${i}" data-anim="drop" class="rk${c === J ? " j" : ""}">${c === J ? "광대" : c}</span>`).join("") + `<small>${esc(n[v.top.by])}</small>` : `<span class="dim">비어 있음</span>`}</div>
      ${v.hand ? `<div class="rhand">${v.hand.map((c, i) => `<button class="rk${c === J ? " j" : ""}${sel.includes(i) ? " on" : ""}" data-i="${i}" ${my ? "" : "disabled"}>${c === J ? "광대" : c}</button>`).join("")}</div>` : ""}
      ${my ? `<div class="acts"><button class="playb" ${sel.length ? "" : "disabled"}>${sel.length}장 내기</button>${v.top ? `<button class="ghost passb">넘기기</button>` : ""}</div>` : ""}
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll(".rhand .rk:not([disabled])").forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (sel.includes(i)) UI.sel = sel.filter(x => x !== i); else sel.push(i);
      re();
    });
    el.querySelector(".playb")?.addEventListener("click", () => { const cards = UI.sel.map(i => v.hand[i]); UI.sel = []; send({ t: "play", cards }); });
    el.querySelector(".passb")?.addEventListener("click", () => { UI.sel = []; send({ t: "pass" }); });
  }
};
const UI = { sel: [] };
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "play": return `${b(x.s)} ${x.v === J ? "광대" : x.v} ${x.c}장`;
    case "pass": return `${b(x.s)} 넘김`;
    case "out": return `${b(x.s)} ${x.place}등으로 다 냄`;
    case "tax": return `세금: ${b(x.low)}이(가) ${b(x.king)}에게 ${x.good.map(c => c === J ? "광대" : c).join(", ")}을(를) 바침`;
  }
  return "";
}
