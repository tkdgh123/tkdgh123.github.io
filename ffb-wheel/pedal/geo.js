// 액셀 페달 치수 (mm) — 사용자 3D 시안 구조 + 「회전 기구 기하 문제 풀이」 식.
// 옆에서 본 면 = x(앞뒤)·y(위), z = 폭. 받침판 윗면 y=0, 회전축 O = (0, H).
// 안내봉(M8 전산볼트)이 스프링 속을 지나 U 앞벽 가운데(C)에 너트 2개로 고정되고, B 판을 뚫고 뒤로 빠져나감.
// src: 스케치 · 사용자 · 문서 · 부품(신청서) · 재료(15T) · 정함(Claude가 정한 값) · ?(아직 모름 → 임시값 def로 그림)
export const SPEC = [
  ["pedalLen",   "발판 길이",                 250,   "스케치"],
  ["pedalDepth", "발판 폭 (옆에서 본 두께)",  30,    "스케치"],
  ["pedalT",     "발판 두께 (앞에서 본 15T)", 15,    "스케치"],
  ["oFromEnd",   "발판 아래 끝 → O 구멍",     15,    "스케치"],
  ["AC",         "A → C (막대 몸통 11.03)",   110.3, "스케치"],
  ["boxH",       "막대 몸통 높이 = DE",       40,    "스케치"],
  ["bPlateH",    "B 판 높이",                 60,    "스케치"],
  ["baseLen",    "받침판 길이",               300,   "사용자"],
  ["springFree", "스프링 놓음 길이 (CB 최대)", 78,   "사용자"],
  ["springMin",  "스프링 최대로 눌린 길이",   39,    "사용자"],
  ["degRest",    "놓았을 때 ∠AOB",            60,    "문서"],
  ["degPress",   "끝까지 밟았을 때 ∠AOB",     15,    "문서"],
  ["springOD",   "스프링 바깥지름",           17.85, "부품"],
  ["rodD",       "전산볼트 지름",             8,     "부품"],
  ["T",          "판 두께",                   15,    "재료"],
  ["holeClr",    "볼트 구멍 여유 (지름)",     1,     "정함"],
  ["holePlay",   "B 구멍 위아래 여유",        6,     "정함"],
  ["baseW",      "받침판 폭",                 90,    "?"],
  ["gap",        "발판 옆 틈 (U 옆벽·O 받이, 한쪽)", 1, "?"],
  ["H",          "O·B 높이 (받침판 윗면 위)", 25,    "?"],
  ["oPostW",     "O 받이 앞뒤 길이",          30,    "?"],
].map(([key, label, def, src]) => ({ key, label, def, src }));
export const NUT = 6.5, WASH = 1, NUT_R = 7.2;   // M8 너트 높이·와셔 1T·너트 꼭짓점 반지름

const rad = d => d * Math.PI / 180;
// 문서 식 일반형: r²+b²−2rb·cos a = (s+L)², 두 자세 (a1, L1), (a2, L2), OA<OB
export function solve(s, L1, L2, a1, a2) {
  const q1 = (s + L1) ** 2, q2 = (s + L2) ** 2, c1 = Math.cos(rad(a1)), c2 = Math.cos(rad(a2));
  const rb = (q1 - q2) / (2 * (c2 - c1)), sum2 = q1 + 2 * rb * c1;
  const p = Math.sqrt(sum2 + 2 * rb), d = Math.sqrt(Math.max(0, sum2 - 2 * rb));
  return { r: (p - d) / 2, b: (p + d) / 2 };
}

