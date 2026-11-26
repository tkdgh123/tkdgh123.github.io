// 고스톱 — 화투 48장으로 같은 달끼리 짝을 맞춰 먹고, 점수가 나면 "고"로 더 갈지 "스톱"으로 끝낼지 정하는 전통 놀이 (2~3명, 돈 없이 점수만)
// 점수 나는 기준: 둘이면 7점, 셋이면 3점. 광, 열끗, 띠, 피와 고도리, 홍단, 청단, 초단. 쪽, 뻑, 따닥, 싹쓸이는 피를 하나씩 빼앗음.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

const MON = ["", "송학", "매조", "벚꽃", "흑싸리", "난초", "모란", "홍싸리", "공산", "국화", "단풍", "오동", "비"];
const MCOL = ["", "#3c7a3a", "#c94f7c", "#e88aa8", "#4a4a4a", "#6a5acd", "#d9472b", "#b33a5a", "#5a6f8a", "#e0a526", "#c8401f", "#6b4a2a", "#2f6fb0"];
const DEF = { 1: ["g", "dh", "p", "p"], 2: ["yb", "dh", "p", "p"], 3: ["g", "dh", "p", "p"], 4: ["yb", "dc", "p", "p"], 5: ["y", "dc", "p", "p"], 6: ["y", "dq", "p", "p"],
  7: ["y", "dc", "p", "p"], 8: ["g", "yb", "p", "p"], 9: ["y", "dq", "p", "p"], 10: ["y", "dq", "p", "p"], 11: ["g", "pp", "p", "p"], 12: ["gb", "y", "db", "pp"] };
export const CARDS = (() => { const c = []; for (let m = 1; m <= 12; m++) DEF[m].forEach(k => c.push({ id: c.length, m, k })); return c; })();
const kind = c => c.k[0] === "p" ? "p" : c.k[0];
const piv = c => c.k === "pp" ? 2 : c.k === "p" ? 1 : 0;
const RANK = c => ({ g: 50, y: 30, d: 20, p: 5 })[kind(c)] + (c.k === "yb" ? 8 : 0) + (c.k === "pp" ? 8 : 0);
const LABEL = c => ({ g: "광", gb: "비광", y: "열끗", yb: "열끗(새)", dh: "홍단", dq: "청단", dc: "초단", db: "띠", p: "피", pp: "쌍피" })[c.k];

export function score(cap) {
  const g = cap.filter(c => kind(c) === "g"), y = cap.filter(c => kind(c) === "y"), d = cap.filter(c => kind(c) === "d"), pi = cap.reduce((a, c) => a + piv(c), 0);
  let s = 0; const why = [];
  if (g.length === 5) { s += 15; why.push("오광 15"); } else if (g.length === 4) { s += 4; why.push("사광 4"); } else if (g.length === 3) { const v = g.some(c => c.k === "gb") ? 2 : 3; s += v; why.push(`삼광 ${v}`); }
  if (y.length >= 5) { s += y.length - 4; why.push(`열끗 ${y.length - 4}`); }
  if (y.filter(c => c.k === "yb").length === 3) { s += 5; why.push("고도리 5"); }
  if (d.length >= 5) { s += d.length - 4; why.push(`띠 ${d.length - 4}`); }
  for (const [k, nm] of [["dh", "홍단"], ["dq", "청단"], ["dc", "초단"]]) if (d.filter(c => c.k === k).length === 3) { s += 3; why.push(`${nm} 3`); }
  if (pi >= 10) { s += pi - 9; why.push(`피 ${pi - 9}`); }
  return { s, why, g: g.length, pi };
}
function steal(s, p) {
  for (let o = 0; o < s.n; o++) {
    if (o === p) continue;
    const cap = s.cap[o];
    let i = cap.findIndex(c => c.k === "p"); if (i < 0) i = cap.findIndex(c => c.k === "pp");
    if (i >= 0) s.cap[p].push(cap.splice(i, 1)[0]);
  }
}
const best = list => [...list].sort((a, b) => RANK(b) - RANK(a))[0];

