// 액셀 페달 치수 (mm). 기준: 「회전 기구 기하 문제 풀이」 2단계 + 부품구입신청서 실제 규격.
// 옆에서 본 면 = x(앞뒤)·y(위), z = 폭. 받침 윗면 y=0, 회전축 O = (0, H).
export const T = 15;                 // 미송 집성목 15T
export const S = 116;                // AC (문서 최솟값 105.3 + 간격 여유)
export const SPRING = { wire: 1.2, od: 17.85, free: 78.4, z: 12 };   // 1.2×17.85×78.4, 가운데 z=±12 두 개
export const CB_MAX = 78, CB_MIN = 39;                               // 문서: CB 7.8 → 3.9cm
export const DEG_REST = 60, DEG_PRESS = 15;                          // ∠AOB
export const H = 30;                 // O·B 높이(받침 윗면 위)

// 문서 식: r²+b²−rb=(s+7.8)², r²+b²−2rb·cos15°=(s+3.9)², OA<OB
export function solve(s) {
  const L1 = (s + CB_MAX) ** 2, L2 = (s + CB_MIN) ** 2, c = Math.cos(15 * Math.PI / 180);
  const rb = (L1 - L2) / (2 * c - 1), sum2 = L1 + rb;
  const p = Math.sqrt(sum2 + 2 * rb), d = Math.sqrt(sum2 - 2 * rb);
  return { r: (p - d) / 2, b: (p + d) / 2 };
}
export const { r: OA, b: OB } = solve(S);

export const PEDAL = { len: 225, back: 15, width: 95 };              // O부터 발판 끝 22.5cm, 폭 9.5cm
export const RAIL = { h: 30, zIn: 32.5, zOut: 47.5 };                // 레일 = 15T를 30mm 폭으로, OA가 가운데
export const STRUT = { stem: 20, head: 40, zHalf: 22.5 };             // T자 3겹(45mm), 머리 = DE 4cm, A쪽 끝은 R10 둥글게
export const TRUN = { w: 40, zHalf: 37.5 };                          // B 블록: 75×40 두 겹(축 방향 30)
export const HINGE = { w: 40, h: 50, z0: 57.5 };                     // 608ZZ 받이
export const BRK = { w: 40, h: 45, z0: 39.5 };                       // B 축 받이
export const BASE = { x0: -50, x1: 300, half: 110 };                 // 받침 350×220
export const NUT = 6.5, WASH = 1, NUT_AF = 13, NUT_AC = 14.4;
export const AXLE_HALF = HINGE.z0 + T + WASH + NUT + 4;               // 회전축 반길이 84
export const SENSOR_Z = -(AXLE_HALF + 2.5 + 1.5 + 2.6);               // 자석 2.5 + 간격 1.5 + 보드·칩 2.6

// 15° 멈춤 블록: 15T 3겹, 레일 아래. 뒤 모서리 x에서 레일 밑면이 정확히 닿음
export const STOP = { h: 3 * T, len: 40 };
STOP.x = (STOP.h - H + (RAIL.h / 2) / Math.cos(15 * Math.PI / 180)) / Math.tan(15 * Math.PI / 180);

const rad = d => d * Math.PI / 180;
export function pose(deg) {
  const th = rad(deg), u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]];
  const O = [0, H], A = [O[0] + OA * u[0], O[1] + OA * u[1]], B = [OB, H];
  const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const w = [(B[0] - A[0]) / AB, (B[1] - A[1]) / AB], m = [-w[1], w[0]];
  const C = [A[0] + S * w[0], A[1] + S * w[1]];
  return { deg, u, n, O, A, B, C, w, m, AB, CB: AB - S };
}
// 로컬(along, across) 직사각형 → 옆면 다각형
const rect = (P, a, b, a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([s, t]) => [P[0] + s * a[0] + t * b[0], P[1] + s * a[1] + t * b[1]]);

export const ROD = { embed: 35, beyond: CB_MAX + T + WASH + 2 * NUT + 2 };   // C면 기준
export function parts(deg) {
  const p = pose(deg), { O, A, B, C, u, n, w, m } = p, L = PEDAL;
  return {
    p,
    rail: rect(O, u, n, -L.back, L.len, -RAIL.h / 2, RAIL.h / 2),
    plate: rect(O, u, n, -L.back, L.len, RAIL.h / 2, RAIL.h / 2 + T),
    stem: rect(A, w, m, 0, S - T, -STRUT.stem / 2, STRUT.stem / 2),
    eye: Array.from({ length: 32 }, (_, i) => [A[0] + STRUT.stem / 2 * Math.cos(i / 16 * Math.PI), A[1] + STRUT.stem / 2 * Math.sin(i / 16 * Math.PI)]),
    head: rect(A, w, m, S - T, S, -STRUT.head / 2, STRUT.head / 2),
    trun: rect(B, w, m, -T, T, -TRUN.w / 2, TRUN.w / 2),
    rod: rect(C, w, m, -ROD.embed, ROD.beyond, -4, 4),
    rodNut: rect(C, w, m, p.AB - S + T + WASH, ROD.beyond - 2, -NUT_AC / 2, NUT_AC / 2),
    springs: rect(C, w, m, 0, p.CB, -SPRING.od / 2, SPRING.od / 2),
    D: [C[0] - T * w[0] + 20 * m[0], C[1] - T * w[1] + 20 * m[1]],
    E: [C[0] - T * w[0] - 20 * m[0], C[1] - T * w[1] - 20 * m[1]],
  };
}
// 문서 검사: DE와 직선 P(OA에서 B 쪽 15mm) 사이 간격
export function clearanceP(deg) {
  const q = parts(deg), { O, n } = q.p;
  const d = X => (X[0] - O[0]) * -n[0] + (X[1] - O[1]) * -n[1];   // B 쪽 +
  return Math.min(d(q.D), d(q.E)) - RAIL.h / 2;
}
