// 액셀 페달 치수 (mm) — 사용자 3D 시안(바탕화면 「3D 시안.jpg」, 2026-11-04) 구조 + 「회전 기구 기하 문제 풀이」 식.
// 옆에서 본 면 = x(앞뒤)·y(위), z = 폭. 받침판 윗면 y=0, 회전축 O = (0, H).
// src: 스케치 · 사용자(말로 준 값) · 문서 · 부품(신청서) · 재료(15T) · ?(아직 모름 → 비어 있으면 임시값 def로 그림)
export const SPEC = [
  ["pedalLen",   "발판 길이",                 250,   "스케치"],
  ["pedalDepth", "발판 폭 (옆에서 본 두께)",  30,    "스케치"],
  ["pedalT",     "발판 두께 (앞에서 본 15T)", 15,    "스케치"],
  ["oFromEnd",   "발판 아래 끝 → O 구멍",     15,    "스케치"],
  ["AC",         "A → C (막대 몸통 11.03)",   110.3, "스케치"],
  ["boxH",       "막대 몸통 높이 = DE",       40,    "스케치"],
  ["bPlateH",    "B 판 높이",                 60,    "스케치"],
  ["baseLen",    "받침판 길이",               300,   "사용자"],
  ["slotPlay",   "B 구멍 위아래 여유",        6,     "정함"],
  ["springFree", "스프링 놓음 길이 (CB 최대)", 78,   "사용자"],
  ["springMin",  "스프링 최대로 눌린 길이",   39,    "사용자"],
  ["degRest",    "놓았을 때 ∠AOB",            60,    "문서"],
  ["degPress",   "끝까지 밟았을 때 ∠AOB",     15,    "문서"],
  ["springOD",   "스프링 바깥지름",           17.85, "부품"],
  ["T",          "판 두께",                   15,    "재료"],
  ["baseW",      "받침판 폭",                 90,    "?"],
  ["gap",        "발판 옆 틈 (U 옆벽·O 받이, 한쪽)", 1, "?"],
  ["boxBack",    "U가 A 뒤로 나온 길이",      15,    "?"],
  ["H",          "O·B 높이 (받침판 윗면 위)", 25,    "?"],
  ["slotDepth",  "B 구멍 깊이",               7,     "?"],
  ["oPostW",     "O 받이 앞뒤 길이 (스케치에 없음)", 30, "?"],
  ["oPostH",     "O 받이 높이 (스케치에 없음)",      45, "?"],
].map(([key, label, def, src]) => ({ key, label, def, src }));
export const NUT = 6.5, WASH = 1;

const rad = d => d * Math.PI / 180;
// 문서 식 일반형: r²+b²−2rb·cos a = (s+L)², 두 자세 (a1, L1), (a2, L2), OA<OB
export function solve(s, L1, L2, a1, a2) {
  const q1 = (s + L1) ** 2, q2 = (s + L2) ** 2, c1 = Math.cos(rad(a1)), c2 = Math.cos(rad(a2));
  const rb = (q1 - q2) / (2 * (c2 - c1)), sum2 = q1 + 2 * rb * c1;
  const p = Math.sqrt(sum2 + 2 * rb), d = Math.sqrt(Math.max(0, sum2 - 2 * rb));
  return { r: (p - d) / 2, b: (p + d) / 2 };
}

const rect = (P, a, b, a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([s, t]) => [P[0] + s * a[0] + t * b[0], P[1] + s * a[1] + t * b[1]]);
const box = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
function sat(P, Q) { for (const R of [P, Q]) for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length], nx = b[1] - a[1], ny = a[0] - b[0]; const pr = X => X.map(p => p[0] * nx + p[1] * ny), p = pr(P), q = pr(Q); if (Math.max(...p) < Math.min(...q) || Math.max(...q) < Math.min(...p)) return false; } return true; }
function segd(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1]; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
export function dist(P, Q) { if (sat(P, Q)) return -1; let d = 1e9; for (const [X, Y] of [[P, Q], [Q, P]]) for (const p of X) for (let i = 0; i < Y.length; i++) d = Math.min(d, segd(p, Y[i], Y[(i + 1) % Y.length])); return d; }

