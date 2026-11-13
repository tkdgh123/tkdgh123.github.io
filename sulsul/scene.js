// 술술 2판: 파트별 이야기(world.js PARTS — 하루씩, 쓴 차례대로). 갈림길 대화 → 듣기 → 수첩. 인물은 내가 한 말을 기억하고(S.mem), 친해질수록(S.rel) 새 이야기가 열린다.
// 이야기 파일 모양은 ~/sulsul-art/V2.md, 사람은 world.js, 그림은 art.js
const memNow = () => SC?.mem || S.mem; // 다시 하기·다시 말해 보기는 복사본에 — 진짜 기억은 그대로
const nm = s => String(s).replace(/\{(\w+)\}/g, (m, k) => k === "name" ? (S.profile.name || "friend") : (memNow()[k] ?? m));
// 기억한 말이 문장 맨 앞에 오면 첫 글자를 대문자로("bibimbap?" → "Bibimbap?")
// 여러 말 중 고르기: 열쇠가 기억에 있으면("drink", "stay=hotel") 그 말
// "lv:2"는 수준이 2 이상일 때(상대가 더 길게 말하거나 갈래가 하나 더 열림)
const has = k => !k || (k.startsWith("lv:") ? S.level >= +k.slice(3) : k.includes("=") ? memNow()[k.split("=")[0]] === k.split("=")[1] : memNow()[k] != null);
const sayOf = say => nm(Array.isArray(say) ? (say.find(([k]) => has(k)) || say.at(-1))[1] : say)
  .replace(/\bhot hot\b/g, "hot").replace(/\b(hot|iced) cold brew\b/g, "cold brew").replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
