"use strict";
/* ===================== AI 3장 — shared visual helpers ===================== */
(function () {
  const st = document.createElement("style");
  st.textContent = `
.gn{display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:800;color:#fff;background:#16161c;border:3px solid rgba(255,255,255,.3);font-family:"JBM","Noto Sans KR",monospace;line-height:1}
.gl{position:absolute;font-size:21px;font-weight:600;color:rgba(255,255,255,.78);white-space:nowrap}
.wl{font:700 20px "JBM",monospace;color:#ffd479;background:rgba(8,8,12,.82);padding:2px 9px;border-radius:9px;border:1px solid rgba(255,212,121,.25)}
.dsp{border-radius:22px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1)}
.dsl{position:absolute;left:24px;top:16px;font-size:17px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.45)}
.dsh{position:absolute;font-size:18px;color:rgba(255,255,255,.55);font-weight:600;white-space:nowrap}
.dsi{position:absolute;left:0;top:0;display:flex;align-items:center;border-radius:12px;font-weight:800;background:rgba(48,209,88,.16);border:2px solid rgba(48,209,88,.75);color:#fff;white-space:nowrap;overflow:hidden}
.dsi small{font-weight:500;color:rgba(255,255,255,.62);font-family:"JBM","Noto Sans KR",monospace}
.dsi .ky{margin-left:auto;font-family:"JBM",monospace;color:#ffd479}
.cardx{border-radius:22px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.lab{font-size:17px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.45)}
.tg{display:grid;font-size:26px}
.tg>div{padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap}
.tg .hd{font-weight:800;color:rgba(255,255,255,.55);font-size:21px;letter-spacing:.04em}
.fx{font-family:"JBM","Noto Sans KR",monospace;font-weight:700}
.pill{display:inline-block;padding:4px 14px;border-radius:999px;font-weight:700}
.leg{display:flex;gap:22px;font-size:19px;color:rgba(255,255,255,.7);align-items:center;white-space:nowrap}
.leg i{display:inline-block;width:18px;height:18px;border-radius:50%;margin-right:7px;vertical-align:-3px;border:3px solid}
`;
  document.head.appendChild(st);
})();

const COL = { fr: "#30d158", ex: "#7d7aff", cur: "#ffd60a", path: "#ff9f0a", st: "#64d2ff", goal: "#ff453a", warn: "#ff453a", ok: "#30d158", gold: "#ffd479" };

/* ---------- beat-synced scene: captions drive timing ---------- */
function capDur(s) { return clamp(1.7 + plainLen(s) * 0.085, 3.0, 9.5); }
function sc(ch, name, items, build, o = {}) {
  const B = [], caps = []; let t = o.t0 == null ? 0.8 : o.t0;
  items.forEach(it => {
    const [s, d] = Array.isArray(it) ? it : [it, null];
    const dd = d == null ? capDur(s) : d;
    B.push(t); if (s) caps.push([t, t + dd, s]); t += dd + 0.25;
  });
  B.push(t);
  return add({ ch, name, dur: t + (o.tail == null ? 0.9 : o.tail), caps, hud: o.hud, build: root => build(root, B) });
}

/* ---------- small DOM helpers ---------- */
function box(root, x, y, w, hh, html, cls, c) { return at(root, x, y, cls == null ? "cardx" : cls, html, Object.assign({ width: w, height: hh }, c || {})); }
function label(root, x, y, s, c, center = true) { return at(root, x, y, "", s, Object.assign({ fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }, c || {}), center); }
function setBg(el, v) { if (el._bgc !== v) { el.style.background = v; el._bgc = v; } }
function setCol(el, v) { if (el._fc !== v) { el.style.color = v; el._fc = v; } }
function setBd(el, v) { if (el._bdc !== v) { el.style.borderColor = v; el._bdc = v; } }
function glow2(el, e, col) {
  e = clamp(e); const key = e.toFixed(2) + col;
  if (el._g2 === key) return; el._g2 = key;
  el.style.boxShadow = e > 0.01 ? `0 0 ${(40 * e).toFixed(0)}px color-mix(in srgb, ${col} ${(70 * e).toFixed(0)}%, transparent)` : "";
}
/* table: cols = widths, rows = [[cells]], first row header */
function tbl(root, x, y, cols, rows, c) {
  const el = at(root, x, y, "tg", null, Object.assign({ gridTemplateColumns: cols.map(w => w + "px").join(" ") }, c || {}));
  const R = rows.map((r, i) => r.map(s => { const d = h(el, i === 0 ? "hd" : "", s); return d; }));
  return { el, R, row(i, q) { R[i].forEach(d => S(d, { o: q, x: (1 - q) * -20 })); } };
}

