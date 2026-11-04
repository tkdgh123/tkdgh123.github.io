// 부품 이름·조각 크기·철물. 모두 geo.js build() 결과로 계산한다.
import { NUT, WASH } from "./geo.js";

const up5 = v => Math.ceil(v / 5) * 5;
// 조각: dims = [[이름, 값, 의존하는 입력키들]], holes = 구멍 설명
export function pieces(G) {
  const V = G.V;
  return [
    { no: 1, name: "받침판", q: 1, what: "바닥판. 뒤쪽에 O 받이, 앞 끝에 B 판",
      dims: [["길이", G.BASE.len, []], ["폭", V.baseW, ["baseW"]], ["두께", G.T, []]],
      holes: [["O 받이 자리", `뒤 끝에서 ${f(V.rear)} (O 중심)`, ["slotDepth"]]] },
    { no: 2, name: "발판", q: 1, what: "15T 한 장을 30 폭으로 켠 막대. 아래 끝에 O, 그 위 OA에 A",
      dims: [["길이", V.pedalLen, []], ["폭", V.pedalDepth, []], ["두께", V.pedalT, []]],
      holes: [["O 구멍 Ø8.5", `아래 끝에서 ${f(V.oFromEnd)}, 폭 가운데`, []], ["A 구멍 Ø8.5", `아래 끝에서 ${f(V.oFromEnd + G.OA)} (OA ${f(G.OA)})`, []]] },
    { no: 3, name: "막대 몸통 옆벽", q: 2, what: "U의 양 팔. 발판 양옆에 틈을 두고 A핀으로 걸림",
      dims: [["길이", G.BOX.back + G.S - G.T, ["boxBack"]], ["높이", V.boxH, []], ["두께", G.T, []]],
      holes: [["A 구멍 Ø8.5", `뒤 끝에서 ${f(G.BOX.back)}, 높이 가운데`, ["boxBack"]]] },
    { no: 4, name: "막대 몸통 앞벽", q: 1, what: "U의 바닥. 바깥 면 가운데가 C(스프링 자리), 안쪽 면이 DE",
      dims: [["폭", G.BOX.inner + 2 * G.T, ["gap"]], ["높이", V.boxH, []], ["두께", G.T, []]] },
    { no: 5, name: "B 판", q: 1, what: "받침판 앞 끝에 세운 판. 스프링 끝이 B 구멍에 들어감",
      dims: [["폭", V.baseW, ["baseW"]], ["높이", V.bPlateH, []], ["두께", G.T, []]],
      holes: [["B 구멍 (막힌 구멍)", `좌우 ${f(G.SLOT.w)}(스프링 지름) × 위아래 ${G.SLOT.h} × 깊이 ${f(V.slotDepth)}, 중심 높이 ${f(G.SLOT.cy)}`, ["slotDepth", "H"]]] },
    { no: 6, name: "O 받이", q: 2, what: "스케치에 없지만 O핀을 받칠 기둥. 발판 양옆",
      dims: [["앞뒤", V.oPostW, ["oPostW"]], ["높이", V.oPostH, ["oPostH"]], ["두께", G.T, []]],
      holes: [["O 구멍 Ø8.5", `높이 ${f(V.H)}`, ["H"]]] },
  ];
}
export function hardware(G) {
  return [
    { name: "O핀", spec: `M8 전산볼트 ${up5(2 * G.OPIN_HALF)}mm`, q: 1, use: "O 받이–발판–O 받이", deps: ["gap"] },
    { name: "A핀", spec: `M8 전산볼트 ${up5(2 * G.APIN_HALF)}mm`, q: 1, use: "막대 몸통 옆벽–발판–옆벽", deps: ["gap"] },
    { name: "스프링", spec: "1.2×17.85×78.4", q: 1, use: `막대 몸통 앞벽 C ↔ B 구멍 바닥, ${f(G.V.springFree)} → ${f(G.V.springMin)}`, deps: [] },
    { name: "너트 M8", spec: "", q: 4, use: "O핀 2 · A핀 2", deps: [] },
    { name: "와셔 17×1T", spec: "", q: 4, use: "O핀 2 · A핀 2", deps: [] },
    { name: "피스 6×25", spec: "", q: 11, use: "받침판→O 받이 4 · 받침판→B 판 3 · 앞벽→옆벽 4", deps: [] },
  ];
}
export const FEATURES = [
  ["B 구멍", "B 판 안쪽 면의 위아래로 긴 막힌 구멍. 바닥이 B"],
  ["U 안쪽", "막대 몸통 옆벽 사이, 발판이 들어가는 틈"],
];
export const POINTS = [
  ["O", "발판 아래 회전 중심"], ["A", "A핀 중심 (발판 위, OA)"], ["B", "B 구멍 바닥 가운데 = 스프링 끝 (O와 같은 높이)"],
  ["C", "막대 몸통 앞벽 바깥 면 가운데 = 스프링 시작"], ["D · E", "앞벽 안쪽 면 위·아래 끝 (DE = 막대 높이)"], ["P", "발판의 B 쪽 면 (OA에서 15)"], ["Q", "앞벽 안쪽 면 줄 (C에서 15)"],
];
export const f = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
export { NUT, WASH };
