// 하루 살기: 영어로 사는 이틀. 장면마다 그림 위에서 엿듣기 → 내 차례 → 수첩.
// 덩어리(chunk) = [영어, 뜻, 왜 이렇게 말하는지]
const CAFE = {
  who: "Leo", whoKo: "바리스타", pos: "62% 50%", voices: { them: "m", guest: "f" },
  // 움직이는 겹: 바리스타를 지운 배경 + 몸(숨 쉬듯) + 손(팔꿈치 축으로 인사) + 앞 메뉴판. 좌표는 원본 2752×1536 기준
  layers: { w: 2752, h: 1536, plate: "img/scenes/cafe/plate.webp", box: [1560, 340, 430, 455], body: "img/scenes/cafe/body.png", hand: "img/scenes/cafe/hand.png", pivot: [1650, 705], front: ["img/scenes/cafe/menu.png", 1800, 652, 172, 144] },
  overhear: [
    ["them", "Good morning! What can I get for you?"],
    ["guest", "Hi, can I get a hot latte, please?", [["can I get", "~ 주세요", "주문할 때 가장 흔한 말이에요. Give me보다 부드러워요."]]],
    ["them", "Sure. What size?"],
    ["guest", "A small one, please.", [["a small one", "작은 거", "one은 앞에서 말한 라테를 가리켜요. 같은 말을 또 하지 않아도 돼요."]]],
    ["them", "For here or to go?", [["for here or to go", "드시고 가세요, 가져가세요?", "카페에서 꼭 나오는 질문이에요. 대답은 For here / To go 한 마디면 돼요."]]],
    ["guest", "To go, please."],
    ["them", "That's four fifty. Here's your receipt.", [["four fifty", "4달러 50센트", "가격은 숫자를 둘로 끊어 읽어요."], ["receipt", "영수증", "p는 소리 없어요. '리싯'에 가까워요."]]]
  ],
  turns: [
    { say: "Next, please! Hi there, what can I get for you?", want: "아이스 아메리카노 하나 주문하기", need: [["아메리카노", ["americano"]]], hint: ["Can I get ~?", "Can I get an…", "Can I get an iced americano, please?"], model: "Can I get an iced americano, please?" },
    { say: "Sure! What size would you like?", want: "큰 걸로 달라고 하기", need: [["큰 것", ["large", "big", "grande", "venti"]]], hint: ["a ___ one", "A large…", "A large one, please."], model: "A large one, please." },
    { say: "For here or to go?", want: "가져갈 거라고 말하기", need: [["가져가기", ["to go", "take out", "takeout", "take it", "take away", "takeaway"]]], hint: ["To ~, please.", "To go…", "To go, please."], model: "To go, please." },
    { say: "That's five twenty. Cash or card?", want: "카드로 낸다고 하기", need: [["카드", ["card"]]], hint: ["Can I pay by ~?", "Can I pay…", "Can I pay by card?"], model: "Can I pay by card?" },
    { say: "Here you go! Would you like the receipt?", want: "영수증은 괜찮다고 거절하기", need: [["거절", ["no", "i'm good", "im good", "i'm fine", "im fine", "that's ok", "thats ok", "it's okay", "its okay", "nope"]]], hint: ["I'm ~, thanks.", "No, I'm…", "No, I'm good. Thanks!"], model: "No, I'm good. Thanks!", chunk: ["I'm good", "괜찮아요 (거절)", "No thanks보다 가볍고 자연스러운 거절이에요."] }
  ]
};
const DAYS = [
  { title: "1일째 · 도착한 날", scenes: [
    { id: "airport", time: "11:00", title: "공항 입국" },
    { id: "way", time: "13:00", title: "숙소 가는 길 묻기" },
    { id: "hotel", time: "15:00", title: "호텔 체크인" },
    { id: "dinner", time: "19:00", title: "저녁 식당 주문" },
    { id: "night1", time: "22:00", title: "친구에게 오늘 이야기", me: true }
  ] },
  { title: "2일째 · 평범한 하루", scenes: [
    { id: "cafe", time: "08:00", title: "아침 카페", img: "img/scenes/cafe-gemini.webp", ...CAFE },
    { id: "meetup", time: "10:00", title: "모임에서 자기소개" },
    { id: "pharmacy", time: "13:00", title: "약국" },
    { id: "helpway", time: "17:00", title: "길에서 도와주기" },
    { id: "night2", time: "22:00", title: "친구에게 오늘 이야기", me: true }
  ] }
];
const SCENE_LIST = DAYS.flatMap(d => d.scenes);
const ready = sc => !!sc.turns || sc.me;
// 시간에 따라 하늘색이 바뀐다 (그림이 아직 없는 장면의 바탕)
const skyOf = t => { const h = +t.slice(0, 2); return h < 10 ? "#f3ead2" : h < 15 ? "#dfe9e2" : h < 19 ? "#f2d6a8" : "#1f3a35" };

