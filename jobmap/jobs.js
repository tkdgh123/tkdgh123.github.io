// 직무 사전 12개. 근거: research_notes 직무사전·취업QA·비정형_공학직무 (2024년 이후 자료).
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
    }
  ];
})();
