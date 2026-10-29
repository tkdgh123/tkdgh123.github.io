// 질문지 화면과 맞춤 진단. index.html의 D, st, $, esc, src, colleges, drawPick, render, caseCard를 쓴다.
const Q = D.quiz;
const qa = { i: -1, a: {} };
const items = Q.groups.flatMap((g) => g.items);
const PER = 8;

// 한 화면 = 기본 정보 한 문항, 또는 같은 묶음의 7단계 문항 최대 8개, 또는 마지막 주관식
function steps() {
  const basics = Q.basics.filter((q) => !(qa.a.school && qa.a.school !== "ssu" && (q.id === "college" || q.id === "dept")));
  const pages = Q.groups.flatMap((g) => {
    const n = Math.ceil(g.items.length / PER), size = Math.ceil(g.items.length / n);
    return Array.from({ length: n }, (_, k) => ({ group: g, items: g.items.slice(k * size, (k + 1) * size) }));
  });
  return [...basics.map((q) => ({ q })), ...pages, { note: true }];
}
const yearNum = () => parseInt(qa.a.year) || 1;
const total = () => steps().filter((s) => s.q).length + items.length;
const done = () => steps().filter((s) => s.q && qa.a[s.q.id]).length + items.filter((it) => qa.a[it.id]).length;
const label = (id) => items.find((it) => it.id === id).scale[qa.a[id] - 1];

