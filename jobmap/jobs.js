// 직무 사전 17개(12개 + 2026-10-30 추가 5개). 근거: research_notes 직무사전·취업QA·비정형_공학직무 (2024년 이후 자료).
// does·tasks·skills는 기존 직무 사전(커리어넷·고용24 직업정보)에서 그대로 옮겼다.
// pay: 2024년 이후 직무별 신입 임금 공식 수치를 찾지 못해 모두 null.
(function () {
  const LKP = "https://community.linkareer.com/pass-review/";
  const OUTLOOK = "https://m.seoul.co.kr/news/2026/05/18/20260518500141";
  const OUTLOOK_BASIS = "고용노동부·한국고용정보원 「2025~2035 정성적 일자리 전망」(2026-05)";

  window.JOBMAP.jobs = [
    {
      key: "sales", name: "영업",
      does: "고객에게 제품과 서비스를 소개하고 판매해요.",
      tasks: ["방문·전화·이메일로 고객 만나기", "계약 조건 협의하고 계약 맺기", "결제 처리와 상품 인도"],
      skills: ["설득력", "의사소통", "고객 응대"],
      open: "영문과 졸업생이 B2B·제약 영업 여러 곳에 합격했어요(2025~2026).",
      pay: null,
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
      pay: null,
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
      open: null,
      pay: null,
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
      pay: null,
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
      open: null,
      pay: null,
      outlook: null,
      tips: ["제품을 이해하고 직접 만들어 본 경험을 내세워요", "주총 녹취록 같은 공개자료로 기업을 분석해요", "낸 자료는 면접관이 읽어 오니 완벽히 설명해요"],
      tipSources: [LKP + "6651635"],
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
      pay: null,
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
      pay: null,
      outlook: { value: "일반행정공무원 '현상 유지'(연 0.2%)", basis: OUTLOOK_BASIS, source: OUTLOOK },
      tips: ["행정법·행정학은 기본→심화→문제풀이 후 3~4회 반복해요", "국어는 비문학 실전 문제를 주 2~3회 풀어요", "한국사는 기출 위주로 해요", "면접은 지원 지자체 정책을 정리하고 스터디해요"],
      tipSources: ["https://gall.dcinside.com/mini/board/view/?id=gongsistudy&no=725885", "https://www.youtube.com/watch?v=RvOgrQeXhEE"],
      facts: [
        { text: "2026 국가직 9급 3,802명 선발에 108,718명 지원, 28.6:1", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=" },
        { text: "2026 지방직 9급 23,390명 선발, 평균 6.1:1", source: "https://www.news1.kr/amp/local/moi/6199597" },
        { text: "2027년부터 9급 한국사는 한국사능력검정시험(3급 이상)으로 바뀌어요", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?cntId=4195&mode=view" },
        { text: "2025년부터 9급 국어·영어가 암기형에서 직무 중심으로 바뀌었어요", source: "https://www.korea.kr/news/policyNewsView.do?newsId=156600584" },
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
      pay: null,
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
      open: null,
      pay: null,
      outlook: null,
      tips: ["프로젝트는 기술을 고른 이유와 대안 비교까지 정리해요", "AI를 면접 연습 상대로 써요"],
      tipSources: ["https://kyko.tistory.com/82"],
      facts: [],
      source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=98"
    },
    {
      key: "mech", name: "기계 설계·생산기술",
      does: "기계·설비·생산시스템을 연구하고 설계하거나, 생산 공정을 운영하고 감독해요.",
      tasks: ["기계의 고장이나 문제를 찾아 해결하기", "신제품 아이디어를 기획하고 세부 설계하기", "현장 설치와 검사 감독, 견적서·보고서 작성"],
      skills: ["공간시각능력", "수리논리력", "분석적 사고"],
      open: "현직 멘토 10명은 설계는 연구소 중심으로 적게 뽑아 석사·프로젝트 경험을 보고, 생산기술·품질은 채용 인원이 훨씬 많다고 답했어요(2026).",
      pay: null,
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
      open: null,
      pay: null,
      outlook: null,
      tips: ["연구직은 석사 졸업자와 겨루는 경우가 많아 학부연구생 성과와 연구 공모전이 경쟁력이 돼요", "공고의 우대 전공 표기를 먼저 확인해요"],
      tipSources: ["https://community.linkareer.com/STEM_mentoring/5484894"],
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
    }
  ];

  // 흥미 코드: 가장 가까운 O*NET 직업의 Interest Code (O*NET OnLine 2026-10 열람).
  // 미국에 같은 직업이 없는 해외영업(영업 준용)·공기업 사무·공무원은 가장 가까운 것을 골랐다. IT 기획·PM은 시스템 분석가(IC)와 PM(EC)을 합쳤다.
  const ONET = (soc) => `https://www.onetonline.org/link/summary/${soc}`;
  const CODES = {
    sales: ["EC", "41-4012.00"], trade: ["EC", "41-4012.00"], marketing: ["ECI", "13-1161.00"], hr: ["ECS", "13-1071.00"],
    finance: ["CEI", "13-2011.00"], strategy: ["CIE", "13-1111.00"], scm: ["CEI", "13-1081.00"], cs: ["CES", "43-4051.00"],
    itpm: ["ICE", "15-1211.00"], data: ["IC", "15-2051.00"], ncs: ["C", "43-9061.00"], civil: ["CE", "13-1041.00"],
    sw: ["IC", "15-1252.00"], ai: ["IC", "15-1221.00"], mech: ["RIC", "17-2141.00"], rnd: ["IRC", "19-2032.00"], media: ["AIE", "27-3023.00"]
  };
  // AI가 바꾸는 점: now 현장 사례, change 바뀌는 일, need 신입이 갖출 것. 2024년 이후 근거가 없는 줄은 비웠다.
  // 회사 자기 발표(이노션·CJ대한통운·한화생명·서부발전·LG AI연구원)가 섞여 있다. need 일부는 근거 내용에서 끌어낸 해석이다.
  const AI = {
    sales: { change: "KDI는 생성형 AI로 10년 뒤 일자리 약 25.6만 개가 줄고, 사무·판매처럼 AI 노출이 큰 직종에 몰릴 것으로 추정했어요(2026-07)", need: "졸업 전에 실무 경험 쌓기. 한국은행은 20대가 AI 시대에 수요가 는 전문성·실무 경험을 갖추기 어려워 밀린다고 봤어요(2026-09)", source: "https://www.khan.co.kr/article/202607222035025, https://www.metroseoul.co.kr/article/20260914500451" },
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
    media: { now: "조선일보는 2025년 11월 AI 교열을 도입하고 교열 자회사와 계약을 끝냈어요(2026-10 보도)", change: "신입 공채를 줄이고 경력기자·채용연계형 인턴을 늘리는 흐름이에요. 기사는 AI를 직접 원인으로 보진 않아요", need: "채용연계형 인턴에서 실무를 보여 주기", source: "http://www.journalist.or.kr/news/article.html?no=61915" }
  };
  window.JOBMAP.jobs.forEach((j) => {
    if (CODES[j.key]) { j.riasec = CODES[j.key][0]; j.onet = ONET(CODES[j.key][1]); }
    if (AI[j.key]) j.ai = AI[j.key];
  });
})();
