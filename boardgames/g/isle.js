// 섬 개척 — 주사위로 자원을 받고, 바꾸고, 길과 마을과 도시를 지어 10점을 먼저 내는 게임 (3~4명)
// 판은 매판 무작위(땅 19칸). 7이 나오면 카드가 8장 이상인 사람은 절반을 버리고, 굴린 사람이 해적을 옮겨 한 장 뺏는다.
import { esc, shuffle, pick, SEAT } from "../lib.js";

export const RES = [["나무", "#3f7d3a"], ["흙", "#b5562f"], ["양털", "#9cc65b"], ["밀", "#e3b93c"], ["돌", "#8d939b"]];
const COST = { road: [1, 1, 0, 0, 0], set: [1, 1, 1, 1, 0], city: [0, 0, 0, 2, 3], dev: [0, 0, 1, 1, 1] };
const DEV = { kn: "경비대", vp: "기념비", rb: "길 닦기", yp: "풍년", mo: "독점" };
const DEVTXT = { kn: "해적을 옮기고 한 장 뺏어요", vp: "1점 (숨겨 둠)", rb: "길 둘을 공짜로", yp: "은행에서 아무 자원 둘", mo: "한 자원을 골라 모두에게서 다 받아요" };

// ── 판 모양(한 번만 계산) ──
const S3 = Math.sqrt(3);
const AX = [];
for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) AX.push([q, r]);
export const HEX = AX.map(([q, r]) => ({ q, r, x: S3 * (q + r / 2), y: 1.5 * r, v: [], e: [] }));
export const V = [], E = [];
{
  const vk = new Map(), ek = new Map();
  HEX.forEach((h, hi) => {
    const ids = [];
    for (let k = 0; k < 6; k++) {
      const a = (60 * k - 30) * Math.PI / 180, x = h.x + Math.cos(a), y = h.y + Math.sin(a);
      const key = Math.round(x * 100) + "," + Math.round(y * 100);
      if (!vk.has(key)) { vk.set(key, V.length); V.push({ x, y, h: [], n: [], e: [] }); }
      const id = vk.get(key); ids.push(id); V[id].h.push(hi); h.v.push(id);
    }
    for (let k = 0; k < 6; k++) {
      const a = ids[k], b = ids[(k + 1) % 6], key = Math.min(a, b) + "-" + Math.max(a, b);
      if (!ek.has(key)) { ek.set(key, E.length); E.push({ a: Math.min(a, b), b: Math.max(a, b), h: [] }); V[a].n.push(b); V[b].n.push(a); V[a].e.push(E.length - 1); V[b].e.push(E.length - 1); }
      E[ek.get(key)].h.push(hi); h.e.push(ek.get(key));
    }
  });
}
const COAST = E.map((e, i) => i).filter(i => E[i].h.length === 1)
  .sort((i, j) => { const m = k => Math.atan2((V[E[k].a].y + V[E[k].b].y) / 2, (V[E[k].a].x + V[E[k].b].x) / 2); return m(i) - m(j); });
const PORTE = Array.from({ length: 9 }, (_, i) => COAST[Math.floor(i * COAST.length / 9 + 1)]);
const NB = (h1, h2) => { const dq = h1.q - h2.q, dr = h1.r - h2.r; return Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr) === 2; };

const log = (s, x) => { s.log.unshift(x); s.log.length = Math.min(s.log.length, 12); };
const sum = a => a.reduce((x, y) => x + y, 0);
const has = (r, c) => c.every((v, i) => r[i] >= v);
const pay = (s, p, c) => c.forEach((v, i) => { s.pl[p].res[i] -= v; s.bank[i] += v; });
const pip = n => n ? 6 - Math.abs(7 - n) : 0;

function ratio(s, p) {
  const r = [4, 4, 4, 4, 4];
  for (const pt of s.ports) {
    const e = E[pt.e];
    if ([e.a, e.b].some(v => s.vb[v]?.p === p)) {
      if (pt.r < 0) for (let i = 0; i < 5; i++) r[i] = Math.min(r[i], 3); else r[pt.r] = 2;
    }
  }
  return r;
}
function canSet(s, p, v, setup) {
  if (s.vb[v] || V[v].n.some(u => s.vb[u])) return false;
  return setup || V[v].e.some(e => s.eb[e] === p);
}
function canRoad(s, p, e, from) {
  if (s.eb[e] != null) return false;
  const { a, b } = E[e];
  if (from != null) return a === from || b === from;
  return [a, b].some(v => s.vb[v]?.p === p || (!(s.vb[v] && s.vb[v].p !== p) && V[v].e.some(f => f !== e && s.eb[f] === p)));
}
export function longest(s, p) {
  let best = 0;
  const go = (v, used, len) => {
    best = Math.max(best, len);
    if (len > 0 && s.vb[v] && s.vb[v].p !== p) return;
    for (const e of V[v].e) if (s.eb[e] === p && !used.has(e)) { used.add(e); go(E[e].a === v ? E[e].b : E[e].a, used, len + 1); used.delete(e); }
  };
  for (let v = 0; v < V.length; v++) if (V[v].e.some(e => s.eb[e] === p)) go(v, new Set(), 0);
  return best;
}
function updLR(s) {
  const L = s.pl.map((_, p) => longest(s, p));
  const h = s.lr;
  const mx = Math.max(...L);
  if (h != null && L[h] >= 5 && L[h] >= mx) return;
  const top = L.map((l, p) => l === mx ? p : -1).filter(p => p >= 0);
  const nh = mx >= 5 && top.length === 1 ? top[0] : null;
  if (nh !== h) { s.lr = nh; if (nh != null) log(s, { k: "lr", s: nh, n: mx }); }
}
function updLA(s, p) {
  const k = s.pl[p].kn;
  if (k >= 3 && (s.la == null || k > s.pl[s.la].kn) && s.la !== p) { s.la = p; log(s, { k: "la", s: p }); }
}
export function vp(s, p, hidden = true) {
  let n = 0;
  s.vb.forEach(b => { if (b && b.p === p) n += b.city ? 2 : 1; });
  if (s.lr === p) n += 2;
  if (s.la === p) n += 2;
  if (hidden) n += s.pl[p].dev.filter(d => d.k === "vp").length;
  return n;
}
function checkWin(s) { if (vp(s, s.cur) >= 10) { s.phase = "end"; s.win = s.cur; } }

