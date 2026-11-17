// 맵을 짓는 도구: 길 중심선, 바닥 칠(한 덩어리로 묶음), 선 검사 격자, 부딪히는 물체, 표지판, 신호등
import * as THREE from "three";

// ── 중심선: 시작점·방향에서 직선과 호를 이어 1m 간격 점으로 ──
// 방향 yaw: 앞 = (sin, cos). 오른쪽 = (-cos, sin). 호 ang > 0 이면 왼쪽으로 돎
export function path(x, z, yaw) {
  const pts = [{ x, z, yaw, s: 0 }];
  const o = {
    pts,
    line(len) { const p = pts.at(-1), n = Math.max(1, Math.ceil(len)); for (let i = 1; i <= n; i++) { const d = len * i / n; pts.push({ x: p.x + Math.sin(p.yaw) * d, z: p.z + Math.cos(p.yaw) * d, yaw: p.yaw, s: p.s + d }); } return o; },
    arc(R, ang) { const p = pts.at(-1), n = Math.max(2, Math.ceil(R * Math.abs(ang))), sg = Math.sign(ang);
      const cx = p.x + Math.cos(p.yaw) * R * sg, cz = p.z - Math.sin(p.yaw) * R * sg; // 돌아가는 가운데 (왼쪽 또는 오른쪽)
      for (let i = 1; i <= n; i++) { const y = p.yaw + ang * i / n; pts.push({ x: cx - Math.cos(y) * R * sg, z: cz + Math.sin(y) * R * sg, yaw: y, s: p.s + R * Math.abs(ang) * i / n }); } return o; },
  };
  return o;
}
export const offPt = (p, o) => ({ x: p.x - Math.cos(p.yaw) * o, z: p.z + Math.sin(p.yaw) * o }); // 오른쪽으로 o
export function cut(pts, s0, s1) { // s0~s1 구간만 (끝은 사이를 메움)
  const out = [], lerp = (a, b, s) => { const k = (s - a.s) / (b.s - a.s || 1); return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, yaw: a.yaw + Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw)) * k, s }; };
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (b.s < s0 || a.s > s1) continue;
    if (!out.length) out.push(a.s >= s0 ? a : lerp(a, b, s0)); out.push(b.s <= s1 ? b : lerp(a, b, s1)); }
  return out;
}

// ── 바닥 칠: 색이 다른 납작한 면들을 정점 색으로 한 덩어리에 ──
export class Flat {
  constructor(hgt) { this.p = []; this.c = []; this.h = hgt; this.k = new THREE.Color(); }
  tri(a, b, c, col, y) { this.k.set(col); for (const v of [a, b, c]) { this.p.push(v.x, this.h(v.x, v.z) + y, v.z); this.c.push(this.k.r, this.k.g, this.k.b); } }
  quad(a, b, c, d, col, y) { this.tri(a, b, c, col, y); this.tri(a, c, d, col, y); } // a b c d 둘레 순서
  band(pts, o0, o1, col, y) { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; this.quad(offPt(a, o0), offPt(b, o0), offPt(b, o1), offPt(a, o1), col, y); } }
  dash(pts, o, w, on, off, col, y) { const L = pts.at(-1).s; for (let s = pts[0].s; s < L; s += on + off) this.band(cut(pts, s, Math.min(L, s + on)), o - w / 2, o + w / 2, col, y); }
  fan(c0, ring, col, y) { for (let i = 0; i < ring.length - 1; i++) this.tri(c0, ring[i], ring[i + 1], col, y); }
  mesh(scene) {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); return m;
  }
}
export const arcPts = (cx, cz, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return { x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r }; });

