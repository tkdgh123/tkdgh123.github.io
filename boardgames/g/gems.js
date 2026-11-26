// 항구 상회 — 보석을 모아 가게 카드를 사고, 산 카드가 다음 값을 깎아 주는 게임 (2~4명)
// 차례마다 하나: 다른 색 보석 셋 / 같은 색 둘(그 색이 4개 이상 남았을 때) / 카드 맡기기(금화 하나) / 카드 사기.
// 15점에 닿으면 그 바퀴 끝까지 하고 점수가 높은 사람이 이긴다. 카드 목록은 이 게임용으로 새로 짰다.
import { esc, shuffle, seeded, SEAT } from "../lib.js";

export const GEM = [["진주", "#efece4", "#1d1d1d"], ["산호", "#d9472b", "#fff"], ["청옥", "#2f6fb0", "#fff"], ["비취", "#2e8b57", "#fff"], ["흑요석", "#2b2b2e", "#fff"], ["금화", "#e8b628", "#1d1d1d"]];
const GOLD = 5, WIN = 15;

// 카드 표: [다른 색에 매길 값들, 점수]
const T1 = [[[1, 1, 1, 1], 0], [[1, 1, 2, 1], 0], [[2, 2], 0], [[3], 0], [[1, 2, 2], 0], [[2, 1], 0], [[4], 1]];
const T2 = [[[2, 2, 3], 1], [[3, 3, 2], 1], [[4, 2, 1], 2], [[5], 2], [[5, 3], 2], [[6], 3]];
const T3 = [[[3, 3, 5, 3], 3], [[7], 4], [[6, 3, 3], 4], [[7, 3], 5]];
export const CARDS = (() => {
  const r = seeded(2611), out = [];
  [T1, T2, T3].forEach((T, t) => {
    for (let b = 0; b < 5; b++) T.forEach(([vals, p], j) => {
      const others = [1, 2, 3, 4].map(k => (b + k) % 5);
      const rot = Math.floor(r() * 4), cost = [0, 0, 0, 0, 0];
      vals.forEach((v, i) => cost[others[(i + rot + j) % 4]] += v);
      out.push({ id: out.length, t, b, p, cost });
    });
  });
  return out;
})();
const NOBLES = (() => {
  const out = [];
  for (let b = 0; b < 5; b++) { const n = [0, 0, 0, 0, 0]; n[b] = 4; n[(b + 2) % 5] = 4; out.push(n); }
  for (let b = 0; b < 5; b++) { const n = [0, 0, 0, 0, 0]; n[b] = 3; n[(b + 1) % 5] = 3; n[(b + 3) % 5] = 3; out.push(n); }
  return out.map((need, id) => ({ id, need, p: 3 }));
})();

const log = (s, x) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, 10); };
const bonus = pl => { const b = [0, 0, 0, 0, 0]; for (const c of pl.cards) b[c.b]++; return b; };
const pts = pl => pl.cards.reduce((a, c) => a + c.p, 0) + pl.nob.length * 3;
const ntok = pl => pl.tok.reduce((a, b) => a + b, 0);

// 이 카드를 사려면 낼 보석(금화 포함). 못 사면 null
export function payFor(pl, card) {
  const b = bonus(pl), pay = [0, 0, 0, 0, 0, 0];
  let gold = 0;
  for (let c = 0; c < 5; c++) {
    const need = Math.max(0, card.cost[c] - b[c]), use = Math.min(need, pl.tok[c]);
    pay[c] = use; gold += need - use;
  }
  if (gold > pl.tok[GOLD]) return null;
  pay[GOLD] = gold;
  return pay;
}
function findCard(s, pl, id) {
  for (let t = 0; t < 3; t++) { const i = s.board[t].findIndex(c => c && c.id === id); if (i >= 0) return { where: "board", t, i, card: s.board[t][i] }; }
  const i = pl.res.findIndex(c => c.id === id);
  return i >= 0 ? { where: "res", i, card: pl.res[i] } : null;
}
function refill(s, t, i) { s.board[t][i] = s.decks[t].pop() || null; }