/* ---------- graph nodes / edges ---------- */
const NST = {
  "": ["#16161c", "rgba(255,255,255,.3)", "#fff"],
  fr: ["rgba(48,209,88,.24)", COL.fr, "#fff"],
  ex: ["rgba(125,122,255,.34)", COL.ex, "#fff"],
  cur: [COL.cur, COL.cur, "#000"],
  path: [COL.path, COL.path, "#000"],
  goal: ["#16161c", COL.goal, "#fff"],
  st: ["#16161c", COL.st, "#fff"],
  dim: ["#0e0e12", "rgba(255,255,255,.12)", "rgba(255,255,255,.35)"],
  bad: ["rgba(255,69,58,.25)", COL.warn, "#fff"],
};
function gnode(root, x, y, lab, r = 34, c) {
  const e = at(root, x, y, "gn", lab, Object.assign({ width: r * 2, height: r * 2, fontSize: Math.round(r * 0.9) }, c || {}), true);
  e.X = x; e.Y = y; e.R = r; return e;
}
function nst(el, s) { if (el._ns === s) return; el._ns = s; const v = NST[s] || NST[""]; el.style.background = v[0]; el.style.borderColor = v[1]; el.style.color = v[2]; el.style.boxShadow = s === "cur" ? "0 0 40px rgba(255,214,10,.7)" : s === "path" ? "0 0 30px rgba(255,159,10,.55)" : ""; }
function gedge(svg, root, A, B, o = {}) {
  const dx = B.X - A.X, dy = B.Y - A.Y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, bend = o.bend || 0;
  const x0 = A.X + ux * (A.R + 2), y0 = A.Y + uy * (A.R + 2), x1 = B.X - ux * (B.R + 4), y1 = B.Y - uy * (B.R + 4);
  const cx = (x0 + x1) / 2 + nx * bend, cy = (y0 + y1) / 2 + ny * bend;
  const g = sv(svg, "g", {});
  const w = o.w || 3;
  const p = sv(g, "path", { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, fill: "none", "stroke-width": w, "stroke-linecap": "round", pathLength: 1 });
  let hd = null;
  if (o.dir) { const a = Math.atan2(y1 - cy, x1 - cx), H = 15; hd = sv(g, "path", { d: `M${x1 - H * Math.cos(a - 0.42)} ${y1 - H * Math.sin(a - 0.42)} L${x1} ${y1} L${x1 - H * Math.cos(a + 0.42)} ${y1 - H * Math.sin(a + 0.42)}`, fill: "none", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }); }
  let lab = null;
  if (o.wt != null && root) { const lo = o.lo || 0; lab = at(root, (x0 + 2 * cx + x1) / 4 + nx * lo, (y0 + 2 * cy + y1) / 4 + ny * lo, "wl", String(o.wt), {}, true); }
  let last = "";
  return {
    g, p, lab, mid: [(x0 + 2 * cx + x1) / 4, (y0 + 2 * cy + y1) / 4],
    set(v, col = "rgba(255,255,255,.35)", op = 1, ww) {
      v = clamp(v); const key = v.toFixed(3) + col + op.toFixed(2) + (ww || w);
      if (key === last) return; last = key;
      p.setAttribute("stroke", col); p.setAttribute("stroke-width", ww || w);
      p.style.strokeDasharray = "1 1"; p.style.strokeDashoffset = 1 - v;
      if (hd) { hd.setAttribute("stroke", col); hd.setAttribute("stroke-width", ww || w); hd.style.opacity = v > 0.97 ? 1 : 0; }
      g.style.opacity = v <= 0 ? 0 : op;
    },
  };
}

/* ---------- frontier data-structure panel ----------
   kind: q (FIFO queue, horizontal) | s (LIFO stack) | pq (priority queue)
   items: {id, lab, sub, key}                                              */
