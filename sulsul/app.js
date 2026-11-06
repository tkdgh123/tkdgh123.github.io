"use strict";
// ───── 저장 ─────
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DEMO = new URLSearchParams(location.search).has("demo");
const today = () => new Date().toLocaleDateString("sv");
const fresh = () => ({ mode: null, profile: {}, scene: "auto", custom: "", memory: "", stuck: [], sessions: [], key: "", model: "", done: {}, mist: [], days: [], prefs: { speak: true, listen: true, auto: true, sound: true, rate: .9 }, off: { speak: 0, listen: 0 } });
let S;
try { S = DEMO ? null : JSON.parse(localStorage.getItem("sulsul")) } catch {}
S = Object.assign(fresh(), S || {}); S.prefs = Object.assign(fresh().prefs, S.prefs); S.off = Object.assign(fresh().off, S.off);
if (DEMO) Object.assign(S, { mode: "me", key: "", days: [today()], done: { "hello:meet1": { stars: 3, at: "" }, "hello:meet2": { stars: 2, at: "" }, "hello:listen": { stars: 3, at: "" } }, stuck: [
  { id: "d1", en: "I ended up redoing the whole thing.", ko: "결국 처음부터 다시 했어", uses: 0 },
  { id: "d2", en: "It took me about two hours.", ko: "두 시간쯤 걸렸어", uses: 1 },
  { id: "d3", en: "I was about to give up.", ko: "막 포기하려던 참이었어", uses: 0 }] });
const save = () => { if (!DEMO) try { localStorage.setItem("sulsul", JSON.stringify(S)) } catch {} };

// ───── 상대와 장면 ─────
const SCENES = {
  me: { ko: "내 이야기", name: "Jamie", role: "a friendly peer around the learner's age who loves hearing about their day and what they are making", desc: "A casual catch-up about the learner's real day, plans and projects. Follow up on things you remember." },
  cafe: { ko: "카페 주문", name: "Mina", role: "a barista at a busy café", desc: "The learner orders a drink and maybe something to eat. Ask about size, hot or iced, for here or to go, then small talk." },
  street: { ko: "길 묻기", name: "Tom", role: "a local person on a busy street", desc: "The learner asks you how to get somewhere (a station, a museum, a restaurant). Give simple directions and check they understood." },
  intro: { ko: "자기소개", name: "Sara", role: "someone the learner just met at a meetup", desc: "Getting to know each other: study or work, hobbies, recent news." },
  clinic: { ko: "병원 접수", name: "Grace", role: "a receptionist at a clinic", desc: "The learner checks in and explains what is wrong, since when, and books a time." },
  airport: { ko: "공항 체크인", name: "Alex", role: "a check-in agent at an airport counter", desc: "Check-in: passport, destination, bags, seat preference, boarding time." }
};
const DAILY = ["cafe", "street", "intro", "clinic", "airport"];
const sceneId = () => S.scene === "custom" && S.custom ? "custom" : S.scene !== "auto" && SCENES[S.scene] ? S.scene : S.mode === "me" ? "me" : DAILY[(new Date().getDate()) % DAILY.length];
const sceneOf = sc => sc === "custom" ? { ko: "직접 만든 상황", name: "Alex", role: "a friendly person who fits this situation", desc: S.custom } : SCENES[sc];
const targets = () => S.stuck.filter(x => !x.done).slice(0, 3);

