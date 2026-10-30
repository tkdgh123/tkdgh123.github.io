// 화면 그리기: 학과 지도, 직무 사전, AI와 취업, 많이 묻는 것, 만든 방법, 이동. 검사 화면은 quiz-ui.js
const D = window.JOBMAP;
D.depts.sort((a, b) => D.collegeOrder.indexOf(a.college) - D.collegeOrder.indexOf(b.college));
D.depts.forEach((d) => Object.assign(d, (D.ssuDept || {})[d.id] || {}));
const colleges = D.collegeOrder.filter((c) => D.depts.some((d) => d.college === c && !d.hide));
const st = { school: "ssu", college: D.depts[0].college, dept: D.depts[0].id, year: 1, jobArea: "", field: "" };
// 이번 탭에서 학과를 고른 적이 있는지(Q30). 브라우저 저장 공간은 쓰지 않아요(C19)
let picked = false;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/([%)])(?=[가-힣])/g, "$1⁠").replace(/([가-힣])·/g, "$1⁠·");
const urls = (u) => String(u || "").split(/\s*,\s*(?=https?:)/).filter((x) => /^https?:|^\.\.\//.test(x));
// 출처 링크 글자 = 링크가 가는 곳 이름 [+ 개인 글 종류] [+ 연월](4차 결정 21). 표에 없는 곳은 호스트 그대로 쓰고, 날짜는 date 칸 → URL 안 날짜만 쓴다
const SRC_NAME = {
  "career.go.kr": "커리어넷", "onetonline.org": "O*NET", "onetcenter.org": "O*NET", "wagework.go.kr": "워크피디아", "work24.go.kr": "고용24", "yw.work24.go.kr": "청년일경험포털",
  "moel.go.kr": "고용노동부", "mpm.go.kr": "인사혁신처", "korea.kr": "정책브리핑", "alio.go.kr": "알리오", "nabo.go.kr": "국회예산정책처", "eiec.kdi.re.kr": "KDI 경제정보센터",
  "ssu.ac.kr": "숭실대", "changwon.ac.kr": "국립창원대", "yu.ac.kr": "영남대", "korea.ac.kr": "고려대", "mju.ac.kr": "명지대", "sungshin.ac.kr": "성신여대", "tu.ac.kr": "동명대",
  "kookmin.ac.kr": "국민대", "smu.ac.kr": "상명대", "dongguk.ac.kr": "동국대", "ks.ac.kr": "경성대", "hknu.ac.kr": "한경국립대", "konkuk.ac.kr": "건국대", "hallym.ac.kr": "한림대",
  "jj.ac.kr": "전주대", "cnu.ac.kr": "충남대", "hannam.ac.kr": "한남대", "hufs.ac.kr": "한국외대", "yonsei.ac.kr": "연세대", "uos.ac.kr": "서울시립대", "kongju.ac.kr": "공주대",
  "deu.ac.kr": "동의대", "gknu.ac.kr": "국립경국대", "kangwon.ac.kr": "강원대", "ut.ac.kr": "한국교통대", "wku.ac.kr": "원광대", "honam.ac.kr": "호남대", "sejong.ac.kr": "세종대",
  "sogang.ac.kr": "서강대", "hanyang.ac.kr": "한양대", "silla.ac.kr": "신라대", "bdu.ac.kr": "부산디지털대", "pusan.ac.kr": "부산대", "koreatech.ac.kr": "한국기술교육대",
  "ajou.ac.kr": "아주대", "ulsan.ac.kr": "울산대", "jbnu.ac.kr": "전북대", "inu.ac.kr": "인천대", "khu.ac.kr": "경희대", "ysu.ac.kr": "영산대", "kumoh.ac.kr": "금오공대", "cau.ac.kr": "중앙대",
  "hankyung.com": "한국경제", "fnnews.com": "파이낸셜뉴스", "newsis.com": "뉴시스", "hangyo.com": "한국교육신문", "v.daum.net": "다음 뉴스", "dhnews.co.kr": "대학저널",
  "byline.network": "바이라인네트워크", "ditoday.com": "디지털인사이트", "asiae.co.kr": "아시아경제", "mtn.co.kr": "머니투데이방송", "sbs.co.kr": "SBS Biz", "g-enews.com": "글로벌이코노믹",
  "outsourcing.co.kr": "아웃소싱타임스", "journalist.or.kr": "기자협회보", "brandbrief.co.kr": "브랜드브리프", "zdnet.co.kr": "지디넷코리아", "newstomato.com": "뉴스토마토",
  "economist.co.kr": "이코노미스트", "heraldcorp.com": "헤럴드경제", "topstarnews.net": "톱스타뉴스", "khan.co.kr": "경향신문", "metroseoul.co.kr": "메트로신문", "venturesquare.net": "벤처스퀘어",
  "youthdaily.co.kr": "청년일보", "seoul.co.kr": "서울신문", "ddaily.co.kr": "디지털데일리", "sateconomy.co.kr": "토요경제", "news1.kr": "뉴스1", "twig24.com": "트윅24", "tf.co.kr": "더팩트",
  "hellot.net": "헬로티", "wikitree.co.kr": "위키트리", "nocutnews.co.kr": "노컷뉴스", "mt.co.kr": "머니투데이", "dt.co.kr": "디지털타임스", "etnews.com": "전자신문", "aimatters.co.kr": "AI매터스",
  "etoday.co.kr": "이투데이", "kyeonggi.com": "경기일보", "thisisgame.com": "디스이즈게임", "boannews.com": "보안뉴스",
  "taxtimes.co.kr": "한국세정신문", "tfmedia.co.kr": "조세금융신문", "heraldk.com": "헤럴드경제 미주판", "newdaily.co.kr": "뉴데일리", "ajunews.com": "아주경제",
  "linkareer.com": "링커리어", "comento.kr": "코멘토", "wanted.co.kr": "원티드", "lg.co.kr": "LG", "superookie.com": "슈퍼루키", "yozm.wishket.com": "요즘IT", "maily.so": "메일리",
  "github.com": "GitHub", "youtube.com": "유튜브", "blog.naver.com": "네이버 블로그", "tistory.com": "티스토리 블로그", "velog.io": "velog 블로그", "brunch.co.kr": "브런치 글",
  "dcinside.com": "디시인사이드", "cafe.daum.net": "다음 카페", "arxiv.org": "arXiv", "doi.org": "논문", "digitaleconomy.stanford.edu": "스탠퍼드대", "buffalo.edu": "뉴욕주립대 버펄로",
  "ebu.ch": "EBU", "psicothema.com": "Psicothema"
};
// 개인 글과 그 종류(경로까지 본다). 여기 걸리면 '한 사람의 사례' 딱지 대상이에요
const SRC_KIND = [
  [/linkareer\.com\/cover-letter/, "합격 자소서"], [/linkareer\.com\/(pass-review|final_review|junior_activity|jayuu)/, "후기"],
  [/linkareer\.com\/(STEM_mentoring|mentoring|mentor-qna|public-mentor)/, "멘토 답변"], [/comento\.kr/, "현직자 답변"],
  [/dcinside\.com|cafe\.daum\.net/, "커뮤니티 글"], [/youtube\.com|youtu\.be/, "영상"], [/blog\.naver\.com|tistory\.com|velog\.io|brunch\.co\.kr/, ""]
];
const isPersonal = (u) => SRC_KIND.some(([re]) => re.test(u));
function srcName(u, date) {
  let host;
  try { host = new URL(u).hostname.replace(/^(www|m)\./, ""); } catch { return "출처"; }
  const k = Object.keys(SRC_NAME).filter((d) => host === d || host.endsWith("." + d)).sort((a, b) => b.length - a.length)[0];
  const kind = (SRC_KIND.find(([re]) => re.test(u)) || [])[1];
  const m = !date && kind === undefined && [/\/(20[12]\d)\/(\d\d)\/\d+/, /[/=_A-Z](20[12]\d)(\d\d)\d{5,}/].map((re) => u.match(re)).find((m) => m && m[2] >= 1 && m[2] <= 12);
  return [k ? SRC_NAME[k] : host, kind, date || (m ? `${m[1]}-${m[2]}` : "")].filter(Boolean).join(" ");
}
// 같은 이름이 연달아 나오면 둘째부터 숫자만 보여요(읽기 프로그램은 aria-label로 전체 이름)
function src(u, date) {
  if (!u) return "";
  if (!urls(u).length) return ` <span class="srct">출처: ${esc(u)}</span>`;
  let last = "", n = 0;
  return urls(u).map((x) => {
    const t = srcName(x, date);
    n = t === last ? n + 1 : 1; last = t;
    return ` <a class="src" href="${esc(x)}" target="_blank" rel="noopener" aria-label="출처: ${esc(n > 1 ? `${t} ${n}` : t)} (새 창)">${esc(n > 1 ? n : t)}</a>`;
  }).join("");
}
const link = (t) => t.url ? `<a href="${esc(t.url)}"${t.url.startsWith("#") ? "" : ` target="_blank" rel="noopener"`}>${esc(t.text)}</a>` : esc(t.text);
(D.jobs || []).forEach((j) => j.alias = D.quiz.jobAlias[j.key] || [j.name.split(/[·(\s]/)[0]]);
// 학과 진로 이름이 이 직무에 해당하는지(공대의 공기업은 기술직이라 NCS 사무직으로 보지 않는다). 학과 지도와 검사 near가 같이 쓴다
const pathIs = (j, name, college) => j.alias.some((a) => name.includes(a)) && !(D.quiz.jobExclude[j.key] || []).some((x) => name.includes(x)) && !(j.key === "ncs" && college === "공과대학");
const dictFor = (name) => (D.jobs || []).filter((j) => pathIs(j, name, st.college))
  .map((j) => [j, Math.max(...j.alias.filter((a) => name.includes(a)).map((a) => a.length))])
  .sort((a, b) => b[1] - a[1])[0]?.[0];
// 학과 진로·사례의 직무 사전 링크: jobs 키가 있으면 그것만 써요(빈 배열 = 링크 없음, 없는 key는 건너뜀). 키가 없을 때만 이름으로 찾아요(4차 결정 6)
const dictLink = (name, keys) => {
  const j = keys ? keys.map((k) => D.jobs.find((x) => x.key === k)).find(Boolean) : dictFor(name);
  return j ? `<a class="dict" href="#jobs-${j.key}" aria-label="직무 사전: ${esc(j.name)}">직무 사전</a>` : "";
};
// 다른 학교 화면의 학과 이름은 전공 이름이에요(일본어·일본학 전공 → 일본어·일본학)
const deptName = (d, ssu) => ssu ? d.name : d.promptName.replace(/ 전공$/, "");
const noneName = (ssu) => ssu ? "내 학과가 없어요" : "비슷한 전공이 없어요";
const statCard = (s) => `<div class="stat"><b class="num">${esc(s.value)}</b><span>${esc(s.label)}</span><small>${esc(s.basis)}${src(s.source)}</small></div>`;
const AREA = Object.fromEntries(D.quiz.areas.map((x) => [x.id, x]));
// 흥미 코드를 글자로도 풀어 쓴다(EC → EC 진취·관습). 터치 화면엔 툴팁이 안 보여서
const codeName = (code) => `${code} ${code.split("").map((c) => AREA[c].name.replace("형", "")).join("·")}`;
const codeTag = (j) => j.riasec ? `<span class="code">${esc(codeName(j.riasec))}</span>` : "";
const aIcon = (j) => `<img class="jd-ic" src="img/j-${j.key}.svg" alt="" width="40" height="40">`;
// AI가 바꾸는 점: 직무 사전과 AI 화면이 같은 칸 이름을 쓴다(Q27)
const aiDl = (a) => `<dl>${[["요즘 현장", a.now], ["바뀌는 일", a.change], ["신입이 갖출 것", a.need]].filter((x) => x[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;

function chips(el, items, key, after) {
  el.innerHTML = items.map((it) =>
    `<button type="button" class="chip${it.ghost ? " ghost" : ""}" data-v="${esc(it.v)}" aria-pressed="${String(st[key]) === String(it.v)}">${esc(it.label)}</button>`).join("");
  el.onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    st[key] = isNaN(b.dataset.v) || b.dataset.v === "" ? b.dataset.v : Number(b.dataset.v);
    el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    const v = b.dataset.v;
    after();
    [...el.children].find((x) => x.dataset.v === v)?.focus({ preventScroll: true });
  };
}

const caseCard = (c) => `<div class="case ${c.kind === "in" ? "in" : "out"}">
  <div class="ctop"><span class="ck">${c.kind === "in" ? "전공 따라" : "전공 밖으로"}</span><span class="cm">${esc(c.type)} · ${esc(c.date)}${c.trust && c.trust !== "높음" ? ` · 신뢰 ${esc(c.trust)}` : ""}</span></div>
  <b>${esc(c.to)}${dictLink(c.to, c.jobs)}</b>
  ${c.how?.length ? `<ul>${c.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
  ${src(c.source)}
</div>`;

function render() {
  const out = $("out"), S = D.ssu, ssu = st.school === "ssu";
  // 학과 지도를 보는 중에 고른 학과를 주소에 담아요(상담사가 이 주소를 보낼 수 있게). 방문 기록은 늘리지 않아요
  if (shown === "map") history.replaceState(history.state, "", `#map-${ssu ? "" : "etc-"}${st.dept}`);
  // '내 학과가 없어요'·'비슷한 전공이 없어요': 계열 6개 → 전국 계열 취업률 + 자료 있는 전공(결정 10)
  if (st.dept === "none") {
    const F = D.fieldRate.fields, f = F.find((x) => x.id === st.field);
    const near = f ? f.depts.map((id) => D.depts.find((x) => x.id === id)).filter(Boolean) : [];
    out.innerHTML = `
  <div class="dept">
    <h2>${noneName(ssu)}</h2>
    <p class="intro">계열을 고르면 전국 계열 취업률과 자료가 있는 전공을 보여 줘요.</p>
    <div class="chips fieldchips"></div>
    ${f ? statCard(f) : ""}
    ${near.length ? `<p>다른 전공 자료예요</p><div class="chips">${near.map((x) => `<a class="chip" href="#map-${ssu ? "" : "etc-"}${x.id}">${esc(deptName(x, ssu))}</a>`).join("")}</div>` : ""}
    <div class="btns"><a class="btn line" href="#jobs">직무 사전 보기</a><button type="button" class="btn line" data-start>검사하기</button><a class="src" href="https://github.com/tkdgh123/tkdgh123.github.io/issues" target="_blank" rel="noopener">학과 자료 제보</a></div>
  </div>`;
    chips(out.querySelector(".fieldchips"), F.map((x) => ({ v: x.id, label: x.name })), "field", () => { render(); out.querySelector(`.fieldchips [data-v="${st.field}"]`)?.focus({ preventScroll: true }); });
    return;
  }
  const d = D.depts.find((x) => x.id === st.dept);
  // 학년별 할 일: 다른 학교는 숭실대 할 일을 STEP etc 문구로 바꾼 일반판 8줄(결정 8)
  const years = [1, 2, 3, 4].map((y) => {
    const items = ssu ? [...(S.roadmap[y] || []), ...((d.roadmap || {})[y] || [])] : forSchool(S.roadmap[y] || [], false);
    return `<li class="${y === st.year ? "now" : ""}"><b>${y}학년</b><ul>${items.map((t) => `<li><b>${link(t)}</b>${t.how ? `<span>${esc(t.how)}</span>` : ""}</li>`).join("")}</ul></li>`;
  }).join("");
  const res = [...S.resources, ...(d.ssu_specific || [])].map((r) =>
    `<a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></a>`).join("");
  const common = `
  <section id="map-s-years">
    <h2>${ssu ? "숭실대에서 학년별로 해 볼 것" : "학년별로 해 볼 것"}</h2>
    <p class="lead">정답 순서는 없어요. 지금 학년 칸부터 보세요.</p>
    <ol class="years">${years}</ol>
  </section>`;
  const school = ssu ? `
  <section>
    <h2>숭실대에서 쓸 수 있는 것</h2>
    <div class="res">${res}</div>
  </section>` : `
  <section><p class="note-school"><img src="img/g-school.svg" alt="" width="32" height="32"><span><b>숭실대 자료만 있어요</b>다니는 학교 진로·취업 센터에서 비슷한 프로그램을 찾아보세요.</span></p></section>`;

  // 기본판(결정 11): 이름·단과대·누리집 + 직무 칩 + 공통 칸. 계열 취업률은 넣지 않아요(사장 답 3)
  if (d.basic) {
    const jobs = (d.jobs || []).map((k) => D.jobs.find((j) => j.key === k)).filter(Boolean);
    out.innerHTML = `
  <div class="dept">
    <span class="tag">${esc(d.college)}</span>
    <h2>${esc(d.name)}</h2>
    <p class="intro">여러 대학 진로와 졸업생 사례는 아직 모으는 중이에요.${d.url ? ` <a href="${esc(d.url)}" target="_blank" rel="noopener">학과 누리집</a>` : ""}</p>
  </div>

  <section>
    <h2>직무 사전에서 이어 보기</h2>
    ${jobs.length ? `<div class="jobs-of">${jobs.map((j) => `<a class="jobchip" href="#jobs-${j.key}"><img src="img/j-${j.key}.svg" alt="" width="24" height="24">${esc(j.name)}</a>`).join("")}</div>`
      : `<p class="lead">직무 사전에 맞는 직무가 아직 없어요. <a href="#jobs">직무 사전 전체 보기</a></p>`}
  </section>
  ${common}${school}`;
    return;
  }

  // 머리 숫자: 숭실대는 숭실대 전체 + 전국 계열, 다른 학교는 전국 계열 하나(결정 5·7)
  const field = (d.stats || []).find((x) => x.label.includes("계열")) || D.fieldRate[d.college];
  const stats = (ssu ? [S.rate, field, ...(d.stats || []).filter((x) => x !== field)] : [field]).filter(Boolean).map(statCard).join("");
  const n = d.uni?.n || 1;
  // 다른 학교 화면엔 숭실 낱말을 두지 않아요(결정 32). 센 대학 수에는 들어 있어서 '외 N곳'으로 적어요
  const unis = (d.uni?.list || "").split("·").filter(Boolean), named = ssu ? unis : unis.filter((u) => !/숭실/.test(u));
  const uniText = unis.length ? ` (${esc(named.join("·"))}${named.length < unis.length ? ` 외 ${unis.length - named.length}곳` : ""})` : "";
  const bar = (p) => `<div class="path ${p.kind}"><div class="pl"><b>${esc(p.name)}${dictLink(p.name, p.jobs)}</b>${p.note ? `<span>${esc(p.note)}</span>` : ""}</div>
    <div class="pb" role="img" aria-label="${n}개 대학 중 ${p.k}곳"><i style="width:${Math.round(p.k / n * 100)}%"></i></div><span class="pk num" aria-hidden="true">${p.k}/${n}</span></div>`;
  const ins = (d.paths || []).filter((p) => p.kind === "in"), outs = (d.paths || []).filter((p) => p.kind !== "in");
  const cases = d.cases || [];
  const certs = (d.certs || []).filter((c) => ssu || !c.ssuOnly);
  const scenes = (d.ai || []).map((a) => `<div class="scene"><i>${esc(a.task)}</i><b>${esc(a.title)}</b><span>${esc(a.how)}</span></div>`).join("");
  const parts = [["cases", "졸업생 사례", cases.length], ["paths", "여러 대학 진로", 1], ["prep", "준비법", d.tips?.length], ["years", "학년별 할 일", 1], ["ai", "AI 쓰는 장면", scenes]].filter((x) => x[2]);

  out.innerHTML = `
  <div class="dept">
    <span class="tag${ssu ? "" : " nat"}">${ssu ? esc(d.college) : "여러 대학 자료"}</span>
    <h2>${esc(deptName(d, ssu))}</h2>
    <p class="intro">${esc(d.intro)}</p>
    <div class="stats">${stats}</div>
  </div>
  <nav class="onpage" aria-label="이 화면">${parts.map(([id, t]) => `<a class="chip" href="#map-s-${id}">${t}</a>`).join("")}</nav>

  ${cases.length ? `<section id="map-s-cases">
    <h2>실제로 이렇게 갔어요</h2>
    <p class="lead">2024년 이후 공개된 졸업생 사례예요. 대학 공식 후기, 합격 자소서, 블로그·유튜브에서 모았어요.</p>
    <div class="cases">${cases.map(caseCard).join("")}</div>
  </section>` : ""}

  <section id="map-s-paths">
    <h2>여러 대학이 꼽는 진로</h2>
    <p class="lead">${n}개 대학 학과가 안내하는 진로를 세었어요. 막대가 길수록 많은 대학이 꼽았어요.${uniText}</p>
    <div class="fork">
      <div class="lane in"><h3>전공 따라 <i>${ins.length}</i></h3>${ins.map(bar).join("")}</div>
      <div class="lane out"><h3>전공 밖으로 <i>${outs.length}</i></h3>${outs.map(bar).join("")}</div>
    </div>
    ${d.refStats?.length ? `<p class="refstats">다른 대학 학과 숫자(참고): ${d.refStats.map((s) => `${esc(s.label.replace("(참고)", ""))} ${esc(s.value)}(${esc(s.basis)})${src(s.source)}`).join(" · ")}</p>` : ""}
  </section>

  ${d.tips?.length ? `<section id="map-s-prep">
    <h2>사례에서 반복된 준비법</h2>
    <ol class="tips">${d.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
    ${certs.length ? `<div class="certs"><b>근거 있는 자격·점수</b>${certs.map((c) => `<span title="${esc(c.note)}">${esc(c.name)}</span>`).join("")}</div>` : ""}
  </section>` : ""}

  ${d.trends?.length ? `<section>
    <h2>요즘 채용 분위기</h2>
    <ul class="trends">${d.trends.map((t) => `<li><span class="num">${esc(t.date)}</span><p>${esc(t.text)}${src(t.source)}</p></li>`).join("")}</ul>
  </section>` : ""}
  ${common}

  ${scenes ? `<section id="map-s-ai">
    <h2>이 학과에서 AI 쓰는 장면</h2>
    <p class="lead">도구 이름보다 어떤 일에 쓰는지가 오래가요. 과제에 쓸 땐 수업 규칙부터 확인하세요. <a href="#ai">AI와 취업 전체 보기</a></p>
    <div class="scenes">${scenes}</div>
  </section>` : ""}
  ${school}`;
}

// 고르기 줄: 학교 → (숭실대만) 단과대 → 학과·전공 → 학년. 고른 뒤 다시 오면 한 줄로 접어요(Q30)
function drawPick() {
  const ssu = st.school === "ssu", list = ssu ? D.depts : D.depts.filter((d) => d.promptName);
  // 학교를 바꿔 그 학교에 없는 학과가 되면 첫 학과로(다른 학교는 전공 8개와 none만)
  if (st.dept !== "none" && !list.some((d) => d.id === st.dept)) st.dept = list[0].id;
  const cur = D.depts.find((d) => d.id === st.dept);
  if (ssu && cur) st.college = cur.college;
  chips($("school"), [...D.schools.map((s) => ({ v: s.id, label: s.name })), { v: "etc", label: "다른 학교", ghost: true }], "school", () => { drawPick(); render(); });
  chips($("college"), colleges.map((c) => ({ v: c, label: c })), "college", () => {
    st.dept = D.depts.find((d) => d.college === st.college && !d.hide).id; drawPick(); render();
  });
  chips($("dept"), [...(ssu ? D.depts.filter((d) => d.college === st.college && !d.hide) : list).map((x) => ({ v: x.id, label: deptName(x, ssu) })), { v: "none", label: noneName(ssu), ghost: true }], "dept", () => { picked = true; render(); });
  // 학년을 고르면 그 학년 칸으로 가요(Q28)
  chips($("year"), [1, 2, 3, 4].map((y) => ({ v: y, label: `${y}학년` })), "year", () => { render(); jump(document.querySelector(".years > li.now")); });
  $("pick").querySelectorAll(".row:nth-child(2)").forEach((r) => r.hidden = !ssu);
  $("pick").querySelectorAll(".row:nth-child(3) > span").forEach((s) => s.textContent = ssu ? "학과" : "전공");
}
// 접힌 줄을 보이면 고르기 줄은 숨겨요. 버튼은 DOM에 남아요(C10). 접을 땐 지금 고른 것을 한 줄로 쓰고, 펼치면 골라진 칩이 가로로 넘치는 줄 안에 보이게 해요
const foldPick = (on) => {
  $("pick").hidden = on; $("pick-sum").hidden = !on;
  const ssu = st.school === "ssu", cur = D.depts.find((d) => d.id === st.dept);
  if (on) $("pick-sum").querySelector("span").textContent = [ssu ? D.schools[0].name : "다른 학교", ssu && cur && st.college, cur ? deptName(cur, ssu) : noneName(ssu), `${st.year}학년`].filter(Boolean).join(" · ");
  else ["school", "college", "dept"].forEach((id) => {
    const r = $(id), b = r.querySelector('[aria-pressed="true"]')?.getBoundingClientRect(), a = r.getBoundingClientRect();
    if (b && (b.left < a.left || b.right > a.right)) r.scrollLeft += b.left - a.left - 16;
  });
};
$("pick").insertAdjacentHTML("afterend", `<div class="pick-sum" id="pick-sum" hidden><span></span><button type="button" class="chip ghost">바꾸기</button></div>`);
$("pick-sum").querySelector("button").onclick = () => { foldPick(false); ($("dept").querySelector('[aria-pressed="true"]') || $("school").querySelector('[aria-pressed="true"]'))?.focus(); };

// 직무 사전: 흥미 영역으로 거를 수 있다
function drawJobs() {
  const list = (a) => (a || []).map((t) => `<li>${esc(t)}</li>`).join("");
  chips($("jdtools"), [{ v: "", label: "전체" }, ...D.quiz.areas.map((x) => ({ v: x.id, label: `${x.short} ${x.id}` }))], "jobArea", drawJobs);
  const jobs = (D.jobs || []).filter((j) => !st.jobArea || (j.riasec || "").includes(st.jobArea));
  $("jdcount").textContent = `직무 ${jobs.length}개`;
  $("jds").innerHTML = jobs.map((j) => `
    <details class="jd" id="job-${j.key}">
      <summary class="jd-head">${aIcon(j)}<span class="jd-title"><b role="heading" aria-level="2">${esc(j.name)}</b><small>${esc(String(j.does || "").split(/(?<=[.!?])\s/)[0])}</small></span>${codeTag(j)}</summary>
      <div class="body">
        ${j.tasks?.length ? `<div><h3>하는 일</h3><ol>${list(j.tasks)}</ol></div>` : ""}
        ${j.skills?.length ? `<div><h3>필요한 힘</h3><div class="sk">${j.skills.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
        ${j.open ? `<div><h3>전공이 달라도</h3><p class="open">${esc(j.open)}${isPersonal(j.openSource || "") ? ` <span class="case-tag">한 사람의 사례</span>` : ""}${src(j.openSource)}</p></div>` : ""}
        ${j.ai && (j.ai.now || j.ai.change || j.ai.need) ? `<div class="ai"><h3>AI가 바꾸는 점</h3>${aiDl(j.ai)}<span>${src(j.ai.source)}</span></div>` : ""}
        ${j.pay || j.outlook ? `<div class="stats">${[["신입 임금", j.pay], ["전망", j.outlook]].filter((x) => x[1]).map(([l, v]) => `<div class="stat"><small>${l}</small><span>${esc(v.value)}</span><small>${esc(v.basis)}${src(v.source)}</small></div>`).join("")}</div>` : ""}
        ${j.facts?.length ? `<div><h3>채용 숫자</h3><ul class="jfacts">${j.facts.map((f) => `<li>${esc(f.text)}${src(f.source, f.date)}</li>`).join("")}</ul></div>` : ""}
        ${j.tips?.length ? `<div><h3>합격자·현직자가 말하는 준비법</h3><ol>${list(j.tips)}</ol>${src((j.tipSources || []).join(", "))}</div>` : ""}
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

// AI와 취업: ai.js의 글 + 직무 사전의 직무별 AI 변화 카드
function drawAi() {
  const A = D.aiInfo;
  if (!A) return;
  const rows = (list) => `<div class="rows">${list.map((r) => `<div><b>${esc(r.k)}</b><p>${esc(r.t)}${src(r.source)}</p></div>`).join("")}</div>`;
  const jobsAi = (D.jobs || []).filter((j) => j.ai && (j.ai.now || j.ai.change || j.ai.need));
  const nav = [...A.parts, ...jobsAi.length ? [{ id: "ai-jobs", nav: "직무별 변화" }] : []];
  const part = (p) => `<section id="${p.id}">
      <div class="eb">${esc(p.eb)}</div>
      <h2>${esc(p.title)}</h2>
      ${p.lead ? `<p class="lead">${esc(p.lead)}</p>` : ""}
      ${p.rows ? rows(p.rows) : ""}
      ${p.cards ? `<div class="cards">${p.cards.map((c) => `<div class="card"><small>${esc(c.tag)}</small><h3>${esc(c.title)}</h3><p>${esc(c.t)}${src(c.source)}</p></div>`).join("")}</div>` : ""}
      ${p.note ? `<p class="verdict${p.warn ? " warn" : ""}">${esc(p.note)}</p>` : ""}
    </section>`;
  $("v-ai").innerHTML = `
    <section>
      <h1 tabindex="-1">AI와 취업</h1>
      <p class="lead">${esc(A.lead)}</p>
      <nav class="onpage" aria-label="이 화면">${nav.map((p) => `<a class="chip" href="#${p.id}">${esc(p.nav)}</a>`).join("")}</nav>
      <div class="stats">${A.stats.map(statCard).join("")}</div>
    </section>
    ${A.parts.map(part).join("")}
    ${jobsAi.length ? `<section id="ai-jobs">
      <div class="eb">직무별</div>
      <h2>직무마다 AI가 바꾸는 일</h2>
      <p class="lead">현장에서 AI를 어떻게 쓰는지, 그래서 신입이 무엇을 갖추면 좋은지예요.</p>
      <ul class="aicards">${jobsAi.map((j) => `<li><details class="jd" id="ai-${j.key}">
        <summary class="jd-head">${aIcon(j)}<span class="jd-title"><b>${esc(j.name)}</b></span></summary>
        <div class="body"><div class="ai">${aiDl(j.ai)}<span>${src(j.ai.source)}</span></div><a class="dict" href="#jobs-${j.key}">직무 사전</a></div>
      </details></li>`).join("")}</ul>
    </section>` : ""}`;
}

// 본문 자료 출처(학과·직무·FAQ·진단·AI 데이터). 첫 화면 '자료 출처 N개'와 만든 방법 목록이 이 함수 하나를 쓴다. 검사 설계 참고 문헌(M.refs)·라이선스는 빼요(C3)
const srcList = () => [...new Set([
  ...D.depts.flatMap((d) => [...(d.cases || []), ...(d.trends || []), ...(d.stats || []), ...(d.refStats || []), ...(d.certs || [])].map((x) => x.source).concat(d.sources || [])),
  ...(D.jobs || []).flatMap((j) => [j.source, j.onet, j.openSource, j.pay?.source, j.outlook?.source, j.ai?.source, ...(j.tipSources || []), ...(j.facts || []).map((f) => f.source)]),
  ...(D.faq || []).map((f) => f.source),
  ...(D.diag || []).map((r) => r.evidence?.source),
  ...((D.aiInfo || {}).stats || []).map((s) => s.source),
  ...((D.aiInfo || {}).parts || []).flatMap((p) => [...(p.rows || []), ...(p.cards || [])].map((r) => r.source)),
  ...Object.values(D.fieldRate).flat().map((r) => r.source),
  ...(D.seasons || []).map((s) => s.source),
  D.ssu.rate.source
].flatMap(urls).filter((u) => /^https?:/.test(u)))];

// 만든 방법: 검사 설계 근거, 자료 원칙, 한계, 출처 전체
function drawAbout() {
  const M = D.method, list = srcList();
  document.querySelectorAll("[data-srccount]").forEach((el) => el.textContent = list.length);
  const short = (u) => { let t = u; try { t = decodeURI(u); } catch {} return t.length > 90 ? t.slice(0, 90) + "…" : t; };
  $("v-about").innerHTML = `
    <section>
      <h1 tabindex="-1">만든 방법</h1>
      <p class="lead">무엇을 재고 무엇을 못 재는지 숨기지 않으려고 적어 둬요.</p>
      <ol class="method">${M.rows.map((r) => `<li><b>${esc(r.k)}</b><p>${esc(r.t)}</p></li>`).join("")}</ol>
      <p class="verdict warn">${esc(M.limit)}</p>
    </section>
    ${(D.updates || []).length ? `<section>
      <h2>바뀐 것</h2>
      <ul class="trends">${[...D.updates].sort((a, b) => b.date.localeCompare(a.date)).map((u) => `<li><span class="num">${esc(u.date.slice(0, 7))}</span><p>${esc(u.text)}</p></li>`).join("")}</ul>
    </section>` : ""}
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

// 첫 화면 소식 한 칸(결정 17): 최근 바뀐 것이 120일 안이면 그 글, 아니면 이번 달 시기 한 줄, 둘 다 없으면 ''
function newsLine(now = new Date()) {
  const u = [...(D.updates || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (u && (now - new Date(u.date)) / 864e5 <= 120) return esc(u.text);
  const s = (D.seasons || []).find((x) => x.months.includes(now.getMonth() + 1));
  return s ? esc(s.text) + src(s.source, s.date) : "";
}

const VIEWS = ["test", "map", "jobs", "ai", "faq", "about"];
const OFF = () => matchMedia("(max-width:1199px)").matches ? 68 : 24; // 1199 이하 sticky 탭 56 + 12
const jump = (el) => el && scrollTo({ top: el.getBoundingClientRect().top + scrollY - OFF(), behavior: "instant" });
let shown = ""; // 직전에 보인 화면(첫 로드엔 페이드 없음)
function route() {
  const h = location.hash.slice(1) || "test";
  // 화면 = 해시의 '-' 앞(#map-cases → map). 모르는 해시는 검사 화면이에요
  const v = h.split("-")[0], view = /^[rs]=/.test(h) ? "test" : VIEWS.includes(v) ? v : "test";
  VIEWS.forEach((x) => $("v-" + x).hidden = x !== view);
  const tab = $("tabs").querySelector(`a[href="#${view}"]`);
  $("tabs").querySelectorAll("a").forEach((a) => { a.classList.toggle("on", a === tab); a === tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
  document.body.dataset.view = view;
  document.title = view === "test" ? "학과 진로 지도" : `${tab.textContent} · 학과 진로 지도`;
  if (matchMedia("(max-width:1199px)").matches) tab.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
  // 학과 주소: #map-<id>는 숭실대(47개·none), #map-etc-<id>는 다른 학교(전공 8개·none). 없는 id면 학교·학과를 그대로 두고 맨 위로 가요(C18)
  const m = view === "map" && h.match(/^map-(etc-)?(\w+)$/);
  const d = m && D.depts.find((x) => x.id === m[2] && (!m[1] || x.promptName));
  const hit = !!(d || (m && m[2] === "none"));
  if (hit) {
    Object.assign(st, { school: m[1] ? "etc" : "ssu", dept: m[2] });
    if (d) st.college = d.college;
    picked = true; drawPick(); render();
  }
  // 학과를 고른 뒤 다시 오거나 학과 주소로 들어오면 고르기 줄을 한 줄로 접어요(Q30)
  if (view === "map" && (hit || shown !== "map")) foldPick(picked);
  let to = null;
  if (h.startsWith("r=")) showShared(h.slice(2));
  else if (h.startsWith("s=")) { if (typeof showFriend === "function") showFriend(h.slice(2)); }
  else {
    // 화면 안 위치(#jobs-키, #ai-want …). 없는 id면 맨 위로 가요
    if (h.startsWith("jobs-") && !$("job-" + h.slice(5))) { st.jobArea = ""; drawJobs(); }
    if (h !== view) to = $(h.startsWith("jobs-") ? "job-" + h.slice(5) : h);
    if (to?.tagName === "DETAILS") to.open = true;
    if (!to) scrollTo({ top: 0, behavior: "instant" });
    // 목차·탭으로 화면을 바꾸면 그 화면 제목으로 포커스를 옮겨 보조기기가 알게 해요
    if (shown && shown !== view && !to) (view === "test" ? document.querySelector(".hero h1") : $("v-" + view).querySelector("h1"))?.focus({ preventScroll: true });
  }
  jump(to);
  // 첫 로드엔 브라우저가 같은 id(#ai-키)로 맨 위에 붙여 스크롤하므로 load 뒤 다시 맞춘다
  if (to && document.readyState !== "complete") addEventListener("load", () => jump(to), { once: true });
  // 위치를 잰 뒤에 건다. transform이 도는 동안엔 스크롤 앵커링이 꺼져서, 그새 글꼴이 늦게 와 줄이 바뀌면 끝난 뒤 다시 맞춘다
  if (shown && shown !== view && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const a = $("v-" + view).animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "cubic-bezier(.2,0,0,1)" });
    if (to) a.finished.then(() => location.hash === "#" + h && jump(to));
  }
  shown = view;
}

document.querySelectorAll(".checked").forEach((el) => el.textContent = D.checked);
document.querySelectorAll(".jobcount").forEach((el) => el.textContent = D.jobs.length);
drawPick(); render(); drawJobs(); drawFaq(); drawAi(); drawAbout();
// index.html이 소식 글을 미리 담고 있어도, 120일이 지나 숨어도 같게 그려요
const news = newsLine();
$("news").innerHTML = news || "학과 진로 지도";
$("news").classList.toggle("news", !!news);
addEventListener("hashchange", route);
// 건너뛰기: 주소를 #main으로 바꾸지 않고 본문으로 포커스만 옮겨요(Q37)
document.querySelector(".skip").onclick = (e) => { e.preventDefault(); $("main").focus(); };
// 가로로 넘치는 줄(목차·칩·바로가기)에서 Tab으로 간 곳이 화면 밖에 남지 않게 해요(Q24)
document.addEventListener("focusin", (e) => e.target.closest("#tabs, .chips, .onpage") && e.target.scrollIntoView({ block: "nearest", inline: "nearest" }));