// ── 선 검사: 바퀴가 선에 닿았는지 (10m 칸 격자) ──
export class Lines {
  constructor() { this.cells = new Map(); }
  key(i, j) { return i * 100003 + j; }
  add(a, b, hw, tag, ref = null) {
    const seg = { ax: a.x, az: a.z, bx: b.x, bz: b.z, hw, tag, ref };
    const i0 = Math.floor(Math.min(a.x, b.x) / 10), i1 = Math.floor(Math.max(a.x, b.x) / 10), j0 = Math.floor(Math.min(a.z, b.z) / 10), j1 = Math.floor(Math.max(a.z, b.z) / 10);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = this.key(i, j); (this.cells.get(k) || this.cells.set(k, []).get(k)).push(seg); }
  }
  addPts(pts, o, hw, tag, ref) { for (let i = 0; i < pts.length - 1; i++) this.add(offPt(pts[i], o), offPt(pts[i + 1], o), hw, tag, ref); }
  addRing(ring, hw, tag, ref) { for (let i = 0; i < ring.length - 1; i++) this.add(ring[i], ring[i + 1], hw, tag, ref); }
  hits(p, pad) { // p 둘레 pad 안에 걸친 선들
    const out = [], i = Math.floor(p.x / 10), j = Math.floor(p.z / 10);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const s of this.cells.get(this.key(i + a, j + b)) || []) {
      const dx = s.bx - s.ax, dz = s.bz - s.az, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((p.x - s.ax) * dx + (p.z - s.az) * dz) / L2));
      if (Math.hypot(p.x - s.ax - dx * t, p.z - s.az - dz * t) < s.hw + pad && !out.includes(s)) out.push(s); }
    return out;
  }
}

export function textTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
export const SANS = '"Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif', MONO = '"IBM Plex Mono", monospace';

