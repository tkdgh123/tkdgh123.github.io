"use strict";
/* ===================== 3-2 트리 탐색과 탐색 공간 ===================== */
chTitle(2, ["그래프 → 트리", "사이클 · 중복 경로", "노드 ≠ 상태", "트리 탐색 알고리즘", "4가지 성질", "b · m · d", "O(b^m)", "상태 공간 크기"]);

/* --- graph to tree --- */
sc(2, "그래프를 트리로 펼치기", [
  "상태 공간은 **그래프**다. 탐색은 그 위에 '이렇게 하면?' **탐색 트리**를 만든다. 루트 = 초기 상태",
  "자식은 **행동**(간선)을 따라 도달하고, 그 자식이 어떤 상태인지는 **전이 모델**이 알려 준다",
  ["그래프엔 함정이 둘. 첫째 **사이클**: b → d → b 처럼 같은 상태로 되돌아오는 경로", 6],
  "그대로 두면 b, d, b, d, … 트리가 끝없이 깊어진다 → **잘라야** 한다",
  ["둘째 **중복 경로**: a→b→e 와 a→c→e — 서로 다른 경로가 같은 상태 e에 도착", 6],
  "같은 상태를 두 번 조사하는 낭비 → 없애면 **효율**이 좋아진다",
  "트리를 지나는 경로 = **행동의 순서**. 해(solution)는 **목표 노드에서 끝나는 경로**다",
], (root, B) => {
  const gp = { a: [200, 300], b: [420, 260], c: [300, 520], d: [640, 340], e: [560, 560], f: [760, 700] };
  const GN = {}; for (const k in gp) GN[k] = gnode(root, gp[k][0], gp[k][1], k, 36);
  const gl = at(root, 120, 160, "lab", "STATE-SPACE GRAPH · 상태 공간", {});
  const svg = svgLayer(root);
  const ge = [["a", "b"], ["a", "c"], ["b", "d"], ["d", "b", 40], ["b", "e"], ["c", "e"], ["e", "f"]].map(([x, y, bd]) => gedge(svg, null, GN[x], GN[y], { dir: true, bend: bd || 0, w: 3 }));
  const tl = at(root, 980, 160, "lab", "SEARCH TREE · 탐색 트리", {});
  const tp = { a: [1350, 230, "a"], b: [1120, 380, "b"], c: [1580, 380, "c"], d: [1000, 530, "d"], e1: [1240, 530, "e"], e2: [1580, 530, "e"], b2: [1000, 680, "b"], f1: [1240, 680, "f"], d2: [1000, 830, "d"] };
  const TN = {}; for (const k in tp) TN[k] = gnode(root, tp[k][0], tp[k][1], tp[k][2], 32);
  const te = [["a", "b"], ["a", "c"], ["b", "d"], ["b", "e1"], ["c", "e2"], ["d", "b2"], ["e1", "f1"], ["b2", "d2"]].map(([x, y]) => [x, y, gedge(svg, null, TN[x], TN[y], { w: 3 })]);
  const cyc = at(root, 860, 680, "", "사이클 ✕", { fontSize: 26, fontWeight: 900, color: COL.warn, whiteSpace: "nowrap" }, true);
  const inf = at(root, 1000, 900, "", "⋮ ∞", { fontSize: 34, fontWeight: 900, color: COL.warn }, true);
  const red = at(root, 1720, 530, "", "중복 ✕", { fontSize: 26, fontWeight: 900, color: COL.warn, whiteSpace: "nowrap" }, true);
  const act = at(root, 1440, 300, "", "행동 = 간선", { fontSize: 22, color: COL.gold, whiteSpace: "nowrap" }, true);
  return t => {
    vis(gl, t, 0.2, null); vis(tl, t, 0.4, null);
    for (const k in GN) pop(GN[k], t, 0.3 + gp[k][0] / 2000);
    ge.forEach((e, i) => e.set(K(t, 0.6 + i * 0.12, 0.5)));
    const appear = { a: B[0] + 1.5, b: B[1] + 0.3, c: B[1] + 0.5, d: B[1] + 1.4, e1: B[1] + 1.6, e2: B[1] + 1.8, b2: B[2] + 1.0, f1: B[6] + 0.3, d2: B[3] + 0.6 };
    for (const k in TN) pop(TN[k], t, appear[k]);
    te.forEach(([x, y, e]) => e.set(K(t, appear[y] - 0.3, 0.4), y === "b2" || y === "d2" ? (t > B[3] + 1.6 ? COL.warn : "rgba(255,255,255,.5)") : y === "e2" && t > B[5] ? COL.warn : "rgba(255,255,255,.5)"));
    // highlights
    const cyH = t > B[2] && t < B[4];
    nst(GN.b, cyH ? "cur" : t > B[4] && t < B[6] ? "" : ""); nst(GN.d, cyH ? "cur" : "");
    ge[2].set(1, cyH ? COL.cur : "rgba(255,255,255,.4)"); ge[3].set(1, cyH ? COL.cur : "rgba(255,255,255,.4)");
    const rdH = t > B[4] && t < B[6];
    nst(GN.e, rdH ? "cur" : t > B[6] ? "" : ""); ge[4].set(1, rdH ? "#64d2ff" : "rgba(255,255,255,.4)"); ge[5].set(1, rdH ? "#bf5af2" : "rgba(255,255,255,.4)"); ge[1].set(1, rdH ? "#bf5af2" : "rgba(255,255,255,.4)"); ge[0].set(1, rdH ? "#64d2ff" : cyH ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.4)");
    nst(TN.b2, t > B[2] + 1.0 ? "bad" : ""); nst(TN.d2, t > B[3] + 0.6 ? "bad" : "");
    nst(TN.e2, t > B[5] ? "bad" : rdH ? "cur" : ""); nst(TN.e1, rdH ? "cur" : "");
    nst(TN.f1, t > B[6] + 0.3 ? "path" : ""); nst(GN.f, t > B[6] ? "goal" : "");
    nst(TN.a, t > B[6] + 0.3 ? "path" : "st"); nst(TN.b, t > B[6] + 0.3 ? "path" : ""); nst(TN.e1, t > B[6] + 0.3 ? "path" : rdH ? "cur" : "");
    if (t > B[6] + 0.3) { te[0][2].set(1, COL.path, 1, 6); te[3][2].set(1, COL.path, 1, 6); te[6][2].set(K(t, B[6] + 0.3, 0.5), COL.path, 1, 6); }
    vis(cyc, t, B[2] + 1.2, null); vis(inf, t, B[3] + 0.9, null); vis(red, t, B[5] + 0.2, null); vis(act, t, B[1] + 0.5, B[2]);
  };
});

