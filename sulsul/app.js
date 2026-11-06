"use strict";
// ───── 저장 ─────
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DEMO = new URLSearchParams(location.search).has("demo");
const today = () => new Date().toLocaleDateString("sv");
const fresh = () => ({ mode: null, profile: {}, scene: "auto", custom: "", memory: "", stuck: [], sessions: [], key: "", model: "", done: {}, mist: [], days: [], visited: {}, note: [], ng: [], lines: [], prefs: { speak: true, listen: true, auto: true, sound: true, rate: .9 }, off: { speak: 0, listen: 0 } });
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
const VIEWS = ["start", "learn", "talk", "review", "log", "set", "scene"];
const RENDER = { learn: () => renderDay(), talk: () => renderToday(), review: () => renderNote(), log: () => renderLog(), set: () => renderSet(), start: () => startStep(1) };
let curView = null;
function show(v) {
  if (!S.mode && !DEMO) v = "start";
  if (!VIEWS.includes(v)) v = "learn";
  if (v === "scene" && !SC) v = "learn";
  curView = v;
  VIEWS.forEach(x => $("v-" + x).hidden = x !== v);
  const bare = v === "start" || v === "scene";
  $("tabs").hidden = bare; $("topbar").hidden = v === "scene";
  [...$("tabs").children].forEach(b => b.dataset.v === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  RENDER[v]?.();
  scrollTo(0, 0);
}
// 화면 전환: 되는 브라우저는 View Transitions, 아니면 살짝 올라오는 효과
let vt = null;
function nav(v) {
  if (v === curView) return;
  vt?.skipTransition(); vt = null;
  const quick = v === "scene" || curView === "scene";
  if (document.startViewTransition && !quick && !matchMedia("(prefers-reduced-motion: reduce)").matches) { vt = document.startViewTransition(() => show(v)); vt.finished.finally(() => vt = null) }
  else { show(v); const el = $("v-" + curView); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter") }
  if (!["scene", "start"].includes(v) && location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
}
$("tabs").onclick = e => { const b = e.target.closest("button"); if (b) { fx("tap"); nav(b.dataset.v) } };
addEventListener("hashchange", () => nav(location.hash.slice(1)));
function header() {
  $("stats").innerHTML = S.mode ? `<span title="연속으로 한 날"><i class="ph-fill ph-flame"></i>${streak()}</span><span title="다녀온 장면"><i class="ph-fill ph-map-pin"></i>${Object.keys(S.visited).length}</span>` : "";
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
addEventListener("resize", () => { size(); if (curView === "learn" && innerWidth !== lastW) { lastW = innerWidth; renderDay() } });
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
  const tg = targets().map(t => ({ ...t }));
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
    ? `<b>${c.typed ? "글로 대화했어요" : `${c.pauses}번 멈췄어요${min > .2 ? ` · 1분에 ${(c.pauses / min).toFixed(1)}번` : ""}`}</b><span>${added.length ? `막혔던 말 ${added.length}개를 연습 칸에 넣었어요.` : "막힌 말이 없었어요."}${used.size ? ` 지난번 막힌 말을 ${used.size}번 썼어요.` : ""}</span>${out.tip ? `<span>${esc(out.tip)}</span>` : ""}${added.length ? `<a class="btn" href="#review">수첩 보기</a>` : ""}`
    : `<span>말한 게 없어서 기록하지 않았어요.</span>`;
  renderToday();
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
const speakOn = () => S.prefs.speak && !!Rec && Date.now() > S.off.speak;
const listenOn = () => S.prefs.listen && Date.now() > S.off.listen;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };

// ───── 기록 ─────
function renderLog() {
  header();
  $("lognums").innerHTML = `<div><b>${Object.keys(S.visited).length}</b><span>다녀온 장면</span></div><div><b>${S.sessions.length}</b><span>말 걸기</span></div><div><b>${S.lines.length}</b><span>내가 한 말</span></div>`;
  const been = SCENE_LIST.filter(sc => S.visited[sc.id] && sc.img);
  $("shelf").innerHTML = been.length ? been.map(sc => `<figure><img src="${sc.img}" alt="${sc.title} 그림엽서" loading="lazy" style="object-position:${sc.pos || "50% 50%"}"><figcaption>${sc.time} ${sc.title}<small>${S.visited[sc.id].slice(5).replace("-", ".")}</small></figcaption></figure>`).join("") : `<p class="none">장면을 다녀오면 그림엽서가 모여요.</p>`;
  const ss = S.sessions.filter(s => !s.typed).slice(-14), rate = s => s.min > .2 ? s.pauses / s.min : s.pauses, max = Math.max(1, ...ss.map(rate));
  $("chart").innerHTML = ss.length ? ss.map(s => `<div title="${s.date}"><span>${rate(s).toFixed(1)}</span><i style="height:${Math.max(3, 100 * rate(s) / max)}%"></i>${s.date.slice(5).replace("-", ".")}</div>`).join("") : `<p class="none" style="align-self:center;flex:1">말 걸기를 하면 막대가 생겨요.</p>`;
  $("slist").innerHTML = S.sessions.slice().reverse().map(s => `<details class="sess"><summary>${s.date.slice(5).replace("-", ".")} ${SCENES[s.scene]?.ko || ""}<span>${s.typed ? "글로" : `멈춤 ${s.pauses}`} · 막힌 말 ${s.added}</span></summary><ol>${s.turns.map(t => `<li class="${t.who}" lang="en">${esc(t.text)}</li>`).join("")}</ol></details>`).join("") || `<p class="none">아직 말 걸기를 안 했어요.</p>`;
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