function dsPanel(root, x, y, w, hh, kind, nmax, o = {}) {
  const T = { q: "FRONTIER · 큐 (FIFO)", s: "FRONTIER · 스택 (LIFO)", pq: "FRONTIER · 우선순위 큐" }[kind];
  const el = at(root, x, y, "dsp", `<div class="dsl">${o.title || T}</div>`, { width: w, height: hh });
  const pad = 24, top = 58;
  let iw, ih, fs;
  if (kind === "q") { iw = Math.min(100, Math.floor((w - 2 * pad - 50 - (nmax - 1) * 10) / nmax)); ih = Math.min(120, hh - top - 60); fs = Math.round(iw * 0.36); }
  else { iw = w - 2 * pad; ih = Math.min(58, Math.floor((hh - top - 46) / nmax) - 6); fs = Math.round(Math.min(26, ih * 0.52)); }
  const gap = kind === "q" ? 10 : 6;
  if (kind === "q") { h(el, "dsh", "← 꺼냄 (front)", { left: pad, bottom: 16 }); h(el, "dsh", "넣음 (back) ←", { right: pad, bottom: 16 }); }
  if (kind === "s") h(el, "dsh", "↑ 맨 위(top)에서 넣고 꺼냄", { right: pad, top: 18 });
  if (kind === "pq") h(el, "dsh", o.keyName ? "작은 " + o.keyName + "부터 꺼냄 ↑" : "작은 값부터 꺼냄 ↑", { right: pad, top: 18 });
  const lane = h(el, "ab", null, { left: 0, top: 0, width: w, height: hh });
  const items = {};
  const mk = it => {
    let html;
    if (kind === "q") html = `<div style="width:100%;text-align:center"><div style="font-size:${fs}px;line-height:1.1">${it.lab}</div>${it.sub ? `<small style="font-size:${Math.round(fs * 0.5)}px">${it.sub}</small>` : ""}</div>`;
    else html = `<span style="font-size:${fs}px;padding-left:16px">${it.lab}</span>${it.sub ? `<small style="font-size:${Math.round(fs * 0.72)}px;margin-left:14px">${it.sub}</small>` : ""}${it.key != null ? `<span class="ky" style="font-size:${fs}px;padding-right:16px">${it.key}</span>` : ""}`;
    const e = h(lane, "dsi", html, { width: iw, height: ih, justifyContent: kind === "q" ? "center" : "flex-start" });
    S(e, { o: 0 }); e._html = html; return e;
  };
  const pos = (list, id) => {
    const i = list.findIndex(a => a.id === id); if (i < 0) return null;
    if (kind === "q") return [pad + i * (iw + gap), top + (hh - top - 50 - ih) / 2];
    if (kind === "s") return [pad, hh - 18 - (i + 1) * (ih + gap)];
    return [pad, top + 4 + i * (ih + gap)];
  };
  const outV = kind === "q" ? [-iw - 40, 0] : [0, -ih - 20];
  const inV = kind === "q" ? [80, 0] : kind === "s" ? [0, -90] : [60, 0];
  return {
    el,
    /* A=before, M=after pop, B=after push; p1 pop progress, p2 push progress, hot = id being popped */
    upd(A, M, Bl, p1, p2, hot) {
      const ids = new Set(); [A, M, Bl].forEach(l => l.forEach(a => ids.add(a.id)));
      for (const id in items) if (!ids.has(id)) S(items[id], { o: 0 });
      ids.forEach(id => {
        const it = (Bl.find(a => a.id === id) || M.find(a => a.id === id) || A.find(a => a.id === id));
        const e = items[id] || (items[id] = mk(it));
        const itA = A.find(a => a.id === id), itB = Bl.find(a => a.id === id);
        const cur = p2 > 0.5 && itB ? itB : (itA || it);
        if (e._lab !== cur.lab + "|" + cur.key + "|" + cur.sub) { e._lab = cur.lab + "|" + cur.key + "|" + cur.sub; const tmp = mk(cur); e.innerHTML = tmp.innerHTML; tmp.remove(); }
        const a = pos(A, id), m = pos(M, id), b = pos(Bl, id);
        let X, Y, op = 1, sc2 = 1, hl = 0;
        if (a && !m) { // popped
          const q = E.io3(p1); X = a[0] + outV[0] * q; Y = a[1] + outV[1] * q; op = 1 - K(p1, 0.55, 0.45); hl = 1; sc2 = 1 + 0.08 * Math.sin(Math.PI * p1);
        } else if (!a && m) { X = m[0]; Y = m[1]; op = 1; } // (not used)
        else if (a && m) {
          const q = E.io3(p1); let px = lerp(a[0], m[0], q), py = lerp(a[1], m[1], q);
          if (b) { const r = E.io3(p2); X = lerp(px, b[0], r); Y = lerp(py, b[1], r); } else { X = px; Y = py; op = 1 - p2; }
          if (itA && itB && itA.key !== itB.key) hl = 2 * Math.sin(Math.PI * clamp(p2));
        } else if (b) { // newly pushed
          const r = E.o5(p2); X = b[0] + inV[0] * (1 - r); Y = b[1] + inV[1] * (1 - r); op = clamp(p2 * 2); sc2 = 0.85 + 0.15 * r;
        } else { op = 0; X = 0; Y = 0; }
        S(e, { o: op, x: X, y: Y, s: sc2 });
        const bg = id === hot && a && !m ? [COL.cur, COL.cur, "#000"] : hl > 0.5 ? ["rgba(255,214,121,.25)", COL.gold, "#fff"] : ["rgba(48,209,88,.16)", "rgba(48,209,88,.75)", "#fff"];
        setBg(e, bg[0]); setBd(e, bg[1]); setCol(e, bg[2]);
      });
    },
  };
}

/* ---------- search tracer ----------
   G = {adj:{s:[[t,c],...]}, h:{s:n}}; alg: bfs|ucs|dfs|greedy|astar                */
