// 괴짜 달리기 — 경주마다 저마다 이상한 재주를 가진 선수를 하나 골라 운동장 30칸을 달린다 (2~6명)
// 세 경주. 1등 4점, 2등 2점, 3등 1점. 재주가 서로 부딪히는 맛.
import { esc, shuffle, SEAT, dieHTML, logPush, nameB } from "../lib.js";

export const RACER = [
  ["날쌘돌이", "굴린 수 +1", 7], ["거북이", "굴리지 않고 늘 3칸. 꼴찌면 5칸", 5], ["업둥이", "누가 내 칸에서 출발하면 업혀서 같이 감", 5],
  ["밀치기", "내가 멈춘 칸에 있던 선수는 2칸 뒤로", 6], ["행운아", "굴린 뒤 한 번 다시 굴릴 수 있음", 6], ["혜성", "6이 나오면 한 번 더 굴려 더함", 6],
  ["자석", "누가 나를 앞질러 가면 나도 1칸 앞으로", 5], ["뒷심", "꼴찌에서 출발하면 굴린 수 두 배", 7], ["방해꾼", "1등 선수가 움직일 때 1칸 덜 가게 함", 4],
  ["용수철", "짝수면 +2, 홀수면 -1", 6], ["응원단", "누가 6을 굴리면 나도 1칸 앞으로", 4], ["늦잠꾸러기", "1이나 2가 나오면 3칸 더", 6]
];
const GOAL = 30, RACES = 3, PTS = [4, 2, 1];
const has = (s, p, k) => s.racer[p] === k;
const owner = (s, k) => s.racer.indexOf(k);

function newRace(s, rng) {
  s.race++; s.pos = Array(s.n).fill(0); s.fin = []; s.racer = Array(s.n).fill(null);
  const pool = shuffle([...RACER.keys()], rng);
  s.offer = Array.from({ length: s.n }, () => pool.splice(0, 2));
  s.phase = "draft"; s.cur = (s.race - 1) % s.n; s.roll = null; s.rolled = false;
}
const alive = s => [...Array(s.n).keys()].filter(p => !s.fin.includes(p));
function nextTurn(s) {
  const al = alive(s);
  const need = Math.min(3, s.n - 1);
  if (s.fin.length >= need || !al.length) {
    s.fin.forEach((p, i) => { if (i < 3) s.score[p] += PTS[i]; });
    logPush(s, { k: "race", fin: [...s.fin] });
    if (s.race >= RACES) { s.phase = "end"; return; }
    return newRace(s, Math.random);
  }
  let c = s.cur;
  do c = (c + 1) % s.n; while (s.fin.includes(c));
  s.cur = c; s.phase = "roll"; s.roll = null; s.rolled = false;
}
function stepTo(s, q, k) {
  if (s.fin.includes(q)) return;
  s.pos[q] = Math.max(0, s.pos[q] + k);
  if (s.pos[q] >= GOAL) { s.pos[q] = GOAL; s.fin.push(q); logPush(s, { k: "fin", s: q, place: s.fin.length }); }
}
function steps(s, p, d, rng) {
  const notes = [];
  let k = d;
  if (has(s, p, 1)) { const al = alive(s); k = s.pos[p] <= Math.min(...al.map(q => s.pos[q])) && al.length > 1 ? 5 : 3; return { k, notes: ["거북이"] }; }
  if (has(s, p, 5) && d === 6) { const e = 1 + Math.floor(rng() * 6); k += e; notes.push(`혜성 +${e}`); }
  if (has(s, p, 0)) { k += 1; notes.push("+1"); }
  if (has(s, p, 9)) { k += d % 2 ? -1 : 2; notes.push(d % 2 ? "-1" : "+2"); }
  if (has(s, p, 11) && d <= 2) { k += 3; notes.push("+3"); }
  if (has(s, p, 7)) { const al = alive(s); if (al.length > 1 && s.pos[p] <= Math.min(...al.filter(q => q !== p).map(q => s.pos[q]))) { k *= 2; notes.push("두 배"); } }
  return { k: Math.max(0, k), notes };
}
function moveRacer(s, p, d, rng) {
  let { k, notes } = steps(s, p, d, rng);
  const al = alive(s), mx = Math.max(...al.map(q => s.pos[q]));
  const h = owner(s, 8);
  if (h >= 0 && h !== p && !s.fin.includes(h) && s.pos[p] === mx && al.filter(q => s.pos[q] === mx).length === 1 && k > 0) { k--; notes.push("방해 -1"); }
  const from = s.pos[p], to = from + k;
  const pig = owner(s, 2);
  const riders = pig >= 0 && pig !== p && !s.fin.includes(pig) && s.pos[pig] === from && from > 0 ? [pig] : [];
  stepTo(s, p, k);
  riders.forEach(q => { stepTo(s, q, k); notes.push(`업둥이 같이`); });
  const mg = owner(s, 6);
  if (mg >= 0 && mg !== p && !riders.includes(mg) && !s.fin.includes(mg) && s.pos[mg] > from && s.pos[mg] < to) { stepTo(s, mg, 1); notes.push("자석 끌림"); }
  if (has(s, p, 3) && !s.fin.includes(p)) for (const q of alive(s)) if (q !== p && s.pos[q] === s.pos[p]) { stepTo(s, q, -2); notes.push("밀치기"); }
  const ch = owner(s, 10);
  if (d === 6 && ch >= 0 && ch !== p) { stepTo(s, ch, 1); notes.push("응원단 +1"); }
  logPush(s, { k: "move", s: p, d, m: k, notes });
}

