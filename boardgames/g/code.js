// 암호 단어 — 두 팀의 대장만 어느 낱말이 우리 팀인지 안다. 대장이 낱말 하나와 숫자 하나로 힌트를 주면 팀원이 짚는다 (4~8명)
// 우리 낱말을 먼저 다 찾으면 이김. 암살자 낱말을 짚으면 바로 짐. 말로 하는 게임이라 봇은 없음.
import { esc, shuffle, SEAT, logPush } from "../lib.js";
import { WORDS } from "./words.js";

const TEAM = [["빨강 팀", "#c8321f"], ["파랑 팀", "#2a64b8"]];
const team = p => p % 2;

export default {
  id: "code", name: "암호 단어", color: "#d26a2e", min: 4, max: 8, time: "15분", party: true,
  sub: "두 팀 대장만 정답 지도를 봐요. 낱말 하나와 숫자 하나로 힌트를 주고 팀원이 짚어요",
  setup(n, rng) {
    const words = shuffle([...WORDS], rng).slice(0, 25);
    const key = shuffle([...Array(9).fill(0), ...Array(8).fill(1), ...Array(7).fill(2), 3], rng);
    return { n, words, key, open: Array(25).fill(false), spy: [0, 1], turn: 0, phase: "clue", clue: null, left: 0, guessed: 0, win: null, why: "", log: [] };
  },
  view(s, seat) {
    const spy = s.spy.includes(seat) || s.win != null;
    return { n: s.n, words: s.words, open: s.open, key: s.key.map((k, i) => spy || s.open[i] ? k : null), spy: s.spy, team: s.turn, phase: s.phase, clue: s.clue, left: s.left, guessed: s.guessed, win: s.win, why: s.why, log: s.log,
      remain: [0, 1].map(t => s.key.filter((k, i) => k === t && !s.open[i]).length), turn: this.turn(s) };
  },
  turn(s) {
    if (s.win != null) return [];
    if (s.phase === "clue") return [s.spy[s.turn]];
    return [...Array(s.n).keys()].filter(p => team(p) === s.turn && !s.spy.includes(p));
  },
  apply(s, seat, a) {
    if (s.win != null) throw new Error("판이 끝났어요");
    if (s.phase === "clue") {
      if (seat !== s.spy[s.turn] || a.t !== "clue") throw new Error("우리 팀 대장이 힌트를 주는 중이에요");
      const w = String(a.w || "").trim().slice(0, 12), k = a.n | 0;
      if (!w || /\s/.test(w)) throw new Error("힌트는 띄어쓰기 없는 낱말 하나예요");
      if (s.words.some((x, i) => !s.open[i] && (x === w || x.includes(w) || w.includes(x)))) throw new Error("판에 있는 낱말이나 그 일부는 힌트로 못 써요");
      if (k < 1 || k > 9) throw new Error("숫자는 1~9");
      s.clue = { w, n: k }; s.left = k + 1; s.guessed = 0; s.phase = "guess"; logPush(s, { k: "clue", t: s.turn, w, n: k }); return;
    }
    if (team(seat) !== s.turn || s.spy.includes(seat)) throw new Error("우리 팀 차례가 아니에요");
    if (a.t === "stop") { if (!s.guessed) throw new Error("하나는 짚어야 해요"); logPush(s, { k: "stop", t: s.turn }); return this.swap(s); }
    if (a.t !== "guess" || !(a.i >= 0 && a.i < 25) || s.open[a.i]) throw new Error("남은 낱말을 짚어요");
    s.open[a.i] = true; s.guessed++;
    const k = s.key[a.i];
    logPush(s, { k: "guess", s: seat, t: s.turn, w: s.words[a.i], r: k });
    if (k === 3) { s.win = 1 - s.turn; s.why = "암살자를 짚음"; return; }
    for (const t of [0, 1]) if (s.key.every((x, i) => x !== t || s.open[i])) { s.win = t; s.why = "낱말을 다 찾음"; return; }
    if (k !== s.turn) return this.swap(s);
    if (--s.left <= 0) this.swap(s);
  },
  swap(s) { s.turn = 1 - s.turn; s.phase = "clue"; s.clue = null; s.left = 0; s.guessed = 0; },
  over(s) {
    if (s.win == null) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => (team(b) === s.win) - (team(a) === s.win));
    return { text: `${TEAM[s.win][0]} 승리 (${s.why})`, rank: o.map(p => [p, `${TEAM[team(p)][0]}${s.spy.includes(p) ? " 대장" : ""}, ${team(p) === s.win ? "이김" : "짐"}`]) };
  },
  // 시험용 봇(방에서는 넣을 수 없음)
  bot(s, seat, rng) {
    const d = { delay: 600 };
    if (s.phase === "clue") return { ...d, a: { t: "clue", w: "힌트" + Math.floor(rng() * 100), n: 1 + Math.floor(rng() * 2) } };
    const left = s.open.map((o, i) => o ? -1 : i).filter(i => i >= 0);
    if (s.guessed && rng() < .3) return { ...d, a: { t: "stop" } };
    return { ...d, a: { t: "guess", i: left[Math.floor(rng() * left.length)] } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.turn.includes(me), amSpy = v.spy.includes(me), myTeam = me >= 0 ? team(me) : null;
    let say;
    if (v.win != null) say = "판이 끝났어요";
    else if (v.phase === "clue") say = my ? "우리 팀 낱말을 이어 줄 힌트 낱말 하나와 숫자를 적어요" : `${TEAM[v.team][0]} 대장 ${esc(n[v.spy[v.team]])}이(가) 힌트를 생각하는 중`;
    else say = my ? `힌트 "${esc(v.clue.w)} ${v.clue.n}". 낱말을 짚어요 (${v.left}번 남음)` : `${TEAM[v.team][0]}이(가) "${esc(v.clue.w)} ${v.clue.n}"로 짚는 중`;
    const col = k => k == null ? "" : ["r", "b", "x", "a"][k];
    el.innerHTML = `<div class="code">
      ${me >= 0 ? `<div class="myteam" style="--t:${TEAM[myTeam][1]}">나는 ${TEAM[myTeam][0]}${amSpy ? " 대장 (정답 지도가 보여요)" : " 팀원"}</div>` : ""}
      <p class="say">${say}</p>
      <div class="cscore"><span style="--t:${TEAM[0][1]}">빨강 남은 ${v.remain[0]}</span><span style="--t:${TEAM[1][1]}">파랑 남은 ${v.remain[1]}</span></div>
      <div class="grid5">${v.words.map((w, i) => `<button class="cw ${col(v.key[i])}${v.open[i] ? " op" : ""}" data-i="${i}" ${my && v.phase === "guess" && !v.open[i] ? "" : "disabled"}>${esc(w)}</button>`).join("")}</div>
      ${my && v.phase === "clue" ? `<form class="clue"><input name="w" maxlength="12" placeholder="힌트 낱말" autocomplete="off" required><select name="n">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<option>${k}</option>`).join("")}</select><button>힌트 주기</button></form>` : ""}
      ${my && v.phase === "guess" && v.guessed ? `<div class="acts"><button class="ghost stop">여기까지</button></div>` : ""}
      <div class="teams">${[0, 1].map(t => `<p style="--t:${TEAM[t][1]}"><b>${TEAM[t][0]}</b> ${[...Array(v.n).keys()].filter(p => team(p) === t).map(p => esc(n[p]) + (v.spy.includes(p) ? "(대장)" : "")).join(", ")}</p>`).join("")}</div>
      <p class="dim small">말로 의논하는 게임이에요. 대장은 힌트 말고 다른 말을 하면 안 돼요.</p>
      <ol class="log">${v.log.map(x => `<li>${x.k === "clue" ? `<b style="color:${TEAM[x.t][1]}">${TEAM[x.t][0]}</b> 힌트 "${esc(x.w)} ${x.n}"` : x.k === "guess" ? `${esc(n[x.s])}: ${esc(x.w)} (${["빨강", "파랑", "중립", "암살자"][x.r]})` : `${TEAM[x.t][0]} 멈춤`}</li>`).join("")}</ol>
    </div>`;
    el.querySelectorAll(".grid5 .cw:not([disabled])").forEach(b => b.onclick = () => send({ t: "guess", i: +b.dataset.i }));
    el.querySelector(".stop")?.addEventListener("click", () => send({ t: "stop" }));
    el.querySelector(".clue")?.addEventListener("submit", e => { e.preventDefault(); const f = new FormData(e.target); send({ t: "clue", w: f.get("w"), n: +f.get("n") }); });
  }
};
