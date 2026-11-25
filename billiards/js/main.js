// 1인칭 4구. 걷기 -> 엎드리기 -> 눈높이, 당점, 겨냥 -> 마우스 스트로크 -> 지켜보기
import * as THREE from "three";
import * as P from "./physics.js";
import * as W from "./world.js";
import * as R4 from "./rules4.js";
import * as SND from "./sound.js";

const $ = (s) => document.querySelector(s);
const TEST = new URLSearchParams(location.search).has("test");

// ---------- 설정 ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem("bill4." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("bill4." + k, JSON.stringify(v)); } catch {} },
};
const cfg = {
  gain: store.get("gain", 1.0),        // 스트로크 감도 (1 = 마우스 1px에 큐 0.08mm)
  aim: store.get("aim", 1.0),          // 마우스 감도 (둘러보기, 겨냥, 눈높이)
  lock: store.get("lock", false),      // 스트로크 고정: 치는 동안 큐가 옆으로 안 흔들림
  vol: store.get("vol", 0.8),
  showTip: store.get("showTip", true),
  table: store.get("table", "중대"),
  ball: store.get("ball", 65.5),
};

function params() {
  const big = cfg.table === "대대";
  const R = cfg.ball / 2000;
  return P.makeParams({ L: big ? 2.844 : 2.448, W: big ? 1.422 : 1.224, cushionH: big ? 0.037 : 0.040, R, m: cfg.ball === 63 ? 0.227 : 0.255 });
}
let p = params();

// ---------- 렌더러와 장면 ----------
const canvas = $("#gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

let world = W.buildWorld(renderer, p);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.01, 40);
camera.rotation.order = "YXZ";
addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

const COLORS = ["#f4f1e8", "#f0bf2a", "#c41e1a", "#c41e1a"];
let balls = [], ballMesh = [];
function makeBalls() {
  ballMesh.forEach((m) => world.scene.remove(m));
  ballMesh = COLORS.map((c) => { const m = W.buildBall(c, p.R); m.quaternion.setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, 0)); world.scene.add(m); return m; });
}
makeBalls();

// 큐
let cueIdx = 0, cueSpec = W.CUES[0], cueMesh = null;
function holdCue(i) {
  cueIdx = i; cueSpec = W.CUES[i];
  if (cueMesh) world.scene.remove(cueMesh);
  cueMesh = W.buildCue(cueSpec); cueMesh.visible = false; world.scene.add(cueMesh);
  world.cueMeshes.forEach((c, k) => (c.visible = k !== i));
}
holdCue(store.get("cue", 0));
const hand = W.buildHand(); hand.visible = false; world.scene.add(hand);

// 초크: 팁 면을 32x32 칸으로, 칸마다 묻은 정도 0..1
const tipCov = new Float32Array(32 * 32).fill(0.75);
const tipCells = [];
for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { const x = (i + 0.5) / 16 - 1, y = (j + 0.5) / 16 - 1; if (x * x + y * y <= 1) tipCells.push([j * 32 + i, x, y]); }
// 공에 닿는 팁 자리: 팁 끝은 반지름 약 9.5mm(10원 동전) 둥근 면이라 당점이 가장자리로 갈수록 팁 가장자리가 닿음
// 초크 그림은 팁을 앞에서 본 모양: 오른쪽 당점(a>0)은 그림 오른쪽, 위 당점(b>0)은 그림 아래
function tipSpot(a, b) { const k = 0.0095 / (cueSpec.tip / 2); return [a * k, b * k]; }
function tipMuAt(a, b) {
  const [sx, sy] = tipSpot(a, b);
  let s = 0, n = 0; for (const [k, x, y] of tipCells) if (Math.hypot(x - sx, y - sy) < 0.3) { s += tipCov[k]; n++; }
  return 0.25 + 0.40 * (n ? s / n : 0) * (cueSpec.worn ? 0.85 : 1);
}
function wearTip(speed, a, b) {
  const [sx, sy] = tipSpot(a, b);
  for (const [k, x, y] of tipCells) if (Math.hypot(x - sx, y - sy) < 0.35) tipCov[k] *= Math.max(0.55, 0.82 - 0.025 * speed);
}

// ---------- 게임 상태 ----------
let game = null, mode = "menu", sim = null, simT = 0, shotInfo = null, banking = null;
const me = { x: -2.1, z: 0.9, yaw: -Math.PI / 2 + 0.35, pitch: -0.35, eye: 1.62 };
const st = { phi: 0, a: 0, b: 0, elevUser: 0, eyeH: 0.22, headYaw: 0, headPitch: 0, rest: false, lean: 0 };
const stroke = { on: false, s: 0, dl: 0, hist: [], hit: false, hitT: 0, follow: 0 };
const keys = new Set();
let msgTimer = 0;
function say(t, sec = 2.6) { const m = $("#msg"); m.textContent = t; m.hidden = !t; msgTimer = sec; }

function myBall() { return game ? game.players[game.turn].ball : 0; }

function placeBalls(pos) {
  balls = pos.map((xy, i) => P.newBall(i, xy[0], xy[1], p));
  syncMeshes(balls);
}
function syncMeshes(bs) { bs.forEach((b, i) => { ballMesh[i].visible = b.s !== -1; if (b.s !== -1) ballMesh[i].position.copy(W.toThree(b.r)); }); }

