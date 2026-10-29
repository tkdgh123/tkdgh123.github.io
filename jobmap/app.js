// 화면 그리기: 학과 지도, 직무 사전, AI와 취업, 많이 묻는 것, 만든 방법, 이동. 검사 화면은 quiz-ui.js
const D = window.JOBMAP;
D.depts.sort((a, b) => D.collegeOrder.indexOf(a.college) - D.collegeOrder.indexOf(b.college));
D.depts.forEach((d) => Object.assign(d, (D.ssuDept || {})[d.id] || {}));
const colleges = D.collegeOrder.filter((c) => D.depts.some((d) => d.college === c));
const st = { school: "ssu", college: D.depts[0].college, dept: D.depts[0].id, year: 1, jobArea: "" };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const urls = (u) => String(u || "").split(/\s*,\s*(?=https?:)/).filter((x) => /^https?:|^\.\.\//.test(x));
const src = (u) => !u ? "" : urls(u).length
  ? urls(u).map((x) => ` <a class="src" href="${esc(x)}" target="_blank" rel="noopener">출처</a>`).join("")
  : ` <span class="srct">출처: ${esc(u)}</span>`;
const link = (t) => t.url ? `<a href="${esc(t.url)}"${t.url.startsWith("#") ? "" : ` target="_blank" rel="noopener"`}>${esc(t.text)}</a>` : esc(t.text);
(D.jobs || []).forEach((j) => j.alias = D.quiz.jobAlias[j.key] || [j.name.split(/[·(\s]/)[0]]);
const dictFor = (name) => (D.jobs || []).filter((j) => !(D.quiz.jobExclude[j.key] || []).some((x) => name.includes(x)) && !(j.key === "ncs" && st.college === "공과대학"))
  .map((j) => [j, Math.max(0, ...j.alias.filter((a) => name.includes(a)).map((a) => a.length))])
  .filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1])[0]?.[0];
const dictLink = (name) => { const k = dictFor(name); return k ? `<a class="dict" href="#jobs-${k.key}">직무 사전</a>` : ""; };
const AREA = Object.fromEntries(D.quiz.areas.map((x) => [x.id, x]));
// 흥미 코드를 글자로도 풀어 쓴다(EC → EC 진취·관습). 터치 화면엔 툴팁이 안 보여서
const codeName = (code) => `${code} ${code.split("").map((c) => AREA[c].name.replace("형", "")).join("·")}`;
const codeTag = (j) => j.riasec ? `<span class="code">${esc(codeName(j.riasec))}</span>` : "";

function chips(el, items, key, after) {
  el.innerHTML = items.map((it) =>
    `<button type="button" class="chip${it.ghost ? " ghost" : ""}" data-v="${esc(it.v)}" aria-pressed="${String(st[key]) === String(it.v)}">${esc(it.label)}</button>`).join("");
  el.onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    st[key] = isNaN(b.dataset.v) || b.dataset.v === "" ? b.dataset.v : Number(b.dataset.v);
    el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    after();
  };
}