export default {
  id: "race", name: "괴짜 달리기", color: "#a3b23a", min: 2, max: 6, time: "20분", solo: 4,
  sub: "경주마다 이상한 재주를 가진 선수를 하나 골라 달려요. 재주끼리 부딪히는 세 경주",
  setup(n, rng) { const s = { n, race: 0, score: Array(n).fill(0), log: [] }; newRace(s, rng); return s; },
  view(s, seat) { const o = JSON.parse(JSON.stringify(s)); if (s.phase === "draft") o.racer = s.racer.map((r, p) => p === seat ? r : r == null ? null : -1); o.turn = this.turn(s); return o; },
  turn(s) {
    if (s.phase === "draft") return [...Array(s.n).keys()].filter(p => s.racer[p] == null);
    return s.phase === "end" ? [] : [s.cur];
  },
  apply(s, seat, a, ctx) {
    if (s.phase === "draft") {
      if (a.t !== "pick" || s.racer[seat] != null || !s.offer[seat].includes(a.r)) throw new Error("받은 두 선수 중에 골라요");
      s.racer[seat] = a.r;
      if (s.racer.every(r => r != null)) { s.phase = "roll"; logPush(s, { k: "start", race: s.race }); }
      return;
    }
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.phase === "roll" && a.t === "roll") {
      const d = 1 + Math.floor(ctx.rng() * 6);
      if (has(s, seat, 4) && !s.rolled) { s.roll = d; s.rolled = true; s.phase = "reroll"; return; }
      moveRacer(s, seat, d, ctx.rng); return nextTurn(s);
    }
    if (s.phase === "reroll" && (a.t === "keep" || a.t === "reroll")) {
      const d = a.t === "keep" ? s.roll : 1 + Math.floor(ctx.rng() * 6);
      moveRacer(s, seat, d, ctx.rng); return nextTurn(s);
    }
    throw new Error("지금은 할 수 없어요");
  },
  over(s) {
    if (s.phase !== "end") return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.score[b] - s.score[a]);
    return { text: "세 경주 점수가 가장 높은 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${s.score[p]}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 800 + rng() * 600 };
    if (s.phase === "draft") { const [x, y] = s.offer[seat]; return { ...d, a: { t: "pick", r: RACER[x][2] + rng() >= RACER[y][2] + rng() ? x : y } }; }
    if (s.phase === "reroll") return { ...d, a: { t: s.roll <= 3 ? "reroll" : "keep" } };
    return { ...d, a: { t: "roll" } };
  },
  badge(v, i) { return `${v.score[i]}점`; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.turn.includes(me);
    let say;
    if (v.phase === "end") say = "모든 경주가 끝났어요";
    else if (v.phase === "draft") say = v.racer[me] != null ? "골랐어요. 다른 사람을 기다려요" : `${v.race}번째 경주에 나갈 선수를 골라요`;
    else if (v.phase === "reroll" && my) say = `${v.roll}이 나왔어요. 행운아라서 한 번 다시 굴릴 수 있어요`;
    else say = my ? "주사위를 굴려요" : `${esc(n[v.cur])} 차례예요`;
    const lane = p => { const pc = v.pos[p] / GOAL * 100; return `<div class="lane${p === v.cur && v.phase !== "draft" ? " cur" : ""}" style="--s:${SEAT[p]}"><span class="nm">${esc(n[p])}${v.racer[p] >= 0 && v.racer[p] != null ? ` <i>${RACER[v.racer[p]][0]}</i>` : ""}</span><div class="trk"><b style="left:${pc}%">${v.fin.includes(p) ? v.fin.indexOf(p) + 1 : ""}</b></div><small>${v.pos[p]}</small></div>`; };
    el.innerHTML = `<div class="race">
      <p class="say">${say}<small>${v.race}/${RACES} 경주</small></p>
      ${v.phase === "draft" && v.racer[me] == null && me >= 0 ? `<div class="offer">${v.offer[me].map(r => `<button class="rcard" data-r="${r}"><b>${RACER[r][0]}</b><span>${RACER[r][1]}</span></button>`).join("")}</div>` : ""}
      <div class="lanes">${[...Array(v.n).keys()].map(lane).join("")}<div class="goal">결승 ${GOAL}칸</div></div>
      ${v.phase === "reroll" && my ? `<div class="acts">${dieHTML(v.roll)}<button class="kp">${v.roll} 쓰기</button><button class="ghost rr">다시 굴리기</button></div>` : my && v.phase === "roll" ? `<div class="acts"><button class="rl">굴리기</button></div>` : ""}
      ${v.phase !== "draft" ? `<div class="powers">${[...Array(v.n).keys()].map(p => v.racer[p] >= 0 ? `<p><b style="color:${SEAT[p]}">${RACER[v.racer[p]][0]}</b> ${RACER[v.racer[p]][1]}</p>` : "").join("")}</div>` : ""}
      <ol class="score">${v.score.map((x, p) => `<li style="--s:${SEAT[p]}"><b>${esc(n[p])}</b><span>${x}점</span></li>`).join("")}</ol>
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    el.querySelectorAll(".rcard").forEach(b => b.onclick = () => send({ t: "pick", r: +b.dataset.r }));
    el.querySelector(".rl")?.addEventListener("click", () => send({ t: "roll" }));
    el.querySelector(".kp")?.addEventListener("click", () => send({ t: "keep" }));
    el.querySelector(".rr")?.addEventListener("click", () => send({ t: "reroll" }));
  }
};
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "move": return `${b(x.s)} ${x.d} 굴림, ${x.m}칸${x.notes.length ? ` (${x.notes.join(", ")})` : ""}`;
    case "fin": return `${b(x.s)} ${x.place}등으로 들어옴`;
    case "start": return `${x.race}번째 경주 출발`;
    case "race": return `경주 끝: ${x.fin.slice(0, 3).map((p, i) => `${i + 1}등 ${esc(n[p])}`).join(", ")}`;
  }
  return "";
}
