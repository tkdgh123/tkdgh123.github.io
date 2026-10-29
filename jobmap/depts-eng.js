// 공과대학 5개 학과 (화학공학과, 전기공학부, 기계공학부, 산업·정보시스템공학과, 건축학부)
(function () {
  const S = "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/%EA%B3%B5%EA%B3%BC%EB%8C%80%ED%95%99/";
  const CHE = S + "%ED%99%94%ED%95%99%EA%B3%B5%ED%95%99%EA%B3%BC/";
  const EE = S + "%EC%A0%84%EA%B8%B0%EA%B3%B5%ED%95%99%EB%B6%80/";
  const ME = S + "%EA%B8%B0%EA%B3%84%EA%B3%B5%ED%95%99%EB%B6%80/";
  const IISE = S + "%EC%82%B0%EC%97%85%C2%B7%EC%A0%95%EB%B3%B4%EC%8B%9C%EC%8A%A4%ED%85%9C%EA%B3%B5%ED%95%99%EA%B3%BC/";
  const IISEC = "https://iise.ssu.ac.kr/intro/career/";
  const ARCH = S + "%EA%B1%B4%EC%B6%95%ED%95%99%EB%B6%80/";
  const PAT = "https://www.career.go.kr/cloud/m/job/view?seq=374";
  const MECOUNSEL = "https://www.career.go.kr/cnet/web/counsel/counselView.mdo?SEQ=6422243&TRNSFER_AT=N";

  const DEPTS = [
    {
      id: "chemeng", name: "화학공학과", college: "공과대학", promptName: "화학공학 전공",
      intro: "NT·ET·BT·IT를 접목한 화공 엔지니어를 길러요.",
      stats: [],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "화학공학 기술자", why: "석유화학·환경 분야 기업에 입사하는 경우가 일반적이에요. (커리어넷)", source: "https://www.career.go.kr/cloud/w/job/view?seq=952" },
        { name: "석유화학회사 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: CHE },
        { name: "제약회사 연구·생산직", why: "학과 소개에 진출 분야로 올라 있어요.", source: CHE },
        { name: "고분자·신소재 기업 연구원", why: "학과 소개에 진출 분야로 올라 있어요.", source: CHE },
        { name: "연구소 연구원", why: "연구설계 분야는 대개 석사 이상을 요구해요. (커리어넷)", source: "https://www.career.go.kr/cloud/w/job/view?seq=952" },
        { name: "교직", why: "학과 소개에 진출 분야로 올라 있어요.", source: CHE }
      ],
      off_major_paths: [
        { job: "변리사", why: "화학과·산업공학과 등 이공계 전공이 유리해요. (커리어넷)", source: PAT }
      ],
      employer_types: [
        { type: "제약회사", examples: [], source: CHE },
        { type: "석유화학회사", examples: [], source: CHE },
        { type: "고분자·신소재 관련 기업", examples: [], source: CHE },
        { type: "연구소", examples: [], source: CHE }
      ],
      certs: ["화공기사 (커리어넷)", "화학분석기사 (커리어넷)", "화공산업기사 (커리어넷)"],
      roadmap: {
        1: [{ text: "학과 홈페이지에서 학부 연구생과 화학 자격증 지원 제도를 확인해요", url: CHE }],
        2: [{ text: "화학 관련 자격증(화학분석기사 등) 준비를 시작해요", url: "https://www.career.go.kr/cloud/w/job/view?seq=952" }],
        3: [{ text: "학부 연구생으로 실험실에 들어가 연구 경험을 쌓아요", url: CHE }],
        4: [{ text: "졸업 논문 발표회를 준비하며 취업과 대학원 중 진로를 정해요", url: CHE }]
      },
      ai: [
        { task: "공정 모델링", title: "반응기 시뮬레이션 결과 해석", how: "시뮬레이션 수치를 붙여 넣고 변수별 영향과 이상치를 정리해 달라고 해요." },
        { task: "문헌 조사", title: "신소재 논문 빠르게 읽기", how: "영문 논문 초록을 요약시키고 실험 조건 차이를 표로 비교해요." },
        { task: "실험 보고서", title: "실험 데이터 정리와 오차 분석", how: "측정값을 주고 그래프 구성과 오차 원인 후보를 제안받아 직접 검증해요." }
      ],
      ssu_specific: [
        { name: "학부 연구생 지원", desc: "학부생이 실험실 연구에 참여하도록 지원해요.", url: CHE },
        { name: "화학 관련 자격증 지원", desc: "학과 특별 프로그램으로 안내돼 있어요.", url: CHE },
        { name: "논문지도교수제·졸업 논문 발표회", desc: "지도교수와 졸업 논문을 준비해 발표해요.", url: CHE },
        { name: "양자나노융합전공", desc: "학과 특별 프로그램으로 안내된 융합전공이에요.", url: CHE }
      ]
    },
    {
      id: "electrical", name: "전기공학부", college: "공과대학", promptName: "전기공학 전공",
      intro: "전기에너지를 책임질 인재를 길러요.",
      stats: [],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "전기 관련 공무원", why: "학과 소개에 진출 분야로 올라 있어요.", source: EE },
        { name: "전력 회사 전기 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: EE },
        { name: "건설 회사 전기 담당", why: "학과 소개에 진출 분야로 올라 있어요.", source: EE },
        { name: "전자 회사 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: EE },
        { name: "자동차 회사 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: EE },
        { name: "전기공학 기술자·연구원", why: "연구·개발 업무는 석사 이상이 필요해요. (커리어넷)", source: "https://www.career.go.kr/cnet/front/base/job/jobView.do?SEQ=114" }
      ],
      off_major_paths: [
        { job: "변리사", why: "전기공학 등 이공계 전공이 유리해요. (커리어넷)", source: PAT }
      ],
      employer_types: [
        { type: "공무원·공사", examples: [], source: EE },
        { type: "전력·건설·전자·자동차 회사", examples: [], source: EE },
        { type: "디스플레이 기업", examples: ["LG 디스플레이"], source: EE }
      ],
      certs: ["전기기사 (커리어넷)", "전기산업기사 (커리어넷)", "전기공사기사 (커리어넷)", "전기안전기술사 (커리어넷)"],
      roadmap: {
        1: [{ text: "진로지도교수와 정기 상담을 잡고 전기 분야 진로를 탐색해요", url: EE }],
        2: [{ text: "에너지공학융합전공 트랙과 디스플레이 트랙 중 선택해요", url: EE }],
        3: [{ text: "전기기사 등 전기 관련 국가자격 준비를 시작해요", url: "https://www.career.go.kr/cnet/front/base/job/jobView.do?SEQ=114" }],
        4: [{ text: "디스플레이 트랙 장기 인턴십·취업 연계를 활용해요", url: EE }]
      },
      ai: [
        { task: "회로 설계", title: "회로 오류 원인 후보 좁히기", how: "회로도 설명과 측정값을 주고 고장 원인 후보를 우선순위로 받아요." },
        { task: "에너지 분석", title: "전력 사용 데이터 패턴 찾기", how: "부하 데이터를 올려 시간대별 패턴과 이상 구간을 정리해요." },
        { task: "자격 공부", title: "기사 시험 개념 풀이 연습", how: "틀린 문제 풀이 과정을 설명시키고 비슷한 유형을 직접 풀어 봐요." }
      ],
      ssu_specific: [
        { name: "진로지도교수제", desc: "교수님과 정기적으로 진로 상담을 해요.", url: EE },
        { name: "에너지공학융합전공 트랙", desc: "학부에서 운영하는 트랙이에요.", url: EE },
        { name: "디스플레이 트랙", desc: "LG 디스플레이와 협약해 장기 인턴십과 취업을 연계해요.", url: EE }
      ]
    },
    {
      id: "mechanical", name: "기계공학부", college: "공과대학", promptName: "기계공학 전공",
      intro: "기계와 기계구조물을 설계·제작하는 법을 배워요.",
      stats: [],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "자동차 분야 기계 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: ME },
        { name: "조선·중공업 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: ME },
        { name: "항공 분야 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: ME },
        { name: "플랜트·건설 분야 엔지니어", why: "학과 소개에 진출 분야로 올라 있어요.", source: ME },
        { name: "연구소 연구원", why: "학과 소개에 진출 분야로 올라 있어요.", source: ME },
        { name: "기계공학 기술자·연구원", why: "발전설비·냉난방설비 등으로도 진출해요. (커리어넷)", source: "https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=56" }
      ],
      off_major_paths: [
        { job: "변리사", why: "기계공학 등 이공계 전공이 유리해요. (커리어넷)", source: PAT },
        { job: "생산관리·품질 직무", why: "설계 외에 생산관리 분야도 진로로 안내돼요. (커리어넷)", source: MECOUNSEL },
        { job: "방산 분야 직무", why: "기계설계산업기사·기계기사가 유용하다고 해요. (커리어넷)", source: MECOUNSEL }
      ],
      employer_types: [
        { type: "자동차·조선·항공·중공업", examples: [], source: ME },
        { type: "전자·건설·플랜트", examples: [], source: ME },
        { type: "연구소", examples: [], source: ME }
      ],
      certs: ["일반기계기사 (숭실대 구 학과 안내)", "건설기계기사 (숭실대 구 학과 안내)", "메카트로닉스기사 (숭실대 구 학과 안내)", "기계설계산업기사 (커리어넷)"],
      roadmap: {
        1: [{ text: "자동차·로봇·비행기 등 연구회를 둘러보고 하나 골라요", url: ME }],
        2: [{ text: "연구회에서 설계·제작 프로젝트를 직접 해 봐요", url: ME }],
        3: [{ text: "에너지 융합 전공 등 심화 과정을 검토하고 기계기사를 준비해요", url: ME }],
        4: [{ text: "설계·생산관리·방산 중 방향을 정하고 자격을 갖춰요", url: MECOUNSEL }]
      },
      ai: [
        { task: "설계 검토", title: "설계안 대안 비교하기", how: "치수·하중 조건을 주고 대안별 장단점을 정리받아 계산으로 확인해요." },
        { task: "해석 보조", title: "열·유동 해석 결과 읽기", how: "해석 결과 수치를 붙여 넣고 경향과 의심스러운 값을 짚어 달라고 해요." },
        { task: "제작 프로젝트", title: "연구회 작품 제작 일정 짜기", how: "부품 목록과 제작 순서를 입력해 일정표 초안을 받아요." }
      ],
      ssu_specific: [
        { name: "연구회 지원", desc: "자동차·로봇·비행기·설계·자동화·유동 분야 연구회를 지원해요.", url: ME },
        { name: "에너지 융합 전공", desc: "기계공학부에서 운영하는 융합전공이에요.", url: ME }
      ]
    },
    {
      id: "iise", name: "산업·정보시스템공학과", college: "공과대학", promptName: "산업정보시스템공학 전공",
      intro: "사람·물자·정보·설비로 이뤄진 시스템을 설계·개선해요.",
      stats: [
        { label: "최근 취업률", value: "70~80%", basis: "학과 홈페이지 진로 안내 기재(공과대학 타 학과보다 높은 편)", source: IISEC },
        { label: "초임 월 300만원 이상 취업자 비율", value: "54%", basis: "학과 홈페이지, 2020 졸업생 기준", source: IISEC },
        { label: "대기업 계열사 입사자 비율", value: "약 40%", basis: "학과 홈페이지 진로 안내 기재", source: IISEC }
      ],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "생산·품질 관리", why: "제조업에서 주요 직무로 꼽혀요.", source: IISEC },
        { name: "SCM·구매 담당", why: "제조업 진출 직무로 안내돼요.", source: IISEC },
        { name: "IT 관리·시스템 분석", why: "서비스업에서 주요 직무 중 하나예요.", source: IISEC },
        { name: "금융정보시스템 운영·위험 관리", why: "금융업 진출 직무로 안내돼요.", source: IISEC },
        { name: "생산기술·IT 연구소 연구원", why: "정부·기업 연구소로 진출해요.", source: IISEC },
        { name: "산업공학 기술자", why: "생산 최적화와 자원 활용 프로그램을 실행해요. (커리어넷)", source: "https://www.career.go.kr/cnet/front/base/job/jobView.do?SEQ=474" }
      ],
      off_major_paths: [
        { job: "컨설팅", why: "서비스업 진출 분야로 학과가 안내해요.", source: IISE },
        { job: "IT 개발·데이터/AI", why: "주요 직무 외 진출 직무로 안내돼요.", source: IISEC },
        { job: "영업·마케팅", why: "제조업 진출 직무로 안내돼요.", source: IISEC },
        { job: "UX 디자인", why: "제조·서비스업 진출 직무로 안내돼요.", source: IISEC },
        { job: "변리사", why: "산업공학 등 이공계 전공이 유리해요. (커리어넷)", source: PAT }
      ],
      employer_types: [
        { type: "대기업 계열사 제조업", examples: ["삼성", "SK", "현대기아차", "한화", "GS"], source: IISEC },
        { type: "IT서비스·SI 기업", examples: [], source: IISEC },
        { type: "금융기관(은행·증권)", examples: [], source: IISEC },
        { type: "정부·기업 연구소", examples: [], source: IISEC }
      ],
      certs: [],
      roadmap: {
        1: [{ text: "학과 진로 안내에서 산업군별 직무를 훑어보고 관심 분야를 골라요", url: IISEC }],
        2: [{ text: "교수님 진로 상담과 학부 연구 지원 제도를 알아봐요", url: IISE }],
        3: [{ text: "공학교육인증과 스마트 소재·제품 융합전공 이수를 따져 봐요", url: IISE }],
        4: [{ text: "산업체·시설 견학 경험을 살려 IT·생산 직무 중 지원 방향을 정해요", url: IISEC }]
      },
      ai: [
        { task: "수요 예측", title: "판매 데이터로 재고 계획 세우기", how: "과거 판매 데이터로 예측 방법별 오차를 비교해 달라고 해요." },
        { task: "공정 개선", title: "병목 공정 원인 찾기", how: "공정별 작업 시간을 주고 병목 후보와 개선안을 정리받아요." },
        { task: "최적화 모델링", title: "배송·생산 일정 모델 세우기", how: "제약 조건을 말로 설명하고 수식 모델 초안을 받아 직접 검증해요." }
      ],
      ssu_specific: [
        { name: "공학교육인증", desc: "취업과 해외 진학에 도움이 되는 인증 과정이에요.", url: IISE },
        { name: "진로지도교수제", desc: "교수님과 진로를 상담해요.", url: IISE },
        { name: "스마트 소재·제품 융합전공", desc: "학과에서 운영하는 융합전공이에요.", url: IISE },
        { name: "미국 타우슨대 해외공동학위", desc: "보험계리·리스크관리 연계전공 과정이에요.", url: IISE }
      ]
    },
    {
      id: "architecture", name: "건축학부", college: "공과대학", promptName: "건축 전공",
      intro: "건축학·건축공학·실내건축을 한 학부에서 배워요.",
      stats: [],
      laneOut: "전공 밖으로",
      related_jobs: [
        { name: "건축사(건축 설계)", why: "건축사무소 진출은 학과 소개에 올라 있어요.", source: ARCH },
        { name: "건축 시공 기술자", why: "시공 사무소 진출은 학과 소개에 올라 있어요.", source: ARCH },
        { name: "인테리어 설계자", why: "인테리어 설계 사무소가 진출 분야예요.", source: ARCH },
        { name: "디자인 컨설턴트", why: "디자인 컨설턴트 기업이 진출 분야예요.", source: ARCH },
        { name: "건축공학 기술자", why: "시공 공정 수립·구조설계·현장 감독을 해요. (커리어넷)", source: "https://www.career.go.kr/cloud/w/job/view?seq=46" }
      ],
      off_major_paths: [],
      employer_types: [
        { type: "건축 사무소", examples: [], source: ARCH },
        { type: "시공 사무소", examples: [], source: ARCH },
        { type: "인테리어 설계 사무소·디자인 컨설턴트 기업", examples: [], source: ARCH }
      ],
      certs: ["건축기사 (커리어넷)", "건축산업기사 (커리어넷)", "건축사 (커리어넷)", "건축시공기술사 (커리어넷)"],
      roadmap: {
        1: [{ text: "특별 설계 스튜디오와 조형 워크숍으로 설계 기초를 익혀요", url: ARCH }],
        2: [{ text: "건축학·건축공학·실내건축 중 전공 방향을 정해요", url: ARCH }],
        3: [{ text: "목요강좌 전문가 강연과 국제 디자인 워크숍에 참여해요", url: ARCH }],
        4: [{ text: "건축기사 등 자격과 포트폴리오를 준비해요", url: "https://www.career.go.kr/cloud/w/job/view?seq=46" }]
      },
      ai: [
        { task: "설계 발상", title: "초기 스케치 아이디어 확장", how: "대지 조건과 컨셉을 말하고 배치안 아이디어를 여러 개 받아 스케치로 발전시켜요." },
        { task: "법규 검토", title: "건축 법규 체크리스트 만들기", how: "계획 개요를 주고 확인할 법규 항목을 정리받아 원문으로 직접 확인해요." },
        { task: "프레젠테이션", title: "설계 설명문 다듬기", how: "설계 의도 초안을 붙여 넣고 간결한 발표 문장으로 고쳐 달라고 해요." }
      ],
      ssu_specific: [
        { name: "3개 전공 통합 학부", desc: "건축학·건축공학·실내건축 전공을 한 학부에서 운영해요.", url: ARCH },
        { name: "건축학전공(5년제) 인증", desc: "한국건축학교육인증원 인증 프로그램이에요.", url: ARCH },
        { name: "특별 설계 스튜디오·목요강좌", desc: "스튜디오 수업과 전문가 강연을 운영해요.", url: ARCH },
        { name: "조형·국제 디자인 워크숍", desc: "학과 특별 프로그램으로 안내돼 있어요.", url: ARCH }
      ]
    }
  ];

  window.JOBMAP = window.JOBMAP || {};
  window.JOBMAP.depts = window.JOBMAP.depts || [];
  window.JOBMAP.depts.push(...DEPTS);
})();