// ───── 화면 전환 ─────
const VIEWS = ["start", "learn", "talk", "review", "log", "set", "lesson", "done"];
const RENDER = { learn: () => renderLearn(), talk: () => renderToday(), review: () => renderReview(), log: () => renderLog(), set: () => renderSet(), start: () => { startStep(1); hello() } };
// 처음 화면: 엉킨 실이 천천히 풀렸다 다시 엉킨다
function hello() {
  const svg = $("hello"), t0 = performance.now();
  const f = now => { if ($("v-start").hidden || $("s1").hidden) return; const p = (Math.sin((now - t0) / 1300) + 1) / 2; svg.innerHTML = `<path d="${K.thread(300, 90, p, 4)}" stroke="#0b6e5b" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${p > .96 ? K.bead(150, 45, 10, "#f0a23b") : ""}`; requestAnimationFrame(f) };
  requestAnimationFrame(f);
}
let curView = null, talkUnit = null;
function show(v) {
  if (!S.mode && !DEMO) v = "start";
  if (!VIEWS.includes(v)) v = "learn";
  if ((v === "lesson" || v === "done") && !L) v = "learn";
  curView = v;
  VIEWS.forEach(x => $("v-" + x).hidden = x !== v);
  const bare = v === "start" || v === "lesson" || v === "done";
  $("tabs").hidden = bare; $("topbar").hidden = v === "lesson" || v === "done";
  [...$("tabs").children].forEach(b => b.dataset.v === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  RENDER[v]?.();
  scrollTo(0, 0);
}
// 화면 전환: 되는 브라우저는 View Transitions, 아니면 살짝 올라오는 효과
let vt = null;
function nav(v) {
  if (v === curView) return;
  vt?.skipTransition(); vt = null;
  const quick = ["lesson", "done"].includes(v) || ["lesson", "done"].includes(curView);
  if (document.startViewTransition && !quick && !matchMedia("(prefers-reduced-motion: reduce)").matches) { vt = document.startViewTransition(() => show(v)); vt.finished.finally(() => vt = null) }
  else { show(v); const el = $("v-" + curView); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter") }
  if (!["lesson", "done", "start"].includes(v) && location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
}
$("tabs").onclick = e => { const b = e.target.closest("button"); if (b) { fx("tap"); nav(b.dataset.v) } };
addEventListener("hashchange", () => nav(location.hash.slice(1)));
function header() {
  $("stats").innerHTML = S.mode ? `<span title="연속으로 한 날"><i class="ph-fill ph-flame"></i>${streak()}</span><span title="모은 구슬"><svg viewBox="-10 -10 20 20" width="18" height="18" aria-hidden="true">${K.bead(0, 0, 8, "#0b6e5b")}</svg>${totalStars()}</span>` : "";
  const n = S.stuck.filter(x => !x.done).length; $("revn").textContent = n || "";
}

// ───── 처음 ─────
function startStep(n) { [1, 2, 3].forEach(i => $("s" + i).hidden = i !== n) }
$("modes").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.mode = b.dataset.mode; save(); fx("tap"); startStep(2) };
const fillProf = f => ["name", "job", "likes", "use", "level"].forEach(k => f.elements[k].value = S.profile[k] || "");
const readProf = f => { ["name", "job", "likes", "use", "level"].forEach(k => S.profile[k] = f.elements[k].value.trim()); save() };
$("prof").onsubmit = e => { e.preventDefault(); readProf($("prof")); startStep(3) };
$("skip").onclick = () => startStep(3);
$("keylater").onclick = () => nav("learn");
$("keyok1").onclick = () => setKey($("key1"), $("keyerr1"), $("keyok1"), () => nav("learn"));

// ───── Gemini ─────
const API = "https://generativelanguage.googleapis.com/v1beta/";
class AIError extends Error {}
async function call(path, body) {
  let r;
  try { r = await fetch(API + path, { method: body ? "POST" : "GET", headers: { "x-goog-api-key": S.key, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body && JSON.stringify(body) }) }
  catch { throw new AIError("인터넷 연결을 확인해 주세요.") }
  if (r.ok) return r.json();
  if (r.status === 429) throw new AIError("오늘 무료 한도를 다 썼어요. 내일 다시 하거나 연습·발음 칸을 써요.");
  if (r.status === 400 || r.status === 403) throw new AIError("키가 맞지 않아요. 설정에서 키를 다시 넣어 주세요.");
  throw new AIError(`Gemini가 응답하지 않아요 (${r.status}). 잠시 뒤 다시 해 주세요.`);
}
// 무료로 쓸 수 있는 가장 새 Flash-Lite(없으면 Flash)를 고른다
async function pickModel() {
  const { models = [] } = await call("models?pageSize=200");
  const ok = models.filter(m => (m.supportedGenerationMethods || []).includes("generateContent") && !/preview|exp|tts|image|live|audio|thinking|embedding/i.test(m.name));
  const ver = m => (m.name.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1] * 1;
  const best = re => ok.filter(m => re.test(m.name)).sort((a, b) => ver(b) - ver(a))[0];
  const any = models.filter(m => (m.supportedGenerationMethods || []).includes("generateContent") && /flash/.test(m.name) && !/tts|image|live|audio|embedding/i.test(m.name)).sort((a, b) => ver(b) - ver(a))[0];
  const m = best(/flash-lite/) || best(/flash/) || any;
  if (!m) throw new AIError("이 키로 쓸 수 있는 대화 모델을 못 찾았어요.");
  return m.name.replace(/^models\//, "");
}
async function setKey(input, err, btn, done) {
  const k = input.value.trim(); err.textContent = "";
  if (!k) { err.textContent = "키를 붙여 넣어 주세요."; return }
  btn.disabled = true; const old = S.key; S.key = k;
  try { S.model = await pickModel(); save(); input.value = ""; done() }
  catch (e) { S.key = old; err.textContent = e.message }
  btn.disabled = false;
}
async function ask(system, contents, json) {
  const d = await call(`models/${S.model}:generateContent`, {
    systemInstruction: { parts: [{ text: system }] }, contents,
    generationConfig: { temperature: json ? .3 : .9, maxOutputTokens: json ? 1500 : 220, ...(json ? { responseMimeType: "application/json" } : {}) }
  });
  const t = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
  if (!t) throw new AIError("대답이 비어 있어요. 다시 해 주세요.");
  return t;
}
function persona(sc) {
  const p = S.profile, s = sceneOf(sc), tg = conv?.tg || targets();
  return `You are ${s.name}, ${s.role}. You are having a short spoken English conversation with a Korean learner${p.name ? ` called ${p.name}` : ""}.
Scene: ${s.desc}
Learner: ${[p.job && `does ${p.job}`, p.likes && `likes ${p.likes}`, p.use && `needs English for ${p.use}`, p.level && `level (Korean description): ${p.level}`].filter(Boolean).join("; ") || "no profile given"}.
What you remember from earlier conversations: ${S.memory || "nothing yet, this is your first talk"}.
${tg.length ? `The learner got stuck on these before and is trying to use them today: ${tg.map(t => `"${t.en}"`).join(", ")}. Ask questions that give them a natural reason to say these. Never say these sentences yourself and never mention practice or targets.` : ""}
Rules: speak like a real person in this scene. Reply with one or two short sentences at the learner's level, then ask exactly one question. No lists, no emojis, no corrections. "[KO: ...]" means the learner said that part in Korean; understand it and keep going in English. "[pause Ns]" marks silence.`;
}

// ───── 오늘: 화면 ─────
let conv = null, busy = false;
function renderToday() {
  header();
  const sc = conv?.scene || sceneId(), s = sceneOf(sc);
  $("face").textContent = s.name[0]; $("pname").textContent = s.name;
  $("psub").textContent = conv?.unit ? `${conv.unit.title} · 실전 대화` : sc === "me" ? (S.memory ? "지난 대화를 기억해요" : "오늘 처음 만나요") : s.ko;
  $("scenes").innerHTML = [["auto", S.mode === "me" ? "내 이야기" : "오늘의 상대"], ...DAILY.map(k => [k, SCENES[k].ko]), ["custom", "직접 만들기"]].map(([k, t]) => `<button data-s="${k}" aria-pressed="${S.scene === k}" ${conv ? "disabled" : ""}>${t}</button>`).join("");
  $("customf").hidden = S.scene !== "custom" || !!conv; $("customin").value = S.custom;
  if (!conv) {
    $("line").className = "say wait";
    $("line").textContent = DEMO ? "Hey! Yesterday you said the pedal for your racing wheel was almost done. Did you finish it?" : S.key ? `마이크를 누르면 ${s.name}이 먼저 말을 걸어요.` : "대화하려면 설정에서 Gemini 키를 넣어 주세요.";
    if (DEMO) $("line").className = "say";
    $("lsub").hidden = !DEMO; $("ko").textContent = "";
  }
  chips();
  $("demo").hidden = !DEMO;
  $("typed").hidden = !conv || !!Rec;
  size();
}
function chips(fresh) {
  const tg = conv ? conv.tg : targets();
  $("chips").innerHTML = tg.length ? tg.map(t => `<div class="chip" data-id="${t.id}" data-n="${Math.min(2, t.uses + (conv?.hits[t.id] || 0))}"><div><b lang="en">${esc(t.en)}</b><span>${esc(t.ko)}</span></div><i class="dots" aria-label="두 번 중 ${Math.min(2, t.uses)}번 씀"></i></div>`).join("")
    : `<p class="none">${S.sessions.length ? "막혔던 말을 다 썼어요. 오늘 대화에서 새로 모아요." : "첫 대화가 끝나면 막혔던 말이 여기 올라와요."}</p>`;
  if (fresh) $(`chips`).querySelector(`[data-id="${fresh}"]`)?.classList.add("hit");
}
$("scenes").onclick = e => { const b = e.target.closest("button"); if (!b || conv) return; S.scene = b.dataset.s; save(); renderToday(); if (S.scene === "custom") $("customin").focus() };
$("customf").onsubmit = e => { e.preventDefault(); S.custom = $("customin").value.trim(); save(); renderToday(); toast(S.custom ? "이 상황으로 대화해요" : "상황을 적어 주세요") };
$("tr").onclick = async () => {
  if ($("ko").textContent) { $("ko").textContent = ""; $("tr").textContent = "한국어로 보기"; return }
  const line = $("line").textContent;
  if (DEMO) { $("ko").textContent = "어제 레이싱 휠 페달 거의 다 됐다고 했잖아. 끝냈어?" }
  else { $("tr").disabled = true; try { $("ko").textContent = await ask("Translate the English line into natural, casual Korean. Reply with the Korean only.", [{ role: "user", parts: [{ text: line }] }]) } catch (e) { $("convErr").textContent = e.message } $("tr").disabled = false }
  $("tr").textContent = "영어만 보기";
};
$("again").onclick = () => speak($("line").textContent);

// ───── 소리 ─────
const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
function speak(text, rate = S.prefs.rate) {
  return new Promise(res => {
    if (!window.speechSynthesis) return res();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate;
    const v = speechSynthesis.getVoices().find(v => v.lang === "en-US"); if (v) u.voice = v;
    let done = false; const fin = () => { if (!done) { done = true; res() } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 1500 + text.length * 90);
    speechSynthesis.speak(u);
  });
}
// 파형: 막대 하나 = 1/30초. 말한 뒤 1.2초 넘게 조용하면 주황 칸(멈춤)
const cv = $("cv"), g = cv.getContext("2d");
let bars = [], listening = false, stream, actx, meter;
function size() { const r = cv.getBoundingClientRect(); if (!r.width) return; const d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); draw() }
let lastW = innerWidth;
addEventListener("resize", () => { size(); if (curView === "learn" && innerWidth !== lastW) { lastW = innerWidth; renderLearn() } });
// 말 걸기 화면의 실: 말하면 실이 흐르고, 멈추면 그 자리에 매듭이 지어진다
let tick30 = 0;
function draw() {
  const w = cv.clientWidth, h = cv.clientHeight, step = 3, vis = bars.slice(-Math.floor(w / step));
  g.clearRect(0, 0, w, h);
  if (!vis.length) { g.strokeStyle = "#cfd3cf"; g.lineWidth = 3; g.setLineDash([2, 9]); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); g.setLineDash([]); return }
  g.lineWidth = 3.2; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#17191c"; g.beginPath();
  vis.forEach((b, i) => { const y = h / 2 + Math.sin(b.k * .42) * Math.min(1, b.v * 1.6) * h * .32; i ? g.lineTo(i * step, y) : g.moveTo(0, y) });
  g.stroke();
  vis.forEach((b, i) => {
    if (!b.gap || vis[i - 1]?.gap) return;
    const r = Math.min(h * .36, 18), cx = i * step + r, cy = h / 2;
    g.strokeStyle = "#f0a23b"; g.lineWidth = 3; g.beginPath();
    for (let j = 0; j <= 90; j++) { const t = j / 90 * Math.PI * 6, R = r * (.45 + .55 * Math.abs(Math.sin(t * 1.7 + i))); const x = cx + R * Math.cos(t * 1.31 + i), y = cy + R * Math.sin(t); j ? g.lineTo(x, y) : g.moveTo(x, y) }
    g.stroke();
  });
}
let quiet = 0, spoke = false, gapOpen = false;
function push(v) {
  bars.push({ v, gap: false, k: tick30++ });
  if (listening && conv) conv.ms += 1000 / 30;
  if (v > .12) {
    if (gapOpen) { gapOpen = false; turnPause(quiet / 30) }
    spoke = true; quiet = 0;
  } else if (listening && spoke) {
    quiet++;
    if (quiet >= 36) {
      if (!gapOpen) { gapOpen = true; if (conv) conv.pauses++ }
      for (let i = Math.max(0, bars.length - quiet); i < bars.length; i++) bars[i].gap = true;
    }
  }
  if (bars.length > 3000) bars = bars.slice(-1500);
  draw();
}
async function micOn() {
  if (stream) return;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  actx = new AudioContext(); const an = actx.createAnalyser(); an.fftSize = 1024;
  actx.createMediaStreamSource(stream).connect(an);
  const buf = new Float32Array(an.fftSize);
  meter = setInterval(() => { an.getFloatTimeDomainData(buf); let r = 0; for (const x of buf) r += x * x; push(listening ? Math.min(1, Math.sqrt(r / buf.length) * 7) : 0) }, 1000 / 30);
}
function micOff() { clearInterval(meter); stream?.getTracks().forEach(t => t.stop()); actx?.close(); stream = actx = null }

// ───── 오늘: 대화 ─────
let rec, parts = [], interim = "", koMode = false, timer;
const timeLeft = () => Math.max(0, 180 - (Date.now() - conv.t0) / 1000);
function tick() { const l = timeLeft(); $("time").textContent = `${Math.floor(l / 60)}:${String(Math.floor(l % 60)).padStart(2, "0")}` }
function setState(t, live) { $("state").textContent = t; $("app").classList.toggle("live", !!live) }
function showHeard() { $("heard").innerHTML = esc([...parts, interim].join(" ")).replace(/\[KO: (.*?)\]/g, "<em>$1</em>").replace(/\[pause ([\d.]+)s\]/g, "<i>…</i>") }
function turnPause(sec) { if (listening && sec >= 1.2) { parts.push(`[pause ${sec.toFixed(1)}s]`); showHeard() } }
function listen(lang = "en-US") {
  if (!Rec) return;
  rec = new Rec(); rec.lang = lang; rec.continuous = lang === "en-US"; rec.interimResults = true;
  rec.onresult = e => {
    interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript.trim();
      if (e.results[i].isFinal) { if (t) parts.push(lang === "en-US" ? t : `[KO: ${t}]`); hitCheck() } else interim += t + " ";
    }
    showHeard();
  };
  rec.onerror = e => { if (e.error === "not-allowed") $("convErr").textContent = "마이크를 허용해 주세요." };
  rec.onend = () => {
    if (rec?.lang === "ko-KR" && koMode) { koMode = false; $("kobtn").textContent = "한국어로 말하기"; if (listening) listen() }
    else if (listening && !koMode) try { rec.start() } catch {}
  };
  rec.start();
}
// 막힌 말의 핵심 표현을 내가 실제로 말했는지 직접 본다 (Gemini 판정은 너무 후해서 쓰지 않음)
const norm = s => " " + s.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim() + " ";
const keyOf = t => norm(t.key || t.en.split(/\s+/).slice(0, 4).join(" "));
function hitCheck() {
  const said = norm(parts.join(" "));
  conv.tg.forEach(t => { if (!conv.hits[t.id] && said.includes(keyOf(t))) { conv.hits[t.id] = 1; chips(t.id) } });
}
function startTurn() {
  parts = []; interim = ""; spoke = false; quiet = 0; gapOpen = false; listening = true;
  setState(conv?.typed ? "글로 대화 중" : "듣는 중 · 다 말하면 누르기", true); $("mic").setAttribute("aria-label", "다 말했어요, 보내기");
  const voice = Rec && !conv?.typed;
  $("kobtn").hidden = !voice; $("end").hidden = false;
  if (voice) listen(); else $("tin").focus();
}
async function stopTurn() {
  listening = false; koMode = false;
  if (rec) { const r = rec; rec = null; await new Promise(res => { r.onend = res; try { r.stop() } catch { res() } setTimeout(res, 1500) }) }
  const text = [...parts, interim.trim()].filter(Boolean).join(" ").trim(); interim = "";
  return text;
}
async function aiTurn() {
  busy = true; setState("생각하는 중"); $("mic").disabled = true;
  try {
    const opener = S.memory ? "(The learner just arrived. Open by following up on one specific thing you remember about them, and ask about it in a way that gives them a reason to use one of today's sentences.)" : "(The learner just arrived. Start the conversation.)";
    const contents = [{ role: "user", parts: [{ text: opener }] }, ...conv.turns.map(t => ({ role: t.who === "ai" ? "model" : "user", parts: [{ text: t.text }] }))];
    const reply = await ask(persona(conv.scene), contents);
    conv.turns.push({ who: "ai", text: reply });
    $("line").className = "say"; $("line").textContent = reply; $("ko").textContent = ""; $("tr").textContent = "한국어로 보기"; $("lsub").hidden = false;
    setState("말하는 중"); await speak(reply);
    busy = false; $("mic").disabled = false;
    if (timeLeft() <= 0) return finish();
    startTurn();
  } catch (e) { busy = false; $("mic").disabled = false; $("convErr").textContent = e.message; setState("다시 누르면 이어서", false); conv.failed = true }
}
async function begin(unit) {
  $("convErr").textContent = ""; $("result").hidden = true;
  if (!S.key) { toast("AI 대화는 설정에서 Gemini 키를 넣으면 돼요"); return nav("set") }
  if (S.scene === "custom" && !S.custom && !unit) { $("customin").focus(); return toast("원하는 상황을 먼저 적어 주세요") }
  const sc = unit ? unit.scene : sceneId();
  const tg = unit ? shuffle(PH(unit)).slice(0, 3).map((p, i) => ({ id: "u" + i, en: p.en, ko: p.ko, uses: 0 })) : targets().map(t => ({ ...t }));
  conv = { scene: sc, unit, turns: [], t0: Date.now(), pauses: 0, ms: 0, tg, hits: {} };
  bars = []; draw(); renderToday();
  try { if (Rec || navigator.mediaDevices) await micOn() } catch { $("convErr").textContent = "마이크를 쓸 수 없어서 글로 대화해요." }
  conv.typed = !stream; $("wave").hidden = conv.typed; if (conv.typed) $("typed").hidden = false;
  $("totype").hidden = conv.typed;
  timer = setInterval(() => { tick(); if (timeLeft() <= 0 && listening && !busy) send() }, 250);
  await aiTurn();
}
const wrapKo = t => t.replace(/[가-힣][가-힣\s,.!?~]*/g, m => ` [KO: ${m.trim()}] `).replace(/\s+/g, " ").trim();
async function send(typed) {
  if (busy || !conv) return;
  let text = typed != null ? wrapKo(typed) : await stopTurn();
  if (typed != null) { listening = false; if (rec) await stopTurn() }
  $("heard").textContent = "";
  if (!text.replace(/\[pause [\d.]+s\]/g, "").trim()) { if (timeLeft() <= 0) return finish(); startTurn(); return }
  conv.turns.push({ who: "me", text }); hitCheck2(text);
  if (timeLeft() <= 0) return finish();
  await aiTurn();
}
function hitCheck2(text) { parts = [text]; hitCheck() }
$("typed").onsubmit = e => { e.preventDefault(); const v = $("tin").value.trim(); if (!v) return; $("tin").value = ""; send(v) };
$("mic").onclick = async () => {
  if (DEMO) return demoMic();
  if (!conv) return begin();
  if (busy) return;
  if (conv.failed) { conv.failed = false; $("convErr").textContent = ""; return conv.turns.at(-1)?.who === "me" ? aiTurn() : startTurn() }
  if (listening) return send();
  startTurn();
};
$("kobtn").onclick = () => {
  if (!listening || !Rec) return;
  koMode = true; $("kobtn").textContent = "한국어 듣는 중…";
  const r = rec; rec = null; if (r) { r.onend = () => listen("ko-KR"); r.stop() } else listen("ko-KR");
};
$("totype").onclick = async () => { if (!conv || conv.typed) return; if (listening) { const t = await stopTurn(); if (t.replace(/\[pause [\d.]+s\]/g, "").trim()) parts = [t] } conv.typed = true; micOff(); $("wave").hidden = true; $("typed").hidden = false; $("totype").hidden = true; $("kobtn").hidden = true; if (!busy) startTurn() };
$("end").onclick = async () => { if (!conv || busy) return; if (listening) { const t = await stopTurn(); if (t.replace(/\[pause [\d.]+s\]/g, "").trim()) conv.turns.push({ who: "me", text: t }) } finish() };

// 대화를 돌아보며 막힌 말을 뽑고, 써 본 말을 세고, 기억을 갱신한다
async function finish() {
  clearInterval(timer); listening = false; speechSynthesis.cancel();
  const c = conv; $("end").hidden = true; $("kobtn").hidden = true;
  setState("돌아보는 중"); $("mic").disabled = true; busy = true;
  const mine = c.turns.filter(t => t.who === "me");
  let out = { stuck: [], memory: S.memory, tip: "" };
  if (mine.length) {
    const transcript = c.turns.map(t => `${t.who === "ai" ? SCENES[c.scene].name : "Learner"}: ${t.text}`).join("\n");
    const sys = `You review a short English conversation with a Korean learner. In learner lines, [pause Ns] is silence and [KO: ...] is Korean they used because they could not say it in English.
Return JSON only: {"stuck":[{"en":"short natural English sentence the learner was trying to say","ko":"자연스러운 한국어 뜻","key":"the 2-5 word core expression inside en that is worth learning, copied exactly from en"}],"memory":"updated English notes about the learner's life and plans, max 600 characters, keep older facts that still matter; refer to the learner by name or as the learner, never with he/she/his/her","tip":"친구처럼 편한 해요체 한국어 한 문장(예: ~했어요, ~해 봐요): 오늘 잘한 점이나 다음에 해 볼 것"}
Rules for stuck: up to 4 items, only where the learner paused, switched to Korean, broke off, or said something clearly wrong. Each en is a complete sentence of at most 12 words they can reuse. Skip anything already saved or a close variant of it. Empty list if they spoke smoothly.
Already saved: ${S.stuck.filter(x => !x.done).map(x => x.en).join(" | ") || "none"}`;
    try {
      const raw = await ask(sys + `\nPrevious notes: ${S.memory || "none"}`, [{ role: "user", parts: [{ text: transcript }] }], true);
      const j = JSON.parse(raw.replace(/^```(json)?|```$/g, ""));
      out = { stuck: Array.isArray(j.stuck) ? j.stuck.filter(x => x?.en && x?.ko).slice(0, 4) : [], memory: typeof j.memory === "string" && j.memory ? j.memory : S.memory, tip: j.tip || "" };
    } catch (e) { $("convErr").textContent = e instanceof AIError ? e.message : "돌아보기를 읽지 못했어요. 대화 기록은 남겨 둘게요." }
  }
  const used = new Set(Object.keys(c.hits));
  S.stuck.forEach(x => { if (used.has(x.id)) { x.uses++; if (x.uses >= 2) { x.done = true; x.doneAt = today() } } });
  const have = new Set(S.stuck.map(x => x.en.toLowerCase()));
  const added = out.stuck.filter(x => !have.has(x.en.toLowerCase())).map((x, i) => ({ id: Date.now().toString(36) + i, en: x.en.trim(), ko: x.ko.trim(), key: typeof x.key === "string" && norm(x.en).includes(norm(x.key)) ? x.key.trim() : "", uses: 0, made: today() }));
  S.stuck.push(...added); S.memory = out.memory;
  const min = c.ms / 60000;
  markDay();
  if (mine.length) S.sessions.push({ date: today(), scene: c.scene, unit: c.unit?.id, turns: c.turns, pauses: c.pauses, min: +min.toFixed(2), typed: !!c.typed, added: added.length, used: [...used].length, tip: out.tip });
  save(); conv = null; busy = false; micOff(); $("mic").disabled = false; $("wave").hidden = false; $("totype").hidden = true;
  if (!/돌아보기|한도|키|인터넷|응답/.test($("convErr").textContent)) $("convErr").textContent = "";
  setState("대화 시작"); $("mic").setAttribute("aria-label", "대화 시작"); $("time").textContent = "3:00"; $("typed").hidden = true;
  $("result").hidden = false;
  $("result").innerHTML = mine.length
    ? `<b>${c.typed ? "글로 대화했어요" : `${c.pauses}번 멈췄어요${min > .2 ? ` · 1분에 ${(c.pauses / min).toFixed(1)}번` : ""}`}</b><span>${added.length ? `막혔던 말 ${added.length}개를 연습 칸에 넣었어요.` : "막힌 말이 없었어요."}${used.size ? ` 지난번 막힌 말을 ${used.size}번 썼어요.` : ""}</span>${out.tip ? `<span>${esc(out.tip)}</span>` : ""}${c.unit && mine.length >= 2 ? `<button class="btn" id="bossdone">매듭 풀기</button>` : added.length ? `<a class="btn" href="#review">복습하러 가기</a>` : ""}`
    : `<span>말한 게 없어서 기록하지 않았어요.</span>`;
  renderToday();
  if (c.unit && mine.length >= 2) $("bossdone").onclick = () => { L = { u: c.unit, s: STAGES.at(-1), q: [], i: 0, total: mine.length, first: 1, firstOk: 1, wrongs: 0, t0: c.t0, seen: new Set() }; talkUnit = null; showDone({}) };
}

// 예시(기획서 안 미리보기): 진짜 마이크로 파형·멈춤·써 볼 말만 보여 준다
let demoRun = null;
async function demoMic() {
  if (demoRun) return demoRun();
  conv = { scene: "me", turns: [], t0: Date.now(), pauses: 0, ms: 0, tg: targets().map(t => ({ ...t })), hits: {} };
  bars = []; parts = []; renderToday(); $("line").className = "say";
  try { await micOn() } catch { return demoPlay() }
  startTurn(); timer = setInterval(tick, 250);
  demoRun = async () => { clearInterval(timer); await stopTurn(); micOff(); conv = null; demoRun = null; setState("대화 시작"); $("time").textContent = "3:00"; $("end").hidden = $("kobtn").hidden = true };
}
function demoPlay() {
  conv = { scene: "me", turns: [], t0: Date.now(), pauses: 0, ms: 0, tg: targets().map(t => ({ ...t })), hits: {} };
  bars = []; parts = []; listening = true; spoke = false; quiet = 0; gapOpen = false; renderToday(); $("line").className = "say";
  setState("예시", true);
  const script = [["Yeah, so…", 1.4], [null, 1.6], ["[KO: 결국…]", .9], [null, 1.5], ["I ended up redoing the whole thing.", 2.4], ["It took me about two hours.", 2.3]];
  let i = 0, until = 0, f = 0, talking = false;
  const iv = setInterval(() => {
    f++; tick();
    if (f >= until) {
      if (i >= script.length) { clearInterval(iv); listening = false; setState("대화 시작"); $("time").textContent = "3:00"; conv = null; return }
      const [t, sec] = script[i++]; until = f + sec * 30; talking = !!t;
      if (t) { parts.push(t); showHeard(); hitCheck() }
    }
    push(talking ? .25 + Math.abs(Math.sin(f / 2.3)) * .5 * Math.random() + .1 : Math.random() * .03);
  }, 1000 / 30);
}
$("demo").onclick = () => { if (!conv) demoPlay() };


// ───── 공통: 효과음·토스트·연속일 ─────
let actxFx;
function fx(kind) {
  if (!S.prefs.sound) return;
  try {
    actxFx = actxFx || new AudioContext();
    const t0 = actxFx.currentTime, notes = { good: [660, 880], bad: [300, 240], done: [523, 659, 784, 1047], tap: [520] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = actxFx.createOscillator(), gn = actxFx.createGain(), t = t0 + i * (kind === "done" ? .11 : .09);
      o.type = kind === "bad" ? "triangle" : "sine"; o.frequency.value = f;
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(kind === "tap" ? .05 : .12, t + .015); gn.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(gn).connect(actxFx.destination); o.start(t); o.stop(t + .25);
    });
  } catch {}
}
let toastT;
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600) }
function markDay() { const d = today(); if (!S.days.includes(d)) S.days.push(d) }
function streak() {
  const set = new Set(S.days); let n = 0, d = new Date();
  if (!set.has(d.toLocaleDateString("sv"))) d.setDate(d.getDate() - 1);
  while (set.has(d.toLocaleDateString("sv"))) { n++; d.setDate(d.getDate() - 1) }
  return n;
}
const totalStars = () => Object.values(S.done).reduce((a, d) => a + (d.stars || 0), 0);
const speakOn = () => S.prefs.speak && !!Rec && Date.now() > S.off.speak;
const listenOn = () => S.prefs.listen && Date.now() > S.off.listen;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };

