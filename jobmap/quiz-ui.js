// 검사 화면과 결과. app.js의 D, st, $, esc, src, link, colleges, drawPick, render, caseCard, codeName, OFF, jump, route를 쓴다.
const Q = D.quiz;
const qa = { i: -1, a: {}, sector: [], pairs: {}, done: [], ym: null };
const LIKERT = [...Q.interest.items, ...Q.readyItems];
const PER = 6; // 흥미 30문항은 6개씩 점 줄로 위치를 보여 준다
const DOT = ["e n", "m n", "c", "m y", "e y"];

// 한 단계 = 한 질문. 기본 정보 → 흥미 → 준비 상태(그룹 순) → 가치 짝 → 끌리는 곳 → 고민(선택)
// 다른 학교도 전공 문항을 묻는다(4차 결정 9)
function steps() {
  const basics = Q.basics, it = Q.interest.items;
  return [
    ...basics.map((q, k) => ({ kind: "basic", q, sec: "기본 정보", dotsOf: { n: basics.length, k } })),
    ...it.map((x, k) => ({ kind: "likert", it: x, sec: "흥미", ask: Q.interest.ask, dotsOf: { n: Math.min(PER, it.length - k + k % PER), k: k % PER } })),
    ...Q.ready.groups.flatMap((g) => g.items.map((x, k) => ({ kind: "likert", it: x, sec: `준비 상태 · ${g.name}`, ask: Q.ready.ask, dotsOf: { n: g.items.length, k } }))),
    ...Q.pairs.map((p, k) => ({ kind: "pairs", p, k, sec: "회사 고르는 기준", dotsOf: { n: Q.pairs.length, k } })),
    { kind: "sector", sec: "가고 싶은 곳", dotsOf: { n: 1, k: 0 } },
    { kind: "note", sec: "마지막", dotsOf: { n: 1, k: 0 } }
  ];
}
const total = () => steps().filter((s) => s.kind !== "note").length;
const done = () => steps().filter((s) => s.kind === "basic" && qa.a[s.q.id]).length + LIKERT.filter((it) => qa.a[it.id]).length
  + Object.keys(qa.pairs).length + (qa.sector.length ? 1 : 0);
const yearNum = (a = qa.a) => parseInt(a.year) || 1;
addEventListener("beforeunload", (e) => { if (qa.i >= 0 && qa.i < steps().length && done() > 3) e.preventDefault(); });

