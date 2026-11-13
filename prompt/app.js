const MAX = 3;
const W = { met: 1, partial: 0.5, missing: 0 };
const MARK = { met: "○", partial: "△", missing: "✕" };
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = n => String(n).padStart(2, "0");
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
let P = [];

// 채점은 노트북 서버(실행.bat)가 한다. 창업실에서는 실행.bat으로 연 기기만 서버를 찾는다
// (다른 방문자에게 '내 컴퓨터 접속 허용' 질문이 뜨지 않게).
const LOCAL = location.port === "47321";
if (!LOCAL && new URLSearchParams(location.search).has("local")) store.set("pp:local", 1);
const API = LOCAL ? "" : store.get("pp:local") ? "http://127.0.0.1:47321" : null;
let online = false;
const call = (path, body) => fetch(API + path, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body), targetAddressSpace: "loopback",
});

const attempt = p => store.get("pp:a:" + p.id) || { turns: [], graded: false };
const saveAttempt = (p, a) => store.set("pp:a:" + p.id, a);
const score = items => Math.round(items.reduce((s, i) => s + W[i.status], 0) / items.length * 100);

// 자료 표시([보고서] 등)를 파란 칩으로
function rich(p, text) {
  let h = esc(text);
  for (const t of p.tokens) h = h.split(esc(t.token)).join(`<span class="chip">${esc(t.label.replace(/ 넣기$/, ""))}</span>`);
  return h;
}

async function boot() {
  P = (await (await fetch("problems.json")).json()).problems;
  addEventListener("hashchange", route);
  route();
  if (API == null) return;
  online = await call("/api/ping", {}).then(r => r.ok, () => false);
  if (!online) return;
  route();
  setInterval(() => call("/api/ping", {}).catch(() => {}), 60000);
}

function route() {
  const p = P.find(x => x.id === location.hash.slice(2));
  p ? showProblem(p) : showHome();
}

function showHome() {
  document.title = "프롬프트 연습";
  $("#app").innerHTML = `
    <div class="home">
      <div class="home-head">
        <h1>프롬프트<br><b>연습</b></h1>
        <div class="demo">이 페이지 <span class="fix"><s>똑같이</s><b>사진대로</b></span> 만들어 줘.<span class="add">+ 빈 자리에 마우스를 올리면 자리 정보가 떠.</span></div>
        <p>${API == null ? "Claude에게 일을 맡기는 말을 써요. 다 쓰면 모범 답안과 나란히 놓고 스스로 채점해요." : "Claude에게 일을 맡기는 말을 써요. 보내면 Claude가 만들 결과를 미리 보여 줘요. 세 번 안에 원하는 결과를 끌어내세요."}</p>
        <div class="who">Claude 기준</div>
      </div>
      <ol class="list">${P.map((p, i) => {
        const best = store.get("pp:best:" + p.id), a = attempt(p), going = a.turns.length && !a.graded;
        return `<li><a href="#/${p.id}">
          <span class="no">${pad(i + 1)}</span>
          <span><div class="kind">${esc(p.type)}</div><div class="title">${esc(p.title)}</div></span>
          <span class="best${best == null ? " none" : ""}">${best == null ? "—" : best}${going ? "<small>푸는 중</small>" : ""}</span>
        </a></li>`;
      }).join("")}</ol>
    </div>`;
}

function showProblem(p) {
  const i = P.indexOf(p), a = attempt(p);
  document.title = `${p.title} · 프롬프트 연습`;
  $("#app").innerHTML = `
    <div class="top"><button class="back">← 목록</button><span class="no">${pad(i + 1)}</span><span class="kind">${esc(p.type)}</span><span class="title">${esc(p.title)}</span></div>
    <div id="body"></div>`;
  $(".back").onclick = () => { location.hash = ""; };
  a.graded ? showMark(p, a) : showWork(p, a);
}

function resetMaterial(p) { (p.materialReset || []).forEach(k => store.del(k)); }

