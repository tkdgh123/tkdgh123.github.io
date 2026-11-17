// 장내기능시험장 (1종·2종 보통, 2종 자동 기준). 규격은 도로교통법 시행규칙 별표 23(2021.12.31 개정),
// 채점은 별표 24(운전학원 게시 채점표로 확인). 코스 순서는 시험장마다 다를 수 있어 이 맵에 맞게 이음.
// 출발 → 경사로 → (돌발 A) → 가속 → 신호교차로 좌회전 → 직각주차 → 우회전 → (돌발 B) → 종료. 돌발은 A, B 중 한 곳.
import * as THREE from "three";
import { path, offPt, cut, Flat, arcPts, Lines, sign, signalHead, floorText, textTex, SANS } from "./kit.js";
import { CAR, front, wheelsOf } from "./car.js";

const W = 3.5, LANE = 3, PI = Math.PI, TJ = 7; // TJ: 우회전 삼거리 모퉁이 반경
const COL = { grass: "#d3d7c6", asph: "#3e3f44", white: "#f2f1ec", yellow: "#e8b42a", curb: "#d6d3c9", conc: "#8e8c85", apron: "#6f7076" };
// 경사로: 높이 1m, 오르막 12%, 정상 4m, 내리막 8% (S 도로 위, 동쪽으로 오름)
const HX = [-22, -22 + 1 / .12, -22 + 1 / .12 + 4, -22 + 1 / .12 + 4 + 1 / .08];
const lin = x => x <= HX[0] || x >= HX[3] ? 0 : x < HX[1] ? (x - HX[0]) * .12 : x < HX[2] ? 1 : 1 - (x - HX[2]) * .08;
const prof = x => { let s = 0; for (let k = -4; k <= 4; k++) s += lin(x + k * .3); return s / 9; }; // 꺾이는 곳을 둥글게
const hgt = (x, z) => Math.abs(z) < 3.8 && x > HX[0] - 1.5 && x < HX[3] + 1.5 ? prof(x) : 0;
const HILL = { zone: [HX[0] + 1, HX[1] - 1 - .3], top: HX[1] }; // 정지 구간 = 오르막 시작 1m 뒤 ~ 정상 곡선 1m 앞 (앞범퍼 기준)
// 직각주차: 통로 폭 3.5, 차고 폭 3.0, 길이 4.8, 차고 너머 통로 6.5, 모퉁이 반경 1.0, 확인선은 차고 뒤 끝에서 1m. 통로 북쪽 선은 차고 동쪽 끝까지(그 앞은 마당으로 열림)
const PK = { x0: -11, cz0: -71.75, cz1: -68.25, gx0: -15, gx1: -12, gz1: -63.45, dead: -21.5, conf: -64.45 };
const X1 = { x: 0, z: -110 }, T1 = { x: 0, z: -30 };
const START_X = -38, END_X = -58;

