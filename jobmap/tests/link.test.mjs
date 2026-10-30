// 결과 링크 v2(체크·연월)와 v1 읽기, 친구용 링크, 캘린더(.ics) — 4차 결정 12~15, C9·C15. U1~U9
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "./load.mjs";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { get } = load(DIR);
const D = get("D"), Q = get("Q"), qa = get("qa"), LIKERT = get("LIKERT");
const parseCode = get("parseCode"), showShared = get("showShared"), compute = get("compute"), testResult = get("testResult"), tid = get("tid"), todoOf = get("todoOf");
const encodeFriend = get("encodeFriend"), parseFriend = get("parseFriend"), makeIcs = get("makeIcs"), calEvents = get("calEvents"), nextTerm = get("nextTerm");
const years = Q.basics.find((q) => q.id === "year").options;
const rnd = (n) => 1 + Math.floor(Math.random() * n);
const V1 = JSON.parse(readFileSync(join(DIR, "tests/fixtures/links-v1.json"), "utf8"));
const SSU = [...D.depts.map((d) => d.id), "none", undefined], ETC = [...D.depts.filter((d) => d.promptName).map((d) => d.id), "none", undefined];
const fill = ({ school = "ssu", dept, year = 2, done = [], ym = "2610" } = {}) => {
  Object.assign(qa, { a: { school, year: years[year - 1], ...(dept ? { dept } : {}), ...Object.fromEntries(LIKERT.map((it) => [it.id, rnd(5)])) },
    sector: ["big"], pairs: Object.fromEntries(Q.pairs.map((_, k) => [k, rnd(2) - 1])), done, ym });
};
const encode = () => get("encode()");

test("U1 v1: 공개 판 링크 8개가 열리고 학교·학과·학년·끌리는 곳·답 50자리가 같다, 체크 없음·연월 0000", () => {
  assert.equal(V1.length, 8);
  for (const g of V1) {
    const r = parseCode(g.code);
    assert.ok(r, g.code);
    assert.deepEqual([r.school, r.dept ?? null, r.year, [...r.sector].sort().join()], [g.school, g.dept, g.year, [...g.sector].sort().join()], g.code);
    assert.equal(LIKERT.map((it) => r.a[it.id]).join(""), g.code.split(".")[4]);
    assert.deepEqual([...r.done], []);
    assert.equal(r.ym, "0000");
  }
});

test("U2 v1을 열고 다시 복사하면 v2: 앞 일곱 칸은 같고 체크 '-', 연월 0000", () => {
  for (const g of V1) {
    showShared(g.code);
    const c = encode().split("."), o = g.code.split(".");
    assert.equal(c[0], "2");
    assert.deepEqual(c.slice(1, 7), o.slice(1, 7), g.code);
    assert.deepEqual(c.slice(7), ["-", "0000"]);
  }
});

test("U3 v2 왕복 300세트(다른 학교 + 전공 포함): 지금 할 일에 없는 id는 빠지고 끝은 숫자, 메신저 꼬리도 읽는다", () => {
  for (let n = 0; n < 300; n++) {
    const school = Math.random() < 0.6 ? "ssu" : "etc", year = rnd(4), list = school === "ssu" ? SSU : ETC, dept = list[rnd(list.length) - 1];
    fill({ school, dept, year, ym: `2${rnd(9)}${String(rnd(12)).padStart(2, "0")}` });
    const ids = todoOf(qa.a).map(tid), done = ids.filter(() => Math.random() < 0.5);
    qa.done = [...done, "zzzz"];
    const code = encode(), r = parseCode(code);
    assert.ok(r, code);
    assert.deepEqual([r.school, r.dept, r.year, r.ym], [school, dept, year, qa.ym], code);
    assert.deepEqual([...r.done], [...done], code);
    assert.ok(LIKERT.every((it) => r.a[it.id] === qa.a[it.id]), code);
    assert.match(code, /\d$/, "링크 끝이 숫자가 아니다");
    assert.ok(parseCode(code.replace(/\./g, "%2E")) && parseCode(code + "&fbclid=x"), code);
  }
});

test("U4 v2 거부: 칸 수, 연월, 체크 모양, 버전 3, 없는 학과, 다른 학교 + 기본판 학과", () => {
  fill({ dept: "aisw" });
  const c = encode().split("."), at = (k, v) => c.map((x, i) => (i === k ? v : x)).join(".");
  const basic = D.depts.find((d) => d.basic).id;
  const bad = { "칸 7개": c.slice(0, 7).join("."), "칸 10개": c.join(".") + ".1", "연월 2613": at(8, "2613"), "연월 26": at(8, "26"),
    "체크 abc": at(7, "abc"), "체크 빈 값": at(7, ""), "버전 3": at(0, "3"), "없는 학과 id": at(2, "zz"), "다른 학교 + 기본판": at(1, "etc").replace(".aisw.", `.${basic}.`) };
  for (const [k, v] of Object.entries(bad)) assert.equal(parseCode(v), null, k);
  assert.ok(parseCode(at(1, "etc")), "다른 학교 + 전공(aisw)은 받아야 한다");
});

test("U5 할 일 id: 학교·학과·학년 목록마다 서로 다르고 4글자", () => {
  const lists = [...SSU.filter(Boolean).map((dept) => ({ school: "ssu", dept })), ...ETC.map((dept) => ({ school: "etc", dept }))];
  for (const a of lists) for (const y of [1, 2, 3, 4]) {
    const ids = todoOf({ ...a, year: years[y - 1] }).map(tid);
    assert.ok(ids.length > 0, `${a.school}/${a.dept} ${y}`);
    assert.equal(new Set(ids).size, ids.length, `${a.school}/${a.dept} ${y}`);
    assert.ok(ids.every((x) => /^[0-9a-z]{4}$/.test(x)));
  }
});

