// 결과 화면(T08): 마크업 개수, % 없음, 첫 카드 안 순서, 다른 학교·숭실대+'여기 없어요' 경로, 육각형 좌표.
// 개수는 데이터에서 계산한다(B7). 화면 문구에는 단정하지 않는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load.mjs";

const { get } = load(process.env.JOBMAP_DIR);
const Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT");
const testResult = get("testResult"), hexSVG = get("hexSVG");
const years = Q.basics.find((q) => q.id === "year").options;
// 답을 채우고 결과 HTML을 그린다. f(it, k)는 리커트 답
const draw = (a, f = (_, k) => 1 + (k % 5)) => {
  Object.assign(qa, { a: { year: years[1], ...a, ...Object.fromEntries(LIKERT.map((it, k) => [it.id, f(it, k)])) },
    sector: ["big"], pairs: Object.fromEntries(Q.pairs.map((_, k) => [k, k % 2])) });
  return testResult();
};
const count = (html, re) => (html.match(re) || []).length;
const part = (html, cls) => { const i = html.indexOf(`<section class="${cls}"`); return i < 0 ? "" : html.slice(i, html.indexOf("</section>", i)); };
const weekLi = (html) => count(part(html, "r-hero").slice(part(html, "r-hero").indexOf('class="r-week"')), /<li>/g);

test("결과 마크업: jobcard 3, r-title, 육각형 점 6, 게이지 = 준비 영역 수, v-first 1", () => {
  const html = draw({ school: "ssu", dept: "aisw" });
  assert.equal(count(html, /class="jobcard"/g), 3);
  // 화면마다 h1 하나(axe page-has-heading-one). 결과는 숨김 h1 → h2 r-title → h3 이번 주 순서(heading-order)
  assert.equal(count(html, /<h1[ >]/g), 1);
  assert.match(html, /<h1 class="sr-only">/);
  assert.match(html, /<h2 id="r-title" tabindex="-1">/);
  const area = html.match(/<polygon class="area" points="([^"]+)"/);
  assert.ok(area, "polygon.area가 없다");
  assert.equal(area[1].trim().split(/\s+/).length, Q.areas.length);
  assert.equal(count(html, /<li class="gauge/g), Q.ready.groups.length);
  assert.equal(count(html, /class="v-first"/g), 1);
});

// 보이는 글만 본다(구글 캘린더 주소의 %20 같은 인코딩은 화면에 나오지 않는다)
test("r-hero 글자에 %가 없다(무작위 50세트)", () => {
  for (let n = 0; n < 50; n++) {
    const html = draw({ school: Math.random() < 0.8 ? "ssu" : "etc", dept: "aisw" }, () => 1 + Math.floor(Math.random() * 5));
    assert.doesNotMatch(part(html, "r-hero").replace(/<[^>]*>/g, ""), /\d+\s*%/);
  }
});

test("r-hero 안 순서는 r-tie → r-week → r-scorenote", () => {
  const hero = part(draw({ school: "ssu", dept: "aisw" }, () => 3), "r-hero");
  const at = (c) => hero.indexOf(`class="${c}"`);
  assert.ok(at("r-tie") > 0, "모두 3인데 r-tie가 없다");
  assert.ok(at("r-tie") < at("r-week") && at("r-week") < at("r-scorenote"), [at("r-tie"), at("r-week"), at("r-scorenote")].join(" "));
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

test("r-interest 안에 참고용 고지 .verdict가 있다", () => {
  assert.match(part(draw({ school: "ssu", dept: "aisw" }), "r-interest"), /class="verdict"/);
});

test("hexSVG: R만 100이면 R 꼭짓점이 (150,50)", () => {
  const svg = hexSVG(Object.fromEntries(Q.areas.map((x) => [x.id, x.id === "R" ? 100 : 0])));
  const pts = svg.match(/<polygon class="area" points="([^"]+)"/)[1].trim().split(/\s+/);
  assert.equal(pts[Q.areas.findIndex((x) => x.id === "R")], "150,50");
});

test("shareCanvas가 있다", () => {
  assert.equal(get("typeof shareCanvas"), "function");
});

// 4차 C6: r-hero 위쪽 순서는 하나로 정한다. 있는 것끼리 이 순서여야 한다(마음 칸·캘린더 줄이 들어와도)
test("r-hero 자식 순서: 있는 것끼리 r-tie → r-week → .r-care → .r-cal → r-scorenote → r-actions", () => {
  const ORDER = ["r-tie", "r-week", "r-care", "r-cal", "r-scorenote", "r-actions"];
  const cases = [["모두 3", { school: "ssu", dept: "aisw" }, () => 3], ["m4=2", { school: "ssu", dept: "aisw" }, (it) => (it.id === "m4" ? 2 : 4)],
    ["다른 학교", { school: "etc" }, (it) => (it.id === "m4" ? 2 : 3)], ["여기 없어요", { school: "ssu", dept: "none" }, (_, k) => 1 + (k % 5)]];
  for (const [name, a, f] of cases) {
    const html = draw(a, f), s = html.indexOf('<section class="r-hero"'), hero = html.slice(s, html.indexOf('class="r-interest"', s));
    const at = ORDER.map((c) => [c, hero.search(new RegExp(`class="(?:[^"]* )?${c}(?: [^"]*)?"`))]).filter(([, i]) => i >= 0);
    assert.ok(at.length >= 3, `${name}: r-hero에서 찾은 칸 ${at.map(([c]) => c).join(",")}`);
    assert.ok(at.some(([c]) => c === "r-cal"), `${name}: 캘린더 줄 .r-cal이 없다`);
    assert.deepEqual(at.map(([c]) => c), [...at].sort((x, y) => x[1] - y[1]).map(([c]) => c), `${name}: ${at.map(([c, i]) => `${c}@${i}`).join(" ")}`);
  }
});
