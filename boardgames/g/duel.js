// 해적선 결투 — 선장, 갑판장, 해적, 배신자가 서로 정체를 숨기고 쏘는 카드 게임 (4~7명)
// 선장만 정체를 밝힌다. 선장 편은 해적과 배신자를 모두 쓰러뜨리면, 해적은 선장을 쓰러뜨리면, 배신자는 마지막 혼자 남으면 이김.
// 차례: 두 장 뽑고 원하는 만큼 낸 뒤, 체력보다 많은 카드는 버림. 쏘기는 차례에 한 번(연발총이면 여러 번).
import { esc, shuffle, pick, SEAT, logPush, nameB } from "../lib.js";

const ROLE = { cap: ["선장", "#c8321f"], mate: ["갑판장", "#2f6fb0"], pir: ["해적", "#24272c"], trait: ["배신자", "#3c8d5a"] };
const ROLES = { 4: ["cap", "trait", "pir", "pir"], 5: ["cap", "trait", "pir", "pir", "mate"], 6: ["cap", "trait", "pir", "pir", "pir", "mate"], 7: ["cap", "trait", "pir", "pir", "pir", "mate", "mate"] };
export const CARD = {
  shot: ["쏘기", "사거리 안 한 명에게 1 피해", 25], dodge: ["피하기", "쏘기를 막음", 9], rum: ["럼주", "체력 1 회복", 4], feast: ["잔치", "모두 체력 1 회복", 1],
  volley: ["난사", "다른 모두에게 쏘기", 2], cannon: ["대포", "다른 모두 쏘기 카드를 버리거나 1 피해", 3], duel: ["결투", "한 명과 번갈아 쏘기를 내다 못 낸 쪽이 1 피해", 4],
  steal: ["훔치기", "거리 1 안 한 명의 카드 하나를 가져옴", 4], toss: ["던지기", "아무나 카드 하나를 버리게 함", 4], store: ["장터", "모두 더미에서 한 장씩", 2],
  draw2: ["보급", "두 장 더 뽑음", 2], scope: ["망원경", "(장비) 남들이 1칸 가깝게 보임", 1], horse: ["돛단배", "(장비) 남들이 나를 1칸 멀게 봄", 2],
  barrel: ["나무통", "(장비) 맞을 때 넷 중 하나는 저절로 피함", 2], rep: ["연발총", "(무기) 사거리 1, 쏘기 여러 번", 1],
  g2: ["단총", "(무기) 사거리 2", 3], g3: ["장총", "(무기) 사거리 3", 1], g4: ["망원 소총", "(무기) 사거리 4", 1], g5: ["대포총", "(무기) 사거리 5", 1]
};
const GUN = { rep: 1, g2: 2, g3: 3, g4: 4, g5: 5 }, GEAR = ["scope", "horse", "barrel"];