// 값(입력 + 기본값)으로 모든 치수와 자세 계산
export function build(vals = {}) {
  const V = {}; SPEC.forEach(s => V[s.key] = Number.isFinite(vals[s.key]) ? vals[s.key] : s.def);
  const T = V.T, S = V.AC, H = V.H;
  const { r: OA, b: OB } = solve(S, V.springFree, V.springMin, V.degRest, V.degPress);
  const PEDAL = { len: V.pedalLen, back: V.oFromEnd, depth: V.pedalDepth, t: V.pedalT };
  const BOX = { h: V.boxH, back: V.boxBack, gap: V.gap }; BOX.inner = PEDAL.t + 2 * BOX.gap; BOX.zIn = BOX.inner / 2; BOX.zOut = BOX.zIn + T;
  const BPLATE = { h: V.bPlateH, face: OB - V.slotDepth };
  const BASE = { x1: BPLATE.face + T, half: V.baseW / 2, len: V.baseLen }; BASE.x0 = BASE.x1 - BASE.len; V.rear = -BASE.x0;   // 받침판 뒤 끝 → O (계산)
  const OPOST = { w: V.oPostW, h: V.oPostH, z0: PEDAL.t / 2 + V.gap };   // 발판 옆 틈은 U와 같은 값
  const OPIN_HALF = OPOST.z0 + T + WASH + NUT + 2, APIN_HALF = BOX.zOut + WASH + NUT + 2;

  function pose(deg) {
    const th = rad(deg), u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]];
    const O = [0, H], A = [OA * u[0], H + OA * u[1]], B = [OB, H];
    const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const w = [(B[0] - A[0]) / AB, (B[1] - A[1]) / AB], m = [-w[1], w[0]];
    const C = [A[0] + S * w[0], A[1] + S * w[1]];
    return { deg, u, n, O, A, B, C, w, m, AB, CB: AB - S };
  }
  function parts(deg) {
    const p = pose(deg), { O, A, C, u, n, w, m } = p, hd = PEDAL.depth / 2, hb = BOX.h / 2;
    return {
      p,
      pedal: rect(O, u, n, -PEDAL.back, PEDAL.len - PEDAL.back, -hd, hd),
      side: rect(A, w, m, -BOX.back, S - T, -hb, hb),
      front: rect(A, w, m, S - T, S, -hb, hb),
      spring: rect(C, w, m, 0, p.CB, -V.springOD / 2, V.springOD / 2),
      D: [C[0] - T * w[0] + hb * m[0], C[1] - T * w[1] + hb * m[1]],
      E: [C[0] - T * w[0] - hb * m[0], C[1] - T * w[1] - hb * m[1]],
    };
  }
  function clearanceP(deg) {   // DE(U 앞벽 안쪽 면) ↔ P(발판의 B 쪽 면)
    const q = parts(deg), { O, n } = q.p, d = X => (X[0] - O[0]) * -n[0] + (X[1] - O[1]) * -n[1];
    return Math.min(d(q.D), d(q.E)) - PEDAL.depth / 2;
  }
  // 검사: 전 구간 0.5° 간격
  // B 구멍: 좌우 = 스프링 지름 그대로, 위아래 = 스프링이 기울며 지나가는 높이 + 여유
  const SLOT = (() => {
    let lo = 1e9, hi = -1e9; const r = V.springOD / 2;
    for (let deg = V.degPress; deg <= V.degRest + 1e-9; deg += .5) { const p = pose(deg);
      for (let s = 0; s <= V.slotDepth; s += .5) { const cy = p.B[1] - s * p.w[1] - H, ry = r * Math.abs(p.m[1]); lo = Math.min(lo, cy - ry); hi = Math.max(hi, cy + ry); } }
    const need = hi - lo, h = Math.ceil(need + V.slotPlay);
    return { w: V.springOD, h, need, lo, hi, cy: H + (lo + hi) / 2 };
  })();
  function check() {
    const base = box(-1e4, 1e4, -1e3, 0), bplate = box(BPLATE.face, BPLATE.face + T, 0, BPLATE.h), post = box(-OPOST.w / 2, OPOST.w / 2, 0, OPOST.h);
    const res = {}, put = (k, d, deg) => { if (!res[k] || d < res[k].d) res[k] = { d, deg }; };
    for (let deg = V.degPress; deg <= V.degRest + 1e-9; deg += .5) {
      const q = parts(deg), p = q.p;
      put("DE–P (문서 조건)", clearanceP(deg), deg);
      put("발판 ↔ 받침판", dist(q.pedal, base), deg);
      put("발판 ↔ B 판", dist(q.pedal, bplate), deg);
      put("막대 몸통 ↔ 받침판", Math.min(dist(q.side, base), dist(q.front, base)), deg);
      put("막대 몸통 ↔ O 받이", dist(q.side, post), deg);
      put("막대 몸통 ↔ B 판", Math.min(dist(q.front, bplate), dist(q.side, bplate)), deg);
      put("스프링 ↔ 받침판", dist(q.spring, base), deg);
    }
    return { res };
  }
  return { V, T, S, H, OA, OB, PEDAL, BOX, BPLATE, BASE, SLOT, OPOST, OPIN_HALF, APIN_HALF, pose, parts, clearanceP, check };
}
