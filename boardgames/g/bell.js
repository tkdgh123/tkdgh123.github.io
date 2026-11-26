// 시장 종 — 같은 과일이 딱 다섯 개 보이면 종을 치는 순발력 게임 (2~6명)
// 판정: 인터넷 속도 차이로 승패가 갈리지 않게, 폰마다 "새 카드가 내 화면에 뜬 뒤 누르기까지" 시간을 재서 보낸다.
// 방장은 첫 종이 오면 0.4초 동안 더 기다렸다가 가장 빠른 사람에게 준다.
import { esc, shuffle, hash, SEAT } from "../lib.js";

export const FRUIT = [["귤", "orange"], ["포도", "grape"], ["딸기", "berry"], ["바나나", "banana"]];
const COUNTS = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5]; // 과일마다 14장
const WINDOW = 400, AUTOFLIP = 7000, LIMIT = 8 * 60 * 1000;

const log = (s, x) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, 8); };
const alive = s => [...Array(s.n).keys()].filter(p => !s.out[p]);
export function fives(s) {
  const t = [0, 0, 0, 0];
  for (const pile of s.up) if (pile.length) { const c = pile[pile.length - 1]; t[c.f] += c.k; }
  return t.includes(5);
}
function nextTurn(s) {
  let c = s.cur;
  for (let i = 0; i < s.n; i++) { c = (c + 1) % s.n; if (!s.out[c] && s.deck[c].length) break; }
  s.cur = c;
}
function knock(s, p) { // 낼 카드가 없으면 탈락
  if (!s.out[p] && !s.deck[p].length) { s.out[p] = true; log(s, { k: "out", s: p }); }
}

