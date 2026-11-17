// 시험용 차 한 대의 움직임. 뒷바퀴 축 가운데를 기준으로 한 자전거 모델 + 자동변속기(P R N D).
// three.js 없이 숫자만 다뤄서 시험 봇도 같은 함수로 돈다.
// 입력은 늘 { steer: -1~1 (왼쪽 +), thr: 0~1, brk: 0~1 } 하나. 지금은 키보드가 채우고, 나중에 레이싱 휠이 같은 칸을 채운다.
// c.auto = 간단 조작: 기어는 화면 쪽이 D, R만 고르고, 기어감 없이 밟을 때만 가며, 멈추면 그 자리에 선다.
export const CAR = { L: 4.6, W: 1.8, H: 1.45, WB: 2.7, TR: 1.56, RO: 0.95, FO: 0.95, DMAX: 0.62 }; // 아반떼 크기, 최소 회전 반경(바깥 앞바퀴) 약 5.3m
export const G = 9.8;
const UP = [0, 15, 30, 45, 62, 80], UPT = [0, 25, 30, 30, 30, 30], KR = [0, 105, 62, 44, 34, 28, 23]; // 자동 변속: 올리는 속도(km/h, 밟을수록 늦게), 단마다 km/h당 RPM

export function newCar(x, z, yaw) {
  return { x, z, yaw, y: 0, pitch: 0, v: 0, acc: 0, steer: 0, gear: "P", ag: 1, rpm: 750, engine: true, pb: true, belt: false,
    sig: 0, hazard: false, lights: 0, wiper: false, spin: 0, brk: 0, thr: 0, yawRate: 0, sigYaw: 0 };
}
const sc = c => [Math.sin(c.yaw), Math.cos(c.yaw)];
// 차 위의 한 점(앞으로 f, 왼쪽으로 l) → 땅 좌표
export function at(c, f, l) { const [s, co] = sc(c); return { x: c.x + s * f + co * l, z: c.z + co * f - s * l }; }
export const wheelsOf = c => [at(c, 0, CAR.TR / 2), at(c, 0, -CAR.TR / 2), at(c, CAR.WB, CAR.TR / 2), at(c, CAR.WB, -CAR.TR / 2)]; // 왼뒤 오뒤 왼앞 오앞
export const front = c => at(c, CAR.WB + CAR.FO, 0);
export const cornersOf = c => [at(c, CAR.WB + CAR.FO, CAR.W / 2), at(c, CAR.WB + CAR.FO, -CAR.W / 2), at(c, -CAR.RO, -CAR.W / 2), at(c, -CAR.RO, CAR.W / 2)];

export function shift(c, g) { // 멈췄을 때만 바뀜 (P에서 빼거나 넣을 땐 브레이크를 밟고 있어야 함)
  if (c.gear === g) return true;
  if (Math.abs(c.v) > 0.4 && g !== "N") return false;
  if ((c.gear === "P" || g === "P") && c.brk < 0.3 && !c.pb) return false;
  c.gear = g; return true;
}

