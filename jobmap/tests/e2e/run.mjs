// E2E 시나리오 E1~E20·E22~E30. `node run.mjs [E1 E7 …] [--root <작업실 또는 baseline 폴더>]`
// 시나리오마다 PASS/FAIL/WARN(CDN)과 이유를 출력하고, FAIL이 하나라도 있으면 exit 1.
import { launch } from "./cdp.mjs";
import { start } from "./serve.mjs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync, existsSync, statSync, readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const ri = argv.indexOf("--root");
const ROOT = ri >= 0 ? argv[ri + 1] : undefined;
const ONLY = argv.filter((a) => /^E\d+$/i.test(a)).map((a) => a.toUpperCase());
const OUT = process.env.OUT || join(tmpdir(), "jobmap-e2e", new Date().toISOString().replace(/[:.]/g, "-"));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = await start(0, ROOT);
const BASE = `http://127.0.0.1:${server.address().port}/jobmap/`;
let browser = await launch();
// 공개 판(39bd263)이 만든 v1 결과 링크 8개(E14), 숭실 낱말 정규식은 trust.test.mjs의 SSU_RE 한 곳에서 읽는다(결정 32)
const V1 = JSON.parse(readFileSync(new URL("../fixtures/links-v1.json", import.meta.url), "utf8"));
const SSU_RE = new RegExp(readFileSync(new URL("../trust.test.mjs", import.meta.url), "utf8").match(/export const SSU_RE = \/(.+)\/;/)[1]);

// ---------- 페이지 도우미 ----------
const LIB = `window.__vis = (e) => !!e && e.checkVisibility({ checkVisibilityCSS: true }) && (() => { const b = e.getBoundingClientRect(); return b.width * b.height > 1; })();
window.__hero = () => { const h = document.querySelector("header.hero"); return h ? getComputedStyle(h).display : "없음"; }; 1`;
const CLS = `new Promise((r) => { let s = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) s += e.value; })).observe({ type: "layout-shift", buffered: true }); setTimeout(() => r(+s.toFixed(4)), 500); })`;
// 5차: 끌리는 곳 칩이 색면 .rtags에서 회사 기준 칸 .r-sector로 옮겨 tags는 .r-sector를 본다
const SIG = `JSON.stringify({ jobs: [...document.querySelectorAll('.result a[href^="#jobs-"]')].map((a) => a.textContent.trim()),
  tags: [...document.querySelectorAll(".r-sector")].map((e) => e.textContent.trim()), diag: [...document.querySelectorAll(".diag b")].map((e) => e.textContent.trim()) })`;
const RECTS = `(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; };
  return { quiz: r(".quiz"), qbar: r(".qbar"), qtop: r(".qtop") }; })()`;
const has = (p, sel) => p.eval(`!!document.querySelector(${JSON.stringify(sel)})`);
const stepI = (p) => p.eval(`typeof qa === "object" ? qa.i : null`);
const site = (p, kinds) => p.errors().filter((e) => e.origin === "site" && (!kinds || kinds.test(e.kind)));
const errText = (e) => `[${e.kind}] ${e.text}${e.url && !e.text.includes(e.url) ? " " + e.url : ""}`;

async function ready(p) {
  await p.waitFor(`document.readyState === "complete" && typeof drawTest === "function"`, 10000);
  // 글꼴은 첫 그림(FCP) 뒤에 켜진다(index.html media print→all). CDN이 막히면 E7이 CDN 경고로 따로 본다
  await p.waitFor(`document.querySelector('link[href*="pretendard"]')?.media === "all"`, 10000).catch(() => {});
  await p.eval(`document.fonts.ready.then(() => 1)`);
  await p.eval(LIB);
  await p.idle();
}
async function open(t, hash = "test", w = 1280, h, opts = {}) {
  const p = await t.page(w, h, opts);
  await p.goto(BASE + (hash ? "#" + hash : ""));
  await ready(p);
  return p;
}
async function reload(p, hash) { await p.goto("about:blank"); await p.goto(BASE + (hash ? "#" + hash : "")); await ready(p); }
async function moved(p, before, timeout = 4000) {
  await p.waitFor(`(typeof qa === "object" && qa.i !== ${before}) || !!document.querySelector(".result")`, timeout);
  await p.idle();
}
async function startQuiz(p) {
  if (!(await has(p, "header.hero [data-start]"))) throw new Error("header.hero [data-start]가 없어요");
  await p.click("header.hero [data-start]");
  await p.waitFor(`!!document.querySelector(".quiz")`, 4000);
  await p.idle();
}
const kindOf = (p) => p.eval(`document.querySelector(".quiz")?.dataset.kind ?? null`);
// 한 단계 답하고 다음 단계로 넘어갈 때까지 기다린다. 장 안내(5차)는 '시작하기'를 누르고 같은 단계의 질문이 나올 때까지
async function answer(p, o, st) {
  const kind = await kindOf(p), i = await stepI(p);
  if (kind === "chapter") {
    await p.click("#q-next");
    await p.waitFor(`document.querySelector(".quiz")?.dataset.kind !== "chapter"`, 4000);
    await p.idle();
    return kind;
  }
  if (kind === "basic") {
    const opts = await p.eval(`[...document.querySelectorAll("#q-body .qopt")].map((b) => b.dataset.v)`);
    st.basics.push(opts);
    const v = [o.school, o.dept, o.year].find((x) => x && opts.includes(x));
    if (!v) throw new Error(`기본 정보 단계에서 고를 선택지가 없어요: ${opts.join(",")}`);
    await p.click(`#q-body .qopt[data-v="${v}"]`);
  } else if (kind === "likert") await p.click(`#q-body .dot[data-v="${1 + (st.likert++ % 5)}"]`);
  else if (kind === "pairs") await p.click("#q-body .pick2");
  else if (kind === "sector") { await p.click("#q-body .qopt.multi"); await p.click("#q-next"); }
  else if (kind === "note") await p.click("#q-next");
  else throw new Error(`.quiz[data-kind]가 없거나 모르는 값이에요: ${kind}`);
  await moved(p, i);
  return kind;
}
const DEF = { school: "ssu", dept: "aisw", year: "2학년" };
// 5차: 기본 정보 3개 뒤에 1장 안내가 낀다. 장 안내면 '시작하기'를 눌러 질문으로
const pastChap = async (p) => { if ((await kindOf(p)) === "chapter") await answer(p, DEF, {}); };
async function finish(p, o = {}) {
  o = { ...DEF, ...o };
  const st = { likert: 0, kinds: [], basics: [], lastNum: null };
  await startQuiz(p);
  for (let n = 0; n < 200; n++) {
    if (await has(p, ".result")) return st;
    st.lastNum = await p.eval(`document.getElementById("q-num")?.textContent.trim() ?? null`);
    st.kinds.push(await answer(p, o, st));
  }
  throw new Error("200단계 안에 결과가 나오지 않았어요");
}
// 검사를 시작한 뒤 답을 채워 결과로 바로 간다(화면 캡처·버튼 검사용). 흐름 자체는 E1이 본다
// o.f는 리커트 답을 내는 식(it, k), o.sector는 끌리는 곳, o.pairs는 가치 짝
async function jumpResult(p, o = {}) {
  o = { ...DEF, ...o };
  await startQuiz(p);
  await p.eval((o) => {
    const f = new Function("it", "k", `return ${o.f || "1 + (k % 5)"}`);
    qa.a = { school: o.school, year: o.year, ...(o.dept ? { dept: o.dept } : {}) };
    LIKERT.forEach((it, k) => (qa.a[it.id] = f(it, k)));
    qa.pairs = o.pairs || Object.fromEntries(Q.pairs.map((_, k) => [k, k % 2]));
    qa.sector = o.sector || ["big"];
    qa.i = steps().length; drawTest(); return 1;
  }, o);
  await p.waitFor(`!!document.querySelector(".result")`, 4000);
  await p.idle();
}
async function tabTo(p, expr, max) {
  for (let n = 0; n <= max; n++) { if (await p.eval(expr)) return true; if (n < max) await p.key("Tab"); }
  return false;
}

// ---------- 시나리오 ----------
const S = {};

S.E1 = async (t) => {
  for (const [w, h] of [[390, 844], [1280, 800]]) await t.part(`${w}`, async () => {
    const p = await open(t, "test", w, h);
    const st = await finish(p);
    t.check(/^(\d+) \/ \1$/.test(st.lastNum || ""), `${w}: 결과 직전 #q-num이 'N / N'이 아니에요: ${st.lastNum}`);
    const r = await p.eval(`({ result: !!document.querySelector(".result"), jobs: document.querySelectorAll('.result a[href^="#jobs-"]').length })`);
    t.check(r.result, `${w}: .result가 없어요`);
    t.check(r.jobs >= 3, `${w}: 결과의 직무 링크 ${r.jobs}개(3개 이상이어야 해요)`);
    const e = site(p);
    t.check(!e.length, `${w}: 사이트 오류 ${e.length}개`);
    t.note(`${w}: ${st.kinds.length}단계, 결과 직전 ${st.lastNum}`);
  });
};

