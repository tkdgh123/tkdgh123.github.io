// 숫자 조합판 — 숫자 타일을 같은 숫자 묶음이나 같은 색 이어진 줄로 내려놓고, 판 위 조합을 고쳐 내 타일을 끼우는 게임 (2~4명)
// 타일: 1~13 네 색 두 벌 + 별 둘(아무 타일). 처음 내려놓을 땐 내 타일만으로 합 30 이상. 못 내면 한 장 가져옴.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const TC = [["검정", "#24272c"], ["빨강", "#c8321f"], ["파랑", "#2a64b8"], ["주황", "#d97a12"]];
const FIRST = 30;

// 묶음 검사: 같은 숫자 다른 색 3~4개, 또는 같은 색 이어진 숫자 3개 이상. 별(v=0)은 빈자리를 채움
export function setInfo(tiles) {
  if (tiles.length < 3) return null;
  const nj = tiles.filter(t => t.v), J = tiles.length - nj.length;
  if (!nj.length) return { kind: "any", sum: 0 };
  const vs = nj.map(t => t.v), cs = nj.map(t => t.c);
  if (vs.every(v => v === vs[0]) && new Set(cs).size === cs.length && tiles.length <= 4) return { kind: "group", sum: vs[0] * tiles.length };
  if (cs.every(c => c === cs[0]) && new Set(vs).size === vs.length && tiles.length <= 13) {
    const lo = Math.min(...vs), hi = Math.max(...vs);
    if (hi - lo + 1 <= tiles.length) {
      let start = Math.min(lo, 13 - tiles.length + 1); // 남는 별은 위쪽부터
      start = Math.max(1, Math.min(start, lo));
      if (start + tiles.length - 1 > 13) start = 13 - tiles.length + 1;
      let sum = 0; for (let k = 0; k < tiles.length; k++) sum += start + k;
      return { kind: "run", sum };
    }
  }
  return null;
}
const val = t => t.v || 25;

