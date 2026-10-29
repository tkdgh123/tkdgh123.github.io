// 유형 검사 화면. index.html의 D, st, $, esc, src, dictFor, chips, drawPick, render를 쓴다.
const Q = D.quiz;
const qs = { i: -1, ans: [], school: "ssu", college: null, dept: null, year: 1, worry: null, place: null };

function visibleQuestions() {
  return Q.questions.filter((q) => !(qs.school !== "ssu" && (q.type === "college" || q.type === "dept")));
}

function optionsFor(q) {
  if (q.type === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  if (q.type === "college") return colleges.map((c) => ({ t: c, v: c }));
  if (q.type === "dept") return [...D.depts.filter((d) => d.college === qs.college).map((d) => ({ t: d.name, v: d.id })), { t: "여기 없어요", v: "none" }];
  if (q.type === "year") return [1, 2, 3, 4].map((y) => ({ t: `${y}학년`, v: y }));
  if (q.type === "worry") return D.worries.map((w) => ({ t: w, v: w }));
  if (q.type === "place") return D.places.map((p) => ({ t: p, v: p }));
  return q.options.map((o, k) => ({ t: o.t, v: k }));
}

function choose(q, v) {
  if (q.type) qs[q.type] = v;
  if (q.type === "school" && v !== "ssu") { qs.college = null; qs.dept = null; }
  qs.ans[qs.i] = v;
  qs.i++;
  drawTest();
}

function scoreAll() {
  const sc = Object.fromEntries(Q.axes.map((a) => [a.id, 0]));
  const max = Object.fromEntries(Q.axes.map((a) => [a.id, 0]));
  visibleQuestions().forEach((q, k) => {
    if (q.type) return;
    Q.axes.forEach((a) => { max[a.id] += Math.max(...q.options.map((o) => Math.abs(o.s[a.id] || 0))); });
    const o = q.options[qs.ans[k]];
    if (o) Object.entries(o.s).forEach(([ax, n]) => sc[ax] += n);
  });
  sc.stage += qs.year <= 2 ? 1 : -1; max.stage += 1;
  return Q.axes.map((a) => {
    const n = sc[a.id], m = max[a.id] || 1;
    const side = n > 0 || (n === 0 && a.id !== "major") ? a.a : a.b;
    return { ...a, n, pct: Math.round(50 + 50 * n / m), side };
  });
}

function recommendJobs(T, S) {
  return (D.jobs || []).map((j, k) => {
    const tag = Q.jobTags.find((t) => j.name.includes(t.match));
    if (!tag) return null;
    let p = (tag.target === T ? 2 : tag.target === "" ? 1 : 0) + (tag.style === S ? 2 : 0);
    if (tag.place && tag.place === qs.place) p += 3;
    if (qs.place === "스타트업" && tag.style === "C") p += 1;
    if (qs.place === "외국계·해외" && j.name.includes("해외")) p += 2;
    return { j, p, k };
  }).filter(Boolean).sort((a, b) => b.p - a.p || a.k - b.k).slice(0, 3).map((x) => x.j);
}

function testIntro() {
  return `<div class="quiz intro">
    <h2>나의 취업 유형 찾기</h2>
    <p>질문 ${visibleQuestions().length}개에 답하면 나에게 맞는 직무, 걱정 해결법, 이번 학기 할 일이 나와요.</p>
    <div class="axes-pre">${Q.axes.map((a) => `<span><b>${a.a.k}</b>${esc(a.a.label)}</span><i>vs</i><span><b>${a.b.k}</b>${esc(a.b.label)}</span>`).map((x) => `<div>${x}</div>`).join("")}</div>
    <button type="button" class="go" id="q-start">시작하기</button>
    <p class="safe">답은 이 화면에서만 쓰이고 어디에도 저장되지 않아요.</p>
  </div>`;
}

function testQuestion() {
  const list = visibleQuestions(), q = list[qs.i];
  const opts = optionsFor(q);
  return `<div class="quiz">
    <div class="qbar"><span style="width:${Math.round(qs.i / list.length * 100)}%"></span></div>
    <div class="qtop"><button type="button" class="qback" id="q-back">← 이전</button><span class="num">${qs.i + 1} / ${list.length}</span></div>
    <h2>${esc(q.q)}</h2>
    <div class="qopts${opts.length > 5 ? " many" : ""}">${opts.map((o) => `<button type="button" class="qopt" data-v="${esc(o.v)}" aria-pressed="${String(qs.ans[qs.i]) === String(o.v)}">${esc(o.t)}</button>`).join("")}</div>
  </div>`;
}

function testResult() {
  const ax = scoreAll();
  const code = ax.map((a) => a.side.k).join("");
  const T = ax[1].side.k, S = ax[2].side.k, M = ax[0].side.k, E = ax[3].side.k;
  const name = Q.names[T + S];
  const d = D.depts.find((x) => x.id === qs.dept);
  const jobs = recommendJobs(T, S);
  const fix = Q.worryFix[qs.worry];
  const faqs = (D.faq || []).filter((f) => fix.faq.some((w) => f.q.includes(w))).slice(0, 2);
  const lane = d ? (M === "M" ? d.related_jobs : d.off_major_paths)?.slice(0, 3) : null;
  const S2 = D.ssu, year = qs.year;
  const todo = qs.school === "ssu" ? [...(S2.roadmap[year] || []), ...(((d || {}).roadmap || {})[year] || [])] : [];
  const link = (t) => t.url ? `<a href="${esc(t.url)}"${t.url.startsWith("#") ? "" : ` target="_blank" rel="noopener"`}>${esc(t.text)}</a>` : esc(t.text);

  const prompt = `나는 ${d ? d.promptName : "대학"}을 공부하는 대학교 ${year}학년이야.
진로 유형 검사 결과: ${ax.map((a) => a.side.label).join(", ")}
가장 큰 걱정: ${qs.worry}
가고 싶은 곳: ${qs.place}
관심 있는 직무 후보: ${jobs.map((j) => j.name).join(", ")}

1. 내 성향과 전공으로 이 직무들이 맞는지, 안 맞을 수 있는 점까지 솔직하게 말해줘.
2. 내 걱정을 줄이려면 이번 학기에 무엇부터 하면 좋을지 3가지 알려줘.
3. 이 직무를 준비할 때 AI를 어떻게 쓰면 좋을지 구체적인 장면 2개를 알려줘.
4. 확실하지 않은 정보는 확실하지 않다고 표시해줘.`;

  return `<div class="result">
    <div class="rhero">
      <p class="rk">나의 취업 유형</p>
      <div class="code">${code.split("").map((c) => `<span>${c}</span>`).join("")}</div>
      <h2>${esc(Q.majorWord[M])} ${esc(name)}</h2>
      <p class="rstage">${esc(Q.stageWord[E])}${d ? ` · ${esc(d.name)} ${year}학년` : ` · ${year}학년`}</p>
      <p class="rblurb">${esc(Q.blurbs[T + S])}</p>
    </div>

    <div class="meters">${ax.map((a) => `
      <div class="meter"><span class="${a.side === a.a ? "on" : ""}">${esc(a.a.label)}</span>
        <div class="track"><i style="left:${100 - a.pct}%"></i></div>
        <span class="${a.side === a.b ? "on" : ""}">${esc(a.b.label)}</span></div>`).join("")}
    </div>

    <section>
      <h2>나에게 맞을 직무</h2>
      <p class="sh">${esc(ax[1].side.label)} · ${esc(ax[2].side.label)} 쪽과 잘 맞는 직무예요.${qs.place && qs.place !== "아직 모름" ? ` ${esc(qs.place)} 희망도 반영했어요.` : ""}</p>
      <div class="rjobs">${jobs.map((j, k) => `<a class="rjob" href="#jobs-${j.key}"><i>${k + 1}</i><b>${esc(j.name)}</b><span>${esc(j.does)}</span><em>직무 사전에서 보기 →</em></a>`).join("")}</div>
    </section>

    ${lane?.length ? `<section>
      <h2>${M === "M" ? "내 전공을 살리는 길" : "내 전공에서 넘어가는 길"}</h2>
      <p class="sh">${esc(d.name)}에서 ${M === "M" ? "전공을 살려" : "전공 밖으로"} 가는 길 중 일부예요.</p>
      <div class="rlane ${M === "M" ? "in" : "out"}">${lane.map((j) => `<div class="job"><b>${esc(j.name || j.job)}</b><span>${esc(j.why)}${src(j.source)}</span></div>`).join("")}</div>
      <button type="button" class="chip" id="q-map">${esc(d.name)} 지도 전체 보기</button>
    </section>` : ""}

    <section>
      <h2>"${esc(qs.worry)}"</h2>
      <p class="sh">고른 걱정에 대해 바로 해 볼 수 있는 것이에요.</p>
      <div class="fix">
        <ol>${fix.steps.map((t) => `<li>${link(t)}</li>`).join("")}</ol>
        ${faqs.map((f) => `<div class="fq"><b>${esc(f.q)}</b><p>${esc(f.a)}</p><small>${esc(f.basis)}${src(f.source)}</small></div>`).join("")}
      </div>
    </section>

    ${todo.length ? `<section>
      <h2>${year}학년 이번 학기 할 일</h2>
      <p class="sh">숭실대 진로 지원 단계로는 '${esc(S2.stages[year])}'에 해당해요.${src(S2.stageSource)}</p>
      <ul class="todo">${todo.map((t) => `<li>${link(t)}</li>`).join("")}</ul>
    </section>` : ""}

    <section>
      <h2>AI에게 이어서 물어보기</h2>
      <p class="sh">검사 결과를 넣은 질문이에요. 붙여넣으면 더 길게 상담받을 수 있어요.</p>
      ${d?.ai?.length ? `<div class="ai">${d.ai.map((a) => `<div class="scene"><i>${esc(a.task)}</i><b>${esc(a.title)}</b><span>${esc(a.how)}</span></div>`).join("")}</div>` : ""}
      <div class="prompt"><pre id="r-text">${esc(prompt)}</pre>
        <div class="bar"><small>이름·학번·학교는 넣지 마세요. AI 답은 틀릴 수 있어요.</small><button type="button" class="copy" id="r-copy">복사하기</button></div></div>
    </section>

    <div class="again"><button type="button" class="chip" id="q-again">다시 하기</button></div>
  </div>`;
}

function drawTest() {
  const el = $("v-test"), list = visibleQuestions();
  if (qs.i < 0) el.innerHTML = testIntro();
  else if (qs.i < list.length) el.innerHTML = testQuestion();
  else el.innerHTML = testResult();

  $("q-start")?.addEventListener("click", () => { qs.i = 0; drawTest(); });
  $("q-back")?.addEventListener("click", () => { qs.i--; drawTest(); });
  $("q-again")?.addEventListener("click", () => { Object.assign(qs, { i: -1, ans: [] }); drawTest(); scrollTo(0, 0); });
  $("q-map")?.addEventListener("click", () => {
    Object.assign(st, { school: "ssu", college: qs.college, dept: qs.dept, year: qs.year });
    drawPick(); render(); location.hash = "map"; scrollTo(0, 0);
  });
  $("r-copy")?.addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("r-text").textContent); e.target.textContent = "복사했어요"; }
    catch { getSelection().selectAllChildren($("r-text")); e.target.textContent = "선택했어요, Ctrl+C"; }
  });
  el.querySelectorAll(".qopt").forEach((b) => b.addEventListener("click", () => {
    const q = list[qs.i], v = b.dataset.v;
    choose(q, q.type === "year" || !q.type ? Number(v) : v);
  }));
  if (qs.i >= 0) el.scrollIntoView({ block: "start" });
}