const alive = s => [...Array(s.n).keys()].filter(p => s.hp[p] > 0);
function dist(s, a, b) {
  const al = alive(s), i = al.indexOf(a), j = al.indexOf(b), k = Math.abs(i - j);
  let d = Math.min(k, al.length - k);
  if (s.gear[b].includes("horse")) d++;
  if (s.gear[a].includes("scope")) d--;
  return Math.max(1, d);
}
const range = (s, p) => GUN[s.gun[p]] || 1;
function drawN(s, p, k, rng) {
  for (let i = 0; i < k; i++) {
    if (!s.deck.length) { s.deck = shuffle(s.disc, rng); s.disc = []; }
    if (!s.deck.length) return;
    s.hands[p].push(s.deck.pop());
  }
}
function discard(s, p, idx) { const c = s.hands[p].splice(idx, 1)[0]; s.disc.push(c); return c; }
function hurt(s, p, by, rng) {
  s.hp[p]--;
  logPush(s, { k: "hit", s: p, by });
  if (s.hp[p] <= 0) {
    const r = s.hands[p].findIndex(c => c.k === "rum");
    if (r >= 0 && alive(s).length > 2) { discard(s, p, r); s.hp[p] = 1; logPush(s, { k: "save", s: p }); return; }
    s.hp[p] = 0; logPush(s, { k: "dead", s: p, role: s.role[p] });
    s.disc.push(...s.hands[p], ...s.gear[p].map(k => ({ k })), ...(s.gun[p] ? [{ k: s.gun[p] }] : [])); s.hands[p] = []; s.gear[p] = []; s.gun[p] = null;
    if (by != null && s.hp[by] > 0) {
      if (s.role[p] === "pir") drawN(s, by, 3, rng);
      if (s.role[p] === "mate" && s.role[by] === "cap") { s.disc.push(...s.hands[by]); s.hands[by] = []; s.gear[by] = []; s.gun[by] = null; }
    }
    checkWin(s);
  }
}
function checkWin(s) {
  const al = alive(s), roles = al.map(p => s.role[p]);
  if (!roles.includes("cap")) s.win = roles.length === 1 && roles[0] === "trait" ? "trait" : "pir";
  else if (!roles.includes("pir") && !roles.includes("trait")) s.win = "cap";
  if (s.win) s.phase = "end";
}
// 응답 줄: 쏘기/난사/대포/결투에 대한 차례차례 대답
function nextResp(s, rng) {
  while (s.resp && s.resp.q.length) {
    const p = s.resp.q[0];
    if (s.hp[p] <= 0) { s.resp.q.shift(); continue; }
    if (s.resp.kind !== "cannon" && s.resp.kind !== "duel" && s.gear[p].includes("barrel") && rng() < .25) { logPush(s, { k: "barrel", s: p }); s.resp.q.shift(); continue; }
    break;
  }
  if (s.resp && !s.resp.q.length) { s.resp = null; }
  if (s.phase !== "end") s.phase = s.resp ? "resp" : "main";
  if (s.phase === "main" && s.hp[s.cur] <= 0) endTurn(s);
}
function endTurn(s) {
  let c = s.cur;
  do c = (c + 1) % s.n; while (s.hp[c] <= 0);
  s.cur = c; s.phase = "draw"; s.shots = 0;
}

