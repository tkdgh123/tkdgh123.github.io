// 당구 물리 (사건 기반). 단위 m, s, kg, rad. x = 테이블 길이 방향, y = 폭 방향, z = 위.
// 식의 출처는 ~/billiards-notes/03-당구물리.md: 천 위 운동과 사건 루프는 pooltool(Kiefl),
// 쿠션은 Han 2005, 공끼리 마찰은 Dr. Dave TP A.14, 큐 타격과 스쿼트는 TP A.30, A.31.

export const STOP = 0, SPIN = 1, SLIDE = 2, ROLL = 3, AIR = 4;

export function makeParams(o = {}) {
  const p = {
    g: 9.81,
    R: 0.03275, m: 0.255,          // 4구 공 65.5mm, 255g
    L: 2.448, W: 1.224,            // 경기면(쿠션 코끝 사이)
    cushionH: 0.040,               // 쿠션 코끝 높이
    muS: 0.2, muR: 0.005, spinDecel: 10,
    eBB: 0.95, eT: 0.6,            // 공끼리, 공과 슬레이트
    cushionMu: 0.2, cushionE: null, // null이면 Han의 속도별 반발
    bbFriction: true,
    ...o,
  };
  p.I = 0.4 * p.m * p.R * p.R;
  p.sinT = (p.cushionH - p.R) / p.R;
  p.cosT = Math.sqrt(1 - p.sinT * p.sinT);
  p.xMax = p.L / 2 - p.R * p.cosT;  // 공 중심이 쿠션에 닿는 자리
  p.yMax = p.W / 2 - p.R * p.cosT;
  return p;
}

// ---------- 작은 벡터 도구 ----------
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const l = len(a); return l > 0 ? mul(a, 1 / l) : [0, 0, 0]; };
export const V = { add, sub, mul, dot, cross, len, unit };

const EPS_V = 1e-6, EPS_W = 1e-4;

// 천과 닿는 점의 미끄러짐 속도 u = v + R (k x w), 수평 성분만
const slip = (b, R) => [b.v[0] - R * b.w[1], b.v[1] + R * b.w[0], 0];

export function classify(b, p) {
  if (b.s === AIR || b.s === -1) return b.s;
  const u = slip(b, p.R);
  if (Math.hypot(u[0], u[1]) > EPS_V) return SLIDE;
  if (Math.hypot(b.v[0], b.v[1]) > EPS_V) return ROLL;
  if (Math.abs(b.w[2]) > EPS_W) return SPIN;
  return STOP;
}

export function newBall(id, x, y, p) {
  return { id, r: [x, y, p.R], v: [0, 0, 0], w: [0, 0, 0], s: STOP };
}
const clone = (b) => ({ id: b.id, r: b.r.slice(), v: b.v.slice(), w: b.w.slice(), s: b.s });

const decayWz = (wz, a, t) => Math.sign(wz) * Math.max(Math.abs(wz) - a * t, 0);

// 상태가 그대로인 동안 t초 뒤의 공 (해석 해)
export function evolve(b, t, p) {
  const o = clone(b);
  if (t <= 0 || b.s === STOP || b.s === -1) return o;
  const { g, R } = p;
  if (b.s === SPIN) { o.w[2] = decayWz(b.w[2], p.spinDecel, t); return o; }
  if (b.s === AIR) {
    o.r = [b.r[0] + b.v[0] * t, b.r[1] + b.v[1] * t, b.r[2] + b.v[2] * t - 0.5 * g * t * t];
    o.v = [b.v[0], b.v[1], b.v[2] - g * t];
    return o;
  }
  if (b.s === SLIDE) {
    const uh = unit(slip(b, R)), a = p.muS * g;
    o.r = [b.r[0] + b.v[0] * t - 0.5 * a * t * t * uh[0], b.r[1] + b.v[1] * t - 0.5 * a * t * t * uh[1], b.r[2]];
    o.v = [b.v[0] - a * t * uh[0], b.v[1] - a * t * uh[1], 0];
    const k = 5 * a / (2 * R) * t;           // w_xy += k (z x uh)
    o.w = [b.w[0] - k * uh[1], b.w[1] + k * uh[0], decayWz(b.w[2], p.spinDecel, t)];
    return o;
  }
  // ROLL
  const vh = unit([b.v[0], b.v[1], 0]), a = p.muR * g;
  o.r = [b.r[0] + b.v[0] * t - 0.5 * a * t * t * vh[0], b.r[1] + b.v[1] * t - 0.5 * a * t * t * vh[1], b.r[2]];
  o.v = [b.v[0] - a * t * vh[0], b.v[1] - a * t * vh[1], 0];
  o.w = [-o.v[1] / R, o.v[0] / R, decayWz(b.w[2], p.spinDecel, t)];
  return o;
}

