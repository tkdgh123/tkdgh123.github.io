"use strict";
/* ===================== shared data ===================== */
const RO = (() => {
  const raw = { Arad: [91, 492], Bucharest: [400, 327], Craiova: [253, 288], Drobeta: [165, 299], Eforie: [562, 293], Fagaras: [305, 449], Giurgiu: [375, 270], Hirsova: [534, 350], Iasi: [473, 506], Lugoj: [165, 379], Mehadia: [168, 339], Neamt: [406, 537], Oradea: [131, 571], Pitesti: [320, 368], Rimnicu: [233, 410], Sibiu: [207, 457], Timisoara: [94, 410], Urziceni: [456, 350], Vaslui: [509, 444], Zerind: [108, 531] };
  const pos = {}; for (const k in raw) pos[k] = [Math.round(140 + (raw[k][0] - 91) * 1.95), Math.round(860 - (raw[k][1] - 270) * 1.9)];
  const edges = [["Arad", "Zerind", 75], ["Arad", "Sibiu", 140], ["Arad", "Timisoara", 118], ["Zerind", "Oradea", 71], ["Oradea", "Sibiu", 151], ["Timisoara", "Lugoj", 111], ["Lugoj", "Mehadia", 70], ["Mehadia", "Drobeta", 75], ["Drobeta", "Craiova", 120], ["Craiova", "Rimnicu", 146], ["Craiova", "Pitesti", 138], ["Sibiu", "Fagaras", 99], ["Sibiu", "Rimnicu", 80], ["Rimnicu", "Pitesti", 97], ["Fagaras", "Bucharest", 211], ["Pitesti", "Bucharest", 101], ["Bucharest", "Giurgiu", 90], ["Bucharest", "Urziceni", 85], ["Urziceni", "Hirsova", 98], ["Hirsova", "Eforie", 86], ["Urziceni", "Vaslui", 142], ["Vaslui", "Iasi", 92], ["Iasi", "Neamt", 87]];
  const h = { Arad: 366, Bucharest: 0, Craiova: 160, Drobeta: 242, Eforie: 161, Fagaras: 176, Giurgiu: 77, Hirsova: 151, Iasi: 226, Lugoj: 244, Mehadia: 241, Neamt: 234, Oradea: 380, Pitesti: 100, Rimnicu: 193, Sibiu: 253, Timisoara: 329, Urziceni: 80, Vaslui: 199, Zerind: 374 };
  const lpos = { Arad: [-58, 0], Zerind: [-62, 0], Oradea: [0, -32], Timisoara: [-76, 0], Lugoj: [52, 0], Mehadia: [66, 0], Drobeta: [-64, 0], Craiova: [0, 32], Rimnicu: [-95, 0], Sibiu: [-16, -32], Fagaras: [0, -32], Pitesti: [56, 0], Bucharest: [64, 24], Giurgiu: [58, 0], Urziceni: [0, -32], Hirsova: [0, -32], Eforie: [-60, 0], Vaslui: [56, 0], Iasi: [44, 0], Neamt: [0, -32] };
  const name = { Rimnicu: "Rimnicu Vilcea" };
  return { pos, edges, h, lpos, name };
})();
/* draws the Romania map; returns {N, E(key a|b), lab} */
function romania(root, svg, o = {}) {
  const N = {}, E2 = {};
  const r = o.r || 13;
  for (const k in RO.pos) { const [x, y] = RO.pos[k]; N[k] = gnode(root, x, y, "", r, { borderWidth: 3 }); N[k].lb = at(root, x + RO.lpos[k][0], y + RO.lpos[k][1], "gl", RO.name[k] || k, { fontSize: o.fs || 20 }, true); }
  RO.edges.forEach(([a, b, c]) => { E2[a + "|" + b] = E2[b + "|" + a] = gedge(svg, o.noW ? null : root, N[a], N[b], { wt: o.noW ? null : c, w: 2.5 }); });
  return { N, E: E2, show(t, a) { for (const k in N) { const q = K(t, a + (N[k].X - 140) / 1000 * 0.8, 0.5, E.ob); S(N[k], { o: clamp((t - a - (N[k].X - 140) / 1000 * 0.8) * 3), s: 0.6 + 0.4 * q }); S(N[k].lb, { o: q }); } RO.edges.forEach(([x, y]) => { const e = E2[x + "|" + y]; e.set(K(t, a + 0.3, 0.9), "rgba(255,255,255,.3)"); if (e.lab) S(e.lab, { o: K(t, a + 0.9, 0.5) }); }); } };
}
function polyArrow(svg, pts, col, w, head) { return arrow(svg, pts, { c: col, w: w || 6, head: head ? 18 : 0 }); }
const DIRS = { "1,0": ["E", "→"], "-1,0": ["W", "←"], "0,-1": ["N", "↑"], "0,1": ["S", "↓"] };
const MZL = (() => { const L = {}; let c = 0; const lt = "abcdefghijklmnopqrstuvwxyz"; for (let i = 0; i < MZ.w; i++) for (let j = 0; j < MZ.h; j++) { const k = i + "," + j; if (MZ.walls.has(k)) continue; L[k] = i === 0 ? String(j + 1) : lt[c++]; } return L; })();
const MZD = (() => { const D = { [MZ.start.join(",")]: 0 }, Q = [MZ.start]; while (Q.length) { const [i, j] = Q.shift(); for (const [a, b] of [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]) { const k = a + "," + b; if (a < 0 || b < 0 || a >= MZ.w || b >= MZ.h || MZ.walls.has(k) || k in D) continue; D[k] = D[i + "," + j] + 1; Q.push([a, b]); } } return D; })();
const cellPts = (cells, x0, y0, cs, off = 0) => cells.map(([i, j]) => [x0 + (i + 0.5) * cs + off, y0 + (j + 0.5) * cs + off]);

/* ===================== OPENING ===================== */
add({
  ch: 0, name: "오프닝", dur: 15.5, hud: false, fadeIn: false,
  build(root) {
    const R = rng(11), P = [];
    while (P.length < 48) { const x = 150 + R() * 1620, y = 140 + R() * 800; if (P.every(p => Math.hypot(p[0] - x, p[1] - y) > 125)) P.push([x, y]); }
    const ES = new Set(), EL = [];
    P.forEach((p, i) => { P.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 3).forEach(([, j]) => { const k = Math.min(i, j) + "-" + Math.max(i, j); if (!ES.has(k)) { ES.add(k); EL.push([i, j]); } }); });
    const adj = P.map(() => []); EL.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const s0 = P.reduce((m, p, i) => (p[0] < P[m][0] ? i : m), 0), g0 = P.reduce((m, p, i) => (p[0] > P[m][0] ? i : m), 0);
    const dep = P.map(() => -1), par = P.map(() => -1); dep[s0] = 0; const Q = [s0];
    while (Q.length) { const a = Q.shift(); adj[a].forEach(b => { if (dep[b] < 0) { dep[b] = dep[a] + 1; par[b] = a; Q.push(b); } }); }
    const onP = new Set(); for (let c = g0; c >= 0; c = par[c]) onP.add(c);
    const net = h(root, "ab", null, { left: 0, top: 0, width: 1920, height: 1080 });
    const svg = svgLayer(net);
    const lines = EL.map(([a, b]) => ({ a, b, l: sv(svg, "line", { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], "stroke-width": 2.5, stroke: "rgba(255,255,255,.18)" }) }));
    const dots = P.map(([x, y], i) => at(net, x, y, "", "", { width: 18, height: 18, borderRadius: "50%", background: "#2a2a33", border: "2px solid rgba(255,255,255,.3)" }, true));
    const tt = at(root, 960, 470, "big", "", { fontSize: 156, whiteSpace: "nowrap", display: "flex" }, true);
    const title = "탐색으로 문제 풀기", cols = [[255, 255, 255], [100, 210, 255], [10, 132, 255], [94, 92, 230]];
    const lets = [...title].map((c, i, arr) => { const sp = document.createElement("span"); sp.style.display = "inline-block"; sp.innerHTML = c === " " ? "&nbsp;" : c; const f = i / (arr.length - 1) * (cols.length - 1), j = Math.min(cols.length - 2, Math.floor(f)), q = f - j; sp.style.color = `rgb(${cols[j].map((v, k) => Math.round(lerp(v, cols[j + 1][k], q)))})`; tt.appendChild(sp); S(sp, { o: 0 }); return sp; });
    const sub = at(root, 960, 620, "", '인공지능입문 3장 · <b style="color:#fff">Solving Problems by Searching</b>', { fontSize: 40, color: "rgba(255,255,255,.62)", fontWeight: 500, whiteSpace: "nowrap" }, true);
    const tiles = [1, 2, 3, 4].map((c, i) => { const C = CH[c]; return at(root, 960 + (i - 1.5) * 420, 640, "", `<div style="font-size:60px;font-weight:900;letter-spacing:-.04em;color:${C.acc}">${C.no}</div><div style="font-size:31px;font-weight:800;margin-top:6px">${C.title}</div><div style="font-size:19px;color:rgba(255,255,255,.5);margin-top:6px">${C.en}</div>`, { width: 390, height: 200, borderRadius: 26, padding: "24px 30px", background: "linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)" }, true); });
    return t => {
      const fade = 1 - 0.75 * K(t, 3.9, 1.0);
      S(net, { o: fade * K(t, 0, 0.6) });
      dots.forEach((d, i) => {
        const lit = t > 0.5 + dep[i] * 0.3, pth = onP.has(i) && t > 3.0 + (dep[i] / Math.max(1, dep[g0])) * 0.7;
        const key = pth ? "p" : lit ? "l" : "";
        if (d._k !== key) { d._k = key; d.style.background = pth ? COL.path : lit ? "rgba(48,209,88,.5)" : "#2a2a33"; d.style.borderColor = pth ? COL.path : lit ? COL.fr : "rgba(255,255,255,.3)"; d.style.boxShadow = pth ? "0 0 22px " + COL.path : ""; }
        const q = K(t, 0.05 + i * 0.008, 0.5, E.ob); S(d, { o: clamp(t * 3), s: 0.5 + 0.5 * q * (1 + (lit && t < 0.8 + dep[i] * 0.3 ? 0.4 : 0)) });
      });
      lines.forEach(L => {
        const pp = (par[L.b] === L.a || par[L.a] === L.b), pth = onP.has(L.a) && onP.has(L.b) && pp && t > 3.0 + (Math.max(dep[L.a], dep[L.b]) / Math.max(1, dep[g0])) * 0.7;
        const lit = pp && t > 0.5 + Math.max(dep[L.a], dep[L.b]) * 0.3;
        const key = pth ? "p" : lit ? "l" : "";
        if (L._k !== key) { L._k = key; L.l.setAttribute("stroke", pth ? COL.path : lit ? "rgba(48,209,88,.7)" : "rgba(255,255,255,.18)"); L.l.setAttribute("stroke-width", pth ? 6 : lit ? 3.5 : 2.5); }
      });
      lets.forEach((sp, i) => { const q = K(t, 4.1 + i * 0.08, 1.1, E.o5); S(sp, { o: q, y: (1 - q) * 70, b: (1 - q) * 20, s: 1.5 - 0.5 * q }); });
      const pm = K(t, 8.7, 1.2, E.io3);
      S(tt, { o: 1, y: -250 * pm, s: 1 - 0.4 * pm });
      const ps = K(t, 5.6, 0.9, E.o5); S(sub, { o: ps * (1 - K(t, 8.5, 0.5)), y: (1 - ps) * 24 - 30 * K(t, 8.5, 0.5) });
      tiles.forEach((e, i) => { const q = K(t, 9.4 + i * 0.16, 1.0, E.o5); S(e, { o: q, s: 1.4 - 0.4 * q, b: (1 - q) * 18, y: (1 - q) * 30 }); });
    };
  },
  caps: [[0.9, 3.7, "시작에서 목표까지, 가능한 길을 체계적으로 훑어 **가장 좋은 길**을 찾는 것"], [11.0, 15.0, "탐색 문제 → 트리 탐색 → 무정보 탐색 → 정보 탐색, 네 파트로 간다"]],
});

