// 설명 그림: 320×200 작은 판 위에서 손가락이 실제로 두는 모습을 단계별로 되풀이해 보여 준다.
// 만든 사람: Claude (사용자 김창식 요청, 2026-11-27)
// 대본 = { init: [[id, 종류, 속성], ...], steps: [{ say: "자막", ops: [동작, ...] }, ...] }
// 좌표 x, y는 물건의 가운데. 동작을 배열로 한 번 더 감싸면 같이 움직인다: [["mv","a",10,10], ["mv","b",20,20]]
const W = 320, H = 200;
const SIZE = { card: [30, 42], die: [22, 22], tok: [18, 18], tile: [22, 30], hex: [46, 52], stone: [16, 16], txt: [0, 0] };
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const DUR = { add: 260, mv: 620, set: 160, flip: 460, roll: 760, tap: 760, drag: 1150, hl: 700, del: 260, pop: 760 };

function inner(it) {
  const p = it.p, c = p.c || "#333";
  switch (it.k) {
    case "card":
      if (p.back) return `<i class="bk" style="--c:${p.bc || "#2f4f6f"}"></i>`;
      if (p.img && p.n) return `<span class="many n${p.n}">${`<img src="${p.img}" alt="">`.repeat(p.n)}</span>`; // 과일 n개처럼 같은 그림 여러 개
      if (p.img) return `<img src="${p.img}" alt="">${p.f != null ? `<b class="ci" style="color:${c}">${esc(p.f)}</b>` : ""}`;
      return `<b style="color:${c}">${esc(p.f)}</b>${p.s ? `<small>${esc(p.s)}</small>` : ""}`;
    case "die": return `<span class="pp">${(PIPS[p.v] || []).map(i => `<i style="grid-area:${1 + Math.floor(i / 3)}/${1 + i % 3}"></i>`).join("")}</span>`;
    case "tok": return p.img ? `<img src="${p.img}" alt="">` : p.t != null ? `<b>${esc(p.t)}</b>` : "";
    case "tile": return `<b style="color:${c}">${esc(p.t)}</b>`;
    case "hex": return `<svg viewBox="0 0 46 52"><defs>${p.img ? `<pattern id="hp${it.uid}" width="1" height="1" patternContentUnits="objectBoundingBox"><image href="${p.img}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>` : ""}</defs><polygon points="23,1 45,13.5 45,38.5 23,51 1,38.5 1,13.5" fill="${p.img ? `url(#hp${it.uid})` : c}" stroke="#f4ead2" stroke-width="2"/></svg>${p.t != null ? `<b class="${p.t == 6 || p.t == 8 ? "hot" : ""}">${esc(p.t)}</b>` : ""}`;
    case "img": return `<img src="${p.src}" alt="">`;
    case "box": return p.t ? `<span>${esc(p.t)}</span>` : "";
    case "txt": return esc(p.t);
    default: return p.t != null ? esc(p.t) : "";
  }
}