// 다음 상태 전이까지 남은 시간
function transitionTime(b, p) {
  const { g, R } = p;
  switch (b.s) {
    case SLIDE: { const u = slip(b, R); return 2 * Math.hypot(u[0], u[1]) / (7 * p.muS * g); }
    case ROLL: return Math.hypot(b.v[0], b.v[1]) / (p.muR * g);
    case SPIN: return Math.abs(b.w[2]) / p.spinDecel;
    case AIR: { // z = R 에 닿는 시각
      const z = b.r[2] - R, vz = b.v[2];
      return (vz + Math.sqrt(vz * vz + 2 * g * Math.max(z, 0))) / g;
    }
    default: return Infinity;
  }
}

function applyTransition(b, p) {
  const { R } = p;
  if (b.s === SLIDE) { b.w[0] = -b.v[1] / R; b.w[1] = b.v[0] / R; b.s = classify(b, p); return; }
  if (b.s === ROLL) { b.v = [0, 0, 0]; b.w[0] = 0; b.w[1] = 0; b.s = Math.abs(b.w[2]) > EPS_W ? SPIN : STOP; return; }
  if (b.s === SPIN) { b.w[2] = 0; b.s = STOP; return; }
  if (b.s === AIR) land(b, p);
}

// 공중에 뜬 공이 슬레이트에 떨어짐: 반발 eT, 마찰 충격량은 muS * 수직 충격량까지
function land(b, p) {
  const { R, m } = p;
  b.r[2] = R;
  if (Math.abs(b.r[0]) > p.L / 2 + 0.02 || Math.abs(b.r[1]) > p.W / 2 + 0.02) { b.s = -1; b.v = [0, 0, 0]; b.w = [0, 0, 0]; return; }
  const vn = -b.v[2];
  const Jn = m * (1 + p.eT) * vn;
  b.v[2] = 0;
  frictionKick(b, p, p.muS * Jn);
  const up = p.eT * vn;
  if (up > 0.15) { b.v[2] = up; b.s = AIR; } else { b.s = STOP; b.s = classify(b, p); }
}

// 천과 닿는 점의 미끄러짐을 줄이는 마찰 충격량(한도 Jmax). 다 없앨 수 있으면 바로 구름
function frictionKick(b, p, Jmax) {
  const { R, m } = p;
  const u = slip(b, R), us = Math.hypot(u[0], u[1]);
  if (us < EPS_V) return;
  const need = m * us / 3.5;                 // 미끄러짐을 0으로 만드는 충격량
  const J = Math.min(need, Jmax);
  const d = [-u[0] / us, -u[1] / us];
  b.v[0] += J * d[0] / m; b.v[1] += J * d[1] / m;
  const k = J * R / p.I;                     // 바닥점 (0,0,-R) x (J d)
  b.w[0] += k * d[1]; b.w[1] -= k * d[0];
}

// ---------- 충돌 시각 ----------
const polyAt = (c, t) => { let s = 0; for (const x of c) s = s * t + x; return s; };
const deriv = (c) => { const n = c.length - 1; return c.slice(0, -1).map((x, i) => x * (n - i)); };

// [lo, hi] 안에서 처음으로 f가 양에서 0 이하로 내려가는 시각
function firstDown(c, lo, hi) {
  const pts = [lo, ...realRoots(deriv(c), lo, hi), hi];
  for (let i = 0; i < pts.length - 1; i++) {
    let a = pts[i], b = pts[i + 1];
    const fa = polyAt(c, a), fb = polyAt(c, b);
    if (fa > 0 && fb <= 0) {
      for (let k = 0; k < 80; k++) { const mid = 0.5 * (a + b); if (polyAt(c, mid) > 0) a = mid; else b = mid; }
      return b;
    }
  }
  return Infinity;
}
function realRoots(c, lo, hi) {
  while (c.length && Math.abs(c[0]) < 1e-300) c = c.slice(1);
  if (c.length <= 1) return [];
  if (c.length === 2) { const t = -c[1] / c[0]; return t > lo && t < hi ? [t] : []; }
  const pts = [lo, ...realRoots(deriv(c), lo, hi), hi], out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    let a = pts[i], b = pts[i + 1], fa = polyAt(c, a), fb = polyAt(c, b);
    if (fa === 0 && a > lo) { out.push(a); continue; }
    if (fa * fb < 0) {
      for (let k = 0; k < 80; k++) { const mid = 0.5 * (a + b), fm = polyAt(c, mid); if (fa * fm <= 0) b = mid; else { a = mid; fa = fm; } }
      out.push(0.5 * (a + b));
    }
  }
  return out;
}