S.E2 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  if (!(await tabTo(p, `!!document.activeElement?.matches("header.hero [data-start]")`, 40))) throw new Error("Tab 40번 안에 header.hero [data-start]에 가지 못했어요");
  await p.key("Enter");
  await p.waitFor(`!!document.querySelector(".quiz")`, 4000);
  await p.idle();
  const lost = [];
  for (let n = 0; n < 200; n++) {
    if (await has(p, ".result")) break;
    const s = await p.eval(`({ kind: document.querySelector(".quiz")?.dataset.kind, i: qa.i, focus: document.activeElement?.id || document.activeElement?.tagName,
      opts: [...document.querySelectorAll("#q-body .qopt")].map((b) => b.dataset.v) })`);
    if (s.focus !== "q-title") lost.push(`${s.i}(${s.kind}):${s.focus}`);
    if (s.kind === "basic" && s.opts.includes(DEF.dept)) {
      if (!(await tabTo(p, `document.activeElement?.dataset?.v === ${JSON.stringify(DEF.dept)}`, 15))) throw new Error("학과 단계에서 Tab 15번 안에 aisw에 가지 못했어요");
      await p.key("Enter");
    } else if (s.kind === "basic") {
      const k = s.opts.findIndex((v) => v === DEF.school || v === DEF.year);
      if (k < 0 || k > 8) throw new Error(`기본 정보 단계 숫자키를 정하지 못했어요: ${s.opts}`);
      await p.key(String(k + 1));
    } else if (s.kind === "chapter") {
      // 5차: 장 안내는 제목에 포커스가 있을 때 Enter로 시작한다(단계 번호는 그대로)
      await p.key("Enter");
      await p.waitFor(`document.querySelector(".quiz")?.dataset.kind !== "chapter"`, 4000);
      await p.idle();
      continue;
    } else if (s.kind === "likert") await p.key("4");
    else if (s.kind === "pairs") await p.key("1");
    else if (s.kind === "sector") {
      await p.key("Tab"); await p.key("Space");
      if (!(await tabTo(p, `document.activeElement?.id === "q-next"`, 20))) throw new Error("끌리는 곳 단계에서 #q-next에 가지 못했어요");
      await p.key("Enter");
    } else if (s.kind === "note") {
      if (!(await tabTo(p, `document.activeElement?.id === "q-next"`, 5))) throw new Error("마지막 단계에서 #q-next에 가지 못했어요");
      await p.key("Enter");
    } else throw new Error(`.quiz[data-kind]가 없거나 모르는 값이에요: ${s.kind}`);
    await moved(p, s.i);
  }
  t.check(await has(p, ".result"), "결과가 나오지 않았어요");
  const f = await p.eval(`document.activeElement?.id || document.activeElement?.tagName`);
  t.check(f === "r-title", `결과 뒤 포커스가 r-title이 아니에요: ${f}`);
  t.check(!lost.length, `단계 시작 때 포커스가 q-title이 아닌 단계 ${lost.length}개: ${lost.slice(0, 5).join(", ")}`);
  t.check(p.keys <= 150, `키 ${p.keys}번(150번 이하여야 해요)`);
  t.note(`키 ${p.keys}번`);
};

S.E3 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  await finish(p);
  const code = await p.eval("encode()"), s1 = await p.eval(SIG);
  t.note(`코드 ${code}`);
  for (const [label, c] of [["그대로", code], ["%2E", code.replace(/\./g, "%2E")], ["&fbclid", code + "&fbclid=x"]]) await t.part(label, async () => {
    const q = await t.page(1280, 800);
    await q.goto(BASE + "#r=" + c);
    await ready(q);
    await q.waitFor(`!!document.querySelector(".result")`, 4000);
    const s2 = await q.eval(SIG);
    t.check(s1 === s2, `${label}: 결과가 달라요 ${s2.slice(0, 120)}`);
    const hero = await q.eval("__hero()");
    t.check(hero === "none", `${label}: header.hero display ${hero}`);
    if (label === "그대로") { const cls = await q.eval(CLS); t.check(cls < 0.05, `첫 로드 CLS ${cls}`); t.note(`CLS ${cls}`); }
  });
};

S.E4 = async (t) => {
  const p = await open(t, "test", 390, 844);
  const tail = await p.eval(`"3".repeat(LIKERT.length) + "." + "0".repeat(Q.pairs.length) + ".1"`);
  for (const code of ["", "1", "2.ssu.-.2." + tail, "1.%3Cx%3E.-.2." + tail]) await t.part(code.slice(0, 12) || "(빈 값)", async () => {
    const q = await t.page(390, 844);
    await q.goto(BASE + "#r=" + code);
    await ready(q);
    const r = await q.eval(() => {
      const m = [...document.querySelectorAll("#v-test *")].find((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.includes("읽지 못했어요")));
      const b = m?.getBoundingClientRect();
      const starts = [...document.querySelectorAll("[data-start]")].filter(__vis).map((e) => !!e.closest("#v-test"));
      return { msg: !!m, inView: !!b && b.top >= 0 && b.bottom <= innerHeight && __vis(m), starts, hero: __hero() };
    });
    const label = JSON.stringify(code.slice(0, 14));
    t.check(r.msg && r.inView, `${label}: '읽지 못했어요'가 ${r.msg ? "첫 화면 밖이에요" : "없어요"}`);
    t.check(r.starts.length === 1 && r.starts[0], `${label}: 보이는 [data-start] ${r.starts.length}개(#v-test 안 1개여야 해요)`);
    t.check(r.hero === "none", `${label}: header.hero display ${r.hero}`);
    const ex = q.errors().filter((e) => e.kind === "예외");
    t.check(!ex.length, `${label}: 예외 ${ex.length}개 ${ex.map(errText).join(" | ").slice(0, 200)}`);
  });
};

S.E5 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  const back = async () => { const i = await stepI(p); await p.eval("history.back(); 1"); await p.waitFor(`qa.i !== ${i}`, 3000).catch(() => {}); await sleep(150); await p.idle(); };
  const pre = () => p.eval(`({ i: qa.i, hero: __vis(document.querySelector("header.hero [data-start]")), quiz: __vis(document.querySelector(".quiz")), result: __vis(document.querySelector(".result")), path: location.pathname })`);
  await startQuiz(p);
  const st = { likert: 0, basics: [] };
  for (let k = 0; k < 3; k++) await answer(p, DEF, st);
  await back();
  const s = await p.eval(`({ i: qa.i, on: document.querySelectorAll('#q-body [aria-pressed="true"], #q-body [aria-checked="true"]').length })`);
  t.check(s.i === 2, `3단계 뒤 back: qa.i ${s.i}(2여야 해요)`);
  t.check(s.on >= 1, "3번째 문항의 답이 aria-pressed/checked=true로 남아 있지 않아요");
  for (let k = 0; k < 3; k++) await back();
  let r = await pre();
  t.check(r.i === -1 && r.hero && !r.quiz, `3번 더 back: 시작 전 화면이 아니에요 ${JSON.stringify(r)}`);
  t.check(r.path === "/jobmap/", `pathname이 바뀌었어요: ${r.path}`);
  await finish(p);
  if (!(await has(p, "#q-again"))) throw new Error("#q-again이 없어요");
  await p.click("#q-again");
  await p.idle();
  await back();
  await sleep(300);
  r = await pre();
  t.check(r.i === -1 && r.hero && !r.quiz && !r.result, `다시 하기 → back: 시작 전 화면이 아니에요 ${JSON.stringify(r)}`);
};

// 4차 결정 9: 다른 학교도 전공 문항(promptName 전공 8 + '비슷한 전공이 없어요')을 묻는다. 분모는 숭실대와 같다.
// 4차 결정 8: 다른 학교 결과에도 '이번 학기 할 일'(#r-todo)이 있고 숭실대 링크는 없다
S.E6 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  const want = await p.eval(`Q.basics.length + LIKERT.length + Q.pairs.length + 1`);
  const majors = await p.eval(`[...D.depts.filter((d) => d.promptName).map((d) => d.id), "none"]`);
  const st = await finish(p, { school: "etc", dept: "jp" });
  const q = st.basics.find((o) => o.includes("jp"));
  t.check(!!q, "다른 학교인데 전공 단계가 없어요");
  if (q) t.check(q.length === majors.length && q.every((v) => majors.includes(v)), `전공 선택지 ${q.join(",")}(전공 8 + none이어야 해요)`);
  const den = +(st.lastNum || "").split("/")[1];
  t.check(den === want, `분모 ${den}(${want}여야 해요)`);
  t.check(await has(p, "#r-todo"), "결과에 #r-todo가 없어요");
  t.check(!(await has(p, ".result a[href*='ssu.ac.kr']")), "다른 학교 결과에 ssu.ac.kr 링크가 있어요");
};

