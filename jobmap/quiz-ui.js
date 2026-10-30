// 검사 화면과 결과. app.js의 D, st, $, esc, src, link, colleges, drawPick, render, caseCard, codeName, icon, aImg, OFF, jump, route를 쓴다.
const Q = D.quiz;
const qa = { i: -1, a: {}, sector: [], pairs: {}, done: [], ym: null, chap: 0, seen: [] };
const LIKERT = [...Q.interest.items, ...Q.readyItems];
const PER = 6; // 흥미 30문항은 6개씩 점 줄로 위치를 보여 준다
const DOT = ["e n", "m n", "c", "m y", "e y"];
// 장(5차): 흥미·준비 상태·가치 짝·가고 싶은 곳. 장이 바뀌면 질문 앞에 안내 한 장을 끼운다.
// 기본 정보(step 없음)는 시작 버튼 바로 뒤라 안내를 끼우지 않는다(디자인 초안 3-2)
const CHAPS = Q.chapters.filter((c) => c.step);
const CHAP_IC = { interest: "c-like", ready: "c-ready", values: "c-pair", sector: "c-sector" };
const sec = (c) => `${c}/${CHAPS.length} · ${CHAPS[c - 1].title}`;

// 한 단계 = 한 질문. 기본 정보 → 흥미 → 준비 상태(그룹 순) → 가치 짝 → 끌리는 곳 → 고민(선택). ch는 장 번호(기본 정보 0)
// 다른 학교도 전공 문항을 묻는다(4차 결정 9)
function steps() {
  const basics = Q.basics, it = Q.interest.items;
  return [
    ...basics.map((q, k) => ({ kind: "basic", q, ch: 0, sec: Q.chapters[0].title, dotsOf: { n: basics.length, k } })),
    ...it.map((x, k) => ({ kind: "likert", it: x, ch: 1, sec: sec(1), ask: Q.interest.ask, dotsOf: { n: Math.min(PER, it.length - k + k % PER), k: k % PER } })),
    ...Q.ready.groups.flatMap((g) => g.items.map((x, k) => ({ kind: "likert", it: x, ch: 2, sec: sec(2), ask: Q.ready.ask, dotsOf: { n: g.items.length, k } }))),
    ...Q.pairs.map((p, k) => ({ kind: "pairs", p, k, ch: 3, sec: sec(3), dotsOf: { n: Q.pairs.length, k } })),
    { kind: "sector", ch: 4, sec: sec(4), dotsOf: { n: 1, k: 0 } },
    { kind: "note", ch: 4, sec: sec(4), dotsOf: { n: 1, k: 0 } }
  ];
}
const total = () => steps().filter((s) => s.kind !== "note").length;
const isDone = (s) => s.kind === "basic" ? !!qa.a[s.q.id] : s.kind === "likert" ? !!qa.a[s.it.id] : s.kind === "pairs" ? qa.pairs[s.k] != null : s.kind === "sector" && !!qa.sector.length;
const done = () => steps().filter(isDone).length;
// 진행 막대 칸 = 장마다 하나(기본 정보 포함). 고민(선택)은 세지 않는다
const parts = () => { const ss = steps().filter((s) => s.kind !== "note"); return Array.from({ length: CHAPS.length + 1 }, (_, c) => ss.filter((s) => s.ch === c)); };
const yearNum = (a = qa.a) => parseInt(a.year) || 1;
addEventListener("beforeunload", (e) => { if (qa.i >= 0 && qa.i < steps().length && done() > 3) e.preventDefault(); });

function optionsFor(q) {
  if (q.id === "school") return [{ t: "숭실대학교", v: "ssu" }, { t: "다른 학교", v: "etc" }];
  return q.options.map((o) => ({ t: o, v: o }));
}