export function play(host, D, opt = {}) {
  host.classList.add("demo");
  host.innerHTML = `<div class="dstage"></div>`;
  const stage = host.firstChild;
  let items = {}, uid = 0, alive = true, run = 0, finger = null, paused = false;
  const fit = () => { const k = host.clientWidth / W; stage.style.transform = `scale(${k})`; host.style.height = H * k + "px"; };
  const ro = new ResizeObserver(fit); ro.observe(host); fit();

  function place(it) {
    const e = it.el, p = it.p, [w, h] = [p.w ?? SIZE[it.k]?.[0] ?? 30, p.h ?? SIZE[it.k]?.[1] ?? 30];
    e.style.width = w ? w + "px" : ""; e.style.height = h ? h + "px" : "";
    e.style.transform = `translate(${p.x - w / 2}px, ${p.y - h / 2}px) rotate(${p.r || 0}deg) scale(${p.sc || 1})`;
    e.style.zIndex = p.z ?? (it.k === "box" || it.k === "img" ? 1 : it.k === "hex" ? 2 : 5);
    e.style.opacity = p.o ?? 1;
    if (p.c) e.style.setProperty("--c", p.c);
  }
  function make(id, k, p, quiet) {
    const e = document.createElement("div");
    e.className = "it " + k + (p.cls ? " " + p.cls : "") + (k === "card" && p.back ? " down" : "") + (k === "stone" ? " " + (p.c === "w" ? "w" : "b") : "");
    const it = { id, k, p: { ...p }, el: e, uid: uid++ };
    if (k === "stone") delete it.p.c;
    e.innerHTML = inner(it);
    if (k === "txt") { e.style.font = `${p.bold === false ? 500 : 800} ${p.s || 12}px/1.2 var(--ui)`; e.style.color = p.c || "#fff"; e.style.whiteSpace = "nowrap"; }
    stage.appendChild(e); items[id] = it; place(it);
    if (!quiet) e.animate([{ transform: e.style.transform + " scale(.3)", opacity: 0 }, { transform: e.style.transform }], { duration: DUR.add, easing: "cubic-bezier(.3,1.4,.6,1)" });
    return it;
  }
  // 손가락 끝은 물건 가운데가 아니라 오른쪽 아래 모서리 쪽에 둬서 글자와 숫자를 가리지 않게 한다
  const tip = (it, x = it.p.x, y = it.p.y, w = it.p.w ?? SIZE[it.k]?.[0] ?? 30, h = it.p.h ?? SIZE[it.k]?.[1] ?? 30) => [x + Math.min(w / 2, 14) - 3, y + Math.min(h / 2, 14) - 3];
  const center = id => { const it = items[id]; return it ? [it.p.x, it.p.y] : id; };
  function moveFinger(x, y, t = 380) {
    finger.style.transition = `transform ${t}ms cubic-bezier(.4,0,.2,1)`;
    finger.style.transform = `translate(${x}px, ${y}px)`;
    finger.style.opacity = 1;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function hold(ms, r) { // 멈춤 단추를 누르면 그 자리에서 기다린다
    await wait(ms);
    while (paused && alive && r === run) await wait(120);
  }
  async function op(o, r) {
    if (!alive || r !== run) return;
    if (Array.isArray(o[0])) return Promise.all(o.map(x => op(x, r)));
    const [k, id, a, b, c] = o, it = items[id];
    switch (k) {
      case "w": return hold(id, r);
      case "add": make(id, a, b); return wait(DUR.add);
      case "del": if (it) { it.el.style.opacity = 0; await wait(DUR.del); it.el.remove(); delete items[id]; } return;
      case "mv": if (!it) return; Object.assign(it.p, { x: a, y: b }, c || {}); it.el.style.transition = `transform ${c?.t || DUR.mv}ms cubic-bezier(.3,.9,.3,1), opacity .3s`; place(it); return wait(c?.t || DUR.mv);
      case "set": if (!it) return; Object.assign(it.p, a); it.el.innerHTML = inner(it); it.el.classList.toggle("down", !!it.p.back); place(it); return wait(DUR.set);
      case "flip": {
        if (!it) return;
        const t = it.el.style.transform;
        await it.el.animate([{ transform: t }, { transform: t + " scaleX(0.02)" }], { duration: DUR.flip / 2, easing: "ease-in" }).finished.catch(() => {});
        it.p.back = !it.p.back; Object.assign(it.p, a || {}); it.el.innerHTML = inner(it); it.el.classList.toggle("down", !!it.p.back);
        await it.el.animate([{ transform: t + " scaleX(0.02)" }, { transform: t }], { duration: DUR.flip / 2, easing: "ease-out" }).finished.catch(() => {});
        return;
      }
      case "roll": {
        if (!it) return;
        const t = it.el.style.transform, sp = it.el.animate([{ transform: t }, { transform: t + " translateY(-14px) rotate(200deg)" }, { transform: t + " rotate(400deg)" }, { transform: t + " rotate(720deg)" }], { duration: DUR.roll, easing: "cubic-bezier(.2,.7,.3,1)" });
        const tick = setInterval(() => { it.p.v = 1 + Math.floor(Math.random() * 6); it.el.innerHTML = inner(it); }, 90);
        await sp.finished.catch(() => {}); clearInterval(tick);
        it.p.v = a; it.el.innerHTML = inner(it); return;
      }
      case "tap": {
        const [x, y] = it ? tip(it) : center(id);
        moveFinger(x, y); await wait(400);
        finger.classList.remove("press"); void finger.offsetWidth; finger.classList.add("press");
        return wait(DUR.tap - 400);
      }
      case "drag": {
        if (!it) return;
        moveFinger(...tip(it)); await wait(400);
        finger.classList.add("hold");
        it.p.z = 30; Object.assign(it.p, { x: a, y: b }, c || {});
        it.el.style.transition = `transform 620ms cubic-bezier(.4,0,.2,1)`; place(it); moveFinger(...tip(it), 620);
        await wait(640); finger.classList.remove("hold"); it.p.z = c?.z ?? 6; place(it); return wait(110);
      }
      case "hl": if (!it) return; it.el.classList.remove("hl"); void it.el.offsetWidth; it.el.classList.add("hl"); return wait(DUR.hl);
      case "pop": {
        const [x, y] = c ? [c[0], c[1] + 11.5] : center(id), e = document.createElement("div"); // c = [x, y]면 글자 가운데를 그 좌표에 둔다
        e.className = "pop" + (c?.[2] ? " still" : ""); e.textContent = a; if (b) e.style.color = b; // c = [x, y, 1]이면 떠오르지 않고 제자리에서 나타났다 사라진다
        e.style.transform = `translate(${x}px, ${y - 18}px)`; stage.appendChild(e);
        setTimeout(() => e.remove(), 1500); return wait(DUR.pop);
      }
    }
  }
  async function loop() {
    while (alive) {
      const r = ++run;
      stage.innerHTML = ""; items = {};
      finger = document.createElement("div"); finger.className = "finger"; finger.style.opacity = 0; stage.appendChild(finger);
      finger.style.transform = `translate(${W * .82}px, ${H * .9}px)`;
      for (const [id, k, p] of D.init || []) make(id, k, p, true);
      for (let i = 0; i < D.steps.length && alive && r === run; i++) {
        const s = D.steps[i];
        opt.onStep?.(i, s.say, D.steps.length);
        finger.style.opacity = 0; // 손가락은 누를 때만 보여서 이전 단계 자리에 남아 글자를 가리지 않게
        await hold(260, r);
        for (const o of s.ops || []) { await op(o, r); if (r !== run) break; }
        await hold(i === D.steps.length - 1 ? 1800 : 1000, r);
      }
      if (!alive || r !== run) continue;
      finger.style.opacity = 0;
      if (opt.loop === false) return;
      await wait(500);
    }
  }
  loop();
  return {
    stop() { alive = false; ro.disconnect(); },
    pause(v) { paused = v; },
    get paused() { return paused; }
  };
}
