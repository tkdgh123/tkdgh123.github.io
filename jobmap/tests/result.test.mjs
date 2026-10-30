// 결과 화면(T08, 5차 개편): 마크업 개수, % 없음, 색면 안 순서, 다른 학교·숭실대+'여기 없어요' 경로, 끌림 막대.
// 개수는 데이터에서 계산한다(B7). 화면 문구에는 단정하지 않는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load.mjs";

const { get } = load(process.env.JOBMAP_DIR);
const Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT");
const testResult = get("testResult"), dbars = get("dbars");
const years = Q.basics.find((q) => q.id === "year").options;
// 답을 채우고 결과 HTML을 그린다. f(it, k)는 리커트 답
const draw = (a, f = (_, k) => 1 + (k % 5)) => {
  Object.assign(qa, { a: { year: years[1], ...a, ...Object.fromEntries(LIKERT.map((it, k) => [it.id, f(it, k)])) },
    sector: ["big"], pairs: Object.fromEntries(Q.pairs.map((_, k) => [k, k % 2])) });
  return testResult();
};
const count = (html, re) => (html.match(re) || []).length;
const part = (html, cls) => { const i = html.indexOf(`<section class="${cls}"`); return i < 0 ? "" : html.slice(i, html.indexOf("</section>", i)); };
// 5차: 칸은 id로 찾는다(class는 모두 rcard). 이번 주 할 일은 #r-week 카드의 첫 ol
const byId = (html, id) => { const i = html.indexOf(`id="${id}"`); return i < 0 ? "" : html.slice(i, html.indexOf("</section>", i)); };
const weekLi = (html) => { const w = byId(html, "r-week"); return count(w.slice(0, w.indexOf("</ol>")), /<li>/g); };

// 5차: jobcard 3 → '왜' 칸 3(.rwhy > li), 육각형 점 6 → 끌림 막대 6(.db), 게이지 → 준비 타일(.rtiles li). 예전 기대값의 개수는 그대로
test("결과 마크업: 직무 '왜' 3, r-title, 끌림 막대 6, 준비 타일 = 준비 영역 수, v-first 1", () => {
  const html = draw({ school: "ssu", dept: "aisw" });
  assert.equal(count(byId(html, "r-jobs"), /<li><a class="rw-top"/g), 3);
  // 화면마다 h1 하나(axe page-has-heading-one). 결과는 숨김 h1 → h2 r-title → 칸마다 h2(heading-order)
  assert.equal(count(html, /<h1[ >]/g), 1);
  assert.match(html, /<h1 class="sr-only">/);
  assert.match(html, /<h2 id="r-title" tabindex="-1">/);
  assert.equal(count(html, /<div class="db[ "]/g), Q.areas.length);
  assert.equal(count(byId(html, "r-ready").match(/<ul class="rtiles">[\s\S]*?<\/ul>/)[0], /<li[ >]/g), Q.ready.groups.length);
  assert.equal(count(html, /class="v-first"/g), 1);
});

// 보이는 글만 본다(구글 캘린더 주소의 %20 같은 인코딩은 화면에 나오지 않는다)
test("r-hero 글자에 %가 없다(무작위 50세트)", () => {
  for (let n = 0; n < 50; n++) {
    const html = draw({ school: Math.random() < 0.8 ? "ssu" : "etc", dept: "aisw" }, () => 1 + Math.floor(Math.random() * 5));
    assert.doesNotMatch(part(html, "r-hero").replace(/<[^>]*>/g, ""), /\d+\s*%/);
  }
});

// 5차: 동점 안내(r-tie)는 직무 칸으로, 점수 설명은 맨 끝 저장 칸으로 옮겼다. 색면 안은 1위 직무 → 끌림 한 줄 → 이번 주 줄 순서
test("r-hero 안 순서는 rh-main → rh-line → rh-week, 모두 3이면 r-tie는 #r-jobs 안", () => {
  const html = draw({ school: "ssu", dept: "aisw" }, () => 3), hero = part(html, "r-hero");
  const at = (c) => hero.indexOf(`class="${c}"`);
  assert.ok(byId(html, "r-jobs").includes('class="r-tie"'), "모두 3인데 #r-jobs에 r-tie가 없다");
  assert.ok(at("rh-main") > 0 && at("rh-main") < at("rh-line") && at("rh-line") < at("rh-week"), [at("rh-main"), at("rh-line"), at("rh-week")].join(" "));
  assert.ok(html.indexOf('class="r-scorenote"') > html.indexOf('id="r-ai"'), "점수 설명이 저장 칸에 없다");
});

