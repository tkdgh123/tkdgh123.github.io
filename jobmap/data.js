// 학과 진로 지도의 공통 데이터. 학과별 내용은 depts-new.js, 숭실대 학과 고유 정보는 depts-ssu.js
const STAT_2024 = "https://hangyo.com/news/article.html?no=106232";
const SSU_RATE = "https://sgsg.hankyung.com/article/2026013029461";
const JOB = "http://job.ssu.ac.kr";
const PATH = "https://path.ssu.ac.kr/";
const WESS = "https://wess.ssu.ac.kr/";
const YW = "https://yw.work24.go.kr";
const COUNSEL = "https://counsel.ssu.ac.kr";
const W24_PSY = "https://www.work24.go.kr/wk/r/c/1000/jobPsyExamList.do";

// 단계 사전: 같은 일은 같은 객체로 쓴다(data.js roadmap, quiz.js fix, diag.js steps). id는 결과의 중복 거르기 키.
// etc는 다른 학교일 때 대신 보여 줄 일반 문구, null이면 다른 학교에서는 뺀다. etc가 없으면 전국 사업이라 그대로 둔다.
const STEP = {
  jobCounsel: { id: "job-counsel", text: "진로취업센터에서 1:1 진로 상담 받기", url: JOB,
    how: "진로취업센터 누리집 '진로취업상담'에서 시간을 골라 슈패스 로그인 후 예약해요.",
    etc: { id: "job-counsel", text: "학교 진로·취업 센터에서 1:1 상담 받기", how: "다니는 학교 홈페이지의 진로·취업 센터에서 1:1 상담을 예약해요." } },
  jobClinic: { id: "job-clinic", text: "진로취업센터 서류·면접 클리닉 신청하기", url: JOB,
    how: "자소서 초안이나 예상 답변을 먼저 써 두고, '진로취업상담'에서 서류면접클리닉(줌)을 슈패스 로그인 후 예약해요.",
    etc: { id: "job-clinic", text: "학교 진로·취업 센터 서류·면접 첨삭 신청하기", how: "다니는 학교 진로·취업 센터에 자소서·면접 첨삭 프로그램이 있는지 보고 신청해요." } },
  jobFair: { id: "job-fair", text: "진로취업센터 채용설명회 챙기기", url: JOB,
    how: "진로취업센터 누리집 첫 화면 프로그램 목록에서 채용상담회 신청 기간을 봐요.",
    etc: { id: "job-fair", text: "학교 채용설명회 일정 챙기기", how: "다니는 학교 진로·취업 센터 공지에서 채용설명회 일정을 봐요." } },
  jobPost: { id: "job-post", text: "진로취업센터 채용 공고 보기", url: JOB,
    how: "진로취업센터 누리집 '채용정보'에서 추천채용·기업채용공고를 봐요.", etc: null },
  alumni: { id: "alumni", text: "졸업 뒤에도 진로취업센터 지원이 이어져요", url: JOB,
    how: "진로취업센터 누리집 '졸업생 특화 프로그램 공지'에서 졸업 뒤 지원을 봐요.",
    etc: { id: "alumni", text: "졸업 뒤에도 학교 진로·취업 센터 지원 알아보기", how: "다니는 학교 진로·취업 센터에 졸업생 상담·프로그램이 있는지 봐요." } },
  work24Test: { id: "work24-test", text: "고용24 직업심리검사로 흥미 확인", url: JOB,
    how: "진로취업센터 누리집 첫 화면의 '고용24직업심리검사' 바로가기로 검사해요.",
    etc: { id: "work24-test", text: "고용24 직업심리검사로 흥미 확인", url: W24_PSY, how: "고용24 '직업심리검사 실시'에서 대학생이 할 수 있는 직업선호도검사를 골라 해요." } },
  care: { id: "care", text: "학생상담센터에서 이야기 나눠 보기", url: COUNSEL,
    how: "상담센터 누리집 '심리상담신청'에서 슈패스 로그인 후 신청하거나 학생회관 504호로 가요.",
    etc: { id: "care", text: "학교 학생상담센터에서 이야기 나눠 보기", how: "다니는 학교 홈페이지의 학생상담센터에서 상담을 예약해요." } },
  pathList: { id: "path-list", text: "슈패스에서 비교과 목록 둘러보기", url: PATH,
    how: "슈패스에 로그인해 비교과 프로그램 목록을 훑어봐요.",
    etc: { id: "path-list", text: "학교 비교과 프로그램 목록 둘러보기", how: "다니는 학교 비교과 누리집에서 이번 학기 프로그램 목록을 훑어봐요." } },
  pathJob: { id: "path-job", text: "슈패스에서 직무 비교과 하나 신청하기", url: PATH,
    how: "슈패스에 로그인해 '직무'로 비교과 프로그램을 검색하고 신청해요.",
    etc: { id: "path-job", text: "학교 비교과에서 직무 프로그램 하나 신청하기", how: "다니는 학교 비교과 누리집에서 '직무'로 프로그램을 검색해요." } },
  wess: { id: "wess", text: "현장실습학기제 기업 목록 보기", url: WESS,
    how: "현장실습지원센터(WESS) 첫 화면에서 실습 기업과 모집 학과를 봐요.",
    etc: { id: "wess", text: "학교 현장실습 프로그램 찾아보기", how: "다니는 학교 현장실습 담당 부서 공지에서 이번 학기 실습 기업을 봐요." } },
  yw: { id: "yw", text: "미래내일 일경험(인턴형·프로젝트형) 찾아보기", url: YW,
    how: "청년일경험포털에서 인턴형·프로젝트형 공고를 찾고, 고용24 로그인 후 신청해요." }
};

