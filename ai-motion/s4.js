"use strict";
/* ===================== 3-4 정보 탐색 ===================== */
const RON = {}; for (const k in RO.pos) RON[k] = [RO.pos[k][0], RO.pos[k][1], RO.name[k] || k];
const ROH = {}; for (const k in RO.lpos) { const [dx, dy] = RO.lpos[k]; ROH[k] = dy ? [0, -dy * 0.95] : [-dx * 0.95, 0]; }
const short = s => (s === "Rimnicu" ? "Rimnicu V." : s);

chTitle(4, ["휴리스틱 h(n)", "탐욕적 최선 우선", "A* : f = g + h", "허용성 · 최적성 증명", "일관성", "휴리스틱 설계", "가중 A*"]);

/* --- heuristic --- */
sc(4, "휴리스틱 함수", [
  "이제 에이전트는 **힌트**를 얻는다. 함수 하나가 모든 것을 바꾼다: **h(n)** = n에서 목표까지의 **추정** 비용",
  ["무정보 탐색은 모든 방향을 '공평하게' 봤다. 목표가 동쪽인 걸 안다면 서쪽 길을 똑같이 볼 이유가 없다", 6.5],
  "**유클리드 거리**: 직선 거리, 장애물 무시 — (1,1) → (4,5)는 √(3² + 4²) = **5**",
  "**맨해튼 거리**: 가로 칸 수 + 세로 칸 수 = 3 + 4 = **7** — 상하좌우로만 움직이면 이쪽이 실제에 더 가깝다",
  ["둘 다 벽을 무시하니 실제 거리보다 **짧거나 같다** — 이 '과대평가하지 않음'이 뒤에 나올 **허용성**", 6.5],
], (root, B) => {
  // part 1: blind vs informed
  const A1 = at(root, 520, 520, "", "", { width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(191,90,242,.35),rgba(191,90,242,.03) 70%)", border: "2px solid rgba(191,90,242,.5)" }, true);
  const A2 = at(root, 1400, 520, "", "", { width: 520, height: 300, background: "radial-gradient(ellipse at 0% 50%,rgba(255,159,10,.45),rgba(255,159,10,.03) 75%)", clipPath: "polygon(0 50%,100% 0,100% 100%)" }, true);
  const s1 = gnode(root, 520, 520, "S", 26), s2 = gnode(root, 1140, 520, "S", 26), g2 = gnode(root, 1690, 520, "G", 26);
  const l1 = at(root, 520, 790, "", "무정보 — 사방으로", { fontSize: 30, fontWeight: 800, whiteSpace: "nowrap", color: "#bf5af2" }, true);
  const l2 = at(root, 1400, 790, "", "정보 — 목표 쪽으로", { fontSize: 30, fontWeight: 800, whiteSpace: "nowrap", color: COL.path }, true);
  // part 2: grid distances
  const cs = 100, X0 = 300, Y0 = 220, n = 6;
  const grid = at(root, X0, Y0, "", "", { width: n * cs, height: n * cs });
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) h(grid, "ab", "", { left: i * cs + 2, top: j * cs + 2, width: cs - 4, height: cs - 4, borderRadius: 8, background: (i === 2 && j >= 1 && j <= 4) ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.04)" });
  for (let i = 0; i < n; i++) { h(grid, "ab", String(i), { left: i * cs + cs / 2 - 6, top: -36, fontSize: 20, color: "rgba(255,255,255,.4)", fontFamily: "JBM" }); h(grid, "ab", String(i), { left: -30, top: i * cs + cs / 2 - 12, fontSize: 20, color: "rgba(255,255,255,.4)", fontFamily: "JBM" }); }
  const c = (i, j) => [X0 + (i + 0.5) * cs, Y0 + (j + 0.5) * cs];
  const sA = gnode(root, ...c(1, 1), "S", 30), gA = gnode(root, ...c(4, 5), "G", 30);
  const svg = svgLayer(root);
  const eu = arrow(svg, [c(1, 1), c(4, 5)], { c: "#64d2ff", w: 6 });
  const mh = arrow(svg, [c(1, 1), c(4, 1), c(4, 5)], { c: COL.gold, w: 6, head: 18 });
  const real = arrow(svg, [c(1, 1), c(1, 0), c(3, 0), c(3, 5), c(4, 5)], { c: COL.fr, w: 5, dash: "10 10" });
  const R = [["유클리드", "√(3² + 4²) = 5", "#64d2ff"], ["맨해튼", "|3| + |4| = 7", COL.gold], ["실제 (벽 우회)", "9 ≥ 7 ≥ 5", COL.fr]].map(([a, b, col], i) => at(root, 1060, 330 + i * 120, "", `<span style="color:${col};font-weight:900;display:inline-block;width:240px">${a}</span><span class="fx">${b}</span>`, { fontSize: 36, whiteSpace: "nowrap" }));
  const hr = at(root, 1060, 720, "", `h(n) ≤ <b style="color:${COL.fr}">실제 비용</b> → 허용 가능`, { fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" });
  return t => {
    const o1 = K(t, B[2] - 0.3, 0.5);
    S(A1, { o: K(t, B[1], 0.8) * (1 - o1), s: 0.4 + 0.6 * K(t, B[1], 1.4, E.o5) }); S(A2, { o: K(t, B[1] + 1.4, 0.8) * (1 - o1), sx: K(t, B[1] + 1.4, 1.4, E.o5) });
    [s1, s2, g2].forEach((e, i) => { S(e, { o: K(t, B[1] + i * 0.3, 0.4) * (1 - o1) }); nst(e, i === 2 ? "goal" : "st"); });
    S(l1, { o: K(t, B[1] + 0.8, 0.5) * (1 - o1) }); S(l2, { o: K(t, B[1] + 2, 0.5) * (1 - o1) });
    const f0 = K(t, 0.3, 0.6) * (1 - K(t, B[1] - 0.3, 0.4));
    S(grid, { o: Math.max(f0, K(t, B[2], 0.5)) });
    [sA, gA].forEach((e, i) => { S(e, { o: Math.max(f0, K(t, B[2], 0.5)) }); nst(e, i ? "goal" : "st"); });
    eu.set(K(t, B[2] + 0.4, 0.8)); mh.set(K(t, B[3] + 0.3, 1.2, E.io3)); real.set(t > B[4] + 0.3 ? 1 : 0);
    R.forEach((e, i) => vis(e, t, [B[2] + 0.8, B[3] + 0.8, B[4] + 0.6][i], null));
    vis(hr, t, B[4] + 1.6, null);
  };
});

/* --- Romania SLD --- */
sc(4, "루마니아의 휴리스틱", [
  "루마니아 문제의 휴리스틱: 각 도시에서 **부쿠레슈티까지의 직선 거리** h_SLD",
  "직선 거리는 도로 지도만으로는 알 수 없는 **추가 정보** — 목표 좌표가 표시된 지도나 GPS 같은 것",
  ["Arad의 h = **366**, 실제 최단 도로 거리는 **418** — 도로는 구불구불하니 직선보다 항상 길거나 같다", 7],
], (root, B) => {
  const svg = svgLayer(root);
  const lines = {}; for (const k in RO.pos) if (k !== "Bucharest") lines[k] = sv(svg, "line", { x1: RO.pos[k][0], y1: RO.pos[k][1], x2: RO.pos.Bucharest[0], y2: RO.pos.Bucharest[1], stroke: "rgba(100,210,255,.35)", "stroke-width": 2, "stroke-dasharray": "6 8" });
  const M = romania(root, svg, { noW: true });
  const H = {}; for (const k in RO.pos) H[k] = at(root, RO.pos[k][0] + ROH[k][0], RO.pos[k][1] + ROH[k][1], "", String(RO.h[k]), { fontSize: 21, fontWeight: 800, color: "#64d2ff", fontFamily: "JBM" }, true);
  const T = tbl(root, 1250, 200, [250, 120], [["도시", "h"]].concat(["Arad", "Sibiu", "Timisoara", "Zerind", "Oradea", "Fagaras", "Rimnicu", "Pitesti", "Craiova", "Bucharest"].map(k => [RO.name[k] || k, String(RO.h[k])])), { fontSize: 25, fontFamily: "JBM,Noto Sans KR" });
  const cmp = at(root, 1250, 820, "", `Arad: h = <b style="color:#64d2ff">366</b> ≤ 실제 <b style="color:${COL.path}">418</b>`, { fontSize: 34, whiteSpace: "nowrap" });
  const P = ["Arad", "Sibiu", "Rimnicu", "Pitesti", "Bucharest"].map(k => RO.pos[k]);
  const road = polyArrow(svg, P, COL.path, 7, true);
  const ln = sv(svg, "line", { x1: RO.pos.Arad[0], y1: RO.pos.Arad[1], x2: RO.pos.Bucharest[0], y2: RO.pos.Bucharest[1], stroke: "#64d2ff", "stroke-width": 6 });
  return t => {
    M.show(t, 0.2); nst(M.N.Bucharest, "goal");
    let i = 0; for (const k in lines) { lines[k].style.opacity = K(t, B[0] + 0.6 + i * 0.08, 0.4) * (1 - 0.6 * K(t, B[2], 0.5)); S(H[k], { o: K(t, B[0] + 0.8 + i * 0.08, 0.4) }); i++; }
    S(H.Bucharest, { o: K(t, B[0] + 0.6, 0.4) });
    S(T.el, { o: K(t, B[1], 0.5) }); T.R.forEach((r, j) => T.row(j, K(t, B[1] + 0.2 + j * 0.15, 0.4)));
    ln.style.opacity = K(t, B[2] + 0.3, 0.4); road.set(K(t, B[2] + 1.2, 1.5, E.io3));
    nst(M.N.Arad, t > B[2] ? "cur" : "st");
    vis(cmp, t, B[2] + 2.4, null);
  };
});

/* --- Greedy run --- */
const roAlgo = (o) => Object.assign({ nodes: RON, edges: RO.edges, start: "Arad", goal: "Bucharest", labels: "side", lpos: RO.lpos, r: 15, h: RO.h, showH: true, hpos: ROH, ds: "pq" }, o);
algoScene(4, "탐욕적 탐색 실행", roAlgo({
  alg: "greedy", keyName: "h", noW: false, dsH: 380,
  intro: ["**탐욕적 최선 우선 탐색(greedy)**: h(n)이 가장 작은 노드부터 — 지금 목표에 가장 가까워 **보이는** 것", ["지금까지 온 비용 g는 **전혀 보지 않는다**. Arad에서 시작, h = 366", 5]],
  item: n => ({ lab: short(n.st), sub: "", key: "h=" + RO.h[n.st] }),
  kidLab: n => short(n.st) + " " + RO.h[n.st],
  popLab: n => short(n.st), popSub: (n, R) => "h = " + RO.h[n.st] + " · 실제로 온 비용 g = " + n.g + " (무시)",
  note: s => {
    if (s.goal) return `h가 가장 작은 **Bucharest(0)** 꺼냄 → 목표!`;
    const k = s.kids.map(x => `${short(x.n.st)}(${RO.h[x.n.st]})`);
    const extra = s.node.st === "Sibiu" ? " — Fagaras(176)가 가장 작다. Rimnicu(193)는 **지나쳐진다**" : s.node.st === "Arad" ? " — Sibiu(253)가 가장 작다" : "";
    return `h가 가장 작은 **${short(s.node.st)}(${RO.h[s.node.st]})** 꺼냄 → ${lst(k)}${extra}`;
  },
  stepMin: 5.0,
  outro: ["Arad → Sibiu → Fagaras → Bucharest: 140 + 99 + 211 = **450**. 확장은 단 3번 — **빠르다**", ["하지만 실제 최단 경로는 Rimnicu Vilcea를 지나는 **418** — 32마일 손해. Fagaras→Bucharest 도로(211)가 길었다", 7]],
}));

/* --- greedy not optimal --- */
sc(4, "탐욕적 탐색은 왜 최적이 아닐까", [
  "탐욕적 탐색은 **남은 추정치 h**만 저울질한다 — 이미 쓴 비용은 절대 고려하지 않는다",
  "위쪽 길: h = 2 → h = 1 → 목표, **3걸음**. 아래쪽 길: h = 1인 노드가 다섯 개 이어진 **6걸음**",
  ["아래쪽 노드는 계속 h = 1 → 프런티어의 h = 2보다 항상 먼저 꺼내진다 → **6걸음** 해를 반환하고 재고하지 않는다", 7.5],
  ["A*였다면 아래로 3걸음 가서 f = 3 + 1 = 4 > 위쪽 f = 1 + 2 = 3 → 위로 돌아가 **3걸음** 해를 찾는다", 7.5],
  ["성질 — 완전성: 예(유한 공간) · 최적성: **아니오** · 시간: 최악 O(b^m), 완벽한 h면 O(bm) · 공간: 시간과 같다", 8],
], (root, B) => {
  const P = { S: [260, 500], T1: [660, 300, 2], T2: [1060, 300, 1], G: [1500, 500] };
  for (let i = 0; i < 5; i++) P["B" + i] = [460 + i * 220, 720, 1];
  const N = {}; for (const k in P) N[k] = gnode(root, P[k][0], P[k][1], k === "S" || k === "G" ? k : "h=" + P[k][2], k === "S" || k === "G" ? 40 : 46, { fontSize: 24 });
  const svg = svgLayer(root);
  const ed = [["S", "T1"], ["T1", "T2"], ["T2", "G"], ["S", "B0"], ["B0", "B1"], ["B1", "B2"], ["B2", "B3"], ["B3", "B4"], ["B4", "G"]].map(([a, b]) => [a, b, gedge(svg, null, N[a], N[b], { dir: true, w: 3 })]);
  const fl = { T1: at(root, 660, 225, "", "", { fontSize: 26, fontWeight: 800, color: COL.gold, whiteSpace: "nowrap" }, true) };
  for (let i = 0; i < 3; i++) fl["B" + i] = at(root, 460 + i * 220, 800, "", "", { fontSize: 26, fontWeight: 800, color: COL.gold, whiteSpace: "nowrap" }, true);
  const props = at(root, 960, 130, "", "", { fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }, true);
  return t => {
    for (const k in N) pop(N[k], t, 0.3 + P[k][0] / 2500);
    nst(N.S, "st"); nst(N.G, "goal");
    ed.forEach(([a, b, e]) => e.set(K(t, 0.6 + P[a][0] / 2500, 0.4)));
    // greedy walk along bottom
    const gk = Math.floor(clamp((t - B[2] - 0.4) / 0.8, 0, 6));
    const astar = t > B[3];
    ["B0", "B1", "B2", "B3", "B4"].forEach((k, i) => nst(N[k], astar ? (i < 3 ? "ex" : "") : i < gk ? "path" : t > B[2] ? "fr" : ""));
    nst(N.T1, astar && t > B[3] + 3 ? "path" : t > B[2] ? "fr" : ""); nst(N.T2, astar && t > B[3] + 3.6 ? "path" : "");
    ed.forEach(([a, b, e], i) => { if (!astar && i >= 3 && i - 3 < gk) e.set(1, COL.path, 1, 6); if (astar && i < 3 && t > B[3] + 3 + i * 0.4) e.set(1, COL.path, 1, 6); if (astar && i >= 3) e.set(1, "rgba(255,255,255,.3)"); });
    if (!astar && gk >= 6) nst(N.G, "path"); if (astar && t > B[3] + 4.2) nst(N.G, "path");
    htm(fl.T1, astar ? "f = 1 + 2 = 3" : ""); S(fl.T1, { o: astar ? K(t, B[3] + 0.4, 0.4) : 0 });
    for (let i = 0; i < 3; i++) { htm(fl["B" + i], `f = ${i + 1} + 1 = ${i + 2}`); S(fl["B" + i], { o: astar ? K(t, B[3] + 0.8 + i * 0.5, 0.4) : 0 }); }
    htm(props, `완전성 <span style="color:${COL.fr}">예</span> · 최적성 <span style="color:${COL.warn}">아니오</span> · 시간 O(b<sup>m</sup>) ~ O(bm) · 공간 = 시간`); vis(props, t, B[4] + 0.3, null);
  };
});

/* --- f = g + h --- */
sc(4, "A* : f = g + h", [
  "**A***의 아이디어: 이미 비싼 경로는 확장하지 말자 → n까지 온 비용 **g(n)** 도 함께 본다",
  "f(n) = g(n) + h(n) — n을 거쳐 목표까지 가는 경로의 **추정 총비용**",
  ["같은 루프, 같은 프런티어, 같은 EXPAND. 우선순위만 다르다: f = g → **UCS** · f = h → **Greedy** · f = g + h → **A***", 8],
  ["Sibiu를 확장한 뒤 같은 후보를 놓고 — UCS는 **Zerind**(75), Greedy는 **Fagaras**(176), A*는 **Rimnicu Vilcea**(413)를 고른다", 8],
], (root, B) => {
  const y = 330;
  const sN = gnode(root, 300, y, "S", 34), nN = gnode(root, 960, y, "n", 34), gN = gnode(root, 1620, y, "G", 34);
  const svg = svgLayer(root);
  const gl = arrow(svg, [[340, y], [920, y]], { c: "#64d2ff", w: 8, head: 0 });
  const hl = arrow(svg, [[1000, y], [1580, y]], { c: COL.gold, w: 6, head: 0, dash: "14 12" });
  const gT = at(root, 630, y - 60, "", "g(n) — 이미 쓴 비용 (확실)", { fontSize: 30, fontWeight: 800, color: "#64d2ff", whiteSpace: "nowrap" }, true);
  const hT = at(root, 1290, y - 60, "", "h(n) — 남은 비용 추정", { fontSize: 30, fontWeight: 800, color: COL.gold, whiteSpace: "nowrap" }, true);
  const fT = at(root, 960, y + 100, "fx", "f(n) = g(n) + h(n)", { fontSize: 56, whiteSpace: "nowrap" }, true);
  const T = tbl(root, 380, 520, [280, 160, 160, 200, 200, 240], [["노드", "g", "h", "UCS (g)", "Greedy (h)", "A* (g+h)"], ["Zerind", "75", "374", "75", "374", "449"], ["Timisoara", "118", "329", "118", "329", "447"], ["Rimnicu V.", "220", "193", "220", "193", "413"], ["Fagaras", "239", "176", "239", "176", "415"]], { fontSize: 30, fontFamily: "JBM,Noto Sans KR" });
  const three = at(root, 960, 620, "", `<div style="display:flex;gap:30px;font-size:32px;font-weight:800">${[["f = g", "UCS", "#bf5af2"], ["f = h", "Greedy", COL.gold], ["f = g + h", "A*", COL.path]].map(([a, b, c]) => `<div style="padding:18px 30px;border-radius:18px;border:2px solid ${c};text-align:center"><div class="fx">${a}</div><div style="color:${c};margin-top:6px">${b}</div></div>`).join("")}</div>`, {}, true);
  return t => {
    [sN, nN, gN].forEach((n, i) => pop(n, t, 0.3 + i * 0.2)); nst(sN, "st"); nst(gN, "goal"); nst(nN, "cur");
    gl.set(K(t, B[0] + 0.8, 0.8)); hl.set(t > B[0] + 2 ? 1 : 0);
    vis(gT, t, B[0] + 1.2, null); vis(hT, t, B[0] + 2.2, null); vis(fT, t, B[1] + 0.2, null);
    S(three, { o: K(t, B[2], 0.5) * (1 - K(t, B[3], 0.4)) });
    S(T.el, { o: K(t, B[3], 0.5) }); T.R.forEach((r, i) => T.row(i, K(t, B[3] + 0.2 + i * 0.2, 0.4)));
    const pick = [[1, 3, "#bf5af2"], [4, 4, COL.gold], [3, 5, COL.path]];
    pick.forEach(([r, c, col], i) => { const on = t > B[3] + 2 + i * 1.6; const d = T.R[r][c]; d.style.background = on ? `color-mix(in srgb, ${col} 30%, transparent)` : ""; d.style.color = on ? col : ""; d.style.fontWeight = on ? 900 : ""; });
  };
});

/* --- A* run --- */
algoScene(4, "A* 실행", roAlgo({
  alg: "astar", keyName: "f", dsH: 470, cardH: 170, stepMin: 5.5,
  intro: ["A* 탐색: **f(n) = g(n) + h(n)** 이 가장 작은 노드부터. Arad: f = 0 + 366 = **366**", ["프런티어 항목 = 도시 · g + h · **f**. 트리 탐색이라 왔던 도시로 돌아가는 노드도 다시 들어간다", 6.5]],
  item: n => ({ lab: short(n.st), sub: n.g + "+" + RO.h[n.st], key: n.g + RO.h[n.st] }),
  kidLab: n => short(n.st) + " " + (n.g + RO.h[n.st]),
  popLab: n => short(n.st) + ` <span style="font-size:30px;color:${COL.gold}">f=${n.g + RO.h[n.st]}</span>`, popSub: (n, R) => `g = ${n.g} · h = ${RO.h[n.st]} · 경로 ${R.pathOf(n).map(short).join("→")}`,
  note: s => {
    const f = n => n.g + RO.h[n.st];
    if (s.goal) return `f가 가장 작은 **Bucharest(418)** 꺼냄 → **꺼낼 때** 목표 검사 → 최적 418마일!`;
    const k = s.kids.map(x => `${short(x.n.st)} ${f(x.n)}`);
    const st = s.node.st;
    const extra = st === "Sibiu" ? " — h로는 Fagaras가 낫지만 f로는 **Rimnicu(413) < Fagaras(415)**" : st === "Fagaras" ? " — 목표 Bucharest(450)가 들어왔지만 **아직 반환하지 않는다!**" : st === "Pitesti" ? " — **Bucharest 418**, 더 싼 경로 발견!" : "";
    return `f가 가장 작은 **${short(st)}(${f(s.node)})** 꺼냄 → ${lst(k)}${extra}`;
  },
  outro: [["Arad → Sibiu → Rimnicu Vilcea → Pitesti → Bucharest = **418** — 탐욕적(450)보다 32마일 짧은 최적 해", 7], ["핵심 장면: 450이 프런티어에 있었지만, Pitesti(417)가 '417로 갈 수도 있다'고 말하는 동안은 확정하지 않았다", 7.5]],
}));

/* --- grid BFS vs A* --- */
sc(4, "격자에서: BFS vs A*", [
  "격자에서 다시 — 이번엔 BFS vs A* (휴리스틱 = 맨해튼 거리)",
  ["BFS는 사방으로 둥글게 퍼진다. A*는 **목표 쪽으로 쏠려** 퍼지고, 벽에 막히면 그 주변만 조금 더 본다", 9],
  `BFS ${GT.bfs.steps}개 vs A* **${GT.astar.steps}개** 확장 — 둘 다 최단 경로 ${GT.astar.cost}칸. A*가 훨씬 적게 보고 같은 답을 낸다`,
], (root, B) => {
  const A = gridView(root, 110, 230, 26, `<span style="color:${COL.fr}">BFS</span>`, GT.bfs), D = gridView(root, 990, 230, 26, `<span style="color:${COL.path}">A*</span> · h = 맨해튼`, GT.astar, COL.path);
  return t => {
    vis(A.wrap, t, 0.2, null); vis(D.wrap, t, 0.4, null);
    const a = B[1] + 0.3, d = 7.5, k = clamp((t - a) / d) * GT.bfs.steps;
    [[A, GT.bfs], [D, GT.astar]].forEach(([G, tr]) => { const kk = Math.min(k, tr.steps); G.draw(kk, K(t, a + (tr.steps / GT.bfs.steps) * d + 0.2, 1.2)); htm(G.cnt, `확장 ${Math.floor(kk)}` + (kk >= tr.steps ? ` · 경로 <b style="color:${COL.path}">${tr.cost}</b>` : "")); });
  };
});

/* --- admissible --- */
sc(4, "허용 가능한 휴리스틱", [
  "언제 A*가 최적일까? 모든 n에 대해 **h(n) ≤ h*(n)** 이면 h는 **허용 가능(admissible)** — h*는 n에서 목표까지 실제 최소 비용",
  "즉 **절대 과대평가하지 않는** 낙관적인 추정 = 실제 비용의 **하한**",
  "허용 O: 직선 거리(366 ≤ 418) · h = 0 (→ A*가 UCS가 됨) · 상하좌우 격자의 맨해튼",
  "허용 X: 직선 거리 × 2 (732 > 418) · 대각선 이동이 되는 격자의 맨해튼",
  ["**정리: h가 허용 가능하면 A*는 최적이다.** 과대평가하면 최적 경로 위 노드가 뒤로 밀려, 덜 좋은 목표를 먼저 꺼낼 수 있다", 8],
], (root, B) => {
  const f = at(root, 960, 210, "fx", "0 ≤ h(n) ≤ h*(n)", { fontSize: 64, whiteSpace: "nowrap" }, true);
  const bar = (y, lab, v, col, tag) => at(root, 300, y, "", `<div style="display:flex;align-items:center;gap:24px"><span style="width:300px;font-size:30px;font-weight:800">${lab}</span><div class="br" style="height:48px;width:${v / 732 * 900}px;border-radius:10px;background:${col};transform-origin:0 50%"></div><span class="fx" style="font-size:32px">${v}</span><span style="font-size:32px;font-weight:900;color:${tag === "✓" ? COL.fr : COL.warn}">${tag}</span></div>`, { width: 1600 });
  const real = bar(330, "실제 h*(Arad)", 418, COL.path, "");
  const rows = [bar(430, "직선 거리", 366, "#64d2ff", "✓"), bar(510, "h = 0", 0, "#64d2ff", "✓"), bar(590, "직선 거리 × 2", 732, COL.warn, "✕")];
  [real, ...rows].forEach(r => r.br = r.querySelector(".br"));
  const line = at(root, 300 + 324 + 418 / 732 * 900, 470, "", "", { width: 3, height: 340, background: "repeating-linear-gradient(180deg," + COL.path + " 0 10px,transparent 10px 18px)" }, true);
  const thm = at(root, 960, 800, "", `정리: h 허용 가능 ⇒ <b style="color:${COL.path}">A*는 최적</b>`, { fontSize: 44, fontWeight: 800, whiteSpace: "nowrap", padding: "14px 34px", borderRadius: 18, border: "3px solid " + COL.path }, true);
  return t => {
    vis(f, t, 0.3, null);
    vis(real, t, B[1], null); S(real.br, { sx: K(t, B[1] + 0.2, 0.8, E.o5) }); S(line, { o: K(t, B[1] + 1, 0.4) });
    rows.forEach((r, i) => { const a = i < 2 ? B[2] + i * 1.2 : B[3]; vis(r, t, a, null); S(r.br, { sx: K(t, a + 0.2, 0.8, E.o5) }); });
    vis(thm, t, B[4] + 0.3, null);
  };
});

/* --- proof --- */
sc(4, "A* 최적성 증명", [
  "귀류법. C* = 최적 경로의 비용. 최적 경로 위의 어떤 노드 n이 **끝내 확장되지 않는다**고 가정하자",
  "그렇다면 n은 비용 C*인 목표보다 늦게 꺼내져야 하므로 — (1) f(n) > C*",
  "(2) f(n) = g(n) + h(n) · (3) n은 최적 경로 위에 있으므로 g(n) = g*(n)",
  "(4) 허용성 h(n) ≤ h*(n) 이므로 ≤ g*(n) + h*(n) · (5) 그 합은 최적 경로의 비용, 즉 = C*",
  ["(1)은 f(n) > C*, (5)는 f(n) ≤ C* — **모순**! 따라서 최적 경로 위 노드는 **모두 확장된다**", 6.5],
  ["루마니아: 최적 경로 노드의 f = 366, 393, 413, 417 ≤ 418, 가짜 목표 450 > 418 → Pitesti(417)가 먼저 꺼내진다", 8],
], (root, B) => {
  const y = 300, sN = gnode(root, 200, y, "S", 32), nN = gnode(root, 560, y, "n", 32), gN = gnode(root, 920, y, "G", 32);
  const svg = svgLayer(root);
  const a1 = arrow(svg, [[236, y], [524, y]], { c: "#64d2ff", w: 6, head: 0 }), a2 = arrow(svg, [[596, y], [884, y]], { c: COL.gold, w: 6, head: 0 });
  const t1 = at(root, 380, y - 54, "", "g*(n)", { fontSize: 28, fontWeight: 800, color: "#64d2ff", fontFamily: "JBM" }, true), t2 = at(root, 740, y - 54, "", "h*(n)", { fontSize: 28, fontWeight: 800, color: COL.gold, fontFamily: "JBM" }, true);
  const tot = at(root, 560, y + 70, "", "g*(n) + h*(n) = C*", { fontSize: 28, fontWeight: 700, fontFamily: "JBM", whiteSpace: "nowrap" }, true);
  const L = ["(1)  f(n) > C*", "(2)  f(n) = g(n) + h(n)", "(3)       = g*(n) + h(n)", "(4)       ≤ g*(n) + h*(n)   ← 허용성", "(5)       = C*"].map((s, i) => at(root, 1120, 210 + i * 76, "fx", esc(s), { fontSize: 36, whiteSpace: "pre" }));
  const X = at(root, 1440, 640, "", "", { fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", color: COL.warn }, true);
  const ro = at(root, 560, 620, "", "", { fontSize: 32, lineHeight: 1.8, fontFamily: "JBM,Noto Sans KR" }, true);
  return t => {
    [sN, nN, gN].forEach((n, i) => pop(n, t, 0.3 + i * 0.2)); nst(sN, "st"); nst(gN, "goal"); nst(nN, t > B[0] + 1.5 && t < B[4] ? "cur" : t > B[4] ? "ex" : "");
    a1.set(K(t, B[0] + 0.6, 0.6)); a2.set(K(t, B[0] + 1.0, 0.6)); vis(t1, t, B[2] + 2, null); vis(t2, t, B[3] + 1.5, null); vis(tot, t, B[3] + 3.5, null);
    const ap = [B[1] + 1.5, B[2] + 0.3, B[2] + 2.5, B[3] + 0.3, B[3] + 3.0];
    L.forEach((e, i) => { vis(e, t, ap[i], null, { dy: 14 }); setCol(e, t > B[4] && (i === 0 || i === 4) ? COL.warn : "#fff"); });
    htm(X, "모순 ⇒ f(n) ≤ C*"); vis(X, t, B[4] + 0.6, null);
    htm(ro, `<span style="color:${COL.fr}">366 · 393 · 413 · 417</span> ≤ 418<br><span style="color:${COL.warn}">450</span> &gt; 418 → 나중에 꺼냄`); vis(ro, t, B[5] + 0.3, null);
  };
});

/* --- consistency --- */
sc(4, "일관성 (consistency)", [
  "더 강한 조건 **일관성(단조성)**: 모든 n과 행동 a로 생기는 후속 n′에 대해 h(n) ≤ c(n, a, n′) + h(n′)",
  "**삼각 부등식**의 한 형태: 삼각형의 한 변 h(n)은 나머지 두 변의 합 c + h(n′)보다 길 수 없다",
  ["한 걸음 갈 때 h가 그 걸음의 비용보다 **더 많이 줄지 않는다** → 경로를 따라 f가 **절대 줄지 않는다**", 7],
  ["일관성 ⇒ 허용성, 하지만 허용성 ⇏ 일관성. 예: S→A(1)→G(3), h(S) = 4, h(A) = 1 — 둘 다 실제 이하지만 4 ≤ 1 + 1은 거짓", 8.5],
  "일관적이면 처음 꺼낸 경로가 이미 최적 — 같은 상태를 **다시 확장할 필요가 없다**",
], (root, B) => {
  const n = gnode(root, 300, 640, "n", 38), n2 = gnode(root, 700, 300, "n′", 38), g = gnode(root, 1000, 640, "G", 38);
  const svg = svgLayer(root);
  const e1 = gedge(svg, null, n, n2, { w: 5 }), e2 = gedge(svg, null, n2, g, { w: 5 }), e3 = gedge(svg, null, n, g, { w: 5 });
  const l1 = at(root, 440, 440, "", "c(n, a, n′)", { fontSize: 30, fontWeight: 800, color: "#64d2ff", fontFamily: "JBM", whiteSpace: "nowrap" }, true);
  const l2 = at(root, 920, 440, "", "h(n′)", { fontSize: 30, fontWeight: 800, color: COL.gold, fontFamily: "JBM" }, true);
  const l3 = at(root, 650, 690, "", "h(n)", { fontSize: 30, fontWeight: 800, color: COL.path, fontFamily: "JBM" }, true);
  const f = at(root, 1450, 260, "fx", "h(n) ≤ c(n,a,n′) + h(n′)", { fontSize: 40, whiteSpace: "nowrap" }, true);
  const mono = at(root, 1450, 400, "fx", "f(n′) = g(n) + c + h(n′)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;≥ g(n) + h(n) = f(n)", { fontSize: 32, whiteSpace: "nowrap", color: COL.fr }, true);
  const ce = at(root, 1450, 640, "", "", { fontSize: 30, lineHeight: 1.7, whiteSpace: "nowrap" }, true);
  return t => {
    [n, n2, g].forEach((x, i) => pop(x, t, 0.3 + i * 0.2)); nst(g, "goal");
    e1.set(K(t, B[0] + 0.8, 0.5), "#64d2ff"); e2.set(K(t, B[0] + 1.2, 0.5), COL.gold); e3.set(K(t, B[1], 0.6), COL.path);
    vis(l1, t, B[0] + 1.0, null); vis(l2, t, B[0] + 1.4, null); vis(l3, t, B[1] + 0.4, null);
    vis(f, t, B[0] + 0.5, null); vis(mono, t, B[2] + 0.5, null);
    htm(ce, `S →(1)→ A →(3)→ G<br>h(S) = 4 ≤ 4 ✓ · h(A) = 1 ≤ 3 ✓ <span style="color:${COL.fr}">허용</span><br>4 ≤ 1 + 1 ? <span style="color:${COL.warn}">✕ 비일관</span>`); vis(ce, t, B[3] + 0.4, null);
    S(n, { o: 1 }); glow2(f, K(t, B[4], 0.4), COL.fr);
  };
});

/* --- A* properties --- */
sc(4, "A*의 성질", [
  "A*: 완전성 **예** · 비용 최적성 **예** (허용 가능한 h일 때)",
  ["시간: f(n) ≤ C*인 노드를 거의 모두 확장 — 최악엔 BFS처럼 O(b^d). h가 정확할수록 그 영역이 **좁아진다**", 7.5],
  "h → 0이면 UCS처럼 둥글게, h가 정확할수록 목표를 향한 **좁은 띠**",
  "공간: 프런티어와 reached를 **모두** 메모리에 → 시간과 같다. **메모리가 A*의 가장 큰 약점**",
  "8-퍼즐(약 18만 상태)은 금방, 15-퍼즐(약 10¹³)은 좋은 휴리스틱 없이는 메모리가 못 버틴다",
], (root, B) => {
  const sx = 380, gx = 1000, cy = 560;
  const shapes = [[1.0, "#bf5af2", "h = 0 (UCS)"], [0.55, "#64d2ff", "보통의 h"], [0.18, COL.path, "정확한 h"]].map(([ry, c, lab], i) => at(root, (sx + gx) / 2, cy, "", `<span style="position:absolute;left:50%;top:-36px;transform:translateX(-50%);font-size:24px;font-weight:800;color:${c};white-space:nowrap">${lab}</span>`, { width: (gx - sx) + 260 - i * 60, height: 520 * ry + 60, borderRadius: "50%", border: "3px solid " + c, background: `color-mix(in srgb, ${c} 10%, transparent)` }, true));
  const sN = gnode(root, sx, cy, "S", 30), gN = gnode(root, gx, cy, "G", 30);
  const props = [["완전성", "예", COL.fr], ["최적성", "예 (h 허용 가능)", COL.fr], ["시간", "최악 O(b<sup>d</sup>)", "#64d2ff"], ["공간", "시간과 같다 — 약점!", COL.warn]].map(([a, b2, c], i) => at(root, 1380, 300 + i * 80, "", `<span style="display:inline-block;width:130px;color:${c};font-weight:900">${a}</span>${b2}`, { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }));
  return t => {
    pop(sN, t, 0.3); pop(gN, t, 0.5); nst(sN, "st"); nst(gN, "goal");
    shapes.forEach((s, i) => { const q = K(t, B[1] + 1 + i * 1.2, 0.8, E.o5); S(s, { o: q, sy: 0.3 + 0.7 * q }); });
    props.forEach((p, i) => vis(p, t, [B[0], B[0] + 0.6, B[1], B[3]][i], null));
  };
});

/* --- heuristic design (supplement) --- */
sc(4, "휴리스틱 설계 (보충)", [
  "좋은 휴리스틱은 어떻게 만들까? 8-퍼즐의 두 후보 (강의 개요의 보충 내용)",
  "**h₁** = 제자리에 없는 타일 수 — 이 판에선 8개 모두 → **h₁ = 8**",
  ["**h₂** = 각 타일이 목표 자리까지 가는 맨해튼 거리의 합 → 3 + 1 + 2 + 2 + 2 + 3 + 3 + 2 = **18**", 9],
  "**완화 문제**: 규칙을 일부 없앤 쉬운 문제의 최적 비용은 **허용 가능한** 휴리스틱이 된다",
  ["타일이 순간이동 가능 → h₁ · 겹쳐도 되고 인접 칸 이동 → h₂ · '도로를 따라야 한다'를 없애면 → 직선 거리", 7.5],
  ["**지배(dominance)**: 둘 다 허용 가능하고 항상 h₂ ≥ h₁ 이면 h₂가 더 좋다", 5.5],
  ["d = 12에서 확장 노드: IDS 3,644,035 · A*(h₁) 227 · A*(h₂) **73** — max(h₁, h₂, …)도 허용 가능", 7.5],
  "**패턴 데이터베이스**: 부분 문제(예: 타일 1~4)의 정확한 최소 비용을 미리 계산해 표로 저장해 두고 꺼내 쓴다",
], (root, B) => {
  const cs = 120, pz = puzzle(root, 160, 250, cs, PZ0), gz = puzzle(root, 620, 310, 80, PZG);
  const gl = at(root, 620, 272, "lab", "GOAL", {}); const sl = at(root, 160, 212, "lab", "START", {});
  const md = {}; for (let v = 1; v <= 8; v++) { const i = PZ0.indexOf(v), j = PZG.indexOf(v); md[v] = Math.abs(Math.floor(i / 3) - Math.floor(j / 3)) + Math.abs(i % 3 - j % 3); }
  const badge = {}; for (let v = 1; v <= 8; v++) { const i = PZ0.indexOf(v); badge[v] = at(root, 160 + (i % 3) * cs + cs - 22, 250 + Math.floor(i / 3) * cs + 22, "", "", { fontSize: 22, fontWeight: 900, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }, true); }
  const H1 = at(root, 1000, 300, "", "", { fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" });
  const H2 = at(root, 1000, 380, "", "", { fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" });
  const rel = at(root, 1000, 480, "", "", { width: 820, fontSize: 28, lineHeight: 1.75 });
  const T = tbl(root, 1000, 470, [300, 240], [["알고리즘 (d = 12)", "확장 노드"], ["IDS", "3,644,035"], ["A*(h₁)", "227"], ["A*(h₂)", "73"]], { fontSize: 32, fontFamily: "JBM,Noto Sans KR" });
  const pdb = at(root, 1000, 780, "", "", { fontSize: 28, whiteSpace: "nowrap" });
  return t => {
    vis(pz.wrap, t, 0.2, null); vis(gz.wrap, t, 0.4, null); vis(gl, t, 0.4, null); vis(sl, t, 0.3, null);
    const ord = [1, 2, 3, 4, 5, 6, 7, 8];
    let s2 = 0;
    ord.forEach((v, i) => {
      const a1 = B[1] + 0.4 + i * 0.25, a2 = B[2] + 0.6 + i * 0.75;
      const ph2 = t > a2;
      if (ph2) s2 += md[v];
      htm(badge[v], ph2 ? String(md[v]) : "✕");
      badge[v].style.background = ph2 ? COL.gold : COL.warn; badge[v].style.color = "#000";
      S(badge[v], { o: K(t, a1, 0.3) * (1 - K(t, B[3], 0.4)) });
    });
    htm(H1, `h₁ = <span style="color:${COL.warn}">${t > B[1] + 2.4 ? 8 : Math.floor(clamp((t - B[1] - 0.4) / 2) * 8)}</span>`); vis(H1, t, B[1], null);
    htm(H2, `h₂ = <span style="color:${COL.gold}">${s2}</span>`); vis(H2, t, B[2], null);
    htm(rel, `<div><b style="color:#64d2ff">완화 문제</b> → 허용 가능한 h</div><div>순간이동 허용 → <b>h₁</b></div><div>겹쳐도 인접 이동 → <b>h₂</b></div><div>도로 무시 → <b>직선 거리</b></div>`);
    S(rel, { o: K(t, B[3], 0.5) * (1 - K(t, B[5], 0.4)) });
    S(T.el, { o: K(t, B[5], 0.5) }); T.R.forEach((r, i) => T.row(i, K(t, B[6] + i * 0.6, 0.4)));
    vis(pdb, t, B[7] + 0.3, null); htm(pdb, `패턴 DB: 타일 1~4의 정확한 비용을 <b style="color:${COL.gold}">표로 저장</b>`);
    vis(H1, t, B[1], null); S(H1, { o: K(t, B[1], 0.5) }); S(H2, { o: K(t, B[2], 0.5) });
  };
});

/* --- weighted A* (supplement) --- */
sc(4, "가중 A* (보충)", [
  "이 장의 탐색들을 하나로 묶는 매개변수 W: **f(n) = g(n) + W·h(n)**",
  "W = 0 → UCS · W = 1 → A* · 1 < W < ∞ → 가중 A* · W → ∞ → 탐욕적 탐색",
  [`격자에서: W = 0은 ${GT.w0.steps}개, W = 1은 ${GT.astar.steps}개, W = 5는 **${GT.w5.steps}개**만 확장 — 대신 경로가 ${GT.astar.cost}칸 → **${GT.w5.cost}칸**`, 10],
  "가중 A*: 훨씬 빠르지만 최적은 아니다 — 대신 비용이 최적의 **W배 이내**임은 보장한다",
], (root, B) => {
  const f = at(root, 960, 190, "fx", "f(n) = g(n) + W · h(n)", { fontSize: 54, whiteSpace: "nowrap" }, true);
  const sp = at(root, 960, 280, "", `<div style="display:flex;gap:26px;font-size:28px;font-weight:800">${[["W = 0", "UCS", "#bf5af2"], ["W = 1", "A*", COL.path], ["1 < W < ∞", "가중 A*", COL.gold], ["W → ∞", "Greedy", COL.warn]].map(([a, b, c]) => `<div style="padding:10px 22px;border-radius:14px;border:2px solid ${c};white-space:nowrap"><span class="fx">${a}</span> → <span style="color:${c}">${b}</span></div>`).join("")}</div>`, {}, true);
  const G = [[GT.w0, "W = 0 (UCS)", "#bf5af2"], [GT.astar, "W = 1 (A*)", COL.path], [GT.w5, "W = 5", COL.gold]].map(([tr, ti, c], i) => [gridView(root, 60 + i * 620, 360, 18, `<span style="color:${c}">${ti}</span>`, tr, c), tr]);
  return t => {
    vis(f, t, 0.3, null); vis(sp, t, B[1], null);
    const a = B[2] + 0.3, d = 6, k = clamp((t - a) / d) * GT.w0.steps;
    G.forEach(([V, tr], i) => { vis(V.wrap, t, B[2] + i * 0.2, null); const kk = Math.min(k, tr.steps); V.draw(kk, K(t, a + (tr.steps / GT.w0.steps) * d + 0.2, 1.2)); htm(V.cnt, `확장 ${Math.floor(kk)}` + (kk >= tr.steps ? ` · 경로 <b style="color:${COL.path}">${tr.cost}</b>` : "")); });
  };
});

/* ===================== OUTRO ===================== */
add({
  ch: 0, name: "마무리", dur: 19, hud: false,
  caps: [[0.8, 7.6, "탐색 문제를 정의하고 → 트리로 펼치고 → 프런티어 규칙 하나로 BFS · UCS · DFS · IDS · Greedy · A*"], [8.4, 13.4, "전략은 결국 하나: **무엇을 먼저 꺼낼 것인가**"]],
  build(root) {
    const sums = { 1: "5요소 · 상태 공간 · 추상화", 2: "노드 ≠ 상태 · b, m, d · O(b^m)", 3: "큐 · 우선순위 큐 · 스택 · IDS", 4: "h(n) · f = g + h · 허용성" };
    const tiles = [1, 2, 3, 4].map((c, i) => { const C = CH[c]; return at(root, 960 + (i - 1.5) * 420, 440, "", `<div style="font-size:54px;font-weight:900;letter-spacing:-.04em;color:${C.acc}">${C.no}</div><div style="font-size:30px;font-weight:800;margin-top:4px">${C.title}</div><div style="font-size:21px;color:rgba(255,255,255,.62);margin-top:10px;line-height:1.45">${sums[c].replace("^m", "<sup>m</sup>")}</div>`, { width: 390, height: 230, borderRadius: 26, padding: "24px 28px", background: "linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)" }, true); });
    const head = at(root, 960, 200, "big", "3장, 한눈에", { fontSize: 76, whiteSpace: "nowrap" }, true);
    const fin = at(root, 960, 430, "big grad", "pick(frontier)", { fontSize: 130, whiteSpace: "nowrap", fontFamily: "JBM,monospace" }, true);
    const sub = at(root, 960, 580, "", "f = g → UCS &nbsp;·&nbsp; f = h → Greedy &nbsp;·&nbsp; f = g + h → <b style='color:#fff'>A*</b>", { fontSize: 38, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }, true);
    const nx = at(root, 960, 700, "", "다음: 4장 — 복잡한 환경에서의 탐색", { fontSize: 32, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap" }, true);
    return t => {
      const out = K(t, 8.0, 0.8, E.io3);
      blurIn(head, t, 0.2); S(head, { o: K(t, 0.2, 0.8) * (1 - out), y: -out * 40 });
      tiles.forEach((e, i) => { const q = K(t, 0.6 + i * 0.15, 0.8, E.o5); S(e, { o: q * (1 - out), y: (1 - q) * 50 - out * 40, b: (1 - q) * 10 + out * 6 }); });
      const f = K(t, 8.8, 1.2, E.o5); S(fin, { o: f, s: 1.15 - 0.15 * f, b: (1 - f) * 18 });
      rise(sub, t, 10.4); rise(nx, t, 13.8);
    };
  },
});