export function stepCar(c, inp, dt, hgt) {
  c.thr = inp.thr; c.brk = inp.brk;
  c.steer = inp.steer * CAR.DMAX;
  // 경사: 앞뒤 바퀴 축 높이 차이 → 차가 기운 각도 → 미끄러지는 힘
  const r = at(c, 0, 0), f = at(c, CAR.WB, 0), hr = hgt(r.x, r.z), hf = hgt(f.x, f.z);
  c.y = hr; c.pitch = Math.atan2(hf - hr, CAR.WB);
  const kmh = Math.abs(c.v) * 3.6;
  let drive = 0;
  if (c.engine && (c.gear === "D" || c.gear === "R")) {
    const dir = c.gear === "D" ? 1 : -1, vd = Math.max(0, c.v * dir);
    const creep = c.auto ? 0 : 1.0 * Math.max(0, 1 - vd / 2.2); // 발을 떼면 시속 7~8km로 기어감 (간단 조작은 밟을 때만 감)
    drive = dir * (creep + inp.thr * (c.auto ? 4.5 : 3.0) * Math.max(0, 1 - vd / (dir > 0 ? 50 : c.auto ? 2.8 : 5))); // 간단 조작은 앞으로 더 힘차게(시속 50km까지 약 4초), 뒤로는 시속 10km 안쪽
  }
  const push = drive - G * Math.sin(c.pitch);
  const hold = inp.brk * 9 + (c.pb ? 2.6 : 0) + (c.gear === "P" ? 30 : 0) + 0.12 + (c.auto && !inp.thr ? 0.6 : 0); // 브레이크, 주차 브레이크, 구름 저항이 버틸 수 있는 힘 (간단 조작은 발을 떼면 서서히 멈춤)
  const keep = c.auto && push * (c.gear === "R" ? -1 : 1) < 0; // 간단 조작: 멈춘 차는 경사에서도 뒤로 밀리지 않음
  const v0 = c.v;
  if (Math.abs(c.v) < 0.03) c.v = Math.abs(push) <= hold || keep ? 0 : c.v + (push - Math.sign(push) * hold) * dt;
  else {
    const s = Math.sign(c.v), nv = c.v + (push - s * (hold + 0.0004 * c.v * c.v)) * dt;
    c.v = Math.sign(nv) !== s && (Math.abs(push) <= hold || keep) ? 0 : nv;
  }
  c.acc = (c.v - v0) / dt;
  c.yawRate = c.v * Math.tan(c.steer) / CAR.WB;
  c.yaw += c.yawRate * dt;
  const [s, co] = sc(c);
  c.x += s * c.v * dt; c.z += co * c.v * dt;
  c.spin += c.v * dt / 0.31;
  // 엔진 회전수: D에서 단을 고르고(밟을수록 늦게 올림), 출발할 땐 토크 컨버터만큼 더 돎. N·P에서 밟으면 헛돎
  if (!c.engine) c.rpm += (0 - c.rpm) * Math.min(1, dt * 4);
  else {
    let want = 750 + inp.thr * 5200;
    if (c.gear === "D") {
      if (c.ag < 6 && kmh > UP[c.ag] + UPT[c.ag] * inp.thr) c.ag++;
      else if (c.ag > 1 && kmh < UP[c.ag - 1] * 0.8) c.ag--;
      want = 750 + inp.thr * 1500 * Math.max(0, 1 - kmh / 25) + kmh * KR[c.ag];
    } else if (c.gear === "R") want = 750 + inp.thr * 1500 * Math.max(0, 1 - kmh / 10) + kmh * 120;
    if (c.gear !== "D") c.ag = 1;
    c.rpm += (Math.min(6500, want) - c.rpm) * Math.min(1, dt * 6);
  }
  // 방향지시등은 핸들을 꺾었다가 풀면 저절로 꺼짐 (진로 변경처럼 조금만 돌면 그대로)
  if (c.sig) { c.sigYaw += c.yawRate * dt * (c.sig === 1 ? 1 : -1); if (c.sigYaw > 0.9 && Math.abs(inp.steer) < 0.12) c.sig = 0; }
}
export function setSig(c, d) { c.sig = c.sig === d ? 0 : d; c.sigYaw = 0; }

// 땅 위 직사각형(가운데, 반폭, 반길이, 각도) 두 개가 겹치면 밀어낼 벡터, 아니면 null (분리축)
export function obbHit(a, b) {
  const ax = [[Math.cos(a.r), -Math.sin(a.r)], [Math.sin(a.r), Math.cos(a.r)], [Math.cos(b.r), -Math.sin(b.r)], [Math.sin(b.r), Math.cos(b.r)]];
  const dx = b.x - a.x, dz = b.z - a.z; let best = 1e9, bn = null;
  const ext = (o, n) => Math.abs(n[0] * Math.cos(o.r) - n[1] * Math.sin(o.r)) * o.hw + Math.abs(n[0] * Math.sin(o.r) + n[1] * Math.cos(o.r)) * o.hl;
  for (const n of ax) { const d = dx * n[0] + dz * n[1], o = ext(a, n) + ext(b, n) - Math.abs(d); if (o <= 0) return null; if (o < best) { best = o; bn = [n[0] * Math.sign(d || 1), n[1] * Math.sign(d || 1)]; } }
  return { x: -bn[0] * best, z: -bn[1] * best };
}
export const carBox = c => { const m = at(c, (CAR.WB + CAR.FO - CAR.RO) / 2, 0); return { x: m.x, z: m.z, hw: CAR.W / 2, hl: CAR.L / 2, r: c.yaw }; };