function finishTurn(s) {
  const pl = s.pl[s.cur];
  if (ntok(pl) > 10) { s.phase = "disc"; return; }
  const b = bonus(pl), i = s.nobles.findIndex(n => n.need.every((v, c) => b[c] >= v));
  if (i >= 0) { const n = s.nobles.splice(i, 1)[0]; pl.nob.push(n); log(s, { k: "noble", s: s.cur }); }
  if (pts(pl) >= WIN && s.endAt == null) s.endAt = true;
  s.cur = (s.cur + 1) % s.n; s.phase = "act";
  if (s.endAt && s.cur === 0) s.phase = "end";
}

export default {
  id: "gems", name: "항구 상회", color: "#1f4e5f", min: 2, max: 4, time: "30분", solo: 3,
  sub: "보석을 모아 가게 카드를 사요. 산 카드가 다음 값을 깎아 주는 15점 경쟁",

  setup(n, rng) {
    const per = n === 2 ? 4 : n === 3 ? 5 : 7;
    const decks = [0, 1, 2].map(t => shuffle(CARDS.filter(c => c.t === t).map(c => ({ ...c, cost: [...c.cost] })), rng));
    const board = decks.map(d => [d.pop(), d.pop(), d.pop(), d.pop()]);
    return {
      n, bank: [per, per, per, per, per, 5], decks, board,
      nobles: shuffle(NOBLES.map(x => ({ ...x })), rng).slice(0, n + 1),
      pl: Array.from({ length: n }, () => ({ tok: [0, 0, 0, 0, 0, 0], cards: [], res: [], nob: [] })),
      cur: 0, phase: "act", endAt: null, log: []
    };
  },

  view(s, seat) {
    return {
      n: s.n, bank: s.bank, board: s.board, nobles: s.nobles, cur: s.cur, phase: s.phase, log: s.log, endAt: s.endAt,
      deckN: s.decks.map(d => d.length),
      pl: s.pl.map((p, i) => ({ tok: p.tok, cards: p.cards, nob: p.nob, pts: pts(p), bonus: bonus(p),
        res: p.res.map(c => i === seat || !c.hid ? c : { hid: true, t: c.t }) })),
      turn: this.turn(s)
    };
  },

  turn(s) { return s.phase === "end" ? [] : [s.cur]; },

  apply(s, seat, a) {
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    const pl = s.pl[seat];
    if (s.phase === "disc") {
      if (a.t !== "disc") throw new Error("보석이 10개를 넘었어요. 돌려줄 것을 골라요");
      const d = a.c;
      if (!Array.isArray(d) || d.length !== 6 || d.some((v, c) => !(v >= 0) || v > pl.tok[c])) throw new Error("돌려줄 보석이 이상해요");
      if (ntok(pl) - d.reduce((x, y) => x + y, 0) !== 10) throw new Error("딱 10개가 남게 돌려줘요");
      d.forEach((v, c) => { pl.tok[c] -= v; s.bank[c] += v; });
      return finishTurn(s);
    }
    if (s.phase !== "act") throw new Error("지금은 할 수 없어요");
    if (a.t === "take") {
      const c = [...new Set(a.c)];
      if (c.length !== a.c.length || c.length < 1 || c.length > 3 || c.some(x => !(x >= 0 && x < 5) || s.bank[x] < 1)) throw new Error("다른 색 보석을 셋까지 골라요");
      const avail = [0, 1, 2, 3, 4].filter(x => s.bank[x] > 0).length;
      if (c.length < Math.min(3, avail)) throw new Error("남은 색이 있으면 셋을 골라요");
      c.forEach(x => { s.bank[x]--; pl.tok[x]++; });
      log(s, { k: "take", s: seat, c });
      return finishTurn(s);
    }
    if (a.t === "take2") {
      if (!(a.c >= 0 && a.c < 5) || s.bank[a.c] < 4) throw new Error("같은 색 둘은 그 색이 4개 이상 남았을 때만 돼요");
      s.bank[a.c] -= 2; pl.tok[a.c] += 2;
      log(s, { k: "take", s: seat, c: [a.c, a.c] });
      return finishTurn(s);
    }
    if (a.t === "res") {
      if (pl.res.length >= 3) throw new Error("맡긴 카드는 셋까지예요");
      let card;
      if (a.deck != null) { card = s.decks[a.deck]?.pop(); if (!card) throw new Error("그 더미는 비었어요"); card.hid = true; }
      else { const f = findCard(s, pl, a.id); if (!f || f.where !== "board") throw new Error("그 카드는 맡길 수 없어요"); card = f.card; refill(s, f.t, f.i); }
      pl.res.push(card);
      const g = s.bank[GOLD] > 0; if (g) { s.bank[GOLD]--; pl.tok[GOLD]++; }
      log(s, { k: "res", s: seat, t: card.t, g });
      return finishTurn(s);
    }
    if (a.t === "buy") {
      const f = findCard(s, pl, a.id);
      if (!f) throw new Error("그 카드는 살 수 없어요");
      const pay = payFor(pl, f.card);
      if (!pay) throw new Error("보석이 모자라요");
      pay.forEach((v, c) => { pl.tok[c] -= v; s.bank[c] += v; });
      if (f.where === "board") refill(s, f.t, f.i); else pl.res.splice(f.i, 1);
      delete f.card.hid;
      pl.cards.push(f.card);
      log(s, { k: "buy", s: seat, card: f.card });
      return finishTurn(s);
    }
    if (a.t === "pass") { log(s, { k: "pass", s: seat }); return finishTurn(s); }
    throw new Error("모르는 행동이에요");
  },

  over(s) {
    if (s.phase !== "end") return null;
    const order = [...Array(s.n).keys()].sort((a, b) => pts(s.pl[b]) - pts(s.pl[a]) || s.pl[a].cards.length - s.pl[b].cards.length);
    return { text: "가장 큰 상회", rank: order.map((p, i) => [p, `${i + 1}등, ${pts(s.pl[p])}점`]) };
  },

  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 700 }, pl = s.pl[seat];
    if (s.phase === "disc") {
      const keep = pl.tok.slice(), give = [0, 0, 0, 0, 0, 0];
      let over = ntok(pl) - 10;
      while (over > 0) { let c = 0; for (let x = 1; x < 5; x++) if (keep[x] > keep[c]) c = x; if (keep[c] === 0) c = GOLD; keep[c]--; give[c]++; over--; }
      return { ...d, a: { t: "disc", c: give } };
    }
    const b = bonus(pl);
    const cards = [...s.board.flat().filter(Boolean), ...pl.res];
    // 1) 살 수 있으면 가치가 큰 것
    let best = null, bv = -1;
    for (const c of cards) {
      const pay = payFor(pl, c); if (!pay) continue;
      const nobleHelp = s.nobles.some(n => n.need[c.b] > b[c.b]) ? 1 : 0;
      const v = c.p * 4 + 2 + nobleHelp - pay[GOLD] * .5 - pay.reduce((x, y) => x + y, 0) * .15;
      if (v > bv) { bv = v; best = c; }
    }
    if (best) return { ...d, a: { t: "buy", id: best.id } };
    // 2) 목표 카드: 모자란 개수 대비 점수
    let tgt = null, tv = -1e9;
    for (const c of cards) {
      let miss = 0; for (let x = 0; x < 5; x++) miss += Math.max(0, c.cost[x] - b[x] - pl.tok[x]);
      miss = Math.max(0, miss - pl.tok[GOLD]);
      const v = (c.p * 3 + 1.5) / (miss + 1) + rng() * .3;
      if (v > tv) { tv = v; tgt = c; }
    }
    const need = [0, 1, 2, 3, 4].filter(x => tgt && tgt.cost[x] - b[x] - pl.tok[x] > 0 && s.bank[x] > 0);
    if (ntok(pl) >= 9 && pl.res.length < 3 && tgt && !pl.res.includes(tgt)) return { ...d, a: { t: "res", id: tgt.id } };
    const two = need.find(x => tgt.cost[x] - b[x] - pl.tok[x] >= 2 && s.bank[x] >= 4);
    if (two != null && need.length === 1) return { ...d, a: { t: "take2", c: two } };
    const avail = [0, 1, 2, 3, 4].filter(x => s.bank[x] > 0);
    if (avail.length) {
      const pickc = [...need];
      for (const x of shuffle(avail.slice(), rng)) if (pickc.length < Math.min(3, avail.length) && !pickc.includes(x)) pickc.push(x);
      return { ...d, a: { t: "take", c: pickc.slice(0, Math.min(3, avail.length)) } };
    }
    if (pl.res.length < 3 && tgt && !pl.res.includes(tgt)) return { ...d, a: { t: "res", id: tgt.id } };
    return { ...d, a: { t: "pass" } };
  },

  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// ───────── 화면 ─────────