function optionsFor(q) {
  if (q.id === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  return q.options.map((o) => ({ t: o, v: o }));
}

// 직무 흥미 코드의 1·2·3번째 글자에 3·2·1 가중치를 주고 내 영역 점수를 평균 낸다.
// 코드가 1~2글자면 빈 자리는 내 평균으로 채워, 짧은 코드가 한 영역 점수로만 극단적으로 나오지 않게 한다.
const fitScore = (job, riasec) => { const mean = Object.values(riasec).reduce((s, x) => s + x, 0) / 6;
  return Math.round([0, 1, 2].reduce((s, k) => s + [3, 2, 1][k] * (job.riasec[k] ? riasec[job.riasec[k]] : mean), 0) / 6); };
// 결과 계산. 규준이 없으니 원점수와 내 안의 순서만 낸다.
function compute(a, sector, pairs) {
  const riasec = Object.fromEntries(Q.areas.map((x) => {
    const sum = Q.interest.items.filter((it) => it.id[0] === x.id).reduce((s, it) => s + a[it.id], 0);
    return [x.id, Math.round((sum - 5) / 20 * 100)];
  }));
  // 동점이면 내 학과 진로(여러 대학이 꼽는 진로)에 있는 직무를 앞에 둔다.
  const d = D.depts.find((x) => x.id === a.dept);
  const near = (job) => (d?.paths || []).some((p) => pathIs(job, p.name, d.college)) ? 1 : 0;
  const fits = (D.jobs || []).filter((j) => j.riasec).map((job) => ({ job, score: fitScore(job, riasec), near: near(job) }))
    .sort((x, y) => y.score - x.score || y.near - x.near);
  // 위 3개는 흥미 코드가 서로 다른 직무로 고르고, 같은 코드 직무는 '비슷한 직무'로 붙인다
  const top3 = [];
  fits.forEach((f) => {
    const same = top3.find((t) => t.job.riasec === f.job.riasec);
    if (same) same.alike.push(f.job); else if (top3.length < 3) top3.push({ ...f, alike: [] });
  });
  // 3위와 점수가 같은데 보이지 않는 직무 수
  const shown = new Set(top3.flatMap((t) => [t.job, ...t.alike]));
  const tieMore = fits.filter((f) => !shown.has(f.job) && f.score === top3[top3.length - 1]?.score).length;
  const ready = Object.fromEntries(Q.ready.groups.map((g) => [g.id, g.items.reduce((s, it) => s + a[it.id], 0) / g.items.length]));
  const wins = Object.fromEntries(Q.values.map((v) => [v.id, 0]));
  Q.pairs.forEach(([x, y], k) => { if (pairs[k] != null) wins[pairs[k] ? y : x]++; });
  const values = Q.values.slice().sort((x, y) => wins[y.id] - wins[x.id]);
  const iv = Q.interest.items.map((it) => a[it.id]), ivMean = iv.reduce((s, x) => s + x, 0) / iv.length;
  const flat = Math.sqrt(iv.reduce((s, x) => s + (x - ivMean) ** 2, 0) / iv.length) < 0.6;
  const fitMean = fits.reduce((s, f) => s + f.score, 0) / fits.length;
  return { riasec, fits, top3, tieMore, ready, wins, values, flat, fitMean, top: top3.map((r) => r.job.key), fit: Object.fromEntries(fits.map((r) => [r.job.key, r.score])) };
}

// 첫 화면 사례 띠: 다른 대학이 공개한 사례 중 home으로 고른 것(결정 16). 카드 하나가 링크 하나라 출처는 글자로만
function drawIntro() {
  const cs = D.depts.flatMap((d) => (d.cases || []).filter((c) => c.home).map((c) => [d, c]));
  return cs.length ? `<section class="home-cases"><div class="shead"><h2>졸업생은 실제로 여기 갔어요</h2><p>여러 대학이 공개한 2024년 이후 사례예요. 누르면 그 전공 진로 지도로 가요.</p></div>
    <ul class="strip">${cs.map(([d, c]) => { const j = (c.jobs || []).find((k) => D.jobs.some((x) => x.key === k));
      return `<li><a class="hcase" href="#map-${d.id}"><span class="hc-top"><span class="hc-dept">${esc((d.promptName || d.name).replace(/ 전공$/, ""))}</span>${j ? `<img src="img/j-${j}.svg" alt="" width="32" height="32">` : ""}</span>`
        + `<small class="hc-uni">다른 대학 공개 사례</small><b class="hc-to">${esc(c.to)}</b><span class="hc-how">${esc(c.how?.[0] || "")}</span><small class="hc-src">${esc(c.type)} · ${esc(c.date)}</small></a></li>`; }).join("")}</ul></section>` : "";
}

// 검사 틀: 한 번만 그리고 #q-body만 바꾼다
function drawFrame() {
  $("v-test").innerHTML = `<div class="quiz nohover" id="quiz">
    <div class="qbar" id="q-bar" role="progressbar" aria-label="진행" aria-valuemin="0"><i></i></div>
    <div class="qtop"><button type="button" class="qback" id="q-back">← 이전</button><span class="qsec" id="q-sec"></span><span class="num" id="q-num"></span></div>
    <div class="qbody" id="q-body"></div></div>`;
}

function bodyHTML(s) {
  const head = (ask, title) => `${ask ? `<p class="qask">${esc(ask)}</p>` : ""}<h1 class="qtext" id="q-title" tabindex="-1">${esc(title)}</h1>`;
  const next = (label, cls = "btn", off = false) => `<div class="qnav"><button type="button" class="${cls}" id="q-next"${off ? " disabled" : ""}>${label}</button></div>`;
  const opt = (v, t, on, tab) => `<button type="button" class="qopt" data-v="${esc(v)}" aria-pressed="${on}"${tab == null ? "" : ` tabindex="${tab ? 0 : -1}"`}>${esc(t)}</button>`;
  if (s.kind === "basic") {
    const cur = qa.a[s.q.id], more = cur ? next("다음", "btn line") : "";
    // 학과 문항은 묶음마다 Tab 한 번, 묶음 안은 방향키로 옮긴다(고른 칩이나 첫 칩만 tabindex 0)
    const group = (list) => { const on = Math.max(0, list.findIndex(([v]) => v === cur));
      return `<div class="qopts">${list.map(([v, t], k) => opt(v, t, cur === v, k === on)).join("")}</div>`; };
    // 숭실대는 단과대 묶음(숨김 학과 제외), 다른 학교는 전공 8개(4차 결정 9·11)
    if (s.q.id === "dept" && qa.a.school === "ssu") return head("", s.q.q) + colleges.map((c, k) => { const ds = D.depts.filter((d) => d.college === c && !d.hide);
      return ds.length ? `<div class="qgroup" role="group" aria-labelledby="qg${k}"><b id="qg${k}">${esc(c)}</b>${group(ds.map((d) => [d.id, d.name]))}</div>` : ""; }).join("")
      + group([["none", "여기 없어요"]]) + more;
    if (s.q.id === "dept") return head("", s.q.qEtc) + group(D.depts.filter((d) => d.promptName).map((d) => [d.id, d.promptName.replace(/ 전공$/, "")]))
      + group([["none", "비슷한 전공이 없어요"]]) + more;
    return head("", s.q.q) + `<div class="qopts">${optionsFor(s.q).map((o) => opt(o.v, o.t, cur === o.v)).join("")}</div>`
      + (s.q.id === "school" ? `<p class="hint">정답은 없어요. 답은 이 화면에서만 쓰이고 어디에도 저장되지 않아요.</p>` : "") + more;
  }
  if (s.kind === "likert") {
    const id = s.it.id, cur = qa.a[id], sc = Q.scaleOf(id), { n, k } = s.dotsOf;
    return head(s.ask, s.it.q) + `<div class="scale" role="radiogroup" aria-labelledby="q-title"><span class="end n">${sc[0]}</span><div class="dots">${sc.map((t, j) =>
      `<button type="button" class="dot ${DOT[j]}" role="radio" aria-checked="${cur === j + 1}" aria-label="${t}" data-v="${j + 1}" tabindex="${(cur || 1) === j + 1 ? 0 : -1}"><i></i></button>`).join("")}</div><span class="end y">${sc[4]}</span></div>
      <p class="qpick" id="q-pick" aria-live="polite">${cur ? sc[cur - 1] : ""}</p>
      <ol class="qdots" aria-hidden="true">${Array.from({ length: n }, (_, j) => `<li${j < k ? ` class="done"` : j === k ? ` class="cur"` : ""}></li>`).join("")}</ol>${cur ? next("다음", "btn line") : ""}`;
  }
  if (s.kind === "pairs") {
    const V = Object.fromEntries(Q.values.map((v) => [v.id, v])), cur = qa.pairs[s.k];
    return head("둘 다 중요해도 하나만 골라 주세요", "회사를 고를 때 더 중요한 쪽은요?") + `<div class="pair">${(s.k % 2 ? [1, 0] : [0, 1]).map((side, n) => { const v = V[s.p[side]];
      return `${n ? `<span class="or">또는</span>` : ""}<button type="button" class="pick2" data-side="${side}" aria-pressed="${cur === side}"><img src="img/v-${v.id}.svg" alt="" width="56" height="56"><b>${esc(v.name)}</b><span>${esc(v.desc)}</span></button>`; }).join("")}</div>`
      + (cur != null ? next("다음", "btn line") : "");
  }
  if (s.kind === "sector") return head("여러 개 골라도 돼요", Q.sectors.q) + `<div class="qopts">${Q.sectors.options.map((o) =>
    `<button type="button" class="qopt multi" data-s="${o.v}" aria-pressed="${qa.sector.includes(o.v)}">${esc(o.t)}</button>`).join("")}</div>${next("다음", "btn", !qa.sector.length)}`;
  return head("선택이에요", Q.note.q.replace(/\s*\(선택\)$/, "")) + `<textarea id="q-text" rows="4" aria-labelledby="q-title" placeholder="예: 전공 공부는 재밌는데 이걸로 뭘 할 수 있을지 모르겠어요">${esc(qa.a.note || "")}</textarea>
    <p class="hint">${esc(Q.note.hint)}</p>${next("결과 보기")}`;
}

function fill(s) {
  $("quiz").dataset.kind = s.kind;
  $("q-sec").textContent = s.sec;
  progress();
}
// 답할 때마다 숫자·막대 갱신. 번호는 지금 문항, 막대는 답한 수
function progress() {
  const n = done(), t = total(), bar = $("q-bar");
  $("q-num").textContent = `${Math.min(qa.i + 1, t)} / ${t}`;
  bar.setAttribute("aria-valuemax", t);
  bar.setAttribute("aria-valuenow", n);
  bar.setAttribute("aria-valuetext", `${t}문항 중 ${n}문항 답했어요`);
  bar.firstElementChild.style.width = `${n / t * 100}%`;
}

const bars = (rows) => `<div class="meters">${rows.map((r) => `<${r.href ? `a href="${r.href}"` : "div"} class="meter${r.low ? " low" : ""}"><span>${esc(r.name)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span><span class="track"><span style="width:${r.pct}%"></span></span><b class="num">${esc(r.label)}</b></${r.href ? "a" : "div"}>`).join("")}</div>`;

// 이번 학기 할 일: 숭실대는 학교 + 학과 할 일, 다른 학교는 같은 학교 할 일의 일반 문구(4차 결정 8)
const todoOf = (a) => { const y = yearNum(a), d = D.depts.find((x) => x.id === a.dept);
  return a.school === "ssu" ? [...(D.ssu.roadmap[y] || []), ...(d?.roadmap?.[y] || [])] : forSchool(D.ssu.roadmap[y] || [], false); };
// 할 일 체크 id: 화면에 보이는 글의 FNV-1a를 4글자로 줄인 것. 글이 바뀐 할 일의 체크는 다음 복사 때 빠진다
const tid = (t) => { let h = 2166136261; for (const c of t.text) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return (h % 36 ** 4).toString(36).padStart(4, "0"); };
const ymNow = (d = new Date()) => String(d.getFullYear() % 100).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
// 결과 링크 v2: v1 일곱 칸 + 체크한 할 일 + 연월(YYMM, 0000은 모름). 끝이 숫자라 메신저가 꼬리를 떼지 않는다. 서버에 아무것도 보내지 않는다.
function encode() {
  const mask = Q.sectors.options.reduce((m, o, k) => m | (qa.sector.includes(o.v) ? 1 << k : 0), 0);
  const ids = todoOf(qa.a).map(tid), done = qa.done.filter((x) => ids.includes(x));
  return ["2", qa.a.school, qa.a.dept || "-", yearNum(), LIKERT.map((it) => qa.a[it.id]).join(""), Q.pairs.map((_, k) => qa.pairs[k]).join(""), mask.toString(36),
    done.join("_") || "-", qa.ym || ymNow()].join(".");
}
// v1(공개 판 링크)은 계속 읽는다. 메신저가 붙이는 %2E·&fbclid·공백 꼬리는 받아 주고, 나머지는 하나라도 어긋나면 null
function parseCode(raw) {
  let c;
  try { c = decodeURIComponent(raw); } catch { return null; }
  const f = c.trim().split(/[&\s]/)[0].split("."), [ver, school, dept, year, lk, pb, mask, done, ym] = f, v2 = ver === "2";
  const O = Q.sectors.options, m = /^[0-9a-z]+$/.test(mask || "") ? parseInt(mask, 36) : -1, u = 1 << O.findIndex((o) => o.v === "unsure");
  // 다른 학교 학과는 v2부터, 전공 8개(promptName)만 받는다
  const ok = f.length === (v2 ? 9 : 7) && (v2 || ver === "1") && ["ssu", "etc"].includes(school)
    && (dept === "-" || (v2 || school === "ssu") && (dept === "none" || D.depts.some((d) => d.id === dept && (school === "ssu" || d.promptName))))
    && /^[1-4]$/.test(year) && new RegExp(`^[1-5]{${LIKERT.length}}$`).test(lk) && new RegExp(`^[01]{${Q.pairs.length}}$`).test(pb)
    && m >= 0 && m <= 2 ** O.length - 1 && !(m & u && m !== u)
    && (!v2 || /^(-|[0-9a-z]{4}(_[0-9a-z]{4})*)$/.test(done) && /^(0000|\d\d(0[1-9]|1[0-2]))$/.test(ym));
  if (!ok) return null;
  return { school, dept: dept === "-" ? undefined : dept, year: +year, a: Object.fromEntries(LIKERT.map((it, k) => [it.id, +lk[k]])),
    pairs: Object.fromEntries([...pb].map((b, k) => [k, +b])), sector: O.filter((_, k) => m & (1 << k)).map((o) => o.v),
    done: v2 && done !== "-" ? done.split("_") : [], ym: v2 ? ym : "0000" };
}
function showShared(code) {
  const r = parseCode(code);
  reset();
  if (r) {
    qa.a = { school: r.school, year: Q.basics.find((q) => q.id === "year").options[r.year - 1], ...r.a };
    if (r.dept) qa.a.dept = r.dept;
    Object.assign(qa, { pairs: r.pairs, sector: r.sector, done: r.done, ym: r.ym, shared: true, i: steps().length });
  } else qa.fail = true;
  drawTest();
  scrollTo({ top: 0, behavior: "instant" });
}

// 친구용 링크 #s=1.<6영역 점수/5 한 글자씩>.<직무 key 3개>: 답·학교·학과·준비 상태는 넣지 않는다(결정 12·13)
const encodeFriend = (r) => ["1", Q.areas.map((x) => (r.riasec[x.id] / 5).toString(36)).join(""), ...r.top].join(".");
function parseFriend(raw) {
  let c;
  try { c = decodeURIComponent(raw); } catch { return null; }
  const [ver, sc, ...keys] = c.trim().split(/[&\s]/)[0].split("."), job = (k) => D.jobs.find((j) => j.key === k);
  if (ver !== "1" || !new RegExp(`^[0-9a-k]{${Q.areas.length}}$`).test(sc || "") || keys.length !== 3 || new Set(keys).size !== 3 || !keys.every(job)) return null;
  return { riasec: Object.fromEntries(Q.areas.map((x, k) => [x.id, parseInt(sc[k], 36) * 5])), jobs: keys.map(job) };
}
function showFriend(code) {
  const f = parseFriend(code);
  reset();
  if (f) qa.friend = f; else qa.fail = true;
  drawTest();
  scrollTo({ top: 0, behavior: "instant" });
}
// 직무 카드의 흥미 겹침 점수 링
const ring = (v) => `<span class="ring" style="--v:${v}"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="trk" cx="22" cy="22" r="18" pathLength="100"/><circle class="val" cx="22" cy="22" r="18" pathLength="100"/></svg><b class="ring-num">${v}</b></span>`;
const friendHTML = (f) => `<div class="friend"><section class="r-hero">
    <p class="safe">친구가 보낸 결과예요</p>
    <h1 id="r-title" tabindex="-1">친구가 먼저 알아볼 직무 3개</h1>
    <ol class="r-top3">${f.jobs.map((j) => `<li><a class="jobcard" href="#jobs-${j.key}">${ring(fitScore(j, f.riasec))}<b class="jname">${esc(j.name)}</b><small class="jcode">${esc(codeName(j.riasec))}</small><span class="jdoes">${esc(j.does)}</span></a></li>`).join("")}</ol>
    <figure class="hex">${hexSVG(f.riasec)}</figure>
    <div class="btns"><button type="button" class="btn big" data-start>나도 해 보기</button></div>
  </section></div>`;

function prompts(a, r, d) {
  const who = d?.promptName ? `나는 ${d.promptName}을 공부하는 대학교 ${a.year} 학생이야.` : `나는 대학교 ${a.year}${d ? ` ${d.name}` : ""} 학생이야.`;
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

// 할 일 {text,url,how}: 이름 굵게, 다음 줄에 어디서·무엇을 한 문장
const how = (t) => `<b>${link(t)}</b>${t.how ? `<br><span>${esc(t.how)}</span>` : ""}`;
// 이번 주 할 일이 모자랄 때 채우는 기본 항목(M11)
const WEEK = [{ text: "직무 사전에서 후보 직무 3개 읽어 보기", url: "#jobs", how: "이 사이트 직무 사전에서 하는 일과 필요한 역량을 확인해요." }, STEP.jobCounsel];
// 같은 일(STEP id, 없으면 how나 글)은 결과에 한 번만 쓴다
const same = (t) => t.id || t.how || t.text;
// 다른 학교 학생에게는 STEP의 etc 문구로 바꾸고(null이면 뺌), 그 밖의 숭실대 링크는 뺀다
const forSchool = (list, ssu) => (ssu ? list : list.map((t) => t.etc !== undefined ? t.etc : /ssu\.ac\.kr/.test(t.url || "") ? null : t))
  .filter((t, k, l) => t && l.findIndex((x) => x && same(x) === same(t)) === k);
const byScore = (riasec) => Q.areas.slice().sort((x, y) => riasec[y.id] - riasec[x.id]);

// 흥미 육각형: 중심 150, 반지름 = 점수(0~100). R이 맨 위, 시계 방향으로 R I A S E C
function hexSVG(riasec) {
  const pt = (k, v) => [150 + v * Math.cos(Math.PI / 3 * k - Math.PI / 2), 150 + v * Math.sin(Math.PI / 3 * k - Math.PI / 2)].map((n) => +n.toFixed(1));
  const poly = (f) => Q.areas.map((x, k) => pt(k, f(x)).join(",")).join(" ");
  const top = byScore(riasec);
  const lbl = Q.areas.map((x, k) => { const [lx, ly] = pt(k, 110);
    return `<text class="lbl${top.indexOf(x) < 2 ? " hi" : ""}" x="${lx}" y="${ly}" text-anchor="${k % 3 ? (k < 3 ? "start" : "end") : "middle"}">${esc(x.name)} ${riasec[x.id]}</text>`; }).join("");
  return `<svg class="hexchart" viewBox="0 0 300 300" role="img" aria-label="흥미 6영역: ${top.map((x) => `${x.name} ${riasec[x.id]}`).join(", ")}">`
    + [100 / 3, 200 / 3, 100].map((v) => `<polygon class="grid" points="${poly(() => v)}"/>`).join("")
    + `<path class="axis" d="${Q.areas.map((_, k) => `M150,150L${pt(k, 100).join(",")}`).join("")}"/><polygon class="area" points="${poly((x) => riasec[x.id])}"/>${lbl}</svg>`;
}

// 공유 카드 1080×1350, 라이트 고정. 이름·학교·학과·학년·점수는 넣지 않는다
async function shareCanvas(r) {
  const top = byScore(r.riasec).slice(0, 2), jobs = r.top3.map((x) => x.job.name), url = "tkdgh123.github.io/jobmap";
  const text = ["학과 진로 지도", "나의 흥미 코드", "먼저 알아볼 직무", url, "123…", ...top.flatMap((x) => [x.id, x.name]), ...jobs].join("");
  try { await Promise.all(["700 56px", "600 36px", "400 40px"].map((f) => document.fonts.load(`${f} "Pretendard Variable"`, text))); } catch {}
  const cv = document.createElement("canvas"), g = cv.getContext("2d");
  cv.width = 1080; cv.height = 1350;
  const put = (s, x, y, font, color, align = "center") => { g.font = `${font} "Pretendard Variable", system-ui, sans-serif`; g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y); };
  const dot = (x, y, d, color) => { g.beginPath(); g.arc(x, y, d / 2, 0, 2 * Math.PI); g.fillStyle = color; g.fill(); };
  g.fillStyle = "#F7F8FA"; g.fillRect(0, 0, 1080, 1350);
  g.beginPath(); g.roundRect(60, 100, 960, 1150, 48); g.fillStyle = "#FFFFFF"; g.fill();
  put("학과 진로 지도", 540, 200, "600 36px", "#3A4BD0");
  put("나의 흥미 코드", 540, 300, "400 40px", "#4E5968");
  // 글자는 기준선으로 맞춘다: 대문자 높이의 절반만큼 원 중심 아래가 기준선
  top.forEach((x, k) => {
    dot(420 + k * 240, 450, 200, k ? "#EEF0FD" : "#3A4BD0");
    put(x.id, 420 + k * 240, 489, "700 110px", k ? "#3A4BD0" : "#FFFFFF");
    put(x.name, 420 + k * 240, 615, "600 40px", "#191F28");
  });
  g.fillStyle = "#E5E8EB"; g.fillRect(140, 670, 800, 2);
  put("먼저 알아볼 직무", 140, 760, "400 40px", "#4E5968", "left");
  jobs.forEach((name, k) => {
    const y = 870 + k * 110;
    dot(168, y - 20, 56, "#EEF0FD");
    put(k + 1, 168, y - 9, "700 30px", "#3A4BD0");
    g.font = `700 56px "Pretendard Variable", system-ui, sans-serif`;
    let s = name;
    while (s && g.measureText(s + (s === name ? "" : "…")).width > 720) s = s.slice(0, -1);
    put(s === name ? s : s + "…", 220, y, "700 56px", "#191F28", "left");
  });
  put(url, 540, 1190, "400 34px", "#5F6B78");
  return cv;
}

// 캘린더(결정 14·15): 서버 없이 .ics를 내려받고, 구글 캘린더는 다음 학기 일정 하나만 링크로 연다.
// 캘린더는 클라우드로 동기화되므로 답이 든 링크·학과 이름·상담 안내는 넣지 않는다
// 다음 학기 둘째 주 월요일(8~14일): 3~8월이면 9월, 그 밖에는 3월
const nextTerm = (now = new Date()) => { const m = now.getMonth() + 1, d = new Date(now.getFullYear() + (m >= 9 ? 1 : 0), m >= 3 && m <= 8 ? 8 : 2, 8);
  d.setDate(8 + (8 - d.getDay()) % 7); return d; };
// 날짜 + n일을 YYYYMMDD로
const calDay = (d, n = 0) => { const x = new Date(d); x.setDate(x.getDate() + n);
  return [x.getFullYear(), x.getMonth() + 1, x.getDate()].map((v, k) => String(v).padStart(k ? 2 : 4, "0")).join(""); };
// 일정 2개. 이번 주 할 일 제목은 3개까지, 학과 이름 같은 skip 낱말이 든 제목은 건너뛴다
function calEvents(titles, skip, now = new Date()) {
  const site = "https://tkdgh123.github.io/jobmap/", soon = new Date(now);
  const list = titles.filter((s) => !skip.some((w) => s.includes(w))).slice(0, 3).map((s) => "- " + s).join("\n");
  soon.setDate(soon.getDate() + 7);
  return [{ date: soon, title: "학과 진로 지도: 이번 주 할 일 점검", text: (list ? list + "\n\n" : "") + site },
    { date: nextTerm(now), title: "학과 진로 지도 다시 해 보기", text: "새 학기에 다시 해 보면 답이 어떻게 바뀌었는지 볼 수 있어요.\n" + site }];
}
// RFC 5545: CRLF, 글 이스케이프, 75바이트 접기(한글 글자는 쪼개지 않음), 종일 일정, 그날 오전 9시 알림
function makeIcs(events, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]|\.\d+/g, ""), utf8 = new TextEncoder();
  const text = (s) => s.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\r?\n/g, "\\n");
  const fold = (line) => { let out = "", n = 0; for (const ch of line) { const b = utf8.encode(ch).length; if (n + b > 75) { out += "\r\n "; n = 1; } out += ch; n += b; } return out; };
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//tkdgh123.github.io//jobmap//KO", "CALSCALE:GREGORIAN",
    ...events.flatMap((e, k) => ["BEGIN:VEVENT", `UID:${stamp}-${k}@tkdgh123.github.io`, "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + calDay(e.date), "DTEND;VALUE=DATE:" + calDay(e.date, 1), "SUMMARY:" + text(e.title), "DESCRIPTION:" + text(e.text),
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT9H", "DESCRIPTION:" + text(e.title), "END:VALARM", "END:VEVENT"]),
    "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
const gcal = (e) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${calDay(e.date)}/${calDay(e.date, 1)}&details=${encodeURIComponent(e.text)}`;
const saveBlob = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };

function testResult() {
  const a = qa.a, d = D.depts.find((x) => x.id === a.dept), year = yearNum();
  const r = compute(a, qa.sector, qa.pairs);
  const ctx = { ...a, yearN: year, dept: a.dept, sector: qa.sector, ready: r.ready, fit: r.fit, fitMean: r.fitMean, top: r.top };
  const ssu = a.school === "ssu", none = a.dept === "none";
  const found = (D.diag || []).filter((x) => { try { return x.when(ctx); } catch { return false; } }).map((x) => ({ ...x, steps: forSchool(x.steps || [], ssu) }));
  // 마음 안내는 진단 카드 대신 r-hero의 .r-care 한 칸에만 그린다(결정 2)
  const care = found.find((x) => x.id === "mind-care"), diags = found.filter((x) => x !== care);
  const why = (x) => typeof x.why === "function" ? x.why(ctx) : x.why;
  const areasSorted = byScore(r.riasec);
  const lead = areasSorted[0], close = r.riasec[areasSorted[0].id] - r.riasec[areasSorted[2].id] <= 10;
  const leadCovered = (D.jobs || []).some((j) => (j.riasec || "")[0] === lead.id);
  const low = Q.readyItems.filter((it) => a[it.id] <= 2).sort((x, y) => a[x.id] - a[y.id]);
  const todo = todoOf(a);
  const sectorNames = qa.sector.map((v) => Q.sectors.options.find((o) => o.v === v).t);
  // 다른 학교는 숭실대 학과 이름 대신 전공 이름(4차 결정 9)
  const name = d && (ssu ? d.name : d.promptName || d.name);
  const tags = [name || (ssu ? "숭실대학교" : "다른 학교"), a.year, ...sectorNames];
  // 이긴 횟수가 같으면 같은 순위
  const rank = (v) => 1 + r.values.filter((x) => r.wins[x.id] > r.wins[v.id]).length;
  const P = prompts(a, r, d);
  const weekRow = (t) => `<li><b>${link(t)}</b>${t.how ? `<span>${esc(t.how)}</span>` : ""}</li>`;
  // 이번 주 할 일: 이번 주 후보인 첫 진단의 앞 2개 + 학년 할 일 1개. 모자라면 기본 항목으로 채운다
  const wk = diags.find((x) => x.week !== false);
  let week = [...(wk?.steps || []).slice(0, 2), todo[0]].filter(Boolean);
  if (week.length < 2 || !ssu || none) week = [...week, ...forSchool(WEEK, ssu)];
  week = week.filter((t, k) => week.findIndex((x) => same(x) === same(t)) === k).slice(0, 3);
  // 상담이 이번 주 할 일에 없으면 r-week 아래 한 줄로 알리고, 그 뒤로는 다시 권하지 않는다
  const talk = !week.some((t) => t.id === STEP.jobCounsel.id);
  // 같은 일은 결과에 한 번만: 이번 주 → 마음 칸 → 학년 할 일(체크 목록이라 지우지 않음) → 진단 → 보충 목록
  const seen = new Set([...week, ...(care?.steps || []), ...todo].map(same));
  if (talk) seen.add(STEP.jobCounsel.id);
  diags.forEach((x) => x.steps = x.steps.filter((t) => !seen.has(same(t)) && seen.add(same(t))));
  // 보충 목록: 같은 해결은 문항을 묶어 한 줄로, 위에서 이미 나온 해결은 다시 쓰지 않는다
  const fixes = [];
  low.forEach((it) => {
    const fix = forSchool([it.fix].filter(Boolean), ssu)[0], key = fix && same(fix), g = key && fixes.find((x) => x.key === key);
    if (g) g.its.push(it); else fixes.push({ key, fix: key && !seen.has(key) && seen.add(key) && fix, its: [it] });
  });
  // 직무마다 왜 나왔나(결정 29): 직무 흥미 코드 중 내 평균 이상인 영역(없으면 가장 높은 영역), 학과 진로에 있으면 한마디 더. 숫자는 쓰지 않는다
  const mean = Object.values(r.riasec).reduce((s, v) => s + v, 0) / 6;
  const jwhy = (x) => {
    const c = [...x.job.riasec], on = c.filter((k) => r.riasec[k] >= mean);
    const s = (on.length ? on : [c.sort((p, q) => r.riasec[q] - r.riasec[p])[0]]).map((k) => Q.areas.find((y) => y.id === k).name.replace("형", "")).join("·");
    return `<p class="jwhy">${esc(s)}${(s.charCodeAt(s.length - 1) - 0xAC00) % 28 ? "과" : "와"} 흥미가 겹쳐요${x.near ? " · 내 학과 진로에도 있어요" : ""}</p>`;
  };
  const v1 = r.values[0], vTie = r.values.filter((v) => rank(v) === 1).length > 1;
  const vImg = (v, n) => `<img src="img/v-${v.id}.svg" alt="" width="${n}" height="${n}">`;
  // 링크 연월이 모름(v1)이거나 최근 자료 변경보다 앞이면 한 줄 알린다(결정 12)
  const upd = (D.updates || []).map((u) => u.date.slice(2, 4) + u.date.slice(5, 7)).sort().pop();
  const old = qa.ym && (qa.ym === "0000" || qa.ym < upd);

  return `<div class="result">
    <h1 class="sr-only">진로 검사 결과</h1>
    ${old ? `<p class="safe">이 결과를 만든 뒤 직무·학과 자료가 바뀌어 직무 후보가 조금 다를 수 있어요.</p>` : ""}
    <section class="r-hero">
      <div class="rtags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <h2 id="r-title" tabindex="-1">먼저 알아볼 직무 3개</h2>
      ${r.flat ? `<p class="verdict warn" style="margin:0">흥미 답이 거의 같아서 흥미 코드를 정하기 어려워요. 아래 직무는 참고만 하세요.</p>`
        : `<div class="r-codes">${areasSorted.slice(0, 2).map((x) => `<span class="badge-code" data-area="${x.id}"><b>${x.id}</b><small>${esc(x.name)}</small></span>`).join("")}</div>`}
      <ol class="r-top3">${r.top3.map((x) => `<li><a class="jobcard" href="#jobs-${x.job.key}">${ring(x.score)}`
        + `<b class="jname">${esc(x.job.name)}</b><small class="jcode">${esc(codeName(x.job.riasec))}</small>${jwhy(x)}<span class="jdoes">${esc(x.job.does)}${x.alike.length ? ` 비슷한 직무: ${x.alike.map((j) => esc(j.name)).join(", ")}` : ""}</span></a></li>`).join("")}</ol>
      ${r.tieMore ? `<p class="r-tie">3위와 점수가 같은 직무가 ${r.tieMore}개 더 있어요. <a href="#r-allfit" id="r-more">모두 보기</a></p>` : ""}
      <div class="r-week">
        <h3>이번 주에 할 일</h3>
        <ol>${week.map(weekRow).join("")}</ol>
        ${talk ? `<p>혼자 정하기 어려우면 ${ssu ? link({ text: "진로취업센터", url: JOB }) : "다니는 학교 진로·취업 센터"}에서 1:1 상담을 받을 수 있어요.</p>` : ""}
      </div>
      ${care ? `<div class="r-care"><b>${esc(care.title)}</b><ul>${care.steps.map((t) => `<li>${how(t)}</li>`).join("")}</ul></div>` : ""}
      <div class="r-cal btns noprint"><button type="button" class="btn line" id="r-cal">캘린더에 넣기</button><a class="btn ghost" id="r-gcal" href="${esc(gcal(calEvents([], [])[1]))}" target="_blank" rel="noopener">구글 캘린더</a></div>
      <p class="r-scorenote">흥미 겹침 점수는 내 흥미 6영역 점수를 직무 흥미 코드 순서(3·2·1 가중)로 평균 낸 값이에요. 100에 가까울수록 많이 겹쳐요.</p>
      <div class="r-actions btns noprint">
        <button type="button" class="btn" id="r-card">이미지로 저장</button>
        <button type="button" class="btn line" id="r-link">결과 링크 복사</button>
        <button type="button" class="btn line" id="r-friend">친구용 링크 복사</button>
        <button type="button" class="btn ghost" id="q-again">다시 하기</button>
        <p class="safe" id="r-msg">결과 링크를 연 사람도 마음 문항 답과 상담 안내까지 그대로 봐요. 진로만 나누려면 친구용 링크를 쓰세요.</p>
      </div>
    </section>

    <section class="r-interest">
      <h2>내 흥미 6영역</h2>
      <p class="verdict">참고용 검사예요. 대학생 전체와 비교한 점수가 아니라 내 답 안에서의 순서예요. <a href="#about">만든 방법</a></p>
      <figure class="hex">${hexSVG(r.riasec)}</figure>
      ${r.flat ? `<p class="verdict warn">흥미 문항 답이 거의 같아서 영역 차이가 잘 드러나지 않아요. 결과보다 '더 끌리는 것'을 골라 다시 해 보면 달라질 수 있어요.</p>`
        : close ? `<p class="verdict">위 세 영역이 10점 안으로 비슷해요. 순위보다 세 영역을 함께 보세요.</p>` : ""}
      ${!leadCovered ? `<p class="verdict warn">가장 높은 ${esc(lead.name)}을 첫 글자로 가진 직무가 이 사전에는 아직 없어요. ${esc(lead.desc)}에 가까운 직업은 커리어넷 직업정보에서 더 찾아보세요.</p>` : ""}
      <details class="r-bars"><summary>영역별 점수 보기</summary>${bars(areasSorted.map((x) => ({ name: x.name, sub: x.short, pct: r.riasec[x.id], label: r.riasec[x.id] })))}</details>
      <details class="allfit" id="r-allfit"><summary>직무 ${r.fits.length}개 모두 보기</summary>${bars(r.fits.map((x) => ({ name: x.job.name, sub: x.job.riasec, pct: x.score, label: x.score, href: `#jobs-${x.job.key}` })))}</details>
    </section>

    <section class="r-ready">
      <h2>지금 준비 상태</h2>
      <p class="lead">영역마다 4문항 평균이에요(5점 만점).${year <= 2 ? " 1~2학년은 방향·경험이 낮게 나오는 게 보통이에요. 부족한 게 아니라 이제 채울 곳이에요." : ""}</p>
      <ul class="gauges">${Q.ready.groups.map((g) => { const v = r.ready[g.id], on = Math.round(v);
        return `<li class="gauge${v <= 2 ? " low" : ""}"><span class="gname">${esc(g.name)}</span><span class="pips" role="img" aria-label="5칸 중 ${on}칸">${[1, 2, 3, 4, 5].map((k) => `<i${k <= on ? ` class="on"` : ""}></i>`).join("")}</span><b class="num">${v.toFixed(1)}</b>${v <= 2 ? `<em class="pill">보충</em>` : ""}</li>`; }).join("")}</ul>
      ${year >= 3 && Q.ready.groups.filter((g) => r.ready[g.id] <= 2).length >= 2 ? `<p class="calm">보충할 곳이 여럿이어도 늦은 게 아니에요. 한 번에 다 하지 말고 이번 주에 할 일 하나부터 시작해요.</p>` : ""}
      ${low.length ? `<details><summary class="muted">'아니에요' 쪽으로 답한 문항 ${low.length}개와 해 볼 것 보기</summary>
        <ul class="fixes">${fixes.map((g) => `<li><span>${g.its.map((it) => `${esc(it.q)} <em>${Q.scaleOf(it.id)[a[it.id] - 1]}</em>`).join("<br>")}</span>${g.fix ? `<span>→ ${how(g.fix)}</span>` : ""}</li>`).join("")}</ul></details>` : ""}
    </section>

    <section class="r-values">
      <h2>회사를 고를 때 중요한 순서</h2>
      <div class="v-first">${vImg(v1, 56)}<b>${esc(v1.name)}</b><span>${esc(v1.desc)} · 짝 비교에서 ${r.wins[v1.id]}번 골랐어요${vTie ? " (공동 1위)" : ""}</span></div>
      <ol class="v-rest">${r.values.slice(1).map((v) => `<li data-rank="${rank(v)}">${vImg(v, 20)}<b>${rank(v)}위 ${esc(v.name)}</b></li>`).join("")}</ol>
    </section>

    ${diags.length ? `<section>
      <h2>지금 먼저 볼 것</h2>
      <p class="lead">답을 보고 고른 진단이에요. 근거 자료를 같이 붙였어요.</p>
      <div>${diags.map((x) => `<div class="diag">
        <b>${esc(x.title)}</b>
        <p class="dwhy">${esc(why(x))}</p>
        ${x.evidence ? `<p class="dev">${esc(x.evidence.text)}${src(x.evidence.source)}</p>` : ""}
        ${x.steps.length ? `<ol>${x.steps.map((t) => `<li>${how(t)}</li>`).join("")}</ol>` : ""}
      </div>`).join("")}</div>
    </section>` : ""}

    ${d?.cases?.length ? `<section>
      <h2>${esc(d.promptName || d.name)} 졸업생들이 간 길</h2>
      <p class="lead">여러 대학이 공개한 2024년 이후 사례 중 일부예요.</p>
      <div class="cases">${d.cases.slice(0, 4).map(caseCard).join("")}</div>
      <div class="btns noprint" style="margin-top:14px"><button type="button" class="btn line" id="q-map">${esc(name)} 진로 지도 전체 보기</button></div>
    </section>` : d?.basic ? `<section>
      <div class="btns"><button type="button" class="btn line" id="q-map">학과 지도에서 ${esc(name)} 보기</button></div>
    </section>` : none ? `<section>
      <h2>졸업생들이 간 길</h2>
      <div class="nodept"><p>내 학과 졸업생 자료는 아직 없어요. 비슷한 학과와 직무부터 봐요.</p>
        <div class="btns"><a class="btn line" href="#map-${ssu ? "" : "etc-"}none">학과 지도 둘러보기</a><a class="btn line" href="#jobs">직무 사전 보기</a><a class="src" href="https://github.com/tkdgh123/tkdgh123.github.io/issues" target="_blank" rel="noopener">학과 자료 제보</a></div></div>
    </section>` : ""}

    ${todo.length ? `<section id="r-todo">
      <h2>${year}학년 이번 학기 할 일</h2>
      <p class="lead">체크한 뒤 결과 링크를 복사하면 체크도 담겨요. 링크 안에만 담기고 사이트엔 남지 않아요.</p>
      <ul class="todo">${todo.map((t) => `<li><label><input type="checkbox" data-id="${tid(t)}"${qa.done.includes(tid(t)) ? " checked" : ""}><span>${how(t)}</span></label></li>`).join("")}</ul>
    </section>` : ""}

    <section>
      <h2>AI에게 이어서 물어보기</h2>
      <p class="lead">내 결과를 넣은 질문이에요. 목적을 고르고 복사해서 ChatGPT·Claude·Gemini 같은 AI에 붙여 넣으세요.</p>
      <div class="chips noprint" id="r-pk">${P.map((p, k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === 0}">${esc(p.label)}</button>`).join("")}</div>
      <div class="prompt" style="margin-top:12px"><pre id="r-text" tabindex="0" aria-label="AI에게 물어볼 질문">${esc(P[0].text).replace(/⁠/g, "")}</pre>
        <div class="bar"><small>이름·학번·학교는 넣지 마세요. 마음 문항 답과 고민 글도 들어 있으니 남기기 싫으면 그 줄을 지우고 붙여 넣으세요. AI 답은 틀릴 수 있으니 출처를 확인하세요.</small><button type="button" class="btn noprint" id="r-copy">복사하기</button></div></div>
    </section>
  </div>`;
}

// qa 상태에 따라 하나를 그리는 유일한 진입점: 실패 화면 / 친구용 결과 / 시작 전 / 검사 틀+단계 / 결과(공유 결과 포함)
function drawTest() {
  const s = steps()[qa.i];
  document.body.classList.toggle("inquiz", qa.i >= 0 || !!qa.fail || !!qa.friend);
  if (qa.fail) $("v-test").innerHTML = `<div class="rfail"><h2>결과 링크를 읽지 못했어요</h2><p>주소가 잘렸을 수 있어요. 검사를 새로 해 보세요.</p><div class="btns"><button type="button" class="btn" data-start>검사 시작</button></div></div>`;
  else if (qa.friend) $("v-test").innerHTML = friendHTML(qa.friend);
  else if (qa.i < 0) $("v-test").innerHTML = drawIntro();
  else if (!s) drawResult();
  else {
    if (!$("q-body")) drawFrame();
    $("q-body").innerHTML = bodyHTML(s);
    fill(s);
  }
}

function drawResult() {
  $("v-test").innerHTML = testResult();
  $("q-again").addEventListener("click", () => {
    run += 1; reset();
    history.replaceState({ q: -1, run }, "", "#test");
    drawTest(); scrollTo({ top: 0, behavior: "instant" });
  });
  // 학과 주소로 가면 route가 학교·학과를 맞추고 고르기 줄을 접어요(학년은 아래에서 이미 맞췄어요)
  $("q-map")?.addEventListener("click", () => { location.hash = `map-${qa.a.school === "ssu" ? "" : "etc-"}${qa.a.dept}`; });
  // 체크를 qa.done에 모은다. 링크로 연 화면이면 주소도 바로 바꿔 새로고침해도 남는다(결정 13)
  $("r-todo")?.addEventListener("change", (e) => {
    const id = e.target.dataset.id;
    qa.done = e.target.checked ? [...qa.done, id] : qa.done.filter((x) => x !== id);
    if (location.hash.startsWith("#r=")) history.replaceState(history.state, "", "#r=" + encode());
  });
  $("r-cal").addEventListener("click", () => {
    const d = D.depts.find((x) => x.id === qa.a.dept), skip = [d?.name, d?.promptName?.replace(/ 전공$/, ""), "109", "상담센터"].filter(Boolean);
    // 화면 줄바꿈용 보이지 않는 글자(U+2060, esc가 넣음)는 빼고 넣는다
    const titles = [...document.querySelectorAll(".r-week li b")].map((b) => b.textContent.replace(/⁠/g, ""));
    saveBlob(new Blob([makeIcs(calEvents(titles, skip))], { type: "text/calendar;charset=utf-8" }), "학과진로지도-일정.ics");
    $("r-msg").textContent = "캘린더 파일(일정 2개)을 저장했어요.";
  });
  // 동점 직무 '모두 보기': 해시를 바꾸지 않고 목록을 펼쳐 바로 옮긴다
  $("r-more")?.addEventListener("click", (e) => { e.preventDefault(); $("r-allfit").open = true; jump($("r-allfit")); });
  $("r-copy").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("r-text").textContent); e.target.textContent = "복사했어요"; }
    catch { getSelection().selectAllChildren($("r-text")); e.target.textContent = "선택했어요, Ctrl+C"; }
  });
  $("r-pk").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = D.depts.find((x) => x.id === qa.a.dept);
    $("r-text").textContent = prompts(qa.a, compute(qa.a, qa.sector, qa.pairs), d)[+b.dataset.k].text;
    $("r-pk").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    $("r-copy").textContent = "복사하기";
  });
  $("r-link").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#r=${encode()}`;
    history.replaceState(history.state, "", `#r=${encode()}`);
    try { await navigator.clipboard.writeText(url); $("r-msg").textContent = "링크를 복사했어요. 이 링크를 열면 같은 답으로 결과를 다시 보여 줘요."; }
    catch { $("r-msg").textContent = url; }
  });
  $("r-friend").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#s=${encodeFriend(compute(qa.a, qa.sector, qa.pairs))}`;
    try { await navigator.clipboard.writeText(url); $("r-msg").textContent = "친구용 링크를 복사했어요. 답은 들어가지 않아요. 흥미 점수와 직무 3개만 담겨요."; }
    catch { $("r-msg").textContent = url; }
  });
  // 카드 이미지: 공유할 수 있으면 공유 창, 아니면 파일로 내려받는다
  $("r-card").addEventListener("click", async () => {
    const cv = await shareCanvas(compute(qa.a, qa.sector, qa.pairs));
    const blob = await new Promise((ok) => cv.toBlob(ok, "image/png"));
    const file = new File([blob], "학과진로지도-결과.png", { type: "image/png" });
    const save = () => saveBlob(blob, file.name);
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); } catch (e) { if (e.name === "AbortError") return; save(); }
    } else save();
    $("r-msg").textContent = "카드 이미지를 저장했어요.";
  });
  const d = D.depts.find((x) => x.id === qa.a.dept);
  if (d) { Object.assign(st, { school: qa.a.school, college: d.college, dept: d.id, year: yearNum() }); drawPick(); render(); }
}

