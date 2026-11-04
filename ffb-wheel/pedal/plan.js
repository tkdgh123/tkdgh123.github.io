// 자르기 계획: 조각 목록, 판 배치, 전산볼트 길이. 치수는 geo.js에서만 가져온다.
import * as G from "./geo.js";

export const BOARD = { w: 1200, h: 400 };   // 미송 집성목 15T 400×1200
export const KERF = 3;

const plateScrewX = [40, 120, 175, 225];      // O(15)·A(81.8) 구멍 위를 피함
const railMidY = [G.PEDAL.width / 2 - (G.RAIL.zIn + G.RAIL.zOut) / 2, G.PEDAL.width / 2 + (G.RAIL.zIn + G.RAIL.zOut) / 2];

export const PIECES = {
  base:   { no: "①", name: "받침", w: G.BASE.x1 - G.BASE.x0, h: 2 * G.BASE.half, q: 1, note: "받이들을 세우는 바닥판. 빨간 점선이 회전축 O와 핀 B 줄이에요." },
  plate:  { no: "②", name: "발판", w: G.PEDAL.back + G.PEDAL.len, h: G.PEDAL.width, q: 1, note: "레일 위에 피스 8개(○)로 고정. 회전축에서 앞끝까지 225.",
            screws: plateScrewX.flatMap(x => railMidY.map(y => [x, y])) },
  rail:   { no: "③", name: "레일", w: G.PEDAL.back + G.PEDAL.len, h: G.RAIL.h, q: 2, note: "발판 밑 양쪽 끝. 두 장을 겹쳐 잡고 O·A 구멍을 같이 뚫어요. OA 줄이 레일 한가운데예요.", cutNote: "판에서 30mm 폭으로 켜기" },
  T:      { no: "④", name: "T자 막대", w: G.STRUT.stem / 2 + G.S, h: G.STRUT.head, q: 3, note: "3장을 겹쳐 붙여 두께 45. A 쪽 끝은 반지름 10으로 둥글게, 머리 앞면이 C(스프링 자리), 뒷면이 DE." },
  hinge:  { no: "⑤", name: "힌지 받이", w: 40, h: G.HINGE.h, q: 2, note: "레일 쪽 면에 Ø22 깊이 7(608ZZ 자리), 가운데는 Ø10 관통." },
  sensor: { no: "⑥", name: "센서 받이", w: 40, h: 50, q: 1, note: "회전축 왼쪽 끝 바깥. AS5600 칩 중심이 받침 위 30." },
  brk:    { no: "⑦", name: "B 받이", w: 40, h: G.BRK.h, q: 2, note: "B 블록 양옆. 구멍 중심 높이 30 = 회전축과 같은 높이." },
  trun:   { no: "⑧", name: "B 블록", w: 2 * G.TRUN.zHalf, h: G.TRUN.w, q: 2, note: "두 장을 스프링 방향으로 겹쳐 붙여요(30). 붙인 면이 B, 스프링이 여기까지 들어가 앉아요. 결은 40 방향." },
  stop:   { no: "⑨", name: "멈춤 블록", w: G.STOP.len, h: 20, q: 6, note: `3장씩 겹쳐 높이 45. 뒤 모서리를 O에서 ${G.STOP.x.toFixed(1)}mm에 두면 15°에서 레일이 닿아요.` },
};

// 판 배치 (x = 판 길이 방향 = 결 방향). w/h는 판 위에서의 크기
const K = KERF, c2 = PIECES.plate.w + K + PIECES.T.w + K, c3 = c2 + 40 + K;
const items = [
  { k: "base", x: 0, y: 0, w: PIECES.base.w, h: PIECES.base.h },
  { k: "plate", x: 0, y: PIECES.base.h + K, w: PIECES.plate.w, h: PIECES.plate.h },
];
let y = PIECES.base.h + K + PIECES.plate.h + K;
for (let i = 0; i < 2; i++) { items.push({ k: "rail", x: 0, y, w: PIECES.rail.w, h: PIECES.rail.h }); y += PIECES.rail.h + K; }
y = PIECES.base.h + K;
for (let i = 0; i < 3; i++) { items.push({ k: "T", x: PIECES.plate.w + K, y, w: PIECES.T.w, h: PIECES.T.h }); y += PIECES.T.h + K; }
y = 0;
for (const [k, n] of [["hinge", 2], ["sensor", 1], ["brk", 2], ["stop", 6]]) for (let i = 0; i < n; i++) { items.push({ k, x: c2, y, w: 40, h: PIECES[k].h }); y += PIECES[k].h + K; }
y = 0;
for (let i = 0; i < 2; i++) { items.push({ k: "trun", x: c3, y, w: PIECES.trun.h, h: PIECES.trun.w }); y += PIECES.trun.w + K; }
export const LAYOUT = { items, usedX: Math.max(...items.map(i => i.x + i.w)) };

// M8 전산볼트 (1m에서 자름)
const axle = 2 * G.AXLE_HALF, apin = 2 * (G.RAIL.zOut + G.WASH + G.NUT + 2);
const bpin = G.BRK.z0 + G.T + G.WASH + G.NUT + 2 - (G.TRUN.zHalf - 16.5);
const up5 = v => Math.ceil(v / 5) * 5;
export const RODS = [
  { name: "회전축", len: up5(axle), q: 1 },
  { name: "A핀", len: up5(apin), q: 1 },
  { name: "B핀", len: up5(bpin), q: 2 },
  { name: "안내봉", len: up5(G.ROD.embed + G.ROD.beyond), q: 2 },
];

// 받침 위 고정 부품 자리 (위에서 본 좌표: x = 받침 뒤 모서리부터, z = 받침 한쪽 모서리부터)
export function mountPositions() {
  const X = x => x - G.BASE.x0, Z = z => z + G.BASE.half;
  const r = (x0, x1, z0, z1, c) => ({ x0: X(x0), x1: X(x1), z0: Z(Math.min(z0, z1)), z1: Z(Math.max(z0, z1)), c });
  const H = G.HINGE.z0, Bk = G.BRK.z0, T = G.T;
  return [
    r(-20, 20, H, H + T), r(-20, 20, -H, -H - T),
    r(-20, 20, G.SENSOR_Z - T, G.SENSOR_Z, "#B79BD8"),
    r(G.STOP.x, G.STOP.x + G.STOP.len, 30, 50, "#D9B98F"), r(G.STOP.x, G.STOP.x + G.STOP.len, -30, -50, "#D9B98F"),
    r(G.OB - 20, G.OB + 20, Bk, Bk + T), r(G.OB - 20, G.OB + 20, -Bk, -Bk - T),
  ];
}