function produce(s, n) {
  const want = s.pl.map(() => [0, 0, 0, 0, 0]);
  HEX.forEach((h, hi) => {
    const t = s.hex[hi];
    if (t.num !== n || hi === s.robber) return;
    for (const v of h.v) if (s.vb[v]) want[s.vb[v].p][t.res] += s.vb[v].city ? 2 : 1;
  });
  for (let r = 0; r < 5; r++) {
    const tot = sum(want.map(w => w[r])), who = want.filter(w => w[r] > 0).length;
    if (tot <= s.bank[r]) want.forEach((w, p) => { s.pl[p].res[r] += w[r]; s.bank[r] -= w[r]; });
    else if (who === 1) want.forEach((w, p) => { const g = Math.min(w[r], s.bank[r]); s.pl[p].res[r] += g; s.bank[r] -= g; });
  }
  return want;
}
const victims = (s, p) => [...new Set(HEX[s.robber].v.map(v => s.vb[v]?.p).filter(q => q != null && q !== p && sum(s.pl[q].res) > 0))];
function afterRobber(s) {
  const vs = victims(s, s.cur);
  if (!vs.length) return backFromRobber(s);
  s.phase = "steal";
}
function backFromRobber(s) { s.phase = s.dice ? "main" : "roll"; }
function steal(s, from, rng) {
  const bag = []; s.pl[from].res.forEach((n, r) => { for (let i = 0; i < n; i++) bag.push(r); });
  if (!bag.length) return null;
  const r = pick(bag, rng); s.pl[from].res[r]--; s.pl[s.cur].res[r]++;
  return r;
}
function nextSetup(s) {
  const o = s.setup;
  o.i++;
  if (o.i >= o.order.length) { s.setup = null; s.cur = 0; s.phase = "roll"; s.dice = null; return; }
  s.cur = o.order[o.i]; o.step = "set";
}

