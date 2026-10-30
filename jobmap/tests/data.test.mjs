// 데이터 무결성: 문항 구성, id·key, 끌림 방향, 우리 말(5차), 출처, 학과 paths·사례, 2024년 이전 연도(C5), 직무 쏠림(M6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load, scripts } from "./load.mjs";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { get } = load(DIR);
const D = get("D"), Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT"), compute = get("compute"), urls = get("urls");
const AREAS = Q.areas.map((x) => x.id);
const yearOf = (s) => +(String(s ?? "").match(/20\d\d/) || [0])[0];

// D 안의 모든 문자열을 [경로, 값]으로
const strings = (o, p = "D", out = []) => {
  if (typeof o === "string") out.push([p, o]);
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) strings(v, `${p}.${k}`, out);
  return out;
};
// D 안의 모든 객체
const objects = (o, p = "D", out = []) => {
  if (o && typeof o === "object") { out.push([p, o]); for (const [k, v] of Object.entries(o)) objects(v, `${p}.${k}`, out); }
  return out;
};

test("index.html의 script가 모두 있고 load.mjs가 그 순서로 읽는다", () => {
  const list = scripts(DIR);
  assert.ok(list.length > 0);
  for (const f of list) assert.ok(existsSync(join(DIR, f)), f);
  assert.ok(list.indexOf("quiz-ui.js") > list.indexOf("app.js"), "app.js가 quiz-ui.js보다 먼저다");
});

test("문항 구성: 영역마다 흥미 문항 수가 같고, 준비 영역마다 문항 수가 같고, total()이 합과 같다", () => {
  const per = AREAS.map((x) => Q.interest.items.filter((it) => it.id[0] === x).length);
  assert.ok(per[0] > 0 && per.every((n) => n === per[0]), per.join(","));
  assert.equal(per.reduce((s, n) => s + n, 0), Q.interest.items.length);
  const groups = Q.ready.groups.map((g) => g.items.length);
  assert.ok(groups[0] > 0 && groups.every((n) => n === groups[0]), groups.join(","));
  assert.equal(LIKERT.length, Q.interest.items.length + Q.readyItems.length);
  qa.a = {};
  assert.equal(get("total()"), Q.basics.length + LIKERT.length + Q.pairs.length + 1);
});

test("문항 id 중복 없음, 흥미 문항 id 첫 글자가 영역 id", () => {
  const ids = LIKERT.map((it) => it.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const it of Q.interest.items) assert.ok(AREAS.includes(it.id[0]), it.id);
});

test("직무 key 중복 없음, 끌림 방향(riasec) 형식, O*NET 주소 형식", () => {
  const keys = D.jobs.map((j) => j.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const j of D.jobs) {
    assert.match(j.riasec || "", /^[RIASEC]{1,3}$/, j.key);
    assert.equal(new Set(j.riasec).size, j.riasec.length, `${j.key}: 글자 중복`);
    assert.match(j.onet || "", /^https:\/\/www\.onetonline\.org\/link\/summary\/\d{2}-\d{4}\.\d{2}$/, j.key);
  }
});

// 5차: 기존 검사 이름·꼴을 화면 글에 쓰지 않는다. 문항은 짧게(고객이 좋아함)
test("화면 글에 기존 검사 이름(○○형·홀랜드·RIASEC·흥미 코드·육각형)이 없다", () => {
  const bad = strings(D).filter(([, s]) => /(현실|탐구|예술|사회|진취|기업|관습)형|홀랜드|RIASEC|흥미 ?코드|육각형/i.test(s)).map(([p, s]) => `${p}: ${s.slice(0, 40)}`);
  assert.deepEqual(bad, []);
});

test("끌림 6방향: 이름·한 줄·일상 예시가 있고 '○○형'이 아니다", () => {
  assert.equal(AREAS.join(""), "RIASEC");
  for (const x of Q.areas) {
    for (const k of ["name", "short", "desc", "line"]) assert.ok(typeof x[k] === "string" && x[k].trim(), `${x.id}.${k}`);
    assert.ok(!/형$/.test(x.name), x.name);
    assert.ok(Array.isArray(x.daily) && x.daily.length >= 2 && x.daily.every((t) => t.trim()), `${x.id}.daily`);
  }
  assert.equal(new Set(Q.areas.map((x) => x.name)).size, Q.areas.length);
});

test("문항 길이: 이럴 때 20자, 요즘 나 24자 이하", () => {
  for (const it of Q.interest.items) assert.ok([...it.q].length <= 20, it.q);
  for (const it of Q.readyItems) assert.ok([...it.q].length <= 24, it.q);
});

test("챕터 안내: 묶음 순서대로 있고 '· N개/번'이 실제 문항 수와 같다", () => {
  assert.equal(Q.chapters.map((c) => c.id).join(), "basics,interest,ready,values,sector");
  const n = { basics: Q.basics.length, interest: Q.interest.items.length, ready: Q.readyItems.length, values: Q.pairs.length, sector: 1 };
  for (const c of Q.chapters) {
    assert.ok(c.tag && c.title && c.line, c.id);
    const m = c.line.match(/· (\d+)(개|번)$/);
    if (m) assert.equal(+m[1], n[c.id], c.id);
  }
});

