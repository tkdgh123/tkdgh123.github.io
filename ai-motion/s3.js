"use strict";
/* ===================== 3-3 무정보 탐색 ===================== */
const CS = {
  nodes: { S: [180, 560], d: [400, 430], e: [560, 600], p: [330, 760], b: [330, 260], c: [560, 300], a: [450, 170], h: [720, 700], q: [560, 860], r: [760, 470], f: [900, 380], G: [1000, 220] },
  edges: [["S", "d", 3], ["S", "e", 9], ["S", "p", 1], ["d", "b", 1], ["d", "c", 8], ["d", "e", 2], ["e", "h", 8], ["e", "r", 2], ["p", "q", 15], ["b", "a", 2], ["c", "a", 2], ["h", "p", 4], ["h", "q", 4], ["r", "f", 1], ["f", "c", 3], ["f", "G", 2]],
};
const lst = a => a.join(", ");

chTitle(3, ["큐 · 스택 · 우선순위 큐", "BFS", "UCS", "DFS", "깊이 제한 · IDS", "하나의 알고리즘"]);

/* --- queue vs stack --- */
sc(3, "큐와 스택", [
  "**무정보(uninformed) 탐색**: 문제 정의 말고는 아무 정보도 없다 — 목표가 어느 쪽인지 **전혀 모른다**",
  "알 수 있는 건 '여기서 어디로 갈 수 있나(RESULT)'와 '여기가 목표인가(IS-GOAL)'뿐",
  "그러면 전략의 차이는 단 하나: 프런티어에서 **무엇을 먼저 꺼내나** — 자료구조가 곧 전략이다",
  "**큐(queue, FIFO)**: 먼저 들어간 것이 먼저 나온다 — 줄 서기, 은행 번호표",
  "**스택(stack, LIFO)**: 마지막에 들어간 것이 먼저 나온다 — 접시 쌓기, 뒤로 가기, Ctrl+Z",
  ["A, B, C를 차례로 넣고(ADD) 하나 꺼내면(POP)? 큐는 **A**, 스택은 **C**", 7],
  "큐 → 얕은(먼저 발견한) 노드부터 → **너비 우선(BFS)** · 스택 → 깊은(최근) 노드부터 → **깊이 우선(DFS)**",
], (root, B) => {
  const qx = 220, qy = 560, qw = 640, sx = 1300, sy = 320, sw = 240, sh = 420;
  const qb = at(root, qx, qy - 70, "", "", { width: qw, height: 140, borderTop: "4px solid rgba(255,255,255,.4)", borderBottom: "4px solid rgba(255,255,255,.4)" });
  const ql = at(root, qx, qy - 140, "", `<b style="color:${COL.fr}">큐</b> · FIFO`, { fontSize: 38, fontWeight: 800, whiteSpace: "nowrap" });
  const qo = at(root, qx - 30, qy + 100, "", "← 꺼냄(front)", { fontSize: 24, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" });
  const qi = at(root, qx + qw - 150, qy + 100, "", "넣음(back) ←", { fontSize: 24, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" });
  const sb = at(root, sx, sy, "", "", { width: sw, height: sh, borderLeft: "4px solid rgba(255,255,255,.4)", borderRight: "4px solid rgba(255,255,255,.4)", borderBottom: "4px solid rgba(255,255,255,.4)", borderRadius: "0 0 16px 16px" });
  const sl = at(root, sx, sy - 80, "", `<b style="color:#bf5af2">스택</b> · LIFO`, { fontSize: 38, fontWeight: 800, whiteSpace: "nowrap" });
  const so = at(root, sx + sw + 30, sy + 300, "", "↕ 맨 위(top)에서만\n넣고 꺼냄", { fontSize: 24, color: "rgba(255,255,255,.6)", whiteSpace: "pre" });
  const it = (l, c) => at(root, 0, 0, "", l, { width: 110, height: 100, borderRadius: 16, fontSize: 46, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${c} 25%, transparent)`, border: "3px solid " + c }, true);
  const Q = ["A", "B", "C"].map(l => it(l, COL.fr)), St = ["A", "B", "C"].map(l => it(l, "#bf5af2"));
  const rq = at(root, qx + qw / 2, qy + 210, "", "", { fontSize: 40, fontWeight: 900, whiteSpace: "nowrap" }, true), rs = at(root, sx + sw / 2, sy + sh + 50, "", "", { fontSize: 40, fontWeight: 900, whiteSpace: "nowrap" }, true);
  const ops = at(root, 960, 230, "fx", "ADD(A) · ADD(B) · ADD(C) · POP()", { fontSize: 40, whiteSpace: "nowrap", color: COL.gold }, true);
  const bfs = at(root, qx + qw / 2, 870, "", "→ BFS", { fontSize: 44, fontWeight: 900, color: COL.fr }, true), dfs = at(root, sx + sw / 2, 870, "", "→ DFS", { fontSize: 44, fontWeight: 900, color: "#bf5af2" }, true);
  const intro = at(root, 960, 470, "", `<div style="display:flex;gap:40px;align-items:center;font-size:34px;font-weight:800"><span style="padding:18px 30px;border-radius:18px;border:2px solid rgba(255,255,255,.3)">RESULT(s, a)</span><span style="padding:18px 30px;border-radius:18px;border:2px solid rgba(255,255,255,.3)">IS-GOAL(s)</span><span style="padding:18px 30px;border-radius:18px;border:2px dashed ${COL.warn};color:${COL.warn}">목표까지 거리 ✕</span></div>`, {}, true);
  const pick = at(root, 960, 650, "", `전략 = <span style="color:${COL.gold}">pick(frontier)</span>`, { fontSize: 44, fontWeight: 800, whiteSpace: "nowrap" }, true);
  return t => {
    const io = K(t, B[3] - 0.3, 0.5);
    S(intro, { o: K(t, B[1], 0.6) * (1 - io) }); S(pick, { o: K(t, B[2] + 0.5, 0.6) * (1 - io) });
    [qb, ql, qo, qi].forEach(e => vis(e, t, B[3], null)); [sb, sl, so].forEach(e => vis(e, t, B[4], null));
    vis(ops, t, B[5], null);
    const a = B[5] + 0.6, p = B[5] + 3.6, pq = K(t, p, 0.8, E.io3);
    Q.forEach((e, i) => { const q = K(t, a + i * 0.8, 0.6, E.o5); let x = qx + 70 + i * 130 + (1 - q) * 300, y = qy; if (i === 0) x -= pq * 260; else x -= pq * 130; S(e, { o: q * (i === 0 ? 1 - K(t, p + 0.8, 0.6) * 0 : 1), x, y }); glow2(e, i === 0 ? K(t, p, 0.4) : 0, COL.fr); });
    St.forEach((e, i) => { const q = K(t, a + i * 0.8, 0.6, E.o5); let x = sx + sw / 2, y = sy + sh - 60 - i * 115 - (1 - q) * 300; if (i === 2) { y -= pq * 60; x += pq * 260; } S(e, { o: q, x, y }); glow2(e, i === 2 ? K(t, p, 0.4) : 0, "#bf5af2"); });
    htm(rq, `POP → <span style="color:${COL.fr}">A</span>`); htm(rs, `POP → <span style="color:#bf5af2">C</span>`); vis(rq, t, p + 0.6, null); vis(rs, t, p + 0.9, null);
    vis(bfs, t, B[6] + 0.4, null); vis(dfs, t, B[6] + 1.2, null);
  };
});

/* --- BFS code --- */
code(3, {
  name: "BFS 의사코드", file: "bfs.py", tag: "교재 의사코드",
  title: "너비 우선 탐색", about: "**가장 얕은** 미확장 노드부터 확장한다. 프런티어 = **FIFO 큐**.",
  src: String.raw`
def BREADTH_FIRST_SEARCH(problem):
    node = NODE(problem.INITIAL)
    if problem.IS_GOAL(node.STATE): return node
    frontier = FIFOQueue([node])       # 큐!
    reached = {problem.INITIAL}        # 이미 본 상태
    while frontier:
        node = frontier.pop()          # 가장 오래된 것
        for child in EXPAND(problem, node):
            s = child.STATE
            if problem.IS_GOAL(s):
                return child           # 만들 때 검사
            if s not in reached:
                reached.add(s)
                frontier.append(child)
    return failure`,
  steps: [
    { l: "4", t: "프런티어 = FIFO 큐", d: "먼저 들어온 노드가 먼저 나온다 → 깊이 1을 다 처리하기 전엔 깊이 2가 나오지 않는다.", m: ["FIFOQueue"] },
    { l: "5", t: "reached — 본 적 있는 상태", d: "**reached**에 있는 상태는 다시 넣지 않는다 → 사이클·중복 경로로 같은 상태를 두 번 방문하지 않는다." },
    { l: "7", t: "가장 오래된 노드 꺼내기", d: "큐의 맨 앞 = 가장 **얕은** 노드." },
    { l: "8", t: "EXPAND", d: "현재 노드에서 가능한 모든 행동을 적용해 자식 노드를 만든다 (다음 장면)." },
    { l: "10-11", t: "조기 목표 검사", d: "BFS는 자식을 **만드는 순간** 목표를 검사한다(early goal test). 얕은 순서로 만들기 때문에 처음 만든 목표가 이미 가장 얕은 해다.", m: ["return child"] },
    { l: "10-11", t: "왜 이득인가", d: "b = 10, d = 3: 만들 때 검사하면 깊이 3을 만들다 발견, 꺼낼 때 검사하면 깊이 4 노드(최대 10,000개)까지 만들어 버린다 — **한 층 = b배** 차이." },
    { l: "12-14", t: "처음 보는 상태만 추가", d: "reached에 넣고 큐 **뒤**에 붙인다." },
  ],
});

code(3, {
  name: "EXPAND — 자식 만들기", file: "expand.py", tag: "교재 의사코드",
  title: "노드 = 상태 + 기록", about: "전이 모델(RESULT)로 가능한 모든 행동을 시도해 **자식 노드**를 만든다.",
  src: String.raw`
def EXPAND(problem, node):
    s = node.STATE
    for action in problem.ACTIONS(s):
        s2 = problem.RESULT(s, action)        # 전이 함수
        cost = node.PATH_COST + problem.ACTION_COST(s, action, s2)
        yield NODE(STATE=s2, PARENT=node,
                   ACTION=action, PATH_COST=cost)`,
  steps: [
    { l: "2-3", t: "가능한 행동마다", d: "Arad에서 가능한 행동: Sibiu로 · Timisoara로 · Zerind로.", v: { s: "Arad" } },
    { l: "4", t: "전이 함수로 다음 상태", d: "RESULT(Arad, Sibiu로) = Sibiu", v: { s2: "Sibiu" }, m: ["RESULT"] },
    { l: "5", t: "경로 비용 누적", d: "부모까지 비용 + 이번 행동 비용: 0 + 140 = **140**", v: { cost: "140" } },
    { l: "6-7", t: "노드 4요소", d: "**STATE · PARENT · ACTION · PATH-COST**. 부모 포인터를 따라 올라가면 경로를 복원할 수 있다.", v: { "Sibiu.g": "140", "Timisoara.g": "118", "Zerind.g": "75" } },
    { l: "4-7", t: "한 번 더", d: "Sibiu를 확장하면 Fagaras의 PATH-COST = 140 + 99 = **239**", v: { s: "Sibiu", s2: "Fagaras", cost: "239" } },
  ],
});

/* --- BFS run --- */
algoScene(3, "BFS 실행", {
  nodes: CS.nodes, edges: CS.edges, dir: true, start: "S", goal: "G", alg: "bfs", ds: "q",
  intro: ["강의 슬라이드의 그래프로 직접 돌려 보자. S에서 G까지, 간선 위 숫자는 행동 비용", "**BFS**: 프런티어는 **큐**. 가장 오래된(얕은) 노드부터 꺼내고, **reached**로 중복을 막는다"],
  item: n => ({ lab: n.st, sub: "깊이 " + n.d }),
  popSub: (n, R) => "경로 " + R.pathOf(n).join("→") + " · 깊이 " + n.d,
  note: (s, i) => {
    const add = s.kids.filter(k => k.s === "add").map(k => k.n.st), sk = s.kids.filter(k => k.s === "skip").map(k => k.n.st), g = s.kids.find(k => k.s === "goal");
    if (g) return `큐 맨 앞 **${s.node.st}** 꺼냄 → 자식 G를 **만드는 순간** 목표 검사 → 성공!`;
    return `큐 맨 앞 **${s.node.st}** 꺼냄 → ` + (add.length ? `${lst(add)} 큐 뒤에 추가` : "새 자식 없음") + (sk.length ? ` · ${lst(sk)}는 이미 reached → 버림` : "");
  },
  stepMin: 3.4,
  outro: ["BFS의 답: S → e → r → f → G — 4단계, **가장 얕은** 해", ["하지만 비용은 9 + 2 + 1 + 2 = **14**. 더 싼 길(10)이 있는데도 — BFS는 **비용을 보지 않는다**", 6.5]],
});

/* --- BFS complexity & properties --- */
sc(3, "BFS의 성질", [
  "BFS는 층 단위로 훑는다. 목표가 깊이 **d**에 있으면 그 층까지만 — 비용을 정하는 건 m이 아니라 **d**",
  "만드는 노드 1 + b + b² + … + b^d = **O(b^d)**. 그 노드를 전부 기억해야 하니 공간도 **O(b^d)**",
  "b = 10: d = 2 → 111개, d = 4 → 11,111개, d = 6 → 1,111,111개",
  "완전성: **예** — b가 유한하면 각 층이 유한해서, 해가 있는 층에 반드시 도착한다",
  "비용 최적성: 모든 행동 비용이 **같을 때만** 예. 아니면 → 균일 비용 탐색(UCS)",
  "참고: AI에서는 보통 **공간**(메모리)이 시간보다 더 큰 문제다",
], (root, B) => {
  const P = []; const Y = [220, 360, 500, 640, 780];
  const xsOf = d => { const n = 2 ** d; return Array.from({ length: n }, (_, i) => 120 + (i + 0.5) * (900 / n)); };
  for (let d = 0; d <= 4; d++) xsOf(d).forEach((x, i) => P.push({ x, y: Y[d], d, i }));
  const idx = (d, i) => 2 ** d - 1 + i;
  const svg = svgLayer(root);
  const Ed = P.map(p => p.d ? arrow(svg, [[P[idx(p.d - 1, p.i >> 1)].x, Y[p.d - 1] + 16], [p.x, p.y - 16]], { c: "rgba(255,255,255,.3)", w: 2.5, head: 0 }) : null);
  const N = P.map(p => at(root, p.x, p.y, "gn", "", { width: p.d === 4 ? 22 : 34, height: p.d === 4 ? 22 : 34 }, true));
  const goal = idx(2, 2);
  const line = at(root, 560, 570, "", "", { width: 960, height: 4, background: COL.path, borderRadius: 2 }, true);
  const dl = at(root, 1060, 570, "", "d", { fontSize: 44, fontWeight: 900, color: COL.path }, true);
  const ml = at(root, 1060, 780, "", "m", { fontSize: 44, fontWeight: 900, color: "#bf5af2" }, true);
  const cnt = at(root, 1480, 260, "fx", "1 + b + b² + … + b<sup>d</sup> = O(b<sup>d</sup>)", { fontSize: 36, whiteSpace: "nowrap" }, true);
  const nums = at(root, 1480, 380, "", "", { fontSize: 30, whiteSpace: "nowrap", lineHeight: 1.7, fontFamily: "JBM,Noto Sans KR" }, true);
  const props = [["완전성", "예 (b 유한)", COL.fr], ["최적성", "비용이 모두 같을 때만", COL.gold], ["시간", "O(b^d)", "#64d2ff"], ["공간", "O(b^d)", COL.warn]].map(([a, b2, c], i) => at(root, 1240, 520 + i * 78, "", `<span style="display:inline-block;width:130px;color:${c};font-weight:900">${a}</span>${b2.replace("^d", "<sup>d</sup>")}`, { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }));
  return t => {
    const lim = 2;
    N.forEach((n, i) => { const p = P[i]; S(n, { o: K(t, 0.2 + p.d * 0.3, 0.4) * (p.d > lim + 1 && t > B[0] + 2 ? 0.35 : 1) }); nst(n, i === goal ? "goal" : p.d <= lim && t > B[0] + 1.0 + p.d * 0.6 ? (p.d < lim ? "ex" : "fr") : ""); });
    if (t > B[0] + 2.4) nst(N[goal], "path");
    Ed.forEach((e, i) => e && e.set(K(t, 0.1 + P[i].d * 0.3, 0.4), P[i].d > lim + 1 && t > B[0] + 2 ? 0.35 : 1));
    S(line, { o: K(t, B[0] + 2.0, 0.5), sx: K(t, B[0] + 2.0, 0.7, E.o5) }); vis(dl, t, B[0] + 2.3, null); vis(ml, t, B[0] + 2.6, null);
    vis(cnt, t, B[1] + 0.3, null);
    htm(nums, ["d = 2 → 111", "d = 4 → 11,111", "d = 6 → 1,111,111"].map((s, i) => `<div style="opacity:${t > B[2] + 0.4 + i * 0.9 ? 1 : 0}">${s}</div>`).join("")); S(nums, { o: K(t, B[2], 0.4) * (1 - K(t, B[3], 0.4)) });
    props.forEach((p, i) => vis(p, t, [B[3], B[4], B[1] + 1.5, B[1] + 2.2][i], null));
    glow2(props[3], K(t, B[5], 0.4), COL.warn);
  };
});

/* --- UCS run --- */
algoScene(3, "UCS 실행", {
  nodes: CS.nodes, edges: CS.edges, dir: true, start: "S", goal: "G", alg: "ucs", ds: "pq", keyName: "g",
  intro: ["**균일 비용 탐색(UCS)** = 다익스트라 알고리즘. 깊이가 아니라 **경로 비용 g(n)** 이 가장 작은 노드부터", ["프런티어는 g로 정렬된 **우선순위 큐**. 목표 검사는 **꺼낼 때**, 더 싼 경로가 나오면 **갱신**", 6.5]],
  item: (n, R) => ({ lab: n.st, sub: R.pathOf(n).join("→"), key: "g=" + n.g }),
  kidLab: n => n.st + "(" + n.g + ")",
  note: s => {
    if (s.goal) return `g가 가장 작은 **G(${s.node.g})** 꺼냄 → **꺼낼 때** 목표 검사 → 성공! 비용 ${s.node.g}`;
    const add = s.kids.filter(k => k.s === "add").map(k => `${k.n.st}(${k.n.g})`), up = s.kids.filter(k => k.s === "upd").map(k => `${k.n.st} ${k.old}→${k.n.g}`), sk = s.kids.filter(k => k.s === "skip").map(k => k.n.st);
    return `g가 가장 작은 **${s.node.st}(${s.node.g})** 꺼냄` + (add.length ? ` → ${lst(add)} 추가` : s.kids.length ? "" : " → 자식 없음") + (up.length ? ` · **${lst(up)}** 더 싼 경로로 갱신!` : "") + (sk.length ? ` · ${lst(sk)}는 더 싸지 않아 무시` : "");
  },
  stepMin: 3.6,
  outro: ["UCS의 답: S → d → e → r → f → G, 비용 **10** — BFS의 해(14)보다 한 단계 길지만 **더 싸다**", "p(1)는 비용 1로 가장 먼저, e(9)는 깊이 1이지만 비싸서 뒤로 — 깊이 대신 **비용 순서**"],
});

code(3, {
  name: "UCS = 최선 우선 탐색", file: "best_first.py", tag: "교재 의사코드",
  title: "BEST-FIRST-SEARCH", about: "평가 함수 **f**로 정렬된 우선순위 큐. UCS는 f = g(경로 비용)로 부른 것.",
  src: String.raw`
def BEST_FIRST_SEARCH(problem, f):
    node = NODE(problem.INITIAL)
    frontier = PriorityQueue([node], key=f)  # f로 정렬
    reached = {problem.INITIAL: node}
    while frontier:
        node = frontier.pop()                # f가 가장 작은 것
        if problem.IS_GOAL(node.STATE):
            return node                      # 꺼낼 때 검사
        for child in EXPAND(problem, node):
            s = child.STATE
            if s not in reached or child.PATH_COST < reached[s].PATH_COST:
                reached[s] = child           # 더 싼 경로면 갱신
                frontier.add(child)
    return failure

UCS = BEST_FIRST_SEARCH(problem, f=PATH_COST)`,
  steps: [
    { l: "3", t: "① 우선순위 큐", d: "꺼낼 때마다 f가 **가장 작은** 노드. UCS에선 f = g(n) = 시작부터 n까지 경로 비용.", m: ["PriorityQueue"] },
    { l: "4", t: "reached는 표(lookup table)", d: "상태 → 지금까지 찾은 **가장 싼 노드**." },
    { l: "7-8", t: "② 꺼낼 때 목표 검사", d: "**늦은 목표 검사(late goal test)**. 꺼낸다는 건 남은 것 중 가장 싸다는 뜻 → 그때 목표면 최적." },
    { l: "11-13", t: "③ 더 싼 경로면 갱신", d: "BFS에 없던 검사. 같은 상태로 가는 **더 싼 경로**가 나중에 나오면 그것을 택한다 (e: 9 → 5).", m: ["child.PATH_COST < reached[s].PATH_COST"] },
    { l: "16", t: "UCS 완성", d: "같은 함수에 f만 바꿔 넘기면 다른 알고리즘이 된다 — 3-4의 Greedy, A*도 이 함수 그대로." },
  ],
});

/* --- UCS properties --- */
sc(3, "UCS의 성질", [
  "UCS는 비용 **등고선**을 따라 퍼진다 — BFS의 띠가 '깊이'였다면 UCS의 띠는 '**비용**'",
  "왜 꺼낼 때 검사할까? S → G 직행은 10, S → A → G는 1 + 1 = 2",
  ["만들 때 검사했다면 G(10)을 바로 반환 — **틀렸다**. 꺼낼 때 검사하면 A(1)을 먼저 꺼내 G(2)를 찾는다", 7],
  "완전성: 모든 행동 비용이 작은 양수 **ε 이상**이면 예 — 비용 0 행동이 무한 반복되면 영원히 판다",
  "최적성: **예** — 비용이 증가하는 순서로 확장하니까",
  ["시간 · 공간: O(b^(C*/ε)) — C*는 최적 해 비용. 싼 긴 경로를 먼저 많이 보면 BFS의 O(b^d)보다 클 수 있다", 7.5],
  "모든 행동 비용이 같으면 등고선 = 깊이 띠 → **BFS는 UCS의 특수한 경우**",
], (root, B) => {
  const cx = 480, cy = 560;
  const rings = [100, 190, 280, 370].map((r, i) => at(root, cx, cy, "", `<span style="position:absolute;right:-6px;top:50%;transform:translate(100%,-50%);font:700 22px JBM;color:rgba(255,255,255,.6)">g≤${(i + 1) * 3}</span>`, { width: r * 2, height: r * 2 * 0.8, borderRadius: "50%", border: "3px solid rgba(191,90,242,.6)", background: `rgba(191,90,242,${0.12 - i * 0.025})` }, true));
  const sN = gnode(root, cx, cy, "S", 30);
  const gx = 1150, svg = svgLayer(root);
  const Sx = gnode(root, gx, 520, "S", 36), Ax = gnode(root, gx + 300, 360, "A", 36), Gx = gnode(root, gx + 600, 520, "G", 36);
  const e1 = gedge(svg, root, Sx, Gx, { dir: true, wt: 10, w: 3 }), e2 = gedge(svg, root, Sx, Ax, { dir: true, wt: 1, w: 3 }), e3 = gedge(svg, root, Ax, Gx, { dir: true, wt: 1, w: 3 });
  const bad = at(root, gx + 300, 640, "", "", { fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }, true);
  const good = at(root, gx + 300, 700, "", "", { fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }, true);
  const props = [["완전성", "예 (비용 ≥ ε > 0)", COL.fr], ["최적성", "예", COL.gold], ["시간·공간", "O(b<sup>C*/ε</sup>)", "#64d2ff"]].map(([a, b2, c], i) => at(root, 1150, 300 + i * 90, "", `<span style="display:inline-block;width:170px;color:${c};font-weight:900">${a}</span>${b2}`, { fontSize: 34, fontWeight: 700, whiteSpace: "nowrap" }));
  const sp = at(root, 1150, 600, "", `비용이 모두 같으면 <b style="color:${COL.fr}">UCS = BFS</b>`, { fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" });
  return t => {
    pop(sN, t, 0.3); nst(sN, "st");
    rings.forEach((r, i) => { const q = K(t, 0.6 + i * 0.6, 0.8, E.o5); S(r, { o: q, s: 0.6 + 0.4 * q }); r.style.borderRadius = t > B[6] ? "50%" : "50%"; });
    const o2 = K(t, B[3], 0.5);
    [Sx, Ax, Gx].forEach((n, i) => { pop(n, t, B[1] + i * 0.2); S(n, { o: K(t, B[1] + i * 0.2, 0.3) * (1 - o2) }); });
    [e1, e2, e3].forEach((e, i) => { e.set(K(t, B[1] + 0.6 + i * 0.2, 0.4) * (1 - o2), i === 0 && t > B[2] && t < B[2] + 3 ? COL.warn : i > 0 && t > B[2] + 3 ? COL.fr : "rgba(255,255,255,.5)"); S(e.lab, { o: K(t, B[1] + 0.8, 0.4) * (1 - o2) }); });
    nst(Sx, "st"); nst(Gx, "goal");
    htm(bad, `만들 때 검사 → G(10) <span style="color:${COL.warn}">✕</span>`); htm(good, `꺼낼 때 검사 → G(2) <span style="color:${COL.fr}">✓</span>`);
    S(bad, { o: K(t, B[2], 0.4) * (1 - o2) }); S(good, { o: K(t, B[2] + 3, 0.4) * (1 - o2) });
    props.forEach((p, i) => vis(p, t, [B[3], B[4], B[5]][i], null));
    vis(sp, t, B[6] + 0.3, null);
  };
});

/* --- DFS run --- */
algoScene(3, "DFS 실행", {
  nodes: CS.nodes, edges: CS.edges, dir: true, start: "S", goal: "G", alg: "dfs", ds: "s", dsH: 330, cardH: 180,
  intro: ["**깊이 우선 탐색(DFS)**: 가장 **깊은** 노드부터. 프런티어는 **스택** — 가장 최근에 넣은 것을 꺼낸다", ["reached는 없다. 대신 **현재 경로**에 같은 상태가 있으면(사이클) 넣지 않는다", 6]],
  item: (n, R) => ({ lab: n.st, sub: R.pathOf(n).join("→") }),
  popLab: (n, R) => R.pathOf(n).join("→"),
  popSub: n => "깊이 " + n.d + " · g = " + n.g,
  note: (s, i, R) => {
    const p = R.pathOf(s.node).join("→");
    if (s.goal) return `스택 맨 위 **${p}** 꺼냄 → 목표! DFS는 **처음 찾은** 해를 반환`;
    const add = s.kids.filter(k => k.s === "add").map(k => k.n.st), cy = s.kids.filter(k => k.s === "cycle").map(k => k.n.st);
    return `스택 맨 위 **${p}** 꺼냄` + (add.length ? ` → ${lst(add)} 쌓기` : cy.length ? "" : " → 자식 없음, **되돌아감**") + (cy.length ? ` · ${lst(cy)}는 현재 경로에 있음 → 사이클` : "");
  },
  stepMin: 3.0,
  outro: ["이번엔 운 좋게 비용 10짜리 해. 하지만 DFS는 **처음 찾은** 해를 돌려줄 뿐 — 최적 보장은 없다", "e, p 가지(깊이 1)는 손도 안 댔다 — 한 갈래를 끝까지 판 뒤 막히면 되돌아온다(**backtracking**)"],
});

/* --- DFS properties (binary tree) --- */
const BT = (() => { const L = "ABCDEFGHIJKLMNO".split(""), P = {}; const Y = [220, 380, 540, 700]; L.forEach((c, i) => { const d = Math.floor(Math.log2(i + 1)), k = i + 1 - 2 ** d, n = 2 ** d; P[c] = { x: 160 + (k + 0.5) * (1200 / n), y: Y[d], d, i, par: i ? L[Math.floor((i - 1) / 2)] : null }; }); return { L, P }; })();
function btree(root, svg, r = 30) {
  const N = {}, Ed = {};
  BT.L.forEach(c => { N[c] = gnode(root, BT.P[c].x, BT.P[c].y, c, r); });
  BT.L.forEach(c => { const p = BT.P[c]; if (p.par) Ed[c] = gedge(svg, null, N[p.par], N[c], { w: 3 }); });
  return { N, Ed };
}
sc(3, "DFS의 성질", [
  ["DFS는 처음 도달한 목표를 반환한다 — 깊이 1의 C를 두고, A → B → D → H → I로 깊이 3의 I를 먼저 찾는다 → **최적 아님**", 8],
  ["메모리: 다 본 가지는 **버린다**. 들고 있는 건 **현재 경로 + 각 층의 안 본 형제**뿐 → **O(bm)**", 7],
  "b = 10, m = 16이면 DFS는 약 160개 — BFS는 한 층에만 10¹⁶개가 될 수 있다",
  "시간: 최악엔 모든 경로를 끝까지 → **O(b^m)**. m ≫ d이면 BFS보다 훨씬 느리다",
  "완전성: m이 무한일 수 있어 **사이클을 막을 때만**(유한 공간). 사이클은 끊어도 중복 경로는 못 막는다",
], (root, B) => {
  const svg = svgLayer(root), T = btree(root, svg);
  const order = ["A", "B", "D", "H", "I"];
  const mem = at(root, 1440, 240, "", "", { width: 400, fontSize: 28, lineHeight: 1.6 });
  const props = [["완전성", "사이클 막을 때만", COL.gold], ["최적성", "아니오", COL.warn], ["시간", "O(b<sup>m</sup>)", "#64d2ff"], ["공간", "O(bm) — 선형!", COL.fr]].map(([a, b2, c], i) => at(root, 1440, 540 + i * 70, "", `<span style="display:inline-block;width:110px;color:${c};font-weight:900">${a}</span>${b2}`, { fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }));
  const big = at(root, 700, 790, "", "", { fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }, true);
  return t => {
    BT.L.forEach(c => { pop(T.N[c], t, 0.2 + BT.P[c].d * 0.25); if (T.Ed[c]) T.Ed[c].set(K(t, 0.1 + BT.P[c].d * 0.25, 0.4)); });
    const k = Math.floor(clamp((t - B[0] - 1.2) / 1.0, 0, 5));
    const vis2 = new Set(order.slice(0, k));
    BT.L.forEach(c => {
      let st = (c === "C" || c === "I") ? "goal" : "";
      if (vis2.has(c)) st = c === order[k - 1] ? (c === "I" ? "path" : "cur") : "ex";
      if (t > B[1] && (c === "H")) st = "dim";
      if (t > B[1] && ["E", "C"].includes(c)) st = c === "C" ? "goal" : "fr";
      if (t > B[1] && c === "I") st = "path";
      nst(T.N[c], st);
    });
    order.slice(1, k).forEach(c => T.Ed[c].set(1, COL.path, 1, 5));
    htm(mem, t > B[1] + 0.5 ? `<div class="lab">메모리에 있는 것</div><div style="margin-top:10px">경로 A → B → D → I</div><div style="color:${COL.fr}">+ 안 본 형제 C, E</div><div style="color:rgba(255,255,255,.4)">H는 다 봤으니 버림</div>` : "");
    S(mem, { o: K(t, B[1] + 0.5, 0.5) });
    htm(big, t > B[0] + 6 ? `C(깊이 1)를 두고 <span style="color:${COL.path}">I(깊이 3)</span>를 반환` : ""); S(big, { o: K(t, B[0] + 6, 0.4) * (1 - K(t, B[1], 0.4)) });
    props.forEach((p, i) => vis(p, t, [B[4], B[0] + 6.5, B[3], B[1] + 2][i], null));
  };
});

/* --- DLS + IDS code --- */
code(3, {
  name: "깊이 제한 · IDS 의사코드", file: "ids.py", tag: "교재 의사코드",
  title: "DFS에 한계를 걸면", about: "DFS = 프런티어가 **스택(LIFO)** 인 최선 우선 탐색. 여기에 깊이 한계 ℓ을 붙이면 **깊이 제한 탐색**.",
  src: String.raw`
def DEPTH_LIMITED_SEARCH(problem, limit):
    frontier = LIFOQueue([NODE(problem.INITIAL)])  # 스택
    result = failure
    while frontier:
        node = frontier.pop()              # 가장 최근 것
        if problem.IS_GOAL(node.STATE):
            return node
        if DEPTH(node) > limit:
            result = cutoff                # 한계에 걸림
        elif not IS_CYCLE(node):
            for child in EXPAND(problem, node):
                frontier.append(child)
    return result                          # cutoff 또는 failure

def ITERATIVE_DEEPENING_SEARCH(problem):
    for depth in range(0, INF):
        result = DEPTH_LIMITED_SEARCH(problem, depth)
        if result != cutoff:
            return result`,
  steps: [
    { l: "2", t: "스택", d: "가장 **최근에** 넣은 노드부터 → 한 갈래를 끝까지." },
    { l: "2-3", t: "reached가 없다", d: "메모리를 아끼려고 **버렸다**. 다 본 가지는 메모리에서 해제된다." },
    { l: "10", t: "IS_CYCLE — 현재 경로만 검사", d: "부모를 따라 올라가며 같은 상태가 있나 본다. 사이클은 막지만 **중복 경로는 못 막는다**.", m: ["IS_CYCLE"] },
    { l: "8-9", t: "깊이 한계", d: "한계보다 깊은 노드는 확장하지 않고 **cutoff** 표시. DFS는 ℓ = ∞ 인 경우.", m: ["cutoff"] },
    { l: "13", t: "cutoff ≠ failure", d: "**cutoff** = '이 한계 안엔 없지만 더 깊으면 있을지도', **failure** = '해가 아예 없다'." },
    { l: "15-19", t: "IDS: 한계를 0, 1, 2, … 로", d: "결과가 cutoff가 아니면(해를 찾았거나 진짜 실패) 멈춘다. 이 구분이 없으면 해 없는 문제에서 **영원히** 돈다.", m: ["result != cutoff"] },
  ],
});

/* --- IDS iterations --- */
const IDSIT = [0, 1, 2, 3].map(l => { const seq = []; const go = c => { const p = BT.P[c]; seq.push(c); if (c === "M") return true; if (p.d >= l) return false; return [BT.L[2 * p.i + 1], BT.L[2 * p.i + 2]].some(ch => ch && go(ch)); }; go("A"); return seq; });
sc(3, "반복적 깊이 심화 (IDS)", [
  "DFS의 적은 메모리 + BFS의 보장, 둘 다 가질 수 없을까? → **반복적 깊이 심화 탐색(IDS)**",
  ["한계 ℓ = 0: 루트 A만 확인", 3.4],
  ["ℓ = 1: **처음부터 다시**, 깊이 1까지 DFS", 4.2],
  ["ℓ = 2: 또 처음부터, 깊이 2까지", 5.5],
  ["ℓ = 3: 깊이 3에서 목표 **M** 발견! 한계를 하나씩 늘리니 **더 얕은 해를 놓치지 않는다**", 9],
  "윗층은 여러 번 만들어진다(A는 4번, B·C는 3번…) — 하지만 노드 대부분이 맨 아래층이라 낭비는 작다",
], (root, B) => {
  const svg = svgLayer(root), T = btree(root, svg);
  const lab = at(root, 1500, 240, "", "", { fontSize: 52, fontWeight: 900, whiteSpace: "nowrap", fontFamily: "JBM,Noto Sans KR" }, true);
  const seqE = at(root, 1500, 340, "", "", { fontSize: 26, whiteSpace: "nowrap", fontFamily: "JBM,monospace", color: "rgba(255,255,255,.75)" }, true);
  const cnt = {}; BT.L.forEach(c => cnt[c] = at(root, BT.P[c].x + 28, BT.P[c].y - 34, "", "", { fontSize: 20, fontWeight: 800, color: COL.gold, fontFamily: "JBM" }));
  const lim = at(root, 160, 0, "", "", { width: 1200, height: 3, background: "repeating-linear-gradient(90deg," + COL.warn + " 0 14px,transparent 14px 24px)" });
  const Y = [220, 380, 540, 700];
  return t => {
    BT.L.forEach(c => { if (T.Ed[c]) T.Ed[c].set(K(t, 0.1, 0.4)); });
    let L = -1, u = 0; for (let l = 0; l <= 3; l++) if (t > B[l + 1]) { L = l; u = t - B[l + 1]; }
    const n = L < 0 ? 0 : Math.min(IDSIT[L].length, Math.floor(u / (L === 3 ? 0.6 : 0.5)) + 1);
    const seen = L < 0 ? [] : IDSIT[L].slice(0, n);
    const tot = {}; for (let l = 0; l < L; l++) IDSIT[l].forEach(c => tot[c] = (tot[c] || 0) + 1); seen.forEach(c => tot[c] = (tot[c] || 0) + 1);
    BT.L.forEach(c => {
      const p = BT.P[c], inLim = L >= 0 && p.d <= L;
      S(T.N[c], { o: (K(t, 0.2, 0.5)) * (L < 0 || inLim ? 1 : 0.25) });
      let st = c === "M" ? "goal" : "";
      if (seen.includes(c)) st = c === seen[seen.length - 1] ? (c === "M" ? "path" : "cur") : "ex";
      nst(T.N[c], st);
      txt(cnt[c], t > B[5] && tot[c] ? "×" + tot[c] : ""); S(cnt[c], { o: K(t, B[5], 0.4) });
    });
    htm(lab, L < 0 ? "" : `ℓ = <span style="color:${COL.warn}">${L}</span>`); S(lab, { o: L < 0 ? 0 : 1 });
    htm(seqE, seen.join(" ")); S(seqE, { o: L < 0 ? 0 : 1 });
    S(lim, { o: L < 0 || L === 3 ? 0 : 1, y: L < 0 ? 0 : Y[L] + 60 });
  };
});

sc(3, "IDS의 성질", [
  "시간: 깊이 1 노드는 d번, 깊이 2는 d−1번, …, 깊이 d는 1번 → db + (d−1)b² + … + b^d = **O(b^d)**",
  ["b = 10, d = 5: BFS 111,110개 vs IDS 123,450개 — 고작 **11%** 더", 6.5],
  "공간: **O(bd)** — 선형. d ≤ m 이므로 DFS보다도 적다",
  "완전성 **예**, 최적성 **예**(BFS와 같은 조건 — 비용이 모두 같을 때)",
  "BFS와 같은 결과를 조금 더 긴 시간, **훨씬 좋은 공간**으로 → 그래서 IDS와 DFS가 AI의 **일꾼**이다",
], (root, B) => {
  const f = at(root, 960, 230, "fx", "d·b + (d−1)·b² + … + 1·b<sup>d</sup> = O(b<sup>d</sup>)", { fontSize: 46, whiteSpace: "nowrap" }, true);
  const bars = [["BFS", 111110, COL.fr], ["IDS", 123450, "#bf5af2"]].map(([a, v, c], i) => at(root, 300, 360 + i * 120, "", `<div style="display:flex;align-items:center;gap:24px"><span style="width:90px;font-size:34px;font-weight:900;color:${c}">${a}</span><div class="br" style="height:60px;width:${v / 123450 * 1000}px;border-radius:12px;background:${c};opacity:.8;transform-origin:0 50%"></div><span class="fx" style="font-size:34px">${v.toLocaleString()}</span></div>`, { width: 1500 }));
  bars.forEach(b => b.br = b.querySelector(".br"));
  const props = [["시간", "O(b<sup>d</sup>)", "#64d2ff"], ["공간", "O(bd)", COL.fr], ["완전성", "예", COL.fr], ["최적성", "예 (비용 같을 때)", COL.gold]].map(([a, b2, c], i) => at(root, 300 + (i % 2) * 700, 640 + Math.floor(i / 2) * 80, "", `<span style="display:inline-block;width:150px;color:${c};font-weight:900">${a}</span>${b2}`, { fontSize: 34, fontWeight: 700, whiteSpace: "nowrap" }));
  return t => {
    vis(f, t, 0.3, null);
    bars.forEach((b, i) => { vis(b, t, B[1] + i * 0.8, null); S(b.br, { sx: K(t, B[1] + i * 0.8 + 0.2, 1.0, E.o5) }); });
    props.forEach((p, i) => vis(p, t, [B[0] + 2, B[2], B[3], B[3] + 0.5][i], null));
  };
});

/* --- comparison & one algorithm --- */
sc(3, "한눈에 비교 · 하나의 알고리즘", [
  ["무정보 탐색 네 가지를 한 표로", 4],
  ["완전성: BFS·UCS·IDS는 예, DFS는 조건부 · 최적성: UCS는 항상, BFS·IDS는 비용이 같을 때만", 7.5],
  ["시간은 BFS·IDS가 O(b^d), DFS는 O(b^m) · 공간은 DFS O(bm), IDS O(bd)가 압도적으로 작다", 7.5],
  "그런데 이 넷은 사실 **하나의 알고리즘**이다 — 다른 건 **프런티어 규칙**뿐",
  "FIFO 큐 · 우선순위 큐 · LIFO 스택 · 깊이 한계 스택 — 개념적으로는 전부 **우선순위 큐**",
  "다음 파트(3-4)는 우선순위만 바꾼다: **f = g + h**",
], (root, B) => {
  const T = tbl(root, 220, 210, [260, 340, 340, 340, 340], [["", "BFS", "UCS", "DFS", "IDS"], ["완전성", "예¹", "예²", "조건부", "예¹"], ["최적성", "예³", "예", "아니오", "예³"], ["시간", "O(b^d)", "O(b^(C*/ε))", "O(b^m)", "O(b^d)"], ["공간", "O(b^d)", "O(b^(C*/ε))", "O(bm)", "O(bd)"]].map(r => r.map(c => c.replace(/\^\(([^)]+)\)/, "<sup>$1</sup>").replace(/\^(\w)/, "<sup>$1</sup>"))), { fontSize: 34, fontFamily: "JBM,Noto Sans KR" });
  const fn = at(root, 220, 560, "", "¹ b 유한 · ² 비용 ≥ ε > 0 · ³ 행동 비용이 모두 같을 때", { fontSize: 23, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap" });
  const T2 = tbl(root, 220, 210, [260, 380, 300, 340], [["", "프런티어", "꺼내는 기준", "목표 검사"], ["BFS", "FIFO 큐", "얕은 것", "만들 때"], ["UCS", "우선순위 큐", "g(n)", "꺼낼 때"], ["DFS", "LIFO 스택", "깊은 것", "꺼낼 때"], ["IDS", "스택 + 깊이 한계", "깊은 것", "꺼낼 때"], ["Greedy (3-4)", "우선순위 큐", "h(n)", "꺼낼 때"], ["A* (3-4)", "우선순위 큐", "g(n) + h(n)", "꺼낼 때"]], { fontSize: 32 });
  return t => {
    const o2 = K(t, B[3], 0.5);
    S(T.el, { o: K(t, 0.3, 0.5) * (1 - o2) }); T.R.forEach((r, i) => T.row(i, K(t, i < 3 ? B[0] + 0.5 + i * 0.4 : B[2] + (i - 3) * 0.8, 0.4)));
    T.R[1].concat(T.R[2]).forEach(d => d.style.background = t > B[1] && t < B[2] ? "rgba(48,209,88,.08)" : "");
    T.R[4][3].style.color = T.R[4][4].style.color = t > B[2] + 2 ? COL.fr : "";
    S(fn, { o: K(t, B[1], 0.5) * (1 - o2) });
    S(T2.el, { o: o2 }); T2.R.forEach((r, i) => T2.row(i, K(t, i < 5 ? B[3] + 0.5 + i * 0.5 : B[5] + (i - 5) * 0.8, 0.4)));
    [5, 6].forEach(i => T2.R[i].forEach(d => d.style.color = COL.path));
    T2.R.slice(1).forEach(r => r[1].style.color = t > B[4] ? COL.gold : "");
  };
});

/* --- grid BFS vs DFS --- */
sc(3, "격자에서: BFS vs DFS", [
  "격자 미로에서 비교해 보자. 같은 시작(파랑), 같은 목표(빨강), 회색은 벽",
  ["BFS는 시작점에서 **동심원처럼** 퍼진다 — 모든 방향을 공평하게", 6],
  ["DFS는 한 방향으로 **깊이 파고들다** 막히면 되돌아온다", 6],
  `BFS: ${GT.bfs.steps}개 확장, 경로 **${GT.bfs.cost}**칸(최단) · DFS: ${GT.dfs.steps}개 확장, 경로 **${GT.dfs.cost}**칸 — 덜 봤지만 길이 훨씬 길다`,
], (root, B) => {
  const A = gridView(root, 110, 230, 26, `<span style="color:${COL.fr}">BFS</span> · 큐`, GT.bfs), D = gridView(root, 990, 230, 26, `<span style="color:#bf5af2">DFS</span> · 스택`, GT.dfs, "#bf5af2");
  return t => {
    vis(A.wrap, t, 0.2, null); vis(D.wrap, t, 0.4, null);
    const run = (G, tr, a, d) => { const k = clamp((t - a) / d) * tr.steps; G.draw(k, K(t, a + d + 0.2, 1.2)); htm(G.cnt, `확장 ${Math.floor(k)}` + (k >= tr.steps ? ` · 경로 <b style="color:${COL.path}">${tr.cost}</b>` : "")); };
    run(A, GT.bfs, B[1] + 0.3, 7); run(D, GT.dfs, B[1] + 0.3, 7);
  };
});
