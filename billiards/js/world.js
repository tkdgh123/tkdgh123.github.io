// 당구장 장면: 실제 치수(m). three 좌표 = (물리 x, 높이, -물리 y)
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/lights/RectAreaLightUniformsLib.js";

export const CLOTH_Y = 0.755;     // 천 높이 (틀 윗면 0.805)
export const RAIL_TOP = 0.050;    // 천에서 틀 윗면까지
export const RAIL_W = 0.130;      // 쿠션 코끝에서 틀 바깥까지
export const ROOM = { x: 9.0, z: 7.4, h: 3.0 };

export const toThree = (r) => new THREE.Vector3(r[0], CLOTH_Y + r[2], -r[1]);

function noiseTex(w, h, base, amp, seed = 1, repeat = 1) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), img = g.createImageData(w, h);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < w * h; i++) {
    const n = (rnd() - 0.5) * amp;
    img.data[i * 4] = base[0] + n; img.data[i * 4 + 1] = base[1] + n; img.data[i * 4 + 2] = base[2] + n; img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function woodTex(seed, dark) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 64;
  const g = c.getContext("2d");
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = dark; g.fillRect(0, 0, 512, 64);
  for (let i = 0; i < 70; i++) {
    const y = rnd() * 64, a = 0.05 + rnd() * 0.12;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? "0,0,0" : "255,210,170"},${a})`; g.lineWidth = 0.5 + rnd() * 2;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 * rnd());
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 단면(u = 쿠션 코끝 선에서 바깥쪽, v = 천에서 위)을 사각형 둘레로 돌려 모서리를 45도로 맞춘 틀
function ringFromProfile(prof, hx, hz, uvScale = 1) {
  const pos = [], uv = [];
  const corner = (u, k) => { // k: 0..3 모서리, 시계 반대
    const sx = [1, -1, -1, 1][k], sz = [1, 1, -1, -1][k];
    return [sx * (hx + u), sz * (hz + u)];
  };
  for (let i = 0; i < prof.length; i++) {
    const [u0, v0] = prof[i], [u1, v1] = prof[(i + 1) % prof.length];
    for (let k = 0; k < 4; k++) {
      const a0 = corner(u0, k), b0 = corner(u0, (k + 1) % 4), a1 = corner(u1, k), b1 = corner(u1, (k + 1) % 4);
      const P = [[a0[0], v0, a0[1]], [b0[0], v0, b0[1]], [b1[0], v1, b1[1]], [a1[0], v1, a1[1]]];
      const L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) * uvScale;
      const U = [[0, 0], [L, 0], [L, 1], [0, 1]];
      for (const j of [0, 1, 2, 0, 2, 3]) { pos.push(...P[j]); uv.push(...U[j]); } // 바깥(위)을 보는 면이 앞면이 되게
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

export function buildTable(p, opt = {}) {
  const hx = p.L / 2, hz = p.W / 2;
  const group = new THREE.Group();
  const cloth = opt.clothMat || new THREE.MeshStandardMaterial({ color: 0x1a4d98, roughness: 0.96, metalness: 0, map: noiseTex(256, 256, [235, 235, 235], 22, 3, 30) });
  // 천을 씌운 바닥면
  const bed = new THREE.Mesh(new THREE.BoxGeometry(p.L + 0.1, 0.045, p.W + 0.1), cloth);
  bed.position.y = CLOTH_Y - 0.0225; bed.receiveShadow = true; group.add(bed);
  // 쿠션 고무(천으로 덮임): 코끝 높이 = p.cushionH, 아래는 파임
  const h = p.cushionH;
  const cush = new THREE.Mesh(ringFromProfile([[0, h], [0.004, h + 0.004], [0.042, RAIL_TOP], [0.042, 0], [0.024, 0]], hx, hz, 4), cloth);
  cush.position.y = CLOTH_Y; cush.receiveShadow = true; cush.castShadow = true; group.add(cush);
  // 나무 틀
  const wood = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex(5, "#3a2114"), roughness: 0.38, metalness: 0 });
  const rail = new THREE.Mesh(ringFromProfile([[0.042, RAIL_TOP], [RAIL_W - 0.012, RAIL_TOP], [RAIL_W - 0.003, RAIL_TOP - 0.004], [RAIL_W, RAIL_TOP - 0.014], [RAIL_W, -0.11], [RAIL_W - 0.01, -0.13], [0.042, -0.13]], hx, hz, 3), wood);
  rail.position.y = CLOTH_Y; rail.castShadow = true; rail.receiveShadow = true; group.add(rail);
  // 포인트(자개): 경기면 길이의 1/8 간격, 틀 가운데
  const pearl = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.25, metalness: 0.1 });
  const dg = new THREE.CylinderGeometry(0.0065, 0.0065, 0.002, 20);
  const step = p.L / 8, um = 0.042 + (RAIL_W - 0.042) / 2;
  const dots = [];
  for (let i = 1; i < 8; i++) for (const s of [1, -1]) dots.push([-hx + i * step, s * (hz + um)]);
  for (let i = 1; i < 4; i++) for (const s of [1, -1]) dots.push([s * (hx + um), -hz + i * step]);
  for (const [x, z] of dots) { const d = new THREE.Mesh(dg, pearl); d.position.set(x, CLOTH_Y + RAIL_TOP + 0.0005, z); group.add(d); }
  // 몸통과 다리
  const body = new THREE.MeshStandardMaterial({ color: 0x1b1412, roughness: 0.55 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(p.L + 0.16, 0.42, p.W + 0.16), body);
  box.position.y = CLOTH_Y - 0.13 - 0.21; box.castShadow = true; box.receiveShadow = true; group.add(box);
  const legG = new THREE.CylinderGeometry(0.075, 0.09, 0.22, 24);
  for (const x of [-hx + 0.2, 0, hx - 0.2]) for (const z of [-hz + 0.15, hz - 0.15]) {
    const l = new THREE.Mesh(legG, body); l.position.set(x, 0.11, z); l.castShadow = true; group.add(l);
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(p.L - 0.1, 0.05, p.W - 0.2), body); base.position.y = 0.2; group.add(base);
  return { group, cloth };
}

function buildLamp(len, wid) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.BoxGeometry(len + 0.06, 0.12, wid + 0.06), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.6, metalness: 0.3 }));
  g.add(shell);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(len, wid), new THREE.MeshBasicMaterial({ color: 0xfff6e8 }));
  panel.rotation.x = Math.PI / 2; panel.position.y = -0.0605; g.add(panel);
  for (const s of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    rod.position.set(s * len * 0.35, 0.56, 0); g.add(rod);
  }
  return g;
}

// 벽 점수판 (전자 점수판 모양, 글은 main이 그려 넣음)
function buildBoard() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.56, 0.04), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.4, metalness: 0.4 }));
  g.add(frame);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.z = 0.021; g.add(scr);
  return { group: g, canvas: c, tex };
}

export function buildCue(spec) {
  // 길이 1.42m, 팁 지름 spec.tip, 뒤로 갈수록 굵어짐. 원점 = 팁 끝, +z 쪽이 뒤
  const L = 1.42, pts = [];
  const prof = [[0, spec.tip / 2 * 0.86], [0.002, spec.tip / 2], [0.012, spec.tip / 2], [0.013, spec.tip / 2 + 0.0002], [0.03, spec.tip / 2 + 0.0004], [0.30, 0.0064], [0.70, 0.0095], [0.72, 0.0105], [0.74, 0.0105], [1.0, 0.0125], [1.38, 0.0145], [1.415, 0.0145], [1.42, 0.012], [1.42, 0]];
  for (const [z, r] of prof) pts.push(new THREE.Vector2(r, z));
  pts.unshift(new THREE.Vector2(0, 0));
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.rotateX(Math.PI / 2); // y 축 -> z 축
  // 부분별 색: 버텍스 색으로
  const col = [], c = new THREE.Color();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    if (z < 0.0115) c.set(spec.tipColor || 0x3b5f8c);
    else if (z < 0.03) c.set(0xf4f1e8);
    else if (z < 0.70) c.set(spec.shaft || 0xe6cfa2);
    else if (z < 0.745) c.set(0xc0c0c0);
    else if (z < 1.0) c.set(spec.forearm || 0x5a2a14);
    else if (z < 1.25) c.set(spec.wrap || 0x1a1a1a);
    else c.set(spec.butt || 0x3a1a0c);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true;
  const g = new THREE.Group(); g.add(mesh);
  return g;
}

export const CUES = [
  { name: "하우스 큐 1", M: 0.54, endRatio: 18, tip: 0.012, hard: "하드", shaft: 0xd9bd8c, forearm: 0x6b2f17, butt: 0x2a140a, wrap: 0x202020 },
  { name: "하우스 큐 2", M: 0.52, endRatio: 21, tip: 0.0115, hard: "미디엄", shaft: 0xe3c896, forearm: 0x1d1d1d, butt: 0x111111, wrap: 0x3b3b3b, worn: true },
  { name: "개인 카본 큐", M: 0.525, endRatio: 36, tip: 0.012, hard: "미디엄", shaft: 0x1c1c1e, forearm: 0x7a1f1f, butt: 0x2b0e0e, wrap: 0x0e0e0e },
];

// 공: 4구 공은 무늬가 없어서 회전은 초크 자국으로만 보임
export function buildBall(color, R) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const g = c.getContext("2d"); g.fillStyle = color; g.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06, metalness: 0 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), mat);
  m.castShadow = true;
  m.userData = { canvas: c, tex, base: color };
  return m;
}
// 공 표면 한 점(공 기준 단위벡터)에 초크 자국
export function chalkMark(ball, local) {
  const { canvas, tex } = ball.userData;
  const g = canvas.getContext("2d");
  // SphereGeometry uv: u = 경도, v = 위도
  const u = 0.5 + Math.atan2(local.z, -local.x) / (2 * Math.PI);
  const v = Math.acos(Math.max(-1, Math.min(1, local.y))) / Math.PI;
  const x = u * 256, y = v * 128;
  g.fillStyle = "rgba(40,90,170,0.55)";
  for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 2, 1.6 + Math.random() * 1.5, 1.2 + Math.random(), 0, 0, 7); g.fill(); }
  tex.needsUpdate = true;
}

export function buildWorld(renderer, p) {
  RectAreaLightUniformsLib.init();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0d0e);
  scene.fog = new THREE.Fog(0x0c0d0e, 7, 16);
  // 방
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.x, ROOM.z), new THREE.MeshStandardMaterial({ color: 0xffffff, map: noiseTex(256, 256, [62, 58, 54], 18, 9, 6), roughness: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a504b, roughness: 0.92 });
  const walls = [
    [ROOM.x, 0, -ROOM.z / 2, 0], [ROOM.x, 0, ROOM.z / 2, Math.PI], [ROOM.z, -ROOM.x / 2, 0, Math.PI / 2], [ROOM.z, ROOM.x / 2, 0, -Math.PI / 2],
  ];
  for (const [w, x, z, ry] of walls) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, ROOM.h), wallMat); m.position.set(x, ROOM.h / 2, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.x, ROOM.z), new THREE.MeshStandardMaterial({ color: 0x151617, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM.h; scene.add(ceil);
  // 걸레받이
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
  for (const [w, x, z, ry] of walls) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.02), skirtMat); s.position.set(x, 0.05, z); s.rotation.y = ry; scene.add(s); }

  scene.add(new THREE.HemisphereLight(0xb8c0cc, 0x2a2420, 0.4));
  // 천장 등 몇 개 (당구장 통로 쪽 은은한 빛)
  for (const [x, z] of [[-3, -2.6], [3, -2.6], [-3, 2.6], [3, 2.6]]) { const l = new THREE.PointLight(0xffe2c0, 1.6, 6, 1.6); l.position.set(x, ROOM.h - 0.2, z); scene.add(l); }

  // 가운데 테이블(치는 것)과 옆 테이블 둘. 테이블 사이 간격은 연맹 규정 1.5m 이상
  const tables = [];
  const main = buildTable(p); scene.add(main.group); tables.push({ x: 0, z: 0 });
  for (const z of [-(p.W + 0.26 + 1.6), p.W + 0.26 + 1.6]) {
    const t = buildTable(p, { clothMat: main.cloth }); t.group.position.z = z; scene.add(t.group); tables.push({ x: 0, z });
  }
  // 등박스: 테이블 위 약 1m
  const lampY = CLOTH_Y + 1.05;
  for (const t of tables) {
    const lamp = buildLamp(1.9, 0.62); lamp.position.set(t.x, lampY, t.z); scene.add(lamp);
    const area = new THREE.RectAreaLight(0xfff3e2, t.z === 0 ? 1.5 : 1.1, 1.9, 0.62);
    area.position.set(t.x, lampY - 0.062, t.z); area.lookAt(t.x, 0, t.z); scene.add(area);
  }
  // 그림자용 빛(등박스 자리에서 아래로)
  const sun = new THREE.DirectionalLight(0xfff3e2, 0.4);
  sun.position.set(0.0, lampY, 0.0); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1.7, right: 1.7, top: 1.0, bottom: -1.0, near: 0.5, far: 2.5 });
  sun.shadow.radius = 4; sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);
  // 둥근 빛 번짐을 위한 점광원 몇 개 (등박스 안 LED를 흉내)
  for (const x of [-0.6, 0, 0.6]) { const pl = new THREE.PointLight(0xfff0dd, 0.25, 2.2, 2); pl.position.set(x, lampY - 0.08, 0); scene.add(pl); }

  // 점수판: 테이블 긴 쪽 벽
  const board = buildBoard(); board.group.position.set(0, 1.75, -ROOM.z / 2 + 0.03); scene.add(board.group);
  // 큐걸이: 짧은 쪽 벽
  const rack = new THREE.Group();
  const rackWood = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.5 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.9), rackWood); top.position.set(0, 1.45, 0); rack.add(top);
  const bot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.9), rackWood); bot.position.set(0.02, 0.22, 0); rack.add(bot);
  const cueMeshes = CUES.map((s, i) => {
    const c = buildCue(s); c.rotation.x = -Math.PI / 2; c.position.set(0.035, 0.2, -0.25 + i * 0.25); c.userData.cueIndex = i; rack.add(c); return c;
  });
  rack.position.set(ROOM.x / 2 - 0.05, 0, -1.6); scene.add(rack);

  // 반사용 환경: 어두운 방 + 밝은 등박스
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 4, 8), new THREE.MeshBasicMaterial({ color: 0x2a2c2e, side: THREE.BackSide })));
  // 공 아랫면에 비치는 파란 천
  const envCloth = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), new THREE.MeshBasicMaterial({ color: 0x2a5aa8 }));
  envCloth.rotation.x = -Math.PI / 2; envCloth.position.y = -0.03; env.add(envCloth);
  for (const z of [0, -3, 3]) { const pnl = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.62), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.96, 0.9).multiplyScalar(z ? 2 : 5) })); pnl.rotation.x = Math.PI / 2; pnl.position.set(0, 1.0, z); env.add(pnl); }
  const envTex = pm.fromScene(env, 0.02).texture;
  scene.environment = envTex; scene.environmentIntensity = 0.6;

  return { scene, board, rack, cueMeshes, tables };
}

// 브리지 손(왼손, 오픈 브리지, 세 손가락 장갑). 원점 = 큐가 얹히는 엄지와 검지 사이 홈(높이 0.03),
// 바닥(천) = y -0.03, +x = 큐가 나가는 쪽, +z = 왼쪽으로 만든 뒤 마지막에 거울로 뒤집음
export function buildHand() {
  const skin = new THREE.MeshStandardMaterial({ color: 0xc8906f, roughness: 0.6 });
  const glove = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.55, metalness: 0.05 });
  const g = new THREE.Group(), H = 0.03;
  const v = (x, y, z) => new THREE.Vector3(x, y - H, z);
  const seg = (a, b, r, mat) => { // a에서 b까지 둥근 마디
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(L - 0.0001, 0.0001), 5, 12), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true; g.add(m);
  };
  const finger = (base, ang, len, r, mat) => { // 세 마디, 끝이 천에 닿게 살짝 굽힘
    const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
    const k1 = base.clone().addScaledVector(dir, len * 0.45).setY(base.y + 0.004);
    const k2 = k1.clone().addScaledVector(dir, len * 0.30).setY(r + 0.002 - H);
    const tip = k2.clone().addScaledVector(dir, len * 0.25).setY(r - H);
    seg(base, k1, r * 1.05, mat); seg(k1, k2, r, mat); seg(k2, tip, r * 0.92, mat);
  };
  // 손바닥: 둥근 판, 홈의 왼쪽 뒤
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), glove);
  palm.scale.set(0.046, 0.013, 0.043); palm.position.copy(v(-0.035, 0.014, 0.045)); palm.rotation.y = 0.25; palm.castShadow = true; g.add(palm);
  // 손가락 (검지, 중지는 장갑 / 약지, 소지는 맨손)
  finger(v(0.004, 0.022, 0.016), 0.30, 0.080, 0.0082, glove);
  finger(v(-0.002, 0.020, 0.038), 0.52, 0.086, 0.0084, glove);
  finger(v(-0.012, 0.018, 0.058), 0.78, 0.078, 0.0078, skin);
  finger(v(-0.026, 0.016, 0.074), 1.05, 0.064, 0.0070, skin);
  // 검지 뿌리 마디와 엄지가 만드는 홈
  seg(v(-0.012, 0.022, 0.012), v(0.006, 0.024, 0.016), 0.010, glove);
  seg(v(-0.050, 0.010, 0.012), v(-0.020, 0.018, 0.002), 0.011, glove);
  seg(v(-0.020, 0.018, 0.002), v(0.004, 0.020, 0.000), 0.0092, glove);
  // 손목에서 팔로
  seg(v(-0.075, 0.016, 0.058), v(-0.125, 0.03, 0.095), 0.019, skin);
  for (const c of g.children) { c.position.z *= -1; const q = c.quaternion; c.quaternion.set(-q.x, -q.y, q.z, q.w); c.rotation.setFromQuaternion(c.quaternion); }
  return g;
}
