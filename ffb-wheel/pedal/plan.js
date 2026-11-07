// 부품 이름·조각 크기·철물. 모두 geo.js build() 결과로 계산한다.
import { NUT, WASH, AS } from "./geo.js";

const up5 = v => Math.ceil(v / 5) * 5;
// 조각: dims = [[이름, 값, 의존하는 ?키들]], holes = [[이름, 설명, 의존 키들]]
export function pieces(G) {
  const V = G.V, B = G.BOX;
  return [
    { no: 1, name: "받침판", q: 1, what: "바닥판. 뒤쪽에 O 받이, 앞 끝에 B 판",
      dims: [["길이", G.BASE.len, []], ["폭", V.baseW, ["baseW"]], ["두께", G.T, []]],
      holes: [["O 받이 자리", `뒤 끝에서 ${f(V.rear)} (O 중심)`, []]] },
    { no: 2, name: "발판", q: 1, what: "15T 한 장을 30 폭으로 켠 막대. 아래 끝에 O, 그 위 OA에 A",
      dims: [["길이", V.pedalLen, []], ["폭", V.pedalDepth, []], ["두께", V.pedalT, []]],
      holes: [["O 구멍 Ø8 (꽉 끼게)", `아래 끝에서 ${f(V.oFromEnd)}, 폭 가운데. O핀이 발판과 같이 돌아야 끝의 자석이 돌아요`, []], ["A 구멍 Ø8.5", `아래 끝에서 ${f(V.oFromEnd + G.OA)} (OA ${f(G.OA)})`, []]] },
    { no: 3, name: "막대 몸통 옆벽", q: 2, what: `U의 양 팔. A 쪽 끝은 A 구멍 중심으로 R${f(B.r)} 반원으로 둥글게 깎아 밟을 때 걸리지 않게`,
      dims: [["길이", B.back + G.S - G.T, []], ["높이", V.boxH, []], ["두께", G.T, []]],
      holes: [["A 구멍 Ø8.5", `둥근 끝에서 ${f(B.back)} (반원 중심), 높이 가운데`, []], ["둥근 끝", `반지름 ${f(B.r)}`, []]] },
    { no: 4, name: "막대 몸통 앞벽", q: 1, what: "U의 바닥. 가운데 구멍에 전산볼트를 양쪽 너트로 고정. 바깥 면 가운데가 C, 안쪽 면이 DE",
      dims: [["폭", B.inner + 2 * G.T, ["gap"]], ["높이", V.boxH, []], ["두께", G.T, []]],
      holes: [["전산볼트 구멍 Ø8.5", "정가운데 (C)", []]] },
    { no: 5, name: "B 판", q: 1, what: "받침판 앞 끝에 세운 판. 스프링이 안쪽 면(B)에 닿고, 전산볼트는 B 구멍을 뚫고 뒤로 나감",
      dims: [["폭", V.baseW, ["baseW"]], ["높이", V.bPlateH, []], ["두께", G.T, []]],
      holes: [["B 구멍 (관통)", `좌우 ${f(G.SLOT.w)} × 위아래 ${G.SLOT.h}, 중심 높이 ${f(G.SLOT.cy)}, 폭 가운데`, ["H"]]] },
    { no: 6, name: "O 받이", q: 2, what: `O핀을 받칠 기둥, 발판 양옆. 위는 O 구멍 중심으로 R${f(G.OPOST.r)} 반원`,
      dims: [["앞뒤", V.oPostW, ["oPostW"]], ["높이", G.OPOST.h, ["oPostW", "H"]], ["두께", G.T, []]],
      holes: [["O 구멍 Ø8.5", `밑에서 ${f(V.H)} (반원 중심). O핀이 이 구멍 안에서 돎`, ["H"]]] },
    { no: 7, name: "센서 받침", q: 1, what: "AS5600을 붙이는 판. O 받이 바깥, O핀 끝 자석과 마주 보게 받침판 위에 세움",
      dims: [["앞뒤", G.SENS.w, []], ["높이", G.SENS.h, ["H"]], ["두께", G.T, []]],
      holes: [["AS5600 자리", `밑에서 ${f(V.H)} (O와 같은 높이), 자석과 틈 ${AS.gap}`, ["H"]]] },
  ];
}
export function hardware(G) {
  const V = G.V;
  return [
    { name: "전산볼트", spec: `M8 ${G.ROD.len}mm`, q: 1, use: `막대 몸통 앞벽 가운데에 너트 2개로 고정 → 스프링 속 → B 구멍 → 뒤로 나감 (C에서 앞으로 ${f(G.ROD.out)})`, deps: [] },
    { name: "O핀", spec: `M8 전산볼트 ${up5(2 * G.OPIN_HALF)}mm`, q: 1, use: "O 받이–발판–O 받이", deps: ["gap"] },
    { name: "A핀", spec: `M8 전산볼트 ${up5(2 * G.APIN_HALF)}mm`, q: 1, use: "막대 몸통 옆벽–발판–옆벽", deps: ["gap"] },
    { name: "스프링", spec: "1.2×17.85×78.4", q: 1, use: `앞벽 C ↔ B 판 안쪽 면, ${f(V.springFree)} → ${f(V.springMin)}. 전산볼트가 속을 지남`, deps: [] },
    { name: "너트 M8", spec: "", q: 7, use: `전산볼트 3 (앞벽 안·밖 2, 뒤 끝 1 — B 판 뒷면에서 놓았을 때 멈춤) · O핀 2 · A핀 2`, deps: [] },
    { name: "와셔 17×1T", spec: "", q: 6, use: "전산볼트 2 (앞벽 안쪽 · 뒤 끝) · O핀 2 · A핀 2", deps: [] },
    { name: "AS5600", spec: "보드 23×23", q: 1, use: "센서 받침에 붙임. OUT → A0(액셀)·A1(브레이크), VCC 5V, GND", deps: [] },
    { name: "자석", spec: "Ø6×2.5 지름 방향", q: 1, use: "O핀 바깥 끝면 가운데에 붙임", deps: [] },
    { name: "피스 6×25", spec: "", q: 13, use: "받침판→O 받이 4 · 받침판→B 판 3 · 앞벽→옆벽 4 · 받침판→센서 받침 2", deps: [] },
  ];
}
export const FEATURES = [
  ["B 구멍", "B 판을 뚫은 위아래로 긴 구멍. 전산볼트가 기울며 지나감"],
  ["U 안쪽", "막대 몸통 옆벽 사이, 발판이 들어가는 틈"],
  ["둥근 끝", "막대 몸통 옆벽 A 쪽 끝 · O 받이 위"],
];
export const POINTS = [
  ["O", "발판 아래 회전 중심"], ["A", "A핀 중심 (발판 위, OA)"], ["B", "B 판 안쪽 면, B 구멍 가운데 = 스프링 끝 (O와 같은 높이)"],
  ["C", "막대 몸통 앞벽 바깥 면 가운데 = 스프링 시작 · 전산볼트 구멍"], ["D · E", "앞벽 안쪽 면 위·아래 끝 (DE = 막대 높이)"], ["P", "발판의 B 쪽 면 (OA에서 15)"], ["Q", "앞벽 안쪽 면 줄 (C에서 15)"],
];
export const f = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
export { NUT, WASH };
