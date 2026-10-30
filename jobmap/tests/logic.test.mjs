// compute(), 동점, 짧은 코드, 가치 짝, 결과 링크 왕복·거부, 다른 학교 단계.
// 직무 수·문항 수·near 순서는 데이터에서 계산한다(B7). 화면 문구에는 단정하지 않는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load.mjs";

const { get, els } = load(process.env.JOBMAP_DIR);
const D = get("D"), Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT");
const compute = get("compute"), steps = get("steps"), total = get("total"), showShared = get("showShared");
const rnd = (n) => 1 + Math.floor(Math.random() * n);
const AREAS = Q.areas.map((x) => x.id);
const answers = (f) => Object.fromEntries(LIKERT.map((it) => [it.id, f(it)]));
const isInterest = (it) => Q.interest.items.includes(it);
const allPairs = (v) => Object.fromEntries(Q.pairs.map((_, k) => [k, v]));
const scoreOf = (riasec, code) => {
  const mean = AREAS.reduce((s, x) => s + riasec[x], 0) / AREAS.length;
  return Math.round([3, 2, 1].reduce((s, w, k) => s + w * (code[k] ? riasec[code[k]] : mean), 0) / 6);
};

test("점수 변환: 흥미 모두 1이면 0, 모두 5면 100, C만 5면 C 100·나머지 0", () => {
  const base = { school: "ssu" };
  assert.ok(AREAS.every((x) => compute({ ...base, ...answers(() => 1) }, [], {}).riasec[x] === 0));
  assert.ok(AREAS.every((x) => compute({ ...base, ...answers(() => 5) }, [], {}).riasec[x] === 100));
  const r = compute({ ...base, ...answers((it) => (isInterest(it) && it.id[0] === "C" ? 5 : 1)) }, [], {});
  assert.deepEqual(AREAS.map((x) => r.riasec[x]), AREAS.map((x) => (x === "C" ? 100 : 0)));
});

test("C만 5일 때 ncs 58점, civil 53점", () => {
  const r = compute({ school: "ssu", ...answers((it) => (isInterest(it) && it.id[0] === "C" ? 5 : 1)) }, [], {});
  assert.equal(r.fit.ncs, 58);
  assert.equal(r.fit.civil, 53);
});

test("짧은 코드(1~2글자)는 빈 자리를 내 평균으로 채운다", () => {
  const short = D.jobs.filter((j) => j.riasec && j.riasec.length < 3);
  assert.ok(short.length > 0, "짧은 코드 직무가 없다");
  for (let n = 0; n < 100; n++) {
    const r = compute({ school: "ssu", ...answers(() => rnd(5)) }, [], {});
    for (const j of D.jobs.filter((x) => x.riasec)) assert.equal(r.fit[j.key], scoreOf(r.riasec, j.riasec), j.key);
  }
});

test("top3는 항상 3개이고 흥미 코드가 서로 다르다. 같은 코드 직무는 alike로 붙는다", () => {
  for (let n = 0; n < 300; n++) {
    const bias = Math.random() < 0.3 ? rnd(5) : 0;
    const r = compute({ school: "ssu", ...answers(() => bias || rnd(5)) }, [], {});
    assert.equal(r.top3.length, 3);
    assert.equal(new Set(r.top3.map((t) => t.job.riasec)).size, 3);
    for (const t of r.top3) assert.ok(t.alike.every((j) => j.riasec === t.job.riasec));
  }
});

test("모두 3이면 모든 직무가 50점이고 flat", () => {
  const r = compute({ school: "ssu", ...answers(() => 3) }, [], {});
  assert.equal(r.fits.length, D.jobs.filter((j) => j.riasec).length);
  assert.ok(r.fits.every((f) => f.score === 50));
  assert.equal(r.flat, true);
});

test("동점이면 내 학과 졸업생 진로(near) 직무가 앞선다", () => {
  for (const d of D.depts) {
    const r = compute({ school: "ssu", dept: d.id, ...answers(() => 3) }, [], {});
    const want = (job) => ((d.paths || []).some((p) => job.alias.some((al) => p.name.includes(al))
      && !(Q.jobExclude[job.key] || []).some((x) => p.name.includes(x)) && !(job.key === "ncs" && d.college === "공과대학")) ? 1 : 0);
    const near = [...r.fits].map((f) => f.near);  // vm 배열은 프로토타입이 달라 node 배열로 바꿔 비교한다
    assert.deepEqual(near, [...r.fits].map((f) => want(f.job)), d.id);
    assert.deepEqual(near, [...near].sort((x, y) => y - x), `${d.id}: near 직무가 뒤에 있다`);
    if (near[0]) assert.equal(r.top3[0].near, 1, d.id);
  }
});