export default {
  id: "isle", name: "섬 개척", color: "#c8402f", min: 3, max: 4, time: "60분", solo: 4,
  sub: "주사위로 자원을 받고 서로 바꿔 길과 마을과 도시를 지어요. 10점 먼저",

  setup(n, rng) {
    let hex;
    for (let tries = 0; tries < 500; tries++) {
      const res = shuffle([0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, -1], rng);
      const nums = shuffle([2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12], rng);
      hex = res.map(r => ({ res: r, num: r < 0 ? 0 : nums.pop() }));
      const hot = hex.map((h, i) => h.num === 6 || h.num === 8 ? i : -1).filter(i => i >= 0);
      if (!hot.some(i => hot.some(j => i < j && NB(HEX[i], HEX[j])))) break;
    }
    const ptype = shuffle([-1, -1, -1, -1, 0, 1, 2, 3, 4], rng);
    const devs = shuffle([...Array(14).fill("kn"), ...Array(5).fill("vp"), "rb", "rb", "yp", "yp", "mo", "mo"], rng);
    const order = [...Array(n).keys(), ...[...Array(n).keys()].reverse()];
    return {
      n, hex, robber: hex.findIndex(h => h.res < 0), ports: PORTE.map((e, i) => ({ e, r: ptype[i] })),
      vb: Array(V.length).fill(null), eb: Array(E.length).fill(null),
      pl: Array.from({ length: n }, () => ({ res: [0, 0, 0, 0, 0], dev: [], kn: 0, roads: 15, sets: 5, cities: 4 })),
      bank: [19, 19, 19, 19, 19], devs, cur: 0, phase: "setup", setup: { order, i: 0, step: "set", lastV: null },
      dice: null, disc: null, lr: null, la: null, trade: null, played: false, free: 0, log: [], win: null
    };
  },

  view(s, seat) {
    const { devs, ...r } = s;
    const o = JSON.parse(JSON.stringify(r));
    o.pl = s.pl.map((p, i) => ({
      res: i === seat ? p.res : null, nres: sum(p.res), kn: p.kn, roads: p.roads, sets: p.sets, cities: p.cities,
      dev: i === seat ? p.dev : null, ndev: p.dev.length, vp: vp(s, i, i === seat), lr: longest(s, i)
    }));
    o.devN = devs.length; o.turn = this.turn(s); o.ratio = seat >= 0 ? ratio(s, seat) : null;
    return o;
  },

  turn(s) {
    if (s.phase === "end") return [];
    if (s.phase === "disc") return Object.keys(s.disc).map(Number);
    if (s.trade) return [s.cur, ...[...Array(s.n).keys()].filter(p => p !== s.cur && !(p in s.trade.ans))];
    return [s.cur];
  },

  apply(s, seat, a, ctx) {
    const P = s.pl[seat], rng = ctx.rng;
    if (s.phase === "disc") {
      if (a.t !== "disc" || !(seat in s.disc)) throw new Error("버릴 사람이 고르는 중이에요");
      const c = a.c;
      if (!Array.isArray(c) || c.length !== 5 || c.some((v, i) => !(v >= 0) || v > P.res[i]) || sum(c) !== s.disc[seat]) throw new Error(`딱 ${s.disc[seat]}장을 골라요`);
      pay(s, seat, c); delete s.disc[seat];
      log(s, { k: "disc", s: seat, n: sum(c) });
      if (!Object.keys(s.disc).length) { s.disc = null; s.phase = "robber"; }
      return;
    }
    if (s.trade && seat !== s.cur) {
      if (a.t !== "ans") throw new Error("거래 제안에 답해요");
      if (a.yes && !has(P.res, s.trade.get)) throw new Error("줄 자원이 없어요");
      s.trade.ans[seat] = !!a.yes;
      return;
    }
    if (seat !== s.cur) throw new Error("내 차례가 아니에요");

    if (s.phase === "setup") {
      const o = s.setup;
      if (o.step === "set" && a.t === "set") {
        if (!canSet(s, seat, a.v, true)) throw new Error("거기엔 마을을 못 지어요 (바로 옆에 건물이 있어요)");
        s.vb[a.v] = { p: seat, city: false }; P.sets--; o.lastV = a.v; o.step = "road";
        if (o.i >= s.n) for (const hi of V[a.v].h) { const r = s.hex[hi].res; if (r >= 0 && s.bank[r] > 0) { P.res[r]++; s.bank[r]--; } }
        log(s, { k: "set", s: seat });
        return;
      }
      if (o.step === "road" && a.t === "road") {
        if (!canRoad(s, seat, a.e, o.lastV)) throw new Error("방금 지은 마을에 붙여 길을 놓아요");
        s.eb[a.e] = seat; P.roads--;
        return nextSetup(s);
      }
      throw new Error(o.step === "set" ? "마을 자리를 골라요" : "길 자리를 골라요");
    }

    if (a.t === "play") {
      const i = P.dev.findIndex(d => d.k === a.k && !d.nw);
      if (i < 0 || a.k === "vp") throw new Error("쓸 수 있는 그 카드가 없어요");
      if (s.played) throw new Error("개척 카드는 차례에 한 장만 써요");
      if (!["roll", "main"].includes(s.phase)) throw new Error("지금은 카드를 못 써요");
      if (a.k !== "kn" && s.phase !== "main") throw new Error("경비대 말고는 주사위를 굴린 뒤에 써요");
      if (a.k === "yp") { if (!Array.isArray(a.r) || a.r.length !== 2 || a.r.some(r => !(r >= 0 && r < 5) || s.bank[r] < 1) || (a.r[0] === a.r[1] && s.bank[a.r[0]] < 2)) throw new Error("은행에 있는 자원 둘을 골라요"); }
      if (a.k === "mo" && !(a.r >= 0 && a.r < 5)) throw new Error("자원 하나를 골라요");
      P.dev.splice(i, 1); s.played = true;
      log(s, { k: "play", s: seat, d: a.k });
      if (a.k === "kn") { P.kn++; updLA(s, seat); s.phase = "robber"; checkWin(s); return; }
      if (a.k === "rb") { s.free = Math.min(2, P.roads); s.phase = s.free ? "road2" : "main"; return; }
      if (a.k === "yp") { for (const r of a.r) { P.res[r]++; s.bank[r]--; } checkWin(s); return; }
      if (a.k === "mo") { let got = 0; s.pl.forEach((q, j) => { if (j !== seat) { got += q.res[a.r]; P.res[a.r] += q.res[a.r]; q.res[a.r] = 0; } }); log(s, { k: "mono", s: seat, r: a.r, n: got }); return; }
    }

    if (s.phase === "roll") {
      if (a.t !== "roll") throw new Error("주사위를 먼저 굴려요");
      const d = [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)], n = d[0] + d[1];
      s.dice = d; log(s, { k: "roll", s: seat, d });
      if (n === 7) {
        const disc = {};
        s.pl.forEach((q, j) => { if (sum(q.res) > 7) disc[j] = Math.floor(sum(q.res) / 2); });
        if (Object.keys(disc).length) { s.disc = disc; s.phase = "disc"; } else s.phase = "robber";
      } else { const got = produce(s, n); s.got = got; s.phase = "main"; }
      return;
    }
    if (s.phase === "robber") {
      if (a.t !== "robber" || !(a.h >= 0 && a.h < 19) || a.h === s.robber) throw new Error("해적을 다른 땅으로 옮겨요");
      s.robber = a.h; log(s, { k: "rob", s: seat });
      return afterRobber(s);
    }
    if (s.phase === "steal") {
      if (a.t !== "steal" || !victims(s, seat).includes(a.p)) throw new Error("해적 옆 사람 중에 골라요");
      steal(s, a.p, rng); log(s, { k: "steal", s: seat, p: a.p });
      return backFromRobber(s);
    }
    if (s.phase === "road2") {
      if (a.t === "road") {
        if (!canRoad(s, seat, a.e)) throw new Error("내 길이나 건물에 이어서 놓아요");
        s.eb[a.e] = seat; P.roads--; s.free--; updLR(s); checkWin(s);
        if (s.phase !== "end" && (s.free <= 0 || !P.roads)) s.phase = "main";
        return;
      }
      if (a.t === "skip") { s.free = 0; s.phase = "main"; return; }
      throw new Error("공짜 길을 놓아요");
    }
    if (s.phase !== "main") throw new Error("지금은 할 수 없어요");

    if (s.trade) {
      if (a.t === "deal") {
        const q = a.p;
        if (!s.trade.ans[q]) throw new Error("받아 준 사람하고만 바꿀 수 있어요");
        if (!has(P.res, s.trade.give) || !has(s.pl[q].res, s.trade.get)) throw new Error("자원이 모자라요");
        s.trade.give.forEach((v, i) => { P.res[i] -= v; s.pl[q].res[i] += v; });
        s.trade.get.forEach((v, i) => { P.res[i] += v; s.pl[q].res[i] -= v; });
        log(s, { k: "trade", s: seat, p: q, give: s.trade.give, get: s.trade.get });
        s.trade = null; checkWin(s); return;
      }
      if (a.t === "cancel") { s.trade = null; return; }
      throw new Error("거래 제안을 먼저 끝내요");
    }
    switch (a.t) {
      case "road":
        if (!has(P.res, COST.road) || !P.roads) throw new Error("나무 1, 흙 1이 있어야 해요");
        if (!canRoad(s, seat, a.e)) throw new Error("내 길이나 건물에 이어서 놓아요");
        pay(s, seat, COST.road); s.eb[a.e] = seat; P.roads--; updLR(s); log(s, { k: "road", s: seat }); return checkWin(s);
      case "set":
        if (!has(P.res, COST.set) || !P.sets) throw new Error("나무, 흙, 양털, 밀이 하나씩 있어야 해요");
        if (!canSet(s, seat, a.v)) throw new Error("내 길 끝, 이웃 건물과 한 칸 떨어진 곳에만 지어요");
        pay(s, seat, COST.set); s.vb[a.v] = { p: seat, city: false }; P.sets--; updLR(s); log(s, { k: "set", s: seat }); return checkWin(s);
      case "city":
        if (!has(P.res, COST.city) || !P.cities) throw new Error("밀 2, 돌 3이 있어야 해요");
        if (s.vb[a.v]?.p !== seat || s.vb[a.v].city) throw new Error("내 마을을 골라요");
        pay(s, seat, COST.city); s.vb[a.v].city = true; P.cities--; P.sets++; log(s, { k: "city", s: seat }); return checkWin(s);
      case "dev":
        if (!has(P.res, COST.dev)) throw new Error("양털, 밀, 돌이 하나씩 있어야 해요");
        if (!s.devs.length) throw new Error("개척 카드가 다 떨어졌어요");
        pay(s, seat, COST.dev); P.dev.push({ k: s.devs.pop(), nw: true }); log(s, { k: "dev", s: seat }); return checkWin(s);
      case "bank": {
        const R = ratio(s, seat);
        if (!(a.give >= 0 && a.give < 5 && a.get >= 0 && a.get < 5) || a.give === a.get) throw new Error("다른 자원끼리 바꿔요");
        if (P.res[a.give] < R[a.give]) throw new Error(`${RES[a.give][0]}이(가) ${R[a.give]}장 있어야 해요`);
        if (s.bank[a.get] < 1) throw new Error("은행에 그 자원이 없어요");
        P.res[a.give] -= R[a.give]; s.bank[a.give] += R[a.give]; P.res[a.get]++; s.bank[a.get]--;
        log(s, { k: "bank", s: seat, give: a.give, n: R[a.give], get: a.get }); return;
      }
      case "offer":
        if (!Array.isArray(a.give) || !Array.isArray(a.get) || a.give.length !== 5 || a.get.length !== 5 || !sum(a.give) || !sum(a.get) || [...a.give, ...a.get].some(v => !(v >= 0))) throw new Error("줄 것과 받을 것을 하나 이상 골라요");
        if (a.give.some((v, i) => v && a.get[i])) throw new Error("같은 자원을 주고받을 수 없어요");
        if (!has(P.res, a.give)) throw new Error("줄 자원이 모자라요");
        s.trade = { give: a.give, get: a.get, ans: {} }; log(s, { k: "offer", s: seat, give: a.give, get: a.get }); return;
      case "end":
        for (const d of P.dev) d.nw = false;
        s.cur = (s.cur + 1) % s.n; s.phase = "roll"; s.dice = null; s.played = false; s.got = null;
        return;
    }
    throw new Error("모르는 행동이에요");
  },

  over(s) {
    if (s.phase !== "end") return null;
    const order = [...Array(s.n).keys()].sort((a, b) => (b === s.win) - (a === s.win) || vp(s, b) - vp(s, a));
    return { text: "섬을 가장 크게 일군 사람", rank: order.map((p, i) => [p, `${i + 1}등, ${vp(s, p)}점`]) };
  },

  bot(s, seat, rng) { return { delay: 700 + rng() * 600, a: botMove(s, seat, rng) }; },

  render(el, v, me, send, ui) { render(el, v, me, send, ui); }
};

