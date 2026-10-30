// 결과 신뢰(4차 결정 1·2·3·31·32): 회귀 R1~R4는 지금 초록, B1~B10·N-b는 T13·T17 뒤 초록.
// testResult()를 직접 불러 HTML을 작은 트리로 읽는다. 난수는 시드 고정이라 실패가 늘 같은 세트에서 나온다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "./load.mjs";

export const SSU_RE = /숭실|슈패스|SSU|ssu\.ac\.kr|504호|학생회관/;

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { get } = load(DIR);
const D = get("D"), Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT"), testResult = get("testResult");
const years = Q.basics.find((q) => q.id === "year").options;
const SECTORS = Q.sectors.options.map((o) => o.v).filter((v) => v !== "unsure");
const MIND = Q.ready.groups.find((g) => g.id === "mind").items;

// ---------- 작은 HTML 트리 ----------
const VOID = new Set(["br", "img", "input", "meta", "link", "hr", "wbr", "source"]);
function parse(html) {
  const root = { tag: "", cls: [], kids: [] };
  let cur = root;
  for (const m of html.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:[^>"]|"[^"]*")*)>|([^<]+)/g)) {
    if (m[4] != null) cur.kids.push({ text: m[4] });
    else if (m[1] && m[2]) { let n = cur; while (n !== root && n.tag !== m[2].toLowerCase()) n = n.up; if (n !== root) cur = n.up; }
    else if (m[2]) {
      const el = { tag: m[2].toLowerCase(), cls: ((m[3].match(/\bclass="([^"]*)"/) || [])[1] || "").split(/\s+/), kids: [], up: cur };
      cur.kids.push(el);
      if (!VOID.has(el.tag) && !m[3].trim().endsWith("/")) cur = el;
    }
  }
  return root;
}
const all = (n, f, out = []) => { for (const k of n.kids || []) if (k.tag) { if (f(k)) out.push(k); all(k, f, out); } return out; };
const byCls = (n, c) => all(n, (e) => e.cls.includes(c));
const text = (n) => n.text != null ? n.text : (n.kids || []).map(text).join("");
const clean = (s) => s.replace(/⁠/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
const txt = (n) => clean(text(n));
const within = (e, f) => { for (let n = e.up; n; n = n.up) if (n.tag && f(n)) return true; return false; };
const inDetails = (e) => within(e, (n) => n.tag === "details");
const inCare = (e) => within(e, (n) => n.cls.includes("r-care"));

// ---------- 표본 ----------
let seed = 20261030;
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pickOne = (a) => a[Math.floor(rnd() * a.length)];
// 결정 32(C8): 숭실대 학과는 D.depts(hide 제외) + 'none', 다른 학교는 promptName 전공 8 + 'none' + 미선택
const SSU_DEPTS = [...D.depts.filter((d) => !d.hide).map((d) => d.id), "none"];
const ETC_DEPTS = [...D.depts.filter((d) => d.promptName).map((d) => d.id), "none", undefined];
const DEEP = D.depts.filter((d) => !d.basic).map((d) => d.id);

// 답을 채우고 결과를 그린다. f(it, k)는 리커트 답
function draw({ school, dept, year = 2, sector = ["big"], pairs }, f) {
  Object.assign(qa, { a: { school, year: years[year - 1], ...(dept ? { dept } : {}), ...Object.fromEntries(LIKERT.map((it, k) => [it.id, f(it, k)])) },
    sector: [...sector], pairs: pairs || Object.fromEntries(Q.pairs.map((_, k) => [k, 0])) });
  const html = testResult();
  return { html, a: { ...qa.a }, sector: [...sector], tree: parse(html) };
}
// 무작위 한 세트: 사람처럼 대체로 3~5, 가끔 1~2
function randomSet(school = rnd() < 0.6 ? "ssu" : "etc") {
  const low = 0.05 + rnd() * 0.3, sector = SECTORS.filter(() => rnd() < 0.25);
  return draw({ school, dept: pickOne(school === "ssu" ? SSU_DEPTS : ETC_DEPTS), year: 1 + Math.floor(rnd() * 4),
    sector: sector.length ? sector : [rnd() < 0.2 ? "unsure" : pickOne(SECTORS)], pairs: Object.fromEntries(Q.pairs.map((_, k) => [k, rnd() < 0.5 ? 0 : 1])) },
  () => (rnd() < low ? 1 + Math.floor(rnd() * 2) : 3 + Math.floor(rnd() * 3)));
}
const label = (r) => `${r.a.school}/${r.a.dept ?? "-"}/${r.a.year}/${r.sector.join("+")}`;
const week = (r) => byCls(r.tree, "r-week")[0];
const weekLi = (r) => (week(r) ? all(week(r), (e) => e.tag === "li") : []);
const mindOn = (a) => a.m4 <= 2 || MIND.reduce((s, it) => s + a[it.id], 0) / MIND.length <= 2;
const textOut = (n) => n.text != null ? n.text : n.tag === "details" ? "" : (n.kids || []).map(textOut).join("");

// 결정 31(C7) 상담 권유: li > b, li > a, .fixes의 → 줄, r-week 안내 p. .r-care 안은 세지 않는다
function counsel(r) {
  const hits = [];
  for (const li of all(r.tree, (e) => e.tag === "li")) {
    // li > a는 할 일 링크만 세요. 결과 직무 카드(a.jobcard)의 직무 이름·설명은 상담 권유가 아니에요(결정 31, 4차 QA D1)
    for (const k of li.kids) if ((k.tag === "b" || k.tag === "a") && /상담/.test(txt(k)) && !k.cls.includes("jobcard")) hits.push(k);
    // 보충 목록 줄은 '→' 뒤 제목(b)만 본다(how 문장의 '채용상담회' 같은 말은 권유가 아님)
    if (within(li, (n) => n.cls.includes("fixes"))) for (const k of li.kids) if (k.tag && /^\s*→/.test(txt(k))) hits.push(...all(k, (b) => b.tag === "b" && /상담/.test(txt(b))));
  }
  for (const w of byCls(r.tree, "r-week")) for (const p of w.kids) if (p.tag === "p" && /상담/.test(txt(p))) hits.push(p);
  const counted = hits.filter((e) => !inCare(e));
  return { all: counted.length, open: counted.filter((e) => !inDetails(e)).length };
}

const RANDOM = Array.from({ length: 2000 }, () => randomSet());
const ETC200 = Array.from({ length: 200 }, () => randomSet("etc"));
const BOTH200 = Array.from({ length: 200 }, () => randomSet());

// ---------- 회귀(지금 초록) ----------
test("R1 다른 학교 200세트(전공 표본 포함) 결과 HTML에 숭실 낱말 0", () => {
  const bad = ETC200.filter((r) => SSU_RE.test(r.html)).map((r) => `${label(r)}: ${r.html.match(SSU_RE)[0]}`);
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}/200`);
});

test("R2 다른 학교 200세트 .r-week에 '진로·취업 센터'", () => {
  const bad = ETC200.filter((r) => !week(r) || !txt(week(r)).includes("진로·취업 센터")).map(label);
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}/200`);
});