// ---------- 점수판 ----------
function drawBoard() {
  const { canvas: c, tex } = world.board, g = c.getContext("2d");
  g.fillStyle = "#050607"; g.fillRect(0, 0, 1024, 512);
  if (!game) { g.fillStyle = "#3d6"; g.font = "bold 64px monospace"; g.fillText("BILLIARD", 330, 280); tex.needsUpdate = true; return; }
  const rows = game.players;
  rows.forEach((pl, i) => {
    const y = 60 + i * 220, on = game.turn === i && !game.over;
    g.fillStyle = on ? "#16211a" : "#0b0d0e"; g.fillRect(24, y, 976, 196);
    g.fillStyle = i === 0 ? "#f4f1e8" : "#f0bf2a"; g.beginPath(); g.arc(90, y + 98, 34, 0, 7); g.fill();
    g.fillStyle = on ? "#7dffa0" : "#4f7d5b"; g.font = "bold 46px 'Pretendard Variable', sans-serif";
    g.fillText(pl.name, 150, y + 80);
    g.font = "32px 'Pretendard Variable', sans-serif"; g.fillStyle = "#6a8f76";
    g.fillText(game.mode === "solo" ? `득점 ${pl.points}  이닝 ${pl.innings}` : `수지 ${pl.suji}  이닝 ${pl.innings}`, 150, y + 140);
    g.font = "bold 150px monospace"; g.fillStyle = pl.finishing ? "#ff6a5a" : (on ? "#9dffb8" : "#4f7d5b");
    const t = game.mode === "solo" && !pl.finishing ? String(pl.left) : (pl.finishing ? "3C" : String(pl.left));
    g.textAlign = "right"; g.fillText(t, 980, y + 150); g.textAlign = "left";
  });
  if (game.mode === "solo") { g.fillStyle = "#4f7d5b"; g.font = "30px 'Pretendard Variable', sans-serif"; g.fillText("혼자 연습", 40, 330); }
  tex.needsUpdate = true;
}

function hud() {
  if (!game) return;
  const pl = game.players[game.turn];
  $("#turn").textContent = game.over ? `${game.players[game.winner].name} 승리` :
    `${pl.name}  ${R4.BALL_NAME[pl.ball]}  ${pl.finishing ? "마무리 쓰리쿠션" : "남은 " + pl.left}`;
}

// ---------- 메뉴 ----------
const sujiSel = [$("#suji1"), $("#suji2")];
for (const s of sujiSel) { for (const v of R4.SUJI) s.add(new Option(v, v)); s.value = 100; }
$("#suji1").value = store.get("suji1", 100); $("#suji2").value = store.get("suji2", 100);
$("#optTip").checked = cfg.showTip; $("#optTable").value = cfg.table; $("#optBall").value = String(cfg.ball);
$("#optGain").value = cfg.gain; $("#optAim").value = cfg.aim; $("#optLock").checked = cfg.lock; $("#optVol").value = cfg.vol; SND.setVolume(cfg.vol);
let menuMode = store.get("mode", "solo");
function syncMenu() {
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === menuMode));
  $("#p2row").hidden = menuMode !== "duo";
}
document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { menuMode = b.dataset.mode; syncMenu(); }));
syncMenu();

function readCfg() {
  const t = $("#optTable").value, bl = +$("#optBall").value;
  cfg.showTip = $("#optTip").checked; cfg.gain = +$("#optGain").value; cfg.aim = +$("#optAim").value; cfg.lock = $("#optLock").checked; cfg.vol = +$("#optVol").value; SND.setVolume(cfg.vol);
  const rebuild = t !== cfg.table || bl !== cfg.ball;
  cfg.table = t; cfg.ball = bl;
  for (const k of ["showTip", "gain", "aim", "lock", "vol", "table", "ball"]) store.set(k, cfg[k]);
  if (rebuild) { p = params(); world.scene.clear(); world = W.buildWorld(renderer, p); makeBalls(); holdCue(cueIdx); }
}

$("#start").addEventListener("click", () => {
  readCfg();
  store.set("mode", menuMode); store.set("suji1", +$("#suji1").value); store.set("suji2", +$("#suji2").value);
  const names = menuMode === "solo" ? ["연습"] : ["1번", "2번"];
  game = R4.newGame(menuMode, names.map((n, i) => ({ name: n, suji: +sujiSel[i].value })));
  sim = null; stand(true);
  if (menuMode === "duo") startBanking(); else { placeBalls(R4.opening(p, 0)); say("공 가까이 가서 Space로 엎드려요", 4); }
  drawBoard(); hud(); closeMenu();
});
$("#resume").addEventListener("click", () => { readCfg(); closeMenu(); });
function openMenu() { mode = mode === "menu" ? "menu" : mode; $("#menu").hidden = false; $("#resume").hidden = !game; if (document.pointerLockElement) document.exitPointerLock(); }
function closeMenu() { $("#menu").hidden = true; lock(); }
function lock() { if (TEST) return; const r = canvas.requestPointerLock?.({ unadjustedMovement: true }); if (r?.catch) r.catch(() => canvas.requestPointerLock()); }
canvas.addEventListener("click", () => { if ($("#menu").hidden && !document.pointerLockElement) lock(); });
document.addEventListener("pointerlockchange", () => { if (!document.pointerLockElement && !TEST && mode !== "chalk") openMenu(); });

