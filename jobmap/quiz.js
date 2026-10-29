// 취업 유형 검사. 성격 검사가 아니라 방향을 고르는 질문이다.
// 점수가 +면 축의 a, -면 b. stage 축은 학년도 반영한다.
window.JOBMAP.quiz = {
  axes: [
    { id: "major", a: { k: "M", label: "전공 살리기" }, b: { k: "O", label: "전공 넘나들기" } },
    { id: "target", a: { k: "P", label: "사람과 함께" }, b: { k: "D", label: "자료와 함께" } },
    { id: "style", a: { k: "S", label: "안정 먼저" }, b: { k: "C", label: "도전 먼저" } },
    { id: "stage", a: { k: "E", label: "둘러보는 중" }, b: { k: "A", label: "달리는 중" } }
  ],

  // type: 기본 정보 화면. 나머지는 성향 질문.
  questions: [
    { type: "school", q: "어느 학교에 다녀요?" },
    { type: "college", q: "단과대를 골라 주세요" },
    { type: "dept", q: "학과는요?" },
    { type: "year", q: "지금 몇 학년이에요?" },
    { q: "전공 수업, 솔직히 어때요?", options: [
      { t: "재밌어서 더 깊이 파고 싶어요", s: { major: 2 } },
      { t: "괜찮은데 이걸로 평생 일할지는 모르겠어요", s: { major: -1 } },
      { t: "전공보다 다른 분야가 더 끌려요", s: { major: -2 } } ] },
    { q: "졸업하고 전공과 전혀 다른 일을 하게 된다면?", options: [
      { t: "아깝다고 느낄 것 같아요", s: { major: 1 } },
      { t: "잘 맞으면 상관없어요", s: { major: -1 } } ] },
    { q: "조별 과제에서 나는 주로", options: [
      { t: "역할 나누고 발표하는 쪽", s: { target: 2 } },
      { t: "자료 찾고 정리하는 쪽", s: { target: -2 } },
      { t: "그때그때 빈 곳을 메우는 쪽", s: {} } ] },
    { q: "하루 일과로 더 끌리는 건?", options: [
      { t: "사람을 많이 만나고 이야기하는 하루", s: { target: 2 } },
      { t: "혼자 집중해서 뭔가 완성하는 하루", s: { target: -2 } } ] },
    { q: "더 뿌듯한 순간은?", options: [
      { t: "누군가를 설득했을 때", s: { target: 1, style: -1 } },
      { t: "숫자나 결과가 딱 맞아떨어졌을 때", s: { target: -1, style: 1 } } ] },
    { q: "회사를 고른다면?", options: [
      { t: "오래 다닐 수 있고 안정적인 곳", s: { style: 2 } },
      { t: "빨리 배우고 크게 성장하는 곳", s: { style: -2 } } ] },
    { q: "1~2년 걸리는 시험 준비(공무원·공기업·자격증)는?", options: [
      { t: "확실한 길이면 해 볼 만해요", s: { style: 2 } },
      { t: "그 시간에 경험을 쌓고 싶어요", s: { style: -2 } } ] },
    { q: "인턴·공모전·대외활동, 몇 번 해 봤어요?", options: [
      { t: "아직 없어요", s: { stage: 2 } },
      { t: "한 번", s: { stage: 0 } },
      { t: "두 번 이상", s: { stage: -2 } } ] },
    { q: "가고 싶은 직무가 정해졌나요?", options: [
      { t: "아직 전혀요", s: { stage: 2 } },
      { t: "두세 개로 좁혔어요", s: { stage: -1 } },
      { t: "하나로 정했어요", s: { stage: -2 } } ] },
    { type: "worry", q: "요즘 제일 큰 걱정은?" },
    { type: "place", q: "가고 싶은 곳에 가까운 건?" }
  ],

  // target·style 조합 이름. major는 앞, stage는 뒤에 붙인다.
  names: { PS: "든든한 조율가", PC: "발로 뛰는 개척자", DS: "꼼꼼한 설계자", DC: "실험하는 분석가" },
  blurbs: {
    PS: "사람 사이를 매끄럽게 잇고, 정해진 틀 안에서 꾸준히 해내는 쪽이에요.",
    PC: "사람을 만나 설득하고, 새로운 판을 여는 데서 힘이 나는 쪽이에요.",
    DS: "자료를 정확하게 다루고, 실수 없이 쌓아 가는 데서 힘이 나는 쪽이에요.",
    DC: "자료로 가설을 세우고 실험해서 답을 찾는 데서 힘이 나는 쪽이에요."
  },
  majorWord: { M: "전공을 살리는", O: "전공을 넘나드는" },
  stageWord: { E: "둘러보는 중", A: "달리는 중" },

  // 직무 사전 이름에 들어 있는 말로 성향을 붙인다
  jobTags: [
    { match: "해외영업", target: "P", style: "C" },
    { match: "영업", target: "P", style: "C" },
    { match: "마케팅", target: "P", style: "C" },
    { match: "인사", target: "P", style: "S" },
    { match: "재무", target: "D", style: "S" },
    { match: "구매", target: "D", style: "S" },
    { match: "고객", target: "P", style: "S" },
    { match: "PM", target: "P", style: "C" },
    { match: "기획", target: "D", style: "C" },
    { match: "데이터", target: "D", style: "C" },
    { match: "공기업", target: "", style: "S", place: "공기업·공공기관" },
    { match: "공무원", target: "", style: "S", place: "공기업·공공기관" }
  ],

  // 학과 지도의 직업 이름에서 직무 사전으로 잇는 낱말
  jobAlias: {
    sales: ["영업"], trade: ["해외영업", "무역"], marketing: ["마케팅", "홍보"], hr: ["인사"],
    finance: ["재무"], strategy: ["경영기획", "신사업 기획"], scm: ["구매", "물류", "SCM"], cs: ["고객 서비스", "CS"],
    itpm: ["IT 기획", "PM", "서비스 기획"], data: ["데이터 분석", "데이터/AI"], ncs: ["공기업"], civil: ["공무원"]
  },

  // 걱정마다: 관련 Q&A를 찾을 낱말, 바로 할 일
  worryFix: {
    "경험이 하나도 없어요": { faq: ["인턴", "경험"], steps: [
      { text: "슈패스에서 이번 학기 비교과 하나 신청", url: "https://path.ssu.ac.kr/" },
      { text: "현장실습학기제 기업 목록 보기", url: "https://wess.ssu.ac.kr/" },
      { text: "학과 공모전·경진대회 공지 확인", url: null } ] },
    "하고 싶은 일을 모르겠어요": { faq: ["전공", "중요"], steps: [
      { text: "진로취업센터 진로 상담 예약", url: "http://job.ssu.ac.kr" },
      { text: "아래 추천 직무 3개를 직무 사전에서 읽어 보기", url: "#jobs" },
      { text: "고용24 직업심리검사로 흥미 확인", url: "http://job.ssu.ac.kr" } ] },
    "스펙이 부족한 것 같아요": { faq: ["학점", "어학", "토익"], steps: [
      { text: "많이 묻는 것에서 학점·어학 비중부터 확인", url: "#faq" },
      { text: "목표 직무 하나 정하고 거기 맞는 자격만 고르기", url: "#jobs" },
      { text: "점수보다 경험 하나를 먼저 만들기", url: "https://path.ssu.ac.kr/" } ] },
    "자소서에 쓸 게 없어요": { faq: ["경험", "중요"], steps: [
      { text: "진로취업센터 자소서 클리닉 신청", url: "http://job.ssu.ac.kr" },
      { text: "수업 과제 중 가장 고생한 것 하나를 경험으로 정리", url: null },
      { text: "이번 방학에 짧은 활동 하나 넣기", url: "https://path.ssu.ac.kr/" } ] },
    "전공이 취업에 불리할까 봐요": { faq: ["전공"], steps: [
      { text: "두 갈래 길에서 '전공 밖으로' 칸 먼저 보기", url: "#map" },
      { text: "복수전공·부전공 안내 확인", url: null },
      { text: "전공 무관 채용이 많은 직무 사전 보기", url: "#jobs" } ] }
  }
};
