// 자연과학대학 5개 학과 + IT대학 전자정보공학부·글로벌미디어학부. 조사 2026-10-29.
{
const U = "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/";
const NS = U + "%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/";
const MATH = NS + "%ec%88%98%ed%95%99%ea%b3%bc/";
const PHYS = NS + "%eb%ac%bc%eb%a6%ac%ed%95%99%ea%b3%bc/";
const CHEM = NS + "%ed%99%94%ed%95%99%ea%b3%bc/";
const STAT = NS + "%ec%a0%95%eb%b3%b4%ed%86%b5%ea%b3%84-%c2%b7-%eb%b3%b4%ed%97%98%ec%88%98%eb%a6%ac%ed%95%99%ea%b3%bc/";
const BIO = NS + "%ec%9d%98%ec%83%9d%eb%aa%85%ec%8b%9c%ec%8a%a4%ed%85%9c%ed%95%99%eb%b6%80/";
const EE = U + "it%eb%8c%80%ed%95%99/%ec%a0%84%ec%9e%90%ea%b3%b5%ed%95%99%ec%a0%84%ea%b3%b5/";
const ITC = U + "it%eb%8c%80%ed%95%99/it%ec%9c%b5%ed%95%a9%ec%a0%84%ea%b3%b5/";
const MEDIA = U + "it%eb%8c%80%ed%95%99/%ea%b8%80%eb%a1%9c%eb%b2%8c%eb%af%b8%eb%94%94%ec%96%b4%ed%95%99%eb%b6%80/";
const MJOB = "https://math.ssu.ac.kr/?page_id=1484";
const MINTRO = "https://math.ssu.ac.kr/?page_id=942";
const DH1 = "https://dhnews.co.kr/news/view/179524478622713";
const DH2 = "https://dhnews.co.kr/news/view/179524429119418";
const DHM = "https://dhnews.co.kr/news/view/179514403932199";
const MJU = "https://www.mju.ac.kr/mjukr/742/subview.do";
const PNU = "https://chem.pusan.ac.kr/chem/63142/subview.do";
const E = [];

window.JOBMAP.depts.push(...[
{
  id: "math", name: "수학과", college: "자연과학대학", promptName: "수학 전공",
  intro: "순수·응용수학을 배워 연구와 실무로 나가요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "대학 교수·연구원", why: "대학원 진학 뒤 수학 연구를 이어가요", source: MATH },
    { name: "중·고등학교 수학 교사", why: "교직과정을 이수해 교사로 나가요", source: MINTRO },
    { name: "보험계리사", why: "숭실대 수학과 진로 안내에 직업으로 소개돼요", source: MJOB },
    { name: "정보보안·컴퓨터 관련 기업 종사자", why: "암호학 등을 살려 보안 분야로 가요", source: MINTRO },
    { name: "생물통계학자", why: "수학과 진로탐색 자료에 소개된 직업이에요", source: MJOB }
  ],
  off_major_paths: [
    { job: "금융(은행·보험·증권)", why: "학과 안내에 금융 업계 진출이 나와요", source: MATH },
    { job: "공인회계사·세무사", why: "학과 안내에 전문 자격 분야로 나와요", source: MATH },
    { job: "예산분석가", why: "수학 관련 직업으로 학과가 소개해요", source: MJOB },
    { job: "변호사", why: "수학 관련 직업으로 학과가 소개해요", source: MJOB }
  ],
  employer_types: [
    { type: "금융 업계", examples: E, source: MATH },
    { type: "일반 기업·정보보안·컴퓨터 관련 기업", examples: E, source: MATH },
    { type: "학교·연구기관", examples: E, source: MATH }
  ],
  certs: ["보험계리사", "공인회계사", "세무사", "중등학교 정교사(교직과정)"],
  roadmap: {
    1: [{ text: "수학과 진로탐색의 수학 관련 직업 소개를 읽어봐요", url: MJOB }],
    2: [{ text: "순수·응용수학 중 끌리는 쪽을 정해 전공 수업을 골라요", url: MINTRO }],
    3: [{ text: "교직·금융·대학원 중 한 길을 정해 준비를 시작해요", url: "https://math.ssu.ac.kr/?page_id=1308" }],
    4: [{ text: "학과 채용추천·인턴 게시판을 확인하며 지원해요", url: "https://math.ssu.ac.kr/?page_id=1291" }]
  },
  ai: [
    { task: "증명 검토", title: "막힌 증명 점검하기", how: "내가 쓴 증명을 AI에게 보여주고 비약된 단계를 찾아달라고 해요." },
    { task: "수치 실험", title: "수치해석 코드 만들기", how: "알고리즘 아이디어를 설명하고 파이썬 실험 코드 초안을 받아 결과를 검증해요." },
    { task: "논문 읽기", title: "영어 논문 정리하기", how: "수학 논문의 정리와 기호를 쉬운 말로 풀어 달라고 해 읽는 시간을 줄여요." }
  ],
  ssu_specific: [
    { name: "Towson University 등 해외 대학 교류", desc: "해외 대학과 교류하는 프로그램이 있어요", url: MATH },
    { name: "전산실습실·응용수학연습실", desc: "튜터링과 스터디를 하는 학과 공간이에요", url: MATH },
    { name: "수학 관련 직업 소개(진로탐색)", desc: "학과가 직업별로 정리한 게시판이에요", url: MJOB }
  ]
},
{
  id: "physics", name: "물리학과", college: "자연과학대학", promptName: "물리 전공",
  intro: "자연 현상을 이론과 실험으로 이해하는 학과예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "국책기관·기업 연구원", why: "학과 안내에 연구직 진로로 나와요", source: PHYS },
    { name: "중등 물리 교사", why: "중등교사 2급 정교사 자격을 얻을 수 있어요", source: PHYS },
    { name: "반도체 기업 종사자", why: "학과 안내에 산업 진로로 나와요", source: PHYS },
    { name: "에너지·환경 기업 종사자", why: "학과 안내에 산업 진로로 나와요", source: PHYS }
  ],
  off_major_paths: [
    { job: "변리사", why: "학과 안내에 전문 자격 진로로 나와요", source: PHYS },
    { job: "금융 분석가", why: "학과 안내에 금융 분야 진로로 나와요", source: PHYS },
    { job: "컴퓨터·인터넷 기업 종사자", why: "물리학과 졸업생이 컴퓨터·인터넷 회사로도 가요 (타 대학)", source: "https://www.konkuk.ac.kr/bulletins26/36921/subview.do" }
  ],
  employer_types: [
    { type: "반도체·에너지·환경 기업", examples: E, source: PHYS },
    { type: "국책기관·기업 연구소", examples: E, source: PHYS },
    { type: "학과 취업 게시판에 채용 공고가 올라온 기업(2023)", examples: ["에드워드코리아", "팀네이버", "쎄트렉아이"], source: "https://physics.ssu.ac.kr" }
  ],
  certs: ["중등학교 정교사 2급(교직과정)", "변리사"],
  roadmap: {
    1: [{ text: "물리학과 학생안내와 교과과정에서 전공 흐름을 파악해요", url: "https://physics.ssu.ac.kr" }],
    2: [{ text: "양자나노융합전공·인공지능반도체융합전공을 살펴봐요", url: "https://physics.ssu.ac.kr" }],
    3: [{ text: "학술세미나에 참석하며 관심 연구 분야를 좁혀요", url: "https://physics.ssu.ac.kr" }],
    4: [{ text: "졸업논문을 쓰며 취업정보 게시판의 공고를 확인해요", url: "https://physics.ssu.ac.kr" }]
  },
  ai: [
    { task: "실험 데이터", title: "측정값 오차 분석하기", how: "실험 데이터를 정리해 그래프와 오차 분석 코드를 AI와 함께 만들어요." },
    { task: "수식 풀이", title: "풀이 과정 검산하기", how: "내가 푼 역학·전자기 풀이를 보여주고 틀린 단계를 짚어달라고 해요." },
    { task: "시뮬레이션", title: "물리 모형 시뮬레이션", how: "운동 방정식을 말로 설명하면 수치 시뮬레이션 코드 초안을 받아요." }
  ],
  ssu_specific: [
    { name: "양자나노융합전공", desc: "물리학과가 운영하는 융합전공이에요", url: "https://physics.ssu.ac.kr" },
    { name: "인공지능반도체융합전공", desc: "물리학과가 운영하는 융합전공이에요", url: "https://physics.ssu.ac.kr" },
    { name: "졸업논문 프로그램", desc: "학과에서 졸업논문 일정과 공지를 안내해요", url: "https://physics.ssu.ac.kr" }
  ]
},
{
  id: "chem", name: "화학과", college: "자연과학대학", promptName: "화학 전공",
  intro: "분자변환 연구로 화학 전문가를 기르는 학과예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "제약회사 연구·개발직", why: "학과 안내에 제약회사 진로가 나와요", source: CHEM },
    { name: "고분자·신소재 기업 종사자", why: "학과 안내에 관련 기업 진로가 나와요", source: CHEM },
    { name: "석유화학회사 종사자", why: "학과 안내에 석유화학회사 진로가 나와요", source: CHEM },
    { name: "연구소 연구원", why: "학과 안내에 연구소 진로가 나와요", source: CHEM },
    { name: "교사", why: "학과 안내에 교사 진로가 나와요", source: CHEM }
  ],
  off_major_paths: [
    { job: "변리사", why: "화학 전공자의 진로로 안내돼요 (타 대학)", source: "https://hknu.ac.kr/hkfoodbio/1977/subview.do" },
    { job: "화공직·환경직 공무원", why: "화학과 졸업 후 공무원 진로가 안내돼요 (타 대학)", source: PNU },
    { job: "식품의약품안전처 등 정부기관", why: "화학과 진로 예시로 정부기관이 나와요 (타 대학)", source: PNU }
  ],
  employer_types: [
    { type: "제약·고분자·신소재·석유화학 기업", examples: E, source: CHEM },
    { type: "연구소·학교", examples: E, source: CHEM }
  ],
  certs: ["변리사 (타 대학 안내)"],
  roadmap: {
    1: [{ text: "일반화학 및 실험 자료로 기초를 다져요", url: "https://chem.ssu.ac.kr" }],
    2: [{ text: "전공 교과목과 학년별 교과내용으로 수강 계획을 짜요", url: "https://chem.ssu.ac.kr" }],
    3: [{ text: "학과 세미나에 참석해 관심 분야를 찾아요", url: "https://chem.ssu.ac.kr" }],
    4: [{ text: "졸업논문 프로그램으로 연구 경험을 쌓아요", url: "https://chem.ssu.ac.kr" }]
  },
  ai: [
    { task: "스펙트럼 해석", title: "분석 결과 읽기", how: "NMR·IR 데이터를 정리해 주고 가능한 구조 후보를 함께 따져봐요." },
    { task: "실험 설계", title: "실험 조건 정리하기", how: "합성 목표를 설명하고 변수와 대조군을 점검받아요." },
    { task: "문헌 조사", title: "다공성 재료 논문 요약", how: "영어 논문의 방법과 결과를 표로 요약해 비교해요." }
  ],
  ssu_specific: [
    { name: "분자인식센서·다공성 나노재료 연구", desc: "교과에서 합성과 응용을 폭넓게 다뤄요", url: CHEM },
    { name: "졸업논문 프로그램", desc: "학과가 졸업논문 발표회를 운영해요", url: "https://chem.ssu.ac.kr" },
    { name: "학과 세미나", desc: "초청 강연 세미나가 정기적으로 열려요", url: "https://chem.ssu.ac.kr" }
  ]
},
{
  id: "infostat", name: "정보통계·보험수리학과", college: "자연과학대학", promptName: "정보통계·보험수리 전공",
  intro: "통계와 보험수리를 함께 배우는 국내 유일 학과예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "보험계리사", why: "보험수리 트랙이 시험 준비를 지원해요", source: DH1 },
    { name: "생명·손해보험사 종사자", why: "졸업생이 보험사에 취업한다고 소개돼요", source: DH1 },
    { name: "계리법인 종사자", why: "졸업생 취업처로 소개돼요", source: DH1 },
    { name: "증권회사·은행 종사자", why: "학과 안내에 금융권 진로가 나와요", source: STAT },
    { name: "리서치 기관·기업 분석가", why: "학과 안내에 리서치 기관 진로가 나와요", source: STAT }
  ],
  off_major_paths: [
    { job: "데이터 분석가", why: "학과장이 데이터 전문 인력 수요를 전망해요", source: DH1 },
    { job: "리서치 전문가", why: "학과 안내에 리서치 기관 진로가 나와요", source: STAT },
    { job: "연금·금융 리스크 분야", why: "고령화로 연금 중요성이 커진다고 소개돼요", source: DH1 }
  ],
  employer_types: [
    { type: "생명·손해보험사", examples: E, source: DH1 },
    { type: "계리법인", examples: E, source: DH1 },
    { type: "증권회사·은행·리서치 기관", examples: E, source: STAT }
  ],
  certs: ["보험계리사 (1차 합격 시 2학기 등록금 반액 장학금)"],
  roadmap: {
    1: [{ text: "통계·보험수리 기초과목으로 두 트랙을 미리 살펴봐요", url: null }],
    2: [{ text: "정보통계트랙과 보험수리트랙 중 하나를 골라요", url: DH1 }],
    3: [{ text: "계리실무 수업에서 Prophet으로 모형을 익혀요", url: DH2 }],
    4: [{ text: "캡스톤디자인으로 보험계리 모델을 직접 만들어요", url: DH1 }]
  },
  ai: [
    { task: "데이터 분석", title: "회귀모형 결과 해석", how: "분석 결과표를 보여주고 계수 의미와 가정 위반을 점검받아요." },
    { task: "계리 모형", title: "사망률 모형 코드 검토", how: "생명표 계산 코드를 설명하고 오류와 개선점을 찾아요." },
    { task: "보고서 작성", title: "분석 결과 요약하기", how: "통계 결과를 비전공자도 읽을 한 장짜리 요약으로 다듬어요." }
  ],
  ssu_specific: [
    { name: "보험계리사 시험 지원", desc: "고시반·특강, 강의료·응시비 지원, 1차 합격 시 장학금이 있어요", url: DH1 },
    { name: "보험수리트랙 SOA 인증", desc: "북미보험계리사협회에서 우수 프로그램 인증을 받았어요", url: DH1 },
    { name: "Towson University 공동 연계전공", desc: "보험계리/리스크관리를 공동 운영해요", url: DH2 },
    { name: "빅데이터·AI모빌리티 융합전공", desc: "학과가 운영하는 융합전공이에요", url: DH1 }
  ]
},
{
  id: "biosys", name: "의생명시스템학부", college: "자연과학대학", promptName: "의생명시스템 전공",
  intro: "생명공학과 정보기술을 아우르는 융합형 학부예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "생명과학 기관·연구소 연구원", why: "학부 안내에 기관·연구소 진로가 나와요", source: BIO },
    { name: "제약회사 종사자", why: "학부 안내에 제약 회사 진로가 나와요", source: BIO },
    { name: "식품·화장품 기업 종사자", why: "학부 안내에 식품·화장품 기업이 나와요", source: BIO },
    { name: "환경 기업 종사자", why: "학부 안내에 환경 기업 진로가 나와요", source: BIO },
    { name: "생물정보학자", why: "생명정보학 전공 진로로 소개돼요 (타 대학)", source: MJU }
  ],
  off_major_paths: [
    { job: "의료정보 분석가", why: "생명정보 계열 진로로 안내돼요 (타 대학)", source: MJU },
    { job: "규제 업무(RA)", why: "생명과학 계열의 기업 직무로 안내돼요 (타 대학)", source: MJU },
    { job: "임상 연구 코디네이터", why: "생명과학 계열 진로로 안내돼요 (타 대학)", source: MJU }
  ],
  employer_types: [
    { type: "식품·제약·화장품·환경 기업", examples: E, source: BIO },
    { type: "생명과학 관련 기관·연구소", examples: E, source: BIO }
  ],
  certs: [],
  roadmap: {
    1: [{ text: "생명과학과 컴퓨터 기초과목을 함께 들어요", url: null }],
    2: [{ text: "생명공학·생명정보학 전공 중 하나를 골라요", url: BIO }],
    3: [{ text: "마에스트로 인증과 기업체 견학에 참여해요", url: BIO }],
    4: [{ text: "논문지도교수와 연구를 하며 진학·취업을 정해요", url: BIO }]
  },
  ai: [
    { task: "유전체 분석", title: "서열 분석 코드 짜기", how: "분석 목표를 설명하고 파이썬 분석 파이프라인 초안을 받아요." },
    { task: "논문 읽기", title: "단백질 논문 요약", how: "영어 논문의 실험 방법과 핵심 결과를 표로 정리해요." },
    { task: "실험 기록", title: "실험 결과 그래프 정리", how: "측정 데이터를 보여주고 적절한 시각화와 통계 검정을 제안받아요." }
  ],
  ssu_specific: [
    { name: "마에스트로 인증 제도", desc: "학부가 운영하는 특별 프로그램이에요", url: BIO },
    { name: "기업체 견학", desc: "학부가 운영하는 특별 프로그램이에요", url: BIO },
    { name: "논문지도교수제", desc: "학부가 운영하는 특별 프로그램이에요", url: BIO }
  ]
},
{
  id: "ee", name: "전자정보공학부", college: "IT대학", promptName: "전자정보공학 전공",
  // 전자공학전공 / IT융합전공 두 전공으로 구성
  intro: "전자공학과 IT융합 기술을 배우는 학부예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "대기업 전자·IT 엔지니어", why: "전자공학전공 진로에 대기업이 나와요", source: EE },
    { name: "벤처·중소·중견기업 엔지니어", why: "두 전공 모두 진로 안내에 나와요", source: ITC },
    { name: "외국계 기업 엔지니어", why: "IT융합전공 진로 안내에 나와요", source: ITC },
    { name: "국책·국공립 연구소 연구원", why: "두 전공 모두 연구소 진로가 나와요", source: EE },
    { name: "공기업 직원", why: "전자공학전공 진로에 공기업이 나와요", source: EE }
  ],
  off_major_paths: [
    { job: "변리사", why: "전자공학전공 진로 안내에 나와요", source: EE },
    { job: "창업", why: "전자공학전공 진로 안내에 나와요", source: EE },
    { job: "교육기관 종사자", why: "전자공학전공 진로 안내에 나와요", source: EE }
  ],
  employer_types: [
    { type: "대기업·벤처·중소·중견·외국계 기업", examples: E, source: ITC },
    { type: "공기업·국책·국공립 연구소", examples: E, source: EE },
    { type: "산학협력트랙 연계 기업", examples: ["LG디스플레이"], source: EE }
  ],
  certs: ["변리사"],
  roadmap: {
    1: [{ text: "1:1 전공 도우미와 튜터링으로 기초를 다져요", url: null }],
    2: [{ text: "창의적 공학설계 경진대회에 팀으로 나가요", url: null }],
    3: [{ text: "LG디스플레이 연계 트랙 등 산학협력트랙을 알아봐요", url: EE }],
    4: [{ text: "취업 멘토링으로 진로를 정리해 지원해요", url: null }]
  },
  ai: [
    { task: "회로 설계", title: "회로 시뮬레이션 점검", how: "설계한 회로와 시뮬레이션 결과를 설명하고 오류 원인을 함께 찾아요." },
    { task: "임베디드 코드", title: "제어 코드 디버깅", how: "마이크로컨트롤러 코드를 붙여넣고 버그와 개선점을 짚어달라고 해요." },
    { task: "데이터시트", title: "부품 사양서 읽기", how: "영문 데이터시트의 핵심 사양을 표로 요약해 부품을 비교해요." }
  ],
  ssu_specific: [
    { name: "산학협력트랙(LG디스플레이)", desc: "기업과 연계한 트랙을 운영해요", url: EE },
    { name: "국제전자박람회 참관", desc: "글로벌 프로그램의 하나로 운영돼요", url: EE },
    { name: "창의적 공학설계 경진대회", desc: "학부가 여는 설계 경진대회예요", url: EE },
    { name: "IT 교육봉사단·IT 실무강좌", desc: "실무 교육과 봉사를 함께 해요", url: ITC }
  ]
},
{
  id: "media", name: "글로벌미디어학부", college: "IT대학", promptName: "글로벌미디어 전공",
  intro: "IT와 창의성을 융합해 미디어를 만드는 학부예요",
  stats: [], laneOut: "전공 밖으로",
  related_jobs: [
    { name: "소프트웨어 개발자", why: "학부 안내에 SW 개발 대기업 진로가 나와요", source: MEDIA },
    { name: "게임 개발자", why: "학부 안내에 게임 개발사 진로가 나와요", source: MEDIA },
    { name: "웹·모바일 앱 프로그래머", why: "학부 안내에 진로로 나와요", source: MEDIA },
    { name: "서비스 기획자", why: "졸업생 진로로 기획자가 소개돼요 (2015년 기사)", source: DHM },
    { name: "대학원 연구자", why: "대학원 진학 후 연구자의 길이 소개돼요 (2015년 기사)", source: DHM }
  ],
  off_major_paths: [
    { job: "벤처 창업", why: "졸업생 진로로 창업이 소개돼요 (2015년 기사)", source: DHM },
    { job: "미디어 융합 콘텐츠 제작", why: "융합 전문 기업 취업이 소개돼요 (2015년 기사)", source: DHM },
    { job: "웹디자인·콘텐츠 분야", why: "중소기업 진출 분야로 소개돼요 (2015년 기사)", source: DHM }
  ],
  employer_types: [
    { type: "소프트웨어 대기업·IT 기업", examples: ["삼성", "LG", "SK", "CJ", "Google Korea"], source: DHM },
    { type: "게임 개발사", examples: ["NCSoft", "Nexon", "NHN엔터테인먼트", "스마일게이트"], source: DHM },
    { type: "미디어 융합 전문 기업", examples: ["디스트릭트", "바이널"], source: DHM }
  ],
  certs: [],
  roadmap: {
    1: [{ text: "디지털미디어원리·자료구조로 IT와 미디어 기초를 쌓아요", url: null }],
    2: [{ text: "프로그래밍·게임·그래픽스 등 트랙을 정해요", url: null }],
    3: [{ text: "학회·소모임에서 팀 프로젝트와 해커톤에 나가요", url: "https://media.ssu.ac.kr" }],
    4: [{ text: "졸업작품 전시를 준비하고 IT 인턴십에 지원해요", url: "https://media.ssu.ac.kr" }]
  },
  ai: [
    { task: "아이디어 발상", title: "콘텐츠 기획 브레인스토밍", how: "인터랙티브 작품 주제를 던지고 컨셉 후보를 여러 개 받아 골라요." },
    { task: "프로그래밍", title: "게임 로직 코드 초안", how: "게임 규칙을 말로 설명하고 프로토타입 코드를 받아 고쳐 써요." },
    { task: "에셋 제작", title: "시안 참고 이미지 만들기", how: "원하는 분위기를 글로 설명해 시안 이미지를 만들고 직접 다듬어요." }
  ],
  ssu_specific: [
    { name: "삼성 소프트웨어 트랙(SST)·IBM 코리아 산학연 프로그램", desc: "방학 중 집중 SW 교육을 받아요", url: MEDIA },
    { name: "한–EU 교육협력사업 국비 교환학생", desc: "한국연구재단과 EU 지원 교환학생이에요", url: MEDIA },
    { name: "졸업작품 전시 THE BLOOM", desc: "미디어 아트와 공학을 보여주는 전시예요", url: "https://media.ssu.ac.kr" },
    { name: "24시간 개방 실습실", desc: "전공 소모임을 위한 실습 공간이에요", url: MEDIA }
  ]
}
]);
}
