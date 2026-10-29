// 질문지 답(a)에 따른 진단 규칙. 근거는 2024년 이후 조사만 쓴다. '참고'는 민간 집계라는 뜻이다.
(function () {
  // 답은 1(가장 낮음: 없다·싫다·못한다)~7(가장 높음). 3 이하는 낮은 쪽, 6 이상은 높은 쪽으로 본다.
  const lo = (v) => v <= 3, hi = (v) => v >= 6;
  const say = (a, id) => `${window.JOBMAP.quiz.say(id, a[id])} 골랐어요.`;
  const EXP = ["intern", "outside", "contest", "club", "parttime", "relexp"];
  const noExp = (a) => EXP.every((id) => lo(a[id]));
  const mindLow = (a) => window.JOBMAP.quiz.groups.find((g) => g.id === "mind").items.filter((it) => a[it.id] <= 2).length;

  window.JOBMAP.diag = [
    {
      id: "mind-care",
      when: (a) => mindLow(a) >= 5,
      title: "준비보다 마음을 먼저 챙겨요",
      why: (a) => `마음·생활 문항 ${mindLow(a)}개에 가장 낮은 두 칸 중 하나로 답했어요.`,
      steps: [
        { text: "학생상담센터에서 이야기 나눠 보기", url: COUNSEL },
        { text: "진로취업센터에서 진로 상담 받기", url: JOB }
      ]
    },
    {
      id: "exp-first",
      when: (a) => a.yearN >= 3 && noExp(a),
      title: "직무 경험부터 하나 만들어요",
      why: (a) => `${a.yearN}학년인데 경험 문항 6개에 모두 '적다' 이하로 답했어요.`,
      evidence: { text: "기업 67.6%가 신입 평가에서 '직무 관련 업무 경험'을 가장 중요하게 봐요(경총 2026, 100인 이상 기업 500곳).", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "현장실습학기제 기업 목록 보기", url: WESS },
        { text: "미래내일 일경험(인턴형·프로젝트형) 찾아보기", url: YW },
        { text: "진로취업센터에서 경험 계획 상담받기", url: JOB }
      ]
    },
    {
      id: "exp-start",
      when: (a) => a.yearN <= 2 && noExp(a),
      title: "작은 경험부터 쌓아 두어요",
      why: (a) => `${a.yearN}학년이고 경험 문항 6개에 모두 '적다' 이하로 답했어요. 지금 시작하면 충분해요.`,
      evidence: { text: "기업 85.4%가 지원자의 일경험이 입사 후 적응에 도움이 됐다고 답했어요(고용노동부 2025, 500대 기업 396곳).", source: "https://www.nocutnews.co.kr/news/6429973" },
      steps: [
        { text: "슈패스에서 직무 비교과 하나 신청하기", url: PATH },
        { text: "진로취업센터 진로 상담 받기", url: JOB }
      ]
    },
    {
      id: "exp-reframe",
      when: (a) => !noExp(a) && lo(a.story),
      title: "해 본 경험을 직무 언어로 다시 정리해요",
      why: (a) => `경험은 있는데 ${say(a, "story")}`,
      evidence: { text: "기업이 일경험을 볼 때 기준은 '채용 직무와의 관련성'이 84.0%였어요(고용노동부 2025).", source: "https://www.nocutnews.co.kr/news/6429973" },
      steps: [
        { text: "진로취업센터 자소서 클리닉 신청하기", url: JOB },
        { text: "인턴·일경험 FAQ 보기", url: "#faq" }
      ]
    },
    {
      id: "goal-narrow",
      when: (a) => lo(a.know) || lo(a.jobknow),
      title: "직무 후보를 두세 개로 좁혀요",
      why: (a) => say(a, lo(a.know) ? "know" : "jobknow"),
      evidence: { text: "기업 72.2%가 올해 가장 큰 변화로 '직무 중심 채용 강화'를 꼽았어요(경총 2026).", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "진로취업센터에서 진로 상담 받기", url: JOB },
        { text: "슈패스에서 직무를 알아보는 비교과 듣기", url: PATH },
        { text: "많이 묻는 질문 먼저 읽어 보기", url: "#faq" }
      ]
    },
    {
      id: "lang-speaking",
      when: (a) => lo(a.lang) && (hi(a.big) || hi(a.foreign)),
      title: "어학은 말하기 시험으로 준비해요",
      why: (a) => `${say(a, "lang")} ${say(a, hi(a.big) ? "big" : "foreign")}`,
      evidence: { text: "2026 상반기 10대 그룹 중 8곳이 어학 점수를 요구했고, 이력서 말하기 시험 등록이 52.1%로 토익을 앞섰어요(캐치·한국경제 2026).", source: "https://www.hankyung.com/article/2026061237421" },
      steps: [
        { text: "어학 점수 FAQ 보기", url: "#faq" },
        { text: "해외영업·무역 직무 준비법 보기", url: "#jobs-trade" }
      ]
    },
    {
      id: "public-ncs",
      when: (a) => hi(a.public),
      title: "목표 기관을 정하고 NCS를 준비해요",
      why: (a) => say(a, "public"),
      evidence: { text: "2026년 공공기관 정규직 채용 계획은 약 2만8천 명으로 2020년 이후 최대예요(재정경제부 2026-01).", source: "https://www.fnnews.com/news/202601271000407972" },
      steps: [
        { text: "공기업 사무직 직무 사전에서 NCS 개편(2026-04) 보기", url: "#jobs-ncs" },
        { text: "미래내일 일경험으로 공공 분야 경험 찾기", url: YW },
        { text: "진로취업센터 채용설명회 챙기기", url: JOB }
      ]
    },
    {
      id: "civil-exam",
      when: (a) => hi(a.gov),
      title: "9급 경쟁률과 바뀐 과목을 먼저 확인해요",
      why: (a) => say(a, "gov"),
      evidence: { text: "2026 국가직 9급은 3,802명 선발에 108,718명이 지원해 28.6:1이었어요(인사혁신처 2026-02).", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=" },
      steps: [
        { text: "직무 사전에서 2027년 한국사 과목 변경 보기", url: "#jobs-civil" },
        { text: "공기업 NCS와 함께 준비할지 보기", url: "#jobs-ncs" }
      ]
    },
    {
      id: "major-worry",
      when: (a) => lo(a.majorBelief),
      title: "전공과 다른 직무로 간 사례가 많아요",
      why: (a) => say(a, "majorBelief"),
      evidence: { text: "대기업·중견 비개발 직군(마케팅·기획 등) 합격자의 35%는 비전공자였어요(제로베이스 2025 집계, 참고).", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "많이 묻는 질문에서 전공 영향 보기", url: "#faq" },
        { text: "진로취업센터에서 직무 전환 상담받기", url: JOB }
      ]
    },
    {
      id: "data-cert",
      when: (a) => a.fit.data >= 67 || a.dept === "math",
      title: "데이터 자격증에 실무 경험을 더해요",
      why: (a) => a.dept === "math" ? "수학과라 데이터 직무가 가까운 길이에요." : `데이터 분석 직무와 맞는 정도가 ${a.fit.data}점이에요.`,
      evidence: { text: "한전은 2025 상반기 공채에서 ADsP·SQLD에 서류 최대 5점을 줬어요. 필기 위주라 실무와 거리가 있다는 비판도 함께 나왔어요(한국경제 2025-07).", source: "https://www.hankyung.com/article/2025071873407" },
      steps: [
        { text: "데이터 분석 직무 사전 보기", url: "#jobs-data" },
        { text: "현장실습학기제에서 데이터 실습 기업 찾기", url: WESS }
      ]
    },
    {
      id: "dev-market",
      when: (a) => a.dept === "aisw",
      title: "코딩테스트와 프로젝트 설명을 준비해요",
      why: "AI소프트웨어학부라 개발 직무 시장을 먼저 알아 두면 좋아요.",
      evidence: { text: "2025 상반기 개발자 공고 중 신입 대상은 0.8%인데 지원자는 29.5%가 신입이었어요(사람인·점핏, 공고 10만여 건).", source: "https://economist.co.kr/article/view/ecn202508270040" },
      steps: [
        { text: "현장실습학기제로 인턴 경험 만들기", url: WESS },
        { text: "IT 기획·PM 같은 비개발 길도 보기", url: "#jobs-itpm" },
        { text: "진로취업센터 면접 클리닉 신청하기", url: JOB }
      ]
    },
    {
      id: "gpa-low",
      when: (a) => lo(a.gpa),
      title: "학점은 기준선, 경험으로 보완해요",
      why: (a) => say(a, "gpa"),
      evidence: { text: "대기업·중견 합격자 평균 학점은 3.9였어요(제로베이스 2025 집계, 참고). 학점의 영향을 직접 잰 2024년 이후 공식 조사는 없어요.", source: "https://www.hankyung.com/article/2026031266707" },
      steps: [
        { text: "남은 학기 전공 성적 올릴 계획 세우기", url: null },
        { text: "블라인드 채용인 공기업 직무 보기", url: "#jobs-ncs" }
      ]
    },
    {
      id: "senior-passive",
      when: (a) => a.yearN >= 4 && lo(a.know),
      title: "졸업 학년, 지금 한 곳이라도 지원해 봐요",
      why: (a) => `4학년 이상인데 ${say(a, "know")}`,
      evidence: { text: "졸업 예정자의 60.5%가 소극적으로 구직 중이고, 이유 1위는 '역량 보완 필요'(37.5%)였어요(한경협 2025, 2,492명).", source: "https://www.mt.co.kr/industry/2025/12/09/2025120910041034451" },
      steps: [
        { text: "진로취업센터 상담 받기(졸업 뒤에도 지원돼요)", url: JOB },
        { text: "미래내일 일경험으로 바로 시작하기", url: YW },
        { text: "많이 묻는 질문에서 준비 기간 보기", url: "#faq" }
      ]
    },
    {
      id: "big-only",
      when: (a) => hi(a.big) && ["mid", "public", "gov", "foreign", "startup"].every((id) => a[id] <= 4),
      title: "중견기업·수시 공고도 함께 봐요",
      why: "대기업에만 '좋다' 이상으로 답하고, 다른 회사·기관은 모두 '보통이다' 이하로 답했어요.",
      evidence: { text: "2026년 하반기 채용계획을 세운 500대 기업은 51.2%였어요. 나머지는 계획이 없거나 미정이에요(한경협 2026-09, 121곳 응답).", source: "https://biz.sbs.co.kr/amp/article/20000337127" },
      steps: [
        { text: "공채·수시 FAQ 보기", url: "#faq" },
        { text: "진로취업센터 채용 공고 챙기기", url: JOB }
      ]
    }
  ];
})();