test("R3 진단 할 일 url에 '#jobs-trade' 0", () => {
  const bad = [...(D.diag || [])].flatMap((x) => [...(x.steps || [])].filter((t) => t?.url === "#jobs-trade").map(() => x.id));
  assert.deepEqual(bad, []);
});

test("R4 두 학교 200세트에 '대학을 공부하는' 0", () => {
  const bad = BOTH200.filter((r) => clean(r.html).includes("대학을 공부하는")).map(label);
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}/200`);
});

// ---------- 빨강(T13·T17 뒤 초록) ----------
test("B1 고정 40경로(흥미 3·준비 4·대기업): 이번 주 할 일 '어학' 0, 진단 '어학 말하기' 제목 1개", () => {
  const paths = [...DEEP.map((dept) => ({ school: "ssu", dept })), { school: "ssu", dept: "none" }, { school: "etc" }];
  const bad = [];
  let n = 0;
  for (const p of paths) for (const year of [1, 2, 3, 4]) {
    const r = draw({ ...p, year }, (it) => (Q.interest.items.includes(it) ? 3 : 4));
    n++;
    if (/어학/.test(txt(week(r) || { text: "" }))) bad.push(`${label(r)}: 이번 주 할 일에 어학`);
    const titles = all(r.tree, (e) => e.tag === "b" && e.up?.cls.includes("diag")).filter((b) => txt(b).includes("어학 말하기")).length;
    if (titles !== 1) bad.push(`${label(r)}: '어학 말하기' 진단 ${titles}개`);
  }
  assert.equal(n, 40);
  assert.deepEqual(bad.slice(0, 6), [], `${bad.length}건`);
});

test("B1② 무작위 2,000세트: 외국계를 고르지 않은 결과의 이번 주 할 일 '어학' 0", () => {
  const bad = RANDOM.filter((r) => !r.sector.includes("foreign") && /어학/.test(txt(week(r) || { text: "" }))).map(label);
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}건`);
});

