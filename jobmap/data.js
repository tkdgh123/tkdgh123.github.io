// 학과 진로 지도 데이터. 출처 없는 문장은 넣지 않는다. 타 대학 자료를 쓴 곳은 문장에 밝힌다.
// ai(이 학과에서 AI 쓰는 장면)와 roadmap 문구는 출처 자료가 아니라 이 사이트의 제안이다.
const SSU_DEPT = "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/";
const JP_HOME = "https://japanstu.ssu.ac.kr/";
const JP_INTRO = "https://japanstu.ssu.ac.kr/%ED%95%99%EA%B3%BC%EC%95%88%EB%82%B4/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/";
const JP_SSU = SSU_DEPT + "%EC%9D%B8%EB%AC%B8%EB%8C%80%ED%95%99/%EC%9D%BC%EC%96%B4%EC%9D%BC%EB%AC%B8%ED%95%99%EA%B3%BC/";
const AISW_SSU = SSU_DEPT + "ai%EB%8C%80%ED%95%99/ai%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%ED%95%99%EB%B6%80/";
const BIZ = "http://biz.ssu.ac.kr/";
const MJU_BIZ = "https://www.mju.ac.kr/mjukr/625/subview.do";
const STAT_2024 = "https://hangyo.com/news/article.html?no=106232";
const SSU_RATE = "https://sgsg.hankyung.com/article/2026013029461";
const JOB = "http://job.ssu.ac.kr";
const PATH = "https://path.ssu.ac.kr/";
const WESS = "https://wess.ssu.ac.kr/";

