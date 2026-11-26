// 엉뚱한 증인 — 증인만 정답 낱말을 안다. 정답과 동떨어진 힌트 둘 중 하나를 골라 주면, 나머지 탐정들이 왜 그걸 골랐을지 거꾸로 짐작해 후보 여섯 중 정답을 짚는 협력 게임 (3~10명)
// 판마다 증인이 바뀜. 맞힌 판 수가 모두의 점수. 말로 의논하는 게임이라 봇 없음.
import { esc, shuffle, SEAT, logPush } from "../lib.js";
import { WORDS } from "./words.js";

const ROUNDS = 8;
function deal(s, rng) {
  const pool = shuffle([...WORDS], rng);
  s.cands = pool.splice(0, 6); s.ans = Math.floor(rng() * 6); s.hints = pool.splice(0, 2);
  s.hint = null; s.votes = {}; s.phase = "hint"; s.result = null;
}

export default {
  id: "odd", name: "엉뚱한 증인", color: "#2a9d9b", min: 3, max: 10, time: "15분", party: true,
  sub: "증인만 정답을 알아요. 엉뚱한 힌트 둘 중 하나를 주면 탐정들이 거꾸로 짐작해 맞혀요",
  setup(n, rng) { const s = { n, round: 1, wit: 0, score: 0, log: [] }; deal(s, rng); return s; },
  view(s) { return { n: s.n, round: s.round, wit: s.wit, score: s.score, cands: s.cands, hint: s.hint, phase: s.phase, voted: Object.keys(s.votes).map(Number), result: s.result, log: s.log, turn: this.turn(s), rounds: ROUNDS }; },
  secret(s, seat) { return seat === s.wit && s.phase === "hint" ? { ans: s.ans, hints: s.hints } : seat === s.wit ? { ans: s.ans } : {}; },
  turn(s) {
    if (s.phase === "hint") return [s.wit];
    if (s.phase === "guess") return [...Array(s.n).keys()].filter(p => p !== s.wit && !(p in s.votes));
    if (s.phase === "show") return [s.wit];
    return [];
  },
  apply(s, seat, a, ctx) {
    if (s.phase === "hint") {
      if (seat !== s.wit || a.t !== "hint" || !(a.i === 0 || a.i === 1)) throw new Error("증인이 힌트 둘 중 하나를 골라요");
      s.hint = s.hints[a.i]; s.phase = "guess"; return;
    }
    if (s.phase === "guess") {
      if (seat === s.wit || a.t !== "vote" || !(a.i >= 0 && a.i < 6)) throw new Error("탐정이 후보를 골라요");
      s.votes[seat] = a.i;
      if (Object.keys(s.votes).length < s.n - 1) return;
      const cnt = Array(6).fill(0); Object.values(s.votes).forEach(i => cnt[i]++);
      const pick = cnt.indexOf(Math.max(...cnt)), ok = pick === s.ans;
      if (ok) s.score++;
      s.result = { pick, ans: s.ans, ok, cnt }; s.phase = "show";
      logPush(s, { round: s.round, hint: s.hint, ans: s.cands[s.ans], pick: s.cands[pick], ok });
      return;
    }
    if (s.phase === "show") {
      if (seat !== s.wit || a.t !== "next") throw new Error("증인이 다음 판으로 넘겨요");
      if (s.round >= ROUNDS) { s.phase = "end"; return; }
      s.round++; s.wit = (s.wit + 1) % s.n; deal(s, ctx.rng); return;
    }
    throw new Error("판이 끝났어요");
  },
  over(s) { return s.phase === "end" ? { text: `${ROUNDS}판 중 ${s.score}판 맞힘`, rank: [...Array(s.n).keys()].map(p => [p, `같이 ${s.score}점`]) } : null; },
  bot(s, seat, rng) {
    if (s.phase === "hint") return { delay: 500, a: { t: "hint", i: Math.floor(rng() * 2) } };
    if (s.phase === "guess") return { delay: 500, a: { t: "vote", i: Math.floor(rng() * 6) } };
    if (s.phase === "show") return { delay: 400, a: { t: "next" } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, amW = v.wit === me;
    let say;
    if (v.phase === "end") say = "판이 끝났어요";
    else if (v.phase === "hint") say = amW ? "정답은 노란 칸이에요. 힌트 둘 중 그나마 이어질 것 같은 쪽을 골라요" : `증인 ${esc(n[v.wit])}이(가) 힌트를 고르는 중`;
    else if (v.phase === "guess") say = amW ? "탐정들이 의논하는 중. 증인은 말하면 안 돼요" : me in Object.fromEntries(v.voted.map(x => [x, 1])) ? "골랐어요. 다른 탐정을 기다려요" : `힌트 "${esc(v.hint)}". 정답은 뭘까요?`;
    else say = v.result.ok ? "맞혔어요!" : `아쉬워요. 정답은 ${esc(v.cands[v.result.ans])}`;
    const canVote = v.phase === "guess" && !amW && me >= 0 && !v.voted.includes(me);
    el.innerHTML = `<div class="odd">
      <p class="say">${say}<small>${v.round}/${v.rounds}판, 맞힘 ${v.score}</small></p>
      ${v.hint ? `<div class="topic"><small>증인의 힌트</small><b>${esc(v.hint)}</b></div>` : ""}
      ${amW && v.phase === "hint" && v.hints ? `<div class="acts">${v.hints.map((h, i) => `<button data-h="${i}">${esc(h)}</button>`).join("")}</div>` : ""}
      <div class="cands">${v.cands.map((c, i) => `<button class="cd${v.ans === i ? " ans" : ""}${v.result && v.result.ans === i ? " right" : ""}${v.result && v.result.pick === i && !v.result.ok ? " wrong" : ""}" data-i="${i}" ${canVote ? "" : "disabled"}>${esc(c)}${v.result ? `<small>${v.result.cnt[i] || ""}</small>` : ""}</button>`).join("")}</div>
      ${v.phase === "show" && amW ? `<div class="acts"><button class="nx">다음 판</button></div>` : ""}
      <p class="dim small">증인 ${esc(n[v.wit])}. 탐정끼리 소리 내어 의논해요.</p>
      <ol class="log">${v.log.map(x => `<li>${x.round}판: "${esc(x.hint)}" → ${x.ok ? `${esc(x.ans)} 맞힘` : `${esc(x.pick)} 짚음, 정답 ${esc(x.ans)}`}</li>`.replace(" → ", ", ")).join("")}</ol>
    </div>`;
    el.querySelectorAll("[data-h]").forEach(b => b.onclick = () => send({ t: "hint", i: +b.dataset.h }));
    el.querySelectorAll(".cd:not([disabled])").forEach(b => b.onclick = () => send({ t: "vote", i: +b.dataset.i }));
    el.querySelector(".nx")?.addEventListener("click", () => send({ t: "next" }));
  }
};
