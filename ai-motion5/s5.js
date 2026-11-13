"use strict";
/* ===================== AI 5장 — CSP 모션 강의 ===================== */
const RGB = { red: "#ff453a", green: "#30d158", blue: "#0a84ff" };
const KO = { red: "빨강", green: "초록", blue: "파랑" };
/* stylised Australia (map space) */
const AUS = {
  WA: [[210, 330], [420, 250], [440, 260], [440, 700], [330, 760], [230, 700], [200, 560]],
  NT: [[440, 260], [520, 220], [600, 250], [600, 480], [440, 480]],
  SA: [[440, 480], [640, 480], [640, 700], [560, 660], [520, 720], [440, 700]],
  Q: [[600, 250], [640, 150], [700, 300], [800, 420], [820, 520], [640, 520], [640, 480], [600, 480]],
  NSW: [[640, 520], [820, 520], [800, 640], [700, 660], [640, 640]],
  V: [[640, 640], [700, 660], [760, 650], [700, 710], [640, 700]],
  T: [[680, 760], [740, 760], [730, 810], [690, 810]],
};
const AUSC = { WA: [320, 520], NT: [520, 360], SA: [540, 590], Q: [720, 410], NSW: [730, 585], V: [695, 680], T: [710, 785] };
const ADJ = [["WA", "NT"], ["WA", "SA"], ["NT", "SA"], ["NT", "Q"], ["SA", "Q"], ["SA", "NSW"], ["SA", "V"], ["Q", "NSW"], ["NSW", "V"]];
const SOL = { WA: "red", NT: "green", Q: "red", NSW: "green", V: "red", SA: "blue", T: "green" };
function ausMap(root, ox, oy, sc = 1) {
  const svg = svgLayer(root), P = {};
  for (const k in AUS) {
    const d = "M" + AUS[k].map(([x, y]) => (ox + x * sc).toFixed(1) + " " + (oy + y * sc).toFixed(1)).join(" L") + " Z";
    P[k] = sv(svg, "path", { d, fill: "rgba(255,255,255,.05)", stroke: "rgba(255,255,255,.55)", "stroke-width": 3, "stroke-linejoin": "round" });
  }
  const L = {}; for (const k in AUSC) L[k] = at(root, ox + AUSC[k][0] * sc, oy + AUSC[k][1] * sc, "", k, { fontSize: Math.round(30 * sc), fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }, true);
  return {
    svg, P, L,
    fill(k, col, a = 0.85) { const v = col ? `color-mix(in srgb, ${col} ${Math.round(a * 100)}%, transparent)` : "rgba(255,255,255,.05)"; if (P[k]._f !== v) { P[k].setAttribute("fill", v); P[k]._f = v; } },
    stroke(k, col, w = 3) { const v = (col || "rgba(255,255,255,.55)") + w; if (P[k]._s !== v) { P[k].setAttribute("stroke", col || "rgba(255,255,255,.55)"); P[k].setAttribute("stroke-width", w); P[k]._s = v; } },
    op(o) { S(svg, { o }); for (const k in L) S(L[k], { o }); },
  };
}
const card = (root, x, y, w, hh, html, c) => at(root, x, y, "cardx", html, Object.assign({ width: w, height: hh, padding: "22px 28px", fontSize: 28, lineHeight: 1.5 }, c || {}));
const tag = (root, x, y, s, col, c) => at(root, x, y, "", s, Object.assign({ fontSize: 24, fontWeight: 800, color: "#000", background: col, borderRadius: 999, padding: "4px 16px", whiteSpace: "nowrap" }, c || {}), true);
const big = (root, x, y, s, fs, c) => at(root, x, y, "", s, Object.assign({ fontSize: fs || 44, fontWeight: 800, whiteSpace: "nowrap" }, c || {}), true);
const fx = (root, x, y, s, fs, c) => at(root, x, y, "fx", s, Object.assign({ fontSize: fs || 34, whiteSpace: "nowrap" }, c || {}), true);

/* ===================== OPENING ===================== */
add({
  ch: 0, name: "오프닝", dur: 14, hud: false, fadeIn: false,
  caps: [[6.2, 13.4, "3장은 '어떻게 가나(경로)'를 찾았다면, 5장은 '무엇으로 채우나(값)'를 찾습니다"]],
  build(root) {
    const R = rng(5), cells = [];
    for (let i = 0; i < 36; i++) { const x = 180 + (i % 9) * 195, y = 170 + Math.floor(i / 9) * 190; cells.push([x + (R() - 0.5) * 40, y + (R() - 0.5) * 40, R()]); }
    const vars = cells.map(([x, y, r]) => at(root, x, y, "gn", "?", { width: 74, height: 74, fontSize: 34, opacity: 0.0 }, true));
    const tt = big(root, 960, 450, "제약 충족 문제", 150, { fontWeight: 900, letterSpacing: "-.045em" });
    tt.classList.add("grad");
    const sub = big(root, 960, 600, '인공지능입문 5장 · <b style="color:#fff">Constraint Satisfaction Problems</b>', 40, { fontWeight: 500, color: "rgba(255,255,255,.62)" });
    const vals = ["R", "G", "B", "1", "7", "4", "0", "Q"];
    return t => {
      vars.forEach((v, i) => {
        const a = 0.2 + cells[i][2] * 1.6; pop(v, t, a);
        const filled = t > 2.6 + cells[i][2] * 2.4;
        txt(v, filled ? vals[i % vals.length] : "?");
        nst(v, filled ? (i % 3 === 0 ? "fr" : i % 3 === 1 ? "ex" : "st") : "");
        S(v, { o: clamp((t - a) * 2) * (1 - K(t, 4.8, 1.0)) * 0.9 + K(t, 4.8, 1.0) * 0.22 });
      });
      blurIn(tt, t, 3.6, 1.2); rise(sub, t, 4.6);
    };
  },
});

/* ===================== PART 1 ===================== */
chTitle(1, ["계획 vs 식별", "블랙박스 vs 분해형 상태", "CSP = (X, D, C)", "형식적 표현 언어"]);

sc(1, "계획 문제 vs 식별 문제", [
  "탐색 문제는 두 종류입니다. 왼쪽 **계획(planning)** 문제: 답은 **행동의 순서**, 즉 경로",
  "경로에 비용과 깊이가 있고, 휴리스틱이 길잡이가 됩니다 — 3장의 루마니아 길 찾기",
  "오른쪽 **식별(identification)** 문제: 답은 **변수에 넣을 값**. 어떻게 도달했는지는 상관없어요",
  "변수가 n개면 어떤 순서로 정하든 n번 배정하면 끝 → 모든 해가 **같은 깊이 n**",
  "**CSP는 식별 문제의 특수한 한 종류**입니다",
], (root, B) => {
  const l1 = at(root, 470, 170, "lab", "PLANNING · 계획", {}, true), l2 = at(root, 1450, 170, "lab", "IDENTIFICATION · 식별", {}, true);
  const svg = svgLayer(root);
  const pts = [[160, 620], [330, 420], [520, 560], [640, 330], [790, 460]];
  const N = pts.map(([x, y], i) => gnode(root, x, y, i === 0 ? "S" : i === 4 ? "G" : "", 30));
  const E2 = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 3], [0, 2]].map(([a, b]) => [a, b, gedge(svg, root, N[a], N[b], { w: 3 })]);
  const cost = big(root, 470, 760, "답 = S → ● → ● → G (경로)", 34, { color: COL.path });
  const names = ["X₁", "X₂", "X₃", "X₄"], vals = ["3", "1", "4", "2"];
  const V = names.map((n, i) => { const e = at(root, 1210 + i * 160, 420, "gn", "?", { width: 120, height: 120, borderRadius: 26, fontSize: 52 }, true); e.lb = big(root, 1210 + i * 160, 525, n, 30, { color: "rgba(255,255,255,.6)" }); return e; });
  const ans = big(root, 1450, 640, "답 = {X₁=3, X₂=1, X₃=4, X₄=2} (값 배정)", 32, { color: COL.fr });
  const dep = big(root, 1450, 760, "깊이 = 변수 개수 n = 4", 34, { color: COL.gold });
  const csp = big(root, 960, 810, "CSP ⊂ 식별 문제", 54, { fontWeight: 900 }); csp.classList.add("grad");
  return t => {
    vis(l1, t, 0.2, null); N.forEach((n, i) => pop(n, t, 0.4 + i * 0.12)); E2.forEach(([a, b, e], i) => e.set(K(t, 0.6 + i * 0.1, 0.4)));
    const path = [0, 1, 3, 4]; const pp = clamp((t - B[0] - 1.5) / 3) * 3;
    path.forEach((k, i) => nst(N[k], i <= pp ? "path" : k === 0 ? "st" : k === 4 ? "goal" : ""));
    E2.forEach(([a, b, e]) => { const on = (a === 0 && b === 1 && pp > 0.5) || (a === 1 && b === 3 && pp > 1.5) || (a === 3 && b === 4 && pp > 2.5); e.set(1, on ? COL.path : "rgba(255,255,255,.3)", 1, on ? 6 : 3); });
    vis(cost, t, B[1] + 0.5, null);
    vis(l2, t, B[2], null);
    V.forEach((v, i) => { pop(v, t, B[2] + 0.2 + i * 0.1); vis(v.lb, t, B[2] + 0.3 + i * 0.1, null); const f = t > B[2] + 1.6 + i * 0.6; txt(v, f ? vals[i] : "?"); nst(v, f ? "fr" : ""); });
    vis(ans, t, B[2] + 4.2, null); vis(dep, t, B[3], null);
    blurIn(csp, t, B[4]);
  };
});

