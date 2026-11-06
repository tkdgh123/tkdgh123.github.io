// 게임 손맛: 소리(파일 없이 Web Audio로 만듦) + 판 흔들기·튕기기. 음소거는 게임끼리 같이 씀
const FX = (() => {
  let AC, OUT, NZ, muted = false;
  try { muted = localStorage.getItem("game-mute") === "1" } catch {}
  function au() {
    if (!AC) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      AC = new A(); OUT = AC.createGain(); OUT.gain.value = .7; OUT.connect(AC.destination);
      NZ = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
      const d = NZ.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  // 음 하나: f에서 시작해 to로 미끄러짐, at초 뒤에
  function tone(f, { d = .15, type = "sine", vol = .2, at = 0, to } = {}) {
    if (muted || !au()) return;
    const t = AC.currentTime + at, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0005, t + d);
    o.connect(g).connect(OUT); o.start(t); o.stop(t + d + .03);
  }
  // 바람·종이·잉크 같은 소리: 걸러 낸 잡음
  function noise({ d = .1, vol = .2, at = 0, f = 1000, to, q = 1, type = "bandpass" } = {}) {
    if (muted || !au()) return;
    const t = AC.currentTime + at, s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = NZ; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + d);
    s.connect(fl).connect(g).connect(OUT); s.start(t, Math.random() * .5); s.stop(t + d + .03);
  }
  // 오음 음계 i번째 음 (도 레 미 솔 라, 한 바퀴마다 한 옥타브 위)
  const PENT = [0, 2, 4, 7, 9];
  const pent = (i, base = 523.25) => base * 2 ** (PENT[((i % 5) + 5) % 5] / 12 + Math.floor(i / 5));

  // 배경 음악: 낮은 박 + 오음 음계를 천천히 걷는 뜯는 소리. 게임이 bpm을 올려 긴장을 만든다
  let mOn = false, bpm = 80, root = 261.63, next = 0, step = 0, note = 4, timer = 0;
  function music(on, o = {}) {
    if (o.bpm) bpm = o.bpm; if (o.root) root = o.root;
    if (on === mOn) return;
    mOn = on; clearInterval(timer);
    if (!on || !au()) return;
    next = AC.currentTime + .1; step = 0;
    timer = setInterval(() => {
      if (next < AC.currentTime) next = AC.currentTime + .05;
      while (next < AC.currentTime + .2) {
        const at = next - AC.currentTime;
        if (step % 4 === 0) tone(root / 2, { d: .3, vol: .07, at });
        if (step % 8 === 6) tone(root * .75, { d: .2, vol: .04, at });
        if (Math.random() < .5) { note = Math.max(0, Math.min(9, note + [-2, -1, 1, 2][Math.random() * 4 | 0])); tone(pent(note, root), { d: .4, type: "triangle", vol: .035, at }) }
        next += 30 / bpm; step++;
      }
    }, 50);
  }
  // 결과 점수가 0부터 굴러 올라감(올라가는 동안 작은 소리)
  function count(el, to, ms = 700) {
    const t0 = performance.now(); let last = -1;
    (function f(now) {
      const k = Math.min(1, (now - t0) / ms), v = Math.round(to * (1 - (1 - k) ** 3)), q = k * 12 | 0;
      el.textContent = v;
      if (q !== last && k < 1) { last = q; tone(900 + q * 60, { d: .03, type: "triangle", vol: .04 }) }
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  const ON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const OFF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>';
  function button(el) {
    const show = () => { el.innerHTML = muted ? OFF : ON; el.setAttribute("aria-label", muted ? "소리 켜기" : "소리 끄기") };
    el.onclick = () => {
      muted = !muted;
      try { localStorage.setItem("game-mute", muted ? "1" : "0") } catch {}
      if (!muted) tone(880, { d: .1, vol: .12, type: "triangle" });
      show();
    };
    show();
  }

  // 판 밖까지 날아가는 조각: 화면 전체를 덮는 투명 캔버스 하나(화면 좌표 px)
  const L = document.createElement("canvas"), lx = L.getContext("2d");
  L.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20;background:none;border-radius:0;box-shadow:none";
  document.body.appendChild(L);
  const fit = () => { const d = devicePixelRatio || 1; L.width = innerWidth * d; L.height = innerHeight * d; lx.setTransform(d, 0, 0, d, 0, 0) };
  addEventListener("resize", fit); fit();
  let parts = [];
  // shape: "c" 방울, "s" 네모 조각, "k" 반짝이(십자)
  function burst(x, y, color, { n = 8, v = 260, up = 120, size = 5, life = 700, shape = "c", g = 1100, delay = 0 } = {}) {
    const t0 = performance.now() + delay;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, s = v * (.35 + Math.random() * .8);
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - up, g, r: size * (.5 + Math.random() * .8), color, shape, rot: Math.random() * 6, vr: (Math.random() * 2 - 1) * 14, t0, life: life * (.7 + Math.random() * .6) });
    }
  }
  // 점수 칸으로 휘어 날아가 빨려 드는 방울, 처음 닿을 때 hit() 한 번
  function home(x, y, color, el, { n = 3, size = 5, delay = 0, hit } = {}) {
    const t0 = performance.now() + delay, once = { done: false };
    for (let i = 0; i < n; i++) parts.push({ home: el, x, y, cx: x + (Math.random() * 2 - 1) * 140, cy: y - 80 - Math.random() * 160, r: size * (.7 + Math.random() * .6), color, t0: t0 + i * 45, life: 480 + Math.random() * 180, hit, once });
  }
  function drawParts(now, dt) {
    lx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => {
      const age = now - p.t0; if (age < 0) return true;
      const k = age / p.life;
      lx.fillStyle = p.color;
      if (p.home) {
        if (k >= 1) { if (p.hit && !p.once.done) { p.once.done = true; p.hit() } return false }
        const r = p.home.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2, e = k * k, u = 1 - e;
        lx.globalAlpha = 1; lx.beginPath(); lx.arc(u * u * p.x + 2 * u * e * p.cx + e * e * tx, u * u * p.y + 2 * u * e * p.cy + e * e * ty, p.r * (1 - .4 * k), 0, 7); lx.fill();
        return true;
      }
      if (k >= 1) return false;
      p.vy += p.g * dt; p.vx *= 1 - 1.2 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const r = p.r * (1 - .5 * k);
      lx.globalAlpha = Math.min(1, 2 - 2 * k);
      if (p.shape === "s") { lx.save(); lx.translate(p.x, p.y); lx.rotate(p.rot); lx.fillRect(-r, -r, 2 * r, 2 * r); lx.restore() }
      else if (p.shape === "k") { lx.save(); lx.translate(p.x, p.y); lx.rotate(p.rot * .2); lx.fillRect(-r * 2, -r * .3, r * 4, r * .6); lx.fillRect(-r * .3, -r * 2, r * .6, r * 4); lx.restore() }
      else { lx.beginPath(); lx.arc(p.x, p.y, r, 0, 7); lx.fill() }
      return true;
    });
    lx.globalAlpha = 1;
  }

  // 흔들기(trauma)와 튕기기(punch)를 판 요소 하나에 건다. stop(ms) = 큰 수에서 잠깐 멈칫(게임이 stopped()를 보고 그리기를 쉼)
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let el = null, trauma = 0, punch = 0, last = 0, until = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    trauma = Math.max(0, trauma - dt * 1.8); punch *= Math.exp(-dt * 12);
    const a = still ? 0 : trauma * trauma * 14, s = still ? 0 : punch;
    if (el) el.style.transform = a < .05 && Math.abs(s) < .0005 ? "" :
      `translate(${(Math.random() * 2 - 1) * a}px,${(Math.random() * 2 - 1) * a}px) rotate(${(Math.random() * 2 - 1) * a * .06}deg) scale(${1 + s})`;
    drawParts(now, now < until ? 0 : dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    tone, noise, pent, button, burst, home, music, count,
    board: e => { el = e },
    shake: a => { trauma = Math.min(1, trauma + a) },
    punch: p => { punch += p },
    stop: ms => { if (!still) until = performance.now() + ms },
    stopped: () => performance.now() < until,
    pop: e => { e.classList.remove("pop"); void e.offsetWidth; e.classList.add("pop") },
  };
})();