// ---- 넘김: 틀은 그대로 두고 #q-body만 나갔다 들어온다(결정 4) ----
let busy = false, timer = 0, run = Date.now();
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const reset = () => Object.assign(qa, { i: -1, a: {}, sector: [], pairs: {}, done: [], ym: null, shared: false, fail: false, friend: null });
const enter = (dir, el = $("q-body")) => el.animate(calm() ? [{ opacity: 0 }, { opacity: 1 }]
  : [{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: "none" }], { duration: calm() ? 120 : 280, easing: "cubic-bezier(.2,0,0,1)" });

async function go(to, push = true) {
  if (busy || to === qa.i) return;
  busy = true; clearTimeout(timer);
  $("quiz")?.classList.add("nohover");
  try {
    const dir = to > qa.i ? 1 : -1, len = steps().length;
    const out = qa.i >= 0 && qa.i < len && !calm() ? $("q-body").animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }],
      { duration: 180, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" }) : null;
    if (out) await out.finished;
    if (push) history.pushState({ q: to, run }, "", "#test");
    qa.i = to;
    drawTest();
    if (to < 0) scrollTo({ top: 0, behavior: "instant" });
    else if (to >= len) {
      scrollTo({ top: 0, behavior: "instant" });
      if (!calm()) $("v-test").querySelectorAll(".result > *").forEach((x, k) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, delay: k * 60, easing: "cubic-bezier(.2,0,0,1)", fill: "backwards" }));
      $("r-title").focus({ preventScroll: true });
    } else {
      // 틀 윗변이 화면 위로 나가 있을 때만 맞춘다. 그 밖에는 스크롤하지 않는다
      if ($("quiz").getBoundingClientRect().top < OFF() - 12) jump($("quiz"));
      enter(dir);
      $("q-title").focus({ preventScroll: true });
    }
    out?.cancel();
  } finally { busy = false; }
}

