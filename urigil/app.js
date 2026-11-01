import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 우리달과 같은 Firebase 프로젝트, 같은 커플 방(rooms/{코드}) — 코스는 rooms/{코드}/courses */
const CONFIG = {
  apiKey: "AIzaSyA4VJvIM9DwMB4D2KzhDwcekCIGMRSrmwI",
  authDomain: "uridal-43133.firebaseapp.com",
  projectId: "uridal-43133",
  storageBucket: "uridal-43133.firebasestorage.app",
  messagingSenderId: "704081943105",
  appId: "1:704081943105:web:aff91a36dae41a6bd5c4c0"
};
const KAKAO_KEY = "358283f945823ab37a1aa0778845e544";

const fb = initializeApp(CONFIG);
let db;
try { db = initializeFirestore(fb, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch { db = initializeFirestore(fb, {}); }

/* ---------- 작은 도구 ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const today = () => ymd(new Date());
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const md = s => { const d = parse(s); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const mdw = s => `${md(s)} ${WEEK[parse(s).getDay()]}`;
const hm = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const r5 = m => Math.ceil(m / 5) * 5;
const pick = a => a[Math.floor(Math.random() * a.length)];
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const KEY = "urigil";
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2400);
}
const fail = () => toast("저장하지 못했어요. 인터넷을 확인해 주세요.");

const calm = matchMedia("(prefers-reduced-motion: reduce)");
function appear(el, dx = 0) {
  if (calm.matches || !el?.animate) return;
  el.animate([{ opacity: 0, transform: `translate(${dx}px, ${dx ? 0 : 10}px)` }, { opacity: 1, transform: "none" }],
             { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
}
function armed(btn) {
  if (btn.classList.contains("arm")) return true;
  const old = btn.textContent;
  btn.classList.add("arm"); btn.textContent = "한 번 더";
  setTimeout(() => { btn.classList.remove("arm"); btn.textContent = old; }, 3000);
  return false;
}

/* ---------- 서울 동네 ----------
   spots: [카카오 검색어, 종류, 머무는 분, { n: 밤에도 좋음, i: 실내, o: 여는 시각, c: 닫는 시각, off: 쉬는 요일 }] */
const H = h => h * 60;
const AREAS = {
  seongsu: { name: "성수", q: "성수동", in: 1, food: 2, near: ["kondae"], season: [5, 10, 11],
    spots: [["서울숲", "walk", 60, { n: 1 }], ["언더스탠드에비뉴", "sight", 30, { c: H(21) }], ["뚝섬한강공원", "walk", 50, { n: 1 }]] },
  yeonnam: { name: "연남·홍대", q: "연남동", in: 1, food: 2, near: ["mangwon"], season: [5, 9],
    spots: [["경의선숲길 연남동", "walk", 40, { n: 1 }], ["홍대 걷고싶은거리", "sight", 40, { n: 1 }], ["KT&G 상상마당 홍대", "show", 60, { o: H(12), c: H(22), i: 1 }]] },
  mangwon: { name: "망원", q: "망원동", in: 0, food: 2, near: ["yeonnam"], season: [4, 5, 6, 9, 10],
    spots: [["망원한강공원", "walk", 50, { n: 1 }], ["망원시장", "sight", 40, { o: H(10), c: H(20) }]] },
  ikseon: { name: "익선·종로", q: "익선동", in: 1, food: 2, near: ["euljiro", "bukchon"], season: [4, 10, 11],
    spots: [["익선동 한옥거리", "sight", 40, { n: 1 }], ["창덕궁", "show", 70, { o: H(9), c: H(17), off: 1 }], ["청계천 관수교", "walk", 40, { n: 1, label: "청계천" }], ["종묘", "show", 50, { o: H(9), c: H(17), off: 2 }]] },
  bukchon: { name: "북촌·삼청", q: "삼청동", in: 1, food: 1, near: ["seochon", "ikseon"], season: [4, 5, 10, 11],
    spots: [["북촌한옥마을", "sight", 50, { o: H(10), c: H(17) }], ["국립현대미술관 서울", "show", 90, { o: H(10), c: H(18), i: 1 }], ["정독도서관", "walk", 30, { o: H(9), c: H(18) }], ["삼청공원", "walk", 30, {}]] },
  seochon: { name: "서촌", q: "서촌", in: 0, food: 1, near: ["bukchon"], season: [4, 10, 11],
    spots: [["경복궁", "show", 80, { o: H(9), c: H(17), off: 2 }], ["통인시장", "sight", 30, { o: H(10), c: H(18) }], ["수성동계곡", "walk", 30, {}]] },
  euljiro: { name: "을지로", q: "을지로", in: 0, food: 2, near: ["ikseon"], season: [6, 7, 8, 9],
    spots: [["세운상가", "sight", 30, { c: H(22), n: 1 }], ["청계천 수표교", "walk", 40, { n: 1, label: "청계천" }], ["을지로 노가리골목", "sight", 30, { o: H(17), n: 1 }]] },
  hannam: { name: "한남·이태원", q: "한남동", in: 1, food: 2, near: ["namsan", "yongsan"], season: [3, 9],
    spots: [["리움미술관", "show", 90, { o: H(10), c: H(18), off: 1, i: 1 }], ["이태원 앤틱가구거리", "sight", 30, { c: H(20) }]] },
  namsan: { name: "남산·해방촌", q: "해방촌", in: 0, food: 1, near: ["hannam"], season: [4, 10, 11],
    spots: [["N서울타워", "view", 60, { o: H(10), c: H(23), n: 1, i: 1 }], ["남산공원", "walk", 50, { n: 1 }], ["해방촌 신흥시장", "sight", 30, { n: 1 }]] },
  jamsil: { name: "잠실·석촌", q: "송리단길", in: 2, food: 1, near: ["samseong"], season: [4, 12],
    spots: [["석촌호수", "walk", 50, { n: 1 }], ["롯데월드몰", "shop", 60, { o: H(10), c: H(22), i: 1 }], ["서울스카이", "view", 60, { o: H(10), c: H(22), i: 1, n: 1 }]] },
  yeouido: { name: "여의도", q: "여의도", in: 2, food: 1, near: ["mullae"], season: [4, 10],
    spots: [["여의도한강공원", "walk", 50, { n: 1 }], ["더현대 서울", "shop", 70, { o: H(10) + 30, c: H(20), i: 1 }], ["여의도공원", "walk", 30, { n: 1 }]] },
  sinsa: { name: "신사·압구정", q: "가로수길", in: 1, food: 2, near: ["banpo"], season: [3, 12],
    spots: [["신사동 가로수길", "sight", 40, { n: 1, at: [37.5207, 127.0229] }], ["도산공원", "walk", 30, { n: 1 }], ["압구정로데오거리", "sight", 30, { n: 1 }]] },
  hyehwa: { name: "혜화·대학로", q: "대학로", play: ["소극장 연극"], in: 0, food: 1, near: ["ikseon"], season: [5, 10, 11],
    spots: [["마로니에공원", "walk", 20, { n: 1 }], ["낙산공원", "view", 40, { n: 1 }], ["이화마을", "sight", 30, { o: H(10), c: H(18) }]] },
  mullae: { name: "문래", q: "문래동", in: 1, food: 1, near: ["yeouido"], season: [5, 9],
    spots: [["문래창작촌", "sight", 40, { n: 1 }], ["선유도공원", "walk", 50, { o: H(6), c: H(24), n: 1 }], ["타임스퀘어", "shop", 60, { o: H(10) + 30, c: H(22), i: 1 }]] },
  samseong: { name: "삼성·코엑스", q: "코엑스", in: 3, food: 1, near: ["jamsil"], season: [1, 2, 7, 8, 12],
    spots: [["별마당도서관", "sight", 30, { o: H(10) + 30, c: H(22), i: 1 }], ["코엑스아쿠아리움", "show", 90, { o: H(10), c: H(20), i: 1 }], ["봉은사", "walk", 30, { c: H(22) }]] },
  yongsan: { name: "용산", q: "용리단길", in: 2, food: 2, near: ["hannam"], season: [1, 2, 7, 8],
    spots: [["국립중앙박물관", "show", 100, { o: H(10), c: H(18), i: 1 }], ["용산가족공원", "walk", 30, {}], ["아이파크몰 용산점", "shop", 60, { o: H(10) + 30, c: H(22), i: 1 }]] },
  banpo: { name: "반포·서래", q: "서래마을", in: 1, food: 1, near: ["sinsa"], season: [5, 6, 7, 8, 9],
    spots: [["반포한강공원", "walk", 50, { n: 1 }], ["세빛섬", "view", 30, { n: 1 }], ["신세계백화점 강남점", "shop", 60, { o: H(10) + 30, c: H(20), i: 1 }]] },
  kondae: { name: "건대·뚝섬", q: "건대입구", in: 1, food: 2, near: ["seongsu"], season: [4, 5, 10],
    spots: [["커먼그라운드", "shop", 40, { o: H(11), c: H(22) }], ["서울어린이대공원", "walk", 50, { o: H(5), c: H(22) }]] }
};

/* 동네별 추천 (2026-11): 기사·블로그 조사 + 카카오맵 별점·후기 + 네이버 최근 1달 글쓴이 수 + 유튜브·인스타, 광고 의심은 뺌.
   [이름, 종류, 이유, 요즘 뜨는 곳이면 1, 위도, 경도, 카카오 ID, 분류] */
const PICKS = {
  banpo: [["육갑식당 서래마을직영점","meal","통창뷰와 계란찜 무한리필 고깃집",1,37.498122,126.998168,"27344652","육류,고기"],["미국식 방배본점","meal","줄 서는 토시살버거",0,37.489144,126.995114,"1233735165","햄버거"],["마얘","cafe","딱뜨오쇼콜라 추천",0,37.498918,126.997634,"26965232","디저트카페"],["르뺑아쎄르","dessert","프랑스 빵 테라스",0,37.496672,126.998104,"2052007459","제과,베이커리"],["반포한강공원 달빛광장","walk","강변·무지개분수",0,37.511355,126.997629,"7813554","광장"],["세빛섬","view","물 위 야경",0,37.512332,126.995889,"12322745","문화시설"]],
  bukchon: [["오레노라멘 인사점","meal","진한 닭육수의 깔끔한 라멘",0,37.576457,126.984559,"1179567185","일본식라면"],["일월카츠 안국점","meal","히레카츠 추천",1,37.57734,126.985156,"1263230815","돈까스,우동"],["비움안국","meal","비움 김치볶음밥 추천",0,37.579082,126.98567,"1697703245","양식"],["잭잭 안국점","meal","한식",0,37.576515,126.984575,"1806869446","한식"],["도트블랭킷","cafe","아보카도파스타샐러드 추천",1,37.577026,126.984097,"320882660","카페"],["미완성식탁","dessert","제과·베이커리",0,37.57779,126.983936,"27373298","제과,베이커리"]],
  euljiro: [["우래옥 본점","meal","평양냉면 대표 노포",0,37.568212,126.998719,"8025375","냉면"],["이멜다분식","meal","분식",1,37.56805,126.995368,"773937767","분식"],["진작","meal","후토마끼 추천",0,37.564018,126.990838,"2029456983","일식"],["동경우동","meal","튀김우동 추천",1,37.56523,126.99296,"8264592","돈까스,우동"],["종로계림닭도리탕 본점","meal","닭도리탕(소) 추천",0,37.570158,126.994503,"8758064","종로계림닭도리탕"],["수잔나의앞치마","cafe","피콜로라떼 크림쇼콜라 추천",1,37.563305,126.99961,"1254228746","카페"],["알렉스룸","cafe","을지로 바이브 라떼 추천",0,37.566125,126.994711,"1030825495","카페"],["커피한약방","cafe","한약방 개조 레트로",0,37.566564,126.988602,"1440347564","커피전문점"]],
  hannam: [["고다이","meal","생양갈비(200g) 추천",1,37.534606,127.008791,"1543749471","육류,고기"],["이태리국시 한남","meal","숯불대창돌솥파스타 추천",0,37.535702,126.999594,"1563450232","양식"],["아따","meal","케이크 반입 가능",1,37.537705,127.003081,"292115046","이탈리안"],["맥심플랜트","cafe","카페",0,37.53699,127.000997,"711864705","카페"],["레종데트르 한남","cafe","디저트카페",1,37.537194,127.00146,"1623804721","디저트카페"],["르솔레이","dessert","제과·베이커리",1,37.537127,127.001831,"1161755224","제과,베이커리"],["파티세리 뮤흐","dessert","제과·베이커리",1,37.534669,127.00525,"468658415","제과,베이커리"],["야키토리고우","bar","꼬치 3천원대 야키토리",0,37.534886,126.992782,"19723946","일본식주점"],["경리단길","walk","언덕 골목 빈티지 산책",0,37.539758,126.991722,"22730592","테마거리"]],
  hyehwa: [["핏제리아오","meal","감베리 로제 크레마 추천",0,37.582098,127.004376,"21555096","피자"],["봉쥬떡볶이","meal","버터갈릭감자튀김 세트 추천",1,37.58381,127.001177,"27510351","떡볶이"],["청년밥상문간 슬로우점","meal","김치찌개 추천",0,37.582593,127.004512,"398943713","찌개,전골"],["정돈 대학로점","meal","바삭촉촉 정통 일식 돈까스",0,37.581789,127.001095,"27306859","돈까스,우동"],["서래향 대학로점","meal","유린기 추천",0,37.581198,127.003621,"297814026","중국요리"],["학림다방","cafe","대학로 최고참 다방",1,37.58195,127.001657,"8143287","카페"],["밀곳간 본점","dessert","빵 좋아하면 대안",0,37.594113,126.999338,"65305259","제과,베이커리"],["히어로보드 게임카페 대학로점","play","혜화역 앞 보드게임",0,37.581615,127.002808,"1525847477","보드카페"],["이화동 벽화마을","walk","벽화 골목 오르는 길",0,37.577976,127.007102,"25039734","관광,명소"],["마로니에공원","walk","버스킹·거리공연 광장",0,37.580289,127.002826,"10353868","도시근린공원"],["낙산공원","view","성곽길 낙조·야경",0,37.58057,127.007522,"8253524","도시근린공원"]],
  ikseon: [["오죽이네","meal","닭매운탕(대) 추천",0,37.573758,126.990804,"16734831","닭요리"],["지오쿠치나 익선점","meal","고르게리따 추천",1,37.573687,126.990033,"1354467190","양식"],["엘까르니따스 익선점","meal","파히타플래터 추천",1,37.573223,126.989416,"242454137","멕시칸,브라질"],["플리퍼스 익선점","cafe","디저트카페",0,37.57308,126.99012,"1959516004","디저트카페"],["레인리포트 레인보우","cafe","한옥 속 무지개 비 내리는 카페",1,37.57343,126.990106,"1620441418","카페"],["스탠다드브레드 익선","cafe","디저트카페",0,37.57379,126.989948,"527221713","디저트카페"],["청수당 베이커리","dessert","수플레 카스텔라 핸드드립",0,37.573881,126.989785,"78911659","디저트카페"],["미완성식탁","dessert","제과·베이커리",0,37.57779,126.983936,"27373298","제과,베이커리"],["익선동한옥거리","walk","한옥 골목 산책 코스",0,37.573437,126.989776,"467710256","테마거리"]],
  jamsil: [["진작 잠실점","meal","돈토로동 추천",1,37.512291,127.098301,"803844455","일식"],["청국장과보리밥 잠실점","meal","구수한 청국장과 건강한 보리밥",0,37.504469,127.086116,"22513020","한식"],["토마루해물칼국수","meal","손수 빚은 얇은 만두와 칼국수",0,37.505897,127.084819,"13582223","칼국수"],["진지아","meal","마라 중국가정식",1,37.50758,127.108247,"219797863","중국요리"],["뷰클런즈","cafe","우드톤 조용한 카페",1,37.508354,127.109585,"244820280","커피전문점"],["효모","dessert","제과·베이커리",1,37.509013,127.084184,"1919299021","제과,베이커리"],["머더파커 WOW잠실점","play","방탈출카페",0,37.5135,127.108337,"1796437751","방탈출카페"],["석촌호수 서호","walk","호수 한 바퀴 산책",0,37.507681,127.099113,"7947003","호수"]],
  kondae: [["기름칠","meal","삼겹살",1,37.542316,127.070368,"1173821572","삼겹살"],["탄토탄토","meal","하우스스테이크 추천",0,37.54251,127.070741,"192485759","양식"],["우마이도 건대점","meal","혼밥도 편안한 진한 돈코츠 라멘",0,37.543041,127.071689,"8029124","일본식라면"],["송림식당","meal","추억 담긴 진한 선지해장국과 불백",1,37.536688,127.076405,"7963415","기사식당"],["릴리베이커리","dessert","놀라운 토요일 소개",0,37.542963,127.070717,"39192828","제과,베이커리"],["히어로보드게임카페 건대본점","play","300종 보드게임",0,37.543443,127.069998,"1232273833","히어로보드게임카페"],["황금열쇠 건대점","play","방탈출카페",0,37.541432,127.068453,"1271584354","방탈출카페"],["뚝섬한강공원","walk","강변 산책·돗자리",0,37.529297,127.068921,"8136085","도시근린공원"]],
  mangwon: [["헤키","meal","히레카츠 추천",0,37.555241,126.90979,"1226420399","일식"],["산볼","meal","와규 로스트비프동 추천",1,37.553869,126.906388,"351203677","일식"],["육장","meal","육개장 추천",1,37.553913,126.905502,"64633006","국밥"],["소금집델리 망원","meal","겹겹이 쌓인 수제햄 샌드위치",0,37.556824,126.908236,"256064588","샌드위치"],["레이키친","meal","감바스 파스타 추천",0,37.552955,126.906237,"54314344","양식"],["평형","cafe","히비스커스 추천",1,37.55562,126.904603,"2131106327","카페"],["포트레이트 커피바","cafe","카페",1,37.556534,126.906508,"1291730987","카페"],["피피커피","cafe","고즈넉한 골목의 융드립 커피",0,37.552251,126.905049,"20620718","커피전문점"],["밀로밀","dessert","바게트 소금빵 3천원",1,37.552878,126.904499,"1917968704","제과,베이커리"],["블랑제리코팡","dessert","생활의 달인 소개",1,37.554914,126.90049,"1251590315","제과,베이커리"],["라바즈","dessert","프렌치 에끌레어 테이크아웃",1,37.554994,126.909425,"783754308","제과,베이커리"],["망원시장","walk","먹거리 1만원 투어",0,37.555886,126.906266,"18526234","시장"],["망원한강공원","walk","시장 음식 들고 피크닉",0,37.551725,126.900028,"8126939","도시근린공원"]],
  mullae: [["아나텔로판","meal","마르게리타 추천",1,37.513346,126.892369,"1501752665","피자"],["이치니이치","meal","12시간 우려낸 깊은 닭육수 라멘",1,37.514453,126.894199,"10556324","일본식라면"],["양키스그릴 문래점","meal","트러플화이트라구파스타 추천",1,37.514742,126.89497,"2137063082","스테이크,립"],["바이닐인사이드","cafe","바이시그니처라떼 추천",1,37.514372,126.891997,"418405990","디저트카페"],["아도 티하우스","cafe","전통찻집",0,37.513045,126.894765,"1637094739","전통찻집"],["입허전","dessert","제과·베이커리",1,37.513934,126.892635,"949771323","제과,베이커리"]],
  namsan: [["데칼코마니","meal","꿀마늘 대구·파스타",1,37.545272,126.9849,"1915089772","양식"],["팟카파우","meal","태국 셰프 바질 덮밥",1,37.545192,126.984859,"2141862994","태국음식"],["타코스탠드","meal","테라스 있는 멕시칸 타코",0,37.541425,126.987248,"1312716777","멕시칸,브라질"],["르몽블랑","cafe","디저트카페",1,37.544879,126.984855,"1316697633","디저트카페"],["개방 해방촌점","cafe","버터떡 (3pcs) 추천",1,37.545242,126.984648,"1240741859","카페"],["언뎁트","cafe","적산가옥 카페+소품샵",1,37.546214,126.976698,"941538435","커피전문점"],["신흥시장","walk","야장 깔린 레트로 시장",1,37.545315,126.984991,"25043156","시장"],["108하늘계단","walk","서울미래유산 계단 산책",0,37.546446,126.98189,"20992450","관광,명소"],["N서울타워","view","야경 + 자물쇠 데이트",0,37.551305,126.988231,"1629378951","전망대"]],
  samseong: [["동어 동락 삼성2호점","meal","깐 생새우회 추천",1,37.508377,127.05853,"1883427320","해물,생선"],["이치규 본점","meal","직접 구워 즐기는 일본식 규카츠",1,37.505701,127.058622,"1406873213","일식"],["허머스키친 삼성점","meal","후무스·샥슈카",0,37.509344,127.061432,"2022806150","아시아음식"],["동어동락 삼성본점","meal","가을 전어회 추천",1,37.508812,127.056408,"1751054299","회"],["포스톤즈 삼성점","cafe","아메리카노 추천",1,37.509793,127.064085,"2124768638","카페"],["별마당도서관 스타필드코엑스몰","walk","13m 책장 무료 구경",0,37.510193,127.060159,"2104663194","도서관"],["대한불교조계종 봉은사","walk","도심 속 사찰 산책",0,37.515518,127.05771,"8373155","절,사찰"]],
  seochon: [["뼈탄집","meal","숙성육의 깊은 풍미와 전문 그릴링",0,37.576418,126.971665,"1993931194","육류,고기"],["김진목삼 2호점","meal","통목살 추천",1,37.576906,126.97203,"1442254819","육류,고기"],["라파리나","cafe","소금 베이글 추천",1,37.579966,126.971555,"320328582","카페"],["미드메","cafe","프랑스식 빵·테라스",1,37.579267,126.971736,"864262498","제과,베이커리"],["금상고로케 서촌마을점","dessert","바삭함과 치즈가 어우러진 고로케",1,37.579542,126.969648,"26839488","제과,베이커리"],["애소아소금빵","dessert","초코소금빵4 추천",0,37.576725,126.972231,"155896679","제과,베이커리"],["서울은마꽈배기","dessert","설탕 듬뿍 쫄깃한 찹쌀 꽈배기",1,37.576849,126.972613,"1077729968","제과,베이커리"],["경복궁","walk","고궁 산책 데이트",0,37.577613,126.976898,"18619553","고궁,궁"]],
  seongsu: [["이태리국시 성수","meal","숯불불고기쌈피자 추천",0,37.546058,127.046723,"780776735","양식"],["누메로도스","meal","아마트리치아나 추천",1,37.546357,127.047361,"142054376","이탈리안"],["어반누크","cafe","아메리카노 추천",0,37.546743,127.043325,"1883661279","카페"],["뺑드에코","dessert","천연효모로 빚은 건강한 사워도우",0,37.542267,127.049042,"304432238","제과,베이커리"],["밀도 성수본점","dessert","담백식빵 추천",1,37.546239,127.044879,"27300932","제과,베이커리"],["성수베이킹스튜디오","dessert","유 퀴즈 온 더 블럭 소개",1,37.546185,127.043759,"799001769","제과,베이커리"],["서울숲","walk","잔디밭 산책·자전거",0,37.544322,127.037618,"11331488","도시근린공원"]],
  sinsa: [["인딕슬로우","meal","프라운 아보카도 사그 추천",1,37.521859,127.020348,"1104467407","인도음식"],["이태리국시 도산","meal","동서양이 어우러진 퓨전 양식",0,37.525594,127.034959,"1136678146","양식"],["소각","meal","런치마라샹궈 추천",0,37.519581,127.020118,"1947749247","중국요리"],["까폼 본점","meal","태국음식",0,37.524857,127.037993,"558503389","태국음식"],["동인동","meal","갈비",0,37.518078,127.020393,"7847225","갈비"],["마일스톤커피","cafe","플랫화이트 추천",0,37.521851,127.02433,"22549791","커피전문점"],["따우전드 신사점","cafe","바나나크림파이 추천",1,37.520594,127.021366,"1363607100","카페"],["올드페리도넛 가로수길점","dessert","가로수길 도넛",1,37.520723,127.021293,"700133104","도넛"],["에뚜왈 가로수길점","dessert","마들렌 레몬 추천",1,37.521315,127.022222,"431521088","제과,베이커리"],["압구정로데오거리","shop","편집숍·플리마켓",0,37.526756,127.039152,"7990409","테마거리"],["하이스트리트이탈리아","shop","디자인·리빙 구경",0,37.522554,127.02238,"1082459907","문화시설"]],
  yeonnam: [["서양면옥 연남","meal","재훈이자냐 추천",0,37.560941,126.925726,"2036858666","양식"],["소이연남","meal","소고기 쌀국수 추천",0,37.563514,126.925388,"25479306","태국음식"],["동차밥","meal","생연어 덮밥 추천",0,37.561379,126.926358,"26089191","일식"],["연교","meal","우육탕 추천",0,37.561605,126.926671,"934767425","중국요리"],["566라멘","meal","진한 기름진 맛의 지로라멘",0,37.560563,126.920881,"1235914986","일본식라면"],["일기","cafe","후추 프렌치 토스트 추천",0,37.565178,126.923228,"1889411038","카페"],["조앤도슨","cafe","카페",1,37.563646,126.923197,"43859487","카페"],["치플레","dessert","제과·베이커리",1,37.562819,126.92564,"852129186","제과,베이커리"],["리틀빅토리","dessert","제과·베이커리",0,37.560784,126.925739,"1963942486","제과,베이커리"],["피오니 연남점","dessert","딸기생크림 1호 추천",0,37.564433,126.919945,"22446604","제과,베이커리"],["히어로보드게임카페 홍대2호점","play","시간제 보드게임",0,37.555349,126.922703,"205320302","히어로보드게임카페"]],
  yeouido: [["폴앤폴리나 여의도점","dessert","담백함이 빛나는 건강한 식사빵",1,37.521062,126.924028,"17079438","제과,베이커리"],["브레드피트","dessert","우유 크림빵 추천",1,37.520206,126.9318,"27545464","제과,베이커리"],["클라르테 반지공방 여의도점","play","미술·공예",0,37.52623,126.931053,"1904269646","미술,공예"],["더현대 서울","shop","팝업 순회 코스",0,37.525872,126.928446,"1662602781","현대백화점"],["여의도한강공원","walk","잔디밭 피크닉",0,37.526389,126.935129,"10952963","도시근린공원"]],
  yongsan: [["능동미나리 신용산점","meal","능동 미나리 곰탕 추천",0,37.530092,126.97082,"596181447","곰탕"],["버뮤다삼각지","meal","폭립플래터 추천",1,37.531972,126.972349,"26925620","멕시칸,브라질"],["심퍼티쿠시 용산점","meal","차돌 고사리 오일 파스타 추천",1,37.532189,126.972075,"1740706159","양식"],["헤비사이드","cafe","바닐라 프렌치 토스트 추천",1,37.533414,126.972324,"40101863","카페"],["티에이알티","cafe","디저트카페",1,37.531671,126.973018,"757834218","디저트카페"],["아이파크몰 용산점","play","닌텐도·덕질 체험 몰",1,37.528817,126.964533,"7990380","복합쇼핑몰"],["용리단길","walk","신용산~삼각지 골목",0,37.531451,126.972204,"1351263673","테마거리"]]
};
const PICK_AS = { brunch: ["dessert"], sight: ["shop"] };

/* 종류: 이름, 머무는 분, 카카오 검색어(없으면 동네 명소만) */
const TYPES = {
  meal: ["식사", 60, ["맛집"]], brunch: ["브런치", 50, ["브런치", "베이글"]], cafe: ["카페", 50, ["카페", "디저트카페"]],
  dessert: ["디저트", 30, ["디저트", "베이커리", "소금빵"]], walk: ["산책", 40], sight: ["구경", 30], show: ["전시·팝업", 50, ["팝업스토어", "전시"]],
  play: ["놀거리", 60, ["방탈출", "보드게임카페", "오락실", "코인노래방", "공방", "만화카페"]], photo: ["사진", 20, ["인생네컷", "포토이즘", "포토그레이", "셀프사진관"]],
  shop: ["소품샵", 40, ["소품샵", "편집샵"]], view: ["야경", 30], bar: ["한잔", 70, ["포차", "요리주점", "이자카야"]], pick: ["가고 싶은 곳", 40]
};
const ICON = { meal: "🍽️", brunch: "🥯", cafe: "☕", dessert: "🍰", walk: "🌳", sight: "👀", show: "✨", play: "🎲", photo: "📸", shop: "🛍️", view: "🌃", bar: "🍻", pick: "💗" };
const PREFS = [["meal", "맛집"], ["cafe", "카페·디저트"], ["play", "놀거리"], ["photo", "인생네컷"], ["walk", "산책"], ["shop", "소품샵"], ["show", "팝업·전시"], ["view", "야경"], ["bar", "한잔"]];
const CHAIN = /스타벅스|투썸|이디야|메가MGC|메가커피|컴포즈|빽다방|할리스|파스쿠찌|커피빈|폴바셋|엔제리너스|맥도날드|버거킹|롯데리아|KFC|맘스터치|서브웨이|김밥천국|본죽|파리바게뜨|뚜레쥬르|배스킨|던킨|CU |GS25|세븐일레븐|이마트24|다이소|올리브영|교촌|BBQ|bhc|굽네|노랑통닭|백다방|더벤티|공차|설빙/;

/* ---------- 상태 ---------- */
const now = new Date();
const S = { room: null, me: "a", info: null, courses: [], photos: [], y: now.getFullYear(), m: now.getMonth(), sel: today(),
            unsub: [], view: null, draft: null, busy: false };
const name = w => S.info?.[w]?.name || (w === "a" ? "남자친구" : "여자친구");
const col = (...p) => collection(db, "rooms", S.room, ...p);
const ref = (...p) => doc(db, "rooms", S.room, ...p);
const link = code => `${location.origin}${location.pathname}#${code}`;
function newCode() {
  const r = crypto.getRandomValues(new Uint8Array(20));
  return [...r].map(v => ABC[v % 32]).join("").match(/.{4}/g).join("-");
}
function normCode(t) {
  const s = String(t || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 20 && [...s].every(c => ABC.includes(c)) ? s.match(/.{4}/g).join("-") : null;
}

/* ---------- 카카오맵 ---------- */
let kakaoP = null;
function kakaoReady() {
  if (kakaoP) return kakaoP;
  kakaoP = new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    s.onload = () => window.kakao ? kakao.maps.load(() => ok(kakao)) : no();
    s.onerror = no;
    document.head.append(s);
  });
  kakaoP.catch(() => { kakaoP = null; });
  return kakaoP;
}
const searchCache = new Map();
async function kSearch(query, at, radius = 2000) {
  const key = `${query}|${at ? at.lat.toFixed(3) + "," + at.lng.toFixed(3) + "," + radius : ""}`;
  if (searchCache.has(key)) return searchCache.get(key);
  const k = await kakaoReady();
  const ps = new k.maps.services.Places();
  const opt = { size: 15 };
  if (at) { opt.location = new k.maps.LatLng(at.lat, at.lng); opt.radius = radius; }
  const res = await new Promise(ok => ps.keywordSearch(query, (data, st) => ok(st === k.maps.services.Status.OK ? data : []), opt));
  const out = res.map(p => ({ id: p.id, name: p.place_name, lat: +p.y, lng: +p.x, url: p.place_url,
    addr: p.road_address_name || p.address_name, cat: p.category_name || "", g: p.category_group_code || "" }));
  searchCache.set(key, out);
  return out;
}
async function kStation(at) {
  const k = await kakaoReady();
  const ps = new k.maps.services.Places();
  const r = await new Promise(ok => ps.categorySearch("SW8", (d, st) => ok(st === k.maps.services.Status.OK ? d : []),
    { location: new k.maps.LatLng(at.lat, at.lng), radius: 1500, sort: k.maps.services.SortBy.DISTANCE }));
  return r[0] ? { name: r[0].place_name.split(" ")[0], lat: +r[0].y, lng: +r[0].x } : null;
}
const meetKey = s => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`;
async function meetOf(first) {
  const st = await kStation(first).catch(() => null);
  return st ? { ...st, min: Math.max(1, Math.round(dist(st, first) * 1.3 / 70)), for: meetKey(first) } : null;
}
/* 첫 장소가 바뀌면 만나는 역도 다시 */
const meetBusy = new Set();
async function ensureMeet(c) {
  const f = c.stops[0]; if (!f) return;
  const key = meetKey(f);
  if (c.meet?.for === key || meetBusy.has(key)) return;
  meetBusy.add(key);
  const m = await meetOf(f);
  meetBusy.delete(key);
  if (!m || c.stops[0] !== f) return;
  c.meet = m;
  if (S.view !== "draft" && c.id) updateDoc(ref("courses", c.id), { meet: m }).catch(() => {});
  if (viewCourse() === c) renderCourse();
}

/* 동네 명소 좌표(한 번 찾으면 기기에 저장) */
const ANCHOR_KEY = "urigil-anchors";
const anchors = store.get(ANCHOR_KEY) || {};
async function anchor([q, , , o]) {
  if (o.at) return { id: "", name: q, lat: o.at[0], lng: o.at[1], url: `https://map.kakao.com/?q=${encodeURIComponent(q)}`, addr: "", cat: "", g: "" };
  if (anchors[q]) return o.label ? { ...anchors[q], name: o.label, cat: "" } : anchors[q];
  const r = (await kSearch(q))[0];
  if (r && r.lat > 37.4 && r.lat < 37.7 && r.lng > 126.7 && r.lng < 127.2) { anchors[q] = r; store.set(ANCHOR_KEY, anchors); }
  return anchors[q] ? (o.label ? { ...anchors[q], name: o.label, cat: "" } : anchors[q]) : null;
}

