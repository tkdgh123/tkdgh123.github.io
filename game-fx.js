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

  // 흔들기(trauma)와 튕기기(punch)를 판 요소 하나에 건다
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let el = null, trauma = 0, punch = 0, last = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    trauma = Math.max(0, trauma - dt * 1.8); punch *= Math.exp(-dt * 12);
    const a = still ? 0 : trauma * trauma * 14, s = still ? 0 : punch;
    if (el) el.style.transform = a < .05 && Math.abs(s) < .0005 ? "" :
      `translate(${(Math.random() * 2 - 1) * a}px,${(Math.random() * 2 - 1) * a}px) rotate(${(Math.random() * 2 - 1) * a * .06}deg) scale(${1 + s})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    tone, noise, pent, button,
    board: e => { el = e },
    shake: a => { trauma = Math.min(1, trauma + a) },
    punch: p => { punch += p },
  };
})();