function optionsFor(q) {
  if (q.id === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  if (q.id === "college") return colleges.map((c) => ({ t: c, v: c }));
  if (q.id === "dept") return [...D.depts.filter((d) => d.college === qa.a.college).map((d) => ({ t: d.name, v: d.id })), { t: "여기 없어요", v: "none" }];
  return q.options.map((o) => ({ t: o, v: o }));
}

function next() { qa.i++; drawTest(); }

// 문항 묶음의 평균을 0~100점으로
function score(list) {
  const v = list.map((it) => qa.a[it.id]).filter(Boolean);
  return v.length ? Math.round(v.reduce((s, x) => s + x - 1, 0) / v.length / 6 * 100) : 0;
}

function fits() {
  return (D.jobs || []).map((job) => {
    const mine = items.filter((it) => it.jobs?.includes(job.key));
    const why = mine.filter((it) => qa.a[it.id] >= 6).sort((x, y) => qa.a[y.id] - qa.a[x.id]).slice(0, 3)
      .map((it) => `${Q.say(it.id, qa.a[it.id])} 골랐어요`);
    return { job, score: score(mine), why };
  }).sort((x, y) => y.score - x.score);
}

function testIntro() {
  return `<div class="quiz intro">
    <h2>나에게 맞는 취업 준비 찾기</h2>
    <p>질문 ${total()}개에 7단계로 답하면, 지금 내 상황을 진단하고 맞는 직무와 보완할 점, 이번 학기 할 일을 알려 줘요. 20분쯤 걸려요.</p>
    <div class="secs">${["기본 정보", ...Q.groups.map((g) => g.title)].map((s, k) => `<span><b>${k + 1}</b>${esc(s)}</span>`).join("")}</div>
    <button type="button" class="go" id="q-start">시작하기</button>
    <p class="safe">답은 이 화면에서만 쓰이고 어디에도 저장되지 않아요.</p>
  </div>`;
}

function head(sec, title) {
  return `<div class="qbar"><span style="width:${Math.round(done() / total() * 100)}%"></span></div>
    <div class="qtop"><button type="button" class="qback" id="q-back">← 이전</button><span>${esc(sec)} · <span class="num" id="q-num">${done()} / ${total()}</span></span></div>
    <h2>${esc(title)}</h2>`;
}

function testBasic(q) {
  const cur = qa.a[q.id], opts = optionsFor(q);
  return `<div class="quiz">${head("기본 정보", q.q)}
    <div class="qopts${opts.length > 5 ? " grid" : ""}">${opts.map((o) => `<button type="button" class="qopt" data-v="${esc(o.v)}" aria-pressed="${String(cur) === String(o.v)}">${esc(o.t)}</button>`).join("")}</div></div>`;
}

function testPage(s) {
  const all = s.items.every((it) => qa.a[it.id]);
  return `<div class="quiz">${head(s.group.title, s.group.ask)}
    <ol class="lks">${s.items.map((it) => `<li class="lk${qa.a[it.id] ? " done" : ""}" id="lk-${it.id}">
      <p>${esc(it.q)}</p>
      <div class="lscale">${it.scale.map((t, k) => `<button type="button" class="lv v${k + 1}" data-id="${it.id}" data-v="${k + 1}" aria-pressed="${qa.a[it.id] === k + 1}"><i></i><span>${t}</span></button>`).join("")}</div>
    </li>`).join("")}</ol>
    <button type="button" class="go" id="q-next"${all ? "" : " disabled"}>다음</button></div>`;
}

function testNote() {
  const cur = qa.a.note;
  return `<div class="quiz">${head("마지막", Q.note.q)}
    <textarea id="q-text" rows="4" placeholder="예: 전공 공부는 재밌는데 이걸로 뭘 할 수 있을지 모르겠어요">${esc(cur || "")}</textarea>
    <p class="hint">${esc(Q.note.hint)}</p>
    <button type="button" class="go" id="q-next">결과 보기</button></div>`;
}

const bars = (rows) => `<div class="meters">${rows.map((r) => `<${r.href ? `a href="${r.href}"` : "div"} class="meter"><span>${esc(r.name)}</span><span class="track"><span style="width:${r.score}%"></span></span><b class="num">${r.score}</b></${r.href ? "a" : "div"}>`).join("")}</div>`;

function testResult() {
  const a = qa.a, d = D.depts.find((x) => x.id === a.dept), year = yearNum();
  const all = fits(), recs = all.filter((r) => r.score > 0).slice(0, 3);
  const fit = Object.fromEntries(all.map((r) => [r.job.key, r.score]));
  const diags = (D.diag || []).filter((r) => { try { return r.when({ ...a, yearN: year, fit }); } catch { return false; } });
  const why = (r) => typeof r.why === "function" ? r.why({ ...a, yearN: year, fit }) : r.why;
  const areas = Q.groups.filter((g) => g.state).map((g) => ({ name: g.title, score: score(g.items) }));
  const stateItems = Q.groups.filter((g) => g.state).flatMap((g) => g.items);
  const weak = stateItems.filter((it) => qa.a[it.id] <= 3).sort((x, y) => qa.a[x.id] - qa.a[y.id]).slice(0, 8);
  const strong = stateItems.filter((it) => qa.a[it.id] >= 6);
  const liked = (ids) => Q.groups.filter((g) => ids.includes(g.id)).flatMap((g) => g.items).filter((it) => qa.a[it.id] >= 6).sort((x, y) => qa.a[y.id] - qa.a[x.id]);
  const likes = liked(["work", "style"]), wants = liked(["org", "value"]);
  const majorWorry = qa.a.majorBelief <= 3;
  const S = D.ssu;
  const todo = a.school === "ssu" ? [...(S.roadmap[year] || []), ...(((d || {}).roadmap || {})[year] || [])] : [];
  const link = (t) => t.url ? `<a href="${esc(t.url)}"${t.url.startsWith("#") ? "" : ` target="_blank" rel="noopener"`}>${esc(t.text)}</a>` : esc(t.text);
  const facts = [d ? d.name : a.school === "ssu" ? "학과 미선택" : "다른 학교", a.year, a.double === "하고 있어요" ? "복수·부전공 중" : null].filter(Boolean);

  const prompt = `나는 ${d ? d.promptName : "대학"}을 공부하는 대학교 ${a.year} 학생이야. 복수·부전공은 ${a.double}.
취업 준비 질문지에 7단계로 답한 결과야.
- 준비 상태(0~100점): ${areas.map((x) => `${x.name} ${x.score}`).join(", ")}
- 낮게 답한 것: ${weak.map((it) => `${it.q}(${label(it.id)})`).join(", ") || "없음"}
- 높게 답한 것: ${strong.map((it) => `${it.q}(${label(it.id)})`).join(", ") || "없음"}
- 하고 싶은 일·방식: ${likes.slice(0, 8).map((it) => `${it.q}(${label(it.id)})`).join(", ") || "뚜렷하게 좋은 것 없음"}
- 가고 싶은 곳·중요한 것: ${wants.map((it) => `${it.q}(${label(it.id)})`).join(", ") || "뚜렷하게 좋은 것 없음"}${a.note ? `\n- 고민: ${a.note}` : ""}
- 맞을 수 있는 직무 후보: ${recs.map((r) => `${r.job.name}(${r.score}점)`).join(", ")}

1. 내 상황에서 가장 먼저 채워야 할 부분을 솔직하게 말해줘.
2. 이 직무 후보들이 나에게 맞는지, 안 맞을 수 있는 점까지 알려줘.
3. 이번 학기에 할 일 3가지를 작은 것부터 알려줘.
4. 확실하지 않은 정보는 확실하지 않다고 표시해줘.`;

  return `<div class="result">
    <div class="rhero">
      <p class="rk">내 준비 상태 (0~100점)</p>
      <div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
      ${bars(areas)}
      ${a.note ? `<p class="rnote">"${esc(a.note)}"</p>` : ""}
    </div>

    ${diags.length ? `<section>
      <h2>지금 먼저 볼 것</h2>
      <p class="sh">답을 보고 고른 진단이에요. 근거 자료를 같이 붙였어요.</p>
      <div class="diags">${diags.map((r) => `<div class="diag">
        <b>${esc(r.title)}</b>
        <p class="dwhy">${esc(why(r))}</p>
        ${r.evidence ? `<p class="dev">${esc(r.evidence.text)}${src(r.evidence.source)}</p>` : ""}
        ${r.steps?.length ? `<ol>${r.steps.map((t) => `<li>${link(t)}</li>`).join("")}</ol>` : ""}
      </div>`).join("")}</div>
    </section>` : ""}

    ${weak.length ? `<section>
      <h2>낮게 답한 것</h2>
      <p class="sh">낮게 답한 순서예요. 할 수 있는 것을 붙였어요.</p>
      <ul class="todo weak">${weak.map((it) => `<li><b>${esc(it.q)}</b> <em>${label(it.id)}</em>${it.fix ? `<br>${link(it.fix)}` : ""}</li>`).join("")}</ul>
    </section>` : ""}

    ${recs.length ? `<section>
      <h2>나에게 맞을 수 있는 직무</h2>
      <p class="sh">하고 싶은 일·일하는 방식·가고 싶은 곳·중요한 것 답으로 점수를 냈어요. 눌러서 직무 사전을 보세요.</p>
      <div class="rjobs">${recs.map((r, k) => `<a class="rjob" href="#jobs-${r.job.key}"><i>${k + 1}</i><b>${esc(r.job.name)} <span class="num">${r.score}점</span></b><span>${esc(r.job.does)}</span>${r.why.length ? `<ul>${r.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}<em>직무 사전에서 보기 →</em></a>`).join("")}</div>
      <details class="allfit"><summary>직무 12개 모두 보기</summary>${bars(all.map((r) => ({ name: r.job.name, score: r.score, href: `#jobs-${r.job.key}` })))}</details>
    </section>` : ""}

    ${d ? `<section>
      <h2>${esc(d.name)} 졸업생들이 간 길</h2>
      <p class="sh">2024년 이후 공개된 실제 사례 중 일부예요.${majorWorry ? " 전공 밖으로 간 사례를 먼저 보여 줘요." : ""}</p>
      <div class="rcases">${(d.cases || []).slice().sort((x, y) => majorWorry ? (x.kind === "out" ? -1 : 1) - (y.kind === "out" ? -1 : 1) : 0).slice(0, 4).map(caseCard).join("")}</div>
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
  const el = $("v-test"), list = steps(), s = list[qa.i];
  el.innerHTML = qa.i < 0 ? testIntro() : !s ? testResult() : s.q ? testBasic(s.q) : s.note ? testNote() : testPage(s);

  $("q-start")?.addEventListener("click", () => { qa.i = 0; drawTest(); });
  $("q-back")?.addEventListener("click", () => { qa.i--; drawTest(); });
  $("q-again")?.addEventListener("click", () => { qa.i = -1; qa.a = {}; drawTest(); scrollTo(0, 0); });
  $("q-next")?.addEventListener("click", () => { if (s.note) qa.a.note = $("q-text").value.trim(); next(); });
  $("q-map")?.addEventListener("click", () => {
    Object.assign(st, { school: "ssu", college: qa.a.college, dept: qa.a.dept, year: yearNum() });
    drawPick(); render(); location.hash = "map"; scrollTo(0, 0);
  });
  $("r-copy")?.addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("r-text").textContent); e.target.textContent = "복사했어요"; }
    catch { getSelection().selectAllChildren($("r-text")); e.target.textContent = "선택했어요, Ctrl+C"; }
  });
  el.querySelectorAll(".qopt").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.v, q = s.q;
    if (q.id === "school" && v !== "ssu") { delete qa.a.college; delete qa.a.dept; }
    if (q.id === "college" && qa.a.college !== v) delete qa.a.dept;
    qa.a[q.id] = v; next();
  }));
  // 7단계 답: 다시 그리지 않고 그 자리에서 표시만 바꾼 뒤 다음 빈 문항으로 내려간다
  el.querySelectorAll(".lv").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.id, li = $(`lk-${id}`);
    qa.a[id] = +b.dataset.v;
    li.querySelectorAll(".lv").forEach((x) => x.setAttribute("aria-pressed", x === b));
    li.classList.add("done");
    $("q-num").textContent = `${done()} / ${total()}`;
    el.querySelector(".qbar span").style.width = `${Math.round(done() / total() * 100)}%`;
    const left = s.items.filter((it) => !qa.a[it.id]);
    $("q-next").disabled = left.length > 0;
    (left.length ? $(`lk-${left[0].id}`) : $("q-next")).scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
  if (qa.i >= 0) el.scrollIntoView({ block: "start" });
}
