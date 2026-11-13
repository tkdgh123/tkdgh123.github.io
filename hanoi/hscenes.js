/* ===== 하노이의 탑 — 코드 실행 × 탑 움직임 동기화 ===== */
function glow(el, e, col) {
  e = clamp(e); const c = col || "var(--acc)";
  const key = e.toFixed(2) + c; if (el._g === key) return; el._g = key;
  el.style.boxShadow = e > 0.01 ? `0 0 0 ${(3 * e).toFixed(1)}px ${c}, 0 0 ${(60 * e).toFixed(0)}px color-mix(in srgb, ${c} ${(45 * e).toFixed(0)}%, transparent)` : "";
}
const PEGX = { A: 1060, B: 1380, C: 1700 }, BASEY = 540, DH = 40, DW = { 1: 120, 2: 180, 3: 240 }, DCOL = { 1: "#64d2ff", 2: "#5e5ce6", 3: "#bf5af2" };
const ROLEC = { from: "#ff9f0a", tmp: "#a1a1a6", to: "#30d158" };
function towerKit(root, opts) {
  opts = opts || {};
  const k = { disks: {} };
  k.plate = at(root, 860, BASEY + 2, "", "", { width: 1040, height: 16, borderRadius: 8, background: "rgba(255,255,255,.22)" });
  k.pegs = ["A", "B", "C"].map(p => at(root, PEGX[p], BASEY - 120, "", "", { width: 12, height: 250, borderRadius: 6, background: "rgba(255,255,255,.28)" }, true));
  k.lab = ["A", "B", "C"].map(p => at(root, PEGX[p], BASEY + 44, "mono", p, { fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,.75)" }, true));
  [3, 2, 1].forEach(n => k.disks[n] = at(root, 0, 0, "mono", String(n), { width: DW[n], height: DH - 6, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", background: `linear-gradient(180deg, ${DCOL[n]}, color-mix(in srgb, ${DCOL[n]} 55%, #000))`, boxShadow: "0 8px 24px rgba(0,0,0,.45)" }, true));
  k.pos = (st, n) => { for (const p of ["A", "B", "C"]) { const i = st[p].indexOf(n); if (i >= 0) return [PEGX[p], BASEY - DH / 2 - 4 - i * DH]; } };
  // draw state st, with optional moving disk {n, s0, s1, q(0..1)}
  k.draw = (st, mv, op) => {
    [1, 2, 3].forEach(n => {
      let [x, y] = k.pos(st, n);
      if (mv && mv.n === n) {
        const [x0, y0] = k.pos(mv.s0, n), [x1, y1] = k.pos(mv.s1, n), top = BASEY - 330, q = mv.q;
        if (q < 0.33) { x = x0; y = lerp(y0, top, E.io3(q / 0.33)); }
        else if (q < 0.66) { y = top; x = lerp(x0, x1, E.io3((q - 0.33) / 0.33)); }
        else { x = x1; y = lerp(top, y1, E.o3((q - 0.66) / 0.34)); }
      }
      S(k.disks[n], { o: op == null ? 1 : op, x, y });
    });
  };
  k.show = (t, a) => { S(k.plate, { o: K(t, a, 0.5) }); k.pegs.forEach((p, i) => S(p, { o: K(t, a + i * 0.08, 0.5), sy: K(t, a + i * 0.08, 0.6, E.o5) })); k.lab.forEach((l, i) => vis(l, t, a + 0.2 + i * 0.08, null)); };
  return k;
}
const ST0 = { A: [3, 2, 1], B: [], C: [] };
const cp = s => ({ A: s.A.slice(), B: s.B.slice(), C: s.C.slice() });
function applyMove(s, n, f, to) { const r = cp(s); r[f].pop(); r[to].push(n); return r; }

/* ---------- 1. 타이틀 ---------- */
add({
  ch: 9, name: "하노이의 탑", dur: 7.5, hud: false, fadeIn: false,
  build(root) {
    const t1 = at(root, 960, 430, "big grad", "하노이의 탑", { fontSize: 170, whiteSpace: "nowrap" }, true);
    const t2 = at(root, 960, 570, "", "재귀 함수가 실제로 어떻게 움직이는지, 코드 한 줄씩", { fontSize: 40, color: "rgba(255,255,255,.7)", fontWeight: 500, whiteSpace: "nowrap" }, true);
    const t3 = at(root, 960, 650, "mono", hlC("hanoi_tower(3, 'A', 'B', 'C');"), { fontSize: 34, whiteSpace: "pre" }, true);
    return t => { blurIn(t1, t, 0.3, 1.2); rise(t2, t, 1.3); rise(t3, t, 2.2); };
  },
});

/* ---------- 2. 규칙 ---------- */
dia(9, "게임 규칙", 15, root => {
  const k = towerKit(root);
  const rules = ["① 한 번에 원판 하나만 옮긴다", "② 기둥 맨 위의 원판만 옮길 수 있다", "③ 작은 원판 위에 큰 원판을 놓을 수 없다"].map((s, i) => at(root, 140, 230 + i * 90, "", s, { fontSize: 34, fontWeight: 700 }));
  const goal = at(root, 140, 520, "", "목표: A의 원판 전부를 <b style='color:#30d158'>C</b>로", { fontSize: 32, color: "rgba(255,255,255,.75)" });
  const x = at(root, PEGX.B, BASEY - 160, "", "✕", { fontSize: 150, fontWeight: 900, color: "#ff453a", textShadow: "0 0 30px #ff453a" }, true);
  const s1 = applyMove(ST0, 1, "A", "B"); // 1 to B
  return t => {
    k.show(t, 0.2);
    rules.forEach((r, i) => vis(r, t, 1.0 + i * 1.6, null, { dy: 0, x: 0 }));
    vis(goal, t, 6.0, null);
    // demo: move 1 A->B (ok), then try 2 A->B onto 1 (illegal, bounce back)
    if (t < 7.5) k.draw(ST0, null, K(t, 0.6, 0.5));
    else if (t < 9.3) k.draw(s1, { n: 1, s0: ST0, s1, q: clamp((t - 7.5) / 1.6) });
    else if (t < 12.3) {
      const q = clamp((t - 9.6) / 1.4); // lift 2 towards B and back
      k.draw(s1);
      const [x0, y0] = k.pos(s1, 2), top = BASEY - 330;
      let X = x0, Y = y0;
      if (q < 0.35) Y = lerp(y0, top, E.io3(q / 0.35)); else if (q < 0.7) { Y = top; X = lerp(x0, PEGX.B, E.io3((q - 0.35) / 0.35)); } else { Y = top; X = PEGX.B; }
      const back = clamp((t - 11.4) / 0.8);
      if (back > 0) { X = lerp(PEGX.B, x0, E.io3(clamp(back * 1.6))); Y = back < 0.6 ? top : lerp(top, y0, E.o3((back - 0.6) / 0.4)); }
      S(k.disks[2], { o: 1, x: X, y: Y });
    } else k.draw(s1);
    S(x, { o: K(t, 10.7, 0.15) * (1 - K(t, 11.6, 0.4)), s: 0.6 + 0.4 * K(t, 10.7, 0.3, E.ob) });
  };
}, [[1.0, 6.0, "하노이의 탑 규칙은 세 가지"], [7.2, 9.4, "원판 1을 B로 — 문제없다"], [9.6, 12.4, "원판 2를 원판 1 위에? — **규칙 ③ 위반**"], [12.6, 14.7, "그럼 3개를 어떻게 다 옮길까?"]]);

/* ---------- 3. 핵심 아이디어: n-1개를 덩어리로 ---------- */
dia(9, "핵심 아이디어", 21, root => {
  const k = towerKit(root);
  const box = at(root, 0, 0, "", "", { width: 220, height: 2 * DH + 22, borderRadius: 18, border: "3px dashed #ffd479", background: "rgba(255,212,121,.08)" }, true);
  const boxL = at(root, 0, 0, "", "위의 n−1개", { fontSize: 24, fontWeight: 800, color: "#ffd479", whiteSpace: "nowrap" }, true);
  const steps = [["①", "위의 n−1개를 <b>보조(tmp)</b> 기둥으로", "hanoi_tower(n-1, from, to, tmp)"], ["②", "가장 큰 원판 n을 <b>목적지(to)</b>로", "printf(\"원판 %d을 …\", n, …)"], ["③", "보조 기둥의 n−1개를 <b>목적지(to)</b>로", "hanoi_tower(n-1, tmp, from, to)"]]
    .map(([a, b, c], i) => at(root, 120, 240 + i * 140, "", `<div style="display:flex;gap:16px;align-items:baseline"><span style="font-size:44px;font-weight:900;color:var(--acc)">${a}</span><span style="font-size:32px;font-weight:700">${b}</span></div><div class="mono" style="margin:8px 0 0 64px;font-size:22px;color:rgba(255,255,255,.6)">${esc(c)}</div>`, {}));
  const q = at(root, 960, 760, "", "그런데 ①의 ‘n−1개 옮기기’는 어떻게? → <b style='color:#ffd479'>똑같은 방법을 원판 하나 적게</b> 다시 쓰면 된다. 이게 재귀!", { fontSize: 32, fontWeight: 600, whiteSpace: "nowrap" }, true);
  const sB = { A: [3], B: [2, 1], C: [] }, sC1 = { A: [], B: [2, 1], C: [3] }, sEnd = { A: [], B: [], C: [3, 2, 1] };
  const bc = (peg, onTop) => [PEGX[peg], BASEY - DH / 2 - 4 - (onTop ? 1.5 : 0.5) * DH];
  const path = (p0, p1, u) => { const top = BASEY - 300; let [x, y] = p0; if (u < 0.33) y = lerp(p0[1], top, E.io3(u / 0.33)); else if (u < 0.66) { y = top; x = lerp(p0[0], p1[0], E.io3((u - 0.33) / 0.33)); } else { x = p1[0]; y = lerp(top, p1[1], E.o3((u - 0.66) / 0.34)); } return [x, y]; };
  return t => {
    k.show(t, 0.2);
    steps.forEach((s, i) => vis(s, t, 2.4 + i * 4.4, null, { dy: 0, x: 0 }));
    vis(q, t, 15.6, null);
    let b;
    if (t < 3.4) { k.draw(ST0); b = bc("A", true); }
    else if (t < 5.6) { k.draw(ST0); b = path(bc("A", true), bc("B", false), (t - 3.4) / 2.2); }
    else if (t < 7.6) { k.draw(sB); b = bc("B", false); }
    else if (t < 9.8) { k.draw(sC1, { n: 3, s0: sB, s1: sC1, q: clamp((t - 7.6) / 2.0) }); b = bc("B", false); }
    else if (t < 12.0) { k.draw(sC1); b = bc("B", false); }
    else if (t < 14.2) { k.draw(sC1); b = path(bc("B", false), bc("C", true), (t - 12.0) / 2.2); }
    else { k.draw(sEnd); b = bc("C", true); }
    if ((t >= 3.4 && t < 5.6) || (t >= 12.0 && t < 14.2)) { S(k.disks[2], { o: 1, x: b[0], y: b[1] + DH / 2 }); S(k.disks[1], { o: 1, x: b[0], y: b[1] - DH / 2 }); }
    S(box, { o: K(t, 1.2, 0.5) * (1 - K(t, 14.6, 0.5)), x: b[0], y: b[1] });
    S(boxL, { o: K(t, 1.4, 0.5) * (1 - K(t, 14.6, 0.5)), x: b[0], y: b[1] - DH - 30 });
  };
}, [[1.0, 3.3, "위의 n−1개(여기선 2개)를 한 덩어리로 생각하자"], [3.4, 7.4, "① 덩어리를 보조 기둥 B로"], [7.6, 11.8, "② 가장 큰 원판 3을 목적지 C로"], [12.0, 15.2, "③ 덩어리를 다시 C로 — 끝!"]]);

/* ---------- 4. 실제 실행 추적 ---------- */
(function () {
  const SRC = String.raw`#include <stdio.h>

void hanoi_tower(int n, char from, char tmp, char to)
{
    if (n == 1)
        printf("원판 1을 %c에서 %c으로 옮긴다.\n", from, to);
    else
    {
        hanoi_tower(n - 1, from, to, tmp);   // ①
        printf("원판 %d을 %c에서 %c으로 옮긴다.\n", n, from, to); // ②
        hanoi_tower(n - 1, tmp, from, to);   // ③
    }
}

int main(void)
{
    hanoi_tower(3, 'A', 'B', 'C');
    return 0;
}`;
  const LINES = SRC.split("\n");
  // ---- simulate & record events
  const EV = []; let stack = [], st = cp(ST0), out = [], moves = 0, nCall = 0;
  const fr = f => `hanoi_tower(${f.n}, ${f.f}, ${f.t}, ${f.to})`;
  const push = (o) => { const top = stack[stack.length - 1]; EV.push(Object.assign({ stack: stack.map(x => Object.assign({}, x)), st: cp(st), out: out.slice(), moves }, o)); };
  push({ line: 17, d: 3.2, cap: "main에서 **hanoi_tower(3, 'A', 'B', 'C')** 를 호출한다 — 원판 3개를 A에서 C로, B는 보조", ann: [17, "→ 호출!"] });
  function rec(n, f, t, to, fast) {
    nCall++;
    stack.push({ n, f, t, to, s: "" });
    const D = fast ? 0.72 : 1;
    push({ line: 3, d: 3.0 * D, cap: `새 호출 **${fr({ n, f, t, to })}** — 원판 ${n}개를 **${f}에서 ${to}로**${n > 1 ? `, ${t}는 보조` : ""}`, call: true });
    push({ line: 5, d: 2.2 * D, cap: n === 1 ? "n == 1 → **참**: 원판이 하나뿐이니 그냥 옮기면 된다" : `n == 1 ? → n = ${n} 이므로 **거짓**, else 블록으로`, ann: [5, n === 1 ? "→ 참" : "→ 거짓"] });
    if (n === 1) {
      const s0 = cp(st); st = applyMove(st, 1, f, to); out.push(`원판 1을 ${f}에서 ${to}으로 옮긴다.`); moves++;
      push({ line: 6, d: 3.2 * D, cap: `원판 1을 **${f} → ${to}** 로 옮긴다 (이동 ${moves}번째)`, mv: { n: 1, s0, s1: cp(st) }, ann: [6, `→ 1: ${f} → ${to}`] });
    } else {
      stack[stack.length - 1].s = "①";
      push({ line: 9, d: 3.4 * D, cap: `① 위의 ${n - 1}개를 보조 기둥 **${t}** 로 → **${fr({ n: n - 1, f, t: to, to: t })}** 호출 (to와 tmp가 자리를 바꾼다)`, ann: [9, "→ " + fr({ n: n - 1, f, t: to, to: t })] });
      rec(n - 1, f, to, t, fast || (n - 1 === 1 && nCall > 3));
      stack[stack.length - 1].s = "②";
      const s0 = cp(st); st = applyMove(st, n, f, to); out.push(`원판 ${n}을 ${f}에서 ${to}으로 옮긴다.`); moves++;
      push({ line: 10, d: 3.4 * D, cap: `돌아왔다! 이제 ② 가장 큰 원판 **${n}** 을 **${f} → ${to}** 로 (이동 ${moves}번째)`, mv: { n, s0, s1: cp(st) }, ann: [10, `→ ${n}: ${f} → ${to}`] });
      stack[stack.length - 1].s = "③";
      push({ line: 11, d: 3.4 * D, cap: `③ ${t}에 있는 ${n - 1}개를 목적지 **${to}** 로 → **${fr({ n: n - 1, f: t, t: f, to })}** 호출`, ann: [11, "→ " + fr({ n: n - 1, f: t, t: f, to })] });
      rec(n - 1, t, f, to, true);
    }
    push({ line: 13, d: 1.9 * D, cap: `**${fr({ n, f, t, to })}** 할 일 끝 → 자기를 부른 곳으로 돌아간다`, ret: true });
    stack.pop();
  }
  rec(3, "A", "B", "C", false);
  push({ line: 18, d: 4.0, cap: "모든 호출이 끝나 main으로 복귀 — 원판 3개, **7번** 이동으로 완성!" });
  let T = 1.4; EV.forEach(e => { e.a = T; T += e.d; });
  const DUR = T + 2.0;
  window.HANOI_EV = EV;

  add({
    ch: 9, name: "실행 추적", dur: DUR, code: true, _st: EV,
    build(root) {
      // code window
      const X = 36, Y = 120, WW = 850, HH = 790, lh = 36;
      const win = at(root, X, Y, "win", null, { width: WW, height: HH });
      h(win, "bar", '<i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span class="fn">hanoi.c</span><span class="tag" id="hvals"></span>');
      const vals = win.querySelector("#hvals"); vals.removeAttribute("id");
      const view = h(win, "view"), wrap = h(view, "codewrap mono");
      const em = s2 => [...s2].reduce((a, c) => a + (/[\uac00-\ud7af]/.test(c) ? 1 : 0.6), 0); const FS = Math.min(19.5, Math.floor((WW - 100) / Math.max(...LINES.map(em)) * 10) / 10); wrap.style.fontSize = FS + "px"; wrap.style.lineHeight = lh + "px";
      const band = h(wrap, "band");
      const lineEls = LINES.map((s, i) => h(wrap, "ln", '<span class="g">' + (i + 1) + '</span><span class="c">' + (hlC(s) || " ") + "</span>", { height: lh, position: "relative", top: "0" }));
      const annEl = h(wrap, "ab mono", "", { left: 0, fontSize: 18, fontWeight: 700, color: "#ffd479", whiteSpace: "nowrap", padding: "2px 10px", borderRadius: 8, background: "rgba(48,40,14,.96)", zIndex: 3, border: "1px solid rgba(255,212,121,.5)" });
      S(annEl, { o: 0 });
      // towers
      const k = towerKit(root);
      const roles = ["from", "tmp", "to"].map(r => at(root, 0, BASEY + 92, "mono", r, { fontSize: 22, fontWeight: 800, color: ROLEC[r], padding: "3px 12px", borderRadius: 999, border: `2px solid ${ROLEC[r]}` }, true));
      const mvc = at(root, 1380, 150, "mono", "", { fontSize: 30, fontWeight: 700 }, true);
      // stack panel
      const SX = 910, SY = 664, SW = 460, SH = 250;
      const sp = at(root, SX, SY, "pcard", '<div class="plabel">CALL STACK · 호출 스택</div>', { width: SW, height: SH });
      const FH = 40, frames = [0, 1, 2, 3, 4].map(d => at(root, SX + 20, SY + SH - 18 - (d + 1) * (FH + 6), "mono", "", { width: SW - 40, height: FH, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", fontSize: 19, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", boxSizing: "border-box" }));
      // output
      const TX = 1392, TW = 476;
      const tc = at(root, TX, SY, "pcard", '<div class="plabel">OUTPUT ▸ 실행 결과</div>', { width: TW, height: SH, background: "rgba(0,0,0,.5)" });
      const term = h(tc, "term mono", "", { fontSize: "17px", lineHeight: "1.55", top: "56px", left: "22px" });
      const roleOf = f => f ? { from: f.f, tmp: f.t, to: f.to } : null;
      let lastFrames = "";
      return t => {
        const pe = K(t, 0.05, 1.0, E.o5);
        S(win, { p: 1, o: pe, y: (1 - pe) * 100, rx: (1 - pe) * 16 });
        S(sp, { o: K(t, 0.4, 0.8) }); S(tc, { o: K(t, 0.5, 0.8) }); k.show(t, 0.3);
        lineEls.forEach((l, i) => S(l, { o: K(t, 0.2 + i * 0.03, 0.4) }));
        let i = 0; for (let j = 0; j < EV.length; j++) if (t >= EV[j].a) i = j;
        const e = EV[i], pv = EV[i - 1] || e, u = Math.max(0, t - e.a), kk = E.io3(clamp(u / 0.45));
        // highlight band
        const ya = 22 + (pv.line - 1) * lh - 3, yb = 22 + (e.line - 1) * lh - 3;
        band.style.top = lerp(ya, yb, t < EV[0].a ? 1 : kk).toFixed(1) + "px"; band.style.height = (lh + 6) + "px";
        S(band, { o: K(t, 1.0, 0.4) });
        lineEls.forEach((l, j) => { if (t > 1.2) S(l, { o: j + 1 === e.line ? 1 : 0.42 }); });
        // annotation on the line
        if (e.ann && t >= e.a) {
          const [ln, txt0] = e.ann; htm(annEl, esc(txt0));
          const long = LINES[ln - 1].length > 40;
          annEl.style.top = (22 + (ln - 1 + (long ? 1 : 0)) * lh + 3) + "px";
          annEl.style.left = (long ? 200 : 74 + LINES[ln - 1].length * FS * 0.6 + 18) + "px";
          S(annEl, { o: K(u, 0.35, 0.35), s: 0.9 + 0.1 * K(u, 0.35, 0.35, E.ob) });
        } else S(annEl, { o: 0 });
        // current frame values on the title bar
        const top = e.stack[e.stack.length - 1];
        htm(vals, top ? `n=${top.n} · from=${top.f} · tmp=${top.t} · to=${top.to}` : "main()");
        // towers
        if (e.mv && u < e.d) k.draw(e.mv.s0, { n: e.mv.n, s0: e.mv.s0, s1: e.mv.s1, q: clamp((u - 0.4) / 1.9) });
        else k.draw(e.mv ? e.mv.s1 : e.st);
        txt(mvc, `이동 ${e.moves - (e.mv && u < 2.3 ? 1 : 0)} / 7`); S(mvc, { o: K(t, 1.2, 0.5) });
        // roles under pegs (interpolate between previous and current active frame)
        const ra = roleOf(pv.stack[pv.stack.length - 1]), rb = roleOf(top);
        roles.forEach((el, j) => {
          const r = ["from", "tmp", "to"][j];
          if (!rb) { S(el, { o: ra ? 1 - kk : 0, x: ra ? PEGX[ra[r]] : 0 }); return; }
          const xa = ra ? PEGX[ra[r]] : PEGX[rb[r]], xb = PEGX[rb[r]];
          S(el, { o: ra ? 1 : kk, x: lerp(xa, xb, E.io3(clamp(u / 0.8))), y: 0 });
        });
        // call stack (frames: [main] + hanoi frames)
        const disp = [{ main: true }].concat(e.stack);
        const prevLen = pv.stack.length + 1;
        frames.forEach((el, d) => {
          let f = disp[d], op = 1, dx = 0;
          if (!f && d < prevLen && pv.stack.length > e.stack.length) { f = [{ main: true }].concat(pv.stack)[d]; op = 1 - kk; }
          if (!f) { S(el, { o: 0 }); return; }
          if (d === disp.length - 1 && pv.stack.length < e.stack.length) { op = kk; dx = (1 - kk) * 40; }
          const active = d === disp.length - 1;
          const key = (f.main ? "main" : fr(f) + f.s) + active;
          if (el._k !== key) { el._k = key; el.innerHTML = f.main ? '<span>main()</span><span style="color:rgba(255,255,255,.45);font-size:15px">hanoi_tower(3,…) 대기</span>' : `<span>${fr(f)}</span><span style="color:#ffd479;font-weight:800">${f.s || ""}</span>`; el.style.background = active ? "color-mix(in srgb, var(--acc) 26%, rgba(255,255,255,.04))" : "rgba(255,255,255,.06)"; el.style.borderColor = active ? "var(--acc)" : "rgba(255,255,255,.12)"; }
          S(el, { o: op * K(t, 0.6, 0.5), y: -dx });
        });
        // output terminal
        txt(term, (e.mv && u < 2.3 ? e.out.slice(0, -1) : e.out).join("\n"));
      };
    },
    caps: EV.map((e, j) => [e.a + 0.1, e.a + e.d - 0.05, e.cap]),
  });
})();

/* ---------- 5. 호출 트리로 정리 ---------- */
dia(9, "호출 트리로 보기", 22, root => {
  const svg = svgLayer(root);
  const nodes = [
    { id: "3", txt: "h(3, A,B,C)", x: 960, y: 210 },
    { id: "2a", txt: "h(2, A,C,B)", x: 520, y: 400 }, { id: "2b", txt: "h(2, B,A,C)", x: 1400, y: 400 },
    { id: "1a", txt: "h(1, A,B,C)", x: 290, y: 600 }, { id: "1b", txt: "h(1, C,A,B)", x: 750, y: 600 }, { id: "1c", txt: "h(1, B,C,A)", x: 1170, y: 600 }, { id: "1d", txt: "h(1, A,B,C)", x: 1630, y: 600 },
  ];
  const E2 = [["3", "2a"], ["3", "2b"], ["2a", "1a"], ["2a", "1b"], ["2b", "1c"], ["2b", "1d"]];
  const map = {}; nodes.forEach(n => map[n.id] = n);
  const ar = E2.map(([a, b]) => arrow(svg, [[map[a].x, map[a].y + 36], [map[b].x, map[b].y - 36]], { c: "rgba(255,255,255,.35)", head: 0 }));
  const els = nodes.map(n => at(root, n.x, n.y, "mono", n.txt, { fontSize: 26, fontWeight: 700, padding: "14px 22px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", whiteSpace: "nowrap" }, true));
  // moves in order: 1a(1:A→C), 2a(2:A→B), 1b(1:C→B), 3(3:A→C), 1c(1:B→A), 2b(2:B→C), 1d(1:A→C)
  const order = [["1a", "1: A→C"], ["2a", "2: A→B"], ["1b", "1: C→B"], ["3", "3: A→C"], ["1c", "1: B→A"], ["2b", "2: B→C"], ["1d", "1: A→C"]];
  const badges = order.map(([id, s], i) => at(root, map[id].x, map[id].y + 62, "mono", `<b style="color:#ffd479">${i + 1}</b> ${s}`, { fontSize: 22, padding: "4px 12px", borderRadius: 999, background: "rgba(255,212,121,.12)", border: "1px solid rgba(255,212,121,.45)", whiteSpace: "nowrap" }, true));
  const f = at(root, 960, 790, "", `원판 n개 → 이동 <b style="color:var(--acc)">2ⁿ − 1</b>번 &nbsp;·&nbsp; 3개 = 7번, 10개 = 1,023번, 64개 = 약 1.8 × 10¹⁹번`, { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }, true);
  return t => {
    els.forEach((e, i) => pop(e, t, 0.4 + (i === 0 ? 0 : i < 3 ? 0.6 : 1.2) + i * 0.08));
    ar.forEach((a, i) => a.set(K(t, 0.8 + (i < 2 ? 0 : 0.6) + i * 0.05, 0.5)));
    badges.forEach((b, i) => { pop(b, t, 4.4 + i * 1.1); glow(els[nodes.findIndex(n => n.id === order[i][0])], K(t, 4.4 + i * 1.1, 0.2) * (1 - K(t, 5.3 + i * 1.1, 0.4)), "#ffd479"); });
    blurIn(f, t, 13.6);
  };
}, [[0.6, 4.2, "지금까지의 호출을 나무 모양으로 그리면"], [4.4, 12.4, "이동은 **왼쪽 가지 → 자기 자신 → 오른쪽 가지** 순서로 일어난다 (①→②→③)"], [13.6, 21.6, "호출 하나가 같은 문제를 원판 하나 적게 두 번 부른다 → 이동 횟수가 두 배씩 늘어난다"]]);