// ---------- 뱅킹 (둘이 칠 때 선공 정하기) ----------
function startBanking() {
  banking = { who: 0, dist: [] };
  const q = p.L / 8;
  placeBalls([[-2 * q, 0.18], [-2 * q, -0.18], [99, 99], [99, 99]]);
  balls[1].s = balls[2].s = balls[3].s = -1; syncMeshes(balls);
  game.turn = 0;
  say("뱅킹: 1번이 흰 공을 앞 단쿠션에 맞혀 돌아오게 쳐요. 내 쪽 단쿠션에 더 가까이 서면 선공", 6);
}
function bankingDone() {
  const b = balls[banking.who];
  banking.dist[banking.who] = b.r[0] + p.xMax;
  if (banking.who === 0) {
    banking.who = 1; game.turn = 1;
    const q = p.L / 8;
    balls[0].s = -1; balls[1] = P.newBall(1, -2 * q, -0.18, p); syncMeshes(balls);
    say(`1번 ${(banking.dist[0] * 100).toFixed(0)}cm. 이제 2번이 노란 공으로`, 4);
    return;
  }
  const [d0, d1] = banking.dist;
  if (Math.abs(d0 - d1) < 0.005) { say("거리가 같아서 다시 해요", 3); startBanking(); return; }
  const win = d0 < d1 ? 0 : 1;
  // 이긴 사람이 선공, 선공은 흰 공
  game.players[win].ball = 0; game.players[1 - win].ball = 1;
  if (win === 1) game.players.reverse(), game.players.forEach((pl, i) => (pl.ball = i));
  game.turn = 0; banking = null;
  placeBalls(R4.opening(p, 0));
  say(`${game.players[0].name} 선공 (${(Math.min(d0, d1) * 100).toFixed(0)}cm 대 ${(Math.max(d0, d1) * 100).toFixed(0)}cm). 흰 공으로 쳐요`, 5);
  drawBoard(); hud();
}

// ---------- 서기, 걷기 ----------
const TABLE_HALF = () => [p.L / 2 + W.RAIL_W + 0.2, p.W / 2 + W.RAIL_W + 0.2];
function stand(reset) {
  mode = "walk"; cueMesh.visible = false; stroke.on = false;
  if (reset) Object.assign(me, { x: -p.L / 2 - 0.75, z: 0.55, yaw: -Math.PI / 2 + 0.5, pitch: -0.45 });
  else { // 엎드렸던 자리에서 일어남
    const back = 0.75, a = st.anchor || balls[myBall()].r;
    me.x = a[0] - Math.cos(st.phi) * back; me.z = -(a[1] - Math.sin(st.phi) * back);
    me.yaw = st.phi - Math.PI / 2; me.pitch = -0.6;
    pushOut();
  }
}
function pushOut() {
  for (const t of world.tables) {
    const [hx, hz] = TABLE_HALF(), dx = me.x - t.x, dz = me.z - t.z;
    if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
      if (hx - Math.abs(dx) < hz - Math.abs(dz)) me.x = t.x + Math.sign(dx || 1) * hx; else me.z = t.z + Math.sign(dz || 1) * hz;
    }
  }
  me.x = Math.max(-W.ROOM.x / 2 + 0.3, Math.min(W.ROOM.x / 2 - 0.3, me.x));
  me.z = Math.max(-W.ROOM.z / 2 + 0.3, Math.min(W.ROOM.z / 2 - 0.3, me.z));
}
function walk(dt) {
  const sp = (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 0.6 : 1.4) * dt;
  let f = 0, s = 0;
  if (keys.has("KeyW")) f++; if (keys.has("KeyS")) f--; if (keys.has("KeyD")) s++; if (keys.has("KeyA")) s--;
  if (f || s) {
    const l = Math.hypot(f, s);
    me.x += (-Math.sin(me.yaw) * f + Math.cos(me.yaw) * s) / l * sp;
    me.z += (-Math.cos(me.yaw) * f - Math.sin(me.yaw) * s) / l * sp;
    pushOut();
  }
  camera.position.set(me.x, me.eye, me.z);
  camera.rotation.set(me.pitch, me.yaw, 0);
}

// ---------- 엎드리기 ----------
function tryStance() {
  if (!game || game.over) return say(game?.over ? "Esc에서 새 게임을 골라요" : "");
  if (sim) return say("공이 다 멈추면 쳐요");
  const b = balls[myBall()];
  if (b.s === -1) return;
  const bx = b.r[0], bz = -b.r[1];
  const dx = bx - me.x, dz = bz - me.z, d = Math.hypot(dx, dz);
  if (d > 1.9) return say(`${R4.BALL_NAME[myBall()]} 가까이 가서 엎드려요`);
  st.phi = Math.atan2(-dz, dx); // 물리 좌표의 겨냥각
  st.anchor = b.r.slice();
  st.a = 0; st.b = 0; st.elevUser = 0; st.headYaw = st.headPitch = 0;
  mode = "aim"; cueMesh.visible = true;
  updateStance(true);
}

// 큐 길이 방향 단위벡터 (물리 좌표, 큐가 미는 쪽)
const dirOf = (phi, th) => [Math.cos(phi) * Math.cos(th), Math.sin(phi) * Math.cos(th), -Math.sin(th)];

