// 직무 사전(처음 12개 + 2026-10-30 학과 맞춤 5개 + 같은 날 흥미 영역 보충 7개 + 4차 A3 4개). 근거: research_notes 직무사전·취업QA·비정형_공학직무 (2024년 이후 자료).
// does·tasks·skills는 기존 직무 사전(커리어넷·고용24 직업정보)에서 그대로 옮겼다.
// pay: 워크피디아 임금분포 현황(2025년 6월 기준) 대졸 이상·경력 1년 미만 가운데 값, 공무원은 9급 초임 보수. 맞는 분류가 없는 직무는 null.
// open은 합격 사례 한 줄, openSource는 그 원문이에요(4차 A6).
(function () {
  const LKP = "https://community.linkareer.com/pass-review/";
  const OUTLOOK = "https://m.seoul.co.kr/news/2026/05/18/20260518500141";
  const OUTLOOK_BASIS = "고용노동부·한국고용정보원 「2025~2035 정성적 일자리 전망」(2026-05)";
  const KEIS = "https://eiec.kdi.re.kr/policy/materialView.do?num=281217";
  const CL = (id) => `https://linkareer.com/cover-letter/${id}`;
  const STEM = (id) => `https://community.linkareer.com/STEM_mentoring/${id}`;
  const CM = "https://comento.kr/job-questions/";
  const W24 = (cd) => `https://www.wagework.go.kr/pt/b/a/retrieveOccpNvgtDtal.do?konetOccpCd=${cd}`; // 고용24 직업정보
  const W24_BASIS = "고용24 직업정보 재직자 전망 조사(2025, 직업당 약 30명)";
  // 워크피디아 「'25년 6월 기준 사업체 특성별 임금분포 현황」(2026-06-29 공표) ④ 직업소분류×경력×학력의 대졸 이상·1년 미만 중위값(만 원).
  // 조건(2022~2024년 조사를 2025년 6월 수준으로 보정, 초과급여 제외)은 ai.js 만든 방법에 한 줄로 적었다.
  const WAGE = "https://www.wagework.go.kr/pt/z/a/retrieveBoardDtal.do?bbsId=BBSMSTR_000000000001&ntceStno=2562";
  const PAY = (won, cls) => ({ value: `연 ${won}만 원`, basis: `대졸 이상·일한 지 1년 미만의 가운데 값. 통계 분류 '${cls}', 고용노동부(2025년 6월 기준)`, source: WAGE });

  window.JOBMAP.jobs = [
    {
      key: "sales", name: "영업",
      does: "고객에게 제품과 서비스를 소개하고 판매해요.",
      tasks: ["방문·전화·이메일로 고객 만나기", "계약 조건 협의하고 계약 맺기", "결제 처리와 상품 인도"],
      skills: ["설득력", "의사소통", "고객 응대"],
      open: "영문과 졸업생이 B2B·제약 영업 여러 곳에 합격했어요(2025~2026).",
      openSource: LKP + "6566724",
      pay: PAY("3,783", "영업 종사자"),
      outlook: { value: "감소 요인에 '영업구조 재편' 포함", basis: OUTLOOK_BASIS + ", 영업 직업 개별 등급은 미공개", source: "https://eiec.kdi.re.kr/policy/materialView.do?num=281217" },
      tips: ["AI로 기업을 분석한 뒤 자소서를 써요", "실무자 면접 대비로 유튜브 직무 이야기를 익혀요", "깊게 파고드는 질문엔 솔직하게 답해요", "영어·영업 경험과 데이터 분석 역량을 함께 보여줘요"],
      tipSources: [LKP + "6566724", LKP + "5632500"],
      facts: [
        { text: "2025년 1~9월 대기업 신입 공고에서 무역·영업·판매 비중이 1.6%p 늘었어요(인크루트)", source: "https://magazine.hankyung.com/job-joy/article/202510273392d" }
      ],
      source: LKP + "6566724"
    },
    {
      key: "trade", name: "해외영업·무역",
      does: "해외 거래처와 수출입 계약을 맺고 통관 서류를 다뤄요.",
      tasks: ["통관 서류 준비와 세관 신고", "선적서류 정리와 무역 통계 작성", "수출입 계약서 작성"],
      skills: ["외국어(말하기·쓰기)", "문서작성", "무역 절차·L/C 지식"],
      open: "공학+상경 복수전공자가 글로벌영업 신입에 합격했어요(2026).",
      openSource: LKP + "6598674",
      pay: null,
      outlook: null,
      tips: ["희망 산업 관련 경험과 영어를 합격 요인으로 꼽아요", "인재상·합격 자소서로 원하는 인물상을 파악해요", "대기업 신입이 좁으면 중견·강소·외국계로 넓혀요", "정부 지원 해외영업 교육·공공기관 인턴으로 경험을 쌓아요"],
      tipSources: [LKP + "6598674", "https://community.linkareer.com/mentoring/5105660", "https://brunch.co.kr/@perilar/30"],
      facts: [
        { text: "2026 상반기 10대 그룹 중 8곳이 어학 점수를 필수로 요구했어요", source: "https://www.hankyung.com/article/2026061237421" }
      ],
      source: LKP + "6598674"
    },
    {
      key: "marketing", name: "마케팅",
      does: "기업과 제품을 알리는 홍보·마케팅 계획을 세우고 실행해요.",
      tasks: ["홍보 계획 세우기", "보도자료 작성과 배포", "홍보물·영상 제작"],
      skills: ["창의력", "듣고 이해하기", "글쓰기"],
      open: "미디어커뮤니케이션·수학과 출신이 마케팅 직무에 합격했어요(2025~2026).",
      openSource: "https://community.linkareer.com/final_review/6528513",
      pay: PAY("3,259", "상품 기획·홍보 및 조사 전문가"),
      outlook: { value: "광고·홍보 전문가 '다소 증가'", basis: OUTLOOK_BASIS + ", 마케팅과 가까운 직업", source: "https://www.youthdaily.co.kr/mobile/article.html?no=219305" },
      tips: ["데이터 분석·매체 운영 경험을 내세워요", "매체 선택·예산 근거 질문엔 숫자로 답해요", "포트폴리오 첫 장에 직무 경험을 둬요", "분기마다 성과를 기록하고 한 분야를 깊게 파요"],
      tipSources: ["https://community.linkareer.com/final_review/6528513", LKP + "5012755", "https://hyohyomkt.tistory.com/entry/퍼포먼스-마케터-신입-이야기-광고대행사-AE-14개월-차-후기"],
      facts: [
        { text: "광고회사 73곳의 2025년 신입 채용이 354명에서 445명으로 늘었어요", source: "https://www.brandbrief.co.kr/news/articleView.html?idxno=9805" }
      ],
      source: "https://community.linkareer.com/final_review/6528513"
    },
    {
      key: "hr", name: "인사(HR)",
      does: "채용·배치·급여·평가 같은 인사 업무를 기획하고 집행해요.",
      tasks: ["인력수급계획과 채용 전형 진행", "인사발령과 인사기록 관리", "인건비 예산 관리와 보고"],
      skills: ["인적자원 관리", "사람 파악", "꼼꼼함"],
      open: "심리학+경영 복수전공자가 HR 인턴 서류에 합격했어요(2026).",
      openSource: LKP + "6002253",
      pay: null,
      outlook: { value: "노무사 '다소 증가'(연 1.4%)", basis: OUTLOOK_BASIS + ", 인사와 가까운 참고 직업", source: OUTLOOK },
      tips: ["JD 요구 역량에 기존 인턴·활동을 연결해요", "안 해 본 업무는 비슷한 관리 경험으로 이어요", "이력서엔 직무 관련 경험을 앞에 둬요"],
      tipSources: [LKP + "6002253"],
      facts: [],
      source: LKP + "6002253"
    },
    {
      key: "finance", name: "재무·회계",
      does: "회사의 현금·채권·채무 변동을 기록하고 정리해요.",
      tasks: ["청구서·계산서 같은 경리서류 작성", "거래 기록 처리와 대조", "급여 계산과 연말정산"],
      skills: ["수리력", "전산 활용", "꼼꼼함"],
      open: "숭실대 경제학과 학생이 국제 FRM 자격증을 4개월 반 만에 딴 경험을 내세워 한국토지신탁 재무 인턴에 합격했어요(2025).",
      openSource: CL(36703),
      pay: PAY("3,121", "회계 및 경리 사무원"),
      outlook: { value: "회계사무원 '현상 유지'(연 0.2%)", basis: OUTLOOK_BASIS + ", 업무가 시스템 운영·프로세스 관리로 이동", source: OUTLOOK },
      tips: ["회사 최근 이슈를 재무 관점에서 분석해요", "수치 분석을 넘는 재무적 인사이트를 보여줘요", "영어 면접이 있을 수 있어요", "자격증이 많아도 탈락할 수 있어 직무 경험을 더해요"],
      tipSources: [LKP + "5785325", "https://community.linkareer.com/mentor-qna/6521040"],
      facts: [
        { text: "CPA 2026년 최종합격 1,150명, 합격률 26.3%", source: "https://www.fnnews.com/news/202609011459001662" },
        { text: "세무사 2025년 728명 합격, 합격률 10.48%", source: "https://taxtimes.co.kr/mobile/article.html?no=272366" }
      ],
      source: OUTLOOK
    },
    {
      key: "strategy", name: "경영기획·전략",
      does: "장·단기 경영계획과 전략을 세우고 경영 실적을 분석해요.",
      tasks: ["장·단기 경영계획 수립", "부서별 예산안 취합", "경영실적 분석과 사업계획 반영"],
      skills: ["판단과 의사결정", "읽고 이해하기", "꼼꼼함"],
      open: "인문 석사 출신이 전환형 인턴을 거쳐 전략기획 정규직이 됐어요(2026).",
      openSource: "https://community.linkareer.com/jayuu/6286281",
      pay: null,
      outlook: { value: "경영컨설턴트 '다소 증가'(연 1.4%)", basis: OUTLOOK_BASIS + ", 경영기획과 가까운 직업", source: OUTLOOK },
      tips: ["재무제표 3종이 어떻게 이어지는지 익혀요", "스펙은 최저선만, 나만의 이야기를 강조해요", "회계 공부를 비용 분석 역량으로 연결해요", "성과는 정량화하고 실행방안까지 써요"],
      tipSources: ["https://community.linkareer.com/jayuu/6286281", "https://biz.korea.ac.kr/cdc/board/review_view.html?no=59&key=&keyfield=&cate=&page=1", LKP + "6224907"],
      facts: [],
      source: "https://community.linkareer.com/jayuu/6286281"
    },
    {
      key: "scm", name: "구매·물류(SCM)",
      does: "물류센터를 운영하고 물류비를 줄이는 관리 업무를 해요.",
      tasks: ["물류 이동·보관 계획 세우기", "하역·포장·수송 등 물류 시스템 통합 관리", "기업 물류비 계산"],
      skills: ["수리력", "전산 활용", "서비스 지향"],
      open: "독어독문 전공자가 BMW코리아 구매 인턴에 합격했어요(2025).",
      openSource: LKP + "5593753",
      pay: null,
      outlook: null,
      tips: ["SCM 역량을 먼저 정하고 전공·실무로 증명해요", "영어는 기본, 외국어가 하나 더 있으면 유리해요", "회사마다 업무가 달라 공고부터 확인해요", "제조업 실습 경험이 도움이 돼요"],
      tipSources: [LKP + "5593753", LKP + "5694571", LKP + "5100311", "https://biz.korea.ac.kr/cdc/board/review_view.html?no=52&key=&keyfield=&cate=&page=1"],
      facts: [],
      source: LKP + "5593753"
    },
    {
      key: "cs", name: "고객 서비스·CS",
      does: "방문 고객과 상담 전화의 문의와 민원을 응대해요.",
      tasks: ["상품 신청·해지 등 청구서 접수", "서비스 요금과 이용 방법 안내", "상담 기록 작성과 관리"],
      skills: ["말하기", "설득", "서비스 지향"],
      open: "경영 전공자가 전공시험 없이 NCS만 보는 공기업 서비스직에 합격했어요(2026).",
      openSource: LKP + "6302642",
      pay: PAY("2,695", "고객 상담 및 기타 사무원"),
      outlook: { value: "안내·접수원 '다소 감소'(연 -1.1%)", basis: OUTLOOK_BASIS + ", 키오스크·AI 챗봇 대체 영향", source: OUTLOOK },
      tips: ["기관 유튜브·홍보영상으로 사업을 정리해요", "답은 1분 안팎, 다른 지원자 답도 경청해요", "서비스 개선점·갈등 경험 질문을 준비해요"],
      tipSources: [LKP + "6302642"],
      facts: [],
      source: LKP + "6302642"
    },
    {
      key: "itpm", name: "IT 기획·PM",
      does: "기업 정보시스템 구축을 자문하고 프로젝트를 관리해요.",
      tasks: ["기업 자료 수집과 분석", "프로젝트 전반 관리", "프로그래머와 고객 요구사항 조율"],
      skills: ["분석력", "프로젝트 관리", "고객 요구 조율"],
      open: "산업공학 전공자가 GPT API로 서비스를 설계해 본 경험으로 현대글로비스 IT기획 인턴에 합격했어요(2025).",
      openSource: CL(37074),
      pay: null,
      outlook: null,
      tips: [
        "제품을 이해하고 직접 만들어 본 경험을 내세워요",
        "주총 녹취록 같은 공개자료로 기업을 분석해요",
        "낸 자료는 면접관이 읽어 오니 완벽히 설명해요",
        "사이드 프로젝트·공모전으로 팀과 서비스를 만들어 봐요",
        "사전 과제엔 데이터 출처와 경쟁 서비스 비교를 넣어요"
      ],
      tipSources: [LKP + "6651635", "https://yozm.wishket.com/magazine/detail/2476"],
      facts: [
        { text: "2025년 대기업 IT·통신 정규직 신입 공고가 67% 줄었어요(899→293건)", source: "https://www.newsis.com/view/NISX20260123_0003488227" }
      ],
      source: LKP + "6651635"
    },
    {
      key: "data", name: "데이터 분석",
      does: "빅데이터에서 트렌드와 인사이트를 찾아 가치를 만들어요.",
      tasks: ["분석 목표에 맞는 방법 기획", "데이터 수집과 처리·분석", "분석 결과 시각화"],
      skills: ["논리적 분석", "읽고 이해하기", "수리력"],
      open: "현직자들은 전공·자격증보다 SQL·Python으로 직접 다뤄 본 경험을 본다고 해요(2026).",
      openSource: STEM(5762946),
      pay: PAY("3,757", "데이터 및 네트워크 관련 전문가"),
      outlook: { value: "데이터 기반 기획·분석 직무 '증가 방향'", basis: OUTLOOK_BASIS + ", 개별 수치는 없음", source: "https://eiec.kdi.re.kr/policy/materialView.do?num=281217" },
      tips: ["SQL·Python으로 직접 데이터를 다뤄요", "공공데이터·도메인 경험으로 분석 프로젝트 1~2개", "가고 싶은 공고 10개에서 공통 기술을 추려요", "데이터로 실제 개선한 경험 하나가 가장 중요해요", "신입은 체험형 인턴·중소기업부터도 시작해요"],
      tipSources: ["https://community.linkareer.com/STEM_mentoring/5762946", "https://community.linkareer.com/mentoring/5178317"],
      facts: [
        { text: "한전은 2025 상반기 공채에서 ADsP·SQLD에 서류 최대 5점을 줬어요", source: "https://www.hankyung.com/article/2025071873407" }
      ],
      source: "https://community.linkareer.com/STEM_mentoring/5762946"
    },
    {
      key: "ncs", name: "공기업 사무직(NCS)",
      does: "공공기관에서 사무 직무를 맡고, 채용은 NCS 직무 중심이에요.",
      tasks: null,
      skills: ["의사소통능력", "문제해결능력", "자원관리능력"],
      open: "블라인드 채용이라 전공 제한은 없지만, 기관마다 경영·경제·행정 전공시험이 붙기도 해요(2026).",
      openSource: "https://view.asiae.co.kr/article/2026012609034936469",
      pay: null,
      outlook: null,
      tips: ["공고부터 보고 모듈형·PSAT형·피듈형을 확인해요", "기본서 1회독 뒤 실전처럼 모의고사, 오답은 전부 복기해요", "목표 기관을 정해 그 기관 기출을 반복해요", "NCS는 약 3~6개월, 전형 전체는 6개월~1년을 잡아요"],
      tipSources: ["https://comento.kr/job-questions/%ED%95%9C%EA%B5%AD%EC%A3%BC%ED%83%9D%EA%B8%88%EC%9C%B5%EA%B3%B5%EC%82%AC/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/ncs_%EC%A4%80%EB%B9%84%EB%B2%95_%E3%85%9C-595255", "https://community.linkareer.com/public-mentor/5939403", "https://community.linkareer.com/public-mentor/6100521"],
      facts: [
        { text: "2026 공공기관 정규직 약 2만8천 명, 청년인턴 약 2만4천 명 계획", source: "https://view.asiae.co.kr/article/2026012609034936469" },
        { text: "2025 공공기관 신규채용 27,434명, 전년보다 7,040명 늘었어요(알리오)", source: "https://www.alio.go.kr/mobile/statistics/newRecruit.do" },
        { text: "NCS 직업기초능력이 '직업공통능력' 7개 영역·21개 하위능력으로 개편 발표됐어요(2026-04). 채용 필기 적용 시점은 기관별로 확인해요", source: "https://www.heraldk.com/article/2026042719000055376" },
        { text: "한수원 사무 필기는 NCS 50문항 + 행정·경제·경영 전공 30문항이었어요(2026)", source: LKP + "6343569" }
      ],
      source: "https://view.asiae.co.kr/article/2026012609034936469"
    },
    {
      key: "civil", name: "일반 공무원(행정직)",
      does: "법령에 따라 국가·지자체의 행정 업무를 계획하고 집행해요.",
      tasks: ["법령에 따라 맡은 업무 계획·시행", "보고서·문서 작성과 보고", "주민등록 등 서류 접수와 발급"],
      skills: ["법령·규정 이해", "문서작성", "민원 응대"],
      open: "9급 공채는 학력·전공 제한이 없고, 2026년 지원자 평균 나이는 30.9세예요.",
      openSource: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=",
      // 2027년 보수가 나오면 바꿔요(보통 12월 말 국무회의 뒤 발표).
      pay: { value: "연 3,428만 원", basis: "9급 1호봉 봉급+수당, 인사혁신처(2026년)", source: "https://www.korea.kr/news/policyNewsView.do?newsId=148957301" },
      outlook: { value: "일반행정공무원 '현상 유지'(연 0.2%)", basis: OUTLOOK_BASIS, source: OUTLOOK },
      tips: ["행정법·행정학은 기본→심화→문제풀이 후 3~4회 반복해요", "국어는 비문학 실전 문제를 주 2~3회 풀어요", "한국사는 기출 위주로 해요", "면접은 지원 지자체 정책을 정리하고 스터디해요"],
      tipSources: ["https://gall.dcinside.com/mini/board/view/?id=gongsistudy&no=725885", "https://www.youtube.com/watch?v=RvOgrQeXhEE"],
      facts: [
        { text: "2026 국가직 9급 3,802명 선발에 108,718명 지원, 28.6:1", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=" },
        { text: "2026 지방직 9급 23,390명 선발, 평균 6.1:1", source: "https://www.news1.kr/amp/local/moi/6199597" },
        { text: "2027년부터 9급 한국사는 한국사능력검정시험(3급 이상)으로 바뀌어요", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?cntId=4195&mode=view" },
        { text: "2025년부터 9급 국어·영어가 지식 암기 중심에서 언어 이해·추론과 실용 업무 능력 중심으로 바뀌고, 시험 시간이 100분에서 110분으로 늘었어요(2025-01)", source: "https://biz.newdaily.co.kr/site/data/html/2025/01/02/2025010200204.amp.html", date: "2025-01" },
        { text: "2026년 공무원 보수 3.5% 인상, 9년 만의 최대폭", source: "https://www.newsis.com/view/NISX20250829_0003308629" }
      ],
      source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx="
    },
    // 아래 5개는 학과(AI소프트웨어·기계·수학·언론홍보)에 맞춰 2026-10-30 추가. 근거: research_notes/jobmap 발전 조사/새 직무와 AI 영향.md
    // does·tasks·skills는 커리어넷 직업정보. 원문을 열어 보지 못한 사례·팁은 넣지 않았다.
    {
      key: "sw", name: "소프트웨어 개발자",
      does: "컴퓨터가 알아듣는 언어로 프로그램과 시스템을 기획하고 만들어요.",
      tasks: ["개발한 소프트웨어를 시험 운영하고 기능·성능 평가하기", "사용자 교육과 기술 자문", "새로운 소프트웨어 기술 조사하고 연구하기"],
      skills: ["논리적·분석적 사고", "프로그래밍", "수리논리력"],
      open: "경기권 4년제 컴공(학점 3점 중반, 자격증·어학 없음)이 넥슨코리아 백엔드 수시 채용에 합격했어요(2025).",
      openSource: "https://ohksj77.tistory.com/279",
      pay: PAY("3,679", "컴퓨터 시스템 및 소프트웨어 전문가"),
      outlook: null,
      tips: ["코딩테스트를 꾸준히 풀어요", "프로젝트는 문제 인식→해결 과정과 기술을 고른 이유 중심으로 정리해요", "CS 개념서 한 권을 반복해 읽고 기술 면접을 준비해요", "신기술 나열보다 깊이 고민한 흔적을 보여줘요"],
      tipSources: ["https://ohksj77.tistory.com/279", "https://kyko.tistory.com/82"],
      facts: [
        { text: "개발직 공고 중 신입 비중이 2022년 53.5%에서 2024년 37.4%로 줄었어요(한국노동연구원 인용)", source: "https://www.twig24.com/news/2026/01/07/20260107014003" },
        { text: "2024년 3년 미만 신입 개발자 취업자는 9천 명 줄고, 3년 이상 경력자는 4만 2천 명 늘었어요(한국노동연구원 인용)", source: "https://www.twig24.com/news/2026/01/07/20260107014003" }
      ],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=834"
    },
    {
      key: "ai", name: "AI 엔지니어",
      // 커리어넷에 'AI 개발자' 항목이 없어 유사직업이 인공지능전문가인 신경회로망연구원을 썼다(연구직 성격)
      does: "영상·음성인식, 로봇 제어 같은 데 쓰이는 인공지능 기술을 연구하고 개발해요.",
      tasks: ["학습하고 판단하는 컴퓨터·로봇 프로그램 만들기", "영상·음성인식, 로봇 제어 같은 응용 기술 연구하기", "새 기술을 익히고 실험하기"],
      skills: ["수학·물리 같은 기초과학", "프로그래밍", "논리적 사고·분석력"],
      open: "AI 프로젝트 4개·백엔드 프로젝트 2개를 한 지원자가 삼성전자 DX 인공지능 신입 서류·직무적합성평가를 통과했어요(2026).",
      openSource: "https://community.linkareer.com/junior_activity/6348932",
      pay: null,
      outlook: null,
      tips: [
        "프로젝트는 기술을 고른 이유와 대안 비교까지 정리해요",
        "AI를 면접 연습 상대로 써요",
        "학사는 연구직보다 AI 서비스 개발·MLOps 쪽 문이 넓어요",
        "데이터 수집부터 배포까지 직접 설명할 수 있는 프로젝트 1~2개를 만들어요",
        "AI가 짠 코드를 내가 설명하고 고칠 수 있게 해요"
      ],
      tipSources: ["https://kyko.tistory.com/82", STEM(6494555), STEM(6456575)],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=98"
    },
    {
      key: "mech", name: "기계 설계·생산기술",
      does: "기계·설비·생산시스템을 연구하고 설계하거나, 생산 공정을 운영하고 감독해요.",
      tasks: ["기계의 고장이나 문제를 찾아 해결하기", "신제품 아이디어를 기획하고 세부 설계하기", "현장 설치와 검사 감독, 견적서·보고서 작성"],
      skills: ["공간시각능력", "수리논리력", "분석적 사고"],
      open: "현직 멘토 10명은 설계는 연구소 중심으로 적게 뽑아 석사·프로젝트 경험을 보고, 생산기술·품질은 채용 인원이 훨씬 많다고 답했어요(2026).",
      openSource: STEM(6048404),
      pay: PAY("4,013", "기계·로봇공학 기술자 및 시험원"),
      outlook: null,
      tips: ["설계 신입은 CAD 숙련도보다 4대 역학으로 설계 이유를 설명하는 힘을 봐요", "요구조건부터 시제품 개선까지 해 본 설계 프로젝트·캡스톤을 포트폴리오로 만들어요", "반도체 장비, 이차전지 공정 장비, 로봇·자동화처럼 산업군을 좁혀요", "생산기술로 들어가 설계로 옮기는 길도 있지만 자동으로 바뀌진 않아요"],
      tipSources: ["https://community.linkareer.com/STEM_mentoring/6048404", "https://community.linkareer.com/STEM_mentoring/5484894", "https://community.linkareer.com/STEM_mentoring/5053954"],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=56"
    },
    {
      key: "rnd", name: "연구개발(R&D)",
      // R&D는 전공마다 직업이 달라 국내 기업 연구소에서 큰 갈래인 재료·소재 연구를 대표로 썼다
      does: "새 기술·재료·제품을 연구하고 실험해 회사의 다음 제품을 만들어요.",
      tasks: ["세라믹·반도체 등의 공정 설계", "재료의 구조와 성질 연구", "문제 원인을 실험으로 찾고 개선안 세우기"],
      skills: ["수리논리력", "분석적 사고", "실험 설계"],
      open: "국책연구기관 연구 인턴과 공모전 수상 경험이 있는 지원자가 현대제철 기술개발 신입 서류·면접에 합격했어요(2025).",
      openSource: LKP + "6375686",
      pay: null,
      outlook: null,
      tips: [
        "연구직은 석사 졸업자와 겨루는 경우가 많아 학부연구생 성과와 연구 공모전이 경쟁력이 돼요",
        "공고의 우대 전공 표기를 먼저 확인해요",
        "학부연구생 주제가 지원 분야와 이어지게 정리해요",
        "직무 면접 문제 풀이를 꼼꼼히 준비해요"
      ],
      tipSources: [STEM(5484894), STEM(6169993), LKP + "6486887"],
      facts: [
        { text: "LG AI연구원은 후보 물질 42만 개 이상 중 탈모 관리 소재를 AI로 하루 만에 찾았다고 발표했어요(2026-07)", source: "https://view.asiae.co.kr/article/2026070808465086575" }
      ],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=112"
    },
    {
      key: "media", name: "기자·PD·콘텐츠 제작",
      does: "소식을 취재해 신문·방송·인터넷으로 알리고, 프로그램과 콘텐츠를 기획하고 만들어요.",
      tasks: ["현장을 취재하고 기사 쓰기", "원고 교정과 기사 배치 정하기", "제작진·출연진을 꾸리고 촬영을 지휘하기"],
      skills: ["글쓰기·언어능력", "창의력", "대인관계"],
      open: "언론홍보영상 전공이 조연출·인턴 경력으로 JTBC·CJ ENM·SBS미디어그룹 예능 PD 합격 자소서를 남겼어요(2024~2025).",
      pay: null,
      outlook: null,
      tips: ["조연출·방송 인턴처럼 제작 현장 경험을 앞에 둬요", "플랫폼별 기획안으로 기획력을 보여줘요", "신입 공채가 줄고 채용연계형 인턴이 늘어요. 인턴 우수 수료자가 최종 면접 대상이 되기도 해요", "방송사만 보지 말고 유통사·웹예능 제작사까지 넓혀요"],
      tipSources: ["https://linkareer.com/cover-letter/search?page=1&role=PD&sort=RELEVANCE&tab=all", "http://www.journalist.or.kr/news/article.html?no=61915"],
      facts: [
        { text: "2026-10-20 기준 경향신문·조선미디어·중앙그룹·MBC가 올해 신입기자 공채를 하지 않았어요(기자협회보)", source: "http://www.journalist.or.kr/news/article.html?no=61915" }
      ],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=262"
    },
    // 아래 7개는 흥미 6영역마다 1순위 직무가 3개 이상 되도록 2026-10-30 추가(현실 2·예술 2·사회 3).
    // does·tasks·skills는 커리어넷 직업정보 원문(2026-10-30 열람). 2024년 이후 출처가 없는 칸은 비웠다.
    {
      key: "quality", name: "품질 검사(비파괴검사)", new: true, date: "2026-10",
      // 커리어넷에 일반 품질관리원 항목이 없어(품질관리기술자 항목은 내용이 비어 있음) 검사 직무인 비파괴검사원을 대표로 썼다
      does: "재료·제품·설비에 결함이 없는지 검사하고 기준에 맞는지 판정해요.",
      tasks: ["검사 방법과 일정을 정하고 장비 준비하기", "초음파·방사선 같은 방법으로 결함 찾기", "기준에 따라 판정하고 검사 결과 보고하기"],
      skills: ["수리능력", "분석능력", "정직성·직업윤리"],
      open: "전기공학·항공기계공학 전공자가 HD현대중공업·앰코 품질 신입에 합격했어요(2025~2026).",
      openSource: `${CL(36006)}, ${CL(36318)}`,
      pay: null, outlook: null,
      tips: [
        "자격증 개수보다 불량 원인을 찾아 개선한 경험을 봐요",
        "연구실·캡스톤 경험을 문제→데이터 분석→개선 순서로, 숫자를 넣어 정리해요",
        "SPC·MSA·FMEA 같은 품질 기법 교육을 들어 두면 도움이 돼요",
        "품질 인턴은 드물어요. 생산·공정기술 인턴이나 현장실습도 품질 경험이 돼요"
      ],
      tipSources: [
        STEM(4500720),
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%ED%92%88%EC%A7%88%EA%B4%80%EB%A6%AC/%ED%92%88%EC%A7%88%EA%B4%80%EB%A6%AC_%EC%A7%81%EB%AC%B4%EB%A5%BC%20%ED%9D%AC%EB%A7%9D%ED%95%98%EB%8A%94%EB%8D%B0%20%EC%8A%A4%ED%8E%99%EC%9D%84%20%EC%96%B4%EB%96%BB%EA%B2%8C%20%EC%8C%93%EC%9D%84%20%EC%A7%80%20%EA%B3%A0%EB%AF%BC%EC%9E%85%EB%8B%88%EB%8B%A4-626676",
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%ED%92%88%EC%A7%88%EA%B4%80%EB%A6%AC/27%EB%85%84_2%EC%9B%94%20%EC%A1%B8%EC%97%85%EC%98%88%EC%A0%95%20%ED%92%88%EC%A7%88%EA%B4%80%EB%A6%AC%20%EC%A7%81%EB%AC%B4%20%EC%8A%A4%ED%8E%99%20%EC%A4%80%EB%B9%84%20%EC%A1%B0%EC%96%B8%20%EA%B5%AC%ED%95%98%EA%B3%A0%20%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4-631467"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=81"
    },
    {
      key: "maint", name: "설비 보전·정비", new: true, date: "2026-10",
      does: "공장의 생산 기계를 설치하고, 고장 원인을 찾아 고쳐요.",
      tasks: ["설계도면에 따라 기계를 설치하고 시험 가동하기", "고장 원인을 분석하고 고장 부위 수리하기", "주기적으로 분해·점검하고 닳은 부품 바꾸기"],
      skills: ["기계·도면 지식", "논리적 추리력·분석력", "꼼꼼함"],
      open: "전문대 미래자동차과 출신이 자동차 생산라인 근무 경험을 살려 SK하이닉스 설비관리 신입에 합격했어요(2025).",
      openSource: CL(35655),
      pay: PAY("3,416", "기계장비 설치 및 정비원"), outlook: null,
      tips: [
        "PLC 교육은 수료로 끝내지 말고 작은 자동제어 프로젝트 하나를 완성해요",
        "전기기사를 높게 보는 회사가 많아요. 중소·중견 제조업은 PLC를 입사 뒤 가르치기도 해요",
        "경험은 고장 원인→해결→개선 효과(가동률·멈춘 시간) 순서로 정리해요",
        "입사 전 실제 보전 업무 비중을 확인해요. 재고관리 위주면 경력으로 인정받기 어려워요"
      ],
      tipSources: [
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/%EA%B3%B5%EC%9E%A5_%EC%A0%84%EA%B8%B0%EC%84%A4%EB%B9%84%20%EB%B3%B4%EC%A0%84%20%EA%B3%B5%EB%AC%B4%20%EC%AA%BD%EC%9C%BC%EB%A1%9C%20%EA%B0%80%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4-631547",
        CM + "%EA%B8%B0%EC%95%84autoland%EA%B4%91%EB%AA%85/%EC%84%A4%EB%B9%84%EA%B4%80%EB%A6%AC%EC%9A%B4%EC%98%81/%EA%B8%B0%EC%95%84_%EA%B4%91%EB%AA%85%20autoland%20%EC%84%A4%EB%B9%84%EB%B3%B4%EC%A0%84%20%EC%A7%81%EB%AC%B4-631423",
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EC%84%A4%EB%B9%84%EA%B4%80%EB%A6%AC%EC%9A%B4%EC%98%81/%EC%84%A4%EB%B9%84_%EB%B3%B4%EC%A0%84%20%ED%98%84%EC%A7%81%EC%9E%90%EB%B6%84%EB%93%A4%EA%BB%98%20%EC%A7%88%EB%AC%B8%EC%9E%88%EC%8A%B5%EB%8B%88%EB%8B%A4-617416"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=985"
    },
    {
      key: "copy", name: "카피라이터", new: true, date: "2026-10",
      does: "상품과 서비스가 쉽게 기억되도록 광고 문구를 써요.",
      tasks: ["광고주·시장조사 담당자와 광고 방향 협의하기", "시장·소비자·광고 경향 조사 자료 검토하기", "헤드 카피·본문·슬로건 쓰기"],
      skills: ["창의력", "언어능력", "시대 흐름 읽기"],
      open: null,
      pay: null, outlook: null,
      tips: [
        "작은 광고회사는 카피 전담이 적어요. 기획(AE)·SNS 콘텐츠·영상 콘티까지 함께 맡는 일이 많아요",
        "공채보다 수시로, 카피 실력과 포트폴리오를 보고 뽑아요",
        "한국광고총연합회 한국광고아카데미 같은 무료 교육에서 작품을 만들어 포트폴리오를 쌓아요"
      ],
      tipSources: [
        CM + "%EC%A0%9C%EC%9D%BC%EA%B8%B0%ED%9A%8D/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/%EC%B9%B4%ED%94%BC%EB%9D%BC%EC%9D%B4%ED%84%B0_%EC%A7%81%EB%AC%B4%EC%97%90%20%EB%8C%80%ED%95%9C%20%EC%A7%88%EB%AC%B8%EC%9E%85%EB%8B%88%EB%8B%A4-616380",
        "https://www.superookie.com/activities/6a83df0288e12d2bd626ef43"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=278"
    },
    {
      key: "video", name: "영상 편집", new: true, date: "2026-10",
      does: "영화·방송에 쓰이는 영상을 대본에 맞게 편집해요.",
      tasks: ["대본을 읽고 작품의 분위기와 흐름 파악하기", "촬영 영상을 보고 편집 순서 정하기", "극적 분위기를 살려 영상 편집하기"],
      skills: ["공간시각능력", "창의력", "세심함·판단력"],
      open: "미디어학부 출신이 연합뉴스TV 영상편집기자 신입에 합격했어요(2025).",
      openSource: CL(36353),
      pay: PAY("2,811", "연극·영화 및 영상 전문가"), outlook: null,
      tips: [
        "자격증보다 포트폴리오예요. 지원 분야에 맞는 작품 3~5개를 완성도 있게 만들어요",
        "학원 예제를 따라 만든 작품보다 직접 기획한 작품을 넣어요",
        "라이브 방송 채널 영상으로 컷편집을 연습해 봐요",
        "지원 회사가 만드는 영상과 맞는 작품을 골라 내요"
      ],
      tipSources: [
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/%EB%A9%80%ED%8B%B0%EB%AF%B8%EB%94%94%EC%96%B4%EC%BD%98%ED%85%90%EC%B8%A0%EC%A0%9C%EC%9E%91%EC%A0%84%EB%AC%B8%EA%B0%80_%EC%9E%90%EA%B2%A9%EC%A6%9D-629286",
        "https://brunch.co.kr/@answls7337/164"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=346"
    },
    {
      key: "teacher", name: "중등교사", new: true, date: "2026-10",
      does: "중·고등학교에서 맡은 과목을 가르치고 학생의 생활과 진로를 지도해요.",
      tasks: ["맡은 과목의 학습안을 설계하고 수업하기", "학생 고민을 상담하고 필요하면 학부모와도 상담하기", "진로지도를 비롯한 생활지도 하기"],
      skills: ["언어능력", "리더십·판단력", "사명의식·책임감"],
      open: null, pay: null,
      outlook: { value: "교사 수요가 줄 수 있다는 전망", basis: OUTLOOK_BASIS + ", 저출산 영향", source: OUTLOOK },
      tips: [], tipSources: [],
      facts: [
        { text: "2027학년도 공립 중등 교과 교사 선발 인원은 전국 4,932명으로, 전년보다 2,215명 줄었어요(2026-10)", source: "https://www.wikitree.co.kr/articles/1163246" },
        { text: "국립순천대는 2026학년도 중등 임용 합격자 78명 중 72명이 사범대, 2명이 일반학과 교직이수, 4명이 교육대학원 출신이라고 밝혔어요(2026-02, 한 대학 발표)", source: "https://www.twig24.com/news/local_govern/2026/02/13/20260213500050", date: "2026-02" }
      ],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=406"
    },
    {
      key: "counsel", name: "진로·취업 상담", new: true, date: "2026-10",
      does: "구직자에게 맞는 일자리 정보를 주고 진로·취업 상담을 해요.",
      tasks: ["직업심리검사로 적성·흥미에 맞는 직업 정보 주기", "구직 등록을 받고 맞는 일자리 알선하기", "청소년·여성·중장년 직업지도 프로그램 운영하기"],
      skills: ["언어능력", "대인관계능력", "판단력·분석력"],
      open: "심리학과 졸업생이 직업상담사 2급만으론 연락이 없자 2개월 양성과정을 듣고 국민취업지원제도 위탁기관에 첫 취업했어요(2025년 글).",
      openSource: "https://brunch.co.kr/@sujinlee0032/1",
      pay: null, outlook: null,
      tips: [
        "자격증만으로 부족하면 상담 실습·인턴·양성과정으로 경험을 더해요",
        "엑셀·한글 같은 사무 능력과 정부 지원 사업 이해를 미리 갖춰요"
      ],
      tipSources: [
        "https://brunch.co.kr/@sujinlee0032/1",
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/%ED%98%84%EC%8B%A4%EC%A0%81%EC%9D%B8_%EC%A1%B0%EC%96%B8%EA%B3%BC%20%EC%A0%84%EB%A7%9D%20%EB%AC%B8%EC%9D%98-617282"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=408"
    },
    {
      key: "edudesign", name: "교수설계·이러닝", new: true, date: "2026-10",
      // 커리어넷 사이버교육운영자(유사직업명: 이러닝 교수설계자)
      does: "온라인 교육과정을 설계·기획하고 학습 콘텐츠를 만들어 운영해요.",
      tasks: ["온라인 교육과정을 기획·운영하고 평가하기", "교육 내용을 그림·동영상 형태로 가공하기", "교육 사이트를 운영하며 교사·학생 소통 관리하기"],
      skills: ["교육 전반 지식", "컴퓨터 프로그램 활용", "정보수집능력"],
      open: "IT 교육 기업에서 계약직으로 교육 프로그램을 운영해 본 뒤, 지원서 70~80개 끝에 IT 대기업 HRD(사내 교육) 부서 신입이 됐어요(2024).",
      openSource: "https://maily.so/100tothefuture/posts/l1zqv4gnr5x",
      pay: null, outlook: null,
      tips: [
        "전공보다 내용을 구조화하고 위계를 잡는 힘이 중요해요",
        "스토리보드를 쓰는 일이라 원고 이해력과 화면 구성력을 길러요",
        "커리큘럼대로 교육을 운영해 본 경험을 쌓고 인턴부터 지원해요",
        "자격증보다 직무 경험이 먼저예요"
      ],
      tipSources: [
        "https://maily.so/100tothefuture/posts/l1zqv4gnr5x",
        "https://brunch.co.kr/@@7wf4/1",
        "https://community.linkareer.com/mentoring/6244344"
      ],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=462"
    },
    // 아래 4개는 4차 A3(2026-10-30). does·tasks·skills는 커리어넷 직업정보, 커리어넷에 없는 UX/UI·클라우드는 고용24 직업정보 원문.
    // 통계 분류를 원문으로 확인하지 못해 pay는 모두 null. 근거: research_notes/jobmap 회사/안건 준비/02 직무 후보 조사.md
    {
      key: "security", name: "정보보안", new: true, date: "2026-10",
      does: "보안 정책을 세우고 시스템 접근을 통제하며, 침입이 생기면 빨리 찾아 막고 복구해요.",
      tasks: ["보안 정책을 세우고 방화벽 구축하기", "위험하고 취약한 곳을 찾아 대비책 마련하기", "해킹 같은 침입을 탐지하고 대응·복구하기"],
      skills: ["분석적 사고", "컴퓨터 시스템 전반 지식", "책임감·도덕성"],
      open: "자격증·어학 점수 없이 BoB 교육과 보안 대회 입상 3회 경험이 있는 경기권 4년제 학생이 LG유플러스 정보보안기술 신입에 최종 합격했어요(2026).",
      openSource: "https://community.linkareer.com/final_review/6328661",
      pay: null,
      outlook: { value: "재직자 43%가 '증가', 40%가 '감소'로 봐요", basis: W24_BASIS, source: W24("K000000832") },
      tips: [
        "로그 분석·공격 패턴·침해사고 대응 흐름을 익혀요",
        "CTF 한두 개라도 끝까지 풀고, 과정을 블로그·깃허브에 남겨요",
        "화려한 수상보다 인턴 같은 실무 경험을 먼저 쌓아요",
        "한국인터넷진흥원이 운영하는 보안 인재 교육(BoB)에 도전해 봐요"
      ],
      // BoB: 2026년부터 KISA 운영, 15기 110명(보안뉴스 2026-04-07). 새 운영처의 지원 자격 원문은 확인하지 못해 자격 문구를 뺐다.
      tipSources: [
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/%EB%B3%B4%EC%95%88%EA%B4%80%EC%A0%9C-621210",
        CM + "%EB%AA%A8%EB%93%A0%ED%9A%8C%EC%82%AC/%EC%A0%95%EB%B3%B4%EB%B3%B4%EC%95%88/%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8_%EC%8B%A0%EC%9E%85%20%ED%95%99%EC%82%AC%20%EC%B1%84%EC%9A%A9%20%EC%A4%80%EB%B9%84%20%EC%A7%88%EB%AC%B8%EC%9E%85%EB%8B%88%EB%8B%A4-625657",
        "http://www.boannews.com/news/articleView.html?idxno=143050"
      ],
      facts: [
        { text: "50인 이상 기업 중 보안 인력이 필요하다고 답한 곳은 8.7%, 최근 1년 안에 보안 인력을 뽑은 곳은 7.6%였어요(과기정통부·KISIA 2024 실태조사, 2025-04 보도)", source: "https://www.etoday.co.kr/news/view/2460937", date: "2025-04" }
      ],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=435"
    },
    {
      key: "game", name: "게임 기획", new: true, date: "2026-10",
      // O*NET Video Game Designers(게임 디자이너 = 기획). 게임 프로그래머는 소프트웨어 개발자(IC)와 같은 코드라 따로 두지 않는다.
      does: "어떤 게임을 만들지 기획하고 규칙·캐릭터·이야기를 정해, 디자이너·프로그래머와 함께 만들어요.",
      tasks: ["시장 조사로 사람들이 원하는 게임을 찾고 기획안 쓰기", "장르·난이도·캐릭터·스토리 정하기", "기획 의도를 그래픽 디자이너·프로그래머에게 알기 쉽게 전하기"],
      skills: ["창의력·기획력", "게임·문화 콘텐츠 이해", "대인관계능력"],
      open: "산림자원학과 출신이 게임사 전투 기획 신입에 합격했어요(2025).",
      openSource: CL(34457),
      pay: null, outlook: null,
      tips: [
        "게임을 할 때 왜 재밌는지, 시스템이 어떻게 짜였는지 따져 봐요",
        "기획서엔 이게 왜 필요한지, 기획 의도를 꼭 적어요",
        "참고한 게임은 고른 이유를 밝히고 내 의도로 다시 풀어요"
      ],
      tipSources: ["https://www.thisisgame.com/articles/214779"],
      facts: [], // 게임 프로그래머 재직자 전망(70% 감소)은 기획 직무와 맞지 않아 넣지 않는다(10 안건 A3-1).
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=923"
    },
    {
      key: "cloud", name: "클라우드·인프라 엔지니어", new: true, date: "2026-10",
      // 커리어넷에 클라우드 항목이 없어 고용24 한국직업사전 '클라우드시스템엔지니어'를 썼다. skills는 커리어넷 시스템운영관리자(SEQ 938).
      does: "클라우드에서 서버·네트워크·저장소를 설계하고 구축해, 서비스가 멈추지 않게 운영해요.",
      tasks: ["가상 서버·네트워크·스토리지 설계하고 구축하기", "서비스 품질 목표와 운영 정책 정하기", "CI/CD로 배포 환경을 만들고 배포하기"],
      skills: ["운영체제·소프트웨어 지식", "분석적 사고", "책임감·끈기"],
      open: "컴공 전공자가 AWS 부트캠프·쿠버네티스 프로젝트로 메가존클라우드 클라우드 엔지니어 신입에 합격했어요(2025).",
      openSource: CL(36734),
      pay: null, outlook: null,
      tips: [
        "네트워크·OS 같은 CS 기본기부터 다져요",
        "쿠버네티스 클러스터를 직접 만들고 운영해 봐요",
        "자격증을 늘리기보다 리눅스·네트워크를 깊이 이해해요",
        "신입·경력 공고를 가리지 말고 지원해 봐요"
      ],
      tipSources: ["https://choigonyok.tistory.com/1", STEM(6409808)],
      facts: [
        { text: "국내 클라우드 인력은 3만3,217명으로 1년 새 8.4% 늘었어요. 개발 33.6%, 운영 19.7%, 아키텍트 15.6%, 보안 14.1%예요(2025 클라우드 산업 실태조사, 2026-03)", source: "https://www.kyeonggi.com/article/20260330580494", date: "2026-03" }
      ],
      source: "https://www.wagework.go.kr/pt/a/d/retrieveOccpDctnDtal.do?konetOccpCd=K000004684&viewFlag=K"
    },
    {
      key: "uxui", name: "UX/UI 디자이너", new: true, date: "2026-10",
      // 커리어넷에 UX 항목이 없어(웹디자이너만 있음) 고용24 직업정보 'UX/UI디자이너' 원문을 썼다.
      does: "사용자가 원하는 것을 파악해 앱·웹 서비스의 흐름과 화면을 설계해요.",
      tasks: ["사용자 니즈를 파악해 제품 전체 흐름 디자인하기", "사용자가 기기와 정보를 주고받는 화면 환경 디자인하기", "메뉴 구조를 정하고 화면을 배치하기"],
      skills: ["창의력", "디자인·심리 지식", "문제 해결"],
      open: "공모전 수상과 디자인 시스템 구축 경험으로 현대오토에버 UI디자인 신입에 최종 합격했어요(2025).",
      openSource: LKP + "4676287",
      pay: null,
      // 재직자 값은 2026-10-30 워크피디아 데이터로 다시 확인: 감소 63·유지 12·증가 24(2025 조사)
      outlook: { value: "정부 전망은 '다소 증가'(연 1.2%), 재직자는 63%가 '감소'로 봐요", basis: OUTLOOK_BASIS + ", " + W24_BASIS, source: `${KEIS}, ${W24("K000000890")}` },
      tips: [
        "경험 2~3개를 상황·행동·결과로 정리하고 숫자를 넣어요",
        "사전과제는 1차 면접에서 발표하고 질문받으니 함께 준비해요",
        "면접 스터디로 답을 다듬고 말하기를 연습해요"
      ],
      tipSources: [LKP + "4676287"],
      facts: [],
      source: W24("K000000890")
    }
  ];

  // 흥미 코드: 가장 가까운 O*NET 직업의 Interest Code (O*NET OnLine 2026-10 열람).
  // 미국에 같은 직업이 없는 해외영업(영업 준용)·공기업 사무·공무원은 가장 가까운 것을 골랐다. IT 기획·PM은 시스템 분석가(IC)와 PM(EC)을 합쳤다.
  const ONET = (soc) => `https://www.onetonline.org/link/summary/${soc}`;
  const CODES = {
    sales: ["EC", "41-4012.00"], trade: ["EC", "41-4012.00"], marketing: ["ECI", "13-1161.00"], hr: ["ECS", "13-1071.00"],
    finance: ["CEI", "13-2011.00"], strategy: ["CIE", "13-1111.00"], scm: ["CEI", "13-1081.00"], cs: ["CES", "43-4051.00"],
    itpm: ["ICE", "15-1211.00"], data: ["IC", "15-2051.00"], ncs: ["C", "43-9061.00"], civil: ["CE", "13-1041.00"],
    sw: ["IC", "15-1252.00"], ai: ["IC", "15-1221.00"], mech: ["RIC", "17-2141.00"], rnd: ["IRC", "19-2032.00"], media: ["AIE", "27-3023.00"],
    quality: ["RCI", "51-9061.00"], maint: ["RC", "49-9071.00"], copy: ["AE", "27-3043.00"], video: ["AC", "27-4032.00"],
    teacher: ["S", "25-2031.00"], counsel: ["SCE", "21-1012.00"], edudesign: ["SEI", "25-9031.00"],
    security: ["CI", "15-1212.00"], game: ["AI", "15-1255.01"], cloud: ["CIR", "15-1299.08"], uxui: ["IAC", "15-1255.00"]
  };
  // AI가 바꾸는 점: now 현장 사례, change 바뀌는 일, need 신입이 갖출 것. 2024년 이후 근거가 없는 줄은 비웠다.
  // 회사 자기 발표(이노션·CJ대한통운·한화생명·서부발전·LG AI연구원·LG전자·딥아이·원프레딕트·크래프톤)가 섞여 있다. need 일부는 근거 내용에서 끌어낸 해석이다.
  // copy·video·edudesign·quality need는 「2025~2035 정성적 일자리 전망」의 가까운 직업(광고 및 홍보 전문가, 영상·녹화 및 편집 기사, 인적자원전문가, 생산 및 품질관리 사무원) 본문에서 가져왔다.
  const JK_AI = "https://ditoday.com/?p=142669"; // 잡코리아 AI 채용 공고 분석(2026-04-10)
  const KSA_AI = "https://v.daum.net/v/20260323090147332"; // 한국표준협회 기업 AI 인재 수요 조사(중앙일보, 2026-03-23)
  const AI = {
    sales: { change: "KDI는 생성형 AI로 10년 뒤 일자리 약 25.6만 개가 줄고, 사무·판매처럼 AI 노출이 큰 직종에 몰릴 것으로 추정했어요(2026-07)", need: "졸업 전에 실무 경험 쌓기. 한국은행은 20대가 AI 시대에 수요가 늘어난 전문성·실무 경험을 갖추기 어려워 밀린다고 봤어요(2026-09)", source: "https://www.khan.co.kr/article/202607222035025, https://www.metroseoul.co.kr/article/20260914500451" },
    trade: { now: "수출기업 444곳 중 54.5%가 무역 업무에 AI를 쓰고, 시장조사·바이어 발굴·공급망 관리에 적용해요(무역협회, 2026)", need: "AI를 안 쓰는 기업은 어떤 서비스가 있는지(47.5%), 어디에 쓸지(40.6%) 몰라요. 무역 업무에 맞는 AI 도구를 아는 사람이 강점이 돼요", source: "https://www.venturesquare.net/1112777/" },
    marketing: { now: "광고회사는 AI 전담팀을 두고, 촬영 없이 생성형 AI로 만든 광고도 나왔어요(2024)", change: "제작비를 약 1/4, 기간을 약 1/3로 줄일 수 있다고 봐요. 반복 제작은 AI가, 사람은 기획에 집중해요", need: "기획·전략 역량. 광고·홍보 전문가는 '다소 증가' 전망이에요(2026-05)", source: "https://magazine.hankyung.com/business/article/202408293875b" },
    hr: { now: "HR 업계는 AI 서류 스크리닝, 공고 자동 작성, AI 영상면접 서비스를 내놓고 있어요(2026-10)", source: "https://m.ddaily.co.kr/page/view/2026100218450201107" },
    finance: { change: "회계사무원은 '현상 유지' 전망이지만 일의 중심이 단순 행정에서 시스템 운영·프로세스 관리로 옮겨 가요(2026-05)", need: "회계 시스템과 업무 프로세스를 이해하기", source: "https://m.seoul.co.kr/news/2026/05/18/20260518500141" },
    strategy: { need: "데이터와 ESG를 이해하기. 경영·진단 전문가는 데이터 기반 리스크 관리와 ESG 수요로 '다소 증가' 전망이에요(2026-05)", source: "https://m.seoul.co.kr/news/2026/05/18/20260518500141" },
    scm: { now: "CJ대한통운은 수요예측·최적화 엔진으로 배차를 짜고, 적재율 최적화 AI를 현장에서 써요(2025-11 발표)", change: "적재율 계산이 약 1시간에서 10분 이내로 줄었어요. 담당자 경험에 따라 달라지던 방식이 표준화돼요", source: "https://byline.network/2025/11/1128/" },
    cs: { now: "상담봇이 단순 문의를 처리하고, 상담 중엔 AI가 답변을 추천해요. 신입 상담사는 AI와 모의상담을 연습해요(한화생명, 2025-03)", change: "상담사는 복잡한 문의에 집중해요. 안내·접수원은 챗봇 확산으로 '다소 감소' 전망이에요", need: "AI가 못 푸는 복잡한 문의를 해결하는 상담 역량", source: "https://sateconomy.co.kr/news/view/1065579185045971" },
    ncs: { now: "한국서부발전은 전 직원이 쓰는 생성형 AI 플랫폼과 내부 자료 질의응답, 업무 자동화를 구축하고 있어요(2025-08)", source: "https://byline.network/2025/08/8269/" },
    civil: { now: "광주 북구는 공문·사업계획서·보도자료 작성과 문서 요약에 생성형 AI를 쓰고, 야간·휴일엔 AI 콜봇이 민원을 접수해요(2026-09)", change: "콜봇은 긴급 상황이나 모르는 민원을 바로 당직자에게 넘겨요. 판단과 책임은 사람에게 남아요", source: "https://news.mtn.co.kr/news-detail/2026092815023967346" },
    sw: { now: "개발직의 80% 이상이 생성형 AI를 쓰고, AI가 참조 코드 검색과 간단한 코드 작성을 맡아요(2026-01). 넥슨은 AI를 쓰는 문제 해결 과정을 보는 면접으로 코딩테스트를 대체했어요", change: "신입 공고 비중이 2022년 53.5%에서 2024년 37.4%로 줄었어요. 숙련 개발자가 AI로 효율을 높이며 신입을 덜 뽑는다는 분석이 있어요", need: "바로 성과를 내는 역량과 AI 도구를 다루는 능력. 스타트업 경험이나 대학원을 권하는 의견도 있어요", source: "https://www.twig24.com/news/2026/01/07/20260107014003" },
    rnd: { now: "LG AI연구원은 AI로 후보 물질 42만 개 이상 중 소재를 하루 만에 찾았다고 발표했어요(2026-07)", change: "후보 물질을 찾는 단계를 AI가 맡는 사례가 나왔어요. 실험과 검증은 여전히 연구원이 해요", source: "https://view.asiae.co.kr/article/2026070808465086575" },
    media: { now: "조선일보는 2025년 11월 AI 교열을 도입하고 교열 자회사와 계약을 끝냈어요(2026-10 보도)", change: "신입 공채를 줄이고 경력기자·채용연계형 인턴을 늘리는 흐름이에요. 기사는 AI를 직접 원인으로 보진 않아요", need: "채용연계형 인턴에서 실무를 보여 주기", source: "http://www.journalist.or.kr/news/article.html?no=61915" },
    itpm: { change: "AI 채용 공고 중 AI 기획자가 13.8%예요. 개발·데이터를 넘어 기획·서비스 설계까지 AI 인재 채용이 넓어지고 있어요(잡코리아, 2026-04)", source: JK_AI },
    data: { now: "기업 재직자 487명 조사에서 가장 필요한 AI 인재로 데이터 분석가(58.9%)가 1순위였어요(한국표준협회, 2026-03). AI 공고 중엔 데이터 사이언티스트 17.4%, 데이터 분석가 10.4%예요(잡코리아, 2026-04)", need: "실무 프로젝트 경험. 신입 AI 인재를 뽑을 때 가장 중요하게 보는 역량 1순위가 실무 프로젝트·현장 적용 경험(32.9%)이었어요", source: `${KSA_AI}, ${JK_AI}` },
    ai: { now: "AI 채용 공고 중 AI/ML 엔지니어가 17.9%이고, AI 신입 공고는 5년 전보다 162% 늘었어요(잡코리아, 2026-04)", need: "실무 프로젝트·현장 적용 경험(신입 채용 때 중요하게 보는 역량 1순위, 32.9%). 신입 AI 인재에게 대졸 이상을 요구한다는 답이 60%, 학력 무관은 15.2%였어요(한국표준협회 재직자 조사, 2026-03)", source: `${JK_AI}, ${KSA_AI}` },
    mech: { now: "LG전자는 3D 도면만 넣으면 시제품을 만들기 전에 AI가 품질을 3분 안에 예측하는 기술을 가전·차량용 부품 설계에 순차 적용한다고 밝혔어요(2025-03)", change: "매번 3~8시간 걸리던 시뮬레이션 없이 예측 결과를 3D로 보고 검토할 수 있어요", source: "https://www.lg.co.kr/media/release/28789" },
    quality: { now: "검사자가 직접 분석하던 열교환기 와전류·초음파 검사 신호를 AI가 판독해 결함 후보를 찾고 크기를 재는 기술이 정유 공장에서 실증됐어요(2026-08)", change: "숙련도에 따라 달라지던 판정이 AI 정량 분석으로 바뀌어요. 회사는 판독 시간이 90% 이상 줄었다고 밝혔어요", need: "품질 데이터를 기록·관리하는 힘. 정부 일자리 전망은 자동 검사 장비가 있어도 최종 기록과 관리는 사람이 맡는다고 봐요(2026-05)", source: `https://news.tf.co.kr/read/ogmeta/2357841.htm, https://www.hankyung.com/article/2025061061621, ${KEIS}` },
    maint: { now: "국내 정유사가 압축기·터빈의 진동·온도 데이터를 AI로 분석해 고장을 미리 진단하는 시스템을 쓰고 있어요(2025-12, 공급사 발표)", change: "고장 난 뒤 고치던 정비가 고장을 미리 예측하고 대비하는 쪽으로 바뀌어요", need: "설비 데이터를 다루는 힘. 국내 현장 대부분은 데이터 활용이 초기 단계(레벨 2)라는 조사가 있어요", source: "https://www.hellot.net/mobile/article.html?no=108391" },
    copy: { change: "생성형 AI가 광고 문구·이미지를 직접 만들면서 단순 제작 일은 줄고, 광고 인력은 전략·창의 중심으로 옮겨 간다는 정부 일자리 전망이에요(2026-05)", need: "AI를 뛰어넘는 기획력과 데이터 분석 능력. 광고·홍보 전문가는 '다소 증가' 전망이에요", source: KEIS },
    video: { change: "단순 컷 편집·자막 생성·색 보정은 AI가 자동화하고, 편집기사는 창의적·기획적인 일에 집중하게 된다는 정부 일자리 전망이에요(2026-05)", need: "AI 편집 도구를 능숙하게 쓰는 힘. 단순 컷 편집만 하는 인력은 입지가 좁아질 수 있어요. 직업 전체는 '증가' 전망이에요", source: KEIS },
    teacher: { now: "초·중·고 교사 1,659명 중 62.9%가 수업·평가에 생성형 AI를 써요. 중학교 65.3%, 고등학교 70.5%예요(한국교육과정평가원, 2026-09)", change: "수업 주제·평가 계획 아이디어에 효과적이라는 답(76.0%)이 가장 많고, 채점 기준표(루브릭)로 채점을 돕는 데는 32.6%였어요", source: "https://www.fnnews.com/news/202609061117518750" },
    counsel: { now: "고용노동부는 급여 지급 같은 반복 행정을 AI로 자동화하고, 고용24 마이페이지를 '나만의 AI 고용센터'로 바꾸는 개편안을 냈어요(2026-08)", change: "상담 전담자(케이스 매니저)가 AI 진단도구로 심층상담부터 취업·경력개발까지 맡는 구조로 바뀌어요. 스스로 준비하는 구직자는 앱으로 안내받아요", source: "https://news.mtn.co.kr/news-detail/2026081912492897309" },
    edudesign: { change: "AI 도입으로 기업에서 직원 재교육(리스킬링)과 역량 강화가 중요해졌어요. 정부 일자리 전망은 이런 HRD 수요를 인적자원전문가 일자리가 늘 요인으로 꼽았어요(2026-05)", need: "미래 직무에 맞춘 학습 프로그램을 기획하는 힘", source: KEIS },
    security: { now: "한국 기업 83%가 지난 1년 동안 AI와 관련된 보안 사고를 겪었다고 답했어요(시스코 조사, 2025-05)", change: "2025년 기업 침해사고 신고가 2,383건으로 1년 새 26.3% 늘었고, 정부는 AI를 악용한 공격이 더 정교해질 것으로 봤어요(2026-01)", source: "https://byline.network/2025/05/8-343, https://byline.network/2026/01/27-564/" },
    game: { now: "크래프톤은 'AI 퍼스트'를 선언하고 GPU 클러스터에 약 1,000억 원, 2026년부터 매년 약 300억 원을 직원 AI 도구에 쓰기로 했어요(2025-10)", change: "콘텐츠 기획·시뮬레이션·밸런싱처럼 오래 걸리던 일이 AI로 빨라지고 있다고 회사가 밝혔어요(2025-10)", source: "https://byline.network/2025/10/23-515/, https://www.ajunews.com/view/20251029131755501" },
    cloud: { now: "생성형 AI 서비스가 늘면서 클라우드 수요가 커져, 2024년 국내 클라우드 매출이 9조2,609억 원으로 25.2% 늘었어요(2026-03)", source: "https://www.kyeonggi.com/article/20260330580494" },
    uxui: { change: "아이콘 제작·와이어프레임 생성·디자인 시스템 관리 같은 반복 작업은 AI로 자동화될 수 있다는 정부 일자리 전망이에요(2026-05)", need: "AI가 만든 시안을 따져 보고 사용자의 숨은 니즈를 반영해 다듬는 힘. 단순 기능 인력은 수요가 줄 수 있어요", source: KEIS }
  };
  window.JOBMAP.jobs.forEach((j) => {
    if (CODES[j.key]) { j.riasec = CODES[j.key][0]; j.onet = ONET(CODES[j.key][1]); }
    if (AI[j.key]) j.ai = AI[j.key];
  });
})();
