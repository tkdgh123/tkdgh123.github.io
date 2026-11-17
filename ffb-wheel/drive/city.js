// 도시: 왕복 4차로 큰길 둘(가운데서 만남) + 둘레 순환 도로 + 옆길, 이면도로. 신호 교차로 9곳, 일시정지 5곳.
// 다른 차는 차로를 따라 신호, 정지선, 앞차를 지키며 다니고, 보행자는 횡단보도를 건넌다.
// 도로주행시험 채점은 도로교통법 시행규칙 별표 26(2016.9.21 개정)에서 화면으로 잴 수 있는 항목만 (고개 돌려 확인하기 같은 건 뺌).
import * as THREE from "three";
import { path, offPt, cut, Flat, Lines, sign, signalHead, floorText, textTex, SANS, person } from "./kit.js";
import { CAR, front, wheelsOf, carBox, obbHit, at } from "./car.js";

const PI = Math.PI, JR = 6, SOLID = 20; // 교차로 모퉁이 반경, 정지선 앞 진로변경 제한 실선 길이
const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }, YAW = { N: PI, E: PI / 2, S: 0, W: -PI / 2 };
const OPP = { N: "S", S: "N", E: "W", W: "E" }, LEFT = { N: "W", W: "S", S: "E", E: "N" }, RIGHT = { N: "E", E: "S", S: "W", W: "N" };
const TYPES = {
  main: { hw: 6.75, n: 2, lw: 3.25, center: "yy", lim: 50, name: "큰길" },
  ring: { hw: 3.5, n: 1, lw: 3.5, center: "y", lim: 40, name: "순환로" },
  side: { hw: 3.5, n: 1, lw: 3.5, center: "y", lim: 30, name: "옆길" },
  alley: { hw: 3.5, n: 1, lw: 3.5, center: null, lim: 30, name: "이면도로" },
};
const COL = { ground: "#cfccc3", asph: "#44454a", white: "#f2f1ec", yellow: "#e8b42a", curb: "#e4e1d8", red: "#9c4a40" };
// 교차로: [x, z, 신호("sig") 또는 일시정지 방향]
const NODES = { C: [0, 0, "sig"], Nn: [0, -200, "sig"], Ns: [0, 200, "sig"], Nw: [-240, 0, "sig"], Ne: [240, 0, "sig"], Ja: [-120, 0, "sig"], Jb: [0, -100, "sig"], Jc: [120, 0, "sig"], Jd: [0, 100, "sig"],
  Ka: [-120, -200, "S"], Kb: [240, -100, "W"], Kc: [120, 200, "N"], Kd: [240, 100, "W"], X: [120, 100, "NS"] };
const ROADS = [
  ["Nw", "Ja", "main"], ["Ja", "C", "main"], ["C", "Jc", "main"], ["Jc", "Ne", "main"],
  ["Nn", "Jb", "main"], ["Jb", "C", "main"], ["C", "Jd", "main"], ["Jd", "Ns", "main"],
  ["Ka", "Ja", "alley"], ["Jb", "Kb", "side"], ["Jc", "X", "side"], ["X", "Kc", "side"], ["Jd", "X", "side"], ["X", "Kd", "side"],
  ["Nn", "Ka", "ring"], ["Ka", "Nw", "ring", "W", [["l", 100], ["a", 20, PI / 2], ["l", 180]]], ["Nw", "Ns", "ring", "S", [["l", 180], ["a", 20, PI / 2], ["l", 220]]],
  ["Ns", "Kc", "ring"], ["Kc", "Kd", "ring", "E", [["l", 100], ["a", 20, PI / 2], ["l", 80]]], ["Kd", "Ne", "ring"], ["Ne", "Kb", "ring"], ["Kb", "Nn", "ring", "N", [["l", 80], ["a", 20, PI / 2], ["l", 220]]],
];
const dirOf = yaw => { const fx = Math.sin(yaw), fz = Math.cos(yaw); return Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? "E" : "W") : (fz > 0 ? "S" : "N"); };
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