/* --- node is not state --- */
sc(2, "노드 ≠ 상태", [
  "학생들이 가장 자주 놓치는 구분: 탐색 트리의 **노드는 상태가 아니다**",
  "노드 = 상태 + '어떻게 여기 왔나'의 기록: **STATE · PARENT · ACTION · PATH-COST**",
  ["숭실대입구 → 고속터미널 → 강남의 '강남'과 숭실대입구 → 사당 → 강남의 '강남' — **같은 상태, 다른 노드**", 7],
  "상태 공간 = 세상 그 자체(상태당 하나, 고정) · 탐색 트리 = **시도한 것의 기록**(경로당 하나, 진행하며 생성)",
  "그래서 진공청소기 세계는 상태가 **8개**뿐인데도 탐색 트리는 **무한**할 수 있다",
], (root, B) => {
  const card = (x, y, rows, col) => at(root, x, y, "", `<div class="lab" style="color:${col}">NODE</div>` + rows.map(([k, v]) => `<div style="display:flex;justify-content:space-between;gap:30px;font-size:27px;margin-top:10px"><span class="fx" style="color:rgba(255,255,255,.55)">${k}</span><span style="font-weight:800">${v}</span></div>`).join(""), { width: 470, padding: "20px 28px", borderRadius: 20, border: "2px solid " + col, background: "rgba(255,255,255,.05)" });
  const n0 = card(140, 230, [["STATE", "강남"], ["PARENT", "→ (고속터미널 노드)"], ["ACTION", "9호선 이동"], ["PATH-COST g", "21분"]], COL.fr);
  const n1 = card(140, 520, [["STATE", "강남"], ["PARENT", "→ (사당 노드)"], ["ACTION", "2호선 이동"], ["PATH-COST g", "24분"]], "#bf5af2");
  const sp = { s: [860, 340, "숭실대입구"], t: [1120, 220, "고속터미널"], d: [1120, 460, "사당"], g: [1400, 340, "강남"] };
  const N = {}; for (const k in sp) N[k] = pill(root, sp[k][0], sp[k][1], sp[k][2]);
  const svg = svgLayer(root);
  const E1 = arrow(svg, [[920, 312], [1040, 250]], { c: COL.fr, w: 5 }), E2 = arrow(svg, [[1190, 250], [1350, 312]], { c: COL.fr, w: 5 });
  const E3 = arrow(svg, [[920, 368], [1070, 432]], { c: "#bf5af2", w: 5 }), E4 = arrow(svg, [[1170, 432], [1350, 368]], { c: "#bf5af2", w: 5 });
  const same = at(root, 1400, 400, "", "상태는 하나", { fontSize: 24, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" }, true);
  const T = tbl(root, 760, 540, [220, 380, 420], [["", "상태 공간 (그래프)", "탐색 트리"], ["무엇", "세상 그 자체", "시도한 것의 기록"], ["노드 하나 =", "상태 하나", "경로 하나"], ["크기 (청소기)", "8 — 고정", "∞ 가능 — 진행하며 생성"]], { fontSize: 26 });
  return t => {
    vis(n0, t, B[1], null); vis(n1, t, B[2] + 2.0, null);
    for (const k in N) pop(N[k], t, B[2] + 0.2 + sp[k][0] / 3000);
    E1.set(K(t, B[2] + 0.8, 0.5)); E2.set(K(t, B[2] + 1.2, 0.5)); E3.set(K(t, B[2] + 2.4, 0.5)); E4.set(K(t, B[2] + 2.8, 0.5));
    nst(N.g, t > B[2] + 1.5 ? "cur" : ""); vis(same, t, B[2] + 3.3, null);
    const tu = K(t, B[3], 0.6);
    S(T.el, { o: tu, y: (1 - tu) * 30 });
    T.R.forEach((r, i) => T.row(i, K(t, B[3] + 0.3 + i * 0.6, 0.5)));
    T.R[3].forEach((d, j) => { d.style.color = t > B[4] && j > 0 ? (j === 1 ? COL.fr : COL.warn) : ""; d.style.fontWeight = t > B[4] ? 800 : ""; });
  };
});

/* --- tree search pseudocode --- */
code(2, {
  name: "트리 탐색 알고리즘", file: "tree_search.py", tag: "의사코드",
  title: "모든 전략의 공통 뼈대", about: "이 장의 **모든 탐색 전략**이 이 반복문의 특수한 경우다. 다른 건 단 한 줄 — 무엇을 먼저 꺼내느냐.",
  src: String.raw`
def TREE_SEARCH(problem):
    frontier = [NODE(problem.INITIAL)]   # 루트로 초기화
    while frontier:                      # 비어 있지 않은 동안
        node = pick(frontier)            # 전략이 고른다
        if problem.IS_GOAL(node.STATE):
            return node                  # 해를 찾았다
        for a in problem.ACTIONS(node.STATE):
            s2 = problem.RESULT(node.STATE, a)
            frontier.add(NODE(s2, node, a))
    return failure                       # 프런티어가 비면 실패`,
  steps: [
    { l: "2", t: "프런티어 초기화", d: "**프런티어(frontier)** = 알려졌지만 아직 확장하지 않은 노드들. 개방 목록이라고도 한다. 처음엔 루트 하나.", v: { frontier: "[Arad]" } },
    { l: "3", t: "반복", d: "프런티어가 비어 있지 않은 동안 계속한다." },
    { l: "4", t: "a) 다음 노드 고르기", d: "**탐색 전략**이 정하는 유일한 부분. BFS · DFS · UCS · A*는 **여기만** 다르다.", v: { node: "Arad", frontier: "[ ]" }, m: ["pick(frontier)"] },
    { l: "5-6", t: "b) 목표 검사", d: "Arad는 목표가 아니다 → 계속." },
    { l: "7-9", t: "c) 확장 (expand)", d: "가능한 모든 행동에 **전이 모델**을 적용해 자식 노드를 만들고 프런티어에 추가.", v: { frontier: "[Sibiu, Timisoara, Zerind]" }, m: ["ACTIONS", "RESULT"] },
    { l: "4", t: "다시 고르기", d: "이번엔 Sibiu를 골랐다고 하자. 어느 것을 고를지는 전략의 몫.", v: { node: "Sibiu", frontier: "[Timisoara, Zerind]" } },
    { l: "7-9", t: "Sibiu 확장", d: "Arad · Fagaras · Oradea · Rimnicu 추가. **Arad가 또 나왔다** — 사이클! 막지 않으면 영원히 왕복할 수 있다.", v: { frontier: "[Tim, Zer, Arad, Fag, Ora, Rim]" } },
    { l: "10", t: "실패", d: "프런티어가 비어 버리면 해가 **없다**는 뜻 → failure." },
  ],
});

/* --- Romania tree expansion --- */
sc(2, "예: 루마니아 트리 펼치기", [
  "(1) 프런티어엔 **Arad**만. 점선 노드는 아직 **존재하지 않는다** — 자식이 생길 자리만 보여 줄 뿐",
  ["(2) Arad 확장 → 자식 셋이 생성되어 프런티어에 합류. Arad는 프런티어를 **떠난다**", 6],
  ["(3) Sibiu 확장 → Arad가 한 단계 아래 **다시** 나타났다. 같은 상태, 다른 경로 = **사이클**", 6.5],
  "Timisoara나 Zerind를 먼저 확장해도 괜찮았다 — 어느 노드를 먼저 꺼낼지는 **탐색 전략**이 정한다",
], (root, B) => {
  const P = { A: [960, 210, "Arad"], S: [560, 380, "Sibiu"], T: [960, 380, "Timisoara"], Z: [1360, 380, "Zerind"], SA: [260, 560, "Arad"], SF: [460, 560, "Fagaras"], SO: [660, 560, "Oradea"], SR: [880, 560, "Rimnicu V."] };
  const N = {}; for (const k in P) N[k] = pill(root, P[k][0], P[k][1], P[k][2]);
  const svg = svgLayer(root);
  const E2 = {}; ["S", "T", "Z"].forEach(k => E2[k] = seg(svg, N.A, N[k])); ["SA", "SF", "SO", "SR"].forEach(k => E2[k] = seg(svg, N.S, N[k]));
  const ghost = [[1180, 560], [1360, 560], [1560, 560]].map(([x, y]) => at(root, x, y, "", "", { width: 120, height: 50, borderRadius: 999, border: "2px dashed rgba(255,255,255,.3)" }, true));
  const g0 = [[560, 380], [960, 380], [1360, 380]].map(([x, y]) => at(root, x, y, "", "", { width: 150, height: 50, borderRadius: 999, border: "2px dashed rgba(255,255,255,.3)" }, true));
  const ul = at(root, 260, 596, "", "", { width: 100, height: 4, background: COL.warn, borderRadius: 2 }, true);
  const frL = at(root, 160, 720, "lab", "FRONTIER", {});
  const fr = at(root, 160, 760, "", "", { display: "flex", gap: "12px", fontSize: 26, fontWeight: 800 });
  const states = [["Arad"], ["Sibiu", "Timisoara", "Zerind"], ["Timisoara", "Zerind", "Arad", "Fagaras", "Oradea", "Rimnicu V."]];
  const tbl2 = at(root, 1180, 720, "", "", { fontSize: 24, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap", lineHeight: 1.6 });
  return t => {
    const stg = t < B[1] + 0.6 ? 0 : t < B[2] + 0.6 ? 1 : 2;
    pop(N.A, t, 0.4); nst(N.A, stg ? "ex" : "fr");
    g0.forEach((g, i) => S(g, { o: K(t, 1.4 + i * 0.2, 0.4) * (1 - K(t, B[1] + 0.6 + i * 0.25, 0.3)) }));
    ["S", "T", "Z"].forEach((k, i) => { pop(N[k], t, B[1] + 0.6 + i * 0.25); E2[k].set(K(t, B[1] + 0.4 + i * 0.25, 0.4)); nst(N[k], k === "S" && stg === 2 ? (t < B[2] + 1.3 ? "cur" : "ex") : "fr"); });
    ghost.forEach((g, i) => S(g, { o: K(t, B[1] + 1.8 + i * 0.2, 0.4) }));
    ["SA", "SF", "SO", "SR"].forEach((k, i) => { pop(N[k], t, B[2] + 0.6 + i * 0.25); E2[k].set(K(t, B[2] + 0.4 + i * 0.25, 0.4)); nst(N[k], k === "SA" && t > B[2] + 2.0 ? "bad" : "fr"); });
    S(ul, { o: K(t, B[2] + 2.2, 0.4), sx: K(t, B[2] + 2.2, 0.5, E.o5) });
    vis(frL, t, 0.6, null); S(fr, { o: K(t, 0.6, 0.5) });
    htm(fr, states[stg].map(s => `<span style="padding:8px 18px;border-radius:12px;border:2px solid ${s === "Arad" && stg === 2 ? COL.warn : COL.fr};background:rgba(48,209,88,.12)">${s}</span>`).join(""));
    htm(tbl2, `<span class="lab">확장된 노드</span><br>${["—", "Arad", "Arad, Sibiu"][stg]}`); S(tbl2, { o: K(t, 0.8, 0.5) });
    if (t > B[3]) { const q = 0.5 + 0.5 * Math.sin((t - B[3]) * 5); glow2(N.T, q * K(t, B[3], 0.4), COL.cur); glow2(N.Z, q * K(t, B[3], 0.4), COL.cur); } else { glow2(N.T, 0, COL.cur); glow2(N.Z, 0, COL.cur); }
  };
});

/* --- cycle check vs redundant-path check --- */
sc(2, "사이클 검사 vs 중복 경로 검사", [
  "고전적 트리 탐색은 트리가 이미 메모리에 있다. AI 탐색은 트리가 너무 커서 전이 함수로 **만들어 가며** 탐색한다",
  "그래서 **메모리 관리**가 결정적이다. 검사에도 비용 차이가 있다",
  ["**사이클 검사**는 싸다 — 부모를 따라 올라가며 '현재 경로에 같은 상태가 있나?'만 보면 된다", 6.5],
  ["**중복 경로 검사**는 비싸다 — 지금까지 도달한 **모든** 상태를 기억해야 한다 (reached 표)", 6.5],
  "그래서 중복 경로는 감수하고 사이클만 끊기도 한다. reached를 쓰면 **그래프 탐색**, 안 쓰면 **트리형 탐색**",
], (root, B) => {
  const ch = ["S", "d", "e", "r", "f"], xs = ch.map((_, i) => 200 + i * 130);
  const N = ch.map((s, i) => gnode(root, xs[i], 520, s, 36));
  const nw = gnode(root, xs[4] + 130, 520, "e", 36);
  const svg = svgLayer(root);
  const E2 = ch.map((_, i) => i ? gedge(svg, null, N[i - 1], N[i], { dir: true, w: 3 }) : null);
  const En = gedge(svg, null, N[4], nw, { dir: true, w: 3, dash: "6 6" });
  const ups = ch.map((_, i) => i ? arrow(svg, [[xs[i] - 10, 470], [(xs[i] + xs[i - 1]) / 2, 420], [xs[i - 1] + 10, 470]], { c: COL.gold, w: 3, curve: true }) : null);
  const t1 = at(root, 520, 340, "", "", { fontSize: 30, fontWeight: 800, whiteSpace: "nowrap" }, true);
  const lc = at(root, 520, 650, "", `비교 횟수 ≤ 경로 길이 · 메모리 <b style="color:${COL.fr}">추가 없음</b>`, { fontSize: 27, whiteSpace: "nowrap" }, true);
  const RX = 1100, RY = 250;
  const rl = at(root, RX, RY - 50, "lab", "REACHED · 도달한 모든 상태", {});
  const Rn = rng(3), cells = [];
  for (let i = 0; i < 96; i++) cells.push(at(root, RX + (i % 12) * 58, RY + Math.floor(i / 12) * 50, "fx", "abcdefghijklmnopqrstuvwxyz"[Math.floor(Rn() * 26)] + Math.floor(Rn() * 99), { width: 52, height: 42, borderRadius: 8, background: "rgba(100,210,255,.16)", border: "1px solid rgba(100,210,255,.4)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }));
  const mem = at(root, RX, RY + 420, "", "", { width: 690, height: 20, borderRadius: 10, background: "rgba(255,255,255,.08)" });
  const memF = h(mem, "ab", "", { left: 0, top: 0, bottom: 0, width: 690, borderRadius: 10, background: "linear-gradient(90deg,#64d2ff,#ff453a)", transformOrigin: "0 50%" });
  const memL = at(root, RX, RY + 456, "", "메모리 ↑ 도달한 상태 수만큼", { fontSize: 25, color: "rgba(255,255,255,.7)" });
  const bt = [at(root, 520, 790, "", `<b style="color:${COL.fr}">트리형 탐색</b> — reached 없음 · 사이클만 검사`, { fontSize: 30, whiteSpace: "nowrap" }, true), at(root, RX + 345, 790, "", `<b style="color:#64d2ff">그래프 탐색</b> — reached로 중복까지 차단`, { fontSize: 30, whiteSpace: "nowrap" }, true)];
  const intro = at(root, 960, 300, "", `<div style="display:flex;gap:60px;align-items:center"><div style="padding:20px 30px;border-radius:20px;border:2px solid rgba(255,255,255,.2)"><div class="lab">고전</div><div style="font-size:30px;font-weight:800;margin-top:6px">트리가 주어져 있다 · 메모리에 있음</div></div><div style="padding:20px 30px;border-radius:20px;border:2px solid ${COL.gold}"><div class="lab" style="color:${COL.gold}">AI</div><div style="font-size:30px;font-weight:800;margin-top:6px">너무 커서 만들어 가며 탐색</div></div></div>`, {}, true);
  return t => {
    const io = K(t, B[2] - 0.4, 0.5);
    S(intro, { o: K(t, 0.3, 0.6) * (1 - io), y: (1 - K(t, 0.3, 0.6, E.o5)) * 30 });
    N.forEach((n, i) => pop(n, t, B[2] + i * 0.15)); E2.forEach((e, i) => e && e.set(K(t, B[2] + 0.1 + i * 0.15, 0.4)));
    pop(nw, t, B[2] + 1.0); En.set(K(t, B[2] + 0.9, 0.3)); nst(nw, t > B[2] + 1.0 ? "cur" : "");
    const k = Math.floor(clamp((t - B[2] - 1.6) / 0.7, 0, 4.99));
    ups.forEach((u, i) => u && u.set(K(t, B[2] + 1.6 + (4 - i) * 0.7, 0.5)));
    N.forEach((n, i) => nst(n, t > B[2] + 1.6 && i >= 4 - k ? (ch[i] === "e" && t > B[2] + 1.6 + 2 * 0.7 ? "bad" : "ex") : ""));
    htm(t1, t > B[2] + 3.3 ? `e가 이미 경로에 있다 → <span style="color:${COL.warn}">사이클!</span>` : `e가 조상 중에 있나? → ${ch.slice(4 - k).reverse().join(", ")}`); vis(t1, t, B[2] + 1.4, null);
    vis(lc, t, B[2] + 3.6, null);
    vis(rl, t, B[3], null);
    cells.forEach((c, i) => S(c, { o: K(t, B[3] + 0.3 + i * 0.03, 0.3) }));
    S(mem, { o: K(t, B[3] + 0.3, 0.4) }); S(memF, { sx: clamp((t - B[3] - 0.3) / (96 * 0.03)) }); vis(memL, t, B[3] + 1.5, null);
    bt.forEach((b, i) => vis(b, t, B[4] + 0.3 + i * 0.6, null));
  };
});

/* --- four criteria --- */
sc(2, "탐색 전략의 4가지 성질", [
  "탐색 전략 = 노드를 **확장하는 순서**. 전략들을 네 가지 질문으로 비교한다",
  "① **완전성(completeness)** — 해가 있으면 **항상** 찾는가?",
  "② **비용 최적성(cost optimality)** — 항상 **가장 싼** 해를 찾는가?",
  "③ **시간 복잡도** — 얼마나 오래 걸리나? ④ **공간 복잡도** — 메모리가 얼마나 필요한가?",
  "예: 잃어버린 열쇠 — 방을 전부 뒤지면 반드시 찾고(완전), 가까운 곳부터 뒤지면 가장 가까운 열쇠를 먼저(최적)",
  "시간 · 공간은 보통 **b, d, m**으로 쓴 식으로 나타낸다 — 시험 단골",
], (root, B) => {
  const D = [["완전성", "Complete?", "해가 있으면 반드시 찾나", COL.fr], ["비용 최적성", "Optimal?", "최소 비용 해를 찾나", COL.path], ["시간", "Time", "생성한 노드 수", "#64d2ff"], ["공간", "Space", "기억하는 노드 수", "#bf5af2"]];
  const C = D.map(([a, b, c, col], i) => at(root, 270 + i * 460, 500, "", `<div style="font-size:72px;font-weight:900;color:${col};line-height:1">${i + 1}</div><div style="font-size:44px;font-weight:900;margin-top:16px">${a}</div><div class="fx" style="font-size:24px;color:${col};margin-top:6px">${b}</div><div style="font-size:26px;color:rgba(255,255,255,.7);margin-top:20px">${c}</div>`, { width: 400, height: 380, padding: "34px 34px", borderRadius: 28, background: "linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))", border: "2px solid rgba(255,255,255,.12)" }, true));
  const f = at(root, 960, 790, "fx", "O( f(b, d, m) )", { fontSize: 54, color: COL.gold, whiteSpace: "nowrap" }, true);
  return t => {
    const ap = [B[1], B[2], B[3], B[3] + 2.2];
    C.forEach((c, i) => { const q = K(t, ap[i], 0.7, E.o5); S(c, { o: q, y: (1 - q) * 60, s: 0.92 + 0.08 * q }); glow2(c, K(t, ap[i], 0.4) * (1 - K(t, ap[i] + 1.5, 0.6)) + (t > B[4] && t < B[5] && i < 2 ? 1 : 0), D[i][3]); });
    vis(f, t, B[5] + 0.3, null);
  };
});

/* --- b, m, d --- */
sc(2, "b · m · d", [
  "탐색 트리의 크기를 정하는 세 숫자",
  "**b** 분기 계수(branching factor) — 한 노드의 최대 자식 수 = 가능한 행동의 최대 개수",
  "**m** 최대 깊이 — 사이클을 없앤 뒤 **가장 긴** 경로의 길이",
  "**d** 최적 해의 깊이 — 초기 상태에서 **가장 얕은 목표**까지. 항상 d ≤ m",
  ["진공청소기: 행동 L · R · S → **b = 3**, 최적 해 흡입 → 오른쪽 → 흡입 → **d = 3**", 6.5],
  ["가장 긴 비순환 경로는 상태 6개를 지나 간선 5개 → **m = 5**. 먼지는 줄기만 하니까", 7],
  "사이클을 지우지 않으면 L, L, L, … → m = ∞. 그래서 m을 세기 전에 **사이클부터 제거**",
], (root, B) => {
  const L = [[960, 200]], lv = [[960]];
  const P = [{ x: 960, y: 210, d: 0, p: -1 }];
  [[610, 960, 1310], null].forEach(() => {});
  const xs1 = [560, 960, 1360]; xs1.forEach(x => P.push({ x, y: 360, d: 1, p: 0 }));
  for (let i = 1; i <= 3; i++) [-130, 0, 130].forEach(dx => P.push({ x: P[i].x + dx, y: 510, d: 2, p: i }));
  for (let i = 4; i < 13; i++) [-40, 0, 40].forEach(dx => P.push({ x: P[i].x + dx, y: 660, d: 3, p: i }));
  const svg = svgLayer(root);
  const N = P.map((p, i) => at(root, p.x, p.y, "gn", "", { width: p.d === 3 ? 26 : 44, height: p.d === 3 ? 26 : 44 }, true));
  const Ed = P.map((p, i) => p.p >= 0 ? arrow(svg, [[P[p.p].x, P[p.p].y + 22], [p.x, p.y - (p.d === 3 ? 13 : 22)]], { c: "rgba(255,255,255,.35)", w: 2.5, head: 0 }) : null);
  const goalI = 6;
  const bBr = at(root, 960, 300, "", "b = 3", { fontSize: 36, fontWeight: 900, color: "#64d2ff", whiteSpace: "nowrap" }, true);
  const mBr = at(root, 300, 435, "", "", { width: 6, height: 450, borderRadius: 3, background: "#bf5af2" }, true);
  const mL = at(root, 220, 435, "", "m", { fontSize: 48, fontWeight: 900, color: "#bf5af2" }, true);
  const dBr = at(root, 1620, 360, "", "", { width: 6, height: 300, borderRadius: 3, background: COL.goal }, true);
  const dL = at(root, 1690, 360, "", "d", { fontSize: 48, fontWeight: 900, color: COL.goal }, true);
  const tri = at(root, 960, 820, "fx", "d ≤ m", { fontSize: 44, whiteSpace: "nowrap" }, true);
  // vacuum chain
  const chain = [1, 2, 4, 3, 7, 8], acts = ["R", "S", "L", "S", "R"];
  const V = chain.map((id, i) => vacCard(root, 200 + i * 304, 560, id, 200, 92));
  const VA = acts.map((a, i) => at(root, 200 + i * 304 + 152, 560, "", a, { fontSize: 30, fontWeight: 900, color: COL.gold }, true));
  const vb = at(root, 960, 300, "", "", { fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const inf = at(root, 960, 780, "", "", { fontSize: 32, fontWeight: 800, whiteSpace: "nowrap", color: COL.warn }, true);
  return t => {
    const out = K(t, B[4], 0.6);
    N.forEach((n, i) => { const q = K(t, 0.3 + P[i].d * 0.35 + i * 0.01, 0.4, E.ob); S(n, { o: clamp((t - 0.3 - P[i].d * 0.35 - i * 0.01) * 3) * (1 - out), s: 0.5 + 0.5 * q }); nst(n, i === goalI && t > B[3] ? "goal" : i <= 3 && t > B[1] && t < B[2] && i > 0 ? "cur" : ""); });
    Ed.forEach((e, i) => e && e.set(K(t, 0.2 + P[i].d * 0.35, 0.4), 1 - out));
    S(bBr, { o: K(t, B[1] + 0.5, 0.5) * (1 - out) });
    S(mBr, { o: K(t, B[2] + 0.3, 0.4) * (1 - out), sy: K(t, B[2] + 0.3, 0.8, E.o5) }); S(mL, { o: K(t, B[2] + 0.6, 0.4) * (1 - out) });
    S(dBr, { o: K(t, B[3] + 0.3, 0.4) * (1 - out), sy: K(t, B[3] + 0.3, 0.8, E.o5) }); S(dL, { o: K(t, B[3] + 0.6, 0.4) * (1 - out) });
    S(tri, { o: K(t, B[3] + 1.5, 0.5) * (1 - out) });
    if (N[goalI]._ns === "goal") glow2(N[goalI], 1 - out, COL.goal);
    // vacuum
    htm(vb, t < B[5] ? `b = <span style="color:#64d2ff">3</span> &nbsp; d = <span style="color:${COL.goal}">3</span>` : `m = <span style="color:#bf5af2">5</span>`);
    S(vb, { o: K(t, B[4] + 0.5, 0.5) });
    V.forEach((v, i) => { const q = K(t, B[5] + 0.2 + i * 0.5, 0.5, E.ob); S(v, { o: clamp((t - B[5] - 0.2 - i * 0.5) * 3), s: 0.7 + 0.3 * q }); });
    VA.forEach((v, i) => vis(v, t, B[5] + 0.5 + i * 0.5, null, { dy: 10 }));
    htm(inf, `L → L → L → L → … 사이클을 두면 m = ∞`); vis(inf, t, B[6] + 0.3, null);
  };
});

/* --- how many nodes / big-O --- */
sc(2, "노드 수와 빅오", [
  "깊이가 하나 내려갈 때마다 노드는 **b배**: 1, b, b², …, b^m",
  ["b = 10, m = 3이면 1 + 10 + 100 + 1,000 = **1,111** — 맨 아래 층이 **90%**", 6.5],
  "그래서 1 + b + … + b^m = **O(b^m)** — 트리 전체 비용 ≈ 맨 아래 줄의 비용",
  ["빅오: 입력이 커지면 **최고차항**만 남는다. T(n) = n² + n + 1에서 n²의 비중 33.3% → 99.9%", 7],
  "목표는 여러 깊이에 있을 수 있다 — 그래서 d와 m은 다른 수. 다음 파트의 모든 시간 · 공간 상한은 이 합의 **일부분**",
], (root, B) => {
  const vals = [1, 10, 100, 1000];
  const bars = vals.map((v, i) => at(root, 230, 230 + i * 110, "", `<div style="display:flex;align-items:center;gap:20px"><span class="fx" style="width:120px;font-size:30px;color:rgba(255,255,255,.6)">b<sup>${i}</sup></span><div class="br" style="height:56px;width:${Math.max(8, v / 1000 * 900)}px;border-radius:10px;background:linear-gradient(90deg,#64d2ff,#5e5ce6);transform-origin:0 50%"></div><span class="fx nv" style="font-size:32px">${v.toLocaleString()}</span></div>`, { width: 1300 }));
  bars.forEach(b => { b.br = b.querySelector(".br"); });
  const sum = at(root, 230, 690, "", `합 = 1,111 &nbsp;→&nbsp; <span style="color:${COL.gold}">맨 아래 층 1,000 = 90%</span>`, { fontSize: 38, fontWeight: 800, whiteSpace: "nowrap" });
  const big = at(root, 1500, 470, "fx", "O(b<sup>m</sup>)", { fontSize: 110, color: COL.gold }, true);
  const T = tbl(root, 620, 230, [160, 260, 260], [["n", "T(n)", "n²의 비중"], ["1", "3", "33.3%"], ["10", "111", "90.1%"], ["100", "10,101", "99.0%"], ["1,000", "1,001,001", "99.9%"]], { fontSize: 30, fontFamily: "JBM,Noto Sans KR" });
  const on2 = at(root, 960, 640, "fx", "n² + n + 1 ⇒ O(n²)", { fontSize: 44, whiteSpace: "nowrap", color: "#64d2ff" }, true);
  const nt = at(root, 960, 820, "", "BFS → O(b<sup>d</sup>) · DFS → O(b<sup>m</sup>) — 어느 층까지 가느냐의 차이", { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }, true);
  return t => {
    const o3 = K(t, B[3], 0.5);
    bars.forEach((b, i) => { const q = K(t, B[0] + 0.3 + i * 0.6, 0.8, E.o5); S(b, { o: clamp((t - B[0] - 0.3 - i * 0.6) * 3) * (1 - o3), x: -o3 * 0 }); S(b.br, { sx: q }); });
    glow2(bars[3].br, K(t, B[1] + 2, 0.5) * (1 - o3), COL.gold);
    S(sum, { o: K(t, B[1] + 1.5, 0.5) * (1 - o3) });
    S(big, { o: K(t, B[2] + 0.3, 0.6) * (1 - o3), s: 1.3 - 0.3 * K(t, B[2] + 0.3, 0.8, E.o5) });
    S(T.el, { o: o3 }); T.R.forEach((r, i) => T.row(i, K(t, B[3] + 0.4 + i * 0.5, 0.4)));
    vis(on2, t, B[3] + 3.2, null);
    vis(nt, t, B[4] + 0.6, null);
  };
});

/* --- state-space size --- */
sc(2, "상태 공간 크기 추정", [
  "상태 공간 크기 추정: 상태를 이루는 변수(플루언트)들의 경우의 수를 **곱한다** — n = |X₁| × |X₂| × ⋯",
  "진공청소기: 방마다 깨끗/더러움 → 2², 로봇 위치 2 → 2 × 2² = **8**",
  "8-퀸: 64칸에 퀸 8개 → C(64, 8) ≈ **4.4 × 10⁹** (서로 공격하지 않는 조건은 무시한 상한)",
  "8-퍼즐: 9! 중 절반 → **181,440** · 틱택토: 칸마다 {X, O, 빈칸} → **3⁹ = 19,683**보다 작다",
  "곱셈 결과는 '이론상' 개수 — 실제 **도달 가능한** 상태는 더 적을 수 있다 (신호등 둘 다 초록 = 불가능)",
], (root, B) => {
  const f = at(root, 960, 210, "fx", "n = |X<sub>1</sub>| × |X<sub>2</sub>| × ⋯ × |X<sub>l</sub>|", { fontSize: 52, whiteSpace: "nowrap" }, true);
  const cd = (x, ttl, body, foot, col) => at(root, x, 520, "", `<div style="font-size:34px;font-weight:900;color:${col}">${ttl}</div><div style="margin-top:18px;height:170px;display:flex;align-items:center;justify-content:center">${body}</div><div class="fx" style="font-size:30px;margin-top:14px">${foot}</div>`, { width: 400, height: 380, padding: "26px 28px", borderRadius: 26, background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.12)", textAlign: "center" }, true);
  const vac = `<div style="display:flex;gap:6px"><div style="width:110px;height:90px;border-radius:12px;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:20px">A ? </div><div style="width:110px;height:90px;border-radius:12px;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:20px">B ?</div></div>`;
  const board = (n, cells) => `<div style="display:grid;grid-template-columns:repeat(${n},${Math.floor(160 / n)}px);gap:2px">${Array.from({ length: n * n }, (_, i) => `<div style="height:${Math.floor(160 / n)}px;background:${(Math.floor(i / n) + i) % 2 ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)"};display:flex;align-items:center;justify-content:center;font-size:${Math.floor(110 / n)}px;font-weight:900">${cells ? cells[i] || "" : ""}</div>`).join("")}</div>`;
  const qp = [0, 4, 7, 5, 2, 6, 1, 3], qc = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) qc.push(qp[r] === c ? "♛" : "");
  const C = [cd(250, "진공청소기", vac, "2 × 2² = 8", COL.fr), cd(733, "8-퀸", board(8, qc), "C(64,8) ≈ 4.4×10⁹", "#bf5af2"), cd(1216, "8-퍼즐", board(3, ["7", "2", "4", "5", "", "6", "8", "3", "1"]), "9!/2 = 181,440", COL.gold), cd(1699, "틱택토", board(3, ["X", "O", "", "", "X", "", "O", "", "X"]), "< 3⁹ = 19,683", "#64d2ff")];
  const nt = at(root, 960, 810, "", `이론상 개수 ≥ <b style="color:${COL.fr}">도달 가능한</b> 상태 수 &nbsp;·&nbsp; 실제 틱택토 판 5,478개 · 8-퀸 해 92개`, { fontSize: 30, whiteSpace: "nowrap" }, true);
  return t => {
    vis(f, t, 0.3, null);
    C.forEach((c, i) => { const a = [B[1], B[2], B[3], B[3] + 2.2][i]; const q = K(t, a, 0.7, E.o5); S(c, { o: q, y: (1 - q) * 50 }); });
    vis(nt, t, B[4] + 0.4, null);
  };
});

/* --- b,m,d table & memory --- */
sc(2, "예제별 b · m · d", [
  "네 문제의 b, m, d를 읽어 보자",
  ["미로: 상하좌우 b = 4, m과 d는 칸 수 이하 · 8-퀸: 한 열에 8행 → b = 8, 열마다 퀸 하나 → **d = m = 8**", 7.5],
  ["8-퍼즐: b = 4, m은 전부 시도하면 9!/2, 최적 해는 **최대 31수** · 틱택토: b = 9, m = 9, **d = 5**", 7.5],
  "8-퀸은 해가 항상 맨 아래(d = m), 틱택토는 목표가 중간 깊이에도 있다(d < m)",
], (root, B) => {
  const T = tbl(root, 330, 230, [300, 260, 330, 330], [["문제", "b", "m", "d"], ["미로", "4", "≤ x·y", "≤ x·y"], ["8-퀸", "8", "8", "8"], ["8-퍼즐", "4", "O(9!/2)", "≤ 31"], ["틱택토", "9", "9", "5"]], { fontSize: 36, fontFamily: "JBM,Noto Sans KR" });
  return t => {
    S(T.el, { o: K(t, 0.3, 0.5) });
    T.row(0, K(t, 0.4, 0.5)); T.row(1, K(t, B[1], 0.5)); T.row(2, K(t, B[1] + 3, 0.5)); T.row(3, K(t, B[2], 0.5)); T.row(4, K(t, B[2] + 3.5, 0.5));
    [2, 4].forEach(r => T.R[r].forEach(d => { d.style.background = t > B[3] ? (r === 2 ? "rgba(191,90,242,.18)" : "rgba(100,210,255,.18)") : ""; }));
  };
});

sc(2, "메모리가 먼저 바닥난다", [
  "b = 10, 1초에 노드 100만 개, 노드 하나에 1KB라고 해 보자 (트리를 통째로 저장한다면)",
  ["깊이 2, 4, 6, … 깊어질수록 노드 수는 매번 **100배**", 6],
  ["깊이 10: 시간은 **3시간**이면 되지만 메모리는 **10TB** — 기다릴 순 있어도 메모리는 없다", 7],
  "결론: AI 탐색에서는 보통 **메모리가 시간보다 훨씬 먼저** 바닥난다",
], (root, B) => {
  const rows = [["2", "110", "0.11 ms", "107 KB"], ["4", "11,110", "11 ms", "10.6 MB"], ["6", "10⁶", "1.1 초", "1 GB"], ["8", "10⁸", "2 분", "103 GB"], ["10", "10¹⁰", "3 시간", "10 TB"], ["12", "10¹²", "13 일", "1 PB"]];
  const T = tbl(root, 360, 200, [180, 300, 300, 300], [["깊이", "노드 수", "시간", "메모리"]].concat(rows), { fontSize: 34, fontFamily: "JBM,Noto Sans KR" });
  return t => {
    S(T.el, { o: K(t, 0.3, 0.5) }); T.row(0, K(t, 0.4, 0.5));
    rows.forEach((_, i) => T.row(i + 1, K(t, B[1] + i * 0.6, 0.4)));
    T.R[5].forEach((d, j) => { d.style.background = t > B[2] ? "rgba(255,69,58,.14)" : ""; d.style.color = t > B[2] && j === 3 ? COL.warn : t > B[2] && j === 2 ? COL.fr : ""; });
    T.R.forEach((r, i) => i && r[3] && (r[3].style.fontWeight = t > B[3] ? 900 : ""));
  };
});
