// 불꽃 축제 — 내 카드는 나만 못 본다. 서로 힌트를 주며 색마다 1부터 5까지 순서대로 쏘아 올리는 협력 게임 (2~5명)
// 힌트 8개, 실수 3번이면 끝. 더미가 떨어지면 한 바퀴만 더. 쏘아 올린 숫자 합이 모두의 점수(최대 25).
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const FC = [["빨강", "#d9472b"], ["노랑", "#e0a526"], ["초록", "#3c8d5a"], ["파랑", "#2f6fb0"], ["보라", "#8a4fb0"]];
const COUNT = [3, 2, 2, 2, 1];

const score = s => s.stacks.reduce((a, b) => a + b, 0);
function refill(s, p) { if (s.deck.length) { const c = s.deck.pop(); s.hands[p].push({ ...c, hc: null, hn: null }); if (!s.deck.length) s.last = s.n + 1; } }
function endTurn(s) {
  if (s.fuse <= 0 || score(s) === 25) { s.done = true; return; }
  if (s.last != null) { if (s.last <= 0) { s.done = true; return; } s.last--; if (s.last === 0) { s.done = true; return; } }
  s.cur = (s.cur + 1) % s.n;
}

export default {
  id: "fire", name: "불꽃 축제", color: "#c9873a", min: 2, max: 5, time: "25분", solo: 3,
  sub: "내 카드만 나는 못 봐요. 힌트를 주고받으며 다섯 색 불꽃을 1부터 5까지 같이 쏘아 올려요",
  setup(n, rng) {
    const deck = [];
    FC.forEach((_, c) => COUNT.forEach((k, i) => { for (let j = 0; j < k; j++) deck.push({ id: deck.length, c, v: i + 1 }); }));
    shuffle(deck, rng);
    const hs = n <= 3 ? 5 : 4;
    const hands = Array.from({ length: n }, () => deck.splice(0, hs).map(c => ({ ...c, hc: null, hn: null })));
    return { n, deck, hands, stacks: [0, 0, 0, 0, 0], disc: [], hint: 8, fuse: 3, cur: 0, last: null, done: false, log: [] };
  },
  view(s, seat) {
    return { n: s.n, stacks: s.stacks, disc: s.disc, hint: s.hint, fuse: s.fuse, cur: s.cur, done: s.done, log: s.log, deckN: s.deck.length, last: s.last, score: score(s),
      hands: s.hands.map((h, p) => h.map(c => p === seat ? { id: c.id, hc: c.hc, hn: c.hn } : c)), turn: this.turn(s) };
  },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a) {
    if (s.done || seat !== s.cur) throw new Error("내 차례가 아니에요");
    const H = s.hands[seat];
    if (a.t === "hint") {
      if (s.hint <= 0) throw new Error("힌트가 없어요. 카드를 버리면 하나 돌아와요");
      const T = s.hands[a.to];
      if (!T || a.to === seat) throw new Error("다른 사람을 골라요");
      const hits = T.filter(c => a.c != null ? c.c === a.c : c.v === a.v);
      if (!hits.length) throw new Error("그런 카드가 없는 힌트는 못 줘요");
      hits.forEach(c => a.c != null ? c.hc = a.c : c.hn = a.v);
      s.hint--; logPush(s, { k: "hint", s: seat, to: a.to, c: a.c ?? null, v: a.v ?? null, n: hits.length });
      return endTurn(s);
    }
    const i = H.findIndex(c => c.id === a.id);
    if (i < 0) throw new Error("내 카드를 골라요");
    const c = H.splice(i, 1)[0];
    if (a.t === "play") {
      if (s.stacks[c.c] === c.v - 1) { s.stacks[c.c] = c.v; if (c.v === 5 && s.hint < 8) s.hint++; logPush(s, { k: "play", s: seat, c: c.c, v: c.v, ok: true }); }
      else { s.fuse--; s.disc.push(c); logPush(s, { k: "play", s: seat, c: c.c, v: c.v, ok: false }); }
    } else if (a.t === "disc") {
      if (s.hint >= 8) { H.splice(i, 0, c); throw new Error("힌트가 꽉 차서 버릴 수 없어요"); }
      s.disc.push(c); s.hint++; logPush(s, { k: "disc", s: seat, c: c.c, v: c.v });
    } else { H.splice(i, 0, c); throw new Error("모르는 행동이에요"); }
    refill(s, seat);
    endTurn(s);
  },
  over(s) {
    if (!s.done) return null;
    const sc = score(s), word = sc >= 25 ? "완벽한 축제" : sc >= 20 ? "멋진 축제" : sc >= 15 ? "괜찮은 축제" : sc >= 10 ? "아쉬운 축제" : "다음엔 더 잘해요";
    return { text: `${sc}점, ${word}`, rank: [...Array(s.n).keys()].map(p => [p, `같이 ${sc}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 1100 + rng() * 700 }, H = s.hands[seat];
    const playable = c => s.stacks[c.c] === c.v - 1;
    // 1) 확실히 낼 수 있는 카드
    const sure = H.find(c => c.hc != null && c.hn != null && s.stacks[c.hc] === c.hn - 1);
    if (sure) return { ...d, a: { t: "play", id: sure.id } };
    const num = H.find(c => c.hn != null && c.hc == null && s.stacks.every(x => x === c.hn - 1) );
    if (num) return { ...d, a: { t: "play", id: num.id } };
    // 2) 다른 사람의 낼 수 있는 카드에 힌트
    if (s.hint > 0) {
      for (let k = 1; k < s.n; k++) {
        const p = (seat + k) % s.n;
        const c = s.hands[p].find(x => playable(x) && (x.hc == null || x.hn == null));
        if (c) return { ...d, a: c.hn == null ? { t: "hint", to: p, v: c.v } : { t: "hint", to: p, c: c.c } };
      }
      for (let k = 1; k < s.n && s.hint > 3; k++) { // 5는 지켜 달라고
        const p = (seat + k) % s.n, c = s.hands[p].find(x => x.v === 5 && x.hn == null);
        if (c) return { ...d, a: { t: "hint", to: p, v: 5 } };
      }
    }
    // 3) 힌트 없는 오래된 카드 버리기
    if (s.hint < 8) { const c = H.find(x => x.hc == null && x.hn == null) || H.find(x => x.hn !== 5) || H[0]; return { ...d, a: { t: "disc", id: c.id } }; }
    for (let k = 1; k < s.n; k++) { const p = (seat + k) % s.n; return { ...d, a: { t: "hint", to: p, v: s.hands[p][0].v } }; }
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && !v.done;
    if (!my) { UI.card = null; UI.to = null; }
    const card = (c, mine, attrs = "") => mine
      ? `<button data-k="f${c.id}" class="fcd hid${UI.card === c.id ? " on" : ""}" ${attrs} style="--c:${c.hc != null ? FC[c.hc][1] : "#c8cdd2"}"><b>${c.hn ?? "?"}</b><small>${c.hc != null ? FC[c.hc][0] : "색 ?"}</small></button>`
      : `<span data-k="f${c.id}" class="fcd" style="--c:${FC[c.c][1]}" ${attrs}><b>${c.v}</b>${c.hc != null || c.hn != null ? `<i>${[c.hc != null ? "색" : "", c.hn != null ? "수" : ""].filter(Boolean).join("+")} 앎</i>` : ""}</span>`;
    el.innerHTML = `<div class="fire">
      <p class="say">${v.done ? "판이 끝났어요" : my ? "내 카드를 골라 내거나 버리고, 아니면 다른 사람에게 힌트를 줘요" : `${esc(n[v.cur])} 차례예요`}${v.last != null && !v.done ? `<small>더미가 떨어져 ${v.last}번 남음</small>` : ""}</p>
      <div class="stk">${v.stacks.map((x, c) => `<div class="st" data-k="s${c}-${x}" style="--c:${FC[c][1]}"><b>${x || ""}</b><small>${FC[c][0]}</small></div>`).join("")}</div>
      <div class="tok"><span>힌트 <b>${v.hint}</b>/8</span><span>실수 <b>${3 - v.fuse}</b>/3</span><span>더미 <b>${v.deckN}</b></span><span>점수 <b>${v.score}</b></span></div>
      ${[...Array(v.n).keys()].filter(p => p !== me).map(p => `<div class="fh${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]}"><span class="who">${esc(n[p])}</span><div>${v.hands[p].map(c => card(c, false)).join("")}</div>
        ${my && v.hint > 0 ? `<div class="hints"><small>힌트</small>${[0, 1, 2, 3, 4].filter(c => v.hands[p].some(x => x.c === c)).map(c => `<button class="hb" data-to="${p}" data-c="${c}" style="background:${FC[c][1]}">${FC[c][0]}</button>`).join("")}${[1, 2, 3, 4, 5].filter(x => v.hands[p].some(c => c.v === x)).map(x => `<button class="hb ghost" data-to="${p}" data-v="${x}">${x}</button>`).join("")}</div>` : ""}</div>`).join("")}
      ${me >= 0 ? `<div class="fh mine"><span class="who">내 카드 (안 보임)</span><div>${v.hands[me].map(c => card(c, true, `data-id="${c.id}" ${my ? "" : "disabled"}`)).join("")}</div>
        ${my && UI.card != null ? `<div class="acts"><button class="pl">이 카드 쏘기</button><button class="ghost ds" ${v.hint >= 8 ? "disabled" : ""}>버리고 힌트 하나 받기</button></div>` : ""}</div>` : ""}
      <div class="disc"><small>버린 카드</small>${v.disc.map(c => `<span class="mini" style="--c:${FC[c.c][1]}">${c.v}</span>`).join("") || "<span class='dim'>없음</span>"}</div>
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll(".fcd.hid:not([disabled])").forEach(b => b.onclick = () => { UI.card = UI.card === +b.dataset.id ? null : +b.dataset.id; re(); });
    el.querySelector(".pl")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "play", id }); });
    el.querySelector(".ds")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "disc", id }); });
    el.querySelectorAll(".hb").forEach(b => b.onclick = () => send({ t: "hint", to: +b.dataset.to, ...(b.dataset.c != null ? { c: +b.dataset.c } : { v: +b.dataset.v }) }));
  }
};
const UI = { card: null, to: null };
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "hint": return `${b(x.s)}이(가) ${b(x.to)}에게: ${x.c != null ? FC[x.c][0] : x.v} 카드가 ${x.n}장`;
    case "play": return `${b(x.s)} ${FC[x.c][0]} ${x.v} ${x.ok ? "쏘아 올림" : "실수!"}`;
    case "disc": return `${b(x.s)} ${FC[x.c][0]} ${x.v} 버림`;
  }
  return "";
}