export default {
  id: "bell", name: "시장 종", color: "#e0a526", min: 2, max: 6, time: "10분", solo: 4,
  sub: "펼친 카드 속 같은 과일이 딱 다섯 개면 누구보다 먼저 종을 쳐요",

  setup(n, rng, ctx) {
    const all = [];
    FRUIT.forEach((_, f) => COUNTS.forEach(k => all.push({ f, k })));
    shuffle(all, rng);
    const deck = Array.from({ length: n }, () => []);
    all.slice(0, all.length - all.length % n).forEach((c, i) => deck[i % n].push(c));
    return { n, deck, up: Array.from({ length: n }, () => []), out: Array(n).fill(false), cur: 0, flip: 0, flipAt: ctx.now, start: ctx.now, ring: null, log: [], seed: Math.floor(rng() * 1e9), done: false, last: null };
  },

  view(s) {
    return {
      n: s.n, cur: s.cur, flip: s.flip, out: s.out, log: s.log, done: s.done, last: s.last, ring: !!s.ring, start: s.start,
      up: s.up.map(p => p.length ? p[p.length - 1] : null), upN: s.up.map(p => p.length), left: s.deck.map(d => d.length),
      turn: this.turn(s)
    };
  },

  turn(s) { return s.done ? [] : alive(s); },

  apply(s, seat, a, ctx) {
    if (s.done) throw new Error("판이 끝났어요");
    if (a.t === "flip") {
      if (seat !== s.cur) throw new Error("내 차례가 아니에요");
      if (s.ring) throw new Error("종 소리 판정 중이에요");
      const c = s.deck[seat].shift();
      if (!c) { knock(s, seat); nextTurn(s); return; }
      s.up[seat].push(c); s.flip++; s.flipAt = ctx.now; s.last = null;
      knock(s, seat); nextTurn(s);
      return;
    }
    if (a.t === "ring") {
      if (s.out[seat]) throw new Error("탈락해서 종을 칠 수 없어요");
      if (a.flip !== s.flip) return; // 지난 카드에 대한 종은 무시
      const ms = Math.max(80, Math.min(20000, +a.ms || 20000));
      if (!s.ring) s.ring = { flip: s.flip, until: ctx.now + WINDOW, c: [] };
      if (!s.ring.c.some(x => x.s === seat)) s.ring.c.push({ s: seat, ms });
      return;
    }
    throw new Error("모르는 행동이에요");
  },

  nextTick(s, now) {
    if (s.done) return null;
    if (s.ring) return s.ring.until - now;
    const t = Math.min(s.flipAt + AUTOFLIP, s.start + LIMIT);
    return t - now;
  },

  tick(s, ctx) {
    if (s.ring && ctx.now >= s.ring.until) {
      const ok = fives(s), c = s.ring.c.sort((a, b) => a.ms - b.ms);
      if (ok) {
        const w = c[0].s, got = s.up.reduce((a, p) => a + p.length, 0);
        for (const p of s.up) { s.deck[w].push(...p); p.length = 0; }
        s.out[w] = false;
        log(s, { k: "win", s: w, n: got, ms: c[0].ms, by: c.slice(1).map(x => [x.s, x.ms]) });
        s.last = { k: "win", s: w };
        s.cur = w;
      } else {
        for (const { s: p } of c) {
          for (const q of alive(s)) if (q !== p && s.deck[p].length) s.deck[q].push(s.deck[p].shift());
          knock(s, p);
          log(s, { k: "miss", s: p });
        }
        s.last = { k: "miss", s: c.map(x => x.s) };
        if (s.out[s.cur] || !s.deck[s.cur].length) nextTurn(s);
      }
      s.ring = null; s.flip++; s.flipAt = ctx.now;
      this.checkEnd(s, ctx);
      return true;
    }
    if (!s.ring && ctx.now >= s.start + LIMIT) { s.done = true; return true; }
    if (!s.ring && ctx.now >= s.flipAt + AUTOFLIP) { this.apply(s, s.cur, { t: "flip" }, ctx); this.checkEnd(s, ctx); return true; }
    return false;
  },

  checkEnd(s) {
    const al = alive(s).filter(p => s.deck[p].length || s.up[p].length);
    if (al.length <= 1 || alive(s).every(p => !s.deck[p].length)) s.done = true;
  },

  over(s) {
    this.checkEnd(s);
    if (!s.done) return null;
    const tot = p => s.deck[p].length + s.up[p].length;
    const order = [...Array(s.n).keys()].sort((a, b) => tot(b) - tot(a));
    return { text: "카드를 가장 많이 가진 사람", rank: order.map((p, i) => [p, `${i + 1}등, ${tot(p)}장`]) };
  },

  bot(s, seat, rng, ctx) {
    if (fives(s)) {
      if (s.ring?.c.some(x => x.s === seat)) return null;
      const ms = 520 + (hash(s.seed, s.flip, seat) % 700);
      // 판정 중이면 바로 내 기록을 넣는다(승패는 잰 시간으로 정하니 늦게 넣어도 공평)
      return { delay: s.ring ? 0 : s.flipAt + ms - ctx.now, a: { t: "ring", flip: s.flip, ms } };
    }
    if (s.ring) return null;
    if (seat === s.cur) return { delay: 900 + rng() * 500, a: { t: "flip" } };
    if (hash(s.seed, s.flip, seat, "x") % 100 < 2) { // 가끔 헷갈려서 잘못 침
      const ms = 700 + (hash(s.seed, s.flip, seat) % 500);
      return { delay: s.flipAt + ms - ctx.now, a: { t: "ring", flip: s.flip, ms } };
    }
    return null;
  },

  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// ───────── 화면 ─────────
const UI = { flip: -1, at: 0, rung: -1 };
const card = c => c ? `<div class="fc f${c.f} k${c.k}" aria-label="${FRUIT[c.f][0]} ${c.k}개">${Array(c.k).fill(`<img src="art/f-${FRUIT[c.f][1]}.webp" alt="">`).join("")}</div>` : `<div class="fc empty"></div>`;

function render(el, v, me, send, ui) {
  if (v.flip !== UI.flip) { UI.flip = v.flip; UI.at = performance.now(); }
  const n = ui.names, myTurn = v.cur === me && !v.done && !v.ring;
  const left = Math.max(0, Math.ceil((v.start + LIMIT - Date.now()) / 60000));
  const lastWin = v.log[0];
  el.innerHTML = `<div class="bell">
    <div class="tbl t${v.n}">${[...Array(v.n).keys()].map(p => `<div class="pl${p === v.cur ? " cur" : ""}${v.out[p] ? " gone" : ""}${p === me ? " me" : ""}" style="--s:${SEAT[p]}">
      ${card(v.up[p])}
      <span class="nm">${esc(n[p])}</span><span class="cnt">손 ${v.left[p]}장${v.upN[p] ? `, 바닥 ${v.upN[p]}` : ""}</span>
    </div>`).join("")}</div>
    <p class="say">${v.done ? "판이 끝났어요" : v.ring ? "종 소리! 누가 먼저였는지 보는 중" : myTurn ? "내 카드를 뒤집어요" : `${esc(n[v.cur])} 차례, 다섯 개가 보이면 바로 종!`}
      <small>${v.done ? "" : `${left}분 남음`}</small></p>
    ${lastWin && lastWin.k === "win" && v.last ? `<p class="flash ok">${esc(n[lastWin.s])} 종! ${lastWin.n}장 가져감 (${(lastWin.ms / 1000).toFixed(2)}초)</p>` : ""}
    ${v.last?.k === "miss" ? `<p class="flash bad">${v.last.s.map(p => esc(n[p])).join(", ")} 잘못 쳐서 한 장씩 나눠 줌</p>` : ""}
    ${me >= 0 && !v.out[me] ? `<div class="pads">
      <button class="flipb" ${myTurn ? "" : "disabled"}>뒤집기<small>${v.left[me]}장</small></button>
      <button class="ringb" ${v.done || UI.rung === v.flip ? "disabled" : ""} aria-label="종 치기"><span>종</span></button>
    </div>` : me >= 0 ? `<p class="dim">카드가 떨어져 탈락했어요. 구경하며 기다려요.</p>` : ""}
    <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
  </div>`;
  clearInterval(UI.clock); // 남은 분은 다시 그리지 않아도 줄어들게
  UI.clock = setInterval(() => { const m = el.querySelector(".bell .say small"); if (!m || v.done) return clearInterval(UI.clock); m.textContent = `${Math.max(0, Math.ceil((v.start + LIMIT - Date.now()) / 60000))}분 남음`; }, 5000);
  el.querySelector(".flipb")?.addEventListener("click", () => send({ t: "flip" }));
  el.querySelector(".ringb")?.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (UI.rung === v.flip) return;
    UI.rung = v.flip;
    navigator.vibrate?.(30);
    e.currentTarget.disabled = true; e.currentTarget.classList.add("hit");
    send({ t: "ring", flip: v.flip, ms: Math.round(performance.now() - UI.at) });
  });
}

function line(x, n) {
  const b = i => `<b style="color:${SEAT[i]}">${esc(n[i])}</b>`;
  switch (x.k) {
    case "win": return `${b(x.s)} 종! ${x.n}장 (${(x.ms / 1000).toFixed(2)}초${x.by.length ? `, 다음 ${x.by.map(([p, ms]) => `${esc(n[p])} ${(ms / 1000).toFixed(2)}`).join(", ")}` : ""})`;
    case "miss": return `${b(x.s)} 잘못 침`;
    case "out": return `${b(x.s)} 탈락`;
  }
  return "";
}
