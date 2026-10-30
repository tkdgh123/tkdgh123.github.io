// 검사 흐름(T07): 진입점, 단계 수, 결과 링크 검증, 동점, 실패 화면, history 회차.
// 문항 수·직무 수는 데이터에서 계산한다(B7).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "./load.mjs";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { get, els } = load(process.env.JOBMAP_DIR);
const D = get("D"), Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT");
const steps = get("steps"), compute = get("compute"), parseCode = get("parseCode"), showShared = get("showShared");
const rnd = (n) => 1 + Math.floor(Math.random() * n);
const code = (o = {}) => ["1", "ssu", "-", "2", "3".repeat(LIKERT.length), "0".repeat(Q.pairs.length), "1"].map((x, k) => o[k] ?? x).join(".");

test("drawTest가 전역 함수이고 index.html이 'drawTest(); route();'를 부른다", () => {
  assert.equal(get("typeof drawTest"), "function");
  assert.ok(readFileSync(join(DIR, "index.html"), "utf8").includes("drawTest(); route();"));
});

// 4차 결정 9: 다른 학교도 전공 문항을 묻는다. 예전 기대값 '다른 학교는 1 적다'를 '같다'로 바꿨다(개발 부장 승인, T19 작업 기록)
test("한 단계 한 질문: 숭실대는 기본 3 + 리커트 + 짝 + 2, 다른 학교도 같다(4차 결정 9)", () => {
  qa.a = { school: "ssu" };
  const n = Q.basics.length + LIKERT.length + Q.pairs.length + 2;
  assert.equal(steps().length, n);
  const lk = [...steps()].filter((s) => s.kind === "likert");
  assert.equal(lk.length, LIKERT.length);
  assert.deepEqual(lk.map((s) => s.it.id), [...LIKERT].map((it) => it.id));
  qa.a = { school: "etc" };
  assert.equal(steps().length, n);
});

test("결과 링크: 무작위 300세트 encode → parseCode 왕복", () => {
  const depts = [...D.depts.map((d) => d.id), "none", undefined];
  for (let n = 0; n < 300; n++) {
    const school = Math.random() < 0.8 ? "ssu" : "etc", year = rnd(4);
    const a = Object.fromEntries(LIKERT.map((it) => [it.id, rnd(5)]));
    const dept = school === "ssu" ? depts[rnd(depts.length) - 1] : undefined;
    const sector = Math.random() < 0.2 ? ["unsure"] : Q.sectors.options.map((o) => o.v).filter((v) => v !== "unsure" && Math.random() < 0.3);
    const pairs = Object.fromEntries(Q.pairs.map((_, k) => [k, rnd(2) - 1]));
    Object.assign(qa, { a: { ...a, school, year: Q.basics.find((q) => q.id === "year").options[year - 1], ...(dept ? { dept } : {}) }, sector: [...sector], pairs: { ...pairs } });
    const c = get("encode()"), r = parseCode(c);
    assert.ok(r, c);
    assert.deepEqual([r.school, r.dept, r.year], [school, dept, year], c);
    assert.ok(LIKERT.every((it) => r.a[it.id] === a[it.id]), c);
    assert.ok(Q.pairs.every((_, k) => r.pairs[k] === pairs[k]), c);
    assert.deepEqual([...r.sector].sort(), [...sector].sort(), c);
  }
});

test("메신저가 바꾼 링크(%2E, &fbclid)도 읽는다", () => {
  const c = code();
  assert.ok(parseCode(c.replace(/\./g, "%2E")));
  assert.ok(parseCode(c + "&fbclid=x"));
});

test("잘못된 링크는 거부한다", () => {
  const bad = { "학교 <x>": code({ 1: "<x>" }), "학년 x": code({ 3: "x" }), "학년 5": code({ 3: "5" }), "mask zz": code({ 6: "zz" }),
    "리커트 하나 모자람": code({ 4: "3".repeat(LIKERT.length - 1) }), "짝 0102": code({ 5: "0102" }) };
  for (const [k, c] of Object.entries(bad)) assert.equal(parseCode(c), null, k);
});

test("모두 3이면 3위와 같은 점수로 안 보이는 직무 수 tieMore = 직무 수 − 3 − 비슷한 직무 합", () => {
  const r = compute({ school: "ssu", ...Object.fromEntries(LIKERT.map((it) => [it.id, 3])) }, [], {});
  assert.equal(r.tieMore, D.jobs.length - 3 - r.top3.reduce((s, t) => s + t.alike.length, 0));
});

test("잘못된 링크로 열면 '읽지 못했어요'와 시작 버튼을 그린다", () => {
  els["v-test"].innerHTML = "";
  showShared("2.ssu");
  const html = els["v-test"].innerHTML;
  assert.match(html, /읽지 못했어요/);
  assert.match(html, /data-start/);
  assert.equal(qa.fail, true);
});

test("다른 회차의 history 항목으로 돌아오면 시작 전 화면이다", () => {
  Object.assign(qa, { i: 5, a: { school: "ssu" } });
  get("onPop")({ state: { q: 3, run: -1 } });
  assert.equal(qa.i, -1);
  assert.deepEqual({ ...qa.a }, {});
});

// 5차: 장이 바뀌는 첫 단계 앞에 장 안내(qa.chap)를 한 번 끼운다. 단계 수·history는 그대로, 뒤로 갈 땐 없고 같은 회차엔 다시 안 나온다
test("장 안내: 앞으로 갈 때 장마다 한 번(흥미·준비 상태·짝·끌리는 곳), 뒤로·다시 앞으로는 없음. 진행 막대 칸 = 장별 문항 수", async () => {
  const go = get("go");
  get("reset")();
  Object.assign(qa, { i: 0, a: { school: "ssu" } });
  const ss = steps(), want = [...ss.keys()].filter((k) => k && ss[k].ch !== ss[k - 1].ch).map((k) => [k, ss[k].ch]), got = [];
  for (let k = 1; k < ss.length; k++) { await go(k, false); if (qa.chap) got.push([k, qa.chap]); }
  assert.deepEqual(got, want);
  assert.deepEqual(want.map(([, c]) => c), [1, 2, 3, 4]);
  const k2 = want[1][0];
  await go(k2 - 1, false);
  await go(k2, false);
  assert.equal(qa.chap, 0, "같은 회차에 장 안내가 다시 나왔다");
  assert.deepEqual([...get("parts")()].map((p) => p.length), [Q.basics.length, Q.interest.items.length, LIKERT.length - Q.interest.items.length, Q.pairs.length, 1]);
});