// 기억해 둘 때 고유한 표기로(목록은 소문자라서)
const PRETTY = { ai: "AI", kpop: "K-pop", "korean bbq": "Korean BBQ", "korean fried chicken": "Korean fried chicken", korea: "Korea", korean: "Korean", seoul: "Seoul", busan: "Busan", incheon: "Incheon", daegu: "Daegu", daejeon: "Daejeon", gwangju: "Gwangju", jeju: "Jeju", suwon: "Suwon", english: "English", monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday", weekend: "the weekend" };
const pretty = w => PRETTY[w] || w.replace(/\b(ai|ui|ux)\b/g, x => x.toUpperCase()).replace(/\b(english|korean)\b/g, x => x[0].toUpperCase() + x.slice(1));
// 전화 이야기(art: "call")는 그림 대신 통화 화면
const artOf = ep => (ep.art || PEOPLE[ep.who].art) === "call" ? { call: true } : ART[ep.art || PEOPLE[ep.who].art] || {};
const done = id => !!S.eps[id];
// 오늘 = 지금 파트에서 아직 안 끝낸 이야기가 남은 첫 날. 그날 이야기는 days에 쓴 차례(아침→밤)대로 하나씩 열린다
const partDays = () => PARTS[S.part]?.days || [];
const dayIdx = () => partDays().findIndex(d => !d.every(done));
const epOf = id => EPS.find(e => e.id === id);
const todayEps = () => (partDays()[dayIdx()] || []).map(epOf);
const nextEp = () => todayEps().find(e => !done(e.id));
const TIMES = { morning: "아침", day: "낮", evening: "저녁", night: "밤" };

// ───── 오늘 ─────
// 오늘 카드: 끝낸 것(✓) · 지금 할 것 · 아직 잠긴 것(앞 이야기를 끝내면 열림)
const epCard = ep => {
  const a = artOf(ep), p = PEOPLE[ep.who], fin = done(ep.id), now = ep === nextEp();
  return `<button class="scard${now ? " next" : ""}${fin ? " fin" : ""}${!fin && !now ? " later" : ""}" data-ep="${ep.id}">
      <div class="pic t-${ep.time || "day"}">${a.call ? `<i class="ph-fill ph-phone-call"></i>` : a.img ? `<img src="${a.img}" alt="" loading="lazy" style="object-position:${a.pos || "50% 50%"}">` : `<i class="ph-fill ph-image"></i>`}${fin ? `<span class="gtag"><i class="ph-bold ph-check"></i></span>` : !now ? `<span class="gtag"><i class="ph-fill ph-lock-simple"></i></span>` : ""}</div>
      <div class="cap"><time>${TIMES[ep.time || "day"]}</time><b>${ep.title}</b><span>${p.name}${fin ? "" : ` · ${S.rel[ep.who] ? "다시 만나요" : "처음 만나요"}`}</span></div></button>`;
};
const faceOf = w => { const p = PEOPLE[w], f = ART[p.art]?.layers?.body || ART[p.art]?.img; return f ? `<img src="${f}" alt="">` : `<span class="av">${esc(p.name[0])}</span>` };
const ago = d => { const n = Math.round((new Date(today()) - new Date(d)) / 864e5); return n <= 0 ? "오늘" : n === 1 ? "어제" : n + "일 전" };
const addDays = (n, from = today()) => { const d = new Date(from); d.setDate(d.getDate() + n); return d.toLocaleDateString("sv") };
// 막혔던 말: 다음 날부터 그 자리(같은 사람·같은 말)에서 다시. 힌트 없이 두 번 말하면 끝
const dueNg = () => S.ng.map((x, i) => [x, i]).filter(([x]) => x.node && !x.ok && (x.due || addDays(1, x.at)) <= today() && partDays().flat().includes(x.sc));
const hearts = n => Array.from({ length: 5 }, (_, i) => `<i class="ph-fill ph-heart${i < n ? "" : " off"}"></i>`).join("");
function renderDay() {
  header();
  const list = todayEps(), met = Object.keys(S.rel).filter(w => S.rel[w] > 0).sort((a, b) => S.rel[b] - S.rel[a]), P = PARTS[S.part], di = dayIdx();
  $("daystrip").innerHTML = `<div class="dayhead"><small>${P.ko}${di >= 0 ? ` · ${di + 1}번째 날 / ${P.days.length}` : ""}</small><h2>${di >= 0 ? "오늘 할 이야기" : "이 파트를 다 했어요"}</h2>
      <div class="goalchips"><span><i class="ph-fill ${P.icon}"></i>${P.ko}</span><a href="#set" class="link">파트 바꾸기</a></div></div>
    ${list.length ? `<div class="stripwrap"><button class="snav back" data-dir="-1" aria-label="이전" hidden><i class="ph-bold ph-caret-left"></i></button><div class="strip" id="tripstrip">${list.map(epCard).join("")}</div><button class="snav fwd" data-dir="1" aria-label="다음"><i class="ph-bold ph-caret-right"></i></button></div>`
      : `<p class="none">${P.ko} 이야기를 끝까지 했어요. 설정에서 다른 파트를 골라 보세요.</p>`}
    ${(() => { const due = dueNg();
      return due.length ? `<h3 class="sub">다시 말해 보기</h3><ul class="people">${due.slice(0, 3).map(([x, i]) => { const ep = epOf(x.sc);
        return `<li class="tap" role="button" tabindex="0" data-recall="${i}">${faceOf(ep.who)}<div><b>${esc(x.want)}</b><small>${PEOPLE[ep.who].name}에게 ${ago(x.at)} 막혔던 말</small></div><i class="ph-bold ph-caret-right"></i></li>` }).join("")}</ul>` : "" })()}
    <h3 class="sub">아는 사람</h3>
    ${met.length ? `<ul class="people">${met.map(w => { const p = PEOPLE[w], n = S.notes[w] || [];
      const face = ART[p.art]?.layers?.body || ART[p.art]?.img;
      return `<li>${face ? `<img src="${face}" alt="">` : `<span class="av">${esc(p.name[0])}</span>`}<div><b>${p.name}</b><small>${p.ko}</small><span class="hearts" aria-label="친한 정도 ${S.rel[w]}">${hearts(S.rel[w])}</span>${n.length ? `<em>내 이야기: ${n.slice(-3).map(esc).join(" · ")}</em>` : ""}</div></li>` }).join("")}</ul>`
      : `<p class="none">이야기를 하면 만난 사람이 여기 모여요. 다시 만나면 내가 한 말을 기억해요.</p>`}`;
  const s = $("tripstrip"); if (!s) return;
  const nx = s.querySelector(".next"); if (nx) s.scrollLeft = nx.offsetLeft - s.firstElementChild.offsetLeft; // 끝낸 카드 말고 지금 할 카드부터 보이게
  s.onscroll = () => snavState(s); snavState(s);
}
function snavState(s) {
  const w = s.parentElement, end = s.scrollWidth - s.clientWidth - 4, pic = s.querySelector(".pic");
  if (pic) w.style.setProperty("--mid", 4 + pic.offsetHeight / 2 + "px");
  w.querySelector(".back").hidden = s.scrollLeft <= 4; w.querySelector(".fwd").hidden = s.scrollLeft >= end;
}
$("daystrip").onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".tap")) { e.preventDefault(); e.target.click() } };
$("daystrip").onclick = e => {
  const n = e.target.closest(".snav");
  if (n) { const s = n.parentElement.querySelector(".strip"), c = s.querySelector(".scard"); return s.scrollBy({ left: n.dataset.dir * (c.offsetWidth + 12) }) }
  const rc = e.target.closest("[data-recall]"); if (rc) return openRecall(+rc.dataset.recall);
  const b = e.target.closest("[data-ep]"); if (!b) return;
  const ep = epOf(b.dataset.ep), nx = nextEp();
  if (done(ep.id)) { fx("tap"); return toast("이미 끝낸 이야기예요") }
  if (ep !== nx) { fx("bad"); return toast(`${TIMES[nx.time || "day"]} 이야기 '${nx.title}'부터 해요`) }
  openEp(ep);
};

