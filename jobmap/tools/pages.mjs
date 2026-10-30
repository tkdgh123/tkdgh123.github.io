// 검색용 정적 페이지를 만든다: 직무별·학과별·많이 묻는 것·AI와 취업 + sitemap.xml
// node tools/pages.mjs [jobmap 폴더] [출력 폴더]   (둘 다 생략하면 이 jobmap 폴더)
// 화면 HTML은 app.js가 그리는 것을 그대로 쓴다(tests/load.mjs로 vm에 올려 가짜 요소의 innerHTML을 꺼냄). 앱 화면이 바뀌면 다시 돌리기만 하면 된다.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [SRC = fileURLToPath(new URL("../", import.meta.url)), OUT = SRC] = process.argv.slice(2);
const SITE = "https://tkdgh123.github.io", B = "/jobmap/";
const { load } = await import(pathToFileURL(join(SRC, "tests/load.mjs")).href);
const { els, get } = load(SRC);
const D = get("D"), st = get("st"), esc = get("esc");
// 머리(title·description)엔 화면용 줄바꿈 막기 글자(U+2060)를 넣지 않는다
const attr = (s) => esc(s).replace(/\u2060/g, "");
// 로드 때 그려 둔 것에 기대지 않고 직접 그린다(늦게 그리기로 바뀌어도 빈 페이지가 되지 않게)
st.jobArea = ""; get("drawJobs")(); get("drawFaq")(); get("drawAi")();