// ───── 배우기: 길 ─────
const PH = u => u.phrases.map((p, i) => ({ en: p[0], ko: p[1], u: u.id, i }));
const nodeKey = (u, k) => u.id + ":" + k;
const stagesOf = u => u.pron ? u.stages.map(([t, n]) => ({ k: t, name: n, icon: "ear" })) : STAGES;
const ORDER = () => UNITS.flatMap(u => stagesOf(u).map(s => ({ u, s })));
function nextNode() { return ORDER().find(({ u, s }) => !S.done[nodeKey(u, s.k)]) }
// 실타래: 한 가닥 실이 화면을 따라 흐르고, 그 위의 매듭을 하나씩 푼다
const knotSvg = (state, color, boss, seed) => {
  if (state === "done") return boss ? `<path d="${K.ornament(0, 0, 26)}" fill="${color}" opacity=".18"/><path d="${K.ornament(0, 0, 26)}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>${K.bead(0, 0, 9, "#f0a23b")}` : K.bead(0, 0, 15, color);
  const r = boss ? 26 : state === "open" ? 21 : 16;
  return `<path class="${state === "open" ? "spin" : ""}" d="${K.tangle(0, 0, r, seed)}" fill="none" stroke="${state === "open" ? color : "#c3c8c3"}" stroke-width="${state === "open" ? 4.5 : 3.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
};
function renderLearn() {
  header();
  const nx = nextNode(), stuck = S.stuck.filter(x => !x.done), td = today();
  const doneToday = Object.values(S.done).filter(d => d.at === td).length, talkedToday = S.sessions.some(s => s.date === td && !s.unit);
  const mini = (c, sd) => `<svg viewBox="-14 -14 28 28" width="26" height="26" aria-hidden="true"><path d="${K.tangle(0, 0, 11, sd)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  $("plan").innerHTML = `<h2>오늘 풀 매듭</h2><ol>
    <li class="${doneToday ? "ok" : ""}"><button data-go="next">${doneToday ? `<svg viewBox="-14 -14 28 28" width="26" height="26" aria-hidden="true">${K.bead(0, 0, 9, "#7fd1b9")}</svg>` : mini("#f0a23b", 1)}<span>${nx ? `${nx.u.title} · ${nx.s.name}` : "모든 매듭을 풀었어요"}</span><small>${doneToday ? `오늘 ${doneToday}개 풂` : "3~5분"}</small></button></li>
    ${stuck.length ? `<li><button data-go="stuck">${mini("#ff9f87", 3)}<span>대화에서 꼬인 말 ${stuck.length}개</span><small>2분</small></button></li>` : ""}
    <li class="${talkedToday ? "ok" : ""}"><a href="#talk"><i class="ph-fill ${talkedToday ? "ph-check-circle" : "ph-chats-circle"}"></i><span>${S.mode === "me" ? "내 이야기로" : "일상 상황으로"} 3분 말 걸기</span><small>${S.key ? "AI" : "키 필요"}</small></a></li></ol>`;
  const W = Math.max(300, $("path").clientWidth || 380), cx = W / 2, amp = Math.min(84, W * .22);
  let y = 30, k = 0, started = false;
  const pts = [], html = [];
  UNITS.forEach((u, ui) => {
    const st = stagesOf(u), doneN = st.filter(s => S.done[nodeKey(u, s.k)]).length, locked = started && !doneN;
    pts.push({ x: cx, y, c: u.color, on: !started });
    html.push(`<div class="uhead" style="--uc:${u.color};top:${y - 26}px"><div><small>타래 ${ui + 1} · ${doneN}/${st.length}</small><b>${u.title}</b></div>${locked && ui ? `<button class="jump" data-jump="${u.id}">건너뛰기 시험</button>` : ""}</div>`);
    y += 110;
    st.forEach((s, si) => {
      const d = S.done[nodeKey(u, s.k)], isNext = !d && !started; if (isNext) started = true;
      const state = d ? "done" : isNext ? "open" : "lock", boss = s.k === "boss", x = Math.round(cx + Math.sin(k * .95 + .6) * amp);
      pts.push({ x, y, c: u.color, on: !!d || isNext });
      const side = x >= cx ? "l" : "r";
      html.push(`<div class="knot ${state}${boss ? " boss" : ""}" style="left:${x}px;top:${y}px;--uc:${u.color}">
        ${isNext ? `<span class="go-tip">${boss ? "말 걸기" : "풀기"}</span>` : ""}
        <button data-u="${u.id}" data-k="${s.k}" aria-label="${u.title} ${s.name}${d ? ", 풀었음" : state === "lock" ? ", 아직 꼬여 있음" : ""}"><svg viewBox="-36 -36 72 72" aria-hidden="true">${knotSvg(state, u.color, boss, k * 1.7)}</svg></button>
        <span class="klabel ${side}"><b>${s.name}</b>${d ? `<i aria-label="구슬 ${d.stars}개">${[1, 2, 3].map(n => `<em class="${d.stars >= n ? "on" : ""}"></em>`).join("")}</i>` : ""}</span></div>`);
      y += boss ? 128 : 104; k++;
    });
  });
  const segs = pts.slice(1).map((b, i) => { const a = pts[i]; return `<path d="${K.link(a, b)}" stroke="${b.on ? b.c : "#cfd3cf"}" stroke-width="${b.on ? 6 : 4}" ${b.on ? "" : 'stroke-dasharray="2 10"'} fill="none" stroke-linecap="round"/>` }).join("");
  $("path").style.height = y + "px";
  $("path").innerHTML = `<svg class="cord" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}" aria-hidden="true">${segs}</svg>${html.join("")}`;
  if (lastCleared) { const b = $("path").querySelector(`[data-u="${lastCleared.u}"][data-k="${lastCleared.k}"]`); if (b) { b.parentElement.classList.add("pop"); b.scrollIntoView({ block: "center" }) } lastCleared = null }
  else $("path").querySelector(".knot.open")?.scrollIntoView({ block: "center" });
}
let lastCleared = null;
$("plan").onclick = e => {
  const b = e.target.closest("[data-go]"); if (!b) return;
  if (b.dataset.go === "stuck") return startReview("stuck");
  const nx = nextNode(); if (nx) openNode(nx.u, nx.s);
};
$("path").onclick = e => {
  const j = e.target.closest("[data-jump]");
  if (j) { const u = UNITS.find(x => x.id === j.dataset.jump); return sheet(`<h3>${u.title}부터 풀까요?</h3><p class="soft">앞 타래 표현으로 10문제를 풀어요. 2개까지 틀려도 통과예요. 통과하면 앞 타래는 다 푼 걸로 칠게요.</p><button class="btn wide" data-a="jump">시험 보기</button><button class="btn ghost wide" data-a="close">닫기</button>`, a => a === "jump" && startJump(u)) }
  const b = e.target.closest("button[data-u]"); if (!b) return;
  const u = UNITS.find(x => x.id === b.dataset.u), s = stagesOf(u).find(x => x.k === b.dataset.k);
  if (b.parentElement.classList.contains("lock")) { fx("bad"); b.animate([{ transform: "rotate(0)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(10deg)" }, { transform: "rotate(0)" }], 300); return toast("앞 매듭부터 풀어요") }
  openNode(u, s);
};
function sheet(html, onPick) {
  const el = document.createElement("div"); el.className = "sheet"; el.innerHTML = `<div role="dialog" aria-modal="true">${html}</div>`;
  const close = () => el.remove();
  el.onclick = e => { if (e.target === el) return close(); const b = e.target.closest("[data-a]"); if (!b) return; close(); onPick?.(b.dataset.a) };
  document.body.append(el); el.querySelector("button")?.focus();
}
function openNode(u, s) {
  if (s.k === "boss") {
    if (S.key) return sheet(`<h3>${u.title} · 말 걸기</h3><p class="soft">AI 상대와 이 장면으로 3분 대화하거나, 정해진 대본으로 연습해요.</p><button class="btn wide" data-a="ai"><i class="ph-fill ph-robot"></i>AI와 3분 대화</button><button class="btn ghost wide" data-a="script"><i class="ph-bold ph-scroll"></i>대본으로 연습</button>`, a => a === "ai" ? bossAI(u) : startLesson(u, s));
  }
  startLesson(u, s);
}
function bossAI(u) { talkUnit = u; nav("talk"); setTimeout(() => begin(u), 350) }

