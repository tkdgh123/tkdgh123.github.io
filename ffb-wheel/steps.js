// 레고 조립서처럼 하루치를 단계로 나눠 한 단계씩 보여 줌 — 휠 베이스·페달이 같이 씀.
// 부품마다 mesh.userData.st = 주차*100 + 일차*10 + 단계 (예: 1213 = 12주차 1일차 3단계).
// place = 따로 만든 덩어리(예: 막대 몸통 U)를 제자리에 붙이는 단계. 그 전까지는 bench(월드 변환)가 있으면 옆 바닥에 눕혀 둠.
// steps = { 일차 코드(예: 121): [단계...] } — 여러 날을 한 줄로 이어 완성까지 넘겨 봄. 처음엔 o.day 첫 단계.
// 보이는 규칙: 앞 날·앞 단계 것 = 제자리에 그대로(공중에 안 뜨게), 이번 단계 것 = 밝게 + 제자리로 들어옴, 뒤 단계 것 = 안 보임.
// isolate 단계(자르기·따로 만들기) = 그 부품만(+ ctx로 고른 것은 밝히지 않고 같이), dims: "box"면 크기 치수선을 그림.
import * as THREE from "three";

const CSS = `
.lego { position: absolute; z-index: 6; right: 18px; top: 66px; width: 350px; height: min(620px, calc(100% - 86px)); display: flex; flex-direction: column; background: #fff; border: 2px solid #1C2228; box-shadow: 6px 6px 0 rgba(28,34,40,.14); font: 14px/1.55 "IBM Plex Sans KR", "Malgun Gothic", system-ui, sans-serif; color: #1C2228; }
.lego .lc { flex: 1; min-height: 0; overflow: auto; }   /* 글은 이 안에서 넘기고, 버튼 줄은 상자 맨 밑 같은 자리 */
.lego .lf { flex: none; border-top: 1px solid #C3CBD2; padding-top: 10px; background: #fff; }
.lego .lh { display: flex; align-items: baseline; gap: 6px; padding: 10px 14px 0; }
.lego .lh b { font: 700 36px/1 "IBM Plex Mono", ui-monospace, monospace; }
.lego .lh span { color: #56616B; font: 500 15px "IBM Plex Mono", ui-monospace, monospace; }
.lego .lh em { margin-left: auto; font-style: normal; font-size: 12px; color: #56616B; }
.lego h3 { margin: 6px 14px 10px; font-size: 16px; line-height: 1.4; }
.lego .lp { list-style: none; margin: 0 14px 10px; padding: 8px 10px; background: #F4F5F6; border: 1px solid #C3CBD2; display: grid; gap: 5px; }
.lego .lp li { display: grid; grid-template-columns: 36px 1fr; column-gap: 6px; line-height: 1.35; }
.lego .lp i { font: 600 14px "IBM Plex Mono", ui-monospace, monospace; font-style: normal; color: #C8102E; grid-row: span 2; }
.lego .lp b { font-weight: 500; }
.lego .lp small { grid-column: 2; color: #56616B; font-size: 12px; }
.lego .lt { margin: 0 14px 12px; padding-left: 20px; }
.lego .lt li { margin: 4px 0; }
.lego .lt li::marker { font: 600 12px "IBM Plex Mono", ui-monospace, monospace; color: #56616B; }
.lego .lb { display: flex; gap: 6px; padding: 0 14px 10px; }
.lego .lb button { flex: 1; font: inherit; font-size: 13px; padding: 7px 6px; border: 1px solid #1C2228; background: #fff; color: #1C2228; border-radius: 3px; cursor: pointer; }
.lego .lb button[data-a="1"] { background: #1C2228; color: #fff; }
.lego .lb button:disabled { opacity: .35; cursor: default; }
.lego .ld { display: flex; gap: 4px 12px; padding: 0 14px 12px; flex-wrap: wrap; }
.lego .ld span { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
.lego .ld small { flex-basis: 100%; font-size: 11px; color: #56616B; }
.lego .ld button { width: 22px; height: 8px; border: 0; padding: 0; background: #C3CBD2; cursor: pointer; }
.lego .ld button[aria-current="true"] { background: #C8102E; }
.lego .ld button.done { background: #56616B; }
.ldim { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); background: #fff; border: 1px solid #C8102E; color: #C8102E; font: 500 12px "IBM Plex Mono", ui-monospace, monospace; padding: 0 5px; pointer-events: none; white-space: nowrap; z-index: 4; }
@media (max-width: 700px) { .lego { left: 8px; right: 8px; top: auto; bottom: 8px; width: auto; height: 48%; } .lego .ld { gap: 3px 8px; } .lego .ld small { display: none; } .lego .ld button { width: 12px; height: 8px; } .lego .lh b { font-size: 28px; } }
`;