// ───────── 봇 ─────────
function spotScore(s, v, p) {
  const seen = new Set();
  let sc = 0;
  for (const hi of V[v].h) { const t = s.hex[hi]; if (t.res < 0) continue; sc += pip(t.num) * (hi === s.robber ? .5 : 1); if (!seen.has(t.res)) { seen.add(t.res); sc += 1.2; } }
  const pl = p != null ? s.pl[p] : null;
  if (pl) for (const hi of V[v].h) { const r = s.hex[hi].res; if (r >= 0 && !s.vb.some((b, u) => b?.p === p && V[u].h.some(h2 => s.hex[h2].res === r))) sc += .8; }
  if (s.ports.some(pt => E[pt.e].a === v || E[pt.e].b === v)) sc += 1;
  return sc;
}
function botMove(s, p, rng) {
  const P = s.pl[p];
  if (s.phase === "disc") {
    const c = [0, 0, 0, 0, 0], r = [...P.res];
    for (let k = 0; k < s.disc[p]; k++) { let m = 0; for (let i = 1; i < 5; i++) if (r[i] > r[m]) m = i; r[m]--; c[m]++; }
    return { t: "disc", c };
  }
  if (s.trade && p !== s.cur) {
    const t = s.trade, need = goalNeed(s, p);
    const good = has(P.res, t.get) && t.give.some((v, i) => v && need[i] > 0) && t.get.every((v, i) => !v || P.res[i] - v >= need[i]) && vp(s, s.cur) < 8;
    return { t: "ans", yes: good };
  }
  if (s.trade && p === s.cur) {
    const q = Object.keys(s.trade.ans).find(k => s.trade.ans[k]);
    if (q != null) return { t: "deal", p: +q };
    return { t: "cancel" };
  }
  if (s.phase === "setup") {
    const o = s.setup;
    if (o.step === "set") {
      let best = -1, bv = -1;
      for (let v = 0; v < V.length; v++) if (canSet(s, p, v, true)) { const sc = spotScore(s, v, p) + rng() * .5; if (sc > bv) { bv = sc; best = v; } }
      return { t: "set", v: best };
    }
    const es = V[o.lastV].e.filter(e => canRoad(s, p, e, o.lastV));
    let best = es[0], bv = -1;
    for (const e of es) { const u = E[e].a === o.lastV ? E[e].b : E[e].a; const sc = Math.max(0, ...V[u].n.filter(w => canSet(s, p, w, true)).map(w => spotScore(s, w, p))) + rng(); if (sc > bv) { bv = sc; best = e; } }
    return { t: "road", e: best };
  }
  const knight = P.dev.some(d => d.k === "kn" && !d.nw) && !s.played;
  if (s.phase === "roll") {
    if (knight && HEX[s.robber].v.some(v => s.vb[v]?.p === p)) return { t: "play", k: "kn" };
    return { t: "roll" };
  }
  if (s.phase === "robber") {
    const lead = (q) => vp(s, q, false) + 1;
    let best = -1, bv = -1e9;
    HEX.forEach((h, hi) => {
      if (hi === s.robber || s.hex[hi].res < 0) return;
      let sc = 0;
      for (const v of h.v) { const b = s.vb[v]; if (!b) continue; sc += (b.p === p ? -10 : lead(b.p)) * pip(s.hex[hi].num) * (b.city ? 2 : 1); }
      sc += rng() * .1;
      if (sc > bv) { bv = sc; best = hi; }
    });
    return { t: "robber", h: best };
  }
  if (s.phase === "steal") { const vs = victims(s, p); return { t: "steal", p: vs.sort((a, b) => vp(s, b, false) - vp(s, a, false))[0] }; }
  if (s.phase === "road2") { const e = bestRoad(s, p); return e != null ? { t: "road", e } : { t: "skip" }; }
  // main
  if (P.dev.some(d => d.k === "mo" && !d.nw) && !s.played) {
    const tot = [0, 1, 2, 3, 4].map(r => sum(s.pl.map((q, j) => j === p ? 0 : q.res[r])));
    const r = tot.indexOf(Math.max(...tot)); if (tot[r] >= 4) return { t: "play", k: "mo", r };
  }
  if (P.dev.some(d => d.k === "yp" && !d.nw) && !s.played) {
    const need = goalNeed(s, p), r = [];
    need.forEach((n, i) => { for (let k = 0; k < n && r.length < 2; k++) if (s.bank[i] > k) r.push(i); });
    while (r.length < 2) r.push([3, 4, 0, 1, 2].find(i => s.bank[i] > 0));
    return { t: "play", k: "yp", r };
  }
  if (P.dev.some(d => d.k === "rb" && !d.nw) && !s.played && P.roads >= 2 && bestRoad(s, p) != null) return { t: "play", k: "rb" };
  if (knight && rng() < .3) return { t: "play", k: "kn" };
  const city = s.vb.findIndex(b => b && b.p === p && !b.city);
  if (city >= 0 && has(P.res, COST.city) && P.cities) return { t: "city", v: city };
  const spot = bestSpot(s, p);
  if (spot != null && has(P.res, COST.set) && P.sets) return { t: "set", v: spot };
  if (spot == null && has(P.res, COST.road) && P.roads) { const e = bestRoad(s, p); if (e != null) return { t: "road", e }; }
  if (has(P.res, COST.dev) && s.devs.length && (spot == null || sum(P.res) > 6)) return { t: "dev" };
  // 은행 거래: 남는 걸로 모자란 걸
  const need = goalNeed(s, p), R = ratio(s, p);
  const want = need.findIndex((n, i) => n > 0 && s.bank[i] > 0);
  if (want >= 0) {
    const give = [0, 1, 2, 3, 4].find(i => i !== want && P.res[i] >= R[i] && need[i] <= -R[i]);
    if (give != null) return { t: "bank", give, get: want };
  }
  if (sum(P.res) > 7) { // 7에 대비해 길이라도
    if (has(P.res, COST.road) && P.roads) { const e = bestRoad(s, p); if (e != null) return { t: "road", e }; }
  }
  return { t: "end" };
}
function goalNeed(s, p) {
  const P = s.pl[p];
  const goal = s.vb.some(b => b && b.p === p && !b.city) && P.cities && (P.res[3] + P.res[4] >= 3) ? COST.city : bestSpot(s, p) != null ? COST.set : COST.road;
  return goal.map((c, i) => c - P.res[i]);
}
function bestSpot(s, p) {
  let best = null, bv = -1;
  for (let v = 0; v < V.length; v++) if (canSet(s, p, v)) { const sc = spotScore(s, v, p); if (sc > bv) { bv = sc; best = v; } }
  return best;
}
function bestRoad(s, p) {
  let best = null, bv = -1e9;
  for (let e = 0; e < E.length; e++) {
    if (!canRoad(s, p, e)) continue;
    let sc = 0;
    for (const v of [E[e].a, E[e].b]) if (!s.vb[v] && !V[v].n.some(u => s.vb[u])) sc = Math.max(sc, spotScore(s, v, p));
    for (const v of [E[e].a, E[e].b]) for (const u of V[v].n) if (!s.vb[u] && !V[u].n.some(w => s.vb[w])) sc = Math.max(sc, spotScore(s, u, p) * .6);
    sc += Math.random() * .2;
    if (sc > bv) { bv = sc; best = e; }
  }
  return best;
}

