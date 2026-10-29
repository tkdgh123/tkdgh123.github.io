// 질문지 화면과 맞춤 진단. index.html의 D, st, $, esc, src, colleges, drawPick, render를 쓴다.
const Q = D.quiz;
const qa = { i: -1, a: {} };

const visible = () => Q.questions.filter((q) => !(qa.a.school && qa.a.school !== "ssu" && (q.id === "college" || q.id === "dept")));
const yearNum = () => parseInt(qa.a.year) || 1;

function optionsFor(q) {
  if (q.id === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  if (q.id === "college") return colleges.map((c) => ({ t: c, v: c }));
  if (q.id === "dept") return [...D.depts.filter((d) => d.college === qa.a.college).map((d) => ({ t: d.name, v: d.id })), { t: "여기 없어요", v: "none" }];
  return (q.options || []).map((o) => ({ t: o, v: o }));
}

function next() { qa.i++; drawTest(); }

function recommend() {
  const a = qa.a, score = {}, why = {};
  const add = (key, n, reason) => { score[key] = (score[key] || 0) + n; (why[key] ||= []).push(reason); };
  (a.like || []).forEach((l) => (Q.likeToJobs[l] || []).forEach((k) => add(k, 2, `끌리는 일로 '${l}'를 골랐어요`)));
  (a.org || []).forEach((o) => (Q.orgToJobs[o] || []).forEach((k) => add(k, 2, `가고 싶은 곳으로 '${o}'를 골랐어요`)));
  if (a.value === "안정성") ["ncs", "civil"].forEach((k) => add(k, 1, "회사를 고를 때 안정성을 가장 중요하게 봐요"));
  return Object.entries(score).sort((x, y) => y[1] - x[1]).slice(0, 3)
    .map(([k]) => ({ job: (D.jobs || []).find((j) => j.key === k), why: why[k] })).filter((x) => x.job);
}

function diagnose() {
  const a = { ...qa.a, yearN: yearNum() };
  return (D.diag || []).filter((r) => { try { return r.when(a); } catch { return false; } });
}

function testIntro() {
  return `<div class="quiz intro">
    <h2>나에게 맞는 취업 준비 찾기</h2>
    <p>질문 ${visible().length}개에 답하면 지금 내 상황을 진단하고, 맞는 직무와 해결책, 이번 학기 할 일을 알려 줘요.</p>
    <div class="secs">${Q.sections.map((s, k) => `<span><b>${k + 1}</b>${esc(s)}</span>`).join("")}</div>
    <button type="button" class="go" id="q-start">시작하기</button>
    <p class="safe">답은 이 화면에서만 쓰이고 어디에도 저장되지 않아요.</p>
  </div>`;
}

function testQuestion() {
  const list = visible(), q = list[qa.i], cur = qa.a[q.id];
  const head = `<div class="qbar"><span style="width:${Math.round(qa.i / list.length * 100)}%"></span></div>
    <div class="qtop"><button type="button" class="qback" id="q-back">← 이전</button><span>${esc(Q.sections[q.sec])} · <span class="num">${qa.i + 1} / ${list.length}</span></span></div>
    <h2>${esc(q.q)}</h2>`;
  if (q.kind === "text") return `<div class="quiz">${head}
    <textarea id="q-text" rows="4" placeholder="예: 전공 공부는 재밌는데 이걸로 뭘 할 수 있을지 모르겠어요">${esc(cur || "")}</textarea>
    <p class="hint">${esc(q.hint)}</p>
    <button type="button" class="go" id="q-next">${cur ? "다음" : "건너뛰기"}</button></div>`;
  const opts = optionsFor(q), many = q.kind === "many";
  const on = (v) => many ? (cur || []).includes(v) : String(cur) === String(v);
  return `<div class="quiz">${head}
    ${many ? `<p class="hint">여러 개 골라도 돼요</p>` : ""}
    <div class="qopts${opts.length > 5 ? " grid" : ""}">${opts.map((o) => `<button type="button" class="qopt${many ? " multi" : ""}" data-v="${esc(o.v)}" aria-pressed="${on(o.v)}">${esc(o.t)}</button>`).join("")}</div>
    ${many ? `<button type="button" class="go" id="q-next"${(cur || []).length ? "" : " disabled"}>다음</button>` : ""}</div>`;
}

function testResult() {
  const a = qa.a, d = D.depts.find((x) => x.id === a.dept), year = yearNum();
  const recs = recommend(), diags = diagnose();
  const S = D.ssu;
  const todo = a.school === "ssu" ? [...(S.roadmap[year] || []), ...(((d || {}).roadmap || {})[year] || [])] : [];
  const link = (t) => t.url ? `<a href="${esc(t.url)}"${t.url.startsWith("#") ? "" : ` target="_blank" rel="noopener"`}>${esc(t.text)}</a>` : esc(t.text);
  const facts = [
    d ? d.name : a.school === "ssu" ? "학과 미선택" : "다른 학교", a.year, a.double === "하고 있어요" ? "복수·부전공 중" : null,
    `학점 ${a.gpa}`, `어학 ${a.lang}`, `자격증 ${a.cert}`, `경험: ${(a.exp || []).join(", ")}`, `직무 ${a.goal}`, `가고 싶은 곳: ${(a.org || []).join(", ")}`, `중요한 것: ${a.value}`
  ].filter(Boolean);

  const prompt = `나는 ${d ? d.promptName : "대학"}을 공부하는 대학교 ${a.year} 학생이야.
- 복수·부전공: ${a.double}
- 학점: ${a.gpa} / 어학 점수: ${a.lang} / 관련 자격증: ${a.cert}
- 해 본 경험: ${(a.exp || []).join(", ")}
- 가장 큰 걱정: ${a.worry}${a.note ? `\n- 고민: ${a.note}` : ""}
- 끌리는 일: ${(a.like || []).join(", ")}
- 가고 싶은 곳: ${(a.org || []).join(", ")} / 가장 중요한 것: ${a.value}
- 관심 직무 후보: ${recs.map((r) => r.job.name).join(", ")}

1. 내 상황에서 가장 먼저 채워야 할 부분을 솔직하게 말해줘.
2. 이 직무 후보들이 나에게 맞는지, 안 맞을 수 있는 점까지 알려줘.
3. 이번 학기에 할 일 3가지를 작은 것부터 알려줘.
4. 확실하지 않은 정보는 확실하지 않다고 표시해줘.`;

  return `<div class="result">
    <div class="rhero">
      <p class="rk">내 상황 한눈에</p>
      <div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
      ${a.note ? `<p class="rnote">"${esc(a.note)}"</p>` : ""}
    </div>

    ${diags.length ? `<section>
      <h2>지금 먼저 볼 것</h2>
      <p class="sh">고른 답을 보고 고른 진단이에요. 근거 자료를 같이 붙였어요.</p>
      <div class="diags">${diags.map((r) => `<div class="diag">
        <b>${esc(r.title)}</b>
        <p class="dwhy">${esc(typeof r.why === "function" ? r.why(a) : r.why)}</p>
        ${r.evidence ? `<p class="dev">${esc(r.evidence.text)}${src(r.evidence.source)}</p>` : ""}
        ${r.steps?.length ? `<ol>${r.steps.map((t) => `<li>${link(t)}</li>`).join("")}</ol>` : ""}
      </div>`).join("")}</div>
    </section>` : ""}

    ${recs.length ? `<section>
      <h2>나에게 맞을 수 있는 직무</h2>
      <p class="sh">왜 골랐는지 함께 적었어요. 눌러서 직무 사전을 보세요.</p>
      <div class="rjobs">${recs.map((r, k) => `<a class="rjob" href="#jobs-${r.job.key}"><i>${k + 1}</i><b>${esc(r.job.name)}</b><span>${esc(r.job.does)}</span><ul>${r.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul><em>직무 사전에서 보기 →</em></a>`).join("")}</div>
    </section>` : ""}

    ${d ? `<section>
      <h2>${esc(d.name)} 졸업생들이 간 길</h2>
      <p class="sh">2024년 이후 공개된 실제 사례 중 일부예요.${a.worry === "전공이 취업에 불리할까 봐요" ? " 전공 밖으로 간 사례를 먼저 보여 줘요." : ""}</p>
      <div class="rcases">${(d.cases || []).slice().sort((x, y) => a.worry === "전공이 취업에 불리할까 봐요" ? (x.kind === "out" ? -1 : 1) - (y.kind === "out" ? -1 : 1) : 0).slice(0, 4).map(caseCard).join("")}</div>
      <button type="button" class="chip" id="q-map">${esc(d.name)} 진로 지도 전체 보기</button>
    </section>` : ""}

    ${todo.length ? `<section>
      <h2>${year}학년 이번 학기 할 일</h2>
      <ul class="todo">${todo.map((t) => `<li>${link(t)}</li>`).join("")}</ul>
    </section>` : ""}

    <section>
      <h2>AI에게 이어서 물어보기</h2>
      <p class="sh">내 답을 넣은 질문이에요. 붙여넣으면 더 길게 상담받을 수 있어요.</p>
      ${d?.ai?.length ? `<div class="ai">${d.ai.map((x) => `<div class="scene"><i>${esc(x.task)}</i><b>${esc(x.title)}</b><span>${esc(x.how)}</span></div>`).join("")}</div>` : ""}
      <div class="prompt"><pre id="r-text">${esc(prompt)}</pre>
        <div class="bar"><small>이름·학번·학교는 넣지 마세요. AI 답은 틀릴 수 있어요.</small><button type="button" class="copy" id="r-copy">복사하기</button></div></div>
    </section>

    <div class="again"><button type="button" class="chip" id="q-again">다시 하기</button></div>
  </div>`;
}

function drawTest() {
  const el = $("v-test"), list = visible();
  el.innerHTML = qa.i < 0 ? testIntro() : qa.i < list.length ? testQuestion() : testResult();
  const q = list[qa.i];

  $("q-start")?.addEventListener("click", () => { qa.i = 0; drawTest(); });
  $("q-back")?.addEventListener("click", () => { qa.i--; drawTest(); });
  $("q-again")?.addEventListener("click", () => { qa.i = -1; qa.a = {}; drawTest(); scrollTo(0, 0); });
  $("q-next")?.addEventListener("click", () => { if (q.kind === "text") qa.a.note = $("q-text").value.trim(); next(); });
  $("q-map")?.addEventListener("click", () => {
    Object.assign(st, { school: "ssu", college: qa.a.college, dept: qa.a.dept, year: yearNum() });
    drawPick(); render(); location.hash = "map"; scrollTo(0, 0);
  });
  $("r-copy")?.addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("r-text").textContent); e.target.textContent = "복사했어요"; }
    catch { getSelection().selectAllChildren($("r-text")); e.target.textContent = "선택했어요, Ctrl+C"; }
  });
  el.querySelectorAll(".qopt").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.v;
    if (q.kind === "many") {
      let cur = qa.a[q.id] || [];
      const solo = /^아직|모름/.test(v);
      cur = cur.includes(v) ? cur.filter((x) => x !== v) : solo ? [v] : [...cur.filter((x) => !/^아직|모름/.test(x)), v];
      qa.a[q.id] = cur; drawTest();
    } else {
      if (q.id === "school" && v !== "ssu") { delete qa.a.college; delete qa.a.dept; }
      if (q.id === "college" && qa.a.college !== v) delete qa.a.dept;
      qa.a[q.id] = v; next();
    }
  }));
  if (qa.i >= 0) el.scrollIntoView({ block: "start" });
}