// 큐가 레일과 다른 공을 넘으려면 필요한 최소 각
function minElev(phi, a, b) {
  const c = balls[myBall()].r, R = p.R;
  for (let th = 0; th < 1.35; th += 0.004) {
    const D = dirOf(phi, th), side = P.V.unit(P.V.cross(D, [0, 0, 1])), up = P.V.cross(side, D);
    const k = Math.sqrt(Math.max(1 - a * a - b * b, 0));
    const con = P.V.add(c, P.V.mul(P.V.add(P.V.add(P.V.mul(side, a), P.V.mul(up, b)), P.V.mul(D, -k)), R));
    let ok = true;
    for (let t = 0.012; t < 1.0 && ok; t += 0.012) {
      const q = P.V.sub(con, P.V.mul(D, t)), rc = cueSpec.tip / 2 + t * 0.0055;
      const u = Math.max(Math.abs(q[0]) - p.L / 2, Math.abs(q[1]) - p.W / 2);  // 쿠션 코끝 선 너머 거리
      if (u > 0 && u < W.RAIL_W + 0.03) {
        const top = u < 0.042 ? p.cushionH + (W.RAIL_TOP - p.cushionH) * u / 0.042 : W.RAIL_TOP;   // 쿠션 윗면은 코끝에서 틀까지 올라감
        if (q[2] - rc < top + 0.002) ok = false;
      }
      for (let i = 0; i < 4 && ok; i++) if (i !== myBall() && balls[i].s !== -1 && P.V.len(P.V.sub(q, balls[i].r)) < R + rc + 0.002) ok = false;
    }
    if (ok) return th;
  }
  return 1.35;
}

let stance = null;
function updateStance(force) {
  const c = balls[myBall()].r;
  st.a = Math.max(-0.95, Math.min(0.95, st.a)); st.b = Math.max(-0.95, Math.min(0.95, st.b));
  if (Math.hypot(st.a, st.b) > 0.95) { const k = 0.95 / Math.hypot(st.a, st.b); st.a *= k; st.b *= k; }
  const need = minElev(st.phi, st.a, st.b);
  const th = Math.max(need, st.elevUser);
  const D = dirOf(st.phi, th), side = P.V.unit(P.V.cross(D, [0, 0, 1])), up = P.V.cross(side, D);
  const k = Math.sqrt(Math.max(1 - st.a * st.a - st.b * st.b, 0));
  const contact = P.V.add(c, P.V.mul(P.V.add(P.V.add(P.V.mul(side, st.a), P.V.mul(up, st.b)), P.V.mul(D, -k)), p.R));
  const bridgeLen = th > 0.5 ? 0.12 : 0.17;
  const bridge = P.V.sub(contact, P.V.mul(D, bridgeLen));
  // 손이 닿는지: 뒷손(팁에서 1.15m)이 틀 안으로 얼마나 들어가나
  const grip = P.V.sub(contact, P.V.mul([Math.cos(st.phi), Math.sin(st.phi), 0], 1.15));
  const ox = p.L / 2 + W.RAIL_W, oy = p.W / 2 + W.RAIL_W;
  const inside = Math.min(ox - Math.abs(grip[0]), oy - Math.abs(grip[1]));
  st.lean = inside; st.rest = inside > 0.38;
  const onRail = Math.abs(bridge[0]) > p.L / 2 || Math.abs(bridge[1]) > p.W / 2;
  stance = { th, need, D, side, up, contact, bridge, bridgeLen, onRail };
}

function stanceCamera() {
  const c = balls[myBall()].r, d = [Math.cos(st.phi), Math.sin(st.phi)];
  const back = 0.44 + st.eyeH * 0.4;
  // 끝까지 숙이면 턱이 큐에 닿아 눈이 큐 3cm 위. 큐를 들면 턱도 큐를 따라 올라감
  const cueZ = stance.contact[2] + Math.tan(stance.th) * (back - p.R);
  const eyeH = Math.max(st.eyeH, cueZ + 0.03);
  const ex = c[0] - d[0] * back, ey = c[1] - d[1] * back;
  camera.position.copy(W.toThree([ex, ey, eyeH]));
  const look = 1.0;
  const pitch = -Math.atan2(eyeH - p.R, back + look);
  camera.rotation.set(pitch + st.headPitch, -Math.PI / 2 + st.phi + st.headYaw, 0);
  // three의 yaw: 물리 각 phi는 +x에서 시계 반대(위에서 볼 때). 카메라는 -z를 보므로 -pi/2 보정
  camera.rotation.y = st.phi - Math.PI / 2 + st.headYaw;
}

// 브리지 손: 큐가 지나는 자리(브리지 점)에 홈이 오게. 천이나 레일 위에 손바닥
function placeHand() {
  if (!stance) return;
  const b = stance.bridge, cueR = cueSpec.tip / 2 + stance.bridgeLen * 0.0055;
  const groove = [b[0], b[1], b[2] - cueR];
  hand.visible = !st.rest;
  hand.position.copy(W.toThree(groove));
  hand.rotation.set(0, st.phi, 0);
  // 손바닥은 천(또는 레일 윗면) 높이에 닿게, 큐가 높으면 손을 세운 것처럼 같이 올림
  const floorZ = stance.onRail ? W.RAIL_TOP : 0;
  hand.scale.set(1, Math.max(0.7, Math.min(2.4, (groove[2] - floorZ) / 0.03)), 1);
  hand.position.y = W.CLOTH_Y + floorZ + 0.03 * hand.scale.y;
}
function placeCue(tipPos, D) {
  const back = W.toThree(P.V.sub(tipPos, D)).sub(W.toThree(tipPos)).normalize();
  cueMesh.position.copy(W.toThree(tipPos));
  cueMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), back);
}

function rotZ(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }

// 스트로크 중 큐: 브리지를 받침점으로 뒷손이 옆으로 움직인 만큼 돎
function cueNow() {
  const D2 = rotZ(stance.D, stroke.dl);
  const tip = P.V.add(stance.bridge, P.V.mul(D2, stance.bridgeLen - 0.004 - stroke.s));
  return { D2, tip };
}

// 팁 선과 수구가 처음 만나는 점
function rayHit(o, D, c, R) {
  const oc = P.V.sub(o, c), bq = P.V.dot(oc, D), cq = P.V.dot(oc, oc) - R * R, disc = bq * bq - cq;
  if (disc < 0) return null;
  return -bq - Math.sqrt(disc);
}

function strokeUpdate() {
  const { D2, tip } = cueNow();
  placeCue(tip, D2);
  if (stroke.hit || !stroke.on) return;
  const c = balls[myBall()].r;
  const t = rayHit(stance.bridge, D2, c, p.R);
  const along = stance.bridgeLen - 0.004 - stroke.s;
  if (t == null) { if (along > stance.bridgeLen + p.R * 2) { stroke.on = false; say("큐가 공을 비껴갔어요"); } return; }
  if (along >= t) { stroke.s += along - t; shoot(D2, t); }
}

function strokeSpeed() {
  // 최근 30ms 넘게 떨어진 기록과 비교. 화면이 느려 기록 간격이 벌어져도 바로 앞 기록은 씀
  const h = stroke.hist, now = h[h.length - 1];
  if (h.length < 2) return 0;
  let k = h.length - 2;
  while (k > 0 && now.t - h[k].t < 30) k--;
  const old = h[k];
  if (now.t - old.t < 0.5) return 0;
  return -(now.s - old.s) / ((now.t - old.t) / 1000);
}

function shoot(D2, t) {
  stroke.hit = true; stroke.hitT = performance.now();
  const c = balls[myBall()].r;
  const pt = P.V.add(stance.bridge, P.V.mul(D2, t));
  const n = P.V.mul(P.V.sub(pt, c), 1 / p.R);              // 공 중심에서 닿은 점
  const side = P.V.unit(P.V.cross(D2, [0, 0, 1])), up = P.V.cross(side, D2);
  const a = P.V.dot(n, side), b = P.V.dot(n, up);
  const speed = Math.max(0, Math.min(8, strokeSpeed()));
  if (speed < 0.05) { stroke.hit = false; return; }
  const yaw = Math.atan2(D2[1], D2[0]), th = Math.asin(-D2[2]);
  const tipMu = tipMuAt(a, b);
  const ball = balls[myBall()];
  const r = P.strike(ball, { speed, yaw, elev: th, a, b, M: cueSpec.M, endRatio: cueSpec.endRatio, eta: 0.87, tipMu }, p);
  wearTip(speed, a, b);
  // 공 표면에 초크 자국 (공이 돌아가 있는 만큼 거꾸로 돌려 공 기준 좌표로)
  const local = W.toThree(n).sub(new THREE.Vector3(0, W.CLOTH_Y, 0)).normalize().applyQuaternion(ballMesh[myBall()].quaternion.clone().invert());
  W.chalkMark(ballMesh[myBall()], local);
  sim = P.simulate(balls.map((o) => ({ ...o, r: o.r.slice(), v: o.v.slice(), w: o.w.slice() })), p, 200);
  simT = 0;
  shotInfo = { cue: myBall(), speed, a, b, th, miscue: r.miscue, foul: null };
  if (r.miscue) say("삑! 미스큐", 2);
  const tv = 0.25 + Math.min(1, speed / 4) ** 0.7;
  if (r.miscue) SND.play("miscue", tv, 0, 0.95 + Math.random() * 0.1);
  else SND.play(speed > 2.5 ? "tip_hard" : "tip_soft", tv, 0, 0.95 + Math.random() * 0.1);
  evIdx = 0;
  lastShot = { speed, a, b, th: th * 180 / Math.PI, tipMu, miscue: r.miscue, vb: r.vb, hist: TEST ? stroke.hist.slice(-6).map((h) => [+h.t.toFixed(1), +h.s.toFixed(4)]) : undefined };
}
let lastShot = null, evIdx = 0;
// 공 자리에서 나는 소리: 눈 기준 좌우로 나누고 멀수록 작게
const earV = new THREE.Vector3();
function playAt(name, vol, r, rate) {
  earV.copy(W.toThree(r)).applyMatrix4(camera.matrixWorldInverse);
  const d = earV.length();
  SND.play(name, vol / (1 + d * 0.5), earV.x / (Math.abs(earV.z) + 0.4), rate * (0.96 + Math.random() * 0.08));
}

// 친 뒤에도 큐가 계속 나가다 수구에 다시 닿으면 투터치
function followCheck() {
  if (!stroke.hit || !sim || shotInfo.foul) return;
  const dt = (performance.now() - stroke.hitT) / 1000;
  if (dt > 0.4) return;
  const bs = P.stateAt(sim, Math.min(dt, sim.tEnd), p)[shotInfo.cue];
  const { D2, tip } = cueNow();
  if (P.V.len(P.V.sub(tip, bs.r)) < p.R * 0.98 && dt > 0.004) { shotInfo.foul = "투터치(큐가 두 번 닿았어요)"; }
}