window.JOBMAP = {
  checked: "2026년 10월 30일",
  schools: [{ id: "ssu", name: "숭실대학교" }],
  collegeOrder: ["인문대학", "법과대학", "사회과학대학", "경제통상대학", "경영대학", "공과대학", "자연과학대학", "IT대학", "AI대학", "베어드학부대학"],
  // 전국 계열 취업률(계열 칩 6개, depts는 그 계열 자료가 있는 깊은판 학과) + 단과대 → 계열
  fieldRate: (() => {
    const basis = "2024년 졸업자, 교육부 고등교육기관 졸업자 취업통계(2025-12-30 발표)";
    const r = (id, name, value, depts) => ({ id, name, value, depts, label: `전국 ${name}계열 취업률`, basis, source: STAT_2024 });
    const fields = [r("hum", "인문", "61.1%", ["jp", "eng"]), r("soc", "사회", "69.0%", ["biz", "pubadmin", "masscom"]), r("edu", "교육", "71.1%", []),
      r("eng", "공학", "70.4%", ["mechanical", "aisw"]), r("sci", "자연", "65.4%", ["math"]), r("art", "예체능", "66.7%", [])];
    const [hum, soc, , eng, sci] = fields;
    return { "인문대학": hum, "법과대학": soc, "사회과학대학": soc, "경제통상대학": soc, "경영대학": soc, "공과대학": eng, "자연과학대학": sci, "IT대학": eng, "AI대학": eng, fields, basis, source: STAT_2024 };
  })(),
  // 첫 화면 소식(최근 120일 안이면 보임). 배포일 맞춤은 T24
  updates: [{ date: "2026-10-31", text: "숭실대 학과 44개와 다른 학교 학과 지도를 열었어요." }],
  // 시기 한 줄: 4구간 중 3구간 이상 2024년 이후 원문을 찾을 때만 넣는다(아직 없음)
  seasons: [],

  ssu: {
    rate: { label: "숭실대 전체 취업률", value: "67.7%", basis: "2024년 졸업자, 대학알리미 기준 보도", source: SSU_RATE },
    roadmap: {
      1: [STEP.jobCounsel, STEP.pathList],
      2: [STEP.pathJob, STEP.work24Test],
      3: [STEP.wess, STEP.jobClinic],
      4: [STEP.jobFair, STEP.alumni]
    },
    resources: [
      { name: "슈패스(SSU-PATH)", desc: "학생활동이력 통합관리시스템. 비교과 신청과 진로·심리 상담 예약을 여기서 해요. 로그인 필요", url: PATH },
      { name: "진로취업센터", desc: "진로 상담, 자소서·면접 클리닉, 채용설명회", url: JOB },
      { name: "현장실습지원센터", desc: "현장실습학기제, 실습 기업 목록", url: WESS },
      { name: "현장실습학기제 한눈에", desc: "작업실에 정리해 둔 신청 흐름과 실습지원비", url: "../internship/" }
    ]
  },
};
