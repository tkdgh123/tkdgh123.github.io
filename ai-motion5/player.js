"use strict";
(function () {
  const M = window.MOTION, TOTAL = M.TOTAL;
  const isRender = /[?&]render/.test(location.search);
  const frame = document.getElementById("frame"), stage = document.getElementById("stage");
  const aud = document.getElementById("aud");
  let scale = 1;
  function fitStage() {
    if (isRender) { frame.style.width = "1920px"; frame.style.height = "1080px"; scale = 1; stage.style.transform = "none"; return; }
    const vw = innerWidth, vh = innerHeight;
    scale = Math.min(vw / 1920, vh / 1080);
    frame.style.width = 1920 * scale + "px"; frame.style.height = 1080 * scale + "px";
    stage.style.transform = "scale(" + scale + ")";
  }
  addEventListener("resize", fitStage); fitStage();
  if (isRender) {
    document.body.classList.add("render");
    window.__seek = T => { M.render(T); };
    window.__total = TOTAL;
    window.__ready = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => document.fonts.load('400 20px "JBM"')).then(() => document.fonts.load('700 20px "JBM"')).then(() => true);
    return;
  }
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  let T = 0, playing = false, last = 0, speed = 1, muted = false;
  const spans = M.chapterSpans();
  const $ = id => document.getElementById(id);
  const seek = $("seek"), fl = seek.querySelector(".fl"), kn = seek.querySelector(".kn"), tip = seek.querySelector(".tip");
  // chapter ticks + menu
  spans.forEach((s, i) => { if (i > 0) { const tk = document.createElement("div"); tk.className = "tk"; tk.style.left = (s.start / TOTAL) * 100 + "%"; seek.appendChild(tk); } });
  const menu = $("menu");
  spans.forEach(s => {
    const C = M.CH[s.ch] || M.CH[0];
    const b = document.createElement("button");
    b.style.setProperty("--c", C.acc);
    b.innerHTML = '<span class="n">' + (s.ch ? C.no : "•") + "</span><span>" + (s.ch ? C.title : s.start === 0 ? "오프닝" : "마무리") + '</span><span class="tm">' + fmt(s.start) + "</span>";
    b.onclick = () => { go(s.start + 0.01); menu.style.display = "none"; };
    menu.appendChild(b);
  });
  function nameAt(t) { const sc = M.SC[findIdx(t)]; const C = M.CH[sc.ch] || M.CH[0]; return (sc.ch ? C.no + " · " : "") + (sc.ch && /^CHAPTER/.test(sc.name) ? C.title : (sc.name || C.title)); }
  function findIdx(t) { let r = 0; M.SC.forEach((s, i) => { if (s.start <= t) r = i; }); return r; }
  function ui() {
    fl.style.width = (T / TOTAL) * 100 + "%"; kn.style.left = (T / TOTAL) * 100 + "%";
    $("time").textContent = fmt(T) + " / " + fmt(TOTAL);
    $("now").textContent = nameAt(T);
    $("icPlay").innerHTML = playing ? '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>' : '<path d="M6 4l15 8-15 8z"/>';
  }
  function syncAudio(force) {
    if (!aud || aud.error) return;
    aud.muted = muted; aud.playbackRate = speed;
    if (!playing) { if (!aud.paused) aud.pause(); return; }
    if (force || Math.abs(aud.currentTime - T) > 0.25) { try { aud.currentTime = T; } catch (e) {} }
    if (aud.paused) { const p = aud.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function go(t) { if (t > 0.5) started = true; T = Math.max(0, Math.min(TOTAL - 0.01, t)); M.render(T); ui(); syncAudio(true); }
  let started = false, startAt = 0;
  function play(on) {
    playing = on == null ? !playing : on;
    if (playing && !started) { started = true; T = startAt; }
    if (playing && T >= TOTAL - 0.05) T = 0;
    last = performance.now();
    $("big").classList.add("hide"); $("help").style.display = "none";
    syncAudio(true); ui(); poke();
  }
  function loop(now) {
    if (playing) {
      const dt = Math.min(0.1, (now - last) / 1000) * speed;
      T += dt;
      if (T >= TOTAL - 0.01) { T = TOTAL - 0.01; playing = false; syncAudio(); }
      M.render(T); ui(); syncAudio(false);
    }
    last = now; requestAnimationFrame(loop);
  }
  // auto-hide controls
  let hideTimer = 0; const uiEl = $("ui");
  function poke() { uiEl.classList.remove("hide"); document.body.style.cursor = ""; clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (playing && menu.style.display !== "block") { uiEl.classList.add("hide"); document.body.style.cursor = "none"; } }, 2600); }
  addEventListener("mousemove", poke); addEventListener("touchstart", poke, { passive: true });
  // seek bar
  let drag = false;
  const posT = e => { const r = seek.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * TOTAL; };
  seek.addEventListener("pointerdown", e => { drag = true; seek.setPointerCapture(e.pointerId); go(posT(e)); });
  seek.addEventListener("pointermove", e => {
    const t = posT(e), r = seek.getBoundingClientRect();
    tip.style.display = "block"; tip.style.left = ((t / TOTAL) * r.width) + "px"; tip.textContent = fmt(t) + " · " + nameAt(t);
    if (drag) go(t);
  });
  seek.addEventListener("pointerup", () => { drag = false; });
  seek.addEventListener("pointerleave", () => { tip.style.display = "none"; });
  const sceneStep = d => { const i = findIdx(T); const j = Math.max(0, Math.min(M.SC.length - 1, d < 0 && T - M.SC[i].start > 1.5 ? i : i + d)); go(M.SC[j].start + 0.01); };
  $("bPlay").onclick = () => play();
  $("big").onclick = () => play(true);
  $("bPrev").onclick = () => sceneStep(-1);
  $("bNext").onclick = () => sceneStep(1);
  const speeds = [0.75, 1, 1.25, 1.5];
  $("bSpeed").onclick = () => { speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length]; $("bSpeed").textContent = speed + "×"; syncAudio(true); };
  const volIcon = () => { $("icVol").style.opacity = muted ? 0.45 : 1; $("bMute").setAttribute("aria-label", muted ? "소리 켜기" : "소리 끄기"); };
  $("bMute").onclick = () => { muted = !muted; volIcon(); syncAudio(true); };
  $("bCh").onclick = e => { e.stopPropagation(); menu.style.display = menu.style.display === "block" ? "none" : "block"; poke(); };
  addEventListener("click", e => { if (!menu.contains(e.target) && e.target !== $("bCh")) menu.style.display = "none"; });
  const fs = () => { const d = document; if (d.fullscreenElement) d.exitFullscreen && d.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); };
  $("bFs").onclick = fs;
  frame.addEventListener("click", () => play());
  addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    const k = e.key;
    if (k === " " || k === "k" || k === "K") { e.preventDefault(); play(); }
    else if (k === "ArrowRight") go(T + 5);
    else if (k === "ArrowLeft") go(T - 5);
    else if (k === "l" || k === "L") go(T + 10);
    else if (k === "j" || k === "J") go(T - 10);
    else if (k === "]") sceneStep(1);
    else if (k === "[") sceneStep(-1);
    else if (k === "f" || k === "F") fs();
    else if (k === "m" || k === "M") $("bMute").onclick();
    else if (/^[1-9]$/.test(k)) { const s = spans.find(x => x.ch === +k); if (s) go(s.start + 0.01); }
    else return;
    poke();
  });
  // poster frame
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    const hm = /^#ch([1-9])$/.exec(location.hash || "");
    const sp = hm && spans.find(x => x.ch === +hm[1]);
    if (sp) { startAt = sp.start + 0.01; T = sp.start + 4.5; M.render(T); ui(); $("help").textContent = (M.CH[sp.ch]||{}).no + "부터 재생합니다 · Space 재생"; }
    else if (!started) { T = 6.2; M.render(T); ui(); }
  });
  M.render(0); ui(); requestAnimationFrame(loop);
})();
