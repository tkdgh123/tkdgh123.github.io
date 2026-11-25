// node tests/physics.test.mjs
import * as P from "../js/physics.js";
const deg = (r) => r * 180 / Math.PI;
let fails = 0;
const check = (name, ok, info) => { console.log(`${ok ? "통과" : "실패"}  ${name}  ${info}`); if (!ok) fails++; };

// 1. 30도 규칙: 구르는 수구가 반 두께로 정지 공을 맞히면 다시 구를 때 33.67도 꺾임
{
  const p = P.makeParams({ L: 20, W: 20, eBB: 1, bbFriction: false });
  const a = P.newBall(0, -1, 0, p), b = P.newBall(1, 0, p.R, p);
  a.v = [1, 0, 0]; a.w = [0, 1 / p.R, 0]; a.s = P.ROLL;
  const sim = P.simulate([a, b], p, 5);
  const iHit = sim.events.findIndex((e) => e.type === "bb");
  // 충돌 뒤 수구가 다시 구르기 시작하는 순간
  const snap = sim.snaps.find((s, k) => k > iHit + 1 && s.balls[0].s === P.ROLL);
  const v = snap.balls[0].v, ang = Math.abs(deg(Math.atan2(v[1], v[0])));
  check("30도 규칙", Math.abs(ang - 33.67) < 0.1, `${ang.toFixed(2)}도 (기대 33.67)`);
}

// 2. 스쿼트: 당점 0.5R, 샤프트 끝 무게 비 15 -> 3.47도
{
  const s = deg(P.squirtAngle(0.5, 15));
  check("스쿼트", Math.abs(s - 3.47) < 0.02, `${s.toFixed(3)}도 (기대 3.47)`);
}

// 3. 정중앙 정지 샷이 정면 충돌하면 수구가 거의 멈춤 (e 0.95 -> 수구 2.5%)
{
  const p = P.makeParams({ L: 20, W: 20 });
  const a = P.newBall(0, -0.05, 0, p), b = P.newBall(1, 0.03, 0, p);
  a.v = [2, 0, 0]; a.s = P.SLIDE;
  const sim = P.simulate([a, b], p, 5);
  const k = sim.events.findIndex((e) => e.type === "bb");
  const before = P.evolve(sim.snaps[k].balls[0], sim.events[k].t - sim.snaps[k].t, p).v[0];
  const after = sim.snaps[k + 1].balls;
  check("정면 스톱샷", Math.abs(after[0].v[0] / before - 0.025) < 0.002 && Math.abs(after[1].v[0] / before - 0.975) < 0.002,
    `수구 ${(after[0].v[0] / before * 100).toFixed(1)}%, 적구 ${(after[1].v[0] / before * 100).toFixed(1)}% (충돌 직전 ${before.toFixed(3)} m/s)`);
}

// 4. 회전 없이 미끄러지던 공은 처음 속도의 5/7로 구르기 시작
{
  const p = P.makeParams({ L: 20, W: 20 });
  const a = P.newBall(0, 0, 0, p); a.v = [3, 0, 0]; a.s = P.SLIDE;
  const sim = P.simulate([a], p, 30);
  const s1 = sim.snaps[1];
  const want = 12 * 9 / (49 * 0.2 * 9.81);
  check("5/7 규칙", Math.abs(s1.balls[0].v[0] - 3 * 5 / 7) < 1e-9 && Math.abs(s1.balls[0].r[0] - want) < 1e-9,
    `구름 시작 ${s1.balls[0].v[0].toFixed(4)} m/s, 미끄러진 거리 ${s1.balls[0].r[0].toFixed(4)} m`);
}

// 5. 쿠션 회전: 러닝은 반사각이 커지고 빨라짐, 리버스는 작아지고 느려짐
{
  const p = P.makeParams({ cushionE: 0.7 });
  const shoot = (wz) => {
    const b = P.newBall(0, p.xMax - 0.05, 0, p);
    const sp = 2, th = 30 * Math.PI / 180;
    b.v = [sp * Math.cos(th), sp * Math.sin(th), 0];
    b.w = [-b.v[1] / p.R, b.v[0] / p.R, wz]; b.s = P.ROLL;
    P.resolveCushion(b, 0, p);
    return { ang: deg(Math.atan2(Math.abs(b.v[1]), Math.abs(b.v[0]))), sp: Math.hypot(b.v[0], b.v[1]) };
  };
  const n = shoot(0), run = shoot(-30), rev = shoot(30);
  check("러닝 잉글리시", run.ang > n.ang && run.sp > n.sp, `${run.ang.toFixed(1)}도 ${run.sp.toFixed(3)} m/s (회전 없음 ${n.ang.toFixed(1)}도 ${n.sp.toFixed(3)})`);
  check("리버스 잉글리시", rev.ang < n.ang && rev.sp < n.sp, `${rev.ang.toFixed(1)}도 ${rev.sp.toFixed(3)} m/s`);
}

