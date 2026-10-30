// 계약(4차 결정 24·25, C9): 공용 전역 이름, 학과 id·직무 key, v1 결과 링크의 문항 순서, 학과 id 규칙.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load, scripts } from "./load.mjs";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const { get } = load(DIR);
const D = get("D"), Q = get("Q"), LIKERT = get("LIKERT");
// vm 안 배열은 프로토타입이 달라 deepEqual 전에 JSON으로 옮긴다
const plain = (x) => JSON.parse(JSON.stringify(x));
const KEYS = JSON.parse(readFileSync(new URL("./fixtures/keys.json", import.meta.url), "utf8"));

// 결정 24: 4차 동안 이름·인자 모양을 바꾸지 않는 공용 전역(app.js 19개 + quiz-ui.js 3개)
const GLOBALS = ["D", "st", "$", "esc", "src", "link", "colleges", "pathIs", "codeName", "caseCard", "drawPick", "render", "drawJobs", "drawFaq", "drawAi",
  "OFF", "jump", "route", "dictFor", "showShared", "drawTest", "forSchool"];

test("U10 공용 전역이 모두 function 또는 object", () => {
  const bad = GLOBALS.map((n) => [n, get(`typeof ${n}`)]).filter(([, t]) => t !== "function" && t !== "object");
  assert.deepEqual(bad, []);
});

test("U11 학과 id·직무 key는 줄지 않고, v1 링크 문항 순서(리커트·짝·끌리는 곳·가치)는 그대로", () => {
  const depts = new Set(D.depts.map((d) => d.id)), jobs = new Set(D.jobs.map((j) => j.key));
  assert.deepEqual(KEYS.depts.filter((id) => !depts.has(id)), [], "사라진 학과 id");
  assert.deepEqual(KEYS.jobs.filter((k) => !jobs.has(k)), [], "사라진 직무 key");
  assert.deepEqual(plain(LIKERT.map((it) => it.id)), KEYS.likert, "리커트 순서");
  assert.deepEqual(plain(Q.pairs), KEYS.pairs, "짝 6쌍");
  assert.deepEqual(plain(Q.sectors.options.map((o) => o.v).slice(0, KEYS.sectors.length)), KEYS.sectors, "끌리는 곳 순서");
  assert.deepEqual(plain(Q.values.map((v) => v.id).slice(0, KEYS.values.length)), KEYS.values, "가치 순서");
});

test("U12 학과 id: 'etc'가 아니고 '-'가 없고, map-<id>가 화면 섹션 id와 겹치지 않음", () => {
  const ids = new Set(scripts(DIR).concat("index.html").flatMap((f) => [...readFileSync(join(DIR, f), "utf8").matchAll(/id=\\?"(map-[\w-]+)\\?"/g)].map((m) => m[1])));
  const bad = plain(D.depts.filter((d) => d.id === "etc" || d.id.includes("-") || ids.has(`map-${d.id}`)).map((d) => d.id));
  assert.deepEqual(bad, [], `섹션 id ${[...ids].join(",") || "없음"}`);
});
