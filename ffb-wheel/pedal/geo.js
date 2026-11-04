// 액셀 페달 치수 (mm). 기준: 「회전 기구 기하 문제 풀이」 2단계 + 부품구입신청서 실제 규격.
// 옆에서 본 면 = x(앞뒤)·y(위), z = 폭. 받침판 윗면 y=0, 회전축 O = (0, H).
export const T = 15;                 // 미송 집성목 15T
export const S = 116;                // AC (문서 최솟값 105.3 + 간격 여유)
export const SPRING = { wire: 1.2, od: 17.85, free: 78.4 };         // 1.2×17.85×78.4, 가운데 1개
export const CB_MAX = 78, CB_MIN = 39;                               // 문서: CB 7.8 → 3.9cm
export const DEG_REST = 60, DEG_PRESS = 15;                          // ∠AOB
export const H = 30;                 // O·B 높이(받침판 윗면 위)

// 문서 식: r²+b²−rb=(s+7.8)², r²+b²−2rb·cos15°=(s+3.9)², OA<OB
export function solve(s) {
  const L1 = (s + CB_MAX) ** 2, L2 = (s + CB_MIN) ** 2, c = Math.cos(15 * Math.PI / 180);
  const rb = (L1 - L2) / (2 * c - 1), sum2 = L1 + rb;
  const p = Math.sqrt(sum2 + 2 * rb), d = Math.sqrt(sum2 - 2 * rb);
  return { r: (p - d) / 2, b: (p + d) / 2 };
}
export const { r: OA, b: OB } = solve(S);

// 발판: 윗장 1 + 아랫장 2쪽을 붙인 30mm 통판. OA = 두께 한가운데(붙인 면), P = 밑면
export const PEDAL = { len: 225, back: 15, width: 95, thick: 2 * T };
export const SLOT = 17;                                              // 발판 홈 폭 = 아랫장 두 쪽 사이 틈
export const POCKET = { x0: -11, x1: 30, depth: 11 };                     // A 홈: 윗장 밑면, A 둘레 (OA 기준 x, 깊이)
export const STRUT = { stem: 18, head: 40, zHalf: 22.5 };            // 막대 몸통 15T 1장(폭 18) + 머리 덧판 2장 → 머리 두께 45
export const TRUN = { w: 40, zHalf: 22.5 };                          // B 블록: 45×40 두 장을 스프링 방향으로 겹침
export const HINGE = { w: 40, h: 50, z0: 57.5 };                     // 힌지 받이 (608ZZ)
export const BRK = { w: 40, h: 45, z0: 24.5 };                       // B 받이
export const BASE = { x0: -50, x1: 300, half: 110 };                 // 받침판 350×220
export const NUT = 6.5, WASH = 1, NUT_AC = 14.4;
export const AXLE_HALF = HINGE.z0 + T + WASH + NUT + 4;               // 회전축 반길이 84
export const SENSOR_Z = -(AXLE_HALF + 2.5 + 1.5 + 2.6);               // 자석 2.5 + 간격 1.5 + 보드·칩 2.6
export const APIN_HALF = PEDAL.width / 2 + WASH + NUT + 2;            // A핀 반길이 57
export const BPIN_IN = 11;                                           // B핀이 B 블록에 들어가는 깊이

// 멈춤 블록: 15T 3겹, 발판 아래 양옆. 뒤 모서리에서 발판 밑면이 15°에 정확히 닿음
export const STOP = { h: 3 * T, len: 40, z0: 27.5, z1: 47.5 };
STOP.x = (STOP.h - H + (PEDAL.thick / 2) / Math.cos(15 * Math.PI / 180)) / Math.tan(15 * Math.PI / 180);

const rad = d => d * Math.PI / 180;
export function pose(deg) {
  const th = rad(deg), u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]];
  const O = [0, H], A = [O[0] + OA * u[0], O[1] + OA * u[1]], B = [OB, H];
  const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const w = [(B[0] - A[0]) / AB, (B[1] - A[1]) / AB], m = [-w[1], w[0]];
  const C = [A[0] + S * w[0], A[1] + S * w[1]];
  return { deg, u, n, O, A, B, C, w, m, AB, CB: AB - S };
}
const rect = (P, a, b, a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([s, t]) => [P[0] + s * a[0] + t * b[0], P[1] + s * a[1] + t * b[1]]);
const circle = (P, r, k = 32) => Array.from({ length: k }, (_, i) => [P[0] + r * Math.cos(i / k * 2 * Math.PI), P[1] + r * Math.sin(i / k * 2 * Math.PI)]);

export const ROD = { embed: 35, beyond: CB_MAX + T + WASH + 2 * NUT + 2 };   // C면 기준
export function parts(deg) {
  const p = pose(deg), { O, A, B, C, u, n, w, m } = p, L = PEDAL, h = L.thick / 2, Ax = OA;
  return {
    p,
    pedal: rect(O, u, n, -L.back, L.len, -h, h),                                   // 바깥 모양 (z 전체)
    topLeft: rect(O, u, n, -L.back, Ax + POCKET.x0, 0, h),                        // 홈 폭(z ±8.5) 안에 남는 윗장
    topRight: rect(O, u, n, Ax + POCKET.x1, L.len, 0, h),
    topOver: rect(O, u, n, Ax + POCKET.x0, Ax + POCKET.x1, POCKET.depth, h),
    stem: rect(A, w, m, 0, S - T, -STRUT.stem / 2, STRUT.stem / 2),
    eye: circle(A, STRUT.stem / 2),
    head: rect(A, w, m, S - T, S, -STRUT.head / 2, STRUT.head / 2),
    trun: rect(B, w, m, -T, T, -TRUN.w / 2, TRUN.w / 2),
    rod: rect(C, w, m, -ROD.embed, ROD.beyond, -4, 4),
    rodNut: rect(C, w, m, p.CB + T + WASH, ROD.beyond - 2, -NUT_AC / 2, NUT_AC / 2),
    spring: rect(C, w, m, 0, p.CB, -SPRING.od / 2, SPRING.od / 2),
    D: [C[0] - T * w[0] + 20 * m[0], C[1] - T * w[1] + 20 * m[1]],
    E: [C[0] - T * w[0] - 20 * m[0], C[1] - T * w[1] - 20 * m[1]],
  };
}
// 문서 검사: DE와 직선 P(OA에서 B 쪽 15mm = 발판 밑면) 사이 간격
export function clearanceP(deg) {
  const q = parts(deg), { O, n } = q.p;
  const d = X => (X[0] - O[0]) * -n[0] + (X[1] - O[1]) * -n[1];
  return Math.min(d(q.D), d(q.E)) - PEDAL.thick / 2;
}