export default {
  id: "tile", name: "숫자 조합판", color: "#4b8fa6", min: 2, max: 4, time: "40분", solo: 3,
  sub: "같은 숫자끼리, 같은 색 이어진 숫자끼리 내려놓아요. 판 위 조합을 고쳐 끼워 넣어도 돼요",
  setup(n, rng) {
    const pool = []; let id = 0;
    for (let k = 0; k < 2; k++) for (let c = 0; c < 4; c++) for (let v = 1; v <= 13; v++) pool.push({ id: id++, c, v });
    pool.push({ id: id++, c: -1, v: 0 }, { id: id++, c: -1, v: 0 });
    shuffle(pool, rng);
    return { n, pool, hands: Array.from({ length: n }, () => pool.splice(0, 14)), table: [], melded: Array(n).fill(false), cur: 0, passes: 0, log: [], done: false };
  },
  view(s, seat) {
    return { n: s.n, table: s.table, melded: s.melded, cur: s.cur, log: s.log, done: s.done, poolN: s.pool.length,
      counts: s.hands.map(h => h.length), hand: seat >= 0 ? s.hands[seat] : null, turn: this.turn(s) };
  },
  turn(s) { return s.done ? [] : [s.cur]; },
  apply(s, seat, a, ctx) {
    if (s.done || seat !== s.cur) throw new Error("내 차례가 아니에요");
    const H = s.hands[seat];
    if (a.t === "draw") {
      if (s.pool.length) { H.push(s.pool.pop()); logPush(s, { k: "draw", s: seat }); s.passes = 0; }
      else { s.passes++; logPush(s, { k: "pass", s: seat }); if (s.passes >= s.n) { s.done = true; return; } }
      s.cur = (s.cur + 1) % s.n; return;
    }
    if (a.t !== "play" || !Array.isArray(a.table)) throw new Error("모르는 행동이에요");
    const byId = new Map([...s.table.flat(), ...H].map(t => [t.id, t]));
    const oldIds = new Set(s.table.flat().map(t => t.id)), handIds = new Set(H.map(t => t.id));
    const seen = new Set(), sets = [];
    for (const row of a.table) {
      if (!Array.isArray(row) || !row.length) continue;
      const ts = row.map(id => { if (seen.has(id) || !byId.has(id)) throw new Error("타일이 이상해요"); seen.add(id); return byId.get(id); });
      sets.push(ts);
    }
    for (const id of oldIds) if (!seen.has(id)) throw new Error("판에 있던 타일은 판에 남아 있어야 해요");
    const used = [...seen].filter(id => handIds.has(id));
    if (!used.length) throw new Error("내 타일을 하나 이상 내려놓아요");
    for (const ts of sets) if (!setInfo(ts)) throw new Error("조합이 안 맞는 줄이 있어요 (빨간 줄)");
    if (!s.melded[seat]) {
      const oldSets = s.table.map(r => r.map(t => t.id).sort().join(","));
      const newSets = sets.map(r => r.map(t => t.id).sort().join(","));
      const left = [...newSets]; for (const o of oldSets) { const i = left.indexOf(o); if (i < 0) throw new Error("처음 내려놓을 땐 판 위 조합을 고칠 수 없어요"); left.splice(i, 1); }
      let sum = 0;
      for (const r of sets) { const key = r.map(t => t.id).sort().join(","); if (left.includes(key)) { if (r.some(t => oldIds.has(t.id))) throw new Error("처음엔 내 타일만으로"); sum += setInfo(r).sum; } }
      if (sum < FIRST) throw new Error(`처음 내려놓을 땐 합이 ${FIRST} 이상이어야 해요 (지금 ${sum})`);
      s.melded[seat] = true;
    }
    s.table = sets; s.hands[seat] = H.filter(t => !seen.has(t.id)); s.passes = 0;
    logPush(s, { k: "play", s: seat, n: used.length });
    if (!s.hands[seat].length) { s.done = true; s.win = seat; return; }
    s.cur = (s.cur + 1) % s.n;
  },
  over(s) {
    if (!s.done) return null;
    const left = p => s.hands[p].reduce((a, t) => a + val(t), 0);
    const o = [...Array(s.n).keys()].sort((a, b) => left(a) - left(b));
    return { text: s.win != null ? "타일을 먼저 다 내려놓은 사람" : "남은 타일 합이 가장 작은 사람", rank: o.map((p, i) => [p, s.hands[p].length ? `${i + 1}등, 남은 ${s.hands[p].length}개` : "다 내려놓음"]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 1200 + rng() * 800 };
    const plan = botPlan(s.table, s.hands[seat], s.melded[seat]);
    return { ...d, a: plan ? { t: "play", table: plan } : { t: "draw" } };
  },
  render(el, v, me, send, ui) { render(this, el, v, me, send, ui); }
};

// 봇: 손패에서 줄과 묶음을 찾고, 내려놓은 뒤엔 판 위 줄 끝과 묶음에 하나씩 붙인다(판 조합을 크게 고치지는 않음)
function findSets(hand) {
  const left = [...hand].sort((a, b) => a.c - b.c || a.v - b.v), out = [];
  const take = ts => { out.push(ts); ts.forEach(t => left.splice(left.indexOf(t), 1)); };
  for (let c = 0; c < 4; c++) { // 줄
    const byV = new Map(); left.filter(t => t.c === c).forEach(t => { if (!byV.has(t.v)) byV.set(t.v, t); });
    let run = [];
    for (let v = 1; v <= 14; v++) {
      if (byV.has(v)) run.push(byV.get(v));
      else { if (run.length >= 3) take(run); run = []; }
    }
  }
  for (let v = 1; v <= 13; v++) { // 묶음
    const ts = []; const cs = new Set();
    left.filter(t => t.v === v).forEach(t => { if (!cs.has(t.c)) { cs.add(t.c); ts.push(t); } });
    if (ts.length >= 3) take(ts.slice(0, 4));
  }
  const jk = left.filter(t => !t.v);
  for (const j of jk) { // 별로 두 장짜리를 채움
    for (let v = 1; v <= 13; v++) { const ts = []; const cs = new Set(); left.filter(t => t.v === v).forEach(t => { if (!cs.has(t.c)) { cs.add(t.c); ts.push(t); } }); if (ts.length === 2 && left.includes(j)) { take([...ts, j]); break; } }
  }
  return out;
}
function botPlan(table, hand, melded) {
  const sets = findSets(hand);
  const used = new Set(sets.flat().map(t => t.id));
  let newT = table.map(r => [...r]);
  if (!melded) {
    const sum = sets.reduce((a, r) => a + (setInfo(r)?.sum || 0), 0);
    if (sum < FIRST) return null;
  }
  newT.push(...sets);
  if (melded) {
    for (const t of hand) {
      if (used.has(t.id) || !t.v) continue;
      for (const r of newT) {
        if (setInfo([...r, t])) { r.push(t); used.add(t.id); break; }
      }
    }
  }
  if (!used.size) return null;
  return newT.map(r => r.map(t => t.id));
}

// ───────── 화면: 판을 복사한 초안에서 고친 뒤 한 번에 낸다 ─────────
const UI = { draft: null, key: null, sel: [] };
function render(G, el, v, me, send, ui) {
  const n = ui.names, my = v.cur === me && !v.done;
  const key = JSON.stringify([v.table, v.hand?.length, v.cur]);
  if (UI.key !== key || !my) { UI.key = key; UI.draft = v.table.map(r => r.map(t => t.id)); UI.sel = []; }
  const all = new Map([...v.table.flat(), ...(v.hand || [])].map(t => [t.id, t]));
  const onTable = new Set(UI.draft.flat());
  const handLeft = (v.hand || []).filter(t => !onTable.has(t.id)).sort((a, b) => a.c - b.c || a.v - b.v);
  const tileB = (t, extra = "") => `<button class="tl${UI.sel.includes(t.id) ? " on" : ""}${extra}" data-id="${t.id}" style="--c:${t.v ? TC[t.c][1] : "#8a4fb0"}" ${my ? "" : "disabled"}>${t.v || "★"}</button>`;
  const changed = JSON.stringify(UI.draft) !== JSON.stringify(v.table.map(r => r.map(t => t.id)));
  el.innerHTML = `<div class="tile">
    <p class="say">${v.done ? "판이 끝났어요" : my ? (UI.sel.length ? "옮길 줄을 누르거나 새 줄을 만들어요" : "타일을 눌러 고른 뒤 줄로 옮겨요. 다 맞으면 내기") : `${esc(n[v.cur])} 차례예요`}<small>더미 ${v.poolN}</small></p>
    <div class="who">${v.counts.map((k, p) => `<span class="${p === v.cur ? "cur" : ""}" style="--s:${SEAT[p]}">${esc(n[p])} ${k}개${v.melded[p] ? "" : ", 첫 내려놓기 전"}</span>`).join("")}</div>
    <div class="tbl">${UI.draft.map((r, i) => { const ts = r.map(id => all.get(id)); const ok = setInfo(ts); return `<div class="trow${ok ? "" : " bad"}" data-row="${i}">${ts.map(t => tileB(t, v.table.flat().some(x => x.id === t.id) ? "" : " new")).join("")}${my && UI.sel.length ? `<span class="drop">여기로</span>` : ""}</div>`; }).join("") || `<p class="dim">판이 비었어요</p>`}
      ${my && UI.sel.length ? `<button class="ghost newrow">새 줄 만들기</button>` : ""}</div>
    ${v.hand ? `<div class="thand">${handLeft.map(t => tileB(t)).join("")}</div>` : ""}
    ${my ? `<div class="acts"><button class="go" ${changed ? "" : "disabled"}>내기</button><button class="ghost undo" ${changed || UI.sel.length ? "" : "disabled"}>되돌리기</button><button class="ghost drawb" ${changed ? "disabled" : ""}>${v.poolN ? "한 장 가져오고 끝" : "넘기기"}</button></div>` : ""}
    <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.k === "play" ? `${x.n}개 내려놓음` : x.k === "draw" ? "한 장 가져옴" : "넘김"}</li>`).join("")}</ol>
  </div>`;
  const re = () => render(G, el, v, me, send, ui);
  el.querySelectorAll(".tl:not([disabled])").forEach(b => b.onclick = e => {
    e.stopPropagation();
    const id = +b.dataset.id;
    UI.sel = UI.sel.includes(id) ? UI.sel.filter(x => x !== id) : [...UI.sel, id]; re();
  });
  const moveTo = row => {
    UI.draft = UI.draft.map(r => r.filter(id => !UI.sel.includes(id)));
    if (row == null) UI.draft.push([...UI.sel]); else UI.draft[row].push(...UI.sel);
    UI.draft = UI.draft.filter(r => r.length).map(r => r.map(id => all.get(id)).sort((a, b) => a.v - b.v || a.c - b.c).map(t => t.id));
    UI.sel = []; re();
  };
  if (my && UI.sel.length) el.querySelectorAll(".trow").forEach(r => r.onclick = () => moveTo(+r.dataset.row));
  el.querySelector(".newrow")?.addEventListener("click", () => moveTo(null));
  el.querySelector(".thand")?.addEventListener("click", e => { // 고른 판 타일을 손패로 되돌리기(이번 차례에 낸 것만)
    if (e.target.closest(".tl") || !UI.sel.length) return;
    const mine = new Set((v.hand || []).map(t => t.id));
    UI.draft = UI.draft.map(r => r.filter(id => !(UI.sel.includes(id) && mine.has(id)))).filter(r => r.length); UI.sel = []; re();
  });
  el.querySelector(".undo")?.addEventListener("click", () => { UI.key = null; re(); });
  el.querySelector(".go")?.addEventListener("click", () => send({ t: "play", table: UI.draft }));
  el.querySelector(".drawb")?.addEventListener("click", () => send({ t: "draw" }));
}