sc(1, "알고리즘이 보는 상태", [
  "같은 진공청소기 상태를 사람이 보면: '청소기는 왼쪽, 왼쪽 칸은 깨끗, 오른쪽은 더러움'",
  "그런데 3~4장의 탐색 알고리즘에게 이 상태는 그냥 **5**라는 이름표 — **블랙박스**입니다",
  "알고리즘이 할 수 있는 건 함수 호출뿐: `ACTIONS(5)` → [Suck, Right, Left], `RESULT(5, Right)` → 6, `IS_GOAL(5)` → 아니오",
  "왜 그런 답이 나오는지는 모릅니다. 그래서 목표 검사도 후속 함수도 **아무 함수**나 될 수 있죠",
  "CSP는 상태를 **변수 = 값**으로 쪼개 둡니다(분해형, factored). 알고리즘이 **상태 안을 읽을 수 있어요**",
  "그래서 'A칸 변수 때문에 막혔다'를 알 수 있고 → 더 강력한 **범용 알고리즘**이 가능해집니다",
  ["정리: 4장은 **환경**을 어렵게 바꿨고, 5장은 환경은 3장 그대로 두고 **상태 표현**을 바꿉니다", 6.5],
], (root, B) => {
  const room = card(root, 160, 200, 520, 280, "", { padding: 0 });
  const ra = h(room, "ab", "", { left: 20, top: 20, width: 230, height: 240, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "2px solid rgba(255,255,255,.2)" });
  const rb = h(room, "ab", "", { left: 270, top: 20, width: 230, height: 240, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "2px solid rgba(255,255,255,.2)" });
  h(ra, "ab", "🤖", { left: 80, top: 60, fontSize: 70 }); h(rb, "ab", "🟤🟤", { left: 70, top: 150, fontSize: 38 });
  h(ra, "ab", "A", { left: 14, top: 8, fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,.5)" }); h(rb, "ab", "B", { left: 14, top: 8, fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,.5)" });
  const human = big(root, 420, 540, "👀 사람: \"청소기 A · A 깨끗 · B 더러움\"", 30, { color: "rgba(255,255,255,.85)" });
  const bb = at(root, 1190, 340, "", '<div style="font-size:120px;font-weight:900;font-family:JBM,monospace">5</div><div style="font-size:22px;color:rgba(255,255,255,.5);margin-top:-6px">state</div>', { width: 300, height: 260, borderRadius: 30, background: "#0b0b10", border: "3px solid rgba(255,255,255,.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }, true);
  const bbl = tag(root, 1190, 170, "BLACK BOX", "#ffd479");
  const calls = [["ACTIONS(5)", "[Suck, Right, Left]"], ["RESULT(5, Right)", "6"], ["IS_GOAL(5)", "False"]].map(([a, b], i) => at(root, 900, 520 + i * 70, "fx", `<span style="color:#6bdfff">${a}</span> <span style="color:rgba(255,255,255,.4)">→</span> <span style="color:#ffd479">${b}</span>`, { fontSize: 28, whiteSpace: "nowrap" }));
  const q = big(root, 1190, 780, "왜? → 모름 🤷", 38, { color: COL.warn });
  const fac = at(root, 1190, 340, "", "", { width: 520, height: 300, display: "flex", flexDirection: "column", gap: "14px", justifyContent: "center" }, true);
  const rows = [["위치", "A"], ["A칸", "깨끗"], ["B칸", "더러움"]].map(([k, v]) => { const r = h(fac, "", `<span style="color:rgba(255,255,255,.55)">${k}</span><span style="margin-left:auto;color:#30d158">${v}</span>`, { display: "flex", fontSize: 40, fontWeight: 800, padding: "14px 26px", borderRadius: 16, background: "rgba(48,209,88,.12)", border: "2px solid rgba(48,209,88,.55)" }); S(r, { o: 0 }); return r; });
  const facl = tag(root, 1190, 170, "FACTORED · 분해형", COL.fr);
  const blame = big(root, 1190, 650, "\"B칸 = 더러움 때문에 아직 목표가 아님\"", 30, { color: COL.fr });
  const tb = tbl(root, 330, 520, [300, 420, 540], [["", "알고리즘이 상태를 읽나", "환경"], ["3장", "✗ 블랙박스", "완전 관찰 · 결정적 · 알려짐"], ["4장", "✗", "비결정 · 부분 관찰 · 모름"], ["<b style='color:#bf5af2'>5장 CSP</b>", "<b style='color:#30d158'>✓ 읽는다</b>", "3장과 같음"]], { fontSize: 34 });
  return t => {
    vis(room, t, 0.2, B[6] - 0.3); vis(human, t, 0.8, B[6] - 0.3);
    const outBB = K(t, B[4], 0.6, E.io3);
    S(bb, { o: K(t, B[1], 0.7) * (1 - outBB), s: lerp(0.8, 1, K(t, B[1], 0.8, E.ob)) * (1 - outBB * 0.3), b: outBB * 10 });
    S(bbl, { o: K(t, B[1] + 0.3, 0.5) * (1 - outBB) });
    calls.forEach((c, i) => vis(c, t, B[2] + 0.4 + i * 0.9, B[4]));
    vis(q, t, B[3], B[4]);
    S(facl, { o: K(t, B[4] + 0.3, 0.5) * (1 - K(t, B[6] - 0.4, 0.4)) });
    S(fac, { o: 1 }); rows.forEach((r, i) => vis(r, t, B[4] + 0.4 + i * 0.25, B[6] - 0.4, { dy: 20 }));
    const bl = t > B[5] && t < B[6]; setBg(rows[2], bl ? "rgba(255,214,10,.22)" : "rgba(48,209,88,.12)"); setBd(rows[2], bl ? COL.cur : "rgba(48,209,88,.55)");
    vis(blame, t, B[5] + 0.3, B[6] - 0.4);
    S(tb.el, { o: K(t, B[6], 0.6) }); tb.R.forEach((r, i) => tb.row(i, K(t, B[6] + 0.2 + i * 0.3, 0.6)));
    S(tb.el, { o: K(t, B[6], 0.6), y: 0 });
  };
});

sc(1, "CSP = (변수, 도메인, 제약)", [
  "CSP는 세 가지로 정의합니다. ① **변수(variables)** X₁ … Xₙ: 값을 채워야 하는 칸들",
  "② **도메인(domain)** D: 각 변수가 가질 수 있는 값의 집합. 변수마다 다를 수도 있어요(Dᵢ)",
  "③ **제약(constraints)** C: '이 변수들은 이런 값 조합만 허용' — 이것이 곧 **목표 검사**",
  "**해** = 모든 변수에 값이 있고(**완전 배정**) + 모든 제약을 만족(**일관성**)",
  "정해진 문법이 있으니 하나의 **언어** — '**형식적 표현 언어**(formal representation language)'",
  "어떤 문제든 이 문법으로 쓰면, **하나의 범용 알고리즘**을 모든 문제에 적용할 수 있습니다",
], (root, B) => {
  const f = fx(root, 960, 200, "CSP = ( X , D , C )", 86, {});
  const cs = [["X", "변수", "X₁, X₂, …, Xₙ", "#bf5af2"], ["D", "도메인", "D = {빨강, 초록, 파랑}", "#64d2ff"], ["C", "제약", "WA ≠ NT, …", "#ff9f0a"]].map(([k, n, ex, c], i) =>
    at(root, 440 + i * 520, 470, "", `<div style="font:900 74px JBM,monospace;color:${c}">${k}</div><div style="font-size:38px;font-weight:800;margin-top:4px">${n}</div><div style="font-size:26px;color:rgba(255,255,255,.65);margin-top:12px;font-family:JBM,'Noto Sans KR',monospace">${ex}</div>`, { width: 440, height: 280, borderRadius: 28, background: "rgba(255,255,255,.05)", border: `2px solid ${c}`, textAlign: "center", paddingTop: 34 }, true));
  const gt = big(root, 1480, 660, "= 목표 검사", 32, { color: "#ff9f0a" });
  const sol = at(root, 960, 750, "", '해 = <b style="color:#30d158">완전 배정</b> + <b style="color:#30d158">모든 제약 만족</b>', { fontSize: 46, fontWeight: 800, whiteSpace: "nowrap" }, true);
  const lang = at(root, 960, 750, "", '문법이 있으면 → <b class="grad">언어</b> → 범용 알고리즘 하나로 모든 CSP', { fontSize: 46, fontWeight: 800, whiteSpace: "nowrap" }, true);
  return t => {
    blurIn(f, t, 0.2);
    cs.forEach((c, i) => { const q = K(t, B[i] + 0.2, 0.7, E.o5); S(c, { o: q, y: (1 - q) * 60, b: (1 - q) * 8 }); glow2(c, t > B[i] && t < B[i + 1] ? 1 : 0, ["#bf5af2", "#64d2ff", "#ff9f0a"][i]); });
    vis(gt, t, B[2] + 1.2, null);
    vis(sol, t, B[3], B[4]); vis(lang, t, B[4] + 0.4, null);
  };
});

/* ===================== PART 2 ===================== */
chTitle(2, ["변수 7개", "도메인 3색", "인접 = 다른 색", "암묵적 vs 명시적", "해 확인하기"]);

sc(2, "지도 색칠 정식화", [
  "호주 지도를 세 가지 색으로 칠하되, **국경을 맞댄 지역은 다른 색**이어야 합니다",
  "**변수**: 지역마다 하나 — WA, NT, Q, NSW, V, SA, T (7개)",
  "**도메인**: 모든 변수가 {빨강, 초록, 파랑} 중 하나",
  "**제약**: 인접한 두 지역은 다른 색. 맞닿은 쌍을 세면 WA–NT, WA–SA, NT–SA … 모두 **9쌍**",
  "SA는 다섯 지역과 붙어 있어 제약이 가장 많고, **T(태즈메이니아)는 섬**이라 제약이 하나도 없어요",
], (root, B) => {
  const M = ausMap(root, 80, 60, 1.05);
  const vl = at(root, 1060, 200, "", "", { width: 760, display: "flex", flexWrap: "wrap", gap: "12px" });
  const vs = Object.keys(AUSC).map(k => { const e = h(vl, "gn", k, { width: 96, height: 72, borderRadius: 18, fontSize: 28 }); S(e, { o: 0 }); return e; });
  const vlab = at(root, 1060, 160, "lab", "VARIABLES · 변수", {});
  const dl = at(root, 1060, 340, "lab", "DOMAIN · 도메인", {});
  const dom = ["red", "green", "blue"].map((c, i) => at(root, 1060 + i * 190, 380, "", KO[c], { width: 170, height: 64, borderRadius: 999, background: RGB[c], color: "#000", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }));
  const cl = at(root, 1060, 500, "lab", "CONSTRAINTS · 제약 (인접 = 다른 색)", {});
  const pairs = at(root, 1060, 540, "", "", { width: 780, display: "flex", flexWrap: "wrap", gap: "10px" });
  const ps = ADJ.map(([a, b]) => { const e = h(pairs, "fx", `${a} ≠ ${b}`, { fontSize: 26, padding: "8px 16px", borderRadius: 12, background: "rgba(255,159,10,.12)", border: "2px solid rgba(255,159,10,.6)" }); S(e, { o: 0 }); return e; });
  const cnt = big(root, 1450, 760, "9쌍", 60, { color: "#ff9f0a", fontWeight: 900 });
  const svg2 = svgLayer(root);
  const lines = ADJ.map(([a, b]) => sv(svg2, "line", { x1: 80 + AUSC[a][0] * 1.05, y1: 60 + AUSC[a][1] * 1.05, x2: 80 + AUSC[b][0] * 1.05, y2: 60 + AUSC[b][1] * 1.05, stroke: "#ff9f0a", "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }));
  return t => {
    M.op(K(t, 0.1, 0.8));
    S(vl, { o: 1 }); S(pairs, { o: 1 });
    vis(vlab, t, B[1], null); vs.forEach((v, i) => pop(v, t, B[1] + 0.3 + i * 0.12));
    for (const k in AUS) M.stroke(k, t > B[1] && t < B[2] ? "#bf5af2" : null, t > B[1] && t < B[2] ? 5 : 3);
    vis(dl, t, B[2], null); dom.forEach((d, i) => pop(d, t, B[2] + 0.3 + i * 0.15));
    vis(cl, t, B[3], null);
    ps.forEach((p, i) => vis(p, t, B[3] + 0.5 + i * 0.3, null, { dy: 14 }));
    lines.forEach((l, i) => { const q = K(t, B[3] + 0.5 + i * 0.3, 0.4); l.setAttribute("opacity", (q * 0.9).toFixed(2)); });
    vis(cnt, t, B[3] + 3.6, null);
    const hi = t > B[4];
    for (const k in AUS) M.fill(k, hi && k === "SA" ? "#ff9f0a" : hi && k === "T" ? "#64d2ff" : null, 0.45);
    lines.forEach((l, i) => { const sa = ADJ[i].includes("SA"); l.setAttribute("stroke-width", hi && sa ? 9 : 5); });
  };
});

sc(2, "암묵적 vs 명시적 제약", [
  "같은 제약 'WA와 NT는 다른 색'을 쓰는 방법이 두 가지 있습니다",
  "**암묵적(implicit)**: 코드 한 조각 `WA ≠ NT` — 짧고 읽기 쉬움",
  "**명시적(explicit)**: 허용되는 (WA, NT) 값 쌍을 **전부 나열**한 목록",
  "3색이면 가능한 쌍은 3 × 3 = 9개. 그중 같은 색 쌍 3개를 빼면 → **허용 쌍 6개**",
  "명시적 목록은 길지만, 어떤 제약이든 **'표에 있나?'** 하나로 검사할 수 있다는 장점이 있어요",
], (root, B) => {
  const im = card(root, 140, 220, 620, 300, "", {});
  const iml = tag(root, 450, 210, "IMPLICIT · 암묵적", "#64d2ff");
  const code = fx(root, 450, 370, "WA ≠ NT", 96, { color: "#6bdfff" });
  const ex = card(root, 900, 220, 880, 560, "", {});
  const exl = tag(root, 1340, 210, "EXPLICIT · 명시적", "#ff9f0a");
  const hdr = fx(root, 1340, 290, "(WA, NT) ∈ {", 34, { color: "rgba(255,255,255,.75)" });
  const cs = ["red", "green", "blue"], P = [];
  cs.forEach((a, i) => cs.forEach((b, j) => {
    const x = 1060 + j * 280, y = 380 + i * 110;
    const e = at(root, x, y, "", `<span style="display:inline-block;width:46px;height:46px;border-radius:12px;background:${RGB[a]}"></span><span style="font:700 30px JBM,monospace;color:rgba(255,255,255,.6)">,</span><span style="display:inline-block;width:46px;height:46px;border-radius:12px;background:${RGB[b]}"></span>`, { display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", borderRadius: 16, border: "2px solid rgba(255,255,255,.15)" }, true);
    e.same = a === b; P.push(e);
  }));
  const end = fx(root, 1340, 720, "}", 34, { color: "rgba(255,255,255,.75)" });
  const n = big(root, 450, 640, "9 − 3 = 6쌍 허용", 50, { color: "#ff9f0a", fontWeight: 900 });
  const lk = big(root, 450, 760, "검사 = \"이 쌍이 표에 있나?\"", 34, { color: "rgba(255,255,255,.8)" });
  return t => {
    vis(im, t, B[1] - 0.2, null); vis(iml, t, B[1], null); blurIn(code, t, B[1] + 0.3);
    vis(ex, t, B[2] - 0.2, null); vis(exl, t, B[2], null); vis(hdr, t, B[2] + 0.2, null); vis(end, t, B[2] + 0.4, null);
    P.forEach((p, i) => { pop(p, t, B[2] + 0.4 + i * 0.15); const x = p.same && t > B[3] + 1.0; S(p, { o: x ? 0.25 + 0.75 * (1 - K(t, B[3] + 1.0, 0.6)) : clamp((t - B[2] - 0.4 - i * 0.15) * 2.5) }); setBd(p, x ? COL.warn : t > B[3] + 1.6 && !p.same ? COL.fr : "rgba(255,255,255,.15)"); });
    vis(n, t, B[3] + 1.8, null); vis(lk, t, B[4], null);
  };
});

sc(2, "해 확인하기", [
  "슬라이드의 해를 하나씩 칠해 보며 제약을 검사해 봅시다",
  ["WA = 빨강, NT = 초록 → WA ≠ NT ✓. 이어서 SA = 파랑 → WA ≠ SA ✓, NT ≠ SA ✓", 6.5],
  ["Q = 빨강, NSW = 초록, V = 빨강 — 칠할 때마다 붙은 간선을 확인: 모두 ✓", 6],
  "T는 아무와도 붙어 있지 않으니 아무 색이나 OK → 초록",
  "만약 NSW를 빨강으로 바꾸면? **Q = NSW**, **NSW = V** 모두 빨강 → 제약 위반 ✗ → 해가 아닙니다",
  "**모든 변수에 값이 있고 + 9개 제약이 전부 ✓** → 이것이 해(solution)",
], (root, B) => {
  const M = ausMap(root, 60, 60, 1.05);
  const order = ["WA", "NT", "SA", "Q", "NSW", "V", "T"];
  const when = { WA: B[1] + 0.3, NT: B[1] + 1.6, SA: B[1] + 3.4, Q: B[2] + 0.3, NSW: B[2] + 1.6, V: B[2] + 3.0, T: B[3] + 0.6 };
  const panel = at(root, 1000, 180, "", "", { width: 820, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" });
  const ck = ADJ.map(([a, b]) => { const e = h(panel, "fx", `${a} ≠ ${b} <span>·</span>`, { fontSize: 28, padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.15)", whiteSpace: "nowrap" }); e.ab = [a, b]; return e; });
  const asg = at(root, 1000, 560, "", "", { width: 820, display: "flex", flexWrap: "wrap", gap: "10px" });
  const chips = order.map(k => { const e = h(asg, "", `${k} = ?`, { fontSize: 28, fontWeight: 800, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,.06)", border: "2px solid rgba(255,255,255,.2)", whiteSpace: "nowrap" }); e.k = k; return e; });
  const verdict = big(root, 1410, 800, "", 46, { fontWeight: 900 });
  return t => {
    M.op(K(t, 0.1, 0.8)); vis(panel, t, 0.4, null); vis(asg, t, 0.6, null);
    const bad = t > B[4] && t < B[5];
    const col = {}; order.forEach(k => { if (t > when[k]) col[k] = SOL[k]; });
    if (bad) col.NSW = "red";
    for (const k in AUS) { M.fill(k, col[k] ? RGB[col[k]] : null, 0.8); M.stroke(k, bad && (k === "NSW" || k === "Q") ? "#fff" : null, bad && (k === "NSW" || k === "Q") ? 7 : 3); }
    chips.forEach(c => { const v = col[c.k]; htm(c, v ? `${c.k} = <span style="color:${RGB[v]}">${KO[v]}</span>` : `${c.k} = ?`); setBd(c, v ? RGB[v] : "rgba(255,255,255,.2)"); });
    let allOk = true;
    ck.forEach(e => {
      const [a, b] = e.ab; const done = col[a] && col[b]; const ok = done && col[a] !== col[b];
      if (!ok) allOk = false;
      htm(e, `${a} ≠ ${b} ${done ? (ok ? '<span style="color:#30d158">✓</span>' : '<span style="color:#ff453a">✗</span>') : '<span style="color:rgba(255,255,255,.3)">·</span>'}`);
      setBd(e, done ? (ok ? "rgba(48,209,88,.8)" : COL.warn) : "rgba(255,255,255,.15)"); setBg(e, done && !ok ? "rgba(255,69,58,.25)" : done ? "rgba(48,209,88,.1)" : "rgba(255,255,255,.05)");
    });
    if (bad) { htm(verdict, '<span style="color:#ff453a">✗ 제약 위반 2개 → 해가 아님</span>'); S(verdict, { o: 1 }); }
    else if (t > B[5]) { htm(verdict, '<span style="color:#30d158">완전 배정 + 9/9 ✓ = 해</span>'); S(verdict, { o: K(t, B[5], 0.5) }); }
    else S(verdict, { o: 0 });
  };
});

/* ===================== PART 3 ===================== */
chTitle(3, ["정식화 1: 칸마다 변수", "정식화 2: 퀸마다 변수", "정식화 3: 행마다 퀸", "해의 구조를 문제 구조에"]);

function board(root, x, y, cs, n = 4) {
  const cells = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const e = at(root, x + j * cs, y + i * cs, "", "", { width: cs, height: cs, background: (i + j) % 2 ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(cs * 0.5), fontWeight: 900, fontFamily: "JBM,monospace" });
    e.i = i; e.j = j; cells.push(e);
  }
  return { cells, at: (i, j) => cells[i * n + j] };
}
const QPOS = [[0, 1], [1, 3], [2, 0], [3, 2]]; // row, col (slide board)

sc(3, "정식화 1: 칸마다 변수", [
  "4×4 판에 서로 공격하지 않는 퀸 4개 놓기. 첫 번째 방법: **판의 칸 하나하나를 변수**로",
  "**변수 Xᵢⱼ** = i행 j열 칸 (16개), **도메인 {0, 1}** — 1이면 퀸이 있고 0이면 없음",
  ["**제약**: 같은 행 · 같은 열 · 두 대각선에 있는 두 칸은 (0,0), (0,1), (1,0)만 허용 → **(1,1)만 금지**", 7],
  "예: X₁₂ = 1이면 같은 행, 같은 열, 대각선 칸은 전부 0이어야 해요",
  "그런데 함정: **모든 칸이 0**이어도 쌍 제약은 전부 통과! 퀸이 하나도 없는데 말이죠",
  "그래서 **Σ Xᵢⱼ = N** (퀸이 정확히 N개)을 따로 붙여야 합니다 — 판 전체(N² 칸)에 걸친 제약",
  "쌍 제약 4줄은 허용 쌍을 나열했으니 **명시적**, Σ = N은 식으로 쓴 **암묵적** 제약. 경우의 수는 2¹⁶ = **65,536**",
], (root, B) => {
  const bd = board(root, 200, 200, 130);
  const vlab = bd.cells.map(c => { const e = h(c, "", `X<sub style="font-size:.5em">${c.i + 1}${c.j + 1}</sub>`, { fontSize: 34, color: "rgba(255,255,255,.55)" }); return e; });
  const F = fx(root, 1300, 230, "(Xᵢⱼ, Xₖₗ) ∈ {(0,0), (0,1), (1,0)}", 40, {});
  const lines = [["같은 행", "(Xᵢⱼ, Xᵢₖ)"], ["같은 열", "(Xᵢⱼ, Xₖⱼ)"], ["↘ 대각선", "(Xᵢⱼ, Xᵢ₊ₖ,ⱼ₊ₖ)"], ["↙ 대각선", "(Xᵢⱼ, Xᵢ₊ₖ,ⱼ₋ₖ)"]].map(([a, b], i) => at(root, 1000, 290 + i * 58, "", `<b style="color:#ff9f0a;display:inline-block;width:150px">${a}</b><span style="font-family:JBM,monospace">${b}</span>`, { fontSize: 30, whiteSpace: "nowrap" }));
  const ban = big(root, 1300, 575, "(1, 1) 금지 = 둘 다 퀸 ✗", 40, { color: COL.warn });
  const zero = big(root, 1300, 575, "전부 0 → 모든 쌍 제약 통과?!", 42, { color: COL.gold });
  const sum = at(root, 1300, 685, "fx", "Σ Xᵢⱼ = N", { fontSize: 70, padding: "10px 40px", border: "4px solid #64d2ff", borderRadius: 18, whiteSpace: "nowrap" }, true);
  const cnt = big(root, 1300, 805, "", 40, {});
  return t => {
    bd.cells.forEach((c, k) => pop(c, t, 0.2 + k * 0.03));
    const ex1 = t > B[3] && t < B[4];
    const all0 = t > B[4] && t < B[5];
    bd.cells.forEach((c, k) => {
      const v = t < B[1] ? null : all0 ? 0 : ex1 ? (c.i === 0 && c.j === 1 ? 1 : (c.i === 0 || c.j === 1 || Math.abs(c.i - 0) === Math.abs(c.j - 1)) ? 0 : null) : t > B[5] + 1 ? (QPOS.some(([r, cc]) => r === c.i && cc === c.j) ? 1 : 0) : null;
      htm(vlab[k], v == null ? `X<sub style="font-size:.5em">${c.i + 1}${c.j + 1}</sub>` : v === 1 ? '<span style="color:#ffd60a;font-size:60px">♛</span>' : '<span style="color:rgba(255,255,255,.45)">0</span>');
      const att = ex1 && !(c.i === 0 && c.j === 1) && (c.i === 0 || c.j === 1 || Math.abs(c.i) === Math.abs(c.j - 1));
      c.style.boxShadow = att ? "inset 0 0 0 4px rgba(255,69,58,.8)" : "";
    });
    vis(F, t, B[2], null); lines.forEach((l, i) => vis(l, t, B[2] + 0.5 + i * 0.5, null));
    vis(ban, t, B[2] + 2.8, B[4]); vis(zero, t, B[4] + 0.2, B[6]);
    pop(sum, t, B[5]); glow2(sum, t > B[5] && t < B[6] ? 1 : 0, "#64d2ff");
    vis(cnt, t, B[6] + 1.5, null); htm(cnt, '변수 16개 · 경우의 수 2<sup>16</sup> = <b style="color:#ff9f0a">65,536</b>');
  };
});

sc(3, "정식화 2: 퀸마다 변수", [
  "두 번째 방법: 칸이 아니라 **퀸을 변수**로. **Q₁ … Q₄** = 1번 ~ 4번 퀸",
  "**도메인 {11, 12, …, 44}** = 퀸이 놓일 칸의 '행열' 좌표. 예: Q₁ = 12 → 1행 2열",
  "변수가 정확히 4개라 '퀸이 N개'가 **변수 개수에 들어갔어요** → Σ = N 제약이 **필요 없음**",
  "제약: `non-threatening(Qᵢ, Qⱼ)` (함수 → **암묵적**) 또는 (Qᵢ, Qⱼ) ∈ {(11, 23), (11, 24), …} (나열 → **명시적**)",
  "(11, 23): 행 차이 1, 열 차이 2 → 대각선 아님 → 허용. 하지만 도메인이 16개라 경우의 수는 16⁴ = **65,536** 그대로",
], (root, B) => {
  const bd = board(root, 200, 220, 120);
  bd.cells.forEach(c => h(c, "", `${c.i + 1}${c.j + 1}`, { fontSize: 30, color: "rgba(255,255,255,.4)" }));
  const qs = QPOS.map(([r, c], k) => at(root, 200 + c * 120 + 60, 220 + r * 120 + 60, "", `♛<sub style="font-size:22px;font-family:JBM">${k + 1}</sub>`, { fontSize: 66, color: "#ffd60a", textShadow: "0 0 20px rgba(255,214,10,.6)" }, true));
  const vars = QPOS.map(([r, c], k) => at(root, 1000 + k * 210, 300, "", `<div style="font:800 34px JBM,monospace">Q<sub>${k + 1}</sub></div><div style="font:900 52px JBM,monospace;color:#ffd60a">${r + 1}${c + 1}</div>`, { width: 180, height: 150, borderRadius: 22, background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,214,10,.5)", textAlign: "center", paddingTop: 14 }));
  const dom = big(root, 1410, 520, "도메인 = {11, 12, …, 44} (16개)", 34, { color: "#64d2ff" });
  const sum = at(root, 1410, 640, "fx", "Σ Xᵢⱼ = N", { fontSize: 60, padding: "8px 34px", border: "4px solid #64d2ff", borderRadius: 18, whiteSpace: "nowrap" }, true);
  const xmark = at(root, 1410, 640, "", "✕", { fontSize: 170, color: COL.warn, fontWeight: 900 }, true);
  const imp = fx(root, 1410, 610, "non-threatening(Qᵢ, Qⱼ)", 40, { color: "#6bdfff" });
  const exp = fx(root, 1410, 690, "(Qᵢ, Qⱼ) ∈ {(11,23), (11,24), …}", 36, { color: "#ffd479" });
  const ok = big(root, 1410, 790, "", 32, {});
  const svg = svgLayer(root);
  const a1 = sv(svg, "line", { x1: 260, y1: 280, x2: 500, y2: 400, stroke: "#30d158", "stroke-width": 5, "stroke-dasharray": "10 8", opacity: 0 });
  return t => {
    bd.cells.forEach((c, k) => pop(c, t, 0.2 + k * 0.03));
    qs.forEach((q, k) => pop(q, t, B[0] + 1.2 + k * 0.3));
    vars.forEach((v, k) => { const q = K(t, B[0] + 1.5 + k * 0.3, 0.6, E.o5); S(v, { o: q, y: (1 - q) * 40 }); });
    vis(dom, t, B[1], null);
    pop(sum, t, B[2]); S(sum, { o: clamp((t - B[2]) * 3) * (1 - K(t, B[3] - 0.3, 0.4)) });
    pop(xmark, t, B[2] + 1.2); S(xmark, { o: clamp((t - B[2] - 1.2) * 3) * (1 - K(t, B[3] - 0.3, 0.4)) });
    vis(imp, t, B[3], null); vis(exp, t, B[3] + 2.5, null);
    a1.setAttribute("opacity", t > B[4] ? "1" : "0");
    vis(ok, t, B[4], null); htm(ok, '(11, 23): |1−2| = 1, |1−3| = 2 → 대각선 아님 <b style="color:#30d158">✓</b> · 16<sup>4</sup> = <b style="color:#ff9f0a">65,536</b>');
  };
});

sc(3, "정식화 3: 행마다 퀸 하나", [
  "세 번째, 가장 좋은 방법: **Qₖ = k번째 행에 있는 퀸의 열 번호**",
  "행은 변수 이름에 이미 정해져 있으니, **도메인은 {1, 2, 3, 4}** 열 번호뿐",
  "'행마다 퀸 하나'가 **변수 정의에 들어가서** 같은 행 제약은 아예 쓸 필요가 없어요",
  ["남은 제약 두 개: 같은 열이 아니고 **Qᵢ ≠ Qⱼ**, 대각선도 아님 **|Qᵢ − Qⱼ| ≠ |i − j|**", 7],
  "검사: Q₁ = 2, Q₂ = 4 → 열 다름 ✓, |2 − 4| = 2 ≠ |1 − 2| = 1 → 대각선 아님 ✓",
  "반례: Q₁ = 1, Q₂ = 2 → |1 − 2| = 1 = |1 − 2| = 1 → **대각선 ✗**. 그래서 명시적 목록 {(1,3), (1,4), …}에 (1,2)가 없어요",
  "해: Q₁=2, Q₂=4, Q₃=1, Q₄=3. 경우의 수는 4⁴ = **256** — 앞의 65,536보다 훨씬 작습니다",
], (root, B) => {
  const bd = board(root, 300, 220, 120);
  const rl = [0, 1, 2, 3].map(i => big(root, 240, 280 + i * 120, `Q<sub>${i + 1}</sub>`, 36, { fontFamily: "JBM,monospace" }));
  const cl = [0, 1, 2, 3].map(j => big(root, 360 + j * 120, 190, String(j + 1), 30, { color: "rgba(255,255,255,.5)", fontFamily: "JBM,monospace" }));
  const qq = [0, 1, 2, 3].map(i => at(root, 0, 0, "", "♛", { fontSize: 70, color: "#ffd60a", textShadow: "0 0 20px rgba(255,214,10,.6)" }, true));
  const vars = [0, 1, 2, 3].map(i => at(root, 1000 + i * 210, 230, "", "", { width: 180, height: 140, borderRadius: 22, background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,214,10,.5)", textAlign: "center", paddingTop: 14 }));
  const dom = big(root, 1410, 430, "도메인 = {1, 2, 3, 4}", 38, { color: "#64d2ff" });
  const c1 = fx(root, 1410, 540, "Qᵢ ≠ Qⱼ", 50, { color: "#6bdfff" });
  const c2 = fx(root, 1410, 620, "|Qᵢ − Qⱼ| ≠ |i − j|", 50, { color: "#6bdfff" });
  const chk = big(root, 1410, 715, "", 34, {});
  const fin = big(root, 1410, 800, "", 40, {});
  const svg = svgLayer(root);
  const dg = sv(svg, "line", { x1: 360, y1: 280, x2: 480, y2: 400, stroke: COL.warn, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 });
  return t => {
    bd.cells.forEach((c, k) => pop(c, t, 0.2 + k * 0.03)); rl.forEach((r, i) => vis(r, t, 0.6 + i * 0.15, null)); cl.forEach((c, i) => vis(c, t, B[1] + i * 0.1, null));
    const bad = t > B[5] && t < B[6];
    const cols = bad ? [0, 1, null, null] : t > B[4] && t < B[5] ? [1, 3, null, null] : t > B[6] ? [1, 3, 0, 2] : t > B[0] + 1.5 ? [1, 3, 0, 2] : [null, null, null, null];
    qq.forEach((q, i) => { const c = cols[i]; if (c == null) { S(q, { o: 0 }); return; } q.style.left = (360 + c * 120) + "px"; q.style.top = (280 + i * 120) + "px"; S(q, { o: 1 }); });
    vars.forEach((v, i) => { const q = K(t, B[0] + 1.5 + i * 0.25, 0.6, E.o5); S(v, { o: q, y: (1 - q) * 40 }); const c = cols[i]; htm(v, `<div style="font:800 32px JBM,monospace">Q<sub>${i + 1}</sub></div><div style="font:900 56px JBM,monospace;color:${bad && i < 2 ? "#ff453a" : "#ffd60a"}">${c == null ? "–" : c + 1}</div>`); });
    vis(dom, t, B[1], null); vis(c1, t, B[3] + 0.3, null); vis(c2, t, B[3] + 2.0, null);
    dg.setAttribute("opacity", bad ? "1" : "0");
    vis(chk, t, B[4], null);
    htm(chk, bad ? '|1 − 2| = 1 = |1 − 2| <b style="color:#ff453a">→ 대각선 ✗</b>' : '|2 − 4| = 2 ≠ |1 − 2| = 1 <b style="color:#30d158">→ ✓</b>');
    vis(fin, t, B[6] + 0.5, null); htm(fin, '변수 4개 · 4<sup>4</sup> = <b style="color:#30d158">256</b>가지');
  };
});

sc(3, "세 정식화 비교", [
  "세 정식화를 나란히 놓고 탐색할 경우의 수를 비교해 봅시다 (N = 4)",
  "정식화 1: 2¹⁶ = 65,536 · 정식화 2: 16⁴ = 65,536 · 정식화 3: 4⁴ = **256**",
  "차이는 '**해가 가진 성질을 문제 정의에 얼마나 넣었나**'입니다",
  "정식화 2는 '퀸이 N개'를, 정식화 3은 거기에 '행마다 하나'까지 변수 정의에 넣었죠",
  ["As much as possible, **structure of the solution** is encoded in **structure of the problem** → **better CSP**", 7.5],
], (root, B) => {
  const rows = [["정식화 1", "Xᵢⱼ ∈ {0,1}", 65536, "2¹⁶", "없음 → Σ = N 필요"], ["정식화 2", "Qₖ ∈ {11..44}", 65536, "16⁴", "퀸이 N개"], ["정식화 3", "Qₖ ∈ {1..4}", 256, "4⁴", "퀸 N개 + 행마다 하나"]];
  const bars = rows.map(([n, v, c, f, enc], i) => {
    const y = 250 + i * 170;
    const lb = at(root, 150, y, "", `<div style="font-size:34px;font-weight:900">${n}</div><div style="font:600 24px JBM,monospace;color:rgba(255,255,255,.6)">${v}</div>`, { width: 320 });
    const bar = at(root, 480, y + 10, "", "", { height: 60, width: 1, borderRadius: 12, background: i === 2 ? "#30d158" : "#ff9f0a", transformOrigin: "0 50%" });
    const num = at(root, 500, y + 18, "fx", `${f} = ${c.toLocaleString()}`, { fontSize: 34, whiteSpace: "nowrap" });
    const e = at(root, 480, y + 86, "", "넣은 해의 성질: " + enc, { fontSize: 24, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" });
    return { lb, bar, num, e, w: Math.max(18, Math.log2(c) / 16 * 1150), c };
  });
  const lesson = at(root, 960, 800, "", '해의 구조를 문제의 구조에 담을수록 → <b class="grad">더 좋은 CSP</b>', { fontSize: 50, fontWeight: 900, whiteSpace: "nowrap" }, true);
  const lg = big(root, 1500, 200, "막대 = log₂(경우의 수)", 22, { color: "rgba(255,255,255,.45)" });
  return t => {
    vis(lg, t, B[1], null);
    bars.forEach((b, i) => { vis(b.lb, t, 0.3 + i * 0.2, null); const q = K(t, B[1] + i * 0.6, 1.0, E.o5); S(b.bar, { o: q > 0 ? 1 : 0 }); b.bar.style.width = (b.w * q).toFixed(0) + "px"; b.num.style.left = (500 + b.w * q) + "px"; S(b.num, { o: K(t, B[1] + i * 0.6 + 0.6, 0.4) }); vis(b.e, t, B[3] + i * 0.4, null); });
    blurIn(lesson, t, B[4]);
  };
});

/* ===================== PART 4 ===================== */
chTitle(4, ["노드 = 변수, 간선 = 제약", "태즈메이니아 = 독립 부분 문제", "Binary vs Boolean", "단항 · 이진 · 고차"]);

const GP = { WA: [1180, 420], NT: [1380, 290], Q: [1610, 330], SA: [1400, 500], NSW: [1660, 520], V: [1560, 650], T: [1580, 740] };
sc(4, "지도 → 제약 그래프", [
  "지도 색칠의 제약을 그림으로 그리면 **제약 그래프(constraint graph)**가 됩니다",
  "**노드 = 변수**(지역 7개), **간선 = 제약**(WA–NT 간선 = 'WA ≠ NT'). 국경을 맞댄 쌍이 그대로 간선 9개",
  "그래프를 보면 구조가 한눈에: SA는 간선 5개로 가장 많이 얽혀 있고",
  "**T는 간선이 하나도 없습니다** → 나머지와 상관없는 **독립 부분 문제**",
  ["쪼개서 풀면: 통째로 3⁷ = 2,187 대신 (본토 6개) 3⁶ = 729 + (T) 3 = **732**", 6.5],
  "범용 CSP 알고리즘은 이렇게 **그래프 구조를 이용해 속도를 높입니다**",
], (root, B) => {
  const M = ausMap(root, 60, 60, 1.0);
  const svg = svgLayer(root);
  const N = {}; for (const k in GP) N[k] = gnode(root, GP[k][0], GP[k][1], k, 46, { fontSize: k.length > 2 ? 26 : 32 });
  const ES = ADJ.map(([a, b]) => gedge(svg, null, N[a], N[b], { w: 4 }));
  const fly = {}; for (const k in AUSC) fly[k] = at(root, 0, 0, "", "", { width: 30, height: 30, borderRadius: "50%", background: "#bf5af2", boxShadow: "0 0 20px #bf5af2" }, true);
  const n5 = big(root, 1400, 575, "간선 5개", 26, { color: COL.gold });
  const ind = big(root, 1580, 815, "독립 부분 문제!", 32, { color: "#64d2ff" });
  const calc = at(root, 440, 810, "", '3<sup>7</sup> = 2,187 &nbsp;→&nbsp; 3<sup>6</sup> + 3 = <b style="color:#30d158">732</b>', { fontSize: 46, fontWeight: 800, whiteSpace: "nowrap" }, true);
  return t => {
    M.op(K(t, 0.1, 0.8) * (1 - 0.6 * K(t, B[3], 0.8)));
    for (const k in AUSC) { const q = K(t, B[1] + 0.2, 1.4, E.io3); fly[k].style.left = lerp(60 + AUSC[k][0], GP[k][0], q) + "px"; fly[k].style.top = lerp(60 + AUSC[k][1], GP[k][1], q) + "px"; S(fly[k], { o: t > B[1] ? 1 - K(t, B[1] + 1.5, 0.4) : 0 }); }
    for (const k in N) { pop(N[k], t, B[1] + 1.4); nst(N[k], t > B[2] && t < B[3] && k === "SA" ? "cur" : t > B[3] && k === "T" ? "st" : ""); }
    ES.forEach((e, i) => e.set(K(t, B[1] + 2.0 + i * 0.25, 0.4), t > B[2] && t < B[3] && ADJ[i].includes("SA") ? COL.cur : "rgba(255,255,255,.55)", 1, t > B[2] && t < B[3] && ADJ[i].includes("SA") ? 6 : 4));
    vis(n5, t, B[2] + 0.3, B[3]);
    vis(ind, t, B[3] + 0.4, null); glow2(N.T, t > B[3] ? 1 : 0, "#64d2ff");
    vis(calc, t, B[4], null);
  };
});

sc(4, "Binary CSP vs Boolean CSP", [
  "이름이 비슷해서 헷갈리는 두 용어. 기준이 완전히 다릅니다",
  "**Binary(이진) CSP** = **변수** 이야기: 제약 하나가 **최대 두 변수**만 묶음 → 간선으로 그릴 수 있음",
  "**Boolean(불리언) CSP** = **값** 이야기: 도메인에 값이 **두 개**(참/거짓, 0/1)뿐",
  "지도 색칠은 Binary이지만 Boolean은 아님(3색). N-퀸 정식화 1은 도메인 {0, 1}이라 Boolean",
  "제약은 묶는 변수 수로 이름을 붙여요: **단항**(1개, '이 칸 = 8') · **이진**(2개, WA ≠ NT) · **고차**(3개 이상, alldiff)",
], (root, B) => {
  const L = card(root, 140, 200, 760, 470, "", {}), R = card(root, 1020, 200, 760, 470, "", {});
  const lt = big(root, 520, 260, "Binary CSP · 변수 기준", 40, { fontWeight: 900, color: "#64d2ff" });
  const rt = big(root, 1400, 260, "Boolean CSP · 값 기준", 40, { fontWeight: 900, color: "#ff9f0a" });
  const svg = svgLayer(root);
  const a = gnode(root, 380, 450, "X", 56), b = gnode(root, 660, 450, "Y", 56);
  const e = gedge(svg, null, a, b, { w: 6 });
  const el = big(root, 520, 390, "제약 1개 = 변수 2개", 28, { color: "#64d2ff" });
  const v = gnode(root, 1400, 440, "X", 56);
  const dm = big(root, 1400, 560, "D = { 참, 거짓 }", 40, { fontFamily: "JBM,monospace", color: "#ff9f0a" });
  const ex = big(root, 960, 730, "", 34, {});
  const ord = [["단항", "1개", "X = 8"], ["이진", "2개", "X ≠ Y"], ["고차", "3개+", "alldiff(…)"]].map(([n, c, f], i) => at(root, 420 + i * 540, 815, "", `<b style="font-size:36px">${n}</b> <span style="color:rgba(255,255,255,.55)">(${c})</span> <span style="font-family:JBM,monospace;color:#ffd479;margin-left:10px">${f}</span>`, { fontSize: 30, whiteSpace: "nowrap" }, true));
  return t => {
    vis(L, t, B[1] - 0.3, null); vis(lt, t, B[1], null); pop(a, t, B[1] + 0.3); pop(b, t, B[1] + 0.5); e.set(K(t, B[1] + 0.9, 0.6), "#64d2ff", 1, 6); vis(el, t, B[1] + 1.2, null);
    vis(R, t, B[2] - 0.3, null); vis(rt, t, B[2], null); pop(v, t, B[2] + 0.3); vis(dm, t, B[2] + 0.8, null);
    vis(ex, t, B[3], B[4]); htm(ex, '지도 색칠: <b style="color:#64d2ff">Binary ✓</b> · <b style="color:#ff9f0a">Boolean ✗</b> (3색) &nbsp;|&nbsp; N-퀸 정식화 1: <b style="color:#ff9f0a">Boolean ✓</b>');
    ord.forEach((o, i) => vis(o, t, B[4] + 0.5 + i * 0.6, null));
  };
});

/* ===================== PART 5 ===================== */
chTitle(5, ["TWO + TWO = FOUR", "받아올림도 변수", "자리별 제약 실행", "네모 노드 = 고차 제약", "스도쿠", "왈츠"]);

const CX = [1060, 1240, 1420, 1600]; // thousands, hundreds, tens, ones columns (x)
sc(5, "복면산 정식화", [
  "**복면산**: 각 글자가 서로 다른 숫자를 나타내는 덧셈. TWO + TWO = FOUR가 성립하게 숫자를 넣는 문제",
  "**변수**: 글자 F, T, U, W, R, O 여섯 개 + **받아올림(carry)** X₁, X₂, X₃",
  "받아올림을 변수로 만들어야 **자리마다 하나씩** 제약을 쓸 수 있어요. **도메인**은 0~9",
  "제약 ①: **alldiff(F, T, U, W, R, O)** — 여섯 글자는 모두 다른 숫자",
  "일의 자리: **O + O = R + 10·X₁** — O를 두 번 더하면 R이 남고, 넘친 만큼 X₁로 받아올림",
  "십의 자리: **X₁ + W + W = U + 10·X₂**, 백의 자리: **X₂ + T + T = O + 10·X₃**",
  "천의 자리: **X₃ = F** — 마지막 받아올림이 그대로 F가 됩니다",
], (root, B) => {
  const rowY = [250, 360, 490];
  const sum = [[null, "T", "W", "O"], ["+", "T", "W", "O"], ["F", "O", "U", "R"]];
  const G = sum.map((r, ri) => r.map((c, ci) => c ? at(root, CX[ci], rowY[ri], "", c, { width: 130, height: 100, borderRadius: 18, fontSize: 64, fontWeight: 900, fontFamily: "JBM,monospace", display: "flex", alignItems: "center", justifyContent: "center", background: c === "+" ? "transparent" : "rgba(255,255,255,.06)", border: c === "+" ? "0" : "2px solid rgba(255,255,255,.2)" }, true) : null));
  const line = at(root, 1330, 425, "", "", { width: 760, height: 5, background: "#fff", borderRadius: 3 }, true);
  const car = ["X₃", "X₂", "X₁"].map((x, i) => at(root, CX[i] + 90, 170, "fx", x, { fontSize: 34, color: "#64d2ff" }, true));
  const vl = at(root, 140, 220, "", "", { width: 640 });
  const vtxt = h(vl, "", "", { fontSize: 32, lineHeight: 1.7 });
  const cons = [
    ["alldiff(F, T, U, W, R, O)", null],
    ["O + O = R + 10·X₁", 3],
    ["X₁ + W + W = U + 10·X₂", 2],
    ["X₂ + T + T = O + 10·X₃", 1],
    ["X₃ = F", 0],
  ].map(([f, col], i) => { const e = at(root, 140, 600 + i * 64, "fx", f, { fontSize: 34, whiteSpace: "nowrap", padding: "4px 16px", borderRadius: 12 }); e.col = col; return e; });
  const hl = at(root, 0, 330, "", "", { width: 150, height: 400, borderRadius: 22, border: "4px solid #ffd60a", boxShadow: "0 0 30px rgba(255,214,10,.4)" }, true);
  return t => {
    G.forEach((r, ri) => r.forEach((g, ci) => { if (g) pop(g, t, 0.3 + ri * 0.3 + ci * 0.08); }));
    vis(line, t, 1.0, null);
    htm(vtxt, '<b style="color:#bf5af2">변수</b> F T U W R O <span style="color:#64d2ff">X₁ X₂ X₃</span><br><b style="color:#64d2ff">도메인</b> {0, 1, …, 9}');
    S(vl, { o: K(t, B[1], 0.6) });
    G.forEach(r => r.forEach(g => { if (g && g.textContent !== "+") { const on = t > B[1] && t < B[2]; setBd(g, on ? "#bf5af2" : "rgba(255,255,255,.2)"); } }));
    car.forEach((c, i) => vis(c, t, B[2] + 0.3 + i * 0.2, null));
    let act = -1;
    cons.forEach((c, i) => { const a = B[3 + Math.min(i, 3)] + (i === 3 ? 0 : 0) + (i === 2 ? 0 : 0); const st = i === 0 ? B[3] : i === 1 ? B[4] : i === 2 ? B[5] : i === 3 ? B[5] + 2.8 : B[6]; vis(c, t, st, null, { dy: 14 }); const en = i === 0 ? B[4] : i === 1 ? B[5] : i === 2 ? B[5] + 2.8 : i === 3 ? B[6] : 999; const on = t > st && t < en; setBg(c, on ? "rgba(255,214,10,.16)" : "transparent"); if (on) act = i; });
    const colIx = act >= 1 ? cons[act].col : -1;
    if (colIx >= 0) { hl.style.left = CX[colIx] + "px"; S(hl, { o: 1 }); } else S(hl, { o: 0 });
    if (act === 0) G.forEach(r => r.forEach(g => { if (g && g.textContent !== "+") setBd(g, "#ffd60a"); }));
  };
});

sc(5, "복면산 풀어 보기", [
  "제약을 따라 직접 값을 넣어 봅시다. 일의 자리부터: O = 4라고 해 보면",
  "4 + 4 = 8 → **R = 8**, 넘치지 않으니 **X₁ = 0**",
  "십의 자리: W = 3이면 0 + 3 + 3 = 6 → **U = 6**, **X₂ = 0**",
  "백의 자리: T = 7이면 0 + 7 + 7 = 14 → 일의 자리 4가 **O = 4와 일치** ✓, 받아올림 **X₃ = 1**",
  "천의 자리: X₃ = F → **F = 1**. 이제 alldiff 검사: 1, 7, 6, 3, 8, 4 모두 다름 ✓",
  "**734 + 734 = 1468** — 모든 제약을 만족하는 해 하나를 찾았습니다",
], (root, B) => {
  const rowY = [260, 370, 500];
  const L = [[null, "T", "W", "O"], [null, "T", "W", "O"], ["F", "O", "U", "R"]];
  const V = { T: 7, W: 3, O: 4, F: 1, U: 6, R: 8 };
  const when = { O: B[0] + 2, R: B[1] + 0.3, W: B[2] + 0.2, U: B[2] + 1.0, T: B[3] + 0.2, F: B[4] + 0.2 };
  const G = L.map((r, ri) => r.map((c, ci) => c ? at(root, CX[ci] - 300, rowY[ri], "", c, { width: 130, height: 100, borderRadius: 18, fontSize: 60, fontWeight: 900, fontFamily: "JBM,monospace", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: "2px solid rgba(255,255,255,.2)" }, true) : null));
  G.forEach((r, ri) => r.forEach(g => { if (g) g.L = g.textContent; }));
  const plus = at(root, CX[0] - 300, rowY[1], "", "+", { fontSize: 64, fontWeight: 900 }, true);
  const line = at(root, 1030, 435, "", "", { width: 760, height: 5, background: "#fff", borderRadius: 3 }, true);
  const car = ["X₃", "X₂", "X₁"].map((x, i) => at(root, CX[i] - 210, 175, "fx", x + " = ?", { fontSize: 30, color: "#64d2ff", whiteSpace: "nowrap" }, true));
  const cv = [1, 0, 0], cw = [B[3] + 1.4, B[2] + 1.0, B[1] + 0.6];
  const work = big(root, 1560, 300, "", 40, { fontFamily: "JBM,monospace" });
  const ad = big(root, 960, 700, "", 40, {});
  const fin = big(root, 960, 820, "734 + 734 = 1468", 80, { fontFamily: "JBM,monospace", fontWeight: 900 }); fin.classList.add("grad");
  return t => {
    G.forEach((r, ri) => r.forEach((g, ci) => { if (!g) return; pop(g, t, 0.2 + ri * 0.15 + ci * 0.05); const v = t > when[g.L] ? V[g.L] : null; htm(g, v == null ? g.L : `<span style="color:#ffd60a">${v}</span>`); setBd(g, v == null ? "rgba(255,255,255,.2)" : "#ffd60a"); }));
    vis(plus, t, 0.5, null); vis(line, t, 0.7, null);
    car.forEach((c, i) => { vis(c, t, 0.9, null); txt(c, ["X₃", "X₂", "X₁"][i] + " = " + (t > cw[i] ? cv[i] : "?")); });
    const w = t > B[4] ? "X₃ = 1 → F = 1" : t > B[3] ? "0 + 7 + 7 = 14" : t > B[2] ? "0 + 3 + 3 = 6" : t > B[1] ? "4 + 4 = 8" : t > B[0] + 2 ? "O = 4 ?" : "";
    txt(work, w); S(work, { o: w ? 1 : 0 });
    vis(ad, t, B[4] + 1.5, null); htm(ad, 'alldiff(F, T, U, W, R, O) = (1, 7, 6, 3, 8, 4) <b style="color:#30d158">✓ 모두 다름</b>');
    blurIn(fin, t, B[5]);
  };
});

sc(5, "제약 그래프: 네모 노드", [
  "이번엔 복면산의 **제약 그래프**. 동그라미 = 변수, **네모 = 제약**",
  "맨 위 네모는 **alldiff** — 여섯 글자 모두와 연결됩니다. 간선 하나로는 못 그리는 **고차 제약**이라 네모로",
  "아래 네모들은 **자리별 덧셈 제약**: 그 자리의 글자와 받아올림을 묶어요",
  "예: 일의 자리 네모는 O, R, X₁을 연결 → 'O + O = R + 10·X₁'",
  "백의 자리 네모는 T, O, X₂, X₃ — 이렇게 **제약이 주어지면 그래프를 그릴 수 있어야** 합니다",
], (root, B) => {
  const xs = { F: 560, T: 760, U: 960, W: 1160, R: 1360, O: 1560 };
  const svg = svgLayer(root);
  const V = {}; for (const k in xs) V[k] = gnode(root, xs[k], 480, k, 48);
  V.X3 = gnode(root, 660, 760, "X₃", 46); V.X2 = gnode(root, 1060, 760, "X₂", 46); V.X1 = gnode(root, 1460, 760, "X₁", 46);
  const sq = (x, y, lab) => { const e = at(root, x, y, "", "", { width: 64, height: 64, background: "#16161c", border: "4px solid #ff7ab2" }, true); e.X = x; e.Y = y; e.R = 34; e.lb = big(root, x + (lab[1] || 0), y - 60, lab[0], 24, { color: "#ff7ab2" }); return e; };
  const top = sq(1060, 250, ["alldiff", 0]);
  const c1 = sq(1460, 630, ["일의 자리", 120]), c10 = sq(1160, 630, ["십의 자리", 0]), c100 = sq(860, 630, ["백의 자리", -120]), c1000 = sq(560, 630, ["천", -60]);
  const link = (a, b) => gedge(svg, null, a, b, { w: 3 });
  const Et = ["F", "T", "U", "W", "R", "O"].map(k => link(top, V[k]));
  const E1 = [link(c1, V.O), link(c1, V.R), link(c1, V.X1)];
  const E10 = [link(c10, V.W), link(c10, V.U), link(c10, V.X1), link(c10, V.X2)];
  const E100 = [link(c100, V.T), link(c100, V.O), link(c100, V.X2), link(c100, V.X3)];
  const E1000 = [link(c1000, V.F), link(c1000, V.X3)];
  const grp = [[top, Et, B[1]], [c1, E1, B[2]], [c10, E10, B[2] + 0.8], [c100, E100, B[2] + 1.6], [c1000, E1000, B[2] + 2.4]];
  return t => {
    for (const k in V) pop(V[k], t, 0.3 + (V[k].X / 3000));
    grp.forEach(([s, es, a], gi) => {
      pop(s, t, a); vis(s.lb, t, a + 0.2, null);
      const hot = (gi === 1 && t > B[3] && t < B[4]) || (gi === 3 && t > B[4]) || (gi === 0 && t > B[1] && t < B[2]);
      es.forEach((e, i) => e.set(K(t, a + 0.2 + i * 0.12, 0.4), hot ? "#ffd60a" : "rgba(255,122,178,.55)", 1, hot ? 6 : 3));
      glow2(s, hot ? 1 : 0, "#ffd60a");
    });
    const on = new Set(t > B[3] && t < B[4] ? ["O", "R", "X1"] : t > B[4] ? ["T", "O", "X2", "X3"] : []);
    for (const k in V) nst(V[k], on.has(k) ? "cur" : "");
  };
});

sc(5, "스도쿠", [
  "**스도쿠**도 CSP: **변수** = 빈칸 하나하나, **도메인** = {1, …, 9}",
  "**제약**: 행 9개, 열 9개, 3×3 영역 9개에 각각 **9칸 alldiff** → 모두 27개",
  "alldiff 하나는 '두 칸씩 다르다'(≠)로 풀어 쓸 수도 있어요: 9 × 8 ÷ 2 = **36개**의 이진 제약",
  "이미 채워진 칸은 **단항(unary) 제약**: 변수 하나에만 걸린 제약 ('이 칸 = 8')",
], (root, B) => {
  const G = [[0, 0, 0, 0, 0, 8, 0, 0, 4], [0, 8, 4, 0, 1, 6, 0, 0, 0], [0, 0, 0, 5, 0, 0, 1, 0, 0], [1, 0, 3, 8, 0, 0, 9, 0, 0], [6, 0, 8, 0, 0, 0, 4, 0, 3], [0, 0, 2, 0, 0, 9, 5, 0, 1], [0, 0, 7, 0, 0, 2, 0, 0, 0], [0, 0, 0, 7, 8, 0, 2, 6, 0], [2, 0, 0, 3, 0, 0, 0, 0, 0]];
  const cs = 72, x0 = 230, y0 = 150;
  const C = []; G.forEach((r, i) => r.forEach((v, j) => { const e = at(root, x0 + j * cs, y0 + i * cs, "", v ? String(v) : "", { width: cs - 2, height: cs - 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, fontFamily: "JBM,monospace", background: "rgba(255,255,255,.05)", borderRadius: 6 }); e.i = i; e.j = j; e.v = v; C.push(e); }));
  const svg = svgLayer(root);
  for (let k = 0; k <= 3; k++) { sv(svg, "line", { x1: x0 - 2, y1: y0 - 2 + k * 3 * cs, x2: x0 - 2 + 9 * cs, y2: y0 - 2 + k * 3 * cs, stroke: "rgba(255,255,255,.7)", "stroke-width": 4 }); sv(svg, "line", { x1: x0 - 2 + k * 3 * cs, y1: y0 - 2, x2: x0 - 2 + k * 3 * cs, y2: y0 - 2 + 9 * cs, stroke: "rgba(255,255,255,.7)", "stroke-width": 4 }); }
  const info = [big(root, 1450, 260, "변수 = 빈칸 · 도메인 = {1..9}", 38, {}), big(root, 1450, 400, "행 9 + 열 9 + 영역 9 = 27 alldiff", 36, { color: "#ffd60a" }), big(root, 1450, 540, "alldiff 1개 = 9×8÷2 = 36개의 ≠", 36, { color: "#64d2ff" }), big(root, 1450, 680, "주어진 칸 = 단항 제약", 38, { color: "#30d158" })];
  return t => {
    C.forEach((c, k) => S(c, { o: K(t, 0.2 + k * 0.006, 0.4) }));
    const ph = t > B[3] ? 3 : t > B[2] ? 2 : t > B[1] ? 1 : 0;
    const cyc = Math.floor((t - B[1]) / 1.1) % 3;
    C.forEach(c => {
      let on = false;
      if (ph === 1) on = cyc === 0 ? c.i === 0 : cyc === 1 ? c.j === 8 : (c.i < 3 && c.j > 5);
      if (ph === 2) on = c.i === 0;
      const given = ph === 3 && c.v;
      setBg(c, given ? "rgba(48,209,88,.3)" : on ? "rgba(255,214,10,.28)" : !c.v && ph === 0 && t > B[0] + 1 ? "rgba(191,90,242,.22)" : "rgba(255,255,255,.05)");
    });
    info.forEach((e, i) => vis(e, t, B[i] + 0.5, null));
  };
});

sc(5, "왈츠 알고리즘", [
  "**왈츠 알고리즘**: 선으로만 그린 그림을 보고 '어떤 3D 입체인가'를 해석하는, CSP로 푼 초기 AI 사례",
  "사람은 바로 '상자'로 보지만, 컴퓨터는 각 선이 **튀어나온 모서리(볼록, +)**인지 **들어간 모서리(오목, −)**인지부터 정해야 해요",
  "접근법(Approach): **변수 = 교차점(junction)**, 선들이 만나는 점",
  "**도메인** = 그 교차점에 모인 선들이 볼록인지 오목인지(또는 경계선인지)의 조합",
  "**제약** = 교차점 모양(Y자, 화살표, L자)마다 **물리적으로 가능한 라벨 조합의 리스트**, 그리고 이웃 교차점은 공유한 선에 **같은 라벨**",
  "가운데 Y자: 세 선이 모두 + 이면 바깥에서 본 **모서리**, 모두 − 이면 안에서 본 **방 구석** — 이웃 제약이 어느 쪽인지 정해 줍니다",
  "**해 = 물리적으로 실현 가능한 3D 해석**",
], (root, B) => {
  const c = [760, 520], s = 200;
  const P = { c: c, t: [c[0], c[1] - s * 1.15], l: [c[0] - s, c[1] + s * 0.58], r: [c[0] + s, c[1] + s * 0.58], tl: [c[0] - s, c[1] - s * 0.58], tr: [c[0] + s, c[1] - s * 0.58], b: [c[0], c[1] + s * 1.15] };
  const svg = svgLayer(root);
  const segs = [["c", "t", "+"], ["c", "l", "+"], ["c", "r", "+"], ["t", "tl", "→"], ["tl", "l", "→"], ["l", "b", "→"], ["b", "r", "→"], ["r", "tr", "→"], ["tr", "t", "→"]];
  const L = segs.map(([a, b2, lab]) => ({ a, b: b2, lab, l: sv(svg, "line", { x1: P[a][0], y1: P[a][1], x2: P[b2][0], y2: P[b2][1], stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }), t: at(root, (P[a][0] + P[b2][0]) / 2 + 22, (P[a][1] + P[b2][1]) / 2 - 18, "", lab, { fontSize: 34, fontWeight: 900, color: lab === "+" ? "#30d158" : "#ffd479" }, true) }));
  const J = ["c", "t", "l", "r", "tl", "tr", "b"].map(k => { const e = at(root, P[k][0], P[k][1], "", "", { width: 34, height: 34, borderRadius: "50%", background: "#bf5af2", boxShadow: "0 0 20px #bf5af2" }, true); e.k = k; return e; });
  const legend = at(root, 1150, 220, "", "", { width: 680 });
  const lg = h(legend, "", '<div><b style="color:#30d158;font-size:44px">+</b> 볼록 (튀어나온 모서리)</div><div><b style="color:#ff453a;font-size:44px">−</b> 오목 (들어간 모서리)</div><div><b style="color:#ffd479;font-size:38px">→</b> 경계선 (물체의 윤곽)</div>', { fontSize: 32, lineHeight: 1.8 });
  const rows = [["변수", "교차점 (junction)"], ["도메인", "각 선의 + / − / → 조합"], ["제약", "모양별 허용 라벨 리스트 + 이웃 일치"], ["해", "물리적으로 가능한 3D 해석"]].map(([a, b2], i) => at(root, 1150, 470 + i * 80, "", `<b style="color:#ff7ab2;display:inline-block;width:120px">${a}</b>${b2}`, { fontSize: 32, whiteSpace: "nowrap" }));
  const yl = at(root, 760, 815, "", "", { fontSize: 34, fontWeight: 800, whiteSpace: "nowrap" }, true);
  return t => {
    L.forEach((x, i) => { x.l.setAttribute("opacity", K(t, 0.3 + i * 0.12, 0.4).toFixed(2)); });
    const lab = t > B[1] + 1.5;
    const flip = t > B[5] + 3.5 && t < B[6];
    L.forEach(x => { const s2 = flip && x.lab === "+" ? "−" : x.lab; txt(x.t, s2); setCol(x.t, s2 === "+" ? "#30d158" : s2 === "−" ? "#ff453a" : "#ffd479"); S(x.t, { o: lab ? 1 : 0 }); });
    S(legend, { o: K(t, B[1] + 0.5, 0.6) * (1 - K(t, B[2] - 0.3, 0.4)) });
    J.forEach((j, i) => { const q = t > B[2] ? 1 : 0; S(j, { o: q, s: j.k === "c" && t > B[5] ? 1.4 : 1 }); });
    rows.forEach((r, i) => vis(r, t, B[2 + Math.min(i, 2)] + (i === 3 ? 0 : 0.2) + (i === 3 ? B[6] - B[4] : 0), null));
    vis(yl, t, B[5], null); htm(yl, flip ? 'Y자 = (−, −, −) → <span style="color:#ff453a">방 구석을 안에서</span>' : 'Y자 = (+, +, +) → <span style="color:#30d158">튀어나온 모서리</span>');
  };
});

/* ===================== OUTRO ===================== */
add({
  ch: 0, name: "마무리", dur: 22, hud: false,
  caps: [[0.8, 9, "CSP는 식별 문제를 (변수, 도메인, 제약)이라는 공통 언어로 쓴 것"], [9.4, 16, "같은 문제라도 **해의 구조를 문제 정의에 담을수록** 더 좋은 CSP — 다음 시간엔 이걸 푸는 범용 알고리즘을 배웁니다"]],
  build(root) {
    const sums = { 1: "계획 vs 식별 · 블랙박스 vs 분해형 · (X, D, C)", 2: "인접 = 다른 색 · 암묵적 vs 명시적 · 해 = 완전 + 일관", 3: "2¹⁶ → 16⁴ → 4⁴ · 해의 구조를 문제에", 4: "노드 = 변수 · 간선 = 제약 · Binary ≠ Boolean", 5: "받아올림 변수 · 네모 = 고차 제약 · junction" };
    const tiles = [1, 2, 3, 4, 5].map((c, i) => { const C = CH[c]; return at(root, 960 + (i - 2) * 350, 470, "", `<div style="font-size:50px;font-weight:900;letter-spacing:-.04em;color:${C.acc}">${C.no}</div><div style="font-size:28px;font-weight:800;margin-top:4px">${C.title}</div><div style="font-size:19px;color:rgba(255,255,255,.62);margin-top:10px;line-height:1.45">${sums[c]}</div>`, { width: 330, height: 250, borderRadius: 26, padding: "22px 24px", background: "linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)" }, true); });
    const head = at(root, 960, 210, "big", "5장, 한눈에", { fontSize: 76, whiteSpace: "nowrap" }, true);
    const fin = at(root, 960, 440, "big grad", "CSP = (X, D, C)", { fontSize: 140, whiteSpace: "nowrap", fontFamily: "JBM,monospace" }, true);
    const sub = at(root, 960, 600, "", "structure of the solution → structure of the problem", { fontSize: 40, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }, true);
    return t => {
      const out = K(t, 8.6, 0.8, E.io3);
      blurIn(head, t, 0.2); S(head, { o: K(t, 0.2, 0.8) * (1 - out), y: -out * 40 });
      tiles.forEach((e, i) => { const q = K(t, 0.6 + i * 0.15, 0.8, E.o5); S(e, { o: q * (1 - out), y: (1 - q) * 50 - out * 40, b: (1 - q) * 10 + out * 6 }); });
      const f = K(t, 9.4, 1.2, E.o5); S(fin, { o: f, s: 1.15 - 0.15 * f, b: (1 - f) * 18 });
      rise(sub, t, 11);
    };
  },
});
