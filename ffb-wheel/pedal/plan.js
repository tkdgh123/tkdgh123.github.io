// 부품 이름·자르기 계획. 치수는 geo.js에서만 가져온다.
import * as G from "./geo.js";

export const BOARD = { w: 1200, h: 400 };   // 미송 집성목 15T 400×1200
export const KERF = 3;

const stripW = (G.PEDAL.width - G.SLOT) / 2;                         // 아랫장 한 쪽 폭 39
const screwX = [40, 120, 175, 225];                                   // 아랫장→윗장 피스, O(15)·A(81.8) 구멍을 피함

// 나무 조각: 번호 = 3D 이름표·배치도·도면에서 같은 번호
export const PIECES = {
  base:    { no: 1,  name: "받침판",       w: G.BASE.x1 - G.BASE.x0, h: 2 * G.BASE.half, q: 1, what: "모든 받이를 세우는 바닥판" },
  top:     { no: 2,  name: "발판 윗장",    w: G.PEDAL.back + G.PEDAL.len, h: G.PEDAL.width, q: 1, what: "발이 닿는 판. 밑면 가운데에 A 홈" },
  bot:     { no: 3,  name: "발판 아랫장",  w: G.PEDAL.back + G.PEDAL.len, h: stripW, q: 2, what: `윗장 밑에 붙는 두 쪽. 사이 ${G.SLOT}mm가 발판 홈`, screws: screwX },
  body:    { no: 4,  name: "막대 몸통",    w: G.STRUT.stem / 2 + G.S, h: G.STRUT.head, q: 1, what: "T자. 둥근 끝이 A핀, 머리 앞면이 C" },
  pad:     { no: 5,  name: "머리 덧판",    w: G.STRUT.head, h: G.T, q: 2, what: "막대 몸통 머리 양옆. 머리 두께를 45로" },
  hinge:   { no: 6,  name: "힌지 받이",    w: G.HINGE.w, h: G.HINGE.h, q: 2, what: "회전축 O를 받치는 기둥, 베어링 자리" },
  brk:     { no: 7,  name: "B 받이",       w: G.BRK.w, h: G.BRK.h, q: 2, what: "B 블록 양옆 기둥, B핀이 지나감" },
  trunTop: { no: 8,  name: "B 블록 윗장",  w: 2 * G.TRUN.zHalf, h: G.TRUN.w, q: 1, what: "스프링 자리(Ø20)가 뚫린 쪽, C를 향함" },
  trunBot: { no: 9,  name: "B 블록 아랫장", w: 2 * G.TRUN.zHalf, h: G.TRUN.w, q: 1, what: "안내봉 구멍(Ø8.5). 윗장과 붙인 면이 B" },
  stop:    { no: 10, name: "멈춤 블록",    w: G.STOP.len, h: 20, q: 6, what: "3장씩 쌓아 발판을 15°에서 멈춤" },
  sensor:  { no: 11, name: "센서 받이",    w: 40, h: 50, q: 1, what: "회전축 끝 AS5600을 붙이는 기둥" },
};
export const HARDWARE = [
  ["회전축", "M8 전산볼트 170", "O. 힌지 받이–발판–힌지 받이, 발판과 같이 돎"],
  ["A핀", "M8 전산볼트 115", "A. 발판–막대 몸통–발판"],
  ["B핀", "M8 전산볼트 40 × 2", "B. B 받이 바깥에서 B 블록 옆으로"],
  ["안내봉", "M8 전산볼트 145", "C 면 → 스프링 속 → B 블록 밖, 끝 너트 2개"],
  ["스프링", "1.2×17.85×78.4 × 1", "C와 B 사이, 78 → 39mm"],
  ["베어링", "608ZZ × 2", "힌지 받이 베어링 자리"],
  ["자석 · AS5600", "모듈 1", "회전축 왼쪽 끝 · 센서 받이"],
  ["너트 · 와셔 · 피스", "M8 · 17×1T · 6×25", "철물 표 참고"],
];
export const GROUPS = [
  ["발판", "발판 윗장 + 발판 아랫장 2쪽 (두께 30)"],
  ["스프링 막대", "막대 몸통 + 머리 덧판 + 안내봉 + 스프링"],
  ["B 블록", "B 블록 윗장 + 아랫장 (두께 30)"],
];
export const FEATURES = [
  ["발판 홈", `아랫장 두 쪽 사이 틈, 폭 ${G.SLOT} · 깊이 15 · 발판 길이 전체`],
  ["A 홈", `윗장 밑면 A 둘레, 길이 ${G.POCKET.x1 - G.POCKET.x0} · 폭 ${G.SLOT} · 깊이 ${G.POCKET.depth}`],
  ["베어링 자리", "힌지 받이 발판 쪽 면, Ø22 깊이 7"],
  ["스프링 자리", "B 블록 윗장 Ø20 구멍, 스프링 끝이 B까지 들어감"],
];
export const POINTS = [
  ["O", "회전축 중심"], ["A", "A핀 중심 (OA = 발판 두께 한가운데)"], ["B", "B핀 중심 (O와 같은 높이)"],
  ["C", "머리 앞면 가운데 = 스프링 시작"], ["D · E", "머리 뒷면 양 끝 (DE 40)"], ["P", "발판 밑면 (OA에서 15)"], ["Q", "머리 뒷면 줄 (C에서 15)"],
];

