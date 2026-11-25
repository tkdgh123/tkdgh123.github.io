// 소리: 큐 팁과 미스큐는 Stable Audio 3(small-sfx)로 만든 것, 공 부딪침, 쿠션, 구름, 초크는 Freesound CC0 녹음을 잘라 씀
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain(); master.connect(ctx.destination);
const buf = {};
for (const n of ["tip_soft", "tip_hard", "miscue", "click_soft", "click_hard", "cushion", "roll", "chalk"])
  fetch(new URL(`../snd/${n}.mp3`, import.meta.url)).then((r) => r.arrayBuffer()).then((a) => ctx.decodeAudioData(a)).then((b) => { buf[n] = b; }).catch(() => {});

export function setVolume(v) { master.gain.value = v; }
export function unlock() { if (ctx.state !== "running") ctx.resume(); }

// 한 번 나는 소리. pan -1..1, rate는 재생 빠르기(음 높이)
export function play(name, vol, pan = 0, rate = 1, offset = 0, dur) {
  const b = buf[name]; if (!b || vol <= 0.002 || ctx.state !== "running") return;
  const s = ctx.createBufferSource(), g = ctx.createGain(), p = ctx.createStereoPanner();
  s.buffer = b; s.playbackRate.value = rate; g.gain.value = Math.min(vol, 1.5); p.pan.value = Math.max(-1, Math.min(1, pan));
  s.connect(g).connect(p).connect(master);
  if (dur) { g.gain.setValueAtTime(g.gain.value, ctx.currentTime + dur * 0.7); g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur); }
  s.start(0, offset, dur);
}

// 천 위를 구르는 소리: 계속 돌면서 크기와 빠르기만 바꿈
let roll = null;
export function rolling(level, rate) {
  if (!roll) {
    if (!buf.roll || ctx.state !== "running") return;
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf.roll; s.loop = true; g.gain.value = 0; s.connect(g).connect(master); s.start();
    roll = { s, g };
  }
  roll.g.gain.setTargetAtTime(level, ctx.currentTime, 0.05);
  roll.s.playbackRate.setTargetAtTime(rate, ctx.currentTime, 0.1);
}

// 초크 비비는 소리: 녹음에서 아무 곳이나 짧게 떼어 냄
let chalkUntil = 0;
export function chalk(vol) {
  if (!buf.chalk || ctx.currentTime < chalkUntil) return;
  const d = 0.09 + Math.random() * 0.06;
  play("chalk", vol, 0, 0.9 + Math.random() * 0.2, Math.random() * (buf.chalk.duration - d), d);
  chalkUntil = ctx.currentTime + d * 0.8;
}