// 6. 큐 타격: 오른쪽 당점은 반시계 회전 + 공이 왼쪽으로 밀림, 위 당점은 앞 회전
{
  const p = P.makeParams();
  const b = P.newBall(0, 0, 0, p);
  const r = P.strike(b, { speed: 2, yaw: 0, elev: 0, a: 0.4, b: 0, M: 0.54, endRatio: 25, tipR: 0 }, p, () => 0.5);
  check("오른쪽 당점", b.w[2] > 0 && b.v[1] > 0, `wz ${b.w[2].toFixed(1)} rad/s, 옆으로 ${deg(Math.atan2(b.v[1], b.v[0])).toFixed(2)}도`);
  const c = P.newBall(0, 0, 0, p);
  P.strike(c, { speed: 2, yaw: 0, elev: 0, a: 0, b: 0.5, M: 0.54, tipR: 0 }, p, () => 0.5);
  check("위 당점 0.5R = 구름의 125%", Math.abs(c.w[1] * p.R / c.v[0] - 1.25) < 1e-6, `앞 회전 ${(c.w[1] * p.R / c.v[0] * 100).toFixed(0)}% (구름 100%)`);
  const d = P.newBall(0, 0, 0, p);
  P.strike(d, { speed: 2, yaw: 0, elev: 0, a: 0, b: 0, M: 0.54 }, p, () => 0.5);
  check("중심 타격 속도비", d.v[0] / 2 > 1.15 && d.v[0] / 2 < 1.25, `공/큐 ${(d.v[0] / 2).toFixed(3)}`);
  const e = P.newBall(0, 0, 0, p);
  const m = P.strike(e, { speed: 2, yaw: 0, elev: 0, a: 0.55, b: 0.2, M: 0.54, tipMu: 0.45 }, p, () => 0.5);
  check("초크 부족 미스큐", m.miscue, `한계 ${P.miscueLimit(0.45).toFixed(3)}R, 당점 ${Math.hypot(0.55, 0.2).toFixed(3)}R`);
  // 초크 충분(mu 0.66): 닿는 점 0.5R은 거의 안전, 0.6R은 거의 빡 (Dr. Dave 측정 최대 0.55R)
  const rate = (axis, full) => { let n = 0; for (let k = 0; k < 2000; k++) { const z = P.newBall(0, 0, 0, p); const mc = P.strike(z, { speed: 2, yaw: 0, elev: 0, a: 0, b: -axis, M: 0.54, tipMu: 0.66 }, p).miscue; if (full ? mc === true : mc) n++; } return n / 2000; };
  const sc = 1 + 0.010 / p.R, r50 = rate(0.5 * sc), r55 = rate(0.55 * sc), r60 = rate(0.6 * sc, true);
  check("미스큐 확률", r50 < 0.05 && r55 > 0.3 && r55 < 0.7 && r60 > 0.7, `닿는 점 0.50R ${(r50 * 100).toFixed(1)}%, 0.55R ${(r55 * 100).toFixed(1)}% (부분 미스큐 포함), 0.60R 완전 미스큐 ${(r60 * 100).toFixed(1)}% (큐 축으로는 ${(0.5 * sc).toFixed(2)}R, ${(0.55 * sc).toFixed(2)}R, ${(0.6 * sc).toFixed(2)}R)`);
}

// 7. 무작위 샷 400번: 공이 겹치거나 테이블을 뚫거나 에너지가 늘지 않음
{
  const p = P.makeParams();
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const energy = (bs) => bs.reduce((s, b) => s + 0.5 * p.m * P.V.dot(b.v, b.v) + 0.5 * p.I * P.V.dot(b.w, b.w), 0);
  let bad = 0, worst = 0, maxEv = 0, maxT = 0, notStop = 0, t0 = performance.now();
  for (let n = 0; n < 400; n++) {
    const balls = [];
    while (balls.length < 4) {
      const x = (rnd() * 2 - 1) * p.xMax, y = (rnd() * 2 - 1) * p.yMax;
      if (balls.every((b) => Math.hypot(b.r[0] - x, b.r[1] - y) > 2 * p.R + 1e-4)) balls.push(P.newBall(balls.length, x, y, p));
    }
    P.strike(balls[0], { speed: 0.3 + rnd() * 5.5, yaw: rnd() * 6.283, elev: rnd() * 0.15, a: (rnd() - 0.5) * 0.9, b: (rnd() - 0.5) * 0.9, M: 0.54, tipMu: 0.6 }, p, rnd);
    const sim = P.simulate(balls, p, 200);
    maxEv = Math.max(maxEv, sim.events.length); maxT = Math.max(maxT, sim.tEnd);
    let prevE = Infinity;
    for (const s of sim.snaps) {
      const E = energy(s.balls);
      if (E > prevE * (1 + 1e-6) + 1e-9) { bad++; worst = Math.max(worst, E / prevE - 1); }
      prevE = E;
      for (const b of s.balls) {
        if (b.s === -1) continue;
        if (!b.r.every(Number.isFinite) || Math.abs(b.r[0]) > p.xMax + 1e-7 || Math.abs(b.r[1]) > p.yMax + 1e-7) bad++;
      }
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
        const d = P.V.len(P.V.sub(s.balls[i].r, s.balls[j].r));
        if (d < 2 * p.R - 1e-7) bad++;
      }
    }
    if (balls.some((b) => b.s !== P.STOP && b.s !== -1)) notStop++;
  }
  const ms = performance.now() - t0;
  check("무작위 400샷", bad === 0 && notStop === 0, `문제 ${bad}건, 안 멈춤 ${notStop}, 사건 최대 ${maxEv}개, 가장 긴 샷 ${maxT.toFixed(1)}초, 걸린 시간 ${ms.toFixed(0)}ms${worst ? `, 에너지 증가 최대 ${(worst * 100).toFixed(3)}%` : ""}`);
}

process.exit(fails ? 1 : 0);
