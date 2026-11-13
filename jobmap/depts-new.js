// 학과 8개 진로 데이터. 근거: research_notes/학과별 졸업 후 진로 전국 사례 (조사 2026-10-29).
// paths의 k = 그 진로를 꼽은 대학 공식 학과 페이지 수. 갱신일이 2024년 이전이거나 노트에서 신뢰 낮음으로 본 페이지는 셈에서 뺐다.
// cases는 2024년 이후 자료만. 링커리어 합격 자소서는 서류/최종 구분이 없고 날짜 대신 합격 시즌을 적었다.
// paths·cases의 jobs = 이어 볼 직무 사전 key(빈 배열이면 링크 없음). home: true = 첫 화면 사례 띠(다른 대학 공개 사례만).
// refStats = 다른 대학 학과 숫자(참고 한 줄로만), ssuOnly = 숭실대 안내라 다른 학교 화면에서 뺄 자격 메모.
(function () {
  const LK = "https://linkareer.com/cover-letter/";
  const LKP = "https://community.linkareer.com/pass-review/";
  const CW_JP = "https://www.changwon.ac.kr/japan/na/ntt/selectNttInfo.do?mi=12967&nttSn=";
  const KU_CDC = "https://biz.korea.ac.kr/cdc/board/review_view.html?key=&keyfield=&cate=&page=1&no=";
  const KMU_ME = "https://me.kookmin.ac.kr/mech/students/press_corps.do?mode=view&articleNo=";
  const PNU_PDF = "https://job.pusan.ac.kr/attachment/download/1517491/2025%ED%95%99%EB%85%84%EB%8F%84+%EC%B7%A8%EC%97%85%EC%84%B1%EA%B3%B5%EC%9A%B0%EC%88%98%EC%82%AC%EB%A1%80+%EA%B3%B5%EB%AA%A8%EC%A0%84+%EC%88%98%EC%83%81%EC%9E%91+%EB%AA%A8%EC%9D%8C%EC%A7%91.pdf";
  const HUM_RATE = { label: "전국 인문계열 취업률", value: "61.1%", basis: "2024년 졸업자, 교육부·한국교육개발원 취업통계를 옮긴 2차 정리", source: "https://community.linkareer.com/employment_data/6249781" };
  const SOC_RATE = { label: "전국 사회계열 취업률", value: "69.0%", basis: "2024년 졸업자, 교육부 등 고등교육기관 졸업자 취업통계(2025-12-30 발표)", source: "https://www.hangyo.com/mobile/article.html?no=106232" };
  const OFFICIAL = "대학 공식 후기", LKT = "합격 자소서(링커리어)";

  window.JOBMAP.depts = [
    {
      id: "jp", name: "일어일문학과", college: "인문대학", promptName: "일본어·일본학 전공",
      intro: "통번역·교육·일본 취업을 많이 꼽지만, 실제론 기업·금융·공무원도 많아요.",
      uni: { n: 8, list: "상명대·명지대·영남대·전주대·충남대·한남대·동국대·국립창원대" },
      paths: [
        { name: "통역·번역", kind: "in", k: 7, jobs: [] },
        { name: "교사·일본어 강사", kind: "in", k: 7, jobs: ["teacher"], note: "교사는 교직과정이 있는 학과만 가능해요" },
        { name: "일본 현지 취업", kind: "in", k: 7, jobs: [] },
        { name: "무역·종합상사", kind: "in", k: 6, jobs: ["trade"] },
        { name: "여행·관광·호텔", kind: "in", k: 6, jobs: [] },
        { name: "국내 일반기업·대기업", kind: "out", k: 6, jobs: [] },
        { name: "항공·공항", kind: "in", k: 5, jobs: [] },
        { name: "출판", kind: "in", k: 5, jobs: [] },
        { name: "대학원·연구", kind: "in", k: 5, jobs: [] },
        { name: "은행 등 금융", kind: "out", k: 5, jobs: [] },
        { name: "공무원·공공기관", kind: "out", k: 4, jobs: ["civil", "ncs"] },
        { name: "IT(주로 일본 IT 취업)", kind: "out", k: 4, jobs: [] },
        { name: "언론·방송", kind: "out", k: 4, jobs: ["media"] },
        { name: "유통·백화점·면세점", kind: "out", k: 3, jobs: [] }
      ],
      cases: [
        { to: "덴소코리아 사업계획팀(경영 업무)", kind: "out", jobs: ["strategy"], how: ["4학년 2학기에 자격증 준비 시작", "일본어·영어·컴활로 지원 자격 갖춤", "자소서 꼼꼼히, 면접에서 의지 보임"], type: OFFICIAL, date: "2025-12", trust: "높음", home: true, source: CW_JP + "1392323" },
        { to: "경남 함안군 지방공무원(민원·행정)", kind: "out", jobs: ["civil"], how: ["1~2학년 때 공무원으로 진로 결정", "휴학 없이 졸업한 뒤 본격 준비", "연극·과대표·연수 경험을 민원 응대에 씀"], type: OFFICIAL, date: "2024-11", trust: "높음", source: CW_JP + "1354115" },
        { to: "동그라미재단 홍보·마케팅 인턴", kind: "out", jobs: ["marketing"], how: ["JLPT N2", "서포터즈 활동", "GTQ 포토샵 1급"], type: LKT, date: "2026 상반기", trust: "중간", source: LK + "36971" },
        { to: "토탈현대 계약관리 인턴", kind: "out", jobs: [], how: ["소프트웨어 인문 융합전공", "오픽 IM3·TEPS·JLPT", "학점 3.91"], type: LKT, date: "2026 상반기", trust: "중간", source: LK + "36542" },
        { to: "도너츠 기획영업부 신입", kind: "out", jobs: ["sales"], how: ["JPT 865·JLPT 1급", "프리랜서 경력", "학점 3.16"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "35756" },
        { to: "서울우유협동조합 영업·경영지원 신입", kind: "out", jobs: ["sales"], how: ["오픽 IH·TEPS", "JLPT N1", "학점 3.87"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34328" },
        { to: "LG생활건강 물류 신입", kind: "out", jobs: ["scm"], how: ["오픽 IH", "JLPT N1·JPT 730", "학점 3.89"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33323" },
        { to: "현대바이오랜드 해외영업 신입", kind: "out", jobs: ["trade"], how: ["토익 820·토스 IH", "JLPT N1·JPT 955", "학점 4.27"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33181" },
        { to: "티웨이항공 객실승무원", kind: "in", jobs: [], how: ["2학년 겨울 일본 대학 1개월 연수", "일본 국립대 1년 교환학생", "현지 동아리·알바로 회화 키움"], type: OFFICIAL, date: "2024-11", trust: "높음", source: CW_JP + "1353026" },
        { to: "도쿄일렉트론코리아 부품영업 인턴", kind: "in", jobs: ["sales"], how: ["인문소프트웨어 융합전공", "학점 3.87", "일본계 기업에서 일본어 활용"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34054" },
        { to: "애니플러스 콘텐츠사업(VOD·마케팅)", kind: "in", jobs: ["marketing"], how: ["토익 925", "JPT 450", "학점 4.02"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33927" }
      ],
      tips: [
        "일본 교환학생·단기연수로 회화를 키워요",
        "경영·SW 같은 복수·융합전공을 더한 합격자가 많아요",
        "JLPT N1에 JPT 700~950을 더한 경우가 반복돼요",
        "일본어만 말고 토익·오픽 영어 점수도 갖춰요",
        "학과 활동의 협업 경험을 면접에서 써요",
        "스펙이 다 맞지 않아도 일단 지원해 봐요"
      ],
      trends: [
        { text: "2024년 정부 지원 일본 취업 1,531명, 전체의 26.8%로 1위", date: "2025-11", source: "https://www.hankyung.com/article/202511042453i" },
        { text: "2025년 정부 지원 일본 취업 2,257명, 전년보다 47% 늘었어요", date: "2026-08", source: "https://www.g-enews.com/article/Global-Biz/2026/08/2026080310333080752bd56fbc3c_1" },
        { text: "일본 내 한국인 근로자 7만5,003명, 도소매·IT·숙박음식 순", date: "2025-11", source: "https://www.hankyung.com/article/202511042453i" },
        { text: "KOTRA 일본 잡페어에 75개사 162개 직무(사무·영업 포함)", date: "2025-08", source: "https://www.hankyung.com/article/202508200421i" }
      ],
      stats: [HUM_RATE],
      refStats: [
        { label: "한림대 일본학과 취업률(참고)", value: "40%", basis: "2024 취업률 공시 기준, 다른 대학 1곳 사례", source: "https://job.hallym.ac.kr/job/7627/subview.do" }
      ],
      certs: [
        { name: "JLPT N1", note: "영남대 일문과 졸업 어학요건 중 하나예요", source: "https://www.yu.ac.kr/main/academics/japan.do" },
        { name: "JPT", note: "영남대는 JPT 740 이상을 졸업 요건으로 둬요", source: "https://www.yu.ac.kr/main/academics/japan.do" },
        { name: "관광통역안내사", note: "전주대가 관광통역 진로 자격으로 안내해요", source: "https://iphak.jj.ac.kr/iphak/exploration/human/japanese.do" },
        { name: "정보처리기사", note: "전주대가 IT 진로 자격으로 안내해요", source: "https://iphak.jj.ac.kr/iphak/exploration/human/japanese.do" },
        { name: "컴퓨터활용능력", note: "덴소코리아 합격자가 일본어·영어와 함께 꼽았어요", source: CW_JP + "1392323" }
      ],
      sources: [
        "https://www.smu.ac.kr/smnihongo/intro/career.do",
        "https://mju.ac.kr/mjukr/534/subview.do",
        "https://www.yu.ac.kr/main/academics/japan.do",
        "https://iphak.jj.ac.kr/iphak/exploration/human/japanese.do",
        "https://cnujapan.cnu.ac.kr/japanese/intro/introduction.do",
        "https://www.hannam.ac.kr/kor/educate/educate_0101_08.html",
        "https://japanese.dongguk.ac.kr/HOME/japanese/sub.htm?nav_code=jap1587088653",
        "https://www.changwon.ac.kr/japan/cm/cntnts/cntntsView.do?mi=6890&cntntsId=2044"
      ]
    },
    {
      id: "eng", name: "영어영문학과", college: "인문대학", promptName: "영어·영문학 전공",
      intro: "교육·일반기업·공직을 고루 꼽고, 실제론 영업·사무 같은 전공 무관이 많아요.",
      uni: { n: 8, list: "숭실대·연세대(미래)·경성대·동국대·서울시립대·공주대·명지대·전주대" },
      paths: [
        { name: "교사·강사·교육기관", kind: "in", k: 8, jobs: ["teacher"] },
        { name: "일반기업 사무·영업", kind: "out", k: 7, jobs: ["sales"] },
        { name: "무역·해외사업·국제업무", kind: "in", k: 6, jobs: ["trade"] },
        { name: "공무원·공공기관", kind: "out", k: 6, jobs: ["civil", "ncs"] },
        { name: "대학원·학계", kind: "in", k: 6, jobs: [] },
        { name: "번역·통역", kind: "in", k: 4, jobs: [], note: "AI 1차 번역 뒤 사람이 감수하는 방식으로 바뀌는 중이에요" },
        { name: "항공사·승무원", kind: "in", k: 4, jobs: [] },
        { name: "출판", kind: "in", k: 4, jobs: [] },
        { name: "문화·콘텐츠·공연 기획", kind: "in", k: 4, jobs: [] },
        { name: "은행·증권", kind: "out", k: 3, jobs: [] },
        { name: "호텔·관광·여행", kind: "in", k: 3, jobs: [] },
        { name: "언론·방송", kind: "out", k: 3, jobs: ["media"] },
        { name: "외국계 기업", kind: "in", k: 3, jobs: [] },
        { name: "홍보·마케팅", kind: "out", k: 2, jobs: ["marketing"] }
      ],
      cases: [
        { to: "한국토지주택공사(LH) 일반행정", kind: "out", jobs: ["ncs"], how: ["공익 업무·워라밸을 보고 공기업으로 목표", "한국도로공사 체험형 인턴", "관심 사업 한두 개를 좁고 깊게 공부해 면접"], type: OFFICIAL, date: "2025-11", trust: "높음", home: true, source: PNU_PDF },
        { to: "LG전자 영업·마케팅 신입", kind: "out", jobs: ["sales", "marketing"], how: ["외국계 호텔·B2B 콘텐츠마케팅 인턴", "대학내일 트렌드 크루 1년", "오픽 AL"], type: LKT, date: "2026 상반기", trust: "중간", source: LK + "35680" },
        { to: "B2B·제약 영업(깨끗한나라 등 4곳)", kind: "out", jobs: ["sales"], how: ["공기업 인턴 6개월", "토익 965·오픽 AL", "한국사·컴활 1급·유통관리사 2급"], type: LKT, date: "2026 상반기", trust: "중간", source: LK + "36838" },
        { to: "서울시 일반행정 9급", kind: "out", jobs: ["civil"], how: ["행정법·행정학 3단계 강의 후 반복", "국어 비문학 실전 문제 주 2~3회", "서울시 정책 40쪽 정리·면접 스터디"], type: "커뮤니티", date: "2025-10", trust: "중간", source: "https://gall.dcinside.com/mini/board/view/?id=gongsistudy&no=725885" },
        { to: "공기업 4곳(수자원공사·철도공사 등)", kind: "out", jobs: ["ncs"], how: ["학과 진로취업 패키지 프로그램", "공기업 취업 특강", "기업체 탐방"], type: "뉴스", date: "2025-11", trust: "중간", source: "https://v.daum.net/v/20251114152711525" },
        { to: "자동차 부품 회사 영업팀", kind: "out", jobs: ["sales"], how: ["교내 입학 홍보 활동 3년", "영미문화 에세이를 다듬어 투고", "말하기·발표 자신감 키움"], type: OFFICIAL, date: "2024-11", trust: "중간", source: "https://engl.dongguk.ac.kr/HOME/engl/sub.htm?hmode=p&mode=view&mv_data=aWR4PTYwNCZzdGFydFBhZ2U9MCZsaXN0Tm89MTImdGFibGU9ZXhfYmJzX2RhdGFfZW5nbCZuYXZfY29kZT1lbmcxNTg5MzM0NjIyJmNvZGU9QmxvOHozRE5hNnhuJnNlYXJjaF9pdGVtPSZzZWFyY2hfb3JkZXI9Jm9yZGVyX2xpc3Q9Jmxpc3Rfc2NhbGU9JnZpZXdfbGV2ZWw9JnZpZXdfY2F0ZT0mdmlld19jYXRlMj0" },
        { to: "안랩 인사운영 인턴", kind: "out", jobs: ["hr"], how: ["경영 복수전공", "토익 940", "학원 조교(행정) 경험"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34830" },
        { to: "테크로스 AS관리 신입", kind: "out", jobs: ["cs"], how: ["토익 785·토스 Lv7", "포스텍 근무 4개월", "학점 3.98"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "33880" },
        { to: "콜마비앤에이치 ODM영업 신입", kind: "out", jobs: ["sales"], how: ["SK가스·KOICA 인턴", "토익 850·오픽 IH", "학점 3.43"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33367" },
        { to: "인크로스 재무 인턴", kind: "out", jobs: ["finance"], how: ["공기업 인턴", "토익 880·토스 160", "컴활 1급"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33020" },
        { to: "에어코리아 여객운송직 신입", kind: "in", jobs: [], how: ["토익 845", "교육봉사", "한국사 고급·컴활 2급"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "35337" },
        { to: "한국문학번역원 문화예술행정 인턴", kind: "in", jobs: ["ncs"], how: ["토익 970", "근로복지공단 일경험", "학점 4.2"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33554" },
        { to: "지학사 교과서·참고서 개발 신입", kind: "in", jobs: [], how: ["유아교육·영어영문 복수전공", "고용노동청 청년인턴", "학점 3.45"], type: LKT, date: "2024 상반기", trust: "중간", source: LK + "33175" }
      ],
      tips: [
        "영어는 토익보다 오픽·토익스피킹으로 준비해요",
        "점수만으론 부족해요, 직무 인턴·일경험을 쌓아요",
        "관심 직무를 2~3개로 좁혀요",
        "한 직무를 정해 여러 회사에 지원한 합격자가 많아요",
        "대기업 해외영업이 좁으면 중견·외국계로 넓혀요",
        "경영 등 복수전공으로 진로 폭을 넓혀요"
      ],
      trends: [
        { text: "2026 상반기 10대 그룹 8곳이 어학 필수, 지필 토익 인정은 2곳뿐", date: "2026-06", source: "https://www.hankyung.com/article/2026061237421" },
        { text: "이력서 말하기 시험 등록 52.1%, 토익(47.9%)을 처음 앞섰어요", date: "2026-06", source: "https://www.hankyung.com/article/2026061237421" },
        { text: "지역 자동차 부품사가 영어 잘하는 해외영업·구매 지원자를 찾아요", date: "2026-05", source: "https://www.yu.ac.kr/engl/board/notice.do?mode=view&articleNo=229909046" }
      ],
      stats: [HUM_RATE],
      refStats: [
        { label: "한림대 영어영문학과 취업률(참고)", value: "59.4%", basis: "2024 취업률 공시 기준, 같은 대학 인문대 최고, 다른 대학 1곳 사례", source: "https://job.hallym.ac.kr/job/7627/subview.do" }
      ],
      certs: [
        { name: "오픽·토익스피킹", note: "10대 그룹 대부분이 말하기 시험 점수를 받아요", source: "https://www.hankyung.com/article/2026061237421" },
        { name: "중등학교 2급 정교사(영어)", note: "교직 이수로 얻어요", source: "https://elc.hufs.ac.kr/hufselc/m01_s02.do" },
        { name: "국제무역사·무역영어", note: "문과생 해외영업 전환 경로에 나와요", source: "https://brunch.co.kr/@perilar/30" }
      ],
      sources: [
        "https://englan.ssu.ac.kr/%ED%95%99%EA%B3%BC%EC%95%88%EB%82%B4/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/",
        "https://engys.yonsei.ac.kr/engys/intro/career.do",
        "https://kscms.ks.ac.kr/elnl/CMS/Contents/Contents.do?mCode=MN033",
        "https://engl.dongguk.ac.kr/HOME/engl/sub.htm?nav_code=eng1587615167",
        "https://www.uos.ac.kr/liberalarts/depart/eng/introduct.do?identified=anonymous",
        "https://eng.kongju.ac.kr/ZB0210/2898/subview.do",
        "https://mju.ac.kr/mjukr/517/subview.do",
        "https://koredu.jj.ac.kr/iphak/exploration/human/english.do"
      ]
    },
    {
      id: "biz", name: "경영학부", college: "경영대학", promptName: "경영학 전공",
      intro: "일반기업·공무원·마케팅·창업을 고루 꼽고, 합격자는 직무 인턴이 많아요.",
      uni: { n: 6, list: "동명대·국립창원대·신라대·부산디지털대·한경국립대·명지대" },
      paths: [
        { name: "일반기업(대기업·중소)", kind: "in", k: 5, jobs: [] },
        { name: "공무원(세무·재경·행정)", kind: "out", k: 5, jobs: ["civil"] },
        { name: "마케팅·광고·홍보", kind: "in", k: 5, jobs: ["marketing"] },
        { name: "창업·벤처", kind: "in", k: 5, jobs: [] },
        { name: "공기업·공공기관", kind: "in", k: 4, jobs: ["ncs"] },
        { name: "은행·증권·보험", kind: "in", k: 4, jobs: [] },
        { name: "대학원·연구소", kind: "in", k: 4, jobs: [] },
        { name: "유통·MD", kind: "in", k: 4, jobs: [] },
        { name: "공인회계사·세무사", kind: "in", k: 4, jobs: [] },
        { name: "재무·회계 직무", kind: "in", k: 3, jobs: ["finance"] },
        { name: "생산·구매·SCM", kind: "in", k: 3, jobs: ["scm"] },
        { name: "컨설팅", kind: "in", k: 3, jobs: [] },
        { name: "공인노무사", kind: "in", k: 3, jobs: [] },
        { name: "IT·데이터(ERP·빅데이터)", kind: "out", k: 1, jobs: ["itpm", "data"], note: "공식 페이지엔 드물지만 합격 사례엔 SQLD가 자주 나와요" }
      ],
      cases: [
        { to: "한국도로공사서비스(공기업) 최종", kind: "out", jobs: ["ncs"], how: ["NCS 인강 후 오답 위주", "공사 유튜브로 사업 정리", "중소기업 2년 경력"], type: "커뮤니티", date: "2026-07", trust: "중간", source: LKP + "6302642" },
        { to: "한화시스템 경영기획", kind: "in", jobs: ["strategy"], how: ["현장실습이 정규직 전환으로", "CPA 공부한 관리회계를 역량으로", "JD 요구 역량을 자소서 키워드로"], type: OFFICIAL, date: "2025-12", trust: "높음", home: true, source: KU_CDC + "59" },
        { to: "현대자동차 국내판매(마케팅·영업)", kind: "in", jobs: ["marketing", "sales"], how: ["졸업 전 인턴 여러 번", "데이터 분석 역량과 SQLD", "JD 핵심 역량을 한 문장으로"], type: OFFICIAL, date: "2024-05", trust: "높음", source: KU_CDC + "57" },
        { to: "CJ제일제당 구매", kind: "in", jobs: ["scm"], how: ["제조업 실습·창업 학회 1년", "OPIc IH·컴활 1급", "자소서 컨설팅 3회, 두괄식·수치화"], type: OFFICIAL, date: "2024-01", trust: "높음", source: KU_CDC + "52" },
        { to: "현대면세점 영업관리 신입", kind: "in", jobs: ["sales"], how: ["ADsP·국제무역사", "인턴 8개월", "유튜브로 직무 이야기 미리 익힘"], type: "커뮤니티", date: "2026-09", trust: "중간", source: LKP + "6566724" },
        { to: "SK하이닉스 경영전략(서류 합격)", kind: "in", jobs: ["strategy"], how: ["인턴 3회(VC·중견·대기업)", "경험기술서를 bullet로 압축", "정량화와 실행방안 강조"], type: "커뮤니티", date: "2026-07", trust: "중간", source: LKP + "6224907" },
        { to: "KB국민은행 지역인재(최종면접까지)", kind: "in", jobs: [], how: ["신용분석사·투운사·ADsP", "상호금융·금융공기업 계약직 경력", "경영·경제·회계·재무 필기"], type: "커뮤니티", date: "2026-08", trust: "중간", source: LKP + "6365596" },
        { to: "HR·채용마케팅 회사 인턴(졸업 후)", kind: "in", jobs: [], how: ["프로젝트 기획·운영 주도 경험", "회사 공개자료로 포트폴리오", "컴활·포토샵 등 자격증 약 6개"], type: "커뮤니티", date: "2026-05", trust: "중간", source: LKP + "6036092" }
      ],
      tips: [
        "직무를 일찍 좁히고 JD 키워드로 자소서를 써요",
        "인턴·현장실습을 2번 이상, 전환형도 노려요",
        "활동 나열보다 숫자로 성과를 보여줘요",
        "SQLD·ADsP 같은 데이터 역량을 더해요",
        "회계·재무 지식을 기획 직무의 무기로 써요",
        "유관 계약직 경력도 필기·면접에서 무기가 돼요"
      ],
      trends: [
        { text: "CPA 최종합격 1,250명→1,200명→1,150명, 2년 연속 감소", date: "2026-09", source: "https://www.fnnews.com/news/202609011459001662" },
        { text: "세무사 2025년 합격률 10.48%, 전년 13.15%에서 떨어졌어요", date: "2025-11", source: "https://taxtimes.co.kr/mobile/article.html?no=272366" },
        { text: "2026 공공기관 정규직 약 2만8천 명, 2020년 이후 최대", date: "2026-01", source: "https://www.fnnews.com/news/202601271000407972" },
        { text: "한전 2025 상반기 공채, ADsP·SQLD에 서류 최대 5점", date: "2025-07", source: "https://www.hankyung.com/article/2025071873407" }
      ],
      stats: [
        SOC_RATE,
        { label: "CPA 합격자 중 상경계열", value: "69.2%", basis: "2026년 제61회 최종합격 1,150명 기준", source: "https://www.fnnews.com/news/202609011459001662" }
      ],
      certs: [
        { name: "공인회계사(CPA)", note: "2026년 1,150명 합격, 합격률 26.3%", source: "https://www.fnnews.com/news/202609011459001662" },
        { name: "세무사", note: "2025년 728명 합격, 최소합격인원 700명", source: "https://taxtimes.co.kr/mobile/article.html?no=272366" },
        { name: "SQLD·ADsP", note: "한전이 직무 무관 서류 가산점을 줬어요(2025)", source: "https://www.hankyung.com/article/2025071873407" },
        { name: "공인노무사·경영지도사", note: "학과 공식 진로에 인사조직 자격으로 나와요", source: "https://www.changwon.ac.kr/business/cm/cntnts/cntntsView.do?mi=14651&cntntsId=5303" }
      ],
      sources: [
        "https://www.tu.ac.kr/management/sub04_01.do",
        "https://www.changwon.ac.kr/business/cm/cntnts/cntntsView.do?mi=14651&cntntsId=5303",
        "https://dba.silla.ac.kr/dba/index.php?pCode=SUB4000003",
        "https://bdu.ac.kr/bhbdu/sub01_04.do",
        "https://www.hknu.ac.kr/SchoolofLBA/1388/subview.do?",
        "https://www.mju.ac.kr/mjukr/625/subview.do"
      ]
    },
    {
      id: "pubadmin", name: "행정학부", college: "사회과학대학", promptName: "행정학 전공",
      intro: "공무원만이 아니라 언론·민간기업·금융까지 거의 모든 대학이 함께 꼽아요.",
      uni: { n: 5, list: "국립경국대·동의대·강원대·한국교통대·국립창원대" },
      paths: [
        { name: "공무원(국가·지방직 행정)", kind: "in", k: 5, jobs: ["civil"] },
        { name: "경찰·소방 공무원", kind: "in", k: 5, jobs: [] },
        { name: "연구기관·연구원", kind: "in", k: 5, jobs: [] },
        { name: "언론(기자·PD)", kind: "out", k: 5, jobs: ["media"] },
        { name: "민간기업", kind: "out", k: 5, jobs: [] },
        { name: "공기업·공공기관", kind: "in", k: 4, jobs: ["ncs"] },
        { name: "국회·법원·검찰·선관위", kind: "in", k: 4, jobs: ["civil"] },
        { name: "대학원·대학 교원", kind: "in", k: 4, jobs: [] },
        { name: "은행·증권·보험", kind: "out", k: 4, jobs: [] },
        { name: "군무원·군 간부", kind: "in", k: 3, jobs: [] },
        { name: "관세사·법무사·노무사 등", kind: "out", k: 3, jobs: [] },
        { name: "국제기구·국제개발협력", kind: "in", k: 2, jobs: [] },
        { name: "지방의원 등 정치", kind: "in", k: 2, jobs: [] },
        { name: "사회복지", kind: "out", k: 2, jobs: [] }
      ],
      cases: [
        { to: "주택도시보증공사 채권관리", kind: "out", jobs: ["ncs"], how: ["가고 싶은 기관의 채용 조건부터 분석", "필기 다음으로 신용분석사·TESAT 준비", "공사 누리집 보증 약관을 읽고 면접 준비"], type: OFFICIAL, date: "2025-11", trust: "높음", home: true, source: PNU_PDF },
        { to: "SSAFY 13기(IT 개발 교육) 합격", kind: "out", jobs: [], how: ["에세이 '도전' 키워드 500자", "적성진단은 기본서로 4~5일", "IT 주제 개념·장단점 정리(PT면접)"], type: "커뮤니티", date: "2025-04", trust: "중간", source: LKP + "4217091" },
        { to: "IBK기업은행 청년인턴(재학생)", kind: "out", jobs: [], how: ["경영학 복수전공", "영업점 근무 2개월"], type: "블로그", date: "2026-08", trust: "낮음", source: "https://blog.naver.com/seoul_womens/224378214557" },
        { to: "코레일유통 경영일반(필기 합격)", kind: "in", jobs: ["ncs"], how: ["경제학 40일, 하루 6시간 이상", "기본서 다회독·요약집 필사", "기출 병행"], type: "커뮤니티", date: "2025-04", trust: "낮음", source: LKP + "4266220" }
      ],
      tips: [
        "목표 기관을 먼저 정하고 그 기관 기출을 반복해요",
        "NCS는 약 3~6개월, 전형 전체는 6개월~1년을 잡아요",
        "공공기관 필기는 경영·경제·회계 비중이 커요",
        "공기업은 기관 유튜브·홍보영상으로 면접을 준비해요"
      ],
      trends: [
        { text: "2026 국가직 9급 28.6:1, 2024년 21.8:1 이후 2년째 올랐어요", date: "2026-02", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&mode=view&cntId=4208&category=&pageIdx=" },
        { text: "2026 국가직 7급 38.4:1, 2025년 44.6:1보다 낮아졌어요", date: "2026-02", source: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156761979&call_from=rsslink" },
        { text: "2025 공공기관 신규채용 27,434명, 전년보다 7,040명 늘었어요", date: "2025-12", source: "https://www.alio.go.kr/mobile/statistics/newRecruit.do" },
        { text: "2025년부터 9급 국어·영어가 NCS형 직무역량 문제로 바뀌었어요", date: "2025-06", source: "https://www.hankyung.com/article/2025061841811" },
        { text: "2026년 공무원 보수 3.5% 인상, 9년 만의 최대폭", date: "2025-08", source: "https://www.newsis.com/view/NISX20250829_0003308629" }
      ],
      stats: [SOC_RATE],
      refStats: [
        { label: "창원대 행정학과 공무원 합격(참고)", value: "15명", basis: "2024년, 학과 자체조사(누락 가능), 입학정원 28명", source: "https://www.changwon.ac.kr/public/cm/cntnts/cntntsView.do?mi=7729&cntntsId=2325" }
      ],
      certs: [
        { name: "한국사능력검정시험(3급 이상)", note: "2027년부터 9급 한국사 과목을 대신해요", source: "https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?cntId=4195&mode=view" },
        { name: "공인노무사", note: "동의대가 인사·노무 진로로 안내해요", source: "https://pap.deu.ac.kr/pap/sub01_04.do" },
        { name: "관세사·법무사·사회조사분석사", note: "국립경국대가 자격증 진로로 안내해요", source: "https://public.gknu.ac.kr/introduce/course" }
      ],
      sources: [
        "https://public.gknu.ac.kr/introduce/course",
        "https://pap.deu.ac.kr/pap/sub01_04.do",
        "https://social.kangwon.ac.kr/social/department/public-administration.do",
        "https://www.ut.ac.kr/knutpa/sub01_04.do",
        "https://www.changwon.ac.kr/public/cm/cntnts/cntntsView.do?mi=7729&cntntsId=2325"
      ]
    },
    {
      id: "masscom", name: "언론홍보학과", college: "사회과학대학", promptName: "언론홍보·미디어 전공",
      intro: "기자·PD·광고·PR은 모든 대학이 꼽고, 실제론 기업 마케팅·일반직도 절반쯤이에요.",
      uni: { n: 10, list: "성신여대·영남대·원광대·호남대·세종대·서강대·국민대·충남대·동명대·한양대" },
      paths: [
        { name: "기자(신문·방송·인터넷)", kind: "in", k: 10, jobs: ["media"] },
        { name: "PD·방송 제작", kind: "in", k: 10, jobs: ["media"] },
        { name: "광고(AE·기획·카피)", kind: "in", k: 10, jobs: ["marketing", "copy"] },
        { name: "PR·홍보", kind: "in", k: 10, jobs: ["marketing"] },
        { name: "일반 기업 마케팅·홍보·MD", kind: "out", k: 9, jobs: ["marketing"] },
        { name: "리서치·여론조사", kind: "in", k: 8, jobs: ["data"] },
        { name: "포털·OTT·IT 플랫폼", kind: "out", k: 7, jobs: [] },
        { name: "공공기관·공무원·공기업", kind: "out", k: 6, jobs: ["ncs", "civil"] },
        { name: "아나운서·리포터", kind: "in", k: 6, jobs: ["media"] },
        { name: "콘텐츠 크리에이터·MCN", kind: "in", k: 5, jobs: ["media"] },
        { name: "이벤트·공연·문화 기획", kind: "in", k: 5, jobs: [] },
        { name: "데이터 저널리스트·분석", kind: "in", k: 4, jobs: ["media", "data"] },
        { name: "대학원·연구", kind: "in", k: 4, jobs: [] },
        { name: "출판·잡지", kind: "in", k: 4, jobs: [] }
      ],
      cases: [
        { to: "대한항공 일반직 신입", kind: "out", jobs: [], how: ["MD 인턴", "AD 근무 1년", "토익 975"], type: LKT, date: "2026 상반기", trust: "중간", source: LK + "36083" },
        { to: "빅크래프트 퍼포먼스마케터 신입", kind: "out", jobs: ["marketing"], how: ["빅데이터분석기사·SQLD·GAIQ", "메타광고·SQL 프로젝트", "인턴 3회"], type: "커뮤니티", date: "2026-09", trust: "중간", source: "https://community.linkareer.com/final_review/6528513" },
        // 한 사람이 두 곳에 합격한 자소서 2편(36258·36230)이라 카드 하나로 센다
        { to: "삼성화재 영업관리·현대자동차 차량 프로젝트 관리 신입(한 사람이 두 곳 합격)", kind: "out", jobs: ["sales"], how: ["인턴 6개월 2회", "토익 950·오픽 IH", "학점 3.97"], type: LKT, date: "2025 하반기", trust: "중간", source: LK + "36258" },
        { to: "한일시멘트 경영지원 신입", kind: "out", jobs: [], how: ["인턴 3회", "학내방송국·영상제 수상", "오픽 IH"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "36369" },
        { to: "LG전자 HR 인턴", kind: "out", jobs: ["hr"], how: ["언론사 서포터즈", "코트라 디지털 무역인력", "학점 4.01"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34372" },
        { to: "한국방송광고진흥공사 일반행정", kind: "out", jobs: ["ncs"], how: ["마케팅 인턴 2회", "토익 935", "학점 4.08"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34104" },
        { to: "CJ ENM 예능 제작PD 신입", kind: "in", jobs: ["media"], how: ["토익 965·토스 200", "학점 4.1"], type: LKT, date: "2025 하반기", trust: "중간", source: LK + "35732" },
        { to: "연합뉴스TV 영상편집기자 신입", kind: "in", jobs: ["video"], how: ["인턴 3회", "학내방송국 활동", "영상제 수상"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "36353" },
        { to: "윗유 광고기획자(AE) 신입", kind: "in", jobs: ["marketing"], how: ["광고대행사 인턴 2개월", "토스 150·오픽 IH", "학점 4.0"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "36580" },
        { to: "디플랜360 디지털 미디어플래너", kind: "in", jobs: ["marketing"], how: ["TVCF 광고 평가단 등 활동", "학점 3.52"], type: LKT, date: "2025 상반기", trust: "중간", source: LK + "36081" },
        { to: "롯데홈쇼핑 영상미술팀", kind: "in", jobs: [], how: ["콘텐츠 인턴 3개월", "광고동아리", "학점 4.26"], type: LKT, date: "2024 하반기", trust: "중간", source: LK + "34595" }
      ],
      tips: [
        "대행사·방송 조연출·언론사 인턴으로 실무를 쌓아요",
        "교내 신문·방송국 활동을 포트폴리오로 만들어요",
        "자소서는 두괄식, 숫자로 쓴 성과를 앞에 둬요",
        "SQL·광고 데이터 같은 디지털 역량을 더해요",
        "한 사람이 같은 직무로 여러 곳에 붙는 일이 많아요"
      ],
      trends: [
        { text: "KBS 2025 신입 공채 71명, PD 14명·기자 20명", date: "2025-06", source: "https://www.outsourcing.co.kr/news/articleView.html?idxno=200062" },
        { text: "주요 신문·종편 공채 축소, 채용연계형 인턴이 늘어요", date: "2026-10", source: "http://www.journalist.or.kr/news/article.html?no=61915" },
        { text: "광고회사 73곳 2025 신입 354명→445명, 개발 인력 76명→138명", date: "2026-04", source: "https://www.brandbrief.co.kr/news/articleView.html?idxno=9805" },
        { text: "숏폼 시청 경험 82.7%, 숏폼 마케터·PD 직무가 늘어요", date: "2025-05", source: "https://zdnet.co.kr/view/?no=20250429175927" }
      ],
      stats: [SOC_RATE],
      certs: [
        { name: "SQLD·GAIQ·검색광고마케터", note: "퍼포먼스마케터 합격자가 갖춘 자격이에요(2026)", source: "https://community.linkareer.com/final_review/6528513" }
      ],
      sources: [
        "https://www.sungshin.ac.kr/mediacomm/11520/subview.do",
        "https://www.yu.ac.kr/mnc/intro/career.do",
        "https://masscom.wku.ac.kr/?page_id=25",
        "https://mediacom.honam.ac.kr/CareerField",
        "http://home.sejong.ac.kr/~nnbdpt/1.html",
        "https://smas.sogang.ac.kr/smas/smas2_01.html",
        "https://adpr.kookmin.ac.kr/adpr/menu/current-situation.do",
        "https://comm.cnu.ac.kr/comm/intro/career.do",
        "https://www.tu.ac.kr/masscom/sub04_01.do",
        "http://goerica.hanyang.ac.kr/upload/GUIDES/2025/2025_%EC%BB%A4%EB%AE%A4%EB%8B%88%EC%BC%80%EC%9D%B4%EC%85%98&%EC%BB%AC%EC%B2%98%EB%8C%80%ED%95%99.pdf"
      ]
    },
    {
      id: "mechanical", name: "기계공학부", college: "공과대학", promptName: "기계공학 전공",
      intro: "자동차·조선은 모든 대학이 꼽아요. 실제론 구매·품질·설비 직무로도 가요.",
      uni: { n: 10, list: "건국대·아주대·전주대·한경국립대·영남대·강원대·한국기술교육대·울산대·전북대·명지대" },
      paths: [
        { name: "자동차·부품", kind: "in", k: 10, jobs: ["mech"] },
        { name: "조선·중공업", kind: "in", k: 10, jobs: ["mech"] },
        { name: "정부출연·국공립 연구소", kind: "in", k: 8, jobs: ["rnd"] },
        { name: "전자·반도체", kind: "in", k: 8, jobs: [] },
        { name: "항공·우주", kind: "in", k: 7, jobs: ["mech"] },
        { name: "로봇·공장자동화", kind: "in", k: 7, jobs: ["mech"] },
        { name: "에너지·발전·플랜트·공조", kind: "in", k: 7, jobs: ["mech"] },
        { name: "기술직 공무원", kind: "in", k: 7, jobs: [] },
        { name: "공기업", kind: "in", k: 6, jobs: [] },
        { name: "대학원·교수", kind: "in", k: 6, jobs: [] },
        { name: "철강·금속", kind: "in", k: 3, jobs: ["mech"] },
        { name: "창업·벤처", kind: "out", k: 3, jobs: [] },
        { name: "기술영업", kind: "out", k: 2, jobs: ["sales"] },
        { name: "변리사·국가고시 전문직", kind: "out", k: 2, jobs: [] }
      ],
      cases: [
        { to: "기아 구매부서 품질개선팀", kind: "out", jobs: ["scm"], how: ["2학년 1학기에 구매·조달로 목표", "인턴 2회", "중견기업 구매팀 사무보조 6개월"], type: OFFICIAL, date: "2025-12", trust: "높음", source: KMU_ME + "5932379" },
        { to: "DN솔루션즈 글로벌영업 신입", kind: "out", jobs: ["trade"], how: ["공학+상경 복수전공", "설비 엔지니어·연구실 인턴", "오픽 AL·ADsP"], type: "커뮤니티", date: "2026-10", trust: "중간", source: LKP + "6598674" },
        { to: "LG에너지솔루션 설비기술(전극)", kind: "in", jobs: ["mech", "maint"], how: ["공대 해외인턴십 1년", "교내 프로젝트 팀 성과를 면접에", "자소서로 예상 질문 정리"], type: OFFICIAL, date: "2025-12", trust: "높음", home: true, source: KMU_ME + "5932378" },
        { to: "대학원 연구원(자율주행)", kind: "in", jobs: [], how: ["학부연구생으로 연구실 입문", "국토부 차량 기능안전 과제 참여", "라이다·GPS 데이터 처리 익힘"], type: OFFICIAL, date: "2024-12", trust: "높음", source: KMU_ME + "5923251" },
        { to: "현대로템 생기(로봇자동화), 기계 인접 학과", kind: "in", jobs: ["mech"], how: ["기업연계 캡스톤 최우수상", "OPIc IH·캐드마스터 1급", "방산 기계설계 교육 수료"], type: OFFICIAL, date: "2025", trust: "높음", source: PNU_PDF },
        { to: "포스코 기술개발, 기계 인접 학과", kind: "in", jobs: ["rnd"], how: ["반도체 인력양성 교육 여러 개", "캡스톤 최우수상", "공정·설계 직무 체험 2회"], type: OFFICIAL, date: "2025", trust: "높음", source: PNU_PDF },
        { to: "KAIST 기계과 대학원(2024년도)", kind: "in", jobs: [], how: ["교수 컨택 시기 준비", "자소서 키워드·우수성 입증자료", "전공·인성 면접 대비"], type: "유튜브", date: "2024-08", trust: "중간", source: "https://www.youtube.com/watch?v=CK5WytkvYn4" },
        { to: "삼성전자 DS 메모리 공정 직무", kind: "in", jobs: [], how: ["3학년 겨울에 반도체 준비 시작", "설비 대신 공정 직무로 지원"], type: "블로그", date: "2025-12", trust: "낮음", source: "https://blog.naver.com/jing_june/224098977532" },
        { to: "현대자동차 남양연구소 R&D", kind: "in", jobs: ["rnd"], how: ["학점 4.1대(전공 4.2대)", "오픽 IM3", "컴활 1급"], type: "블로그", date: "2024-12", trust: "낮음", source: "https://blog.naver.com/nakadi_/223681291152" }
      ],
      tips: [
        "인턴(해외인턴 포함)이 가장 도움이 됐다는 사례가 많아요",
        "캡스톤·공모전 수상을 직무와 연결해 설명해요",
        "OPIc IH 정도 말하기 점수를 갖춰요",
        "2학년 무렵 목표 산업·직무를 일찍 정해요",
        "기계에 SW(제어·임베디드·자율주행)를 더해 넓혀요"
      ],
      trends: [
        { text: "조선 3사 신규채용 2024년 3,433명, 2022년 906명보다 크게 늘었어요", date: "2025-07", source: "https://v.daum.net/v/20250710170138260" },
        { text: "방산 업체들이 2025년 R&D·생산기술 신입을 세 자릿수로 뽑았어요", date: "2025-03", source: "https://newstomato.com/ReadNews.aspx?no=1255365" },
        { text: "2025년 대기업 정규직 신입 공고 43% 감소, 제조·생산 33% 감소", date: "2026-01", source: "https://www.newsis.com/view/NISX20260123_0003488227" }
      ],
      stats: [],
      refStats: [
        { label: "한국기술교육대 기계공학부 취업률(참고)", value: "86.5%", basis: "2024년 고등교육기관 취업통계조사, 다른 대학 1곳", source: "https://www.koreatech.ac.kr/menu.es?mid=a10401010000" },
        { label: "전주대 기계공학과 취업률(참고)", value: "76.5%", basis: "2024년 공시, 다른 대학 1곳", source: "https://jj.ac.kr/iphak/exploration/engineering/mechanical.do" }
      ],
      certs: [
        { name: "일반기계기사·기계설계기사", note: "학과가 설계·제조 자격으로 안내해요. 합격 수기엔 드물어요", source: "https://jj.ac.kr/iphak/exploration/engineering/mechanical.do" },
        { name: "공조냉동기계기사·산업안전기사", note: "강원대가 관련 자격 12종에 넣었어요", source: "https://mech.kangwon.ac.kr/mech/major/mechanical-engineering02-03.do" },
        { name: "OPIc", note: "합격 수기에 IH 수준이 반복돼요", source: PNU_PDF }
      ],
      sources: [
        "https://www.konkuk.ac.kr/bulletins26/36943/subview.do",
        "https://www.ajou.ac.kr/me/intro/intro.do",
        "https://jj.ac.kr/iphak/exploration/engineering/mechanical.do",
        "https://hknu.ac.kr/hkict/4762/subview.do",
        "https://www.yu.ac.kr/main/academics/me.do?forapp=1",
        "https://mech.kangwon.ac.kr/mech/major/mechanical-engineering02-03.do",
        "https://www.koreatech.ac.kr/menu.es?mid=a10401010000",
        "https://meuou.ulsan.ac.kr/meuou/1798",
        "https://metal.jbnu.ac.kr/me/8330/subview.do",
        "https://www.mju.ac.kr/mjukr/797/subview.do"
      ]
    },
    {
      id: "math", name: "수학과", college: "자연과학대학", promptName: "수학 전공",
      intro: "연구·금융·교사·IT·계리사를 많이 꼽고, 데이터·AI는 거의 적혀 있지 않아요.",
      uni: { n: 9, list: "서강대·인천대·성신여대·국립창원대·숭실대·건국대·경희대·전북대·영남대" },
      paths: [
        { name: "대학원→교수·연구원", kind: "in", k: 9, jobs: [] },
        { name: "중등 수학교사", kind: "in", k: 8, jobs: ["teacher"], note: "교직이수나 교육대학원을 거쳐요" },
        { name: "은행·보험·증권", kind: "out", k: 8, jobs: [] },
        { name: "IT·소프트웨어", kind: "out", k: 8, jobs: ["sw"] },
        { name: "보험계리사", kind: "in", k: 7, jobs: [] },
        { name: "통계·조사", kind: "in", k: 6, jobs: ["data"] },
        { name: "공무원·공공기관", kind: "out", k: 6, jobs: ["civil", "ncs"] },
        { name: "암호·정보보안", kind: "in", k: 5, jobs: ["security"] },
        { name: "학원강사", kind: "in", k: 4, jobs: [] },
        { name: "일반기업", kind: "out", k: 4, jobs: [] },
        { name: "금융공학(파생·펀드·외환)", kind: "in", k: 3, jobs: [] },
        { name: "회계사·세무사·변리사 등", kind: "out", k: 3, jobs: [] },
        { name: "생물통계·생물정보", kind: "in", k: 2, jobs: ["data"] },
        { name: "인공지능", kind: "in", k: 1, jobs: ["ai"], note: "서강대만 직업명으로 적었어요" }
      ],
      cases: [
        { to: "대학내일 마케터(AE) 체험형 인턴", kind: "out", jobs: ["marketing"], how: ["채용·전략기획 인턴 각 3개월", "홍보대사·학생회 홍보국장", "수학을 '성과 분석'으로 연결"], type: "커뮤니티", date: "2025-11", trust: "중간", source: LKP + "5045563" },
        { to: "SSAFY 9기(IT 개발 교육) 합격", kind: "out", jobs: [], how: ["SW적성진단 문제집 반복", "에세이 500~600자"], type: "커뮤니티", date: "2025-04", trust: "낮음", source: "https://community.linkareer.com/employment_data/4227270" },
        { to: "서울대 통계대학원 석사", kind: "in", jobs: [], how: ["학부 통계 랩 인턴·학회 발표", "수리통계·회귀·선형대수 다회독", "증명을 백지에 써 보기"], type: "블로그", date: "2024-12", trust: "중간", source: "https://juhongyee.tistory.com/31" },
        { to: "보험계리사 최종 합격", kind: "in", jobs: [], how: ["학부 보험수리학 수강", "1차는 과락 피하고 평균 60점 목표", "2차 계리모형론에 SOA 시험 경험"], type: "커뮤니티", date: "2024-10", trust: "중간", source: "https://m.cafe.daum.net/bohum/5nCw/183?svc=TOPRANK" }
      ],
      tips: [
        "데이터 직무는 SQL·Python으로 직접 데이터를 다뤄 봐요",
        "ADsP만으론 부족해요, 프로젝트·인턴 하나를 만들어요",
        "통계·컴퓨터·경제 복수전공이나 융합과정을 더해요",
        "계리사는 학부 보험수리 수강 뒤 1차를 4~5개월 집중해요",
        "신입은 공기업 체험형 인턴·중소기업부터도 시작해요"
      ],
      trends: [
        { text: "보험계리사 최종합격 126명(2024)→120명(2025), 대부분 30세 이하", date: "2025-09", source: "https://www.tfmedia.co.kr/mobile/article.html?no=195820" },
        { text: "2026학년도 공립 중등교사 7,147명, 전년보다 1,643명 늘었어요", date: "2025-10", source: "https://www.fnnews.com/news/202510011000257985" },
        { text: "2027학년도 중등교사 사전예고 4,387명, 2,760명 줄었어요", date: "2026-08", source: "https://hangyo.com/mobile/article.html?no=108742" },
        { text: "2025년 대기업 IT·통신 신입 공고 67% 감소(899→293건)", date: "2026-01", source: "https://www.newsis.com/view/NISX20260123_0003488227" }
      ],
      stats: [],
      certs: [
        { name: "보험계리사", note: "2025년 120명 최종합격, 2차 5과목 60점 이상", source: "https://www.tfmedia.co.kr/mobile/article.html?no=195820" },
        { name: "중등학교 정교사(수학)", note: "교직이수나 교육대학원으로 얻어요", source: "https://math.ssu.ac.kr/?page_id=1379" },
        { name: "정보처리기사", ssuOnly: true, note: "숭실대 수학과가 취득 가능 자격으로 안내해요", source: "https://math.ssu.ac.kr/?page_id=1377" },
        { name: "ADsP·SQLD·빅데이터분석기사", note: "현직자들은 ADsP는 기본일 뿐이라고 해요", source: "https://community.linkareer.com/STEM_mentoring/5762946" }
      ],
      sources: [
        "https://scc.sogang.ac.kr/math/math03_3.html",
        "https://math.inu.ac.kr/isu/2208/subview.do",
        "https://www.sungshin.ac.kr/math/11634/subview.do",
        "https://www.changwon.ac.kr/math/cm/cntnts/cntntsView.do?mi=7252&cntntsId=2146",
        "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/%EC%9E%90%EC%97%B0%EA%B3%BC%ED%95%99%EB%8C%80%ED%95%99/%EC%88%98%ED%95%99%EA%B3%BC/",
        "https://www.konkuk.ac.kr/bulletins25/27938/subview.do",
        "https://maths.khu.ac.kr/maths/user/contents/view.do?menuNo=600008",
        "https://math.jbnu.ac.kr/math/10970/subview.do",
        "https://www.yu.ac.kr/main/academics/math.do"
      ]
    },
    {
      id: "aisw", name: "AI소프트웨어학부", college: "AI대학", promptName: "AI·소프트웨어 전공",
      intro: "개발자와 대학원을 거의 모든 대학이 꼽고, 기획·기술영업은 거의 없어요.",
      uni: { n: 12, list: "성신여대·국립창원대·동명대·동의대·영산대·금오공대·고려대(세종)·중앙대·연세대(미래)·상명대·경성대·숭실대(AI융합학부)" },
      paths: [
        { name: "SW 개발자·엔지니어", kind: "in", k: 11, jobs: ["sw"] },
        { name: "대학원·연구소·교수", kind: "in", k: 11, jobs: [] },
        { name: "공공기관·공무원 전산직", kind: "in", k: 7, jobs: [], note: "코딩보다 시스템 운영·보안 관리 비중이 크다는 답변이 있어요" },
        { name: "정보교사·IT 강사", kind: "in", k: 7, jobs: ["teacher"] },
        { name: "금융권 전산·IT", kind: "in", k: 6, jobs: ["sw"] },
        { name: "AI·빅데이터", kind: "in", k: 6, jobs: ["ai", "data"] },
        { name: "네트워크·시스템·DB", kind: "in", k: 6, jobs: ["cloud"] },
        { name: "임베디드·IoT", kind: "in", k: 6, jobs: ["sw"] },
        { name: "정보보안", kind: "in", k: 5, jobs: ["security"] },
        { name: "게임 개발", kind: "in", k: 5, jobs: ["sw"] },
        { name: "외국계·해외 취업", kind: "in", k: 4, jobs: [] },
        { name: "창업·벤처", kind: "out", k: 4, jobs: [] },
        { name: "변리사", kind: "out", k: 2, jobs: [] },
        { name: "IT 기획", kind: "out", k: 1, jobs: ["itpm"] }
      ],
      cases: [
        { to: "IBK기업은행 IT 신입행원", kind: "in", jobs: ["sw"], how: ["NCS 기본서+은행 PSAT형 문제집", "정보처리기사 기출 반복", "약 30곳 지원, 최종면접 4곳"], type: "블로그", date: "2026-06", trust: "중간", source: "https://2junbeom.tistory.com/221" },
        { to: "삼성전자 등 4곳 프론트엔드", kind: "in", jobs: ["sw"], how: ["코테 스터디로 백준·프로그래머스", "CS 면접 스터디", "과제 README에 개선점 정리"], type: "블로그", date: "2024-12", trust: "높음", source: "https://velog.io/@coddingyun/2024%EB%85%84-%EC%83%81%EB%B0%98%EA%B8%B0-%EC%B7%A8%EC%97%85-%ED%9B%84%EA%B8%B0" },
        { to: "네이버 신입 공채 Tech 백엔드", kind: "in", jobs: ["sw"], how: ["백준 골드1 수준 연습", "프로젝트 트러블슈팅 노트", "ChatGPT로 예상 질문·모의면접"], type: "블로그", date: "2025-06", trust: "높음", source: "https://velog.io/@kyumericano/2025-naver-retrospect" },
        { to: "네이버 2025 신입 공채 Tech", kind: "in", jobs: ["sw"], how: ["백준 꾸준히, CS 개념서 반복", "자소서 결론→문제→해결→성과", "포트폴리오에 기술 선택 이유"], type: "블로그", date: "2025-07", trust: "높음", source: "https://kyko.tistory.com/82" },
        { to: "넥슨코리아 백엔드(수시)", kind: "in", jobs: ["sw"], how: ["백준 골드2까지 꾸준히", "체험형 인턴·오픈소스 기여 2건", "이력서를 문제 해결 중심으로"], type: "블로그", date: "2025-08", trust: "높음", source: "https://ohksj77.tistory.com/279" },
        { to: "토스 NEXT 2025 Android", kind: "in", jobs: ["sw"], how: ["우아한테크코스 수료", "대기업 인턴·현장실습", "23장 포트폴리오"], type: "블로그", date: "2025-09", trust: "높음", source: "https://thdbs523.tistory.com/455" },
        { to: "가상화폐 거래소 신입 DevOps", kind: "in", jobs: ["cloud"], how: ["홈 쿠버네티스 구축 포트폴리오", "학교 연계 인턴", "신입·경력 구분 없이 지원"], type: "블로그", date: "2025-01", trust: "높음", source: "https://choigonyok.tistory.com/1" },
        { to: "대기업 인턴→정규직 전환 개발자", kind: "in", jobs: ["sw"], how: ["물어본 것만 정확히 답하기", "모르면 모른다, 아는 지식으로 근거", "자신 있는 내용 위주 지원서"], type: "유튜브", date: "2025-11", trust: "중간", source: "https://www.youtube.com/watch?v=DB_4Oq6rZH4" }
      ],
      tips: [
        "코딩테스트를 스터디로 꾸준히 풀어요",
        "프로젝트는 기술 선택 이유와 문제 해결 과정으로 설명해요",
        "자료구조·OS·DB·네트워크 같은 CS 기초를 반복해요",
        "체험형·학교 연계 인턴 경험을 쌓아요",
        "모의면접으로 꼬리질문에 대비해요",
        "금융·공기업 IT는 NCS와 정보처리기사도 준비해요"
      ],
      trends: [
        { text: "2025 상반기 개발자 공고 중 신입 0.8%, 지원자는 29.5%가 신입", date: "2025-08", source: "https://economist.co.kr/article/view/ecn202508270040" },
        { text: "2025년 1분기 신입 개발자 채용 공고 18.9% 감소", date: "2025-04", source: "https://biz.heraldcorp.com/article/10468295" },
        { text: "SW 개발자 공고 평균 요구 경력 3.71년(2022)→5.18년(2025.1)", date: "2026-10", source: "https://www.topstarnews.net/news/articleView.html?idxno=16252120" },
        { text: "2025년 대기업 IT·통신 신입 공고 67% 감소(899→293건)", date: "2026-01", source: "https://www.newsis.com/view/NISX20260123_0003488227" }
      ],
      stats: [],
      certs: [
        { name: "정보처리기사", note: "은행 IT 필기를 이 기출로 대비한 합격자가 있어요", source: "https://2junbeom.tistory.com/221" },
        { name: "SQLD·ADsP", note: "한전이 직무 무관 서류 가산점을 줬어요(2025)", source: "https://www.hankyung.com/article/2025071873407" }
      ],
      sources: [
        "https://www.sungshin.ac.kr/ce/11802/subview.do",
        "https://www.changwon.ac.kr/ce/cm/cntnts/cntntsView.do?mi=6600&cntntsId=1920",
        "https://www.tu.ac.kr/ce/sub04_01.do",
        "https://deuhome.deu.ac.kr/computer/sub01_04.do",
        "https://ysu.ac.kr/computer/CMS/Contents/Contents.do?mCode=MN023",
        "https://www.kumoh.ac.kr/ce/sub0102.do",
        "https://software.korea.ac.kr/software/2734/subview.do",
        "https://sw.cau.ac.kr/sub01/sub0105.php",
        "https://ycms.yonsei.ac.kr/ymsw/intro/career.do",
        "https://www.smu.ac.kr/software/intro/career.do",
        "https://kscms.ks.ac.kr/software/CMS/Contents/Contents.do?mCode=MN030",
        "https://ssu.ac.kr/%EA%B5%90%EC%9C%A1-%C2%B7-%EC%97%B0%EA%B5%AC/%EB%8C%80%ED%95%99%EC%86%8C%EA%B0%9C/it%EB%8C%80%ED%95%99/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8B%9C%EC%8A%A4%ED%85%9C-%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%ED%95%99%EA%B3%BC/"
      ]
    }
  ];
})();
