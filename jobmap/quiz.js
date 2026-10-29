// 질문지. 유형 이름을 붙이지 않고, 답을 그대로 진단과 추천의 근거로 쓴다.
// 기본 정보만 하나 고르기이고, 나머지는 모두 7단계로 답한다. 답 칸 말은 질문 종류마다 다르지만
// 늘 1이 가장 낮고(없다·싫다·못한다) 7이 가장 높다(많다·좋다·잘한다).
// 묶음의 scale이 기본 답 칸이고, 문항에 s가 있으면 그 답 칸을 쓴다.
// state 묶음은 지금 준비 상태 점수가 되고, fix는 낮게 답했을 때 보여 줄 해결책이다.
// jobs는 높게 답할수록 점수를 주는 직무 사전 key다.
(function () {
  const f = (text, url) => ({ text, url });
  const CLINIC = f("진로취업센터 자소서·면접 클리닉 신청하기", JOB), TALK = f("진로취업센터에서 진로 상담 받기", JOB);
  const CARE = f("학생상담센터에서 이야기 나눠 보기", COUNSEL), BIGYO = f("슈패스에서 비교과 찾아보기", PATH);

  const scales = {
    state: ["매우 안좋음", "안좋음", "별로 안좋음", "보통", "조금 좋음", "좋음", "매우 좋음"],
    amount: ["전혀 없다", "거의 없다", "적다", "보통이다", "조금 많다", "많다", "매우 많다"],
    skill: ["매우 못한다", "못한다", "조금 못한다", "보통이다", "조금 잘한다", "잘한다", "매우 잘한다"],
    know: ["전혀 모른다", "모른다", "조금 모른다", "보통이다", "조금 안다", "잘 안다", "매우 잘 안다"],
    agree: ["전혀 아니다", "아니다", "조금 아니다", "보통이다", "조금 그렇다", "그렇다", "매우 그렇다"],
    like: ["매우 싫다", "싫다", "조금 싫다", "보통이다", "조금 좋다", "좋다", "매우 좋다"],
    important: ["전혀 중요하지 않다", "중요하지 않다", "별로 중요하지 않다", "보통이다", "조금 중요하다", "중요하다", "매우 중요하다"]
  };

  const Q = window.JOBMAP.quiz = {
    basics: [
      { id: "school", q: "어느 학교에 다녀요?" },
      { id: "college", q: "단과대를 골라 주세요" },
      { id: "dept", q: "학과는요?" },
      { id: "year", q: "지금 몇 학년이에요?", options: ["1학년", "2학년", "3학년", "4학년 이상"] },
      { id: "double", q: "복수전공이나 부전공은요?", options: ["하고 있어요", "할까 고민 중이에요", "안 해요"] }
    ],
    note: { q: "더 털어놓고 싶은 고민이 있으면 적어 주세요", hint: "적지 않아도 돼요. 이름·학번처럼 나를 알 수 있는 내용은 빼 주세요." },

    groups: [
      {
        id: "spec", title: "스펙", ask: "지금 내 스펙은 어때요?", scale: "state", state: true,
        items: [
          { id: "gpa", q: "전공 과목 학점", fix: f("남은 학기 전공 성적 올릴 계획 세우기", null) },
          { id: "major", q: "전공 내용을 남에게 설명하기", s: "skill", fix: BIGYO },
          { id: "lang", q: "토익·토익스피킹·오픽 같은 어학 점수", fix: f("어학 점수 FAQ 보기", "#faq") },
          { id: "eng", q: "영어로 말하고 듣기", s: "skill", fix: f("어학 점수 FAQ 보기", "#faq") },
          { id: "lang2", q: "제2외국어(일본어·중국어 등)로 말하고 읽기", s: "skill" },
          { id: "cert", q: "가고 싶은 쪽과 관련된 자격증 준비 상태", fix: f("직무 사전에서 직무별 자격증 보기", "#jobs") },
          { id: "office", q: "엑셀·문서·발표 자료 만들기", s: "skill", fix: BIGYO },
          { id: "code", q: "코딩이나 데이터 도구(파이썬·SQL 등) 다루기", s: "skill", fix: f("데이터 분석 직무 사전 보기", "#jobs-data") }
        ]
      },
      {
        id: "exp", title: "경험", ask: "지금까지 해 본 경험은 얼마나 돼요?", scale: "amount", state: true,
        items: [
          { id: "intern", q: "인턴·현장실습 경험", fix: f("현장실습학기제 기업 목록 보기", WESS) },
          { id: "outside", q: "대외활동·서포터즈 경험", fix: f("미래내일 일경험 찾아보기", YW) },
          { id: "contest", q: "공모전·경진대회 경험", fix: BIGYO },
          { id: "club", q: "동아리·학회에서 함께 무언가 만든 경험" },
          { id: "parttime", q: "아르바이트처럼 돈을 받고 일해 본 경험" },
          { id: "relexp", q: "가고 싶은 직무와 이어지는 경험", fix: f("미래내일 일경험(인턴형·프로젝트형) 찾아보기", YW) }
        ]
      },
      {
        id: "docs", title: "서류·면접", ask: "서류와 면접 준비는 어때요?", scale: "state", state: true,
        items: [
          { id: "story", q: "자소서에 쓸 수 있는 내 이야기", s: "amount", fix: CLINIC },
          { id: "folio", q: "이력서·포트폴리오 정리 상태", fix: CLINIC },
          { id: "interview", q: "면접에서 나를 말로 설명하기", s: "skill", fix: CLINIC },
          { id: "written", q: "인적성·NCS 같은 필기시험 준비 상태", fix: f("공기업 사무직 직무 사전에서 NCS 보기", "#jobs-ncs") }
        ]
      },
      {
        id: "info", title: "정보·도움", ask: "취업 정보와 도움은 어느 정도예요?", scale: "know", state: true,
        items: [
          { id: "jobknow", q: "가고 싶은 직무가 실제로 무슨 일을 하는지", fix: f("직무 사전 읽어 보기", "#jobs") },
          { id: "notice", q: "나는 채용 공고와 채용 일정을 챙겨 보고 있다", s: "agree", fix: f("진로취업센터 채용 공고 챙기기", JOB) },
          { id: "company", q: "가고 싶은 회사·기관이 어떤 곳인지", fix: f("공채·수시 FAQ 보기", "#faq") },
          { id: "schoolhelp", q: "학교 취업 지원(진로취업센터·비교과)을 써 본 경험", s: "amount", fix: BIGYO },
          { id: "mentor", q: "진로를 물어볼 수 있는 사람(선배·교수·현직자)", s: "amount", fix: TALK },
          { id: "time", q: "취업 준비에 쓸 수 있는 시간", s: "amount" }
        ]
      },
      {
        id: "mind", title: "마음·생활", ask: "요즘 내 마음과 생활은 어때요?", scale: "agree", state: true,
        items: [
          { id: "mood", q: "취업을 떠올릴 때 드는 기분", s: "state", fix: CARE },
          { id: "majorBelief", q: "내 전공이 취업에 도움이 될 것 같다", fix: f("전공 밖으로 간 졸업생 사례 보기", "#map") },
          { id: "know", q: "내가 하고 싶은 일이 무엇인지", s: "know", fix: TALK },
          { id: "strength", q: "내 강점·잘하는 것이 무엇인지", s: "know", fix: f("고용24 직업심리검사로 흥미 확인하기", JOB) },
          { id: "pace", q: "남과 비교하지 않고 내 속도로 가고 있다", fix: CARE },
          { id: "runway", q: "졸업까지 남은 기간에 여유가 있다" },
          { id: "money", q: "취업 준비 기간을 버틸 경제적 여유가 있다" },
          { id: "family", q: "가족과 진로 이야기를 할 때의 마음", s: "state" },
          { id: "stamina", q: "수업과 취업 준비를 함께 할 체력이 있다" },
          { id: "steady", q: "계획한 것을 꾸준히 해내는 편이다" },
          { id: "bounce", q: "떨어지거나 실패해도 다시 일어서는 편이다", fix: CARE },
          { id: "courage", q: "새로운 일을 시작할 때 크게 망설이지 않는다" },
          { id: "reach", q: "처음 보는 사람에게 먼저 연락하거나 묻기", s: "skill", fix: TALK },
          { id: "filter", q: "넘치는 취업 정보 속에서 필요한 것만 고르기", s: "skill", fix: f("많이 묻는 질문 먼저 읽어 보기", "#faq") },
          { id: "rhythm", q: "잠·식사 같은 생활 리듬", s: "state", fix: CARE },
          { id: "drive", q: "요즘 무언가 해 보고 싶은 의욕이 있다", fix: CARE },
          { id: "campus", q: "학교생활", s: "state" },
          { id: "path", q: "졸업 뒤 갈 길(취업·대학원·시험)을 정했다", fix: TALK },
          { id: "order", q: "취업 준비를 어떤 순서로 하면 되는지", s: "know", fix: f("많이 묻는 질문에서 준비 기간 보기", "#faq") },
          { id: "askhelp", q: "힘들 때 다른 사람에게 도움을 청하는 편이다", fix: CARE }
        ]
      },
      {
        id: "work", title: "하고 싶은 일", ask: "이런 일을 하는 건 어때요?", scale: "like",
        items: [
          { id: "w1", q: "처음 보는 사람을 만나 이야기 나누기", jobs: ["sales", "trade"] },
          { id: "w2", q: "상대를 설득해서 '좋아요'를 받아 내기", jobs: ["sales", "marketing"] },
          { id: "w3", q: "매출 같은 목표 숫자를 정하고 채워 가기", jobs: ["sales"] },
          { id: "w4", q: "사무실 밖을 다니며 거래처 만나기", jobs: ["sales", "scm"] },
          { id: "w5", q: "외국어로 메일 쓰고 전화하기", jobs: ["trade"] },
          { id: "w6", q: "다른 나라 사람·문화와 함께 일하기", jobs: ["trade"] },
          { id: "w7", q: "해외 출장 가기", jobs: ["trade"] },
          { id: "w8", q: "계약서·수출입 서류를 꼼꼼히 다루기", jobs: ["trade", "scm"] },
          { id: "w9", q: "사람들이 요즘 뭘 좋아하는지 살피기", jobs: ["marketing", "itpm"] },
          { id: "w10", q: "SNS 글·사진·영상 만들기", jobs: ["marketing"] },
          { id: "w11", q: "광고 문구나 홍보 글 쓰기", jobs: ["marketing"] },
          { id: "w12", q: "행사·캠페인을 기획해서 열기", jobs: ["marketing", "hr"] },
          { id: "w13", q: "지원자를 만나 보고 뽑을 사람 고르기", jobs: ["hr"] },
          { id: "w14", q: "동료의 고민을 듣고 도와주기", jobs: ["hr", "cs"] },
          { id: "w15", q: "사람들을 위한 교육 프로그램 만들기", jobs: ["hr"] },
          { id: "w16", q: "회사 규칙·복지 제도를 만들고 고치기", jobs: ["hr", "strategy"] },
          { id: "w17", q: "돈이 들고 나간 기록을 맞춰 보기", jobs: ["finance"] },
          { id: "w18", q: "엑셀로 숫자 표를 정리하고 계산하기", jobs: ["finance", "data", "scm"] },
          { id: "w19", q: "회계·세금 원리 공부하기", jobs: ["finance"] },
          { id: "w20", q: "1원도 틀리지 않게 여러 번 확인하기", jobs: ["finance", "ncs"] },
          { id: "w21", q: "회사가 나아갈 방향을 고민하기", jobs: ["strategy"] },
          { id: "w22", q: "시장·경쟁사를 조사해서 보고서 쓰기", jobs: ["strategy", "marketing"] },
          { id: "w23", q: "여러 부서 의견을 모아 결정을 돕기", jobs: ["strategy", "itpm"] },
          { id: "w24", q: "새 사업 아이디어를 내고 따져 보기", jobs: ["strategy", "itpm"] },
          { id: "w25", q: "물건이 어디서 어디로 가는지 관리하기", jobs: ["scm"] },
          { id: "w26", q: "협력업체와 가격·납기를 협상하기", jobs: ["scm", "sales"] },
          { id: "w27", q: "일정에 맞춰 일을 차질 없이 진행시키기", jobs: ["scm", "itpm"] },
          { id: "w28", q: "비용을 줄이는 방법 찾기", jobs: ["scm", "finance"] },
          { id: "w29", q: "고객 불만을 듣고 해결하기", jobs: ["cs"] },
          { id: "w30", q: "같은 질문을 받아도 친절하게 다시 설명하기", jobs: ["cs", "civil"] },
          { id: "w31", q: "서비스의 불편한 점을 찾아 고치자고 제안하기", jobs: ["cs", "itpm"] },
          { id: "w32", q: "앱·웹의 화면과 기능을 구상하기", jobs: ["itpm"] },
          { id: "w33", q: "개발자·디자이너 사이에서 일정을 조율하기", jobs: ["itpm"] },
          { id: "w34", q: "새로 나온 IT 서비스를 먼저 써 보기", jobs: ["itpm", "data"] },
          { id: "w35", q: "데이터에서 숨은 패턴 찾기", jobs: ["data", "strategy"] },
          { id: "w36", q: "통계·수학 문제 풀기", jobs: ["data", "finance"] },
          { id: "w37", q: "파이썬·SQL로 코드 짜기", jobs: ["data"] },
          { id: "w38", q: "분석 결과를 그래프로 보여 주기", jobs: ["data", "strategy"] },
          { id: "w39", q: "정해진 규칙과 절차대로 처리하기", jobs: ["ncs", "civil"] },
          { id: "w40", q: "사회·공공에 도움이 되는 일 하기", jobs: ["ncs", "civil"] },
          { id: "w41", q: "공문·보고서처럼 형식 있는 문서 쓰기", jobs: ["civil", "ncs"] },
          { id: "w42", q: "시험 공부를 오래 꾸준히 하기", jobs: ["civil", "ncs"] },
          { id: "w43", q: "법·규정을 찾아 읽고 적용하기", jobs: ["civil", "ncs", "hr"] },
          { id: "w44", q: "여러 사람 앞에서 발표하기", jobs: ["sales", "strategy", "marketing"] }
        ]
      },
      {
        id: "style", title: "일하는 방식", ask: "이렇게 일하는 건 어때요?", scale: "like",
        items: [
          { id: "s1", q: "혼자 조용히 집중해서 일하기", jobs: ["data", "finance"] },
          { id: "s2", q: "여럿이 팀으로 함께 일하기", jobs: ["itpm", "marketing", "strategy"] },
          { id: "s3", q: "매일 비슷한 일을 정확하게 반복하기", jobs: ["ncs", "civil", "finance", "cs"] },
          { id: "s4", q: "매일 새로운 일이 생기는 것", jobs: ["marketing", "strategy", "itpm"] },
          { id: "s5", q: "정해진 시간에 퇴근하기", jobs: ["ncs", "civil"] },
          { id: "s6", q: "바쁠 땐 늦게까지 일하더라도 성과 내기", jobs: ["sales", "strategy"] },
          { id: "s7", q: "성과만큼 보상(인센티브) 받기", jobs: ["sales"] },
          { id: "s8", q: "하루 대부분 책상에 앉아 일하기", jobs: ["finance", "data", "civil"] },
          { id: "s9", q: "외부 미팅·출장이 잦은 것", jobs: ["sales", "trade"] },
          { id: "s10", q: "빠르게 바뀌는 환경에 맞추기", jobs: ["itpm", "marketing"] },
          { id: "s11", q: "실수가 없도록 꼼꼼히 챙기기", jobs: ["finance", "scm", "ncs"] },
          { id: "s12", q: "세부보다 큰 그림을 먼저 그리기", jobs: ["strategy"] },
          { id: "s13", q: "마감에 쫓기며 일하기", jobs: ["marketing"] },
          { id: "s14", q: "화난 사람의 감정을 받아 주기", jobs: ["cs", "hr"] },
          { id: "s15", q: "정해진 답 없이 스스로 방법 찾기", jobs: ["data", "itpm", "strategy"] },
          { id: "s16", q: "지시받은 일을 정확히 해내기", jobs: ["ncs", "civil", "cs"] }
        ]
      },
      {
        id: "org", title: "가고 싶은 곳", ask: "이런 곳에 가는 건 어때요?", scale: "like",
        items: [
          { id: "big", q: "대기업에 가기" },
          { id: "mid", q: "중견·중소기업에 가기" },
          { id: "public", q: "공기업·공공기관에 가기", jobs: ["ncs"] },
          { id: "gov", q: "공무원 되기", jobs: ["civil"] },
          { id: "foreign", q: "외국계 회사나 해외에서 일하기", jobs: ["trade"] },
          { id: "startup", q: "스타트업에서 일하기", jobs: ["itpm", "marketing"] },
          { id: "grad", q: "대학원에 진학하기" }
        ]
      },
      {
        id: "value", title: "중요한 것", ask: "회사를 고를 때 이건 얼마나 중요해요?", scale: "important",
        items: [
          { id: "pay", q: "높은 연봉" },
          { id: "stable", q: "오래 다닐 수 있는 안정성", jobs: ["ncs", "civil"] },
          { id: "grow", q: "일하면서 성장하고 배우기" },
          { id: "balance", q: "일과 생활의 균형(워라밸)" },
          { id: "want", q: "내가 하고 싶은 일을 하기" },
          { id: "near", q: "집에서 가까운 근무지" },
          { id: "brand", q: "이름이 알려진 회사" },
          { id: "meaning", q: "사회에 의미 있는 일" },
          { id: "promote", q: "빠른 승진" },
          { id: "flat", q: "수평적인 분위기" }
        ]
      }
    ],

    // 학과 지도의 직업 이름에서 직무 사전으로 잇는 낱말
    jobAlias: {
      sales: ["영업"], trade: ["해외영업", "무역"], marketing: ["마케팅", "홍보"], hr: ["인사"],
      finance: ["재무"], strategy: ["경영기획", "신사업 기획"], scm: ["구매", "물류", "SCM"], cs: ["고객 서비스", "CS"],
      itpm: ["IT 기획", "PM", "서비스 기획"], data: ["데이터 분석", "데이터/AI"], ncs: ["공기업"], civil: ["공무원"]
    },
    // 이 말이 들어간 이름은 그 직무 사전으로 잇지 않는다 (기술직은 사무·행정직과 다름)
    jobExclude: { civil: ["기술", "전산", "경찰", "소방"], ncs: ["기술직", "기계직", "전산직"] }
  };

  const byId = {};
  Q.groups.forEach((g) => g.items.forEach((it) => { it.scale = scales[it.s || g.scale]; byId[it.id] = it; }));
  // 진단·추천 문장에 쓰는 "'문항'에 '답'을/를"
  Q.say = (id, v) => {
    const it = byId[id], t = it.scale[v - 1], c = t.charCodeAt(t.length - 1) - 0xAC00;
    return `'${it.q}'에 '${t}'${c % 28 ? "을" : "를"}`;
  };
})();