// 넘김 중과 넘긴 뒤 마우스가 움직이기 전에는 hover 색을 끈다(누른 자리의 새 원이 미리 고른 것처럼 보이지 않게)
addEventListener("mousemove", (e) => { if (!busy && (e.movementX || e.movementY)) $("quiz")?.classList.remove("nohover"); });

// 단일 선택: 바로 표시·저장하고 250ms 뒤 넘어간다. 그 안에 다시 고르면 마지막 답으로 다시 잰다
function mark(s, b) {
  $("q-body").querySelectorAll(".qopt, .dot, .pick2").forEach((x) => {
    x.setAttribute(s.kind === "likert" ? "aria-checked" : "aria-pressed", x === b);
    if (s.kind === "likert") x.tabIndex = x === b ? 0 : -1;
  });
  if (s.kind === "likert") $("q-pick").textContent = Q.scaleOf(s.it.id)[b.dataset.v - 1];
  progress();
}
function pick(s, b) {
  const v = b.dataset.v;
  if (s.kind === "likert") qa.a[s.it.id] = +v;
  else if (s.kind === "pairs") qa.pairs[s.k] = +b.dataset.side;
  else { if (s.q.id === "school" && v !== qa.a.school) delete qa.a.dept; qa.a[s.q.id] = v; }
  mark(s, b);
  clearTimeout(timer);
  timer = setTimeout(() => go(qa.i + 1), 250);
}
// 이전: 지금 단계가 history 맨 위면 브라우저 뒤로와 같게 한다
function back() {
  const h = history.state;
  if (h && h.run === run && h.q === qa.i) history.back(); else go(qa.i - 1, false);
}