const caseCard = (c) => `<div class="case ${c.kind === "in" ? "in" : "out"}">
  <div class="ctop"><span class="ck">${c.kind === "in" ? "전공 따라" : "전공 밖으로"}</span><span class="cm">${esc(c.type)} · ${esc(c.date)}${c.trust && c.trust !== "높음" ? ` · 신뢰 ${esc(c.trust)}` : ""}</span></div>
  <b>${esc(c.to)}${dictLink(c.to)}</b>
  ${c.how?.length ? `<ul>${c.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
  ${src(c.source)}
</div>`;

function render() {
  const out = $("out");
  if (st.school !== "ssu") {
    out.innerHTML = `<section class="empty"><h2>이 학교는 아직 없어요</h2><p class="muted">학과 진로는 전국 대학 자료로 정리했지만, 학년별 할 일과 학교 프로그램은 지금 숭실대만 있어요.</p><a class="btn line" href="#jobs">직무 사전 보기</a></section>`;
    return;
  }
  if (st.dept === "none") {
    out.innerHTML = `<section class="empty"><h2>내 학과는 아직 없어요</h2><p class="muted">지금은 ${D.depts.map((d) => d.name).join(", ")}를 깊게 조사해 두었어요. 계열이 비슷한 학과를 먼저 보고, 직무 사전도 함께 보세요.</p><div class="chips">${D.depts.map((d) => `<button type="button" class="chip" data-go="${d.id}">${esc(d.name)}</button>`).join("")}</div></section>`;
    out.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => { const d = D.depts.find((x) => x.id === b.dataset.go); st.college = d.college; st.dept = d.id; drawPick(); render(); });
    return;
  }
  const d = D.depts.find((x) => x.id === st.dept);
  const S = D.ssu;
  const stats = [S.rate, (d.stats || []).some((x) => x.label.includes("계열")) ? null : D.fieldRate[d.college], ...(d.stats || [])].filter(Boolean).map((s) =>
    `<div class="stat"><b class="num">${esc(s.value)}</b><span>${esc(s.label)}</span><small>${esc(s.basis)}${src(s.source)}</small></div>`).join("");
  const n = d.uni?.n || 1;
  const bar = (p) => `<div class="path ${p.kind}"><div class="pl"><b>${esc(p.name)}${dictLink(p.name)}</b>${p.note ? `<span>${esc(p.note)}</span>` : ""}</div>
    <div class="pb" aria-label="${p.k}개 대학"><i style="width:${Math.round(p.k / n * 100)}%"></i></div><span class="pk num">${p.k}/${n}</span></div>`;
  const ins = (d.paths || []).filter((p) => p.kind === "in"), outs = (d.paths || []).filter((p) => p.kind !== "in");
  const cases = d.cases || [];
  const years = [1, 2, 3, 4].map((y) => {
    const items = [...(S.roadmap[y] || []), ...((d.roadmap || {})[y] || [])];
    return `<li class="${y === st.year ? "now" : ""}"><b>${y}학년</b><ul>${items.map((t) => `<li>${link(t)}</li>`).join("")}</ul></li>`;
  }).join("");
  const scenes = (d.ai || []).map((a) => `<div class="scene"><i>${esc(a.task)}</i><b>${esc(a.title)}</b><span>${esc(a.how)}</span></div>`).join("");
  const res = [...S.resources, ...(d.ssu_specific || [])].map((r) =>
    `<a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></a>`).join("");

  out.innerHTML = `
  <div class="dept">
    <span class="tag">${esc(d.college)}</span>
    <h2>${esc(d.name)}</h2>
    <p class="intro">${esc(d.intro)}</p>
    <div class="stats">${stats}</div>
  </div>

  <section>
    <h2>여러 대학이 꼽는 진로</h2>
    <p class="lead">${n}개 대학 학과가 안내하는 진로를 세었어요. 막대가 길수록 많은 대학이 꼽았어요.${d.uni?.list ? ` (${esc(d.uni.list)})` : ""}</p>
    <div class="fork">
      <div class="lane in"><h3>전공 따라 <i>${ins.length}</i></h3>${ins.map(bar).join("")}</div>
      <div class="lane out"><h3>전공 밖으로 <i>${outs.length}</i></h3>${outs.map(bar).join("")}</div>
    </div>
  </section>

  ${cases.length ? `<section>
    <h2>실제로 이렇게 갔어요</h2>
    <p class="lead">2024년 이후 공개된 졸업생 사례예요. 대학 공식 후기, 합격 자소서, 블로그·유튜브에서 모았어요.</p>
    <div class="cases">${cases.map(caseCard).join("")}</div>
  </section>` : ""}

  ${d.tips?.length ? `<section>
    <h2>사례에서 반복된 준비법</h2>
    <ol class="tips">${d.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
    ${d.certs?.length ? `<div class="certs"><b>근거 있는 자격·점수</b>${d.certs.map((c) => `<span title="${esc(c.note)}">${esc(c.name)}</span>`).join("")}</div>` : ""}
  </section>` : ""}

  ${d.trends?.length ? `<section>
    <h2>요즘 채용 분위기</h2>
    <ul class="trends">${d.trends.map((t) => `<li><span class="num">${esc(t.date)}</span><p>${esc(t.text)}${src(t.source)}</p></li>`).join("")}</ul>
  </section>` : ""}

  <section>
    <h2>숭실대에서 학년별로 해 볼 것</h2>
    <p class="lead">정답 순서는 없어요. 지금 학년 칸부터 보세요.</p>
    <ol class="years">${years}</ol>
  </section>

  ${scenes ? `<section>
    <h2>이 학과에서 AI 쓰는 장면</h2>
    <p class="lead">도구 이름보다 어떤 일에 쓰는지가 오래가요. 과제에 쓸 땐 수업 규칙부터 확인하세요. <a href="#ai">AI와 취업 전체 보기</a></p>
    <div class="scenes">${scenes}</div>
  </section>` : ""}

  <section>
    <h2>숭실대에서 쓸 수 있는 것</h2>
    <div class="res">${res}</div>
  </section>`;
}

function drawPick() {
  chips($("school"), [...D.schools.map((s) => ({ v: s.id, label: s.name })), { v: "etc", label: "다른 학교", ghost: true }], "school", () => { drawPick(); render(); });
  chips($("college"), colleges.map((c) => ({ v: c, label: c })), "college", () => {
    st.dept = D.depts.find((d) => d.college === st.college).id; drawPick(); render();
  });
  chips($("dept"), [...D.depts.filter((d) => d.college === st.college).map((x) => ({ v: x.id, label: x.name })), { v: "none", label: "내 학과가 없어요", ghost: true }], "dept", render);
  chips($("year"), [1, 2, 3, 4].map((y) => ({ v: y, label: `${y}학년` })), "year", render);
  $("pick").querySelectorAll(".row:not(:first-child)").forEach((r) => r.hidden = st.school !== "ssu");
}

// 직무 사전: 흥미 영역으로 거를 수 있다
function drawJobs() {
  const list = (a) => (a || []).map((t) => `<li>${esc(t)}</li>`).join("");
  chips($("jdtools"), [{ v: "", label: "전체" }, ...D.quiz.areas.map((x) => ({ v: x.id, label: `${x.name} ${x.id}` }))], "jobArea", drawJobs);
  $("jds").innerHTML = (D.jobs || []).filter((j) => !st.jobArea || (j.riasec || "").includes(st.jobArea)).map((j) => `
    <details class="jd" id="job-${j.key}">
      <summary><b>${esc(j.name)} ${codeTag(j)}</b><span>${esc(j.does)}</span><i aria-hidden="true"></i></summary>
      <div class="body">
        ${j.tasks?.length ? `<div><h4>하는 일</h4><ol>${list(j.tasks)}</ol></div>` : ""}
        ${j.skills?.length ? `<div><h4>필요한 힘</h4><div class="sk">${j.skills.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
        ${j.open ? `<p class="open">${esc(j.open)}</p>` : ""}
        ${j.ai && (j.ai.now || j.ai.change || j.ai.need) ? `<div class="ai"><h4>AI가 바꾸는 점</h4><dl>${[["지금", j.ai.now], ["바뀌는 일", j.ai.change], ["갖출 것", j.ai.need]].filter((x) => x[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl><span>${src(j.ai.source)}</span></div>` : ""}
        ${j.pay || j.outlook ? `<div class="stats">${[["임금", j.pay], ["전망", j.outlook]].filter((x) => x[1]).map(([l, v]) => `<div class="stat"><small>${l}</small><span>${esc(v.value)}</span><small>${esc(v.basis)}${src(v.source)}</small></div>`).join("")}</div>` : ""}
        ${j.facts?.length ? `<ul class="jfacts">${j.facts.map((f) => `<li>${esc(f.text)}${src(f.source)}</li>`).join("")}</ul>` : ""}
        ${j.tips?.length ? `<div><h4>합격자·현직자가 말하는 준비법</h4><ol>${list(j.tips)}</ol>${(j.tipSources || []).map((u) => src(u)).join("")}</div>` : ""}
        <small class="muted">직무 설명${src(j.source)}${j.riasec ? ` · 흥미 코드는 O*NET 기준${src(j.onet)}` : ""}</small>
      </div>
    </details>`).join("");
}

function drawFaq() {
  $("terms").innerHTML = D.terms.map((t) => `<div><b>${esc(t.k)}</b><p>${esc(t.t)}</p></div>`).join("");
  $("qas").innerHTML = (D.faq || []).map((f, i) => `
    <details class="qa"${i === 0 ? " open" : ""}>
      <summary>${esc(f.q)}</summary>
      <div class="body"><p>${esc(f.a)}</p><small>${esc(f.basis)}${src(f.source)}</small></div>
    </details>`).join("");
}

// AI와 취업: ai.js의 글 + 직무 사전의 직무별 AI 변화 표
function drawAi() {
  const A = D.aiInfo;
  if (!A) return;
  const rows = (list) => `<div class="rows">${list.map((r) => `<div><b>${esc(r.k)}</b><p>${esc(r.t)}${src(r.source)}</p></div>`).join("")}</div>`;
  const jobsAi = (D.jobs || []).filter((j) => j.ai && (j.ai.change || j.ai.need));
  const part = (p) => `<section id="${p.id}">
      <div class="eb">${esc(p.eb)}</div>
      <h2>${esc(p.title)}</h2>
      ${p.lead ? `<p class="lead">${esc(p.lead)}</p>` : ""}
      ${p.rows ? rows(p.rows) : ""}
      ${p.cards ? `<div class="cards">${p.cards.map((c) => `<div class="card"><small>${esc(c.tag)}</small><h4>${esc(c.title)}</h4><p>${esc(c.t)}${src(c.source)}</p></div>`).join("")}</div>` : ""}
      ${p.note ? `<p class="verdict${p.warn ? " warn" : ""}">${esc(p.note)}</p>` : ""}
    </section>`;
  $("v-ai").innerHTML = `
    <section>
      <h2>AI와 취업</h2>
      <p class="lead">${esc(A.lead)}</p>
      <div class="stats">${A.stats.map((s) => `<div class="stat"><b class="num">${esc(s.value)}</b><span>${esc(s.label)}</span><small>${esc(s.basis)}${src(s.source)}</small></div>`).join("")}</div>
    </section>
    ${A.parts.filter((p) => !p.afterJobs).map(part).join("")}
    ${jobsAi.length ? `<section id="ai-jobs">
      <div class="eb">직무별</div>
      <h2>직무마다 AI가 바꾸는 일</h2>
      <p class="lead">현장에서 AI를 어떻게 쓰는지, 그래서 신입이 무엇을 갖추면 좋은지예요. 직무 이름을 누르면 직무 사전으로 가요.</p>
      <div class="tbl"><table>
        <thead><tr><th>직무</th><th>바뀌는 일</th><th>신입이 갖출 것</th></tr></thead>
        <tbody>${jobsAi.map((j) => `<tr><th><a href="#jobs-${j.key}">${esc(j.name)}</a></th><td>${esc(j.ai.change || j.ai.now || "")}</td><td class="muted">${esc(j.ai.need || "")}${src(j.ai.source)}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>` : ""}
    ${A.parts.filter((p) => p.afterJobs).map(part).join("")}`;
}

// 만든 방법: 검사 설계 근거, 자료 원칙, 한계, 출처 전체
function drawAbout() {
  const M = D.method;
  const all = [
    ...D.depts.flatMap((d) => [...(d.cases || []), ...(d.trends || []), ...(d.stats || []), ...(d.certs || [])].map((x) => x.source).concat(d.sources || [])),
    ...(D.jobs || []).flatMap((j) => [j.source, j.onet, j.pay?.source, j.outlook?.source, j.ai?.source, ...(j.tipSources || []), ...(j.facts || []).map((f) => f.source)]),
    ...(D.faq || []).map((f) => f.source),
    ...(D.diag || []).map((r) => r.evidence?.source),
    ...((D.aiInfo || {}).stats || []).map((s) => s.source),
    ...((D.aiInfo || {}).parts || []).flatMap((p) => [...(p.rows || []), ...(p.cards || [])].map((r) => r.source)),
    ...Object.values(D.fieldRate).map((r) => r.source),
    D.ssu.rate.source, ...M.refs.map((r) => r.url)
  ];
  const list = [...new Set(all.flatMap(urls).filter((u) => /^https?:/.test(u)))];
  const short = (u) => { let t = u; try { t = decodeURI(u); } catch {} return t.length > 90 ? t.slice(0, 90) + "…" : t; };
  $("v-about").innerHTML = `
    <section>
      <h2>만든 방법</h2>
      <p class="lead">무엇을 재고 무엇을 못 재는지 숨기지 않으려고 적어 둬요.</p>
      <div class="rows">${M.rows.map((r) => `<div><b>${esc(r.k)}</b><p>${esc(r.t)}</p></div>`).join("")}</div>
      <p class="verdict warn">${esc(M.limit)}</p>
    </section>
    <section>
      <h2>검사 설계에 참고한 자료</h2>
      <ul class="srclist">${M.refs.map((r) => `<li>${esc(r.t)} <a class="src" href="${esc(r.url)}" target="_blank" rel="noopener">원문</a></li>`).join("")}</ul>
    </section>
    <section>
      <h2>출처</h2>
      <details><summary class="muted">출처 <span class="num">${list.length}</span>개 모두 보기</summary>
      <ul class="srclist">${list.map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(short(u))}</a></li>`).join("")}</ul></details>
    </section>`;
}

const VIEWS = ["test", "map", "jobs", "ai", "faq", "about"];
function route() {
  const h = location.hash.slice(1) || "test";
  if (h === "main") return $("main").focus();
  const view = h.startsWith("jobs") ? "jobs" : h.startsWith("ai") ? "ai" : h.startsWith("r=") ? "test" : VIEWS.includes(h) ? h : "test";
  VIEWS.forEach((v) => $("v-" + v).hidden = v !== view);
  $("tabs").querySelectorAll("a").forEach((a) => { a.classList.toggle("on", a.hash === "#" + view); a.toggleAttribute("aria-current", a.hash === "#" + view); });
  document.body.classList.toggle("sub", view !== "test");
  $("tabs").querySelector("a.on")?.scrollIntoView({ inline: "center", block: "nearest" });
  if (h.startsWith("r=")) return showShared(h.slice(2));
  if (h.startsWith("jobs-")) {
    if (!$("job-" + h.slice(5))) { st.jobArea = ""; drawJobs(); }
    const el = $("job-" + h.slice(5));
    if (el) { el.open = true; el.scrollIntoView({ block: "start" }); }
  } else if (h.startsWith("ai-")) $(h)?.scrollIntoView({ block: "start" });
  else scrollTo(0, 0);
}

document.querySelectorAll(".checked").forEach((el) => el.textContent = D.checked);
drawPick(); render(); drawJobs(); drawFaq(); drawAi(); drawAbout();
addEventListener("hashchange", route);
