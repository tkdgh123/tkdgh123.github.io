// 검사 화면과 결과. app.js의 D, st, $, esc, src, link, colleges, drawPick, render, caseCard, AREA, codeTag를 쓴다.
const Q = D.quiz;
const qa = { i: -1, a: {}, sector: [], pairs: {} };
const LIKERT = [...Q.interest.items, ...Q.readyItems];
const PER = 6;

// 한 화면 = 기본 정보 한 문항 / 흥미 6문항 / 준비 상태 한 영역(4문항) / 가치 짝 비교 6쌍 / 끌리는 곳 / 고민(선택)
function steps() {
  const basics = Q.basics.filter((q) => !(q.id === "dept" && qa.a.school && qa.a.school !== "ssu"));
  const it = Q.interest.items;
  return [
    ...basics.map((q) => ({ q })),
    ...Array.from({ length: Math.ceil(it.length / PER) }, (_, k) => ({ sec: "흥미", ask: Q.interest.ask, items: it.slice(k * PER, (k + 1) * PER) })),
    ...Q.ready.groups.map((g) => ({ sec: `준비 상태 · ${g.name}`, ask: Q.ready.ask, items: g.items })),
    { pairs: true }, { sector: true }, { note: true }
  ];
}
const total = () => steps().filter((s) => s.q).length + LIKERT.length + Q.pairs.length + 1;
const done = () => steps().filter((s) => s.q && qa.a[s.q.id]).length + LIKERT.filter((it) => qa.a[it.id]).length
  + Object.keys(qa.pairs).length + (qa.sector.length ? 1 : 0);
const yearNum = (a = qa.a) => parseInt(a.year) || 1;
addEventListener("beforeunload", (e) => { if (qa.i >= 0 && qa.i < steps().length && done() > 3) e.preventDefault(); });

