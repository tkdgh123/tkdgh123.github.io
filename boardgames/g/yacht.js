// 주사위 족보 — 주사위 다섯 개를 세 번까지 굴려 족보 칸 12개를 채우는 내기 (2~6명)
// 위 칸(1~6) 합이 63 이상이면 35점 더. 아래 칸: 아무거나(합), 넷 같음(합), 셋+둘(합), 작은 줄 15, 큰 줄 30, 다섯 같음 50.
import { esc, SEAT, dieHTML, logPush, nameB } from "../lib.js";

export const CAT = [["1", "1 모으기"], ["2", "2 모으기"], ["3", "3 모으기"], ["4", "4 모으기"], ["5", "5 모으기"], ["6", "6 모으기"],
  ["ch", "아무거나"], ["4k", "넷 같음"], ["fh", "셋+둘"], ["ss", "작은 줄"], ["ls", "큰 줄"], ["ya", "다섯 같음"]];
const BASE = [2, 5, 8, 11, 14, 17, 22, 13, 15, 12, 18, 14];
export function score(d, c) {
  const cnt = [0, 0, 0, 0, 0, 0, 0]; d.forEach(x => cnt[x]++);
  const sum = d.reduce((a, b) => a + b, 0), mx = Math.max(...cnt);
  const has = s => s.every(x => cnt[x]);
  switch (c) {
    case 6: return sum;
    case 7: return mx >= 4 ? sum : 0;
    case 8: return (cnt.includes(3) && cnt.includes(2)) || mx === 5 ? sum : 0;
    case 9: return has([1, 2, 3, 4]) || has([2, 3, 4, 5]) || has([3, 4, 5, 6]) ? 15 : 0;
    case 10: return has([1, 2, 3, 4, 5]) || has([2, 3, 4, 5, 6]) ? 30 : 0;
    case 11: return mx === 5 ? 50 : 0;
    default: return cnt[c + 1] * (c + 1);
  }
}
const upper = sh => sh.slice(0, 6).reduce((a, b) => a + (b ?? 0), 0);
export const total = sh => sh.reduce((a, b) => a + (b ?? 0), 0) + (upper(sh) >= 63 ? 35 : 0);