// 직무 끌림 방향(O*NET 흥미 코드)의 1·2·3번째 글자에 3·2·1 가중치를 주고 내 영역 점수를 평균 낸다.
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
    <div class="qbar" id="q-bar" role="progressbar" aria-label="진행" aria-valuemin="0">${parts().map((p) => `<i style="--n:${p.length}"><b></b></i>`).join("")}</div>
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
    return head("둘 다 좋아도 하나만 골라요", Q.valueAsk) + `<div class="pair">${(s.k % 2 ? [1, 0] : [0, 1]).map((side, n) => { const v = V[s.p[side]];
      return `${n ? `<span class="or">또는</span>` : ""}<button type="button" class="pick2" data-side="${side}" aria-pressed="${cur === side}"><img src="img/v-${v.id}.svg" alt="" width="56" height="56"><b>${esc(v.name)}</b><span>${esc(v.desc)}</span></button>`; }).join("")}</div>`
      + (cur != null ? next("다음", "btn line") : "");
  }
  if (s.kind === "sector") return head("여러 개 골라도 돼요", Q.sectors.q) + `<div class="qopts">${Q.sectors.options.map((o) =>
    `<button type="button" class="qopt multi" data-s="${o.v}" aria-pressed="${qa.sector.includes(o.v)}">${esc(o.t)}</button>`).join("")}</div>${next("다음", "btn", !qa.sector.length)}`;
  return head("선택이에요", Q.note.q.replace(/\s*\(선택\)$/, "")) + `<textarea id="q-text" rows="4" aria-labelledby="q-title" placeholder="예: 전공 공부는 재밌는데 이걸로 뭘 할 수 있을지 모르겠어요">${esc(qa.a.note || "")}</textarea>
    <p class="hint">${esc(Q.note.hint)}</p>${next("결과 보기")}`;
}

// 장 안내 한 장(5차): 그림 + 몇 장째 + 제목 + 한 줄 + 시작하기. 자동으로 넘기지 않는다
function chapHTML(c) {
  const C = CHAPS[c - 1];
  return `<div class="chap"><span class="chap-ic"><img src="img/${CHAP_IC[C.id]}.svg" alt="" width="64" height="64"></span>
    <ol class="chap-step" aria-label="${CHAPS.length}장 중 ${c}장">${CHAPS.map((x, k) => `<li${k + 1 < c ? ` class="done"` : k + 1 === c ? ` class="cur"` : ""}>${k + 1 < c ? "✓" : k + 1}<span>${esc(x.step)}</span></li>`).join("")}</ol>
    <h1 class="qtext" id="q-title" tabindex="-1">${esc(C.title)}</h1><p>${esc(C.line)}</p>
    <div class="qnav"><button type="button" class="btn" id="q-next">시작하기</button></div></div>`;
}