$("v-test").addEventListener("click", (e) => {
  const b = e.target.closest("button"), s = steps()[qa.i];
  if (!b || !s || busy || qa.fail) return;
  if (b.id === "q-back") back();
  else if (b.id === "q-next") { if (s.kind === "note") qa.a.note = $("q-text").value.trim(); go(qa.i + 1); }
  else if (b.dataset.s) {
    const v = b.dataset.s;
    // '아직 모르겠어요'는 다른 것과 함께 고르지 않는다
    qa.sector = qa.sector.includes(v) ? qa.sector.filter((x) => x !== v) : v === "unsure" ? ["unsure"] : Q.sectors.options.map((o) => o.v).filter((x) => x === v || x !== "unsure" && qa.sector.includes(x));
    $("q-body").querySelectorAll(".qopt.multi").forEach((x) => x.setAttribute("aria-pressed", qa.sector.includes(x.dataset.s)));
    $("q-next").disabled = !qa.sector.length;
    progress();
  } else if (b.matches(".qopt, .dot, .pick2")) pick(s, b);
});

// 리커트 1~5·기본 정보와 짝 1~9(학과 제외)는 고르고 넘어간다. 화살표는 고르기만 한다
$("v-test").addEventListener("keydown", (e) => {
  const s = steps()[qa.i];
  if (!s || busy || qa.fail || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.target.tagName === "TEXTAREA") return;
  const btns = [...$("q-body").querySelectorAll(".qopt, .dot, .pick2")], n = /^[1-9]$/.test(e.key) ? +e.key : 0;
  if (s.kind === "likert" && /^Arrow/.test(e.key)) {
    e.preventDefault(); clearTimeout(timer);
    const d = /Left|Up/.test(e.key) ? -1 : 1, b = btns[Math.min(5, Math.max(1, (qa.a[s.it.id] || (d > 0 ? 0 : 6)) + d)) - 1];
    qa.a[s.it.id] = +b.dataset.v; mark(s, b); b.focus();
  } else if (s.kind === "basic" && s.q.id === "dept" && /^Arrow/.test(e.key) && e.target.matches(".qopt")) {
    // 학과 문항: 방향키는 같은 묶음 안에서만 옮긴다(고르지는 않음)
    e.preventDefault();
    const g = [...e.target.parentElement.children], b = g[(g.indexOf(e.target) + (/Left|Up/.test(e.key) ? -1 : 1) + g.length) % g.length];
    g.forEach((x) => x.tabIndex = x === b ? 0 : -1); b.focus();
  } else if (n && btns[n - 1] && (s.kind === "likert" || s.kind === "pairs" || s.kind === "basic" && s.q.id !== "dept")) { e.preventDefault(); pick(s, btns[n - 1]); }
});

// 시작: 히어로 버튼과 실패 화면 버튼
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-start]")) return;
  clearTimeout(timer);
  const away = !/^#?(test)?$/.test(location.hash);
  run += 1; reset(); qa.i = 0;
  history.replaceState({ q: -1, run }, "", "#test");
  if (away) route();
  history.pushState({ q: 0, run }, "", "#test");
  scrollTo({ top: 0, behavior: "instant" });
  drawTest();
  enter(1, $("quiz"));
  $("q-title").focus({ preventScroll: true });
});

// 브라우저 뒤로·앞으로 = 이전·다음 문항. 다른 회차 항목이면 시작 전으로, 해시 이동(state 없음)은 무시
function onPop(e) {
  const h = e.state;
  if (!h || h.q == null) return;
  clearTimeout(timer);
  if (h.run !== run) {
    reset();
    history.replaceState({ q: -1, run }, "", location.hash);
    drawTest(); scrollTo({ top: 0, behavior: "instant" });
  } else go(Math.min(h.q, steps().length), false);
}
addEventListener("popstate", onPop);