function runSearch(G, alg, start, goal) {
  let seq = 0;
  const mkN = (st, par, c) => ({ id: st + "#" + seq++, st, par, g: par ? par.g + c : 0, d: par ? par.d + 1 : 0 });
  const pathOf = n => { const p = []; for (let x = n; x; x = x.par) p.unshift(x.st); return p; };
  const hf = s => (G.h ? G.h[s] : 0);
  const fOf = n => alg === "ucs" ? n.g : alg === "greedy" ? hf(n.st) : alg === "astar" ? n.g + hf(n.st) : 0;
  const sortPQ = l => l.sort((a, b) => fOf(a) - fOf(b) || a.seq - b.seq);
  const root = mkN(start, null, 0); root.seq = 0;
  let fr = [root];
  const reached = { [start]: root };
  const steps = []; let found = null;
  const snap = l => l.slice();
  if (alg === "bfs" && start === goal) return { steps, found: root };
  while (fr.length && !found) {
    const before = snap(fr);
    let node;
    if (alg === "bfs") node = fr.shift(); else if (alg === "dfs") node = fr.pop(); else { sortPQ(fr); node = fr.shift(); }
    const mid = snap(fr);
    const kids = [];
    const step = { node, before, mid, kids, after: null, goal: false };
    const rsnap = () => Object.keys(reached).map(k => alg === "ucs" ? k + ":" + reached[k].g : k);
    if (alg !== "bfs" && node.st === goal) { step.goal = true; found = node; step.after = snap(fr); step.reached = rsnap(); steps.push(step); break; }
    const anc = new Set(pathOf(node));
    const ch = (G.adj[node.st] || []).slice();
    const pushes = [];
    for (const [t, c] of ch) {
      const k = mkN(t, node, c); k.seq = seq;
      if (alg === "bfs") {
        if (t === goal) { kids.push({ n: k, s: "goal" }); found = k; break; }
        if (reached[t]) kids.push({ n: k, s: "skip" }); else { reached[t] = k; fr.push(k); kids.push({ n: k, s: "add" }); }
      } else if (alg === "ucs") {
        const r = reached[t];
        if (!r) { reached[t] = k; fr.push(k); kids.push({ n: k, s: "add" }); }
        else if (k.g < r.g) { const i = fr.indexOf(r); k.id = r.id; if (i >= 0) fr[i] = k; else fr.push(k); kids.push({ n: k, s: "upd", old: r.g }); reached[t] = k; }
        else kids.push({ n: k, s: "skip", old: r.g });
      } else if (alg === "dfs") {
        if (anc.has(t)) kids.push({ n: k, s: "cycle" }); else { pushes.push(k); kids.push({ n: k, s: "add" }); }
      } else { fr.push(k); kids.push({ n: k, s: "add" }); }
    }
    if (alg === "dfs") for (let i = pushes.length - 1; i >= 0; i--) fr.push(pushes[i]);
    if (alg === "ucs" || alg === "greedy" || alg === "astar") sortPQ(fr);
    step.after = snap(fr);
    step.reached = rsnap();
    steps.push(step);
  }
  return { steps, found, pathOf, fOf };
}

/* ---------- algorithm animation scene ----------
 o = {nodes:{s:[x,y,label?]}, edges:[[a,b,c]], dir, start, goal, alg, ds:'q'|'s'|'pq', r, labels:'side'|'in',
      intro:[texts], outro:[texts], note(step,i)->caption, item(n)->{lab,sub,key}, dsH, stepMin, h:{}, showReached } */