function showWork(p, a) {
  const body = $("#body");
  body.className = "work";
  body.innerHTML = `
    <div class="view">
      <iframe src="${esc(p.material)}" title="자료"></iframe>
      <div class="bar"><span>${esc(p.materialHint || "")}</span>${p.materialHint ? `<button class="reload">↻ 처음 상태로</button>` : ""}</div>
    </div>
    <div class="sheet"><div class="paper">
      <div class="thread"><div class="brief">${esc(p.brief)}</div><div class="turns"></div></div>
      <div class="compose"></div>
    </div></div>`;
  if (p.materialHint) $(".reload").onclick = () => { resetMaterial(p); $("iframe").src = p.material + "?" + Date.now(); };

  let busy = null; // 보내는 중인 말
  const turnsEl = $(".turns"), thread = $(".thread"), compose = $(".compose");

  function drawTurns() {
    turnsEl.innerHTML = a.turns.map((t, k) => `
      <div class="turn"><div class="n">${k + 1}</div><div>
        <div class="msg">${rich(p, t.msg)}</div>
        <div class="res"><div class="lab">결과 예상</div>${t.changed ? `<div class="chg">${esc(t.changed)}</div>` : ""}
          <ul>${t.result.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>
      </div></div>`).join("") + (busy == null ? "" : `
      <div class="turn"><div class="n">${a.turns.length + 1}</div><div>
        <div class="msg">${rich(p, busy)}</div>
        <div class="res wait"><div class="lab">결과 예상하는 중 <span class="sec"></span></div></div>
      </div></div>`);
    thread.scrollTop = thread.scrollHeight;
  }

  function drawCompose(keep = "", error = "") {
    if (!online) return drawSelf(keep);
    const slots = `<div class="slots">${[1, 2, 3].map(n => `<i class="${n <= a.turns.length ? "used" : ""}">${n}</i>`).join("")}</div>`;
    if (a.turns.length >= MAX && busy == null) {
      compose.innerHTML = `<div class="row">${slots}<button class="send">채점 보기</button></div>`;
      $(".send", compose).onclick = finish;
      return;
    }
    compose.innerHTML = `
      ${p.tokens.length ? `<div class="tokens">${p.tokens.map(t => `<button data-t="${esc(t.token)}">+ ${esc(t.label.replace(/ 넣기$/, ""))}</button>`).join("")}</div>` : ""}
      <textarea placeholder="${a.turns.length ? "이어서 보낼 말" : "Claude에게 보낼 말"}"></textarea>
      <div class="row">${slots}<span class="key">Ctrl+Enter</span>
        <button class="ghost"${a.turns.length && busy == null ? "" : " hidden"}>여기서 채점</button>
        <button class="send"${busy == null ? "" : " disabled"}>보내기</button></div>
      <div class="err"${error ? "" : " hidden"}>${esc(error)}</div>`;
    const ta = $("textarea", compose);
    ta.value = keep;
    ta.disabled = busy != null;
    compose.querySelectorAll(".tokens button").forEach(b => b.onclick = () => {
      const s = ta.selectionStart, t = b.dataset.t + " ";
      ta.value = ta.value.slice(0, s) + t + ta.value.slice(ta.selectionEnd);
      ta.focus(); ta.selectionStart = ta.selectionEnd = s + t.length;
    });
    ta.onkeydown = e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(ta.value); } };
    $(".send", compose).onclick = () => send(ta.value);
    $(".ghost", compose).onclick = finish;
  }

  async function send(text) {
    const msg = text.trim();
    if (!msg || busy != null) return;
    busy = msg; drawTurns(); drawCompose();
    const t0 = Date.now();
    const tick = setInterval(() => { const s = $(".sec"); if (s) s.textContent = `${Math.round((Date.now() - t0) / 1000)}초`; }, 1000);
    let error = "";
    try {
      const r = await call("/api/send", { pid: p.id, turns: a.turns.map(t => ({ msg: t.msg, result: t.result })), msg })
        .catch(() => { throw new Error("노트북 서버가 꺼져 있어요. 실행.bat을 켜 주세요."); });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "결과를 받아 오지 못했어요. 다시 보내 주세요.");
      a.turns.push({ msg, result: d.result, changed: d.changed, items: d.items });
      saveAttempt(p, a);
    } catch (e) { error = e.message; }
    clearInterval(tick);
    busy = null; drawTurns(); drawCompose(error ? msg : "", error);
    if (!error) $("textarea", compose)?.focus();
  }

  // 서버 없이: 한 번 쓰고 모범 답안과 비교해 스스로 채점
  function drawSelf(keep) {
    compose.innerHTML = `
      ${p.tokens.length ? `<div class="tokens">${p.tokens.map(t => `<button data-t="${esc(t.token)}">+ ${esc(t.label.replace(/ 넣기$/, ""))}</button>`).join("")}</div>` : ""}
      <textarea placeholder="Claude에게 보낼 말"></textarea>
      <div class="row"><span class="note">${API == null ? "여기서는 모범 답안과 비교해 스스로 채점해요" : "실행.bat을 켜면 Claude가 결과를 예상해 줘요"}</span>
        <button class="send">모범 답안과 비교</button></div>`;
    const ta = $("textarea", compose);
    ta.value = keep;
    compose.querySelectorAll(".tokens button").forEach(b => b.onclick = () => {
      const s = ta.selectionStart, t = b.dataset.t + " ";
      ta.value = ta.value.slice(0, s) + t + ta.value.slice(ta.selectionEnd);
      ta.focus(); ta.selectionStart = ta.selectionEnd = s + t.length;
    });
    $(".send", compose).onclick = () => {
      const msg = ta.value.trim();
      if (!msg) return;
      a.turns = [{ msg, result: null }]; a.self = true; a.graded = true; a.marks = p.items.map(() => "missing");
      saveAttempt(p, a); showMark(p, a);
    };
  }

  function finish() {
    a.graded = true; saveAttempt(p, a);
    const s = score(a.turns[a.turns.length - 1].items), best = store.get("pp:best:" + p.id);
    if (best == null || s > best) store.set("pp:best:" + p.id, s);
    showMark(p, a);
  }

  drawTurns(); drawCompose();
  if (!a.turns.length) $("textarea", compose).focus();
}

