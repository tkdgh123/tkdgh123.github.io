// 소라게 경주 — 주사위를 더 굴릴지 멈출지 정하는 해변 경주 (2~7명). 규칙은 마헤(알렉스 랜돌프) 방식에 맞춤.
// 섬 둘레 21칸, 21번째 칸이 알 낳는 해변. 2~3명이면 한 사람이 소라게 둘을 움직이고 순서를 직접 정함.
// 주사위는 하나씩 최대 셋. 합이 7을 넘으면 뗏목으로, 안 넘으면 (합 × 굴린 개수)칸. 업혀 있으면 더 굴릴지는 맨 위 소라게 주인이 정함.
// 조개 카드 24장(1×3, 2×3, 3×5, 4×5, 5×5, 6×3) 중 4장을 빼고 20장. 카드가 다 떨어진 뒤 해변에 처음 닿으면 7개를 더 받고 끝.
import { esc, shuffle, SEAT, dieHTML, logPush, nameB } from "../lib.js";

const L = 21, RAFT = 0;
const DECK = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6];
const above = (s, c) => { const p = s.crabs[c].pos; if (p === RAFT) return [c]; const st = s.track[p]; return st.slice(st.indexOf(c)); };
const sum = d => d.reduce((a, b) => a + b, 0);

function beginTurn(s) {
  s.todo = s.crabs.map((c, i) => c.o === s.cur ? i : -1).filter(i => i >= 0);
  s.dice = [];
  if (s.todo.length > 1) { s.phase = "pick"; s.mover = null; } else { s.mover = s.todo[0]; s.phase = "roll"; }
}
function nextMover(s) {
  s.todo = s.todo.filter(c => c !== s.mover);
  if (s.phase === "end") return;
  s.dice = [];
  if (s.todo.length) { s.mover = s.todo[0]; s.phase = "roll"; return; }
  s.cur = (s.cur + 1) % s.n; beginTurn(s);
}
const decider = s => { const g = above(s, s.mover); return s.crabs[g[g.length - 1]].o; };
function bust(s) {
  const g = above(s, s.mover), p = s.crabs[s.mover].pos;
  if (p !== RAFT) s.track[p].splice(s.track[p].indexOf(s.mover));
  g.forEach(c => s.crabs[c].pos = RAFT);
  logPush(s, { k: "bust", s: s.cur, d: [...s.dice], n: g.length });
  s.last = { k: "bust", roll: s.rollN, d: [...s.dice] };
  nextMover(s);
}
function move(s) {
  const n = s.dice.length, m = sum(s.dice) * n, g = above(s, s.mover), p = s.crabs[s.mover].pos;
  if (p !== RAFT) s.track[p].splice(s.track[p].indexOf(s.mover));
  const to = ((p + m - 1) % L) + 1;
  if (p < L && p + m >= L) { // 해변에 닿거나 지남: 맨 위 소라게 주인이 조개 카드
    const owner = s.crabs[g[g.length - 1]].o;
    if (s.deck.length) { s.got[owner].push(s.deck.pop()); logPush(s, { k: "egg", s: owner }); }
    else { s.got[owner].push(7); s.final = owner; logPush(s, { k: "final", s: owner }); s.phase = "end"; }
  }
  s.track[to].push(...g); g.forEach(c => s.crabs[c].pos = to);
  logPush(s, { k: "move", s: s.cur, d: [...s.dice], m, ride: g.length - 1 });
  s.last = { k: "move", roll: s.rollN, d: [...s.dice] };
  nextMover(s);
}

