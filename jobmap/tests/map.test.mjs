// 학과 지도(4차 T18, 결정 6·7·8·10·11·17·32): render()·drawPick()·newsLine()을 vm에서 불러 HTML 글자로 본다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load } from "./load.mjs";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { els, get } = load(DIR);
const D = get("D"), st = get("st"), render = get("render"), drawPick = get("drawPick"), dictLink = get("dictLink"), newsLine = get("newsLine"), esc = get("esc");
// 숭실 낱말 정규식은 trust.test.mjs의 SSU_RE 한 곳에서 읽는다(결정 32). import하면 그 파일 테스트가 여기서 한 번 더 돌아서 글로 읽는다
const SSU_RE = new RegExp(readFileSync(new URL("./trust.test.mjs", import.meta.url), "utf8").match(/export const SSU_RE = \/(.+)\/;/)[1]);
const deep = D.depts.filter((d) => d.promptName);
const show = (o) => { Object.assign(st, o); render(); return els.out.innerHTML; };
const count = (html, re) => (html.match(re) || []).length;

test("newsLine: 바뀐 것은 119일째 보이고 121일째 숨어요, 숨으면 이번 달 시기 한 줄이 대신해요", () => {
  const u = [...D.updates].sort((a, b) => b.date.localeCompare(a.date))[0], day = (n) => new Date(Date.parse(u.date) + n * 864e5);
  assert.equal(newsLine(day(119)), esc(u.text));
  const seasons = D.seasons;
  try {
    D.seasons = [];
    assert.equal(newsLine(day(121)), "");
    D.seasons = [{ months: [day(121).getMonth() + 1], text: "하반기 공채 시기예요", source: "https://www.moel.go.kr/x" }];
    assert.match(newsLine(day(121)), /^하반기 공채 시기예요 <a class="src"/);
  } finally { D.seasons = seasons; }
});

test("다른 학교 × 전공 8개: 숭실 낱말·ssu.ac.kr 0, .path 수 = paths 수, 사례 수 = cases 수, 학년별 할 일 8줄", () => {
  assert.equal(deep.length, 8);
  for (const d of deep) {
    const html = show({ school: "etc", dept: d.id, year: 1 });
    // 허용: .note-school 제목(학교 칩은 #out 밖)
    const rest = html.replace(/(<p class="note-school">[\s\S]*?)<b>[^<]*<\/b>/, "$1");
    assert.equal(rest.match(SSU_RE)?.[0], undefined, `${d.id}: ${rest.match(SSU_RE)?.[0]}`);
    assert.equal(count(html, /class="path /g), d.paths.length, `${d.id} .path`);
    assert.equal(count(html, /class="case (in|out)"/g), d.cases.length, `${d.id} .case`);
    assert.equal(count(html, /class="empty"/g), 0, `${d.id} .empty`);
    const years = html.match(/<ol class="years">([\s\S]*?)<\/ol>/)[1];
    assert.equal(count(years, /<li><b>/g), 8, `${d.id} 학년별 할 일`);
  }
});

test("숭실대 47개 render: 예외 0, 'undefined' 0, 학과 이름 있음, 기본판엔 계열 취업률 없음", () => {
  assert.equal(D.depts.length, 47);
  for (const d of D.depts) {
    let html;
    assert.doesNotThrow(() => (html = show({ school: "ssu", college: d.college, dept: d.id })), d.id);
    assert.ok(!html.includes("undefined"), `${d.id}: undefined`);
    assert.ok(html.includes(esc(d.name)), `${d.id}: 이름 없음`);
    assert.equal(count(html, /class="empty"/g), 0, `${d.id} .empty`);
    if (d.basic) assert.ok(!html.includes("계열 취업률"), `${d.id}: 기본판에 계열 취업률`);
  }
});

test("계열 칩 6개: 값 = data(2024년 졸업자 교육부), 자료 있는 전공 칩이 그 학교 주소로", () => {
  const F = D.fieldRate.fields;
  assert.deepEqual(Object.fromEntries(F.map((f) => [f.name, f.value])), { 인문: "61.1%", 사회: "69.0%", 교육: "71.1%", 공학: "70.4%", 자연: "65.4%", 예체능: "66.7%" });
  for (const school of ["ssu", "etc"]) for (const f of F) {
    const html = show({ school, dept: "none", field: f.id });
    assert.ok(html.includes(esc(f.value)) && html.includes(esc(f.label)), `${school} ${f.name}: 값 없음`);
    const go = [...html.matchAll(/href="#map-(etc-)?(\w+)"/g)];
    assert.deepEqual(go.map((m) => m[2]), [...f.depts], `${school} ${f.name}: 전공 칩`);
    assert.ok(go.every((m) => !!m[1] === (school === "etc")), `${school} ${f.name}: 주소`);
  }
  st.field = "";
});

test("dictLink: 빈 배열은 링크 없음, 없는 key는 건너뜀, 인문·사회·수학 진로는 R&D로 가지 않음", () => {
  assert.equal(dictLink("대학원·연구", []), "");
  assert.equal(dictLink("공무원", ["nope"]), "");
  assert.match(dictLink("공무원", ["nope", "civil"]), /href="#jobs-civil"/);
  for (const d of deep.filter((d) => /인문|사회|경영|자연/.test(d.college))) {
    assert.ok(!show({ school: "ssu", college: d.college, dept: d.id }).includes("#jobs-rnd"), `${d.id} → rnd`);
  }
});

test("고르기 줄: 다른 학교 전공 칩 8 + '비슷한 전공이 없어요', 숭실대 단과대마다 숨김 학과 칩 0", () => {
  Object.assign(st, { school: "etc", dept: deep[0].id });
  drawPick();
  assert.equal(count(els.dept.innerHTML, /data-v="/g), 9);
  assert.ok(els.dept.innerHTML.includes("비슷한 전공이 없어요"));
  const hide = [...D.depts.filter((d) => d.hide).map((d) => d.id)];
  assert.equal(hide.length, 3);
  for (const c of get("colleges")) {
    Object.assign(st, { school: "ssu", college: c, dept: D.depts.find((d) => d.college === c && !d.hide).id });
    drawPick();
    assert.deepEqual(hide.filter((id) => els.dept.innerHTML.includes(`data-v="${id}"`)), [], c);
  }
});