const UI = { pick: [], card: null };
const GI = c => c === 5 ? "art/coin.webp" : `art/gem${c}.webp`;
const gem = (c, n, cls = "") => cls === "big" ? `<img class="gemimg" src="${GI(c)}" alt="${GEM[c][0]}">` : `<span class="gem ${cls}" style="--g:${GEM[c][1]};--gi:${GEM[c][2]}">${n ?? ""}</span>`;
const cardHTML = (c, mine) => !c ? `<div class="gc none"></div>` : c.hid && c.b === undefined ? `<div class="gc back t${c.t}"><b>${["I", "II", "III"][c.t]}</b></div>` :
  `<button class="gc t${c.t}${mine ? " can" : ""}" data-id="${c.id}" style="--g:${GEM[c.b][1]};--gi:${GEM[c.b][2]}">
    <span class="top"><b>${c.p || ""}</b>${gem(c.b, "", "big")}</span>
    <span class="cost">${c.cost.map((n, x) => n ? gem(x, n) : "").join("")}</span>
  </button>`;

function render(el, v, me, send, ui) {
  const n = ui.names, mine = v.cur === me && v.phase !== "end", P = me >= 0 ? v.pl[me] : null;
  if (!mine) { UI.pick = []; UI.card = null; }
  const can = c => P && c && !c.hid && affordable(P, c);
  let say = v.phase === "end" ? "판이 끝났어요" : !mine ? `${esc(n[v.cur])} 차례예요` : v.phase === "disc" ? "보석이 10개를 넘었어요. 돌려줄 보석을 눌러요" : "보석을 가져오거나 카드를 사거나 맡겨요";
  if (v.endAt && v.phase !== "end") say += " (15점이 나와서 이번 바퀴가 마지막)";
  const pk = UI.pick, take2 = pk.length === 2 && pk[0] === pk[1];
  el.innerHTML = `<div class="gems">
    <p class="say">${say}</p>
    <div class="nobles">${v.nobles.map(nb => `<div class="nob"><b>3</b>${nb.need.map((x, c) => x ? gem(c, x, "sq") : "").join("")}</div>`).join("")}<small>선장(조건을 채우면 찾아와 3점)</small></div>
    <div class="board">${[2, 1, 0].map(t => `<div class="row"><div class="gc back t${t}" data-deck="${t}"><b>${["I", "II", "III"][t]}</b><small>${v.deckN[t]}</small></div>${v.board[t].map(c => cardHTML(c, can(c))).join("")}</div>`).join("")}</div>
    <div class="bank">${v.bank.map((x, c) => `<button class="gemb" data-c="${c}" ${c === 5 || !mine || v.phase !== "act" ? "disabled" : ""} style="--g:${GEM[c][1]};--gi:${GEM[c][2]}"><img src="${GI(c)}" alt=""><b>${x}</b><small>${GEM[c][0]}</small>${pk.filter(y => y === c).length ? `<i>+${pk.filter(y => y === c).length}</i>` : ""}</button>`).join("")}</div>
    ${mine && v.phase === "act" && pk.length ? `<div class="acts"><button class="takeb">가져오기</button><button class="ghost clr">다시 고르기</button></div>` : ""}
    ${mine && v.phase === "disc" ? `<div class="acts disc">${P.tok.map((x, c) => x ? `<button class="gemb" data-dc="${c}" style="--g:${GEM[c][1]};--gi:${GEM[c][2]}"><b>${x - (UI.disc?.[c] || 0)}</b><small>${GEM[c][0]}</small></button>` : "").join("")}<button class="discb">돌려주기</button></div>` : ""}
    ${P ? `<div class="me">
      <div class="hd"><b>내 상회</b><span>${P.pts}점</span></div>
      <div class="line"><small>가진 보석 ${P.tok.reduce((a, b) => a + b, 0)}/10</small>${P.tok.map((x, c) => x ? gem(c, x) : "").join("")}</div>
      <div class="line"><small>카드 할인</small>${P.bonus.map((x, c) => x ? gem(c, x, "sq") : "").join("") || "<span class='dim'>아직 없음</span>"}</div>
      ${P.res.length ? `<div class="line res"><small>맡긴 카드</small>${P.res.map(c => cardHTML(c, can(c))).join("")}</div>` : ""}
    </div>` : ""}
    <ol class="others">${v.pl.map((p, i) => i === me ? "" : `<li style="--s:${SEAT[i]}" class="${i === v.cur ? "cur" : ""}"><b>${esc(n[i])}</b><span>${p.pts}점</span>
      <span class="mini">${p.bonus.map((x, c) => x ? gem(c, x, "sq") : "").join("")}</span><span class="mini">${p.tok.map((x, c) => x ? gem(c, x) : "").join("")}</span>${p.res.length ? `<small>맡긴 ${p.res.length}</small>` : ""}</li>`).join("")}</ol>
    ${mine && v.phase === "act" ? `<button class="ghost small passb">할 게 없으면 넘기기</button>` : ""}
    <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    ${UI.card ? sheet(UI.card, P, mine, v) : ""}
  </div>`;
  const re = () => render(el, v, me, send, ui);
  el.querySelectorAll(".bank .gemb:not([disabled])").forEach(b => b.onclick = () => {
    const c = +b.dataset.c;
    if (pk.includes(c)) { if (pk.length === 1 && v.bank[c] >= 4) pk.push(c); else UI.pick = pk.filter(x => x !== c); }
    else if (!take2 && pk.length < 3) pk.push(c);
    re();
  });
  el.querySelector(".takeb")?.addEventListener("click", () => { const p = UI.pick; UI.pick = []; send(take2 ? { t: "take2", c: p[0] } : { t: "take", c: p }); });
  el.querySelector(".clr")?.addEventListener("click", () => { UI.pick = []; re(); });
  el.querySelector(".passb")?.addEventListener("click", () => send({ t: "pass" }));
  el.querySelectorAll("button.gc").forEach(b => b.onclick = () => { UI.card = +b.dataset.id; re(); });
  if (mine && v.phase === "act") el.querySelectorAll(".board .back[data-deck]").forEach(b => b.onclick = () => { if (v.deckN[+b.dataset.deck] && P.res.length < 3) send({ t: "res", deck: +b.dataset.deck }); else ui.toast("맡길 수 없어요"); });
  el.querySelectorAll("[data-dc]").forEach(b => b.onclick = () => { UI.disc = UI.disc || [0, 0, 0, 0, 0, 0]; const c = +b.dataset.dc; if (UI.disc[c] < P.tok[c]) UI.disc[c]++; re(); });
  el.querySelector(".discb")?.addEventListener("click", () => { const d = UI.disc || [0, 0, 0, 0, 0, 0]; UI.disc = null; send({ t: "disc", c: d }); });
  el.querySelector(".sheet .buy")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "buy", id }); });
  el.querySelector(".sheet .res")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "res", id }); });
  el.querySelector(".sheet .x")?.addEventListener("click", () => { UI.card = null; re(); });
}
function affordable(P, c) {
  let gold = 0;
  for (let x = 0; x < 5; x++) gold += Math.max(0, c.cost[x] - P.bonus[x] - P.tok[x]);
  return gold <= P.tok[GOLD];
}
function sheet(id, P, mine, v) {
  const c = [...v.board.flat(), ...(P?.res || [])].find(x => x && x.id === id);
  if (!c) return "";
  const inRes = P?.res.some(x => x.id === id), ok = P && affordable(P, c);
  return `<div class="sheet"><div class="in">${cardHTML(c, ok)}
    <p>${GEM[c.b][0]} 할인 카드, ${c.p}점</p>
    ${mine && v.phase === "act" ? `<button class="buy" ${ok ? "" : "disabled"}>${ok ? "사기" : "보석이 모자라요"}</button>${!inRes ? `<button class="ghost res" ${P.res.length >= 3 ? "disabled" : ""}>맡기기 (금화 받음)</button>` : ""}` : ""}
    <button class="ghost x">닫기</button></div></div>`;
}
function line(x, n) {
  const b = i => `<b style="color:${SEAT[i]}">${esc(n[i])}</b>`;
  switch (x.k) {
    case "take": return `${b(x.s)} 보석 ${x.c.map(c => GEM[c][0]).join(", ")}`;
    case "buy": return `${b(x.s)} ${GEM[x.card.b][0]} 카드 구입${x.card.p ? ` (${x.card.p}점)` : ""}`;
    case "res": return `${b(x.s)} ${["I", "II", "III"][x.t]}단 카드 맡김${x.g ? ", 금화 하나" : ""}`;
    case "noble": return `${b(x.s)}에게 선장이 찾아옴 (3점)`;
    case "pass": return `${b(x.s)} 넘김`;
  }
  return "";
}