// ───── 하루 띠 ─────
function renderDay() {
  header();
  const nextId = SCENE_LIST.find(sc => ready(sc) && !S.visited[sc.id] && !sc.me)?.id;
  $("daystrip").innerHTML = DAYS.map(d => `<section class="dayrow"><h2>${d.title}</h2><div class="strip" tabindex="0" aria-label="${d.title} 장면들">${d.scenes.map(sc => {
    const been = S.visited[sc.id], isNext = sc.id === nextId, night = +sc.time.slice(0, 2) >= 19;
    const state = been ? "다녀왔어요" : sc.me ? (S.key ? "AI와 말하기" : "키를 넣으면 열려요") : ready(sc) ? (isNext ? "지금 갈 곳" : "갈 수 있어요") : "그림 준비 중";
    return `<button class="scard${isNext ? " next" : ""}${ready(sc) ? "" : " soon"}${night ? " night" : ""}" data-sc="${sc.id}" style="--sky:${skyOf(sc.time)}">
      <div class="pic">${sc.img ? `<img src="${sc.img}" alt="" loading="lazy" style="object-position:${sc.pos || "50% 50%"}">` : `<i class="ph-fill ${sc.me ? "ph-chats-circle" : "ph-sun-horizon"}"></i>`}${been ? `<span class="stamp"><i class="ph-fill ph-check-circle"></i></span>` : ""}</div>
      <div class="cap"><time>${sc.time}</time><b>${sc.title}</b><span>${state}</span></div></button>`;
  }).join("")}</div></section>`).join("");
  const nx = $("daystrip").querySelector(".scard.next");
  if (nx) nx.parentElement.scrollLeft = nx.offsetLeft - 20;
}
$("daystrip").onclick = e => {
  const b = e.target.closest("[data-sc]"); if (!b) return;
  const sc = SCENE_LIST.find(x => x.id === b.dataset.sc);
  if (sc.me) { S.scene = "auto"; save(); return nav("talk") }
  if (!ready(sc)) { fx("bad"); return toast("이 장면 그림을 준비하고 있어요") }
  openScene(sc);
};

