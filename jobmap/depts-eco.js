// 경제통상대학·경영대학 5개 학과 (경영학부 제외)
{
const B = "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/";
const ECON = B + "%EA%B2%BD%EC%A0%9C%ED%86%B5%EC%83%81%EB%8C%80%ED%95%99/%EA%B2%BD%EC%A0%9C%ED%95%99%EA%B3%BC/";
const GT = B + "%EA%B2%BD%EC%A0%9C%ED%86%B5%EC%83%81%EB%8C%80%ED%95%99/%EA%B8%80%EB%A1%9C%EB%B2%8C%ED%86%B5%EC%83%81%ED%95%99%EA%B3%BC/";
const FE = B + "%EA%B2%BD%EC%A0%9C%ED%86%B5%EC%83%81%EB%8C%80%ED%95%99/%EA%B8%88%EC%9C%B5%EA%B2%BD%EC%A0%9C%ED%95%99%EA%B3%BC/";
const AC = B + "%EA%B2%BD%EC%98%81%EB%8C%80%ED%95%99/%ED%9A%8C%EA%B3%84%ED%95%99%EA%B3%BC/";
const VE = B + "%EA%B2%BD%EC%98%81%EB%8C%80%ED%95%99/%EB%B2%A4%EC%B2%98%EC%A4%91%EC%86%8C%EA%B8%B0%EC%97%85%ED%95%99%EA%B3%BC/";
const ET = "https://m.etnews.com/20260618000094";
const HK = "https://www.hknu.ac.kr/SchoolofLBA/1388/subview.do";
const MJ = "https://www.mju.ac.kr/mjukr/625/subview.do";
window.JOBMAP.depts.push(...[
  {
    id: "econ", name: "경제학과", college: "경제통상대학", promptName: "경제학 전공",
    intro: "1954년 개설된 숭실대 경제학과예요.",
    stats: [],
    laneOut: "전공 밖으로",
    related_jobs: [
      { name: "은행·증권·보험사 직원", why: "금융기관이 대표 진로로 소개돼요.", source: ECON },
      { name: "금융공기업 직원", why: "졸업생이 금융공기업에 진출한다고 안내돼요.", source: "https://eco.ssu.ac.kr/page/about.php" },
      { name: "경제·에너지 공공기관 직원", why: "경제·에너지 관련 공공기관이 진로로 나와요.", source: ECON },
      { name: "공무원", why: "공무원이 진로 항목에 올라 있어요.", source: ECON },
      { name: "연구위원·연구원", why: "대학원 진학 뒤 에너지경제연구원 부연구위원이 된 졸업생이 있어요.", source: "https://eco.ssu.ac.kr/page/grad_career.php" }
    ],
    off_major_paths: [
      { job: "일반 기업체 직원", why: "일반 기업체가 진로 항목에 올라 있어요.", source: ECON },
      { job: "공인회계사·세무사", why: "회계사, 세무사가 진로로 소개돼요.", source: ECON },
      { job: "감정평가사·공인노무사", why: "자격 직종으로 함께 소개돼요.", source: ECON }
    ],
    employer_types: [
      { type: "금융기관", examples: [], source: ECON },
      { type: "공공기관·연구기관", examples: ["에너지경제연구원", "원자력 연구원"], source: "https://eco.ssu.ac.kr/page/grad_career.php" },
      { type: "일반 기업체", examples: [], source: ECON }
    ],
    certs: ["공인회계사", "세무사", "보험계리사", "감정평가사", "공인노무사"],
    roadmap: {
      1: [{ text: "복수전공·연계전공을 정해 경제학과 묶어 보세요", url: "https://eco.ssu.ac.kr/" }],
      2: [{ text: "바른취업스쿨 트랙을 살펴보고 진로를 좁혀요", url: "https://eco.ssu.ac.kr/page/about.php" }],
      3: [{ text: "금융공기업·민간금융 트랙 중 하나에 지원해요", url: "https://eco.ssu.ac.kr/page/employ_program_03.php" }],
      4: [{ text: "트랙 멘토와 자소서·면접을 준비해요", url: "https://eco.ssu.ac.kr/page/employ_program_03.php" }]
    },
    ai: [
      { task: "데이터 분석", title: "경제지표 추세 읽기", how: "금리·물가 자료의 변화 요인을 AI와 함께 정리해 보고서 초안을 만들어요." },
      { task: "문헌 정리", title: "논문 요약해 가설 세우기", how: "계량경제학 논문을 요약하고 내 연구 가설과 비교해 쟁점을 뽑아요." },
      { task: "면접 준비", title: "금융권 모의 면접", how: "희망 기관의 최근 이슈로 예상 질문을 만들고 답변을 다듬어요." }
    ],
    ssu_specific: [
      { name: "바른취업스쿨", desc: "2014년 신설된 학과 취업 지원 프로그램이에요.", url: "https://eco.ssu.ac.kr/page/about.php" },
      { name: "금융엘리트취업반", desc: "2019년 신설된 금융권 취업 지원 프로그램이에요.", url: "https://eco.ssu.ac.kr/page/about.php" },
      { name: "민간금융 취업 프로그램", desc: "희망 기관별 멘토를 배정하고 매년 20명을 선발해요.", url: "https://eco.ssu.ac.kr/page/employ_program_03.php" }
    ]
  },
  {
    id: "gtrade", name: "글로벌통상학과", college: "경제통상대학", promptName: "글로벌통상학 전공",
    intro: "동아시아 중심 글로벌통상 전문가를 기르는 학과예요.",
    stats: [],
    laneOut: "전공 밖으로",
    related_jobs: [
      { name: "대기업 해외영업", why: "대기업 해외영업 부서가 진로로 소개돼요.", source: GT },
      { name: "관세사", why: "관세사 자격시험 취득이 진로로 나와요.", source: GT },
      { name: "국제재무관리사", why: "진로 항목에 국제재무관리사가 올라 있어요.", source: GT },
      { name: "손해사정인", why: "진로 항목에 손해사정인이 올라 있어요.", source: GT }
    ],
    off_major_paths: [
      { job: "금융권 직원", why: "금융권이 졸업 후 진로로 소개돼요.", source: GT },
      { job: "정부기관 종사자", why: "정부기관이 진로 항목에 올라 있어요.", source: GT },
      { job: "공인노무사", why: "공인노무사 자격시험 취득이 진로로 나와요.", source: GT }
    ],
    employer_types: [
      { type: "대기업 해외영업 부서", examples: [], source: GT },
      { type: "정부기관", examples: [], source: GT },
      { type: "금융권", examples: [], source: GT }
    ],
    certs: ["국제재무관리사", "손해사정인", "관세사", "공인노무사"],
    roadmap: {
      1: [{ text: "학과 홈페이지에서 GTLP·GTEP 안내를 확인해요", url: "https://gtrade.ssu.ac.kr/" }],
      2: [{ text: "영어와 지역 언어 능력을 함께 쌓기 시작해요", url: "https://gtrade.ssu.ac.kr/" }],
      3: [{ text: "글로벌무역 전문가 양성사업단(GTEP)에 도전해요", url: "https://gtrade.ssu.ac.kr/" }],
      4: [{ text: "Job & Internship 게시판으로 지원처를 찾아요", url: "https://gtrade.ssu.ac.kr/" }]
    },
    ai: [
      { task: "무역 서류", title: "영문 무역 계약서 검토", how: "계약서의 핵심 조항을 AI로 요약하고 모르는 용어를 풀어 확인해요." },
      { task: "시장 조사", title: "수출 대상국 비교", how: "후보 국가의 관세·수요 자료를 표로 정리해 비교해요." },
      { task: "어학", title: "협상 영어 연습", how: "바이어와의 협상 상황을 AI와 역할극으로 연습해요." }
    ],
    ssu_specific: [
      { name: "GTEP", desc: "무역협회 등이 주관하는 글로벌무역 전문가 양성사업단이에요.", url: GT },
      { name: "지역특화청년무역전문가 양성사업단", desc: "2015~2018년 선정된 사업단이에요.", url: GT },
      { name: "무역교육인증 기관", desc: "2010년 국내 최초로 선정됐어요.", url: GT }
    ]
  },
  {
    id: "ecofin", name: "금융경제학과", college: "경제통상대학", promptName: "금융경제학 전공",
    intro: "금융경제 이론과 금융실무를 융합해 가르쳐요.",
    stats: [],
    laneOut: "전공 밖으로",
    related_jobs: [
      { name: "은행·증권·보험사 직원", why: "금융권이 졸업 후 진로로 소개돼요.", source: FE },
      { name: "투자상담사", why: "진로 항목에 투자상담사가 올라 있어요.", source: FE },
      { name: "감정평가사", why: "진로 항목에 감정평가사가 올라 있어요.", source: FE },
      { name: "금융자산관리사", why: "진로 항목에 금융자산관리사가 올라 있어요.", source: FE },
      { name: "경제정책 연구기관 연구원", why: "경제정책 관련 연구기관이 진로로 나와요.", source: FE }
    ],
    off_major_paths: [
      { job: "일반 기업 직원", why: "일반 기업이 진로 항목에 올라 있어요.", source: FE },
      { job: "공공기관 직원", why: "공공기관이 진로 항목에 올라 있어요.", source: FE },
      { job: "세무사", why: "세무사 등 자격 취득이 진로로 나와요.", source: FE }
    ],
    employer_types: [
      { type: "금융권", examples: [], source: FE },
      { type: "일반 기업", examples: [], source: FE },
      { type: "공공기관·연구기관", examples: [], source: FE }
    ],
    certs: ["투자상담사", "감정평가사", "금융자산관리사", "세무사"],
    roadmap: {
      1: [{ text: "학과 홈페이지의 자격증 소개를 살펴봐요", url: "https://ecofinance.ssu.ac.kr/" }],
      2: [{ text: "모의 주식·채권 투자 대회에 참가해요", url: "https://ecofinance.ssu.ac.kr/" }],
      3: [{ text: "은행·보험·증권 분야별 멘토링을 신청해요", url: "https://ecofinance.ssu.ac.kr/" }],
      4: [{ text: "민간금융 취업 프로그램에 지원해요", url: "https://eco.ssu.ac.kr/page/employ_program_03.php" }]
    },
    ai: [
      { task: "투자 분석", title: "모의 투자 종목 검토", how: "재무제표 핵심 수치를 AI로 정리하고 매수 근거를 글로 써 봐요." },
      { task: "시장 조사", title: "글로벌 금융시장 PT 준비", how: "해외 시장 동향 자료를 요약해 발표 흐름을 짜요." },
      { task: "자격시험", title: "자격증 오답 풀이", how: "틀린 문제의 개념을 AI에게 설명받고 비슷한 문제를 다시 풀어요." }
    ],
    ssu_specific: [
      { name: "모의 주식·채권 투자 대회", desc: "학과가 여는 모의 투자 대회예요.", url: FE },
      { name: "분야별 멘토링제", desc: "은행·보험·증권·일반 기업체 분야별로 운영돼요.", url: FE },
      { name: "해외 금융기관 견학", desc: "견학과 문화 체험, 경진대회가 함께 열려요.", url: FE },
      { name: "글로벌 금융시장 조사 PT 발표대회", desc: "조사한 내용을 발표해 겨뤄요.", url: FE }
    ]
  },
  {
    id: "acct", name: "회계학과", college: "경영대학", promptName: "회계학 전공",
    intro: "이론과 실무가 균형 잡힌 회계전문가를 길러요.",
    stats: [],
    laneOut: "전공 밖으로",
    related_jobs: [
      { name: "공인회계사", why: "자격시험을 통한 회계전문가가 진로로 소개돼요.", source: AC },
      { name: "세무사", why: "학과가 세무사 1·2차 합격생에게 등록금을 면제해요.", source: AC },
      { name: "회계·세무 공무원", why: "공무원(회계, 세무)이 진로로 나와요.", source: AC },
      { name: "감정평가사", why: "전문자격인으로 감정평가사가 소개돼요. (타 대학)", source: HK },
      { name: "세무직·재경직 공무원", why: "중앙·지방정부 세무직, 재경직이 진로로 나와요. (타 대학)", source: HK }
    ],
    off_major_paths: [
      { job: "일반 기업 직원", why: "일반 기업이 진로 항목에 올라 있어요.", source: AC },
      { job: "금융권 직원", why: "금융권이 진로 항목에 올라 있어요.", source: AC },
      { job: "경영지도사", why: "전문자격인으로 경영지도사가 소개돼요. (타 대학)", source: HK }
    ],
    employer_types: [
      { type: "회계법인", examples: [], source: AC },
      { type: "일반 기업·금융권", examples: [], source: AC },
      { type: "금융 관련 정부기관", examples: ["국세청", "금융감독원", "증권거래소"], source: MJ }
    ],
    certs: ["공인회계사", "세무사"],
    roadmap: {
      1: [{ text: "회계 전문가 특강과 학과 워크숍에 참여해요", url: "http://accounting.ssu.ac.kr/" }],
      2: [{ text: "공인회계사·세무공무원 시험 설명회를 들어요", url: "http://accounting.ssu.ac.kr/" }],
      3: [{ text: "현의제(공인회계사 시험준비반)를 알아봐요", url: "http://accounting.ssu.ac.kr/" }],
      4: [{ text: "회계법인 인턴십이나 공무원 양성과정을 선택해요", url: "http://accounting.ssu.ac.kr/" }]
    },
    ai: [
      { task: "자료 정리", title: "재무제표 항목 비교", how: "여러 해의 재무제표를 표로 모아 증감 이유를 짚어 봐요." },
      { task: "시험 공부", title: "회계 기준 개념 풀이", how: "헷갈리는 기준서 내용을 쉬운 예시로 설명받아요." },
      { task: "세무 실습", title: "세법 사례 요약", how: "세법 조문을 사례별로 정리해 핵심 쟁점을 확인해요." }
    ],
    ssu_specific: [
      { name: "현의제", desc: "공인회계사 시험준비반이에요.", url: "http://accounting.ssu.ac.kr/" },
      { name: "회계법인 인턴십", desc: "학과 특별 프로그램으로 운영돼요.", url: AC },
      { name: "합격생 등록금 면제", desc: "공인회계사·세무사 1·2차 합격생은 전액 또는 반액을 면제받아요.", url: AC },
      { name: "시험 설명회", desc: "공인회계사와 세무공무원 시험 설명회가 열려요.", url: AC }
    ]
  },
  {
    id: "venture", name: "벤처중소기업학과", college: "경영대학", promptName: "벤처중소기업학 전공",
    intro: "1995년 국내 최초로 개설된 창업·중소기업 학과예요.",
    stats: [],
    laneOut: "전공 밖으로",
    related_jobs: [
      { name: "스타트업 창업가", why: "창업이 졸업 후 진로로 소개돼요.", source: VE },
      { name: "벤처캐피탈 대표", why: "동문 중에 벤처캐피탈 대표가 있어요.", source: ET },
      { name: "액셀러레이터 대표", why: "동문 중에 액셀러레이터 대표가 있어요.", source: ET },
      { name: "신사업 기획 담당자", why: "유망 기술 기업의 신사업 기획 직무가 진로로 나와요.", source: ET },
      { name: "연구소 연구원", why: "연구소가 진로 항목에 올라 있어요.", source: VE }
    ],
    off_major_paths: [
      { job: "금융권 직원", why: "금융권이 진로 항목에 올라 있어요.", source: VE },
      { job: "언론사 직원", why: "언론사가 진로 항목에 올라 있어요.", source: VE },
      { job: "유통·물류 기업 직원", why: "유통·물류 기업이 진로 항목에 올라 있어요.", source: VE },
      { job: "마케팅·홍보 직무", why: "마케팅 홍보 관련 회사가 진로로 나와요.", source: VE }
    ],
    employer_types: [
      { type: "스타트업·유망 기술 기업", examples: [], source: ET },
      { type: "금융권·언론사", examples: [], source: VE },
      { type: "유통·물류·마케팅 홍보 회사", examples: [], source: VE }
    ],
    certs: [],
    roadmap: {
      1: [{ text: "5개 트랙을 살펴보고 관심 분야를 정해요", url: "http://ensb.ssu.ac.kr/" }],
      2: [{ text: "창업동아리나 공유 멘토링에 참여해요", url: "http://ensb.ssu.ac.kr/" }],
      3: [{ text: "창업 아카데미와 사업계획서 경진대회에 도전해요", url: VE }],
      4: [{ text: "스타트업 인턴십이나 글로벌 시장 탐방을 가요", url: ET }]
    },
    ai: [
      { task: "사업 기획", title: "고객 인터뷰 정리", how: "인터뷰 기록을 AI로 묶어 고객 불편 사항을 뽑아내요." },
      { task: "시장 분석", title: "경쟁사 비교표 만들기", how: "비슷한 서비스를 모아 가격과 강점을 표로 비교해요." },
      { task: "자료 작성", title: "사업계획서 초안 다듬기", how: "내가 쓴 초안의 빈틈을 AI에게 질문받으며 보완해요." }
    ],
    ssu_specific: [
      { name: "슈퍼스타 창업경진대회", desc: "학과 비교과 창업 프로그램이에요.", url: ET },
      { name: "스타트업 인턴십", desc: "벤처기업 인턴십을 지원해요.", url: ET },
      { name: "글로벌 시장 탐방", desc: "학과 특별 프로그램이에요.", url: VE },
      { name: "창업휴학제·창업대체학점제", desc: "창업을 학업과 병행하도록 돕는 제도예요.", url: ET }
    ]
  }
]);
}
// 못 찾은 것: 커리어넷 근거 없음(JS 렌더링), 학과 고유 통계 없음, 글로벌통상 GTEP 세부·졸업생 취업 기관명 없음,
// 국제무역학과가 경제통상대학 목록에 함께 나옴(미확인), 금융학부는 경영대학 소속.
