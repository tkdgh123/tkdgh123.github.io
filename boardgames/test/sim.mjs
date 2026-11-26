// 봇끼리 판을 끝까지 돌려 규칙이 막히는 곳을 찾는 시험: node boardgames/test/sim.mjs [게임] [판 수]
import vault from "../g/vault.js";
import crab from "../g/crab.js";
import bell from "../g/bell.js";
import gems from "../g/gems.js";
import isle from "../g/isle.js";
import cow from "../g/cow.js"; import code from "../g/code.js"; import tele from "../g/tele.js"; import castle from "../g/castle.js"; import fire from "../g/fire.js"; import tile from "../g/tile.js"; import last from "../g/last.js"; import rank from "../g/rank.js"; import bug from "../g/bug.js"; import race from "../g/race.js"; import yacht from "../g/yacht.js"; import duel from "../g/duel.js";
import { seeded } from "../lib.js";
const ALL = { vault, crab, bell, gems, isle, cow, code, tele, castle, fire, tile, last, rank, bug, race, yacht, duel };
const only = process.argv[2], N = +(process.argv[3] || 200);
for (const [id, G] of Object.entries(ALL)) {
  if (only && only !== id) continue;
  const stat = { games: 0, steps: [], errs: 0, stuck: 0, wins: {} };
  for (let g = 0; g < N; g++) {
    const n = G.min + (g % (G.max - G.min + 1));
    const rng = seeded(1000 + g);
    let now = 0;
    const s = G.setup(n, rng, { now });
    let step = 0;
    for (; step < 20000; step++) {
      if (G.over(s)) break;
      const acts = [];
      for (const p of G.turn(s)) { const b = G.bot(s, p, rng, { now }); if (b) acts.push([p, b]); }
      const tk = G.nextTick ? G.nextTick(s, now) : null;
      acts.sort((a, b) => (a[1].delay ?? 900) - (b[1].delay ?? 900));
      const first = acts[0];
      if (first && (tk == null || (first[1].delay ?? 900) <= tk)) {
        now += Math.max(0, first[1].delay ?? 900);
        try { G.apply(s, first[0], first[1].a, { now, rng }); }
        catch (e) { stat.errs++; if (stat.errs < 6) console.log(id, "잘못된 봇 행동", JSON.stringify(first[1].a), e.message, "phase", s.phase); now += 1000; }
        // 뷰가 직렬화되는지
        if (step % 50 === 0) for (let p = 0; p < n; p++) JSON.stringify(G.view(s, p));
      } else if (tk != null) { now += Math.max(1, tk); G.tick(s, { now, rng }); }
      else { stat.stuck++; console.log(id, "아무도 못 움직임", s.phase, JSON.stringify(G.turn(s))); break; }
    }
    const o = G.over(s);
    if (!o) { stat.stuck++; if (stat.stuck < 4) console.log(id, "안 끝남", n + "명", "phase", s.phase, "steps", step); continue; }
    stat.games++; stat.steps.push(step);
    const w = o.rank[0][0]; stat.wins[w] = (stat.wins[w] || 0) + 1;
    if (o.rank.length !== n || new Set(o.rank.map(r => r[0])).size !== n) console.log(id, "순위가 이상함", JSON.stringify(o.rank));
  }
  const st = stat.steps.sort((a, b) => a - b);
  console.log(`${id}: 끝난 판 ${stat.games}/${N}, 잘못된 행동 ${stat.errs}, 막힘 ${stat.stuck}, 행동 수 중앙 ${st[st.length >> 1]} 최대 ${st[st.length - 1]}, 1등 자리 ${JSON.stringify(stat.wins)}`);
}