// ───── 레슨: 문제 만들기 ─────
const allPhrases = () => UNITS.filter(u => !u.pron).flatMap(PH);
function others(p, n, f) {
  const same = shuffle(allPhrases().filter(q => q.u === p.u && q[f] !== p[f])), rest = shuffle(allPhrases().filter(q => q.u !== p.u));
  return [...same, ...rest].map(q => q[f]).filter((v, i, a) => v !== p[f] && a.indexOf(v) === i).slice(0, n);
}
const toks = s => s.replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
const E = {
  learn: p => ({ t: "learn", p }),
  en2ko: p => ({ t: "pick", how: "en2ko", p, opts: shuffle([p.ko, ...others(p, 2, "ko")]), ans: p.ko }),
  ko2en: p => ({ t: "pick", how: "ko2en", p, opts: shuffle([p.en, ...others(p, 2, "en")]), ans: p.en }),
  hear2ko: p => ({ t: "pick", how: "hear2ko", p, opts: shuffle([p.ko, ...others(p, 3, "ko")]), ans: p.ko, ear: 1 }),
  hear2en: p => ({ t: "pick", how: "hear2en", p, opts: shuffle([p.en, ...others(p, 2, "en")]), ans: p.en, ear: 1 }),
  tiles: p => ({ t: "tiles", how: "ko", p, bank: shuffle([...toks(p.en), ...shuffle(others(p, 4, "en").flatMap(toks).filter(w => !toks(p.en).includes(w))).slice(0, 3)]) }),
  hearTiles: p => ({ t: "tiles", how: "ear", p, bank: shuffle([...toks(p.en), ...shuffle(others(p, 4, "en").flatMap(toks).filter(w => !toks(p.en).includes(w))).slice(0, 2)]), ear: 1 }),
  speak: p => ({ t: "speak", p, mouth: 1 }),
  pairs: ps => ({ t: "pairs", ps }),
  reply: (line, p) => ({ t: "reply", line, p, opts: shuffle([p.en, ...others(p, 2, "en")]), ans: p.en })
};
function buildLesson(u, k) {
  if (u.pron) {
    const ws = shuffle(W.filter(w => w[5] === k)).slice(0, 8);
    const items = ws.map(w => ({ t: "pron", w }));
    shuffle(ws).slice(0, 2).forEach(w => items.push({ t: "pronSay", w, mouth: 1 }));
    return items;
  }
  const P = PH(u), r = () => P[Math.floor(Math.random() * P.length)], a = P.slice(0, 3), b = P.slice(3);
  if (k === "meet1") return [E.learn(a[0]), E.en2ko(a[0]), E.learn(a[1]), E.ko2en(a[1]), E.learn(a[2]), E.pairs(a), E.tiles(a[2]), E.hear2ko(a[0])];
  if (k === "meet2") return [E.learn(b[0]), E.en2ko(b[0]), E.learn(b[1]), E.ko2en(b[1]), E.learn(b[2]), E.pairs(b), E.tiles(b[2]), E.hearTiles(b[0]), E.tiles(a[1])];
  if (k === "listen") return shuffle([E.hear2ko(P[0]), E.hear2en(P[1]), E.hearTiles(P[2]), E.hearTiles(P[3]), E.hear2ko(P[4]), E.hear2en(P[5]), E.hearTiles(r()), E.en2ko(r())]);
  if (k === "build") return shuffle([...shuffle(P).slice(0, 5).map(E.tiles), E.ko2en(r()), E.ko2en(r()), E.pairs(shuffle(P).slice(0, 3))]);
  if (k === "speak") return [...shuffle(P).slice(0, 5).map(E.speak), E.tiles(r()), E.hearTiles(r()), E.speak(r())];
  if (k === "boss") return [...u.talk.map(([line, i]) => E.reply(line, P[i])), E.speak(P[u.talk.at(-1)[1]])];
  return [];
}
// 말하기·듣기를 끈 상태면 같은 표현의 읽기 문제로 바꾼다
function adapt(x) {
  if (x.mouth && !speakOn()) return x.t === "pronSay" ? { t: "pron", w: x.w } : E.tiles(x.p);
  if (x.ear && !listenOn()) return x.how === "hear2ko" ? E.en2ko(x.p) : x.how === "hear2en" ? E.ko2en(x.p) : E.tiles(x.p);
  return x;
}

