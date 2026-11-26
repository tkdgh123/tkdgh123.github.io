// 성의 배신자 — 몰래 기사 편과 배신자 편으로 나뉘어, 원정대를 뽑고 투표하고, 원정 성공과 실패를 몰래 내는 정체 숨기기 게임 (5~10명)
// 기사 편은 원정 셋을 성공시키면 이기지만, 그때 암살자가 예언자를 맞히면 뒤집힌다. 원정대 투표가 다섯 번 연달아 부결되면 배신자 편이 이긴다.
import { esc, shuffle, pick, SEAT, logPush, nameB } from "../lib.js";

const EVIL = { 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 4 };
const SIZE = { 5: [2, 3, 2, 3, 3], 6: [2, 3, 4, 3, 4], 7: [2, 3, 3, 4, 4], 8: [3, 4, 4, 5, 5], 9: [3, 4, 4, 5, 5], 10: [3, 4, 4, 5, 5] };
const RN = { seer: "예언자", knight: "기사", killer: "암살자", spy: "첩자" };
const bad = r => r === "killer" || r === "spy";
const needFails = (s, q) => s.n >= 7 && q === 3 ? 2 : 1;

export default {
  id: "castle", name: "성의 배신자", color: "#5b6b7a", min: 5, max: 10, time: "30분", solo: 6,
  sub: "몰래 기사 편과 배신자 편으로 나뉘어 원정대를 뽑고 투표해요. 말로 속이고 밝혀내는 게임",
  setup(n, rng) {
    const e = EVIL[n], roles = ["seer", ...Array(n - e - 1).fill("knight"), "killer", ...Array(e - 1).fill("spy")];
    shuffle(roles, rng);
    return { n, role: roles, leader: Math.floor(rng() * n), q: 0, res: [], rejects: 0, phase: "pick", team: [], votes: {}, lastVote: null, cards: {}, lastQuest: null, win: null, killed: null, log: [] };
  },
  view(s, seat) {
    const my = s.role[seat];
    const sees = s.role.map((r, p) => {
      if (s.phase === "end" || p === seat) return r;
      if (my && bad(my) && bad(r)) return "evil";
      if (my === "seer" && bad(r)) return "evil";
      return null;
    });
    return { n: s.n, leader: s.leader, q: s.q, res: s.res, rejects: s.rejects, phase: s.phase, team: s.team, voted: Object.keys(s.votes).map(Number), lastVote: s.lastVote,
      played: Object.keys(s.cards).map(Number), lastQuest: s.lastQuest, win: s.win, killed: s.killed, log: s.log, sees, size: SIZE[s.n], fails2: s.n >= 7, myVote: s.votes[seat], turn: this.turn(s) };
  },
  turn(s) {
    switch (s.phase) {
      case "pick": return [s.leader];
      case "vote": return [...Array(s.n).keys()].filter(p => !(p in s.votes));
      case "quest": return s.team.filter(p => !(p in s.cards));
      case "kill": return [s.role.indexOf("killer")];
    }
    return [];
  },
  apply(s, seat, a) {
    if (s.phase === "pick") {
      if (seat !== s.leader || a.t !== "team") throw new Error("대장이 원정대를 고르는 중이에요");
      const t = [...new Set(a.team)].filter(p => p >= 0 && p < s.n);
      if (t.length !== SIZE[s.n][s.q]) throw new Error(`원정대는 ${SIZE[s.n][s.q]}명이에요`);
      s.team = t; s.votes = {}; s.phase = "vote"; logPush(s, { k: "team", s: seat, team: t }); return;
    }
    if (s.phase === "vote") {
      if (a.t !== "vote" || seat in s.votes) throw new Error("이미 투표했어요");
      s.votes[seat] = !!a.yes;
      if (Object.keys(s.votes).length < s.n) return;
      const yes = Object.values(s.votes).filter(Boolean).length, pass = yes * 2 > s.n;
      s.lastVote = { team: s.team, votes: { ...s.votes }, pass };
      logPush(s, { k: "vote", yes, no: s.n - yes, pass });
      if (pass) { s.rejects = 0; s.cards = {}; s.phase = "quest"; return; }
      s.rejects++;
      if (s.rejects >= 5) { s.win = "evil"; s.why = "투표 다섯 번 부결"; s.phase = "end"; return; }
      s.leader = (s.leader + 1) % s.n; s.phase = "pick"; s.team = []; return;
    }
    if (s.phase === "quest") {
      if (a.t !== "quest" || !s.team.includes(seat) || seat in s.cards) throw new Error("원정대만 카드를 내요");
      if (!a.ok && !bad(s.role[seat])) throw new Error("기사 편은 성공만 낼 수 있어요");
      s.cards[seat] = !!a.ok;
      if (Object.keys(s.cards).length < s.team.length) return;
      const fails = Object.values(s.cards).filter(x => !x).length, ok = fails < needFails(s, s.q);
      s.res.push(ok); s.lastQuest = { q: s.q, fails, ok }; logPush(s, { k: "quest", q: s.q, fails, ok });
      s.q++; s.team = []; s.cards = {};
      const wins = s.res.filter(Boolean).length, losses = s.res.length - wins;
      if (losses >= 3) { s.win = "evil"; s.why = "원정 세 번 실패"; s.phase = "end"; return; }
      if (wins >= 3) { s.phase = "kill"; return; }
      s.leader = (s.leader + 1) % s.n; s.phase = "pick"; return;
    }
    if (s.phase === "kill") {
      if (s.role[seat] !== "killer" || a.t !== "kill" || !(a.p >= 0 && a.p < s.n) || bad(s.role[a.p])) throw new Error("암살자가 기사 편 한 명을 골라요");
      s.killed = a.p; s.win = s.role[a.p] === "seer" ? "evil" : "good"; s.why = s.win === "evil" ? "암살자가 예언자를 맞힘" : "예언자를 지켜 냄";
      s.phase = "end"; logPush(s, { k: "kill", s: seat, p: a.p, hit: s.win === "evil" }); return;
    }
    throw new Error("지금은 할 수 없어요");
  },
  over(s) {
    if (s.phase !== "end") return null;
    const won = p => (s.win === "evil") === bad(s.role[p]);
    const o = [...Array(s.n).keys()].sort((a, b) => won(b) - won(a));
    return { text: `${s.win === "evil" ? "배신자 편" : "기사 편"} 승리 (${s.why})`, rank: o.map(p => [p, `${RN[s.role[p]]}, ${won(p) ? "이김" : "짐"}`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 1200 + rng() * 1200 }, r = s.role[seat], evil = bad(r);
    // 실패한 원정에 갔던 사람을 의심
    const sus = Array(s.n).fill(0);
    s.log.forEach(x => { if (x.k === "quest" && !x.ok) { const t = s.log.find(y => y.k === "team" && s.log.indexOf(y) > s.log.indexOf(x)); t?.team.forEach(p => sus[p]++); } });
    if (s.phase === "pick") {
      const size = SIZE[s.n][s.q], others = [...Array(s.n).keys()].filter(p => p !== seat);
      let team;
      if (evil) team = [seat, ...shuffle(others.filter(p => !bad(s.role[p])), rng)].slice(0, size);
      else if (r === "seer") team = [seat, ...shuffle(others.filter(p => !bad(s.role[p])), rng)].slice(0, size);
      else team = [seat, ...others.sort((a, b) => sus[a] - sus[b] + (rng() - .5))].slice(0, size);
      return { ...d, a: { t: "team", team } };
    }
    if (s.phase === "vote") {
      const hasBad = s.team.some(p => bad(s.role[p]));
      let yes;
      if (evil) yes = hasBad || s.rejects >= 3;
      else if (r === "seer") yes = !hasBad || s.rejects >= 4;
      else yes = s.team.includes(seat) || s.team.reduce((a, p) => a + sus[p], 0) === 0 || s.rejects >= 4;
      if (rng() < .1) yes = !yes;
      return { ...d, a: { t: "vote", yes } };
    }
    if (s.phase === "quest") return { ...d, a: { t: "quest", ok: !evil || (s.q === 0 && rng() < .4) } };
    if (s.phase === "kill") { const good = [...Array(s.n).keys()].filter(p => !bad(s.role[p])); return { ...d, a: { t: "kill", p: pick(good, rng) } }; }
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.turn.includes(me), myR = v.sees[me];
    if (v.phase !== "pick" || !my) UI.team = [];
    const size = v.size[Math.min(v.q, 4)];
    let say;
    if (v.phase === "end") say = "판이 끝났어요";
    else if (v.phase === "pick") say = my ? `원정대 ${size}명을 골라요 (나도 넣을 수 있어요)` : `대장 ${esc(n[v.leader])}이(가) 원정대를 고르는 중`;
    else if (v.phase === "vote") say = v.myVote != null ? "투표했어요. 다른 사람을 기다려요" : "이 원정대에 찬성하나요?";
    else if (v.phase === "quest") say = my ? "원정 카드를 몰래 내요" : "원정대가 카드를 내는 중";
    else say = my ? "기사 편이 원정 셋을 성공했어요. 예언자로 보이는 사람을 골라요" : "암살자가 예언자를 찾는 중";
    el.innerHTML = `<div class="castle">
      ${me >= 0 && myR ? `<div class="myrole ${bad(myR) ? "evil" : ""}">나는 <b>${RN[myR]}</b>. ${myR === "seer" ? "배신자 편이 누군지 알아요. 들키지 않게 도와요" : myR === "knight" ? "원정 셋을 성공시켜요" : myR === "killer" ? "원정을 망치거나, 끝에 예언자를 맞혀요" : "원정을 몰래 망쳐요"}</div>` : ""}
      <p class="say">${say}</p>
      <div class="quests">${v.size.map((k, i) => `<span class="${v.res[i] === true ? "ok" : v.res[i] === false ? "no" : i === v.q ? "now" : ""}"><b>${k}</b>명${v.fails2 && i === 3 ? "<small>실패 둘</small>" : ""}</span>`).join("")}<span class="rej">부결 ${v.rejects}/5</span></div>
      <div class="knights">${[...Array(v.n).keys()].map(p => { const sr = v.sees[p]; const inT = v.team.includes(p) || UI.team.includes(p);
        return `<button class="kn${inT ? " in" : ""}${p === v.leader ? " lead" : ""}" data-p="${p}" ${v.phase === "pick" && my ? "" : "disabled"} style="--s:${SEAT[p]}">
          <b>${esc(n[p])}</b>${p === v.leader ? "<i>대장</i>" : ""}${sr && p !== me ? `<span class="${sr === "evil" || bad(sr) ? "ev" : ""}">${sr === "evil" ? "배신자 편" : RN[sr]}</span>` : ""}
          ${v.lastVote ? `<small>${v.lastVote.votes[p] ? "찬성" : "반대"}</small>` : ""}${v.phase === "vote" && v.voted.includes(p) ? "<small>투표함</small>" : ""}${v.phase === "quest" && v.played.includes(p) ? "<small>냄</small>" : ""}</button>`; }).join("")}</div>
      <div class="acts">
        ${v.phase === "pick" && my ? `<button class="go" ${UI.team.length === size ? "" : "disabled"}>이 ${UI.team.length}명으로</button>` : ""}
        ${v.phase === "vote" && v.myVote == null && me >= 0 ? `<button data-yes="1">찬성</button><button class="ghost" data-yes="0">반대</button>` : ""}
        ${v.phase === "quest" && my ? `<button data-ok="1">성공</button>${bad(myR) ? `<button class="ghost" data-ok="0">실패</button>` : ""}` : ""}
      </div>
      ${v.lastQuest ? `<p class="dim">지난 원정: 실패 카드 ${v.lastQuest.fails}장, ${v.lastQuest.ok ? "성공" : "실패"}</p>` : ""}
      ${v.phase === "kill" && my ? `<div class="acts">${[...Array(v.n).keys()].filter(p => !(v.sees[p] === "evil" || bad(v.sees[p] || ""))).map(p => `<button data-kill="${p}" style="background:${SEAT[p]}">${esc(n[p])}</button>`).join("")}</div>` : ""}
      <p class="dim small">말로 하는 게임이에요. 같이 있거나 통화하면서 해요.</p>
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll(".kn:not([disabled])").forEach(b => b.onclick = () => { const p = +b.dataset.p; UI.team = UI.team.includes(p) ? UI.team.filter(x => x !== p) : UI.team.length < size ? [...UI.team, p] : UI.team; re(); });
    el.querySelector(".go")?.addEventListener("click", () => { const team = UI.team; UI.team = []; send({ t: "team", team }); });
    el.querySelectorAll("[data-yes]").forEach(b => b.onclick = () => send({ t: "vote", yes: b.dataset.yes === "1" }));
    el.querySelectorAll("[data-ok]").forEach(b => b.onclick = () => send({ t: "quest", ok: b.dataset.ok === "1" }));
    el.querySelectorAll("[data-kill]").forEach(b => b.onclick = () => send({ t: "kill", p: +b.dataset.kill }));
  }
};
const UI = { team: [] };
function line(x, n) {
  switch (x.k) {
    case "team": return `${nameB(n, x.s)}의 원정대: ${x.team.map(p => esc(n[p])).join(", ")}`;
    case "vote": return `투표 찬성 ${x.yes}, 반대 ${x.no}: ${x.pass ? "통과" : "부결"}`;
    case "quest": return `${x.q + 1}번째 원정 ${x.ok ? "성공" : "실패"} (실패 카드 ${x.fails})`;
    case "kill": return `암살자 ${nameB(n, x.s)}이(가) ${esc(n[x.p])}을(를) 지목, ${x.hit ? "예언자였어요" : "예언자가 아니었어요"}`;
  }
  return "";
}