/* ===================== 3-1 탐색 문제 ===================== */
chTitle(1, ["목표 기반 에이전트", "세 가지 가정", "최적 해 · argmin", "문제 정의 5요소", "전이 모델 · 그래프", "추상화", "루마니아 · 청소기 · 8-퍼즐"]);

/* --- problem-solving agent --- */
sc(1, "문제 해결 에이전트", [
  "3장의 주인공은 **목표 기반 에이전트** — 정해진 **목표 상태**에 도달하는 것이 과제",
  "미로 속 로봇으로 보면 — 내 위치 = **상태**, 미로 지도 = **내 행동이 하는 일**, 출구 = **목표**",
  "여기에 상자 하나가 추가된다: **Search for a plan** — 움직이기 전에 머릿속에서 길을 찾는다",
  "그 결과물은 **행동의 순서**(sequence of actions). 이런 에이전트를 **문제 해결 에이전트**라 부른다",
  "성능 척도는 보통 목표까지 드는 **비용** — 한 칸 = 1이라면 이 계획의 비용은 10",
  ["계획이 끝나면 실행. 결과를 정확히 예측했으니 실행 중엔 지각을 무시해도 된다 → **개루프(open-loop)**", 7],
  "결과가 불확실하면 계속 보면서 고쳐 가야 한다 → **폐루프(closed-loop)**",
  "예: 전자레인지 3분 돌리기는 개루프, 라면 끓이며 면을 보고 불 조절은 폐루프. 3장은 **개루프** 세계",
], (root, B) => {
  const X0 = 100, Y0 = 220, cs = 96;
  const mz = mazeView(root, X0, Y0, cs);
  const hd = at(root, X0, Y0 - 62, "lab", "GOAL-BASED AGENT · 미로 속 로봇", { fontSize: 20 });
  const svg = svgLayer(root);
  const rows = [["로봇의 위치", "State · 상태", COL.st], ["미로 지도", "What my actions do", "#bf5af2"], ["출구 위치", "Goals · 목표", COL.goal]].map(([a, b, c], i) => {
    const y = 250 + i * 104;
    const l = at(root, 900, y, "", a, { fontSize: 30, fontWeight: 700, width: 240, textAlign: "right", whiteSpace: "nowrap" });
    const ar = at(root, 1160, y + 4, "", "→", { fontSize: 34, color: "rgba(255,255,255,.5)" });
    const r = at(root, 1230, y - 10, "", b, { fontSize: 30, fontWeight: 800, padding: "8px 22px", borderRadius: 14, border: "2px solid " + c, color: c, whiteSpace: "nowrap" });
    return [l, ar, r];
  });
  const plan = at(root, 900, 570, "", `<div style="font-size:20px;letter-spacing:.12em;color:rgba(255,255,255,.5);font-weight:700">NEW BOX</div><div style="font-size:40px;font-weight:900;color:${COL.path}">Search for a plan</div>`, { padding: "16px 30px", borderRadius: 20, border: "3px dashed " + COL.path, background: "rgba(255,159,10,.08)" });
  const dirs = []; for (let i = 1; i < MZP.length; i++) dirs.push(DIRS[(MZP[i][0] - MZP[i - 1][0]) + "," + (MZP[i][1] - MZP[i - 1][1])]);
  const seq = at(root, 900, 735, "", "", { display: "flex", gap: "8px" });
  const chips = dirs.map(d => h(seq, "", `<div style="font-size:30px;line-height:1">${d[1]}</div><div style="font-size:15px;color:rgba(255,255,255,.6)">${d[0]}</div>`, { width: 62, height: 70, borderRadius: 12, border: "2px solid rgba(255,159,10,.7)", background: "rgba(255,159,10,.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 800 }));
  chips.forEach(c => S(c, { o: 0 }));
  const seqL = at(root, 900, 700, "lab", "ACTION SEQUENCE · 행동의 순서", {});
  const cost = at(root, 1580, 655, "", "", { fontSize: 34, fontWeight: 800, fontFamily: "JBM,Noto Sans KR", whiteSpace: "nowrap", color: COL.gold });
  const pathA = polyArrow(svg, cellPts(MZP, X0, Y0, cs), COL.path, 8, true);
  const tint = {}; for (const k in mz.cells) if (k in MZD) tint[k] = mz.cells[k];
  // open / closed loop diagrams
  const ol = at(root, 900, 250, "", `<div style="font-size:22px;font-weight:800;color:${COL.fr};letter-spacing:.1em">OPEN-LOOP</div>
    <div style="display:flex;gap:14px;align-items:center;margin-top:16px;font-size:26px;font-weight:700">
    <span style="padding:10px 18px;border-radius:12px;border:2px solid ${COL.path}">계획</span>→<span style="padding:10px 18px;border-radius:12px;border:2px solid rgba(255,255,255,.4)">행동 1</span>→<span style="padding:10px 18px;border-radius:12px;border:2px solid rgba(255,255,255,.4)">행동 2</span>→<span>…</span>→<span style="padding:10px 18px;border-radius:12px;border:2px solid ${COL.goal}">목표</span></div>
    <div style="font-size:23px;color:rgba(255,255,255,.62);margin-top:14px">실행 중 센서를 보지 않는다 — 예측이 정확하니까</div>`, { width: 900 });
  const cl = at(root, 900, 520, "", `<div style="font-size:22px;font-weight:800;color:#64d2ff;letter-spacing:.1em">CLOSED-LOOP</div>`, { width: 900, height: 300 });
  const clN = [["지각", 140], ["판단", 420], ["행동", 700]].map(([s, x]) => at(cl, x, 130, "", s, { fontSize: 28, fontWeight: 800, padding: "12px 26px", borderRadius: 14, border: "2px solid #64d2ff" }, true));
  const csvg = svgLayer(cl);
  const ca = [arrow(csvg, [[200, 130], [355, 130]], { c: "#64d2ff" }), arrow(csvg, [[480, 130], [635, 130]], { c: "#64d2ff" }), arrow(csvg, [[700, 170], [420, 270], [140, 170]], { c: "#64d2ff", curve: true })];
  const eye = at(root, X0 + 7 * cs - 10, Y0 - 50, "", "센서 OFF · 지각 무시", { fontSize: 22, fontWeight: 800, color: COL.fr, padding: "6px 16px", borderRadius: 999, border: "2px solid " + COL.fr, whiteSpace: "nowrap" });
  eye.style.transform = ""; eye._c = 0;
  return t => {
    vis(mz.wrap, t, 0.1, null); vis(hd, t, 0.3, null);
    const out1 = K(t, B[5], 0.6);
    // robot
    let bp = MZ.start;
    if (t > B[5] + 0.6) { const v = K(t, B[5] + 0.8, 5.0, E.lin); bp = along(MZP, v); chips.forEach((c, i) => { const a = clamp(v * dirs.length - i); c.style.background = a >= 1 ? "rgba(255,159,10,.55)" : "rgba(255,159,10,.12)"; }); }
    S(mz.bot, { o: K(t, 0.4, 0.5), x: bp[0] * cs, y: bp[1] * cs, s: 1 + 0.15 * Math.sin(Math.PI * K(t, B[1], 0.8)) });
    glow2(mz.ex, K(t, B[1] + 2.4, 0.5), COL.goal);
    rows.forEach((r, i) => r.forEach((e, j) => { const q = K(t, B[1] + i * 1.2 + j * 0.15, 0.6, E.o5); S(e, { o: q * (1 - out1), x: (1 - q) * 40 }); }));
    S(plan, { o: K(t, B[2], 0.6) * (1 - out1), s: 0.9 + 0.1 * K(t, B[2], 0.6, E.ob) });
    // thinking: cells tinted in BFS order
    for (const k in tint) { const d = MZD[k], q = K(t, B[2] + 0.6 + d * 0.22, 0.3) * (1 - K(t, B[3] + 0.5, 0.8)); setBg(tint[k], q > 0.01 ? `rgba(48,209,88,${(0.28 * q).toFixed(3)})` : "rgba(255,255,255,.04)"); }
    pathA.set(K(t, B[2] + 3.4, 1.4, E.io3), 1);
    chips.forEach((c, i) => { const q = K(t, B[3] + 0.2 + i * 0.12, 0.5, E.ob); S(c, { o: clamp((t - B[3] - 0.2 - i * 0.12) * 3), s: 0.6 + 0.4 * q }); });
    const nc = Math.floor(clamp((t - B[4] - 0.3) / 1.6) * dirs.length);
    const o6 = 1 - K(t, B[6], 0.5);
    txt(cost, "경로 비용 = " + nc); S(cost, { o: K(t, B[4], 0.5) * o6 }); S(seq, { o: (t > B[3] ? 1 : 0) * o6 }); S(seqL, { o: K(t, B[3], 0.5) * o6 });
    S(eye, { o: K(t, B[5] + 0.6, 0.5) * (1 - K(t, B[6], 0.5)), x: 0, y: 0 });
    vis(ol, t, B[5] + 0.7, null);
    vis(cl, t, B[6], null);
    clN.forEach((n, i) => pop(n, t, B[6] + 0.3 + i * 0.3));
    ca.forEach((a, i) => a.set(K(t, B[6] + 0.6 + i * 0.4, 0.5)));
  };
});

/* --- three assumptions --- */
function miniGrid(parent, x, y, n, m, cs, style) {
  const g = h(parent, "ab", null, { left: x, top: y, width: n * cs, height: m * cs });
  const cells = [];
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const st = style(i, j) || {}; cells.push(h(g, "ab", st.html || "", Object.assign({ left: i * cs + 2, top: j * cs + 2, width: cs - 4, height: cs - 4, borderRadius: 7, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: cs * 0.5, fontWeight: 800 }, st.c || {}))); }
  return { g, cells };
}
sc(1, "세 가지 가정", [
  "탐색 문제가 다루는 환경에는 **세 가지 가정**이 붙는다",
  "① **알려진(known)** — 내 행동이 무엇을 하는지 안다. 미로 지도를 갖고 있다",
  "② **완전 관측(fully observable)** — 지금 상태 전체를 볼 수 있다",
  "③ **결정적(deterministic)** — 같은 행동은 **항상** 같은 결과. 갑자기 엉뚱한 쪽으로 미끄러지지 않는다",
  "셋이 모두 성립하면 미래를 **정확히 예측**할 수 있다 → 움직이기 전에 계획 전체를 완성할 수 있다",
  ["하나라도 깨지면? 처음 가 본 건물(unknown) · 포커(부분 관측) · 윷놀이(비결정적) — **4장**의 문제", 7.5],
  "그래서 이 세 가정은 배경 설명이 아니라 **이 장 알고리즘이 다룰 수 있는 범위의 경계**다",
], (root, B) => {
  const W2 = 470, H2 = 520, xs = [350, 960, 1570], y = 520;
  const wall = new Set(["1,0", "1,1", "3,1", "3,2"]);
  const robot = `<div style="width:62%;height:62%;border-radius:50%;background:radial-gradient(circle at 35% 35%,#9be7ff,#0a84ff);box-shadow:0 0 14px #0a84ff"></div>`;
  const face = (html, bd) => at(root, 0, 0, "", html, { width: W2, height: H2, borderRadius: 28, background: "linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))", border: "2px solid " + bd, backfaceVisibility: "hidden", padding: "26px 30px" });
  const mkF = (i, front) => {
    const ttl = front ? [["알려진", "Known"], ["완전 관측", "Fully observable"], ["결정적", "Deterministic"]][i] : [["알려지지 않음", "Unknown"], ["부분 관측", "Partially observable"], ["비결정적", "Nondeterministic"]][i];
    const txt2 = front ? ["행동의 결과를 안다", "상태 전체가 보인다", "같은 행동 → 같은 결과"][i] : ["처음 가 본 건물", "포커 — 남의 패가 안 보인다", "윷놀이 — 던져 봐야 안다"][i];
    const col = front ? COL.fr : COL.warn;
    const f = face(`<div style="font-size:22px;font-weight:800;color:${col};letter-spacing:.06em">${front ? "①②③"[i] : "✕"} ${ttl[1]}</div><div style="font-size:46px;font-weight:900;margin-top:6px">${ttl[0]}</div><div style="font-size:25px;color:rgba(255,255,255,.7);margin-top:330px">${txt2}</div>`, front ? "rgba(255,255,255,.14)" : "rgba(255,69,58,.6)");
    f.style.left = xs[i] - W2 / 2 + "px"; f.style.top = y - H2 / 2 + "px";
    const gx = 60, gy = 150, cs = 72;
    if (i === 0) miniGrid(f, gx, gy, 5, 3, cs, (a, b) => { const k = a + "," + b; if (!front) return { html: "?", c: { background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)" } }; return wall.has(k) ? { c: { background: "rgba(255,255,255,.28)" } } : a === 0 && b === 2 ? { html: robot } : a === 4 && b === 0 ? { c: { border: "3px solid " + COL.goal } } : null; });
    if (i === 1) miniGrid(f, gx, gy, 5, 3, cs, (a, b) => { const k = a + "," + b, far = Math.abs(a - 0) + Math.abs(b - 2) > 1; const base = wall.has(k) ? { c: { background: "rgba(255,255,255,.28)" } } : a === 0 && b === 2 ? { html: robot } : a === 4 && b === 0 ? { c: { border: "3px solid " + COL.goal } } : { c: {} }; if (!front && far) return { c: { background: "rgba(255,255,255,.02)", filter: "blur(3px)" } }; return base; });
    if (i === 2) {
      miniGrid(f, gx, gy, 5, 3, cs, (a, b) => a === 1 && b === 1 ? { html: robot } : front ? (a === 3 && b === 1 ? { c: { background: "rgba(48,209,88,.4)", border: "2px solid " + COL.fr } } : null) : ((a === 3 && b === 1) || (a === 2 && b === 0) || (a === 2 && b === 2) ? { html: "?", c: { background: "rgba(255,69,58,.2)", border: "2px solid " + COL.warn, color: COL.warn } } : null));
      const s2 = svgLayer(f); s2.setAttribute("viewBox", `0 0 ${W2} ${H2}`); s2.style.width = W2 + "px"; s2.style.height = H2 + "px";
      const c0 = [gx + 1.5 * cs, gy + 1.5 * cs];
      (front ? [[3, 1]] : [[3, 1], [2, 0], [2, 2]]).forEach(([a, b]) => arrow(s2, [[c0[0] + 30, c0[1] + (b - 1) * 20], [gx + (a + 0.5) * cs - 30 * (a === 3 ? 1 : 0), gy + (b + 0.5) * cs + (b === 0 ? 24 : b === 2 ? -24 : 0)]], { c: front ? COL.fr : COL.warn, w: 4 }).set(1));
    }
    return f;
  };
  const F = [0, 1, 2].map(i => mkF(i, true)), Bk = [0, 1, 2].map(i => mkF(i, false));
  const ok = [0, 1, 2].map(i => at(root, xs[i] + W2 / 2 - 30, y - H2 / 2 + 30, "", "✓", { fontSize: 40, fontWeight: 900, width: 64, height: 64, borderRadius: "50%", background: COL.fr, color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }, true));
  const ban = at(root, 960, 830, "", `셋 다 성립 → <b style="color:${COL.fr}">미래 예측 가능</b> → 계획 먼저, 실행은 나중`, { fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" }, true);
  const ban2 = at(root, 960, 830, "", `하나라도 깨지면 → <b style="color:${COL.warn}">4장</b> (복잡한 환경)`, { fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" }, true);
  return t => {
    [0, 1, 2].forEach(i => {
      const q = K(t, B[1 + i], 0.8, E.o5), fl = K(t, B[5] + i * 0.35, 0.9, E.io3) * (1 - K(t, B[6] + i * 0.2, 0.9, E.io3));
      S(F[i], { p: 1, o: q, y: (1 - q) * 60, ry: fl * 180, s: 0.95 + 0.05 * q });
      S(Bk[i], { p: 1, o: q, y: (1 - q) * 60, ry: fl * 180 - 180, s: 0.95 + 0.05 * q });
      const k = K(t, B[4] + i * 0.25, 0.5, E.ob); S(ok[i], { o: clamp((t - B[4] - i * 0.25) * 3) * (1 - K(t, B[5], 0.3)) + K(t, B[6] + 0.6, 0.4), s: 0.5 + 0.5 * k });
    });
    vis(ban, t, B[4] + 0.6, B[5]); vis(ban2, t, B[5] + 1.2, B[6]);
  };
});

/* --- optimal solution / argmin --- */
sc(1, "최적 해와 argmin", [
  "출구까지 가는 길은 여러 개 — 어떤 계획이 가장 좋을까?",
  "각 행동에는 **비용**이 있다. 여기선 한 칸 = 1 → **경로 비용** = 지나온 행동 비용의 합",
  ["길 A = **10**, 길 B = 12, 길 C = 12 — 경로 비용이 가장 낮은 길이 **최적 해(optimal solution)**", 6.5],
  "식으로 쓰면: 지금(i)부터 끝(T)까지 비용 c_t의 합을 **가장 작게** 만드는 행동을 고른다",
  "단, 마지막 상태 s_T는 반드시 **목표 집합 S_goal 안**이어야 한다",
  "**argmin**은 최솟값 그 자체가 아니라, 최솟값을 만드는 **선택**을 돌려준다",
  "예: 등굣길 버스 30분 vs 지하철 28분 — 둘 다 도착하지만 argmin = **지하철**",
], (root, B) => {
  const X0 = 100, Y0 = 230, cs = 84;
  const mz = mazeView(root, X0, Y0, cs);
  const svg = svgLayer(root);
  const PB = [[0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [6, 1], [6, 0]];
  const PC = [[0, 4], [0, 3], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [6, 1], [6, 0]];
  const paths = [[MZP, COL.path, "A", 0], [PB, "#64d2ff", "B", -9], [PC, "#bf5af2", "C", 9]];
  const PA = paths.map(([p, c, n, off]) => polyArrow(svg, cellPts(p, X0, Y0, cs, off), c, 6, true));
  const cnt = paths.map(([p, c, n], i) => at(root, 760, 250 + i * 70, "", "", { fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }));
  const best = at(root, 760, 470, "", `최적 해 = 길 A <span style="color:${COL.path}">(비용 10)</span>`, { fontSize: 36, fontWeight: 900, whiteSpace: "nowrap", padding: "10px 24px", borderRadius: 16, border: "3px solid " + COL.path });
  const fm = at(root, 1200, 630, "", `a<sub>i</sub> = <span class="am">argmin</span><sub>a<sub>i</sub> ∈ A</sub> [ <span class="sg">Σ<sub>t=i</sub><sup>T</sup> c<sub>t</sub></span> &nbsp;|&nbsp; <span class="gl2">s<sub>T</sub> ∈ S<sub>goal</sub></span> ]`, { fontSize: 50, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Times New Roman',serif", fontStyle: "italic" }, true);
  const am = fm.querySelector(".am"), sg = fm.querySelector(".sg"), gl = fm.querySelector(".gl2");
  const n1 = at(root, 1200, 720, "", "Σ c<sub>t</sub> = i부터 T까지 비용의 합", { fontSize: 26, color: COL.gold, whiteSpace: "nowrap" }, true);
  const n2 = at(root, 1200, 770, "", "s<sub>T</sub> ∈ S<sub>goal</sub> = 끝은 반드시 목표", { fontSize: 26, color: COL.goal, whiteSpace: "nowrap" }, true);
  const n3 = at(root, 1200, 820, "", "argmin = 최소를 만드는 <b>선택</b>", { fontSize: 26, color: "#64d2ff", whiteSpace: "nowrap" }, true);
  const ex = at(root, 1500, 470, "", `<span style="padding:8px 18px;border-radius:12px;border:2px solid rgba(255,255,255,.3)">버스 30분</span> &nbsp; vs &nbsp; <span style="padding:8px 18px;border-radius:12px;border:3px solid ${COL.path};color:${COL.path}">지하철 28분 ✓</span>`, { fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }, true);
  const hl = (el, on, col) => { const k = on.toFixed(2); if (el._k === k) return; el._k = k; el.style.background = on > 0.01 ? `color-mix(in srgb, ${col} ${(30 * on).toFixed(0)}%, transparent)` : ""; el.style.borderRadius = "10px"; el.style.boxShadow = on > 0.01 ? `0 0 0 3px color-mix(in srgb, ${col} ${(100 * on).toFixed(0)}%, transparent)` : ""; };
  return t => {
    vis(mz.wrap, t, 0.1, null); S(mz.bot, { o: K(t, 0.3, 0.4), x: 0, y: 4 * cs });
    paths.forEach(([p, c, n], i) => {
      const a = B[1] + i * 1.3, v = K(t, a, 1.2, E.io3);
      PA[i].set(v, i === 0 || t < B[2] + 2.5 ? 1 : 0.35);
      const steps = p.length - 1, k = Math.round(v * steps);
      htm(cnt[i], `<span style="color:${c}">길 ${n}</span> &nbsp;${k ? Array(Math.min(k, 6)).fill("1").join("+") + (k > 6 ? "+…" : "") : ""} = ${k}`);
      S(cnt[i], { o: K(t, a, 0.4) * (i === 0 || t < B[2] + 2.5 ? 1 : 0.4) });
    });
    pop(best, t, B[2] + 2.6);
    S(fm, { o: K(t, B[3], 0.8), y: (1 - K(t, B[3], 0.8, E.o5)) * 30 });
    hl(sg, K(t, B[3] + 1.2, 0.5) * (1 - K(t, B[4], 0.4)), COL.gold); hl(gl, K(t, B[4], 0.5) * (1 - K(t, B[5], 0.4)), COL.goal); hl(am, K(t, B[5], 0.5) * (1 - K(t, B[6], 0.4)), "#64d2ff");
    vis(n1, t, B[3] + 1.4, null); vis(n2, t, B[4] + 0.4, null); vis(n3, t, B[5] + 0.4, null);
    vis(ex, t, B[6] + 0.3, null);
  };
});

/* --- five elements --- */
sc(1, "문제 정의 5요소", [
  "이제 문제를 정식으로 적어 보자. 연속된 미로를 칸으로 잘라 셀 수 있게 만든다 — **이산화**. 각 칸이 하나의 **원자적 상태**",
  "① **초기 상태** — 시작하는 곳: 상태 **5**",
  "② **행동** ACTIONS(s) — 그 상태에서 가능한 행동들. 상태 3에서는 **{N, E, S}**",
  "③ **전이 모델** RESULT(s, a) — 행동하면 어느 상태가 되나? RESULT(3, E) = **a**",
  "④ **목표 상태** — 하나 이상의 목표 상태 집합: **{p}**",
  ["⑤ **행동 비용 함수** — 행동마다 비용. 모두 1이면 **경로 비용 = 행동 횟수**", 6],
  "**상태 공간** = 가능한 모든 상태의 집합(여기선 25개). 직접 나열하진 않는다 — 보통 너무 크다",
  "우리가 정의하는 건 초기 상태 · 행동 · 전이 모델 · 목표 · 비용 — 이 틀이 **3장 전체의 뼈대**다",
], (root, B) => {
  const X0 = 100, Y0 = 200, cs = 100;
  const mz = mazeView(root, X0, Y0, cs);
  for (const k in mz.cells) if (MZL[k]) mz.cells[k].textContent = MZL[k];
  const svg = svgLayer(root);
  const grid = [];
  for (let i = 0; i <= MZ.w; i++) grid.push(sv(svg, "line", { x1: X0 + i * cs, y1: Y0 - 10, x2: X0 + i * cs, y2: Y0 + MZ.h * cs + 10, stroke: COL.path, "stroke-width": 2, "stroke-dasharray": "8 8" }));
  for (let j = 0; j <= MZ.h; j++) grid.push(sv(svg, "line", { x1: X0 - 10, y1: Y0 + j * cs, x2: X0 + MZ.w * cs + 10, y2: Y0 + j * cs, stroke: COL.path, "stroke-width": 2, "stroke-dasharray": "8 8" }));
  const c3 = [X0 + 0.5 * cs, Y0 + 2.5 * cs];
  const acts = [[[c3[0], c3[1] - 30], [c3[0], c3[1] - cs + 20], "N"], [[c3[0] + 30, c3[1]], [c3[0] + cs - 20, c3[1]], "E"], [[c3[0], c3[1] + 30], [c3[0], c3[1] + cs - 20], "S"]].map(([a, b]) => arrow(svg, [a, b], { c: "#bf5af2", w: 5 }));
  const res = arrow(svg, [[c3[0] + 20, c3[1] - 20], [c3[0] + cs / 2, c3[1] - 55], [c3[0] + cs - 20, c3[1] - 20]], { c: COL.gold, w: 5, curve: true });
  const pcost = polyArrow(svg, cellPts(MZP, X0, Y0, cs), COL.path, 7, true);
  const L = [["① 초기 상태", "Initial state", "5", COL.st], ["② 행동", "ACTIONS(s)", "ACTIONS(3) = {N, E, S}", "#bf5af2"], ["③ 전이 모델", "RESULT(s, a)", "RESULT(3, E) = a", COL.gold], ["④ 목표 상태", "Goal states", "{ p }", COL.goal], ["⑤ 행동 비용", "Action cost", "c = 1 → 경로 비용 = 10", COL.path]].map(([a, b, c, col], i) =>
    at(root, 900, 190 + i * 118, "", `<div style="display:flex;align-items:baseline;gap:16px"><span style="font-size:32px;font-weight:900;color:${col}">${a}</span><span style="font-size:20px;color:rgba(255,255,255,.5)">${b}</span></div><div class="fx" style="font-size:30px;margin-top:4px">${c}</div>`, { width: 900, padding: "12px 24px", borderRadius: 18, borderLeft: "5px solid " + col, background: "rgba(255,255,255,.04)" }));
  const ss = at(root, 900, 780, "", `상태 공간 = <b>25</b>개 상태 <span style="color:rgba(255,255,255,.55);font-size:24px">(정의하지 않고, 필요할 때 생성)</span>`, { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" });
  const tick = at(root, 0, 0, "", "", { fontSize: 26, fontWeight: 900, color: COL.gold, fontFamily: "JBM" });
  return t => {
    vis(mz.wrap, t, 0.1, null);
    grid.forEach((g, i) => { g.style.opacity = K(t, B[0] + 0.8 + i * 0.05, 0.4) * (1 - 0.7 * K(t, B[1], 0.6)); });
    S(mz.bot, { o: K(t, B[1], 0.4), x: 0, y: 4 * cs, s: 1 + 0.2 * Math.sin(Math.PI * K(t, B[1], 0.8)) });
    glow2(mz.cells["0,4"], K(t, B[1], 0.5) * (1 - K(t, B[2], 0.5)), COL.st);
    setBg(mz.cells["0,2"], t > B[2] && t < B[4] ? "rgba(191,90,242,.3)" : "rgba(255,255,255,.04)");
    acts.forEach((a, i) => a.set(K(t, B[2] + 0.6 + i * 0.3, 0.4) * (1 - K(t, B[4], 0.4))));
    res.set(K(t, B[3] + 0.5, 0.6) * (1 - K(t, B[4] + 0.5, 0.4)));
    setBg(mz.cells["1,2"], t > B[3] + 0.9 && t < B[4] + 0.5 ? "rgba(255,212,121,.35)" : "rgba(255,255,255,.04)");
    glow2(mz.ex, K(t, B[4], 0.5) * (1 - K(t, B[5], 0.5)), COL.goal);
    const v = K(t, B[5] + 0.3, 2.6, E.lin); pcost.set(v * (1 - K(t, B[6], 0.5)));
    const p = along(cellPts(MZP, X0, Y0, cs), v); S(tick, { o: v > 0 && v < 1 ? 1 : 0, x: p[0] + 18, y: p[1] - 50 }); txt(tick, "+" + Math.round(v * 10));
    L.forEach((e, i) => { const q = K(t, B[1 + i], 0.7, E.o5); S(e, { o: q * (t > B[7] ? 1 : 1 - 0.55 * K(t, B[i + 2] || 999, 0.4)), x: (1 - q) * 50 }); });
    for (const k in mz.cells) { if (MZ.walls.has(k)) continue; const d = MZD[k] || 0; const q = K(t, B[6] + 0.2 + d * 0.06, 0.3) * (1 - K(t, B[6] + 2.5, 0.6)); if (q > 0.01) setBg(mz.cells[k], `rgba(100,210,255,${(0.35 * q).toFixed(3)})`); else if (t > B[6]) setBg(mz.cells[k], "rgba(255,255,255,.04)"); }
    vis(ss, t, B[6] + 0.3, null);
    L.forEach((e, i) => { if (t > B[7]) glow2(e, K(t, B[7] + i * 0.2, 0.4) * (1 - K(t, B[7] + 1.4 + i * 0.2, 0.6)), "#fff"); });
  };
});

/* --- transition function -> state-space graph --- */
sc(1, "전이 모델과 상태 공간 그래프", [
  "전이 모델은 **함수**다: f : S × A → S, 또는 **s′ = RESULT(s, a)**",
  ["모든 (상태, 행동) 조합을 표로 적으면 — 각 행 (s, a, s′)이 하나의 이동", 5.5],
  ["이 표를 그림으로 바꾸면 **상태 공간 그래프** — 표의 한 행 = 그래프의 간선 하나", 6.5],
  "하지만 이 표를 미리 다 만들어 두지 않는다. 필요할 때마다 **물어본다**",
  "ACTIONS(3)? → {N, E, S} · RESULT(3, E)? → a. 체스도 모든 판을 저장하는 대신 **규칙으로 계산**한다",
  "그래서 상태가 수십억 개인 문제도 다룰 수 있다 — 탐색은 이 두 함수만 부르며 그래프를 **조금씩 펼친다**",
], (root, B) => {
  const fm = at(root, 960, 190, "fx", `f : S × A → S &nbsp;&nbsp;&nbsp; s′ = RESULT(s, a)`, { fontSize: 50, whiteSpace: "nowrap" }, true);
  const rows = [["5", "N", "4"], ["5", "E", "b"], ["4", "N", "3"], ["3", "N", "2"], ["3", "E", "a"], ["2", "N", "1"], ["a", "E", "e"], ["b", "E", "g"], ["g", "N", "f"], ["f", "N", "e"]];
  const tb = tbl(root, 150, 280, [110, 110, 110], [["s", "a", "s′"]].concat(rows), { fontSize: 30, fontFamily: "JBM,monospace" });
  const gp = { 1: [1080, 300], 2: [1080, 420], 3: [1080, 540], 4: [1080, 660], 5: [1080, 780], a: [1240, 540], b: [1240, 780], e: [1400, 540], f: [1400, 660], g: [1400, 780] };
  const N = {}; for (const k in gp) N[k] = gnode(root, gp[k][0], gp[k][1], k, 36);
  const svg = svgLayer(root);
  const Eg = rows.map(([a, , b]) => gedge(svg, null, N[a], N[b], { dir: true, w: 4 }));
  const fly = rows.map(([a, x, b]) => at(root, 0, 0, "fx", `${a},${x},${b}`, { fontSize: 24, color: COL.gold, whiteSpace: "nowrap" }, true));
  const q1 = at(root, 600, 420, "", "", { fontSize: 38, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const q2 = at(root, 600, 520, "", "", { fontSize: 38, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const calls = at(root, 600, 680, "", "", { fontSize: 30, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }, true);
  const order = ["5", "4", "b", "3", "g", "2", "a", "f", "1", "e"];
  return t => {
    vis(fm, t, B[0], null);
    const tout = K(t, B[3], 0.6);
    S(tb.el, { o: K(t, B[1], 0.6) * (1 - tout) });
    rows.forEach((r, i) => {
      tb.row(i + 1, K(t, B[1] + 0.4 + i * 0.25, 0.4));
      const a = B[2] + 0.3 + i * 0.45, v = K(t, a, 0.7, E.io3);
      const sx = 150 + 165, sy = 280 + 52 + i * 52 + 26, [mx, my] = Eg[i].mid;
      S(fly[i], { o: v > 0 && v < 1 ? 1 : 0, x: lerp(sx, mx, v), y: lerp(sy, my, v) - Math.sin(Math.PI * v) * 60 });
      tb.R[i + 1].forEach(d => { d.style.background = t > a && t < a + 0.8 ? "rgba(255,212,121,.2)" : ""; });
    });
    // graph: nodes appear with rows; then "unfold" replay on B[5]
    const unf = t > B[5];
    for (const k in N) {
      const i0 = rows.findIndex(r => r[0] === k || r[2] === k);
      const ap = unf ? B[5] + 0.4 + order.indexOf(k) * 0.35 : B[2] + 0.3 + i0 * 0.45;
      const q = unf ? K(t, ap, 0.4, E.ob) : K(t, B[2] + 0.3 + i0 * 0.45 + 0.6, 0.4, E.ob);
      S(N[k], { o: unf ? (q > 0 ? 1 : 0.15) : clamp((t - B[2] - 0.9 - i0 * 0.45) * 3), s: 0.6 + 0.4 * q });
      nst(N[k], unf && q > 0 && q < 1 ? "cur" : unf && q >= 1 ? "fr" : k === "5" ? "st" : "");
    }
    Eg.forEach((e, i) => {
      if (unf) { const b = rows[i][2], a2 = rows[i][0]; const ta = B[5] + 0.4 + Math.max(order.indexOf(a2), order.indexOf(b)) * 0.35; e.set(K(t, ta, 0.4), "rgba(48,209,88,.8)"); }
      else e.set(K(t, B[2] + 0.75 + i * 0.45, 0.4), "rgba(255,255,255,.55)");
    });
    htm(q1, `ACTIONS(3) <span style="color:rgba(255,255,255,.4)">→</span> <span style="color:#bf5af2">${t > B[4] + 0.8 ? "{N, E, S}" : "?"}</span>`);
    htm(q2, `RESULT(3, E) <span style="color:rgba(255,255,255,.4)">→</span> <span style="color:${COL.gold}">${t > B[4] + 2.0 ? "a" : "?"}</span>`);
    vis(q1, t, B[3] + 0.5, B[5]); vis(q2, t, B[3] + 0.9, B[5]);
    glow2(N["3"], t > B[4] && t < B[5] ? 1 : 0, "#bf5af2");
    const nc = unf ? Math.min(order.length, Math.floor(clamp((t - B[5] - 0.4) / (0.35 * order.length)) * order.length + 1)) : 0;
    htm(calls, `상태 <b style="color:${COL.fr}">${nc}</b>개 생성 — 전부가 아니라 <b>필요한 만큼만</b>`); vis(calls, t, B[5] + 0.3, null);
  };
});

/* --- model & abstraction --- */
sc(1, "모델과 추상화", [
  "탐색은 세상 그 자체가 아니라 세상의 **모델** 위에서 실행된다",
  "모델은 일부러 단순화한 것 — 그래서 계획은 그것을 찾아낸 **모델만큼만** 좋다. (지도 앱에 없는 공사 → '최단 경로'가 막힌다)",
  ["게임 화면엔 정보가 많다: 위치 · 점 30개 · 적 2마리 · 방향… 이게 **세계 상태(world state)**", 6.5],
  "탐색 상태(search state)에는 계획에 **필요한 것만** 남긴다 — 이것이 **추상화(abstraction)**",
  ["문제 1 **경로 찾기**: 상태 = 위치 (x, y)만 → 12 × 10 = **120**개", 6],
  ["문제 2 **모든 점 먹기**: 위치 + 점 30개 각각 먹었나? → 120 × 2³⁰ ≈ **1,288억**개", 6.5],
  "세계 상태를 다 넣으면 120 × 2³⁰ × 144 × 4 ≈ **74조** — 같은 게임이라도 **문제가 상태를 정한다**",
], (root, B) => {
  // part 1: world vs model
  const Rn = rng(5);
  const world = at(root, 230, 230, "", "", { width: 600, height: 440, borderRadius: 24, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)", overflow: "hidden" });
  for (let i = 0; i < 46; i++) h(world, "ab", "", { left: 20 + (i % 8) * 72 + Rn() * 10, top: 20 + Math.floor(i / 8) * 70 + Rn() * 10, width: 40 + Rn() * 20, height: 34 + Rn() * 18, borderRadius: 6, background: `hsla(${Math.floor(Rn() * 360)},45%,55%,.35)` });
  h(world, "ab", "현실 세계", { left: 20, bottom: 14, fontSize: 26, fontWeight: 800 });
  const model = at(root, 1090, 230, "", "", { width: 600, height: 440, borderRadius: 24, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)" });
  const mp = [[80, 80], [250, 60], [450, 100], [120, 240], [320, 220], [520, 260], [200, 360], [420, 360]], me = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [6, 7], [5, 7]];
  const msvg = svgLayer(model);
  me.forEach(([a, b]) => sv(msvg, "line", { x1: mp[a][0], y1: mp[a][1], x2: mp[b][0], y2: mp[b][1], stroke: "rgba(255,255,255,.4)", "stroke-width": 3 }));
  mp.forEach(([x, y]) => h(model, "ab", "", { left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: "50%", background: "#16161c", border: "3px solid " + COL.st }));
  h(model, "ab", "모델 (그래프)", { left: 20, bottom: 14, fontSize: 26, fontWeight: 800 });
  const ar = at(root, 960, 450, "", "추상화 →", { fontSize: 34, fontWeight: 800, color: COL.gold, whiteSpace: "nowrap" }, true);
  const xmark = at(root, 1090 + 335, 230 + 160, "", "공사 중 ✕", { fontSize: 28, fontWeight: 900, color: COL.warn, padding: "4px 14px", border: "3px solid " + COL.warn, borderRadius: 12, background: "rgba(0,0,0,.6)", whiteSpace: "nowrap" }, true);
  const xnote = at(root, 1390, 720, "", "모델에 없으면 알고리즘은 모른다", { fontSize: 26, color: COL.warn, whiteSpace: "nowrap" }, true);
  // part 2: game board
  const GX = 140, GY = 230, gc = 46, gw = 12, gh = 10;
  const board = at(root, GX, GY, "", "", { width: gw * gc, height: gh * gc, borderRadius: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.12)" });
  const R2 = rng(21), dots = new Set(); while (dots.size < 30) dots.add(Math.floor(R2() * gw) + "," + (1 + Math.floor(R2() * (gh - 1))));
  const dotEls = [...dots].map(k => { const [i, j] = k.split(",").map(Number); return h(board, "ab", "", { left: i * gc + gc / 2 - 6, top: j * gc + gc / 2 - 6, width: 12, height: 12, borderRadius: "50%", background: "#ffd479" }); });
  for (let i = 0; i < gw; i++) h(board, "ab", "", { left: i * gc + 1, top: 1, width: gc - 2, height: gc - 2, background: "rgba(255,69,58,.08)" });
  const agent = h(board, "ab", `<div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 35%,#9be7ff,#0a84ff);box-shadow:0 0 16px #0a84ff"></div>`, { left: 4 * gc + 6, top: 6 * gc + 6, width: gc - 12, height: gc - 12 });
  const dirA = h(board, "ab", "→", { left: 5 * gc, top: 6 * gc + 4, fontSize: 30, fontWeight: 900, color: "#64d2ff" });
  const enemies = [2, 8].map(i => h(board, "ab", "", { left: i * gc + 6, top: 6, width: gc - 12, height: gc - 12, borderRadius: "40% 40% 8px 8px", background: COL.warn }));
  const vars = [["위치", "12 × 10", "120", COL.st], ["점 30개", "먹음/안 먹음", "2<sup>30</sup>", "#ffd479"], ["적 2마리", "12 × 1 통로", "12² = 144", COL.warn], ["방향", "동서남북", "4", "#64d2ff"]].map(([a, b, c, col], i) =>
    at(root, 800, 230 + i * 110, "", `<span style="font-size:30px;font-weight:900;color:${col}">${a}</span> <span style="font-size:21px;color:rgba(255,255,255,.55)">${b}</span><span class="fx" style="position:absolute;right:24px;top:22px;font-size:32px">${c}</span>`, { width: 520, height: 88, padding: "22px 24px", borderRadius: 16, background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.12)", whiteSpace: "nowrap" }));
  const outs = [
    at(root, 1380, 300, "", `<div class="lab">문제 1 · 경로 찾기</div><div class="fx" style="font-size:44px;margin-top:8px">120</div><div style="font-size:21px;color:rgba(255,255,255,.6)">목표: (x, y) == END</div>`, { width: 420 }),
    at(root, 1380, 470, "", `<div class="lab">문제 2 · 모든 점 먹기</div><div class="fx" style="font-size:44px;margin-top:8px">120 × 2<sup>30</sup></div><div style="font-size:21px;color:rgba(255,255,255,.6)">≈ 1,288억 · 목표: 점이 모두 false</div>`, { width: 420 }),
    at(root, 1380, 640, "", `<div class="lab">세계 상태 전부</div><div class="fx" style="font-size:44px;margin-top:8px;color:${COL.warn}">≈ 74조</div><div style="font-size:21px;color:rgba(255,255,255,.6)">120 × 2<sup>30</sup> × 144 × 4</div>`, { width: 420 }),
  ];
  return t => {
    const p1o = K(t, B[2], 0.6);
    S(world, { o: K(t, B[0], 0.7) * (1 - p1o), x: (1 - K(t, B[0], 0.7, E.o5)) * -40 });
    S(model, { o: K(t, B[0] + 1.2, 0.7) * (1 - p1o), x: (1 - K(t, B[0] + 1.2, 0.7, E.o5)) * 40 });
    S(ar, { o: K(t, B[0] + 0.9, 0.5) * (1 - p1o) });
    pop(xmark, t, B[1] + 2.5); S(xmark, { o: K(t, B[1] + 2.5, 0.3) * (1 - p1o) }); S(xnote, { o: K(t, B[1] + 3, 0.4) * (1 - p1o) });
    S(board, { o: K(t, B[2] + 0.3, 0.7) });
    const tm = t - B[2];
    enemies.forEach((e, i) => S(e, { o: 1 - 0.75 * K(t, B[4], 0.4) * (1 - K(t, B[6], 0.4)), x: Math.sin(tm * 1.2 + i * 2) * gc * 2 }));
    S(dirA, { o: 1 - 0.85 * K(t, B[4], 0.4) * (1 - K(t, B[6], 0.4)) });
    dotEls.forEach(d => S(d, { o: 1 - 0.85 * K(t, B[4], 0.4) * (1 - K(t, B[5], 0.4)) }));
    S(agent, { o: 1, x: Math.round(Math.sin(tm * 0.6) * 1.5) * gc });
    const act = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 1]];
    const stage = t < B[3] ? 0 : t < B[4] ? 1 : t < B[5] ? 2 : t < B[6] ? 3 : 4;
    vars.forEach((v, i) => { const q = K(t, B[2] + 0.6 + i * 0.4, 0.6, E.o5); const on = act[stage][i]; S(v, { o: q * (on ? 1 : 0.3), x: (1 - q) * 40 }); setBd(v, on && stage >= 2 ? (i === 0 ? COL.st : i === 1 ? "#ffd479" : i === 2 ? COL.warn : "#64d2ff") : "rgba(255,255,255,.12)"); v.style.textDecoration = on ? "" : "line-through"; });
    outs.forEach((e, i) => vis(e, t, B[4 + i] + 0.4, null, { dy: 24 }));
  };
});

/* --- Romania --- */
sc(1, "예제 ① 루마니아", [
  "예제 ① **루마니아 휴가** — 지금 아라드(Arad), 내일 부쿠레슈티(Bucharest)에서 비행기를 탄다",
  "실제 지도를 **도시와 도로만** 남긴 그래프로 추상화 — 도로 위 숫자가 거리 = **행동 비용**",
  ["초기 상태 = Arad · 행동 = 이웃 도시로 운전 · 전이 = B로 가면 B에 도착 · 목표 = Bucharest", 7],
  ["길 ① Arad → Sibiu → Fagaras → Bucharest: 140 + 99 + 211 = **450**", 6],
  ["길 ② Sibiu에서 Rimnicu Vilcea → Pitesti 경유: 140 + 80 + 97 + 101 = **418**", 6.5],
  "도시를 하나 **더** 거쳐도 32마일 **싸다** — 눈대중으로는 안 된다. 그래서 탐색이 필요하다",
], (root, B) => {
  const svg = svgLayer(root);
  const M = romania(root, svg);
  const P1 = ["Arad", "Sibiu", "Fagaras", "Bucharest"], P2 = ["Arad", "Sibiu", "Rimnicu", "Pitesti", "Bucharest"];
  const pa = (P, col, off) => polyArrow(svg, P.map(k => [RO.pos[k][0] + off, RO.pos[k][1] + off]), col, 9, true);
  const A1 = pa(P1, "#64d2ff", -4), A2 = pa(P2, COL.path, 4);
  const L = [["초기 상태", "Arad", COL.st], ["행동", "이웃 도시로 운전", "#bf5af2"], ["전이 모델", "B로 가면 B 도착", COL.gold], ["목표", "Bucharest", COL.goal], ["행동 비용", "도로 거리(마일)", COL.path]].map(([a, b, c], i) => at(root, 1240, 200 + i * 64, "", `<span style="color:${c};font-weight:900;display:inline-block;width:160px">${a}</span>${b}`, { fontSize: 28, fontWeight: 600, whiteSpace: "nowrap" }));
  const s1 = at(root, 1240, 560, "", "", { fontSize: 30, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR", padding: "12px 20px", borderRadius: 14, border: "2px solid #64d2ff" });
  const s2 = at(root, 1240, 660, "", "", { fontSize: 30, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR", padding: "12px 20px", borderRadius: 14, border: "2px solid " + COL.path });
  const tagO = at(root, 1240, 770, "", `418 &lt; 450 → <b style="color:${COL.path}">최적</b> · 32마일 차이`, { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" });
  const sum = (arr, n) => arr.slice(0, n).join(" + ") + (n ? " = " + arr.slice(0, n).reduce((a, b) => a + b, 0) : "");
  return t => {
    M.show(t, B[0] + 0.2);
    nst(M.N.Arad, t > B[0] + 0.5 ? "st" : ""); nst(M.N.Bucharest, t > B[0] + 1.5 ? "goal" : "");
    glow2(M.N.Arad, K(t, B[0] + 0.5, 0.5) * (1 - K(t, B[1], 0.5)), COL.st); glow2(M.N.Bucharest, K(t, B[0] + 1.5, 0.5) * (1 - K(t, B[1], 0.5)), COL.goal);
    RO.edges.forEach(([a, b]) => { const e = M.E[a + "|" + b]; if (e.lab) { const q = K(t, B[1] + 0.3, 0.5) * (1 - K(t, B[1] + 2.5, 0.5)); e.lab.style.transform = `translate(-50%,-50%) scale(${1 + 0.3 * q})`; e.lab._tr = null; } });
    L.forEach((e, i) => vis(e, t, B[2] + i * 0.7, null, { dy: 0, x: 0 }));
    const v1 = K(t, B[3] + 0.2, 2.2, E.io3), v2 = K(t, B[4] + 0.2, 2.6, E.io3);
    A1.set(v1, t > B[4] ? 0.45 : 1); A2.set(v2);
    htm(s1, "① " + sum([140, 99, 211], Math.round(v1 * 3))); htm(s2, "② " + sum([140, 80, 97, 101], Math.round(v2 * 4)));
    vis(s1, t, B[3], null); vis(s2, t, B[4], null); vis(tagO, t, B[5] + 0.2, null);
  };
});

/* --- vacuum world --- */
const VAC = { 1: [0, 1, 1], 2: [1, 1, 1], 3: [0, 1, 0], 4: [1, 1, 0], 5: [0, 0, 1], 6: [1, 0, 1], 7: [0, 0, 0], 8: [1, 0, 0] };
function vacCard(root, x, y, id, w = 230, hh = 104) {
  const [rp, da, db] = VAC[id];
  const dirt = d => d ? `<div style="position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:4px">${[0, 1, 2].map(() => `<i style="width:10px;height:10px;border-radius:50%;background:#a07a4a;display:block"></i>`).join("")}</div>` : "";
  const bot = `<div style="position:absolute;left:50%;top:14px;transform:translateX(-50%);width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#9be7ff,#0a84ff);box-shadow:0 0 12px #0a84ff"></div>`;
  const room = (i, d) => `<div style="position:absolute;left:${i * (w / 2)}px;top:0;width:${w / 2 - 4}px;height:${hh}px;border-radius:14px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.14)">${rp === i ? bot : ""}${dirt(d)}</div>`;
  const e = at(root, x, y, "", room(0, da) + room(1, db) + `<div style="position:absolute;left:-30px;top:-14px;font:800 22px JBM;color:rgba(255,255,255,.55)">${id}</div>`, { width: w, height: hh }, true);
  e.X = x; e.Y = y; e.R = 0; return e;
}
sc(1, "예제 ② 진공청소기 세계", [
  "예제 ② **진공청소기 세계** — 방 두 개(A, B)와 청소기 한 대",
  "상태 = 청소기 위치 × A 먼지 × B 먼지 = 2 × 2 × 2 = **8개**의 원자적 상태",
  ["행동 = **왼쪽(L) · 오른쪽(R) · 흡입(S)** — 이동하거나 먼지를 없앤다. 비용은 행동당 1", 6.5],
  "목표 = 두 방 모두 깨끗 — 청소기가 어디 있든 상관없으니 목표 상태는 **2개** (7, 8)",
  ["최적 해: [A, 둘 다 더러움]에서 **흡입 → 오른쪽 → 흡입**. 행동 3개 = 경로 비용 3", 7],
], (root, B) => {
  const P = { 1: [760, 260], 2: [1160, 260], 5: [330, 520], 6: [650, 520], 3: [1270, 520], 4: [1590, 520], 8: [760, 790], 7: [1160, 790] };
  const C = {}; for (const k in P) C[k] = vacCard(root, P[k][0], P[k][1], +k);
  const svg = svgLayer(root);
  const ed = (a, b, lab, bend, col) => { const A = { X: P[a][0], Y: P[a][1] }, Bn = { X: P[b][0], Y: P[b][1] }; const dx = Bn.X - A.X, dy = Bn.Y - A.Y, L = Math.hypot(dx, dy); const ra = Math.abs(dx / L) > 0.9 ? 125 : 70; A.R = ra; Bn.R = ra; const e = gedge(svg, root, A, Bn, { dir: true, wt: lab, bend: bend || 0, w: 3 }); e.lab.style.color = col || "#fff"; return e; };
  const LR = [[1, 2, "R", -22], [2, 1, "L", -22], [5, 6, "R", -22], [6, 5, "L", -22], [3, 4, "R", -22], [4, 3, "L", -22], [8, 7, "R", -22], [7, 8, "L", -22]].map(([a, b, l, bd]) => ed(a, b, l, bd, "#64d2ff"));
  const SS = [[1, 5], [2, 4], [6, 8], [3, 7]].map(([a, b]) => ed(a, b, "S", 0, COL.gold));
  const sol = [[1, 5], [5, 6], [6, 8]];
  const solA = sol.map(([a, b]) => arrow(svg, [[P[a][0], P[a][1]], [P[b][0], P[b][1]]], { c: COL.path, w: 8, head: 20 }));
  const cnt = at(root, 330, 790, "", "", { fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const f8 = at(root, 330, 330, "fx", "2 × 2 × 2 = 8", { fontSize: 44, whiteSpace: "nowrap" }, true);
  return t => {
    Object.keys(P).forEach((k, i) => { const q = K(t, B[0] + 0.3 + i * 0.12, 0.6, E.ob); S(C[k], { o: clamp((t - B[0] - 0.3 - i * 0.12) * 3), s: 0.7 + 0.3 * q }); });
    vis(f8, t, B[1] + 0.5, B[4]);
    LR.forEach((e, i) => { e.set(K(t, B[2] + 0.2 + i * 0.12, 0.5), "rgba(100,210,255,.6)"); S(e.lab, { o: K(t, B[2] + 0.5 + i * 0.12, 0.4) }); });
    SS.forEach((e, i) => { e.set(K(t, B[2] + 1.4 + i * 0.2, 0.5), "rgba(255,212,121,.7)"); S(e.lab, { o: K(t, B[2] + 1.7 + i * 0.2, 0.4) }); });
    [7, 8].forEach(k => { const q = K(t, B[3] + 0.4, 0.5); C[k].firstChild.style.borderColor = q > 0.5 ? COL.path : ""; C[k].children[1].style.borderColor = q > 0.5 ? COL.path : ""; glow2(C[k], q, COL.path); });
    let n = 0; solA.forEach((a, i) => { const v = K(t, B[4] + 0.6 + i * 1.3, 0.9, E.io3); a.set(v); if (v >= 1) n++; });
    [1, 5, 6, 8].forEach((k, i) => { const on = t > B[4] + 0.3 + i * 1.3 && t < B[4] + 0.3 + (i + 1) * 1.3 + (i === 3 ? 99 : 0); glow2(C[k], on ? 1 : 0, COL.cur); });
    htm(cnt, `경로 비용 = <span style="color:${COL.path}">${n}</span>`); vis(cnt, t, B[4] + 0.4, null);
  };
});

/* --- 8-puzzle --- */
const PZ0 = [7, 2, 4, 5, 0, 6, 8, 3, 1], PZG = [0, 1, 2, 3, 4, 5, 6, 7, 8];
function puzzle(root, x, y, cs, st, o = {}) {
  const wrap = at(root, x, y, "", "", { width: 3 * cs, height: 3 * cs, borderRadius: 18, background: "rgba(255,255,255,.04)", border: "2px solid rgba(255,255,255,.14)" });
  const bgc = []; for (let i = 0; i < 9; i++) bgc.push(h(wrap, "ab", "", { left: (i % 3) * cs + 3, top: Math.floor(i / 3) * cs + 3, width: cs - 6, height: cs - 6, borderRadius: 12, background: "transparent" }));
  const tiles = {};
  for (let v = 1; v <= 8; v++) tiles[v] = h(wrap, "ab", String(v), { left: 0, top: 0, width: cs - 10, height: cs - 10, borderRadius: 14, background: "linear-gradient(180deg,#3a3a46,#24242c)", border: "2px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: cs * 0.42, fontWeight: 900, fontFamily: "JBM,monospace", boxShadow: "0 6px 18px rgba(0,0,0,.4)" });
  const place = (s, from, v) => { for (let tv = 1; tv <= 8; tv++) { const i = s.indexOf(tv); let px = (i % 3) * cs + 5, py = Math.floor(i / 3) * cs + 5; if (from) { const j = from.indexOf(tv); px = lerp((j % 3) * cs + 5, px, v); py = lerp(Math.floor(j / 3) * cs + 5, py, v); } S(tiles[tv], { o: 1, x: px, y: py }); } };
  place(st);
  return { wrap, tiles, bgc, place, cs };
}
const swapBlank = (s, d) => { const i = s.indexOf(0), r = Math.floor(i / 3), c = i % 3, [dr, dc] = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }[d]; const j = (r + dr) * 3 + c + dc; const n = s.slice(); n[i] = n[j]; n[j] = 0; return n; };
const blankActs = s => { const i = s.indexOf(0), r = Math.floor(i / 3), c = i % 3; return [r > 0 && "U", r < 2 && "D", c > 0 && "L", c < 2 && "R"].filter(Boolean); };
sc(1, "예제 ③ 8-퍼즐", [
  "예제 ③ **슬라이딩 타일 퍼즐(8-퍼즐)** — 3×3 판에 타일 8개와 빈칸 하나",
  "타일을 미는 대신 **빈칸을 움직인다**고 보면 행동이 단 4가지: ↑ ↓ ← →",
  ["빈칸이 가운데면 4방향, 변이면 3, 모서리면 2 — 이렇게 상태·행동을 정하는 것 자체가 **설계상의 결정**", 7.5],
  "전이 모델: 빈칸과 그 자리 타일을 맞바꾼다 · 목표: 타일이 순서대로 · 비용: 이동 한 번에 1",
  ["상태 수: 타일 배치 9! = 362,880 — 그런데 그중 **절반**은 어떤 시작에서도 도달할 수 없다 → **181,440**", 7],
  "15-퍼즐 ≈ 10¹³, 24-퍼즐 ≈ 10²⁵ — 판이 조금만 커져도 상태 공간은 **폭발**한다",
], (root, B) => {
  const cs = 140, pz = puzzle(root, 170, 250, cs, PZ0);
  const gl = at(root, 170, 200, "lab", "START", {});
  const gz = puzzle(root, 760, 330, 84, PZG); const gzl = at(root, 760, 290, "lab", "GOAL", {});
  const moves = ["U", "L", "D", "R"], ST = [PZ0]; moves.forEach(m => ST.push(swapBlank(ST[ST.length - 1], m)));
  const actL = at(root, 170 + 1.5 * cs, 250 + 3 * cs + 50, "", "", { fontSize: 32, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const T4 = at(root, 1150, 260, "", "", { width: 650 });
  const items = [["전이 모델", "빈칸 ↔ 이웃 타일 맞바꾸기"], ["목표 상태", "오른쪽 GOAL 배치"], ["행동 비용", "이동 한 번 = 1"]].map(([a, b], i) => h(T4, "", `<span style="color:${COL.gold};font-weight:900;display:inline-block;width:170px">${a}</span>${b}`, { fontSize: 29, margin: "0 0 22px", whiteSpace: "nowrap" }));
  const bars = [["8-퍼즐", 181440, "181,440"], ["15-퍼즐", 1.05e13, "≈ 10¹³"], ["24-퍼즐", 7.8e24, "≈ 10²⁵"]].map(([a, v, s], i) => {
    const w = Math.log10(v) / 25 * 560;
    const e = at(root, 1150, 520 + i * 100, "", `<div style="font-size:26px;font-weight:800;margin-bottom:8px">${a} <span class="fx" style="color:${COL.gold};margin-left:12px">${s}</span></div><div class="bar" style="height:22px;width:${w}px;border-radius:11px;background:linear-gradient(90deg,#ff9f0a,#ffd60a);transform-origin:0 50%"></div>`, { width: 700 });
    e.bar = e.querySelector(".bar"); return e;
  });
  const half = at(root, 1150, 470, "", "9! = 362,880 → ÷ 2 → <b style='color:" + COL.gold + "'>181,440</b>", { fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" });
  const logN = at(root, 1150, 830, "", "막대 길이 = 자릿수(log 눈금)", { fontSize: 20, color: "rgba(255,255,255,.5)" });
  return t => {
    vis(pz.wrap, t, 0.2, null); vis(gl, t, 0.3, null); vis(gz.wrap, t, 0.8, null); vis(gzl, t, 0.9, null);
    // moves across B[1]..B[3]
    const mt = [B[1] + 2.6, B[2] + 1.6, B[2] + 4.2, B[3] + 0.6];
    let k = 0, v = 1; mt.forEach((a, i) => { if (t > a) { k = i + 1; v = K(t, a, 0.6, E.io3); } });
    pz.place(ST[k], k ? ST[k - 1] : null, k ? v : 1);
    const curS = ST[k], acts = blankActs(curS), bi = curS.indexOf(0);
    const showA = t > B[1] && t < B[4];
    const r = Math.floor(bi / 3), c = bi % 3;
    pz.bgc.forEach((b, i) => { const rr = Math.floor(i / 3), cc = i % 3; const adj = Math.abs(rr - r) + Math.abs(cc - c) === 1; setBg(b, showA && adj && v >= 1 ? "rgba(191,90,242,.35)" : showA && i === bi ? "rgba(255,214,10,.18)" : "transparent"); });
    const kind = acts.length === 4 ? "가운데" : acts.length === 3 ? "변" : "모서리";
    htm(actL, showA ? `빈칸 위치: <span style="color:#bf5af2">${kind}</span> → 행동 <span style="color:#bf5af2">${acts.length}</span>개` : ""); S(actL, { o: showA ? 1 : 0 });
    vis(T4, t, B[3], null); items.forEach((e, i) => vis(e, t, B[3] + 0.3 + i * 0.5, null));
    vis(half, t, B[4] + 0.4, null);
    bars.forEach((e, i) => { const a = i === 0 ? B[4] + 1.6 : B[5] + (i - 1) * 0.9; vis(e, t, a, null); S(e.bar, { sx: K(t, a + 0.2, 1.0, E.o5) }); });
    vis(logN, t, B[5] + 1.5, null);
  };
});

/* --- parity invariant --- */
const permParity = s => { const a = s.map(v => (v === 0 ? 9 : v)); let inv = 0; for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) if (a[i] > a[j]) inv++; return inv % 2; };
sc(1, "왜 절반은 도달 불가?", [
  "왜 절반은 도달할 수 없을까? 판을 체스판처럼 **밝은 칸 / 어두운 칸**으로 칠해 보자",
  ["빈칸이 한 번 움직일 때마다 밝은 칸 ↔ 어두운 칸이 **바뀐다**", 6],
  ["동시에 (빈칸까지 포함한) 순열의 **짝/홀**도 매번 뒤집힌다 — 두 칸을 맞바꾸는 것이니까", 7],
  "둘이 **함께** 뒤집히니 두 값의 합(mod 2)은 절대 변하지 않는다 — **불변량(invariant)**",
  "그래서 9! 개 배치는 **181,440 + 181,440** 두 세계로 갈리고, 어떤 합법적 이동도 경계를 넘지 못한다",
  "예: 목표에서 타일 **1과 2만** 바꿔 끼운 판 — 반대 세계에 있으니 **절대 풀 수 없다**",
], (root, B) => {
  const cs = 130, X0 = 170, Y0 = 250, pz = puzzle(root, X0, Y0, cs, PZ0);
  pz.bgc.forEach((b, i) => { const r = Math.floor(i / 3), c = i % 3; b.style.background = (r + c) % 2 ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.16)"; b._bgc = b.style.background; });
  const moves = ["U", "L", "D", "R", "R", "U"], ST = [PZ0]; moves.forEach(m => ST.push(swapBlank(ST[ST.length - 1], m)));
  const rows = [["빈칸 칸 색", s => { const i = s.indexOf(0); return (Math.floor(i / 3) + i % 3) % 2; }, ["밝음 0", "어두움 1"]], ["순열 짝/홀", permParity, ["짝 0", "홀 1"]]];
  const P = rows.map(([a], i) => at(root, 720, 290 + i * 120, "", "", { fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }));
  const sumE = at(root, 720, 530, "", "", { fontSize: 40, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR", padding: "10px 24px", borderRadius: 16, border: "3px solid " + COL.fr });
  const mvN = at(root, X0 + 1.5 * cs, Y0 + 3 * cs + 46, "", "", { fontSize: 28, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }, true);
  const w0 = at(root, 1460, 360, "", `<div style="font-size:24px;color:rgba(255,255,255,.6)">합 = 0 세계</div><div class="fx" style="font-size:44px">181,440</div><div style="font-size:21px;color:${COL.fr}">목표가 여기 있다</div>`, { width: 330, height: 330, borderRadius: "50%", background: "radial-gradient(circle,rgba(48,209,88,.25),rgba(48,209,88,.05))", border: "3px solid " + COL.fr, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, true);
  const w1 = at(root, 1460, 760, "", `<div style="font-size:24px;color:rgba(255,255,255,.6)">합 = 1 세계</div><div class="fx" style="font-size:44px">181,440</div><div style="font-size:21px;color:${COL.warn}">여기서는 영원히 목표 불가</div>`, { width: 330, height: 330, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,69,58,.22),rgba(255,69,58,.04))", border: "3px solid " + COL.warn, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, true);
  const wall = at(root, 1460, 560, "", "", { width: 400, height: 8, borderRadius: 4, background: "repeating-linear-gradient(90deg,#fff 0 18px,transparent 18px 30px)" }, true);
  const sw = puzzle(root, 1690, 640, 64, [0, 2, 1, 3, 4, 5, 6, 7, 8]); const swl = at(root, 1690, 602, "lab", "1 ↔ 2", {});
  return t => {
    vis(pz.wrap, t, 0.2, null);
    const span = [B[1] + 0.8, B[3] + 0.5], n = moves.length;
    let k = 0, v = 1; for (let i = 0; i < n; i++) { const a = span[0] + i * ((span[1] - span[0]) / n); if (t > a) { k = i + 1; v = K(t, a, 0.6, E.io3); } }
    pz.place(ST[k], k ? ST[k - 1] : null, k ? v : 1);
    const s = ST[v > 0.5 ? k : Math.max(0, k - 1)];
    rows.forEach(([a, f, labs], i) => { const val = f(s); htm(P[i], `${a}: <span style="color:${val ? COL.gold : "#64d2ff"}">${labs[val]}</span>`); vis(P[i], t, B[1 + i] + 0.1, null); });
    const sm = (rows[0][1](s) + rows[1][1](s)) % 2;
    htm(sumE, `합 mod 2 = <span style="color:${COL.fr}">${sm}</span> <span style="font-size:26px;color:rgba(255,255,255,.55)">(항상!)</span>`); vis(sumE, t, B[3], null);
    htm(mvN, `이동 ${k}회`); S(mvN, { o: K(t, B[1], 0.5) });
    pop(w0, t, B[4]); pop(w1, t, B[4] + 0.4); S(wall, { o: K(t, B[4] + 0.9, 0.5), sx: K(t, B[4] + 0.9, 0.6, E.o5) });
    S(pz.wrap, { o: 1, s: 1 - 0.0 * K(t, B[4], 0.5) });
    vis(sw.wrap, t, B[5] + 0.3, null); vis(swl, t, B[5] + 0.4, null);
  };
});