// ───── 이야기 ─────
let SC = null;
const PHASES = ["대화", "듣기", "수첩"];
function openEp(ep, mode, node, recall) {
  const p = PEOPLE[ep.who], a = artOf(ep);
  SC = { ep, mode, recall, mem: mode ? structuredClone(S.mem) : undefined, sc: { ...a, who: p.name, whoKo: p.ko, guestKo: ep.guest || "다른 사람", voices: { them: p.v, guest: p.v[0] === "m" ? "f" : "m" }, overhear: ep.hear || [] },
    node: node || ep.start || Object.keys(ep.lines)[0], step: 0, log: [], hint: 0, tries: 0 };
  nav("scene"); buildStage(SC.sc);
  $("scimg").dataset.time = ep.time || "day";
  $("sctitle").innerHTML = `<time>${TIMES[ep.time || "day"]}</time> ${ep.title}`;
  phase(0);
}
// 장면 그림: 겹이 있으면 사람만 살짝 숨 쉬듯, 없으면 그림 한 장
function buildStage(sc) {
  const L2 = sc.layers, el = $("scimg");
  if (sc.call || !sc.img) { el.innerHTML = `<div class="callui"><span class="av">${esc(sc.who[0])}</span><b>${esc(sc.who)}</b><small>${esc(sc.whoKo)} · ${sc.call ? "통화 중" : "장소 그림 준비 중"}</small>${sc.call ? `<i class="ph-fill ph-phone-call"></i>` : ""}</div>`; el.dataset.w = 16; el.dataset.h = 9; return fitStage() }
  if (!L2) { el.innerHTML = `<img src="${sc.img}" alt="">`; el.dataset.w = 16; el.dataset.h = 9; return fitStage() }
  const pc = (v, t) => (100 * v / t) + "%", [bx, by, bw, bh] = L2.box;
  el.dataset.w = L2.w; el.dataset.h = L2.h;
  el.innerHTML = `<img src="${L2.plate || sc.img}" alt="">
    ${(L2.amb || []).map(([src, x, y, w, h, c]) => `<img class="amb ${c}" src="${src}" alt="" style="left:${pc(x, L2.w)};top:${pc(y, L2.h)};width:${pc(w, L2.w)};height:${pc(h, L2.h)}">`).join("")}
    <div class="breath" style="${L2.breath ? `--s:${L2.breath};` : ""}left:${pc(bx, L2.w)};top:${pc(by, L2.h)};width:${pc(bw, L2.w)};height:${pc(bh, L2.h)}">
      <img src="${L2.body}" alt="">${L2.hand ? `<img class="handwave" src="${L2.hand}" alt="" style="transform-origin:${pc(L2.pivot[0] - bx, bw)} ${pc(L2.pivot[1] - by, bh)}">` : ""}
    </div>
    ${(L2.front || []).map(([src, x, y, w, h]) => `<img class="front" src="${src}" alt="" style="left:${pc(x, L2.w)};top:${pc(y, L2.h)};width:${pc(w, L2.w)};height:${pc(h, L2.h)}">`).join("")}`;
  fitStage();
}
function fitStage() {
  const el = $("scimg"), st = el?.parentElement; if (!el || !SC || !st.clientWidth) return;
  const W = st.clientWidth, H = st.clientHeight, A = el.dataset.w / el.dataset.h, [px, py] = (SC.sc.pos || "50% 50%").split(" ").map(v => parseFloat(v) / 100);
  const cw = W / H > A ? W : H * A, ch = cw / A;
  Object.assign(el.style, { width: cw + "px", height: ch + "px", left: (W - cw) * px + "px", top: (H - ch) * py + "px" });
}
addEventListener("resize", fitStage);
function openRecall(i) { const x = S.ng[i]; openEp(EPS.find(e => e.id === x.sc), "recall", x.node, i) }
function phase(n) {
  if (n === 1 && !SC.sc.overhear.length) n = 2;
  SC.phase = n;
  $("scsteps").innerHTML = SC.mode === "recall" ? `<span class="on">다시 말해 보기</span>` : PHASES.map((p, i) => `<span class="${i === n ? "on" : i < n ? "done" : ""}">${p}</span>`).join("");
  $("scbubble").hidden = true; $("chunkcard").hidden = true;
  if (n === 0) myTurn();
  if (n === 1) overhear();
  if (n === 2) notebook();
}
const chunked = (en, chunks = []) => chunks.reduce((h, [c], i) => h.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), m => `<span class="chunk" role="button" tabindex="0" data-c="${i}">${m}</span>`), esc(en));
function bubble(who, en, ko) {
  const b = $("scbubble"); b.hidden = false; b.className = "bubble2 " + who;
  b.innerHTML = `<small>${who === "them" ? `${SC.sc.who} · ${SC.sc.whoKo}` : who === "guest" ? SC.sc.guestKo : "나"}</small><span lang="en">${esc(en)}</span>${ko ? `<em>${esc(ko)}</em>` : ""}`;
  b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
}
// 2. 듣기: 같은 자리에서 다른 사람이 하는 말. 밑줄 덩어리를 누르면 뜻과 이유
async function overhear() {
  const lines = SC.sc.overhear;
  $("scpanel").innerHTML = `<p class="lead2">같은 자리에서 다른 사람이 하는 말이에요. 밑줄 친 말을 누르면 뜻이 나와요.</p><ol class="script" id="script"></ol>
    <div class="scfoot"><button class="btn ghost" id="replay"><i class="ph-fill ph-speaker-high"></i>다시 듣기</button><button class="btn" id="tome" disabled>수첩 보기 <i class="ph-bold ph-arrow-right"></i></button></div>`;
  $("replay").onclick = () => playScript();
  $("tome").onclick = () => phase(2);
  $("script").onclick = e => { const c = e.target.closest(".chunk"); if (!c) return; const li = c.closest("li"); showChunk(lines[+li.dataset.i][2][+c.dataset.c]) };
  $("script").onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".chunk")) { e.preventDefault(); e.target.click() } };
  playScript();
}
let playing = 0;
async function playScript() {
  const run = ++playing, lines = SC.sc.overhear;
  $("script").innerHTML = "";
  for (let i = 0; i < lines.length; i++) {
    if (run !== playing || SC?.phase !== 1) return;
    const [who, en, ch] = lines[i];
    $("script").insertAdjacentHTML("beforeend", `<li class="${who}" data-i="${i}"><small>${who === "them" ? SC.sc.who : SC.sc.guestKo}</small><span lang="en">${chunked(en, ch)}</span></li>`);
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
// 1. 대화: 상대 말 → 내가 할 일(번역문이 아니라 목표) → 내 말에 따라 다음 줄이 갈린다
const lineNow = () => SC.ep.lines[SC.node];
const routes = () => lineNow().go.filter(r => !r.if || has(r.if));
// 줄의 lv = 이 수준부터 나오는 차례. 수준이 낮으면 그 줄을 건너뛴다
const nextNode = to => { while (to !== "end" && SC.ep.lines[to].lv > S.level) to = SC.ep.lines[to].go[0].to; return to };
// 덧붙일 말("…하면 더 좋아요")을 수준에 따라: 0~1단계는 안 해도 통과, 2단계는 한 번 권하고(넘어가도 됨), 3단계는 꼭 해야 통과
const MORE_NEED = () => S.level >= 3 ? 2 : S.level === 2 ? 1 : 0;
const VERB = { 덧붙이: "덧붙여", 붙이: "붙여", 시작하: "시작해", 하: "해" };
const taskText = L => { const t = sayOf(L.task); return L.more && MORE_NEED() === 2 ? t.replace(/\s*[(—]\s*(.+?)(덧붙이|붙이|시작하|하)면 더 좋아요\)?/, (_, a, v) => `, ${a}${VERB[v]}요`) : t };
const moreAsk = L => { const m = sayOf(L.task).match(/[(—]\s*(.+?)(덧붙이|붙이|시작하|하)면 더 좋아요/); return m ? `${m[1]}${VERB[m[2]]} 볼까요?` : "한마디 덧붙여 볼까요?" };
function myTurn() {
  const L = lineNow(); SC.hint = 0; SC.tries = 0; SC.asked = 0;
  const say = sayOf(L.say); SC.say = say;
  bubble("them", say);
  const typing = !speakOn();
  $("scpanel").innerHTML = `<div class="turnhead"><span>${SC.mode === "recall" ? `${ago(S.ng[SC.recall].at)} 막혔던 말` : SC.step + 1 + "번째 말"}</span><button class="link" id="sayagain"><i class="ph-fill ph-speaker-high"></i> 다시 듣기</button></div>
    <p class="want"><small>${routes().length > 1 ? "내 마음대로 골라 말해요" : "할 일"}</small>${esc(taskText(L))}</p>
    <p class="hintline" id="hintline" hidden></p>
    ${typing ? "" : `<button class="mic-big" id="scmic" aria-label="말하기"><i class="ph-fill ph-microphone"></i></button>`}
    <form class="type" id="sctype" ${typing ? "" : "hidden"}><input id="scin" lang="en" autocomplete="off" placeholder="영어로 쓰기"><button class="btn" style="min-height:46px;padding:0 16px">말하기</button></form>
    <p class="heardw" id="scheard" aria-live="polite"></p>
    <div class="scfoot"><button class="btn ghost" id="schint"><i class="ph-fill ph-lightbulb"></i>힌트</button>${typing ? "" : `<button class="btn ghost" id="sctyping"><i class="ph-bold ph-keyboard"></i>글로</button>`}</div>`;
  $("sayagain").onclick = () => { if (!recS) listenFirst(say) };
  $("schint").onclick = () => giveHint();
  if (!typing) { $("scmic").onclick = () => hearMe(); $("sctyping").onclick = () => { $("sctype").hidden = false; $("scin").focus() } }
  $("sctype").onsubmit = e => { e.preventDefault(); const v = $("scin").value.trim(); if (v && !SC.listening) judgeTurn(v) };
  if (S.level === 0) giveHint();
  listenFirst(say);
}
async function listenFirst(text) {
  const lock = on => { SC.listening = on; ["scmic", "sayagain"].forEach(id => { const b = $(id); if (b) b.disabled = on }); const s = $("sctype")?.querySelector("button"); if (s) s.disabled = on; $("scheard").textContent = on ? "끝까지 들어 보세요…" : "" };
  if (!listenOn()) return lock(false);
  lock(true);
  await speak(text, undefined, SC.sc.voices.them);
  if (SC) { lock(false); if (!speakOn()) $("scin")?.focus() }
}
// 힌트는 모범 답에서 자동: 앞 두 단어 → 절반 → 전부. 갈래가 여럿이면 갈래마다 하나씩 보여 준다
const cut = (s, k) => { const w = s.split(" "); return k >= 3 ? s : w.slice(0, k === 1 ? 2 : Math.ceil(w.length / 2)).join(" ").replace(/[.,!?]+$/, "") + "…" };
function giveHint() {
  SC.hint = Math.min(3, SC.hint + 1);
  const h = $("hintline"), rs = routes(); h.hidden = false;
  h.innerHTML = `<i class="ph-fill ph-lightbulb"></i><span>${rs.map(r => `<span lang="en">${esc(cut(nm(r.ex), SC.hint))}</span>`).join("<em>또는</em>")}</span>`;
  if (SC.hint === 3 && rs.length === 1) speak(nm(rs[0].ex));
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
  r.onend = () => {
    if (recS === r) { try { r.start() } catch {} return }
    const base = got.map(a => a[0]).join(" "), tail = interim.trim();
    const said = [base, tail].filter(Boolean).join(" ").trim();
    if (!said) { $("scheard").textContent = "아무 말도 안 들렸어요. 다시 눌러 말해요."; return }
    const last = got.at(-1) || [], head = got.slice(0, -1).map(a => a[0]).join(" ");
    judgeTurn([said, ...last.slice(1).map(a => [head, a].filter(Boolean).join(" "))]);
  };
  recS = r; r.start(); b.classList.add("on"); b.setAttribute("aria-label", "다 말했어요"); $("sayagain").disabled = true; show();
}
// 판정은 judge.js(뜻 덩어리가 모두 들어 있는지, 단어 하나로는 안 됨). 받아쓰기 후보가 여럿이면 그중 맞는 것
const normS = s => " " + s.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim() + " ";
function judgeTurn(input) {
  const alts = Array.isArray(input) ? input : [input], { win, best } = J.judge(routes(), alts, lineNow(), nm);
  SC.tries++;
  if (!win) {
    fx("bad");
    $("scheard").innerHTML = `<span class="no2">"${esc(best.said)}"</span><br>${best.miss.length ? `${best.miss.map(([k]) => `'${k}'`).join(", ")} 부분이 안 들어갔어요` : "조금 더 문장으로 말해 볼까요?"}`;
    if (SC.tries >= 2 && SC.hint < 2) giveHint();
    return;
  }
  const add = J.extra(lineNow(), win.said, SC.say, nm);
  if (add === false && MORE_NEED() > SC.asked) {
    SC.asked = 1; fx("tap");
    $("scheard").innerHTML = `"${esc(win.said)}"<br>뜻은 통했어요. ${esc(moreAsk(lineNow()))} 처음부터 한 번에 말해요.${MORE_NEED() === 1 ? ` <button class="link" id="skipmore">이대로 넘어가기</button>` : ""}`;
    if (MORE_NEED() === 1) $("skipmore").onclick = () => passTurn(win, false);
    return;
  }
  passTurn(win, add);
}
function passTurn(win, add) {
  fx("good");
  const r = win.r, said = win.said, ex = nm(r.ex), ri = lineNow().go.indexOf(r), to = nextNode(r.to);
  if (r.set) Object.assign(memNow(), r.set);
  if (r.cap && win.got) SC.mem ? SC.mem[r.cap] = pretty(win.got) : remember(r.cap, pretty(win.got), r.m[0][0]);
  if (SC.mode === "recall") { const x = S.ng[SC.recall], clean = SC.hint === 0 && SC.tries === 1; x.n = (x.n || 0) + (clean ? 1 : 0); x.due = addDays(clean ? 3 : 1); if (x.n >= 2) x.ok = true; save() }
  const entry = { node: SC.node, task: taskText(lineNow()), mine: said, model: ex, hint: SC.hint, tries: SC.tries, chunk: r.tip };
  SC.log.push(entry);
  const same = normS(said) === normS(ex), reply = r.reply && nm(r.reply);
  $("scpanel").innerHTML = `<div class="okcard"><b><i class="ph-fill ph-check-circle"></i>통했어요</b><p class="mine" lang="en">${esc(said)}</p>${add ? `<p class="plus"><i class="ph-fill ph-star"></i>덧붙인 말까지 좋아요</p>` : ""}<p class="better fixed" id="fixline" hidden></p>${same ? "" : `<p class="better"><small>이렇게도 말해요</small><span lang="en">${esc(ex)}</span><button class="say-mini" id="playmodel" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></p>`}</div>
    <div class="scfoot"><button class="btn" id="nextturn">${SC.mode === "recall" ? (dueNg().length ? "다음 말" : "돌아가기") : to === "end" ? "마무리" : "다음"} <i class="ph-bold ph-arrow-right"></i></button></div>`;
  if (!same) $("playmodel").onclick = () => speak(ex);
  if (!same) fixLine(SC.say, said, entry);
  (async () => { if (!same) await speak(ex); if (reply && SC) { bubble("them", reply); await speak(reply, undefined, SC.sc.voices.them) } })();
  $("nextturn").onclick = () => {
    speechSynthesis.cancel();
    if (SC.mode === "recall") { const d = dueNg()[0]; SC = null; return d ? openRecall(d[1]) : nav("learn") }
    if (to === "end") return finish();
    SC.node = to; SC.step++; myTurn();
  };
}
// 뜻은 통했지만 문법이 틀린 말이면 고친 문장을 보여 준다(Gemini 키가 있을 때만, 말 자체를 고칠 뿐 내용은 더하지 않음)
async function fixLine(heard, said, entry) {
  if (!S.key || !S.model) return;
  const sc = SC;
  try {
    const t = await ask(`You check one short spoken answer from a Korean learner of English. Reply as JSON {"fix": "..."}.
If the answer has a real grammar or word-choice mistake an English teacher would correct, "fix" is the corrected answer: keep the learner's own words and meaning, change as little as possible, add nothing new.
If it is acceptable spoken English, "fix" is "". Short fragments that are natural in speech ("Korea.", "Two weeks.", "Hot, please.", "Only me.") are acceptable. Ignore capitals and punctuation — it may be speech recognition.`,
      [{ role: "user", parts: [{ text: `The other person said: "${heard}"\nThe learner answered: "${said}"` }] }], true);
    const fix = String(JSON.parse(t).fix || "").trim();
    if (!fix || normS(fix) === normS(said) || SC !== sc || !$("fixline")) return;
    entry.fix = fix;
    const mine = new Set(normS(said).trim().split(" "));
    const el = $("fixline"); el.hidden = false;
    el.innerHTML = `<small>고쳐 말하면</small><span lang="en">${fix.split(" ").map(w => mine.has(normS(w).trim()) ? esc(w) : `<mark>${esc(w)}</mark>`).join(" ")}</span><button class="say-mini" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button>`;
    el.querySelector("button").onclick = () => speak(fix);
    if (normS(fix) === normS(entry.model)) el.parentElement.querySelector(".better:not(.fixed)")?.remove(); // 같은 문장을 두 번 보여 주지 않기
  } catch {}
}
function remember(k, v, label) {
  S.mem[k] = v;
  const w = SC.ep.who, n = (S.notes[w] ||= []), t = `${label}: ${v}`;
  if (!n.includes(t)) n.push(t);
}
async function finish() {
  const bye = SC.ep.bye && sayOf(SC.ep.bye);
  $("scpanel").innerHTML = `<div class="scfoot"><button class="btn" id="tohear">${SC.sc.overhear.length ? "이제 듣기" : "수첩 보기"} <i class="ph-bold ph-arrow-right"></i></button></div>`;
  $("tohear").onclick = () => { speechSynthesis.cancel(); phase(1) };
  if (bye) { bubble("them", bye); await speak(bye, undefined, SC.sc.voices.them) }
}
// 3. 수첩: 내가 한 말과 다르게 말하는 법. 힌트를 많이 쓴 말은 따로 모은다
function notebook() {
  $("scbubble").hidden = true;
  const chunks = SC.sc.overhear.flatMap(l => l[2] || []).concat(SC.log.filter(l => l.chunk).map(l => l.chunk));
  const hard = SC.log.filter(l => l.hint >= 2 || l.tries >= 3), p = PEOPLE[SC.ep.who], rel = Math.min(5, (S.rel[SC.ep.who] || 0) + (SC.ep.rel ?? 1)), nx = nextOf(SC.ep);
  $("scpanel").innerHTML = `<p class="lead2">${esc(p.name)}와 한 이야기에서 건진 말이에요.</p>
    <ul class="notes">${SC.log.map(l => `<li class="${l.hint >= 2 || l.tries >= 3 ? "hard" : ""}"><small>${esc(l.task)}</small><span lang="en">${esc(l.mine)}</span>${l.fix ? `<em lang="en">고쳐 말하면 → ${esc(l.fix)}</em>` : ""}${normS(l.mine) === normS(l.model) ? "" : `<em lang="en">→ ${esc(l.model)}</em>`}</li>`).join("")}</ul>
    <p class="soft">${hearts(rel)} ${esc(p.name)}와 조금 더 친해졌어요.${(S.notes[SC.ep.who] || []).length ? " 내가 한 말을 기억해 둘 거예요." : ""}</p>
    ${nx ? `<p class="nextep"><small>다음 이야기</small><b>${nx.tomorrow ? "다음 날 " : ""}${TIMES[nx.ep.time || "day"]} · ${nx.ep.title}</b><span>${esc(PEOPLE[nx.ep.who].name)} · ${PEOPLE[nx.ep.who].ko}</span></p>` : ""}
    <div class="scfoot"><button class="btn" id="scdone">오늘로 돌아가기</button></div>`;
  $("scdone").onclick = () => {
    const d = today(); S.eps[SC.ep.id] = d; S.rel[SC.ep.who] = rel; markDay();
    chunks.forEach(([c, m, why]) => { if (!S.note.some(n => n.c === c)) S.note.push({ c, m, why, sc: SC.ep.id, at: d }) });
    hard.forEach(l => S.ng.push({ sc: SC.ep.id, node: l.node, want: l.task, model: l.model, at: d }));
    SC.log.forEach(l => S.lines.push({ sc: SC.ep.id, mine: l.mine, at: d }));
    save(); SC = null; fx("done"); nav("learn");
  };
}
// 시간표에서 이 이야기 다음 차례: 그날 다음 이야기, 없으면 다음 날 첫 이야기
function nextOf(ep) {
  const days = partDays(), d = days.findIndex(x => x.includes(ep.id)), i = days[d].indexOf(ep.id), id = days[d][i + 1] || days[d + 1]?.[0];
  return id && { ep: epOf(id), tomorrow: !days[d][i + 1] };
}
$("scclose").onclick = () => { playing++; speechSynthesis.cancel(); if (recS) { const r = recS; recS = null; r.onend = null; try { r.stop() } catch {} } SC = null; nav("learn") };

// ───── 수첩 탭 ─────
function renderNote() {
  header();
  $("notelist").innerHTML = S.note.length ? S.note.slice().reverse().map(n => `<li><b lang="en">${esc(n.c)}</b><span>${esc(n.m)}</span><p>${esc(n.why)}</p><button class="say-mini" data-say="${esc(n.c)}" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></li>`).join("")
    : `<p class="none">이야기를 하고 나면 건진 말이 여기 모여요.</p>`;
  $("nglist").innerHTML = S.ng.length ? S.ng.slice().reverse().map(n => `<li${n.ok ? ` class="ok"` : ""}><small>${esc(n.want)}${n.ok ? " · 이제 말할 수 있어요" : ""}</small><span lang="en">${esc(n.model)}</span></li>`).join("") : `<p class="none">아직 없어요.</p>`;
  const st = S.stuck.filter(x => !x.done);
  $("stucklist").innerHTML = st.length ? st.map(x => `<li><small>${esc(x.ko)}</small><span lang="en">${esc(x.en)}</span></li>`).join("") : `<p class="none">말 걸기에서 막힌 말이 여기 모여요.</p>`;
  $("pronlist").innerHTML = W.map(([w, mean, wrong, right, ipa, , tip]) => `<li data-say="${w.replace(/[()]/g, "")}"><b lang="en">${w.replace(/\((.+?)\)/g, "<s>$1</s>")}</b><del>${wrong}</del><strong>${right.replace(/[\[\]]/g, "")}</strong><small>${mean} · /${ipa}/ · ${tip}</small></li>`).join("");
}
$("v-review").onclick = e => { const b = e.target.closest("[data-say]"); if (b) speak(b.dataset.say) };

// 시작 (app.js·이야기 파일 다음에 읽히므로 여기서 첫 화면을 띄운다)
show(location.hash.slice(1) || "learn");