export function stepper(o) {
  if (!document.getElementById("lego-css")) { const s = document.createElement("style"); s.id = "lego-css"; s.textContent = CSS; document.head.append(s); }
  const box = document.createElement("aside"); box.className = "lego"; box.setAttribute("aria-label", "조립 순서"); o.view.append(box);
  const dimG = new THREE.Group(); o.scene.add(dimG); let dimEls = [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = -1, list = [], anim = null, cam = null, lastDay = 0;
  const steps = () => { const S = typeof o.steps === "function" ? o.steps() : o.steps;
    return Object.keys(S).sort().flatMap(d => S[d].map((s, k) => ({ ...s, day: +d, code: d * 10 + k + 1, k: k + 1, n: S[d].length }))); };
  const cur = () => list[i].code;
  const dayTxt = d => `${Math.floor(d / 10)}주차 ${d % 10}일차`;
  const M4 = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), SC = new THREE.Vector3();
  const DIM = new THREE.LineBasicMaterial({ color: 0xC8102E, depthTest: false, transparent: true });

  function clearDims() { dimG.children.slice().forEach(c => { c.geometry.dispose(); dimG.remove(c); }); dimEls.forEach(d => d.el.remove()); dimEls = []; }
  function boxDims(bx) {   // 크기 치수선: 좌우(x) · 앞뒤(z) · 높이(y)
    const a = bx.min, b = bx.max, s = bx.getSize(new THREE.Vector3()), g = 14;
    const seg = (p, q, txt) => {
      const pts = [p, q].map(v => new THREE.Vector3(...v));
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), DIM); l.renderOrder = 12; l.frustumCulled = false; dimG.add(l);
      const el = document.createElement("div"); el.className = "ldim"; el.textContent = txt; o.view.append(el);
      dimEls.push({ el, p: pts[0].clone().add(pts[1]).multiplyScalar(.5) });
    };
    const r = v => Math.round(v * 10) / 10;
    if (s.x > 1) seg([a.x, a.y, b.z + g], [b.x, a.y, b.z + g], `좌우 ${r(s.x)}`);
    if (s.z > 1) seg([b.x + g, a.y, a.z], [b.x + g, a.y, b.z], `앞뒤 ${r(s.z)}`);
    if (s.y > 1) seg([b.x + g, a.y, b.z + g], [b.x + g, b.y, b.z + g], `높이 ${r(s.y)}`);
  }

  function apply({ fit = true, replay = true } = {}) {
    list = steps(); if (i < 0) i = Math.max(0, list.findIndex(s => s.day === o.day)); i = Math.max(0, Math.min(i, list.length - 1));
    const s = list[i], c = cur(), fresh = [];
    for (const m of o.meshes()) {
      const u = m.userData; if (u.st == null) continue;
      if (u.mat0) { m.material = u.mat0; delete u.mat0; }
      if (u.p0) { m.position.copy(u.p0); m.quaternion.copy(u.q0); } else { u.p0 = m.position.clone(); u.q0 = m.quaternion.clone(); }
      const isNew = s.pick ? s.pick(m) : (u.st === c || u.place === c);
      const bench = !!u.bench && !s.isolate && u.st <= c && c < u.place;   // 만들어 놓고 아직 안 붙인 덩어리 = 옆 바닥에
      u.benched = bench; m.visible = isNew || bench || !!s.ctx?.(m) || (!s.isolate && (u.place ?? u.st) < c);
      if (bench) { m.parent.updateWorldMatrix(true, false); m.updateMatrix(); M4.copy(m.parent.matrixWorld).invert().multiply(u.bench).multiply(m.parent.matrixWorld).multiply(m.matrix).decompose(P, Q, SC); m.position.copy(P); m.quaternion.copy(Q); }
      if (isNew && m.visible) {
        u.mat0 = m.material;
        const hl = x => { x = x.clone(); if (x.emissive && (!x.color || x.color.getHSL({}).l > .3)) x.emissive.setHex(0x3a1c00); return x; };   // 검은 부품(핸들 고무 등)은 색을 안 바꿈
        m.material = Array.isArray(m.material) ? m.material.map(hl) : hl(m.material);
        fresh.push(m);
      }
    }
    // 카메라: 이번 단계 부품이 화면 가운데에
    clearDims(); cam = null; anim = null;
    const bx = new THREE.Box3(); fresh.forEach(m => bx.expandByObject(m));
    if (s.dims === "box" && !bx.isEmpty()) boxDims(bx);
    if (fit && !bx.isEmpty()) {
      const ctr = bx.getCenter(new THREE.Vector3()), sz = bx.getSize(new THREE.Vector3()).length() / 2;
      const r = s.isolate ? Math.max(sz, 50) * 1.3 : Math.max(sz * 1.6, s.near || 160);
      const dir = s.view ? new THREE.Vector3(...s.view).normalize() : o.camera.position.clone().sub(o.controls.target).normalize();
      const dist = r / Math.sin(o.camera.fov * Math.PI / 360);
      cam = { t: reduce ? 1 : 0, p0: o.camera.position.clone(), t0: o.controls.target.clone(), p1: ctr.clone().addScaledVector(dir, dist), t1: ctr };
    }
    // 새 부품이 제자리로 들어오는 움직임
    if (replay && !reduce && !s.isolate && fresh.length) {
      // dir = 부품이 처음 있던 자리(제자리에서 얼마나 떨어져 있었나, 월드 mm). 함수면 부품마다 — 실제로 끼우는 방향으로, 다른 부품을 뚫지 않게
      // 부품의 userData.ins가 있으면 그게 먼저. [x, y, z, 늦게 시작(초)] — 늦게 오는 건 제 차례까지 안 보임
      anim = { t: 0, end: 0, items: fresh.map(m => { const dv = m.userData.ins || (typeof s.dir === "function" ? s.dir(m) : s.dir) || [0, 70, 0], d = new THREE.Vector3(dv[0], dv[1], dv[2]), dl = dv[3] || 0;
        m.parent.updateWorldMatrix(true, false); const w = m.getWorldPosition(new THREE.Vector3()); const a = m.parent.worldToLocal(w.clone()), b = m.parent.worldToLocal(w.clone().add(d));
        return { m, off: b.sub(a), to: m.position.clone(), dl }; }) };
      anim.end = Math.max(...anim.items.map(x => x.dl)) + .9;
      anim.items.forEach(({ m, off, dl }) => { m.position.add(off); if (dl) m.visible = false; });
    }
    render(s);
    if (s.day !== lastDay) { lastDay = s.day; if (parent !== window) parent.postMessage({ legoDay: s.day }, location.origin); }   // 탭 페이지의 주차·일차 칸을 따라 바꿈
    o.onApply?.(s, fresh, c);
  }

  function render(s) {
    const n = list.length;
    box.innerHTML = `<div class="lc"><div class="lh"><b>${i + 1}</b><span>/ ${n}</span><em>${dayTxt(s.day)} · ${s.k}/${s.n}</em></div><h3>${s.title}</h3>` +
      (s.parts?.length ? `<ul class="lp">${s.parts.map(([nm, sp, q]) => `<li><i>${q ? "×" + q : ""}</i><b>${nm}</b>${sp ? `<small>${sp}</small>` : ""}</li>`).join("")}</ul>` : "") +
      (s.text?.length ? `<ol class="lt">${s.text.map(t => `<li>${t}</li>`).join("")}</ol>` : "") +
      `</div><div class="lf"><div class="lb"><button type="button" data-a="-1" ${i ? "" : "disabled"}>◀ 이전</button><button type="button" data-a="0">다시 보기</button><button type="button" data-a="1" ${i < n - 1 ? "" : "disabled"}>다음 ▶</button></div>` +
      `<div class="ld">${[...new Set(list.map(x => x.day))].map(d => `<span><small>${dayTxt(d)}</small>${list.map((x, j) => x.day !== d ? "" : `<button type="button" data-j="${j}" class="${j < i ? "done" : ""}" aria-current="${j === i}" aria-label="${dayTxt(d)} ${x.k}단계"></button>`).join("")}</span>`).join("")}</div></div>`;
  }
  const go = j => { if (j < 0 || j >= list.length) return; i = j; apply(); };
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.j) go(+b.dataset.j); else if (b.dataset.a === "0") apply({ fit: false }); else go(i + +b.dataset.a);
  });
  addEventListener("keydown", e => { if (e.target.closest?.("input, textarea")) return; if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); });

  const v3 = new THREE.Vector3(); let off = "";
  function tick(dt) {
    // 설명 상자에 가리지 않게 화면 가운데를 옮김: 넓은 화면 = 왼쪽으로, 좁은 화면(아래 상자) = 위로
    const W = o.view.clientWidth, H = o.view.clientHeight, wide = W > 700, ox = wide ? Math.round((box.offsetWidth + 18) / 2) : 0, oy = wide ? 0 : Math.round(box.offsetHeight / 2), key = `${W},${H},${ox},${oy}`;
    if (key !== off) { off = key; o.camera.setViewOffset(W, H, ox, oy, W, H); o.camera.updateProjectionMatrix(); }
    if (anim) { anim.t += dt; anim.items.forEach(({ m, off, to, dl }) => { const k = Math.min(1, Math.max(0, (anim.t - dl) / .9)), e = 1 - Math.pow(1 - k, 3); if (anim.t >= dl) m.visible = true; m.position.copy(to).addScaledVector(off, 1 - e); }); if (anim.t >= anim.end) anim = null; }
    if (cam) { cam.t = Math.min(1, cam.t + dt / .8); const e = 1 - Math.pow(1 - cam.t, 3); o.camera.position.lerpVectors(cam.p0, cam.p1, e); o.controls.target.lerpVectors(cam.t0, cam.t1, e); if (cam.t >= 1) cam = null; }
    const w = o.view.clientWidth, h = o.view.clientHeight;
    dimEls.forEach(({ el, p }) => { v3.copy(p).project(o.camera); el.style.left = (v3.x * .5 + .5) * w + "px"; el.style.top = (-v3.y * .5 + .5) * h + "px"; el.style.display = v3.z < 1 ? "" : "none"; });
  }
  return { apply, tick, cur, step: () => list[i] };
}
