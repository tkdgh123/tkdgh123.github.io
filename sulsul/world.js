// 2판: 한 도시의 사람들. 사람마다 그림 한 장(art.js), 목소리(m·m2 남, f·f2 여). 이야기(story/*.js)는 이 사람들로 만든다.
// 이야기는 story/*.js 에서 EP({...})로 더한다(scene.js보다 먼저 읽힘)
const EPS = [];
const EP = e => EPS.push(e);
const PEOPLE = {
  reed: { name: "Officer Reed", ko: "입국 심사관", v: "m2", art: "airport" },
  omar: { name: "Omar", ko: "택시 기사", v: "m", art: "taxi" },
  emma: { name: "Emma", ko: "호텔 직원", v: "f", art: "hotel" },
  mike: { name: "Mike", ko: "호텔 수리 기사", v: "m2", art: "room" },
  leo: { name: "Leo", ko: "바리스타", v: "m", art: "cafe" },
  tom: { name: "Tom", ko: "길에서 만난 사람", v: "m", art: "way" },
  ben: { name: "Ben", ko: "길 잃은 여행자", v: "m", art: "helpway" },
  sam: { name: "Sam", ko: "식당 직원", v: "m2", art: "dinner" },
  kevin: { name: "Kevin", ko: "버거 가게 직원", v: "m", art: "wrong" },
  dan: { name: "Dan", ko: "역무원", v: "m", art: "subway" },
  rosa: { name: "Rosa", ko: "분실물 센터 직원", v: "f2", art: "lost" },
  grace: { name: "Grace", ko: "약사", v: "f", art: "pharmacy" },
  nora: { name: "Nora", ko: "병원 접수 직원", v: "f", art: "clinic" },
  mia: { name: "Mia", ko: "옷 가게 점원", v: "f2", art: "shop" },
  hannah: { name: "Hannah", ko: "기념품 가게 주인", v: "f2", art: "souvenir" },
  nate: { name: "Nate", ko: "전망대에서 만난 사람", v: "m", art: "photo" },
  ava: { name: "Ava", ko: "영화관 직원", v: "f2", art: "movie" },
  carlos: { name: "Carlos", ko: "푸드트럭 사장님", v: "m2", art: "foodtruck" },
  joe: { name: "Joe", ko: "과일 가게 주인", v: "m2", art: "market" },
  victor: { name: "Victor", ko: "항공사 직원", v: "m", art: "checkin" },
  ruth: { name: "Ruth", ko: "옆자리 승객", v: "f", art: "plane" },
  sara: { name: "Sara", ko: "친구", v: "f2", art: "meetup" },
  ella: { name: "Ella", ko: "강아지 산책하는 이웃", v: "f", art: "park" },
  brown: { name: "Mr. Brown", ko: "선생님", v: "m", art: "class" },
  noah: { name: "Noah", ko: "같은 반 친구", v: "m", art: "team" },
  tyler: { name: "Tyler", ko: "헬스장 직원", v: "m2", art: "gym" },
  jess: { name: "Jess", ko: "미용사", v: "f", art: "salon" },
  zoe: { name: "Zoe", ko: "휴대폰 가게 직원", v: "f2", art: "phonestore" },
  lewis: { name: "Mr. Lewis", ko: "은행 직원", v: "m2", art: "bank" },
  linda: { name: "Linda", ko: "부동산 중개인", v: "f2", art: "agent" },
  patel: { name: "Mr. Patel", ko: "집주인", v: "m", art: "landlord" },
  chris: { name: "Chris", ko: "가구점 직원", v: "m2", art: "furniture" },
  ray: { name: "Ray", ko: "인터넷 설치 기사", v: "m", art: "installer" },
  green: { name: "Mrs. Green", ko: "옆집 할머니", v: "f", art: "neighbor" },
  priya: { name: "Priya", ko: "Fernlight 채용 담당자", v: "f2", art: "recruiter" },
  derek: { name: "Derek", ko: "Fernlight 개발 팀장", v: "m2", art: "hiringmgr" },
  aiden: { name: "Aiden", ko: "Fernlight 개발자", v: "m", art: "startupdev" }
};
// 이야기들이 같이 쓰는 뜻 덩어리. 판정(judge.js)이 철자·줄임말·낱말 끝·to/a/the는 알아서 맞춰 주니 여기엔 뜻이 다른 표현만 넣는다
const DAYS_EN = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "weekend", "tomorrow", "tonight", "today", "next week"];
const M = {
  thx: ["고마움", ["thank", "appreciate", "cheers", "you saved me", "you are the best", "lifesaver", "so kind", "kind of you", "so helpful", "very helpful"]],
  hi: ["인사", ["hi", "nice meet", "good meet", "great meet", "glad meet", "pleased meet", "pleasure", "good morning", "good afternoon", "good evening", "how are you"]],
  ok: ["괜찮음", ["it is okay", "it is fine", "that is okay", "that is fine", "no problem", "no worries", "do not worry", "all good", "okay", "fine", "alright", "never mind", "it is all right", "another time"]],
  yes: ["좋다", ["sure", "of course", "yes", "definitely", "absolutely", "would love", "love to", "sounds good", "sounds great", "sounds fun", "sounds perfect", "good idea", "great idea", "why not", "let us", "okay", "count me in", "deal", "good", "great", "perfect", "alright", "i be in", "i will come", "i will be there", "i be coming"]],
  day: ["요일", DAYS_EN],
  time: ["시간", ["#", "noon", "morning", "afternoon", "evening", "night", "lunch", "after class", "before class", "after school", "oclock", "pm", "anytime", "any time"]],
  from: ["출신", ["korea", "korean", "seoul", "busan", "incheon", "daegu", "daejeon", "gwangju", "jeju", "suwon", "from"]]
};
// 파트 = 한 사람이 보내는 한 시기. 한 번에 한 파트만, 하루는 아침→낮→저녁→밤 순서로 하나씩 열린다(days에 쓴 차례 그대로)
const PARTS = {
  travel: { ko: "여행", icon: "ph-airplane-tilt", desc: "관광객으로 9일 — 공항·호텔·에어비앤비·식당·길",
    days: [["t1", "t2", "t3", "t10"], ["t4", "t5", "t12", "t6"], ["t22", "t9", "t7", "t18"], ["t8", "t14"], ["t23", "t11", "t13", "t3b"],
      ["t15", "t16", "t21", "t10b"], ["t17", "t19", "t20", "t26"], ["t27", "t24", "t25"], ["t23b", "t28", "t29", "t30"]] },
  daily: { ko: "일상", icon: "ph-house-line", desc: "교환학생 한 학기 — 집·수업·이웃·친구",
    days: [["c1", "c2", "f1"], ["c3", "c7", "c4", "f3"], ["f2", "c6", "c8", "c11"], ["c9", "c10", "c5", "f4"], ["c12", "c13", "c14", "f5"],
      ["f7", "f6", "c21", "c22"], ["c19", "c16", "f8", "c20"], ["f20", "f9", "f10", "c15"], ["f21", "c17", "f14", "f11", "c23"], ["c18", "c24", "c27", "f12"],
      ["c25", "f15", "f13", "f23"], ["c26", "f16", "f17", "f18"], ["f26", "c28", "f24", "f22"], ["f19", "f27", "f28", "f25"], ["c29", "c30", "f30", "f29"]] },
  work: { ko: "회사", icon: "ph-briefcase", desc: "스타트업 인턴 — 면접·합격·첫 출근·회의",
    days: [["w1", "w8", "w2", "w6"], ["w7", "w9", "w3", "w10"], ["w4", "w12"], ["w11", "w13", "w14", "w15"], ["w16", "w20"],
      ["w17", "w18", "w19"], ["w21", "w23", "w22", "w25"], ["w5", "w26", "w27"], ["w24", "w28"], ["w29", "w30"]] },
  love: { ko: "연애", icon: "ph-heart", desc: "준비 중", days: [] }
};