window.JOBMAP = {
  checked: "2026년 10월 29일",
  mismatch: "https://dhnews.co.kr/news/view/179521250315407",
  schools: [{ id: "ssu", name: "숭실대학교" }],

  ssu: {
    rate: { label: "숭실대 전체 취업률", value: "67.7%", basis: "2024년 졸업자, 대학알리미 기준 보도", source: SSU_RATE },
    // 숭실대 진로·취업 지원 단계 이름과 대상 학년 (뜻풀이는 출처에 없어서 쓰지 않음)
    stages: { 1: "깨움", 2: "키움", 3: "키움", 4: "이룸" },
    stageSource: "https://dhnews.co.kr/news/view/179523841097956",
    roadmap: {
      1: [{ text: "진로취업센터에서 진로 상담 한 번 받기", url: JOB }, { text: "슈패스에서 비교과 목록 둘러보기", url: PATH }],
      2: [{ text: "직무를 알아보는 비교과 하나 들어 보기", url: PATH }, { text: "고용24 직업심리검사로 흥미 확인", url: JOB }],
      3: [{ text: "현장실습학기제 기업 목록 보기", url: WESS }, { text: "자소서·면접 클리닉 신청", url: JOB }],
      4: [{ text: "채용설명회·채용 공고 챙기기", url: JOB }, { text: "졸업 뒤에도 진로취업센터 지원이 이어져요", url: JOB }]
    },
    resources: [
      { name: "슈패스 (SSU-PATH)", desc: "비교과 조회·신청. 통합 로그인 필요", url: PATH },
      { name: "진로취업센터", desc: "진로 상담, 자소서·면접 클리닉, 채용설명회", url: JOB },
      { name: "현장실습지원센터", desc: "현장실습학기제, 실습 기업 목록", url: WESS },
      { name: "현장실습학기제 한눈에", desc: "작업실에 정리해 둔 신청 흐름과 실습지원비", url: "../internship/" }
    ]
  },

  dirs: ["전공 살리기", "전공 밖도 열어 두기", "아직 모름"],
  worries: ["경험이 하나도 없어요", "하고 싶은 일을 모르겠어요", "스펙이 부족한 것 같아요", "자소서에 쓸 게 없어요", "전공이 취업에 불리할까 봐요"],
  places: ["대기업", "공기업·공공기관", "외국계·해외", "스타트업", "아직 모름"],
  promptTemplate:
`나는 {학과}을 공부하는 대학교 {학년}학년이야.
진로 방향: {방향}
가장 큰 걱정: {걱정}
가고 싶은 곳: {가고싶은곳}

1. 내 전공으로 갈 수 있는 직무를 전공 관련과 전공 무관으로 나눠 5개씩 알려줘.
2. 그중 내 걱정을 덜 수 있는 직무 2개를 골라 이유를 말해줘.
3. 이번 학기에 할 수 있는 일 3개를 작은 것부터 알려줘.
4. 확실하지 않은 정보는 확실하지 않다고 표시해줘.`,

  depts: [
    {
      id: "jp", name: "일어일문학과", college: "인문대학", promptName: "일본어·일본문학 전공",
      intro: "일본어와 일본 문화를 배우고, 통번역·일본학 전문가를 기르는 학과예요.",
      stats: [{ label: "전국 인문계열 취업률", value: "61.1%", basis: "2024년 졸업자, 교육부 취업통계", source: STAT_2024 }],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "통역가·번역가", why: "학과가 내세우는 교육 목표", source: JP_INTRO },
        { name: "일본계 기업 직원", why: "학교 공식 진로에 나와요", source: JP_SSU },
        { name: "무역회사 직원", why: "학과 공식 진로에 나와요", source: JP_INTRO },
        { name: "항공사·여행사 직원", why: "학과 공식 진로에 나와요", source: JP_INTRO },
        { name: "중등 일본어 교사", why: "교직과정을 이수하면 가능해요", source: JP_HOME },
        { name: "대학원·일본 유학", why: "숭실대 대학원에 석·박사 과정이 있어요", source: JP_SSU }
      ],
      off_major_paths: [
        { job: "국내 기업 사무직", why: "학교 공식 진로에 국내 기업이 함께 나와요", source: JP_SSU },
        { job: "해외영업·무역", why: "학과 게시판에 일본 해외영업 채용이 올라와요", source: JP_HOME },
        { job: "은행·금융", why: "학과 게시판에 일본 은행 인턴 공고가 있었어요", source: JP_HOME },
        { job: "일본 현지 IT 취업", why: "다른 대학 일문과가 안내하는 경로예요", source: "https://www.smu.ac.kr/smnihongo/intro/career.do" }
      ],
      employer_types: [
        { type: "일본계 기업", examples: [], source: JP_SSU },
        { type: "무역회사", examples: [], source: JP_INTRO },
        { type: "항공사·여행사", examples: [], source: JP_INTRO },
        { type: "통역이 필요한 공공기관", examples: ["외교부", "코트라", "한국관광공사"], source: "https://www.career.go.kr/cnet/web/counsel/counselView.mdo?SEQ=6395687&TRNSFER_AT=N" }
      ],
      certs: ["JLPT N1", "JPT", "중등 정교사 2급 (교직 이수)"],
      roadmap: {
        1: [{ text: "학과 소모임 키라키라로 JLPT 목표 급수 정하기", url: JP_HOME }],
        2: [{ text: "일본 대학 교환학생·연수 알아보기", url: JP_INTRO }],
        3: [{ text: "학과 채용 게시판에서 일본어 우대 공고 보기", url: JP_HOME }],
        4: [{ text: "JLPT·JPT 점수를 지원서용으로 정리", url: null }]
      },
      ai: [
        { task: "문장 검토", title: "일본어 메일 경어 확인", how: "내가 쓴 메일을 넣고 경어가 맞는지, 왜 고쳤는지 물어봐요." },
        { task: "시험 공부", title: "JLPT 독해 문제 만들기", how: "읽은 기사 수준으로 문제와 해설을 만들고 틀린 문법만 다시 모아요." },
        { task: "업계 조사", title: "일본 기업 뉴스 요약", how: "일본어 기사를 요약시키고 원문과 대조해 번역 실력도 점검해요." }
      ],
      ssu_specific: [
        { name: "일본 교환학생·연수", desc: "일본 대학 교환학생과 어학연수", url: JP_INTRO },
        { name: "학과 소모임", desc: "키라키라(JLPT), 요무요무(원서 읽기), 원어연극, 페라페라(교류)", url: JP_HOME },
        { name: "학과 채용 게시판", desc: "일본어 우대 채용과 인턴 공고", url: JP_HOME }
      ]
    },
    {
      id: "biz", name: "경영학부", college: "경영대학", promptName: "경영학 전공",
      intro: "1959년 문을 연 국내 두 번째 경영학부예요. 졸업생이 5천 명이 넘어요.",
      stats: [{ label: "전국 사회계열 취업률", value: "69.0%", basis: "2024년 졸업자, 교육부 취업통계", source: STAT_2024 }],
      laneOut: "회사 밖으로",
      related_jobs: [
        { name: "인사 (HR)", why: "인적자원관리, 인사·조직 컨설팅 (타 대학 경영학부 안내)", source: MJU_BIZ },
        { name: "마케팅·브랜드", why: "신상품, 브랜드, 홍보·광고 부서 (타 대학 경영학부 안내)", source: MJU_BIZ },
        { name: "재무·금융기관", why: "기업 재무, 은행·증권·보험 (타 대학 경영학부 안내)", source: MJU_BIZ },
        { name: "생산·구매·물류", why: "운영 관리와 공급망 (타 대학 경영학부 안내)", source: MJU_BIZ },
        { name: "회계사·세무사·관세사", why: "숭실대 경영학부가 안내하는 전문자격", source: BIZ + "bbs/list.do?bId=BBS_03_CERTIFICATE" }
      ],
      off_major_paths: [
        { job: "언론기관", why: "경영 전공 진출처로 안내돼요 (타 대학)", source: MJU_BIZ },
        { job: "비영리기관", why: "경영 전공 진출처로 안내돼요 (타 대학)", source: MJU_BIZ },
        { job: "창업", why: "자격을 따거나 창업하는 길도 안내돼요 (타 대학)", source: MJU_BIZ },
        { job: "대학원·경영연구소", why: "교수나 연구원으로 가는 길 (타 대학)", source: MJU_BIZ }
      ],
      employer_types: [
        { type: "일반 기업 (제조·서비스·유통)", examples: [], source: MJU_BIZ },
        { type: "은행·증권사·보험사", examples: [], source: MJU_BIZ },
        { type: "금융 관련 정부기관", examples: ["국세청", "금융감독원"], source: MJU_BIZ }
      ],
      certs: ["공인회계사", "세무사", "관세사", "감정평가사", "공인노무사", "AICPA", "CFA", "사회조사분석사"],
      roadmap: {
        1: [{ text: "인사·마케팅·재무·회계 수업을 하나씩 들어 보기", url: null }],
        2: [{ text: "회계사·세무사 같은 전문자격 준비 여부 정하기", url: BIZ + "bbs/list.do?bId=BBS_03_CERTIFICATE" }],
        3: [{ text: "경영학부 경진대회에 나가 보기", url: BIZ + "bbs/list.do?bId=BBS_03_NEWS" }],
        4: [{ text: "목표 직무에 맞는 자격·점수 정리", url: null }]
      },
      ai: [
        { task: "기업 분석", title: "사업보고서 요약", how: "공시 보고서 일부를 넣고 매출 구조를 요약시켜요. 숫자는 원문에서 다시 확인해요." },
        { task: "데이터", title: "엑셀 수식 도움받기", how: "하고 싶은 분석을 말로 설명하고 받은 수식을 직접 돌려 봐요." },
        { task: "토론", title: "케이스 반론 연습", how: "내 전략 제안을 주고 반대 입장에서 공격해 달라고 해요." }
      ],
      ssu_specific: [
        { name: "경영학부 경진대회", desc: "학부가 여는 공모전", url: BIZ + "bbs/list.do?bId=BBS_03_NEWS" },
        { name: "복수전공·부전공", desc: "다른 학과 학생도 경영을 더 배울 수 있어요", url: BIZ + "jsp/01/06.jsp" }
      ]
    },
    {
      id: "aisw", name: "AI소프트웨어학부", college: "AI대학", promptName: "AI·소프트웨어 전공",
      intro: "소프트웨어·정보보호·인공지능·AI시스템 네 세부전공 중 3학년 때 골라요.",
      stats: [
        { label: "전국 공학계열 취업률", value: "70.4%", basis: "2024년 졸업자, 교육부 취업통계", source: STAT_2024 },
        { label: "숭실대 소프트웨어 전공 취업률", value: "76.8%", basis: "2019년 기준, 입시 기사 보도", source: "https://dhnews.co.kr/news/view/179520401118107" }
      ],
      laneOut: "개발 말고",
      related_jobs: [
        { name: "소프트웨어 개발자", why: "학부 공식 진로에 나와요", source: AISW_SSU },
        { name: "AI·데이터 전문가", why: "학부 공식 진로에 나와요", source: AISW_SSU },
        { name: "시스템·임베디드 전문가", why: "학부 공식 진로에 나와요", source: AISW_SSU },
        { name: "보안 전문가", why: "정보보호 세부전공이 있어요", source: AISW_SSU },
        { name: "공공·국가기관 기술직", why: "학부 공식 진로에 나와요", source: AISW_SSU }
      ],
      off_major_paths: [
        { job: "전산직 공무원", why: "컴퓨터 전공 진출 직종으로 안내돼요 (타 대학)", source: "https://uni.dongseo.ac.kr/computereng/index.php?pCode=MN4000043" },
        { job: "금융기관 IT·전산", why: "컴퓨터 전공 진출 분야로 안내돼요 (타 대학)", source: "https://uni.dongseo.ac.kr/computereng/index.php?pCode=MN4000043" },
        { job: "컴퓨터 강사·교육", why: "SW학과 관련 직업으로 꼽혀요", source: "https://dhnews.co.kr/news/view/179519776477374" },
        { job: "대학원·연구", why: "학부 공식 진로에 연구 분야가 있어요", source: AISW_SSU }
      ],
      employer_types: [
        { type: "IT 플랫폼·산업체·연구소", examples: [], source: AISW_SSU },
        { type: "숭실대 SW계열 졸업생 진출 (2016년 기사)", examples: ["삼성전자", "LG전자", "삼성SDS", "SK텔레콤", "KT", "NHN"], source: "https://dhnews.co.kr/news/view/179515043099434" }
      ],
      certs: ["정보처리기사", "SQLD", "ADsP", "리눅스마스터"],
      roadmap: {
        1: [{ text: "수업 과제 말고 작은 프로젝트 하나 끝내 보기", url: null }],
        2: [{ text: "3학년 세부전공 네 개 미리 비교하기", url: "https://dhnews.co.kr/news/view/1065580336299124" }],
        3: [{ text: "Co-op 집중학기·현장실습 알아보기", url: "https://dhnews.co.kr/news/view/1065580336299124" }],
        4: [{ text: "졸업작품을 포트폴리오로 정리", url: AISW_SSU }]
      },
      ai: [
        { task: "디버깅", title: "에러 이유 설명 듣기", how: "고친 코드 대신 왜 틀렸는지만 물어봐요. 그래야 실력이 남아요." },
        { task: "공부", title: "영어 문서 요약", how: "공식 문서를 요약시키고 모르는 개념만 다시 질문해요." },
        { task: "포트폴리오", title: "프로젝트 설명 다듬기", how: "내 README를 읽기 쉽게 고쳐요. 없는 기능은 쓰지 않아요." }
      ],
      ssu_specific: [
        { name: "SW중심대학", desc: "2024~2029년 재선정, 실무 교육 지원", url: "https://www.dhnews.co.kr/news/view/1065591141289614" },
        { name: "Co-op 집중학기", desc: "전용 실습실에서 실습 중심으로 듣는 학기", url: "https://dhnews.co.kr/news/view/1065580336299124" },
        { name: "경진대회·졸업작품 전시회", desc: "학부 공식 특색 프로그램", url: AISW_SSU }
      ]
    }
  ]
};