export default {
  id: "gostop", name: "고스톱", color: "#c8401f", min: 2, max: 3, time: "20분", solo: 2,
  sub: "화투로 같은 달끼리 짝을 맞춰요. 점수가 나면 고, 아니면 스톱. 돈 없이 점수만",
  setup(n, rng) {
    const deck = shuffle(CARDS.map(c => ({ ...c })), rng), hs = n === 2 ? 10 : 7, fl = n === 2 ? 8 : 6;
    const hands = Array.from({ length: n }, () => deck.splice(0, hs).sort((a, b) => a.m - b.m));
    return { n, deck, hands, floor: deck.splice(0, fl), cap: Array.from({ length: n }, () => []), go: Array(n).fill(0), last: Array(n).fill(0), cur: 0, phase: "play", log: [], win: null, flip: null, nagari: false };
  },
  view(s, seat) {
    return { n: s.n, floor: s.floor, cap: s.cap, go: s.go, cur: s.cur, phase: s.phase, log: s.log, win: s.win, flip: s.flip, nagari: s.nagari, final: s.final ?? null,
      deckN: s.deck.length, counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, scores: s.cap.map(c => score(c)), need: s.n === 2 ? 7 : 3, turn: this.turn(s) };
  },
  turn(s) { return s.win != null || s.nagari ? [] : [s.cur]; },
  apply(s, seat, a) {
    if (s.win != null || s.nagari || seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.phase === "gostop") {
      if (a.t === "go") { s.go[seat]++; s.last[seat] = score(s.cap[seat]).s; logPush(s, { k: "go", s: seat, n: s.go[seat] }); return this.next(s); }
      if (a.t === "stop") return this.stop(s, seat);
      throw new Error("고 또는 스톱");
    }
    if (a.t !== "play") throw new Error("낼 패를 골라요");
    const H = s.hands[seat], i = H.findIndex(c => c.id === a.id);
    if (i < 0) throw new Error("그 패가 없어요");
    const c = H.splice(i, 1)[0], got = [];
    const same = m => s.floor.filter(f => f.m === m);
    // 1) 낸 패
    const fa = same(c.m); let stage = fa.length, pairA = null;
    if (fa.length === 0) s.floor.push(c);
    else if (fa.length === 3) { got.push(c, ...fa); s.floor = s.floor.filter(f => f.m !== c.m); logPush(s, { k: "sweep3", s: seat }); steal(s, seat); }
    else { pairA = fa.length === 1 ? fa[0] : best(fa); }
    // 2) 뒤집은 패
    const d = s.deck.pop(); s.flip = d;
    if (d) {
      if (stage === 1 && d.m === c.m) { s.floor.push(c, d); logPush(s, { k: "ppuk", s: seat }); pairA = null; }       // 뻑: 셋 다 바닥에
      else if (stage === 0 && d.m === c.m) { s.floor = s.floor.filter(f => f !== c); got.push(c, d); logPush(s, { k: "jjok", s: seat }); steal(s, seat); } // 쪽
      else if (stage === 2 && d.m === c.m) { got.push(c, d, ...fa); s.floor = s.floor.filter(f => f.m !== c.m); pairA = null; logPush(s, { k: "ttadak", s: seat }); steal(s, seat); } // 따닥
      else {
        const fd = same(d.m).filter(f => f !== pairA);
        if (fd.length === 0) s.floor.push(d);
        else if (fd.length === 3) { got.push(d, ...fd); s.floor = s.floor.filter(f => f.m !== d.m); steal(s, seat); }
        else { const pb = fd.length === 1 ? fd[0] : best(fd); got.push(d, pb); s.floor = s.floor.filter(f => f !== pb); }
      }
    }
    if (pairA) { got.push(c, pairA); s.floor = s.floor.filter(f => f !== pairA); }
    s.cap[seat].push(...got);
    logPush(s, { k: "play", s: seat, c, d, n: got.length });
    if (!s.floor.length && got.length && (s.deck.length || s.hands.some(h => h.length))) { logPush(s, { k: "clean", s: seat }); steal(s, seat); }
    const sc = score(s.cap[seat]).s;
    if (sc >= (s.n === 2 ? 7 : 3) && sc > s.last[seat]) {
      if (!s.hands[seat].length) return this.stop(s, seat); // 마지막 패면 바로 스톱
      s.phase = "gostop"; return;
    }
    this.next(s);
  },
  next(s) {
    s.phase = "play";
    if (s.hands.every(h => !h.length)) { s.nagari = true; logPush(s, { k: "nagari" }); return; }
    do s.cur = (s.cur + 1) % s.n; while (!s.hands[s.cur].length);
  },
  stop(s, p) {
    const me = score(s.cap[p]);
    let mult = 1; const why = [];
    if (s.go[p] >= 3) { mult *= 2 ** (s.go[p] - 2); why.push(`${s.go[p]}고`); }
    const others = [...Array(s.n).keys()].filter(o => o !== p);
    if (me.pi >= 10 && others.some(o => score(s.cap[o]).pi < 5)) { mult *= 2; why.push("피박"); }
    if (me.g >= 3 && others.some(o => score(s.cap[o]).g === 0)) { mult *= 2; why.push("광박"); }
    s.final = { p, base: me.s + s.go[p], mult, total: (me.s + s.go[p]) * mult, why: [...me.why, ...why] };
    s.win = p; logPush(s, { k: "stop", s: p, t: s.final.total });
  },
  over(s) {
    if (s.nagari) return { text: "나가리 (아무도 못 남)", rank: [...Array(s.n).keys()].map(p => [p, `${score(s.cap[p]).s}점`]) };
    if (s.win == null) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => (b === s.win) - (a === s.win) || score(s.cap[b]).s - score(s.cap[a]).s);
    return { text: `${s.final.total}점 스톱 (${s.final.why.join(", ")})`, rank: o.map(p => [p, p === s.win ? `${s.final.total}점으로 남` : `${score(s.cap[p]).s}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 600 };
    if (s.phase === "gostop") {
      const opp = Math.max(...s.cap.map((c, o) => o === seat ? 0 : score(c).s));
      return { ...d, a: { t: opp <= 2 && s.hands[seat].length >= 3 && s.go[seat] < 2 && rng() < .6 ? "go" : "stop" } };
    }
    const H = s.hands[seat];
    let bc = H[0], bv = -1e9;
    for (const c of H) {
      const m = s.floor.filter(f => f.m === c.m);
      let v = m.length === 0 ? -RANK(c) * .3 : m.length === 2 ? RANK(c) + RANK(best(m)) : RANK(c) + m.reduce((a, f) => a + RANK(f), 0);
      if (m.length === 3) v += 40;
      v += rng();
      if (v > bv) { bv = v; bc = c; }
    }
    return { ...d, a: { t: "play", id: bc.id } };
  },
  badge(v, i) { return `${v.scores[i].s}점${v.go[i] ? `, ${v.go[i]}고` : ""}`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && v.win == null && !v.nagari;
    const card = (c, attrs = "", cls = "") => `<button class="hw k-${kind(c)} ${cls}" style="--h:${MCOL[c.m]}" ${attrs}><b>${c.m}</b><small>${MON[c.m]}</small><i>${LABEL(c)}</i></button>`;
    const capView = (cap) => ["g", "y", "d", "p"].map(k => { const l = cap.filter(c => kind(c) === k); return l.length ? `<span class="cg"><small>${({ g: "광", y: "열끗", d: "띠", p: "피" })[k]} ${k === "p" ? l.reduce((a, c) => a + piv(c), 0) : l.length}</small>${l.map(c => `<i style="--h:${MCOL[c.m]}">${c.m}</i>`).join("")}</span>` : ""; }).join("");
    const hl = v.hand ? new Set(v.hand.filter(c => v.floor.some(f => f.m === c.m)).map(c => c.id)) : new Set();
    el.innerHTML = `<div class="gostop">
      <p class="say">${v.nagari ? "나가리예요" : v.win != null ? "판이 끝났어요" : my ? (v.phase === "gostop" ? `${v.scores[me].s}점! 고 할까요, 스톱 할까요?` : "낼 패를 골라요 (짝이 있는 패는 위로 올라와 있어요)") : `${esc(n[v.cur])} 차례`}<small>더미 ${v.deckN}장, ${v.need}점부터 스톱</small></p>
      ${my && v.phase === "gostop" ? `<div class="acts"><button class="go">고 (${v.go[me] + 1}고)</button><button class="ghost st">스톱</button></div>` : ""}
      <div class="floor">${v.floor.map(c => card(c, "disabled")).join("")}${v.flip ? `<div class="flipped"><small>방금 뒤집은 패</small>${card(v.flip, "disabled")}</div>` : ""}</div>
      ${v.hand ? `<div class="hhand">${v.hand.map(c => card(c, `data-id="${c.id}" ${my && v.phase === "play" ? "" : "disabled"}`, hl.has(c.id) ? "up" : "")).join("")}</div>` : ""}
      <div class="caps">${[...Array(v.n).keys()].map(p => `<div class="cp${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]}"><div class="ch"><b>${esc(n[p])}</b><span>${v.scores[p].s}점${v.go[p] ? `, ${v.go[p]}고` : ""}</span><small>손 ${v.counts[p]}</small></div><div class="cr">${capView(v.cap[p])}</div>${v.scores[p].why.length ? `<small class="why">${v.scores[p].why.join(", ")}</small>` : ""}</div>`).join("")}</div>
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    el.querySelectorAll(".hhand .hw:not([disabled])").forEach(b => b.onclick = () => send({ t: "play", id: +b.dataset.id }));
    el.querySelector(".go")?.addEventListener("click", () => send({ t: "go" }));
    el.querySelector(".st")?.addEventListener("click", () => send({ t: "stop" }));
  }
};
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "play": return `${b(x.s)} ${x.c.m}월 ${LABEL(x.c)} 냄${x.d ? `, ${x.d.m}월 뒤집음` : ""}${x.n ? `, ${x.n}장 먹음` : ""}`;
    case "ppuk": return `${b(x.s)} 뻑!`;
    case "jjok": return `${b(x.s)} 쪽! 피 하나씩 받음`;
    case "ttadak": return `${b(x.s)} 따닥! 피 하나씩 받음`;
    case "sweep3": return `${b(x.s)} 뻑 먹기! 피 하나씩 받음`;
    case "clean": return `${b(x.s)} 싹쓸이! 피 하나씩 받음`;
    case "go": return `${b(x.s)} ${x.n}고!`;
    case "stop": return `${b(x.s)} 스톱, ${x.t}점`;
    case "nagari": return "나가리";
  }
  return "";
}