// 위치를 t의 2차식 P0 + P1 t + P2 t^2 로
function posPoly(b, p) {
  const P0 = b.r, P1 = b.v.slice();
  let P2 = [0, 0, 0];
  if (b.s === SLIDE) P2 = mul(unit(slip(b, p.R)), -0.5 * p.muS * p.g);
  else if (b.s === ROLL) P2 = mul(unit([b.v[0], b.v[1], 0]), -0.5 * p.muR * p.g);
  else if (b.s === AIR) P2 = [0, 0, -0.5 * p.g];
  else P1.fill(0);
  return [P0, P1, P2];
}

function ballBallTime(a, b, T, p) {
  if (a.s === -1 || b.s === -1) return Infinity;
  if ((a.s === STOP || a.s === SPIN) && (b.s === STOP || b.s === SPIN)) return Infinity;
  const [a0, a1, a2] = posPoly(a, p), [b0, b1, b2] = posPoly(b, p);
  const A = sub(a2, b2), B = sub(a1, b1), C = sub(a0, b0), D2 = 4 * p.R * p.R;
  const c = [dot(A, A), 2 * dot(A, B), dot(B, B) + 2 * dot(A, C), 2 * dot(B, C), dot(C, C) - D2];
  if (c[4] <= 1e-12 && dot(B, C) < 0) return 0;      // 붙어 있고 서로 다가옴
  return firstDown(c, 0, T);
}

// 쿠션: 벽 4개. n = 바깥쪽 법선, lim = 중심이 갈 수 있는 끝
const WALLS = [
  { n: [1, 0, 0], k: 0, sgn: 1 }, { n: [-1, 0, 0], k: 0, sgn: -1 },
  { n: [0, 1, 0], k: 1, sgn: 1 }, { n: [0, -1, 0], k: 1, sgn: -1 },
];
function cushionTime(b, wi, T, p) {
  if (b.s === -1 || b.s === STOP || b.s === SPIN) return Infinity;
  const w = WALLS[wi], lim = w.k === 0 ? p.xMax : p.yMax;
  if (b.s === AIR && b.r[2] > p.cushionH + p.R * 0.6) return Infinity; // 쿠션 위로 넘어감
  const [P0, P1, P2] = posPoly(b, p), s = w.sgn;
  // s * x(t) = lim 이 되는 첫 시각, 그때 바깥쪽으로 움직이는 중
  const c = [s * P2[w.k], s * P1[w.k], s * P0[w.k] - lim];
  if (c[2] >= -1e-12 && s * P1[w.k] > 0) return 0;
  const neg = [-c[0], -c[1], -c[2]];                    // -(s x - lim) 가 양에서 0으로
  return firstDown(neg, 0, T);
}

// ---------- 충돌 처리 ----------
export function hanE(vn) { const v = Math.min(Math.max(vn, 0), 3); return 0.39 + 0.257 * v - 0.044 * v * v; }

// Han 2005 쿠션 모델. 쿠션 좌표: x = 쿠션 쪽, z = 위, y = z x x
export function resolveCushion(b, wi, p) {
  const w = WALLS[wi], n = w.n, yv = cross([0, 0, 1], n);
  const toL = (a) => [dot(a, n), dot(a, yv), a[2]];
  const toG = (a) => add(add(mul(n, a[0]), mul(yv, a[1])), [0, 0, a[2]]);
  const { m, R, I } = p, S = p.sinT, Cc = p.cosT;
  const v = toL(b.v), om = toL(b.w);
  const vx = v[0];
  if (vx <= 0) return 0;
  const e = p.cushionE ?? hanE(vx), mu = p.cushionMu;
  const sx = vx * S + R * om[1];
  const sy = -v[1] - R * om[2] * Cc + R * om[0] * S;
  const Aa = 7 / (2 * m);
  const PzE = (1 + e) * m * vx * Cc;
  const PzS = Math.hypot(sx, sy) / Aa;
  let PxE, PyE;
  if (PzS <= mu * PzE) { PxE = sx / Aa; PyE = sy / Aa; }
  else { const h = Math.hypot(sx, sy); PxE = mu * PzE * sx / h; PyE = mu * PzE * sy / h; }
  const PX = -PxE * S - PzE * Cc, PY = PyE, PZ = PxE * Cc - PzE * S;
  v[0] += PX / m; v[1] += PY / m;
  om[0] += -(R / I) * PY * S;
  om[1] += (R / I) * (PX * S - PZ * Cc);
  om[2] += (R / I) * PY * Cc;
  // 옆 회전 미끄럼이 공을 쿠션 쪽으로 계속 밀면 아주 작은 튕김이 끝없이 이어짐: 최소 2cm/s로 떼고 그만큼 옆 속도에서 덜어 에너지는 그대로
  const VMIN = 0.02;
  if (b.s !== AIR && -v[0] < VMIN) {
    const sp2 = v[0] * v[0] + v[1] * v[1], n0 = Math.min(VMIN, Math.sqrt(sp2));
    v[0] = -n0; v[1] = Math.sign(v[1]) * Math.sqrt(Math.max(sp2 - n0 * n0, 0));
  }
  const vz = b.v[2];
  b.v = toG([v[0], v[1], 0]); b.v[2] = b.s === AIR ? vz : 0;
  b.w = toG(om);
  b.s = b.s === AIR ? AIR : classify(b, p);
  return vx;
}