function algoScene(ch, name, o) {
  const G = { adj: {}, h: o.h };
  o.edges.forEach(([a, b, c]) => { (G.adj[a] = G.adj[a] || []).push([b, c]); if (!o.dir) (G.adj[b] = G.adj[b] || []).push([a, c]); });
  for (const k in G.adj) G.adj[k].sort((p, q) => (o.order ? o.order.indexOf(p[0]) - o.order.indexOf(q[0]) : p[0] < q[0] ? -1 : 1));
  const R = runSearch(G, o.alg, o.start, o.goal);
  const steps = R.steps, path = R.found ? R.pathOf(R.found) : [];
  const nmax = Math.max(1, ...steps.map(s => Math.max(s.before.length, s.after.length)));
  // timing
  const caps = []; let t = 0.8;
  const intro = o.intro || [];
  const introB = [];
  intro.forEach(s => { const [tx, d0] = Array.isArray(s) ? s : [s, null]; const d = d0 || capDur(tx); introB.push(t); caps.push([t, t + d, tx]); t += d + 0.25; });
  const T0 = t;
  const ST = steps.map((s, i) => {
    const tx = o.note(s, i, R);
    const d = Math.max(o.stepMin || 3.2, capDur(tx));
    const a = t; caps.push([a + 0.1, a + d, tx]); t += d + 0.2; return { a, d };
  });
  const TE = t;
  const outro = o.outro || [];
  const outB = [];
  outro.forEach(s => { const [tx, d0] = Array.isArray(s) ? s : [s, null]; const d = d0 || capDur(tx); outB.push(t); caps.push([t, t + d, tx]); t += d + 0.25; });
  return add({
    ch, name, dur: t + 1.0, caps,
    build(root) {
      const svg = svgLayer(root);
      const r = o.r || 34;
      const N = {};
      for (const s in o.nodes) {
        const [x, y, lb] = o.nodes[s];
        N[s] = gnode(root, x, y, o.labels === "side" ? "" : (lb || s), r, o.labels === "side" ? {} : {});
        if (o.labels === "side") { N[s].lb = at(root, x + (o.lpos && o.lpos[s] ? o.lpos[s][0] : 0), y + (o.lpos && o.lpos[s] ? o.lpos[s][1] : -r - 18), "gl", lb || s, {}, true); }
        if (o.h && o.showH) N[s].hb = at(root, x + (o.hpos && o.hpos[s] ? o.hpos[s][0] : 0), y + (o.hpos && o.hpos[s] ? o.hpos[s][1] : r + 18), "", "h=" + o.h[s], { fontSize: 17, fontWeight: 700, color: "#64d2ff", fontFamily: "JBM,monospace", whiteSpace: "nowrap" }, true);
      }
      const base = {}, over = {};
      o.edges.forEach(([a, b, c, bend, lo]) => {
        base[a + ">" + b] = gedge(svg, root, N[a], N[b], { dir: o.dir, wt: o.noW ? null : c, bend: bend || 0, lo: lo || 0, w: 2.5 });
        over[a + ">" + b] = gedge(svg, null, N[a], N[b], { dir: o.dir, bend: bend || 0, w: 6 });
        if (!o.dir) over[b + ">" + a] = gedge(svg, null, N[b], N[a], { dir: false, bend: -(bend || 0), w: 6 });
      });
      const dsX = 1170, dsW = 670, dsY = 140, dsH = o.dsH || 360;
      const ds = dsPanel(root, dsX, dsY, dsW, dsH, o.ds, nmax, { keyName: o.keyName });
      const cY = dsY + dsH + 18, cH = o.cardH || 190;
      const cur = box(root, dsX, cY, dsW, cH, `<div class="lab" style="position:absolute;left:24px;top:16px">EXPAND · 꺼내서 확장</div>`);
      const cBig = h(cur, "ab", "", { left: 24, top: 50, fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR,monospace" });
      const cSub = h(cur, "ab", "", { left: 24, top: 108, right: 20, fontSize: 21, color: "rgba(255,255,255,.66)", whiteSpace: "nowrap", overflow: "hidden" });
      const cKids = h(cur, "ab", "", { left: 24, top: 142, right: 20, display: "flex", gap: "10px", flexWrap: "nowrap" });
      const lY = cY + cH + 18, lH = Math.max(110, 890 - lY);
      const lg = box(root, dsX, lY, dsW, lH, `<div class="lab" style="position:absolute;left:24px;top:16px">확장 순서 · EXPANDED</div>`);
      const lTxt = h(lg, "ab mono", "", { left: 24, top: 48, right: 24, fontSize: 21, lineHeight: 1.45, color: "#fff" });
      const lReach = h(lg, "ab mono", "", { left: 24, bottom: 14, right: 24, fontSize: 18, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap", overflow: "hidden" });
      const leg = at(root, 90, 96, "leg", `<span><i style="border-color:${COL.st}"></i>시작</span><span><i style="border-color:${COL.goal}"></i>목표</span><span><i style="background:rgba(48,209,88,.3);border-color:${COL.fr}"></i>프런티어</span><span><i style="background:rgba(125,122,255,.4);border-color:${COL.ex}"></i>확장됨</span><span><i style="background:${COL.cur};border-color:${COL.cur}"></i>지금 꺼낸 노드</span>`, {});
      const res = at(root, dsX + dsW / 2, cY + cH / 2, "", "", { width: dsW - 16, height: cH - 16, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px", fontSize: 28, fontWeight: 800, borderRadius: 18, background: "#21170a", border: "2px solid " + COL.path }, true);
      const it = n => (o.item ? o.item(n, R) : { lab: n.st, sub: o.ds === "q" ? "" : R.pathOf(n).join("→") });
      const L = l => l.map(n => Object.assign({ id: n.id }, it(n)));
      const LS = steps.map(s => ({ A: L(s.before), M: L(s.mid), B: L(s.after) }));
      const kidHTML = (s, n) => s.kids.slice(0, n).map(k => {
        const c = k.s === "add" ? COL.fr : k.s === "upd" ? COL.gold : k.s === "goal" ? COL.path : COL.warn;
        const tag = k.s === "add" ? "+" : k.s === "upd" ? k.old + "→" + k.n.g : k.s === "goal" ? "목표!" : k.s === "cycle" ? "사이클" : o.alg === "ucs" ? "✕" : "reached";
        return `<span class="pill" style="font-size:20px;border:2px solid ${c};color:#fff;background:color-mix(in srgb,${c} 18%,transparent)">${(o.kidLab ? o.kidLab(k.n, R) : k.n.st)} <span style="color:${c}">${tag}</span></span>`;
      }).join("");
      return tt => {
        // entrance
        const pe = K(tt, 0.1, 0.9, E.o5);
        for (const s in N) { const q = K(tt, 0.15 + (N[s].X / 1100) * 0.6, 0.6, E.ob); S(N[s], { o: clamp((tt - 0.15 - (N[s].X / 1100) * 0.6) * 3), s: 0.6 + 0.4 * q }); if (N[s].lb) S(N[s].lb, { o: q }); if (N[s].hb) S(N[s].hb, { o: K(tt, o.hAt || 1.4, 0.6) }); }
        for (const k in base) { base[k].set(K(tt, 0.5, 0.9), "rgba(255,255,255,.28)"); if (base[k].lab) S(base[k].lab, { o: K(tt, 1.0, 0.5) }); }
        S(ds.el, { o: pe, x: (1 - pe) * 60 }); S(cur, { o: K(tt, 0.3, 0.8), x: (1 - K(tt, 0.3, 0.8)) * 60 }); S(lg, { o: K(tt, 0.45, 0.8), x: (1 - K(tt, 0.45, 0.8)) * 60 }); S(leg, { o: K(tt, 1.0, 0.6) });
        // which step
        let k = -1; for (let i = 0; i < ST.length; i++) if (tt >= ST[i].a) k = i;
        const done = tt >= TE;
        const u = k >= 0 ? tt - ST[k].a : 0;
        const p1 = k >= 0 ? K(u, 0.15, 0.7) : 0, p2 = k >= 0 ? K(u, 0.95 + 0.25 * Math.max(0, steps[k].kids.length - 1), 0.7) : 0;
        // DS
        if (k < 0) { const l0 = steps.length ? LS[0].A : []; ds.upd(l0, l0, l0, 0, 0, null); }
        else ds.upd(LS[k].A, LS[k].M, LS[k].B, p1, p2, steps[k].node.id);
        // node states
        const expd = new Set(), fr = new Set();
        for (let i = 0; i < k; i++) expd.add(steps[i].node.st);
        const vis = k < 0 ? (steps[0] ? steps[0].before : []) : p2 > 0.5 ? steps[k].after : p1 > 0.5 ? steps[k].mid : steps[k].before;
        vis.forEach(n => fr.add(n.st));
        const curS = k >= 0 && !done ? steps[k].node.st : null;
        const onPath = new Set(done ? path : []);
        const pq = done ? K(tt, TE, 1.6, E.io3) : 0;
        for (const s in N) {
          let st = "";
          if (onPath.has(s) && pq * path.length > path.indexOf(s)) st = "path";
          else if (s === curS && u > 0.15) st = "cur";
          else if (expd.has(s) || (done && k >= 0 && steps[k].node.st === s)) st = "ex";
          else if (fr.has(s)) st = "fr";
          else if (s === o.goal) st = "goal";
          else if (s === o.start) st = "st";
          nst(N[s], st);
        }
        // overlay edges: tree edges of nodes that exist
        const live = {};
        const addTree = (n, v) => { if (n.par) { const key = n.par.st + ">" + n.st; live[key] = Math.max(live[key] || 0, v); } };
        for (let i = 0; i < k; i++) { steps[i].kids.forEach(kd => { if (kd.s === "add" || kd.s === "upd" || kd.s === "goal") addTree(kd.n, 1); }); }
        const bad = {};
        if (k >= 0) steps[k].kids.forEach((kd, j) => { const v = K(u, 0.85 + j * 0.25, 0.5); if (kd.s === "add" || kd.s === "upd" || kd.s === "goal") addTree(kd.n, v); else bad[kd.n.par.st + ">" + kd.n.st] = v * (1 - K(u, 2.4 + j * 0.25, 0.6)); });
        for (const key in over) {
          const pth = done && path.some((s, i) => i > 0 && path[i - 1] + ">" + s === key) ? path.findIndex((s, i) => i > 0 && path[i - 1] + ">" + s === key) : -1;
          if (pth > 0) { over[key].set(clamp(pq * path.length - pth + 0.5), COL.path, 1, 8); continue; }
          if (bad[key] > 0) { over[key].set(1, COL.warn, bad[key], 5); continue; }
          if (live[key]) over[key].set(live[key], done ? "rgba(48,209,88,.35)" : "rgba(48,209,88,.85)", 1, 5);
          else over[key].set(0);
        }
        // card
        if (k >= 0) {
          const s = steps[k];
          htm(cBig, `<span style="color:${COL.cur}">POP</span> ${o.popLab ? o.popLab(s.node, R) : s.node.st}${s.goal ? ` <span style="color:${COL.path};font-size:30px">✓ 목표</span>` : ""}`);
          htm(cSub, o.popSub ? o.popSub(s.node, R) : "경로 " + R.pathOf(s.node).join("→") + " · g = " + s.node.g);
          const nk = s.kids.filter((_, j) => u > 0.85 + j * 0.25).length;
          htm(cKids, s.goal ? "" : nk ? kidHTML(s, nk) : s.kids.length ? "" : `<span style="font-size:20px;color:rgba(255,255,255,.5)">${o.alg === "dfs" && steps[k].kids.length === 0 ? "자식 없음 → 되돌아감(backtrack)" : "자식 없음"}</span>`);
          S(cBig, { o: K(u, 0.1, 0.4) }); S(cSub, { o: K(u, 0.25, 0.4) });
        } else { htm(cBig, `<span style="color:rgba(255,255,255,.35)">대기</span>`); htm(cSub, "프런티어 = [" + o.start + "]"); htm(cKids, ""); S(cBig, { o: 1 }); S(cSub, { o: 1 }); }
        // log
        const order = steps.slice(0, k + (u > 0.15 ? 1 : 0)).map(s => s.node.st);
        htm(lTxt, order.length ? order.join(" → ") + `<div style="font-size:19px;color:rgba(255,255,255,.55);margin-top:6px">확장 ${order.length}회${done && R.found ? " · 비용 " + R.found.g : ""}</div>` : "");
        if (o.showReached !== false && (o.alg === "bfs" || o.alg === "ucs")) {
          const rs = k >= 0 && p2 > 0.5 ? steps[k].reached : k > 0 ? steps[k - 1].reached : [o.start];
          htm(lReach, "reached = { " + rs.join(", ") + " }");
        } else htm(lReach, o.alg === "dfs" ? "reached 없음 · 사이클은 현재 경로만 검사" : "트리 탐색 · reached 없음");
        // result
        if (done && R.found) { htm(res, `<div class="lab" style="color:${COL.path}">${o.resLab || "찾은 해"}</div><div style="margin-top:8px;font-size:${path.join(" → ").length > 34 ? 24 : 30}px;white-space:nowrap">${path.join(" → ")}</div><div style="margin-top:6px;font-size:34px">비용 <span style="color:${COL.path}">${R.found.g}</span></div>`); const q = K(tt, TE + 0.4, 0.8, E.ob); S(res, { o: clamp((tt - TE - 0.4) * 3), s: 0.85 + 0.15 * q }); }
        else S(res, { o: 0 });
        if (o.extra) o.extra(tt, { k, u, done, TE, T0, introB, outB, N, root });
      };
    },
  });
}

/* ---------- grid search (canvas) ---------- */
function mkGrid(w, hh, seed, dens) { const Rn = rng(seed); const g = { w, h: hh, wall: new Uint8Array(w * hh) }; for (let i = 0; i < w * hh; i++) g.wall[i] = Rn() < dens ? 1 : 0; return g; }
const gnb = (g, i) => { const x = i % g.w, y = (i / g.w) | 0, o = []; if (y > 0) o.push(i - g.w); if (x < g.w - 1) o.push(i + 1); if (y < g.h - 1) o.push(i + g.w); if (x > 0) o.push(i - 1); return o.filter(j => !g.wall[j]); };
function gsearch(g, s, goal, kind, Wt = 1) {
  const n = g.w * g.h, push = new Int32Array(n).fill(-1), pop = new Int32Array(n).fill(-1), par = new Int32Array(n).fill(-1), gc = new Float64Array(n).fill(1e9);
  const gx = goal % g.w, gy = (goal / g.w) | 0, hh = i => Math.abs(i % g.w - gx) + Math.abs(((i / g.w) | 0) - gy);
  let step = 0, fr = [s]; push[s] = 0; gc[s] = 0; let found = false;
  while (fr.length) {
    let cur;
    if (kind === "bfs") cur = fr.shift(); else if (kind === "dfs") cur = fr.pop();
    else { let bi = 0, bf = 1e9, bh = 1e9; for (let k = 0; k < fr.length; k++) { const q = fr[k], f = gc[q] + Wt * hh(q); if (f < bf - 1e-9 || (Math.abs(f - bf) < 1e-9 && hh(q) < bh)) { bf = f; bh = hh(q); bi = k; } } cur = fr.splice(bi, 1)[0]; }
    if (pop[cur] >= 0) continue; pop[cur] = ++step;
    if (cur === goal) { found = true; break; }
    const ns = gnb(g, cur); if (kind === "dfs") ns.reverse();
    for (const j of ns) {
      if (pop[j] >= 0) continue;
      if (kind === "astar") { if (gc[cur] + 1 < gc[j]) { gc[j] = gc[cur] + 1; par[j] = cur; if (push[j] < 0) push[j] = step; if (!fr.includes(j)) fr.push(j); } }
      else if (push[j] < 0) { push[j] = step; par[j] = cur; gc[j] = gc[cur] + 1; fr.push(j); }
    }
  }
  const path = []; if (found) { let c = goal; while (c >= 0) { path.unshift(c); c = par[c]; } }
  return { push, pop, path, steps: step, cost: path.length - 1, found };
}
const GRID = (() => { const g = mkGrid(31, 19, 10, 0.27), s = 9 * 31 + 1, goal = 9 * 31 + 29; g.wall[s] = g.wall[goal] = 0; return { g, s, goal }; })();
const GT = {}; ["bfs", "dfs"].forEach(k => GT[k] = gsearch(GRID.g, GRID.s, GRID.goal, k)); GT.astar = gsearch(GRID.g, GRID.s, GRID.goal, "astar", 1); GT.w0 = gsearch(GRID.g, GRID.s, GRID.goal, "astar", 0); GT.w5 = gsearch(GRID.g, GRID.s, GRID.goal, "astar", 5);
function gridView(root, x, y, cs, title, tr, col) {
  const g = GRID.g, W2 = g.w * cs + 20, H2 = g.h * cs + 20;
  const wrap = at(root, x, y, "cardx", "", { width: W2, height: H2 + 64 });
  const cv = document.createElement("canvas"); cv.width = W2; cv.height = H2; css(cv, { position: "absolute", left: 0, top: 64 }); wrap.appendChild(cv);
  const ttl = h(wrap, "ab", title, { left: 20, top: 16, fontSize: 28, fontWeight: 800, whiteSpace: "nowrap" });
  const cnt = h(wrap, "ab mono", "", { right: 20, top: 20, fontSize: 24, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" });
  const X = cv.getContext("2d");
  const rgba = (hx, a) => { const [r, gg, b] = hex2rgb(hx); return `rgba(${r},${gg},${b},${a})`; };
  let lastKey = "";
  return {
    wrap, cnt,
    draw(k, pa) {
      k = Math.floor(k); const key = k + "|" + pa.toFixed(3); if (key === lastKey) return; lastKey = key;
      X.clearRect(0, 0, W2, H2);
      for (let i = 0; i < g.w * g.h; i++) {
        const cx = 10 + (i % g.w) * cs, cy = 10 + ((i / g.w) | 0) * cs;
        if (g.wall[i]) { X.fillStyle = "rgba(255,255,255,.16)"; X.fillRect(cx + 1, cy + 1, cs - 2, cs - 2); continue; }
        X.fillStyle = "rgba(255,255,255,.035)"; X.fillRect(cx + 1, cy + 1, cs - 2, cs - 2);
        if (!tr) continue;
        const pp = tr.pop[i], pu = tr.push[i];
        if (pp >= 0 && pp <= k) { const age = clamp((k - pp) / 40); X.fillStyle = rgba(col || COL.ex, 0.85 - 0.4 * age); X.fillRect(cx + 1, cy + 1, cs - 2, cs - 2); }
        else if (pu >= 0 && pu <= k) { X.fillStyle = rgba(COL.fr, 0.9); X.fillRect(cx + 3, cy + 3, cs - 6, cs - 6); }
      }
      if (tr && tr.found && pa > 0) {
        const n = tr.path.length, m = Math.max(1, Math.floor(n * pa));
        X.strokeStyle = COL.path; X.lineWidth = Math.max(4, cs * 0.34); X.lineJoin = "round"; X.lineCap = "round"; X.beginPath();
        for (let q = 0; q < m; q++) { const i = tr.path[q]; const px = 10 + (i % g.w + 0.5) * cs, py = 10 + (((i / g.w) | 0) + 0.5) * cs; q ? X.lineTo(px, py) : X.moveTo(px, py); }
        X.stroke();
      }
      for (const [i, c] of [[GRID.s, COL.st], [GRID.goal, COL.goal]]) { const px = 10 + (i % g.w + 0.5) * cs, py = 10 + (((i / g.w) | 0) + 0.5) * cs; X.beginPath(); X.arc(px, py, cs * 0.42, 0, 7); X.fillStyle = c; X.fill(); }
    },
  };
}

/* ---------- maze for 3-1 (discretized grid) ---------- */
const MZ = {
  w: 7, h: 5,
  walls: new Set(["1,0", "1,1", "1,3", "3,1", "3,2", "3,3", "5,0", "5,2", "5,3", "5,4"]),
  start: [0, 4], exit: [6, 0],
};
function mazeView(root, x, y, cs, o = {}) {
  const wrap = at(root, x, y, "", "", { width: MZ.w * cs, height: MZ.h * cs });
  const cells = {};
  for (let j = 0; j < MZ.h; j++) for (let i = 0; i < MZ.w; i++) {
    const k = i + "," + j, wl = MZ.walls.has(k);
    cells[k] = h(wrap, "ab", "", { left: i * cs + 2, top: j * cs + 2, width: cs - 4, height: cs - 4, borderRadius: 10, background: wl ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.04)", border: wl ? "0" : "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JBM,monospace", fontSize: Math.round(cs * 0.28), color: "rgba(255,255,255,.4)" });
  }
  const ex = h(wrap, "ab", "EXIT", { left: MZ.exit[0] * cs + 6, top: MZ.exit[1] * cs + 6, width: cs - 12, height: cs - 12, borderRadius: 10, border: "3px solid " + COL.goal, color: COL.goal, fontWeight: 800, fontSize: Math.round(cs * 0.22), display: "flex", alignItems: "center", justifyContent: "center" });
  const bot = h(wrap, "ab", "", { left: 0, top: 0, width: cs, height: cs, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(cs * 0.55) });
  bot.innerHTML = `<div style="width:${cs * 0.62}px;height:${cs * 0.62}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#9be7ff,#0a84ff);box-shadow:0 0 24px rgba(10,132,255,.8);position:relative"><i style="position:absolute;left:28%;top:34%;width:12%;height:16%;background:#001;border-radius:50%"></i><i style="position:absolute;right:28%;top:34%;width:12%;height:16%;background:#001;border-radius:50%"></i></div>`;
  return { wrap, cells, ex, bot, cs, put(i, j) { S(bot, { o: 1, x: i * cs, y: j * cs }); } };
}
/* shortest maze path by BFS */
const MZP = (() => {
  const key = (i, j) => i + "," + j, Q = [[...MZ.start]], par = { [key(...MZ.start)]: null };
  while (Q.length) { const [i, j] = Q.shift(); if (i === MZ.exit[0] && j === MZ.exit[1]) break; for (const [di, dj] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= MZ.w || b >= MZ.h || MZ.walls.has(key(a, b)) || key(a, b) in par) continue; par[key(a, b)] = [i, j]; Q.push([a, b]); } }
  const p = []; let c = MZ.exit; while (c) { p.unshift(c); c = par[key(...c)]; } return p;
})();
function along(pts, v) { // piecewise-linear point along list of [x,y]
  const n = pts.length - 1; if (n <= 0) return pts[0]; const f = clamp(v) * n, i = Math.min(n - 1, Math.floor(f)), q = f - i;
  return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)];
}
["def", "in", "not", "and", "or", "function", "returns", "yield", "then", "do", "is", "None", "True", "False"].forEach(k => KW.add(k));
function pill(root, x, y, lab, c) { const e = at(root, x, y, "gn", lab, Object.assign({ height: 54, padding: "0 20px", borderRadius: 999, fontSize: 24, whiteSpace: "nowrap" }, c || {}), true); e.X = x; e.Y = y; return e; }
function seg(svg, a, b, o = {}) { return arrow(svg, [[a.X, a.Y + (o.dy0 == null ? 27 : o.dy0)], [b.X, b.Y - (o.dy1 == null ? 27 : o.dy1)]], { c: o.c || "rgba(255,255,255,.45)", w: o.w || 3, head: o.head == null ? 0 : o.head, dash: o.dash }); }