/* ---------- 거리·길 ---------- */
function dist(a, b) {
  const R = 6371e3, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lng - a.lng) * t;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function legOf(a, b) {
  const d = dist(a, b) * 1.3;
  return d <= 1600 ? { mode: "walk", min: Math.max(3, Math.round(d / 70)), m: Math.round(d) }
                   : { mode: "ride", min: Math.round(12 + d / 380), m: Math.round(d) };
}
const PATH_KEY = "urigil-paths";
const paths = store.get(PATH_KEY) || {};
let pathQ = Promise.resolve();
const pending = new Map();
function walkPath(a, b) {
  const k = [a.lng, a.lat, b.lng, b.lat].map(v => v.toFixed(5)).join(",");
  if (paths[k]) return Promise.resolve(paths[k]);
  if (!pending.has(k)) {
    const job = pathQ.then(() => fetchPath(a, b, k));
    pathQ = job.then(() => new Promise(r => setTimeout(r, 1100)));
    pending.set(k, job); job.finally(() => pending.delete(k));
  }
  return pending.get(k);
}
async function fetchPath(a, b, k) {
  if (paths[k]) return paths[k];
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a.lng},${a.lat};${b.lng},${b.lat}?overview=simplified&geometries=geojson`, { signal: ctl.signal });
    const j = await r.json();
    const line = j.routes?.[0]?.geometry?.coordinates;
    if (!line) return null;
    paths[k] = line.map(([x, y]) => [+y.toFixed(5), +x.toFixed(5)]);
    const keys = Object.keys(paths); if (keys.length > 150) delete paths[keys[0]];
    store.set(PATH_KEY, paths);
    return paths[k];
  } catch { return null; }
}

/* ---------- 날씨(16일 안쪽만) ---------- */
async function weather(date, from, to) {
  if (diff(today(), date) < 0 || diff(today(), date) > 15) return null;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.978&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FSeoul&start_date=${date}&end_date=${date}`, { signal: ctl.signal });
    const h = (await r.json()).hourly;
    const hs = h.time.map((_, i) => i).filter(i => i >= Math.floor(from / 60) && i <= Math.min(23, Math.floor(to / 60)));
    if (!hs.length) return null;
    const p = Math.max(...hs.map(i => h.precipitation_probability[i] ?? 0));
    const temps = hs.map(i => h.temperature_2m[i]);
    const t = Math.round(temps.reduce((s, v) => s + v, 0) / temps.length);
    const code = Math.max(...hs.map(i => h.weather_code[i]));
    const icon = code >= 95 ? "⛈️" : code >= 71 && code <= 86 && !(code >= 80 && code <= 82) ? "❄️" : p >= 50 || code >= 51 ? "☔" : code >= 2 ? "⛅" : "☀️";
    return { label: `${icon} ${t}°${p >= 30 ? ` · 비 ${p}%` : ""}`, wet: p >= 55 || t <= -5 || t >= 32 };
  } catch { return null; }
}
/* 서울 해 지는 시각(분) — 태양 적위·균시차로 계산 */
function sunset(date) {
  const d = parse(date), n = (d - new Date(d.getFullYear(), 0, 0)) / 864e5, r = Math.PI / 180;
  const B = 2 * Math.PI * (n - 81) / 364, eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const dec = 23.44 * r * Math.sin(B), lat = 37.57 * r;
  const w = Math.acos((Math.sin(-.833 * r) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / r;
  return Math.round(720 + (135 - 126.98) * 4 - eot + w * 4);
}

/* ---------- 코스 짜기 ---------- */
function chooseArea(date, from, to, prefs, wet) {
  const mon = parse(date).getMonth() + 1, night = to >= sunset(date) + 30;
  const recent = new Set(S.courses.filter(c => Math.abs(diff(c.date, date)) <= 60).flatMap(c => [c.area, c.area2]));
  let best = null, bestS = -1e9;
  for (const [id, a] of Object.entries(AREAS)) {
    const types = new Set(a.spots.map(s => s[1]));
    let s = Math.random() * 2.2;
    if (a.season.includes(mon)) s += 1.6;
    if (wet) s += a.in * 1.4 - 1.5;
    if (prefs.includes("meal")) s += a.food * .5;
    for (const p of prefs) if (types.has(p)) s += .5;
    if (night && prefs.includes("view") && (types.has("view") || a.spots.some(x => x[3].n))) s += .8;
    if (recent.has(id)) s -= 2.6;
    if (to - from >= 420 && a.near.length) s += .4;
    if (s > bestS) { bestS = s; best = id; }
  }
  return best;
}

const opensAt = (o, t, stay, wd) => (o.off === undefined || o.off !== wd) && (o.o ?? 0) <= t && t + Math.min(stay, 40) <= (o.c ?? H(26));
const HOURS = { meal: [H(11), H(21)], brunch: [H(9), H(15)], cafe: [H(10), H(22)], dessert: [H(11), H(22)], show: [H(11), H(20)],
                play: [H(11), H(23)], photo: [H(9), H(26)], shop: [H(11), H(21)], bar: [H(17), H(26)] };

async function fromPicks(type, ctx, t) {
  const hrs = HOURS[type];
  if (hrs && (t < hrs[0] || t + 20 > hrs[1])) return null;
  const want = [type, ...(PICK_AS[type] || [])];
  const center = ctx.pos || await areaPos(ctx.area);
  const found = (PICKS[ctx.area] || []).filter(x => want.includes(x[1]) && !ctx.used.has(x[0]) && !ctx.used.has(x[6])
    && (!center || dist(center, { lat: x[4], lng: x[5] }) <= (ctx.pos ? 1500 : 3000)));
  if (!found.length) return null;
  const wt = x => (x[3] ? 1.3 : 1) / (1 + (ctx.pos ? dist(ctx.pos, { lat: x[4], lng: x[5] }) / 700 : 0));
  let r = Math.random() * found.reduce((s2, x) => s2 + wt(x), 0), x = found[0];
  for (const f of found) if ((r -= wt(f)) <= 0) { x = f; break; }
  ctx.used.add(x[0]); ctx.used.add(x[6]); ctx.used.add(x[0].replace(/\s/g, ""));
  return { id: x[6], name: x[0], lat: x[4], lng: x[5], url: `https://place.map.kakao.com/${x[6]}`, addr: "", cat: x[7], g: "",
           stay: TYPES[type][1], why: x[2], hot: !!x[3] };
}
async function findPlace(type, ctx, t) {
  const picked = await fromPicks(type, ctx, t);
  if (picked) return picked;
  const area = AREAS[ctx.area], wd = parse(ctx.date).getDay(), dark = t >= ctx.sun;
  const pool = type === "view" ? [area, ...area.near.map(n => AREAS[n])].flatMap(a => a.spots) : area.spots;
  let spots = pool.filter(s => (s[1] === type || (type === "view" && s[1] === "walk" && s[3].n))
    && !ctx.used.has(s[0]) && !ctx.used.has(s[3].label) && opensAt(s[3], t, s[2], wd) && (!dark || s[3].n || s[3].i));
  if (spots.length) {
    const far = type === "view" ? 3000 : 1600;
    const found = (await Promise.all(spots.map(s => anchor(s).then(p => p && { p, s })))).filter(x => x && !ctx.used.has(x.p.id) && !ctx.used.has(x.p.name.replace(/\s/g, "")) && (!ctx.pos || dist(ctx.pos, x.p) <= far));
    if (found.length) {
      const near = ctx.pos ? found.sort((x, y) => dist(ctx.pos, x.p) - dist(ctx.pos, y.p)) : found.sort(() => Math.random() - .5);
      const { p, s } = near[0];
      ctx.used.add(s[0]); ctx.used.add(p.name); ctx.used.add(p.name.replace(/\s/g, "")); if (p.id) ctx.used.add(p.id);
      return { ...p, stay: s[2], name: p.name };
    }
  }
  const words = type === "play" && area.play ? [...TYPES[type][2], ...area.play] : TYPES[type][2];
  if (!words) return null;
  const hrs = HOURS[type];
  if (hrs && (t < hrs[0] || t + 30 > hrs[1])) return null;
  const at = ctx.pos || await areaPos(ctx.area);
  if (!at) return null;
  const list = await kSearch(`${area.q} ${pick(words)}`, at, 1500);
  const ok = list.filter(p => !ctx.used.has(p.id) && !ctx.used.has(p.name) && !CHAIN.test(p.name) && fits(type, p));
  if (!ok.length) return null;
  const scored = ok.map((p, i) => ({ p, s: i * .8 + dist(at, p) / 220 + Math.random() * 4
    + (ctx.lastCat && p.cat.split(">").pop().trim() === ctx.lastCat ? 6 : 0) })).sort((x, y) => x.s - y.s);
  const p = scored[0].p;
  ctx.used.add(p.id); ctx.used.add(p.name);
  return { ...p, stay: TYPES[type][1] };
}
function fits(type, p) {
  const c = p.cat;
  switch (type) {
    case "meal": return p.g === "FD6" && !/술집|카페|간식|제과|뷔페|코스요리|오마카세/.test(c);
    case "brunch": return (p.g === "FD6" || p.g === "CE7") && !/술집|주점/.test(c);
    case "cafe": return p.g === "CE7" && !/여가시설|만화|보드/.test(c);
    case "dessert": return (p.g === "CE7" || /간식|제과|디저트|베이커리|도넛|아이스크림/.test(c)) && !/여가시설/.test(c);
    case "bar": return /포장마차|요리주점|호프|이자카야|일본식주점|술집/.test(c) && !/와인|칵테일|바$/.test(c);
    case "show": return /팝업스토어|전시|미술관|박물관|문화시설/.test(c) && !/갤러리|화랑/.test(c + p.name);
    case "play": return /여가시설|방탈출|보드카페|오락실|노래방|만화카페|공방|미술,공예|볼링|체험|연극극장/.test(c) && !/화랑|갤러리|화방/.test(c);
    case "photo": return /즉석사진|셀프사진|셀프스튜디오/.test(c);
    case "shop": return p.g !== "FD6" && p.g !== "CE7" && (/소품|생활용품|잡화|문구|선물|인테리어|편집|팝업/.test(c) || /소품|편집|문구/.test(p.name)) && !/신발|의류|안경/.test(c);
    default: return true;
  }
}
async function areaPos(id) {
  for (const s of AREAS[id].spots) { const p = await anchor(s); if (p) return p; }
  return null;
}

function pickType(ctx, t, rem, last) {
  const no = k => ctx.no.has(k) && t - ctx.no.get(k) < 90;
  const P = ctx.prefs, has = p => P.includes(p), sinceRest = t - ctx.restAt;
  if (!ctx.lunch && t >= H(11) + 30 && t < H(14) && rem >= 55) return "meal";
  if (!ctx.dinner && t >= H(17) + 30 && t < H(20) + 30 && rem >= 55) return "meal";
  if (!ctx.lunch && t >= H(9) && t < H(11) + 30 && rem >= 50) return "brunch";
  const barOk = has("bar") && !ctx.bar && rem >= 60 && (t >= H(21) || (ctx.dinner && t >= H(19)));
  if (has("view") && !ctx.view && rem >= 30 && t >= ctx.sun + 15 && t < H(23) && (!barOk || rem >= 110)) return "view";
  if (barOk) return "bar";
  if (t >= H(23) + 30) return null;
  if (t < H(21) + 30 && ctx.cafes < 2 && !ctx.bar && !no("cafe") && !(last === "cafe" || last === "dessert")
      && (last === "meal" ? ctx.cafes === 0 || sinceRest >= 150 : (ctx.cafes === 0 && rem <= 100 && last !== "brunch") || sinceRest >= 170))
    return ctx.cafes && !ctx.dessert ? "dessert" : "cafe";
  if (has("photo") && !ctx.count.photo && t - ctx.from >= 80 && rem >= 45 && last !== "photo" && !no("photo") && Math.random() < .5) return "photo";
  const untilMeal = !ctx.lunch && t < H(11) + 30 && ctx.to >= H(13) ? H(11) + 50 - t : !ctx.dinner && t < H(17) + 30 && ctx.to >= H(19) ? H(17) + 50 - t : 999;
  const w = { walk: .9, sight: .6, show: .35, play: 1, shop: .6 };
  for (const k in w) {
    if (has(k === "sight" ? "shop" : k)) w[k] *= 3;
    if (ctx.wet) w[k] *= k === "walk" || k === "sight" ? .15 : 2;
    if ((ctx.count[k] || 0) >= (k === "walk" && ctx.len > 420 ? 2 : 1) || k === last || no(k)) w[k] = 0;
    if (k === "play" && (ctx.count.play || 0) < (ctx.len > 420 ? 2 : 1) && k !== last && !no(k)) w[k] = has("play") ? 3 : 1;
    if ((k === "show" || k === "play") && (rem < 60 || untilMeal < 65)) w[k] = 0;
  }
  const sum = Object.values(w).reduce((s, v) => s + v, 0);
  if (sum > 0) {
    let r = Math.random() * sum;
    for (const [k, v] of Object.entries(w)) if ((r -= v) <= 0) return k;
  }
  if (t < H(21) + 30 && ctx.cafes < 2 && !ctx.bar && last !== "cafe" && !no("cafe")) return "cafe";
  if (!ctx.dessert && t < H(21) && last !== "dessert" && !no("dessert")) return "dessert";
  if (has("photo") && !ctx.count.photo && !no("photo") && last !== "photo") return "photo";
  return null;
}

async function plan({ date, from, to, prefs, area: chosen, replaces }) {
  const len = to - from, w = await weather(date, from, to);
  const area = chosen || chooseArea(date, from, to, prefs, w?.wet);
  const a2 = len >= 420 && !chosen ? pick(AREAS[area].near) : null;
  const ctx = { date, area, prefs, wet: !!w?.wet, sun: sunset(date), used: new Set(), count: {}, no: new Map(),
                lunch: from >= H(14), dinner: from >= H(20) + 30, cafes: 0, restAt: from, pos: null, len, to, from };
  const stops = [], legs = [];
  let t = from, last = null, switched = !a2, guard = 0;
  while (guard++ < 24) {
    if (!switched && t - from >= len * .45 && (last === "meal" || last === "cafe" || t - from >= len * .6)) {
      switched = true; ctx.area = a2; ctx.no.clear();
    }
    const rem = to - t;
    if (rem < 35) break;
    const type = pickType(ctx, t, rem, last);
    if (!type) break;
    const p = await findPlace(type, ctx, t);
    if (!p) { ctx.no.set(type, t); if (type === "meal") ctx[t < H(15) ? "lunch" : "dinner"] = true; if (type === "brunch") ctx.lunch = true;
              if (type === "view") ctx.view = true; if (type === "bar") ctx.bar = true; continue; }
    const leg = ctx.pos ? legOf(ctx.pos, p) : null;
    const at = leg ? r5(t + leg.min) : t;
    let stay = Math.min(p.stay, to - at);
    if (!["meal", "brunch", "bar"].includes(type)) {
      const nextMeal = !ctx.lunch && at < H(11) + 30 && to >= H(13) ? H(11) + 40 : !ctx.dinner && at < H(17) + 30 && to >= H(19) ? H(17) + 50 : null;
      if (nextMeal) stay = Math.min(stay, Math.max(25, nextMeal - at));
    }
    if (stay < Math.min(25, p.stay)) break;
    stay = Math.round(stay / 5) * 5;
    stops.push({ id: p.id || "", name: p.name, type, lat: p.lat, lng: p.lng, url: p.url || "", addr: p.addr || "", cat: (p.cat || "").split(">").pop().trim(), why: p.why || "", hot: !!p.hot, t: at, stay, likes: {} });
    legs.push(leg);
    ctx.count[type] = (ctx.count[type] || 0) + 1;
    if (type === "meal") { ctx[at < H(15) ? "lunch" : "dinner"] = true; ctx.restAt = at + stay; ctx.lastCat = stops.at(-1).cat; }
    if (type === "brunch") { ctx.lunch = true; ctx.restAt = at + stay; if (p.g === "CE7") ctx.cafes++; }
    if (type === "cafe" || type === "dessert") { ctx.cafes++; ctx.restAt = at + stay; if (type === "dessert") ctx.dessert = true; }
    if (type === "view") ctx.view = true;
    if (type === "bar") ctx.bar = true;
    if (type === "walk" && at >= ctx.sun) ctx.view = true;
    ctx.pos = p; last = type; t = at + stay;
  }
  const meet = stops[0] ? await meetOf(stops[0]) : null;
  return { date, from, to, meet, area, area2: a2 && switched ? a2 : null,
           prefs, picked: chosen || null, weather: w?.label || "", stops, legs, replaces: replaces || null };
}

/* 장소를 바꾸거나 넣고 뺀 뒤 시간 다시 맞추기 */
function retime(c) {
  let t = c.from;
  c.legs = c.stops.map((s, i) => {
    const leg = i ? legOf(c.stops[i - 1], s) : null;
    s.t = leg ? r5(t + leg.min) : t;
    t = s.t + s.stay;
    return leg;
  });
}
async function swapStop(c, i) {
  const s = c.stops[i];
  const ctx = { date: c.date, area: c.area2 && i >= c.stops.length / 2 ? c.area2 : c.area, prefs: c.prefs || [], sun: sunset(c.date),
                used: new Set(c.stops.flatMap(x => [x.id, x.name])), pos: c.stops[i - 1] || c.stops[i + 1] || null, lastCat: s.cat };
  const type = s.type === "pick" ? "cafe" : s.type;
  let p = await findPlace(type, ctx, s.t);
  if (!p && type === "view") p = await findPlace("walk", ctx, s.t);
  if (!p) return false;
  c.stops[i] = { ...s, id: p.id || "", name: p.name, lat: p.lat, lng: p.lng, url: p.url || "", addr: p.addr || "", cat: (p.cat || "").split(">").pop().trim(), why: p.why || "", hot: !!p.hot, likes: {} };
  retime(c);
  return true;
}

/* ---------- 그리기 ---------- */
function render() {
  if (!S.info) return;
  renderHead(); renderCal(); renderAgenda(); renderUs();
  if (!$("tab-course").hidden) renderCourse();
}
const upcomingCourse = () => S.courses.filter(c => !c.done && c.date >= today()).sort((x, y) => x.date.localeCompare(y.date) || x.from - y.from)[0];
const areaName = c => AREAS[c.area]?.name + (c.area2 ? ` → ${AREAS[c.area2]?.name}` : "");
function renderHead() {
  const n = upcomingCourse();
  if (n) {
    const left = diff(today(), n.date);
    $("hD").textContent = left ? `D-${left}` : "D-DAY";
    $("hNext").textContent = left ? `${mdw(n.date)} · ${AREAS[n.area]?.name}` : `오늘 ${hm(n.from)} · ${AREAS[n.area]?.name}`;
  } else {
    const st = S.info.start, d = st ? diff(st, today()) + 1 : 0;
    $("hD").textContent = d > 0 ? `D+${d}` : "우리길";
    $("hNext").textContent = "다음 데이트 짜 볼까요?";
  }
  const p = curPhoto(), pic = $("hPic");
  pic.style.backgroundImage = p ? `url("${p.data}")` : ""; pic.classList.toggle("has", !!p);
}
const coursesOn = d => S.courses.filter(c => c.date === d).sort((x, y) => x.from - y.from);
function renderCal() {
  const { y, m } = S;
  $("mTitle").textContent = `${y}. ${pad(m + 1)}`;
  const first = new Date(y, m, 1), t = today();
  let html = "";
  for (let i = 0; i < 42; i++) {
    const dt = new Date(y, m, 1 - first.getDay() + i), d = ymd(dt), cs = coursesOn(d);
    const cls = ["day", dt.getMonth() !== m && "out", dt.getDay() === 0 && "sun", d === t && "today", d === S.sel && "sel"].filter(Boolean).join(" ");
    html += `<button type="button" class="${cls}" data-d="${d}" aria-label="${md(d)}"><span class="n">${dt.getDate()}</span>`
      + cs.slice(0, 2).map(c => `<span class="bar${c.done ? " done" : ""}">${esc(AREAS[c.area]?.name.split("·")[0])}</span>`).join("") + `</button>`;
  }
  $("grid").innerHTML = html;
}
function courseCard(c) {
  return `<button type="button" class="ccard${c.done ? " done" : ""}" data-c="${c.id}">
    <b class="cc-top">${esc(areaName(c))}</b>
    <small>${mdw(c.date)} · ${hm(c.from)}–${hm(c.to)} · ${c.stops.length}곳${c.done ? " · 다녀옴" : ""}</small>
    <span class="cc-icons">${c.stops.map(s => ICON[s.type]).join("")}</span></button>`;
}
function renderAgenda() {
  const d = S.sel, cs = coursesOn(d);
  $("agenda").innerHTML = `<div class="ahead"><h3>${mdw(d)}요일</h3></div>`
    + cs.map(courseCard).join("")
    + `<button type="button" class="addbtn" data-plan>+ 이 날 데이트 짜기</button>`;
}

function renderUs() {
  const done = S.courses.filter(c => c.done), seen = new Set(done.flatMap(c => [c.area, c.area2]).filter(Boolean));
  $("stats").innerHTML = `<div><b>${done.length}</b><small>다녀온 데이트</small></div><div><b>${seen.size}<i>/${Object.keys(AREAS).length}</i></b><small>가 본 동네</small></div>`;
  $("areaDots").innerHTML = Object.entries(AREAS).map(([id, a]) => `<span class="${seen.has(id) ? "on" : ""}">${a.name}</span>`).join("");
  const list = [...S.courses].sort((x, y) => y.date.localeCompare(x.date));
  $("courseList").innerHTML = list.length ? list.map(courseCard).join("") : `<p class="empty">달력에서 날짜를 누르고 첫 코스를 짜 보세요.</p>`;
  const set = (id, v) => { if (document.activeElement !== $(id)) $(id).value = v; };
  set("sA", name("a")); set("sB", name("b"));
  $("sCode").textContent = S.room;
  const on = curPhoto()?.id;
  $("picList").innerHTML = S.photos.map(p =>
    `<div class="pic${p.id === on ? " on" : ""}" style="background-image:url('${esc(p.data)}')">`
    + `<button type="button" data-pic="${p.id}" aria-label="맨 위에 걸기"></button>`
    + `<button type="button" class="x" data-pdel="${p.id}" aria-label="사진 지우기">×</button></div>`).join("");
}

/* ---------- 코스 화면 ---------- */
const viewCourse = () => S.view === "draft" ? S.draft : S.courses.find(c => c.id === S.view);
function renderCourse() {
  const c = viewCourse(), head = $("cHead"), body = $("cBody");
  if (S.busy) {
    $("mapWrap").hidden = true;
    head.innerHTML = "";
    body.innerHTML = `<div class="making"><span class="dots"><i></i><i></i><i></i></span><b>코스 짜는 중</b></div>`;
    return;
  }
  if (!c) {
    $("mapWrap").hidden = true; head.innerHTML = "";
    body.innerHTML = `<div class="blank"><p>날짜와 시간을 고르면 코스를 짜 줘요.</p><button type="button" class="big" data-plan>데이트 짜기</button></div>`;
    return;
  }
  const draft = S.view === "draft", nowM = c.date === today() ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
  const walkM = c.legs.reduce((s, l) => s + (l?.mode === "walk" ? l.m : 0), 0);
  head.innerHTML = `<div class="chead"><small>${mdw(c.date)}요일 · ${hm(c.from)}–${hm(c.to)}</small>
    <h2>${esc(areaName(c))}</h2>
    ${c.meet ? `<a class="meet" href="https://map.kakao.com/link/to/${encodeURIComponent(clean(c.meet.name))},${c.meet.lat},${c.meet.lng}" target="_blank" rel="noopener"><span class="flag">출발</span><span><b>${esc(c.meet.name)}에서 만나요</b><small>${hm(c.from)} · ${esc(c.stops[0].name)}까지 ${c.meet.min > 15 ? `버스·택시 ${Math.round(6 + c.meet.min / 3)}분` : `걸어서 ${c.meet.min}분`}</small></span><em>길찾기</em></a>` : ""}
    <div class="chips">${c.weather ? `<span class="chip">${esc(c.weather)}</span>` : ""}<span class="chip">걷기 ${(walkM / 1000).toFixed(1)}km</span>${draft ? `<span class="chip new">미리보기</span>` : ""}</div></div>`;
  $("mapWrap").hidden = false;
  body.innerHTML = `<ol class="stops">${c.stops.map((s, i) => {
      const l = c.legs[i], live = nowM >= s.t && nowM < s.t + s.stay;
      const likes = ["a", "b"].map(w => `<button type="button" class="heart ${w}${s.likes?.[w] ? " on" : ""}" data-like="${i}" data-w="${w}" ${w === S.me ? "" : "disabled"} aria-label="${esc(name(w))} 좋아요">♥</button>`).join("");
      return (l ? `<li class="leg ${l.mode}"><span>${l.mode === "walk" ? `걸어서 ${l.min}분 · ${l.m < 1000 ? l.m + "m" : (l.m / 1000).toFixed(1) + "km"}` : `지하철·택시 ${l.min}분 정도`}</span>`
          + `<a href="${routeUrl(c.stops[i - 1], s, l.mode)}" target="_blank" rel="noopener">길찾기</a></li>` : "")
        + `<li class="stop${live ? " now" : ""}${s.likes?.a && s.likes?.b ? " both" : ""}" data-i="${i}">
          <span class="time"><span class="num">${i + 1}</span>${hm(s.t)}<small>${s.stay}분</small></span>
          <div class="sbody"><b>${esc(s.name)}</b>${s.why ? `<span class="why">${s.hot ? `<i class="hot">요즘</i>` : ""}${esc(s.why)}</span>` : ""}<small>${ICON[s.type]} ${TYPES[s.type][0]}${s.cat && s.cat !== TYPES[s.type][0] ? ` · ${esc(s.cat)}` : ""}${live ? ` · <em>지금</em>` : ""}</small>
            <div class="sacts">${likes}${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">정보</a>` : ""}<button type="button" data-swap="${i}">바꾸기</button><button type="button" data-drop="${i}">빼기</button></div></div></li>`;
    }).join("")}</ol>
    <button type="button" class="addbtn" data-addplace>+ 가고 싶은 곳 넣기</button>
    ${c.done ? `<div class="notes">${["a", "b"].map(w => `<div class="note ${w}"><span class="by ${w}">${esc(name(w))}</span><p>${esc(c.notes?.[w] || "아직 한 줄이 없어요")}</p></div>`).join("")}</div>` : ""}
    <div class="acts course-acts">${draft
      ? `<button type="button" class="big ghost" data-again>다시 짜기</button><button type="button" class="big" data-keep>이걸로 정하기</button>`
      : `<button type="button" class="del" data-cdel>지우기</button><button type="button" class="big ghost" data-again>다시 짜기</button><button type="button" class="big" data-done>${c.done ? "한 줄 고치기" : "다녀왔어요"}</button>`}</div>`;
  drawMap(c);
  ensureMeet(c);
}
const clean = s => String(s).replace(/[,/]/g, " ");
const routeUrl = (a, b, mode) => `https://map.kakao.com/link/by/${mode === "walk" ? "walk" : "traffic"}/${encodeURIComponent(clean(a.name))},${a.lat},${a.lng}/${encodeURIComponent(clean(b.name))},${b.lat},${b.lng}`;

let map = null, drawn = [], drawId = 0, drawnSig = "";
async function drawMap(c) {
  const css = getComputedStyle(document.documentElement), acc = css.getPropertyValue("--acc-ink").trim(), soft = css.getPropertyValue("--soft").trim();
  const sig = c.stops.map(s => `${s.lat},${s.lng}`).join("|") + acc + (c.meet ? c.meet.name : "");
  if (map && sig === drawnSig) return map.relayout();
  const my = ++drawId;
  let k;
  try { k = await kakaoReady(); } catch { $("map").innerHTML = `<p class="maperr">지도를 불러오지 못했어요</p>`; return; }
  if (my !== drawId) return;
  drawnSig = sig;
  if (!map) map = new k.maps.Map($("map"), { center: new k.maps.LatLng(37.55, 126.99), level: 6 });
  map.relayout();
  drawn.forEach(o => o.setMap(null)); drawn = [];
  const bounds = new k.maps.LatLngBounds(), L = s => new k.maps.LatLng(s.lat, s.lng);
  c.stops.forEach((s, i) => {
    const el = document.createElement("button");
    el.type = "button"; el.className = "pin"; el.innerHTML = `<span>${i + 1}</span>`; el.onclick = () => focusStop(i);
    drawn.push(new k.maps.CustomOverlay({ position: L(s), content: el, yAnchor: 1.1, zIndex: 3, map }));
    bounds.extend(L(s));
  });
  if (c.meet && c.stops[0]) {
    const el = document.createElement("div"); el.className = "startpin"; el.textContent = `출발 · ${c.meet.name}`;
    drawn.push(new k.maps.CustomOverlay({ position: L(c.meet), content: el, yAnchor: 1.4, zIndex: 4, map }));
    const first = c.stops[0], line = new k.maps.Polyline({ map, path: [L(c.meet), L(first)], strokeWeight: 4, strokeColor: soft, strokeOpacity: .9, strokeStyle: "shortdot" });
    drawn.push(line); bounds.extend(L(c.meet));
    walkPath(c.meet, first).then(p => { if (p && my === drawId) line.setPath([L(c.meet), ...p.map(([lat, lng]) => new k.maps.LatLng(lat, lng)), L(first)]); });
  }
  const fit = () => { map.relayout(); if (c.stops.length) map.setBounds(bounds, 40, 30, 40, 30); };
  fit(); requestAnimationFrame(fit); setTimeout(fit, 350);
  for (let i = 1; i < c.stops.length; i++) {
    const a = c.stops[i - 1], b = c.stops[i], walk = c.legs[i]?.mode === "walk";
    const line = new k.maps.Polyline({ map, path: [L(a), L(b)], strokeWeight: walk ? 5 : 4, strokeColor: walk ? acc : soft, strokeOpacity: .85, strokeStyle: walk ? "solid" : "shortdash" });
    drawn.push(line);
    if (walk) walkPath(a, b).then(p => { if (p && my === drawId) line.setPath([L(a), ...p.map(([lat, lng]) => new k.maps.LatLng(lat, lng)), L(b)]); });
  }
}
function focusStop(i) {
  const el = document.querySelector(`.stop[data-i="${i}"]`); if (!el) return;
  el.scrollIntoView({ behavior: calm.matches ? "auto" : "smooth", block: "center" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
}

/* ---------- 아래 창 ---------- */
const sheet = $("sheet"), sheetForm = $("sheetForm");
let onSheetSubmit = null;
function openSheet(html, onSubmit, init) {
  sheetForm.innerHTML = html; onSheetSubmit = onSubmit; init?.(); sheet.showModal();
}
function closeSheet() {
  if (calm.matches || !sheet.animate) return sheet.close();
  sheet.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(60px)", opacity: 0 }], { duration: 200, easing: "ease-in" })
    .finished.then(() => sheet.close());
}
sheetForm.addEventListener("submit", e => { e.preventDefault(); if (onSheetSubmit?.() !== false) closeSheet(); });
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
function seg(box, attr) {
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    box.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    box.dataset.v = b.dataset[attr];
  });
}

const TIMES = Array.from({ length: 41 }, (_, i) => H(6) + i * 30);
const tLabel = m => m >= H(24) ? `새벽 ${hm(m)}` : hm(m);
function openPlanSheet(date, base) {
  const last = store.get("urigil-last") || {};
  const prefs = base?.prefs || store.get("urigil-prefs") || ["meal", "cafe", "play", "photo", "walk"];
  const from = base?.from ?? last.from ?? H(13), to = base?.to ?? last.to ?? H(20);
  openSheet(`<h3>데이트 짜기</h3>
    <label>날짜 <input type="date" id="pD" required></label>
    <div class="two"><label>몇 시부터 <select id="pF">${TIMES.slice(0, -2).map(m => `<option value="${m}">${tLabel(m)}</option>`).join("")}</select></label>
      <label>몇 시까지 <select id="pT">${TIMES.slice(2).map(m => `<option value="${m}">${tLabel(m)}</option>`).join("")}</select></label></div>
    <span class="flabel">하고 싶은 것</span>
    <div class="chipset" id="pP">${PREFS.map(([k, l]) => `<button type="button" data-p="${k}" class="${prefs.includes(k) ? "on" : ""}">${ICON[k]} ${l}</button>`).join("")}</div>
    <span class="flabel">동네</span>
    <div class="chipset one" id="pA"><button type="button" data-a="" class="on">알아서</button>${Object.entries(AREAS).map(([id, a]) => `<button type="button" data-a="${id}">${a.name}</button>`).join("")}</div>
    <div class="acts"><button class="big" type="submit">짜 줘</button></div>`,
  () => {
    const f = +$("pF").value, t = +$("pT").value;
    if (t - f < 60) { toast("한 시간은 넘게 잡아 주세요"); return false; }
    const ps = [...$("pP").querySelectorAll(".on")].map(b => b.dataset.p);
    store.set("urigil-prefs", ps); store.set("urigil-last", { from: f, to: t });
    makeCourse({ date: $("pD").value, from: f, to: t, prefs: ps, area: $("pA").querySelector(".on").dataset.a || null, replaces: base?.id || null });
  }, () => {
    $("pD").value = date; $("pF").value = from; $("pT").value = to;
    $("pP").addEventListener("click", e => { const b = e.target.closest("button"); if (b) b.classList.toggle("on"); });
    $("pA").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $("pA").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    if (base?.area) $("pA").querySelector(`[data-a="${base.area}"]`)?.click();
  });
}
async function makeCourse(opts) {
  S.busy = true; S.view = "draft"; showTab("course");
  try {
    const c = await plan(opts);
    if (c.stops.length < 2) throw new Error("few");
    S.draft = c;
  } catch (e) {
    S.view = opts.replaces || null;
    toast(e?.message === "few" ? "코스를 못 짰어요. 시간을 늘리거나 동네를 바꿔 보세요." : "장소를 찾지 못했어요. 인터넷을 확인해 주세요.");
  }
  S.busy = false; renderCourse(); appear($("tab-course"));
}
function eventFor(c) {
  return { title: `${AREAS[c.area]?.name} 데이트`, date: c.date, end: "", time: c.from < H(24) ? hm(c.from) : "", who: "both",
           memo: c.stops.map(s => s.name).join(" → ").slice(0, 80) };
}
async function keepDraft() {
  const c = S.draft; if (!c) return;
  const data = { date: c.date, from: c.from, to: c.to, meet: c.meet || null, area: c.area, area2: c.area2 || null, prefs: c.prefs, picked: c.picked || null,
                 weather: c.weather, stops: c.stops, legs: c.legs, done: false, by: S.me, at: Date.now() };
  try {
    if (c.replaces && S.courses.some(x => x.id === c.replaces)) {
      const old = S.courses.find(x => x.id === c.replaces);
      await updateDoc(ref("courses", c.replaces), { ...data, done: old.done || false });
      if (old.eventId) updateDoc(ref("events", old.eventId), eventFor(c)).catch(() => {});
      S.view = c.replaces;
    } else {
      const d = doc(col("courses")), ev = doc(col("events"));
      await setDoc(d, { ...data, eventId: ev.id });
      setDoc(ev, { ...eventFor(c), by: S.me, at: Date.now(), course: d.id }).catch(() => {});
      S.view = d.id;
    }
    S.draft = null; toast("저장했어요");
    S.sel = c.date; const dt = parse(c.date); S.y = dt.getFullYear(); S.m = dt.getMonth();
    render();
  } catch { fail(); }
}
function saveCourse(c) {
  if (S.view === "draft") return renderCourse();
  updateDoc(ref("courses", c.id), { stops: c.stops, legs: c.legs }).catch(fail);
  if (c.eventId) updateDoc(ref("events", c.eventId), { memo: eventFor(c).memo }).catch(() => {});
  renderCourse();
}
function openDone(c) {
  openSheet(`<h3>${esc(areaName(c))}, 어땠어요?</h3>
    <label>내 한 줄 <input id="dN" maxlength="60" autocomplete="off" placeholder="오늘 제일 좋았던 것"></label>
    <div class="acts">${c.done ? `<button type="button" class="del" id="dUndo">아직 안 갔어요</button>` : ""}<button class="big" type="submit">남기기</button></div>`,
  () => {
    updateDoc(ref("courses", c.id), { done: true, [`notes.${S.me}`]: $("dN").value.trim() }).catch(fail);
    toast("남겼어요");
  }, () => {
    $("dN").value = c.notes?.[S.me] || "";
    $("dUndo")?.addEventListener("click", () => { updateDoc(ref("courses", c.id), { done: false }).catch(fail); closeSheet(); });
  });
}
function openAddPlace(c) {
  openSheet(`<h3>가고 싶은 곳 넣기</h3>
    <div class="inline"><input id="qIn" required maxlength="40" autocomplete="off" placeholder="가게·장소 이름"><button class="add" type="submit">찾기</button></div>
    <div class="results" id="qRes"></div>`,
  () => {
    const q = $("qIn").value.trim(); if (!q) return false;
    const at = c.stops[0];
    $("qRes").innerHTML = `<p class="empty">찾는 중…</p>`;
    kSearch(q, at, 8000).then(r => r.length ? r : kSearch(q)).then(r => {
      $("qRes").innerHTML = r.length ? r.slice(0, 8).map((p, i) => `<button type="button" data-r="${i}"><b>${esc(p.name)}</b><small>${esc(p.addr)}</small></button>`).join("") : `<p class="empty">찾지 못했어요. 이름을 바꿔 보세요.</p>`;
      $("qRes").onclick = e => {
        const b = e.target.closest("[data-r]"); if (!b) return;
        const p = r[+b.dataset.r];
        const st = { id: p.id, name: p.name, type: "pick", lat: p.lat, lng: p.lng, url: p.url, addr: p.addr, cat: p.cat.split(">").pop().trim(), t: 0, stay: 40, likes: { [S.me]: true } };
        let best = c.stops.length, bestD = Infinity;
        for (let i = 0; i <= c.stops.length; i++) {
          const a = c.stops[i - 1], z = c.stops[i];
          const d = (a ? dist(a, st) : 0) + (z ? dist(st, z) : 0) - (a && z ? dist(a, z) : 0);
          if (d < bestD) { bestD = d; best = i; }
        }
        c.stops.splice(best, 0, st); retime(c); saveCourse(c); closeSheet(); toast("넣었어요");
      };
    });
    return false;
  }, () => $("qIn").focus());
}

/* ---------- 화면 고르기 ---------- */
const SKINS = { sky: ["남자친구", "#E2EEFF"], pink: ["여자친구", "#FFE6EE"], lav: ["함께", "#EDE6FF"], kitty: ["헬로키티", "#FFE9EF"] };
const SKIN_KEY = "urigil-skin";
const skinFor = me => (me === "a" ? "sky" : "pink");
function getSkin() { const v = store.get(SKIN_KEY); return SKINS[v] ? v : skinFor(S.me); }
function applySkin(skin) {
  document.documentElement.dataset.skin = skin;
  document.querySelector('meta[name="theme-color"]').content = SKINS[skin][1];
  if (skin === "kitty") watchPhotos();
  if (S.info) { renderHead(); renderUs(); if (!$("tab-course").hidden) renderCourse(); }
}
function openSkins() {
  const cur = document.documentElement.dataset.skin;
  openSheet(`<h3>화면 고르기</h3>
    <div class="skins">${Object.entries(SKINS).map(([k, [label]]) =>
      `<button type="button" class="skin-card ${k}${k === cur ? " on" : ""}" data-skin="${k}"><span class="sw"></span>${label}</button>`).join("")}</div>`, null, () => {
    sheetForm.querySelector(".skins").addEventListener("click", e => {
      const b = e.target.closest("[data-skin]"); if (!b) return;
      store.set(SKIN_KEY, b.dataset.skin); applySkin(b.dataset.skin);
      b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    });
  });
}
/* 키티 화면: 우리달과 같은 사진첩(rooms/{코드}/photos) */
let photoUnsub = null;
const PIC_KEY = "urigil-pic";
function curPhoto() {
  const ph = S.photos; if (!ph.length) return null;
  const id = store.get(PIC_KEY);
  return ph.find(p => p.id === id) || ph[Math.abs(diff("2026-01-01", today())) % ph.length];
}
function watchPhotos() {
  if (photoUnsub || !S.room) return;
  photoUnsub = onSnapshot(col("photos"), s => {
    S.photos = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((x, y) => (x.at || 0) - (y.at || 0));
    if (S.info) { renderHead(); renderUs(); }
  });
  S.unsub.push(photoUnsub);
}
async function shrink(file) {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 640 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const g = c.getContext("2d"); g.drawImage(img, 0, 0, c.width, c.height);
  let url = c.toDataURL("image/webp", .8);
  if (!url.startsWith("data:image/webp")) { g.globalCompositeOperation = "destination-over"; g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); url = c.toDataURL("image/jpeg", .82); }
  return url;
}

