// 부품 이름·조각 크기·철물. 모두 geo.js build() 결과로 계산한다.
import { NUT, WASH, AS } from "./geo.js";

const up5 = v => Math.ceil(v / 5) * 5;
// 조각: dims = [[이름, 값, 의존하는 ?키들]], holes = [[이름, 설명, 의존 키들]]
export function pieces(G) {
  const V = G.V, B = G.BOX;
  return [
    { no: 1, name: "받침판", q: 1, shared: true, what: "액셀·브레이크가 같이 쓰는 바닥판 한 장. 오른쪽 칸 액셀, 왼쪽 칸 브레이크 — 칸마다 뒤쪽에 O 받이 2개, 앞 끝에 B 판",
      dims: [["길이", G.BASE.len, []], ["폭", G.BASE.w, ["baseW", "pairGap"]], ["두께", G.T, []]],
      holes: [["O 받이 자리", `칸마다 양 끝, 뒤 끝부터 B 판까지 (O 중심은 뒤 끝에서 ${f(V.rear)}). 바깥쪽 O 받이는 받침판 옆면에 맞춤`, []], ["칸", `한 칸 ${f(V.baseW)} · 사이 ${f(V.pairGap)} · 한 칸 ${f(V.baseW)}`, ["baseW", "pairGap"]]] },
    { no: 2, name: "페달 막대", q: 1, what: "15T 한 장을 30 폭으로 켠 막대. 아래 끝에 O, 그 위 OA에 A",
      dims: [["길이", V.pedalLen, []], ["폭", V.pedalDepth, []], ["두께", V.pedalT, []]],
      holes: [["O 구멍 Ø8.5", `아래 끝에서 ${f(V.oFromEnd)}, 폭 가운데. 양쪽 장너트로 조여 O핀과 같이 돎`, []], ["A 구멍 Ø8.5", `아래 끝에서 ${f(V.oFromEnd + G.OA)} (OA ${f(G.OA)})`, []]] },
    { no: 9, name: "발판", q: 1, what: "발이 닿는 판. 페달 막대 위 끝에 맞춰 운전자 쪽 면에 피스 2개로",
      dims: [["좌우", V.padW, ["padW"]], ["길이", V.padL, ["padL"]], ["두께", G.T, []]],
      holes: [["피스 구멍 2", "좌우 가운데 줄, 페달 막대 위에", []]] },
    { no: 3, name: "막대 몸통 옆벽", q: 2, what: `U의 양 팔. A 쪽 끝은 A 구멍 중심으로 R${f(B.r)} 반원으로 둥글게 깎아 밟을 때 걸리지 않게`,
      dims: [["길이", B.back + G.S - G.T, []], ["높이", V.boxH, []], ["두께", G.T, []]],
      holes: [["A 구멍 Ø8.5", `둥근 끝에서 ${f(B.back)} (반원 중심), 높이 가운데`, []], ["둥근 끝", `반지름 ${f(B.r)}`, []]] },
    { no: 4, name: "막대 몸통 앞벽", q: 1, what: "U의 바닥. 가운데 구멍에 전산볼트를 양쪽 너트로 고정. 바깥 면 가운데가 C, 안쪽 면이 DE",
      dims: [["폭", B.inner + 2 * G.T, ["gap"]], ["높이", V.boxH, []], ["두께", G.T, []]],
      holes: [["전산볼트 구멍 Ø8.5", "정가운데 (C)", []]] },
    { no: 5, name: "B 판", q: 1, what: "받침판 앞 끝, 자기 페달 칸에 세운 판. 스프링이 안쪽 면(B)에 닿고, 전산볼트는 B 구멍을 뚫고 뒤로 나감",
      dims: [["폭", V.baseW, ["baseW"]], ["높이", V.bPlateH, []], ["두께", G.T, []]],
      holes: [["B 구멍 (관통)", `좌우 ${f(G.SLOT.w)} × 위아래 ${G.SLOT.h}, 중심 높이 ${f(G.SLOT.cy)}, 폭 가운데`, ["H"]]] },
    { no: 6, name: "O 받이", q: 2, what: "O핀을 받치는 긴 판 2개. 자기 페달 칸 양 끝에 받침판 뒤 끝부터 B 판 뒷면까지 세워 받침판과 U자(바깥 폭 = B 판 폭)",
      dims: [["길이", G.OPOST.w, []], ["높이", G.OPOST.h, ["oPostH"]], ["두께", G.T, []]],
      holes: [["O 구멍 Ø8.5", `뒤 끝에서 ${f(V.rear)}, 밑에서 ${f(V.H)}. O핀이 이 구멍 안에서 돎`, ["H"]]] },
    { no: 7, name: "센서 받침", q: 1, what: "AS5600을 붙이는 판. O 받이 바깥 바닥에 서서, 사이 조각을 끼고 받침판 옆면에 피스로",
      dims: [["앞뒤", G.SENS.w, []], ["높이", G.SENS.top + G.T, ["H"]], ["두께", G.T, []]],
      holes: [["AS5600 자리", `밑에서 ${f(G.T + V.H)} (O와 같은 높이), 자석과 틈 ${AS.gap}`, ["H"]]] },
    { no: 8, name: "사이 조각", q: 1, what: "센서 받침과 받침판 옆면 사이. 이만큼 띄워야 O핀 끝 자석과 AS5600이 들어가요",
      dims: [["앞뒤", G.SENS.w, []], ["높이", G.T, []], ["두께", G.T, []]], holes: [] },
  ];
}
export function hardware(G) {
  const V = G.V;
  return [
    { name: "전산볼트", spec: `M8 ${G.ROD.len}mm`, q: 1, use: `막대 몸통 앞벽 가운데에 너트 2개로 고정 → 스프링 속 → B 구멍 → 뒤로 나감 (C에서 앞으로 ${f(G.ROD.out)})`, deps: [] },
    { name: "O핀", spec: `M8 전산볼트 ${up5(2 * G.OPIN_HALF)}mm`, q: 1, use: "O 받이–와셔–장너트–페달 막대–장너트–와셔–O 받이. 끝은 O 받이 밖으로 자석 자리만큼", deps: ["baseW"] },
    { name: "장너트", spec: `M8 길이 ${f(G.LNUT)}`, q: 2, use: "페달 막대를 양쪽에서 조여 O핀이 페달 막대와 같이 돎. 끝과 O 받이 사이 와셔 + 여유 0.5 — 꽉 끼면 안 돌아요. 이보다 짧은 걸 사면 와셔를 더 끼워 맞춤", deps: ["baseW"] },
    { name: "A핀", spec: `M8 전산볼트 ${up5(2 * G.APIN_HALF)}mm`, q: 1, use: "막대 몸통 옆벽–페달 막대–옆벽", deps: ["gap"] },
    { name: "스프링", spec: "1.2×17.85×78.4", q: 1, use: `앞벽 C ↔ B 판 안쪽 면, ${f(V.springFree)} → ${f(V.springMin)}. 전산볼트가 속을 지남`, deps: [] },
    { name: "너트 M8", spec: "", q: 5, use: `전산볼트 3 (앞벽 안·밖 2, 뒤 끝 1 — B 판 뒷면에서 놓았을 때 멈춤) · A핀 2`, deps: [] },
    { name: "와셔 17×1T", spec: "", q: 6, use: "전산볼트 2 (앞벽 안쪽 · 뒤 끝) · O 받이 안쪽 2 · A핀 2", deps: [] },
    { name: "AS5600", spec: "보드 23×23", q: 1, use: "센서 받침에 붙임. OUT → A0(액셀)·A1(브레이크), VCC 5V, GND", deps: [] },
    { name: "자석", spec: "Ø6×2.5 지름 방향", q: 1, use: "O핀 바깥 끝면 가운데에 붙임", deps: [] },
    { name: "피스 6×25", spec: "", q: 17, use: "받침판→O 받이 6 · 받침판→B 판 3 · 앞벽→옆벽 4 · 센서 받침→사이 조각→받침판 2 · 발판→페달 막대 2", deps: [] },
  ];
}
export const FEATURES = [
  ["B 구멍", "B 판을 뚫은 위아래로 긴 구멍. 전산볼트가 기울며 지나감"],
  ["U 안쪽", "막대 몸통 옆벽 사이, 페달 막대가 들어가는 틈"],
  ["O 받이 U", "받침판 + 페달 칸 양 끝 O 받이. 바깥 폭 = B 판 폭, 안쪽은 장너트가 채움"],
  ["둥근 끝", "막대 몸통 옆벽 A 쪽 끝"],
];
export const POINTS = [
  ["O", "페달 막대 아래 회전 중심"], ["A", "A핀 중심 (페달 막대 위, OA)"], ["B", "B 판 안쪽 면, B 구멍 가운데 = 스프링 끝 (O와 같은 높이)"],
  ["C", "막대 몸통 앞벽 바깥 면 가운데 = 스프링 시작 · 전산볼트 구멍"], ["D · E", "앞벽 안쪽 면 위·아래 끝 (DE = 막대 높이)"], ["P", "페달 막대의 B 쪽 면 (OA에서 15)"], ["Q", "앞벽 안쪽 면 줄 (C에서 15)"],
];
export const f = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
export { NUT, WASH };