export default {
  id: "yacht", name: "주사위 족보", color: "#8a3b2b", min: 2, max: 6, time: "20분", solo: 2,
  sub: "주사위 다섯 개를 세 번까지 굴려 족보 열두 칸을 채워요. 다섯 개가 같으면 50점",
  setup(n) { return { n, cur: 0, dice: [1, 1, 1, 1, 1], keep: [false, false, false, false, false], rolls: 0, sheet: Array.from({ length: n }, () => Array(12).fill(null)), log: [], done: false }; },
  view(s) { return { ...JSON.parse(JSON.stringify(s)), totals: s.sheet.map(total), turn: this.turn(s) }; },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (a.t === "roll") {
      if (s.rolls >= 3) throw new Error("세 번 다 굴렸어요");
      if (Array.isArray(a.keep) && s.rolls > 0) s.keep = a.keep.map(Boolean).slice(0, 5);
      else s.keep = [false, false, false, false, false];
      s.dice = s.dice.map((d, i) => s.keep[i] ? d : 1 + Math.floor(ctx.rng() * 6));
      s.rolls++; return;
    }
    if (a.t === "pick") {
      if (!s.rolls) throw new Error("먼저 굴려요");
      const c = a.c | 0;
      if (c < 0 || c > 11 || s.sheet[seat][c] != null) throw new Error("빈 칸을 골라요");
      const v = score(s.dice, c);
      s.sheet[seat][c] = v; logPush(s, { s: seat, c, v, d: [...s.dice] });
      s.rolls = 0; s.keep = [false, false, false, false, false];
      if (s.sheet.every(r => r.every(x => x != null))) { s.done = true; return; }
      s.cur = (s.cur + 1) % s.n; return;
    }
    throw new Error("모르는 행동이에요");
  },
  over(s) {
    if (!s.done) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => total(s.sheet[b]) - total(s.sheet[a]));
    return { text: "족보를 가장 잘 채운 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${total(s.sheet[p])}점`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 800 + rng() * 500 }, sh = s.sheet[seat];
    const open = CAT.map((_, c) => c).filter(c => sh[c] == null);
    const best = dice => Math.max(...open.map(c => score(dice, c) - BASE[c] + (c < 6 && score(dice, c) >= 3 * (c + 1) ? 4 : 0)));
    if (!s.rolls) return { ...d, a: { t: "roll" } };
    if (s.rolls < 3) {
      const nowV = best(s.dice);
      let bk = null, bv = nowV + 1.5;
      for (let m = 0; m < 32; m++) {
        const keep = [0, 1, 2, 3, 4].map(i => !!(m >> i & 1));
        let tot = 0;
        for (let k = 0; k < 40; k++) tot += best(s.dice.map((x, i) => keep[i] ? x : 1 + Math.floor(rng() * 6)));
        if (tot / 40 > bv) { bv = tot / 40; bk = keep; }
      }
      if (bk) return { ...d, a: { t: "roll", keep: bk } };
    }
    let bc = open[0], bs = -1e9;
    for (const c of open) { const v = score(s.dice, c) - BASE[c] + (c < 6 && score(s.dice, c) >= 3 * (c + 1) ? 4 : 0); if (v > bs) { bs = v; bc = c; } }
    return { ...d, a: { t: "pick", c: bc } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me && !v.done;
    if (!my || v.rolls === 0) UI.keep = [false, false, false, false, false];
    el.innerHTML = `<div class="yacht">
      <p class="say">${v.done ? "판이 끝났어요" : my ? (v.rolls ? `${v.rolls}번 굴렸어요. 남길 주사위를 누르고 다시 굴리거나 칸을 골라요` : "주사위를 굴려요") : `${esc(n[v.cur])} 차례예요`}</p>
      <div class="ydice">${v.rolls ? v.dice.map((x, i) => dieHTML(x, UI.keep[i] ? "kept" : "", `data-i="${i}"`)).join("") : `<span class="dim">아직 안 굴림</span>`}</div>
      ${my ? `<div class="acts"><button class="roll" ${v.rolls >= 3 ? "disabled" : ""}>${v.rolls ? `다시 굴리기 (${3 - v.rolls}번 남음)` : "굴리기"}</button></div>` : ""}
      <div class="ytab"><table><tr><th></th>${v.sheet.map((_, p) => `<th style="color:${SEAT[p]}">${esc(n[p])}</th>`).join("")}</tr>
      ${CAT.map(([, name], c) => `<tr${c === 6 ? ' class="gap"' : ""}><td>${name}</td>${v.sheet.map((r, p) => {
        const can = my && p === me && r[c] == null && v.rolls;
        return `<td>${r[c] != null ? r[c] : can ? `<button class="yc" data-c="${c}">${score(v.dice, c)}</button>` : ""}</td>`;
      }).join("")}</tr>${c === 5 ? `<tr class="sub"><td>위 칸 합 (63 넘으면 +35)</td>${v.sheet.map(r => `<td>${upper(r)}</td>`).join("")}</tr>` : ""}`).join("")}
      <tr class="tot"><td>합계</td>${v.totals.map(t => `<td>${t}</td>`).join("")}</tr></table></div>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${CAT[x.c][1]} ${x.v}점 (${x.d.join(" ")})</li>`).join("")}</ol>
    </div>`;
    if (my && v.rolls && v.rolls < 3) el.querySelectorAll(".ydice .die").forEach(b => b.onclick = () => { UI.keep[+b.dataset.i] = !UI.keep[+b.dataset.i]; this.render(el, v, me, send, ui); });
    el.querySelector(".roll")?.addEventListener("click", () => send({ t: "roll", keep: UI.keep }));
    el.querySelectorAll(".yc").forEach(b => b.onclick = () => send({ t: "pick", c: +b.dataset.c }));
  }
};
const UI = { keep: [false, false, false, false, false] };