const index = readFileSync(join(SRC, "index.html"), "utf8");
// 글꼴(비차단 + noscript)과 테마 색은 index.html 줄을 그대로 쓴다
const headLines = index.split(/\r?\n/).filter((l) => /cdn\.jsdelivr\.net|theme-color/.test(l)).join("\n");
const footer = index.match(/<footer[\s\S]*?<\/footer>/)[0].replace("<footer hidden>", "<footer>").replace('<span class="checked"></span>', esc(D.checked))
  .replaceAll('href="../"', 'href="/"').replace(/href="(?!https?:|\/|#)/g, `href="${B}`);

// 앱 안 링크(#jobs-키 등)를 정적 주소로 바꾼다. 화면 안 위치(#map-s-…)는 그대로 둔다
const fix = (h) => h.replace(/href="#jobs-([\w-]+)"/g, `href="${B}jobs/$1/"`).replace(/href="#map-(?!s-)(?:etc-)?(\w+)"/g, `href="${B}depts/$1/"`)
  .replace(/href="#(ai-[\w-]+)"/g, `href="${B}ai/#$1"`).replace(/href="#(ai|faq)"/g, `href="${B}$1/"`).replace(/href="#map"/g, `href="${B}depts/"`)
  .replace(/href="#jobs"/g, `href="${B}jobs/"`).replace(/href="#(test|about)"/g, `href="${B}#$1"`).replace(/src="img\//g, `src="${B}img/`).replaceAll(' tabindex="-1"', "");

const TABS = [["진로 검사", B], ["학과 지도", B + "depts/"], ["직무 사전", B + "jobs/"], ["AI와 취업", B + "ai/"], ["많이 묻는 것", B + "faq/"], ["만든 방법", B + "#about"]];
const pages = [];
function page(path, { title, desc, crumbs, body, tab }) {
  const url = SITE + B + path;
  const trail = [["학과 진로 지도", B], ...crumbs];
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + p })) };
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${attr(title)} | 학과 진로 지도</title>
<meta name="description" content="${attr(desc)}">
<link rel="canonical" href="${url}">
${headLines}
<meta property="og:type" content="website"><meta property="og:site_name" content="학과 진로 지도"><meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${attr(title)}"><meta property="og:description" content="${attr(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${B}og.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${B}favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="${B}apple-touch-icon.png">
<link rel="stylesheet" href="${B}style.css">
<style>.crumb{padding-top:var(--s-8);font-size:var(--fs-label);line-height:var(--lh-label);color:var(--text-2)}.crumb a{color:inherit}.crumb+div>.dept{margin-top:var(--s-4)}.dept h1{font-size:var(--fs-h2);line-height:var(--lh-h2)}
.one{margin-top:var(--s-4)}.one .jd-head{cursor:auto}.one .jd-head::after{display:none}.one .jd-title h1{font-size:var(--fs-h2);line-height:var(--lh-h2)}.one .jd-title small{display:block}
.go{margin-top:var(--s-12);display:grid;gap:var(--s-3);justify-items:start;padding:var(--s-6);border-radius:var(--r-xl);background:var(--acc-soft)}
.links{list-style:none;margin:0;padding:0;display:grid;gap:var(--s-2)}.links a{display:grid;padding:var(--s-4) var(--s-5);border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--shadow-sm);text-decoration:none}.links small{color:var(--text-2);font-size:var(--fs-sm);line-height:var(--lh-sm)}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
<div class="page">
<nav class="toc" aria-label="목차">
  <a class="brand" href="${B}"><img src="${B}favicon.svg" alt="" width="28" height="28"><span>학과 진로 지도</span></a>
  <ol>${TABS.map(([t, h]) => `<li><a href="${h}"${t === tab ? ' class="on" aria-current="page"' : ""}>${t}</a></li>`).join("")}</ol>
  <a class="back" href="/">← 작업실</a>
</nav>
<main id="main">
<nav class="crumb" aria-label="현재 위치">${trail.map(([n, p], i) => i < trail.length - 1 ? `<a href="${p}">${esc(n)}</a>` : esc(n)).join(" › ")}</nav>
<div>${fix(body)}</div>
<div class="go"><b>내 흥미에 맞는 직무가 궁금하다면</b><a class="btn" href="${B}">60문항 검사 해 보기</a></div>
</main>
</div>
<script>matchMedia("(max-width:1199px)").matches&&document.querySelector(".toc a.on")?.scrollIntoView({inline:"center",block:"nearest"})</script>
${footer}
</body>
</html>
`;
  pages.push({ path, html });
}
const linkList = (list) => `<ul class="links">${list.map(([href, name, sub]) => `<li><a href="${href}"><b>${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</a></li>`).join("")}</ul>`;

// 직무: 접는 카드를 펼친 글로(details/summary → article/header), 직무 이름을 h1로
const jds = Object.fromEntries(els.jds.innerHTML.split(/(?=<details class="jd")/).slice(1).map((h) => [h.match(/id="job-([\w-]+)"/)[1],
  h.replace("<details", "<article").replace(/<\/details>\s*$/, "</article>").replace(/<summary([^>]*)>([\s\S]*?)<\/summary>/, "<header$1>$2</header>")
    .replace(/<span class="jd-title"><b[^>]*>([\s\S]*?)<\/b>/, '<span class="jd-title"><h1>$1</h1>')]));
for (const j of D.jobs) page(`jobs/${j.key}/`, {
  tab: "직무 사전", title: `${j.name} 직무: 하는 일과 준비법`, crumbs: [["직무 사전", B + "jobs/"], [j.name, `${B}jobs/${j.key}/`]],
  desc: `${j.name} 직무가 하는 일${j.skills?.length ? `, 필요한 힘(${j.skills.join(", ")})` : ""}${j.ai?.change ? ", AI가 바꾸는 점" : ""}${j.tips?.length ? ", 합격자·현직자가 말하는 준비법" : ""}을 출처와 함께 정리했어요.`,
  body: `<div class="one">${jds[j.key]}</div>`
});
page("jobs/", {
  tab: "직무 사전", title: "직무 사전", crumbs: [["직무 사전", B + "jobs/"]],
  desc: `신입이 많이 지원하는 직무 ${D.jobs.length}개의 하는 일, 필요한 힘, 끌림 방향, AI가 바꾸는 점을 모았어요.`,
  body: `<section><h1>직무 사전</h1><p class="lead">신입이 많이 지원하는 직무 ${D.jobs.length}개예요.</p>${linkList(D.jobs.map((j) => [`${B}jobs/${j.key}/`, j.name, String(j.does || "").split(/(?<=[.!?])\s/)[0]]))}</section>`
});

// 학과: 숭실대 학과 화면 그대로(학년 강조 없음)
const jobNames = (d) => (d.jobs || []).map((k) => D.jobs.find((j) => j.key === k)?.name).filter(Boolean).join(", ");
st.year = 0;
for (const d of D.depts) {
  Object.assign(st, { school: "ssu", college: d.college, dept: d.id });
  get("render")();
  const n = d.uni?.n || 1, cases = (d.cases || []).length;
  page(`depts/${d.id}/`, {
    tab: "학과 지도", title: `${d.name} 졸업 후 진로`, crumbs: [["학과 지도", B + "depts/"], [d.name, `${B}depts/${d.id}/`]],
    desc: d.basic ? `${d.name}(${d.college}) 학생이 직무 사전에서 이어 볼 직무${jobNames(d) ? `(${jobNames(d)})` : ""}와 숭실대에서 학년별로 해 볼 것을 모았어요.`
      : `${d.intro} ${d.name} 진로를 대학 ${n}곳의 학과 안내${cases ? `와 2024년 이후 졸업생 사례 ${cases}건으로` : "로"} 정리했어요.`,
    body: els.out.innerHTML.replace(/<h2>([\s\S]*?)<\/h2>/, "<h1>$1</h1>")
  });
}
const cols = [...new Set([...D.collegeOrder, ...D.depts.map((d) => d.college)])];
page("depts/", {
  tab: "학과 지도", title: "학과별 졸업 후 진로", crumbs: [["학과 지도", B + "depts/"]],
  desc: `숭실대 학과 ${D.depts.length}개의 졸업 후 진로를 학과별로 모았어요. 여러 대학이 안내하는 진로, 2024년 이후 졸업생 사례, 학년별로 해 볼 것이에요.`,
  body: `<section><h1>학과 지도</h1><p class="lead">여러 대학이 안내하는 진로와 2024년 이후 졸업생 사례를 학과별로 모았어요.</p></section>
${cols.map((c) => `<section><h2>${esc(c)}</h2>${linkList(D.depts.filter((d) => d.college === c).map((d) => [`${B}depts/${d.id}/`, d.name, d.basic ? jobNames(d) : d.intro]))}</section>`).join("\n")}`
});

// 많이 묻는 것, AI와 취업
page("faq/", {
  tab: "많이 묻는 것", title: "요즘 취업, 많이 묻는 것", crumbs: [["많이 묻는 것", B + "faq/"]],
  desc: `${D.faq.slice(0, 3).map((f) => f.q).join(" ")} 조사 기관과 대상을 같이 적어 답했어요.`,
  body: `<section><h1>요즘 취업, 많이 묻는 것</h1><p class="lead">조사 기관과 대상을 같이 적었어요.</p><div class="qas">${els.qas.innerHTML.replace(/<details class="qa"( open)?/g, '<details class="qa" open')}</div></section>
<section><h2>처음 보면 헷갈리는 말</h2><div class="rows">${els.terms.innerHTML}</div></section>`
});
page("ai/", {
  tab: "AI와 취업", title: "AI와 취업: 채용과 직무는 어떻게 바뀌나", crumbs: [["AI와 취업", B + "ai/"]],
  desc: D.aiInfo.lead, body: els["v-ai"].innerHTML
});

// 쓰기 + sitemap(lastmod는 내용이 바뀐 페이지만 오늘로)
const old = existsSync(join(OUT, "sitemap.xml")) ? Object.fromEntries([...readFileSync(join(OUT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)/g)].map((m) => [m[1], m[2]])) : {};
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
const urls = [{ loc: SITE + B, lastmod: old[SITE + B] || today }];
for (const p of pages) {
  const file = join(OUT, p.path, "index.html"), loc = SITE + B + p.path;
  const same = existsSync(file) && readFileSync(file, "utf8") === p.html;
  mkdirSync(join(OUT, p.path), { recursive: true });
  if (!same) writeFileSync(file, p.html);
  urls.push({ loc, lastmod: same && old[loc] ? old[loc] : today });
}
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log(`${pages.length}쪽, sitemap ${urls.length}개 주소`);
