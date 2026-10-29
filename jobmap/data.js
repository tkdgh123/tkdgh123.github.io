// 학과 진로 지도의 공통 데이터. 학과별 내용은 depts-new.js, 숭실대 학과 고유 정보는 depts-ssu.js
const STAT_2024 = "https://hangyo.com/news/article.html?no=106232";
const SSU_RATE = "https://sgsg.hankyung.com/article/2026013029461";
const JOB = "http://job.ssu.ac.kr";
const PATH = "https://path.ssu.ac.kr/";
const WESS = "https://wess.ssu.ac.kr/";
const YW = "https://yw.work24.go.kr";
const COUNSEL = "https://counsel.ssu.ac.kr";

window.JOBMAP = {
  checked: "2026년 10월 29일",
  schools: [{ id: "ssu", name: "숭실대학교" }],
  collegeOrder: ["인문대학", "법과대학", "사회과학대학", "경제통상대학", "경영대학", "공과대학", "자연과학대학", "IT대학", "AI대학"],
  // 단과대 → 전국 같은 계열 취업률 (2024년 졸업자, 교육부 취업통계)
  fieldRate: (() => {
    const r = (field, value) => ({ label: `전국 ${field}계열 취업률`, value, basis: "2024년 졸업자, 교육부 취업통계", source: STAT_2024 });
    const hum = r("인문", "61.1%"), soc = r("사회", "69.0%"), eng = r("공학", "70.4%"), sci = r("자연", "65.4%");
    return { "인문대학": hum, "법과대학": soc, "사회과학대학": soc, "경제통상대학": soc, "경영대학": soc, "공과대학": eng, "자연과학대학": sci, "IT대학": eng, "AI대학": eng };
  })(),

  ssu: {
    rate: { label: "숭실대 전체 취업률", value: "67.7%", basis: "2024년 졸업자, 대학알리미 기준 보도", source: SSU_RATE },
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
};