test("jobAlias·jobExclude의 key가 모두 실제 직무 key", () => {
  const keys = new Set(D.jobs.map((j) => j.key));
  for (const k of [...Object.keys(Q.jobAlias), ...Object.keys(Q.jobExclude)]) assert.ok(keys.has(k), k);
});

test("출처 필드가 모두 urls()로 http(s) 또는 ../ 주소로 풀린다", () => {
  const raw = [];
  for (const [p, o] of objects(D)) for (const [k, v] of Object.entries(o)) {
    if (!/source|url|onet/i.test(k)) continue;
    if (typeof v === "string") raw.push([`${p}.${k}`, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => typeof x === "string" && raw.push([`${p}.${k}.${i}`, x]));
  }
  assert.ok(raw.length > 0);
  for (const [p, v] of raw) {
    if (!v || v.startsWith("#")) continue;
    const u = urls(v);
    assert.ok(u.length > 0, `${p}: ${v}`);
    for (const x of u) assert.ok(/^https?:\/\/\S+$/.test(x) || x.startsWith("../"), `${p}: ${x}`);
  }
  assert.ok(typeof D.checked === "string" && D.checked.trim(), "D.checked가 비었다");
});

test("학과: paths k는 1 이상 uni.n 이하, 사례 date는 2024년 이후", () => {
  for (const d of D.depts) {
    for (const p of d.paths || []) assert.ok(Number.isInteger(p.k) && p.k >= 1 && p.k <= d.uni.n, `${d.id} ${p.name} ${p.k}/${d.uni?.n}`);
    for (const c of d.cases || []) assert.ok(yearOf(c.date) >= 2024, `${d.id} ${c.to} ${c.date}`);
  }
});

// 4차 C4: '2022~2024년'처럼 물결로 시작하는 기간도 잡는다
test("C5: 본문의 2010~2023년 표기(년·~)는 예외 목록에 있는 것만", () => {
  const ex = JSON.parse(readFileSync(new URL("./year-exceptions.json", import.meta.url), "utf8"));
  const bad = [];
  for (const [p, s] of strings(D)) for (const m of s.matchAll(/20(1\d|2[0-3])(년|~)/g))
    if (!ex.some((e) => s.includes(e.text) && e.text.includes(m[0]))) bad.push(`${p}: …${s.slice(Math.max(0, m.index - 15), m.index + 20)}…`);
  assert.deepEqual(bad, []);
});

test("C5: new 표시가 있는 항목은 date(2024년 이후)가 필수", () => {
  const bad = objects(D).filter(([, o]) => o.new).filter(([, o]) => !/^20\d\d-\d\d/.test(o.date || "") || yearOf(o.date) < 2024).map(([p, o]) => `${p}: ${o.date}`);
  assert.deepEqual(bad, []);
});

test("C5: 기존 ai·facts 항목에 날짜 표기가 있으면 2024년 이후", (t) => {
  const items = [
    ...D.jobs.flatMap((j) => [...(j.facts || []).map((f, i) => [`jobs.${j.key}.facts.${i}`, f]), ...(j.ai ? [[`jobs.${j.key}.ai`, j.ai]] : [])]),
    ...((D.aiInfo || {}).stats || []).map((s, i) => [`aiInfo.stats.${i}`, s]),
    ...((D.aiInfo || {}).parts || []).flatMap((p) => [...(p.rows || []), ...(p.cards || [])].map((r, i) => [`aiInfo.${p.id}.${i}`, r]))
  ];
  let unmarked = 0;
  const bad = [];
  for (const [p, it] of items) {
    const text = Object.values(it).filter((v) => typeof v === "string").join(" ");
    const years = [...text.matchAll(/(20\d\d)-(0[1-9]|1[0-2])\b/g)].map((m) => +m[1]);
    if (it.date) years.push(yearOf(it.date));
    if (!years.length) unmarked++;
    else if (Math.max(...years) < 2024) bad.push(`${p}: ${years.join(",")}`);
  }
  t.diagnostic(`ai·facts ${items.length}개 중 (20YY-MM)·date 표기 없음 ${unmarked}개(연도 grep으로만 검사)`);
  assert.deepEqual(bad, []);
});

// M6: 한 영역만 높게 답해도 그 영역 직무가 top3에 모두 나와야 한다
const pure = (X) => {
  const a = { school: "ssu", dept: "aisw", year: Q.basics.find((q) => q.id === "year").options[1] };
  Q.interest.items.forEach((it) => (a[it.id] = it.id[0] === X ? 5 : 1));
  Q.readyItems.forEach((it) => (a[it.id] = 3));
  return compute(a, ["big"], Object.fromEntries(Q.pairs.map((_, k) => [k, 0])));
};

test("M6 ①: 6영역 각각에 첫 글자가 그 영역이고 코드가 서로 다른 직무가 3개 이상", () => {
  for (const X of AREAS) {
    const codes = new Set(D.jobs.filter((j) => j.riasec?.[0] === X).map((j) => j.riasec));
    assert.ok(codes.size >= 3, `${X}: ${[...codes].join(",")}`);
  }
});

test("M6 ②: X 흥미만 5일 때 top3 첫 글자가 모두 X", () => {
  for (const X of AREAS) {
    const r = pure(X);
    assert.ok(r.top3.every((t) => t.job.riasec[0] === X), `${X}: ${r.top3.map((t) => t.job.riasec).join(",")}`);
  }
});