export default {
  id: "crab", name: "소라게 경주", color: "#3c8d5a", min: 2, max: 7, time: "20분", solo: 4,
  sub: "주사위를 한 번 더 굴릴까? 합이 7을 넘으면 뗏목으로 돌아가는 해변 경주. 조개를 가장 많이 모으면 이겨요",
  setup(n, rng) {
    const per = n <= 3 ? 2 : 1, crabs = [];
    for (let p = 0; p < n; p++) for (let k = 0; k < per; k++) crabs.push({ o: p, pos: RAFT });
    const deck = shuffle([...DECK], rng).slice(4);
    const s = { n, per, crabs, track: Array.from({ length: L + 1 }, () => []), deck, got: Array.from({ length: n }, () => []), final: null, cur: 0, todo: [], mover: null, phase: "roll", dice: [], rollN: 0, log: [], last: null };
    beginTurn(s); return s;
  },
  view(s, seat) {
    const end = s.phase === "end";
    return { n: s.n, per: s.per, crabs: s.crabs, track: s.track, cur: s.cur, todo: s.todo, mover: s.mover, phase: s.phase, dice: s.dice, rollN: s.rollN, log: s.log, last: s.last,
      left: s.deck.length, next: s.deck[s.deck.length - 1] ?? 7, final: s.final,
      got: s.got.map((g, p) => end || p === seat ? g : null), cards: s.got.map(g => g.length), decider: s.phase === "more" ? decider(s) : null, turn: this.turn(s) };
  },
  turn(s) { return s.phase === "end" ? [] : s.phase === "more" ? [decider(s)] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (s.phase === "pick") {
      if (seat !== s.cur || a.t !== "pick" || !s.todo.includes(a.c)) throw new Error("먼저 움직일 내 소라게를 골라요");
      s.mover = a.c; s.phase = "roll"; return;
    }
    if (s.phase === "roll") {
      if (seat !== s.cur || a.t !== "roll") throw new Error("주사위를 굴려요");
      s.dice = [1 + Math.floor(ctx.rng() * 6)]; s.rollN++;
      s.phase = "more"; return;
    }
    if (s.phase === "more") {
      if (seat !== decider(s)) throw new Error("더 굴릴지는 맨 위 소라게 주인이 정해요");
      if (a.t === "more") {
        s.dice.push(1 + Math.floor(ctx.rng() * 6)); s.rollN++;
        if (sum(s.dice) > 7) return bust(s);
        if (s.dice.length === 3) return move(s);
        return;
      }
      if (a.t === "stop") return move(s);
      throw new Error("더 굴리거나 멈춰요");
    }
    throw new Error("판이 끝났어요");
  },
  over(s) {
    if (s.phase !== "end") return null;
    const tot = p => s.got[p].reduce((a, b) => a + b, 0);
    const order = [...Array(s.n).keys()].sort((a, b) => tot(b) - tot(a) || s.got[b].length - s.got[a].length);
    let rk = 0;
    return { text: "조개를 가장 많이 모은 사람", rank: order.map((p, i) => { if (i === 0 || tot(p) !== tot(order[i - 1])) rk = i + 1; return [p, `${rk}등, 조개 ${tot(p)}개`]; }) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 600 };
    if (s.phase === "pick") return { ...d, a: { t: "pick", c: [...s.todo].sort((x, y) => s.crabs[x].pos - s.crabs[y].pos)[0] } };
    if (s.phase === "roll") return { ...d, a: { t: "roll" } };
    const t = sum(s.dice), n = s.dice.length, p = s.crabs[s.mover].pos;
    if (p < L && p + t * n >= L) return { ...d, a: { t: "stop" } }; // 지금 멈춰도 해변을 지나면 멈춤
    let ev = 0;
    for (let x = 1; x <= 6; x++) if (t + x <= 7) ev += (t + x) * (n + 1) / 6;
    return { ...d, a: { t: ev > t * n * (0.95 + rng() * .2) ? "more" : "stop" } };
  },
  badge(v, i) { return `조개 카드 ${v.cards[i]}장`; },
  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// ───────── 화면: 둘러앉은 자리에서 보는 섬 판 ─────────
const UI = { roll: -1, anim: 0 };
const ang = k => (45 - (k - .5) * (360 / L)) * Math.PI / 180;           // k번째 칸 각도(뗏목이 오른쪽 아래)
const spot = k => [50 + 36.5 * Math.cos(ang(k)), 50 + 36.5 * Math.sin(ang(k))];

function render(el, v, me, send, ui) {
  const n = ui.names, my = v.turn.includes(me), seatMe = me < 0 ? 0 : me;
  const rot = -(seatMe / v.n) * 360;                                        // 내 자리가 화면 아래로 오게 판을 돌림
  const t = sum(v.dice);
  // 방금 굴린 주사위가 7을 넘어 바로 다음 차례로 넘어갔으면 그 주사위를 잠깐 보여 줌
  const showDice = v.dice.length ? v.dice : (v.last && v.last.roll === v.rollN ? v.last.d : []);
  const st = sum(showDice);
  let say;
  if (v.phase === "end") say = "판이 끝났어요";
  else if (v.phase === "pick") say = v.cur === me ? "이번에 먼저 움직일 내 소라게를 눌러요 (빛나는 것)" : `${esc(n[v.cur])}이(가) 움직일 소라게를 고르는 중`;
  else if (v.phase === "roll") say = v.cur === me ? "주사위를 굴려요" : `${esc(n[v.cur])}이(가) 주사위를 굴릴 차례`;
  else if (v.decider === me) say = v.decider !== v.cur ? `내 소라게가 ${esc(n[v.cur])}에게 업혀 있어요. 합 ${t}, 더 굴리게 할까요?` : `합 ${t}, 지금 멈추면 ${t * v.dice.length}칸. 더 굴릴까요?`;
  else say = `${esc(n[v.decider])}이(가) 더 굴릴지 정하는 중 (합 ${t})`;
  const stackHTML = list => list.map((c, j) => `<i data-k="c${c}" class="cr${c === v.mover ? " mv" : ""}${v.phase === "pick" && v.cur === me && v.todo.includes(c) ? " pick" : ""}" data-c="${c}" style="--s:${SEAT[v.crabs[c].o]};--k:${j}"><img src="art/hermit.webp" alt="${esc(n[v.crabs[c].o])}"></i>`).join("");
  const raft = v.crabs.map((c, i) => c.pos === 0 ? i : -1).filter(i => i >= 0);
  const seatsAround = [...Array(v.n).keys()].map(p => { const a = (90 + (p / v.n) * 360 + rot) * Math.PI / 180; return `<span class="seat${p === v.cur ? " cur" : ""}${p === me ? " me" : ""}" style="--s:${SEAT[p]};left:${50 + 46 * Math.cos(a)}%;top:${50 + 46 * Math.sin(a)}%">${esc(n[p])}</span>`; }).join("");
  const diceNew = v.rollN !== UI.roll && showDice.length;
  el.innerHTML = `<div class="crab">
    <p class="say">${say}</p>
    <div class="ctable">
      <div class="cboard" style="--rot:${rot}deg">
        <img class="cimg" src="art/crabisle.webp" alt="">
        ${Array.from({ length: L }, (_, i) => { const k = i + 1, [x, y] = spot(k); return `<div class="sp${k === L ? " beach" : ""}" style="left:${x}%;top:${y}%"><b>${k === L ? "알" : k}</b>${stackHTML(v.track[k])}</div>`; }).join("")}
        <div class="raft">${stackHTML(raft)}</div>
      </div>
      ${seatsAround}
      <div class="tray">${showDice.map((d, i) => dieHTML(d, `${st > 7 ? "bad" : ""}${diceNew && i === showDice.length - 1 ? " rolling" : ""}`)).join("")}</div>
    </div>
    <div class="cinfo"><div class="shell"><small>다음 조개</small><b>${v.left ? v.next : 7}</b><small>${v.left ? `남은 ${v.left}장` : "마지막 7개"}</small></div>
      <div class="mine">${me >= 0 ? `내 조개 <b>${(v.got[me] || []).reduce((a, b) => a + b, 0)}</b>개 <small>(${v.cards[me]}장)</small><br>` : ""}<small>남의 조개 수는 끝날 때 공개돼요</small></div></div>
    <div class="acts">${my && v.phase === "roll" ? `<button class="roll">주사위 굴리기</button>` : my && v.phase === "more" ? `<button class="more" ${v.dice.length >= 3 ? "disabled" : ""}>하나 더 굴리기</button><button class="ghost stop">${t * v.dice.length}칸 가기</button>` : ""}</div>
    <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
  </div>`;
  el.querySelector(".roll")?.addEventListener("click", () => send({ t: "roll" }));
  el.querySelector(".more")?.addEventListener("click", () => send({ t: "more" }));
  el.querySelector(".stop")?.addEventListener("click", () => send({ t: "stop" }));
  el.querySelectorAll(".cr.pick").forEach(b => b.onclick = () => send({ t: "pick", c: +b.dataset.c }));
  // 주사위 굴리는 모습: 새로 굴린 주사위가 구르며 눈이 바뀌다 멈춤
  if (diceNew) {
    UI.roll = v.rollN;
    const d = el.querySelector(".die.rolling");
    if (d) {
      const final = d.innerHTML; let k = 0;
      clearInterval(UI.anim);
      UI.anim = setInterval(() => {
        if (++k > 7) { clearInterval(UI.anim); d.innerHTML = final; d.classList.remove("rolling"); return; }
        d.innerHTML = dieHTML(1 + Math.floor(Math.random() * 6)).replace(/^<span[^>]*>/, "").replace(/<\/span>$/, "");
      }, 70);
    }
  }
}
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "move": return `${b(x.s)} 주사위 ${x.d.join("+")}, ${x.m}칸${x.ride ? `, ${x.ride}마리 업고` : ""}`;
    case "bust": return `${b(x.s)} 주사위 ${x.d.join("+")}, 7을 넘어 뗏목으로${x.n > 1 ? ` (${x.n - 1}마리 같이)` : ""}`;
    case "egg": return `${b(x.s)} 해변에서 조개 카드 한 장`;
    case "final": return `${b(x.s)} 마지막 해변 도착, 조개 7개 더`;
  }
  return "";
}