export const muBB = (vrel) => 0.009951 + 0.108 * Math.exp(-1.088 * vrel);

// 공끼리: 법선은 반발 계수, 접선은 미끄럼 마찰(한도) 또는 붙음
export function resolveBallBall(a, b, p) {
  const { R, eBB } = p;
  const x = unit(sub(b.r, a.r));
  const van = dot(a.v, x), vbn = dot(b.v, x);
  const approach = van - vbn;
  if (approach <= 0) return 0;
  const na = 0.5 * ((1 - eBB) * van + (1 + eBB) * vbn), nb = 0.5 * ((1 + eBB) * van + (1 - eBB) * vbn);
  a.v = add(a.v, mul(x, na - van)); b.v = add(b.v, mul(x, nb - vbn));
  if (p.bbFriction) {
    const Jn = 0.5 * (1 + eBB) * approach;   // 법선 충격량 / m
    const ca = add(a.v, cross(a.w, mul(x, R))), cb = add(b.v, cross(b.w, mul(x, -R)));
    let rel = sub(ca, cb); rel = sub(rel, mul(x, dot(rel, x)));
    const rl = len(rel);
    if (rl > 1e-9) {
      const stick = rl / 7, lim = muBB(rl) * Jn;
      const Dv = mul(rel, -Math.min(stick, lim) / rl);
      const Dw = mul(cross(x, Dv), 2.5 / R);
      a.v = add(a.v, Dv); b.v = sub(b.v, Dv); a.w = add(a.w, Dw); b.w = add(b.w, Dw);
    }
  }
  for (const o of [a, b]) if (o.s !== AIR) o.v[2] = 0;
  a.s = a.s === AIR ? AIR : classify(a, p); b.s = b.s === AIR ? AIR : classify(b, p);
  return approach;
}

// ---------- 큐 타격 ----------
// cue: { speed, yaw, elev, a, b, M, endRatio, eta, tipMu }
//  yaw: 큐가 미는 수평 방향(rad), elev: 큐 뒤를 든 각(rad), a: 옆 당점(오른쪽 +, 반지름 비), b: 높이 당점(위 +)
export function squirtAngle(a, endRatio) {
  const q = 1 - a * a;
  return Math.atan(2.5 * Math.abs(a) * Math.sqrt(Math.max(q, 0)) / (1 + endRatio + 2.5 * q));
}
export function miscueLimit(tipMu) { return tipMu / Math.sqrt(1 + tipMu * tipMu); }