// ───────── 화면 ─────────
const UI = { mode: null, give: [0, 0, 0, 0, 0], get: [0, 0, 0, 0, 0], yp: [], panel: null, disc: null };
const resChip = (r, n, attrs = "") => `<span class="rc" style="--r:${RES[r][1]}" ${attrs}><b>${n}</b><small>${RES[r][0]}</small></span>`;
const cost = c => c.map((n, r) => n ? `<i style="--r:${RES[r][1]}">${n}</i>` : "").join("");

function board(v, me, mode, can) {
  const xs = V.map(p => p.x), ys = V.map(p => p.y);
  const pad = .9, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad;
  const poly = hx => hx.v.map(i => `${V[i].x.toFixed(3)},${V[i].y.toFixed(3)}`).join(" ");
  let g = "";
  HEX.forEach((hx, i) => {
    const t = v.hex[i], col = t.res < 0 ? "#e2cf9a" : RES[t.res][1];
    g += `<polygon class="hx${mode === "robber" && i !== v.robber ? " pick" : ""}" data-h="${i}" points="${poly(hx)}" fill="${col}"/>`;
    if (t.num) g += `<circle cx="${hx.x}" cy="${hx.y}" r=".36" class="tok"/><text x="${hx.x}" y="${hx.y + .13}" class="num${t.num === 6 || t.num === 8 ? " hot" : ""}">${t.num}</text><text x="${hx.x}" y="${hx.y + .3}" class="dots">${"•".repeat(pip(t.num))}</text>`;
    if (i === v.robber) g += `<g class="rob"><circle cx="${hx.x}" cy="${hx.y - .5}" r=".3"/><text x="${hx.x}" y="${hx.y - .44}">해적</text></g>`;
  });
  for (const pt of v.ports) {
    const e = E[pt.e], mx = (V[e.a].x + V[e.b].x) / 2, my = (V[e.a].y + V[e.b].y) / 2, d = Math.hypot(mx, my), px = mx + mx / d * .5, py = my + my / d * .5;
    g += `<line x1="${V[e.a].x}" y1="${V[e.a].y}" x2="${px}" y2="${py}" class="pier"/><line x1="${V[e.b].x}" y1="${V[e.b].y}" x2="${px}" y2="${py}" class="pier"/>`;
    g += `<circle cx="${px}" cy="${py}" r=".28" class="port" style="fill:${pt.r < 0 ? "#fff" : RES[pt.r][1]}"/><text x="${px}" y="${py + .09}" class="pt">${pt.r < 0 ? "3:1" : "2:1"}</text>`;
  }
  E.forEach((e, i) => {
    const o = v.eb[i];
    if (o != null) g += `<line x1="${V[e.a].x}" y1="${V[e.a].y}" x2="${V[e.b].x}" y2="${V[e.b].y}" class="road" style="stroke:${SEAT[o]}"/>`;
    else if (mode === "road" && can.e?.has(i)) g += `<line x1="${V[e.a].x}" y1="${V[e.a].y}" x2="${V[e.b].x}" y2="${V[e.b].y}" class="hot-e" data-e="${i}"/>`;
  });
  V.forEach((p, i) => {
    const b = v.vb[i];
    if (b) g += b.city ? `<rect x="${p.x - .2}" y="${p.y - .2}" width=".4" height=".4" rx=".06" class="city${mode === "city" && can.v?.has(i) ? " hot-v" : ""}" style="fill:${SEAT[b.p]}" data-v="${i}"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r=".21" class="town${mode === "city" && can.v?.has(i) ? " hot-v" : ""}" style="fill:${SEAT[b.p]}" data-v="${i}"/>`;
    else if (mode === "set" && can.v?.has(i)) g += `<circle cx="${p.x}" cy="${p.y}" r=".17" class="hot-v" data-v="${i}"/>`;
  });
  return `<svg class="map" viewBox="${x0} ${y0} ${w} ${h}">${g}</svg>`;
}

