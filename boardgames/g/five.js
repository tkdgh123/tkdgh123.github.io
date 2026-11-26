// 5초 안에 셋 — 주제가 나오면 5초 안에 그 주제에 맞는 낱말 셋을 소리 내어 말한다. 나머지가 인정하면 카드를 가져감 (3~10명)
// 실패하면 다음 사람에게 기회(앞사람 답은 다시 못 씀). 모두 실패하면 처음 사람이 가져감. 카드 7장 먼저 모으면 이김. 말로 하는 게임이라 봇 없음.
import { esc, shuffle, SEAT, logPush, nameB } from "../lib.js";

export const TOPICS = `빨간 과일|날개 달린 것|바다에 사는 동물|편의점에서 파는 것|노래 제목|겨울에 입는 옷|라면 이름|축구 선수|아이돌 그룹|색깔 이름|나라 이름|수도 이름|채소|학교에 있는 것|부엌에 있는 것|욕실에 있는 것|동물원 동물|곤충|새 이름|꽃 이름|과자 이름|아이스크림 이름|음료수|빵 종류|김밥 재료|떡볶이에 넣는 것|치킨 브랜드|카페 메뉴|술 종류|운동 종목|올림픽 종목|악기|직업|병원 과|지하철역 이름|서울 동네 이름|대학교 이름|만화 주인공|디즈니 캐릭터|포켓몬|게임 이름|영화 제목|드라마 제목|가수 이름|배우 이름|개그맨|유튜버|앱 이름|자동차 회사|휴대폰 회사|옷 브랜드|신발 브랜드|문구류|가방 안에 있는 것|여행 갈 때 챙기는 것|캠핑 장비|놀이공원 놀이기구|생일에 받는 선물|크리스마스에 생각나는 것|여름에 생각나는 것|비 오는 날 생각나는 것|무서운 것|둥근 것|네모난 것|뾰족한 것|부드러운 것|딱딱한 것|냄새나는 것|소리가 큰 것|무거운 것|하늘을 나는 것|물에 뜨는 것|전기로 움직이는 것|바퀴 달린 것|다리가 넷인 것|털이 있는 동물|알을 낳는 동물|밤에 활동하는 동물|공룡 이름|별자리|행성|날씨 표현|감정 표현|욕 말고 화날 때 하는 말|인사말|사투리|속담|사자성어|한글 자음으로 시작하는 과일|ㄱ으로 시작하는 낱말|ㅂ으로 시작하는 음식|세 글자 동물|두 글자 나라|영어로 된 과자|노래방 애창곡|수업 과목|시험 볼 때 필요한 것|교실에서 하는 놀이|어릴 때 한 놀이|명절 음식|제사상에 올리는 것|한국 전통 놀이|한복 입을 때 하는 것|김치 종류|국 종류|찌개 종류|면 요리|중국집 메뉴|일식 메뉴|패스트푸드 메뉴|길거리 음식|매운 음식|단 음식|신 음식|아침에 먹는 것|야식|다이어트 음식|헬스장 운동|요가 자세|춤 이름|미술 도구|그림 그릴 때 쓰는 것|사진 찍을 때 하는 포즈|SNS 이름|컴퓨터 부품|코딩 언어|수학 용어|과학자 이름|발명품|역사 속 왕|위인|화폐 속 인물|한국 산 이름|한국 섬 이름|바다 이름|강 이름|유명한 건물|세계 여행지|공항 이름|비행기 탈 때 챙기는 것|호텔에 있는 것|병원에 있는 것|은행에서 하는 일|마트 코너|문방구에서 파는 것|다이소에서 파는 것|생활용품|청소 도구|세탁할 때 쓰는 것|화장품|머리 스타일|손에 끼는 것|목에 거는 것|발에 신는 것|모자 종류|안경 쓰는 캐릭터|빨간색 캐릭터|노란색 물건|초록색 물건|파란색 음식|하얀 음식|검은 음식`.split("|");
const WIN = 7, TIME = 5000, JUDGE = 15000;