export function strike(ball, cue, p, rand = Math.random) {
  const { m, R, I } = p;
  const ce = Math.cos(cue.elev), se = Math.sin(cue.elev);
  const d = [Math.cos(cue.yaw) * ce, Math.sin(cue.yaw) * ce, -se];   // 큐가 미는 방향
  const side = unit(cross(d, [0, 0, 1])), up = cross(side, d);
  let a = cue.a, bb = cue.b;
  // 미스큐 한계는 당점이 가장자리로 갈수록 넘기 쉬움. 초크 알갱이가 고르지 않아 한계가 샷마다 조금씩(표준편차 10%) 흔들림
  const muJit = (cue.tipMu ?? 0.6) * (1 + 0.2 * (rand() + rand() + rand() - 1.5));
  const off = Math.hypot(a, bb), lim = miscueLimit(muJit);
  let miscue = false, speed = cue.speed;
  if (off > lim) { // 팁이 미끄러짐: 힘이 덜 들어가고 엉뚱한 쪽으로
    miscue = true;
    speed *= 0.25 + 0.3 * rand();
    const k = lim / off * 0.9; a *= k; bb *= k;
  }
  const cdep = -Math.sqrt(Math.max(1 - a * a - bb * bb, 0));
  const rh = add(add(mul(side, a), mul(up, bb)), mul(d, cdep));       // 공 중심에서 접촉점(단위)
  const k = 2.5 * dot(cross(rh, d), cross(rh, d));
  const mr = m / cue.M, eta = cue.eta ?? 0.87;
  const den = mr * mr + mr * (1 + k);
  const vb = speed * (mr + Math.sqrt(Math.max(mr * mr - (1 - eta) * den, 0))) / den;
  let v = mul(d, vb);
  const w = mul(cross(mul(rh, R), v), m / I);
  // 스쿼트: 팁이 닿은 쪽 반대로 밀림
  const sq = squirtAngle(a, cue.endRatio ?? 25) * Math.sign(a) * (miscue ? 1 + 2 * rand() : 1);
  const c = Math.cos(sq), s = Math.sin(sq);
  v = [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
  if (miscue) { const j = (rand() - 0.5) * 0.15; const cj = Math.cos(j), sj = Math.sin(j); v = [v[0] * cj - v[1] * sj, v[0] * sj + v[1] * cj, v[2]]; }
  ball.v = v; ball.w = w;
  // 큐를 들고 쳤으면 공이 천에 눌렸다가 튀어 오름
  if (v[2] < 0) {
    const vn = -v[2], Jn = m * (1 + p.eT) * vn;
    ball.v[2] = 0;
    frictionKick(ball, p, p.muS * Jn);
    const upv = p.eT * vn;
    if (upv > 0.15) { ball.v[2] = upv; ball.s = AIR; } else ball.s = classify(ball, p);
  } else ball.s = classify(ball, p);
  return { miscue, vb, squirt: sq };
}

// ---------- 시뮬레이션 ----------
// balls: 공 배열(바뀜). 결과: { snaps: [{t, balls}], events: [...], tEnd }
export function simulate(balls, p, maxT = 120) {
  const snaps = [{ t: 0, balls: balls.map(clone) }];
  const events = [];
  let t = 0;
  for (let guard = 0; guard < 5000; guard++) {
    let best = Infinity, ev = null;
    const trans = balls.map((b) => transitionTime(b, p));
    balls.forEach((b, i) => { if (trans[i] < best) { best = trans[i]; ev = { type: "trans", i }; } });
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const T = Math.min(trans[i], trans[j], best, maxT);
        const tc = ballBallTime(balls[i], balls[j], T, p);
        if (tc < best || (tc === best && ev?.type === "trans")) { best = tc; ev = { type: "bb", i, j }; }
      }
      for (let wi = 0; wi < 4; wi++) {
        const tc = cushionTime(balls[i], wi, Math.min(trans[i], best, maxT), p);
        if (tc < best) { best = tc; ev = { type: "bc", i, wi }; }
      }
    }
    if (!ev || best === Infinity || t + best > maxT) break;
    for (let i = 0; i < balls.length; i++) { const nb = evolve(balls[i], best, p); balls[i].r = nb.r; balls[i].v = nb.v; balls[i].w = nb.w; }
    t += best;
    if (ev.type === "trans") {
      const wasAir = balls[ev.i].s === AIR;
      applyTransition(balls[ev.i], p);
      if (balls[ev.i].s === -1) events.push({ t, type: "out", i: ev.i });
      else if (wasAir) events.push({ t, type: "land", i: ev.i });
    } else if (ev.type === "bb") {
      const a = balls[ev.i], b = balls[ev.j];
      const vn = resolveBallBall(a, b, p);
      // 겹침 풀기
      const dvec = sub(b.r, a.r), dl = len(dvec);
      if (dl < 2 * p.R) { const push = mul(unit(dvec), (2 * p.R - dl) / 2 + 1e-9); a.r = sub(a.r, push); b.r = add(b.r, push); for (const o of [a, b]) if (o.s !== AIR) o.r[2] = p.R; }
      events.push({ t, type: "bb", i: ev.i, j: ev.j, vn });
    } else {
      const vn = resolveCushion(balls[ev.i], ev.wi, p);
      events.push({ t, type: "bc", i: ev.i, wall: ev.wi, vn });
    }
    snaps.push({ t, balls: balls.map(clone) });
  }
  return { snaps, events, tEnd: t };
}

// 재생: 시각 t의 공 위치들
export function stateAt(sim, t, p) {
  const s = sim.snaps;
  let lo = 0, hi = s.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (s[mid].t <= t) lo = mid; else hi = mid - 1; }
  return s[lo].balls.map((b) => evolve(b, t - s[lo].t, p));
}