// 4차 결정 8·9: 다른 학교에도 '이번 학기 할 일'(#r-todo)이 생긴다. 예전 기대값 '#r-todo 없음'을 바꿨다(개발 부장 승인, T19 작업 기록)
test("다른 학교: r-week 2개 이상, #r-todo 있고 ssu.ac.kr 0", () => {
  for (const dept of [undefined, "jp", "none"]) {
    const html = draw({ school: "etc", dept });
    assert.ok(weekLi(html) >= 2, `${dept}: r-week li ${weekLi(html)}`);
    assert.match(html, /id="r-todo"/, dept);
    assert.doesNotMatch(html, /ssu\.ac\.kr/, dept);
  }
});

test("숭실대 + '여기 없어요': .nodept가 있고 r-week 항목 2개 이상", () => {
  const html = draw({ school: "ssu", dept: "none" });
  assert.match(html, /class="nodept"/);
  assert.ok(weekLi(html) >= 2, `r-week li ${weekLi(html)}`);
});

test("모두 3이면 r-tie가 있다", () => {
  assert.match(draw({ school: "ssu", dept: "aisw" }, () => 3), /class="r-tie"/);
});

// 5차: 흥미 칸(r-interest)이 '내 끌림 순서'(#r-areas)로 바뀌었다
test("#r-areas 안에 참고용 고지 .verdict가 있다", () => {
  assert.match(byId(draw({ school: "ssu", dept: "aisw" }), "r-areas"), /class="verdict"/);
});

// 5차: 육각형(hexSVG) 대신 끌림 막대. 'R만 100이면 R 꼭짓점'을 'R만 100이면 첫 막대가 R·100이고 1위 강조'로 바꿨다
test("dbars: R만 100이면 첫 막대가 R(100, on1), 나머지 0. 고르면 강조 없음", () => {
  const svg = dbars(Object.fromEntries(Q.areas.map((x) => [x.id, x.id === "R" ? 100 : 0])));
  const db = [...svg.matchAll(/<div class="db( on\d)?" style="--v:(\d+)">.*?src="img\/a-(\w)\.svg"/g)].map((m) => [m[3], +m[2], m[1] || ""]);
  assert.deepEqual(db[0], ["R", 100, " on1"]);
  assert.ok(db.slice(1).every(([, v]) => v === 0), JSON.stringify(db));
  assert.doesNotMatch(dbars(Object.fromEntries(Q.areas.map((x) => [x.id, 50])), true), /on[12]/);
});

test("shareCanvas가 있다", () => {
  assert.equal(get("typeof shareCanvas"), "function");
});

// 4차 C6: r-hero 위쪽 순서는 하나로 정한다. 있는 것끼리 이 순서여야 한다(마음 칸이 들어와도)
// 5차: 색면 블록 개편으로 순서를 rh-main → rh-line → rh-next → .r-care → rh-week → rh-act로 바꿨다(디자인 초안 3-7). 캘린더 줄은 #r-week 카드로
test("r-hero 자식 순서: 있는 것끼리 rh-main → rh-line → rh-next → .r-care → rh-week → rh-act, 캘린더는 #r-week", () => {
  const ORDER = ["rh-main", "rh-line", "rh-next", "r-care", "rh-week", "rh-act"];
  const cases = [["모두 3", { school: "ssu", dept: "aisw" }, () => 3], ["m4=2", { school: "ssu", dept: "aisw" }, (it) => (it.id === "m4" ? 2 : 4)],
    ["다른 학교", { school: "etc" }, (it) => (it.id === "m4" ? 2 : 3)], ["여기 없어요", { school: "ssu", dept: "none" }, (_, k) => 1 + (k % 5)]];
  for (const [name, a, f] of cases) {
    const html = draw(a, f), hero = part(html, "r-hero");
    const at = ORDER.map((c) => [c, hero.search(new RegExp(`class="(?:[^"]* )?${c}(?: [^"]*)?"`))]).filter(([, i]) => i >= 0);
    assert.ok(at.length >= 5, `${name}: r-hero에서 찾은 칸 ${at.map(([c]) => c).join(",")}`);
    assert.ok(byId(html, "r-week").includes('class="r-cal'), `${name}: 캘린더 줄 .r-cal이 #r-week에 없다`);
    assert.deepEqual(at.map(([c]) => c), [...at].sort((x, y) => x[1] - y[1]).map(([c]) => c), `${name}: ${at.map(([c, i]) => `${c}@${i}`).join(" ")}`);
  }
});
