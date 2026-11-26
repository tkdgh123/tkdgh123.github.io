// 소라게 경주 — 주사위를 더 굴릴지 멈출지 정하는 경주 (2~7명)
// 한 차례에 주사위를 하나씩 최대 셋. 눈의 합이 7을 넘으면 출발점으로. 안 넘으면 (합 × 굴린 개수)칸.
// 남의 게 위에 멈추면 업혀 가고, 업힌 게(맨 위) 주인이 아래 게가 굴릴 개수를 정한다. 해변을 지나면 맨 위 게가 조개를 줍는다.
import { esc, shuffle, SEAT } from "../lib.js";

const L = 24; // 0번 칸이 해변
const DOCK = -1;

function stackOf(s, seat) {
  const p = s.pos[seat];
  if (p === DOCK) return null;
  const st = s.track[p];
  return { p, st, i: st.indexOf(seat) };
}
const log = (s, x) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, 12); };

function startTurn(s) {
  s.dice = []; s.need = null; s.cmd = null;
  const k = stackOf(s, s.cur);
  if (k && k.i < k.st.length - 1) { s.cmd = k.st[k.st.length - 1]; s.phase = "cmd"; }
  else s.phase = "roll";
}
function endTurn(s) {
  if (!s.deck.length) { s.phase = "end"; return; }
  s.cur = (s.cur + 1) % s.n;
  startTurn(s);
}
function bust(s) {
  const k = stackOf(s, s.cur);
  const group = k ? k.st.splice(k.i) : [s.cur];
  for (const g of group) s.pos[g] = DOCK;
  log(s, { k: "bust", s: s.cur, sum: s.dice.reduce((a, b) => a + b, 0), g: group });
  s.last = { k: "bust" };
  endTurn(s);
}
function move(s) {
  const sum = s.dice.reduce((a, b) => a + b, 0), m = sum * s.dice.length;
  const k = stackOf(s, s.cur);
  const group = k ? k.st.splice(k.i) : [s.cur];
  const from = k ? k.p : 0;
  let to = from + m, egg = null;
  if (to >= L) {
    to %= L;
    if (s.deck.length) { egg = s.deck.pop(); const top = group[group.length - 1]; s.eggs[top] += egg; s.got[top].push(egg); log(s, { k: "egg", s: top, v: egg }); }
  }
  s.track[to].push(...group);
  for (const g of group) s.pos[g] = to;
  log(s, { k: "move", s: s.cur, d: [...s.dice], m, ride: group.length - 1 });
  s.last = { k: "move", to, egg };
  endTurn(s);
}