// E7: 화면 6개 × 너비 6개 레이아웃·글씨
const VIEWS = ["test", "map", "jobs", "ai", "faq", "about"];
function measure() {
  const cw = document.documentElement.clientWidth, main = document.querySelector("main")?.getBoundingClientRect();
  const probe = document.createElement("i"); probe.style.color = "var(--text)"; document.body.append(probe);
  const textColor = getComputedStyle(probe).color; probe.remove();
  const fs = (e) => parseFloat(getComputedStyle(e).fontSize);
  const desc = (e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : ""} ${fs(e)}px "${e.textContent.trim().slice(0, 14)}"`;
  const texts = [...document.body.querySelectorAll("*")].filter((e) => !e.closest("svg") && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && __vis(e))
    .filter((e) => { const b = e.getBoundingClientRect(); return !(b.right <= 0 || b.left >= cw || b.bottom + scrollY <= 0); });
  const toc = document.querySelector("nav.toc")?.getBoundingClientRect();
  const start = document.querySelector("header.hero [data-start]");
  return {
    cw, ih: innerHeight, sw: document.documentElement.scrollWidth, main: main && { w: main.width, l: main.left, r: main.right }, bodyW: document.body.getBoundingClientRect().width,
    hasText: !!getComputedStyle(document.documentElement).getPropertyValue("--text").trim(), textColor, bodyColor: getComputedStyle(document.body).color,
    heads: [...document.querySelectorAll("h1, h2")].filter(__vis).filter((e) => getComputedStyle(e).color !== textColor).map(desc),
    sub: document.querySelectorAll(".sub").length + (document.body.classList.contains("sub") ? 1 : 0),
    toc: toc && { top: toc.top, w: toc.width, r: toc.right },
    small: texts.filter((e) => fs(e) < 13).map(desc), pli: texts.filter((e) => /^(P|LI)$/.test(e.tagName) && fs(e) < 16).map(desc),
    sizes: [...new Set(texts.map(fs))].sort((a, b) => a - b),
    family: getComputedStyle(document.body).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, ""),
    fontCheck: document.fonts.check('16px "Pretendard Variable"', "가"),
    fontLoaded: [...document.fonts].some((f) => f.family.replace(/["']/g, "") === "Pretendard Variable" && f.status === "loaded"),
    back: [...document.querySelectorAll('a[href="../"]')].filter(__vis).length,
    startBottom: start && __vis(start) ? start.getBoundingClientRect().bottom : null
  };
}
const list = (a, n = 3) => a.slice(0, n).join(", ") + (a.length > n ? ` 외 ${a.length - n}개` : "");
function layoutChecks(m, w, only) {
  const f = [];
  const want = Math.min(720, m.cw - 40);
  if (m.sw !== m.cw) f.push(`가로 넘침 scrollWidth ${m.sw} > clientWidth ${m.cw}`);
  if (!m.main) f.push("main 없음");
  else {
    if (Math.abs(m.main.w - want) > 1) f.push(`main ${Math.round(m.main.w)}px(기대 ${want}px), body ${Math.round(m.bodyW)}px`);
    const L = m.main.l, R = m.cw - m.main.r;
    if (Math.abs(L - R) > 2) f.push(`좌우 여백 ${Math.round(L)}px / ${Math.round(R)}px`);
  }
  if (only) return f;
  if (!m.hasText || m.bodyColor !== m.textColor) f.push(`body 색 ${m.bodyColor} ≠ --text ${m.hasText ? m.textColor : "(토큰 없음)"}`);
  if (m.heads.length) f.push(`h1·h2 색 ≠ --text: ${list(m.heads)}`);
  if (m.sub) f.push(`.sub ${m.sub}개`);
  if (!m.toc) f.push("nav.toc 없음");
  else if (w >= 1200 && m.main && !(m.toc.r <= m.main.l - 24)) f.push(`목차 오른쪽 ${Math.round(m.toc.r)} > main.left−24 ${Math.round(m.main.l - 24)}`);
  else if (w < 1200 && (Math.abs(m.toc.top) > 0.5 || Math.abs(m.toc.w - m.cw) > 0.5)) f.push(`nav.toc top ${Math.round(m.toc.top)}·폭 ${Math.round(m.toc.w)}(0·${m.cw}이어야 해요)`);
  if (m.small.length) f.push(`13px 미만 ${m.small.length}개: ${list(m.small)}`);
  if (w === 390 && m.pli.length) f.push(`p·li 16px 미만 ${m.pli.length}개: ${list(m.pli)}`);
  if (m.sizes.length > 6) f.push(`글자 크기 ${m.sizes.length}가지: ${m.sizes.join("/")}`);
  if (m.family !== "Pretendard Variable" || !m.fontCheck || !m.fontLoaded) f.push(`글꼴 ${m.family}, check ${m.fontCheck}, 로드 ${m.fontLoaded}`);
  const back = w >= 1200 ? 2 : 1;
  if (m.back !== back) f.push(`보이는 '../' 링크 ${m.back}개(${back}개여야 해요)`);
  return f;
}
S.E7 = async (t) => {
  for (const w of [390, 768, 1024, 1280, 1440, 1920]) await t.part(`${w}`, async () => {
    const h = w === 390 ? 844 : 900;
    const p = await open(t, "test", w, h);
    const key = await p.eval("D.jobs[0].key");
    const rcode = await p.eval(`"1.ssu.aisw.2." + "3".repeat(LIKERT.length) + "." + "0".repeat(Q.pairs.length) + ".1"`);
    for (const view of VIEWS) {
      const e0 = p.errors().length;
      await reload(p, view);
      const cls = view === "test" || view === "map" ? await p.eval(CLS) : null;
      const m = await p.eval(measure);
      const f = layoutChecks(m, w);
      const req = p.errors().slice(e0).filter((e) => e.origin === "site" && /HTTP|요청/.test(e.kind));
      if (req.length) f.push(`사이트 요청 오류 ${req.length}개: ${list(req.map(errText), 2)}`);
      if (cls != null && !(cls < 0.05)) f.push(`첫 로드 CLS ${cls}`);
      if (view === "test" && (w === 390 || w === 1440) && !(m.startBottom != null && m.startBottom <= m.ih)) f.push(`시작 버튼 아래끝 ${m.startBottom == null ? "없음" : Math.round(m.startBottom)} > ${m.ih}`);
      if (f.length) t.fail(`${w} #${view}: ${f.join(" / ")}`);
      else t.note(`${w} #${view}: main ${Math.round(m.main.w)}px, 글자 크기 ${m.sizes.length}가지`);
    }
    await reload(p, "r=" + rcode);
    const cls = await p.eval(CLS);
    if (!(cls < 0.05)) t.fail(`${w} #r=: 첫 로드 CLS ${cls}`);
    await reload(p, "jobs-" + key);
    const j = await p.eval((key) => { const d = document.getElementById("job-" + key); return d && { open: d.open, top: d.getBoundingClientRect().top, cw: document.documentElement.clientWidth }; }, key);
    const off = w <= 1199 ? 56 : 0;
    if (!j) t.fail(`${w} #jobs-${key}: #job-${key} 없음`);
    else if (!j.open || j.top < off - 4 || j.top > off + 24) t.fail(`${w} #jobs-${key}: open ${j.open}, top ${Math.round(j.top)}(${off - 4}~${off + 24}이어야 해요)`);
  });
  await t.part("1280+스크롤바", async () => {
    const b2 = await launch({ scrollbars: true });
    try {
      const p = await open(t, "test", 1280, 900, { browser: b2 });
      for (const view of VIEWS) {
        await reload(p, view);
        const f = layoutChecks(await p.eval(measure), 1280, true);
        if (f.length) t.fail(`1280+스크롤바 #${view}: ${f.join(" / ")}`);
      }
    } finally { await b2.close(); }
  });
};

// E8: 리커트 전환 품질
S.E8 = async (t) => {
  for (const w of [390, 1280]) await t.part(`${w}`, async () => {
    const p = await open(t, "test", w, w < 600 ? 844 : 800);
    await startQuiz(p);
    const st = { likert: 0, basics: [] };
    for (let k = 0; k < 3; k++) await answer(p, DEF, st);
    await pastChap(p); // 5차: 1장 안내
    if ((await kindOf(p)) !== "likert") throw new Error("기본 정보·1장 안내 뒤가 리커트가 아니에요");
    await p.eval(`window.__mon = { sy: [], frames: [], anims: 0, ls: 0, lsAll: 0 }; { const seen = new WeakSet();
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { __mon.lsAll += e.value; if (!e.hadRecentInput) __mon.ls += e.value; })).observe({ type: "layout-shift" });
      (function f() { const q = document.getElementById("q-body"); const run = q ? q.getAnimations({ subtree: true }).filter((a) => a.playState === "running") : [];
        run.forEach((a) => { if (!seen.has(a)) { seen.add(a); __mon.anims++; } });
        __mon.sy.push(scrollY); __mon.frames.push(${RECTS}); requestAnimationFrame(f); })(); } 1`);
    let maxDev = 0, maxDH = 0, noAnim = 0;
    for (let k = 0; k < 10; k++) {
      const before = await p.eval(RECTS), i = await stepI(p), a0 = await p.eval(`__mon.frames = []; __mon.anims`);
      if (!before.quiz || !before.qbar || !before.qtop) throw new Error(`.quiz·.qbar·.qtop 중 없는 것이 있어요 ${JSON.stringify(before)}`);
      await p.click(`#q-body .dot[data-v="${1 + (k % 5)}"]`);
      await moved(p, i);
      const after = await p.eval(RECTS), frames = await p.eval("__mon.frames");
      if ((await p.eval("__mon.anims")) === a0) noAnim++;
      for (const fr of [...frames, after]) for (const [s, props] of [["quiz", "ltw"], ["qbar", "ltwh"], ["qtop", "ltwh"]])
        if (fr[s]) for (const c of props) maxDev = Math.max(maxDev, Math.abs(fr[s][c] - before[s][c]));
      maxDH = Math.max(maxDH, Math.abs(after.quiz.h - before.quiz.h));
    }
    const m = await p.eval(`({ sy: Math.max(...__mon.sy) - Math.min(...__mon.sy), ls: +__mon.ls.toFixed(4), lsAll: +__mon.lsAll.toFixed(4) })`);
    t.check(m.sy <= 1, `${w}: scrollY 변화 ${m.sy}px`);
    t.check(maxDH <= 40, `${w}: .quiz 높이 변화 ${Math.round(maxDH)}px`);
    t.check(!noAnim, `${w}: #q-body 애니메이션이 없던 전환 ${noAnim}번`);
    t.check(maxDev <= 0.5, `${w}: 틀 위치 변화 ${maxDev.toFixed(2)}px`);
    t.check(m.ls < 0.1, `${w}: layout-shift 합 ${m.ls}`);
    t.note(`${w}: scrollY ${m.sy}, 높이 변화 ${Math.round(maxDH)}, 틀 ${maxDev.toFixed(2)}px, layout-shift ${m.ls}(입력 직후 포함 ${m.lsAll})`);
    // 같은 점 3번 연타 → 1단계만
    let i0 = await stepI(p);
    for (let n = 0; n < 3; n++) { await p.click(`#q-body .dot[data-v="3"]`).catch(() => {}); await sleep(50); }
    await sleep(1200); await p.idle();
    const i1 = await stepI(p);
    t.check(i1 === i0 + 1, `${w}: 3번 연타에 ${i1 - i0}단계 넘어갔어요`);
    // 250ms 안에 바꾸면 마지막 답
    const snap = await p.eval("JSON.stringify(qa.a)");
    i0 = await stepI(p);
    // 두 클릭을 한 번의 eval 안에서 보내 CDP 왕복 지연을 뺀다. 두 번째는 페이지 안 setTimeout(100)(4차 결정 28·C21)
    await p.eval(`new Promise((r) => { document.querySelector('#q-body .dot[data-v="1"]').click(); setTimeout(() => { document.querySelector('#q-body .dot[data-v="5"]').click(); r(1); }, 100); })`);
    await moved(p, i0);
    const diff = await p.eval((s) => { const o = JSON.parse(s); return Object.entries(qa.a).filter(([k, v]) => o[k] !== v).map(([k, v]) => [k, v]); }, snap);
    t.check(diff.length === 1 && diff[0][1] === 5, `${w}: 250ms 안에 바꾼 답 저장 ${JSON.stringify(diff)}`);
  });
};

// E9: reduced-motion
S.E9 = async (t) => {
  const p = await open(t, "test", 1280, 800, { media: { reducedMotion: "reduce" } });
  await p.eval(`window.__anims = []; { const seen = new WeakSet(); (function f() { for (const a of document.getAnimations()) if (!seen.has(a)) { seen.add(a); const e = a.effect;
    __anims.push({ type: a.constructor.name, target: e?.target?.id || String(e?.target?.className || e?.target?.tagName || ""), dur: e?.getTiming().duration,
      transform: (e?.getKeyframes?.() || []).some((k) => ["transform", "translate", "scale", "rotate"].some((x) => k[x] && k[x] !== "none")) }); }
    requestAnimationFrame(f); })(); } 1`);
  await startQuiz(p);
  const st = { likert: 0, basics: [] };
  for (let k = 0; k < 5; k++) await answer(p, DEF, st);
  const an = await p.eval("__anims");
  // CSS 전환(transition)은 움직임이 아닌 색 변화가 많아 transform만 본다
  const bad = an.filter((a) => a.transform || (a.type !== "CSSTransition" && +a.dur > 120));
  t.check(!bad.length, `움직임 줄이기에서 어긋난 애니메이션 ${bad.length}개: ${list(bad.map((a) => `${a.type} ${a.target} ${a.dur}ms${a.transform ? " transform" : ""}`))}`);
  t.note(`애니메이션 ${an.length}개 관찰`);
};