// ---------- 공 굴리기 ----------
const tmpQ = new THREE.Quaternion(), axis = new THREE.Vector3();
function rollBalls(dt) {
  simT += dt;
  const bs = P.stateAt(sim, Math.min(simT, sim.tEnd), p);
  bs.forEach((b, i) => {
    if (b.s === -1) { ballMesh[i].visible = false; return; }
    ballMesh[i].visible = true;
    ballMesh[i].position.copy(W.toThree(b.r));
    const w = b.w, wl = Math.hypot(w[0], w[1], w[2]);
    if (wl > 1e-6) { axis.set(w[0], w[2], -w[1]).normalize(); tmpQ.setFromAxisAngle(axis, wl * dt); ballMesh[i].quaternion.premultiply(tmpQ); }
  });
  // 이번 틀 동안 일어난 부딪침 소리
  const evs = sim.events;
  for (; evIdx < evs.length && evs[evIdx].t <= simT; evIdx++) {
    const e = evs[evIdx], r = bs[e.i].r;
    if (e.type === "bb") playAt(e.vn > 1.2 ? "click_hard" : "click_soft", 0.08 + Math.min(1, e.vn / 3) ** 0.8, r, 1);
    else if (e.type === "bc") playAt("cushion", 0.05 + Math.min(1, e.vn / 2.5) ** 0.8, r, 1);
    else if (e.type === "land") playAt("cushion", 0.35, r, 0.7);
  }
  let rs = 0; for (const b of bs) if (b.s === P.SLIDE || b.s === P.ROLL) rs += Math.hypot(b.v[0], b.v[1]);
  SND.rolling(Math.min(1, rs / 2) * 0.45, 0.8 + 0.35 * Math.min(1, rs / 2));
  if (simT > sim.tEnd + 0.4) { SND.rolling(0, 0.8); shotOver(bs); }
}

function shotOver(bs) {
  const evs = sim.events;
  balls = bs.map((b) => ({ ...b, v: [0, 0, 0], w: [0, 0, 0], s: b.s === -1 ? -1 : P.STOP }));
  sim = null; stroke.on = false; stroke.hit = false;
  if (banking) { bankingDone(); if (mode !== "walk") stand(false); return; }
  const res = R4.judge(shotInfo.cue, evs, shotInfo.foul);
  const out = R4.apply(game, res);
  // 대 밖으로 나간 공은 초구 자리로
  const open = R4.opening(p, 0);
  balls.forEach((b, i) => {
    if (b.s !== -1) return;
    let [x, y] = open[i];
    for (let k = 0; k < 40; k++) {
      if (balls.every((o, j) => j === i || o.s === -1 || Math.hypot(o.r[0] - x, o.r[1] - y) > 2 * p.R + 0.002)) break;
      x += (k % 2 ? -1 : 1) * (k + 1) * 2.2 * p.R;
    }
    balls[i] = P.newBall(i, x, y, p);
  });
  syncMeshes(balls);
  shotLog.push({ ...lastShot, ...res, msg: out.msg, events: evs.length });
  say(out.msg, 3.5);
  drawBoard(); hud();
  // 친 사람은 엎드렸던 자리에서 일어나 다음 공으로 걸어감
  if (mode !== "walk") stand(false);
  if (!out.keep && game.mode === "duo" && !game.over) say(`${out.msg}  이제 ${game.players[game.turn].name} 차례`, 4);
}
const shotLog = [];

// ---------- 초크 ----------
const ck = $("#chalk"), ckg = ck.getContext("2d");
const chalkSt = { down: false, x: 0, y: 0, ang: 0, lastAng: null, turn: 0 };
function openChalk() {
  if (sim) return say("공이 멈춘 뒤에 칠해요");
  mode = "chalk"; $("#chalkWrap").hidden = false; cueMesh.visible = false;
  chalkSt.x = 0.2; chalkSt.y = -1.15; chalkSt.turn = 0; chalkSt.lastAng = null;
  drawChalk();
}
function closeChalk() { $("#chalkWrap").hidden = true; mode = "walk"; stand(false); say(`초크 ${Math.round(tipCoverage() * 100)}% 묻음`); }
function tipCoverage() { let s = 0; for (const [k] of tipCells) s += tipCov[k]; return s / tipCells.length; }
function chalkMove(dx, dy) {
  chalkSt.x = Math.max(-2.2, Math.min(2.2, chalkSt.x + dx / 90)); chalkSt.y = Math.max(-2.2, Math.min(2.2, chalkSt.y + dy / 90));
  if (chalkSt.down) {
    const ang = Math.atan2(chalkSt.y, chalkSt.x);
    if (chalkSt.lastAng != null) { let d = ang - chalkSt.lastAng; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; chalkSt.turn = chalkSt.turn * 0.97 + d; }
    chalkSt.lastAng = ang;
    const caking = Math.min(Math.abs(chalkSt.turn) / 6, 0.7);  // 돌려 비비면 떡져서 덜 묻음
    const amt = Math.hypot(dx, dy) / 90 * 0.9 * (1 - caking);
    for (const [k, x, y] of tipCells) {
      const d = Math.hypot(x - chalkSt.x, y - chalkSt.y);
      if (d < 0.75) tipCov[k] = Math.min(1, tipCov[k] + amt * (1 - d / 0.75));
    }
    if (Math.hypot(chalkSt.x, chalkSt.y) < 1.4 && amt > 0.003) SND.chalk(Math.min(1, amt * 25));
  } else chalkSt.lastAng = null;
  drawChalk();
}
function drawChalk() {
  const w = ck.width, h = ck.height, cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
  ckg.clearRect(0, 0, w, h);
  // 페룰
  ckg.fillStyle = "#e9e5da"; ckg.beginPath(); ckg.arc(cx, cy, r * 1.04, 0, 7); ckg.fill();
  // 팁 가죽 + 초크
  for (const [k, x, y] of tipCells) {
    const c = tipCov[k];
    ckg.fillStyle = `rgb(${Math.round(120 - 80 * c)},${Math.round(84 + 10 * c)},${Math.round(60 + 110 * c)})`;
    ckg.fillRect(cx + x * r - r / 16, cy + y * r - r / 16, r / 8 + 1, r / 8 + 1);
  }
  ckg.strokeStyle = "rgba(0,0,0,.35)"; ckg.lineWidth = 2; ckg.beginPath(); ckg.arc(cx, cy, r, 0, 7); ckg.stroke();
  // 초크 덩어리 (손에 쥔 쪽에서 본 모양)
  const qx = cx + chalkSt.x * r, qy = cy + chalkSt.y * r, s = r * 0.85;
  ckg.save(); ckg.translate(qx, qy); ckg.rotate(0.15);
  ckg.fillStyle = chalkSt.down ? "rgba(46,96,170,.92)" : "rgba(46,96,170,.6)"; ckg.fillRect(-s / 2, -s / 2, s, s);
  ckg.fillStyle = "rgba(255,255,255,.18)"; ckg.fillRect(-s / 2, -s / 2, s, s * 0.18);
  ckg.restore();
}
ck.width = 520; ck.height = 520;