export function buildCity(scene, { free = false } = {}) {
  const fl = new Flat(() => 0), lines = new Lines(), boxes = [], parked = [];
  const nodes = {}; for (const [id, [x, z, k]] of Object.entries(NODES)) nodes[id] = { id, x, z, sig: k === "sig", stop: k === "sig" ? "" : k, arms: {}, off: Math.random() * 60 };
  const roads = ROADS.map(([a, b, type, d, segs], id) => {
    const A = nodes[a], B = nodes[b];
    if (!segs) { d = B.x > A.x ? "E" : B.x < A.x ? "W" : B.z > A.z ? "S" : "N"; segs = [["l", Math.hypot(B.x - A.x, B.z - A.z)]]; }
    const p = path(A.x, A.z, YAW[d]); for (const s of segs) s[0] === "l" ? p.line(s[1]) : p.arc(s[1], s[2]);
    const pts = p.pts, d1 = dirOf(pts.at(-1).yaw), r = { id, a, b, d0: d, d1, T: TYPES[type], type, pts, L: pts.at(-1).s };
    A.arms[d] = r; B.arms[OPP[d1]] = r; return r;
  });
  const hwArm = (n, d) => n.arms[d] ? n.arms[d].T.hw : 0;
  const ext = (n, d) => Math.max(hwArm(n, LEFT[d]), hwArm(n, RIGHT[d]));
  const cw0 = (n, d) => ext(n, d) + JR + 1.5; // 횡단보도 시작 거리 (폭 4m), 정지선은 그 2m 뒤
  const stopAt = (n, d) => cw0(n, d) + 6;
  for (const n of Object.values(nodes)) { n.bx = Math.max(hwArm(n, "N"), hwArm(n, "S")) + JR + 1; n.bz = Math.max(hwArm(n, "E"), hwArm(n, "W")) + JR + 1; } // 교차로 안 (모퉁이까지)
  for (const r of roads) {
    const A = nodes[r.a], B = nodes[r.b];
    r.s0 = stopAt(A, r.d0); r.s1 = r.L - stopAt(B, OPP[r.d1]); // 이 길의 정지선 두 곳 (중심선 s)
    r.cut = { R0: A.arms[RIGHT[r.d0]] ? hwArm(A, RIGHT[r.d0]) + JR : 0, L0: A.arms[LEFT[r.d0]] ? hwArm(A, LEFT[r.d0]) + JR : 0,
      R1: B.arms[RIGHT[r.d1]] ? hwArm(B, RIGHT[r.d1]) + JR : 0, L1: B.arms[LEFT[r.d1]] ? hwArm(B, LEFT[r.d1]) + JR : 0 };
  }
  // ── 길 그리기 ──
  for (const r of roads) {
    const T = r.T, P = r.pts, L = r.L, lp = cut(P, r.s0, r.s1);
    fl.band(P, -T.hw, T.hw, COL.asph, .02);
    if (T.center === "yy") { for (const o of [-.17, .17]) fl.band(lp, o - .06, o + .06, COL.yellow, .035); lines.addPts(lp, 0, .23, "c", r); }
    if (T.center === "y") { fl.band(lp, -.075, .075, COL.yellow, .035); lines.addPts(lp, 0, .075, "c", r); }
    if (T.n === 2) for (const sd of [-1, 1]) {
      const o = sd * T.lw, solid = sd > 0 ? [r.s1 - SOLID, r.s1] : [r.s0, r.s0 + SOLID], dash = sd > 0 ? [r.s0, r.s1 - SOLID] : [r.s0 + SOLID, r.s1];
      const sp = cut(P, ...solid), dp = cut(P, ...dash);
      fl.band(sp, o - .075, o + .075, COL.white, .035); fl.dash(dp, o, .15, 3, 5, COL.white, .035);
      lines.addPts(sp, o, .075, "ls", r); lines.addPts(dp, o, .075, "l", r);
    }
    for (const sd of [-1, 1]) { const a = sd > 0 ? r.cut.R0 : r.cut.L0, b = L - (sd > 0 ? r.cut.R1 : r.cut.L1), cp = cut(P, a, b);
      if (cp.length > 1) { fl.band(cp, sd * T.hw, sd * (T.hw + .25), COL.curb, .13); lines.addPts(cp, sd * (T.hw + .12), .12, "curb", r); } }
  }
  // 교차로 모퉁이
  for (const n of Object.values(nodes)) for (const d of ["N", "E", "S", "W"]) {
    const e = RIGHT[d]; if (!n.arms[d] || !n.arms[e]) continue;
    const sx = DIRS[d][0] + DIRS[e][0], sz = DIRS[d][1] + DIRS[e][1], ns = d === "N" || d === "S" ? d : e, ew = ns === d ? e : d;
    const corner = { x: n.x + sx * hwArm(n, ns), z: n.z + sz * hwArm(n, ew) }, c = { x: corner.x + sx * JR, z: corner.z + sz * JR };
    let a0 = Math.atan2(0, -sx), a1 = Math.atan2(-sz, 0); if (Math.abs(a1 - a0) > PI) a1 += 2 * PI * Math.sign(a0 - a1);
    const ring = (rad) => Array.from({ length: 13 }, (_, i) => { const a = a0 + (a1 - a0) * i / 12; return { x: c.x + Math.cos(a) * rad, z: c.z + Math.sin(a) * rad }; });
    const R = ring(JR), Ri = ring(JR - .25); fl.fan(corner, R, COL.asph, .02);
    for (let i = 0; i < 12; i++) fl.quad(R[i], R[i + 1], Ri[i + 1], Ri[i], COL.curb, .13);
    lines.addRing(ring(JR - .12), .12, "curb", null);
  }
  // 횡단보도, 정지선 (교차로마다 모든 갈래에)
  const crossings = [];
  const stripes = (ctr, along, across, len, half) => { for (let k = -half + .25; k < half - .3; k += 1) { const o = q => ({ x: ctr.x + along[0] * q[0] + across[0] * q[1], z: ctr.z + along[1] * q[0] + across[1] * q[1] });
    fl.quad(o([-len / 2, k]), o([len / 2, k]), o([len / 2, k + .5]), o([-len / 2, k + .5]), COL.white, .036); } };
  for (const n of Object.values(nodes)) for (const [d, r] of Object.entries(n.arms)) {
    const v = DIRS[d], p = DIRS[LEFT[d]], c0 = cw0(n, d), hw = r.T.hw, ctr = { x: n.x + v[0] * (c0 + 2), z: n.z + v[1] * (c0 + 2) };
    stripes(ctr, v, p, 4, hw);
    crossings.push({ n, d, x: ctr.x, z: ctr.z, ax: v, hl: 2, hw, peds: [], ends: [{ x: ctr.x + p[0] * (hw + 1.6), z: ctr.z + p[1] * (hw + 1.6) }, { x: ctr.x - p[0] * (hw + 1.6), z: ctr.z - p[1] * (hw + 1.6) }] });
    if (n.sig || n.stop.includes(d)) { const s = stopAt(n, d), w = r.T.n * r.T.lw, q = (a, b) => ({ x: n.x + v[0] * a + p[0] * b, z: n.z + v[1] * a + p[1] * b });
      fl.quad(q(s, .3), q(s + .45, .3), q(s + .45, w), q(s, w), COL.white, .036); }
    if (n.stop.includes(d)) { const s = stopAt(n, d) + 3; sign(scene, "stop", "", n.x + v[0] * s + p[0] * (hw + .9), n.z + v[1] * s + p[1] * (hw + .9), YAW[d]); boxes.push({ x: n.x + v[0] * s + p[0] * (hw + .9), z: n.z + v[1] * s + p[1] * (hw + .9), hw: .1, hl: .1, r: 0 });
      floorText(scene, "정지", n.x + v[0] * (s + 3) + p[0] * hw / 2, n.z + v[1] * (s + 3) + p[1] * hw / 2, YAW[OPP[d]], 2.4, 1.2); }
  }
  // 신호 계획: 네 갈래 = 남북 직진 → 남북 좌회전 → 동서 직진 → 동서 좌회전. 세 갈래 = 큰길 직진 → 옆길로 좌회전 → 옆길. 각 뒤에 노랑 3초, 전부 빨강 2초
  for (const n of Object.values(nodes)) {
    if (!n.sig) continue;
    const arms = Object.keys(n.arms);
    if (arms.length === 4) { n.plan = [{ g: "NS", t: 16, walk: "EW" }, { l: "NS", t: 7 }, { g: "EW", t: 16, walk: "NS" }, { l: "EW", t: 7 }]; }
    else { const side = arms.find(a => !arms.includes(OPP[a])), main = arms.filter(a => a !== side).join(""), lt = arms.find(a => a !== side && LEFT[OPP[a]] === side);
      n.plan = [{ g: main, t: 18, walk: side }, { g: lt, l: lt, t: 7 }, { g: side, l: side, t: 10, walk: main }]; }
    n.cyc = n.plan.reduce((s, p) => s + p.t + 5, 0);
    n.heads = arms.map(d => { const h = OPP[d], fv = DIRS[h], rv = DIRS[RIGHT[h]], far = n.arms[h] ? ext(n, h) + 4 : hwArm(n, LEFT[h]) || hwArm(n, RIGHT[h]), w = n.arms[d].T.n * n.arms[d].T.lw;
      const x = n.x + fv[0] * (far + 1.5) + rv[0] * (w + 1.6), z = n.z + fv[1] * (far + 1.5) + rv[1] * (w + 1.6);
      boxes.push({ x, z, hw: .15, hl: .15, r: 0 }); return { d, h: signalHead(scene, x, z, YAW[h] + PI, w + 1.6) }; });
  }
  function light(n, d, t) { // 갈래 d에서 오는 차에게 보이는 신호
    if (!n.sig) return null;
    let u = ((t + n.off) % n.cyc + n.cyc) % n.cyc;
    for (const p of n.plan) {
      const on = (p.g || "").includes(d) || (p.l || "").includes(d);
      if (u < p.t) return { g: (p.g || "").includes(d) ? 1 : 0, l: (p.l || "").includes(d) ? 1 : 0, r: on ? 0 : 1, walk: p.walk || "", left: p.t - u };
      u -= p.t; if (u < 3) return on ? { y: 1, walk: "" } : { r: 1, walk: "" }; u -= 3; if (u < 2) return { r: 1, walk: "" }; u -= 2;
    }
    return { r: 1, walk: "" };
  }

  // 어린이 보호구역 (옆길 Jd→X, 학교 앞) + 가운데 횡단보도
  const school = roads.find(r => r.a === "Jd" && r.b === "X");
  school.zone = [school.s0 + 2, school.s1 - 2];
  { const zp = cut(school.pts, ...school.zone); fl.band(zp, -school.T.hw, school.T.hw, COL.red, .025);
    for (const [s, sd] of [[school.zone[0] + 6, 1], [school.zone[1] - 6, -1]]) { const q = cut(school.pts, s, s + 1)[0], p = offPt(q, sd * 1.75); floorText(scene, "어린이 보호구역", p.x, p.z, q.yaw + (sd > 0 ? 0 : PI), 3.1, 1.1, "#f2f1ec", .04); }
    for (const [s, sd] of [[school.zone[0] - 4, 1], [school.zone[1] + 4, -1]]) { const q = offPt(cut(school.pts, s, s + 1)[0], sd * (school.T.hw + 1)); const face = school.pts[0].yaw + (sd > 0 ? PI : 0);
      sign(scene, "kids", "", q.x, q.z, face, { h: 2.6 }); sign(scene, "max", "30", q.x, q.z, face, { h: 1.8, size: .62 }); boxes.push({ x: q.x, z: q.z, hw: .1, hl: .1, r: 0 }); }
    const mid = cut(school.pts, 60, 61)[0], v = [Math.sin(mid.yaw), Math.cos(mid.yaw)], p = [Math.cos(mid.yaw), -Math.sin(mid.yaw)];
    stripes(mid, v, p, 4, school.T.hw);
    crossings.push({ n: null, d: null, x: mid.x, z: mid.z, ax: v, hl: 2, hw: school.T.hw, peds: [], kids: true, ends: [{ x: mid.x + p[0] * 5.2, z: mid.z + p[1] * 5.2 }, { x: mid.x - p[0] * 5.2, z: mid.z - p[1] * 5.2 }] });
    for (const [s, sd] of [[42, 1], [78, -1]]) { const q = offPt(cut(school.pts, s, s + 1)[0], sd * 1.75), r = [[1.4, 0], [0, .8], [-1.4, 0], [0, -.8], [1.4, 0]].map(([a, b]) => ({ x: q.x + v[0] * a + p[0] * b, z: q.z + v[1] * a + p[1] * b })), ri = r.map(o => ({ x: q.x + (o.x - q.x) * .75, z: q.z + (o.z - q.z) * .75 }));
      for (let i = 0; i < 4; i++) fl.quad(r[i], r[i + 1], ri[i + 1], ri[i], COL.white, .037); }
  }
  // 이면도로 (시험장 앞): 서쪽 가장자리에 주차된 차들, 출발 자리, 끝내는 자리
  const alley = roads.find(r => r.type === "alley");
  const carMesh = (col) => { const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, roughness: .55 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, .55, 4.5), m); b.position.y = .62; b.castShadow = true; g.add(b);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.56, .48, 2.1), new THREE.MeshStandardMaterial({ color: 0x2a2c33, roughness: .3 })); cab.position.set(0, 1.12, -.2); cab.castShadow = true; g.add(cab);
    const wg = new THREE.CylinderGeometry(.31, .31, .22, 12); wg.rotateZ(PI / 2); const wm = new THREE.MeshStandardMaterial({ color: 0x151514 });
    for (const [x, z] of [[.8, 1.35], [-.8, 1.35], [.8, -1.35], [-.8, -1.35]]) { const w = new THREE.Mesh(wg, wm); w.position.set(x, .31, z); g.add(w); }
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.5, .1, .04), new THREE.MeshBasicMaterial({ color: 0x5a1410 })); tl.position.set(0, .78, -2.26); g.add(tl); g.userData.tail = tl;
    scene.add(g); return g; };
  const CARCOL = [0xf2f1ec, 0xd9d6cc, 0x8f8f8c, 0x2a2b30, 0x6c7a99, 0x2b44a6, 0xa33a2c, 0xe4e2da];
  for (const s of [22, 31, 63, 72, 115, 124, 150, 168]) { const q = cut(alley.pts, s, s + 1)[0], o = offPt(q, 2.35), m = carMesh(CARCOL[(s * 7) % CARCOL.length]); m.position.set(o.x, 0, o.z); m.rotation.y = q.yaw;
    const b = { x: o.x, z: o.z, hw: .9, hl: 2.25, r: q.yaw }; boxes.push(b); parked.push(b); }
  const START_S = 46, END = { s0: 90, s1: 104 };
  { const a = cut(alley.pts, END.s0, END.s1), o0 = -.9, o1 = -3.3; for (let s = 0; s < a.length - 1; s += 2) fl.band(a.slice(s, s + 2), o0 - .06, o0 + .06, COL.white, .036); fl.band(a, o1 - .06, o1 + .06, COL.white, .036);
    for (const q of [a[0], a.at(-1)]) fl.quad(offPt(q, o0), offPt({ ...q, x: q.x + Math.sin(q.yaw) * .12, z: q.z + Math.cos(q.yaw) * .12 }, o0), offPt({ ...q, x: q.x + Math.sin(q.yaw) * .12, z: q.z + Math.cos(q.yaw) * .12 }, o1), offPt(q, o1), COL.white, .036); }

  // ── 건물, 나무, 시험장, 학교 ──
  const grid = new Map(), key = (i, j) => i * 1000 + j;
  for (const r of roads) for (let i = 0; i < r.pts.length; i += 2) { const p = r.pts[i], k = key(Math.floor(p.x / 12), Math.floor(p.z / 12)); (grid.get(k) || grid.set(k, []).get(k)).push([r, i]); }
  function roadAt(x, z) { // 가장 가까운 길과 그 위치 (s, 오른쪽 + 거리)
    let best = null, bd = 1e9; const i0 = Math.floor(x / 12), j0 = Math.floor(z / 12);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const [r, i] of grid.get(key(i0 + a, j0 + b)) || []) { const p = r.pts[i], d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = [r, i]; } }
    if (!best || bd > 15 * 15) return null;
    const [r, i] = best; let j = i, jd = bd; for (const k of [i - 1, i + 1, i - 2, i + 2]) { const p = r.pts[k]; if (!p) continue; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < jd) { jd = d; j = k; } }
    const p = r.pts[j], fx = Math.sin(p.yaw), fz = Math.cos(p.yaw), dx = x - p.x, dz = z - p.z;
    return { r, s: p.s + dx * fx + dz * fz, off: dz * fx - dx * fz, yaw: p.yaw }; // off: 길 방향 오른쪽이 +
  }
  const nearRoad = (x, z, pad) => { const q = roadAt(x, z); return q && Math.abs(q.off) < q.r.T.hw + pad; };
  const nearNode = (x, z, pad) => Object.values(nodes).some(n => Math.abs(x - n.x) < pad + 14 && Math.abs(z - n.z) < pad + 14);
  const winTex = textTex(128, 128, (g) => { g.fillStyle = "#fff"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#c9cdd6"; for (let y = 14; y < 128; y += 32) for (let x = 10; x < 128; x += 30) g.fillRect(x, y, 18, 14); });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  const BCOL = [0xf2f1ec, 0xe4e2da, 0xd9d6cc, 0xc9c6bc, 0xb8bcc6, 0x9aa6bf, 0xe8e2d2];
  let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const building = (x, z, w, d, h, col, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) { const f = Math.floor(i / 4), sx = f < 2 ? d : w; uv.setXY(i, uv.getX(i) * (f === 2 || f === 3 ? 0 : sx / 7), uv.getY(i) * (f === 2 || f === 3 ? 0 : h / 3.2)); }
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, map: winTex, roughness: .85 })); m.position.set(x, h / 2, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m);
    boxes.push({ x, z, hw: w / 2, hl: d / 2, r: ry }); return m; };
  const label = (txt, x, y, z, ry, w = 14, bg = "#2b44a6") => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 7), new THREE.MeshBasicMaterial({ map: textTex(896, 128, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = "#fff"; g.font = `700 70px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, W / 2, H / 2 + 4); }) })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); };
  building(-148, -150, 24, 50, 9, 0xf2f1ec); label("운전면허시험장", -135.9, 7, -150, PI / 2, 16);
  building(60, 132, 50, 22, 11, 0xe8e2d2); label("초등학교", 60, 9, 120.9, PI, 12, "#3c6b3a");
  for (let i = 0; i < 900; i++) {
    const x = -300 + rnd() * 600, z = -260 + rnd() * 520, w = 10 + rnd() * 14, d = 10 + rnd() * 14, inside = Math.abs(x) < 248 && Math.abs(z) < 208;
    const h = inside ? 6 + rnd() * (Math.abs(x) < 130 && Math.abs(z) < 110 ? 40 : 18) : 8 + rnd() * 30;
    const pad = Math.max(w, d) / 2 + 5;
    if (nearRoad(x, z, pad) || nearRoad(x + w / 2, z + d / 2, 5) || nearRoad(x - w / 2, z - d / 2, 5) || nearRoad(x + w / 2, z - d / 2, 5) || nearRoad(x - w / 2, z + d / 2, 5) || nearNode(x, z, pad)) continue;
    if (boxes.some(b => Math.abs(b.x - x) < b.hw + w / 2 + 3 && Math.abs(b.z - z) < b.hl + d / 2 + 3)) continue;
    building(x, z, w, d, h, BCOL[(rnd() * BCOL.length) | 0]);
  }
  const trunk = new THREE.MeshStandardMaterial({ color: 0x6b5a48 }), leaf = [0x4d5b3f, 0x667552].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true }));
  for (const r of roads) if (r.type === "main") for (let s = r.s0 + 12; s < r.s1 - 12; s += 16) for (const sdd of [-1, 1]) { const q = offPt(cut(r.pts, s, s + 1)[0], sdd * (r.T.hw + 1.6));
    if (nearNode(q.x, q.z, 2)) continue; const t = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 2.2, 7), trunk); t.position.set(q.x, 1.1, q.z); scene.add(t);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), leaf[(s / 16 | 0) % 2]); l.position.set(q.x, 3.3, q.z); l.castShadow = true; scene.add(l); boxes.push({ x: q.x, z: q.z, hw: .25, hl: .25, r: 0 }); }
  // 제한 속도 표지 (길 시작마다)
  for (const r of roads) for (const [s, sdd, face] of [[r.s0 + 8, 1, r.pts[0].yaw + PI], [r.s1 - 8, -1, r.pts.at(-1).yaw]]) { if (r === school) continue; const q = offPt(cut(r.pts, s, s + 1)[0], sdd * (r.T.hw + .8)); sign(scene, "max", String(r.T.lim), q.x, q.z, face, { size: .6 }); boxes.push({ x: q.x, z: q.z, hw: .1, hl: .1, r: 0 }); }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: COL.ground, roughness: 1 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground);
  fl.mesh(scene);

  // ── 차로 그래프: 길(방향, 차로) 조각 + 교차로 안 이음 곡선 ──
  const laneCache = new Map();
  function lane(r, dir, k) { // dir +1 = 길 점 순서대로. 정지선(출발 쪽은 횡단보도 끝)에서 정지선까지
    const key2 = `${r.id}${dir}${k}`; if (laneCache.has(key2)) return laneCache.get(key2);
    const A = nodes[r.a], B = nodes[r.b], o = r.T.lw * (k + .5);
    const sA = cw0(A, r.d0) + 4.3, sB = r.L - cw0(B, OPP[r.d1]) - 4.3;
    let pts = dir > 0 ? cut(r.pts, sA, r.s1) : cut(r.pts, r.s0, sB).reverse().map(p => ({ ...p, yaw: p.yaw + PI }));
    pts = pts.map(p => ({ ...offPt(p, o), yaw: p.yaw })); let s = 0; pts.forEach((p, i) => { if (i) s += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z); p.s = s; });
    const seg = { r, dir, k, pts, L: s, to: dir > 0 ? r.b : r.a, arm: dir > 0 ? OPP[r.d1] : r.d0, lim: r.T.lim, school: r === school };
    laneCache.set(key2, seg); return seg;
  }
  const depart = (n, d) => { const r = n.arms[d]; return r && { r, dir: r.a === n.id && r.d0 === d ? 1 : -1 }; };
  function moves(seg) { // 이 차로 끝 교차로에서 갈 수 있는 곳 [{turn, d}]
    const n = nodes[seg.to], h = OPP[seg.arm], out = [];
    for (const d of Object.keys(n.arms)) { if (d === seg.arm) continue; const turn = d === h ? "s" : d === LEFT[h] ? "l" : "r";
      if (seg.r.T.n === 2 && ((seg.k === 0 && turn === "r") || (seg.k === 1 && turn === "l"))) continue; out.push({ turn, d }); }
    return out;
  }
  const conCache = new Map();
  function connect(seg, d, turn) { // 교차로 안 곡선 (베지어) + 나가는 차로
    const n = nodes[seg.to], dp = depart(n, d), k = turn === "l" ? 0 : turn === "r" ? dp.r.T.n - 1 : Math.min(seg.k, dp.r.T.n - 1), next = lane(dp.r, dp.dir, k);
    const key2 = `${seg.r.id}${seg.dir}${seg.k}>${d}`; if (conCache.has(key2)) return conCache.get(key2);
    // 곧게 가다가 모퉁이에서 둥글게 (우회전 반경 8m, 좌회전 14m): 두 차로 선이 만나는 점 K를 둥글게 깎음
    const a = seg.pts.at(-1), b = next.pts[0], fa = [Math.sin(a.yaw), Math.cos(a.yaw)], fb = [Math.sin(b.yaw), Math.cos(b.yaw)], raw = [];
    if (turn === "s") raw.push(a, b);
    else { const den = fa[0] * fb[1] - fa[1] * fb[0], tK = ((b.x - a.x) * fb[1] - (b.z - a.z) * fb[0]) / den, K = { x: a.x + fa[0] * tK, z: a.z + fa[1] * tK };
      const dA = Math.hypot(K.x - a.x, K.z - a.z), dB = Math.hypot(b.x - K.x, b.z - K.z), Rt = Math.min(turn === "r" ? 8 : 14, dA - .5, dB - .5);
      const T0 = { x: K.x - fa[0] * Rt, z: K.z - fa[1] * Rt }, sg = turn === "l" ? 1 : -1;
      const C = { x: T0.x + Math.cos(a.yaw) * Rt * sg, z: T0.z - Math.sin(a.yaw) * Rt * sg }; // 왼쪽(또는 오른쪽)으로 Rt
      raw.push(a); for (let i = 0; i <= 16; i++) { const y = a.yaw + sg * (PI / 2) * i / 16; raw.push({ x: C.x - Math.cos(y) * Rt * sg, z: C.z + Math.sin(y) * Rt * sg }); } raw.push(b); }
    const pts = []; let s = 0;
    for (let i = 0; i < raw.length - 1; i++) { const p0 = raw[i], p1 = raw[i + 1], L = Math.hypot(p1.x - p0.x, p1.z - p0.z), n2 = Math.max(1, Math.ceil(L));
      for (let k = i ? 1 : 0; k <= n2; k++) { const x = p0.x + (p1.x - p0.x) * k / n2, z = p0.z + (p1.z - p0.z) * k / n2; if (pts.length) s += Math.hypot(x - pts.at(-1).x, z - pts.at(-1).z); if (!pts.length || Math.hypot(x - pts.at(-1).x, z - pts.at(-1).z) > .05) pts.push({ x, z, s }); } }
    pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)]; p.yaw = Math.atan2(q.x - o.x, q.z - o.z); });
    const con = { pts, L: s, next, turn, node: n, arm: seg.arm, con: true, lim: turn === "s" ? seg.lim : 15 }; conCache.set(key2, con); return con;
  }
  function posAt(seg, s) { const P = seg.pts; let i = 1; while (i < P.length - 1 && P[i].s < s) i++; const a = P[i - 1], b = P[i], k = Math.max(0, Math.min(1, (s - a.s) / ((b.s - a.s) || 1))); return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, yaw: a.yaw + wrapA(b.yaw - a.yaw) * k }; }

  // ── 다른 차 ──
  const allLanes = []; for (const r of roads) if (r.type !== "alley") for (const dir of [1, -1]) for (let k = 0; k < r.T.n; k++) allLanes.push(lane(r, dir, k));
  const ai = [];
  function pickNext(c) { const opts = moves(c.seg).filter(m => depart(nodes[c.seg.to], m.d).r.type !== "alley"); const m = opts.length ? opts[(Math.random() * opts.length) | 0] : null; c.move = m; c.con = m && connect(c.seg, m.d, m.turn); }
  for (let i = 0; i < 22; i++) {
    for (let tries = 0; tries < 30; tries++) { const seg = allLanes[(Math.random() * allLanes.length) | 0], s = 5 + Math.random() * Math.max(1, seg.L - 10), p = posAt(seg, s);
      if (ai.some(o => Math.hypot(o.x - p.x, o.z - p.z) < 14) || Math.hypot(p.x + 120, p.z + 150) < 30) continue;
      const c = { seg, s, v: 4, x: p.x, z: p.z, yaw: p.yaw, mesh: carMesh(CARCOL[i % CARCOL.length]), stopT: 0, stuck: 0 }; pickNext(c); ai.push(c); break; }
  }
  // ── 보행자 ──
  const peds = [], PCOL = [0x2b44a6, 0xa33a2c, 0x3c6b3a, 0x8f8b80, 0xe8b42a, 0x2a2b30];
  for (const cr of crossings) for (let k = 0; k < (cr.kids ? 2 : 1); k++) { const m = person(PCOL[(peds.length * 5) % PCOL.length]); if (cr.kids) m.scale.setScalar(.75); scene.add(m);
    const side = Math.random() < .5 ? 0 : 1, e = cr.ends[side]; m.position.set(e.x, 0, e.z); peds.push({ cr, m, side, t: 0, wait: 2 + Math.random() * 20, walking: false, x: e.x, z: e.z, sp: 1.2 + Math.random() * .4, off: (Math.random() - .5) * 2.4 }); }
  function walkOK(cr, t) { if (!cr.n) return true; if (!cr.n.sig) return true; const L = light(cr.n, cr.d, t), w = L.walk || ""; return w.includes(cr.d) && (L.left === undefined || L.left > 6); }

  function obstacleGap(c, path, player, onlyPlayer) { // 내 길을 따라 앞으로 40m 안에 있는 차, 사람까지 거리
    let best = 1e9;
    const others = [];
    if (!onlyPlayer) for (const o of ai) if (o !== c) others.push([o.x, o.z, 2.3, 1.6]);
    if (player) for (const f of [-.6, 1.35, 3.3]) { const m = at(player, f, 0); others.push([m.x, m.z, f === 1.35 ? 2.3 : .35, 1.7]); } // 운전자 차: 앞, 가운데, 뒤
    if (!onlyPlayer) for (const p of peds) if (p.walking) others.push([p.x, p.z, .3, 1.6]);
    let acc = 0;
    for (const [seg, from] of path) { const P = seg.pts;
      for (let i = 0; i < P.length; i++) { const q = P[i]; if (q.s < from) continue; const d = acc + q.s - from; if (d > 40) return best;
        for (const [x, z, half, lat] of others) { if (Math.abs(x - q.x) > 3 || Math.abs(z - q.z) > 3) continue; if (Math.hypot(x - q.x, z - q.z) < lat) { best = Math.min(best, d - half - 2.3); } }
        if (best < 1e9) return best; }
      acc += seg.L - from; }
    return best;
  }
  function tickAI(dt, t, player) {
    for (const c of ai) {
      const seg = c.seg, onCon = !!seg.con;
      // 멈출 곳: 차로 끝(정지선)에서 신호·일시정지 보고
      let stopD = 1e9, wantV = seg.lim / 3.6 * (seg.school ? .9 : .85);
      if (!onCon && c.move) {
        const n = nodes[seg.to], toEnd = seg.L - c.s;
        const inBox = (x, z) => Math.abs(x - n.x) < n.bx && Math.abs(z - n.z) < n.bz;
        const occupied = (player && inBox(player.x, player.z)) || ai.some(o => o !== c && o.seg.con && o.seg.node === n && o.seg.arm !== seg.arm); // 다른 방향 차가 아직 교차로 안에 있으면 기다림
        if (n.sig) { const L = light(n, seg.arm, t), ok = (c.move.turn === "l" ? L.l : L.g) && !(c.v < 1 && L.left < 2.5); // 곧 바뀔 신호엔 서 있던 차가 출발하지 않음
          if ((!ok && !(L.y && toEnd < c.v * c.v / 6)) || (occupied && toEnd < 12)) stopD = toEnd - .5; }
        else if (n.stop.includes(seg.arm)) { // 일시정지: 1.5초 멈췄다가, 교차로 안이나 가까이 다가오는 차(운전자 포함)가 없을 때
          const busy = (x, z, v) => inBox(x, z) || (Math.hypot(x - n.x, z - n.z) < n.bx + 40 && v > .5);
          if (c.stopT < 1.5) { stopD = toEnd - .5; if (toEnd < 1.2 && c.v < .2) c.stopT += dt; }
          else if (ai.some(o => o !== c && (o.seg.con ? o.seg.node === n : o.seg.to === n.id && !n.stop.includes(o.seg.arm) && busy(o.x, o.z, o.v))) || (player && busy(player.x, player.z, Math.abs(player.v)))) stopD = toEnd - .5; }
      }
      const path = [[seg, c.s]]; if (!onCon && c.con) path.push([c.con, 0], [c.con.next, 0]); else if (onCon) path.push([seg.next, 0]);
      const gap = obstacleGap(c, path, player, c.stuck > 10); // 오래 막히면 다른 차는 무시 (서로 기다리기 풀기), 운전자 차는 늘 봄
      if (stopD < 1e8) wantV = Math.min(wantV, Math.sqrt(2 * 3 * Math.max(0, stopD - .5)));
      if (gap < 1e8) wantV = Math.min(wantV, Math.sqrt(2 * 3 * Math.max(0, gap - 2.2))); // 앞차와 2m 넘게
      if (onCon && seg.turn !== "s") wantV = Math.min(wantV, 5);
      c.v += Math.max(-7, Math.min(2.2, (wantV - c.v) * 2)) * dt; if (c.v < 0) c.v = 0;
      c.stuck = c.v < .1 && stopD > 1e8 ? c.stuck + dt : 0; if (c.stuck > 12) c.stuck = 0;
      c.brake = wantV < c.v - .3 || c.v < .1;
      c.s += c.v * dt;
      if (stopD < 1e8 && !onCon && c.s > c.seg.L - .05) { c.s = c.seg.L - .05; c.v = 0; } // 멈추기로 했으면 정지선을 넘지 않음
      while (c.s > c.seg.L) { c.s -= c.seg.L;
        if (!c.seg.con) { if (!c.con) { c.s = 0; break; } c.seg = c.con; c.stopT = 0; }
        else { c.seg = c.seg.next; pickNext(c); } }
      const p = posAt(c.seg, c.s); c.x = p.x; c.z = p.z; c.yaw = p.yaw;
      c.mesh.position.set(p.x, 0, p.z); c.mesh.rotation.y = p.yaw; c.mesh.userData.tail.material.color.setHex(c.brake ? 0xff2a1a : 0x5a1410);
    }
    for (const p of peds) {
      if (!p.walking) { p.wait -= dt; if (p.wait <= 0) { const cr = p.cr;
          const pm = player && at(player, 1.35, 0), onIt = (x, z) => onCross(cr, x, z, 1.2);
          const carNear = ai.some(c => onIt(c.x, c.z)) || (pm && (onIt(pm.x, pm.z) || onIt(player.x, player.z) || (Math.hypot(pm.x - cr.x, pm.z - cr.z) < 12 && Math.abs(player.v) > .5))) // 차가 건널목 위나 바로 앞에서 움직이면 기다림
            || ((!cr.n || !cr.n.sig) && ai.some(c => Math.hypot(c.x - cr.x, c.z - cr.z) < 18 && c.v > 2));
          if (walkOK(cr, t) && !carNear) { p.walking = true; p.t = 0; } else p.wait = .5; } }
      else { const cr = p.cr, a = cr.ends[p.side], b = cr.ends[1 - p.side], L = Math.hypot(b.x - a.x, b.z - a.z); p.t += p.sp * dt; const k = Math.min(1, p.t / L);
        p.x = a.x + (b.x - a.x) * k + cr.ax[0] * p.off; p.z = a.z + (b.z - a.z) * k + cr.ax[1] * p.off; p.m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
        p.m.userData.legs.forEach((l, i) => l.rotation.x = Math.sin(p.t * 6 + i * PI) * .5);
        if (k >= 1) { p.walking = false; p.side = 1 - p.side; p.wait = 6 + Math.random() * 25; p.m.userData.legs.forEach(l => l.rotation.x = 0); } }
      p.m.position.set(p.x, 0, p.z);
    }
  }
  const onCross = (cr, x, z, pad = 0) => { const dx = x - cr.x, dz = z - cr.z, a = dx * cr.ax[0] + dz * cr.ax[1], b = dx * -cr.ax[1] + dz * cr.ax[0]; return Math.abs(a) < cr.hl + pad && Math.abs(b) < cr.hw + pad; };

  // 지도: 길 중심선들
  const mapLines = roads.map(r => r.pts.filter((_, i) => i % 3 === 0 || i === r.pts.length - 1));
  // 출발 자리 (이면도로 서쪽 가장자리, 남쪽을 봄)
  const sp = offPt(cut(alley.pts, START_S, START_S + 1)[0], 2.35), start = { x: sp.x, z: sp.z - CAR.WB / 2, yaw: 0 };
  let acc = 0;
  const M = { name: free ? "도시 주행" : "도로주행시험", free, pass: 70, lines, boxes, sig: [], route: [], mapLines, bounds: [-260, -220, 260, 220], mapZoom: true, hgt: () => 0, start,
    nodes, roads, lane, connect, moves, depart, light, posAt, roadAt, crossings, peds, ai, parked, school, alley, END, onCross, stopAt, cw0,
    tick(dt, t, car) { acc += dt; if (acc < 1 / 60) return; tickAI(acc, t, car); acc = 0; for (const n of Object.values(nodes)) if (n.heads) for (const h of n.heads) h.h.set(light(n, h.d, t)); },
    get cars() { return ai.map(c => ({ x: c.x, z: c.z, hw: .9, hl: 2.25, r: c.yaw, ai: c })); },
    exam: ctx => roadExam(ctx, M) };
  return M;
}

// ── 도로주행 채점 ──
function roadExam(ctx, M) {
  const { say, deduct, fail, beep } = ctx;
  const E = { pts: 100, log: [], done: false, run: 0, wait: 0, st: {}, alarm: false, hard: 0 };
  const R = { lc: null, sigOnAt: null, dist: 0, sigWas: 0, stopT: 0, stopFlags: {}, minV15: 9, moved: false, pbDist: 0, fastT: 0, curbFree: 9, laneFree: 9, straddle: 0, parkedHit: new Set(), endT: 0, ended: false, hardT: 0, jerkT: 0, lastAcc: 0, startPhase: M.free ? 9 : 0, turnSlow: null };
  // 길 안내: 지금 길(방향)에서 목표(이면도로 북쪽 방향)까지 교차로마다 갈 곳
  const target = { r: M.alley, dir: -1 };
  const plan = [["Ja", "E"], ["C", "S"], ["Jd", "E"], ["X", "E"], ["Kd", "N"], ["Ne", "W"], ["Jc", "W"], ["C", "W"], ["Ja", "N"]];
  let step = 0, saidFor = "";
  function reroute(r, dir) { // 지금 있는 방향 길에서 목표까지 너비 우선 찾기
    const key = (r, dir) => r.id + ":" + dir, seen = new Map([[key(r, dir), null]]), Q = [[r, dir]];
    while (Q.length) { const [cr, cd] = Q.shift(); if (cr === target.r && cd === target.dir) break;
      const n = M.nodes[cd > 0 ? cr.b : cr.a], arm = cd > 0 ? OPP[cr.d1] : cr.d0;
      for (const d of Object.keys(n.arms)) { if (d === arm) continue; const dp = M.depart(n, d), k = key(dp.r, dp.dir); if (seen.has(k)) continue; seen.set(k, [cr, cd, n.id, d]); Q.push([dp.r, dp.dir]); } }
    const out = []; let k = key(target.r, target.dir); while (seen.get(k)) { const [pr, pd, nid, d] = seen.get(k); out.unshift([nid, d]); k = key(pr, pd); }
    return out;
  }
  const TURN = { s: "직진", l: "좌회전", r: "우회전" };
  const turnOf = (arm, d) => { const h = OPP[arm]; return d === h ? "s" : d === LEFT[h] ? "l" : "r"; };
  function navInfo(c, q, F) {
    if (M.free || !q) return null;
    const dir = Math.cos(c.yaw - q.yaw) > 0 ? 1 : -1;
    if (q.r === target.r && dir === target.dir && step >= plan.length) { const sF = q.s; const toEnd = sF - M.END.s1; return { turn: "end", dist: Math.max(0, toEnd), text: toEnd > 3 ? "목적지 오른쪽에 세우세요" : "여기에 세우세요" }; }
    const [nid, d] = plan[step] || []; if (!nid) return null;
    const n = M.nodes[nid], arm = dir > 0 ? OPP[q.r.d1] : q.r.d0, turn = turnOf(arm, d), dist = Math.max(0, Math.hypot(n.x - F.x, n.z - F.z) - M.cw0(n, arm) - 6);
    let lane = ""; if (q.r.T.n === 2 && turn !== "s") lane = turn === "l" ? "1차로" : "2차로";
    return { turn, dist, text: `${TURN[turn]}${lane ? ", " + lane : ""}`, nid, d };
  }
  function update(dt, c, t, hits) {
    if (E.done) return;
    const F = front(c), Wh = wheelsOf(c), kmh = Math.abs(c.v) * 3.6, mid = at(c, 1.35, 0), q = M.roadAt(mid.x, mid.z);
    const inNode = Object.values(M.nodes).find(n => [F, mid].some(p => Math.abs(p.x - n.x) < n.bx && Math.abs(p.z - n.z) < n.bz));
    const dir = q ? (Math.cos(c.yaw - q.yaw) > 0 ? 1 : -1) : 0;
    E.t = (E.t || 0) + dt;
    // 시작: 안전띠 → 출발 (가장자리에서 왼쪽 방향지시등 켜고 차로로)
    if (R.startPhase === 0) { if (c.belt) { R.startPhase = 1; say("출발하세요. 앞에서 좌회전입니다"); } else if (!R.saidBelt) { say("안전띠를 매세요"); R.saidBelt = 1; } return; } // 간단 조작은 안전띠를 맨 채로 시작
    if (R.startPhase === 1) { R.st = (R.st || 0) + dt;
      if (R.sigAtStart === undefined && Math.abs(c.v) > .3) R.sigAtStart = c.sig === 1;
      const off = q ? q.off * dir : 0;
      if (Math.abs(c.v) > .3 && R.sigAtStart === false && !R.p11) { deduct("출발", 5, "가장자리에서 나올 때 방향지시등을 켜지 않음"); R.p11 = 1; }
      if (R.sigAtStart && c.sig !== 1 && off > 1.3 && !R.p12) { deduct("출발", 5, "차로에 다 들어가기 전에 방향지시등을 끔"); R.p12 = 1; }
      if (off < 1.3 && Math.abs(wrapA(c.yaw - q.yaw - (dir < 0 ? PI : 0))) < .15) { R.startPhase = 2; R.mergeAt = R.dist; }
    }
    if (R.startPhase === 2 && R.dist - R.mergeAt > 12) { if (c.sig === 1 && !R.p13) { deduct("출발", 5, "차로에 들어간 뒤에도 방향지시등을 켜 둠"); R.p13 = 1; } R.startPhase = 3; }
    R.dist += Math.abs(c.v) * dt; if (Math.abs(c.v) > .3) R.moved = true; E.run += dt;
    // 방향지시등 켠 뒤 달린 거리
    if (c.sig !== R.sigWas) { R.sigOnAt = c.sig ? R.dist : null; R.sigWas = c.sig; }
    const sigDist = R.sigOnAt === null ? -1 : R.dist - R.sigOnAt;
    // 안전띠, 주차 브레이크
    if (!c.belt && Math.abs(c.v) > .3) fail("안전띠를 매지 않음");
    if (c.pb && c.v > .3) { R.pbDist += c.v * dt; if (R.pbDist > 3 && !R.pbP) { deduct("주차 브레이크", 10, "주차 브레이크를 풀지 않고 출발"); R.pbP = 1; } }
    // 급제동, 급출발 (세 번이면 실격)
    if (c.acc < -6.2 && c.v > 1 && !c.auto) R.hardT += dt; else R.hardT = 0; // 간단 조작은 키가 켜고 끄기뿐이라 급조작을 보지 않음
    if (R.hardT > .25 && !R.hardOn) { R.hardOn = 1; E.hard++; deduct("급브레이크", 7, "차가 크게 흔들릴 만큼 세게 멈춤"); if (E.hard >= 3) fail("급조작을 세 번 넘게 함"); } else if (R.hardT === 0) R.hardOn = 0;
    if (c.acc > 2.9 && kmh < 15 && !c.auto) R.jerkT += dt; else R.jerkT = 0;
    if (R.jerkT > .4 && !R.jerkOn) { R.jerkOn = 1; E.hard++; deduct("급출발", 7, "가속 페달을 세게 밟아 급하게 출발"); if (E.hard >= 3) fail("급조작을 세 번 넘게 함"); } else if (R.jerkT === 0) R.jerkOn = 0;
    // 멈춰 있을 때: 10초 넘으면 N, 브레이크 밟기, 초록불에 20초 안에 출발
    if (c.v === 0 && R.moved) {
      R.stopT += dt; const fl = R.stopFlags;
      const atEnd = q && q.r === M.alley && q.s > M.END.s0 - 4 && q.s < M.END.s1 + 6;
      if (!atEnd) {
        if (R.stopT > 10 && c.gear === "D" && !c.auto && !fl.n) { deduct("정지 중 기어", 5, "10초 넘게 서 있는데 기어를 N에 두지 않음"); fl.n = 1; }
        if (c.gear === "N" && c.brk < .1 && !c.pb) { fl.nb = (fl.nb || 0) + dt; if (fl.nb > 1.5 && !fl.nbp) { deduct("정지 때 미제동", 5, "멈춰 있는 동안 브레이크를 밟지 않음"); fl.nbp = 1; } }
        const ap = R.approach, L = ap && ap.n.sig ? M.light(ap.n, ap.arm, t) : null, blocked = M.ai.some(o => { const dx = o.x - mid.x, dz = o.z - mid.z, f = dx * Math.sin(c.yaw) + dz * Math.cos(c.yaw); return f > 0 && f < 14 && Math.abs(dx * Math.cos(c.yaw) - dz * Math.sin(c.yaw)) < 2; });
        if (!blocked && (!L || L.g)) { fl.go = (fl.go || 0) + dt; if (fl.go > 20 && !fl.gop) { deduct("20초 내 미출발", 10, "출발해야 할 때 20초 안에 출발하지 않음"); fl.gop = 1; } } else fl.go = 0;
      }
    } else if (c.v !== 0) { R.stopT = 0; R.stopFlags = {}; }
    if (c.gear === "N" && Math.abs(c.v) > 2 && !R.nP) { deduct("엔진 브레이크", 5, "멈추기 전에 미리 기어를 N에 둠"); R.nP = 1; } else if (c.gear !== "N") R.nP = 0;
    // 연석, 사고
    if (hits.some(h => h.tag === "curb")) { if (R.curbFree > 1) deduct("차로 유지", 5, "바퀴가 연석에 닿음"); R.curbFree = 0; } else R.curbFree += dt;
    // 속도: 제한 속도보다 시속 10km 넘게, 어린이 보호구역은 조금이라도
    const lim = q && !inNode ? q.r.T.lim : null; if (lim) E.lim = lim; const inSchool = q && q.r === M.school && q.s > M.school.zone[0] && q.s < M.school.zone[1];
    if (lim && kmh > lim + 10.5) { R.fastT += dt; if (R.fastT > .5) fail(`제한 속도 시속 ${lim}km보다 10km 넘게 달림`); } else R.fastT = 0;
    if (inSchool && kmh > 31) fail("어린이 보호구역에서 시속 30km를 넘음");
    // 1m 간격: 주차된 차 옆을 지날 때
    const cb = carBox(c);
    M.parked.forEach((b, i) => { if (R.parkedHit.has(i) || c.v < .5) return; if (obbHit(cb, { ...b, hw: b.hw + .95, hl: b.hl + .3 }) && !obbHit(cb, b)) { R.parkedHit.add(i); deduct("1미터 간격", 7, "주차된 차 옆을 1m 안으로 지남"); } });
    // 중앙선, 차선
    if (q && !inNode && q.r.T.center) {
      for (const w of Wh) { const ww = M.roadAt(w.x, w.z); if (ww && ww.r === q.r && ww.off * dir < -.12 && Math.abs(c.v) > .3) { fail("중앙선 침범"); break; } }
    }
    if (q && !inNode && q.r.T.n === 2 && R.startPhase >= 2) {
      const o = q.off * dir, k = o > q.r.T.lw ? 1 : 0, sStop = dir > 0 ? q.r.s1 : q.r.s0, toStop = dir > 0 ? sStop - q.s : q.s - sStop;
      if (R.lane === undefined || R.laneRoad !== q.r || R.laneDir !== dir) { R.lane = k; R.laneRoad = q.r; R.laneDir = dir; R.lc = null; }
      else if (k !== R.lane) { const want = k < R.lane ? 1 : 2;
        const noSig = c.sig !== want;
        if (noSig) deduct("진로 변경 신호", 7, "차로를 바꿀 때 방향지시등을 켜지 않음");
        else if (sigDist < 30) deduct("진로 변경 30m 전 신호", 7, "차로를 바꾸기 30m 전부터 방향지시등을 켜지 않음");
        if (toStop < SOLID && toStop > 0) deduct("진로 변경 금지 장소", 7, "실선 구간에서 차로를 바꿈");
        R.lc = { want, to: k, done: false, at: R.dist, p: noSig, p2: noSig }; R.lane = k; } // 처음부터 안 켰으면 유지, 중지는 따로 깎지 않음
      if (R.lc && !R.lc.done) { const inLane = Wh.every(w => { const ww = M.roadAt(w.x, w.z); if (!ww) return false; const ow = ww.off * dir; return R.lc.to ? ow > q.r.T.lw + .05 : ow < q.r.T.lw - .05 && ow > 0; });
        if (inLane) { R.lc.done = true; R.lc.doneAt = R.dist; } else if (c.sig !== R.lc.want && !R.lc.p) { deduct("진로 변경 신호 유지", 7, "차로를 다 바꾸기 전에 방향지시등을 끔"); R.lc.p = 1; } }
      if (R.lc && R.lc.done && c.sig === R.lc.want && R.dist - R.lc.doneAt > 10 && toStop > 60 && !R.lc.p2) { deduct("진로 변경 신호 중지", 7, "차로를 다 바꾼 뒤에도 방향지시등을 켜 둠"); R.lc.p2 = 1; }
      if (Math.abs(o - q.r.T.lw) < .45 && c.v > 1) { R.straddle += dt; if (R.straddle > 4 && !R.strP) { deduct("차로 유지", 5, "차선을 밟고 계속 달림"); R.strP = 1; } } else { R.straddle = 0; R.strP = 0; }
    }
    // 정지선 넘기: 들어가는 길·방향으로 교차로 접근 기록
    if (q && !inNode) {
      const n = M.nodes[dir > 0 ? q.r.b : q.r.a], arm = dir > 0 ? OPP[q.r.d1] : q.r.d0, sStop = dir > 0 ? q.r.s1 : q.r.s0, sF = q.s + 2.3 * dir, toStop = dir > 0 ? sStop - sF : sF - sStop;
      R.approach = { n, arm, r: q.r, dir };
      if (toStop < 15 && toStop > -1) R.minV15 = Math.min(R.minV15, c.v); else if (toStop >= 15) R.minV15 = 9;
      const L = n.sig ? M.light(n, arm, t) : null;
      if (L && L.y && R.yAt !== n.id + arm) { R.yAt = n.id + arm; R.canStop = toStop > c.v * c.v / 8 + c.v * .4 + .3; } if (L && !L.y && R.yAt === n.id + arm) R.yAt = null;
      if (R.prevToStop !== undefined && R.prevToStop > 0 && toStop <= 0 && R.prevAppr === n.id + arm) {
        R.cross = { n, arm, L: L && { ...L }, canStop: R.canStop, stopped: R.minV15 < .05, sig: c.sig, sigDist, lane: R.lane, kmh };
        if (n.stop.includes(arm) && !R.cross.stopped) deduct("일시정지", 10, "일시정지 표지 앞에서 멈추지 않음");
      }
      // 빨간불에 정지선 넘어 멈춤 (앞범퍼가 정지선이나 횡단보도를 침범)
      if (L && L.r && c.v === 0 && toStop < -.3 && toStop > -6 && R.overP !== n.id) { deduct("횡단보도 앞 정지", 10, "빨간불에 앞범퍼가 정지선을 넘어 멈춤"); R.overP = n.id; }
      // 정지선을 살짝 넘어 기다린 경우도 있으니, 신호는 횡단보도를 지나 교차로에 들어갈 때 것으로 판단
      if (R.cross && R.cross.n === n && toStop > -6.5) { R.cross.L = L && { ...L }; R.cross.canStop = R.canStop; if (c.v === 0) R.cross.stopped = true; }
      R.prevToStop = toStop; R.prevAppr = n.id + arm;
    }
    // 교차로를 빠져나온 뒤: 어디로 갔는지 보고 신호·방향지시등·차로 판단
    if (R.cross && q && !inNode && R.cross.n.id !== (dir > 0 ? q.r.b : q.r.a)) {
      const cr = R.cross, n = cr.n, dep = Object.keys(n.arms).find(d => { const dp = M.depart(n, d); return dp.r === q.r && dp.dir === dir; });
      if (dep) {
        const turn = turnOf(cr.arm, dep), L = cr.L;
        if (L) {
          if (L.r && !(turn === "r" && cr.stopped)) fail("신호 위반");
          else if (L.y && cr.canStop) fail("신호 위반 (노란불에 들어감)");
          else if (turn === "l" && !L.l && !L.y) fail("신호 위반 (좌회전 신호가 아닐 때 좌회전)");
          else if (turn === "s" && L.l && !L.g) fail("신호 위반 (좌회전 신호에 직진)");
        }
        if (turn !== "s") { const want = turn === "l" ? 1 : 2;
          if (cr.sig !== want) deduct("진로 변경 신호", 7, `${TURN[turn]}할 때 방향지시등을 켜지 않음`);
          else if (cr.sigDist >= 0 && cr.sigDist < 30) deduct("진로 변경 30m 전 신호", 7, `${TURN[turn]} 30m 전부터 방향지시등을 켜지 않음`);
          const appr = n.arms[cr.arm]; if (appr.T.n === 2 && cr.lane !== undefined && ((turn === "l" && cr.lane !== 0) || (turn === "r" && cr.lane !== 1))) deduct("지정 차로", 7, `${TURN[turn]}에 맞지 않는 차로에서 돎`);
          if (R.turnFast) deduct("서행", 10, `${TURN[turn]}할 때 천천히 가지 않음`);
        }
        if (!M.free) { const [nid, d] = plan[step] || []; if (nid === n.id && d === dep) step++; else { plan.splice(step, plan.length - step, ...reroute(q.r, dir)); say("경로를 다시 찾았습니다"); } }
      }
      R.cross = null; R.turnFast = false; R.lane = undefined; R.lc = null;
    }
    if (inNode && Math.abs(c.yawRate) > .12 && kmh > 22) R.turnFast = true;
    // 보행자 보호: 사람이 건너는 횡단보도 위로 차가 지나감
    for (const cr of M.crossings) { if (!cr.peds) continue; const busy = M.peds.some(p => p.cr === cr && p.walking && Math.hypot(p.x - mid.x, p.z - mid.z) < 6.5);
      if (busy && Math.abs(c.v) > .3 && [F, mid, at(c, 0, 0)].some(p => M.onCross(cr, p.x, p.z, .3))) { fail("보행자 보호 의무 위반 (사람이 건너는 횡단보도로 지나감)"); break; } }
    // 길 안내 음성
    const nav = navInfo(c, q, F); E.nav = nav;
    if (nav && nav.turn !== "end") { const k = `${step}:${nav.dist > 120 ? "far" : nav.dist > 40 ? "mid" : "near"}`; if (k !== saidFor && nav.dist < 300) { saidFor = k; if (nav.dist > 40) say(`${Math.round(nav.dist / 10) * 10}m 앞 ${nav.text}입니다`); else say(`${TURN[nav.turn]}하세요`); } }
    // 끝: 목적지 칸에 멈추면 주차 브레이크, P, 시동 끄기
    if (!M.free && step >= plan.length && q && q.r === M.alley && dir === -1 && q.s > M.END.s0 - 3 && q.s < M.END.s1 + 2) {
      if (c.v === 0) { R.endT += dt; if (R.endT > 1 && !R.endSaid) { R.endSaid = 1; if (!c.auto) say("도착했습니다. 주차 브레이크를 걸고, 기어를 P에 두고, 시동을 끄세요"); } }
      if (R.endSaid && (c.auto || !c.engine || R.endT > 20)) { if (!c.auto) { if (!c.pb) deduct("종료", 5, "주차 브레이크를 걸지 않음"); if (c.gear !== "P") deduct("종료", 5, "기어를 P에 두지 않음"); if (c.engine) deduct("종료", 5, "시동을 끄지 않음"); } E.done = true; ctx.finish(); } // 간단 조작은 멈추면 끝
    }
  }
  return {
    E, update, light: () => null, get alarm() { return false; },
    hud() { return { task: M.free ? "" : step >= plan.length ? "목적지" : "길 안내", time: E.run, limit: 0, nav: E.nav, lim: E.lim }; },
    nextPoint() { if (M.free) return null; const s = plan[step]; return s ? [M.nodes[s[0]].x, M.nodes[s[0]].z] : [M.alley.pts[97].x + 2.3, M.alley.pts[97].z]; },
  };
}