const rect = (P, a, b, a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([s, t]) => [P[0] + s * a[0] + t * b[0], P[1] + s * a[1] + t * b[1]]);
const circle = (P, r, k = 36) => Array.from({ length: k }, (_, i) => [P[0] + r * Math.cos(i / k * 2 * Math.PI), P[1] + r * Math.sin(i / k * 2 * Math.PI)]);
const box = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
function sat(P, Q) { for (const R of [P, Q]) for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length], nx = b[1] - a[1], ny = a[0] - b[0]; const pr = X => X.map(p => p[0] * nx + p[1] * ny), p = pr(P), q = pr(Q); if (Math.max(...p) < Math.min(...q) || Math.max(...q) < Math.min(...p)) return false; } return true; }
function segd(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1]; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
export function dist(P, Q) { if (sat(P, Q)) return -1; let d = 1e9; for (const [X, Y] of [[P, Q], [Q, P]]) for (const p of X) for (let i = 0; i < Y.length; i++) d = Math.min(d, segd(p, Y[i], Y[(i + 1) % Y.length])); return d; }
const distAll = (A, B) => Math.min(...A.flatMap(a => B.map(b => dist(a, b))));   // 볼록 조각 여러 개끼리

export function build(vals = {}) {
  const V = {}; SPEC.forEach(s => V[s.key] = Number.isFinite(vals[s.key]) ? vals[s.key] : s.def);
  const T = V.T, S = V.AC, H = V.H;
  const { r: OA, b: OB } = solve(S, V.springFree, V.springMin, V.degRest, V.degPress);
  const PEDAL = { len: V.pedalLen, back: V.oFromEnd, depth: V.pedalDepth, t: V.pedalT };
  // 막대 몸통: 옆벽 A 쪽 끝 = A 중심 반원(R = 높이/2)
  const BOX = { h: V.boxH, gap: V.gap }; BOX.r = BOX.h / 2; BOX.back = BOX.r; BOX.inner = PEDAL.t + 2 * BOX.gap; BOX.zIn = BOX.inner / 2; BOX.zOut = BOX.zIn + T;
  // B 판: 스프링 쪽 면 가운데 = B, 볼트 구멍이 판을 관통
  const BPLATE = { h: V.bPlateH, face: OB };
  const BASE = { x1: OB + T, half: V.baseW / 2, len: V.baseLen }; BASE.x0 = BASE.x1 - BASE.len; V.rear = -BASE.x0;
  // O 받이: 위쪽 = O 중심 반원(R = 앞뒤/2)
  const OPOST = { w: V.oPostW, r: V.oPostW / 2, z0: PEDAL.t / 2 + V.gap }; OPOST.h = H + OPOST.r;
  const OPIN_HALF = OPOST.z0 + T + WASH + NUT + 2, APIN_HALF = BOX.zOut + WASH + NUT + 2;
  // 안내봉: C 뒤(U 안쪽)로 앞벽 + 와셔 + 너트, C 앞으로 스프링 최대 길이 + B 판 + 와셔 + 너트
  const ROD = { inB: T + WASH + NUT + 2, out: V.springFree + T + WASH + NUT + 2 }; ROD.len = Math.ceil((ROD.inB + ROD.out) / 5) * 5; ROD.out = ROD.len - ROD.inB;

  function pose(deg) {
    const th = rad(deg), u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]];
    const O = [0, H], A = [OA * u[0], H + OA * u[1]], B = [OB, H];
    const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const w = [(B[0] - A[0]) / AB, (B[1] - A[1]) / AB], m = [-w[1], w[0]];
    const C = [A[0] + S * w[0], A[1] + S * w[1]];
    return { deg, u, n, O, A, B, C, w, m, AB, CB: AB - S };
  }
  function parts(deg) {
    const p = pose(deg), { O, A, C, u, n, w, m } = p, hd = PEDAL.depth / 2, hb = BOX.r;
    return {
      p,
      pedal: rect(O, u, n, -PEDAL.back, PEDAL.len - PEDAL.back, -hd, hd),
      side: [rect(A, w, m, 0, S - T, -hb, hb), circle(A, hb)],
      front: rect(A, w, m, S - T, S, -hb, hb),
      innerNut: rect(A, w, m, S - T - WASH - NUT, S - T, -NUT_R, NUT_R),          // U 안쪽 너트 + 와셔 (발판과 같은 z)
      rodIn: rect(A, w, m, S - ROD.inB, S - T - WASH - NUT, -V.rodD / 2, V.rodD / 2),
      rodOut: rect(C, w, m, 0, ROD.out, -V.rodD / 2, V.rodD / 2),
      backNut: rect(C, w, m, p.CB + T, p.CB + T + WASH + NUT, -NUT_R, NUT_R),     // 고정 위치가 아니라 볼트 끝 쪽 → 아래에서 실제 위치로
      spring: rect(C, w, m, 0, p.CB, -V.springOD / 2, V.springOD / 2),
      D: [C[0] - T * w[0] + hb * m[0], C[1] - T * w[1] + hb * m[1]],
      E: [C[0] - T * w[0] - hb * m[0], C[1] - T * w[1] - hb * m[1]],
    };
  }
  function clearanceP(deg) {   // DE(U 앞벽 안쪽 면) ↔ P(발판의 B 쪽 면)
    const q = parts(deg), { O, n } = q.p, d = X => (X[0] - O[0]) * -n[0] + (X[1] - O[1]) * -n[1];
    return Math.min(d(q.D), d(q.E)) - PEDAL.depth / 2;
  }
  // 뒤 너트: 놓았을 때(CB 최대) B 판 뒷면에 닿게 고정 → C에서 늘 같은 거리
  const NUT_AT = V.springFree + T;
  // B 구멍: 좌우 = 볼트 지름 + 여유, 위아래 = 볼트가 기울며 판을 지나가는 높이 + 여유
  const SLOT = (() => {
    let lo = 1e9, hi = -1e9; const r = V.rodD / 2;
    for (let deg = V.degPress; deg <= V.degRest + 1e-9; deg += .5) { const p = pose(deg);
      for (let s = 0; s <= T; s += .5) { const cy = p.B[1] + s * p.w[1] / p.w[0] - H, ry = r / Math.abs(p.w[0]); lo = Math.min(lo, cy - ry); hi = Math.max(hi, cy + ry); } }
    const need = hi - lo;
    return { w: V.rodD + V.holeClr, h: Math.ceil(need + V.holePlay), need, lo, hi, cy: H + (lo + hi) / 2 };
  })();
  function check() {
    const base = box(-1e4, 1e4, -1e3, 0), bplate = box(BPLATE.face, BPLATE.face + T, 0, BPLATE.h);
    const post = [box(-OPOST.w / 2, OPOST.w / 2, 0, H), circle([0, H], OPOST.r)];
    const res = {}, put = (k, d, deg) => { if (!res[k] || d < res[k].d) res[k] = { d, deg }; };
    for (let deg = V.degPress; deg <= V.degRest + 1e-9; deg += .5) {
      const q = parts(deg), p = q.p, { C, w, m } = p;
      const backNut = rect(C, w, m, NUT_AT + WASH, NUT_AT + WASH + NUT, -NUT_R, NUT_R), rodEnd = rect(C, w, m, 0, ROD.out, -V.rodD / 2, V.rodD / 2);
      put("DE–P (문서 조건)", clearanceP(deg), deg);
      put("U 안쪽 너트 ↔ 발판", Math.min(dist(q.innerNut, q.pedal), dist(q.rodIn, q.pedal)), deg);
      put("발판 ↔ 받침판", dist(q.pedal, base), deg);
      put("발판 ↔ B 판", dist(q.pedal, bplate), deg);
      put("막대 몸통 ↔ 받침판", Math.min(distAll(q.side, [base]), dist(q.front, base)), deg);
      put("막대 몸통 ↔ O 받이", distAll(q.side, post), deg);
      put("막대 몸통 ↔ B 판", Math.min(dist(q.front, bplate), distAll(q.side, [bplate])), deg);
      put("스프링 ↔ 받침판", dist(q.spring, base), deg);
      put("안내봉·뒤 너트 ↔ 받침판", Math.min(dist(rodEnd, base), dist(backNut, base)), deg);
    }
    return { res };
  }
  return { V, T, S, H, OA, OB, PEDAL, BOX, BPLATE, BASE, SLOT, OPOST, ROD, NUT_AT, OPIN_HALF, APIN_HALF, pose, parts, clearanceP, check };
}
