// 데칼코마니 규칙 — 판 만들기·접기·점수. 게임 화면(index.html)과 랭킹 검증 함수(수파베이스)가 이 파일 하나를 같이 쓴다.
// 판의 무작위는 씨앗 하나로 정해져서, 씨앗과 접은 기록만 있으면 서버가 같은 판을 다시 두어 점수를 계산할 수 있다.
// 만든 사람: Claude (사용자 김창식 요청, 2026-11-13). 이 파일을 바꾸면 V를 올리고 검증 함수도 다시 올린다.
// V2(11-13): 새 점을 더 많이, 더 자주 — 접은 뒤엔 없어진 만큼(적어도 4개, 판 25개까지), 고민하는 동안엔 1.5초마다 1개(29개까지). 판은 20개로 시작
(G => {
  const V = 2;
  const N = 7, TIME = 120, MIN = 1, PENALTY = 3, NC = 6, CB_T0 = 2, CB_T1 = 1.2;
  // 처음 점 수 · 접은 뒤 바로 채우는 한도 · 판에 있을 수 있는 최대(그 사이는 고민하는 동안 떨어지는 점으로) · 접은 뒤 적어도 나오는 수 · 떨어지는 간격(초)
  const START = 20, BURST = 25, CAP = 29, NEW_MIN = 4, DRIP = 1.5;
  const FOLD = 0.5; // 접기 한 번이 판 시간으로 걸리는 최소 초(화면은 0.6초 애니메이션 + 이 조건)
  const idx = (x, y) => y * N + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < N && y < N;

  // 접는 선: 세로 x=a, 가로 y=a, 대각선 x-y=c, x+y=c (칸 중심이 정수 좌표)
  function reflect(ax, x, y) {
    if (ax.t === "V") return [2 * ax.a - x, y];
    if (ax.t === "H") return [x, 2 * ax.a - y];
    if (ax.t === "D1") return [y + ax.a, x - ax.a];
    return [ax.a - y, ax.a - x];
  }
  // 선 위의 위치: 선 위 한 점 + 방향. seg = [lo, hi]면 그 구간에 걸친 쌍만 (보통 모드)
  const dirOf = ax => ax.t === "V" ? [ax.a, 0, 0, 1] : ax.t === "H" ? [0, ax.a, 1, 0] : [ax.a, 0, Math.SQRT1_2, ax.t === "D1" ? Math.SQRT1_2 : -Math.SQRT1_2];
  const along = (ax, x, y) => { const [ox, oy, dx, dy] = dirOf(ax); return (x - ox) * dx + (y - oy) * dy };
  function pairsFor(grid, ax, seg) {
    const out = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = grid[idx(x, y)];
      if (c < 0) continue;
      const [mx, my] = reflect(ax, x, y);
      if (!inB(mx, my) || idx(mx, my) <= idx(x, y)) continue;
      if (seg) { const t = along(ax, (x + mx) / 2, (y + my) / 2); if (t < seg[0] - .4 || t > seg[1] + .4) continue; }
      if (grid[idx(mx, my)] === c) out.push([x, y, mx, my, c]);
    }
    return out;
  }
  const AXES = [];
  for (let a = 0.5; a <= N - 1.5; a += 0.5) AXES.push({ t: "V", a }, { t: "H", a });
  for (let c = -(N - 2); c <= N - 2; c++) AXES.push({ t: "D1", a: c });
  for (let c = 1; c <= 2 * N - 3; c++) AXES.push({ t: "D2", a: c });

  // 씨앗 난수(mulberry32): 같은 씨앗이면 어디서 돌려도 같은 수가 같은 순서로 나온다
  const rng = seed => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } };

  // 숨은 대칭 무늬: 선 하나를 골라 그 선으로 3~5쌍이 겹치게 빈칸에만 점을 놓는다(놓은 점 수를 돌려줌).
  // 있던 점의 맞은편 빈칸엔 같은 색(점 하나로 한 쌍), 둘 다 빈칸이면 새 색 한 쌍
  function plant(grid, budget, R) {
    const want = [3, 4, 4, 5][R() * 4 | 0], opts = [];
    for (const ax of AXES) {
      const one = [], two = [], put = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const [mx, my] = reflect(ax, x, y), i = idx(x, y), j = idx(mx, my);
        if (!inB(mx, my) || j <= i) continue;
        if (grid[i] < 0 && grid[j] < 0) two.push([i, j]);
        else if (grid[i] < 0 || grid[j] < 0) one.push(grid[i] < 0 ? [i, grid[j]] : [j, grid[i]]);
      }
      let got = pairsFor(grid, ax).length, b = budget;
      while (got < want && b && one.length) { put.push(one.splice(R() * one.length | 0, 1)[0]); b--; got++ }
      while (got < want && b > 1 && two.length) { const [i, j] = two.splice(R() * two.length | 0, 1)[0], c = R() * NC | 0; put.push([i, c], [j, c]); b -= 2; got++ }
      opts.push({ got, put });
    }
    const ok = opts.filter(o => o.got >= Math.min(4, want)), o = ok.length ? ok[R() * ok.length | 0] : opts.reduce((p, q) => q.got > p.got ? q : p);
    for (const [i, c] of o.put) grid[i] = c;
    return o.put.length;
  }
  function scatter(grid, n, R) { const e = []; grid.forEach((c, i) => c < 0 && e.push(i)); while (n-- > 0 && e.length) grid[e.splice(R() * e.length | 0, 1)[0]] = R() * NC | 0 }
  const count = grid => grid.filter(c => c >= 0).length;
  // 새 점 n개(BURST까지, 그래도 적어도 NEW_MIN개, CAP은 넘지 않게)는 빈칸에만 — 있던 점은 사라지거나 색이 바뀌지 않는다. 아무 데나 놓아 봐서 어떤 선으로도
  // 4쌍이 안 겹치면, 그 점들을 거두고 같은 개수로 숨은 무늬를 심는다. 채우기 전 판을 돌려준다(새로 생긴 점을 그릴 때 씀)
  function refill(grid, R, n) {
    const g0 = grid.slice(), c = count(g0), need = Math.min(Math.max(Math.min(n, BURST - c), NEW_MIN), CAP - c);
    scatter(grid, need, R);
    if (Math.max(...AXES.map(a => pairsFor(grid, a).length)) < 4) { g0.forEach((c, i) => grid[i] = c); scatter(grid, need - plant(grid, need, R), R) }
    return g0;
  }
  // 고민하는 동안 떨어지는 한 점: 판이 CAP보다 적을 때만 빈칸 하나에(놓은 칸 번호, 안 놓으면 -1)
  function drip(grid, R) {
    if (count(grid) >= CAP) return -1;
    const e = []; grid.forEach((c, i) => c < 0 && e.push(i));
    const i = e[R() * e.length | 0]; grid[i] = R() * NC | 0;
    return i;
  }
  // 접은 뒤 나오는 수: 없어진 만큼, 적어도 NEW_MIN
  const after = pairs => Math.max(2 * pairs, NEW_MIN);

  // 40초마다 점수 ×2, ×3 · 콤보 시간은 2초에서 2분 끝 1.2초까지 줄고, 콤보 2부터 ×1.5, ×2 … 최대 ×3
  const stageOf = el => el < 40 ? 1 : el < 80 ? 2 : 3;
  const cbWin = el => CB_T0 - (CB_T0 - CB_T1) * Math.min(1, el / TIME);
  const cbMul = c => c > 1 ? Math.min(3, 1 + .5 * (c - 1)) : 1;
  const points = (n, mult, cf) => Math.round(10 * n * 2 ** (n - 1) * mult * cf / 10) * 10;

  // 다시 두기: 기록 한 줄 = [선 종류, 선 값, 구간 시작, 구간 끝, 접은 때, 접기가 끝난 때](때는 판 시작부터 흐른 초).
  // 쉬움은 구간이 null. 접기가 끝나기 전에 판이 끝났으면 마지막 줄만 끝난 때가 없다.
  // 접는 동안은 다음 선을 못 그으니 다음 접기는 앞 접기가 끝난 뒤에만 오고, 접기 한 번은 FOLD초 이상 걸린다.
  // 판 시작·접기가 끝난 때부터 DRIP초마다 한 점이 떨어진다(접는 동안은 안 떨어짐) — 다음 접기 때까지 떨어진 점을 먼저 놓는다.
  // 돌려주는 값: { score, folds } 또는 { err: 이유 }
  const AX_OK = new Set(AXES.map(a => a.t + a.a));
  const num = v => typeof v === "number" && Number.isFinite(v);
  function replay(seed, mode, log) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return { err: "seed" };
    if (mode !== "easy" && mode !== "normal") return { err: "mode" };
    if (!Array.isArray(log) || log.length > 400) return { err: "log" };
    const grid = new Array(N * N).fill(-1), R = rng(seed);
    refill(grid, R, START);
    let score = 0, misses = 0, combo = 0, cdl = -1, free = 0, next = DRIP;
    for (let k = 0; k < log.length; k++) {
      const r = log[k];
      if (!Array.isArray(r) || r.length < 5 || r.length > 6) return { err: "row " + k };
      const [t, a, s0, s1, e, d] = r, last = k === log.length - 1;
      if (!AX_OK.has(t + a) || typeof t !== "string" || !num(a)) return { err: "axis " + k };
      let seg = null;
      if (mode === "normal") {
        if (!num(s0) || !num(s1) || s0 > s1 || s0 < -100 || s1 > 100) return { err: "seg " + k };
        seg = [s0, s1];
      } else if (s0 !== null || s1 !== null) return { err: "seg " + k };
      if (!num(e) || e < free || TIME - e - misses * PENALTY <= 0) return { err: "time " + k };
      if (d === undefined ? !last : !num(d) || d - e < FOLD || d - e > 10) return { err: "end " + k };
      while (next <= e) { drip(grid, R); next += DRIP }
      const ax = { t, a }, ps = pairsFor(grid, ax, seg);
      if (ps.length < MIN) { misses++; combo = 0; cdl = -1; free = d ?? e; if (d !== undefined) next = d + DRIP; continue }
      for (const [x, y, mx, my] of ps) grid[idx(x, y)] = grid[idx(mx, my)] = -1;
      combo = e <= cdl ? combo + 1 : 1; cdl = -1;
      score += points(ps.length, stageOf(e), cbMul(combo));
      if (d === undefined) break;
      // 접기가 끝나는 때에 아직 판이 이어지고 있었으면 빈칸이 채워지고 콤보 시간이 시작된다
      if (TIME - d - misses * PENALTY > 0) { refill(grid, R, after(ps.length)); cdl = d + cbWin(d) }
      free = d; next = d + DRIP;
    }
    return { score, folds: log.length };
  }

  G.DecalCore = { V, N, TIME, FOLD, START, BURST, CAP, NEW_MIN, DRIP, MIN, PENALTY, idx, inB, reflect, dirOf, along, pairsFor, AXES, rng, plant, scatter, refill, drip, after, count, stageOf, cbWin, cbMul, points, replay };
})(globalThis);