export function buildCourse(scene) {
  const fl = new Flat(hgt), lines = new Lines(), boxes = [], wall = new Flat(() => 0);
  // 길: 중심선(진행 방향), 선을 끊을 앞뒤 길이, 연석·바깥선이 비는 곳
  function road(pts, { cutL0 = 0, cutL1 = 0, cutC0 = 0, cutC1 = 0, gaps = [] } = {}) {
    const L = pts.at(-1).s;
    fl.band(pts, -W, W, COL.asph, .02);
    const spans = side => { let segs = [[cutC0, L - cutC1]]; for (const g of gaps.filter(g => g.side === side)) segs = segs.flatMap(([a, b]) => [[a, Math.min(b, g.s0)], [Math.max(a, g.s1), b]]).filter(([a, b]) => b - a > .2); return segs; };
    const cl = cut(pts, cutL0, L - cutL1);
    fl.band(cl, -.075, .075, COL.yellow, .035); lines.addPts(cl, 0, .075, "c");
    for (const sd of [-1, 1]) for (const [a, b] of spans(sd)) {
      const ce = cut(pts, Math.max(a, cutL0), Math.min(b, L - cutL1)); if (ce.length > 1) { fl.band(ce, sd * (LANE - .075), sd * (LANE + .075), COL.white, .035); lines.addPts(ce, sd * LANE, .075, "e"); }
      const cc = cut(pts, a, b); curb(cc, sd);
    }
    return pts;
  }
  function curb(pts, sd, o = W) { // 연석 (높이 12cm, 폭 20cm): 중심선에서 o만큼 떨어진 곳부터 바깥으로
    if (pts.length < 2) return;
    fl.band(pts, sd * o, sd * (o + .2), COL.curb, .12); lines.addPts(pts, sd * (o + .1), .1, "curb");
  }
  function filletAt(cx, cz, sx, sz, RJ = 5) { // 교차로 모퉁이: 연석이 반경 RJ로 휘어 돎
    const c = { x: cx + sx * (W + RJ), z: cz + sz * (W + RJ) }, a0 = sx > 0 ? PI : 0, a1 = sz > 0 ? (sx > 0 ? 1.5 * PI : -PI / 2) : PI / 2;
    const ring = arcPts(c.x, c.z, RJ, a0, a1, 14), corner = { x: cx + sx * W, z: cz + sz * W };
    fl.fan(corner, ring, COL.asph, .02);
    const out = arcPts(c.x, c.z, RJ - .2, a0, a1, 14);
    for (let i = 0; i < ring.length - 1; i++) fl.quad(ring[i], ring[i + 1], out[i + 1], out[i], COL.curb, .12);
    lines.addRing(arcPts(c.x, c.z, RJ - .1, a0, a1, 14), .1, "curb");
  }
  const WX = 8.5; // 교차로 가운데에서 모퉁이가 끝나는 거리

  // 큰 고리 한 길: H(서쪽으로) → 유턴 → S(동쪽, 출발·경사로·종료) → 동남 모퉁이 → E(북쪽, 가속) → 동북 모퉁이 → N(서쪽) → 신호교차로
  const loop = path(35, -30, 1.5 * PI).line(115).arc(15, PI).line(125).arc(15, PI / 2).line(80).arc(15, PI / 2).line(45).pts;
  road(loop, { cutL0: 1, cutC0: 0, cutL1: 11.2, cutC1: WX, gaps: [{ side: 1, s0: 35 - W - TJ, s1: 35 + W + TJ }] });
  const stubN = road(path(0, -110, PI).line(25).pts, { cutL0: 11.2, cutC0: WX, cutL1: 1 });
  const stubW = road(path(0, -110, 1.5 * PI).line(25).pts, { cutL0: 11.2, cutC0: WX, cutL1: 1 });
  const vroad = road(path(0, -110, 0).line(80).pts, { cutL0: 11.2, cutC0: WX, cutL1: W + TJ, cutC1: W + TJ, gaps: [{ side: 1, s0: 24, s1: 56 }] });
  for (const [sx, sz] of [[1, -1], [-1, -1], [1, 1], [-1, 1]]) filletAt(X1.x, X1.z, sx, sz);
  for (const sx of [-1, 1]) filletAt(T1.x, T1.z, sx, -1, TJ);
  // 막다른 끝: 줄무늬 차단봉
  const bar = (x, z, r) => { boxes.push({ x, z, hw: .25, hl: 3.6, r }); const m = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, 7.2), new THREE.MeshStandardMaterial({ map: textTex(64, 512, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#151514" : "#e8b42a"; g.fillRect(0, i * 32, 64, 32); } }) })); m.position.set(x, .5, z); m.rotation.y = r; m.castShadow = true; scene.add(m); };
  bar(0, -134.6, PI / 2); bar(-24.6, -110, 0); bar(34.6, -30, 0);

  // 신호교차로: 횡단보도(폭 2m, 모퉁이 끝 바깥) + 정지선(횡단보도 2m 앞, 폭 30cm, 들어오는 차로만)
  for (const [yaw, dx, dz] of [[1.5 * PI, 1, 0], [PI / 2, -1, 0], [0, 0, -1], [PI, 0, 1]]) { // 들어오는 방향
    const side = { x: -Math.cos(yaw), z: Math.sin(yaw) }; // 들어오는 차의 오른쪽
    const p = d => ({ x: X1.x + dx * d, z: X1.z + dz * d });
    for (let k = -3.15; k < 3.4; k += .9) { const a = p(9), b = p(11), o = { x: side.x * k, z: side.z * k }, w = { x: side.x * .45, z: side.z * .45 };
      fl.quad({ x: a.x + o.x, z: a.z + o.z }, { x: b.x + o.x, z: b.z + o.z }, { x: b.x + o.x + w.x, z: b.z + o.z + w.z }, { x: a.x + o.x + w.x, z: a.z + o.z + w.z }, COL.white, .036); }
    const s0 = p(13), s1 = p(13.3);
    fl.quad({ x: s0.x + side.x * .1, z: s0.z + side.z * .1 }, { x: s1.x + side.x * .1, z: s1.z + side.z * .1 }, { x: s1.x + side.x * 2.95, z: s1.z + side.z * 2.95 }, { x: s0.x + side.x * 2.95, z: s0.z + side.z * 2.95 }, COL.white, .036);
  }
  // 횡단보도 예고 (마름모) — 동쪽에서 오는 시험 차로
  for (const x of [28, 40]) { const c = { x, z: -111.5 }, r = [[1.6, 0], [0, .9], [-1.6, 0], [0, -.9], [1.6, 0]].map(([a, b]) => ({ x: c.x + a, z: c.z + b })), ri = r.map(q => ({ x: c.x + (q.x - c.x) * .8, z: c.z + (q.z - c.z) * .7 }));
    for (let i = 0; i < 4; i++) fl.quad(r[i], r[i + 1], ri[i + 1], ri[i], COL.white, .036); }
  const sig = [ // 신호등: 건너편 오른쪽 모퉁이 기둥, 팔이 들어오는 차로 위로
    { grp: 0, h: signalHead(scene, -12.2, -114.6, PI / 2, 4.2) },   // 동쪽에서 (시험 차로)
    { grp: 0, h: signalHead(scene, 12.2, -105.4, -PI / 2, 4.2) },   // 서쪽에서
    { grp: 1, h: signalHead(scene, -4.6, -97.8, PI, 4.2) },         // 북쪽에서
    { grp: 1, h: signalHead(scene, 4.6, -122.2, 0, 4.2) },          // 남쪽에서
  ];
  for (const [x, z] of [[-12.2, -114.6], [12.2, -105.4], [-4.6, -97.8], [4.6, -122.2]]) boxes.push({ x, z, hw: .15, hl: .15, r: 0 });

  // 경사로: 길 양옆 방호벽(길 위 50cm) + 흙 옆면
  for (const sd of [-1, 1]) for (let x = HX[0] - 1.5; x < HX[3] + 1.5; x += 1) {
    const h0 = prof(x), h1 = prof(x + 1), z0 = sd * 3.72, a = { x, z: z0 }, b = { x: x + 1, z: z0 };
    if (h0 + h1 < .02) continue;
    wall.p.push(...[a, b, b, a, b, a].map((q, i) => [q.x, [0, 0, h1 + .5, 0, h1 + .5, h0 + .5][i], q.z]).flat());
    boxes.push({ x: x + .5, z: sd * 3.78, hw: .5, hl: .12, r: 0 });
  }
  { const k = new THREE.Color(COL.conc); for (let i = 0; i < wall.p.length / 3; i++) wall.c.push(k.r, k.g, k.b); }
  // 경사 구획선 (정지 구간 앞뒤, 30cm) — 오르는 차로만
  for (const x of [HILL.zone[0], HILL.zone[1]]) fl.quad({ x: x - .15, z: .1 }, { x: x + .15, z: .1 }, { x: x + .15, z: 2.9 }, { x: x - .15, z: 2.9 }, COL.white, .036);

  // 직각주차: 길 옆 넓은 마당(시멘트) + 통로·차고 (노란 검지선)
  fl.quad({ x: -3.5, z: -86 }, { x: -3.5, z: -54 }, { x: PK.x0, z: -54 }, { x: PK.x0, z: -86 }, COL.apron, .021);
  fl.quad({ x: PK.x0, z: PK.cz0 - .3 }, { x: PK.x0, z: PK.cz1 }, { x: PK.dead - .3, z: PK.cz1 }, { x: PK.dead - .3, z: PK.cz0 - .3 }, COL.apron, .021);
  fl.quad({ x: PK.gx1 + 1, z: PK.cz1 }, { x: PK.gx1 + 1, z: PK.gz1 + .3 }, { x: PK.gx0 - .3, z: PK.gz1 + .3 }, { x: PK.gx0 - .3, z: PK.cz1 }, COL.apron, .021);
  const yl = (ring, tag = "p", col = COL.yellow, hw = .06) => { for (let i = 0; i < ring.length - 1; i++) { const a = ring[i], b = ring[i + 1], n = { x: -(b.z - a.z), z: b.x - a.x }, l = Math.hypot(n.x, n.z) || 1; n.x *= hw / l; n.z *= hw / l;
    fl.quad({ x: a.x - n.x, z: a.z - n.z }, { x: b.x - n.x, z: b.z - n.z }, { x: b.x + n.x, z: b.z + n.z }, { x: a.x + n.x, z: a.z + n.z }, col, .037); } lines.addRing(ring, hw, tag); };
  fl.quad({ x: PK.x0, z: -76 }, { x: PK.x0, z: PK.cz0 }, { x: PK.gx1 - 1, z: PK.cz0 }, { x: PK.gx1 - 1, z: -76 }, COL.apron, .021); // 통로 입구 앞은 넓게 열림
  yl([{ x: PK.gx1, z: PK.cz0 }, { x: PK.dead, z: PK.cz0 }, { x: PK.dead, z: PK.cz1 }, { x: PK.gx0 - 1, z: PK.cz1 }, ...arcPts(PK.gx0 - 1, PK.cz1 + 1, 1, -PI / 2, 0, 8), { x: PK.gx0, z: PK.gz1 }, { x: PK.gx1, z: PK.gz1 }, { x: PK.gx1, z: PK.cz1 + 1 }, ...arcPts(PK.gx1 + 1, PK.cz1 + 1, 1, PI, 1.5 * PI, 8)]);
  yl([{ x: PK.gx0, z: PK.conf }, { x: PK.gx1, z: PK.conf }], "k", COL.white, .075);
  fl.quad({ x: PK.x0, z: PK.cz1 }, { x: PK.x0, z: -54 }, { x: PK.gx1, z: -54 }, { x: PK.gx1, z: PK.cz1 }, COL.apron, .021); // 차고 옆까지 평평하게 (연석 없음)
  for (const [z, d] of [[-86, 1], [-54, -1]]) curb(path(-3.5, z, -PI / 2).line(7.5).pts, d, 0);

  // 출발·종료 선, 바닥 글씨, 표지판
  const stripe = (x, w) => fl.quad({ x: x - w / 2, z: .08 }, { x: x + w / 2, z: .08 }, { x: x + w / 2, z: 2.92 }, { x: x - w / 2, z: 2.92 }, COL.white, .036);
  stripe(START_X, .5); stripe(END_X, .5);
  floorText(scene, "출발", START_X + 1.9, 1.5, PI / 2, 2.6, 1.3); floorText(scene, "종료", END_X - 1.9, 1.5, PI / 2, 2.6, 1.3);
  const accel = [-35, -75];
  for (const z of accel) fl.quad({ x: 60.1, z: z - .1 }, { x: 62.9, z: z - .1 }, { x: 62.9, z: z + .1 }, { x: 60.1, z: z + .1 }, COL.white, .036);
  const sg = (k, a, x, z, face) => { sign(scene, k, a, x, z, face, { hgt }); boxes.push({ x, z, hw: .1, hl: .1, r: 0 }); };
  sg("max", "20", START_X + 6, 4.4, -PI / 2);
  sg("up", "12%", HX[0] - 3.4, 4.4, -PI / 2); sg("down", "8%", HX[0] - 2.6, 4.4, -PI / 2);
  sg("min", "20", 64.4, accel[0] + 10, 0); sg("max", "20", 64.4, accel[1] + 10, 0);
  sg("cross", "", 20, -114.4, PI / 2);
  sg("park", "", -4.4, -90, PI);
  sg("slow", "", END_X - 7, 4.4, -PI / 2);

  // 둘레: 시험장 건물, 관제탑, 대기 차, 나무
  const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 });
  const blk = (x, z, w, h, d, c, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, h / 2, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m); boxes.push({ x, z, hw: w / 2, hl: d / 2, r: ry }); return m; };
  blk(-10, 26, 46, 8, 12, 0xf2f1ec);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.2), new THREE.MeshBasicMaterial({ map: textTex(1024, 128, (g, w, h) => { g.fillStyle = "#2b44a6"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `700 74px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("운전면허 기능시험장", w / 2, h / 2 + 4); }) }));
  board.position.set(-10, 6, 19.95); board.rotation.y = PI; scene.add(board);
  blk(22, -66, 5, 9, 5, 0xe4e2da); { const g = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x9fb4d8, roughness: .2, metalness: .1, transparent: true, opacity: .85 })); g.position.set(22, 10.2, -66); scene.add(g); blk(22, -66, 6.6, .3, 6.6, 0x151514).position.y = 11.55; }
  for (let i = 0; i < 5; i++) { const x = -60 + i * 4, z = 12; blk(x, z, 1.8, 1.3, 4.5, i % 2 ? 0x2b44a6 : 0xe4e2da); }
  const trunk = mat(0x6b5a48), leaf = [0x4d5b3f, 0x667552, 0x3c4732].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true }));
  let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const tree = (x, z) => { const h = 1.6 + rnd(), t = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, h, 8), trunk); t.position.set(x, h / 2, z); t.castShadow = true; scene.add(t); const r = 1.4 + rnd() * 1.1, l = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf[(rnd() * 3) | 0]); l.position.set(x, h + r * .8, z); l.castShadow = true; scene.add(l); boxes.push({ x, z, hw: .3, hl: .3, r: 0 }); };
  for (let x = -130; x <= 100; x += 9) { tree(x + rnd() * 3, 40 + rnd() * 4); tree(x + rnd() * 3, -158 - rnd() * 4); }
  for (let z = -150; z <= 30; z += 9) { tree(-128 - rnd() * 4, z + rnd() * 3); tree(92 + rnd() * 4, z + rnd() * 3); }
  for (const [x, z] of [[25, -10], [35, -12], [30, -95], [-40, -60], [-55, -75], [-30, -90], [40, -50], [-60, -50]]) tree(x, z);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ color: COL.grass, roughness: 1 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground);
  fl.mesh(scene); wall.mesh(scene);

  // 지도·안내용 시험 경로 (차로 가운데)
  const route = path(START_X - 4, 1.5, PI / 2).line(45 - START_X + 4).arc(16.5, PI / 2).line(80).arc(16.5, PI / 2).line(36.5).arc(10, PI / 2).line(61).arc(9, -PI / 2).line(69.5).arc(16.5, PI).line(END_X + 80 + 3).pts;
  return { name: "장내기능시험", hgt, lines, boxes, sig, route, start: { x: START_X - .4 - CAR.WB - CAR.FO, z: 1.9, yaw: PI / 2 }, bounds: [-135, -165, 100, 45], exam: ctx => exam(ctx, sig, route) };
}

// ── 채점 ──
// 신호교차로 주기 40초: 동서(시험 차로) 0~12 초록+좌회전, 12~15 노랑, 나머지 빨강 / 남북 20~32, 32~35
function lightOf(grp, t) { const u = ((t % 40) + 40) % 40 - grp * 20; return u >= 0 && u < 12 ? { g: 1, l: 1 } : u >= 12 && u < 15 ? { y: 1 } : { r: 1 }; }
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

function exam(ctx, sig, route) {
  const { say, deduct, fail, beep } = ctx;
  const routeLen = route.at(-1).s, limit = routeLen / (15 / 3.6) + 40 + 120 + 300; // 지정시간 (신호 대기 빼고)
  const dol = Math.random() < .5 ? { road: "S", x: 12 + Math.random() * 16 } : { road: "H", x: -18 - Math.random() * 34 };
  const ITEMS = [ // 기본 조작: 넷 중 둘을 무작위로, 이 순서대로 (실제 몇 초 안에 해야 하는지는 공개 자료에 없어 7초로 둠)
    ["기어 변속", () => { const g = Math.random() < .5 ? "N" : "D"; return [[`기어를 ${g}에 넣으세요`, c => c.gear === g], ["기어를 P에 넣으세요", c => c.gear === "P"]]; }],
    ["전조등", () => [["전조등을 켜세요", c => c.lights === 1], ["전조등을 상향 하세요", c => c.lights === 2], ["전조등을 끄세요", c => c.lights === 0]]],
    ["방향지시등", () => { const d = Math.random() < .5 ? 1 : 2; return [[`${d === 1 ? "왼쪽" : "오른쪽"} 방향지시등을 켜세요`, c => c.sig === d], ["방향지시등을 끄세요", c => c.sig === 0]]; }],
    ["와이퍼", () => [["와이퍼를 작동하세요", c => c.wiper], ["와이퍼를 끄세요", c => !c.wiper]]],
  ];
  const pick = [0, 1, 2, 3].sort(() => Math.random() - .5).slice(0, 2).sort();
  const steps = [["안전띠를 매세요", c => c.belt, null]];
  for (const i of pick) for (const [t, f] of ITEMS[i][1]()) steps.push([t, f, ITEMS[i][0]]);
  const tasks = ["pre", "start", "hill", ...(dol.road === "S" ? ["dol"] : []), "accel", "left", "park", "right", ...(dol.road === "H" ? ["dol"] : []), "end"];
  const NAME = { pre: "기본 조작", start: "출발", hill: "경사로", dol: "돌발", accel: "가속 코스", left: "신호교차로 좌회전", park: "직각주차", right: "우회전", end: "종료" };
  const E = { k: 0, t: 0, run: 0, wait: 0, over: 0, alarm: false, done: false, st: {}, lane: 0, curbT: 0, fast: 0, rev: 0, pbDist: 0, prevF: null, laneFree: 0, parkFree: 0 };
  let si = 0, sT = 0, said = -1, penal = new Set();
  const next = () => { E.k++; E.st = {}; };

  function update(dt, c, simT, hits) {
    if (E.done) return;
    const F = front(c), Wh = wheelsOf(c), kmh = Math.abs(c.v) * 3.6, task = tasks[E.k], S = E.st, light = lightOf(0, simT);
    const prev = E.prevF || F; E.prevF = F;
    const started = E.k >= 2;
    if (started) {
      // 지정시간: 신호 기다린 시간은 빼고
      const waiting = task === "left" && c.v === 0 && F.x > 13 && F.x < 45 && F.z < -106 && !light.g;
      if (waiting) E.wait += dt; else E.run += dt;
      if (E.run > limit && Math.floor((E.run - limit) / 5) > E.over) { E.over++; deduct("지정시간", 3, "지정시간을 5초 넘김"); }
      // 차로 준수: 바퀴가 중앙선·차선·길가장자리선에 닿음 (직각주차 마당 안은 그 코스의 검지선으로 봄)
      const inPark = F.x > -24 && F.x < .5 && F.z > -90 && F.z < -50 || Wh.some(w => w.x < -3.4 && w.z > -90 && w.z < -50);
      const laneHit = !inPark && hits.some(h => h.tag === "c" || h.tag === "e");
      if (laneHit) { if (E.laneFree > .5) deduct("차로 준수", 15, "바퀴가 선에 닿음"); E.laneFree = 0; } else E.laneFree += dt;
      if (hits.some(h => h.tag === "curb")) { fail("바퀴가 연석에 닿음"); }
      // 지정 속도: 가속 코스 밖에서 시속 20km 넘음
      const accelZone = F.x > 55 && F.z < -25 && F.z > -83;
      if (kmh > 20.5 && !accelZone) { if (!E.fast) deduct("지정속도", 3, "시속 20km 넘음"); E.fast = 1; } else if (kmh < 19) E.fast = 0;
      // 시동: 4000RPM 넘게 돌리거나 꺼짐
      if (c.rpm >= 4000) { if (!E.rev) deduct("시동 유지", 5, "엔진 4,000RPM 넘음"); E.rev = 1; } else if (c.rpm < 3500) E.rev = 0;
      if (!c.engine && !E.off) { deduct("시동 유지", 5, "시동 꺼짐"); E.off = 1; } else if (c.engine) E.off = 0;
      if (!c.belt && Math.abs(c.v) > .3) fail("안전띠를 매지 않음");
      if (c.pb && c.v > .3) { E.pbDist += c.v * dt; if (E.pbDist > 3) fail("주차 브레이크를 풀지 않고 달림"); } else if (!c.pb) E.pbDist = 0;
    }
    E.t += dt;

    if (task === "pre") {
      const [txt, ok, item] = steps[si];
      if (said !== si) { say(txt); said = si; sT = 0; }
      sT += dt;
      if (sT > 1.2 && ok(c)) { si++; sT = 0; }
      else if (item && sT > 8.2) { if (!penal.has(item)) { deduct("기본 조작", 5, item); penal.add(item); } si++; }
      if (si >= steps.length) { next(); say("출발하세요"); }
    } else if (task === "start") {
      S.t = (S.t || 0) + dt;
      if (S.sig === undefined && c.v > .3) S.sig = c.sig === 1;
      if (!S.crossed && F.x > START_X) { S.crossed = 1; if (!S.sig && c.sig !== 1) deduct("방향지시등", 5, "출발할 때 왼쪽 방향지시등을 켜지 않음"); }
      if (!S.crossed && S.t > 30) { fail("출발 지시 뒤 30초 안에 출발하지 않음"); S.crossed = 1; }
      if (S.crossed && F.x > START_X + 18) { if (c.sig !== 0) deduct("방향지시등", 5, "차로에 들어선 뒤 방향지시등을 끄지 않음"); next(); }
    } else if (task === "hill") {
      const inZ = F.x > HILL.zone[0] && F.x < HILL.zone[1];
      if (!S.ok) {
        if (inZ && c.v === 0) { if (S.x0 === undefined) S.x0 = F.x; S.stop = (S.stop || 0) + dt; if (S.stop >= 3) { S.ok = 1; S.t = 0; beep("ok"); } } else if (c.v !== 0) S.stop = 0;
        if (F.x > HILL.zone[1]) { fail("경사로 정지 구간에서 3초 이상 멈추지 않음"); next(); }
      } else {
        S.t += dt; const back = S.x0 - F.x;
        if (back >= .5 && !S.p) { deduct("경사로", 10, "뒤로 50cm 넘게 밀림"); S.p = 1; }
        if (back >= 1) { fail("경사로에서 뒤로 1m 넘게 밀림"); next(); }
        else if (F.x > HILL.top + 1) next();
        else if (S.t > 30) { fail("경사로 정지 뒤 30초 안에 통과하지 못함"); next(); }
      }
    } else if (task === "dol") {
      const hit = dol.road === "S" ? F.x > dol.x && Math.abs(F.z - 1.5) < 4 : F.x < dol.x && Math.abs(F.z + 31.5) < 4;
      if (!S.on && hit) { S.on = 1; S.t = 0; E.alarm = true; say("돌발"); beep("alarm"); }
      if (S.on) {
        S.t += dt;
        if (S.ts === undefined && c.v === 0) S.ts = S.t;
        if (S.ts === undefined && S.t > 2 && !S.p1) { deduct("돌발", 10, "2초 안에 멈추지 않음"); S.p1 = 1; }
        if (S.ts !== undefined && S.th === undefined) { if (c.hazard) S.th = S.t; else if (S.t - S.ts > 3) { deduct("돌발", 10, "멈춘 뒤 3초 안에 비상등을 켜지 않음"); S.th = S.t; } }
        if (S.th !== undefined && E.alarm && S.t - S.th > 2) { E.alarm = false; say("출발하세요"); }
        if (S.ts === undefined && S.t > 8) { E.alarm = false; next(); }
        else if (!E.alarm && S.th !== undefined && c.v > .5) { if (c.hazard) deduct("돌발", 10, "출발할 때 비상등을 끄지 않음"); next(); }
      }
    } else if (task === "accel") {
      if (F.x > 55 && F.z < -35) { if (kmh < 20 && !S.p) { deduct("가속 코스", 10, "가속 구간에서 시속 20km 미만"); S.p = 1; } if (F.z < -75) next(); }
    } else if (task === "left") {
      if (!S.in && prev.x >= 13 && F.x < 13 && F.z < -106 && F.z > -114.5) {
        S.in = 1; S.sig = c.sig === 1;
        if (light.r) fail("신호 위반 (빨간불에 정지선을 넘음)");
        else if (light.y && S.canStop) fail("신호 위반 (노란불에 정지선을 넘음)");
      }
      if (!S.in && light.y && S.yAt === undefined) { const d = F.x - 13; S.yAt = 1; S.canStop = d > c.v * c.v / 8 + c.v * .4 + .3; }
      if (!light.y) S.yAt = undefined;
      if (S.in) {
        if (!S.turned && wrapA(c.yaw + PI / 2) > .5) { S.turned = 1; if (!S.sig && c.sig !== 1) deduct("좌회전", 5, "왼쪽 방향지시등을 켜지 않음"); }
        const inBox = Math.abs(F.x) < 8.5 && Math.abs(F.z + 110) < 8.5;
        if (inBox && c.v === 0) { S.bt = (S.bt || 0) + dt; if (S.bt > 20 && !S.p) { deduct("신호교차로", 5, "교차로 안에서 20초 넘게 멈춤"); S.p = 1; } if (S.bt > 30) { fail("교차로 안에서 30초 넘게 멈춤"); S.bt = -1e9; } }
        if (F.z > -100 && Math.abs(F.x) < 4) next();
        else if (F.x < -10 || F.z < -120) { fail("코스를 벗어남"); next(); }
      }
    } else if (task === "park") {
      const inC = w => w.x < PK.x0 && w.x > PK.dead - .5 && w.z > PK.cz0 - .5 && w.z < PK.gz1 + .5;
      if (!S.in && Wh.some(inC)) { S.in = 1; S.t = 0; S.n = 0; }
      if (!S.in && F.z > -50 && Math.abs(F.x) < 5) { fail("직각주차 코스에 들어가지 않음"); next(); }
      if (S.in) {
        S.t += dt; if (Math.floor(S.t / 120) > S.n) { S.n++; deduct("직각주차", 10, "120초 넘음"); }
        if (hits.some(h => h.tag === "p")) { if (E.parkFree > .5) deduct("직각주차", 10, "바퀴가 검지선에 닿음"); E.parkFree = 0; } else E.parkFree += dt;
        const rw = [Wh[0], Wh[1]];
        if (!S.ok && rw.every(w => w.z > PK.conf - .175 && w.x > PK.gx0 && w.x < PK.gx1)) { S.ok = 1; say("확인되었습니다"); beep("ok"); }
        if (S.ok && c.pb) S.pbOn = 1; if (S.pbOn && !c.pb) S.pbOff = 1;
        if (Wh.every(w => !inC(w))) { if (!S.ok) fail("확인선을 밟지 않고 직각주차 코스를 나옴"); else if (!S.pbOff) deduct("직각주차", 10, "주차 브레이크를 걸었다 풀지 않음"); next(); }
      }
    } else if (task === "right") {
      const near = F.z > -46 && F.z < -24 && Math.abs(F.x) < 12;
      if (near && !S.turned && wrapA(c.yaw) < -.5) { S.turned = 1; if (c.sig !== 2 && !S.sig) deduct("우회전", 5, "오른쪽 방향지시등을 켜지 않음"); }
      if (near && F.z > -42 && S.sig === undefined) S.sig = c.sig === 2;
      if (F.x < -11 && F.z > -36 && F.z < -26) next();
      else if (F.x > 11 && F.z > -36) { fail("코스를 벗어남"); next(); }
    } else if (task === "end") {
      if (prev.x <= END_X && F.x > END_X && F.z > -1 && F.z < 4.5) { if (c.sig !== 2) deduct("방향지시등", 5, "종료할 때 오른쪽 방향지시등을 켜지 않음"); E.done = true; ctx.finish(); }
    }
  }
  return {
    E, update, light: lightOf, get alarm() { return E.alarm; },
    hud() { const t = tasks[E.k]; return { task: NAME[t] || "", time: E.run, limit, step: t === "pre" && si < steps.length ? steps[si][0] : "" }; },
    nextPoint() { return ({ start: [START_X, 1.5], hill: [HILL.zone[0], 1.5], dol: dol.road === "S" ? [dol.x, 1.5] : [dol.x, -31.5], accel: [61.5, -35], left: [13, -111.5], park: [-16, -66], right: [-1.5, -38], end: [END_X, 1.5] })[tasks[E.k]]; },
  };
}