function optionsFor(q) {
  if (q.id === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  return q.options.map((o) => ({ t: o, v: o }));
}

// 결과 계산. 규준이 없으니 원점수와 내 안의 순서만 낸다.
function compute(a, sector, pairs) {
  const riasec = Object.fromEntries(Q.areas.map((x) => {
    const sum = Q.interest.items.filter((it) => it.id[0] === x.id).reduce((s, it) => s + a[it.id], 0);
    return [x.id, Math.round((sum - 5) / 20 * 100)];
  }));
  const mean = Object.values(riasec).reduce((s, x) => s + x, 0) / 6;
  // 직무 흥미 코드의 1·2·3번째 글자에 3·2·1 가중치를 주고 내 영역 점수를 평균 낸다.
  // 코드가 1~2글자면 빈 자리는 내 평균으로 채워, 짧은 코드가 한 영역 점수로만 극단적으로 나오지 않게 한다.
  // 동점이면 내 학과 졸업생이 많이 가는 직무를 앞에 둔다.
  const d = D.depts.find((x) => x.id === a.dept);
  const near = (job) => (d?.paths || []).some((p) => job.alias.some((al) => p.name.includes(al))) ? 1 : 0;
  const fits = (D.jobs || []).filter((j) => j.riasec).map((job) => {
    const score = Math.round([0, 1, 2].reduce((s, k) => s + [3, 2, 1][k] * (job.riasec[k] ? riasec[job.riasec[k]] : mean), 0) / 6);
    return { job, score, near: near(job) };
  }).sort((x, y) => y.score - x.score || y.near - x.near);
  // 위 3개는 흥미 코드가 서로 다른 직무로 고르고, 같은 코드 직무는 '비슷한 직무'로 붙인다
  const top3 = [];
  fits.forEach((f) => {
    const same = top3.find((t) => t.job.riasec === f.job.riasec);
    if (same) same.alike.push(f.job); else if (top3.length < 3) top3.push({ ...f, alike: [] });
  });
  const ready = Object.fromEntries(Q.ready.groups.map((g) => [g.id, g.items.reduce((s, it) => s + a[it.id], 0) / g.items.length]));
  const wins = Object.fromEntries(Q.values.map((v) => [v.id, 0]));
  Q.pairs.forEach(([x, y], k) => { if (pairs[k] != null) wins[pairs[k] ? y : x]++; });
  const values = Q.values.slice().sort((x, y) => wins[y.id] - wins[x.id]);
  const iv = Q.interest.items.map((it) => a[it.id]), ivMean = iv.reduce((s, x) => s + x, 0) / iv.length;
  const flat = Math.sqrt(iv.reduce((s, x) => s + (x - ivMean) ** 2, 0) / iv.length) < 0.6;
  const fitMean = fits.reduce((s, f) => s + f.score, 0) / fits.length;
  return { riasec, fits, top3, ready, wins, values, flat, fitMean, top: top3.map((r) => r.job.key), fit: Object.fromEntries(fits.map((r) => [r.job.key, r.score])) };
}

function testIntro() {
  const secs = [["기본 정보", "학교·학과·학년 3문항"], ["흥미", "30문항. 하고 싶은 일을 6영역(현실·탐구·예술·사회·진취·관습)으로 봐요"],
    ["준비 상태", "20문항. 방향·정보·경험·AI 사용 습관·마음"], ["가치", "6번. 둘 중 더 중요한 것 고르기"], ["끌리는 곳", "1문항. 여러 개 골라도 돼요"]];
  return `<section>
    <h2>흥미가 겹치는 직무와 이번 학기 할 일</h2>
    <p class="lead">${total()}문항에 답하면 흥미가 겹치는 직무, 지금 준비 상태, 먼저 볼 것과 이번 학기 할 일을 보여 줘요. 10분쯤 걸려요.</p>
    <div class="btns" style="margin-bottom:24px"><button type="button" class="btn" id="q-start">시작하기</button><span class="safe">정답은 없어요. 연봉·학점은 생각하지 말고 끌리는 대로 골라 주세요. 답은 이 화면에서만 쓰여요.</span></div>
    <div class="rows">${secs.map(([k, t]) => `<div><b>${k}</b><p>${t}</p></div>`).join("")}</div>
    <p class="verdict">이 검사는 공공 검사의 구조를 참고해 직접 만든 참고용이에요. 대학생 전체와 비교한 점수가 아니라 내 답 안에서의 순서를 보여 줘요. <a href="#about">만든 방법 보기</a></p>
  </section>`;
}

function head(sec, title) {
  return `<div class="qbar" role="progressbar" aria-label="진행" aria-valuemin="0" aria-valuemax="${total()}" aria-valuenow="${done()}"><span style="width:${Math.round(done() / total() * 100)}%"></span></div>
    <div class="qtop"><button type="button" class="qback" id="q-back">← 이전</button><span>${esc(sec)} · <span class="num" id="q-num">${done()} / ${total()}</span></span></div>
    <h2 tabindex="-1" id="q-title">${esc(title)}</h2>`;
}

function testBasic(q) {
  const cur = qa.a[q.id];
  if (q.id === "dept") {
    const groups = colleges.map((c) => `<div class="qgroup"><b>${esc(c)}</b><div class="qopts">${D.depts.filter((d) => d.college === c).map((d) =>
      `<button type="button" class="qopt" data-v="${d.id}" aria-pressed="${cur === d.id}">${esc(d.name)}</button>`).join("")}</div></div>`).join("");
    return `<div class="quiz">${head("기본 정보", q.q)}${groups}
      <div class="qopts"><button type="button" class="qopt" data-v="none" aria-pressed="${cur === "none"}">여기 없어요</button></div></div>`;
  }
  return `<div class="quiz">${head("기본 정보", q.q)}
    <div class="qopts">${optionsFor(q).map((o) => `<button type="button" class="qopt" data-v="${esc(o.v)}" aria-pressed="${String(cur) === String(o.v)}">${esc(o.t)}</button>`).join("")}</div></div>`;
}

function testPage(s) {
  const all = s.items.every((it) => qa.a[it.id]), cur = s.items.find((it) => !qa.a[it.id]);
  return `<div class="quiz">${head(s.sec, s.ask)}
    <ol class="lks going">${s.items.map((it) => `<li class="lk${qa.a[it.id] ? " done" : ""}${it === cur ? " cur" : ""}" id="lk-${it.id}">
      <p>${esc(it.q)}</p>
      <div class="lscale" role="group" aria-label="${esc(it.q)}">${Q.scaleOf(it.id).map((t, k) => `<button type="button" class="lv v${k + 1}" data-id="${it.id}" data-v="${k + 1}" aria-pressed="${qa.a[it.id] === k + 1}"><i></i><span>${t}</span></button>`).join("")}</div>
    </li>`).join("")}</ol>
    <button type="button" class="btn" id="q-next"${all ? "" : " disabled"}>다음</button></div>`;
}

function testPairs() {
  const V = Object.fromEntries(Q.values.map((v) => [v.id, v]));
  const all = Q.pairs.every((_, k) => qa.pairs[k] != null);
  return `<div class="quiz">${head("가치", "회사를 고를 때 둘 중 더 중요한 쪽은요?")}
    <p class="hint">둘 다 중요해도 하나만 골라 주세요. 그래야 순서가 보여요.</p>
    <ol class="lks">${Q.pairs.map((p, k) => `<li class="lk"><div class="pair">${(k % 2 ? [1, 0] : [0, 1]).map((side, n) =>
      `${n ? "<span>또는</span>" : ""}<button type="button" class="pick2" data-k="${k}" data-side="${side}" aria-pressed="${qa.pairs[k] === side}"><b>${esc(V[p[side]].name)}</b><span>${esc(V[p[side]].desc)}</span></button>`).join("")}</div></li>`).join("")}</ol>
    <button type="button" class="btn" id="q-next"${all ? "" : " disabled"}>다음</button></div>`;
}

function testSector() {
  const S = Q.sectors;
  return `<div class="quiz">${head("끌리는 곳", S.q)}
    <div class="qgroup"><div class="qopts">${S.options.map((o) => `<button type="button" class="qopt multi" data-s="${o.v}" aria-pressed="${qa.sector.includes(o.v)}">${esc(o.t)}</button>`).join("")}</div></div>
    <button type="button" class="btn" id="q-next"${qa.sector.length ? "" : " disabled"}>다음</button></div>`;
}

function testNote() {
  return `<div class="quiz">${head("마지막 (선택)", Q.note.q)}
    <textarea id="q-text" rows="4" placeholder="예: 전공 공부는 재밌는데 이걸로 뭘 할 수 있을지 모르겠어요">${esc(qa.a.note || "")}</textarea>
    <p class="hint">${esc(Q.note.hint)} 이 칸은 결과 링크에 들어가지 않아요.</p>
    <button type="button" class="btn" id="q-next">결과 보기</button></div>`;
}

const bars = (rows) => `<div class="meters">${rows.map((r) => `<${r.href ? `a href="${r.href}"` : "div"} class="meter${r.low ? " low" : ""}"><span>${esc(r.name)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span><span class="track"><span style="width:${r.pct}%"></span></span><b class="num">${esc(r.label)}</b></${r.href ? "a" : "div"}>`).join("")}</div>`;

// 결과 링크: 답을 숫자로 줄여 주소 뒤에 붙인다. 서버에 아무것도 보내지 않는다.
function encode() {
  const mask = Q.sectors.options.reduce((m, o, k) => m | (qa.sector.includes(o.v) ? 1 << k : 0), 0);
  return ["1", qa.a.school, qa.a.dept || "-", yearNum(), LIKERT.map((it) => qa.a[it.id]).join(""), Q.pairs.map((_, k) => qa.pairs[k]).join(""), mask.toString(36)].join(".");
}
function showShared(code) {
  const [ver, school, dept, year, digits, pairBits, mask] = code.split(".");
  const yearOpt = Q.basics.find((q) => q.id === "year").options;
  if (ver !== "1" || !digits || digits.length !== LIKERT.length || !/^[1-5]+$/.test(digits) || !/^[01]{6}$/.test(pairBits || "")) {
    $("v-test").innerHTML = `<section><h2>결과 링크를 읽지 못했어요</h2><p class="lead">주소가 잘렸을 수 있어요. 검사를 새로 해 보세요.</p><button type="button" class="btn" id="q-again">검사 시작</button></section>`;
    $("q-again").onclick = () => { location.hash = "test"; qa.i = -1; drawTest(); };
    return;
  }
  qa.a = { school, year: yearOpt[Math.min(4, Math.max(1, +year)) - 1] };
  if (dept !== "-" && (dept === "none" || D.depts.some((d) => d.id === dept))) qa.a.dept = dept;
  LIKERT.forEach((it, k) => qa.a[it.id] = +digits[k]);
  qa.pairs = Object.fromEntries(pairBits.split("").map((b, k) => [k, +b]));
  const m = parseInt(mask, 36) || 0;
  qa.sector = Q.sectors.options.filter((_, k) => m & (1 << k)).map((o) => o.v);
  qa.shared = true; qa.i = steps().length; drawTest();
}

function prompts(a, r, d) {
  const who = `나는 ${d ? d.promptName : "대학"}을 공부하는 대학교 ${a.year} 학생이야.`;
  const top = r.top3.map((x) => x.job.name);
  const interest = Q.areas.slice().sort((x, y) => r.riasec[y.id] - r.riasec[x.id]).map((x) => `${x.name} ${r.riasec[x.id]}`).join(", ");
  const ready = Q.ready.groups.map((g) => `${g.name} ${r.ready[g.id].toFixed(1)}`).join(", ");
  const low = Q.readyItems.filter((it) => a[it.id] <= 2).map((it) => it.q);
  const sectors = qa.sector.map((v) => Q.sectors.options.find((o) => o.v === v).t).join(", ");
  const base = `${who}
진로 검사(직접 만든 참고용, 규준 없음)에 답한 결과야.
- 흥미 6영역(0~100, 내 안의 순서): ${interest}
- 준비 상태(5점 만점 평균): ${ready}
- 낮게 답한 것: ${low.join(" / ") || "없음"}
- 회사 고를 때 중요한 순서: ${r.values.map((v) => v.name).join(" > ")}
- 끌리는 곳: ${sectors}${a.note ? `\n- 고민: ${a.note}` : ""}
- 흥미가 많이 겹치는 직무: ${top.join(", ")}`;
  const tail = "\n확실하지 않은 정보는 확실하지 않다고 표시하고, 2024년 이후 자료를 기준으로 답해줘.";
  return [
    { id: "diag", label: "내 상황 진단", text: `${base}\n\n1. 내 상황에서 가장 먼저 채워야 할 부분을 솔직하게 말해줘.\n2. 이 직무 후보들이 나에게 맞는지, 안 맞을 수 있는 점까지 알려줘.\n3. 이번 학기에 할 일 3가지를 작은 것부터 알려줘.${tail}` },
    { id: "jobs", label: "직무 비교", text: `${base}\n\n${top.join(", ")}를 비교해줘. 직무마다 신입의 하루 일과, 내 흥미와 맞는 점·안 맞을 수 있는 점, AI가 그 일을 어떻게 바꾸고 있는지, 대학생이 지금 직접 해 볼 수 있는 작은 체험 1개를 표로 정리해줘.${tail}` },
    { id: "plan", label: "학기 계획", text: `${base}\n\n수업과 병행하면서 주 3~4시간만 쓴다고 할 때, 이번 학기 12주 계획을 주 단위 표로 짜줘. 준비 상태에서 낮은 영역을 먼저 채우고, 끝나면 남길 결과물을 하나 정해줘.${tail}` },
    { id: "ai", label: "AI 공부 계획", text: `${base}\n\n${top[0]} 직무에서 실제로 AI를 쓰는 일을 3가지 알려주고, 내가 4주 동안 무료로 연습할 수 있는 과제를 주별로 하나씩 내줘. 개인정보·회사 자료를 AI에 넣으면 안 되는 이유도 짧게 알려줘.${tail}` },
    { id: "talk", label: "면접 연습", text: `${base}\n\n너는 ${top[0]} 신입 채용 면접관이야. 질문을 한 번에 하나씩 하고, 내가 답하면 좋은 점 하나와 고칠 점 하나를 말한 뒤 다음 질문으로 넘어가줘. 5문항 뒤에 전체 평을 해줘.` }
  ];
}

function testResult() {
  const a = qa.a, d = D.depts.find((x) => x.id === a.dept), year = yearNum();
  const r = compute(a, qa.sector, qa.pairs);
  const ctx = { ...a, yearN: year, dept: a.dept, sector: qa.sector, ready: r.ready, fit: r.fit, fitMean: r.fitMean, top: r.top };
  const diags = (D.diag || []).filter((x) => { try { return x.when(ctx); } catch { return false; } });
  const why = (x) => typeof x.why === "function" ? x.why(ctx) : x.why;
  const areasSorted = Q.areas.slice().sort((x, y) => r.riasec[y.id] - r.riasec[x.id]);
  const lead = areasSorted[0], close = r.riasec[areasSorted[0].id] - r.riasec[areasSorted[2].id] <= 10;
  const leadCovered = (D.jobs || []).some((j) => (j.riasec || "")[0] === lead.id);
  const low = Q.readyItems.filter((it) => a[it.id] <= 2).sort((x, y) => a[x.id] - a[y.id]);
  const S = D.ssu;
  const todo = a.school === "ssu" ? [...(S.roadmap[year] || []), ...(((d || {}).roadmap || {})[year] || [])] : [];
  const sectorNames = qa.sector.map((v) => Q.sectors.options.find((o) => o.v === v).t);
  const tags = [d ? d.name : a.school === "ssu" ? "학과 미선택" : "다른 학교", a.year, ...sectorNames];
  // 이긴 횟수가 같으면 같은 순위
  const rank = (v) => 1 + r.values.filter((x) => r.wins[x.id] > r.wins[v.id]).length;
  const P = prompts(a, r, d);
  // 점수가 같으면 같은 순위로 '공동'을 붙인다
  const tieRank = (x) => { const n = 1 + r.top3.filter((y) => y.score > x.score).length; return r.top3.filter((y) => y.score === x.score).length > 1 ? `공동 ${n}` : n; };
  const weakest = Q.ready.groups.slice().sort((x, y) => r.ready[x.id] - r.ready[y.id])[0];
  const first = diags[0]?.steps?.[0] || todo[0];

  return `<div class="result">
    <section class="rhead">
      <div class="rtags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <h2>내 결과 한눈에</h2>
      <div class="rows">
        <div><b>먼저 알아볼 직무</b><p><em>${r.top3.map((x) => esc(x.job.name)).join(", ")}</em></p></div>
        <div><b>가장 끌리는 일</b><p><em>${esc(lead.name)}</em> · ${esc(lead.desc)}</p></div>
        <div><b>가장 채울 곳</b><p><em>${esc(weakest.name)}</em> · 4문항 평균 ${r.ready[weakest.id].toFixed(1)}점</p></div>
        <div><b>회사 고를 때</b><p><em>${esc(r.values[0].name)}</em>을 가장 중요하게 골랐어요</p></div>
        ${first ? `<div><b>이번 주에 할 일</b><p>${link(first)}</p></div>` : ""}
      </div>
    </section>

    <section>
      <h2>흥미가 많이 겹치는 직무</h2>
      <p class="lead">내 흥미 6영역과 직무의 흥미 코드가 얼마나 겹치는지예요. 맞는 직무를 정해 주는 게 아니라 먼저 알아볼 후보예요. 흥미 코드가 같은 직무는 하나로 묶었어요.</p>
      <ol class="top3">${r.top3.map((x) => `<li><a href="#jobs-${x.job.key}"><small>${tieRank(x)} · 겹침 ${x.score}점 · ${esc(codeName(x.job.riasec))}</small><b>${esc(x.job.name)}</b><span>${esc(x.job.does)}</span>${x.alike.length ? `<span>비슷한 직무: ${x.alike.map((j) => esc(j.name)).join(", ")}</span>` : ""}</a></li>`).join("")}</ol>
      <details class="allfit" style="margin-top:14px"><summary class="muted">직무 ${r.fits.length}개 모두 보기</summary><div style="margin-top:12px">${bars(r.fits.map((x) => ({ name: x.job.name, sub: x.job.riasec, pct: x.score, label: x.score, href: `#jobs-${x.job.key}` })))}</div></details>
    </section>

    <section>
      <h2>내 흥미 6영역</h2>
      <p class="lead">영역마다 5문항 답을 0~100으로 바꿨어요. 대학생 평균과 비교한 점수가 아니에요.</p>
      ${bars(areasSorted.map((x) => ({ name: x.name, sub: x.short, pct: r.riasec[x.id], label: r.riasec[x.id] })))}
      ${r.flat ? `<p class="verdict warn">흥미 문항 답이 거의 같아서 영역 차이가 잘 드러나지 않아요. 결과보다 '더 끌리는 것'을 골라 다시 해 보면 달라질 수 있어요.</p>`
        : close ? `<p class="verdict">위 세 영역이 10점 안으로 비슷해요. 순위보다 세 영역을 함께 보세요.</p>` : ""}
      ${!leadCovered ? `<p class="verdict warn">가장 높은 ${esc(lead.name)}을 첫 글자로 가진 직무가 이 사전에는 아직 없어요. ${esc(lead.desc)}에 가까운 직업은 커리어넷 직업정보에서 더 찾아보세요.</p>` : ""}
    </section>

    <section>
      <h2>지금 준비 상태</h2>
      <p class="lead">영역마다 4문항 평균이에요(5점 만점). 2점 이하는 주황색으로 표시했어요.${year <= 2 ? " 1~2학년은 방향·경험이 낮게 나오는 게 보통이에요. 부족한 게 아니라 이제 채울 곳이에요." : ""}</p>
      ${bars(Q.ready.groups.map((g) => ({ name: g.name, sub: r.ready[g.id] <= 2 ? "낮게 답함" : "", pct: (r.ready[g.id] - 1) / 4 * 100, label: r.ready[g.id].toFixed(1), low: r.ready[g.id] <= 2 })))}
    </section>

    <section>
      <h2>회사를 고를 때 중요한 순서</h2>
      <p class="lead">짝 비교에서 고른 횟수 순서예요. 횟수가 같으면 같은 순위예요.</p>
      <ol class="vorder">${r.values.map((v) => `<li data-rank="${rank(v)}"><b>${esc(v.name)}</b><span>${esc(v.desc)} · ${r.wins[v.id]}번</span></li>`).join("")}</ol>
    </section>

    ${diags.length ? `<section>
      <h2>지금 먼저 볼 것</h2>
      <p class="lead">답을 보고 고른 진단이에요. 근거 자료를 같이 붙였어요.</p>
      <div>${diags.map((x) => `<div class="diag">
        <b>${esc(x.title)}</b>
        <p class="dwhy">${esc(why(x))}</p>
        ${x.evidence ? `<p class="dev">${esc(x.evidence.text)}${src(x.evidence.source)}</p>` : ""}
        ${x.steps?.length ? `<ol>${x.steps.map((t) => `<li>${link(t)}</li>`).join("")}</ol>` : ""}
      </div>`).join("")}</div>
    </section>` : ""}

    ${low.length ? `<section>
      <details><summary class="muted">준비 상태에서 '아니다' 쪽으로 답한 문항 ${low.length}개와 해 볼 것 보기</summary>
      <ul class="fixes" style="margin-top:12px">${low.map((it) => `<li><span>${esc(it.q)} <em>${Q.scaleOf(it.id)[a[it.id] - 1]}</em></span>${it.fix ? `<span>→ ${link(it.fix)}</span>` : ""}</li>`).join("")}</ul></details>
    </section>` : ""}

    ${d?.cases?.length ? `<section>
      <h2>${esc(d.name)} 졸업생들이 간 길</h2>
      <p class="lead">2024년 이후 공개된 실제 사례 중 일부예요.</p>
      <div class="cases">${d.cases.slice(0, 4).map(caseCard).join("")}</div>
      <div class="btns" style="margin-top:14px"><button type="button" class="btn line" id="q-map">${esc(d.name)} 진로 지도 전체 보기</button></div>
    </section>` : ""}

    ${todo.length ? `<section id="r-todo">
      <h2>${year}학년 이번 학기 할 일</h2>
      <p class="lead">체크는 이 화면에서만 돼요.</p>
      <ul class="todo">${todo.map((t) => `<li><label><input type="checkbox"><span>${link(t)}</span></label></li>`).join("")}</ul>
    </section>` : ""}

    <section>
      <h2>AI에게 이어서 물어보기</h2>
      <p class="lead">내 결과를 넣은 질문이에요. 목적을 고르고 복사해서 ChatGPT·Claude·Gemini 같은 AI에 붙여 넣으세요.</p>
      <div class="chips noprint" id="r-pk">${P.map((p, k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === 0}">${esc(p.label)}</button>`).join("")}</div>
      <div class="prompt" style="margin-top:12px"><pre id="r-text">${esc(P[0].text)}</pre>
        <div class="bar"><small>이름·학번·학교는 넣지 마세요. AI 답은 틀릴 수 있으니 출처를 확인하세요.</small><button type="button" class="btn" id="r-copy">복사하기</button></div></div>
    </section>

    <div class="again btns noprint">
      <button type="button" class="btn line" id="r-link">결과 링크 복사</button>
      <button type="button" class="btn line" id="r-print">인쇄·PDF로 저장</button>
      <button type="button" class="btn line" id="q-again">다시 하기</button>
      <span class="safe" id="r-msg">결과 링크에는 모든 답(마음 문항 포함)이 숫자로 들어가고 고민 글은 빠져요. 믿는 사람에게만 보내세요.</span>
    </div>
  </div>`;
}

// 답할 때마다 숫자·막대 갱신
function progress() {
  $("q-num").textContent = `${done()} / ${total()}`;
  const bar = document.querySelector(".qbar");
  bar.setAttribute("aria-valuenow", done());
  bar.firstElementChild.style.width = `${Math.round(done() / total() * 100)}%`;
}

function drawTest() {
  const el = $("v-test"), list = steps(), s = list[qa.i];
  el.innerHTML = qa.i < 0 ? testIntro() : !s ? testResult() : s.q ? testBasic(s.q) : s.pairs ? testPairs() : s.sector ? testSector() : s.note ? testNote() : testPage(s);
  const go = () => { qa.i++; drawTest(); };

  $("q-start")?.addEventListener("click", () => { qa.i = 0; drawTest(); });
  $("q-back")?.addEventListener("click", () => { qa.i--; drawTest(); });
  $("q-again")?.addEventListener("click", () => {
    Object.assign(qa, { i: -1, a: {}, sector: [], pairs: {}, shared: false });
    if (location.hash.startsWith("#r=")) history.replaceState(null, "", "#test");
    drawTest(); scrollTo(0, 0);
  });
  $("q-next")?.addEventListener("click", () => { if (s.note) qa.a.note = $("q-text").value.trim(); go(); });
  $("q-map")?.addEventListener("click", () => {
    const d = D.depts.find((x) => x.id === qa.a.dept);
    Object.assign(st, { school: "ssu", college: d.college, dept: d.id, year: yearNum() });
    drawPick(); render(); location.hash = "map";
  });
  $("r-copy")?.addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("r-text").textContent); e.target.textContent = "복사했어요"; }
    catch { getSelection().selectAllChildren($("r-text")); e.target.textContent = "선택했어요, Ctrl+C"; }
  });
  $("r-pk")?.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = D.depts.find((x) => x.id === qa.a.dept);
    $("r-text").textContent = prompts(qa.a, compute(qa.a, qa.sector, qa.pairs), d)[+b.dataset.k].text;
    $("r-pk").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    $("r-copy").textContent = "복사하기";
  });
  $("r-link")?.addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#r=${encode()}`;
    history.replaceState(null, "", `#r=${encode()}`);
    try { await navigator.clipboard.writeText(url); $("r-msg").textContent = "링크를 복사했어요. 이 링크를 열면 같은 결과가 보여요."; }
    catch { $("r-msg").textContent = url; }
  });
  $("r-print")?.addEventListener("click", () => print());

  el.querySelectorAll(".qopt:not(.multi)").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.v, q = s.q;
    if (q.id === "school" && v !== "ssu") delete qa.a.dept;
    qa.a[q.id] = v; go();
  }));
  el.querySelectorAll(".qopt.multi").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.s;
    // '아직 모르겠어요'는 다른 것과 함께 고르지 않는다
    qa.sector = qa.sector.includes(v) ? qa.sector.filter((x) => x !== v) : v === "unsure" ? ["unsure"] : [...qa.sector.filter((x) => x !== "unsure"), v];
    el.querySelectorAll(".qopt.multi").forEach((x) => x.setAttribute("aria-pressed", qa.sector.includes(x.dataset.s)));
    $("q-next").disabled = !qa.sector.length;
    progress();
  }));
  el.querySelectorAll(".pick2").forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.k;
    qa.pairs[k] = +b.dataset.side;
    el.querySelectorAll(`.pick2[data-k="${k}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b));
    progress();
    $("q-next").disabled = !Q.pairs.every((_, j) => qa.pairs[j] != null);
  }));
  // 5단계 답: 다시 그리지 않고 표시만 바꾼 뒤, 다음 빈 문항을 진하게 하고 그쪽으로 내려간다
  el.querySelectorAll(".lv").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.id, li = $(`lk-${id}`);
    qa.a[id] = +b.dataset.v;
    li.querySelectorAll(".lv").forEach((x) => x.setAttribute("aria-pressed", x === b));
    li.classList.add("done");
    progress();
    const left = s.items.filter((it) => !qa.a[it.id]);
    el.querySelectorAll(".lk").forEach((x) => x.classList.toggle("cur", left[0] && x.id === `lk-${left[0].id}`));
    $("q-next").disabled = left.length > 0;
    (left.length ? $(`lk-${left[0].id}`) : $("q-next")).scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
  document.body.classList.toggle("inquiz", qa.i >= 0);
  const d = !s && D.depts.find((x) => x.id === qa.a.dept);
  if (d) { Object.assign(st, { school: "ssu", college: d.college, dept: d.id, year: yearNum() }); drawPick(); render(); }
  if (qa.i >= 0 && !(qa.shared && !s)) el.scrollIntoView({ block: "start" });
  if (qa.shared && !s) scrollTo(0, 0);
  if (s) $("q-title")?.focus({ preventScroll: true });
}
