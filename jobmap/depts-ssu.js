// 숭실대 고유 정보: 학년별 할 일, 학과 프로그램, AI 쓰는 장면(ai는 이 사이트의 제안).
// 기존 data.js·depts-*.js에서 옮김. 2024년 이전 뉴스로 이어지는 항목은 없어서 뺀 것이 없다.
(function () {
  const SSU = "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/";
  const JP_HOME = "https://japanstu.ssu.ac.kr/";
  const JP_INTRO = "https://japanstu.ssu.ac.kr/%ED%95%99%EA%B3%BC%EC%95%88%EB%82%B4/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/";
  const ENG_HOME = "https://englan.ssu.ac.kr/학과안내/학과소개/";
  const ENG_SSU = "https://ssu.ac.kr/교육-·-연구/대학소개/인문대학/영어영문학과/";
  const BIZ = "http://biz.ssu.ac.kr/";
  const PUB = "http://pubad.ssu.ac.kr/";
  const MASS = "https://masscom.ssu.ac.kr/";
  const ME = SSU + "%EA%B3%B5%EA%B3%BC%EB%8C%80%ED%95%99/%EA%B8%B0%EA%B3%84%EA%B3%B5%ED%95%99%EB%B6%80/";
  const MECOUNSEL = "https://www.career.go.kr/cnet/web/counsel/counselView.mdo?SEQ=6422243&TRNSFER_AT=N";
  const MATH = "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%88%98%ed%95%99%ea%b3%bc/";
  const MJOB = "https://math.ssu.ac.kr/?page_id=1484";
  const MINTRO = "https://math.ssu.ac.kr/?page_id=942";
  const AISW = SSU + "ai%EB%8C%80%ED%95%99/ai%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%ED%95%99%EB%B6%80/";
  const AI_NEWS = "https://dhnews.co.kr/news/view/1065580336299124";

  window.JOBMAP.ssuDept = {
    jp: {
      roadmap: {
        1: [{ text: "학과 소모임 키라키라로 JLPT 목표 급수 정하기", url: JP_HOME, how: "일어일문학과 누리집에서 소모임 키라키라 안내를 보고 JLPT 급수를 정해요." }],
        2: [{ text: "일본 대학 교환학생·연수 알아보기", url: JP_INTRO, how: "일어일문학과 학과 소개 페이지에서 일본 대학 교환학생·연수 안내를 읽어요." }],
        3: [{ text: "학과 채용 게시판에서 일본어 우대 공고 보기", url: JP_HOME, how: "일어일문학과 누리집 채용 게시판에서 일본어 우대 공고를 찾아요." }],
        4: [{ text: "JLPT·JPT 점수를 지원서용으로 정리", url: null, how: "받은 성적표를 모아 시험 이름·점수·응시일을 한 문서에 적어 둬요." }]
      },
      ssu_specific: [
        { name: "일본 교환학생·연수", desc: "일본 대학 교환학생과 어학연수", url: JP_INTRO },
        { name: "학과 소모임", desc: "키라키라(JLPT), 요무요무(원서 읽기), 원어연극, 페라페라(교류)", url: JP_HOME },
        { name: "학과 채용 게시판", desc: "일본어 우대 채용과 인턴 공고", url: JP_HOME }
      ],
      ai: [
        { task: "문장 검토", title: "일본어 메일 경어 확인", how: "내가 쓴 메일을 넣고 경어가 맞는지, 왜 고쳤는지 물어봐요." },
        { task: "시험 공부", title: "JLPT 독해 문제 만들기", how: "읽은 기사 수준으로 문제와 해설을 만들고 틀린 문법만 다시 모아요." },
        { task: "업계 조사", title: "일본 기업 뉴스 요약", how: "일본어 기사를 요약시키고 원문과 대조해 번역 실력도 점검해요." }
      ]
    },
    eng: {
      roadmap: {
        1: [{ text: "영어 에세이 대회에 수업 과제로 도전하기", url: ENG_HOME, how: "영어영문학과 누리집 학과 소개에서 에세이 대회 안내를 보고 과제를 내요." }],
        2: [{ text: "영어 프레젠테이션 대회에 나가 봐요", url: ENG_HOME, how: "영어영문학과 누리집 학과 소개에서 프레젠테이션 대회 안내를 읽어요." }],
        3: [{ text: "영어권 현장 체험 팀 프로젝트에 지원해요", url: ENG_SSU, how: "숭실대 누리집 영어영문학과 소개에서 현장 체험 프로젝트 안내를 읽어요." }],
        4: [{ text: "졸업생 특강과 교사 임용 특강을 들어요", url: ENG_SSU, how: "숭실대 누리집 영어영문학과 소개에서 특강 안내를 보고 일정을 챙겨요." }]
      },
      ssu_specific: [
        { name: "영어 프레젠테이션 대회", desc: "2013년부터 열리고 한국어·외국어 화자 부문이 따로 있어요.", url: ENG_HOME },
        { name: "영어 에세이 대회", desc: "수업에서 낸 과제로 심사받는 대회예요.", url: ENG_HOME },
        { name: "영어권 현장 체험", desc: "영어권 국가에서 하는 팀 프로젝트예요.", url: ENG_SSU },
        { name: "Meet Your Professor", desc: "전임교원과 함께하는 재학생 간담회예요.", url: ENG_SSU }
      ],
      ai: [
        { task: "영작 첨삭", title: "에세이 대회 초안 점검", how: "내 에세이의 논리 흐름을 짚게 하고 고친 문장은 내가 다시 써요." },
        { task: "발표 연습", title: "프레젠테이션 질의응답", how: "발표 원고를 주고 예상 질문을 받아 영어로 답하는 연습을 해요." },
        { task: "문학 읽기", title: "영시 구절 해석 비교", how: "영시 한 구절의 여러 해석을 받아 내 해석과 견줘 봐요." }
      ]
    },
    biz: {
      roadmap: {
        1: [{ text: "인사·마케팅·재무·회계 수업을 하나씩 들어 보기", url: null, how: "수강신청 때 경영학부 전공과목에서 분야별로 한 과목씩 골라 들어요." }],
        2: [{ text: "회계사·세무사 같은 전문자격 준비 여부 정하기", url: BIZ + "bbs/list.do?bId=BBS_03_CERTIFICATE", how: "경영학부 누리집 자격증 게시판에서 시험 안내를 읽고 준비할지 정해요." }],
        3: [{ text: "경영학부 경진대회에 나가 보기", url: BIZ + "bbs/list.do?bId=BBS_03_NEWS", how: "경영학부 누리집 소식 게시판에서 경진대회 공지를 보고 팀을 꾸려요." }],
        4: [{ text: "목표 직무에 맞는 자격·점수 정리", url: null, how: "가고 싶은 공고 몇 개의 자격 요건을 모아 내게 빠진 것을 적어 둬요." }]
      },
      ssu_specific: [
        { name: "경영학부 경진대회", desc: "학부가 여는 공모전", url: BIZ + "bbs/list.do?bId=BBS_03_NEWS" },
        { name: "복수전공·부전공", desc: "다른 학과 학생도 경영을 더 배울 수 있어요", url: BIZ + "jsp/01/06.jsp" }
      ],
      ai: [
        { task: "기업 분석", title: "사업보고서 요약", how: "공시 보고서 일부를 넣고 매출 구조를 요약시켜요. 숫자는 원문에서 다시 확인해요." },
        { task: "데이터", title: "엑셀 수식 도움받기", how: "하고 싶은 분석을 말로 설명하고 받은 수식을 직접 돌려 봐요." },
        { task: "토론", title: "케이스 반론 연습", how: "내 전략 제안을 주고 반대 입장에서 공격해 달라고 해요." }
      ]
    },
    pubadmin: {
      roadmap: {
        1: [{ text: "행정실무워크숍에 참여해 분야를 탐색해요", url: PUB, how: "행정학부 누리집에서 행정실무워크숍 안내를 찾아 참여 방법을 확인해요." }],
        2: [{ text: "모의 국무회의에서 정책 토론을 경험해요", url: PUB, how: "행정학부 누리집에서 모의 국무회의 안내를 찾아 참여 방법을 확인해요." }],
        3: [{ text: "행정기관 방문과 정책 모의갈등 조정회의에 나가요", url: PUB, how: "행정학부 누리집에서 기관 방문·모의갈등 조정회의 안내를 찾아봐요." }],
        4: [{ text: "5급 행정고시반이나 취업 멘토링으로 진로를 굳혀요", url: PUB, how: "행정학부 누리집에서 행정고시반·취업 멘토링 안내를 보고 하나를 골라요." }]
      },
      ssu_specific: [
        { name: "행정실무워크숍·모의 국무회의", desc: "행정 실무와 정책 결정을 직접 체험해요.", url: PUB },
        { name: "5급 행정고시반", desc: "고시 준비를 위한 학부 지원 프로그램이에요.", url: PUB },
        { name: "청백실 지원", desc: "시험 준비 공간 지원으로 소개돼요.", url: PUB },
        { name: "정책 모의갈등 조정회의", desc: "갈등 조정 과정을 모의로 경험해요.", url: PUB }
      ],
      ai: [
        { task: "정책 분석", title: "정책 사례 비교", how: "여러 지자체의 비슷한 정책을 표로 비교해 정리해요." },
        { task: "데이터 해석", title: "통계 자료 읽기", how: "공공 통계의 추이를 요약하고 의문점을 짚어봐요." },
        { task: "문서 작성", title: "정책 보고서 초안", how: "보고서 목차와 핵심 논점의 초안을 잡아요." }
      ]
    },
    masscom: {
      roadmap: {
        1: [{ text: "PR·광고·방송 학회 중 한 곳에 들어가요", url: MASS, how: "언론홍보학과 누리집에서 학회 소개를 읽고 모집 시기를 확인해요." }],
        2: [{ text: "SSV 실습실에서 영상 제작을 익혀요", url: MASS, how: "언론홍보학과 누리집에서 SSV 스튜디오 소개를 읽고 실습 수업을 찾아요." }],
        3: [{ text: "언홍제 기획에 참여해 포트폴리오를 쌓아요", url: MASS, how: "언론홍보학과 누리집에서 언홍제 소식을 찾아보고 기획에 참여해요." }],
        4: [{ text: "언론고시반 가온누리로 시험을 준비해요", url: MASS, how: "언론홍보학과 누리집에서 가온누리 안내를 읽고 모집 시기를 확인해요." }]
      },
      ssu_specific: [
        { name: "SSV 스튜디오", desc: "스튜디오와 편집실을 갖춘 영상 실습 공간이에요.", url: MASS },
        { name: "언론고시반 가온누리", desc: "언론 시험을 준비하는 학과 운영 반이에요.", url: MASS },
        { name: "언홍제", desc: "학생이 직접 만드는 학과 축제예요.", url: MASS },
        { name: "교환학생 프로그램", desc: "미국 플로리다주립대와 연계돼 있어요.", url: MASS }
      ],
      ai: [
        { task: "카피 작성", title: "광고 문구 후보 만들기", how: "하나의 메시지로 여러 문구 후보를 뽑아 비교해요." },
        { task: "보도자료", title: "보도자료 초안 쓰기", how: "핵심 사실을 넣어 초안을 만들고 사실 확인을 해요." },
        { task: "콘텐츠 기획", title: "영상 콘셉트 브레인스토밍", how: "타깃에 맞는 영상 소재를 폭넓게 모아봐요." }
      ]
    },
    mechanical: {
      roadmap: {
        1: [{ text: "자동차·로봇·비행기 등 연구회를 둘러보고 하나 골라요", url: ME, how: "숭실대 누리집 기계공학부 소개에서 연구회 목록을 보고 하나 골라요." }],
        2: [{ text: "연구회에서 설계·제작 프로젝트를 직접 해 봐요", url: ME, how: "들어간 연구회에서 설계부터 제작까지 맡을 작품 하나를 정해요." }],
        3: [{ text: "에너지 융합 전공 등 심화 과정을 검토하고 기계기사를 준비해요", url: ME, how: "기계공학부 소개에서 융합전공을 보고, 기계기사 시험 일정을 확인해요." }],
        4: [{ text: "설계·생산관리·방산 중 방향을 정하고 자격을 갖춰요", url: MECOUNSEL, how: "커리어넷 상담 답변을 읽고 한 방향을 골라 필요한 자격을 적어 둬요." }]
      },
      ssu_specific: [
        { name: "연구회 지원", desc: "자동차·로봇·비행기·설계·자동화·유동 분야 연구회를 지원해요.", url: ME },
        { name: "에너지 융합 전공", desc: "기계공학부에서 운영하는 융합전공이에요.", url: ME }
      ],
      ai: [
        { task: "설계 검토", title: "설계안 대안 비교하기", how: "치수·하중 조건을 주고 대안별 장단점을 정리받아 계산으로 확인해요." },
        { task: "해석 보조", title: "열·유동 해석 결과 읽기", how: "해석 결과 수치를 붙여 넣고 경향과 의심스러운 값을 짚어 달라고 해요." },
        { task: "제작 프로젝트", title: "연구회 작품 제작 일정 짜기", how: "부품 목록과 제작 순서를 입력해 일정표 초안을 받아요." }
      ]
    },
    math: {
      roadmap: {
        1: [{ text: "수학과 진로탐색의 수학 관련 직업 소개를 읽어봐요", url: MJOB, how: "수학과 누리집 '진로탐색' 게시판에서 직업 소개 글을 읽어요." }],
        2: [{ text: "순수·응용수학 중 끌리는 쪽을 정해 전공 수업을 골라요", url: MINTRO, how: "수학과 누리집 '학과소개'에서 전공 분야를 보고 수업을 골라요." }],
        3: [{ text: "교직·금융·대학원 중 한 길을 정해 준비를 시작해요", url: "https://math.ssu.ac.kr/?page_id=1308", how: "수학과 누리집 '졸업후진로'에서 길별 준비를 보고 하나를 정해요." }],
        4: [{ text: "학과 채용추천·인턴 게시판을 확인하며 지원해요", url: "https://math.ssu.ac.kr/?page_id=1291", how: "수학과 누리집 '취업정보' 게시판에서 채용추천·인턴 공고를 봐요." }]
      },
      ssu_specific: [
        { name: "Towson University 등 해외 대학 교류", desc: "해외 대학과 교류하는 프로그램이 있어요", url: MATH },
        { name: "전산실습실·응용수학연습실", desc: "튜터링과 스터디를 하는 학과 공간이에요", url: MATH },
        { name: "수학 관련 직업 소개(진로탐색)", desc: "학과가 직업별로 정리한 게시판이에요", url: MJOB }
      ],
      ai: [
        { task: "증명 검토", title: "막힌 증명 점검하기", how: "내가 쓴 증명을 AI에게 보여주고 비약된 단계를 찾아달라고 해요." },
        { task: "수치 실험", title: "수치해석 코드 만들기", how: "알고리즘 아이디어를 설명하고 파이썬 실험 코드 초안을 받아 결과를 검증해요." },
        { task: "논문 읽기", title: "영어 논문 정리하기", how: "수학 논문의 정리와 기호를 쉬운 말로 풀어 달라고 해 읽는 시간을 줄여요." }
      ]
    },
    aisw: {
      roadmap: {
        1: [{ text: "수업 과제 말고 작은 프로젝트 하나 끝내 보기", url: null, how: "작은 주제를 하나 정해 끝까지 만들고 GitHub에 올려 둬요." }],
        2: [{ text: "3학년 세부전공 네 개 미리 비교하기", url: AI_NEWS, how: "대학저널 기사에서 세부전공 네 개를 보고, 학부 교육과정과 함께 비교해요." }],
        3: [{ text: "Co-op 집중학기·현장실습 알아보기", url: AI_NEWS, how: "대학저널 기사에서 Co-op 집중학기를 읽고, 현장실습지원센터(WESS) 공고도 봐요." }],
        4: [{ text: "졸업작품을 포트폴리오로 정리", url: AISW, how: "졸업작품의 문제·맡은 일·결과를 정리해 포트폴리오 첫 장에 둬요." }]
      },
      ssu_specific: [
        { name: "SW중심대학", desc: "2024~2029년 재선정, 실무 교육 지원", url: "https://www.dhnews.co.kr/news/view/1065591141289614" },
        { name: "Co-op 집중학기", desc: "전용 실습실에서 실습 중심으로 듣는 학기", url: AI_NEWS },
        { name: "경진대회·졸업작품 전시회", desc: "학부 공식 특색 프로그램", url: AISW }
      ],
      ai: [
        { task: "디버깅", title: "에러 이유 설명 듣기", how: "고친 코드 대신 왜 틀렸는지만 물어봐요. 그래야 실력이 남아요." },
        { task: "공부", title: "영어 문서 요약", how: "공식 문서를 요약시키고 모르는 개념만 다시 질문해요." },
        { task: "포트폴리오", title: "프로젝트 설명 다듬기", how: "내 README를 읽기 쉽게 고쳐요. 없는 기능은 쓰지 않아요." }
      ]
    }
  };

  // 기본판 39개: 이름·단과대·누리집·직무 사전 key(사이트 제안)만. 학과 목록은 2026학년도 정시모집요강 + 숭실대 누리집 대학소개.
  // hide: 재직자 전담이라 고르기 칩에서만 숨김(주소로는 열림). 커리어넷 2020~21 자료는 넣지 않았다.
  window.JOBMAP.depts.push(
    { id: "christian", name: "기독교학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ea%b8%b0%eb%8f%85%ea%b5%90%ed%95%99%ea%b3%bc/", jobs: ["teacher", "counsel"], basic: true },
    { id: "korean", name: "국어국문학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ea%b5%ad%ec%96%b4%ea%b5%ad%eb%ac%b8%ed%95%99%ea%b3%bc/", jobs: ["teacher", "media", "copy", "marketing"], basic: true },
    { id: "german", name: "독어독문학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%eb%8f%85%ec%96%b4%eb%8f%85%eb%ac%b8%ed%95%99%ea%b3%bc/", jobs: ["trade", "sales", "marketing"], basic: true },
    { id: "french", name: "불어불문학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%eb%b6%88%ec%96%b4%eb%b6%88%eb%ac%b8%ed%95%99%ea%b3%bc/", jobs: ["trade", "sales", "marketing"], basic: true },
    { id: "chinese", name: "중어중문학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ec%a4%91%ec%96%b4%ec%a4%91%eb%ac%b8%ed%95%99%ea%b3%bc/", jobs: ["trade", "sales", "teacher"], basic: true },
    { id: "philosophy", name: "철학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ec%b2%a0%ed%95%99%ea%b3%bc/", jobs: ["teacher", "media", "copy"], basic: true },
    { id: "history", name: "사학과", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ec%82%ac%ed%95%99%ea%b3%bc/", jobs: ["teacher", "media", "civil"], basic: true },
    { id: "writing", name: "예술창작학부 문예창작전공", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%eb%ac%b8%ec%98%88%ec%b0%bd%ec%9e%91%ec%a0%84%ea%b3%b5/", jobs: ["copy", "media", "marketing"], basic: true },
    { id: "film", name: "예술창작학부 영화예술전공", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ec%98%81%ed%99%94%ec%98%88%ec%88%a0%ec%a0%84%ea%b3%b5/", jobs: ["video", "media"], basic: true },
    { id: "sports", name: "스포츠학부", college: "인문대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9d%b8%eb%ac%b8%eb%8c%80%ed%95%99/%ec%8a%a4%ed%8f%ac%ec%b8%a0%ed%95%99%eb%b6%80/", jobs: ["teacher", "marketing"], basic: true },
    { id: "physics", name: "물리학과", college: "자연과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%eb%ac%bc%eb%a6%ac%ed%95%99%ea%b3%bc/", jobs: ["rnd", "quality", "teacher"], basic: true },
    { id: "chemistry", name: "화학과", college: "자연과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ed%99%94%ed%95%99%ea%b3%bc/", jobs: ["rnd", "quality", "teacher"], basic: true },
    { id: "stats", name: "정보통계·보험수리학과", college: "자연과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%a0%95%eb%b3%b4%ed%86%b5%ea%b3%84-%c2%b7-%eb%b3%b4%ed%97%98%ec%88%98%eb%a6%ac%ed%95%99%ea%b3%bc/", jobs: ["data", "finance", "ai"], basic: true },
    { id: "biomed", name: "의생명시스템학부", college: "자연과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%97%b0%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%9d%98%ec%83%9d%eb%aa%85%ec%8b%9c%ec%8a%a4%ed%85%9c%ed%95%99%eb%b6%80/", jobs: ["rnd", "quality", "data"], basic: true },
    { id: "law", name: "법학과", college: "법과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%eb%b2%95%ea%b3%bc%eb%8c%80%ed%95%99/%eb%b2%95%ed%95%99%ea%b3%bc/", jobs: ["civil", "ncs", "hr"], basic: true },
    { id: "intlaw", name: "국제법무학과", college: "법과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%eb%b2%95%ea%b3%bc%eb%8c%80%ed%95%99/%ea%b5%ad%ec%a0%9c%eb%b2%95%eb%ac%b4%ed%95%99%ea%b3%bc/", jobs: ["trade", "civil", "ncs"], basic: true },
    { id: "welfare", name: "사회복지학부", college: "사회과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%82%ac%ed%9a%8c%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%82%ac%ed%9a%8c%eb%b3%b5%ec%a7%80%ed%95%99%eb%b6%80/", jobs: ["counsel", "civil", "ncs"], basic: true },
    { id: "politics", name: "정치외교학과", college: "사회과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%82%ac%ed%9a%8c%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%a0%95%ec%b9%98%ec%99%b8%ea%b5%90%ed%95%99%ea%b3%bc/", jobs: ["civil", "ncs", "media", "trade"], basic: true },
    { id: "infosoc", name: "정보사회학과", college: "사회과학대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%82%ac%ed%9a%8c%ea%b3%bc%ed%95%99%eb%8c%80%ed%95%99/%ec%a0%95%eb%b3%b4%ec%82%ac%ed%9a%8c%ed%95%99%ea%b3%bc/", jobs: ["data", "media", "marketing", "civil"], basic: true },
    { id: "lifelong", name: "평생교육학과", college: "사회과학대학", url: "https://lifelongedu.ssu.ac.kr/", jobs: ["edudesign", "counsel", "hr"], basic: true },
    { id: "econ", name: "경제학과", college: "경제통상대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%a0%9c%ed%86%b5%ec%83%81%eb%8c%80%ed%95%99/%ea%b2%bd%ec%a0%9c%ed%95%99%ea%b3%bc/", jobs: ["finance", "data", "ncs", "strategy"], basic: true },
    { id: "globaltrade", name: "글로벌통상학과", college: "경제통상대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%a0%9c%ed%86%b5%ec%83%81%eb%8c%80%ed%95%99/%ea%b8%80%eb%a1%9c%eb%b2%8c%ed%86%b5%ec%83%81%ed%95%99%ea%b3%bc/", jobs: ["trade", "scm", "sales"], basic: true },
    { id: "fineco", name: "금융경제학과", college: "경제통상대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%a0%9c%ed%86%b5%ec%83%81%eb%8c%80%ed%95%99/%ea%b8%88%ec%9c%b5%ea%b2%bd%ec%a0%9c%ed%95%99%ea%b3%bc/", jobs: ["finance"], basic: true, hide: true },
    { id: "inttrade", name: "국제무역학과", college: "경제통상대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%a0%9c%ed%86%b5%ec%83%81%eb%8c%80%ed%95%99/%ea%b5%ad%ec%a0%9c%eb%ac%b4%ec%97%ad%ed%95%99%ea%b3%bc/", jobs: ["trade", "scm", "sales"], basic: true, hide: true },
    { id: "accounting", name: "회계학과", college: "경영대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%98%81%eb%8c%80%ed%95%99/%ed%9a%8c%ea%b3%84%ed%95%99%ea%b3%bc/", jobs: ["finance", "ncs"], basic: true },
    { id: "venture", name: "벤처중소기업학과", college: "경영대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%98%81%eb%8c%80%ed%95%99/%eb%b2%a4%ec%b2%98%ec%a4%91%ec%86%8c%ea%b8%b0%ec%97%85%ed%95%99%ea%b3%bc/", jobs: ["strategy", "marketing", "sales", "itpm"], basic: true },
    { id: "finance", name: "금융학부", college: "경영대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b2%bd%ec%98%81%eb%8c%80%ed%95%99/%ea%b8%88%ec%9c%b5%ed%95%99%eb%b6%80/", jobs: ["finance", "sales", "data"], basic: true },
    { id: "chemeng", name: "화학공학과", college: "공과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b3%b5%ea%b3%bc%eb%8c%80%ed%95%99/%ed%99%94%ed%95%99%ea%b3%b5%ed%95%99%ea%b3%bc/", jobs: ["rnd", "quality", "maint"], basic: true },
    { id: "materials", name: "신소재공학과", college: "공과대학", url: "https://materials.ssu.ac.kr/", jobs: ["rnd", "quality", "mech"], basic: true },
    { id: "electric", name: "전기공학부", college: "공과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b3%b5%ea%b3%bc%eb%8c%80%ed%95%99/%ec%a0%84%ea%b8%b0%ea%b3%b5%ed%95%99%eb%b6%80/", jobs: ["maint", "rnd", "quality"], basic: true },
    { id: "ie", name: "산업·정보시스템공학과", college: "공과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b3%b5%ea%b3%bc%eb%8c%80%ed%95%99/%ec%82%b0%ec%97%85%c2%b7%ec%a0%95%eb%b3%b4%ec%8b%9c%ec%8a%a4%ed%85%9c%ea%b3%b5%ed%95%99%ea%b3%bc/", jobs: ["scm", "data", "quality", "itpm"], basic: true },
    { id: "arch", name: "건축학부", college: "공과대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ea%b3%b5%ea%b3%bc%eb%8c%80%ed%95%99/%ea%b1%b4%ec%b6%95%ed%95%99%eb%b6%80/", jobs: [], basic: true },
    { id: "computer", name: "컴퓨터학부", college: "IT대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/it%eb%8c%80%ed%95%99/%ec%bb%b4%ed%93%a8%ed%84%b0%ed%95%99%eb%b6%80/", jobs: ["sw", "ai", "data", "cloud", "security"], basic: true },
    { id: "electronics", name: "전자정보공학부 전자공학전공", college: "IT대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/it%eb%8c%80%ed%95%99/%ec%a0%84%ec%9e%90%ea%b3%b5%ed%95%99%ec%a0%84%ea%b3%b5/", jobs: ["rnd", "quality", "sw", "ai"], basic: true },
    { id: "itconv", name: "전자정보공학부 IT융합전공", college: "IT대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/it%eb%8c%80%ed%95%99/it%ec%9c%b5%ed%95%a9%ec%a0%84%ea%b3%b5/", jobs: ["sw", "cloud", "rnd", "ai"], basic: true },
    { id: "gmedia", name: "글로벌미디어학부", college: "IT대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/it%eb%8c%80%ed%95%99/%ea%b8%80%eb%a1%9c%eb%b2%8c%eb%af%b8%eb%94%94%ec%96%b4%ed%95%99%eb%b6%80/", jobs: ["video", "media", "uxui", "game", "sw"], basic: true },
    { id: "digitalmedia", name: "디지털미디어학과", college: "IT대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/it%eb%8c%80%ed%95%99/%eb%af%b8%eb%94%94%ec%96%b4%ea%b2%bd%ec%98%81%ed%95%99%ea%b3%bc-%ec%9e%ac%ec%a7%81%ec%9e%90%ec%a0%84%ed%98%95/", jobs: ["video", "uxui", "game", "sw"], basic: true, hide: true },
    { id: "infosec", name: "정보보호학과", college: "AI대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/ai%eb%8c%80%ed%95%99/%ec%a0%95%eb%b3%b4%eb%b3%b4%ed%98%b8%ed%95%99%ea%b3%bc/", jobs: ["security", "sw", "cloud"], basic: true },
    { id: "free", name: "자유전공학부", college: "베어드학부대학", url: "https://ssu.ac.kr/%ea%b5%90%ec%9c%a1-%c2%b7-%ec%97%b0%ea%b5%ac/%eb%8c%80%ed%95%99%ec%86%8c%ea%b0%9c/%ec%9e%90%ec%9c%a0%ec%a0%84%ea%b3%b5%ed%95%99%eb%b6%80/%ec%9e%90%ec%9c%a0%ec%a0%84%ea%b3%b5%ed%95%99%eb%b6%80-%ec%86%8c%ea%b0%9c/", jobs: [], basic: true }
  );
})();