export default {
  id: "crab", name: "소라게 경주", color: "#3c8d5a", min: 2, max: 7, time: "20분", solo: 4,
  sub: "주사위를 한 번 더 굴릴까? 합이 7을 넘으면 출발점으로 돌아가는 해변 경주",

  setup(n, rng) {
    const deck = [];
    for (let v = 1; v <= 6; v++) deck.push(v, v, v);
    shuffle(deck, rng);
    deck.unshift(7); // 마지막 조개는 7
    return {
      n, pos: Array(n).fill(DOCK), track: Array.from({ length: L }, () => []),
      eggs: Array(n).fill(0), got: Array.from({ length: n }, () => []),
      deck, cur: 0, phase: "roll", dice: [], need: null, cmd: null, log: [], last: null
    };
  },

  view(s) {
    const { deck, ...rest } = s;
    return { ...JSON.parse(JSON.stringify(rest)), left: deck.length, next: deck[deck.length - 1] ?? null, turn: this.turn(s) };
  },

  turn(s) { return s.phase === "end" ? [] : s.phase === "cmd" ? [s.cmd] : [s.cur]; },

  apply(s, seat, a, ctx) {
    if (s.phase === "cmd") {
      if (seat !== s.cmd || a.t !== "cmd") throw new Error("업힌 게 주인이 개수를 정하는 중이에요");
      const k = a.k | 0;
      if (k < 1 || k > 3) throw new Error("1~3개 중에 골라요");
      s.need = k; s.phase = "roll"; log(s, { k: "cmd", s: seat, to: s.cur, n: k });
      return;
    }
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (a.t === "roll") {
      if (s.dice.length >= 3) throw new Error("주사위는 셋까지예요");
      s.dice.push(1 + Math.floor(ctx.rng() * 6));
      const sum = s.dice.reduce((x, y) => x + y, 0);
      if (sum > 7) return bust(s);
      if (s.dice.length === 3 || (s.need && s.dice.length === s.need)) return move(s);
      s.last = { k: "roll" };
      return;
    }
    if (a.t === "go") {
      if (!s.dice.length) throw new Error("먼저 한 번은 굴려요");
      if (s.need && s.dice.length < s.need) throw new Error(`${s.need}개를 굴려야 해요`);
      return move(s);
    }
    throw new Error("모르는 행동이에요");
  },

  over(s) {
    if (s.phase !== "end") return null;
    const order = [...Array(s.n).keys()].sort((a, b) => s.eggs[b] - s.eggs[a] || s.got[b].length - s.got[a].length);
    let rk = 0;
    return { text: "조개를 가장 많이 주운 사람", rank: order.map((p, i) => { if (i === 0 || s.eggs[p] !== s.eggs[order[i - 1]]) rk = i + 1; return [p, `${rk}등, 조개 ${s.eggs[p]}개`]; }) };
  },

  bot(s, seat, rng) {
    const d = { delay: 800 + rng() * 600 };
    if (s.phase === "cmd") {
      const k = stackOf(s, s.cur), dist = L - k.p;
      return { ...d, a: { t: "cmd", k: dist > 14 ? 2 + (rng() < .3 ? 1 : 0) : dist > 6 ? 2 : 1 } };
    }
    if (!s.dice.length) return { ...d, a: { t: "roll" } };
    if (s.need) return { ...d, a: { t: "roll" } };
    const sum = s.dice.reduce((x, y) => x + y, 0), n = s.dice.length;
    const k = stackOf(s, seat), from = k ? k.p : 0;
    if (from + sum * n >= L && s.deck.length) return { ...d, a: { t: "go" } }; // 해변에 닿으면 멈춤
    let ev = 0;
    for (let x = 1; x <= 6; x++) if (sum + x <= 7) ev += (sum + x) * (n + 1) / 6;
    return { ...d, a: { t: ev > sum * n * (0.95 + rng() * .2) ? "roll" : "go" } };
  },

  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// ───────── 화면 ─────────
const PIP = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
const die = (n, cls = "") => `<span class="die ${cls}">${[...Array(9).keys()].map(i => `<i${PIP[n].includes(i + 1) ? ' class="on"' : ""}></i>`).join("")}</span>`;

function spot(i) {
  // 섬 둘레 타원, 0번(해변)이 아래 가운데, 시계 방향
  const a = Math.PI / 2 - (i / L) * Math.PI * 2;
  return [50 + 44 * Math.cos(a), 50 + 41 * Math.sin(a)];
}

function render(el, v, me, send, ui) {
  const mine = v.turn.includes(me);
  const sum = v.dice.reduce((a, b) => a + b, 0);
  const n = ui.names;
  let say;
  if (v.phase === "end") say = "판이 끝났어요";
  else if (v.phase === "cmd") say = v.cmd === me ? `${esc(n[v.cur])}의 게에 업혀 있어요. 주사위를 몇 개 굴리게 할지 정해요` : `${esc(n[v.cmd])}이(가) ${esc(n[v.cur])}에게 굴릴 개수를 정하는 중`;
  else if (v.cur === me) say = v.need ? `주사위 ${v.need}개를 굴려야 해요 (지금 ${v.dice.length}개)` : v.dice.length ? `합 ${sum}, ${sum * v.dice.length}칸 갈 수 있어요. 더 굴리면 합이 7을 넘을 수도 있어요` : "주사위를 굴려요";
  else say = `${esc(n[v.cur])} 차례예요`;

  const dock = [...Array(v.n).keys()].filter(p => v.pos[p] === -1);
  el.innerHTML = `<div class="crab">
    <p class="say">${say}</p>
    <div class="isle">
      <div class="sea"></div><div class="land"><b>해변</b></div>
      ${Array.from({ length: L }, (_, i) => { const [x, y] = spot(i); return `<div class="sp${i === 0 ? " beach" : ""}" style="left:${x}%;top:${y}%">${v.track[i].map((p, k) => `<i class="cr${p === v.cur ? " cur" : ""}" style="--s:${SEAT[p]};--k:${k}" title="${esc(n[p])}"></i>`).join("")}</div>`; }).join("")}
      <div class="center">
        <div class="dock"><small>출발 뗏목</small>${dock.map(p => `<i class="cr" style="--s:${SEAT[p]}" title="${esc(n[p])}"></i>`).join("") || "<span class='dim'>비었음</span>"}</div>
        <div class="dice">${v.dice.map(d => die(d, sum > 7 ? "bad" : "")).join("") || `<span class="dim">주사위</span>`}</div>
        <div class="shell"><small>다음 조개</small><b>${v.next ?? "-"}</b><small>남은 ${v.left}장</small></div>
      </div>
    </div>
    <div class="acts">${mine && v.phase === "cmd" ? [1, 2, 3].map(k => `<button data-k="${k}">${k}개 굴려</button>`).join("")
      : mine ? `<button class="roll" ${v.dice.length >= 3 ? "disabled" : ""}>${v.dice.length ? "한 번 더 굴리기" : "굴리기"}</button>${v.dice.length && !v.need ? `<button class="ghost go">${sum * v.dice.length}칸 가기</button>` : ""}` : ""}</div>
    <ol class="score">${[...Array(v.n).keys()].map(p => `<li style="--s:${SEAT[p]}" class="${p === v.cur ? "cur" : ""}"><b>${esc(n[p])}</b><span>조개 ${v.eggs[p]}</span></li>`).join("")}</ol>
    <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
  </div>`;
  el.querySelector(".roll")?.addEventListener("click", () => send({ t: "roll" }));
  el.querySelector(".go")?.addEventListener("click", () => send({ t: "go" }));
  el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => send({ t: "cmd", k: +b.dataset.k }));
}

function line(x, n) {
  const b = i => `<b style="color:${SEAT[i]}">${esc(n[i])}</b>`;
  switch (x.k) {
    case "move": return `${b(x.s)} 주사위 ${x.d.join("+")}, ${x.m}칸${x.ride ? `, ${x.ride}마리 업고` : ""}`;
    case "bust": return `${b(x.s)} 합 ${x.sum}, 7을 넘어 뗏목으로${x.g.length > 1 ? ` (${x.g.length - 1}마리 같이)` : ""}`;
    case "egg": return `${b(x.s)} 해변에서 조개 ${x.v}개`;
    case "cmd": return `${b(x.s)}: ${b(x.to)}에게 ${x.n}개 굴리라고 함`;
  }
  return "";
}