const careChecks = (r) => {
  const f = [], li = weekLi(r), w = txt(week(r) || { text: "" }), open = clean(textOut(byCls(r.tree, "r-hero")[0] || { text: "" }));
  if (w.includes("상담센터")) f.push("r-week에 상담센터");
  if (li.length < 2) f.push(`r-week li ${li.length}`);
  // 결정 31: 할 일 제목(li > b)으로 센다. how 문장의 메뉴·행사 이름('진로취업상담', '채용상담회')은 권유가 아니다(개발 부장 승인, T23 8절)
  if (li.filter((e) => e.kids.some((k) => k.tag === "b" && /상담/.test(txt(k)))).length > 1) f.push("r-week 상담 li 2개 이상");
  if (!open.includes("109") || !open.includes("1577-0199")) f.push("r-hero 접히지 않은 곳에 109·1577-0199 없음");
  return f;
};
test("B2 마음 칸: m4=2 경로와 마음 안내가 켜진 무작위 결과 100%", () => {
  const fixed = draw({ school: "ssu", dept: "aisw", year: 2 }, (it) => (it.id === "m4" ? 2 : 4));
  const bad = careChecks(fixed).map((m) => `m4=2: ${m}`);
  const on = RANDOM.filter((r) => mindOn(r.a));
  assert.ok(on.length >= 100, `마음 안내가 켜진 세트 ${on.length}개`);
  for (const r of on) bad.push(...careChecks(r).map((m) => `${label(r)}: ${m}`));
  assert.deepEqual(bad.slice(0, 6), [], `${bad.length}건 / 켜진 세트 ${on.length}`);
});

test("B3 diag.js(주석 제외)에 '졸업생이 많이 가는' 0", () => {
  const code = readFileSync(join(DIR, "diag.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
  assert.ok(!code.includes("졸업생이 많이 가는"));
});

test("B4 무작위 2,000세트 상담 권유: 결과 하나에 전체 ≤ 3, 접히지 않은 곳 ≤ 2", () => {
  const bad = RANDOM.map((r) => [r, counsel(r)]).filter(([, c]) => c.all > 3 || c.open > 2).map(([r, c]) => `${label(r)}: 전체 ${c.all}, 펼친 곳 ${c.open}`);
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}/2000`);
});

test("B9 quiz-ui.js에 '같은 결과가 보여요' 0", () => {
  assert.ok(!readFileSync(join(DIR, "quiz-ui.js"), "utf8").includes("같은 결과가 보여요"));
});

test("B10 3·4학년 + 준비 평균 2 이하 영역이 2개 이상이면 .calm 1개, 숫자 0", () => {
  const bad = [];
  for (let n = 0; n < 200; n++) {
    const lowG = Q.ready.groups.filter(() => rnd() < 0.5).map((g) => g.id);
    while (lowG.length < 2) lowG.push(pickOne(Q.ready.groups.filter((g) => !lowG.includes(g.id))).id);
    const school = rnd() < 0.6 ? "ssu" : "etc", ids = new Set(Q.ready.groups.filter((g) => lowG.includes(g.id)).flatMap((g) => g.items.map((it) => it.id)));
    const r = draw({ school, dept: pickOne(school === "ssu" ? SSU_DEPTS : ETC_DEPTS), year: 3 + Math.floor(rnd() * 2) }, (it) => (ids.has(it.id) ? 1 + Math.floor(rnd() * 2) : 3 + Math.floor(rnd() * 3)));
    const calm = byCls(r.tree, "calm");
    if (calm.length !== 1) bad.push(`${label(r)}: .calm ${calm.length}개`);
    else if (/\d/.test(txt(calm[0]))) bad.push(`${label(r)}: .calm에 숫자`);
  }
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length}/200`);
});

test("N-b 다른 학교 + 'none'이면 .nodept 1개", () => {
  const r = draw({ school: "etc", dept: "none", year: 2 }, (_, k) => 1 + (k % 5));
  assert.equal(byCls(r.tree, "nodept").length, 1);
});