// ───── 장면 ─────
let SC = null;
const PHASES = ["엿듣기", "내 차례", "수첩"];
function openScene(sc) {
  SC = { sc, phase: 0, line: 0, turn: 0, log: [], hint: 0, tries: 0, played: false };
  nav("scene"); buildStage(sc);
  $("sctitle").innerHTML = `<time>${sc.time}</time> ${sc.title}`;
  phase(0);
}
// 장면 그림: 겹이 있으면 사람만 살짝 움직이고, 없으면 그림 한 장
function buildStage(sc) {
  const L2 = sc.layers, el = $("scimg");
  if (!L2) { el.innerHTML = `<img src="${sc.img}" alt="">`; el.dataset.w = 16; el.dataset.h = 10; return fitStage() }
  const pc = (v, t) => (100 * v / t) + "%", [bx, by, bw, bh] = L2.box;
  el.dataset.w = L2.w; el.dataset.h = L2.h;
  el.innerHTML = `<img src="${L2.plate}" alt="">
    <div class="breath" style="left:${pc(bx, L2.w)};top:${pc(by, L2.h)};width:${pc(bw, L2.w)};height:${pc(bh, L2.h)}">
      <img src="${L2.body}" alt=""><img class="handwave" src="${L2.hand}" alt="" style="transform-origin:${pc(L2.pivot[0] - bx, bw)} ${pc(L2.pivot[1] - by, bh)}">
    </div>
    ${L2.front ? `<img class="front" src="${L2.front[0]}" alt="" style="left:${pc(L2.front[1], L2.w)};top:${pc(L2.front[2], L2.h)};width:${pc(L2.front[3], L2.w)};height:${pc(L2.front[4], L2.h)}">` : ""}`;
  fitStage();
}
// object-fit: cover 처럼 무대를 꽉 채우되, 사람 쪽(pos)이 보이게
function fitStage() {
  const el = $("scimg"), st = el?.parentElement; if (!el || !SC || !st.clientWidth) return;
  const W = st.clientWidth, H = st.clientHeight, A = el.dataset.w / el.dataset.h, [px, py] = (SC.sc.pos || "50% 50%").split(" ").map(v => parseFloat(v) / 100);
  const cw = W / H > A ? W : H * A, ch = cw / A;
  Object.assign(el.style, { width: cw + "px", height: ch + "px", left: (W - cw) * px + "px", top: (H - ch) * py + "px" });
}
addEventListener("resize", fitStage);
function phase(n) {
  SC.phase = n;
  $("scsteps").innerHTML = PHASES.map((p, i) => `<span class="${i === n ? "on" : i < n ? "done" : ""}">${p}</span>`).join("");
  $("scbubble").hidden = true; $("chunkcard").hidden = true;
  if (n === 0) overhear();
  if (n === 1) myTurn();
  if (n === 2) notebook();
}
const chunked = (en, chunks = []) => chunks.reduce((h, [c], i) => h.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), m => `<span class="chunk" role="button" tabindex="0" data-c="${i}">${m}</span>`), esc(en));
function bubble(who, en, ko) {
  const b = $("scbubble"); b.hidden = false; b.className = "bubble2 " + who;
  b.innerHTML = `<small>${who === "them" ? `${SC.sc.who} · ${SC.sc.whoKo}` : who === "guest" ? "앞 손님" : "나"}</small><span lang="en">${esc(en)}</span>${ko ? `<em>${esc(ko)}</em>` : ""}`;
  b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
}
// 1. 엿듣기: 점원과 앞 손님 대화가 흘러간다. 밑줄 덩어리를 누르면 뜻과 이유
async function overhear() {
  const lines = SC.sc.overhear;
  $("scpanel").innerHTML = `<p class="lead2">앞 손님이 주문하는 걸 엿들어요. 밑줄 친 말을 누르면 뜻이 나와요.</p><ol class="script" id="script"></ol>
    <div class="scfoot"><button class="btn ghost" id="replay"><i class="ph-fill ph-speaker-high"></i>다시 듣기</button><button class="btn" id="tome" disabled>내 차례 <i class="ph-bold ph-arrow-right"></i></button></div>`;
  $("replay").onclick = () => playScript();
  $("tome").onclick = () => phase(1);
  $("script").onclick = e => { const c = e.target.closest(".chunk"); if (!c) return; const li = c.closest("li"), ch = lines[+li.dataset.i][2][+c.dataset.c]; showChunk(ch) };
  $("script").onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".chunk")) { e.preventDefault(); e.target.click() } };
  playScript();
}
let playing = 0;
async function playScript() {
  const run = ++playing, lines = SC.sc.overhear;
  $("script").innerHTML = "";
  for (let i = 0; i < lines.length; i++) {
    if (run !== playing || SC?.phase !== 0) return;
    const [who, en, ch] = lines[i];
    $("script").insertAdjacentHTML("beforeend", `<li class="${who}" data-i="${i}"><small>${who === "them" ? SC.sc.who : "앞 손님"}</small><span lang="en">${chunked(en, ch)}</span></li>`);
    $("script").lastElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
    bubble(who, en);
    if (listenOn()) await speak(en, S.prefs.rate, SC.sc.voices[who]); else await new Promise(r => setTimeout(r, 900 + en.length * 25));
    await new Promise(r => setTimeout(r, 250));
  }
  if (run === playing) { $("tome").disabled = false; $("scbubble").hidden = true }
}
function showChunk([c, m, why]) {
  const k = $("chunkcard"); k.hidden = false;
  k.innerHTML = `<b lang="en">${esc(c)}</b><span>${esc(m)}</span><p>${esc(why)}</p><button class="say-mini" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button>`;
  k.querySelector("button").onclick = () => speak(c);
  speak(c);
}
// 2. 내 차례: 상대 말을 듣고, 한국어 '하고 싶은 말'만 보고 내가 직접 말한다
function myTurn() {
  const t = SC.sc.turns[SC.turn];
  if (!t) return phase(2);
  SC.hint = 0; SC.tries = 0;
  bubble("them", t.say);
  const typing = !speakOn();
  $("scpanel").innerHTML = `<div class="turnhead"><span>${SC.turn + 1} / ${SC.sc.turns.length}</span><button class="link" id="sayagain"><i class="ph-fill ph-speaker-high"></i> 다시 듣기</button></div>
    <p class="want"><small>하고 싶은 말</small>${esc(t.want)}</p>
    <p class="hintline" id="hintline" hidden></p>
    ${typing ? "" : `<button class="mic-big" id="scmic" aria-label="말하기"><i class="ph-fill ph-microphone"></i></button>`}
    <form class="type" id="sctype" ${typing ? "" : "hidden"}><input id="scin" lang="en" autocomplete="off" placeholder="영어로 쓰기"><button class="btn" style="min-height:46px;padding:0 16px">말하기</button></form>
    <p class="heardw" id="scheard" aria-live="polite"></p>
    <div class="scfoot"><button class="btn ghost" id="schint"><i class="ph-fill ph-lightbulb"></i>힌트</button>${typing ? "" : `<button class="btn ghost" id="sctyping"><i class="ph-bold ph-keyboard"></i>글로</button>`}</div>`;
  $("sayagain").onclick = () => { if (!recS) listenFirst(t.say) };
  $("schint").onclick = () => giveHint();
  if (!typing) { $("scmic").onclick = () => hearMe(); $("sctyping").onclick = () => { $("sctype").hidden = false; $("scin").focus() } }
  $("sctype").onsubmit = e => { e.preventDefault(); const v = $("scin").value.trim(); if (v && !SC.listening) judgeTurn(v) };
  listenFirst(t.say);
}
// 듣는 것도 공부: 상대 말이 다 나올 때까지 말하기·보내기를 잠근다
async function listenFirst(text) {
  const lock = on => { SC.listening = on; ["scmic", "sayagain"].forEach(id => { const b = $(id); if (b) b.disabled = on }); const s = $("sctype")?.querySelector("button"); if (s) s.disabled = on; $("scheard").textContent = on ? "끝까지 들어 보세요…" : "" };
  if (!listenOn()) return lock(false);
  lock(true);
  await speak(text, undefined, SC.sc.voices.them);
  if (SC) { lock(false); if (!speakOn()) $("scin")?.focus() }
}
function giveHint() {
  const t = SC.sc.turns[SC.turn]; SC.hint = Math.min(3, SC.hint + 1);
  const h = $("hintline"); h.hidden = false; h.innerHTML = `<i class="ph-fill ph-lightbulb"></i><span lang="en">${esc(t.hint[SC.hint - 1])}</span>`;
  if (SC.hint === 3) speak(t.hint[2]);
}
let recS = null;
function hearMe() {
  const b = $("scmic");
  if (SC.listening) return;
  if (recS) { const r = recS; recS = null; b.classList.remove("on"); b.setAttribute("aria-label", "말하기"); $("sayagain").disabled = false; try { r.stop() } catch { r.onend() } return }
  const got = []; let interim = "";
  const show = () => { $("scheard").textContent = [...got.map(a => a[0]), interim].join(" ").trim() || "듣는 중… 다 말하면 다시 눌러요" };
  const r = new Rec(); r.lang = "en-US"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
  r.onresult = e => { interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const res = e.results[i]; if (res.isFinal) got.push([...res].map(a => a.transcript.trim())); else interim += res[0].transcript } show() };
  r.onerror = e => { if (e.error === "not-allowed") { recS = null; b.classList.remove("on"); $("scheard").textContent = "마이크를 허용해 주세요. 글로 써도 돼요." } };
  // 브라우저가 조용하다고 멋대로 끝내도, 내가 다시 누르기 전까지는 이어서 듣는다
  r.onend = () => {
    if (recS === r) { try { r.start() } catch {} return }
    const base = got.map(a => a[0]).join(" "), tail = interim.trim();
    const said = [base, tail].filter(Boolean).join(" ").trim();
    if (!said) { $("scheard").textContent = "아무 말도 안 들렸어요. 다시 눌러 말해요."; return }
    const last = got.at(-1) || [], head = got.slice(0, -1).map(a => a[0]).join(" ");
    judgeTurn([said, ...last.slice(1).map(a => [head, a].filter(Boolean).join(" "))], true);
  };
  recS = r; r.start(); b.classList.add("on"); b.setAttribute("aria-label", "다 말했어요"); $("sayagain").disabled = true; show();
}
// 뜻이 통하는지: 필요한 덩어리가 들어 있으면 통과 (문장이 똑같을 필요 없음)
const normS = s => " " + s.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim() + " ";
function judgeTurn(input, spoken) {
  const t = SC.sc.turns[SC.turn], alts = Array.isArray(input) ? input : [input];
  const score = a => t.need.filter(([, any]) => any.some(w => normS(a).includes(" " + w + " "))).length;
  const said = alts.slice().sort((a, b) => score(b) - score(a))[0];
  const miss = t.need.filter(([, any]) => !any.some(w => normS(said).includes(" " + w + " ")));
  SC.tries++;
  if (miss.length) {
    fx("bad");
    $("scheard").innerHTML = `<span class="no2">"${esc(said)}"</span><br>${miss.map(([k]) => `'${k}'`).join(", ")} 부분이 안 들어갔어요`;
    if (SC.tries >= 2 && SC.hint < 2) giveHint();
    return;
  }
  fx("good");
  SC.log.push({ want: t.want, mine: said, model: t.model, hint: SC.hint, tries: SC.tries, chunk: t.chunk });
  const same = normS(said) === normS(t.model);
  $("scpanel").innerHTML = `<div class="okcard"><b><i class="ph-fill ph-check-circle"></i>통했어요</b><p class="mine" lang="en">${esc(said)}</p>${same ? "" : `<p class="better"><small>이렇게 말하면 더 자연스러워요</small><span lang="en">${esc(t.model)}</span><button class="say-mini" id="playmodel" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></p>`}</div>
    <div class="scfoot"><button class="btn" id="nextturn">${SC.turn + 1 < SC.sc.turns.length ? "다음" : "수첩 보기"} <i class="ph-bold ph-arrow-right"></i></button></div>`;
  if (!same) { $("playmodel").onclick = () => speak(t.model); speak(t.model) }
  $("nextturn").onclick = () => { SC.turn++; myTurn() };
  void spoken;
}
// 3. 수첩: 내가 한 말과 더 자연스러운 말. 힌트를 많이 쓴 말만 다음 날 한 번 더
function notebook() {
  $("scbubble").hidden = true;
  const chunks = SC.sc.overhear.flatMap(l => l[2] || []).concat(SC.sc.turns.filter(t => t.chunk).map(t => t.chunk));
  const hard = SC.log.filter(l => l.hint >= 2 || l.tries >= 3);
  $("scpanel").innerHTML = `<p class="lead2">오늘 이 장면에서 건진 말이에요.</p>
    <ul class="notes">${SC.log.map(l => `<li class="${l.hint >= 2 || l.tries >= 3 ? "hard" : ""}"><small>${esc(l.want)}</small><span lang="en">${esc(l.mine)}</span>${normS(l.mine) === normS(l.model) ? "" : `<em lang="en">→ ${esc(l.model)}</em>`}</li>`).join("")}</ul>
    ${hard.length ? `<p class="soft">힌트를 많이 쓴 ${hard.length}개는 내일 다른 장면에서 한 번 더 나와요.</p>` : `<p class="soft">힌트 없이 술술 말했어요.</p>`}
    <div class="scfoot"><button class="btn" id="scdone">하루로 돌아가기</button></div>`;
  $("scdone").onclick = () => {
    const d = today(); S.visited[SC.sc.id] = d; markDay();
    chunks.forEach(([c, m, why]) => { if (!S.note.some(n => n.c === c)) S.note.push({ c, m, why, sc: SC.sc.id, at: d }) });
    hard.forEach(l => S.ng.push({ sc: SC.sc.id, want: l.want, model: l.model, at: d }));
    SC.log.forEach(l => S.lines.push({ sc: SC.sc.id, mine: l.mine, at: d }));
    save(); SC = null; fx("done"); nav("learn");
  };
}
$("scclose").onclick = () => { playing++; speechSynthesis.cancel(); if (recS) { const r = recS; recS = null; r.onend = null; try { r.stop() } catch {} } SC = null; nav("learn") };