// ---------- 입력 ----------
function onMove(dx, dy) {
  if (mode === "walk") { me.yaw -= dx * 0.0014 * cfg.aim; me.pitch = Math.max(-1.45, Math.min(1.2, me.pitch - dy * 0.0014 * cfg.aim)); return; }
  if (mode === "chalk") return chalkMove(dx, dy);
  if (mode === "aim" || mode === "roll") {
    if (stroke.on && !stroke.hit && mode === "aim") {
      const g = 0.00008 * cfg.gain;
      stroke.s = Math.min(0.32, stroke.s + dy * g);
      if (!cfg.lock) stroke.dl += dx * g / 0.95 * (st.rest ? 1.8 : 1);
      stroke.hist.push({ t: performance.now(), s: stroke.s }); if (stroke.hist.length > 40) stroke.hist.shift();
      strokeUpdate();
      return;
    }
    if (stroke.on && stroke.hit) { stroke.s = Math.max(-0.22, Math.min(0.32, stroke.s + dy * 0.00008 * cfg.gain)); return; }
    if (rmb || mode === "roll") { st.headYaw -= dx * 0.0013 * cfg.aim; st.headPitch = Math.max(-0.9, Math.min(0.9, st.headPitch - dy * 0.0013 * cfg.aim)); return; }
    const fine = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 0.1 : 1;
    st.phi -= dx * 0.0005 * fine * cfg.aim;
    st.eyeH = Math.max(0.04, Math.min(0.75, st.eyeH - dy * 0.0006 * cfg.aim));
    updateStance();
  }
}
let rmb = false;
addEventListener("mousemove", (e) => { if (document.pointerLockElement === canvas || TEST) onMove(e.movementX, e.movementY); });
addEventListener("mousedown", (e) => {
  SND.unlock();
  if (!$("#menu").hidden) return;
  if (e.button === 2) { rmb = true; return; }
  if (e.button !== 0) return;
  if (mode === "chalk") { chalkSt.down = true; return; }
  if (mode === "aim" && !sim) {
    if (st.rest && !stroke.on) say("손이 안 닿아 레스트를 대고 쳐요", 1.5);
    Object.assign(stroke, { on: true, s: 0, dl: 0, hist: [{ t: performance.now(), s: 0 }], hit: false });
    strokeUpdate();
  }
});
addEventListener("mouseup", (e) => {
  if (e.button === 2) { rmb = false; if (mode === "aim") st.headYaw = st.headPitch = 0; return; }
  if (e.button !== 0) return;
  if (mode === "chalk") { chalkSt.down = false; return; }
  if (stroke.on) { stroke.on = false; if (stroke.hit) mode = sim ? "roll" : mode; else { stroke.s = 0; stroke.dl = 0; } }
});
addEventListener("contextmenu", (e) => e.preventDefault());
addEventListener("keydown", (e) => {
  SND.unlock();
  if (!$("#menu").hidden) { if (e.code === "Escape" && game) closeMenu(); return; }
  if (e.code === "Tab") { e.preventDefault(); $("#score").hidden = false; renderScore(); return; }
  keys.add(e.code);
  if (e.code === "Escape") { if (mode === "chalk") closeChalk(); else openMenu(); return; }
  if (e.code === "KeyH") { $("#help").hidden = !$("#help").hidden; return; }
  if (e.code === "KeyX") { cfg.lock = !cfg.lock; store.set("lock", cfg.lock); $("#optLock").checked = cfg.lock; say(cfg.lock ? "스트로크 고정: 큐가 옆으로 안 흔들려요" : "스트로크 고정 풀림: 손이 흔들리면 큐도 흔들려요", 2); return; }
  if (e.code === "KeyC") { if (mode === "chalk") closeChalk(); else openChalk(); return; }
  if (e.code === "Space") {
    e.preventDefault();
    if (mode === "walk") tryStance(); else if (mode === "aim" || mode === "roll") { if (!stroke.on) stand(false); }
    return;
  }
  if (mode === "walk" && e.code === "KeyE") pickCue();
  if (mode === "aim" && !stroke.on) {
    const step = 0.00035 * (e.shiftKey ? 0.25 : 1);
    if (e.code === "KeyQ") { st.phi += step; updateStance(); }
    if (e.code === "KeyE") { st.phi -= step; updateStance(); }
  }
});
addEventListener("keyup", (e) => { keys.delete(e.code); if (e.code === "Tab") $("#score").hidden = true; });