function legal(v, me) {
  // 화면에서 누를 수 있는 자리 (판정은 방장이 다시 한다)
  const s = { vb: v.vb, eb: v.eb };
  const mode = UI.mode, out = {};
  const setup = v.phase === "setup";
  if (mode === "set") out.v = new Set(V.map((_, i) => i).filter(i => canSet(s, me, i, setup)));
  if (mode === "road") out.e = new Set(E.map((_, i) => i).filter(i => canRoad(s, me, i, setup ? v.setup.lastV : null)));
  if (mode === "city") out.v = new Set(V.map((_, i) => i).filter(i => v.vb[i]?.p === me && !v.vb[i].city));
  return out;
}

function render(el, v, me, send, ui) {
  const n = ui.names, P = me >= 0 ? v.pl[me] : null, my = v.cur === me && v.phase !== "end";
  UIname = i => n[i];
  // 상황에 따라 모드 자동
  if (UI.ph !== v.phase || !my) { UI.mode = null; UI.ph = v.phase; }
  if (my && v.phase === "setup") UI.mode = v.setup.step === "set" ? "set" : "road";
  if (my && v.phase === "robber") UI.mode = "robber";
  if (my && v.phase === "road2") UI.mode = "road";
  if (my && v.phase === "main" && ["robber"].includes(UI.mode)) UI.mode = null;
  const can = legal(v, me);
  const R = v.ratio, res = P?.res;
  const afford = c => res && c.every((x, i) => res[i] >= x);
  let say;
  if (v.phase === "end") say = "판이 끝났어요";
  else if (v.phase === "disc") say = me in (v.disc || {}) ? `7이 나왔어요. ${v.disc[me]}장을 버려요` : "7이 나와서 카드가 많은 사람이 버리는 중";
  else if (v.trade && v.cur !== me) say = `${esc(n[v.cur])}이(가) 거래를 제안했어요`;
  else if (!my) say = `${esc(n[v.cur])} 차례예요`;
  else say = { setup: v.setup?.step === "set" ? "처음 마을 자리를 골라요 (빛나는 점)" : "마을에 붙여 길을 놓아요", roll: "주사위를 굴려요", robber: "해적을 옮길 땅을 눌러요", steal: "한 장 뺏을 사람을 골라요", road2: `공짜 길 ${v.free}개를 놓아요`, main: v.trade ? "거래 답을 기다려요" : UI.mode ? { road: "길 놓을 곳을 눌러요", set: "마을 지을 곳을 눌러요", city: "도시로 바꿀 마을을 눌러요" }[UI.mode] : "짓거나 바꾸고, 다 했으면 차례 끝" }[v.phase];

  const others = v.pl.map((p, i) => i).filter(i => i !== me);
  el.innerHTML = `<div class="isle">
    <p class="say">${say}${v.dice ? `<span class="dd">${v.dice[0]} + ${v.dice[1]} = ${v.dice[0] + v.dice[1]}</span>` : ""}</p>
    <div class="mapw">${board(v, me, UI.mode, can)}</div>
    <ol class="others">${v.pl.map((p, i) => `<li style="--s:${SEAT[i]}" class="${i === v.cur ? "cur" : ""}${i === me ? " me" : ""}"><b>${esc(n[i])}</b><span>${p.vp}점</span><small>카드 ${p.nres}, 개척 ${p.ndev}, 경비 ${p.kn}, 길 ${p.lr}${v.lr === i ? " 가장 긴 길" : ""}${v.la === i ? ", 가장 큰 경비대" : ""}</small></li>`).join("")}</ol>
    ${P ? `<div class="hand">${res.map((x, r) => resChip(r, x)).join("")}</div>` : ""}
    <div class="acts">${actions(v, me, my, P, afford, R)}</div>
    ${P && P.dev.length ? `<div class="devs">${P.dev.map((d, i) => `<button class="dv${d.nw || d.k === "vp" ? " dim" : ""}" data-dev="${d.k}" ${!my || d.nw || d.k === "vp" || v.played || !["roll", "main"].includes(v.phase) || (d.k !== "kn" && v.phase !== "main") ? "disabled" : ""}><b>${DEV[d.k]}</b><small>${d.nw ? "다음 차례부터" : DEVTXT[d.k]}</small></button>`).join("")}</div>` : ""}
    ${panel(v, me, my, P, R, n)}
    <ol class="log">${v.log.map(x => `<li>${line(x, n)}</li>`).join("")}</ol>
  </div>`;
  const re = () => render(el, v, me, send, ui);
  el.querySelectorAll("[data-v].hot-v").forEach(b => b.onclick = () => { const m = UI.mode; if (v.phase !== "setup" && v.phase !== "road2") UI.mode = null; send({ t: m === "city" ? "city" : "set", v: +b.dataset.v }); });
  el.querySelectorAll("[data-e].hot-e").forEach(b => b.onclick = () => { if (v.phase === "main") UI.mode = null; send({ t: "road", e: +b.dataset.e }); });
  if (UI.mode === "robber") el.querySelectorAll(".hx.pick").forEach(b => b.onclick = () => send({ t: "robber", h: +b.dataset.h }));
  el.querySelectorAll("[data-do]").forEach(b => b.onclick = () => {
    const d = b.dataset.do;
    if (["road", "set", "city"].includes(d)) { UI.mode = UI.mode === d ? null : d; return re(); }
    if (d === "trade" || d === "bankp") { UI.panel = UI.panel === d ? null : d; UI.give = [0, 0, 0, 0, 0]; UI.get = [0, 0, 0, 0, 0]; return re(); }
    send({ t: d });
  });
  el.querySelectorAll("[data-steal]").forEach(b => b.onclick = () => send({ t: "steal", p: +b.dataset.steal }));
  el.querySelectorAll("[data-dev]").forEach(b => b.onclick = () => {
    const k = b.dataset.dev;
    if (k === "yp" || k === "mo") { UI.panel = k; UI.yp = []; return re(); }
    send({ t: "play", k });
  });
  el.querySelectorAll("[data-ans]").forEach(b => b.onclick = () => send({ t: "ans", yes: b.dataset.ans === "1" }));
  el.querySelectorAll("[data-deal]").forEach(b => b.onclick = () => send({ t: "deal", p: +b.dataset.deal }));
  el.querySelector("[data-cancel]")?.addEventListener("click", () => send({ t: "cancel" }));
  el.querySelectorAll("[data-tg]").forEach(b => b.onclick = () => {
    const [side, r, d] = b.dataset.tg.split(","), arr = side === "g" ? UI.give : UI.get;
    arr[+r] = Math.max(0, arr[+r] + +d); return re();
  });
  el.querySelector("[data-offer]")?.addEventListener("click", () => { UI.panel = null; send({ t: "offer", give: UI.give, get: UI.get }); });
  el.querySelectorAll("[data-bank]").forEach(b => b.onclick = () => { const [g, t] = b.dataset.bank.split(","); send({ t: "bank", give: +g, get: +t }); });
  el.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => {
    const r = +b.dataset.pick;
    if (UI.panel === "mo") { UI.panel = null; return send({ t: "play", k: "mo", r }); }
    UI.yp.push(r); if (UI.yp.length === 2) { const x = UI.yp; UI.yp = []; UI.panel = null; return send({ t: "play", k: "yp", r: x }); }
    re();
  });
  el.querySelectorAll("[data-dc]").forEach(b => b.onclick = () => { UI.disc = UI.disc || [0, 0, 0, 0, 0]; const r = +b.dataset.dc; if (UI.disc[r] < P.res[r]) UI.disc[r]++; re(); });
  el.querySelector("[data-discgo]")?.addEventListener("click", () => { const c = UI.disc || [0, 0, 0, 0, 0]; UI.disc = null; send({ t: "disc", c }); });
  el.querySelector("[data-discclr]")?.addEventListener("click", () => { UI.disc = null; re(); });
  el.querySelector("[data-close]")?.addEventListener("click", () => { UI.panel = null; re(); });
}

