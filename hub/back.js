// 창업실로 돌아가는 단추: 모든 작품 페이지의 왼쪽 아래 같은 자리, 같은 모양.
// 쓰는 법: <script src="(상대 경로)/hub/back.js" data-cat="game|study|make|etc" defer></script>
// data-cat이 있으면 첫 화면의 그 분류 방으로 돌아간다. 다른 페이지 안 틀(iframe)에서는 보이지 않는다.
// 그 자리에 페이지의 고정 막대(재생 막대·쪽수 막대 등)가 있으면 막대 바로 위로 올라가고,
// 화면 전체가 게임판인 페이지에서는 화살표만 있는 작은 원으로 줄어든다.
(() => {
  const me = document.currentScript;
  if (window.top !== window || document.getElementById("cu-home") || !me) return;
  const a = document.createElement("a");
  a.id = "cu-home";
  // 페이지가 URL 같은 이름을 자기 변수로 덮어써도 흔들리지 않게, 불러온 경로에서 바로 만든다
  a.href = (me.getAttribute("src").replace(/hub\/back\.js(\?.*)?$/, "") || "./") + (me.dataset.cat ? "#" + me.dataset.cat : "");
  a.setAttribute("aria-label", "창업실로 돌아가기");
  a.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>창업실</span>';
  const css = document.createElement("style");
  css.textContent = "#cu-home{--lift:0px;position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + var(--lift));z-index:2147483000;display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 14px 0 9px;border-radius:17px;background:rgba(21,21,20,.84);color:#f2f1ec;font:600 13px/1 \"Pretendard Variable\",Pretendard,system-ui,\"Malgun Gothic\",sans-serif;letter-spacing:0;text-decoration:none;white-space:nowrap;overflow:hidden;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 6px 18px -8px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08) inset;transition:transform .2s,background-color .2s,padding .2s,max-width .25s;max-width:120px}"
    + "#cu-home:hover{background:rgba(21,21,20,.96);transform:translateY(-1px)}#cu-home:focus-visible{outline:2px solid #2b44a6;outline-offset:3px}#cu-home svg{width:15px;height:15px;flex:none}"
    + "#cu-home.small{max-width:34px;padding:0 0 0 9px}#cu-home.small:hover,#cu-home.small:focus-visible{max-width:120px;padding:0 14px 0 9px}@media print{#cu-home{display:none}}";
  document.head.append(css);
  document.body.append(a);

  // 단추 자리 아래에 고정·붙박이 요소가 있으면 그 위로 올린다
  const fixedAt = (x, y) => {
    for (let el of document.elementsFromPoint(x, y)) {
      if (el === a || a.contains(el)) continue;
      for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        const p = getComputedStyle(el).position;
        if (p === "fixed" || p === "sticky") return el;
      }
    }
    return null;
  };
  let busy = false;
  const place = () => {
    busy = false;
    a.style.setProperty("--lift", "0px");
    const r = a.getBoundingClientRect();
    const big = el => el.tagName === "CANVAS" && el.getBoundingClientRect().height > innerHeight * 0.5;
    if (document.elementsFromPoint(r.left + 17, r.top + r.height / 2).some(big)) return a.classList.add("small");
    const bar = fixedAt(r.left + 17, r.top + r.height / 2) || fixedAt(r.left + 17, r.bottom - 2);
    if (!bar) {
      a.classList.remove("small");
      // 스크롤 없는 앱 화면이면 겹치는 단추 위로 비켜난다(스크롤 페이지에선 글이 지나갈 때마다 들썩이지 않게 그대로)
      if (document.documentElement.scrollHeight <= innerHeight + 2) {
        const hit = [...document.querySelectorAll("a,button,input,textarea,select,[role=button]")].find(el => {
          if (el === a) return false;
          const b = el.getBoundingClientRect();
          return b.width && b.height && b.left < r.right + 6 && b.right > r.left - 6 && b.top < r.bottom + 6 && b.bottom > r.top - 6;
        });
        if (hit) a.style.setProperty("--lift", Math.max(0, innerHeight - hit.getBoundingClientRect().top - 6) + "px");
      }
      return;
    }
    const b = bar.getBoundingClientRect();
    // 키가 큰 고정 요소: 게임판(캔버스)이면 작게, 옆 메뉴 같은 것이면 그대로 둔다
    if (b.height > innerHeight * 0.5) return a.classList.toggle("small", bar.tagName === "CANVAS" || !!bar.querySelector("canvas"));
    a.classList.remove("small");
    a.style.setProperty("--lift", Math.max(0, innerHeight - b.top - 6) + "px");
  };
  const later = () => { if (!busy) { busy = true; requestAnimationFrame(place); } };
  addEventListener("resize", later);
  addEventListener("scroll", later, { passive: true });
  addEventListener("load", later);
  setInterval(later, 1500); // 늦게 나타나는 게임판·앱 화면 전환도 따라간다
  later();
})();
