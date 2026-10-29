// 질문지 답(a)에 따른 진단 규칙. 근거는 2024년 이후 조사만 쓴다. '참고'는 민간 집계라는 뜻이다.
// a: 문항 id별 답(1~5), yearN, dept, sector(배열), ready(영역 평균 1~5), fit(직무 key별 흥미 겹침 0~100), top(흥미 겹침 상위 직무 key 3개)
(function () {
  // 5단계 답에서 2 이하(아니다·싫다)는 낮은 쪽. 영역 평균은 2.0 이하를 낮은 쪽으로 본다.
  const Q = window.JOBMAP.quiz;
  const say = (a, id) => {
    const it = [...Q.interest.items, ...Q.readyItems].find((x) => x.id === id), t = Q.scaleOf(id)[a[id] - 1];
    return `'${it.q}'에 '${t}'${(t.charCodeAt(t.length - 1) - 0xAC00) % 28 ? "을" : "를"} 골랐어요.`;
  };
  const avg = (a, g) => `${Q.ready.groups.find((x) => x.id === g).name} 4문항 평균이 5점 중 ${a.ready[g].toFixed(1)}점이에요.`;
  const has = (a, v) => a.sector.includes(v);

  window.JOBMAP.diag = [
    {
      id: "mind-care",
      when: (a) => a.m4 <= 2 || a.ready.mind <= 2,
      title: "진로가 많이 부담될 땐 상담이 도움이 돼요",
      why: (a) => a.m4 <= 2 ? say(a, "m4") : avg(a, "mind"),
      steps: [
        { text: "학생상담센터에서 이야기 나눠 보기", url: COUNSEL },
        { text: "진로취업센터에서 진로 상담 받기", url: JOB },
        { text: "너무 힘들 땐 언제든 자살예방상담 109, 정신건강위기상담 1577-0199", url: null }
      ]
    },
    {
      id: "exp-first",
      when: (a) => a.yearN >= 3 && a.ready.exp <= 2,
      title: "직무 경험부터 하나 만들어요",
      why: (a) => `${a.yearN}학년이고 ${avg(a, "exp")}`,
      evidence: { text: "기업 67.6%가 신입 평가에서 '직무 관련 업무 경험'을 가장 중요하게 봐요(경총 2026, 100인 이상 기업 500곳).", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "현장실습학기제 기업 목록 보기", url: WESS },
        { text: "미래내일 일경험(인턴형·프로젝트형) 찾아보기", url: YW },
        { text: "진로취업센터에서 경험 계획 상담받기", url: JOB }
      ]
    },
    {
      id: "exp-start",
      when: (a) => a.yearN <= 2 && a.ready.exp <= 2,
      title: "작은 경험부터 쌓아 두어요",
      why: (a) => `${a.yearN}학년이고 ${avg(a, "exp")} 지금 시작하면 충분해요.`,
      evidence: { text: "기업 85.4%가 지원자의 일경험이 입사 후 적응에 도움이 됐다고 답했어요(고용노동부 2025, 500대 기업 396곳).", source: "https://www.nocutnews.co.kr/news/6429973" },
      steps: [
        { text: "슈패스에서 직무 비교과 하나 신청하기", url: PATH },
        { text: "진로취업센터 진로 상담 받기", url: JOB }
      ]
    },
    {
      id: "exp-reframe",
      when: (a) => a.ready.exp > 2 && a.x3 <= 2,
      title: "해 본 경험을 직무 언어로 다시 정리해요",
      why: (a) => `경험은 있는데 ${say(a, "x3")}`,
      evidence: { text: "기업이 일경험을 볼 때 기준은 '채용 직무와의 관련성'이 84.0%였어요(고용노동부 2025).", source: "https://www.nocutnews.co.kr/news/6429973" },
      steps: [
        { text: "진로취업센터 자소서 클리닉 신청하기", url: JOB },
        { text: "인턴·일경험 FAQ 보기", url: "#faq" }
      ]
    },
    {
      id: "goal-explore",
      when: (a) => a.yearN <= 2 && (a.ready.plan <= 2 || a.n1 <= 2),
      title: "지금은 넓게 둘러볼 때예요",
      why: (a) => `${a.yearN}학년이고 ${a.ready.plan <= 2 ? avg(a, "plan") : say(a, "n1")} 1~2학년에 방향이 없는 건 흔한 일이에요.`,
      steps: [
        { text: "흥미가 겹친 직무 3개를 직무 사전에서 읽어 보기", url: "#jobs" },
        { text: "내 학과 졸업생이 간 길 보기", url: "#map" },
        { text: "진로취업센터에서 진로 상담 한 번 받기", url: JOB }
      ]
    },
    {
      id: "goal-narrow",
      when: (a) => a.yearN >= 3 && (a.ready.plan <= 2 || a.n1 <= 2),
      title: "직무 후보를 두세 개로 좁혀요",
      why: (a) => a.ready.plan <= 2 ? avg(a, "plan") : say(a, "n1"),
      evidence: { text: "기업 72.2%가 올해 가장 큰 변화로 '직무 중심 채용 강화'를 꼽았어요(경총 2026).", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "진로취업센터에서 진로 상담 받기", url: JOB },
        { text: "슈패스에서 직무를 알아보는 비교과 듣기", url: PATH },
        { text: "많이 묻는 질문 먼저 읽어 보기", url: "#faq" }
      ]
    },
    {
      id: "lang-speaking",
      when: (a) => has(a, "big") || has(a, "foreign"),
      title: "대기업·외국계라면 어학 말하기 시험도 알아 둬요",
      why: (a) => `끌리는 곳으로 ${has(a, "big") ? "대기업" : "외국계·해외"}을 골랐어요.`,
      evidence: { text: "2026 상반기 10대 그룹 중 8곳이 어학 점수를 요구했고, 이력서 말하기 시험 등록이 52.1%로 토익을 앞섰어요(캐치·한국경제 2026). 그룹·직군마다 기준이 달라 지원할 곳 공고를 먼저 보세요.", source: "https://www.hankyung.com/article/2026061237421" },
      steps: [
        { text: "어학 점수 FAQ 보기", url: "#faq" },
        { text: "해외영업·무역 직무 준비법 보기", url: "#jobs-trade" }
      ]
    },
    {
      id: "public-ncs",
      when: (a) => has(a, "public"),
      title: "목표 기관을 정하고 NCS를 준비해요",
      why: "끌리는 곳으로 공기업·공공기관을 골랐어요.",
      evidence: { text: "2026년 공공기관 정규직 채용 계획은 약 2만8천 명으로 2020년 이후 최대예요(재정경제부 2026-01).", source: "https://www.fnnews.com/news/202601271000407972" },
      steps: [
        { text: "공기업 사무직 직무 사전에서 NCS 개편(2026-04) 보기", url: "#jobs-ncs" },
        { text: "미래내일 일경험으로 공공 분야 경험 찾기", url: YW },
        { text: "진로취업센터 채용설명회 챙기기", url: JOB }
      ]
    },
    {
      id: "civil-exam",
      when: (a) => has(a, "gov"),
      title: "9급 경쟁률과 바뀐 과목을 먼저 확인해요",
      why: "끌리는 곳으로 공무원을 골랐어요.",
      evidence: { text: "2026 국가직 9급은 3,802명 선발에 108,718명이 지원해 28.6:1이었어요(인사혁신처 2026-02).", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=" },
      steps: [
        { text: "직무 사전에서 2027년 한국사 과목 변경 보기", url: "#jobs-civil" },
        { text: "공기업 NCS와 함께 준비할지 보기", url: "#jobs-ncs" }
      ]
    },
    {
      id: "data-cert",
      when: (a) => a.top.includes("data") || (a.dept === "math" && a.fit.data >= a.fitMean),
      title: "데이터 자격증에 실무 경험을 더해요",
      why: (a) => a.top.includes("data") ? `데이터 분석이 흥미가 많이 겹치는 직무 3위 안에 있어요(${a.fit.data}점).` : "수학과 졸업생이 많이 가는 데이터 직무와 흥미도 평균 이상 겹쳐요.",
      evidence: { text: "한전은 2025 상반기 공채에서 ADsP·SQLD에 서류 최대 5점을 줬어요. 필기 위주라 실무와 거리가 있다는 비판도 함께 나왔어요(한국경제 2025-07).", source: "https://www.hankyung.com/article/2025071873407" },
      steps: [
        { text: "데이터 분석 직무 사전 보기", url: "#jobs-data" },
        { text: "현장실습학기제에서 데이터 실습 기업 찾기", url: WESS }
      ]
    },
    {
      id: "dev-market",
      when: (a) => a.dept === "aisw" || a.top.includes("sw"),
      title: "코딩테스트와 프로젝트 설명을 준비해요",
      why: (a) => a.top.includes("sw") ? "소프트웨어 개발이 흥미가 많이 겹치는 직무 3위 안에 있어요." : "AI소프트웨어학부 졸업생이 많이 가는 개발 직무의 요즘 시장이에요. 개발이 아니어도 알아 두면 좋아요.",
      evidence: { text: "2025 상반기 개발자 공고 중 신입만 뽑는 공고는 0.8%인데 지원자는 29.5%가 신입이었어요(사람인·점핏, 공고 10만여 건). 신입·경력을 함께 뽑는 공고는 따로 셌어요.", source: "https://economist.co.kr/article/view/ecn202508270040" },
      steps: [
        { text: "현장실습학기제로 인턴 경험 만들기", url: WESS },
        { text: "IT 기획·PM 같은 비개발 길도 보기", url: "#jobs-itpm" },
        { text: "진로취업센터 면접 클리닉 신청하기", url: JOB }
      ]
    },
    {
      id: "senior-passive",
      when: (a) => a.yearN >= 4 && a.ready.plan <= 2,
      title: "졸업 학년, 지금 한 곳이라도 지원해 봐요",
      why: (a) => `4학년 이상이고 ${avg(a, "plan")}`,
      evidence: { text: "졸업 예정자의 60.5%가 소극적으로 구직 중이고, 이유 1위는 '역량 보완 필요'(37.5%)였어요(한경협 2025, 2,492명).", source: "https://www.mt.co.kr/industry/2025/12/09/2025120910041034451" },
      steps: [
        { text: "진로취업센터 상담 받기(졸업 뒤에도 지원돼요)", url: JOB },
        { text: "미래내일 일경험으로 바로 시작하기", url: YW },
        { text: "많이 묻는 질문에서 준비 기간 보기", url: "#faq" }
      ]
    },
    {
      id: "big-only",
      when: (a) => a.sector.length === 1 && has(a, "big"),
      title: "중견기업·수시 공고도 함께 봐요",
      why: "끌리는 곳으로 대기업 하나만 골랐어요.",
      evidence: { text: "2026년 하반기 채용계획을 세운 500대 기업은 51.2%였어요. 나머지는 계획이 없거나 미정이에요(한경협 2026-09, 121곳 응답).", source: "https://biz.sbs.co.kr/amp/article/20000337127" },
      steps: [
        { text: "공채·수시 FAQ 보기", url: "#faq" },
        { text: "진로취업센터 채용 공고 챙기기", url: JOB }
      ]
    },
    {
      id: "ai-start",
      when: (a) => a.ready.ai <= 2.5,
      title: "AI는 '확인하며 쓰기'부터 익혀요",
      why: (a) => avg(a, "ai"),
      evidence: { text: "채용 공고 약 2/3가 AI를 언급해요(원티드 2026, 공고 72,793건). 다만 인사담당자가 꼽은 인재상 1위는 직무 전문 역량(64.7%)이고 AI·데이터 역량은 4위(24.2%)였어요.", source: "https://www.wanted.co.kr/events/article_260810, https://ditoday.com/?p=137689" },
      steps: [
        { text: "AI와 취업에서 조심할 점 먼저 읽기", url: "#ai-care" },
        { text: "이번 학기 과제 하나를 규칙 안에서 AI로 정리해 보기", url: null },
        { text: "AI를 배우는 길 보기", url: "#ai-learn" }
      ]
    },
    {
      id: "ai-show",
      when: (a) => a.ready.ai >= 4,
      title: "AI 활용을 결과물로 보여 줘요",
      why: (a) => `${avg(a, "ai")} AI를 잘 다루는 편이에요.`,
      evidence: { text: "SK하이닉스는 자소서 항목을 없애고 AI 활용 역량 문항을 넣었어요(2026). 한편 AI 채용을 도입한 대기업·공기업 10곳을 물었더니 8곳이 AI로 쓴 자소서를 정도에 따라 감점한다고 했어요(2025, 조사 대상이 적어요). 진짜 위험은 면접에서 내 글을 설명하지 못하는 거예요.", source: "https://hankyung.com/article/202609291285i, https://v.daum.net/v/K8dILeYctq" },
      steps: [
        { text: "AI로 만든 작은 결과물에 '어디에 AI를 썼고 무엇을 직접 했는지' 적어 두기", url: null },
        { text: "직무별로 AI가 바꾸는 일 보기", url: "#ai-jobs" }
      ]
    },
    {
      id: "grad",
      when: (a) => a.sector.includes("grad"),
      title: "대학원은 연구실부터 알아봐요",
      why: "끌리는 곳으로 대학원·연구를 골랐어요.",
      steps: [
        { text: "연구개발 직무 사전 보기", url: "#jobs-rnd" },
        { text: "관심 교수님 연구실 홈페이지와 학부 연구생 모집 찾아보기", url: null },
        { text: "진로취업센터에서 진학 상담 받기", url: JOB }
      ]
    }
  ];
})();