test("가치 짝은 4개 가치의 모든 조합이다", () => {
  const ids = Q.values.map((v) => v.id);
  const want = ids.flatMap((x, i) => ids.slice(i + 1).map((y) => [x, y].sort().join("|"))).sort();
  assert.deepEqual(Q.pairs.map((p) => [...p].sort().join("|")).sort(), want);
});

test("짝을 모두 고르면 이긴 횟수 합이 짝 수와 같다", () => {
  for (let n = 0; n < 50; n++) {
    const r = compute({ school: "ssu", ...answers(() => 3) }, [], Object.fromEntries(Q.pairs.map((_, k) => [k, rnd(2) - 1])));
    assert.equal(Object.values(r.wins).reduce((s, x) => s + x, 0), Q.pairs.length);
  }
});

test("결과 링크: 무작위 500세트 encode → showShared 왕복", () => {
  const depts = [...D.depts.map((d) => d.id), "none", undefined];
  const years = Q.basics.find((q) => q.id === "year").options;
  for (let n = 0; n < 500; n++) {
    const school = Math.random() < 0.8 ? "ssu" : "etc";
    const a = { school, year: years[rnd(years.length) - 1], ...answers(() => rnd(5)), note: "고민" };
    if (school === "ssu" && (a.dept = depts[rnd(depts.length) - 1]) === undefined) delete a.dept;
    const sector = Q.sectors.options.map((o) => o.v).filter((v) => v !== "unsure" && Math.random() < 0.25);
    if (!sector.length) sector.push("unsure");
    const pairs = Object.fromEntries(Q.pairs.map((_, k) => [k, rnd(2) - 1]));
    Object.assign(qa, { a: { ...a }, sector: [...sector], pairs: { ...pairs } });
    const code = get("encode()");
    qa.a = {}; qa.sector = []; qa.pairs = {};
    showShared(code);
    const msg = `${code} ${JSON.stringify({ s: a.school, d: a.dept, y: a.year })}`;
    assert.ok(LIKERT.every((it) => qa.a[it.id] === a[it.id]), msg);
    assert.deepEqual([qa.a.school, qa.a.dept, qa.a.year], [a.school, a.dept, a.year], msg);
    assert.deepEqual([...qa.sector].sort(), [...sector].sort(), msg);
    assert.ok(Q.pairs.every((_, k) => qa.pairs[k] === pairs[k]), msg);
    assert.equal(qa.a.note, undefined, "고민 글이 링크에 들어갔다");
  }
});

test("결과 링크 거부 6종: 빈 값, '1', 버전 3, 자릿수 부족, 숫자 6, 짝 비트 4자리", () => {
  const ok = (likert = "3".repeat(LIKERT.length), pairs = "0".repeat(Q.pairs.length), ver = "1") => [ver, "ssu", "-", "2", likert, pairs, "0"].join(".");
  const bad = ["", "1", ok(undefined, undefined, "3"), ok("3".repeat(LIKERT.length - 1)), ok("6" + "3".repeat(LIKERT.length - 1)), ok(undefined, "0102")];
  for (const code of bad) {
    els["v-test"].innerHTML = "";
    qa.shared = false;
    showShared(code);
    const html = els["v-test"].innerHTML;
    assert.ok(html.length > 0, `${JSON.stringify(code)}: 화면을 그리지 않았다`);
    assert.ok(!/class="[^"]*\bresult\b/.test(html), `${JSON.stringify(code)}: 결과를 그렸다`);
    assert.notEqual(qa.shared, true, `${JSON.stringify(code)}: 공유 결과로 받아들였다`);
  }
});

// 4차 결정 9: 다른 학교도 전공 문항(전공 8 + '비슷한 전공이 없어요')을 묻는다. 예전 기대값 '학과 단계 없음·한 문항 적다'를 바꿨다(개발 부장 승인, T19 작업 기록)
test("다른 학교도 학과(전공) 단계가 있고 total()이 같다(4차 결정 9)", () => {
  const deptQ = Q.basics.find((q) => q.id === "dept");
  const has = () => steps().some((s) => Object.values(s).includes(deptQ));
  qa.a = { school: "ssu" };
  assert.ok(has(), "숭실대인데 학과 단계가 없다");
  const nSsu = steps().length;
  assert.equal(total(), Q.basics.length + LIKERT.length + Q.pairs.length + 1);
  qa.a = { school: "etc" };
  assert.ok(has(), "다른 학교인데 전공 단계가 없다");
  assert.equal(steps().length, nSsu);
  assert.equal(total(), Q.basics.length + LIKERT.length + Q.pairs.length + 1);
});
