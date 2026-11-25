// 4구 규칙 (동네 당구장 방식, 사용자 확정 2026-11-25)
// 공 번호: 0 흰 공, 1 노란 공, 2 3 빨간 공
export const SUJI = [30, 50, 80, 100, 120, 150, 200, 250, 300, 400, 500];
export const BALL_NAME = ["흰 공", "노란 공", "빨간 공", "빨간 공"];

export function newGame(mode, players) {
  return {
    mode, // "solo" | "duo"
    players: players.map((pl, i) => ({ name: pl.name, ball: i, suji: pl.suji, left: Math.round(pl.suji / 10), finishing: false, points: 0, fouls: 0, innings: 0, high: 0, run: 0 })),
    turn: 0, over: false, winner: -1, shots: 0, log: [],
  };
}

// 한 샷 판정. events: physics.simulate의 사건, extraFoul: 투터치 등 화면 쪽에서 잡은 파울 이름
export function judge(cue, events, extraFoul) {
  const opp = cue === 0 ? 1 : 0;
  const hit = new Set();
  let cushions = 0, cushionsAtSecond = -1, foul = extraFoul || null;
  for (const e of events) {
    if (e.type === "out") { foul = foul || `${BALL_NAME[e.i]}이 대 밖으로 나갔어요`; continue; }
    if (e.type === "bc" && e.i === cue && cushionsAtSecond < 0) cushions++;
    if (e.type !== "bb") continue;
    if (e.i !== cue && e.j !== cue) continue;
    const other = e.i === cue ? e.j : e.i;
    if (other === opp) { foul = foul || "상대 공을 맞혔어요"; continue; }
    if (!hit.has(other)) {
      hit.add(other);
      if (hit.has(2) && hit.has(3) && cushionsAtSecond < 0) cushionsAtSecond = cushions;
    }
  }
  const scored = hit.has(2) && hit.has(3);
  return { scored, foul, cushions: Math.max(cushionsAtSecond, 0), reds: hit.size - (hit.has(opp) ? 1 : 0) };
}

// 판정을 점수에 반영. 반환: { msg, keep(계속 치는지), win }
export function apply(g, res) {
  const pl = g.players[g.turn];
  g.shots++;
  let msg, keep = false;
  if (res.foul) {
    pl.fouls++;
    if (pl.suji >= 50) { pl.left += 1; pl.finishing = false; }
    msg = `파울. ${res.foul}${pl.suji >= 50 ? " 1점이 더해져요." : ""}`;
  } else if (pl.finishing) {
    if (res.scored && res.cushions >= 3) {
      g.over = true; g.winner = g.turn; pl.points++;
      msg = `쓰리쿠션 마무리! ${pl.name} 승리`;
    } else if (res.scored) msg = `득점했지만 쿠션 ${res.cushions}번이라 마무리가 아니에요`;
    else msg = "마무리 실패";
  } else if (res.scored) {
    pl.left -= 1; pl.points++; pl.run++; pl.high = Math.max(pl.high, pl.run); keep = true;
    if (pl.left <= 0) {
      pl.left = 0;
      if (pl.suji === 30) { g.over = true; g.winner = g.turn; msg = `다 쳤어요! ${pl.name} 승리`; }
      else { pl.finishing = true; msg = "다 풀었어요. 이제 쓰리쿠션으로 마무리"; }
    } else msg = `득점. 남은 점수 ${pl.left}`;
  } else {
    msg = res.reds === 1 ? "하나만 맞았어요" : "못 맞혔어요";
  }
  if (!keep) {
    pl.run = 0;
    pl.innings++;
    if (g.mode === "duo" && !g.over) g.turn = 1 - g.turn;
  }
  g.log.push({ who: pl.name, msg });
  return { msg, keep, win: g.over };
}

// 초구 배치 (물리 좌표, m). 선공 수구는 가까운 빨간 공 오른쪽 반 포인트, 상대 공은 먼 단쿠션 가운데
export function opening(p, starter) {
  const q = p.L / 8; // 포인트 간격
  const pos = [];
  pos[2] = [-2 * q, 0];
  pos[3] = [2 * q, 0];
  pos[starter] = [-2 * q, -q / 2];
  pos[1 - starter] = [p.xMax - 0.012, 0];
  return pos;
}