function fill(s) {
  $("quiz").dataset.kind = qa.chap ? "chapter" : s.kind;
  $("q-sec").textContent = s.sec;
  progress();
}
// 답할 때마다 숫자·막대 갱신. 번호는 지금 문항, 막대는 장마다 답한 비율
function progress() {
  const n = done(), t = total(), bar = $("q-bar"), ps = parts();
  $("q-num").textContent = `${Math.min(qa.i + 1, t)} / ${t}`;
  bar.setAttribute("aria-valuemax", t);
  bar.setAttribute("aria-valuenow", n);
  bar.setAttribute("aria-valuetext", `${t}문항 중 ${n}문항 답했어요`);
  bar.querySelectorAll("i").forEach((el, c) => el.style.setProperty("--f", ps[c].filter(isDone).length / ps[c].length));
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
// 결과 맨 위 색면(5차): 1위 직무 크게 + 겹침 점수 + 끌림 1·2위 + 2·3위 직무. 결과와 친구용 화면이 같이 쓴다. list는 [{ job, score }]
function heroTop(list, riasec, flat) {
  const [t, ...more] = list, s = byScore(riasec).slice(0, 2);
  return `<div class="rh-main"><span class="rh-icon">${icon("j-" + t.job.key, 56)}</span><div class="rh-job"><small>흥미가 가장 많이 겹치는 직무</small><h2 id="r-title" tabindex="-1">${esc(t.job.name)}</h2><span class="rh-score">겹침 ${t.score}</span></div></div>
    <p class="rh-line">${flat ? "여러 일에 고르게 끌려요 · 아래 직무는 참고만" : `<b>${esc(s.map((x) => x.name).join("·"))}</b> 쪽으로 가장 끌려요`}</p>
    ${flat ? "" : `<div class="rh-dirs">${s.map((x) => `<span>${aImg(x.id, 24)}${esc(x.name)}</span>`).join("")}</div>`}
    <ol class="rh-next" start="2">${more.map((x) => `<li><a href="#jobs-${x.job.key}">${icon("j-" + x.job.key, 28)}<b>${esc(x.job.name)}</b><span>${x.score}</span></a></li>`).join("")}</ol>`;
}
// 끌림 막대(5차, 육각형 대신 우리 그림): 높은 순 캡슐 6개, 1·2위만 강조색. 흥미 답이 고르면 강조하지 않는다
const dbars = (riasec, flat) => { const s = byScore(riasec);
  return `<figure class="dbars${flat ? " flat" : ""}" role="img" aria-label="${s.map((x) => `${x.name} ${riasec[x.id]}`).join(", ")}">${s.map((x, k) => { const on = flat ? "" : ["on1", "on2"][k];
    return `<div class="db${on ? " " + on : ""}" style="--v:${riasec[x.id]}"><span class="db-col"><i></i></span>${aImg(x.id, 32)}<b>${esc(x.name)}</b><small>${riasec[x.id]}</small></div>`; }).join("")}</figure>`; };
// 결과 칸 머리: 그림 타일 + 제목
const rhead = (img, title) => `<div class="rc-head"><span class="rc-ic">${img}</span><h2>${esc(title)}</h2></div>`;
const friendHTML = (f) => `<div class="friend"><h1 class="sr-only">친구가 보낸 진로 결과</h1>
  <section class="r-hero"><p class="rh-who">친구가 보낸 결과예요</p>${heroTop(f.jobs.map((job) => ({ job, score: fitScore(job, f.riasec) })), f.riasec)}</section>
  <section class="rcard">${rhead(icon("c-like", 28), "친구의 끌림 순서")}${dbars(f.riasec)}</section>
  <div class="btns"><button type="button" class="btn big" data-start>나도 해 보기</button></div></div>`;

function prompts(a, r, d) {
  const who = d?.promptName ? `나는 ${d.promptName}을 공부하는 대학교 ${a.year} 학생이야.` : `나는 대학교 ${a.year}${d ? ` ${d.name}` : ""} 학생이야.`;
  const top = r.top3.map((x) => x.job.name);
  const interest = byScore(r.riasec).map((x) => `${x.name}(${x.short}) ${r.riasec[x.id]}`).join(", ");
  const ready = Q.ready.groups.map((g) => `${g.name} ${r.ready[g.id].toFixed(1)}`).join(", ");
  const low = Q.readyItems.filter((it) => a[it.id] <= 2).map((it) => it.q);
  const sectors = qa.sector.map((v) => Q.sectors.options.find((o) => o.v === v).t).join(", ");
  const base = `${who}
진로 검사(직접 만든 참고용, 규준 없음)에 답한 결과야.
- 끌림 순서(0~100, 내 안의 순서): ${interest}
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

// 공유 카드 1080×1350(5차): 위 색면에 1위 직무, 아래 흰 카드에 끌림 막대. 라이트 고정. 이름·학교·학과·학년·점수 숫자는 넣지 않는다
async function shareCanvas(r) {
  const s = byScore(r.riasec), job = r.top3[0].job, url = "tkdgh123.github.io/jobmap";
  const line = r.flat ? "여러 일에 고르게 끌려요" : `${s[0].name}·${s[1].name} 쪽으로 가장 끌려요`;
  const text = ["학과 진로 지도", "흥미가 가장 많이 겹치는 직무", "내 끌림 순서", url, line, ...s.map((x) => x.name), ...r.top3.map((x) => x.job.name)].join("");
  try { await Promise.all(["700 72px", "600 44px", "400 36px"].map((f) => document.fonts.load(`${f} "Pretendard Variable"`, text))); } catch {}
  // 그림은 같은 출처 SVG라 캔버스를 더럽히지 않는다. 못 읽으면 그 그림만 빼고 그린다
  const pic = async (f) => { const im = new Image(); im.src = `img/${f}.svg`; try { await im.decode(); return im; } catch { return null; } };
  const [jim, ...aims] = await Promise.all([pic("j-" + job.key), ...s.map((x) => pic("a-" + x.id))]);
  const cv = document.createElement("canvas"), g = cv.getContext("2d");
  cv.width = 1080; cv.height = 1350;
  const put = (s, x, y, font, color) => { g.font = `${font} "Pretendard Variable", system-ui, sans-serif`; g.fillStyle = color; g.textAlign = "center"; g.fillText(s, x, y); };
  const box = (x, y, w, h, rad, color) => { g.beginPath(); g.roundRect(x, y, w, h, rad); g.fillStyle = color; g.fill(); };
  box(0, 0, 1080, 1350, 0, "#EEF1F5");
  box(60, 60, 960, 640, 56, "#3A4BD0");
  put("학과 진로 지도", 540, 140, "600 34px", "rgba(255,255,255,.7)");
  put("흥미가 가장 많이 겹치는 직무", 540, 206, "400 36px", "rgba(255,255,255,.78)");
  box(456, 248, 168, 168, 40, "#FFFFFF");
  if (jim) g.drawImage(jim, 484, 276, 112, 112);
  g.font = `700 72px "Pretendard Variable", system-ui, sans-serif`;
  let n = job.name;
  while (n && g.measureText(n + (n === job.name ? "" : "…")).width > 840) n = n.slice(0, -1);
  put(n === job.name ? n : n + "…", 540, 520, "700 72px", "#FFFFFF");
  put(line, 540, 616, "600 44px", "#FFFFFF");
  box(60, 740, 960, 470, 48, "#FFFFFF");
  put("내 끌림 순서", 540, 812, "600 36px", "#191F28");
  s.forEach((x, k) => {
    const cx = 140 + k * 160, h = Math.max(24, r.riasec[x.id] / 100 * 220);
    box(cx - 52, 844, 104, 220, 32, "#F2F4F6");
    box(cx - 52, 1064 - h, 104, h, 32, r.flat || k > 1 ? "#D1D6DB" : k ? "#9AA3E8" : "#3A4BD0");
    if (aims[k]) g.drawImage(aims[k], cx - 28, 1082, 56, 56);
    put(x.name, cx, 1180, "600 30px", "#191F28");
  });
  put(url, 540, 1290, "400 34px", "#5F6B78");
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
  const areasSorted = byScore(r.riasec), top2 = areasSorted.slice(0, 2), last = areasSorted[areasSorted.length - 1];
  const lead = areasSorted[0], close = r.riasec[areasSorted[0].id] - r.riasec[areasSorted[2].id] <= 10;
  const leadCovered = (D.jobs || []).some((j) => (j.riasec || "")[0] === lead.id);
  const low = Q.readyItems.filter((it) => a[it.id] <= 2).sort((x, y) => a[x.id] - a[y.id]);
  const todo = todoOf(a);
  const sectorNames = qa.sector.map((v) => Q.sectors.options.find((o) => o.v === v).t);
  // 다른 학교는 숭실대 학과 이름 대신 전공 이름(4차 결정 9)
  const name = d && (ssu ? d.name : d.promptName || d.name);
  // 이긴 횟수가 같으면 같은 순위
  const rank = (v) => 1 + r.values.filter((x) => r.wins[x.id] > r.wins[v.id]).length;
  const P = prompts(a, r, d);
  const weekRow = (t) => `<li><b>${link(t)}</b>${t.how ? `<span>${esc(t.how)}</span>` : ""}</li>`;
  // 이번 주 할 일: 이번 주 후보인 첫 진단의 앞 2개 + 학년 할 일 1개. 모자라면 기본 항목으로 채운다
  const wk = diags.find((x) => x.week !== false);
  let week = [...(wk?.steps || []).slice(0, 2), todo[0]].filter(Boolean);
  if (week.length < 2 || !ssu || none) week = [...week, ...forSchool(WEEK, ssu)];
  week = week.filter((t, k) => week.findIndex((x) => same(x) === same(t)) === k).slice(0, 3);
  // 상담이 이번 주 할 일에 없으면 이번 주 목록 아래 한 줄로 알리고, 그 뒤로는 다시 권하지 않는다
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
  // 직무마다 왜 나왔나(결정 29, 5차): 직무 방향 글자 순서대로, 그 방향 문항 중 내가 4~5로 답한 것을 높은 답부터 2개. 없으면 내 평균 이상인 방향 이름만
  const mean = Object.values(r.riasec).reduce((s, v) => s + v, 0) / 6;
  const jwhy = (x) => {
    const c = [...x.job.riasec], on = c.filter((k) => r.riasec[k] >= mean);
    return `<p class="jwhy">${esc(codeName((on.length ? on : [c.sort((p, q) => r.riasec[q] - r.riasec[p])[0]]).join("")))} 쪽 흥미와 겹쳐요${x.near ? " · 내 학과 진로에도 있어요" : ""}</p>`;
  };
  const because = (x) => {
    const its = [...x.job.riasec].flatMap((c) => Q.interest.items.filter((it) => it.id[0] === c && a[it.id] >= 4)).sort((p, q) => a[q.id] - a[p.id]).slice(0, 2);
    return its.length ? `<ul class="rw-because">${its.map((it) => `<li>‘${esc(it.q)}’에 <b>${esc(Q.scales.like[a[it.id] - 1])}</b>라고 했어요</li>`).join("")}${x.near ? "<li>내 학과 진로에도 있어요</li>" : ""}</ul>` : jwhy(x);
  };
  const jtop = (j) => `<a class="rw-top" href="#jobs-${j.key}">${icon("j-" + j.key, 40)}<b>${esc(j.name)}</b><span class="rw-dirs">${[...j.riasec].map((c) => aImg(c, 20)).join("")}<span class="sr-only">${esc(codeName(j.riasec))}</span></span></a>`;
  // 의외로 맞는 직무: 위 3개·비슷한 직무 밖에서, 첫 방향이 내 1·2위가 아니고 점수가 평균 이상인 가장 높은 직무
  const shown = new Set(r.top3.flatMap((t) => [t.job, ...t.alike]));
  const odd = !r.flat && r.fits.find((f) => !shown.has(f.job) && !top2.some((x) => x.id === f.job.riasec[0]) && f.score >= r.fitMean);
  const fitRow = (x) => ({ name: x.job.name, sub: codeName(x.job.riasec), pct: x.score, label: x.score, href: `#jobs-${x.job.key}` });
  const v1 = r.values[0], vTie = r.values.filter((v) => rank(v) === 1).length > 1;
  const vImg = (v, n) => icon("v-" + v.id, n);
  const gname = (id) => Q.ready.groups.find((g) => g.id === id).name;
  const best = Q.ready.groups.reduce((m, g) => r.ready[g.id] > r.ready[m.id] ? g : m);
  // 링크 연월이 모름(v1)이거나 최근 자료 변경보다 앞이면 한 줄 알린다(결정 12)
  const upd = (D.updates || []).map((u) => u.date.slice(2, 4) + u.date.slice(5, 7)).sort().pop();
  const old = qa.ym && (qa.ym === "0000" || qa.ym < upd);

  // 순서(5차): 색면 → 목차 → 끌림 → 직무 → 할 일 → 준비 상태 → 회사 기준 → 진단 → 졸업생 → AI → 저장·나누기
  return `<div class="result">
    <h1 class="sr-only">진로 검사 결과</h1>
    ${old ? `<p class="safe">이 결과를 만든 뒤 직무·학과 자료가 바뀌어 직무 후보가 조금 다를 수 있어요.</p>` : ""}
    <section class="r-hero">
      <p class="rh-who">${esc([name || (ssu ? "숭실대학교" : "다른 학교"), a.year].join(" · "))}</p>
      ${heroTop(r.top3, r.riasec, r.flat)}
      ${care ? `<div class="r-care"><b>${esc(care.title)}</b><ul>${care.steps.map((t) => `<li>${how(t)}</li>`).join("")}</ul></div>` : ""}
      <a class="rh-week" href="#r-week"><b>이번 주</b>${esc(week[0].text)}</a>
      <div class="rh-act noprint"><button type="button" class="btn rh-btn" id="r-card">이미지로 저장</button><button type="button" class="btn rh-btn line" id="r-link">결과 링크 복사</button></div>
      <p class="rh-who" id="r-msg" aria-live="polite" hidden></p>
    </section>

    <nav class="r-jump noprint" aria-label="결과 목차">${[["r-areas", "끌림 순서"], ["r-jobs", "직무"], ["r-week", "이번 주"], ["r-ready", "준비 상태"], ["r-values", "회사 기준"], ["r-ai", "AI 질문"]]
      .map(([id, t]) => `<a href="#${id}">${t}</a>`).join("")}</nav>

    <section class="rcard" id="r-areas">
      ${rhead(icon("c-like", 28), "내 끌림 순서")}
      ${dbars(r.riasec, r.flat)}
      ${r.flat ? "" : `<div class="r-two"><div class="r-up"><b>힘이 나는 일</b><ul>${top2.flatMap((x) => x.daily.map((t) => `<li>${esc(x.name)} · ${esc(t)}</li>`)).join("")}</ul></div>
        <div class="r-down"><b>덜 끌리는 일</b><ul>${last.daily.map((t) => `<li>${esc(last.name)} · ${esc(t)}</li>`).join("")}</ul></div></div>`}
      <details><summary>6가지 모두 보기</summary><ul class="r-six">${areasSorted.map((x) => `<li>${aImg(x.id, 32)}<b>${esc(x.name)}</b><span>${esc(x.line)}</span><small>${esc(x.daily.join(" · "))}</small></li>`).join("")}</ul></details>
      <p class="verdict">참고용 검사예요. 대학생 전체와 비교한 점수가 아니라 내 답 안에서의 순서예요. <a href="#about">만든 방법</a></p>
      ${r.flat ? `<p class="verdict warn">흥미 답이 거의 같아서 끌림 차이가 잘 드러나지 않아요. '더 끌리는 것'을 골라 다시 해 보면 달라질 수 있어요.</p>`
        : close ? `<p class="verdict">위 세 가지가 10점 안으로 비슷해요. 순위보다 셋을 함께 보세요.</p>` : ""}
      ${!leadCovered ? `<p class="verdict warn">${esc(lead.name)} 쪽이 첫 방향인 직무가 이 사전엔 아직 없어요. 커리어넷 직업정보에서 더 찾아보세요.</p>` : ""}
    </section>

    <section class="rcard" id="r-jobs">
      ${rhead(icon("j-" + r.top3[0].job.key, 28), "직무 3개, 왜 나왔을까요")}
      <ol class="rwhy">${r.top3.map((x) => `<li>${jtop(x.job)}<p>${esc(x.job.does)}</p>${because(x)}${x.alike.length ? `<p>비슷한 직무: ${x.alike.map((j) => `<a href="#jobs-${j.key}">${esc(j.name)}</a>`).join(", ")}</p>` : ""}</li>`).join("")}</ol>
      ${odd ? `<div class="r-odd"><small>의외로 맞는 직무</small>${jtop(odd.job)}<p>${esc(odd.job.does)}</p>${because(odd)}</div>` : ""}
      ${r.tieMore ? `<p class="r-tie">3위와 점수가 같은 직무가 ${r.tieMore}개 더 있어요. <a href="#r-allfit">모두 보기</a></p>` : ""}
      ${r.flat ? "" : `<details class="r-same"><summary>같은 끌림의 직무</summary>${top2.map((x) => `<h3>${aImg(x.id, 20)}${esc(x.name)}</h3>${bars(r.fits.filter((f) => f.job.riasec.includes(x.id)).map(fitRow))}`).join("")}</details>`}
      <details class="allfit" id="r-allfit"><summary>직무 ${r.fits.length}개 모두 보기</summary>${bars(r.fits.map(fitRow))}</details>
    </section>

    <section class="rcard r-week" id="r-week">
      ${rhead(icon("g-school", 28), "이번 주에 할 일")}
      <ol>${week.map(weekRow).join("")}</ol>
      ${talk ? `<p>혼자 정하기 어려우면 ${ssu ? link({ text: "진로취업센터", url: JOB }) : "다니는 학교 진로·취업 센터"}에서 1:1 상담을 받을 수 있어요.</p>` : ""}
      <div class="r-cal btns noprint"><button type="button" class="btn line" id="r-cal">캘린더에 넣기</button><a class="btn ghost" id="r-gcal" href="${esc(gcal(calEvents([], [])[1]))}" target="_blank" rel="noopener">구글 캘린더</a></div>
      ${todo.length ? `<section id="r-todo">
        <h3>${year}학년 이번 학기 할 일</h3>
        <p class="lead">체크한 뒤 결과 링크를 복사하면 체크도 담겨요. 링크 안에만 담기고 사이트엔 남지 않아요.</p>
        <ul class="todo">${todo.map((t) => `<li><label><input type="checkbox" data-id="${tid(t)}"${qa.done.includes(tid(t)) ? " checked" : ""}><span>${how(t)}</span></label></li>`).join("")}</ul>
      </section>` : ""}
    </section>

    <section class="rcard" id="r-ready">
      ${rhead(icon("c-ready", 28), "준비 상태 한눈에")}
      <p class="lead">묶음마다 4문항 평균이에요(5점 만점).${year <= 2 ? ` 1~2학년은 ${gname("plan")}·${gname("exp")}이 낮게 나오는 게 보통이에요. 부족한 게 아니라 이제 채울 곳이에요.` : ""}</p>
      <ul class="rtiles">${Q.ready.groups.map((g) => { const v = r.ready[g.id], on = Math.round(v), cls = v <= 2 ? "low" : g === best && v >= 3.5 ? "best" : "";
        return `<li${cls ? ` class="${cls}"` : ""}><b>${esc(g.name)}</b><span class="rt-num">${v.toFixed(1)}</span><span class="pips" role="img" aria-label="5칸 중 ${on}칸">${[1, 2, 3, 4, 5].map((k) => `<i${k <= on ? ` class="on"` : ""}></i>`).join("")}</span>${cls ? `<em>${cls === "low" ? "채울 곳" : "든든해요"}</em>` : ""}</li>`; }).join("")}</ul>
      ${year >= 3 && Q.ready.groups.filter((g) => r.ready[g.id] <= 2).length >= 2 ? `<p class="calm">채울 곳이 여럿이어도 늦은 게 아니에요. 한 번에 다 하지 말고 이번 주에 할 일 하나부터 시작해요.</p>` : ""}
      ${low.length ? `<details><summary class="muted">'아니에요' 쪽으로 답한 문항 ${low.length}개와 해 볼 것 보기</summary>
        <ul class="fixes">${fixes.map((g) => `<li><span>${g.its.map((it) => `${esc(it.q)} <em>${Q.scaleOf(it.id)[a[it.id] - 1]}</em>`).join("<br>")}</span>${g.fix ? `<span>→ ${how(g.fix)}</span>` : ""}</li>`).join("")}</ul></details>` : ""}
    </section>

    <section class="rcard" id="r-values">
      ${rhead(vImg(v1, 28), "회사를 고를 때 중요한 순서")}
      <div class="v-first">${vImg(v1, 56)}<b>${esc(v1.name)}</b><span>${esc(v1.desc)} · 짝 비교에서 ${r.wins[v1.id]}번 골랐어요${vTie ? " (공동 1위)" : ""}</span></div>
      <ol class="v-rest">${r.values.slice(1).map((v) => `<li data-rank="${rank(v)}">${vImg(v, 20)}<b>${rank(v)}위 ${esc(v.name)}</b></li>`).join("")}</ol>
      ${sectorNames.length ? `<p class="lead">가 보고 싶은 곳</p><ul class="v-rest r-sector">${sectorNames.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    </section>

    ${diags.length ? `<section class="rcard">
      ${rhead(icon("c-pair", 28), "지금 먼저 볼 것")}
      <p class="lead">답을 보고 고른 진단이에요. 근거 자료를 같이 붙였어요.</p>
      <div>${diags.map((x) => `<div class="diag">
        <b>${esc(x.title)}</b>
        <p class="dwhy">${esc(why(x))}</p>
        ${x.evidence ? `<p class="dev">${esc(x.evidence.text)}${src(x.evidence.source)}</p>` : ""}
        ${x.steps.length ? `<ol>${x.steps.map((t) => `<li>${how(t)}</li>`).join("")}</ol>` : ""}
      </div>`).join("")}</div>
    </section>` : ""}

    ${d?.cases?.length ? `<section class="rcard">
      ${rhead(icon("c-sector", 28), `${d.promptName || d.name} 졸업생들이 간 길`)}
      <p class="lead">여러 대학이 공개한 2024년 이후 사례 중 일부예요.</p>
      <div class="cases">${d.cases.slice(0, 4).map(caseCard).join("")}</div>
      <div class="btns noprint"><button type="button" class="btn line" id="q-map">${esc(name)} 진로 지도 전체 보기</button></div>
    </section>` : d?.basic ? `<section class="rcard">
      <div class="btns"><button type="button" class="btn line" id="q-map">학과 지도에서 ${esc(name)} 보기</button></div>
    </section>` : none ? `<section class="rcard">
      ${rhead(icon("c-sector", 28), "졸업생들이 간 길")}
      <div class="nodept"><p>내 학과 졸업생 자료는 아직 없어요. 비슷한 학과와 직무부터 봐요.</p>
        <div class="btns"><a class="btn line" href="#map-${ssu ? "" : "etc-"}none">학과 지도 둘러보기</a><a class="btn line" href="#jobs">직무 사전 보기</a><a class="src" href="https://github.com/tkdgh123/tkdgh123.github.io/issues" target="_blank" rel="noopener">학과 자료 제보</a></div></div>
    </section>` : ""}

    <section class="rcard" id="r-ai">
      ${rhead(icon("j-ai", 28), "AI에게 이어서 물어보기")}
      <p class="lead">내 결과를 넣은 질문이에요. 목적을 고르고 복사해서 ChatGPT·Claude·Gemini 같은 AI에 붙여 넣으세요.</p>
      <div class="chips noprint" id="r-pk">${P.map((p, k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === 0}">${esc(p.label)}</button>`).join("")}</div>
      <div class="prompt"><pre id="r-text" tabindex="0" aria-label="AI에게 물어볼 질문">${esc(P[0].text).replace(/⁠/g, "")}</pre>
        <div class="bar"><small>이름·학번·학교는 넣지 마세요. 마음 문항 답과 고민 글도 들어 있으니 남기기 싫으면 그 줄을 지우고 붙여 넣으세요. AI 답은 틀릴 수 있으니 출처를 확인하세요.</small><button type="button" class="btn noprint" id="r-copy">복사하기</button></div></div>
    </section>

    <section class="rcard r-save">
      <div class="btns noprint"><button type="button" class="btn line" id="r-friend">친구용 링크 복사</button><button type="button" class="btn ghost" id="q-again">다시 하기</button></div>
      <p class="safe" id="r-msg2">결과 링크를 연 사람도 마음 문항 답과 상담 안내까지 그대로 봐요. 진로만 나누려면 친구용 링크를 쓰세요.</p>
      <p class="r-scorenote">겹침 점수는 내 끌림 6가지 점수를 직무의 끌림 방향 순서(3·2·1 가중)로 평균 낸 값이에요. 100에 가까울수록 많이 겹쳐요.</p>
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
    $("q-body").innerHTML = qa.chap ? chapHTML(qa.chap) : bodyHTML(s);
    fill(s);
  }
}

const say = (id, t) => { $(id).hidden = false; $(id).textContent = t; };
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
    const titles = [...document.querySelectorAll(".r-week > ol > li > b")].map((b) => b.textContent.replace(/⁠/g, ""));
    saveBlob(new Blob([makeIcs(calEvents(titles, skip))], { type: "text/calendar;charset=utf-8" }), "학과진로지도-일정.ics");
    $("r-cal").textContent = "저장했어요";
  });
  // 결과 안 링크(목차 칩·이번 주·모두 보기·#r-todo): 해시를 바꾸지 않고 그 칸으로 옮긴다(접혀 있으면 펼친다)
  $("v-test").querySelector(".result").addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#r-"]'), to = a && $(a.hash.slice(1));
    if (!to) return;
    e.preventDefault();
    if (to.tagName === "DETAILS") to.open = true;
    jump(to);
  });
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
    try { await navigator.clipboard.writeText(url); say("r-msg", "링크를 복사했어요. 이 링크를 열면 마음 문항 답까지 같은 결과를 다시 보여 줘요."); }
    catch { say("r-msg", url); }
  });
  $("r-friend").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#s=${encodeFriend(compute(qa.a, qa.sector, qa.pairs))}`;
    try { await navigator.clipboard.writeText(url); say("r-msg2", "친구용 링크를 복사했어요. 답은 들어가지 않아요. 끌림 점수와 직무 3개만 담겨요."); }
    catch { say("r-msg2", url); }
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
    say("r-msg", "카드 이미지를 저장했어요.");
  });
  const d = D.depts.find((x) => x.id === qa.a.dept);
  if (d) { Object.assign(st, { school: qa.a.school, college: d.college, dept: d.id, year: yearNum() }); drawPick(); render(); }
}