// 판 배치 (x = 판 길이 = 결 방향). w/h는 판 위 크기, rot = 도면과 90° 돌려 놓음
const K = KERF, c2 = 2 * G.BASE.half + K;
const items = [{ k: "base", x: 0, y: 0, w: 2 * G.BASE.half, h: G.BASE.x1 - G.BASE.x0, rot: true }];
let y = 0;
items.push({ k: "top", x: c2, y, w: PIECES.top.w, h: PIECES.top.h }); y += PIECES.top.h + K;
for (let i = 0; i < 2; i++) { items.push({ k: "bot", x: c2, y, w: PIECES.bot.w, h: PIECES.bot.h }); y += PIECES.bot.h + K; }
items.push({ k: "body", x: c2, y, w: PIECES.body.w, h: PIECES.body.h }); y += PIECES.body.h + K;
const col = i => c2 + i * (40 + K);
[["hinge", 0], ["hinge", 1], ["sensor", 2], ["brk", 3], ["brk", 4]].forEach(([k, i]) => items.push({ k, x: col(i), y, w: 40, h: PIECES[k].h }));
y += 50 + K;
items.push({ k: "trunTop", x: col(0), y, w: 40, h: 45, rot: true }, { k: "trunBot", x: col(1), y, w: 40, h: 45, rot: true });
for (let i = 2; i < 5; i++) for (let j = 0; j < 2; j++) items.push({ k: "stop", x: col(i), y: y + j * (20 + K), w: 40, h: 20 });
y += 45 + K;
for (let i = 0; i < 2; i++) items.push({ k: "pad", x: col(i), y, w: 40, h: G.T });
export const LAYOUT = { items, usedX: Math.max(...items.map(i => i.x + i.w)) };

// M8 전산볼트 (1m에서 자름)
const up5 = v => Math.ceil(v / 5) * 5;
export const RODS = [
  { name: "회전축", len: up5(2 * G.AXLE_HALF), q: 1 },
  { name: "A핀", len: up5(2 * G.APIN_HALF), q: 1 },
  { name: "B핀", len: up5(G.BRK.z0 + G.T + G.WASH + G.NUT + 2 - (G.TRUN.zHalf - G.BPIN_IN)), q: 2 },
  { name: "안내봉", len: up5(G.ROD.embed + G.ROD.beyond), q: 1 },
];

// 받침판 위 고정 부품 자리 (위에서 본 좌표: x = 뒤 모서리부터, z = 한쪽 긴 모서리부터)
export function mountPositions() {
  const X = x => x - G.BASE.x0, Z = z => z + G.BASE.half;
  const r = (k, x0, x1, z0, z1) => ({ k, x0: X(x0), x1: X(x1), z0: Z(Math.min(z0, z1)), z1: Z(Math.max(z0, z1)) });
  const Hz = G.HINGE.z0, Bz = G.BRK.z0, T = G.T, S = G.STOP;
  return [
    r("hinge", -20, 20, Hz, Hz + T), r("hinge", -20, 20, -Hz, -Hz - T),
    r("sensor", -20, 20, G.SENSOR_Z - T, G.SENSOR_Z),
    r("stop", S.x, S.x + S.len, S.z0, S.z1), r("stop", S.x, S.x + S.len, -S.z0, -S.z1),
    r("brk", G.OB - 20, G.OB + 20, Bz, Bz + T), r("brk", G.OB - 20, G.OB + 20, -Bz, -Bz - T),
  ];
}