function actions(v, me, my, P, afford, R) {
  if (!P) return "";
  if (v.phase === "disc" && me in (v.disc || {})) {
    const d = UI.disc || [0, 0, 0, 0, 0];
    return `<div class="discp"><p>버릴 카드를 눌러요 (${sum(d)}/${v.disc[me]})</p>${P.res.map((x, r) => x ? `<button class="rc" style="--r:${RES[r][1]}" data-dc="${r}"><b>${x - d[r]}</b><small>${RES[r][0]}</small></button>` : "").join("")}
      <button data-discgo ${sum(d) === v.disc[me] ? "" : "disabled"}>버리기</button><button class="ghost" data-discclr>다시</button></div>`;
  }
  if (v.trade && v.cur !== me) {
    const t = v.trade, answered = me in t.ans;
    return `<div class="offer"><p>${tradeTxt(t.give)} 줄게, ${tradeTxt(t.get)} 줘</p>${answered ? `<p class="dim">${t.ans[me] ? "받겠다고 했어요" : "거절했어요"}</p>` : `<button data-ans="1" ${P.res.every((x, i) => x >= t.get[i]) ? "" : "disabled"}>좋아요</button><button class="ghost" data-ans="0">싫어요</button>`}</div>`;
  }
  if (!my) return "";
  if (v.phase === "roll") return `<button data-do="roll" class="main">주사위 굴리기</button>`;
  if (v.phase === "steal") {
    const vs = [...new Set(HEX[v.robber].v.map(i => v.vb[i]?.p).filter(q => q != null && q !== me && v.pl[q].nres > 0))];
    return vs.map(q => `<button data-steal="${q}" style="background:${SEAT[q]}">${esc(UIname(q))}에게서 뺏기</button>`).join("");
  }
  if (v.phase === "road2") return `<button class="ghost" data-do="skip">남은 공짜 길 안 놓기</button>`;
  if (v.phase !== "main") return "";
  if (v.trade) {
    const t = v.trade, yes = Object.keys(t.ans).filter(k => t.ans[k]).map(Number);
    return `<div class="offer"><p>${tradeTxt(t.give)} 주고 ${tradeTxt(t.get)} 받기 제안 중</p>${yes.map(q => `<button data-deal="${q}" style="background:${SEAT[q]}">${esc(UIname(q))}와 바꾸기</button>`).join("")}<button class="ghost" data-cancel>제안 거두기</button></div>`;
  }
  const b = (d, label, c, ok) => `<button data-do="${d}" class="${UI.mode === d ? "on" : ""}" ${ok ? "" : "disabled"}><b>${label}</b><span class="cost">${cost(c)}</span></button>`;
  return `<div class="build">
    ${b("road", "길", COST.road, afford(COST.road) && P.roads)}
    ${b("set", "마을", COST.set, afford(COST.set) && P.sets)}
    ${b("city", "도시", COST.city, afford(COST.city) && P.cities)}
    ${b("dev", "개척 카드", COST.dev, afford(COST.dev) && v.devN)}
  </div><div class="row"><button class="ghost" data-do="bankp">은행 거래</button><button class="ghost" data-do="trade">사람과 거래</button><button data-do="end" class="endt">차례 끝</button></div>`;
}
let UIname = i => "";
function panel(v, me, my, P, R, n) {
  UIname = i => n[i];
  if (!P || !my || v.phase !== "main") return "";
  if (UI.panel === "bankp") {
    return `<div class="sheet"><div class="in"><p>은행에 주고 하나 받기 (항구가 있으면 싸져요)</p>
      ${[0, 1, 2, 3, 4].map(g => `<div class="brow">${resChip(g, `${R[g]}장`)}<span>주고</span>${[0, 1, 2, 3, 4].filter(t => t !== g).map(t => `<button class="rc" style="--r:${RES[t][1]}" data-bank="${g},${t}" ${P.res[g] >= R[g] && v.bank[t] ? "" : "disabled"}><small>${RES[t][0]}</small></button>`).join("")}</div>`).join("")}
      <button class="ghost" data-close>닫기</button></div></div>`;
  }
  if (UI.panel === "trade") {
    const row = (side, arr) => [0, 1, 2, 3, 4].map(r => `<div class="tg"><span class="rc" style="--r:${RES[r][1]}"><b>${arr[r]}</b><small>${RES[r][0]}</small></span><button data-tg="${side},${r},1" ${side === "g" && arr[r] >= P.res[r] ? "disabled" : ""}>+</button><button class="ghost" data-tg="${side},${r},-1" ${arr[r] ? "" : "disabled"}>-</button></div>`).join("");
    return `<div class="sheet"><div class="in"><p>내가 줄 것</p><div class="tgr">${row("g", UI.give)}</div><p>내가 받을 것</p><div class="tgr">${row("t", UI.get)}</div>
      <button data-offer ${sum(UI.give) && sum(UI.get) ? "" : "disabled"}>모두에게 제안하기</button><button class="ghost" data-close>닫기</button></div></div>`;
  }
  if (UI.panel === "yp" || UI.panel === "mo") {
    return `<div class="sheet"><div class="in"><p>${UI.panel === "yp" ? `받을 자원 둘을 골라요 (${UI.yp.length}/2)` : "모두에게서 받을 자원을 골라요"}</p>
      ${[0, 1, 2, 3, 4].map(r => `<button class="rc" style="--r:${RES[r][1]}" data-pick="${r}"><small>${RES[r][0]}</small></button>`).join("")}<button class="ghost" data-close>닫기</button></div></div>`;
  }
  return "";
}
const tradeTxt = a => a.map((x, r) => x ? `${RES[r][0]} ${x}` : "").filter(Boolean).join(", ");