// ───── 수첩 탭 ─────
function renderNote() {
  header();
  $("notelist").innerHTML = S.note.length ? S.note.slice().reverse().map(n => `<li><b lang="en">${esc(n.c)}</b><span>${esc(n.m)}</span><p>${esc(n.why)}</p><button class="say-mini" data-say="${esc(n.c)}" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></li>`).join("")
    : `<p class="none">장면을 다녀오면 건진 말이 여기 모여요.</p>`;
  $("nglist").innerHTML = S.ng.length ? S.ng.slice().reverse().map(n => `<li><small>${esc(n.want)}</small><span lang="en">${esc(n.model)}</span></li>`).join("") : `<p class="none">아직 없어요.</p>`;
  const st = S.stuck.filter(x => !x.done);
  $("stucklist").innerHTML = st.length ? st.map(x => `<li><small>${esc(x.ko)}</small><span lang="en">${esc(x.en)}</span></li>`).join("") : `<p class="none">말 걸기에서 막힌 말이 여기 모여요.</p>`;
  $("pronlist").innerHTML = W.map(([w, mean, wrong, right, ipa, , tip]) => `<li data-say="${w.replace(/[()]/g, "")}"><b lang="en">${w.replace(/\((.+?)\)/g, "<s>$1</s>")}</b><del>${wrong}</del><strong>${right.replace(/[\[\]]/g, "")}</strong><small>${mean} · /${ipa}/ · ${tip}</small></li>`).join("");
}
$("v-review").onclick = e => { const b = e.target.closest("[data-say]"); if (b) speak(b.dataset.say) };

// 시작 (app.js 다음에 읽히므로 여기서 첫 화면을 띄운다)
show(location.hash.slice(1) || "learn");