// 바닥 글씨 ("출발", "종료", "어린이 보호구역" …): 진행 방향에서 바로 읽히게
export function floorText(scene, txt, x, z, yaw, w, h, col = "#f2f1ec", y = .05) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: textTex(512, Math.round(512 * h / w), (g, W, H) => {
    g.fillStyle = col; g.font = `700 ${H * .78}px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.save(); g.scale(1, 1.0); g.fillText(txt, W / 2, H / 2 + H * .04); g.restore(); }) }));
  m.rotation.order = "YXZ"; m.rotation.set(-Math.PI / 2, yaw + Math.PI, 0); m.position.set(x, y, z); scene.add(m); return m;
}

// ── 표지판: 기둥 + 얼굴(캔버스 그림). face = 표지가 바라보는 방향(yaw) ──
const PAINT = {
  max: (g, W, n) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(W / 2, W / 2, W * .46, 0, 7); g.fill(); g.lineWidth = W * .11; g.strokeStyle = "#d22"; g.stroke(); g.fillStyle = "#111"; g.font = `800 ${W * .42}px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, W / 2, W / 2 + W * .03); },
  min: (g, W, n) => { g.fillStyle = "#1f56b3"; g.beginPath(); g.arc(W / 2, W / 2, W * .46, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = `800 ${W * .4}px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, W / 2, W / 2 - W * .02); g.fillRect(W * .3, W * .7, W * .4, W * .05); },
  tri: (g, W, draw) => { g.fillStyle = "#fff"; g.strokeStyle = "#d22"; g.lineWidth = W * .07; g.lineJoin = "round"; g.beginPath(); g.moveTo(W / 2, W * .08); g.lineTo(W * .94, W * .88); g.lineTo(W * .06, W * .88); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#111"; g.strokeStyle = "#111"; draw(g, W); },
  inv: (g, W, t) => { g.fillStyle = "#fff"; g.strokeStyle = "#d22"; g.lineWidth = W * .07; g.lineJoin = "round"; g.beginPath(); g.moveTo(W * .06, W * .12); g.lineTo(W * .94, W * .12); g.lineTo(W / 2, W * .92); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#d22"; g.font = `800 ${W * .17}px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, W / 2, W * .36); },
  sq: (g, W, t, bg = "#1f56b3", fs = .5) => { g.fillStyle = bg; g.fillRect(W * .06, W * .06, W * .88, W * .88); g.strokeStyle = "#fff"; g.lineWidth = W * .03; g.strokeRect(W * .1, W * .1, W * .8, W * .8); g.fillStyle = "#fff"; g.font = `800 ${W * fs}px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, W / 2, W / 2 + W * .03); },
};
const signCache = new Map();
export function sign(scene, kind, arg, x, z, face, { h = 2.2, size = .75, hgt = () => 0 } = {}) {
  const key = kind + "|" + arg;
  let tex = signCache.get(key);
  if (!tex) { tex = textTex(256, 256, (g, W) => {
      if (kind === "up") PAINT.tri(g, W, (g, W) => { g.beginPath(); g.moveTo(W * .25, W * .78); g.lineTo(W * .75, W * .78); g.lineTo(W * .75, W * .45); g.closePath(); g.fill(); g.font = `800 ${W * .13}px ${SANS}`; g.textAlign = "center"; g.fillText(arg, W * .44, W * .72); });
      else if (kind === "down") PAINT.tri(g, W, (g, W) => { g.beginPath(); g.moveTo(W * .25, W * .78); g.lineTo(W * .75, W * .78); g.lineTo(W * .25, W * .45); g.closePath(); g.fill(); g.font = `800 ${W * .13}px ${SANS}`; g.textAlign = "center"; g.fillText(arg, W * .56, W * .72); });
      else if (kind === "cross") PAINT.tri(g, W, (g, W) => { g.fillRect(W * .44, W * .36, W * .12, W * .44); g.fillRect(W * .3, W * .52, W * .4, W * .12); });
      else if (kind === "kids") PAINT.tri(g, W, (g, W) => { g.font = `800 ${W * .26}px ${SANS}`; g.textAlign = "center"; g.fillText("👫", W / 2, W * .7); });
      else if (kind === "walk") PAINT.sq(g, W, "횡단", "#1f56b3", .3);
      else if (kind === "park") PAINT.sq(g, W, "P", "#1f56b3", .62);
      else if (kind === "stop") PAINT.inv(g, W, "정지");
      else if (kind === "slow") PAINT.inv(g, W, "천천히");
      else PAINT[kind](g, W, arg);
    }); signCache.set(key, tex); }
  const g = new THREE.Group(); g.position.set(x, hgt(x, z), z); g.rotation.y = face; scene.add(g);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, h, 8), POLE); pole.position.y = h / 2; pole.castShadow = true; g.add(pole);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })); f.position.set(0, h + size * .1, .06); g.add(f);
  return g;
}
export const POLE = new THREE.MeshStandardMaterial({ color: 0x8f8f8c, roughness: .5, metalness: .3 });

// ── 신호등: 4색 (빨강, 노랑, 좌회전 화살표, 초록). 기둥은 운전자 오른쪽, 팔은 왼쪽으로 길 위에 ──
const LAMP = ["#e8392b", "#f2b417", "#22b14c", "#22b14c"];
export function signalHead(scene, x, z, face, armLen, { h = 3.6 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = face; scene.add(g);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, h + .5, 10), POLE); pole.position.y = (h + .5) / 2; pole.castShadow = true; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, .1, .1), POLE); arm.position.set(-armLen / 2, h + .35, 0); g.add(arm);
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.32, .38, .26), new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: .6 })); box.position.set(.5 - armLen, h, 0); box.castShadow = true; g.add(box);
  const off = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(.18) });
  const lamps = LAMP.map((c, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(.13, 18), off(c)); m.position.set(.5 - armLen + (i - 1.5) * .31, h, .135); g.add(m); m.userData = { on: new THREE.MeshBasicMaterial({ color: c }), off: m.material }; return m; });
  const arrow = new THREE.Mesh(new THREE.PlaneGeometry(.18, .18), new THREE.MeshBasicMaterial({ transparent: true, map: textTex(64, 64, (g2) => { g2.fillStyle = "#111"; g2.font = "700 54px sans-serif"; g2.textAlign = "center"; g2.textBaseline = "middle"; g2.fillText("←", 32, 34); }) }));
  arrow.position.set(lamps[2].position.x, h, .14); g.add(arrow);
  return { set(st) { /* st = { r, y, l, g } */ ["r", "y", "l", "g"].forEach((k, i) => { lamps[i].material = st[k] ? lamps[i].userData.on : lamps[i].userData.off; }); } };
}

// 사람 모양(오가는 보행자·관계자): 몸통 캡슐 + 머리
export function person(color) {
  const o = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color, roughness: .8 });
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(.2, .75, 4, 10), m); b.position.y = .95; b.castShadow = true; o.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(.15, 14, 10), new THREE.MeshStandardMaterial({ color: 0xe9d3bf, roughness: .8 })); h.position.y = 1.62; o.add(h);
  const legs = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.BoxGeometry(.13, .55, .13), new THREE.MeshStandardMaterial({ color: 0x2a2b30 })); l.position.set(s * .1, .28, 0); o.add(l); return l; });
  o.userData.legs = legs; return o;
}
