// 갯벌 거짓말 — 카드를 엎어 건네며 "이건 해파리야"라고 말한다. 참인지 거짓인지 맞히거나, 몰래 보고 다른 사람에게 넘긴다 (2~6명)
// 틀린 쪽이 그 카드를 앞에 펼쳐 둔다. 같은 생물 넷을 펼치면 진다.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const KIND = ["갯강구", "해파리", "따개비", "불가사리", "갈매기", "쥐", "모기", "게"];
const KC = ["#7a5a3a", "#8a4fb0", "#9aa3ae", "#e07a3a", "#5b8bb8", "#6b6b6b", "#3a3a3a", "#d9472b"];
const LOSE = 4;

export default {
  id: "bug", name: "갯벌 거짓말", color: "#7a5a3a", min: 2, max: 6, time: "15분", solo: 4,
  sub: "엎은 카드를 건네며 \"이건 해파리야\". 참인지 거짓인지 맞히거나 몰래 보고 떠넘겨요",
  setup(n, rng) {
    const deck = shuffle(KIND.flatMap((_, k) => Array.from({ length: 8 }, (_, j) => ({ id: k * 8 + j, k }))), rng);
    const hands = Array.from({ length: n }, () => []);
    deck.forEach((c, i) => hands[i % n].push(c));
    return { n, hands, up: Array.from({ length: n }, () => Array(8).fill(0)), cur: 0, phase: "give", chain: null, log: [], loser: null };
  },
  view(s, seat) {
    const ch = s.chain && { from: s.chain.from, to: s.chain.to, claim: s.chain.claim, seen: s.chain.seen, k: s.chain.seen.includes(seat) ? s.chain.card.k : null };
    return { n: s.n, up: s.up, cur: s.cur, phase: s.phase, chain: ch, log: s.log, loser: s.loser, counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, turn: this.turn(s) };
  },
  turn(s) { return s.loser != null ? [] : s.phase === "give" ? [s.cur] : [s.chain.to]; },
  apply(s, seat, a) {
    if (s.loser != null) throw new Error("판이 끝났어요");
    const okClaim = k => Number.isInteger(k) && k >= 0 && k < 8;
    if (s.phase === "give") {
      if (seat !== s.cur || a.t !== "give") throw new Error("내 차례가 아니에요");
      const i = s.hands[seat].findIndex(c => c.id === a.id);
      if (i < 0 || a.to === seat || !(a.to >= 0 && a.to < s.n) || !okClaim(a.claim)) throw new Error("카드, 받을 사람, 말할 생물을 골라요");
      s.chain = { card: s.hands[seat].splice(i, 1)[0], from: seat, to: a.to, claim: a.claim, seen: [seat] };
      s.phase = "answer"; logPush(s, { k: "give", s: seat, to: a.to, claim: a.claim });
      return;
    }
    const ch = s.chain;
    if (seat !== ch.to) throw new Error("받은 사람이 정하는 중이에요");
    if (s.phase === "answer" && a.t === "peek") {
      if (ch.seen.length + 1 >= s.n) throw new Error("모두 이 카드를 봤어요. 맞혀야 해요");
      ch.seen.push(seat); s.phase = "pass"; return;
    }
    if (s.phase === "pass" && a.t === "pass") {
      if (ch.seen.includes(a.to) || !(a.to >= 0 && a.to < s.n) || !okClaim(a.claim)) throw new Error("아직 이 카드를 안 본 사람에게 넘겨요");
      logPush(s, { k: "pass", s: seat, to: a.to, claim: a.claim });
      ch.from = seat; ch.to = a.to; ch.claim = a.claim; s.phase = "answer"; return;
    }
    if (s.phase === "answer" && a.t === "call") {
      const real = ch.card.k === ch.claim, right = !!a.truth === real, taker = right ? ch.from : seat;
      s.up[taker][ch.card.k]++;
      logPush(s, { k: "call", s: seat, truth: !!a.truth, real: ch.card.k, claim: ch.claim, taker });
      s.chain = null; s.phase = "give"; s.cur = taker;
      if (s.up[taker][ch.card.k] >= LOSE) s.loser = taker;
      else if (!s.hands[taker].length) s.loser = taker;
      return;
    }
    throw new Error("지금은 할 수 없어요");
  },
  over(s) {
    if (s.loser == null) return null;
    const o = [...Array(s.n).keys()].filter(p => p !== s.loser).sort((a, b) => s.up[a].reduce((x, y) => x + y, 0) - s.up[b].reduce((x, y) => x + y, 0));
    return { text: `${KIND[s.up[s.loser].findIndex(x => x >= LOSE)] ?? "카드"}에 진 사람이 나왔어요`, rank: [...o.map(p => [p, "살아남음"]), [s.loser, "졌어요"]] };
  },
  bot(s, seat, rng) {
    const d = { delay: 1000 + rng() * 900 };
    const lie = (truthK) => rng() < .45 ? truthK : Math.floor(rng() * 8);
    if (s.phase === "give") {
      const H = s.hands[seat];
      const c = H[Math.floor(rng() * H.length)];
      const others = [...Array(s.n).keys()].filter(p => p !== seat);
      const to = others.sort((a, b) => Math.max(...s.up[b]) - Math.max(...s.up[a]) + (rng() - .5))[0];
      return { ...d, a: { t: "give", id: c.id, to, claim: lie(c.k) } };
    }
    const ch = s.chain;
    if (s.phase === "pass") {
      const to = [...Array(s.n).keys()].filter(p => !ch.seen.includes(p));
      return { ...d, a: { t: "pass", to: to[Math.floor(rng() * to.length)], claim: lie(ch.card.k) } };
    }
    if (ch.seen.length + 1 < s.n && rng() < .25) return { ...d, a: { t: "peek" } };
    const seen = s.up.reduce((a, u) => a + u[ch.claim], 0) + s.hands[seat].filter(c => c.k === ch.claim).length;
    const pTrue = Math.max(0, 8 - seen) / 8 * .9;
    return { ...d, a: { t: "call", truth: rng() < pTrue } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, ch = v.chain;
    const myGive = v.phase === "give" && v.cur === me, myAns = ch && ch.to === me && v.phase === "answer", myPass = ch && ch.to === me && v.phase === "pass";
    if (!myGive && !myPass) { UI.card = null; UI.to = null; }
    const chip = k => `<span class="bk" style="--k:${KC[k]}">${KIND[k]}</span>`;
    let say;
    if (v.loser != null) say = "판이 끝났어요";
    else if (myGive) say = "건넬 카드, 받을 사람, 뭐라고 말할지 골라요";
    else if (myAns) say = `${esc(n[ch.from])}: "이건 ${KIND[ch.claim]}야." 참일까요?`;
    else if (myPass) say = `몰래 봤어요. 진짜는 ${KIND[ch.k]}. 아직 안 본 사람에게 넘겨요`;
    else if (ch) say = `${esc(n[ch.from])}이(가) ${esc(n[ch.to])}에게 "${KIND[ch.claim]}"라며 건넸어요`;
    else say = `${esc(n[v.cur])}이(가) 건넬 카드를 고르는 중`;
    const targets = myGive ? [...Array(v.n).keys()].filter(p => p !== me) : myPass ? [...Array(v.n).keys()].filter(p => !ch.seen.includes(p)) : [];
    el.innerHTML = `<div class="bug">
      <p class="say">${say}</p>
      <div class="ups">${[...Array(v.n).keys()].map(p => `<div class="upr${p === v.cur ? " cur" : ""}${ch && ch.to === p ? " to" : ""}${v.loser === p ? " lost" : ""}" style="--s:${SEAT[p]}">
        <b>${esc(n[p])}</b><small>손 ${v.counts[p]}</small><div>${v.up[p].map((x, k) => x ? `<span class="bk${x >= 3 ? " warn" : ""}" style="--k:${KC[k]}">${KIND[k]} ${x}</span>` : "").join("")}</div></div>`).join("")}</div>
      ${myAns ? `<div class="acts"><button data-truth="1">참이야</button><button data-truth="0">거짓말!</button>${ch.seen.length + 1 < v.n ? `<button class="ghost peek">몰래 보고 넘기기</button>` : ""}</div>` : ""}
      ${myGive || myPass ? `<div class="bpick">
        ${myGive ? `<p>건넬 카드</p><div class="bh">${v.hand.map(c => `<button class="bc${UI.card === c.id ? " on" : ""}" data-id="${c.id}" style="--k:${KC[c.k]}">${KIND[c.k]}</button>`).join("")}</div>` : ""}
        <p>받을 사람</p><div class="bh">${targets.map(p => `<button class="bt${UI.to === p ? " on" : ""}" data-to="${p}" style="--s:${SEAT[p]}">${esc(n[p])}</button>`).join("")}</div>
        <p>"이건 ○○야"</p><div class="bh">${KIND.map((k, i) => `<button class="bcl" data-claim="${i}" style="--k:${KC[i]}" ${(myGive ? UI.card != null : true) && UI.to != null ? "" : "disabled"}>${k}</button>`).join("")}</div>
      </div>` : ""}
      ${v.hand ? `<div class="myhand"><small>내 손패</small>${KIND.map((k, i) => { const c = v.hand.filter(x => x.k === i).length; return c ? `${chip(i)}<b>${c}</b>` : ""; }).join(" ")}</div>` : ""}
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll("[data-truth]").forEach(b => b.onclick = () => send({ t: "call", truth: b.dataset.truth === "1" }));
    el.querySelector(".peek")?.addEventListener("click", () => send({ t: "peek" }));
    el.querySelectorAll(".bc").forEach(b => b.onclick = () => { UI.card = +b.dataset.id; re(); });
    el.querySelectorAll(".bt").forEach(b => b.onclick = () => { UI.to = +b.dataset.to; re(); });
    el.querySelectorAll(".bcl:not([disabled])").forEach(b => b.onclick = () => {
      const claim = +b.dataset.claim, to = UI.to, id = UI.card; UI.card = UI.to = null;
      send(myGive ? { t: "give", id, to, claim } : { t: "pass", to, claim });
    });
  }
};
const UI = { card: null, to: null };
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "give": return `${b(x.s)}이(가) ${b(x.to)}에게 "${KIND[x.claim]}"`;
    case "pass": return `${b(x.s)}이(가) 몰래 보고 ${b(x.to)}에게 "${KIND[x.claim]}"`;
    case "call": return `${b(x.s)} "${x.truth ? "참" : "거짓"}", 진짜는 ${KIND[x.real]}. ${b(x.taker)}이(가) 가져감`;
  }
  return "";
}
