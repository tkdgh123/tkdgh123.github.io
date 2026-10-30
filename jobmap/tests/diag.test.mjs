// 진단 규칙: 규칙별 켜짐·꺼짐 경계, 무작위 ctx 예외, why 문자열, id 중복, steps url 형식.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load.mjs";

const { get } = load(process.env.JOBMAP_DIR);
const D = get("D"), Q = get("Q"), LIKERT = get("LIKERT"), compute = get("compute");
const rule = Object.fromEntries(D.diag.map((x) => [x.id, x]));
const rnd = (n) => 1 + Math.floor(Math.random() * n);

// 아무 규칙도 켜지지 않는 중간값 ctx에 바꿀 칸만 덮는다
const ctx = ({ ready = {}, ...p } = {}) => ({
  ...Object.fromEntries(LIKERT.map((it) => [it.id, 3])), school: "ssu", yearN: 2, dept: undefined, sector: ["mid"],
  fit: {}, fitMean: 50, top: [], ...p, ready: { ...Object.fromEntries(Q.ready.groups.map((g) => [g.id, 3])), ...ready }
});

// [규칙 id, 입력, 켜짐 기대]
const TABLE = [
  ["mind-care", { m4: 2 }, true], ["mind-care", { ready: { mind: 2 } }, true], ["mind-care", { m4: 3, ready: { mind: 2.25 } }, false],
  ["exp-first", { yearN: 3, ready: { exp: 2 } }, true], ["exp-first", { yearN: 3, ready: { exp: 2.25 } }, false], ["exp-first", { yearN: 2, ready: { exp: 2 } }, false],
  ["exp-start", { yearN: 2, ready: { exp: 2 } }, true], ["exp-start", { yearN: 2, ready: { exp: 2.25 } }, false], ["exp-start", { yearN: 3, ready: { exp: 2 } }, false],
  ["exp-reframe", { ready: { exp: 2.25 }, x3: 2 }, true], ["exp-reframe", { ready: { exp: 2.25 }, x3: 3 }, false], ["exp-reframe", { ready: { exp: 2 }, x3: 2 }, false],
  ["goal-explore", { yearN: 1, ready: { plan: 2 } }, true], ["goal-explore", { yearN: 2, n1: 2 }, true], ["goal-explore", { yearN: 2, ready: { plan: 2.25 } }, false], ["goal-explore", { yearN: 3, ready: { plan: 2 } }, false],
  ["goal-narrow", { yearN: 3, ready: { plan: 2 } }, true], ["goal-narrow", { yearN: 4, n1: 2 }, true], ["goal-narrow", { yearN: 3, ready: { plan: 2.25 } }, false], ["goal-narrow", { yearN: 2, ready: { plan: 2 } }, false],
  ["lang-speaking", { sector: ["big", "mid"] }, true], ["lang-speaking", { sector: ["foreign"] }, true], ["lang-speaking", { sector: ["mid"] }, false],
  ["public-ncs", { sector: ["public"] }, true], ["public-ncs", { sector: ["gov"] }, false],
  ["civil-exam", { sector: ["gov"] }, true], ["civil-exam", { sector: ["public"] }, false],
  ["data-cert", { top: ["data"] }, true], ["data-cert", { dept: "math", fit: { data: 50 }, fitMean: 50 }, true], ["data-cert", { dept: "math", fit: { data: 49 }, fitMean: 50 }, false],
  ["dev-market", { dept: "aisw" }, true], ["dev-market", { top: ["sw"] }, true], ["dev-market", { dept: "biz" }, false],
  ["senior-passive", { yearN: 4, ready: { plan: 2 } }, true], ["senior-passive", { yearN: 4, ready: { plan: 2.25 } }, false], ["senior-passive", { yearN: 3, ready: { plan: 2 } }, false],
  ["big-only", { sector: ["big"] }, true], ["big-only", { sector: ["big", "mid"] }, false],
  ["ai-start", { ready: { ai: 2.5 } }, true], ["ai-start", { ready: { ai: 2.75 } }, false],
  ["ai-show", { ready: { ai: 4 } }, true], ["ai-show", { ready: { ai: 3.75 } }, false],
  ["grad", { sector: ["grad"] }, true], ["grad", { sector: ["mid"] }, false]
];

test("규칙별 경계표", () => {
  assert.deepEqual([...new Set(TABLE.map((r) => r[0]))].sort(), Object.keys(rule).sort(), "경계표와 규칙 목록이 다르다");
  for (const [id, p, want] of TABLE) assert.equal(!!rule[id].when(ctx(p)), want, `${id} ${JSON.stringify(p)}`);
});

test("무작위 1000개 ctx에서 when·why가 예외 없이 동작하고 why에 undefined·NaN이 없다", () => {
  const depts = [...D.depts.map((d) => d.id), "none", undefined];
  const years = Q.basics.find((q) => q.id === "year").options;
  for (let n = 0; n < 1000; n++) {
    const a = { school: Math.random() < 0.8 ? "ssu" : "etc", year: years[rnd(years.length) - 1], dept: depts[rnd(depts.length) - 1] };
    const bias = Math.random() < 0.3 ? rnd(5) : 0;
    LIKERT.forEach((it) => (a[it.id] = bias || rnd(5)));
    const sector = Q.sectors.options.map((o) => o.v).filter(() => Math.random() < 0.25);
    const r = compute(a, sector, Object.fromEntries(Q.pairs.map((_, k) => [k, rnd(2) - 1])));
    const c = { ...a, yearN: parseInt(a.year) || 1, sector, ready: r.ready, fit: r.fit, fitMean: r.fitMean, top: r.top };
    for (const x of D.diag) {
      if (!x.when(c)) continue;
      const why = typeof x.why === "function" ? x.why(c) : x.why;
      assert.equal(typeof why, "string", x.id);
      assert.ok(!/undefined|NaN/.test(why), `${x.id}: ${why}`);
    }
  }
});

test("진단 id 중복 없음", () => {
  const ids = D.diag.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("steps url은 http(s) 또는 #앵커(없으면 null)", () => {
  for (const x of D.diag) for (const s of x.steps || [])
    assert.ok(s.url == null || /^https?:\/\/\S+$/.test(s.url) || /^#\S+$/.test(s.url), `${x.id}: ${s.url}`);
});