// ───── 레슨: 진행 ─────
let L = null;
// 레슨 위쪽 실: 맞힐수록 가운데 매듭이 풀린다
let kp = 0, kAnim;
function knotTo(p) {
  const el = $("lknot"), w = el.clientWidth || 300, h = 44, from = kp, t0 = performance.now();
  el.setAttribute("viewBox", `0 0 ${w} ${h}`);
  cancelAnimationFrame(kAnim);
  const step = now => {
    const t = Math.min(1, (now - t0) / 450), e = 1 - (1 - t) ** 3; kp = from + (p - from) * e;
    el.innerHTML = `<path d="${K.thread(w, h, 0)}" stroke="#dcdfdc" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${K.thread(w, h, kp)}" stroke="${L?.u.color || "#0b6e5b"}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${kp > .99 ? K.bead(w - 10, h / 2, 9, "#f0a23b") : ""}`;
    if (t < 1) kAnim = requestAnimationFrame(step);
  };
  kAnim = requestAnimationFrame(step);
}
function startLesson(u, s, items, extra = {}) {
  kp = 0;
  items = items || buildLesson(u, s.k);
  L = { u, s, q: items, i: 0, total: items.length, first: 0, firstOk: 0, wrongs: 0, t0: Date.now(), seen: new Set(), learned: 0, ...extra };
  nav("lesson"); renderEx();
}
function startReview(kind) {
  const src = kind === "stuck" ? S.stuck.filter(x => !x.done).map(x => ({ en: x.en, ko: x.ko, u: "stuck" })) : S.mist.map(en => allPhrases().find(p => p.en === en) || S.stuck.find(x => x.en === en)).filter(Boolean).map(p => ({ en: p.en, ko: p.ko, u: p.u || "stuck" }));
  if (!src.length) return toast(kind === "stuck" ? "대화를 하면 막혔던 말이 모여요" : "틀린 문제가 없어요");
  const ps = shuffle(src).slice(0, 6);
  const items = ps.flatMap((p, i) => i % 3 === 0 ? [E.tiles(p)] : i % 3 === 1 ? [E.ko2en(p), E.speak(p)] : [E.hearTiles(p)]);
  startLesson({ id: "review", title: kind === "stuck" ? "막혔던 말" : "틀린 문제", color: "#9a5a00" }, { k: kind, name: "복습" }, items, { review: kind });
}
function startJump(u) {
  const idx = UNITS.indexOf(u), pool = UNITS.slice(0, idx).filter(x => !x.pron).flatMap(PH);
  const items = shuffle(pool).slice(0, 10).map((p, i) => [E.tiles, E.ko2en, E.hear2en][i % 3](p));
  startLesson(u, { k: "jump", name: "건너뛰기 시험" }, items, { jump: u, lives: 2 });
}
const cur = () => L.q[L.i];
let pickVal = null, tilesSel = [], pairState = null, spokeOk = false;
function renderEx(dir) {
  if (L.i >= L.q.length) return finishLesson();
  const x = L.q[L.i] = adapt(L.q[L.i]);
  pickVal = null; tilesSel = []; spokeOk = false;
  knotTo(Math.min(L.i, L.total) / L.total);
  const f = $("lfoot"); f.className = "lfoot"; $("verdict").innerHTML = "";
  $("lcheck").textContent = x.t === "learn" ? "알겠어요" : "확인"; $("lcheck").disabled = x.t !== "learn";
  $("lskip").hidden = x.t === "learn";
  const ex = $("ex"); ex.classList.remove("out"); ex.style.animation = "none"; void ex.offsetWidth; ex.style.animation = "";
  const sayBtns = (t, big) => `<button class="say-btn${big ? " big" : ""}" data-say="${esc(t)}" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button><button class="say-btn slow" data-say="${esc(t)}" data-slow="1" aria-label="느리게 듣기">느리게</button>`;
  let h = "";
  if (x.t === "learn") h = `<span class="new"><i class="ph-fill ph-sparkle"></i>새 표현</span><div class="prompt">${sayBtns(x.p.en)}</div><div class="learn-en" lang="en">${esc(x.p.en)}</div><div class="learn-ko">${esc(x.p.ko)}</div>`;
  if (x.t === "pick") {
    const q = { en2ko: "무슨 뜻일까요?", ko2en: "영어로는 어떻게 말할까요?", hear2ko: "들리는 말의 뜻은?", hear2en: "들리는 말을 골라요" }[x.how];
    const top = x.how === "en2ko" ? `<div class="prompt">${sayBtns(x.p.en)}<div class="bubble" lang="en">${esc(x.p.en)}</div></div>` : x.how === "ko2en" ? `<div class="bubble" style="margin-bottom:18px">${esc(x.p.ko)}</div>` : `<div class="center">${sayBtns(x.p.en, 1)}</div>`;
    h = `<p class="qt">${q}</p>${top}<div class="opts">${x.opts.map((o, i) => `<button class="opt" data-o="${i}" ${/en$/.test(x.how) ? 'lang="en"' : ""}><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>${x.ear ? skipRow("ear") : ""}`;
  }
  if (x.t === "tiles") {
    h = `<p class="qt">${x.how === "ear" ? "들리는 대로 구슬을 꿰어요" : "구슬을 꿰어 영어로 말해요"}</p>${x.how === "ear" ? `<div class="center">${sayBtns(x.p.en, 1)}</div>` : `<div class="bubble">${esc(x.p.ko)}</div>`}
      <div class="answer" id="ans" lang="en"></div><div class="bank" id="bank" lang="en">${x.bank.map((w, i) => `<button class="tile" data-t="${i}" style="--r:${(i * 37 % 11) - 5}deg">${esc(w)}</button>`).join("")}</div>${x.ear ? skipRow("ear") : ""}`;
  }
  if (x.t === "speak") h = `<p class="qt">소리 내어 말해요</p><div class="prompt">${sayBtns(x.p.en)}<div class="bubble" lang="en">${esc(x.p.en)}<small>${esc(x.p.ko)}</small></div></div><button class="mic-big" id="smic" aria-label="말하기"><i class="ph-fill ph-microphone"></i></button><p class="heardw" id="sheard"></p>${skipRow("mouth")}`;
  if (x.t === "pairs") {
    const L2 = shuffle(x.ps.map((p, i) => ({ i, t: p.ko })));
    pairState = { a: null, left: x.ps.length };
    h = `<p class="qt">같은 뜻끼리 이어요</p><div class="pairs"><div class="opts">${x.ps.map((p, i) => `<button class="opt" data-pe="${i}" lang="en">${esc(p.en)}</button>`).join("")}</div><div class="opts">${L2.map(o => `<button class="opt" data-pk="${o.i}">${esc(o.t)}</button>`).join("")}</div></div>`;
  }
  if (x.t === "reply") h = `<p class="qt">대답을 골라요</p><div class="who" style="margin-bottom:14px"><div class="face">${(SCENES[L.u.scene] || SCENES.me).name[0]}</div><div class="bubble" lang="en" style="flex:1">${esc(x.line)}</div></div>
      <div class="prompt">${sayBtns(x.line)}</div><div class="opts">${x.opts.map((o, i) => `<button class="opt" data-o="${i}" lang="en"><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>`;
  if (x.t === "pron") {
    const [w, mean, wrong, right] = x.w, ans = right.replace(/[\[\]]/g, "");
    x.opts = x.opts || shuffle([ans, wrong]); x.ans = ans;
    h = `<p class="qt">어떻게 읽을까요?</p><div class="word" lang="en">${esc(w.replace(/[()]/g, ""))}</div>${mean === wrong ? "" : `<p class="soft" style="margin:0 0 16px">${esc(mean)}</p>`}<div class="opts">${x.opts.map((o, i) => `<button class="opt" data-o="${i}"><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>`;
  }
  if (x.t === "pronSay") h = `<p class="qt">맞는 발음으로 말해요</p><div class="word" lang="en">${x.w[0].replace(/\((.+?)\)/g, "<s>$1</s>")}</div><div class="prompt">${sayBtns(x.w[0].replace(/[()]/g, ""))}<span class="soft">${x.w[3].replace(/[\[\]]/g, "")} /${x.w[4]}/</span></div><button class="mic-big" id="smic" aria-label="말하기"><i class="ph-fill ph-microphone"></i></button><p class="heardw" id="sheard"></p>${skipRow("mouth")}`;
  ex.innerHTML = h;
  const auto = x.t === "learn" ? x.p.en : (x.ear || x.how === "en2ko") ? x.p.en : x.t === "reply" ? x.line : null;
  if (auto && S.prefs.auto && (listenOn() || x.t === "learn")) setTimeout(() => speak(auto, x.ear ? S.prefs.rate : undefined), 300);
}
const skipRow = kind => `<div class="skips">${kind === "ear" ? `<button data-off="listen"><i class="ph-bold ph-ear-slash"></i>지금 들을 수 없어요</button>` : `<button data-off="speak"><i class="ph-bold ph-microphone-slash"></i>지금 말할 수 없어요</button>`}</div>`;

$("ex").onclick = e => {
  const x = cur(); if (!x || $("lfoot").classList.contains("good") || $("lfoot").classList.contains("bad")) { if (!e.target.closest("[data-say]")) return }
  const sb = e.target.closest("[data-say]");
  if (sb) { sb.classList.add("playing"); speak(sb.dataset.say, sb.dataset.slow ? .6 : S.prefs.rate).then(() => sb.classList.remove("playing")); return }
  const off = e.target.closest("[data-off]");
  if (off) { const k = off.dataset.off; S.off[k] = Date.now() + 3600e3; save(); toast(k === "speak" ? "1시간 동안 말하기 문제를 빼요. 설정에서 계속 끌 수도 있어요." : "1시간 동안 듣기 문제를 빼요. 설정에서 계속 끌 수도 있어요."); return renderEx() }
  const o = e.target.closest("[data-o]");
  if (o) { fx("tap"); $("ex").querySelectorAll("[data-o]").forEach(b => b.classList.toggle("sel", b === o)); pickVal = +o.dataset.o; $("lcheck").disabled = false; return }
  const t = e.target.closest("[data-t]");
  if (t) {
    fx("tap");
    if (t.closest("#bank")) { tilesSel.push(+t.dataset.t); t.classList.add("used") }
    else { tilesSel.splice(tilesSel.indexOf(+t.dataset.t), 1); $("bank").querySelector(`[data-t="${t.dataset.t}"]`).classList.remove("used") }
    $("ans").innerHTML = tilesSel.map(i => `<button class="tile" data-t="${i}">${esc(x.bank[i])}</button>`).join("");
    $("lcheck").disabled = !tilesSel.length; return;
  }
  const pe = e.target.closest("[data-pe],[data-pk]");
  if (pe) {
    if (pe.dataset.pe != null) { $("ex").querySelectorAll("[data-pe]").forEach(b => b.classList.toggle("sel", b === pe)); pairState.a = +pe.dataset.pe; speak(x.ps[pairState.a].en); return }
    if (pairState.a == null) return;
    const kb = pe, ok = +kb.dataset.pk === pairState.a, eb = $("ex").querySelector(`[data-pe="${pairState.a}"]`);
    if (ok) { fx("good"); [kb, eb].forEach(b => { b.classList.remove("sel"); b.classList.add("right"); setTimeout(() => b.classList.add("gone"), 250) }); pairState.a = null; if (!--pairState.left) { $("lcheck").disabled = false; check() } }
    else { fx("bad"); kb.classList.add("wrong"); setTimeout(() => kb.classList.remove("wrong"), 400); pairState.miss = 1 }
    return;
  }
  const mic = e.target.closest("#smic"); if (mic) listenOnce(mic, x);
};
function listenOnce(btn, x) {
  if (!Rec) return;
  const target = x.t === "pronSay" ? x.w[0].replace(/[()]/g, "") : x.p.en, r = new Rec(); r.lang = "en-US"; r.maxAlternatives = 4;
  btn.classList.add("on"); $("sheard").textContent = "듣는 중…";
  r.onresult = e => {
    const alts = [...e.results[0]].map(a => a.transcript), want = words(target);
    const best = alts.map(a => { const left = words(a); return want.map(w => { const k = left.indexOf(w); if (k >= 0) { left.splice(k, 1); return [w, 1] } return [w, 0] }) }).sort((a, b) => b.filter(z => z[1]).length - a.filter(z => z[1]).length)[0];
    const rate = best.filter(z => z[1]).length / want.length;
    $("sheard").innerHTML = best.map(([w, ok]) => `<span class="${ok ? "ok" : "no"}">${esc(w)}</span>`).join(" ");
    spokeOk = rate >= .7; $("lcheck").disabled = false;
    if (spokeOk) check();
  };
  r.onerror = e => { $("sheard").textContent = e.error === "not-allowed" ? "마이크를 허용해 주세요" : "잘 안 들렸어요. 다시 눌러 말해요" };
  r.onend = () => btn.classList.remove("on");
  r.start();
}
const words = s => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
function judge(x) {
  if (x.t === "learn") return true;
  if (x.t === "pick" || x.t === "reply" || x.t === "pron") return x.opts[pickVal] === x.ans;
  if (x.t === "tiles") return words(tilesSel.map(i => x.bank[i]).join(" ")).join(" ") === words(x.p.en).join(" ");
  if (x.t === "speak" || x.t === "pronSay") return spokeOk;
  if (x.t === "pairs") return !pairState.miss;
}
function answerText(x) { return x.t === "pron" ? `${x.ans} · ${x.w[6]}` : x.t === "pronSay" ? x.w[3].replace(/[\[\]]/g, "") : x.ans || x.p?.en || "" }
function check(skipped) {
  const x = cur(), f = $("lfoot");
  if (f.classList.contains("good") || f.classList.contains("bad")) return next();
  const ok = !skipped && judge(x);
  if (!L.seen.has(L.i)) { L.seen.add(L.i); if (x.t !== "learn") { L.first++; if (ok) L.firstOk++ } }
  if (x.t === "learn") return next();
  $("ex").querySelectorAll("[data-o]").forEach(b => { if (x.opts?.[+b.dataset.o] === x.ans) b.classList.add("right"); else if (b.classList.contains("sel")) b.classList.add("wrong") });
  f.classList.add(ok ? "good" : "bad"); fx(ok ? "good" : "bad");
  const lk = $("lknot"); lk.classList.remove("tug", "loose"); void lk.getBoundingClientRect(); lk.classList.add(ok ? "loose" : "tug");
  if (ok) knotTo(Math.min(L.i + 1, L.total) / L.total);
  const praise = ["술술 풀렸어요!", "매끄러워요!", "구슬이 꿰어졌어요!", "좋아요!"][Math.floor(Math.random() * 4)];
  $("verdict").innerHTML = ok ? `<b><i class="ph-fill ph-check-circle"></i>${praise}</b>${x.ear || x.t === "speak" ? `<p lang="en">${esc(x.p.en)}</p>` : ""}${x.t === "pron" ? `<p>${esc(x.w[6])}</p>` : ""}`
    : `<b><svg viewBox="-14 -14 28 28" width="24" height="24" aria-hidden="true"><path d="${K.tangle(0, 0, 11, 2)}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>${skipped ? "끝에 다시 풀어요" : "여기서 꼬였어요"}</b><p lang="en">${esc(answerText(x))}</p>`;
  $("lcheck").disabled = false; $("lcheck").textContent = "계속";
  if (!ok) {
    L.wrongs++;
    if (x.p && !L.review) { if (!S.mist.includes(x.p.en)) S.mist.push(x.p.en); S.mist = S.mist.slice(-60) }
    if (L.jump && L.wrongs > L.lives) { save(); return setTimeout(() => showDone({ fail: true }), 900) }
    if (!L.jump && !x.again) L.q.push({ ...x, again: 1, opts: x.opts && shuffle(x.opts) });
  } else if (L.review === "mist" && x.p) S.mist = S.mist.filter(m => m !== x.p.en);
  if (ok && (x.t === "speak" || x.ear)) speak(x.p.en);
  save();
}
function next() { if (!L || L.adv) return; L.adv = true; $("ex").classList.add("out"); setTimeout(() => { if (!L) return; L.adv = false; L.i++; renderEx() }, 180) }
$("lcheck").onclick = () => { if (L && !L.adv) check() };
$("lskip").onclick = () => { if (L && !L.adv) check(true) };
$("lclose").onclick = () => sheet(`<h3>그만할까요?</h3><p class="soft">지금 그만두면 이 매듭은 다시 엉켜요.</p><button class="btn wide" data-a="stay">계속하기</button><button class="btn ghost wide" data-a="quit">그만하기</button>`, a => { if (a === "quit") { speechSynthesis.cancel(); L = null; nav("learn") } });
addEventListener("keydown", e => {
  if ($("v-lesson").hidden || document.querySelector(".sheet") || e.target.closest("input")) return;
  if (e.key === "Enter" && !$("lcheck").disabled) { e.preventDefault(); $("lcheck").click() }
  else if (/^[1-9]$/.test(e.key)) $("ex").querySelector(`[data-o="${+e.key - 1}"]`)?.click();
  else if (e.key === " ") { const b = $("ex").querySelector("[data-say]:not(.slow)"); if (b) { e.preventDefault(); b.click() } }
});

// ───── 레슨 끝 ─────
function finishLesson() { showDone({}) }
function showDone({ fail }) {
  const acc = L.first ? L.firstOk / L.first : 1, stars = acc >= .95 ? 3 : acc >= .75 ? 2 : 1, sec = Math.round((Date.now() - L.t0) / 1000);
  markDay();
  let title = L.s.k === "boss" ? "타래 하나를 다 풀었어요" : "매듭을 풀었어요", sub = L.s.k === "boss" ? `${L.u.title} · 매듭 장식을 얻었어요` : `${L.u.title} · ${L.s.name}`, btn = "계속";
  if (fail) { title = "아직 꼬여 있어요"; sub = "앞 타래부터 차근차근 풀어요" }
  else if (L.jump) { const idx = UNITS.indexOf(L.jump); UNITS.slice(0, idx).forEach(u => stagesOf(u).forEach(s => S.done[nodeKey(u, s.k)] = S.done[nodeKey(u, s.k)] || { stars: 1, at: today() })); title = "건너뛰기 통과"; sub = `${L.jump.title}부터 풀어요` }
  else if (L.review) { title = "꼬인 말을 풀었어요"; sub = L.u.title }
  else { const key = nodeKey(L.u, L.s.k), old = S.done[key]; S.done[key] = { stars: Math.max(stars, old?.stars || 0), at: today() }; lastCleared = { u: L.u.id, k: L.s.k } }
  save();
  const learned = L.q.filter(x => x.t === "learn").length;
  const boss = L.s.k === "boss" && !L.review && !L.jump && !fail, uc = L.u.color || "#0b6e5b";
  $("v-done").innerHTML = `<svg class="untie" id="untie" viewBox="0 0 300 120" aria-hidden="true"></svg><h1>${title}</h1><p class="soft">${sub}</p>
    ${fail || L.jump ? "" : `<div class="beads" aria-label="구슬 ${stars}개">${[1, 2, 3].map(n => `<em class="${stars >= n ? "on" : ""}"></em>`).join("")}</div>`}
    <div class="dstats"><div><b>${Math.round(acc * 100)}%</b><span>첫 시도에 맞힘</span></div><div><b>${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}</b><span>걸린 시간</span></div><div><b>${learned || L.total}</b><span>${learned ? "새 구슬" : "문제"}</span></div></div>
    <button class="btn" id="donego">${btn}</button>`;
  untie($("untie"), uc, fail, boss);
  nav("done"); fx(fail ? "bad" : "done");
  $("donego").onclick = () => { const back = L?.review ? "review" : "learn"; L = null; nav(back) };
}
// 끝 화면: 엉킨 실이 스르르 풀려 곧게 펴지고 구슬이 꿰인다 (실전이면 매듭 장식을 맺는다)
function untie(svg, color, fail, boss) {
  const w = 300, h = 120, t0 = performance.now(), dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 1300;
  const f = now => {
    const t = Math.min(1, (now - t0) / dur), e = fail ? .25 * t : 1 - (1 - t) ** 3;
    let out = `<path d="${K.thread(w, h, e, 4)}" stroke="${fail ? "#c3c8c3" : color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (t === 1 && !fail) out = boss ? `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path class="draw" d="${K.ornament(w / 2, h / 2, 46)}" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><g class="popin">${K.bead(w / 2, h / 2, 13, "#f0a23b")}</g>`
      : out + `<g class="popin">${K.bead(w / 2, h / 2, 16, color)}</g>`;
    svg.innerHTML = out;
    if (t < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

// ───── 복습 ─────
function renderReview() {
  header();
  const list = S.stuck.filter(x => !x.done);
  $("revStuck").disabled = !list.length;
  $("stucklist").innerHTML = list.length ? list.map(x => `<article class="card"><svg class="ck" viewBox="-14 -14 28 28" aria-hidden="true"><path d="${K.tangle(0, 0, 11, x.en.length)}" fill="none" stroke="#f0a23b" stroke-width="2.4" stroke-linecap="round"/></svg><div class="k">${esc(x.ko)}</div><div class="e" lang="en">${esc(x.en)}</div><div class="meta"><span>대화에서 ${x.uses}/2번${x.key ? ` · 핵심: ${esc(x.key)}` : ""}</span><button class="link" data-del="${x.id}" style="color:var(--muted)">빼기</button></div></article>`).join("")
    : `<p class="none" style="margin-top:12px">${S.sessions.length ? "지금은 꼬인 말이 없어요." : "말 걸기를 한 번 하면 꼬인 말이 여기 모여요."}</p>`;
  $("mistinfo").textContent = S.mist.length ? `${S.mist.length}개가 모여 있어요. 맞히면 목록에서 빠져요.` : "아직 틀린 문제가 없어요.";
  $("revMist").disabled = !S.mist.length;
}
$("revStuck").onclick = () => startReview("stuck");
$("revMist").onclick = () => startReview("mist");
$("stucklist").onclick = e => { const b = e.target.closest("[data-del]"); if (!b) return; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "정말 빼기"; return } S.stuck = S.stuck.filter(x => x.id !== b.dataset.del); save(); renderReview() };

// ───── 기록 ─────
function renderLog() {
  header();
  $("lognums").innerHTML = `<div><b>${Object.keys(S.done).length}</b><span>푼 매듭</span></div><div><b>${S.sessions.length}</b><span>말 걸기</span></div><div><b>${S.stuck.filter(x => x.done).length}</b><span>풀린 꼬인 말</span></div>`;
  $("shelf").innerHTML = UNITS.map(u => { const all = stagesOf(u).every(s => S.done[nodeKey(u, s.k)]); return `<div class="${all ? "got" : ""}"><svg viewBox="-34 -34 68 68" aria-hidden="true">${all ? `<path d="${K.ornament(0, 0, 28)}" fill="${u.color}" fill-opacity=".14" stroke="${u.color}" stroke-width="3.5"/>${K.bead(0, 0, 7, "#f0a23b")}` : `<path d="${K.tangle(0, 0, 20, u.title.length)}" fill="none" stroke="#cfd3cf" stroke-width="3" stroke-linecap="round"/>`}</svg><span>${u.title}</span></div>` }).join("");
  const ss = S.sessions.filter(s => !s.typed).slice(-14), rate = s => s.min > .2 ? s.pauses / s.min : s.pauses, max = Math.max(1, ...ss.map(rate));
  $("chart").innerHTML = ss.length ? ss.map(s => `<div title="${s.date}"><span>${rate(s).toFixed(1)}</span><i style="height:${Math.max(3, 100 * rate(s) / max)}%"></i>${s.date.slice(5).replace("-", ".")}</div>`).join("") : `<p class="none" style="align-self:center;flex:1">대화를 하면 막대가 생겨요.</p>`;
  $("slist").innerHTML = S.sessions.slice().reverse().map(s => `<details class="sess"><summary>${s.date.slice(5).replace("-", ".")} ${SCENES[s.scene]?.ko || ""}<span>${s.typed ? "글로" : `멈춤 ${s.pauses}`} · 새로 막힌 말 ${s.added}</span></summary><ol>${s.turns.map(t => `<li class="${t.who}" lang="en">${esc(t.text)}</li>`).join("")}</ol></details>`).join("") || `<p class="none">아직 대화가 없어요.</p>`;
}

// ───── 설정 ─────
function renderSet() {
  header();
  document.querySelectorAll(".sw").forEach(b => b.setAttribute("aria-checked", !!S.prefs[b.dataset.p]));
  [...$("rate").children].forEach(b => b.setAttribute("aria-pressed", +b.dataset.r === S.prefs.rate));
  const offs = [Date.now() < S.off.speak && "말하기", Date.now() < S.off.listen && "듣기"].filter(Boolean);
  $("offinfo").innerHTML = offs.length ? `지금 ${offs.join("·")} 문제를 잠시 빼고 있어요. <button class="link" id="offclear">다시 켜기</button>` : "";
  if (offs.length) $("offclear").onclick = () => { S.off = { speak: 0, listen: 0 }; save(); renderSet() };
  [...$("modes2").children].forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === S.mode));
  fillProf($("prof2")); $("saved").textContent = "";
  $("keyinfo").textContent = S.key ? `넣어 둔 키: …${S.key.slice(-4)} · 모델 ${S.model}` : "아직 키가 없어요.";
}
document.querySelectorAll(".sw").forEach(b => b.onclick = () => { const k = b.dataset.p; if (k === "speak" && !Rec && !S.prefs.speak) return toast("이 브라우저는 말하기를 못 들어요. 크롬에서 써 주세요"); S.prefs[k] = !S.prefs[k]; save(); fx("tap"); renderSet() });
$("rate").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.prefs.rate = +b.dataset.r; save(); renderSet(); speak("This is how fast I speak.") };
$("modes2").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.mode = b.dataset.mode; save(); renderSet() };
$("prof2").onsubmit = e => { e.preventDefault(); readProf($("prof2")); $("saved").textContent = "저장했어요" };
$("keyok2").onclick = () => setKey($("key2"), $("keyerr2"), $("keyok2"), renderSet);
$("reset").onclick = () => {
  const b = $("reset");
  if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "한 번 더 누르면 다 지워요"; return }
  try { localStorage.removeItem("sulsul") } catch {}
  S = fresh(); delete b.dataset.sure; b.textContent = "모든 기록 지우기"; history.replaceState(null, "", location.pathname); show("start");
};

speechSynthesis?.getVoices();
if (!Rec) S.prefs.speak = false;
show(location.hash.slice(1) || "learn");