// E10: 스크린샷
S.E10 = async (t) => {
  const made = [];
  const shot = async (p, name, w, theme, full = false) => made.push(await p.shot(join(OUT, `${w}-${theme}-${name}.png`), { full }));
  const runs = [[390, "light"], [768, "light"], [1280, "light"], [1440, "light"], [1920, "light"], [390, "dark"], [1280, "dark"]];
  for (const [w, theme] of runs) await t.part(`${w}-${theme}`, async () => {
    const p = await open(t, "test", w, w < 600 ? 844 : 900, { media: { colorScheme: theme } });
    await shot(p, "home", w, theme);
    await startQuiz(p); await shot(p, "quiz-basic", w, theme);
    const st = { likert: 0, basics: [] };
    for (let k = 0; k < 3; k++) await answer(p, DEF, st);
    await shot(p, "quiz-chapter", w, theme); // 5차: 1장 안내
    await pastChap(p);
    await shot(p, "quiz-likert", w, theme);
    await p.eval(() => { LIKERT.forEach((it, k) => (qa.a[it.id] = 1 + (k % 5))); qa.pairs = {}; qa.i = steps().findIndex((s) => s.kind === "pairs" || s.pairs); if (qa.i < 0) throw new Error("짝 단계를 찾지 못했어요"); drawTest(); return 1; });
    await p.idle(); await shot(p, "quiz-pairs", w, theme);
    await p.eval(() => { qa.pairs = Object.fromEntries(Q.pairs.map((_, k) => [k, k % 2])); qa.sector = ["big"]; qa.i = steps().length; drawTest(); return 1; });
    await p.waitFor(`!!document.querySelector(".result")`, 4000); await p.idle();
    await shot(p, "result", w, theme, true);
    if (w === 1280 && theme === "light") {
      await p.media({ media: "print" }); await sleep(300);
      made.push(await p.shot(join(OUT, `1280-print-result.png`), { full: true }));
      await p.media({ colorScheme: theme });
    }
    const key = await p.eval("D.jobs[0].key");
    for (const [name, hash] of [["map", "map"], ["jobs", "jobs-" + key], ["ai", "ai"], ["faq", "faq"], ["about", "about"]]) {
      await p.eval(`location.hash = ${JSON.stringify(hash)}; 1`); await sleep(400); await p.idle();
      await shot(p, name, w, theme);
    }
  });
  const empty = made.filter((f) => !existsSync(f) || !statSync(f).size);
  t.check(!empty.length, `빈 캡처 ${empty.length}개`);
  t.note(`캡처 ${made.length}장 → ${OUT}`);
};