function aimKeys(dt) {
  if (mode !== "aim" || stroke.on) return;
  const v = 0.55 * dt;
  let ch = false;
  if (keys.has("KeyW")) { st.b += v; ch = true; } if (keys.has("KeyS")) { st.b -= v; ch = true; }
  if (keys.has("KeyD")) { st.a += v; ch = true; } if (keys.has("KeyA")) { st.a -= v; ch = true; }
  if (keys.has("KeyR")) { st.elevUser = Math.min(1.35, Math.max(st.elevUser, stance.th) + 0.45 * dt); ch = true; }
  if (keys.has("KeyF")) { st.elevUser = Math.max(0, Math.min(st.elevUser, stance.th) - 0.45 * dt); ch = true; }
  if (ch) updateStance();
}

const ray = new THREE.Raycaster();
function pickCue() {
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(world.cueMeshes, true);
  if (!hits.length || hits[0].distance > 2.2) return say("큐걸이 앞에서 큐를 보고 E");
  let o = hits[0].object; while (o && o.userData.cueIndex == null) o = o.parent;
  if (!o) return;
  holdCue(o.userData.cueIndex); store.set("cue", cueIdx);
  say(`${cueSpec.name}를 들었어요 (${Math.round(cueSpec.M * 1000)}g, 팁 ${cueSpec.tip * 1000}mm ${cueSpec.hard})`, 3);
}

function renderScore() {
  if (!game) return;
  $("#scoreBody").innerHTML = game.players.map((pl) => `<tr><td>${pl.name}</td><td>${R4.BALL_NAME[pl.ball]}</td><td>${pl.suji}</td><td>${pl.finishing ? "마무리" : pl.left}</td><td>${pl.points}</td><td>${pl.innings}</td><td>${pl.high}</td><td>${pl.fouls}</td></tr>`).join("");
  $("#scoreLog").textContent = game.log.slice(-6).map((l) => `${l.who}: ${l.msg}`).join("\n");
}

// 당점 그림
const tipC = $("#tip"), tg = tipC.getContext("2d");
function drawTip() {
  const show = cfg.showTip && (mode === "aim");
  tipC.hidden = !show; if (!show) return;
  const s = tipC.width, c = s / 2, r = s * 0.42;
  tg.clearRect(0, 0, s, s);
  tg.fillStyle = COLORS[myBall()]; tg.beginPath(); tg.arc(c, c, r, 0, 7); tg.fill();
  tg.strokeStyle = "rgba(0,0,0,.2)"; tg.beginPath(); tg.moveTo(c - r, c); tg.lineTo(c + r, c); tg.moveTo(c, c - r); tg.lineTo(c, c + r); tg.stroke();
  const tr = cueSpec.tip / 2 / p.R * r;
  tg.fillStyle = "rgba(43,95,168,.9)"; tg.beginPath(); tg.arc(c + st.a * r, c - st.b * r, tr, 0, 7); tg.fill();
  tg.fillStyle = "#ddd"; tg.font = "12px Pretendard Variable, sans-serif"; tg.textAlign = "center";
  tg.fillText(`큐 ${(stance.th * 180 / Math.PI).toFixed(0)}°${st.rest ? "  레스트" : ""}`, c, s - 4);
}

// ---------- 루프 ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (msgTimer > 0 && (msgTimer -= dt) <= 0) $("#msg").hidden = true;
  if (mode === "walk") walk(dt);
  aimKeys(dt);
  if ((mode === "aim" || mode === "roll") && stance) {
    if (!stroke.on && !stroke.hit) placeCue(P.V.sub(stance.contact, P.V.mul(stance.D, 0.004 + 0.0)), stance.D);
    else if (stroke.hit) { const { D2, tip } = cueNow(); placeCue(tip, D2); }
    stanceCamera(); placeHand();
  } else hand.visible = false;
  if (sim) { followCheck(); rollBalls(dt); }
  drawTip();
  renderer.render(world.scene, camera);
  requestAnimationFrame(frame);
}
drawBoard();
camera.position.set(-2.2, 1.62, 1.6); camera.lookAt(0, 0.75, 0);
me.yaw = camera.rotation.y; me.pitch = camera.rotation.x;
placeBalls(R4.opening(p, 0));
requestAnimationFrame(frame);

// 시험용 손잡이 (?test 일 때 봇이 같은 입력 길로 침)
window.__bill = { place: (pos) => placeBalls(pos), get p() { return p; }, get balls() { return balls; }, get mode() { return mode; }, get sim() { return sim; }, get game() { return game; }, st, stroke, me, onMove, tryStance, stand, keys, shotLog, get stance() { return stance; }, updateStance, camera, renderer, P, tipCov, get cueSpec() { return cueSpec; }, holdCue, openChalk, closeChalk, chalkSt, tipCoverage, renderScore, get lastShot() { return lastShot; } };