function line(x, n) {
  const b = i => `<b style="color:${SEAT[i]}">${esc(n[i])}</b>`;
  switch (x.k) {
    case "roll": return `${b(x.s)} 주사위 ${x.d[0]}+${x.d[1]}=${x.d[0] + x.d[1]}`;
    case "set": return `${b(x.s)} 마을`;
    case "city": return `${b(x.s)} 도시`;
    case "road": return `${b(x.s)} 길`;
    case "dev": return `${b(x.s)} 개척 카드를 삼`;
    case "play": return `${b(x.s)} ${DEV[x.d]} 사용`;
    case "mono": return `${b(x.s)} ${RES[x.r][0]} ${x.n}장을 모두에게서 받음`;
    case "disc": return `${b(x.s)} ${x.n}장 버림`;
    case "rob": return `${b(x.s)} 해적을 옮김`;
    case "steal": return `${b(x.s)}: ${b(x.p)}에게서 한 장 뺏음`;
    case "bank": return `${b(x.s)} 은행에 ${RES[x.give][0]} ${x.n}장 주고 ${RES[x.get][0]}`;
    case "offer": return `${b(x.s)} 제안: ${tradeTxt(x.give)} 주고 ${tradeTxt(x.get)} 받기`;
    case "trade": return `${b(x.s)}, ${b(x.p)} 거래`;
    case "lr": return `${b(x.s)} 가장 긴 길 (${x.n})`;
    case "la": return `${b(x.s)} 가장 큰 경비대`;
  }
  return "";
}