// 내가 보낸 말에서 점수를 받은 구절에 밑줄
function marked(p, text, marks) {
  const ranges = [];
  for (const m of marks) {
    if (m.used) continue;
    let q = m.q, at = text.indexOf(q);
    if (at < 0) { q = q.replace(/^["'“‘\s]+|["'”’.\s]+$/g, ""); at = q ? text.indexOf(q) : -1; }
    if (at < 0) continue;
    m.used = true; ranges.push([at, at + q.length, m.n]);
  }
  ranges.sort((x, y) => x[0] - y[0]);
  let out = "", pos = 0;
  for (const [s, e, n] of ranges) {
    if (s < pos) continue;
    out += rich(p, text.slice(pos, s)) + `<mark>${rich(p, text.slice(s, e))}</mark><sup>${n}</sup>`;
    pos = e;
  }
  return out + rich(p, text.slice(pos));
}

function showMark(p, a) {
  const body = $("#body"), i = P.indexOf(p), next = P[i + 1];
  const items = a.self
    ? p.items.map((it, k) => ({ id: it.id, status: a.marks[k], quote: "", why: it.met }))
    : a.turns[a.turns.length - 1].items;
  const s = score(items), cnt = st => items.filter(x => x.status === st).length;
  const label = id => p.items.find(x => x.id === id);
  const num = id => p.items.findIndex(x => x.id === id) + 1;
  const head = a.self ? "눌러서 스스로 채점해요" : s === 100 ? "전할 것을 다 전했어요" : s >= 80 ? "거의 다 전했어요" : s >= 50 ? "절반쯤 전했어요" : "Claude가 많이 짐작해야 했어요";
  const marks = items.map((it, k) => ({ q: it.status === "missing" ? "" : it.quote, n: k + 1 })).filter(m => m.q);
  body.className = "mark" + (a.still ? " still" : "");
  body.innerHTML = `<div class="mark-in">
    <div class="score">
      <div class="big"><svg viewBox="0 0 190 150"><path d="M150 24C118 4 38 10 19 58C2 104 62 146 116 137C170 128 189 79 164 40C156 28 143 20 126 16"/></svg><b>${s}<small>점</small></b></div>
      <div><h2>${head}</h2><div class="sum"><span>○ ${cnt("met")}</span><span>△ ${cnt("partial")}</span><span>✕ ${cnt("missing")}</span>보낸 말 ${a.turns.length}번</div></div>
    </div>
    <div class="cols">
      <div><h3>채점표</h3><ol class="items">${items.map((it, k) => `
        <li>${a.self ? `<button class="m" data-k="${k}" title="눌러서 바꾸기">${MARK[it.status]}</button>` : `<span class="m">${MARK[it.status]}</span>`}<div>
          <div class="lab">${esc(label(it.id).label)}<sup>${k + 1}</sup></div>
          <div class="why">${a.self ? rich(p, it.why) : esc(it.why)}</div></div></li>`).join("")}</ol></div>
      <div class="mine"><h3>내가 보낸 말</h3>${a.turns.map((t, k) => `<div class="one"><span class="n">${k + 1}</span>${marked(p, t.msg, marks)}</div>`).join("")}</div>
    </div>
    <div class="model"><h3>모범 답안</h3>
      <div class="lines">${p.model.lines.map(l => `
        <div class="ln"><div class="tx">${rich(p, l.text)}</div>
          <div class="why${l.items.length ? "" : " plain"}">${l.items.map(num).sort((x, y) => x - y).map(n => `<sup>${n}</sup>`).join("")}${esc(l.why)}</div></div>`).join("")}</div>
      <div class="follow"><span>이어 말하기 예</span><div>${esc(p.model.followup)}</div></div>
    </div>
    <div class="actions"><button class="again">다시 풀기</button>${next ? `<button class="next">다음 문제 →</button>` : ""}</div>
  </div>`;
  $(".again").onclick = () => { resetMaterial(p); saveAttempt(p, { turns: [], graded: false }); showWork(p, attempt(p)); };
  if (a.self) body.querySelectorAll("button.m").forEach(b => b.onclick = () => {
    const k = +b.dataset.k, order = ["missing", "met", "partial"];
    a.marks[k] = order[(order.indexOf(a.marks[k]) + 1) % 3];
    saveAttempt(p, a);
    const top = body.scrollTop;
    a.still = true; showMark(p, a); a.still = false;
    body.scrollTop = top;
  });
  if (next) $(".next").onclick = () => { location.hash = "#/" + next.id; };
}

boot();