export default {
  id: "duel", name: "해적선 결투", color: "#24272c", min: 4, max: 7, time: "30분", solo: 5,
  sub: "선장, 갑판장, 해적, 배신자가 정체를 숨기고 서로 쏘는 카드 게임. 선장만 정체를 밝혀요",
  setup(n, rng) {
    const role = shuffle([...ROLES[n]], rng);
    const cap = role.indexOf("cap");
    const role2 = role.map((_, i) => role[(i + cap) % n]); // 선장이 0번 자리
    const deck = []; let id = 0;
    for (const [k, v] of Object.entries(CARD)) for (let i = 0; i < v[2]; i++) deck.push({ id: id++, k });
    shuffle(deck, rng);
    const hp = role2.map(r => r === "cap" ? 5 : 4);
    const s = { n, role: role2, hp, max: [...hp], hands: Array.from({ length: n }, () => []), gear: Array.from({ length: n }, () => []), gun: Array(n).fill(null),
      deck, disc: [], cur: 0, phase: "draw", shots: 0, resp: null, win: null, log: [], hostile: Array(n).fill(0) };
    for (let p = 0; p < n; p++) drawN(s, p, hp[p], rng);
    return s;
  },
  view(s, seat) {
    return { n: s.n, hp: s.hp, max: s.max, gear: s.gear, gun: s.gun, cur: s.cur, phase: s.phase, shots: s.shots, win: s.win, log: s.log,
      resp: s.resp && { kind: s.resp.kind, by: s.resp.by, q: s.resp.q }, deckN: s.deck.length,
      role: s.role.map((r, p) => p === seat || r === "cap" || s.hp[p] <= 0 || s.win ? r : null),
      counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, me: seat, turn: this.turn(s),
      dist: seat >= 0 ? [...Array(s.n).keys()].map(q => q === seat || s.hp[q] <= 0 || s.hp[seat] <= 0 ? null : dist(s, seat, q)) : null, range: seat >= 0 ? range(s, seat) : 1 };
  },
  turn(s) { return s.phase === "end" ? [] : s.phase === "resp" ? [s.resp.q[0]] : [s.cur]; },
  apply(s, seat, a, ctx) {
    const rng = ctx.rng;
    if (s.phase === "end") throw new Error("판이 끝났어요");
    if (s.phase === "resp") {
      const r = s.resp, p = r.q[0];
      if (seat !== p) throw new Error("대답할 사람이 고르는 중이에요");
      const need = r.kind === "cannon" || r.kind === "duel" ? "shot" : "dodge";
      if (a.t === "card") {
        const i = s.hands[seat].findIndex(c => c.id === a.id);
        if (i < 0 || s.hands[seat][i].k !== need) throw new Error(`${CARD[need][0]} 카드를 내요`);
        discard(s, seat, i); logPush(s, { k: "block", s: seat, c: need });
        r.q.shift();
        if (r.kind === "duel") r.q.push(seat === r.a ? r.b : r.a), r.q.splice(0, r.q.length - 1); // 결투는 번갈아
      } else if (a.t === "take") {
        r.q.shift();
        hurt(s, seat, r.kind === "duel" ? (seat === r.a ? r.b : r.a) : r.by, rng);
        if (r.kind === "duel") r.q = [];
      } else throw new Error("카드를 내거나 맞아요");
      return nextResp(s, rng);
    }
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");
    if (s.phase === "draw") { if (a.t !== "draw") throw new Error("먼저 두 장 뽑아요"); drawN(s, seat, 2, rng); s.phase = "main"; s.shots = 0; return; }
    if (s.phase === "disc") {
      const i = s.hands[seat].findIndex(c => c.id === a.id);
      if (a.t !== "disc" || i < 0) throw new Error("버릴 카드를 골라요");
      discard(s, seat, i);
      if (s.hands[seat].length <= s.hp[seat]) return endTurn(s);
      return;
    }
    if (a.t === "end") {
      if (s.hands[seat].length > s.hp[seat]) { s.phase = "disc"; return; }
      return endTurn(s);
    }
    if (a.t !== "play") throw new Error("모르는 행동이에요");
    const H = s.hands[seat], i = H.findIndex(c => c.id === a.id);
    if (i < 0) throw new Error("그 카드가 없어요");
    const k = H[i].k, tg = a.to;
    if (tg != null && s.role[tg] === "cap" && ["shot", "duel", "steal", "toss"].includes(k)) s.hostile[seat]++;
    const okT = (q, needRange) => q != null && q !== seat && s.hp[q] > 0 && (!needRange || dist(s, seat, q) <= needRange);
    switch (k) {
      case "shot":
        if (s.shots >= 1 && s.gun[seat] !== "rep") throw new Error("쏘기는 차례에 한 번이에요");
        if (!okT(tg, range(s, seat))) throw new Error(`사거리 ${range(s, seat)} 안의 사람을 골라요`);
        discard(s, seat, i); s.shots++; logPush(s, { k: "play", s: seat, c: k, to: tg });
        s.resp = { kind: "shot", by: seat, q: [tg] }; return nextResp(s, rng);
      case "dodge": throw new Error("피하기는 맞을 때 내요");
      case "rum": if (s.hp[seat] >= s.max[seat]) throw new Error("체력이 꽉 찼어요"); discard(s, seat, i); s.hp[seat]++; logPush(s, { k: "play", s: seat, c: k }); return;
      case "feast": discard(s, seat, i); alive(s).forEach(p => s.hp[p] = Math.min(s.max[p], s.hp[p] + 1)); logPush(s, { k: "play", s: seat, c: k }); return;
      case "volley": case "cannon": {
        discard(s, seat, i); logPush(s, { k: "play", s: seat, c: k });
        const q = []; for (let d = 1; d < s.n; d++) { const p = (seat + d) % s.n; if (s.hp[p] > 0) q.push(p); }
        s.resp = { kind: k === "volley" ? "shot" : "cannon", by: seat, q }; return nextResp(s, rng);
      }
      case "duel":
        if (!okT(tg)) throw new Error("결투할 사람을 골라요");
        discard(s, seat, i); logPush(s, { k: "play", s: seat, c: k, to: tg });
        s.resp = { kind: "duel", by: seat, a: seat, b: tg, q: [tg] }; return nextResp(s, rng);
      case "steal": case "toss": {
        if (!okT(tg, k === "steal" ? 1 : 0)) throw new Error(k === "steal" ? "거리 1 안의 사람을 골라요" : "사람을 골라요");
        const pool = [...s.hands[tg].map((c, j) => ["h", j]), ...s.gear[tg].map((g, j) => ["g", j]), ...(s.gun[tg] ? [["w", 0]] : [])];
        if (!pool.length) throw new Error("그 사람은 카드가 없어요");
        discard(s, seat, i);
        const [w, j] = pick(pool, rng);
        let got;
        if (w === "h") got = s.hands[tg].splice(j, 1)[0]; else if (w === "g") got = { id: -1, k: s.gear[tg].splice(j, 1)[0] }; else { got = { id: -1, k: s.gun[tg] }; s.gun[tg] = null; }
        if (got.id === -1) got.id = 1000 + Math.floor(rng() * 1e6);
        if (k === "steal") H.push(got); else s.disc.push(got);
        logPush(s, { k: "play", s: seat, c: k, to: tg, got: w === "h" ? null : got.k });
        return;
      }
      case "store": discard(s, seat, i); for (const p of alive(s)) drawN(s, p, 1, rng); logPush(s, { k: "play", s: seat, c: k }); return;
      case "draw2": discard(s, seat, i); drawN(s, seat, 2, rng); logPush(s, { k: "play", s: seat, c: k }); return;
      default:
        if (GEAR.includes(k)) { if (s.gear[seat].includes(k)) throw new Error("이미 있어요"); H.splice(i, 1); s.gear[seat].push(k); logPush(s, { k: "play", s: seat, c: k }); return; }
        if (GUN[k]) { H.splice(i, 1); if (s.gun[seat]) s.disc.push({ id: 2000 + Math.floor(rng() * 1e6), k: s.gun[seat] }); s.gun[seat] = k; logPush(s, { k: "play", s: seat, c: k }); return; }
    }
    throw new Error("모르는 카드예요");
  },
  over(s) {
    if (!s.win) return null;
    const side = p => s.win === "cap" ? ["cap", "mate"].includes(s.role[p]) : s.win === "pir" ? s.role[p] === "pir" : s.role[p] === "trait";
    const o = [...Array(s.n).keys()].sort((a, b) => side(b) - side(a) || s.hp[b] - s.hp[a]);
    return { text: { cap: "선장 편이 배를 지켰어요", pir: "해적이 배를 차지했어요", trait: "배신자가 혼자 살아남았어요" }[s.win], rank: o.map(p => [p, `${ROLE[s.role[p]][0]}, ${side(p) ? "이김" : "짐"}`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 900 + rng() * 700 }, H = s.hands[seat];
    if (s.phase === "resp") {
      const r = s.resp, need = r.kind === "cannon" || r.kind === "duel" ? "shot" : "dodge";
      const c = H.find(x => x.k === need);
      return { ...d, a: c ? { t: "card", id: c.id } : { t: "take" } };
    }
    if (s.phase === "draw") return { ...d, a: { t: "draw" } };
    if (s.phase === "disc") { const c = H.find(x => !["dodge", "rum", "shot"].includes(x.k)) || H[0]; return { ...d, a: { t: "disc", id: c.id } }; }
    // 적 고르기: 해적은 선장, 선장 편은 의심(나를 쏜 사람) 또는 아무나, 배신자는 해적이 많으면 해적부터
    const al = alive(s).filter(p => p !== seat), me = s.role[seat];
    // 봇은 남의 정체를 몰래 보지 않는다: 선장은 모두가 알고, 선장을 공격한 사람을 먼저 의심한다
    const R = p => s.role[p];
    let pri;
    if (me === "pir") pri = [al.filter(p => R(p) === "cap"), al.filter(p => R(p) !== "cap")];
    else if (me === "trait") pri = al.length > 2 ? [al.filter(p => R(p) !== "cap"), al] : [al];
    else pri = [al.filter(p => R(p) !== "cap" && s.hostile[p] > 0), al.filter(p => R(p) !== "cap")];
    const foes = pri.flat();
    const target = needR => { for (const g of pri) { const t = g.filter(p => !needR || dist(s, seat, p) <= needR); if (t.length) return t.sort((a, b) => s.hp[a] - s.hp[b])[0]; } return null; };
    for (const c of H) {
      if (GEAR.includes(c.k) && !s.gear[seat].includes(c.k)) return { ...d, a: { t: "play", id: c.id } };
      if (GUN[c.k] && (GUN[c.k] > range(s, seat) || (c.k === "rep" && H.filter(x => x.k === "shot").length > 1))) return { ...d, a: { t: "play", id: c.id } };
      if (c.k === "rum" && s.hp[seat] < s.max[seat]) return { ...d, a: { t: "play", id: c.id } };
      if (["draw2", "store"].includes(c.k)) return { ...d, a: { t: "play", id: c.id } };
      if (c.k === "shot" && (s.shots < 1 || s.gun[seat] === "rep")) { const t = target(range(s, seat)); if (t != null) return { ...d, a: { t: "play", id: c.id, to: t } }; }
      if (c.k === "duel" && H.filter(x => x.k === "shot").length >= 1) { const t = target(0); if (t != null) return { ...d, a: { t: "play", id: c.id, to: t } }; }
      if (c.k === "steal") { const t = foes.find(p => dist(s, seat, p) <= 1 && (s.hands[p].length || s.gear[p].length)); if (t != null) return { ...d, a: { t: "play", id: c.id, to: t } }; }
      if (c.k === "toss") { const t = foes.find(p => s.hands[p].length || s.gear[p].length); if (t != null) return { ...d, a: { t: "play", id: c.id, to: t } }; }
      if ((c.k === "volley" || c.k === "cannon") && (me === "pir" || me === "trait" || al.length <= 3 || rng() < .5)) return { ...d, a: { t: "play", id: c.id } };
    }
    return { ...d, a: { t: "end" } };
  },
  badge(v, i) { return v.hp[i] > 0 ? `체력 ${v.hp[i]}` : "쓰러짐"; },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.turn.includes(me) && v.phase !== "end";
    if (!my) UI.card = null;
    const sel = UI.card != null ? v.hand?.find(c => c.id === UI.card) : null;
    const needsT = sel && ["shot", "duel", "steal", "toss"].includes(sel.k);
    const respNeed = v.resp && (v.resp.kind === "cannon" || v.resp.kind === "duel" ? "shot" : "dodge");
    let say;
    if (v.phase === "end") say = "판이 끝났어요";
    else if (v.phase === "resp") say = v.resp.q[0] === me ? `${esc(n[v.resp.by])}의 ${v.resp.kind === "shot" ? "쏘기" : v.resp.kind === "cannon" ? "대포" : "결투"}! ${CARD[respNeed][0]} 카드를 내거나 맞아요` : `${esc(n[v.resp.q[0]])}이(가) 대답하는 중`;
    else if (v.cur !== me) say = `${esc(n[v.cur])} 차례예요`;
    else say = { draw: "카드 두 장을 뽑아요", main: sel ? (needsT ? "누구에게 쓸지 사람을 눌러요" : "이 카드를 쓸까요?") : "낼 카드를 고르거나 차례를 끝내요", disc: `체력보다 카드가 많아요. ${v.hand.length - v.hp[me]}장 버려요` }[v.phase];
    el.innerHTML = `<div class="duel">
      <p class="say">${say}</p>
      <div class="crew">${[...Array(v.n).keys()].map(p => {
        const r = v.role[p], dead = v.hp[p] <= 0, can = needsT && !dead && p !== me && (sel.k === "toss" || sel.k === "duel" || (v.dist[p] != null && v.dist[p] <= (sel.k === "steal" ? 1 : v.range)));
        return `<button class="mate${p === v.cur ? " cur" : ""}${dead ? " dead" : ""}${can ? " tgt" : ""}" data-p="${p}" ${can ? "" : "disabled"} style="--s:${SEAT[p]}">
          <b>${esc(n[p])}</b><span class="role" style="--r:${r ? ROLE[r][1] : "#9aa3ae"}">${r ? ROLE[r][0] : "?"}</span>
          <span class="hp">${"●".repeat(Math.max(0, v.hp[p]))}${"○".repeat(Math.max(0, v.max[p] - Math.max(0, v.hp[p])))}</span>
          <small>손 ${v.counts[p]}${v.gun[p] ? `, ${CARD[v.gun[p]][0]}` : ""}${v.gear[p].map(g => `, ${CARD[g][0]}`).join("")}${v.dist && v.dist[p] != null ? `, 거리 ${v.dist[p]}` : ""}</small></button>`;
      }).join("")}</div>
      ${v.hand ? `<p class="dim small">내 사거리 ${v.range}. 남은 더미 ${v.deckN}장</p><div class="dhand">${v.hand.map(c => `<button class="dc k-${c.k}${UI.card === c.id ? " on" : ""}" data-id="${c.id}" ${my ? "" : "disabled"}><b>${CARD[c.k][0]}</b><small>${CARD[c.k][1]}</small></button>`).join("")}</div>` : ""}
      <div class="acts">
        ${my && v.phase === "draw" ? `<button class="dr">두 장 뽑기</button>` : ""}
        ${my && v.phase === "resp" ? `${v.hand.some(c => c.k === respNeed) ? `<button class="blk">${CARD[respNeed][0]} 내기</button>` : ""}<button class="ghost tk">맞기</button>` : ""}
        ${my && v.phase === "main" && sel && !needsT && sel.k !== "dodge" ? `<button class="use">${CARD[sel.k][0]} 쓰기</button>` : ""}
        ${my && v.phase === "main" ? `<button class="ghost en">차례 끝</button>` : ""}
        ${my && v.phase === "disc" && sel ? `<button class="dsc">${CARD[sel.k][0]} 버리기</button>` : ""}
      </div>
      <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
    </div>`;
    const re = () => this.render(el, v, me, send, ui);
    el.querySelectorAll(".dc:not([disabled])").forEach(b => b.onclick = () => { UI.card = UI.card === +b.dataset.id ? null : +b.dataset.id; re(); });
    el.querySelector(".dr")?.addEventListener("click", () => send({ t: "draw" }));
    el.querySelector(".en")?.addEventListener("click", () => { UI.card = null; send({ t: "end" }); });
    el.querySelector(".use")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "play", id }); });
    el.querySelector(".dsc")?.addEventListener("click", () => { const id = UI.card; UI.card = null; send({ t: "disc", id }); });
    el.querySelector(".tk")?.addEventListener("click", () => send({ t: "take" }));
    el.querySelector(".blk")?.addEventListener("click", () => send({ t: "card", id: v.hand.find(c => c.k === respNeed).id }));
    el.querySelectorAll(".mate.tgt").forEach(b => b.onclick = () => { const id = UI.card; UI.card = null; send({ t: "play", id, to: +b.dataset.p }); });
  }
};
const UI = { card: null };
function line(x, n) {
  const b = i => nameB(n, i);
  switch (x.k) {
    case "play": return `${b(x.s)} ${CARD[x.c][0]}${x.to != null ? `, 대상 ${b(x.to)}` : ""}${x.got ? ` (${CARD[x.got][0]})` : ""}`;
    case "block": return `${b(x.s)} ${CARD[x.c][0]}로 막음`;
    case "barrel": return `${b(x.s)} 나무통 뒤로 숨어 피함`;
    case "hit": return `${b(x.s)} 1 피해`;
    case "save": return `${b(x.s)} 럼주로 버팀`;
    case "dead": return `${b(x.s)} 쓰러짐, 정체는 ${ROLE[x.role][0]}`;
  }
  return "";
}