test("U6 결과 화면: 링크의 체크가 체크 상자로 돌아온다(숭실대·다른 학교)", () => {
  for (const [school, dept] of [["ssu", "aisw"], ["etc", "jp"], ["etc", undefined]]) {
    fill({ school, dept });
    const ids = todoOf(qa.a).map(tid);
    qa.done = ids.slice(0, 1);
    const html = testResult();
    assert.equal((html.match(/type="checkbox"[^>]* checked/g) || []).length, 1, school);
    assert.equal((html.match(/data-id="/g) || []).length, ids.length, school);
  }
});

test("U7 친구용 링크: 300세트 왕복, 점수는 5 단위, 답이 없고 40자 이하. 거부 7종", () => {
  for (let n = 0; n < 300; n++) {
    fill({ dept: "aisw" });
    const r = compute(qa.a, qa.sector, qa.pairs);
    assert.ok(Object.values(r.riasec).every((v) => v % 5 === 0 && v >= 0 && v <= 100));
    const code = encodeFriend(r), f = parseFriend(code);
    assert.ok(f, code);
    assert.deepEqual({ ...f.riasec }, { ...r.riasec });
    assert.deepEqual([...f.jobs.map((j) => j.key)], [...r.top]);
    assert.ok(code.length <= 40 && !code.includes(LIKERT.map((it) => qa.a[it.id]).join("")), code);
  }
  for (const b of ["", "1", "1.abcdef.sales.ncs", "1.lllll0.sales.ncs.cs", "1.000000.sales.sales.cs", "1.000000.sales.ncs.nope", "2.000000.sales.ncs.cs"])
    assert.equal(parseFriend(b), null, b);
});

test("U8 .ics: CRLF, 75바이트 접기, 이스케이프, 일정 2개, 종일 DTEND, VALARM ACTION·DESCRIPTION, 학과 이름 든 제목 건너뛰기", () => {
  const now = new Date(2026, 9, 30, 21, 0);
  const ics = makeIcs([{ date: new Date(2026, 10, 13), title: "할 일, 확인; 해요", text: "줄1\n" + "가".repeat(60) + "\n역\\슬래시" },
    { date: nextTerm(now), title: "다시", text: "t" }], now);
  assert.ok(ics.endsWith("\r\n") && !/[^\r]\n/.test(ics), "CRLF가 아니다");
  assert.ok(ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75), "75바이트 넘는 줄");
  const un = ics.replace(/\r\n /g, "");
  assert.ok(un.includes("가".repeat(60)), "접은 곳에서 글자가 깨졌다");
  assert.ok(un.includes("SUMMARY:할 일\\, 확인\\; 해요") && un.includes("DESCRIPTION:줄1\\n") && un.includes("역\\\\슬래시"));
  assert.equal((un.match(/^BEGIN:VEVENT$/gm) || []).length, 2);
  assert.match(un, /DTSTART;VALUE=DATE:20261113\r\nDTEND;VALUE=DATE:20261114/);
  assert.match(un, /DTSTART;VALUE=DATE:20270308\r\nDTEND;VALUE=DATE:20270309/, "2026-10이면 다음 학기는 2027-03 둘째 주 월요일(3/8)");
  assert.equal(new Set(un.match(/UID:[^\r]+/g)).size, 2);
  const alarms = [...un.matchAll(/BEGIN:VALARM\r\n([\s\S]*?)END:VALARM/g)].map((m) => m[1]);
  assert.equal(alarms.length, 2);
  for (const a of alarms) assert.ok(/^ACTION:DISPLAY\r$/m.test(a) && /^TRIGGER:PT9H\r$/m.test(a) && /^DESCRIPTION:.+\r$/m.test(a), a);
  // 일정 1은 7일 뒤, 할 일 제목 3개까지. 학과 이름이 든 제목은 건너뛰고 다음 제목을 쓴다(C15)
  const ev = calEvents(["수학과 진로탐색 글 읽기", "직무 사전 읽기", "학교 비교과 둘러보기", "고용24 검사", "네 번째"], ["수학과", "수학", "109", "상담센터"], now);
  assert.equal(ev.length, 2);
  assert.equal(ev[0].date.getDate(), 6);
  assert.equal(ev[0].text, "- 직무 사전 읽기\n- 학교 비교과 둘러보기\n- 고용24 검사\n\nhttps://tkdgh123.github.io/jobmap/");
  const all = makeIcs(ev, now).replace(/\r\n /g, "");
  for (const s of ["#r=", "#s=", "수학", "109", "상담센터"]) assert.ok(!all.includes(s), s);
});

test("U9 다음 학기: 3~8월 → 9월, 9~2월 → 3월, 늘 8~14일 월요일", () => {
  for (let m = 0; m < 12; m++) {
    const d = nextTerm(new Date(2026, m, 15));
    assert.equal(d.getDay(), 1);
    assert.ok(d.getDate() >= 8 && d.getDate() <= 14);
    assert.equal(d.getMonth(), m >= 2 && m <= 7 ? 8 : 2);
    assert.equal(d.getFullYear(), m >= 8 ? 2027 : 2026);
  }
});