/* ---------- 방 들어가기 ---------- */
function enter(room, me) {
  S.room = room; S.me = me; store.set(KEY, { room, me }); applySkin(getSkin());
  $("setup").hidden = true; $("boot").hidden = false;
  const slow = setTimeout(() => { toast("연결이 느려요. 잠시만요…"); $("bootReset").hidden = false; }, 8000);
  S.unsub.push(onSnapshot(doc(db, "rooms", room), s => {
    if (!s.exists()) { if (!s.metadata.fromCache) { toast("방을 찾을 수 없어요."); leave(); } return; }
    clearTimeout(slow);
    S.info = s.data();
    if (!$("boot").hidden) { $("boot").hidden = true; $("app").hidden = false; render(); appear($("app")); }
    else render();
  }, err => { clearTimeout(slow); toast(`불러오지 못했어요 (${err.code})`); $("bootReset").hidden = false; }));
  S.unsub.push(onSnapshot(col("courses"), s => {
    S.courses = s.docs.map(d => ({ id: d.id, ...d.data() }));
    if (S.view && S.view !== "draft" && !S.courses.some(c => c.id === S.view)) S.view = null;
    render();
  }));
  kakaoReady().catch(() => {});
}
function leave() { S.unsub.forEach(u => u()); store.set(KEY, null); location.reload(); }
function openRoom() {
  openSheet(`<h3>커플 코드</h3>
    <output class="code">${S.room}</output>
    <button type="button" class="pill wide" data-r="share">링크 보내기</button>
    <button type="button" class="link danger" data-r="reset">초기화 (처음 화면으로)</button>`, null, () => {
    sheetForm.querySelector("[data-r=share]").onclick = () => share(S.room);
    sheetForm.querySelector("[data-r=reset]").onclick = e => { if (armed(e.currentTarget)) leave(); };
  });
}
async function share(code) {
  const url = link(code);
  if (navigator.share) {
    try { await navigator.share({ title: "우리길", text: "우리 데이트 코스 같이 보자", url }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("링크를 복사했어요"); }
  catch { toast("코드를 길게 눌러 복사해 주세요"); }
}

/* ---------- 처음 화면 ---------- */
const STEPS = ["setupChoose", "newForm", "shareBox", "joinForm", "pickBox"];
const step = id => { STEPS.forEach(s => ($(s).hidden = s !== id)); appear($(id)); };
seg($("nMe"), "w");
$("nMe").addEventListener("click", () => applySkin(skinFor($("nMe").dataset.v)));
document.querySelectorAll(".back").forEach(b => b.addEventListener("click", () => { delete document.documentElement.dataset.skin; step("setupChoose"); }));
$("goNew").onclick = () => { applySkin(skinFor($("nMe").dataset.v || "a")); step("newForm"); $("nA").focus(); };
$("goJoin").onclick = () => { step("joinForm"); $("jCode").focus(); };
$("newForm").addEventListener("submit", async e => {
  e.preventDefault();
  const code = newCode(), btn = e.submitter;
  btn.disabled = true;
  try {
    await setDoc(doc(db, "rooms", code), { a: { name: $("nA").value.trim() }, b: { name: $("nB").value.trim() }, start: $("nStart").value, at: Date.now() });
    $("shareCode").textContent = code;
    $("copyLink").onclick = () => share(code);
    const me = $("nMe").dataset.v || "a";
    $("startApp").onclick = () => enter(code, me);
    step("shareBox");
  } catch { fail(); }
  btn.disabled = false;
});
$("joinForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = $("jErr"), code = normCode($("jCode").value);
  err.hidden = true;
  if (!code) { err.textContent = "코드는 영문·숫자 20글자예요."; err.hidden = false; return; }
  try {
    const s = await getDoc(doc(db, "rooms", code));
    if (!s.exists()) { err.textContent = "그런 코드가 없어요. 다시 확인해 주세요."; err.hidden = false; return; }
    const info = s.data();
    $("pickWho").innerHTML = ["a", "b"].map(w => `<button type="button" class="${w}" data-w="${w}"><small>${w === "a" ? "남자친구" : "여자친구"}</small>${esc(info[w]?.name)}</button>`).join("");
    $("pickWho").onclick = ev => { const b = ev.target.closest("button"); if (b) enter(code, b.dataset.w); };
    step("pickBox");
  } catch { err.textContent = "연결하지 못했어요. 인터넷을 확인해 주세요."; err.hidden = false; }
});

/* ---------- 앱 동작 ---------- */
document.querySelector(".tabbar").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showTab(b.dataset.tab); });
function showTab(t) {
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  ["cal", "course", "us"].forEach(x => ($(`tab-${x}`).hidden = x !== t));
  scrollTo({ top: 0, behavior: "instant" });
  if (t === "course") {
    if (!S.view && !S.busy) { const n = upcomingCourse(); if (n) S.view = n.id; }
    renderCourse();
  }
  appear($(`tab-${t}`));
}
let monthOut = null;
function goMonth(dm, from = 0) {
  const d = new Date(S.y, S.m + dm, 1); S.y = d.getFullYear(); S.m = d.getMonth();
  const g = $("grid");
  if (calm.matches || !g.animate) return renderCal();
  monthOut?.cancel();
  monthOut = g.animate([{ transform: `translateX(${from}px)`, opacity: 1 }, { transform: `translateX(${-dm * 28}px)`, opacity: 0 }], { duration: 120, easing: "ease-in", fill: "forwards" });
  monthOut.onfinish = () => { monthOut.cancel(); monthOut = null; renderCal(); appear(g, dm * 28); appear($("mTitle"), dm * 12); };
}
$("prevM").onclick = () => goMonth(-1);
$("nextM").onclick = () => goMonth(1);
$("todayBtn").onclick = () => { const t = new Date(); S.y = t.getFullYear(); S.m = t.getMonth(); S.sel = today(); renderCal(); renderAgenda(); };
let tx = null, ty = 0, drag = 0;
$("grid").addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; drag = 0; }, { passive: true });
$("grid").addEventListener("touchmove", e => {
  if (tx === null || calm.matches) return;
  const dx = e.touches[0].clientX - tx;
  if (Math.abs(dx) < Math.abs(e.touches[0].clientY - ty)) return;
  drag = dx * .5; $("grid").style.transform = `translateX(${drag}px)`;
}, { passive: true });
$("grid").addEventListener("touchcancel", () => { tx = null; $("grid").style.transform = ""; });
$("grid").addEventListener("touchend", e => {
  if (tx === null) return;
  const g = $("grid"), t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  tx = null; g.style.transform = "";
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) goMonth(dx < 0 ? 1 : -1, drag);
  else if (drag && g.animate) g.animate([{ transform: `translateX(${drag}px)` }, { transform: "none" }], { duration: 200, easing: "ease-out" });
});
$("grid").addEventListener("click", e => {
  const b = e.target.closest(".day"); if (!b) return;
  S.sel = b.dataset.d;
  const d = parse(S.sel);
  if (d.getMonth() !== S.m) { S.y = d.getFullYear(); S.m = d.getMonth(); }
  renderCal(); renderAgenda(); appear($("agenda"));
});
function openCourse(id) { S.view = id; showTab("course"); }
$("agenda").addEventListener("click", e => {
  const c = e.target.closest("[data-c]"); if (c) return openCourse(c.dataset.c);
  if (e.target.closest("[data-plan]")) openPlanSheet(S.sel);
});
$("courseList").addEventListener("click", e => { const c = e.target.closest("[data-c]"); if (c) openCourse(c.dataset.c); });
$("tab-course").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const c = viewCourse();
  if (b.dataset.plan !== undefined) return openPlanSheet(S.sel >= today() ? S.sel : today());
  if (!c) return;
  if (b.dataset.like !== undefined) {
    const s = c.stops[+b.dataset.like]; s.likes = { ...s.likes, [S.me]: !s.likes?.[S.me] };
    return S.view === "draft" ? renderCourse() : updateDoc(ref("courses", c.id), { stops: c.stops }).catch(fail);
  }
  if (b.dataset.swap !== undefined) {
    b.disabled = true; b.textContent = "찾는 중";
    const ok = await swapStop(c, +b.dataset.swap).catch(() => false);
    if (ok) { saveCourse(c); toast("바꿨어요"); } else { b.disabled = false; b.textContent = "바꾸기"; toast("근처에 다른 곳이 없어요"); }
    return;
  }
  if (b.dataset.drop !== undefined) {
    if (c.stops.length <= 1) return toast("한 곳은 남겨 주세요");
    if (!armed(b)) return;
    c.stops.splice(+b.dataset.drop, 1); retime(c); saveCourse(c); return;
  }
  if (b.dataset.addplace !== undefined) return openAddPlace(c);
  if (b.dataset.again !== undefined) return makeCourse({ date: c.date, from: c.from, to: c.to, prefs: c.prefs || [], area: c.picked || null, replaces: c.replaces || (S.view !== "draft" ? c.id : null) });
  if (b.dataset.keep !== undefined) return keepDraft();
  if (b.dataset.done !== undefined) return openDone(c);
  if (b.dataset.cdel !== undefined) {
    if (!armed(b)) return;
    deleteDoc(ref("courses", c.id)).catch(fail);
    if (c.eventId) deleteDoc(ref("events", c.eventId)).catch(() => {});
    S.view = null; toast("지웠어요");
  }
});
$("saveSet").onclick = () => {
  const a = $("sA").value.trim(), b = $("sB").value.trim();
  if (!a || !b) return toast("이름을 모두 적어 주세요");
  updateDoc(doc(db, "rooms", S.room), { "a.name": a, "b.name": b }).catch(fail);
  toast("저장했어요");
};
$("sCopy").onclick = () => share(S.room);
$("leave").onclick = e => { if (armed(e.currentTarget)) leave(); };
$("skinBtn").onclick = openSkins;
$("skinBtn2").onclick = openSkins;
$("codeBtn").onclick = openRoom;
$("bootReset").onclick = leave;
$("hPic").onclick = () => {
  if (!S.photos.length) { showTab("us"); return $("album").scrollIntoView({ behavior: "smooth" }); }
  const ph = S.photos; store.set(PIC_KEY, ph[(ph.indexOf(curPhoto()) + 1) % ph.length].id);
  renderHead(); renderUs(); appear($("hPic"));
};
$("picIn").addEventListener("change", async e => {
  const files = [...e.target.files].slice(0, Math.max(0, 30 - S.photos.length));
  e.target.value = "";
  if (!files.length) return toast("사진은 30장까지 넣을 수 있어요");
  toast("사진 넣는 중…");
  let last;
  for (const f of files) {
    last = doc(col("photos"));
    try { await setDoc(last, { data: await shrink(f), by: S.me, at: Date.now() }); } catch { return toast("사진을 넣지 못했어요"); }
  }
  store.set(PIC_KEY, last.id); renderHead(); renderUs(); toast("사진을 넣었어요");
});
$("picList").addEventListener("click", e => {
  const b = e.target.closest("[data-pic], [data-pdel]"); if (!b) return;
  if (b.dataset.pic) { store.set(PIC_KEY, b.dataset.pic); renderHead(); renderUs(); scrollTo({ top: 0, behavior: "smooth" }); }
  else if (armed(b)) deleteDoc(ref("photos", b.dataset.pdel)).catch(fail);
});

let installEv = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEv = e; $("installBtn").hidden = false; });
$("installBtn").onclick = async () => { if (!installEv) return; installEv.prompt(); await installEv.userChoice; installEv = null; $("installBtn").hidden = true; };
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
$("iosHint").hidden = !(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- 시작 ---------- */
const saved = store.get(KEY);
const hashCode = normCode(decodeURIComponent(location.hash.slice(1)));
if (location.hash) history.replaceState(null, "", location.pathname);
if (saved?.room && (!hashCode || hashCode === saved.room)) enter(saved.room, saved.me);
else {
  $("boot").hidden = true; $("setup").hidden = false;
  if (hashCode) { step("joinForm"); $("jCode").value = hashCode; }
  else step("setupChoose");
}