function nextAsk(s, now) {
  s.phase = "ready"; s.deadline = null; s.votes = {};
}
function award(s, p) { s.won[p]++; logPush(s, { k: "win", s: p, q: s.q }); s.q = s.deck.pop(); s.tried = []; s.first = (s.first + 1) % s.n; s.cur = s.first; }

export default {
  id: "five", name: "5초 안에 셋", color: "#d9472b", min: 3, max: 10, time: "15분", party: true,
  sub: "주제가 나오면 5초 안에 맞는 낱말 셋을 소리 내어 말해요. 나머지가 인정하면 카드를 가져가요",
  setup(n, rng) { const deck = shuffle([...TOPICS], rng); return { n, deck, q: deck.pop(), first: 0, cur: 0, tried: [], won: Array(n).fill(0), swap: Array(n).fill(1), phase: "ready", deadline: null, votes: {}, log: [], done: false }; },
  view(s) { const { deck, ...r } = s; return { ...JSON.parse(JSON.stringify(r)), q: s.phase === "ready" ? null : s.q, left: deck.length, turn: this.turn(s) }; },
  turn(s) {
    if (s.done) return [];
    if (s.phase === "judge") return [...Array(s.n).keys()].filter(p => p !== s.cur && !(p in s.votes));
    return [s.cur];
  },
  apply(s, seat, a, ctx) {
    if (s.done) throw new Error("판이 끝났어요");
    if (s.phase === "ready") {
      if (seat !== s.cur) throw new Error("대답할 사람이 시작해요");
      if (a.t === "swap") { if (!s.swap[seat] || s.tried.length) throw new Error("문제 바꾸기는 한 판에 한 번, 처음 사람만"); s.swap[seat]--; s.q = s.deck.pop() || s.q; logPush(s, { k: "swap", s: seat }); return; }
      if (a.t !== "go") throw new Error("시작을 눌러요");
      s.phase = "talk"; s.deadline = ctx.now + TIME; return;
    }
    if (s.phase === "talk") {
      if (seat !== s.cur || a.t !== "said") throw new Error("말하는 중이에요");
      s.phase = "judge"; s.deadline = ctx.now + JUDGE; s.votes = {}; return;
    }
    if (s.phase === "judge") {
      if (seat === s.cur || a.t !== "vote" || seat in s.votes) throw new Error("다른 사람이 인정할지 정해요");
      s.votes[seat] = !!a.ok;
      if (Object.keys(s.votes).length >= s.n - 1) this.judge(s, ctx);
      return;
    }
    throw new Error("지금은 할 수 없어요");
  },
  judge(s, ctx) {
    const v = Object.values(s.votes), ok = v.filter(Boolean).length * 2 >= v.length;
    logPush(s, { k: ok ? "ok" : "no", s: s.cur });
    if (ok) award(s, s.cur);
    else {
      s.tried.push(s.cur);
      const nx = (s.cur + 1) % s.n;
      if (s.tried.length >= s.n || nx === s.first) award(s, s.first); // 모두 실패: 처음 사람이 가져감
      else s.cur = nx;
    }
    if (Math.max(...s.won) >= WIN || !s.q) { s.done = true; return; }
    nextAsk(s, ctx.now);
    // 같은 문제로 다음 사람에게 넘어가면 바로 시작
    if (!ok && s.tried.length) { s.phase = "talk"; s.deadline = ctx.now + TIME + 1500; }
  },
  nextTick(s, now) { return s.deadline && !s.done ? s.deadline - now : null; },
  tick(s, ctx) {
    if (!s.deadline || ctx.now < s.deadline) return false;
    if (s.phase === "talk") { s.phase = "judge"; s.deadline = ctx.now + JUDGE; s.votes = {}; return true; }
    if (s.phase === "judge") { this.judge(s, ctx); return true; }
    return false;
  },
  over(s) {
    if (!s.done) return null;
    const o = [...Array(s.n).keys()].sort((a, b) => s.won[b] - s.won[a]);
    return { text: "카드를 가장 많이 모은 사람", rank: o.map((p, i) => [p, `${i + 1}등, ${s.won[p]}장`]) };
  },
  bot(s, seat, rng) {
    const d = { delay: 500 };
    if (s.phase === "judge") return { ...d, a: { t: "vote", ok: rng() < .6 } };
    if (seat !== s.cur) return null;
    if (s.phase === "ready") return { ...d, a: { t: "go" } };
    if (s.phase === "talk") return { delay: 1200, a: { t: "said" } };
  },
  render(el, v, me, send, ui) {
    const n = ui.names, my = v.cur === me, left = v.deadline ? Math.max(0, (v.deadline - Date.now()) / 1000) : 0;
    let body;
    if (v.done) body = `<p class="say">판이 끝났어요</p>`;
    else if (v.phase === "ready") body = my ? `<p class="say">내 차례예요. 준비되면 시작을 눌러요</p><div class="acts"><button class="go">시작</button>${v.swap[me] && !v.tried.length ? `<button class="ghost sw">문제 바꾸기 (${v.swap[me]})</button>` : ""}</div>` : `<p class="say">${esc(n[v.cur])}이(가) 준비 중</p>`;
    else if (v.phase === "talk") body = `<div class="topic"><small>주제</small><b>${esc(v.q)}</b></div><div class="clock" data-dl="${v.deadline}">${left.toFixed(1)}</div><p class="say">${my ? "셋을 소리 내어 말해요!" : `${esc(n[v.cur])}이(가) 말하는 중`}</p>${my ? `<div class="acts"><button class="sd">다 말했어요</button></div>` : ""}`;
    else body = `<div class="topic"><small>주제</small><b>${esc(v.q)}</b></div><p class="say">${my ? "다른 사람들이 인정할지 정하는 중" : `${esc(n[v.cur])}의 대답, 인정해요?`}</p>${!my && me >= 0 && !(me in v.votes) ? `<div class="acts"><button data-ok="1">인정</button><button class="ghost" data-ok="0">땡</button></div>` : ""}<p class="dim small">투표 ${Object.keys(v.votes).length}/${v.n - 1}</p>`;
    el.innerHTML = `<div class="five">${body}
      ${v.tried.length ? `<p class="dim small">이 문제에 실패한 사람: ${v.tried.map(p => esc(n[p])).join(", ")}</p>` : ""}
      <ol class="score">${v.won.map((w, p) => `<li style="--s:${SEAT[p]}" class="${p === v.cur ? "cur" : ""}"><b>${esc(n[p])}</b><span>${w}/${WIN}장</span></li>`).join("")}</ol>
      <p class="dim small">말로 하는 게임이에요. 같이 있거나 통화하면서 해요.</p>
      <ol class="log">${v.log.map(x => `<li>${nameB(n, x.s)} ${x.k === "win" ? `"${esc(x.q)}" 카드 가져감` : x.k === "ok" ? "인정!" : x.k === "no" ? "땡" : "문제 바꿈"}</li>`).join("")}</ol>
    </div>`;
    el.querySelector(".go")?.addEventListener("click", () => send({ t: "go" }));
    el.querySelector(".sw")?.addEventListener("click", () => send({ t: "swap" }));
    el.querySelector(".sd")?.addEventListener("click", () => send({ t: "said" }));
    el.querySelectorAll("[data-ok]").forEach(b => b.onclick = () => send({ t: "vote", ok: b.dataset.ok === "1" }));
    clearInterval(UI.t);
    const c = el.querySelector(".clock");
    if (c) UI.t = setInterval(() => { const t = Math.max(0, (+c.dataset.dl - Date.now()) / 1000); c.textContent = t.toFixed(1); c.classList.toggle("low", t < 2); if (!t) clearInterval(UI.t); }, 100);
  }
};
const UI = { t: 0 };