// ---- 넘김: 틀은 그대로 두고 #q-body만 나갔다 들어온다(결정 4) ----
let busy = false, timer = 0, run = Date.now();
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const reset = () => Object.assign(qa, { i: -1, a: {}, sector: [], pairs: {}, done: [], ym: null, chap: 0, seen: [], shared: false, fail: false, friend: null });
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
    // 앞으로 가다 새 장에 들어서면 이번 회차에 한 번만 질문 대신 장 안내를 보인다. history·단계 번호는 그대로(5차)
    const c = steps()[to]?.ch;
    qa.chap = dir > 0 && c && c !== steps()[qa.i]?.ch && !qa.seen.includes(c) ? c : 0;
    if (qa.chap) qa.seen.push(c);
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

// 장 안내 → 그 장 첫 질문: 같은 단계 안에서 #q-body만 바꾼다
async function openChap() {
  if (busy) return;
  busy = true;
  try {
    const out = calm() ? null : $("q-body").animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-24px)" }], { duration: 180, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    if (out) await out.finished;
    qa.chap = 0;
    drawTest();
    enter(1);
    $("q-title").focus({ preventScroll: true });
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
  else if (b.id === "q-next" && qa.chap) openChap();
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
  // 장 안내에선 숫자키로 고르지 않는다(안내를 건너뛰고 첫 문항까지 답하지 않게). Enter·Space는 시작하기
  if (qa.chap) { if (/^(Enter| )$/.test(e.key) && e.target.tagName !== "BUTTON") { e.preventDefault(); openChap(); } return; }
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