// E11: 결과 버튼
S.E11 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  await jumpResult(p);
  await t.part("r-pk", async () => {
    const n = await p.eval(`document.querySelectorAll("#r-pk button").length`);
    const texts = [];
    for (let k = 0; k < n; k++) { await p.click(`#r-pk button:nth-of-type(${k + 1})`); await sleep(100); texts.push(await p.eval(`document.getElementById("r-text")?.textContent`)); }
    t.check(n === 5 && new Set(texts).size === n, `#r-pk 칩 ${n}개, 서로 다른 #r-text ${new Set(texts).size}개`);
  });
  await t.part("r-copy", async () => {
    const b = await p.eval(`document.getElementById("r-copy")?.textContent`);
    await p.click("#r-copy"); await sleep(400);
    const a = await p.eval(`document.getElementById("r-copy")?.textContent`);
    t.check(a !== b, `#r-copy 문구가 그대로예요: ${a}`);
  });
  await t.part("r-card", async () => {
    await p.eval(() => {
      window.__card = null;
      Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
      Object.defineProperty(navigator, "share", { value: async (d) => { window.__card = d?.files?.[0] || null; }, configurable: true });
      const click0 = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () { if (this.download) { fetch(this.href).then((r) => r.blob()).then((b) => (window.__card = b)); return; } return click0.call(this); };
      return 1;
    });
    await p.click("#r-card");
    await p.waitFor("!!window.__card", 8000);
    const c = await p.eval(async () => { const f = window.__card, b = await createImageBitmap(f); return { type: f.type, size: f.size, w: b.width, h: b.height }; });
    t.check(c.type === "image/png" && c.size > 20000, `카드 ${c.type} ${c.size}바이트`);
    t.check(c.w === 1080 && c.h === 1350, `카드 크기 ${c.w}×${c.h}`);
    t.note(`카드 ${c.type} ${c.size}바이트 ${c.w}×${c.h}`);
    const sc = await p.eval(async () => { if (typeof shareCanvas !== "function") return null; const cv = await shareCanvas(compute(qa.a, qa.sector, qa.pairs)); return [cv?.width, cv?.height]; });
    if (sc) t.check(sc[0] === 1080 && sc[1] === 1350, `shareCanvas ${sc.join("×")}`);
    const f = await p.eval(() => { const names = compute(qa.a, qa.sector, qa.pairs).top3.map((x) => x.job.name).join("");
      return { check: document.fonts.check('700 56px "Pretendard Variable"', names), face: [...document.fonts].some((x) => x.family.replace(/["']/g, "") === "Pretendard Variable") }; });
    t.check(f.check && f.face, `카드 글꼴 check ${f.check}, Pretendard 선언 ${f.face}`);
  });
  await t.part("q-map", async () => {
    const dept = await p.eval("qa.a.dept");
    await p.click("#q-map");
    // 4차 QA D7: 학과 주소(#map-<id>)로 가고 고르기 줄이 접혀요(결정 23 예외 ③, T19)
    await p.waitFor(`location.hash === "#map-${dept}"`, 3000);
    await p.idle();
    const on = await p.eval(`[...document.querySelectorAll('#dept button[aria-pressed="true"]')].map((b) => b.dataset.v)`);
    t.check(on.length === 1 && on[0] === dept, `학과 지도 aria-pressed ${on.join(",")} ≠ ${dept}`);
    const fold = await p.eval(`$("pick").hidden && !$("pick-sum").hidden`);
    t.check(fold, "결과에서 연 학과 지도의 고르기 줄이 접히지 않았어요");
  });
};

// E12: 대비
function contrast(nontext) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const g = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = "rgba(0,0,0,0)"; g.fillStyle = c || "rgba(0,0,0,0)"; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bot) => [0, 1, 2].map((k) => top[k] * top[3] + bot[k] * (1 - top[3]));
  const bgOf = (e) => { const st = []; for (let n = e; n; n = n.parentElement) st.push(rgba(getComputedStyle(n).backgroundColor)); return st.reduceRight((c, x) => over(x, c), [255, 255, 255]); };
  const lum = (c) => { const [r, g2, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g2 + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const tok = (n) => over(rgba(getComputedStyle(document.documentElement).getPropertyValue(n).trim()), [255, 255, 255]);
  const bad = [];
  const cw = document.documentElement.clientWidth;
  for (const e of document.body.querySelectorAll("*")) {
    if (e.closest("svg") || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || !__vis(e)) continue;
    const b = e.getBoundingClientRect(); if (b.right <= 0 || b.left >= cw || b.bottom + scrollY <= 0) continue;
    const s = getComputedStyle(e), fs = parseFloat(s.fontSize), bg = bgOf(e);
    const r = ratio(over(rgba(s.color), bg), bg), need = fs >= 24 || (+s.fontWeight >= 700 && fs >= 18.66) ? 3 : 4.5;
    if (r < need) bad.push(`${e.tagName.toLowerCase()}${typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : ""} "${e.textContent.trim().slice(0, 12)}" ${r.toFixed(2)}<${need}`);
  }
  const nt = {
    ".dot i": () => { const e = document.querySelector(".dot i"); return e && ratio(over(rgba(getComputedStyle(e).borderTopColor), tok("--surface")), tok("--surface")); },
    // 5차: 진행 막대가 장별 5칸(i = 칸 바탕, b = 채움)이라 채움 b를 본다
    ".qbar b": () => { const e = document.querySelector(".qbar b"); return e && ratio(over(rgba(getComputedStyle(e).backgroundColor), tok("--surface-2")), tok("--surface-2")); },
    "체크(--on-acc/--acc)": () => getComputedStyle(document.documentElement).getPropertyValue("--on-acc").trim() ? ratio(tok("--on-acc"), tok("--acc")) : null,
    ".pips i.on": () => { const e = document.querySelector(".pips i.on"); return e && ratio(over(rgba(getComputedStyle(e).backgroundColor), tok("--surface")), tok("--surface")); }
  };
  const non = nontext.map((k) => { const r = nt[k](); return r == null ? `${k} 없음` : r < 3 ? `${k} ${r.toFixed(2)}<3` : null; }).filter(Boolean);
  return { bad, non };
}
S.E12 = async (t) => {
  for (const theme of ["light", "dark"]) await t.part(theme, async () => {
    const p = await open(t, "test", 1280, 900, { media: { colorScheme: theme } });
    const run = async (label, nontext) => {
      const r = await p.eval(contrast, nontext);
      if (r.bad.length) t.fail(`${theme} ${label}: 텍스트 대비 미달 ${r.bad.length}개: ${list(r.bad, 6)}`);
      if (r.non.length) t.fail(`${theme} ${label}: 비텍스트 ${r.non.join(", ")}`);
    };
    await run("home", ["체크(--on-acc/--acc)"]);
    await startQuiz(p);
    const st = { likert: 0, basics: [] };
    for (let k = 0; k < 3; k++) await answer(p, DEF, st);
    await run("quiz-chapter", []); // 5차: 1장 안내
    await pastChap(p);
    await run("quiz-likert", [".dot i", ".qbar b"]);
    await reload(p, "jobs");
    await run("jobs", []);
    await reload(p, "test");
    await jumpResult(p);
    await run("result", [".pips i.on"]);
  });
};

S.E13 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  await finish(p, { dept: "none" });
  // 5차: .r-week가 학년 할 일까지 담은 카드라 이번 주 목록(.r-week > ol > li)만 센다
  const r = await p.eval(`({ text: document.querySelector(".result")?.textContent.trim().length || 0, week: document.querySelectorAll(".r-week > ol > li").length,
    map: !!document.querySelector('.nodept a[href="#map-none"]'), jobs: !!document.querySelector('.nodept a[href="#jobs"]') })`); // 4차 QA(페르소나 D1): '내 학과가 없어요' 지도 주소(결정 23 예외 ③)
  t.check(r.text > 0, "결과가 비어 있어요");
  t.check(r.week >= 2, `.r-week li ${r.week}개(2개 이상이어야 해요)`);
  t.check(r.map && r.jobs, `.nodept 링크 #map-none ${r.map}, #jobs ${r.jobs}`);
};

// ---------- 4차 시나리오(E14~E20·E22~E26) ----------
// C16: 새 상태도 E7과 같은 잣대로 본다(가운데 정렬·가로 넘침·글자 크기 6가지 이하·390 p·li 16px 이상)
function looks(t, label, m, w) {
  const f = layoutChecks(m, w, true);
  if (m.sizes.length > 6) f.push(`글자 크기 ${m.sizes.length}가지: ${m.sizes.join("/")}`);
  if (w === 390 && m.pli.length) f.push(`p·li 16px 미만 ${m.pli.length}개: ${list(m.pli)}`);
  if (f.length) t.fail(`C16 ${label}: ${f.join(" / ")}`);
  else t.note(`${label}: 글자 크기 ${m.sizes.length}가지`);
}
const noErr = (t, p, label, from = 0) => { const e = p.errors().slice(from).filter((x) => x.origin === "site"); t.check(!e.length, `${label}: 사이트 오류 ${e.length}개 ${list(e.map(errText), 2)}`); };
const READY4 = "/^[a-z]/.test(it.id) ? 4 : 1 + (k % 5)"; // 준비 문항(소문자 id)은 4, 흥미는 1~5 돌림
const M4 = "it.id === 'm4' ? 2 : /^[a-z]/.test(it.id) ? 4 : 1 + (k % 5)";
// 사장 경로: 숭실대 AI소프트웨어 2학년·대기업, 흥미 R2 I5 A3 S2 E3 C4, 준비 모두 4(기획 s-aisw.json과 같은 답)
const BOSS = { f: "({ R: 2, I: 5, A: 3, S: 2, E: 3, C: 4 })[it.id[0]] ?? 4", pairs: { 0: 1, 1: 0, 2: 1, 3: 0, 4: 0, 5: 1 } };

// E14(사장 조건): 공개 판이 만든 v1 링크가 열리고 답·학교·학과·학년이 같다. 다시 복사하면 v2이고 같은 결과가 열린다(결정 12)
S.E14 = async (t) => {
  for (const w of [390, 1280]) for (const g of V1) await t.part(`${w} ${g.code.slice(0, 16)}`, async () => {
    const p = await open(t, "r=" + g.code, w, w < 600 ? 844 : 800);
    await p.waitFor(`!!document.querySelector(".result, .rfail")`, 4000);
    // 5차: 직무 카드 3장(.r-top3 .jobcard)이 '왜' 칸 3개(.rwhy .rw-top)로 바뀌었다
    const r = await p.eval(() => ({ ok: !!document.querySelector(".result"), fail: !!document.querySelector(".rfail"), hero: __hero(), jobs: document.querySelectorAll(".rwhy > li > .rw-top").length,
      school: qa.a.school, dept: qa.a.dept ?? null, year: parseInt(qa.a.year), lk: LIKERT.map((it) => qa.a[it.id]).join("") }));
    t.check(r.ok && !r.fail && r.jobs === 3, `${w} ${g.code.slice(0, 16)}…: 결과가 안 열려요 ${JSON.stringify(r).slice(0, 80)}`);
    t.check(r.hero === "none", `${w}: 히어로가 보여요(${r.hero})`);
    t.check(r.lk === g.code.split(".")[4] && r.school === g.school && r.dept === g.dept && r.year === g.year, `${w} ${g.code.slice(0, 16)}…: 답·학교·학과·학년이 달라요`);
    if (w === 1280) {
      const s1 = await p.eval(SIG), v2 = await p.eval("encode()");
      t.check(v2.startsWith("2.") && v2.endsWith(".-.0000"), `다시 만든 링크 ${v2.slice(0, 12)}…${v2.slice(-10)}`);
      const q = await open(t, "r=" + v2, 1280, 800);
      await q.waitFor(`!!document.querySelector(".result")`, 4000);
      const s2 = await q.eval(SIG), lk2 = await q.eval(`LIKERT.map((it) => qa.a[it.id]).join("")`);
      t.check(s2 === s1 && lk2 === r.lk, `v1과 v2로 연 결과가 달라요 ${s2.slice(0, 80)}`);
      noErr(t, q, "v2");
      await q.close();
    }
    noErr(t, p, `${w} v1`);
    await p.close();
  });
  t.note(`v1 링크 ${V1.length}개 × 390·1280`);
};

// E15: 할 일 체크가 링크로 왕복한다. 1280×800 사장 경로 첫 결과에서 '결과 링크 복사'가 첫 화면 안(C6)
S.E15 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  await jumpResult(p, BOSS);
  await p.eval("scrollTo(0, 0); 1");
  const b = await p.eval(`Math.round(document.getElementById("r-link")?.getBoundingClientRect().bottom ?? -1)`);
  t.check(b > 0 && b <= 800, `1280×800 사장 경로 #r-link 아래끝 ${b}(800 이하여야 해요)`);
  t.note(`사장 경로 #r-link 아래끝 ${b}`);
  looks(t, "1280 결과", await p.eval(measure), 1280);
  await p.waitFor(`!!document.querySelector("#r-todo input")`, 4000);
  await p.click("#r-todo li:nth-child(2) input");
  await p.eval(`Object.defineProperty(navigator, "clipboard", { value: { writeText: async (s) => { window.__copied = s; } }, configurable: true }); 1`);
  await p.click("#r-link");
  await p.waitFor("!!window.__copied", 3000);
  const url = await p.eval("window.__copied");
  t.check(/#r=2\./.test(url) && !/\.-\.\d{4}$/.test(url), `복사한 링크에 체크가 없어요 …${url.slice(-20)}`);
  const q = await open(t, url.split("#")[1], 390, 844);
  await q.waitFor(`!!document.querySelector("#r-todo input")`, 4000);
  const on = await q.eval(`[...document.querySelectorAll("#r-todo input")].map((x) => x.checked)`);
  t.check(on[1] === true && on.filter(Boolean).length === 1, `새 탭 체크 ${JSON.stringify(on)}`);
  looks(t, "390 링크로 연 결과", await q.eval(measure), 390);
  await q.click("#r-todo li:nth-child(1) input");
  const h = await q.eval("location.hash");
  t.check(/\.[0-9a-z]{4}_[0-9a-z]{4}\.\d{4}$/.test(h), `링크로 연 화면에서 체크해도 주소가 그대로예요 …${h.slice(-24)}`);
  // 마음 칸 경로(m4=2)는 값만 적는다. 800을 넘으면 사장 확인(결정 2, 사장 답 9번: 그대로 둠)
  const m = await open(t, "test", 1280, 800);
  await jumpResult(m, { ...BOSS, f: `it.id === "m4" ? 2 : ${BOSS.f}` });
  await m.eval("scrollTo(0, 0); 1");
  t.note(`마음 칸 경로 #r-link 아래끝 ${await m.eval(`Math.round(document.getElementById("r-link")?.getBoundingClientRect().bottom ?? -1)`)}`);
  noErr(t, p, "1280"); noErr(t, q, "390"); noErr(t, m, "마음 칸");
};

// E16: 화면 안 해시가 제 화면을 연다(Q21·Q22). 학과 주소(결정 7)와 없는 id(C18)도
S.E16 = async (t) => {
  const HASHES = [["map-cases", "map"], ["faq-terms", "faq"], ["ai-want", "ai", "ai-want"], ["jobs-sales", "jobs"], ["about", "about"], ["nope-x", "test"],
    ["map-aisw", "map"], ["map-etc-aisw", "map"], ["map-zzz", "map"]];
  for (const w of [390, 1280]) for (const [hash, view, id] of HASHES) await t.part(`#${hash} ${w}`, async () => {
    const p = await open(t, hash, w, w < 600 ? 844 : 800);
    await sleep(300);
    const r = await p.eval((id) => ({ view: document.body.dataset.view, sy: Math.round(scrollY), top: id ? Math.round(document.getElementById(id)?.getBoundingClientRect().top ?? -999) : null,
      cur: [...document.querySelectorAll("#tabs a")].map((a) => a.getAttribute("aria-current")),
      school: [...document.querySelectorAll('#school button[aria-pressed="true"]')].map((b) => b.dataset.v), dept: [...document.querySelectorAll('#dept button[aria-pressed="true"]')].map((b) => b.dataset.v) }), id || "");
    t.check(r.view === view, `#${hash} ${w}: view ${r.view}(${view}이어야 해요)`);
    const off = w < 1200 ? 68 : 24;
    if (id) t.check(Math.abs(r.top - off) <= 4, `#${hash} ${w}: 제목 위치 ${r.top}(${off}±4)`);
    t.check(r.cur.filter((x) => x === "page").length === 1 && r.cur.every((x) => x === null || x === "page"), `#${hash} ${w}: aria-current ${JSON.stringify(r.cur)}`);
    if (hash === "map-aisw") t.check(r.school.join() === "ssu" && r.dept.join() === "aisw", `#${hash} ${w}: 눌린 칩 학교 ${r.school} 학과 ${r.dept}`);
    if (hash === "map-etc-aisw") t.check(r.school.join() === "etc", `#${hash} ${w}: 눌린 학교 칩 ${r.school}(etc여야 해요)`);
    if (hash === "map-zzz") t.check(r.sy === 0, `#${hash} ${w}: scrollY ${r.sy}(0이어야 해요)`);
    noErr(t, p, `#${hash} ${w}`);
    await p.close();
  });
};

// E17: 칩을 키보드로 눌러도 포커스가 같은 칩에 남는다(Q23)
S.E17 = async (t) => {
  for (const [hash, sel] of [["map", "#college button:nth-child(3)"], ["map", "#school button:last-child"], ["jobs", "#jdtools button:nth-child(2)"]]) await t.part(sel, async () => {
    const p = await open(t, hash, 1280, 800);
    const v = await p.eval((s) => { const b = document.querySelector(s); b.focus(); return b.dataset.v; }, sel);
    await p.key("Enter");
    await sleep(150);
    const a = await p.eval(`({ tag: document.activeElement.tagName, v: document.activeElement.dataset?.v, pressed: document.activeElement.getAttribute("aria-pressed") })`);
    t.check(a.tag === "BUTTON" && a.v === v && a.pressed === "true", `${sel}: 포커스 ${JSON.stringify(a)}`);
  });
};

// E18: '캘린더에 넣기' .ics와 '구글 캘린더' 링크(결정 14·15, C15). 기본·마음 칸·다른 학교 + 전공 세 경로
const ICS_HOOK = () => {
  window.__ics = null; window.__name = null;
  const c0 = URL.createObjectURL;
  URL.createObjectURL = (b) => { if (b instanceof Blob && /calendar/.test(b.type)) b.text().then((s) => (window.__ics ??= s)); return c0.call(URL, b); };
  const k0 = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (!this.download) return k0.call(this); window.__name = this.download; fetch(this.href).then((r) => r.text()).then((s) => (window.__ics ??= s)); };
  return 1;
};
function icsChecks(ics, gcal, names) {
  const f = [], lines = ics.split("\r\n"), un = ics.replace(/\r\n[ \t]/g, "");
  const today = new Date(), ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  if (!ics.startsWith("BEGIN:VCALENDAR\r\n") || !ics.endsWith("END:VCALENDAR\r\n")) f.push("VCALENDAR 틀이 아니에요");
  if (/\r(?!\n)|(?<!\r)\n/.test(ics)) f.push("CRLF가 아닌 줄바꿈이 있어요");
  const long = lines.filter((l) => Buffer.byteLength(l) > 75);
  if (long.length) f.push(`75바이트 넘는 줄 ${long.length}개`);
  if ((un.match(/^BEGIN:VEVENT$/gm) || []).length !== 2) f.push(`VEVENT ${(un.match(/^BEGIN:VEVENT$/gm) || []).length}개(2개여야 해요)`);
  const uid = [...un.matchAll(/^UID:(.+)$/gm)].map((m) => m[1]);
  if (uid.length !== 2 || new Set(uid).size !== 2) f.push(`UID ${uid.join(", ")}`);
  const start = [...un.matchAll(/^DTSTART;VALUE=DATE:(\d{8})$/gm)].map((m) => m[1]);
  if (start.length !== 2 || start.some((d) => d < ymd)) f.push(`DTSTART;VALUE=DATE ${start.join(",") || "없음"}(오늘 ${ymd} 이후 2개)`);
  if ((un.match(/^DTEND;VALUE=DATE:\d{8}$/gm) || []).length !== 2) f.push("DTEND;VALUE=DATE가 2개가 아니에요");
  const alarms = [...un.matchAll(/^BEGIN:VALARM$([\s\S]*?)^END:VALARM$/gm)].map((m) => m[1]);
  if (alarms.length !== 2 || alarms.some((a) => !/^ACTION:DISPLAY$/m.test(a) || !/^DESCRIPTION:.+$/m.test(a))) f.push(`VALARM ${alarms.length}개, ACTION:DISPLAY·DESCRIPTION이 모두 있어야 해요`);
  const texts = [...un.matchAll(/^(?:SUMMARY|DESCRIPTION)[;:](.*)$/gm)].map((m) => m[1]).join("\n");
  let g = null;
  try { g = new URL(gcal); } catch { f.push(`#r-gcal 주소가 아니에요: ${gcal}`); }
  if (g && g.searchParams.get("action") !== "TEMPLATE") f.push(`#r-gcal action ${g.searchParams.get("action")}`);
  const gtexts = g ? [...g.searchParams.values()].join("\n") : "";
  for (const [where, raw, txt] of [["파일", un, texts], ["#r-gcal", gcal || "", gtexts]]) {
    for (const s of ["#r=", "%23r%3D", "#s=", "%23s%3D"]) if (raw.toUpperCase().includes(s.toUpperCase()) || txt.includes(s)) f.push(`${where}에 ${s}`);
    for (const s of ["109", "상담센터", ...names]) if (txt.includes(s)) f.push(`${where}에 '${s}'`);
  }
  return f;
}
S.E18 = async (t) => {
  for (const [label, o] of [["기본", { f: READY4 }], ["마음 칸", { f: M4 }], ["다른 학교 + 전공", { school: "etc", dept: "aisw", f: READY4 }]]) await t.part(label, async () => {
    const p = await open(t, "test", 1280, 800);
    await jumpResult(p, o);
    await p.eval(ICS_HOOK);
    await p.waitFor(`!!document.getElementById("r-cal")`, 4000);
    await p.click("#r-cal");
    await p.waitFor("!!window.__ics", 4000);
    const r = await p.eval(() => { const d = D.depts.find((x) => x.id === qa.a.dept);
      return { name: window.__name, ics: window.__ics, gcal: document.getElementById("r-gcal")?.href || "", names: d ? [d.name, (d.promptName || "").replace(/ 전공$/, "")].filter(Boolean) : [] }; });
    if (r.name) t.check(r.name.endsWith(".ics"), `${label}: 파일 이름 ${r.name}`);
    const f = icsChecks(r.ics, r.gcal, r.names);
    if (f.length) t.fail(`${label}: ${f.join(" / ")}`);
    else t.note(`${label}: ${r.ics.length}자`);
    noErr(t, p, label);
  });
};

// E19: 친구용 링크는 답 없이 직무 3개와 끌림 막대만, '나도 해 보기'가 검사를 시작한다(결정 13). 5차: 육각형(.hexchart) → 끌림 막대(.dbars)
S.E19 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  const code = await p.eval(() => { const a = { school: "ssu" }; LIKERT.forEach((it, k) => (a[it.id] = 1 + (k % 5))); return encodeFriend(compute(a, ["big"], {})); });
  t.check(code.length <= 40, `친구용 코드 ${code.length}자(40자 이하여야 해요)`);
  const q = await open(t, "s=" + code, 390, 844);
  await q.waitFor(`!!document.querySelector(".friend")`, 4000);
  // 5차: 1위는 색면 제목(#r-title), 2·3위는 링크(.rh-next)라 직무 3개 = 제목 1 + 링크 2
  const r = await q.eval(() => ({ jobs: (document.querySelector(".friend #r-title")?.textContent.trim() ? 1 : 0) + document.querySelectorAll('.friend .rh-next a[href^="#jobs-"]').length, hex: !!document.querySelector(".friend .dbars"),
    ready: !!document.querySelector("#r-ready, .rtiles, .gauges, #r-todo, #r-link"), hero: __hero() }));
  t.check(r.jobs === 3 && r.hex && !r.ready && r.hero === "none", `친구용 화면 ${JSON.stringify(r)}`);
  looks(t, "390 친구용", await q.eval(measure), 390);
  await q.click(".friend [data-start]");
  await q.waitFor(`!!document.querySelector(".quiz")`, 4000);
  noErr(t, q, "친구용");
  t.note(`친구 링크 ${code}`);
};

// E20: 화면 6개 탭 제목이 모두 다르고, 목차 Enter 뒤 포커스가 그 화면 h1, 건너뛰기 뒤 주소 그대로(Q22·Q37)
S.E20 = async (t) => {
  const p = await open(t, "about", 1280, 800);
  const titles = [];
  for (const v of VIEWS) await t.part(v, async () => {
    await p.eval((v) => { document.querySelector(`#tabs a[href="#${v}"]`).focus(); return 1; }, v);
    await p.key("Enter");
    await p.waitFor(`document.body.dataset.view === ${JSON.stringify(v)}`, 3000);
    await sleep(250); await p.idle();
    const r = await p.eval(() => ({ title: document.title, tag: document.activeElement?.tagName, vis: __vis(document.activeElement) }));
    titles.push(r.title);
    t.check(r.tag === "H1" && r.vis, `#${v}: 목차 Enter 뒤 포커스 ${r.tag}${r.vis ? "" : "(안 보임)"}`);
  });
  t.check(new Set(titles).size === VIEWS.length, `탭 제목 ${new Set(titles).size}가지: ${titles.join(" | ")}`);
  await reload(p, "jobs");
  await p.eval(`document.querySelector("a.skip").focus(); 1`);
  await p.key("Enter");
  await sleep(200);
  const s = await p.eval(`({ hash: location.hash, focus: document.activeElement?.id })`);
  t.check(s.hash === "#jobs" && s.focus === "main", `건너뛰기 뒤 주소 ${s.hash}, 포커스 ${s.focus}`);
  noErr(t, p, "E20");
};

// E22: 390에서 Tab으로 목차 '많이 묻는 것'에 가면 화면 안에 보인다(Q24)
S.E22 = async (t) => {
  const p = await open(t, "test", 390, 844);
  if (!(await tabTo(p, `!!document.activeElement?.matches('#tabs a[href="#faq"]')`, 40))) throw new Error("Tab 40번 안에 목차 '많이 묻는 것'에 가지 못했어요");
  await sleep(300);
  const r = await p.eval(`(() => { const b = document.activeElement.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right) }; })()`);
  t.check(r.l >= 0 && r.r <= 390, `포커스한 탭 가로 ${r.l}~${r.r}(0~390 안이어야 해요)`);
};

// E23: 다른 학교 × 전공 8개 학과 지도(결정 7·32). 숭실 낱말은 학교 칩 '숭실대학교'와 .note-school 제목만 허용
const SSU_TEXT = (re) => {
  let s = document.querySelector("main").innerText;
  for (const e of [document.querySelector('#school button[data-v="ssu"]'), ...document.querySelectorAll(".note-school b")]) if (e?.innerText) s = s.replace(e.innerText, "");
  return (s.match(new RegExp(re, "g")) || []).slice(0, 3);
};
S.E23 = async (t) => {
  for (const w of [390, 1280]) await t.part(`${w}`, async () => {
    const h = w < 600 ? 844 : 800;
    const depts = await (async () => { const p = await open(t, "map", w, h); const d = await p.eval(`D.depts.filter((d) => d.promptName).map((d) => ({ id: d.id, paths: (d.paths || []).length, cases: (d.cases || []).length }))`); await p.close(); return d; })();
    t.check(depts.length === 8, `${w}: 전공 ${depts.length}개(8개여야 해요)`);
    for (const d of depts) {
      const p = await open(t, "map-etc-" + d.id, w, h);
      await sleep(300);
      const r = await p.eval(() => ({ view: document.body.dataset.view, empty: document.querySelectorAll("#out .empty").length, path: document.querySelectorAll("#out .path").length,
        cases: document.querySelectorAll("#out .case").length, ssuA: document.querySelectorAll("#v-map a[href*='ssu.ac.kr']").length,
        school: [...document.querySelectorAll('#school button[aria-pressed="true"]')].map((b) => b.dataset.v), dept: [...document.querySelectorAll('#dept button[aria-pressed="true"]')].map((b) => b.dataset.v) }));
      const words = await p.eval(SSU_TEXT, SSU_RE.source);
      const L = `${w} #map-etc-${d.id}`;
      t.check(r.view === "map" && r.empty === 0, `${L}: view ${r.view}, .empty ${r.empty}`);
      t.check(r.path === d.paths && r.cases === d.cases, `${L}: .path ${r.path}/${d.paths}, 사례 ${r.cases}/${d.cases}`);
      t.check(r.ssuA === 0 && !words.length, `${L}: ssu.ac.kr 링크 ${r.ssuA}, 숭실 낱말 ${words.join(",")}`);
      t.check(r.school.join() === "etc" && r.dept.join() === d.id, `${L}: 눌린 칩 학교 ${r.school} 학과 ${r.dept}`);
      if (d.id === "jp" || d.id === "aisw") looks(t, L, await p.eval(measure), w);
      noErr(t, p, L);
      await p.close();
    }
    const p = await open(t, "map-aisw", w, h);
    await sleep(300);
    const on = await p.eval(`[...document.querySelectorAll('#school button[aria-pressed="true"], #dept button[aria-pressed="true"]')].map((b) => b.dataset.v).join()`);
    t.check(on === "ssu,aisw", `${w} #map-aisw: 눌린 칩 ${on}`);
    await p.close();
  });
  await t.part("결과 → 진로 지도", async () => {
    const p = await open(t, "test", 1280, 800);
    await jumpResult(p, { school: "etc", dept: "jp", f: READY4 });
    await p.click("#q-map");
    await p.waitFor(`document.body.dataset.view === "map"`, 3000);
    await p.idle();
    const on = await p.eval(`[...document.querySelectorAll('#school button[aria-pressed="true"], #dept button[aria-pressed="true"]')].map((b) => b.dataset.v).join()`);
    t.check(on === "etc,jp", `다른 학교 결과에서 연 학과 지도의 눌린 칩 ${on}(etc,jp여야 해요)`);
    noErr(t, p, "결과 → 진로 지도");
  });
};

// E24: 글꼴은 렌더를 막지 않고(media=print → all, noscript 원본), 첫 로드 CLS < 0.05(Q20)
S.E24 = async (t) => {
  for (const w of [390, 1280]) await t.part(`${w}`, async () => {
    const p = await open(t, "test", w, w < 600 ? 844 : 800);
    const cls = await p.eval(CLS);
    const r = await p.eval(() => { const l = [...document.querySelectorAll('link[rel="stylesheet"]')].find((x) => /pretendard/i.test(x.href));
      const ns = [...document.querySelectorAll("noscript")].map((n) => n.textContent).join("");
      return { media: l?.getAttribute("media") ?? null, ns: /<link[^>]+pretendard[^>]*>/i.test(ns), family: getComputedStyle(document.body).fontFamily.split(",")[0].trim().replace(/["']/g, "") }; });
    t.check(r.media === "all", `${w}: 글꼴 link media ${r.media}(all이어야 해요)`);
    t.check(r.ns, `${w}: noscript 안에 글꼴 link가 없어요`);
    t.check(r.family === "Pretendard Variable", `${w}: body 글꼴 ${r.family}`);
    t.check(cls < 0.05, `${w}: 첫 로드 CLS ${cls}`);
    t.note(`${w}: CLS ${cls}`);
  });
};

// E25: 숭실대 학과 47개 주소, 숨김 3개, 계열 칩 6개(결정 10·11)
S.E25 = async (t) => {
  const p = await open(t, "map", 1280, 900);
  const depts = await p.eval(`D.depts.map((d) => ({ id: d.id, name: d.name, hide: !!d.hide, basic: !!d.basic }))`);
  t.check(depts.length === 47, `D.depts ${depts.length}개(47개여야 해요)`);
  t.check(depts.filter((d) => d.hide).length === 3, `숨김 학과 ${depts.filter((d) => d.hide).length}개(3개여야 해요)`);
  const bad = [];
  for (const d of depts) {
    const e0 = p.errors().length;
    await p.eval((id) => { location.hash = "map-" + id; return 1; }, d.id);
    await p.waitFor(`document.getElementById("out").innerText.replace(/⁠/g, "").includes(${JSON.stringify(d.name)})`, 3000).catch(() => {});
    const r = await p.eval((d) => ({ view: document.body.dataset.view, empty: document.querySelectorAll("#out .empty").length, undef: /undefined/.test(document.getElementById("v-map").innerText),
      name: document.getElementById("out").innerText.replace(/⁠/g, "").includes(d.name), chip: !!document.querySelector(`#dept button[data-v="${d.id}"]`) }), d);
    const e = p.errors().slice(e0).filter((x) => x.origin === "site");
    const f = [r.view !== "map" && `view ${r.view}`, r.empty && `.empty ${r.empty}`, r.undef && "'undefined'", !r.name && "학과 이름 없음", d.hide && r.chip && "숨김인데 칩이 있음", e.length && `오류 ${e.length}`].filter(Boolean);
    if (f.length) bad.push(`#map-${d.id}: ${f.join(", ")}`);
  }
  t.check(!bad.length, `학과 ${bad.length}개: ${list(bad, 4)}`);
  const basic = depts.find((d) => d.basic);
  if (basic) {
    await p.eval((id) => { location.hash = "map-" + id; return 1; }, basic.id);
    await sleep(300);
    looks(t, `1280 기본판 #map-${basic.id}`, await p.eval(measure), 1280);
  }
  // 계열 칩: 숭실대 '내 학과가 없어요'
  const fields = await p.eval(`(D.fieldRate.fields || []).map((f) => ({ id: f.id, name: f.name, value: String(f.value).replace("%", "") }))`);
  t.check(fields.length === 6, `D.fieldRate.fields ${fields.length}개(6개여야 해요)`);
  for (const w of [1280, 390]) await t.part(`계열 칩 ${w}`, async () => {
    const q = await open(t, "map", w, w < 600 ? 844 : 900);
    await q.eval(`document.querySelector('#school button[data-v="ssu"]')?.click(); document.querySelector('#dept button[data-v="none"]').click(); 1`);
    await sleep(200);
    const n = await q.eval(`document.querySelectorAll(".fieldchips button").length`);
    t.check(n === 6, `${w}: 계열 칩 ${n}개(6개여야 해요)`);
    for (const [k, f] of fields.entries()) {
      const r = await q.eval((k) => { const b = document.querySelectorAll(".fieldchips button")[k]; if (!b) return null; b.click(); return { label: b.innerText }; }, k);
      if (!r) break;
      await sleep(150);
      const txt = await q.eval(`document.getElementById("out").innerText`);
      t.check(r.label.includes(f.name) && txt.includes(f.value), `${w}: 계열 칩 ${k + 1} '${r.label}' ≠ ${f.name} ${f.value}`);
    }
    looks(t, `${w} 계열 칩`, await q.eval(measure), w);
    noErr(t, q, `계열 칩 ${w}`);
    await q.close();
  });
  noErr(t, p, "학과 47개");
};

// E26: 첫 화면(결정 16·C5)과 B5(다른 학교 결과 → 학과 지도)·B6(골라진 칩 모양)
S.E26 = async (t) => {
  await t.part("390 첫 화면", async () => {
    const p = await open(t, "test", 390, 844);
    const r = await p.eval(() => { const s = document.querySelector("header.hero [data-start]"), sample = document.querySelector(".sample");
      const areas = Object.fromEntries((D.fieldRate.fields || []).flatMap((f) => (f.depts || []).map((d) => [d, f.id])));
      const hc = [...document.querySelectorAll(".hcase")];
      return { start: s && __vis(s) ? Math.round(s.getBoundingClientRect().bottom) : null, sample: sample ? sample.innerText : null, n: hc.length,
        fields: new Set(hc.map((a) => areas[(a.getAttribute("href") || "").replace(/^#map-/, "")]).filter(Boolean)).size,
        ssu: hc.filter((a) => /숭실/.test(a.innerText)).length, uni: hc.filter((a) => a.innerText.includes("다른 대학 공개 사례")).length }; });
    t.check(r.start != null && r.start <= 844, `시작 버튼 아래끝 ${r.start}(844 이하여야 해요)`);
    t.check(r.sample != null && !/[\d%]/.test(r.sample), `.sample ${r.sample == null ? "없음" : "에 숫자·% 있음"}`);
    // 4차 QA 사장 결정: 2024년 이후 자연 계열 공식 사례가 없어 계열 3개 이상. 자연 계열은 5차
    t.check(r.n >= 4 && r.fields >= 3, `.hcase ${r.n}장, 계열 ${r.fields}개(3 이상이어야 해요)`);
    t.check(!r.ssu && r.uni === r.n, `.hcase 숭실 ${r.ssu}장, '다른 대학 공개 사례' ${r.uni}/${r.n}장`);
  });
  await t.part("1280 꼬리 빈 곳", async () => {
    const p = await open(t, "test", 1280, 900);
    const gap = await p.eval(() => { const s = [...document.querySelectorAll("section")].filter(__vis).pop(), f = document.querySelector("footer");
      return s && f ? Math.round(f.getBoundingClientRect().top - s.getBoundingClientRect().bottom) : null; });
    t.check(gap != null && gap <= 120, `마지막 섹션~footer ${gap}px(120 이하여야 해요)`);
  });
  await t.part("B5", async () => {
    const p = await open(t, "test", 1280, 800);
    await jumpResult(p, { school: "etc", dept: "aisw", f: READY4 });
    const sel = await p.eval(`document.getElementById("q-map") ? "#q-map" : document.querySelector('.result a[href^="#map"]') ? '.result a[href^="#map"]' : null`);
    if (!sel) throw new Error("다른 학교 + 전공 결과에 학과 지도로 가는 링크가 없어요");
    await p.click(sel);
    await p.waitFor(`document.body.dataset.view === "map"`, 3000);
    await p.idle();
    const r = await p.eval(`({ empty: document.querySelectorAll("#out .empty").length, path: document.querySelectorAll("#out .path").length })`);
    t.check(r.empty === 0 && r.path >= 1, `B5: .empty ${r.empty}, .path ${r.path}`);
  });
  for (const w of [390, 1280]) for (const theme of ["light", "dark"]) await t.part(`B6 ${w} ${theme}`, async () => {
    const p = await open(t, "map", w, w < 600 ? 844 : 800, { media: { colorScheme: theme } });
    const bg = async (sel) => { await sleep(400); return p.eval((sel) => { const i = document.createElement("i"); i.style.background = "var(--acc)"; document.body.append(i);
      const acc = getComputedStyle(i).backgroundColor; i.remove(); const b = document.querySelector(sel); return { acc, bg: b ? getComputedStyle(b).backgroundColor : null }; }, sel); };
    await p.eval(`document.querySelector('#school button[data-v="ssu"]').click(); document.querySelector('#dept button[data-v="none"]').click(); 1`);
    const a = await bg('#dept button[data-v="none"][aria-pressed="true"]');
    t.check(a.bg === a.acc, `B6 ${w} ${theme} '내 학과가 없어요': ${a.bg} ≠ --acc ${a.acc}`);
    await p.eval(`document.querySelector('#school button[data-v="etc"]').click(); 1`);
    const b = await bg('#school button[data-v="etc"][aria-pressed="true"]');
    t.check(b.bg === b.acc, `B6 ${w} ${theme} '다른 학교': ${b.bg} ≠ --acc ${b.acc}`);
    await p.close();
  });
};

// ---------- 5차 시나리오(E27~E30, 디자인 초안 3-7) ----------
// E27: 검사 집중 모드. 리커트 카드가 세로 가운데(위·아래 빈 곳 차이 40 이하)이고 메뉴 목록(#tabs)이 안 보인다.
// 600 미만은 카드 틀 없이 질문을 내리는 설계(디자인 초안 3-1)라 동그라미 줄 가운데가 화면 가운데 1/3 안인지 본다
S.E27 = async (t) => {
  for (const [w, h] of [[1280, 800], [1536, 900], [1920, 1080], [390, 844]]) await t.part(`${w}`, async () => {
    const p = await open(t, "test", w, h);
    await startQuiz(p);
    const st = { likert: 0, basics: [] };
    for (let k = 0; k < 3; k++) await answer(p, DEF, st);
    await pastChap(p);
    const r = await p.eval(() => { const b = document.querySelector(".quiz").getBoundingClientRect(), d = document.querySelector("#q-body .dots").getBoundingClientRect();
      return { top: Math.round(b.top), gap: Math.round(innerHeight - b.bottom), dots: Math.round((d.top + d.bottom) / 2), tabs: __vis(document.getElementById("tabs")), foot: __vis(document.querySelector("footer")) }; });
    if (w >= 600) t.check(Math.abs(r.top - r.gap) <= 40, `${w}×${h}: 카드 위 ${r.top} / 아래 ${r.gap}(차이 40 이하여야 해요)`);
    else t.check(r.dots >= h / 3 && r.dots <= h * 2 / 3, `${w}×${h}: 동그라미 줄 가운데 y ${r.dots}(${Math.round(h / 3)}~${Math.round(h * 2 / 3)}이어야 해요)`);
    t.check(!r.tabs && !r.foot, `${w}: 검사 중 메뉴 ${r.tabs ? "보임" : "숨김"}, 푸터 ${r.foot ? "보임" : "숨김"}`);
    t.note(`${w}×${h}: 위 ${r.top} / 아래 ${r.gap}, 동그라미 줄 y ${r.dots}`);
    noErr(t, p, `${w}`);
  });
};

// E28: 장 안내는 장이 바뀔 때 한 번. 숫자키로 건너뛰지 않고, 뒤로 갔다 다시 와도 또 나오지 않는다. 단계 번호·분모는 그대로
S.E28 = async (t) => {
  const p = await open(t, "test", 1280, 800);
  await startQuiz(p);
  const st = { likert: 0, basics: [] };
  for (let k = 0; k < 3; k++) await answer(p, DEF, st);
  const c1 = await p.eval(`({ kind: document.querySelector(".quiz").dataset.kind, chap: document.querySelectorAll(".chap").length, i: qa.i, sec: document.getElementById("q-sec").textContent, focus: document.activeElement?.id })`);
  t.check(c1.kind === "chapter" && c1.chap === 1 && c1.i === 3 && c1.focus === "q-title", `기본 정보 뒤 1장 안내 ${JSON.stringify(c1)}`);
  await p.key("1"); await sleep(400);
  const k1 = await p.eval(`({ kind: document.querySelector(".quiz").dataset.kind, a: qa.a[LIKERT[0].id] ?? null })`);
  t.check(k1.kind === "chapter" && k1.a === null, `장 안내에서 숫자키 1이 답이 됐어요 ${JSON.stringify(k1)}`);
  await p.key("Enter");
  await p.waitFor(`document.querySelector(".quiz")?.dataset.kind === "likert"`, 3000);
  await p.idle();
  const n = await p.eval(`Q.interest.items.length`);
  for (let k = 0; k < n; k++) await answer(p, DEF, st);
  t.check((await kindOf(p)) === "chapter", "흥미 다음에 2장 안내가 없어요");
  await p.eval("history.back(); 1");
  await p.waitFor(`qa.i === ${3 + n - 1}`, 3000); await p.idle();
  t.check(!(await has(p, ".chap")), "뒤로 간 화면에 장 안내가 있어요");
  await answer(p, DEF, st);
  const c2 = await p.eval(`({ kind: document.querySelector(".quiz").dataset.kind, i: qa.i })`);
  t.check(c2.kind === "likert" && c2.i === 3 + n, `다시 앞으로 왔는데 장 안내가 또 나왔어요 ${JSON.stringify(c2)}`);
  noErr(t, p, "E28");
};

// E29: 결과 첫 화면(1280×800·390×844)에 1위 직무 제목·끌림 1·2위·결과 링크 버튼, 390은 이번 주 줄까지
S.E29 = async (t) => {
  for (const [w, h] of [[1280, 800], [390, 844]]) await t.part(`${w}`, async () => {
    const p = await open(t, "test", w, h);
    await jumpResult(p, BOSS);
    await p.eval("scrollTo(0, 0); 1");
    const sels = ["#r-title", ".rh-dirs", "#r-link", ...(w < 600 ? [".rh-week"] : [])];
    const r = await p.eval((sels) => sels.map((s) => { const e = document.querySelector(s); return [s, e && __vis(e) ? Math.round(e.getBoundingClientRect().bottom) : null]; }), sels);
    const out = r.filter(([, b]) => b == null || b > h);
    t.check(!out.length, `${w}×${h}: 첫 화면 밖 ${out.map(([s, b]) => `${s} ${b ?? "없음"}`).join(", ")}`);
    t.note(`${w}: ${r.map(([s, b]) => `${s} ${b}`).join(", ")}`);
    noErr(t, p, `${w}`);
  });
};

// E30: 기존 검사 흔적이 없다. 첫 화면·결과·친구용·직무 사전·공유 카드 글자에 '○○형' 영역 이름, 글자 코드 배지(R·I·A…만 있는 칸), 육각형, '흥미 코드'가 없다
S.E30 = async (t) => {
  const TRACE = () => { const txt = document.body.innerText, bad = [];
    const m = txt.match(/(현실|탐구|예술|사회|진취|관습|기업)형|흥미 코드|RIASEC/g); if (m) bad.push(...new Set(m));
    const code = [...document.querySelectorAll("body *")].filter((e) => !e.children.length && __vis(e) && /^[RIASEC]{1,3}$/.test(e.textContent.trim())).map((e) => e.textContent.trim());
    if (code.length) bad.push(`글자 코드 ${code.slice(0, 3).join(",")}`);
    if (document.querySelector(".hexchart, figure.hex, .badge-code, .r-codes")) bad.push("육각형·코드 배지");
    return bad; };
  const p = await open(t, "test", 1280, 800);
  const check = async (label) => { const bad = await p.eval(TRACE); t.check(!bad.length, `${label}: ${bad.join(", ")}`); };
  await check("첫 화면");
  await reload(p, "jobs"); await check("직무 사전");
  await reload(p, "test"); await jumpResult(p, BOSS); await check("결과");
  await p.eval(`document.querySelectorAll(".result details").forEach((d) => (d.open = true)); 1`); await check("결과(펼침)");
  const canvas = await p.eval(async () => { const seen = [], f0 = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { seen.push(String(s)); return f0.call(this, s, ...a); };
    try { await shareCanvas(compute(qa.a, qa.sector, qa.pairs)); } finally { CanvasRenderingContext2D.prototype.fillText = f0; }
    return seen; });
  const cbad = canvas.filter((s) => /형$|흥미 코드|^[RIASEC]{1,3}$/.test(s));
  t.check(canvas.length > 5 && !cbad.length, `공유 카드 글자 ${canvas.length}개, 흔적 ${cbad.join(",")}`);
  const code = await p.eval(() => encodeFriend(compute(qa.a, qa.sector, qa.pairs)));
  await reload(p, "s=" + code); await p.waitFor(`!!document.querySelector(".friend")`, 4000); await check("친구용");
  noErr(t, p, "E30");
};

// ---------- 실행 ----------
const ids = Object.keys(S).filter((id) => !ONLY.length || ONLY.includes(id));
let nFail = 0, nWarn = 0, nPass = 0;
console.log(`E2E ${BASE} (root ${ROOT || "기본"}) → ${OUT}`);
for (const id of ids) {
  const t = { fails: [], notes: [], pages: [] };
  t.fail = (m) => t.fails.push(m);
  t.check = (ok, m) => (ok || t.fail(m), ok);
  t.note = (m) => t.notes.push(m);
  t.page = async (w, h, o = {}) => { const p = await (o.browser || browser).newPage({ width: w, height: h }); t.pages.push(p); if (o.media) await p.media(o.media); return p; };
  t.part = async (label, fn) => { try { await fn(); } catch (e) { t.fail(`${label}: ${e.message.split("\n")[0]}`); } };
  const t0 = Date.now();
  let timer;
  try {
    await Promise.race([S[id](t), new Promise((_, no) => (timer = setTimeout(() => no(new Error("시간 초과(10분)")), 600000)))]);
  } catch (e) { t.fail(e.message.split("\n")[0]); }
  clearTimeout(timer);
  const errs = t.pages.flatMap((p) => p.errors());
  const uniq = (a) => [...new Set(a.map(errText))];
  const siteE = uniq(errs.filter((e) => e.origin === "site")), cdnE = uniq(errs.filter((e) => e.origin === "cdn"));
  for (const p of t.pages) await p.close().catch(() => {});
  const status = t.fails.length ? "FAIL" : cdnE.length ? "WARN(CDN)" : "PASS";
  status === "FAIL" ? nFail++ : status === "PASS" ? nPass++ : nWarn++;
  console.log(`\n${id} ${status} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  t.fails.forEach((m) => console.log(`  ✗ ${m}`));
  t.notes.forEach((m) => console.log(`  · ${m}`));
  console.log(`  사이트 오류 ${siteE.length}${siteE.length ? ": " + siteE.slice(0, 5).join(" | ") : ""}`);
  console.log(`  CDN 오류 ${cdnE.length}${cdnE.length ? ": " + cdnE.slice(0, 5).join(" | ") : ""}`);
}
console.log(`\n합계 PASS ${nPass} · WARN(CDN) ${nWarn} · FAIL ${nFail}  (캡처 ${OUT})`);
await browser.close();
server.close();
process.exit(nFail ? 1 : 0);
