/* ===================== helpers for diagram scenes ===================== */
function node(root, x, y, w, hh, html, cls, c) { return at(root, x, y, "node " + (cls || ""), html, Object.assign({ width: w, height: hh }, c || {}), true); }
function glow(el, e, col) {
  e = clamp(e); const k = (e * 100).toFixed(0);
  const c = col || "var(--acc)";
  const bs = e > 0.01 ? `0 0 0 ${(3 * e).toFixed(1)}px ${c}, 0 0 ${(70 * e).toFixed(0)}px color-mix(in srgb, ${c} ${(45 * e).toFixed(0)}%, transparent)` : "";
  const key = k + c;
  if (el._g !== key) { el.style.boxShadow = bs; el.style.borderColor = e > 0.01 ? `color-mix(in srgb, ${c} ${k}%, rgba(255,255,255,.14))` : ""; el._g = key; }
}
function dot(root, col, r) { const d = at(root, 0, 0, "", "", { width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: "50%", background: col || "#fff", boxShadow: `0 0 18px ${col || "#fff"}, 0 0 40px ${col || "#fff"}` }); return d; }
function moveOn(d, a, v, on) { if (!on || v <= 0 || v >= 1) { S(d, { o: 0 }); return; } const p = a.pt(v); S(d, { o: 1, x: p.x, y: p.y }); }
function fileCard(root, x, y, name, sub, col) {
  return at(root, x, y, "", `<div style="position:absolute;inset:0;border-radius:20px 46px 20px 20px;background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.18)"></div>
    <div style="position:absolute;right:0;top:0;width:46px;height:46px;border-radius:0 46px 0 14px;background:rgba(255,255,255,.14)"></div>
    <div style="position:absolute;left:0;right:0;top:70px;text-align:center;font:700 30px JBM,monospace;color:${col || "#fff"}">${name}</div>
    <div style="position:absolute;left:0;right:0;top:118px;text-align:center;font-size:21px;color:rgba(255,255,255,.6)">${sub}</div>
    <div style="position:absolute;left:30px;right:30px;top:166px;display:grid;gap:9px">${[0.9, 0.7, 0.8, 0.5].map(w => `<i style="display:block;height:7px;border-radius:4px;width:${w * 100}%;background:rgba(255,255,255,.14)"></i>`).join("")}</div>`, { width: 220, height: 250 }, true);
}
function termBox(root, x, y, w, hh) {
  const e = at(root, x, y, "", '<div style="height:40px;display:flex;gap:8px;align-items:center;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.08)"><i style="width:11px;height:11px;border-radius:50%;background:#ff5f57"></i><i style="width:11px;height:11px;border-radius:50%;background:#febc2e"></i><i style="width:11px;height:11px;border-radius:50%;background:#28c840"></i></div><div class="mono tb" style="padding:12px 20px;font-size:26px;white-space:pre;color:#e8e8ed"></div>', { width: w, height: hh, borderRadius: 18, background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.12)" }, true);
  e.tb = e.querySelector(".tb"); return e;
}
function typeTo(el, s, t, a, cps = 22) { const n = Math.floor(clamp((t - a) * cps, 0, s.length)); txt(el, s.slice(0, n)); }

/* ===================== OPENING ===================== */
add({
  ch: 0, name: "오프닝", dur: 13.5, hud: false, fadeIn: false,
  build(root) {
    const src = 'printf("Hello, C!\\n");';
    const ty = at(root, 960, 500, "mono", "", { fontSize: 66, whiteSpace: "pre", fontWeight: 700 }, true);
    const outl = at(root, 960, 610, "mono", "Hello, C!", { fontSize: 44, color: "#30d158", whiteSpace: "pre" }, true);
    const tt = at(root, 960, 470, "big", "", { fontSize: 168, whiteSpace: "nowrap", display: "flex" }, true);
    const title = "C 프로그래밍 기초";
    const cols = [[255, 255, 255], [100, 210, 255], [41, 151, 255], [191, 90, 242]];
    const lets = [...title].map((c, i, arr) => {
      const sp = document.createElement("span"); sp.style.display = "inline-block";
      sp.innerHTML = c === " " ? "&nbsp;" : c;
      const f = i / (arr.length - 1) * (cols.length - 1), j = Math.min(cols.length - 2, Math.floor(f)), q = f - j;
      const cc = cols[j].map((v, k) => Math.round(lerp(v, cols[j + 1][k], q)));
      sp.style.color = `rgb(${cc})`; tt.appendChild(sp); S(sp, { o: 0 }); return sp;
    });
    const sub = at(root, 960, 615, "", '2장 — 9장 · <b style="color:#fff">강의안 코드</b>로 배우는 모션 강의', { fontSize: 40, color: "rgba(255,255,255,.62)", fontWeight: 500, whiteSpace: "nowrap" }, true);
    const tiles = [2, 3, 4, 5, 6, 7, 8, 9].map((c, i) => {
      const C = CH[c], col = i % 4, row = Math.floor(i / 4);
      const e = at(root, 158 + col * 408 + 190, 520 + row * 222 + 95, "", `<div style="font-size:64px;font-weight:900;letter-spacing:-.04em;color:${C.acc}">${C.no}</div><div style="font-size:30px;font-weight:700;margin-top:6px">${C.title}</div><div style="font-size:19px;color:rgba(255,255,255,.5);margin-top:4px">${C.en}</div>`,
        { width: 380, height: 190, borderRadius: 26, padding: "22px 28px", background: "linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)" }, true);
      return e;
    });
    return t => {
      const n = Math.floor(clamp((t - 0.35) / 1.9) * src.length);
      const blink = Math.floor(t * 2.4) % 2 === 0 || (t > 0.35 && t < 2.3);
      htm(ty, hlC(src.slice(0, n)) + `<span style="display:inline-block;width:.58em;height:1em;background:#fff;vertical-align:-.13em;margin-left:4px;opacity:${blink ? 1 : 0}"></span>`);
      const p1o = K(t, 3.1, 0.7, E.io3);
      S(ty, { o: K(t, 0.05, 0.4) * (1 - p1o), s: 1 + p1o * 0.5, b: p1o * 22, y: -p1o * 40 });
      const po = K(t, 2.45, 0.4, E.o5); S(outl, { o: po * (1 - p1o), y: (1 - po) * 16 + p1o * 40, b: p1o * 16 });
      lets.forEach((sp, i) => { const q = K(t, 3.55 + i * 0.07, 1.1, E.o5); S(sp, { o: q, y: (1 - q) * 70, b: (1 - q) * 20, s: 1.5 - 0.5 * q }); });
      const pm = K(t, 8.1, 1.2, E.io3);
      S(tt, { o: 1, y: -268 * pm, s: 1 - 0.45 * pm });
      const ps = K(t, 5.0, 0.9, E.o5);
      S(sub, { o: ps * (1 - K(t, 7.9, 0.5)), y: (1 - ps) * 24 - 30 * K(t, 7.9, 0.5) });
      tiles.forEach((e, i) => { const q = K(t, 8.7 + i * 0.11, 1.0, E.o5); S(e, { o: q, s: 1.5 - 0.5 * q, b: (1 - q) * 18, y: (1 - q) * 30 }); });
    };
  },
});

/* ===================== CHAPTER 2 ===================== */
chTitle(2, ["개발 5단계", "컴파일 · 링크", "Hello World 해부", "printf와 \\n", "오류와 디버깅"]);

dia(2, "개발 5단계", 14, root => {
  const names = [["요구사항 분석", "무엇을 만들까"], ["설계", "알고리즘 · 순서도"], ["구현", "코딩"], ["테스트", "오류 찾기"], ["유지보수", "수정 · 개선"]];
  const xs = [230, 595, 960, 1325, 1690], y = 470;
  const svg = svgLayer(root);
  const ar = xs.slice(0, 4).map((x, i) => arrow(svg, [[x + 145, y], [xs[i + 1] - 145, y]], { c: "rgba(255,255,255,.45)" }));
  const nodes = names.map(([a, b], i) => node(root, xs[i], y, 270, 200, `<div style="font:700 22px JBM;color:var(--acc);margin-bottom:8px">0${i + 1}</div>${a}<small>${b}</small>`));
  const tag = at(root, 960, 650, "", "← 코딩은 여기뿐 →", { fontSize: 26, color: "var(--acc)", fontWeight: 700 }, true);
  const algo = at(root, 595, 690, "", `<div style="display:flex;gap:14px;align-items:center;font-size:24px">
     <span style="padding:10px 18px;border:2px solid rgba(255,255,255,.4);border-radius:40px">시작</span>→
     <span style="padding:10px 18px;border:2px solid rgba(255,255,255,.4)">입력</span>→
     <span style="padding:14px 22px;border:2px solid var(--acc);transform:rotate(0deg);clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)">&nbsp;조건?&nbsp;</span>→
     <span style="padding:10px 18px;border:2px solid rgba(255,255,255,.4)">출력</span></div>`, {}, true);
  return t => {
    nodes.forEach((n, i) => { const q = K(t, 0.4 + i * 0.45, 0.7, E.ob); S(n, { o: clamp((t - 0.4 - i * 0.45) * 3) * (i === 2 || t < 5.4 ? 1 : 1 - 0.55 * K(t, 5.4, 0.5) * (1 - K(t, 9.5, 0.5))) * (t > 9.6 && i !== 1 ? 1 - 0.5 * K(t, 9.6, 0.5) : 1), s: 0.7 + 0.3 * q, y: (1 - q) * 40 }); });
    ar.forEach((a, i) => a.set(K(t, 0.75 + i * 0.45, 0.4)));
    glow(nodes[2], K(t, 5.4, 0.6) * (1 - K(t, 9.5, 0.5)));
    glow(nodes[1], K(t, 9.7, 0.6));
    vis(tag, t, 5.8, 9.4);
    vis(algo, t, 10.1, null);
  };
}, seqCaps(0.8, [[4.2, "프로그램은 **5단계**를 거쳐 세상에 나온다"], [4.0, "코딩(구현)은 그중 **세 번째 단계**일 뿐 — 앞의 분석과 설계가 더 중요하다"], [3.9, "설계 단계에서는 문제를 푸는 절차, **알고리즘**을 순서도·의사코드로 만든다"]]));

dia(2, "컴파일과 링크", 20.5, root => {
  const y = 430, svg = svgLayer(root);
  const src = fileCard(root, 200, y, "hello.c", "소스 파일");
  const comp = node(root, 545, y, 180, 180, '컴파일러<small>번역</small>', "", { borderRadius: "50%" });
  const obj = fileCard(root, 890, y, "hello.obj", "목적 파일", "#ffd479");
  const link = node(root, 1235, y, 180, 180, '링커<small>결합</small>', "", { borderRadius: "50%" });
  const exe = fileCard(root, 1600, y, "hello.exe", "실행 파일", "#30d158");
  const lib = node(root, 1235, 760, 290, 120, '라이브러리<small>printf · scanf …</small>');
  const term = termBox(root, 1600, 765, 360, 120);
  const a1 = arrow(svg, [[312, y], [452, y]], { c: "var(--acc)" }), a2 = arrow(svg, [[638, y], [776, y]], { c: "var(--acc)" }),
    a3 = arrow(svg, [[1002, y], [1142, y]], { c: "var(--acc)" }), a4 = arrow(svg, [[1328, y], [1486, y]], { c: "var(--acc)" }),
    al = arrow(svg, [[1235, 698], [1235, 525]], { c: "#ffd479" }), ar = arrow(svg, [[1600, 558], [1600, 702]], { c: "#30d158" });
  const loop = arrow(svg, [[1560, 300], [900, 60], [240, 300]], { c: "rgba(255,255,255,.5)", curve: true, w: 3 });
  const loopL = at(root, 900, 200, "", "오류가 있으면 → 다시 편집", { fontSize: 26, color: "rgba(255,255,255,.75)", fontWeight: 600 }, true);
  const pk = dot(root, "#64d2ff", 9);
  const spin = [comp, link];
  return t => {
    pop(src, t, 0.4);
    a1.set(K(t, 3.9, 0.7)); pop(comp, t, 4.5); pop(obj, t, 6.0);
    a2.set(K(t, 5.3, 0.7));
    a3.set(K(t, 9.0, 0.7)); pop(lib, t, 9.4); al.set(K(t, 9.9, 0.6)); pop(link, t, 10.4);
    a4.set(K(t, 12.6, 0.7)); pop(exe, t, 13.3);
    ar.set(K(t, 14.3, 0.5)); pop(term, t, 14.7);
    typeTo(term.tb, "Hello World!", t, 15.3, 14);
    loop.set(K(t, 17.0, 1.2, E.io3)); vis(loopL, t, 17.6, null);
    glow(comp, K(t, 4.5, 0.4) * (1 - K(t, 6.2, 0.6)));
    glow(link, K(t, 10.4, 0.4) * (1 - K(t, 12.5, 0.6)));
    const legs = [[a1, 3.9], [a2, 5.3], [a3, 9.0], [al, 9.9], [a4, 12.6]];
    let on = false;
    for (const [a, s] of legs) { const v = (t - s) / 0.7; if (v > 0 && v < 1) { moveOn(pk, a, E.io3(v), true); on = true; } }
    if (!on) S(pk, { o: 0 });
    spin.forEach(() => {});
  };
}, [[0.6, 4.4, "**소스 파일**(.c) — 사람이 읽고 쓰는 C 코드"], [4.7, 8.7, "**컴파일러**가 소스를 기계어로 번역 → **목적 파일**(.obj)"], [9.0, 12.9, "**링커**가 목적 파일과 **라이브러리**(printf 등)를 하나로 묶는다"], [13.2, 16.8, "그 결과가 **실행 파일**(.exe) — 이제 운영체제가 실행할 수 있다"], [17.0, 20.2, "편집 → 컴파일 → 링크 → 실행, 이 사이클을 반복하며 완성한다"]]);

code(2, {
  name: "Hello World 해부", file: "hello.c", tag: "강의 예제",
  title: "가장 작은 C 프로그램", about: "화면에 **Hello World!**를 출력한다. 단 7줄이지만 모든 C 프로그램의 뼈대가 들어 있다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    printf("Hello World!");
    return 0;
}`,
  steps: [
    { l: "1", t: "`#include <stdio.h>`", d: "**전처리기 지시자**. 표준 입출력 헤더 `stdio.h`를 소스에 포함시킨다. `printf`를 쓰려면 꼭 필요하다.", m: ["#include", "<stdio.h>"] },
    { l: "3", t: "`int main(void)`", d: "모든 C 프로그램은 **main 함수에서 시작**한다. `int`는 돌려줄 값의 자료형, `void`는 받는 값이 없다는 뜻.", m: ["main"] },
    { l: "4-7", t: "중괄호 `{ }` — 함수 몸체", d: "함수가 하는 일을 담는 **블록**. 여는 괄호와 닫는 괄호의 짝이 반드시 맞아야 한다." },
    { l: "5", t: "`printf(...)`", d: "큰따옴표 안의 **문자열**을 화면에 그대로 출력한다. 모든 문장은 **세미콜론 `;`** 으로 끝난다.", o: "Hello World!", m: ["printf", '5:;'] },
    { l: "6", t: "`return 0;`", d: "main을 끝내며 운영체제에 **0 (정상 종료)** 을 돌려준다." },
  ],
});

code(2, {
  name: "printf와 줄바꿈", file: "newline.c", tag: "문제 → 해결",
  title: "출력이 한 줄에 붙는다?", about: "printf를 두 번 쓰면 두 줄로 나올까? 실행해 보고 고쳐 보자.",
  vers: [String.raw`
#include <stdio.h>

int main(void)
{
    printf("Hello World!");
    printf("Kim ChulSoo");
    return 0;
}`, String.raw`
#include <stdio.h>

int main(void)
{
    printf("Hello World!\n");
    printf("Kim ChulSoo \n");
    return 0;
}`],
  steps: [
    { l: "5-6", t: "printf 두 번", d: "두 번 출력했는데 결과가 **한 줄에 붙어** 나온다. `printf`는 **자동으로 줄을 바꾸지 않는다**.", o: "Hello World!Kim ChulSoo" },
    { ver: 1, clr: true, l: "5-6", t: "`\\n` 추가", d: "`\\n`은 **줄바꿈 이스케이프 시퀀스**. 커서를 다음 줄 맨 앞으로 옮긴다.", o: "Hello World!\nKim ChulSoo \n", m: ["5:\\n", "6:\\n"] },
    { l: "5-6", t: "이스케이프 시퀀스", d: "역슬래시 `\\`로 시작하는 특수 문자: `\\t` 탭, `\\\\` 역슬래시, `\\\"` 큰따옴표, `\\a` 경고음." },
  ],
});

code(2, {
  name: "형식 지정자 %d", file: "calc.c", tag: "Lab",
  title: "printf로 계산 결과 출력", about: "따옴표 **안**은 그대로 찍히는 글자, 따옴표 **밖**은 계산되는 수식이다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    printf("2+3=%d\n", 2 + 3);
    printf("2-3=%d\n", 2 - 3);
    printf("2*3=%d\n", 2 * 3);
    printf("2/3=%d\n", 2 / 3);
    return 0;
}`,
  steps: [
    { l: "5", t: "형식 지정자 `%d`", d: "`%d` 자리에 쉼표 뒤의 **정수 값**이 들어간다. `2 + 3`이 먼저 계산되어 **5**가 찍힌다.", o: "2+3=5\n", m: ["%d", "2 + 3"] },
    { l: "6-7", t: "뺄셈 · 곱셈", d: "곱셈 기호는 `*`. 결과가 음수면 `-1`처럼 부호가 함께 출력된다.", o: "2-3=-1\n2*3=6\n" },
    { l: "8", t: "정수 나눗셈 `2 / 3`", d: "정수끼리 나누면 **몫만 남는다**. 0.666…이 아니라 **0**이 출력된다.", o: "2/3=0\n", m: ["2 / 3"] },
  ],
});

dia(2, "오류와 디버깅", 15, root => {
  const L = at(root, 510, 470, "", `<div style="display:flex;align-items:center;gap:14px;font-size:36px;font-weight:800">컴파일 오류 <span style="font-size:20px;padding:5px 14px;border-radius:999px;background:rgba(255,69,58,.18);color:#ff6b61;font-weight:700">문법 오류</span></div>
   <div class="mono" style="margin-top:34px;font-size:34px">${hlC('printf("Hi")')}<span style="display:inline-block;width:22px;border-bottom:4px wavy #ff453a;height:30px"></span></div>
   <div style="margin-top:34px;padding:18px 22px;border-radius:14px;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.4);font-size:23px;color:#ffb3ad;line-height:1.5"><b style="color:#ff6b61">error C2143</b> : 구문 오류 : ';'이(가) '}' 앞에 없습니다.</div>
   <div style="margin-top:22px;font-size:24px;color:rgba(255,255,255,.65)">→ 실행 파일이 <b style="color:#fff">만들어지지 않는다</b></div>`,
    { width: 780, height: 450, padding: "40px 44px", borderRadius: 28, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }, true);
  const R = at(root, 1410, 470, "", `<div style="display:flex;align-items:center;gap:14px;font-size:36px;font-weight:800">논리 오류 <span style="font-size:20px;padding:5px 14px;border-radius:999px;background:rgba(255,159,10,.18);color:#ffb340;font-weight:700">실행은 된다</span></div>
   <div class="mono" style="margin-top:34px;font-size:30px;line-height:1.5">${hlC('printf("Hey!");')}<br>${hlC('printf("Good Morning");')}</div>
   <div class="mono" style="margin-top:26px;padding:16px 22px;border-radius:14px;background:rgba(0,0,0,.5);font-size:28px">Hey!Good Morning</div>
   <div style="margin-top:20px;font-size:24px;color:rgba(255,255,255,.65)">→ 의도는 두 줄인데 <b style="color:#fff">결과가 틀렸다</b></div>`,
    { width: 780, height: 450, padding: "40px 44px", borderRadius: 28, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }, true);
  const D = at(root, 960, 775, "", "디버깅 = 오류(bug)를 찾아 없애는 과정", { fontSize: 30, fontWeight: 700, padding: "14px 30px", borderRadius: 999, border: "2px solid var(--acc)", color: "#fff", background: "rgba(41,151,255,.12)" }, true);
  return t => { rise(L, t, 0.5, 0.9, 60); rise(R, t, 5.2, 0.9, 60); glow(L, K(t, 0.9, 0.5) * (1 - K(t, 5.0, 0.5)), "#ff453a"); glow(R, K(t, 5.6, 0.5) * (1 - K(t, 9.8, 0.5)), "#ff9f0a"); pop(D, t, 10.2); };
}, seqCaps(0.8, [[4.3, "**컴파일 오류**: 문법이 틀려 번역 자체가 안 된다 — 컴파일러가 위치를 알려 준다"], [4.4, "**논리 오류**: 실행은 되지만 결과가 틀리다 — 스스로 찾아야 해서 더 어렵다"], [4.3, "오류를 찾아 고치는 과정이 바로 **디버깅(debugging)**"]]));

code(2, {
  name: "문자와 아스키 코드", file: "ascii.c", tag: "Lab", types: { id: "char" },
  title: "문자는 사실 숫자", about: "같은 변수를 `%c`와 `%d`로 출력해 보면 문자의 정체가 드러난다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    char id = 'C';
    printf("%c -> %d\n", id, id);
    return 0;
}`,
  steps: [
    { l: "5", t: "`char` 변수", d: "문자형 변수 id에 **'C'**를 저장. 작은따옴표 `' '`는 **문자 하나**를 뜻한다.", v: { id: "'C'" }, m: ["'C'"] },
    { l: "6", t: "같은 값, 두 얼굴", d: "`%c`로 찍으면 **문자 C**, `%d`로 찍으면 그 **아스키 코드 67**. 컴퓨터 안에서 문자는 숫자로 저장된다.", o: "C -> 67\n", m: ["%c", "%d"] },
  ],
});
/* ===================== CHAPTER 3 ===================== */
chTitle(3, ["주석", "변수 선언과 대입", "산술 연산", "printf · scanf", "& 주소 연산자", "float · double"]);

code(3, {
  name: "주석과 변수", file: "sum.c", tag: "강의 예제", types: { x: "int", y: "int", sum: "int" },
  title: "두 수의 합", about: "주석, 변수 선언, 대입, 연산, 출력 — C 프로그램의 **구성요소**가 모두 들어 있는 예제.",
  src: String.raw`
/* 두 개의 숫자의 합을 계산하는 프로그램 */
#include <stdio.h>

int main(void)
{
    int x;    // 첫 번째 정수를 저장할 변수
    int y;    // 두 번째 정수를 저장할 변수
    int sum;  // 두 정수의 합을 저장하는 변수
    x = 100;
    y = 200;
    sum = x + y;
    printf("두수의 합 : %d", sum);
    return 0;
}`,
  steps: [
    { l: "1", t: "블록 주석 `/* … */`", d: "컴파일러가 **무시**하는 설명문. 여러 줄에 걸쳐 쓸 수 있다. 코드를 읽는 **사람**을 위한 것.", m: ["/*"] },
    { l: "6-8", t: "변수 선언", d: "`int x;` → 정수를 담을 **상자 x**를 만든다. 아직 값을 넣지 않아 **쓰레기값(?)** 이 들어 있다. `//`는 한 줄 주석.", v: { x: "?", y: "?", sum: "?" }, m: ["6:int x;", "6://"] },
    { l: "9-10", t: "대입 연산자 `=`", d: "`=`는 '같다'가 아니다. **오른쪽 값을 왼쪽 변수에 저장**하라는 명령이다.", v: { x: "100", y: "200" }, m: ["9:=", "10:="] },
    { l: "11", t: "계산 후 저장", d: "오른쪽 `x + y`를 **먼저 계산**(300)하고, 그 결과를 sum에 저장한다.", v: { sum: "300" }, m: ["x + y"] },
    { l: "12", t: "결과 출력", d: "`%d` 자리에 sum의 값 **300**이 들어간다.", o: "두수의 합 : 300", m: ["%d", "12:sum"] },
    { l: "13", t: "정상 종료", d: "`return 0;` 으로 main 함수를 마친다." },
  ],
});

dia(3, "변수 = 메모리 상자", 16.5, root => {
  const cells = [];
  for (let i = 0; i < 8; i++) {
    const c = at(root, 300 + i * 190, 400, "", `<div class="mono" style="position:absolute;top:-38px;left:0;right:0;text-align:center;font-size:18px;color:rgba(255,255,255,.4)">0x10${(i * 4).toString(16).padStart(2, "0").toUpperCase()}</div>`,
      { width: 170, height: 150, borderRadius: 18, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.03)" }, true);
    cells.push(c);
  }
  const vars = [["x", "100", 2], ["y", "200", 3], ["sum", "300", 5]].map(([n, v, i]) => {
    const tag = at(root, 300 + i * 190, 520, "mono", n, { fontSize: 32, fontWeight: 700, color: "var(--acc)", padding: "4px 18px", borderRadius: 10, background: "rgba(48,213,200,.14)" }, true);
    const val = at(root, 300 + i * 190, 400, "mono", v, { fontSize: 48, fontWeight: 700 }, true);
    return { tag, val, i };
  });
  const rules = [["sum", 1], ["_count", 1], ["score2", 1], ["2nd", 0], ["int", 0], ["my-name", 0]].map(([s, ok], i) =>
    at(root, 330 + i * 250, 760, "mono", `<span style="color:${ok ? "#30d158" : "#ff453a"};font-family:'Noto Sans KR','Noto Sans CJK KR';font-weight:800;margin-right:12px">${ok ? "✓" : "✕"}</span>${s}`, { fontSize: 30, padding: "14px 26px", borderRadius: 999, border: `1px solid ${ok ? "rgba(48,209,88,.5)" : "rgba(255,69,58,.5)"}`, background: "rgba(255,255,255,.04)" }, true));
  return t => {
    cells.forEach((c, i) => pop(c, t, 0.3 + i * 0.06));
    vars.forEach((v, j) => {
      const a = 4.6 + j * 0.5;
      const q = K(t, a, 0.6, E.ob); S(v.tag, { o: clamp((t - a) * 3), y: (1 - q) * 30 });
      glow(cells[v.i], K(t, a, 0.4));
      const b = 6.8 + j * 0.5, d = K(t, b, 0.7, E.o5);
      S(v.val, { o: clamp((t - b) * 3), y: -(1 - d) * 160, s: 0.6 + 0.4 * d });
    });
    rules.forEach((r, i) => pop(r, t, 10.6 + i * 0.25));
  };
}, seqCaps(0.6, [[3.6, "메모리는 **주소**가 붙은 작은 칸들의 모임"], [2.0, "변수를 **선언**하면 칸 하나에 이름이 붙고"], [3.4, "**대입**하면 그 칸에 값이 들어간다"], [5.6, "이름 규칙: 영문자 · 숫자 · `_` 만 / **숫자로 시작 불가** / **키워드 불가** / 대소문자 구분"]]));

code(3, {
  name: "사칙연산 전체 코드", file: "arith.c", tag: "강의 예제", types: { x: "int", y: "int", sum: "int", diff: "int", mul: "int", div: "int" },
  title: "정수의 가감승제", about: "변수 여섯 개로 덧셈 · 뺄셈 · 곱셈 · 나눗셈을 한 번에 계산한다.",
  src: String.raw`
// 정수 간의 가감승제를 계산하는 프로그램
#include <stdio.h>

int main(void)
{
    int x;                       // 첫 번째 정수
    int y;                       // 두 번째 정수
    int sum, diff, mul, div;     // 연산 결과들

    x = 20;
    y = 10;

    sum  = x + y;
    diff = x - y;
    mul  = x * y;
    div  = x / y;

    printf("두수의 합: %d\n", sum);
    printf("두수의 차: %d\n", diff);
    printf("두수의 곱: %d\n", mul);
    printf("두수의 몫: %d\n", div);

    return 0;
}`,
  steps: [
    { l: "6-8", t: "변수 선언", d: "같은 자료형이면 **쉼표**로 한 줄에 여러 개를 선언할 수 있다.", v: { x: "?", y: "?", sum: "?", diff: "?", mul: "?", div: "?" }, m: ["sum, diff, mul, div"] },
    { l: "10-11", t: "값 대입", d: "x에 20, y에 10을 저장한다.", v: { x: "20", y: "10" } },
    { l: "13-16", t: "네 가지 산술 연산", d: "`+ - * /` 결과를 각 변수에 저장. 정수 나눗셈 20 / 10 = **2**.", v: { sum: "30", diff: "10", mul: "200", div: "2" } },
    { l: "18-21", t: "한 줄에 하나씩 출력", d: "각 문자열 끝의 `\\n` 덕분에 결과가 **한 줄씩** 찍힌다.", o: "두수의 합: 30\n두수의 차: 10\n두수의 곱: 200\n두수의 몫: 2\n" },
  ],
});

dia(3, "scanf와 & 주소", 18, root => {
  const line = at(root, 960, 230, "mono", hlC('scanf("%d", &x);'), { fontSize: 76, fontWeight: 700, whiteSpace: "pre" }, true);
  const l1 = at(root, 820, 345, "", "정수 형식으로 읽어", { fontSize: 26, color: "#ff8a75", fontWeight: 700 }, true);
  const l2 = at(root, 1180, 345, "", "x의 주소에 저장", { fontSize: 26, color: "var(--acc)", fontWeight: 700 }, true);
  const keys = ["2", "5", "Enter"].map((k, i) => at(root, 320 + i * 120 + (i === 2 ? 30 : 0), 640, "mono", k, { width: i === 2 ? 170 : 100, height: 100, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i === 2 ? 28 : 44, fontWeight: 700, background: "linear-gradient(180deg,#3a3a40,#232327)", border: "1px solid rgba(255,255,255,.18)", boxShadow: "0 8px 0 #111" }, true));
  const kl = at(root, 450, 740, "", "키보드 입력", { fontSize: 24, color: "rgba(255,255,255,.55)" }, true);
  const box = at(root, 1420, 640, "", `<div class="mono" style="position:absolute;top:-44px;left:0;right:0;text-align:center;font-size:22px;color:rgba(255,255,255,.5)">주소 0x7FF0</div>`, { width: 230, height: 190, borderRadius: 22, border: "2px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.04)" }, true);
  const nm = at(root, 1420, 780, "mono", "x", { fontSize: 34, fontWeight: 700, color: "var(--acc)" }, true);
  const val = at(root, 1420, 640, "mono", "25", { fontSize: 72, fontWeight: 700 }, true);
  const fly = at(root, 0, 0, "mono", "25", { fontSize: 60, fontWeight: 700, color: "#30d158", textShadow: "0 0 24px #30d158" }, true);
  const svg = svgLayer(root);
  const ar = arrow(svg, [[1190, 385], [1240, 500], [1300, 548]], { c: "var(--acc)", curve: true, w: 4 });
  const warn = at(root, 960, 900, "", "", {}, true);
  return t => {
    blurIn(line, t, 0.3); vis(l1, t, 1.8, null); vis(l2, t, 2.4, null);
    keys.forEach((k, i) => { pop(k, t, 4.2 + i * 0.12); const pr = K(t, 5.0 + i * 0.5, 0.12) * (1 - K(t, 5.15 + i * 0.5, 0.15)); S(k, { o: clamp((t - 4.2 - i * 0.12) * 3), y: pr * 8 }); });
    vis(kl, t, 4.4, null);
    pop(box, t, 4.6); vis(nm, t, 4.8, null);
    ar.set(K(t, 8.0, 0.9, E.io3));
    glow(box, K(t, 8.6, 0.4));
    const f = K(t, 6.6, 1.6, E.io3);
    if (t > 6.6 && t < 8.3) { const x = lerp(400, 1420, f), y = lerp(560, 640, f) - Math.sin(f * Math.PI) * 220; S(fly, { o: 1, x, y }); } else S(fly, { o: 0 });
    const vq = K(t, 8.2, 0.4, E.ob); S(val, { o: clamp((t - 8.2) * 4), s: 0.6 + 0.4 * vq });
  };
}, seqCaps(0.6, [[4.0, "`scanf`는 키보드 입력을 읽어 **변수에 저장**하는 함수"], [3.6, "사용자가 25를 입력하고 Enter를 누르면…"], [4.4, "`&x` 는 x의 **주소** — 값을 '어디에' 넣을지 알려 준다"], [4.2, "`&`를 빠뜨리면 엉뚱한 곳에 쓰려다 **프로그램이 비정상 종료**될 수 있다"]]));

code(3, {
  name: "입력받아 더하기", file: "input_add.c", tag: "강의 예제", types: { x: "int", y: "int", sum: "int" },
  title: "두 수를 입력받아 합 출력", about: "이번에는 값을 코드에 쓰지 않고 **실행 중에 키보드로** 받는다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int x;
    int y;
    int sum;

    printf("첫번째 숫자를 입력하시오:");
    scanf("%d", &x);

    printf("두번째 숫자를 입력하시오:");
    scanf("%d", &y);

    sum = x + y;
    printf("두수의 합: %d", sum);

    return 0;
}`,
  steps: [
    { l: "1", t: "`_CRT_SECURE_NO_WARNINGS`", d: "Visual Studio가 `scanf`에 내는 **보안 경고를 끄는** 매크로. 반드시 **맨 첫 줄**에 둔다.", m: ["_CRT_SECURE_NO_WARNINGS"] },
    { l: "6-8", t: "변수 세 개", d: "입력받을 x, y와 합을 담을 sum.", v: { x: "?", y: "?", sum: "?" } },
    { l: "10-11", t: "첫 번째 입력", d: "안내 문구를 출력한 뒤 `scanf`가 **입력을 기다린다**. 입력한 10이 x에 저장된다.", o: "첫번째 숫자를 입력하시오:[[10]]\n", v: { x: "10" }, m: ["&x"] },
    { l: "13-14", t: "두 번째 입력", d: "같은 방식으로 20을 y에 저장.", o: "두번째 숫자를 입력하시오:[[20]]\n", v: { y: "20" }, m: ["&y"] },
    { l: "16-17", t: "합 계산 · 출력", d: "sum = 10 + 20 = **30**. 입력값이 바뀌면 결과도 바뀐다.", v: { sum: "30" }, o: "두수의 합: 30" },
  ],
});

code(3, {
  name: "원의 면적 (float)", file: "circle.c", tag: "Lab", types: { radius: "float", area: "float" },
  title: "실수를 다루는 float", about: "반지름을 입력받아 원의 면적 πr²을 구한다. 소수점이 필요하니 `float`.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    float radius;   // 반지름
    float area;     // 면적

    printf("반지름을 입력하시오 : ");
    scanf("%f", &radius);
    area = 3.14 * radius * radius;   // πr^2
    printf("원의 면적 : %f\n", area);

    return 0;
}`,
  steps: [
    { l: "6-7", t: "`float` 변수", d: "소수점이 있는 **실수**를 담는 자료형.", v: { radius: "?", area: "?" }, m: ["6:float", "7:float"] },
    { l: "9-10", t: "`%f`로 실수 입력", d: "실수를 읽을 때는 형식 지정자 **%f**.", o: "반지름을 입력하시오 : [[5]]\n", v: { radius: "5.0" }, m: ["%f"] },
    { l: "11", t: "πr²", d: "3.14 × 5 × 5 = **78.5**", v: { area: "78.5" }, m: ["3.14 * radius * radius"] },
    { l: "12", t: "실수 출력", d: "`%f`는 기본적으로 **소수점 아래 6자리**까지 출력한다.", o: "원의 면적 : 78.500000\n" },
  ],
});

code(3, {
  name: "환율 계산 (double)", file: "exchange.c", tag: "강의 예제", types: { rate: "double", usd: "double", krw: "int" },
  title: "원화 → 달러", about: "환율과 원화 금액을 입력받아 달러로 바꾼다. `double`과 `%lf`가 핵심.",
  src: String.raw`
/* 환율을 계산하는 프로그램 */
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    double rate;   // 원/달러 환율
    double usd;    // 달러화
    int krw;       // 원화(정수)

    printf("환율을 입력하시오: ");
    scanf("%lf", &rate);

    printf("원화 금액을 입력하시오: ");
    scanf("%d", &krw);

    usd = krw / rate;   // 원화를 환율로 나눠 달러로
    printf("원화 %d원은 %lf달러입니다.\n", krw, usd);

    return 0;
}`,
  steps: [
    { l: "7-9", t: "자료형 고르기", d: "환율 · 달러는 소수가 생기니 `double`, 원화는 정수 `int`.", v: { rate: "?", usd: "?", krw: "?" } },
    { l: "11-12", t: "`%lf` 로 double 입력", d: "`double`을 `scanf`로 읽을 때는 반드시 **%lf**. (`%f`는 float용)", o: "환율을 입력하시오: [[1300]]\n", v: { rate: "1300.0" }, m: ["%lf"] },
    { l: "14-15", t: "원화 입력", d: "정수이므로 `%d`.", o: "원화 금액을 입력하시오: [[650000]]\n", v: { krw: "650000" } },
    { l: "17", t: "int ÷ double", d: "한쪽이 double이면 **double로 계산**되어 소수가 보존된다. 650000 / 1300 = **500**", v: { usd: "500.0" }, m: ["krw / rate"] },
    { l: "18", t: "섞어서 출력", d: "`%d`에는 정수 krw, `%lf`에는 실수 usd가 **순서대로** 대응한다.", o: "원화 650000원은 500.000000달러입니다.\n", m: ["%d", "%lf"] },
  ],
});
/* ===================== CHAPTER 4 ===================== */
chTitle(4, ["자료형과 크기", "sizeof", "오버플로우", "8진 · 16진 상수", "기호 상수", "문자와 아스키"]);

dia(4, "자료형 한눈에", 17.5, root => {
  const rows = [["char", 1, "-128 ~ 127", "#30d158"], ["short", 2, "-32,768 ~ 32,767", "var(--acc)"], ["int", 4, "약 -21억 ~ 21억", "var(--acc)"], ["long", 4, "약 -21억 ~ 21억", "var(--acc)"], ["long long", 8, "약 ±922경", "var(--acc)"], ["float", 4, "±3.4×10³⁸ · 유효 6~7자리", "#ff9f0a"], ["double", 8, "±1.8×10³⁰⁸ · 유효 15자리", "#ff9f0a"]];
  const R = rows.map(([n, b, rg, col], i) => {
    const y = 200 + i * 94;
    const lab = at(root, 210, y, "mono", n, { fontSize: 34, fontWeight: 700, color: col, width: 260, textAlign: "right" });
    const blocks = [];
    for (let k = 0; k < b; k++) blocks.push(at(root, 510 + k * 72, y - 4, "", "", { width: 64, height: 56, borderRadius: 10, background: col, opacity: 0.9 }));
    const bl = at(root, 510 + b * 72 + 18, y + 4, "", b + " 바이트", { fontSize: 26, fontWeight: 700 });
    const r = at(root, 1290, y + 4, "", rg, { fontSize: 27, color: "rgba(255,255,255,.7)" });
    return { lab, blocks, bl, r, i };
  });
  return t => R.forEach(({ lab, blocks, bl, r, i }) => {
    const a = 0.4 + i * 0.32;
    rise(lab, t, a, 0.6, 0);
    blocks.forEach((b, k) => { const q = K(t, a + 0.15 + k * 0.06, 0.45, E.ob); S(b, { o: clamp((t - a - 0.15 - k * 0.06) * 4) * 0.9, sy: q, s: 1 }); });
    rise(bl, t, a + 0.5, 0.5, 0);
    vis(r, t, a + 0.7, null, { dy: 0, x: 0 });
  });
}, seqCaps(0.6, [[4.2, "자료형마다 **크기(바이트)** 와 **표현 범위**가 다르다"], [3.8, "정수형: char · short · int · long · long long"], [3.8, "실수형: float · double — double이 두 배 크고 **더 정밀**"], [4.0, "1바이트 = 8비트 → 2⁸ = **256가지** 값을 표현"]]));

code(4, {
  name: "sizeof로 크기 확인", file: "sizeof.c", tag: "강의 예제",
  title: "자료형의 크기", about: "`sizeof` 연산자로 각 자료형이 메모리를 몇 바이트 쓰는지 직접 확인한다.",
  termH: 320,
  src: String.raw`
#include <stdio.h>

int main(void)
{
    printf("char형의 크기: %d\n", sizeof(char));
    printf("int형의 크기: %d\n", sizeof(int));
    printf("short형의 크기: %d\n", sizeof(short));
    printf("long형의 크기: %d\n", sizeof(long));
    printf("float형의 크기: %d\n", sizeof(float));
    printf("double형의 크기: %d\n", sizeof(double));
    return 0;
}`,
  steps: [
    { l: "5", t: "`sizeof` 연산자", d: "자료형이나 변수가 차지하는 **바이트 수**를 알려 준다. 함수처럼 생겼지만 **연산자**다.", o: "char형의 크기: 1\n", m: ["sizeof(char)"] },
    { l: "6-8", t: "정수형들", d: "int **4**, short **2**, long **4** (Windows 기준 — 시스템마다 다를 수 있다).", o: "int형의 크기: 4\nshort형의 크기: 2\nlong형의 크기: 4\n" },
    { l: "9-10", t: "실수형들", d: "float **4**바이트, double **8**바이트.", o: "float형의 크기: 4\ndouble형의 크기: 8\n" },
  ],
});

dia(4, "오버플로우의 정체", 17.5, root => {
  const mk = (y, label, sub) => {
    const L = at(root, 160, y - 110, "", `<span class="mono" style="font-size:34px;font-weight:700;color:var(--acc)">${label}</span><span style="font-size:24px;color:rgba(255,255,255,.55);margin-left:18px">${sub}</span>`, {});
    const bits = []; for (let i = 0; i < 16; i++) bits.push(at(root, 160 + i * 74 + Math.floor(i / 4) * 14, y - 40, "cell", "0", { width: 64, height: 80, fontSize: 38, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)" }));
    const num = at(root, 1640, y, "mono", "", { fontSize: 86, fontWeight: 700 }, true);
    const plus = at(root, 1640, y - 105, "", "+1", { fontSize: 34, fontWeight: 800, color: "#30d158" }, true);
    return { L, bits, num, plus };
  };
  const A = mk(380, "short", "부호 있는 16비트"), B = mk(760, "unsigned short", "부호 없는 16비트");
  const sign = at(root, 132, 452, "", "부호 비트", { fontSize: 20, color: "#ff8aa5", fontWeight: 700, width: 120, textAlign: "center" });
  const lost = at(root, 120, 720, "mono", "1", { fontSize: 44, fontWeight: 700, color: "#ff453a" }, true);
  const bin = v => { const s = (v & 0xffff).toString(2).padStart(16, "0"); return s.split(""); };
  const setBits = (P, s, flipAt, prev, t) => P.bits.forEach((b, i) => {
    const cur = flipAt != null && t >= flipAt + (15 - i) * 0.07 ? s[i] : prev[i];
    txt(b, cur);
    const on = cur === "1";
    const bg = on ? (P === A && i === 0 ? "rgba(255,55,95,.55)" : "color-mix(in srgb, var(--acc) 55%, transparent)") : "rgba(255,255,255,.06)";
    if (b._bg !== bg) { b.style.background = bg; b._bg = bg; }
  });
  return t => {
    [A, B].forEach((P, k) => { const a = k ? 9.4 : 0.4; vis(P.L, t, a, null); P.bits.forEach((b, i) => pop(b, t, a + 0.2 + i * 0.03)); S(P.num, { o: K(t, a + 0.6, 0.5) }); });
    vis(sign, t, 1.6, null);
    // short: 32766 → 32767 (2.6) → -32768 (6.0)
    let sv, sp, sf, sprev;
    if (t < 2.6) { sv = 32766; sp = bin(32766); sf = null; sprev = sp; }
    else if (t < 6.0) { sv = 32767; sp = bin(32767); sf = 2.6; sprev = bin(32766); }
    else { sv = -32768; sp = bin(-32768); sf = 6.0; sprev = bin(32767); }
    setBits(A, sp, sf, sprev, t);
    txt(A.num, String(t < 2.6 ? 32766 : t < 3.6 ? 32767 : t < 7.1 ? 32767 : -32768));
    const red = K(t, 7.1, 0.2) * (1 - K(t, 8.2, 0.8));
    A.num.style.color = red > 0.01 ? `color-mix(in srgb, #ff375f ${(red * 100).toFixed(0)}%, #fff)` : "#fff";
    S(A.num, { o: K(t, 1.0, 0.5), s: 1 + 0.15 * red });
    S(A.plus, { o: (K(t, 2.3, 0.2) * (1 - K(t, 3.0, 0.4))) + (K(t, 5.7, 0.2) * (1 - K(t, 6.4, 0.4))), y: -20 * (K(t, 2.3, 0.7) + K(t, 5.7, 0.7)) });
    // unsigned: 65534 → 65535 (11.0) → 0 (13.6)
    let uv;
    if (t < 11.0) { uv = 65534; setBits(B, bin(65534), null, bin(65534), t); }
    else if (t < 13.6) { setBits(B, bin(65535), 11.0, bin(65534), t); }
    else setBits(B, bin(0), 13.6, bin(65535), t);
    txt(B.num, String(t < 12.0 ? 65534 : t < 14.7 ? 65535 : 0));
    S(B.num, { o: K(t, 10.0, 0.5), s: 1 + 0.15 * K(t, 14.7, 0.2) * (1 - K(t, 15.6, 0.6)) });
    S(B.plus, { o: (K(t, 10.7, 0.2) * (1 - K(t, 11.4, 0.4))) + (K(t, 13.3, 0.2) * (1 - K(t, 14.0, 0.4))), y: -20 * (K(t, 10.7, 0.7) + K(t, 13.3, 0.7)) });
    const lq = K(t, 14.7, 1.4, E.o3); S(lost, { o: clamp((t - 14.7) * 4) * (1 - K(t, 16.2, 0.6)), x: -lq * 60, y: -lq * 90 });
  };
}, [[0.6, 5.4, "short = 2바이트 = **16비트**, 맨 앞 비트는 **부호** (0이면 양수, 1이면 음수)"], [5.7, 9.2, "최대값 **32767**에 1을 더하면 부호 비트가 켜져 **-32768** — 오버플로우"], [9.5, 13.2, "unsigned short는 부호 없이 **0 ~ 65535**"], [13.4, 17.2, "65535 + 1 → 넘친 자리는 버려지고 **0**으로 돌아간다 (주행거리계처럼)"]]);

code(4, {
  name: "오버플로우 실험", file: "overflow.c", tag: "강의 예제", types: { s_money: "short", u_money: "unsigned short" },
  title: "최대값 + 1 = ?", about: "각 자료형의 **최대값**에 1을 더해 보면 무슨 일이 일어날까?",
  src: String.raw`
#include <stdio.h>
#include <limits.h>

int main(void)
{
    short s_money = SHRT_MAX;            // 32767 (short 최대값)
    unsigned short u_money = USHRT_MAX;  // 65535

    s_money = s_money + 1;   // 오버플로우!
    printf("s_money = %d\n", s_money);

    u_money = u_money + 1;   // 오버플로우!
    printf("u_money = %d\n", u_money);
    return 0;
}`,
  steps: [
    { l: "2", t: "`limits.h`", d: "각 자료형의 최대 · 최소값이 **기호 상수**로 들어 있는 헤더. `SHRT_MAX`, `USHRT_MAX`, `INT_MAX` …", m: ["limits.h"] },
    { l: "6-7", t: "최대값으로 시작", d: "두 변수를 각 자료형의 **최대값**으로 초기화한다.", v: { s_money: "32767", u_money: "65535" }, m: ["SHRT_MAX", "USHRT_MAX"] },
    { l: "9-10", t: "short + 1", d: "범위를 넘으면 **음수 최소값**으로 넘어간다. 오류 메시지도 없이!", v: { s_money: "-32768" }, o: "s_money = -32768\n" },
    { l: "12-13", t: "unsigned short + 1", d: "부호 없는 형은 **0으로** 돌아간다. 값의 범위를 넉넉히 잡는 것이 예방책.", v: { u_money: "0" }, o: "u_money = 0\n" },
  ],
});

code(4, {
  name: "8진 · 16진 상수", file: "radix.c", tag: "강의 예제", types: { x: "int", y: "int", z: "int" },
  title: "숫자 앞의 0과 0x", about: "같은 `10`이라도 앞에 무엇이 붙느냐에 따라 **다른 값**이 된다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int x = 10;    // 10진수 → 10
    int y = 010;   // 8진수  → 8
    int z = 0x10;  // 16진수 → 16

    printf("x = %d\n", x);
    printf("y = %d\n", y);
    printf("z = %d\n", z);
    return 0;
}`,
  steps: [
    { l: "5", t: "10진수", d: "평범하게 쓴 숫자는 10진수.", v: { x: "10" } },
    { l: "6", t: "앞에 `0` → 8진수", d: "`010` = 1×8 + 0 = **8**. 숫자 앞에 0을 붙이면 의미가 바뀌니 주의!", v: { y: "8" }, m: ["010"] },
    { l: "7", t: "앞에 `0x` → 16진수", d: "`0x10` = 1×16 + 0 = **16**. 16진수는 0~9, A~F를 쓴다.", v: { z: "16" }, m: ["0x10"] },
    { l: "9-11", t: "%d는 10진수로 출력", d: "저장된 것은 그냥 정수. `%d`로 찍으면 10진수, `%o`면 8진수, `%x`면 16진수로 보여 준다.", o: "x = 10\ny = 8\nz = 16\n" },
  ],
});

code(4, {
  name: "기호 상수", file: "salary.c", tag: "강의 예제", types: { MONTHS: "const int", m_salary: "int", y_salary: "int" },
  title: "#define과 const", about: "숫자에 **이름**을 붙이면 코드의 의미가 분명해지고, 바꿀 때 한 곳만 고치면 된다.",
  src: String.raw`
#include <stdio.h>
#define TAX_RATE 0.2

int main(void)
{
    const int MONTHS = 12;
    int m_salary, y_salary;

    printf("월급을 입력하시요: ");
    scanf("%d", &m_salary);
    y_salary = MONTHS * m_salary;
    printf("연봉은 %d입니다.", y_salary);
    printf("세금은 %f입니다.", y_salary * TAX_RATE);
    return 0;
}`,
  steps: [
    { l: "2", t: "`#define` 기호 상수", d: "전처리기가 코드 속 `TAX_RATE`를 모두 **0.2로 치환**한다. 끝에 세미콜론이 없다.", m: ["TAX_RATE"] },
    { l: "6", t: "`const` 상수", d: "`const`가 붙은 변수는 **값을 바꿀 수 없다**. `MONTHS = 13;` 은 컴파일 오류.", v: { MONTHS: "12" }, m: ["const"] },
    { l: "7", t: "변수 선언", d: "월급과 연봉.", v: { m_salary: "?", y_salary: "?" } },
    { l: "9-10", t: "월급 입력", d: "300만 원을 입력.", o: "월급을 입력하시요: [[3000000]]\n", v: { m_salary: "3000000" } },
    { l: "11", t: "연봉 = 12 × 월급", d: "12 × 3,000,000 = **36,000,000**", v: { y_salary: "36000000" } },
    { l: "12-13", t: "세금 출력", d: "정수 × 0.2(실수) → **실수**이므로 `%f`. 세율이 바뀌면 2번째 줄 **한 곳만** 고치면 된다.", o: "연봉은 36000000입니다.세금은 7200000.000000입니다.", m: ["%f"] },
  ],
});

code(4, {
  name: "char에 산술 연산", file: "char_math.c", tag: "강의 예제", types: { code: "char" },
  title: "문자에 1을 더하면?", about: "`char`는 사실 **1바이트 정수**. 그래서 덧셈도 된다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    char code = 'A';
    printf("%d %d %d\n", code, code + 1, code + 2); // 65 66 67
    printf("%c %c %c\n", code, code + 1, code + 2); // A B C
    return 0;
}`,
  steps: [
    { l: "5", t: "문자 = 정수", d: "'A'는 내부적으로 아스키 코드 **65**로 저장된다.", v: { code: "'A' (65)" }, m: ["'A'"] },
    { l: "6", t: "`%d`로 보면", d: "code + 1, code + 2는 그냥 정수 덧셈 → **65 66 67**", o: "65 66 67\n", m: ["%d %d %d"] },
    { l: "7", t: "`%c`로 보면", d: "같은 값을 `%c`로 찍으면 **A B C**. 문자에 1을 더하면 **다음 문자**!", o: "A B C\n", m: ["%c %c %c"] },
  ],
});

dia(4, "아스키 코드", 13.5, root => {
  const L = "ABCDEFGH".split("");
  const cells = L.map((c, i) => at(root, 400 + i * 160, 330, "", `<div class="mono" style="font-size:66px;font-weight:700">${c}</div><div class="mono" style="font-size:26px;color:rgba(255,255,255,.55)">${65 + i}</div>`, { width: 140, height: 160, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }, true));
  const ring = at(root, 400, 330, "", "", { width: 156, height: 176, borderRadius: 24, border: "3px solid var(--acc)", boxShadow: "0 0 40px var(--acc)" }, true);
  const plus = at(root, 480, 210, "", "+1", { fontSize: 34, fontWeight: 800, color: "var(--acc)" }, true);
  const bin = at(root, 960, 540, "mono", "'A' = 65 = <span style='color:var(--acc)'>0100 0001</span>", { fontSize: 46, fontWeight: 700 }, true);
  const a = at(root, 640, 740, "", `<div class="mono" style="font-size:60px;font-weight:700">a</div><div class="mono" style="font-size:24px;color:rgba(255,255,255,.55)">97</div>`, { width: 150, height: 150, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(48,209,88,.1)", border: "1px solid rgba(48,209,88,.5)" }, true);
  const A2 = at(root, 1280, 740, "", `<div class="mono" style="font-size:60px;font-weight:700">A</div><div class="mono" style="font-size:24px;color:rgba(255,255,255,.55)">65</div>`, { width: 150, height: 150, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(191,90,242,.12)", border: "1px solid rgba(191,90,242,.5)" }, true);
  const svg = svgLayer(root);
  const ar = arrow(svg, [[730, 740], [1190, 740]], { c: "#fff", w: 4 });
  const m32 = at(root, 960, 700, "mono", "− 32", { fontSize: 40, fontWeight: 700, color: "#ffd479" }, true);
  return t => {
    cells.forEach((c, i) => pop(c, t, 0.3 + i * 0.08));
    const pos = t < 3 ? 0 : t < 3.8 ? K(t, 3, 0.5, E.io3) : t < 4.6 ? 1 + K(t, 3.8, 0.5, E.io3) : 2 + K(t, 4.6, 0.5, E.io3) * 0;
    S(ring, { o: K(t, 2.2, 0.4), x: pos * 160 });
    S(plus, { o: (t > 3 && t < 5.2 ? 1 : 0) * K(t, 3, 0.2), x: Math.min(2, Math.floor(pos + 0.5)) * 160 });
    pop(a, t, 6.4); ar.set(K(t, 6.9, 0.7)); vis(m32, t, 7.2, null); pop(A2, t, 7.6);
    blurIn(bin, t, 9.6);
  };
}, seqCaps(0.5, [[5.4, "**아스키(ASCII)**: 문자마다 번호를 붙인 표 — 'A'=65, 'B'=66, 'C'=67 …"], [3.0, "소문자 'a'는 97 → 대문자와 **32 차이**"], [3.8, "그리고 결국 컴퓨터 안에서는 **0과 1**"]]));

code(4, {
  name: "빛의 도달 시간", file: "light.c", tag: "강의 예제", types: { light_speed: "double", distance: "double", time: "double" },
  title: "태양 빛이 지구에 닿는 시간", about: "아주 큰 수와 소수가 함께 나오는 계산 — `double`이 필요한 이유.",
  termH: 260,
  src: String.raw`
#include <stdio.h>

int main(void)
{
    double light_speed = 300000;    // 빛의 속도(km/s)
    double distance = 149600000;    // 태양-지구 거리(km)
    double time;                    // 시간

    time = distance / light_speed;  // 거리 ÷ 속도 = 시간(초)
    time = time / 60.0;             // 초 → 분

    printf("빛의 속도는 %fkm/s \n", light_speed);
    printf("태양과 지구와의 거리 %fkm \n", distance);
    printf("도달 시간은 %f분\n", time);
    return 0;
}`,
  steps: [
    { l: "5-7", t: "double 세 개", d: "1억이 넘는 거리와 소수점 결과를 정확히 다루기 위해 `double`.", v: { light_speed: "300000.0", distance: "149600000.0", time: "?" } },
    { l: "9", t: "시간 = 거리 ÷ 속도", d: "149,600,000 ÷ 300,000 = **498.67초**", v: { time: "498.666667" } },
    { l: "10", t: "초 → 분", d: "`60.0`으로 나눠 **8.31분**. 빛도 태양에서 지구까지 8분 넘게 걸린다!", v: { time: "8.311111" }, m: ["60.0"] },
    { l: "12-14", t: "출력", d: "`%f`는 double도 출력한다. 소수점 아래 6자리.", o: "빛의 속도는 300000.000000km/s \n태양과 지구와의 거리 149600000.000000km \n도달 시간은 8.311111분\n" },
  ],
});

dia(4, "8분 19초의 여행", 10.5, root => {
  const sun = at(root, 250, 520, "", "", { width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,#fff7d6 0%,#ffd479 30%,#ff9f0a 55%,rgba(255,120,0,0) 72%)" }, true);
  const earth = at(root, 1660, 520, "", "", { width: 96, height: 96, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#9ad8ff,#2f7de1 55%,#123a7a)", boxShadow: "0 0 40px rgba(80,160,255,.6)" }, true);
  const lineE = at(root, 400, 520, "", "", { width: 1210, height: 2, background: "repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 14px,transparent 14px 28px)", transformOrigin: "0 50%" });
  const dist = at(root, 1005, 600, "", "1억 4,960만 km", { fontSize: 30, color: "rgba(255,255,255,.7)" }, true);
  const ph = dot(root, "#fff2a8", 12);
  const clock = at(root, 960, 300, "mono", "", { fontSize: 88, fontWeight: 700 }, true);
  const lab = at(root, 250, 720, "", "태양", { fontSize: 28, fontWeight: 700 }, true), lab2 = at(root, 1660, 640, "", "지구", { fontSize: 28, fontWeight: 700 }, true);
  return t => {
    const sq = K(t, 0.2, 1.0, E.o5); S(sun, { o: sq, s: (0.6 + 0.4 * sq) * (1 + 0.03 * Math.sin(t * 3)) });
    pop(earth, t, 0.7); vis(lab, t, 0.9, null); vis(lab2, t, 1.0, null);
    const lq = K(t, 0.9, 0.8, E.io3); S(lineE, { o: lq, sx: lq }); vis(dist, t, 1.4, null);
    const f = clamp((t - 1.8) / 6.4);
    if (t > 1.8 && t < 8.3) S(ph, { o: 1, x: lerp(400, 1610, f), y: 520 }); else S(ph, { o: 0 });
    const secs = 498.67 * f, mm = Math.floor(secs / 60), ss = secs - mm * 60;
    txt(clock, mm + "분 " + ss.toFixed(1).padStart(4, "0") + "초");
    S(clock, { o: K(t, 1.5, 0.5) });
    glow(earth, K(t, 8.2, 0.3) * (1 - K(t, 9.4, 0.8)), "#9ad8ff");
  };
}, seqCaps(0.6, [[4.6, "초속 30만 km — 1초에 지구를 7바퀴 반 도는 빛도…"], [4.6, "태양에서 지구까지는 약 **498.7초 = 8분 19초**"]]));
/* ===================== CHAPTER 5 ===================== */
chTitle(5, ["산술 · 나머지 %", "증감 ++ --", "관계 · 논리", "조건 연산자 ?:", "비트 연산 ^", "형변환"]);

code(5, {
  name: "정수 사칙연산", file: "ops.c", tag: "강의 예제", types: { x: "int", y: "int", result: "int" },
  title: "다섯 가지 산술 연산자", about: "`+ - * / %` 를 한 번에. 특히 **정수 나눗셈**과 **나머지**에 주목.",
  termH: 290,
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int x, y, result;
    printf("두개의 정수를 입력하시오: ");
    scanf("%d %d", &x, &y);

    result = x + y;
    printf("%d + %d = %d\n", x, y, result);
    result = x - y;
    printf("%d - %d = %d\n", x, y, result);
    result = x * y;
    printf("%d * %d = %d\n", x, y, result);
    result = x / y;
    printf("%d / %d = %d\n", x, y, result);
    result = x % y;
    printf("%d %% %d = %d\n", x, y, result);
    return 0;
}`,
  steps: [
    { l: "6-7", t: "두 정수를 한 번에", d: "`\"%d %d\"` — 공백으로 구분된 두 수를 읽어 x, y에 저장.", o: "두개의 정수를 입력하시오: [[7 4]]\n", v: { x: "7", y: "4", result: "?" }, m: ["%d %d"] },
    { l: "9-12", t: "덧셈 · 뺄셈", d: "result 하나를 **재사용**하며 결과를 바꿔 담는다.", v: { result: "3" }, o: "7 + 4 = 11\n7 - 4 = 3\n" },
    { l: "13-14", t: "곱셈 `*`", d: "7 × 4 = 28", v: { result: "28" }, o: "7 * 4 = 28\n" },
    { l: "15-16", t: "정수 나눗셈 `/`", d: "정수 ÷ 정수 = **몫**. 1.75가 아니라 **1**!", v: { result: "1" }, o: "7 / 4 = 1\n", m: ["x / y"] },
    { l: "17-18", t: "나머지 연산자 `%`", d: "7을 4로 나눈 **나머지 3**. printf에서 `%` 글자 자체를 찍으려면 `%%`.", v: { result: "3" }, o: "7 % 4 = 3\n", m: ["x % y", "%%"] },
  ],
});

dia(5, "몫과 나머지", 13, root => {
  const dots = []; for (let i = 0; i < 7; i++) dots.push(dot(root, "#ffd479", 26));
  const grp = at(root, 760, 420, "", "", { width: 540, height: 140, borderRadius: 30, border: "3px dashed var(--acc)" }, true);
  const g1 = at(root, 760, 530 + 30, "", "4개 묶음 <b style='color:var(--acc)'>1</b>개 → 7 / 4 = 1", { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }, true);
  const g2 = at(root, 1340, 530 + 30, "", "남은 것 <b style='color:#ffd479'>3</b>개 → 7 % 4 = 3", { fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }, true);
  const t2 = at(root, 960, 770, "mono", `1000초 = <span style="color:var(--acc)">16</span>분 <span style="color:#ffd479">40</span>초`, { fontSize: 58, fontWeight: 700 }, true);
  const t3 = at(root, 960, 840, "mono", "1000 / 60 = 16   1000 % 60 = 40", { fontSize: 30, color: "rgba(255,255,255,.65)", whiteSpace: "pre" }, true);
  return t => {
    dots.forEach((d, i) => {
      const x0 = 520 + i * 140, y0 = 420;
      const x1 = i < 4 ? 580 + i * 120 : 1220 + (i - 4) * 120;
      const q = K(t, 2.6 + (i < 4 ? 0 : 0.4), 1.0, E.io3);
      const p = K(t, 0.3 + i * 0.12, 0.5, E.ob);
      S(d, { o: clamp((t - 0.3 - i * 0.12) * 4), x: lerp(x0, x1, q), y: y0, s: p });
    });
    const gq = K(t, 3.4, 0.6, E.ob); S(grp, { o: clamp((t - 3.4) * 3), s: 0.8 + 0.2 * gq });
    vis(g1, t, 4.0, null); vis(g2, t, 4.6, null);
    blurIn(t2, t, 8.4); vis(t3, t, 9.2, null);
  };
}, seqCaps(0.6, [[3.4, "사과 7개를 4개씩 묶으면?"], [4.2, "`/` 는 **몇 묶음**인지 (몫), `%` 는 묶고 **남은 것** (나머지)"], [4.2, "시간 변환 · 짝수 판별(`n % 2`) · 자릿수 분리에 두루 쓰인다"]]));

code(5, {
  name: "초를 분과 초로", file: "time.c", tag: "강의 예제", types: { input: "int", minute: "int", second: "int" },
  title: "1000초는 몇 분 몇 초?", about: "`/` 로 몫(분), `%` 로 나머지(초)를 구하는 대표 예제.",
  src: String.raw`
#include <stdio.h>
#define SEC_PER_MINUTE 60

int main(void)
{
    int input, minute, second;

    printf("초를 입력하시요: ");
    scanf("%d", &input);

    minute = input / SEC_PER_MINUTE;  // 몫 = 몇 분
    second = input % SEC_PER_MINUTE;  // 나머지 = 몇 초

    printf("%d초는 %d분 %d초입니다.\n", input, minute, second);
    return 0;
}`,
  steps: [
    { l: "2", t: "기호 상수", d: "60이라는 숫자에 `SEC_PER_MINUTE`라는 **이름**을 붙였다. 뜻이 바로 읽힌다.", m: ["SEC_PER_MINUTE"] },
    { l: "8-9", t: "입력", d: "1000초를 입력.", o: "초를 입력하시요: [[1000]]\n", v: { input: "1000", minute: "?", second: "?" } },
    { l: "11", t: "몫 = 분", d: "1000 / 60 = **16**", v: { minute: "16" }, m: ["input / SEC_PER_MINUTE"] },
    { l: "12", t: "나머지 = 초", d: "1000 % 60 = **40** (60 × 16 = 960, 1000 − 960 = 40)", v: { second: "40" }, m: ["input % SEC_PER_MINUTE"] },
    { l: "14", t: "출력", d: "서식 속 `%d` 세 개에 뒤의 변수 세 개가 **순서대로** 대응한다.", o: "1000초는 16분 40초입니다.\n" },
  ],
});

code(5, {
  name: "전위 vs 후위 ++", file: "incdec.c", tag: "강의 예제", types: { x: "int", y: "int" },
  title: "++x 와 y++ 는 다르다", about: "둘 다 1 증가시키지만, **언제** 증가하느냐가 다르다.",
  termH: 290,
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int x = 10, y = 10;

    printf("x=%d\n", x);
    printf("++x의 값=%d\n", ++x);  // 먼저 11로 증가 → 11
    printf("x=%d\n\n", x);          // x는 11

    printf("y=%d\n", y);
    printf("y++의 값=%d\n", y++);  // 현재 10 사용 → 10, 그 뒤 증가
    printf("y=%d\n", y);            // y는 11
    return 0;
}`,
  steps: [
    { l: "5", t: "둘 다 10", d: "x와 y를 10으로 초기화.", v: { x: "10", y: "10" } },
    { l: "7-8", t: "전위 `++x`", d: "**먼저 증가**시킨 뒤 그 값을 사용 → **11**이 출력된다.", o: "x=10\n++x의 값=11\n", v: { x: "11" }, m: ["8:++x)"] },
    { l: "9", t: "x는 11", d: "`\\n\\n`은 줄을 두 번 바꿔 **빈 줄**을 만든다.", o: "x=11\n\n" },
    { l: "11-12", t: "후위 `y++`", d: "**현재 값 10을 먼저 사용**하고, 그 다음에 증가한다 → 10이 출력.", o: "y=10\ny++의 값=10\n", v: { y: "11" }, m: ["12:y++)"] },
    { l: "13", t: "그 뒤의 y", d: "출력 후 증가했으므로 y는 11. 단독 문장 `x++;` 처럼 쓰면 전위 · 후위 **차이가 없다**.", o: "y=11\n" },
  ],
});

code(5, {
  name: "거스름돈 계산", file: "change.c", tag: "강의 예제", types: {},
  title: "권종별 거스름돈", about: "**몫**으로 장수를 구하고 **나머지**를 다음 단위로 넘기는, `/`와 `%`의 결정판.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int user, change = 0;
    int price, c5000, c1000, c500, c100;

    printf("물건 값을 입력하시오: ");
    scanf("%d", &price);
    printf("사용자가 낸 돈: ");
    scanf("%d", &user);
    change = user - price;           // 거스름돈 총액

    c5000 = change / 5000;  change %= 5000;  // 오천원권
    c1000 = change / 1000;  change %= 1000;  // 천원권
    c500  = change / 500;   change %= 500;   // 오백원 동전
    c100  = change / 100;                    // 백원 동전

    printf("오천원권: %d장\n", c5000);
    printf("천원권: %d장\n", c1000);
    printf("오백원 동전: %d개\n", c500);
    printf("백원 동전: %d개\n", c100);
    return 0;
}`,
  termH: 270,
  steps: [
    { l: "5-6", t: "변수 준비", d: "권종별 개수를 담을 c5000 · c1000 · c500 · c100.", v: { price: "?", user: "?", change: "0" } },
    { l: "8-11", t: "입력 두 번", d: "물건 값 3200원, 낸 돈 10000원.", o: "물건 값을 입력하시오: [[3200]]\n사용자가 낸 돈: [[10000]]\n", v: { price: "3200", user: "10000" } },
    { l: "12", t: "거스름돈 총액", d: "10000 − 3200 = **6800**", v: { change: "6800" } },
    { l: "14", t: "오천원권", d: "6800 / 5000 = **1**장. `change %= 5000` → 남은 돈 **1800**. (`a %= b` 는 `a = a % b`)", v: { c5000: "1", change: "1800" }, m: ["change / 5000", "change %= 5000"] },
    { l: "15", t: "천원권", d: "1800 / 1000 = **1**장, 남은 돈 800.", v: { c1000: "1", change: "800" } },
    { l: "16", t: "오백원", d: "800 / 500 = **1**개, 남은 돈 300.", v: { c500: "1", change: "300" } },
    { l: "17", t: "백원", d: "300 / 100 = **3**개. 마지막이라 나머지 계산은 필요 없다.", v: { c100: "3" } },
    { l: "19-22", t: "결과", d: "**큰 단위부터** 몫을 구하고 나머지를 넘기는 패턴.", o: "오천원권: 1장\n천원권: 1장\n오백원 동전: 1개\n백원 동전: 3개\n" },
  ],
});

dia(5, "6800원 쪼개기", 11, root => {
  const total = at(root, 960, 230, "mono", "6800", { fontSize: 120, fontWeight: 700 }, true);
  const items = [["5000원", 1, "#ff9f0a", 220, 120], ["1000원", 1, "#64d2ff", 220, 120], ["500", 1, "#e5e5ea", 120, 120], ["100", 3, "#c7c7cc", 100, 100]];
  const els = []; let x = 400;
  items.forEach(([n, c, col, w, hh], gi) => {
    for (let k = 0; k < c; k++) {
      const round = n.length <= 3;
      const e = at(root, x + w / 2, 560, "mono", n, { width: w, height: hh, borderRadius: round ? "50%" : 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: round ? 30 : 34, fontWeight: 700, color: "#111", background: col, boxShadow: `0 16px 40px rgba(0,0,0,.5)` }, true);
      els.push({ e, gi, k }); x += w + 34;
    }
    x += 40;
  });
  const rest = ["1800", "800", "300", "0"];
  const eq = at(root, 960, 780, "mono", "6800 = 5000×1 + 1000×1 + 500×1 + 100×3", { fontSize: 40, fontWeight: 700, color: "var(--acc)" }, true);
  return t => {
    S(total, { o: K(t, 0.2, 0.5) });
    let tv = "6800"; for (let gi = 0; gi < 4; gi++) if (t > 1.7 + gi * 1.6 + (gi === 3 ? 0.5 : 0)) tv = rest[gi];
    txt(total, tv);
    els.forEach(({ e, gi, k }) => { const a = 1.2 + gi * 1.6 + k * 0.25, q = K(t, a, 0.7, E.o5); S(e, { o: clamp((t - a) * 4), y: -(1 - q) * 330, s: 0.6 + 0.4 * q, r: (1 - q) * (k % 2 ? 10 : -10) }); });
    blurIn(eq, t, 8.0);
  };
}, seqCaps(0.6, [[6.6, "큰 단위부터: **몫**만큼 내주고 **나머지**를 다음 단위로"], [3.0, "결과: 오천원 1 · 천원 1 · 오백원 1 · 백원 3"]]));

code(5, {
  name: "윤년 판별", file: "leap.c", tag: "Lab", types: { year: "int", result: "int" },
  title: "관계 · 논리 연산자", about: "윤년 조건 한 줄에 `%`, `==`, `!=`, `&&`, `||` 가 모두 들어 있다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int year, result;

    printf("연도를 입력하시오: ");
    scanf("%d", &year);

    result = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    printf("result=%d \n", result);
    return 0;
}`,
  steps: [
    { l: "7-8", t: "연도 입력", d: "2024를 입력.", o: "연도를 입력하시오: [[2024]]\n", v: { year: "2024", result: "?" } },
    { l: "10", t: "윤년의 조건", d: "**4의 배수**이면서 **100의 배수가 아니거나**, **400의 배수**이면 윤년.", m: ["(year % 4 == 0)", "(year % 100 != 0)", "(year % 400 == 0)"] },
    { l: "10", t: "관계 연산의 결과", d: "`==` · `!=` 의 결과는 **참 = 1, 거짓 = 0**. 2024 → (1 && 1) || 0", m: ["==", "!="] },
    { l: "10", t: "논리 연산", d: "`&&` 는 **둘 다 참**일 때, `||` 는 **하나라도 참**이면 1 → result = **1**", v: { result: "1" }, m: ["&&", "||"] },
    { l: "11", t: "출력", d: "1이면 윤년, 0이면 평년.", o: "result=1 \n" },
  ],
});

dia(5, "윤년 진리표", 14.5, root => {
  const heads = ["연도", "y%4==0", "y%100!=0", "y%400==0", "결과"];
  const data = [[2024, 1, 1, 0, 1], [2023, 0, 1, 0, 0], [1900, 1, 0, 0, 0], [2000, 1, 0, 1, 1]];
  const xs = [360, 660, 960, 1260, 1560];
  const H = heads.map((s, i) => at(root, xs[i], 250, "mono", s, { fontSize: 30, fontWeight: 700, color: i === 4 ? "var(--acc)" : "rgba(255,255,255,.65)" }, true));
  const C = data.map((r, j) => r.map((v, i) => at(root, xs[i], 360 + j * 120, "cell", i === 0 ? String(v) : String(v), { width: i === 0 ? 180 : 130, height: 90, fontSize: 42, background: i === 0 ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }, true)));
  const op1 = at(root, 810, 210, "mono", "&&", { fontSize: 26, color: "#ffd479" }, true), op2 = at(root, 1110, 210, "mono", "||", { fontSize: 26, color: "#ffd479" }, true);
  return t => {
    H.forEach((e, i) => vis(e, t, 0.3 + i * 0.12, null)); vis(op1, t, 1.0, null); vis(op2, t, 1.1, null);
    C.forEach((r, j) => r.forEach((e, i) => {
      const a = i === 0 ? 0.6 + j * 0.15 : 1.6 + j * 1.5 + i * 0.25;
      pop(e, t, a);
      if (i > 0) { const v = data[j][i], on = K(t, a, 0.3); const bg = v ? (i === 4 ? `rgba(255,159,10,${0.5 * on})` : `rgba(48,209,88,${0.32 * on})`) : `rgba(255,69,58,${0.18 * on})`; if (e._bg !== bg) { e.style.background = bg; e._bg = bg; } }
    }));
  };
}, seqCaps(0.6, [[3.4, "네 해를 같은 식에 넣어 보자"], [3.4, "2024: 4의 배수 · 100의 배수 아님 → **윤년**"], [3.0, "1900: 100의 배수라 **평년**"], [3.4, "2000: 400의 배수라 다시 **윤년**"]]));

code(5, {
  name: "조건 연산자 ?:", file: "ternary.c", tag: "강의 예제", types: { x: "int", y: "int" },
  title: "if-else를 한 줄로", about: "`조건 ? 참일 때 값 : 거짓일 때 값` — 유일한 **3항 연산자**. x = -5, y = 3이라고 하자.",
  src: String.raw`
absolute_value = (x > 0) ? x : -x;    // 절대값
max_value = (x > y) ? x : y;          // 최대값
min_value = (x < y) ? x : y;          // 최소값`,
  steps: [
    { l: "1", t: "절대값", d: "(-5 > 0) 은 **거짓** → `:` 뒤의 **-x = 5** 가 선택된다.", v: { x: "-5", y: "3", absolute_value: "5" }, m: ["(x > 0)", "?", ": -x"] },
    { l: "2", t: "최대값", d: "(-5 > 3) 거짓 → **y = 3**", v: { max_value: "3" } },
    { l: "3", t: "최소값", d: "(-5 < 3) 참 → **x = -5**. 짧은 if-else를 **식 하나**로 줄인 것.", v: { min_value: "-5" } },
  ],
});

code(5, {
  name: "XOR 암호화", file: "xor.c", tag: "Lab", types: { data: "char", key: "char", encrypted_data: "char", orig_data: "char" },
  title: "비트 연산으로 암호 만들기", about: "같은 키로 **두 번 XOR**하면 원래 값으로 돌아온다는 성질을 이용한다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    char data = 'a';
    char key = 0xff;

    char encrypted_data = data ^ key;     // 암호화
    printf("암호화된 문자=%c \n", encrypted_data);

    char orig_data = encrypted_data ^ key; // 같은 키로 복호화
    printf("원래의 데이터=%c\n", orig_data);
    return 0;
}`,
  steps: [
    { l: "6", t: "원본 문자", d: "'a'의 아스키 코드 97 = **0110 0001**.", v: { data: "'a'" } },
    { l: "7", t: "키", d: "0xff = **1111 1111** — 모든 비트가 1.", v: { key: "0xff" }, m: ["0xff"] },
    { l: "9-10", t: "XOR 암호화 `^`", d: "`^` 는 두 비트가 **다르면 1**. 키가 모두 1이니 **모든 비트가 뒤집혀** 1001 1110 → 알아볼 수 없는 문자.", v: { encrypted_data: "0x9e" }, o: "암호화된 문자=? \n", m: ["data ^ key"] },
    { l: "12-13", t: "같은 키로 복호화", d: "한 번 더 XOR하면 **원래대로**: (a ^ k) ^ k = a", v: { orig_data: "'a'" }, o: "원래의 데이터=a\n", m: ["encrypted_data ^ key"] },
  ],
});

dia(5, "비트가 뒤집힌다", 14, root => {
  const rows = [["data 'a'", "01100001", 290], ["key 0xff", "11111111", 420], ["data ^ key", "10011110", 580], ["^ key", "01100001", 760]];
  const R = rows.map(([lab, bits, y], j) => {
    const L = at(root, 380, y, "mono", lab, { fontSize: 30, fontWeight: 700, color: j === 3 ? "#30d158" : j === 2 ? "var(--acc)" : "rgba(255,255,255,.7)", width: 300, textAlign: "right" }, true);
    const B = bits.split("").map((b, i) => at(root, 640 + i * 96, y, "cell", b, { width: 80, height: 90, fontSize: 44, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }, true));
    return { L, B, bits, j };
  });
  const line = at(root, 610, 500, "", "", { width: 980, height: 3, background: "rgba(255,255,255,.4)", transformOrigin: "0 50%" });
  const res1 = at(root, 1550, 580, "", "암호문", { fontSize: 30, fontWeight: 800, color: "var(--acc)" }, true);
  const res2 = at(root, 1550, 760, "mono", "= 'a' 복원!", { fontSize: 32, fontWeight: 800, color: "#30d158" }, true);
  return t => {
    R.forEach(({ L, B, bits, j }) => {
      const a = [0.4, 1.4, 4.0, 9.0][j];
      vis(L, t, a, null, { dy: 0 });
      B.forEach((e, i) => {
        const ai = j < 2 ? a + i * 0.06 : a + i * 0.28;
        pop(e, t, ai);
        const on = bits[i] === "1" ? K(t, ai, 0.3) : 0;
        const col = j === 3 ? "48,209,88" : j === 2 ? "255,159,10" : "255,255,255";
        const bg = `rgba(${col},${(0.05 + (j >= 2 ? 0.4 : 0.14) * on).toFixed(3)})`;
        if (e._bg !== bg) { e.style.background = bg; e._bg = bg; }
      });
    });
    S(line, { o: K(t, 3.6, 0.4), sx: K(t, 3.6, 0.6) });
    vis(res1, t, 6.6, null); vis(res2, t, 11.6, null);
  };
}, seqCaps(0.6, [[3.2, "'a' 와 키 0xff 를 비트 단위로 맞대어 보자"], [4.6, "XOR(`^`): 두 비트가 **다르면 1, 같으면 0** → 모든 비트가 뒤집힌다"], [5.0, "같은 키로 한 번 더 XOR하면 → **원래 문자 'a'** 로 복원"]]));

code(5, {
  name: "형변환", file: "cast.c", tag: "강의 예제", types: { f: "double", i: "int" },
  title: "자동 형변환과 (type)", about: "나눗셈에서 정수와 실수가 섞일 때, **변환되는 시점**이 결과를 바꾼다.",
  src: String.raw`
f = 5 / 4;              // 정수나눗셈 1 → 1.0 저장 → 1.000000
f = (double)5 / 4;      // 5가 5.0 → 1.25
f = 5.0 / 4;            // 역시 1.25

i = 1.3 + 1.8;          // 3.1 → 내림 → 3
i = (int)1.3 + (int)1.8;// 1 + 1 → 2`,
  steps: [
    { l: "1", t: "정수 나눗셈 먼저", d: "5 / 4 는 정수끼리라 **1**. 그 결과가 double에 저장되며 1.0 이 된다.", v: { f: "1.000000" }, m: ["5 / 4"] },
    { l: "2", t: "명시적 형변환 `(double)`", d: "5를 **5.0으로 바꾼 뒤** 나눈다 → 실수 나눗셈 **1.25**", v: { f: "1.250000" }, m: ["(double)"] },
    { l: "3", t: "실수 리터럴", d: "한쪽만 실수여도 다른 쪽이 **자동으로 승격**되어 1.25.", v: { f: "1.250000" }, m: ["5.0"] },
    { l: "5", t: "대입할 때 버림", d: "1.3 + 1.8 = 3.1 → int에 저장하며 **소수점 이하를 버림** → 3", v: { i: "3" } },
    { l: "6", t: "먼저 변환하면", d: "(int)1.3 = 1, (int)1.8 = 1 → **2**. 변환 시점이 결과를 바꾼다.", v: { i: "2" }, m: ["(int)1.3", "(int)1.8"] },
  ],
});

code(5, {
  name: "화씨 → 섭씨 버그", file: "f2c.c", tag: "Mini Project", types: { f_temp: "double", c_temp: "double" },
  title: "왜 항상 0도일까?", about: "형변환을 모르면 생기는 대표적인 **논리 오류**. 화씨 100도를 바꿔 보자.",
  vers: [String.raw`
double f_temp = 100.0, c_temp;
c_temp = 5 / 9 * (f_temp - 32);     // 항상 0!
printf("섭씨온도는 %f입니다.\n", c_temp);`, String.raw`
double f_temp = 100.0, c_temp;
c_temp = 5.0 / 9.0 * (f_temp - 32); // 정상
printf("섭씨온도는 %f입니다.\n", c_temp);`],
  steps: [
    { l: "1", t: "화씨 100도", d: "공식: 섭씨 = 5/9 × (화씨 − 32)", v: { f_temp: "100.0", c_temp: "?" } },
    { l: "2", t: "`5 / 9` = 0 !", d: "정수끼리의 나눗셈 5 / 9 는 **0**. 0 × 68 = 0 → 언제나 **0도**.", v: { c_temp: "0.000000" }, m: ["5 / 9"] },
    { l: "3", t: "틀린 결과", d: "문법 오류가 없어 컴파일은 되지만 답이 틀린 **논리 오류**.", o: "섭씨온도는 0.000000입니다.\n" },
    { ver: 1, l: "2", t: "수정: `5.0 / 9.0`", d: "실수로 써서 **실수 나눗셈**이 되게 한다. `(double)5 / 9` 도 가능.", v: { c_temp: "37.777778" }, m: ["5.0 / 9.0"] },
    { l: "3", t: "정상 출력", d: "(100 − 32) × 5 / 9 = **37.78°C**", o: "섭씨온도는 37.777778입니다.\n" },
  ],
});
/* ===================== CHAPTER 6 ===================== */
chTitle(6, ["if", "if - else", "다중 if (else if)", "중첩 if와 else 짝", "switch와 break"]);

dia(6, "if의 흐름", 15.5, root => {
  const svg = svgLayer(root);
  const cx = 700;
  const st = node(root, cx, 190, 300, 80, "정수 입력", "", { borderRadius: 999, fontSize: 28 });
  const dia = sv(svg, "polygon", { points: `${cx},300 ${cx + 170},380 ${cx},460 ${cx - 170},380`, fill: "rgba(255,55,95,.12)", stroke: "var(--acc)", "stroke-width": 3 });
  const dl = at(root, cx, 380, "mono", "number > 0 ?", { fontSize: 30, fontWeight: 700 }, true);
  const bT = node(root, cx, 580, 340, 90, '<span class="mono">printf("양수입니다.")</span>', "", { fontSize: 24 });
  const bL = node(root, cx, 790, 420, 90, '<span class="mono">printf("입력된 값은…")</span>', "", { fontSize: 24 });
  const a1 = arrow(svg, [[cx, 230], [cx, 295]]), aT = arrow(svg, [[cx, 462], [cx, 530]], { c: "#30d158" }), aT2 = arrow(svg, [[cx, 625], [cx, 740]]);
  const aF = arrow(svg, [[cx + 172, 380], [1080, 380], [1080, 790], [cx + 215, 790]], { c: "#ff453a" });
  const lT = at(root, cx - 40, 495, "", "참", { fontSize: 26, fontWeight: 800, color: "#30d158" }, true), lF = at(root, 960, 350, "", "거짓", { fontSize: 26, fontWeight: 800, color: "#ff453a" }, true);
  const gA = arrow(svg, [[cx, 190], [cx, 380], [cx, 580], [cx, 790]], { head: 0 }), gB = arrow(svg, [[cx, 190], [cx, 380], [1080, 380], [1080, 790], [cx, 790]], { head: 0 });
  gA.set(1, 0); gB.set(1, 0);
  const tok = dot(root, "#ffd479", 14);
  const val = at(root, 1500, 250, "mono", "", { fontSize: 44, fontWeight: 700 }, true);
  const tb = termBox(root, 1500, 520, 560, 260);
  sv(svg, "rect", { x: 0, y: 0, width: 0, height: 0 });
  return t => {
    pop(st, t, 0.3); a1.set(K(t, 0.6, 0.4)); dia.style.opacity = K(t, 0.8, 0.5); vis(dl, t, 0.9, null, { dy: 0 });
    aT.set(K(t, 1.2, 0.4)); vis(lT, t, 1.4, null); pop(bT, t, 1.4); aT2.set(K(t, 1.7, 0.4)); pop(bL, t, 1.8);
    aF.set(K(t, 2.0, 0.8)); vis(lF, t, 2.4, null); pop(tb, t, 2.2);
    let line = "";
    if (t < 8.4) { txt(val, "number = 25"); S(val, { o: K(t, 2.6, 0.4) }); }
    else { txt(val, "number = -3"); S(val, { o: K(t, 8.4, 0.4) }); }
    const r1 = clamp((t - 3.2) / 3.6), r2 = clamp((t - 9.0) / 4.4);
    if (t > 3.2 && t < 6.9) { const p = gA.pt(E.io3(r1)); S(tok, { o: 1, x: p.x, y: p.y }); }
    else if (t > 9.0 && t < 13.5) { const p = gB.pt(E.io3(r2)); S(tok, { o: 1, x: p.x, y: p.y }); }
    else S(tok, { o: 0 });
    glow(bT, K(t, 4.9, 0.3) * (1 - K(t, 5.8, 0.4)), "#30d158");
    glow(bL, K(t, 6.5, 0.3) * (1 - K(t, 7.6, 0.4)) + K(t, 13.2, 0.3) * (1 - K(t, 14.6, 0.4)));
    if (t > 4.9) line += "양수입니다.";
    if (t > 6.5) line += "입력된 값은 25입니다.";
    if (t > 8.4) line = "양수입니다.입력된 값은 25입니다.\n\n";
    if (t > 13.2) line += "입력된 값은 -3입니다.";
    txt(tb.tb, line.replace("양수입니다.입력", "양수입니다.\n입력"));
  };
}, seqCaps(0.6, [[3.6, "`if (조건)` — 조건이 **참일 때만** 바로 아래 문장을 실행"], [4.2, "number = 25 → 조건 **참** → '양수입니다.' 출력 후 계속"], [5.0, "number = -3 → 조건 **거짓** → if 문장을 **건너뛰고** 다음으로"]]));

code(6, {
  name: "양수 판별", file: "positive.c", tag: "강의 예제", types: { number: "int" },
  title: "if 한 줄", about: "입력한 정수가 양수일 때만 메시지를 출력한다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int number;

    printf("정수를 입력하시오:");
    scanf("%d", &number);

    if (number > 0)
        printf("양수입니다.");

    printf("입력된 값은 %d입니다.", number);
    return 0;
}`,
  steps: [
    { l: "7-8", t: "입력", d: "25를 입력.", o: "정수를 입력하시오:[[25]]\n", v: { number: "25" } },
    { l: "10-11", t: "if 문", d: "`number > 0` 이 **참** → 바로 아래 **한 문장**을 실행한다.", o: "양수입니다.", m: ["number > 0"] },
    { l: "13", t: "if와 상관없는 문장", d: "if는 **한 문장만** 지배한다. 여러 문장을 묶으려면 **중괄호 `{ }`**. 이 줄은 항상 실행된다.", o: "입력된 값은 25입니다." },
  ],
});

code(6, {
  name: "홀수 / 짝수", file: "oddeven.c", tag: "강의 예제", types: { number: "int" },
  title: "if - else", about: "조건이 참이면 이쪽, 거짓이면 저쪽 — **둘 중 반드시 하나**만 실행된다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int number;

    printf("정수를 입력하시오:");
    scanf("%d", &number);

    if (number % 2 == 0)
        printf("입력된 정수는 짝수입니다.\n");
    else
        printf("입력된 정수는 홀수입니다.\n");
    return 0;
}`,
  steps: [
    { l: "7-8", t: "입력", d: "7을 입력.", o: "정수를 입력하시오:[[7]]\n", v: { number: "7" } },
    { l: "10", t: "짝수 조건", d: "`number % 2 == 0` → 7 % 2 = 1 → **거짓**. 2로 나눈 나머지가 0이면 짝수.", m: ["number % 2 == 0"] },
    { l: "12-13", t: "else", d: "조건이 거짓이므로 **else 쪽**이 실행된다.", o: "입력된 정수는 홀수입니다.\n", m: ["else"] },
  ],
});

code(6, {
  name: "학점 결정", file: "grade.c", tag: "강의 예제", types: { score: "int" },
  title: "다중 if — else if 사다리", about: "위에서부터 차례로 검사하다가 **처음으로 참인 곳**에서 멈춘다. 점수 85를 넣어 보자.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int score;
    printf("성적을 입력하시오: ");
    scanf("%d", &score);

    if (score >= 90)
        printf("합격: 학점A\n");
    else if (score >= 80)
        printf("합격: 학점B\n");
    else if (score >= 70)
        printf("합격: 학점C\n");
    else if (score >= 60)
        printf("합격: 학점D\n");
    else
        printf("불합격: 학점F\n");
    return 0;
}`,
  steps: [
    { l: "6-7", t: "입력", d: "85점.", o: "성적을 입력하시오: [[85]]\n", v: { score: "85" } },
    { l: "9", t: "85 ≥ 90 ?", d: "**거짓** → 아래 `else if` 로 내려간다.", m: ["score >= 90"] },
    { l: "11", t: "85 ≥ 80 ?", d: "**참!**", m: ["score >= 80"] },
    { l: "12", t: "학점 B", d: "참인 첫 조건의 문장만 실행하고 **나머지는 모두 건너뛴다**.", o: "합격: 학점B\n" },
    { l: "13-18", t: "검사조차 하지 않는다", d: "그래서 조건의 **순서**가 중요하다. `score >= 60` 을 맨 위에 두면 85점도 D가 된다!" },
  ],
});

code(6, {
  name: "else의 짝", file: "dangling.c", tag: "주의", types: { score: "int" },
  title: "else는 누구의 짝일까?", about: "들여쓰기는 컴파일러에게 아무 의미가 없다. score = 85일 때를 보자.",
  vers: [String.raw`
if (score >= 80)
    if (score >= 90)
        printf("학점 A\n");
else
    printf("A나 B가 아닙니다.\n");`, String.raw`
if (score >= 80)
{
    if (score >= 90)
        printf("학점 A\n");
}
else   // 바깥 if(score>=80)의 else가 되려면 중괄호로 묶어야 한다
    printf("A나 B가 아닙니다.\n");`],
  steps: [
    { l: "4-5", t: "함정", d: "else가 바깥 if와 줄을 맞췄지만, else는 **가장 가까운 if** 와 짝이 된다.", v: { score: "85" }, m: ["else"] },
    { l: "2-5", t: "score = 85 라면", d: "안쪽 if(85 ≥ 90) 가 거짓 → 그 짝인 **else 실행** → 'A나 B가 아닙니다.' (의도와 다름!)", o: "A나 B가 아닙니다.\n" },
    { ver: 1, clr: true, l: "1-7", t: "중괄호로 해결", d: "안쪽 if를 `{ }` 로 묶으면 else가 **바깥 if** 의 짝이 된다. 85점 → 아무것도 출력하지 않는다 (정상).", o: "" },
  ],
});

code(6, {
  name: "이차방정식", file: "quadratic.c", tag: "강의 예제", types: { a: "double", b: "double", c: "double", dis: "double" },
  title: "근의 공식", about: "ax² + bx + c = 0 의 근을 구한다. **중첩 if**와 `math.h`의 `sqrt()`가 등장한다.",
  termH: 290,
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <math.h>

int main(void)
{
    double a, b, c, dis;

    printf("계수 a, 계수 b, 계수 c를 차례대로 입력하시오: ");
    scanf("%lf %lf %lf", &a, &b, &c);

    if (a == 0)
        printf("방정식의 근은 %f입니다.", -c / b);
    else
    {
        dis = b * b - 4.0 * a * c;   // 판별식
        if (dis >= 0)
        {
            printf("방정식의 근은 %f입니다.\n", (-b + sqrt(dis)) / (2.0 * a));
            printf("방정식의 근은 %f입니다.\n", (-b - sqrt(dis)) / (2.0 * a));
        }
        else
            printf("실근이 존재하지 않습니다\n");
    }
    return 0;
}`,
  steps: [
    { l: "3", t: "`math.h`", d: "`sqrt()` (제곱근) 같은 수학 함수를 쓰려면 포함한다.", m: ["math.h"] },
    { l: "9-10", t: "계수 입력", d: "x² − 3x + 2 = 0 → 1, -3, 2", o: "계수 a, 계수 b, 계수 c를 차례대로 입력하시오: [[1 -3 2]]\n", v: { a: "1.0", b: "-3.0", c: "2.0", dis: "?" } },
    { l: "12-13", t: "a == 0 이면 1차식", d: "bx + c = 0 → 근은 **−c / b**. 근의 공식에서 **0으로 나누는 것을 막는** 예외 처리.", m: ["a == 0"] },
    { l: "16", t: "판별식", d: "b² − 4ac = 9 − 8 = **1**", v: { dis: "1.0" }, m: ["b * b - 4.0 * a * c"] },
    { l: "17-21", t: "dis ≥ 0 → 근 두 개", d: "(−b ± √dis) / 2a → (3 ± 1) / 2 → **2, 1**. if 안에 또 if — **중첩 if**.", o: "방정식의 근은 2.000000입니다.\n방정식의 근은 1.000000입니다.\n", m: ["19:sqrt(dis)", "20:sqrt(dis)"] },
    { l: "22-23", t: "dis < 0", d: "판별식이 음수면 **실근이 없다**." },
  ],
});

dia(6, "판별식과 그래프", 14, root => {
  const svg = svgLayer(root);
  const X = x => 360 + (x + 1) * 240, Y = y => 720 - y * 100;
  const ax = arrow(svg, [[300, 720], [1620, 720]], { c: "rgba(255,255,255,.45)", w: 2 }), ay = arrow(svg, [[X(0), 860], [X(0), 180]], { c: "rgba(255,255,255,.45)", w: 2 });
  const curve = (c, col) => { const pts = []; for (let x = -0.6; x <= 3.601; x += 0.05) pts.push([X(x), Y(x * x - 3 * x + c)]); return arrow(svg, pts, { c: col, w: 5, head: 0 }); };
  const c1 = curve(2, "#ff375f"), c2 = curve(2.25, "#ffd479"), c3 = curve(3, "#64d2ff");
  const r1 = dot(root, "#fff", 12), r2 = dot(root, "#fff", 12), r3 = dot(root, "#ffd479", 12);
  const lab1 = at(root, X(1), 770, "mono", "x = 1", { fontSize: 28, fontWeight: 700 }, true), lab2 = at(root, X(2), 770, "mono", "x = 2", { fontSize: 28, fontWeight: 700 }, true);
  const eq = at(root, 880, 170, "mono", "y = x² − 3x + 2", { fontSize: 38, fontWeight: 700, color: "#ff375f" }, true);
  const legend = [["D > 0 · 두 점", "#ff375f"], ["D = 0 · 한 점 (중근)", "#ffd479"], ["D < 0 · 만나지 않음", "#64d2ff"]].map(([s, c], i) => at(root, 1400, 580 + i * 64, "", `<span style="display:inline-block;width:26px;height:6px;border-radius:3px;background:${c};vertical-align:middle;margin-right:14px"></span>${s}`, { fontSize: 30, fontWeight: 700 }, false));
  return t => {
    ax.set(K(t, 0.2, 0.6)); ay.set(K(t, 0.4, 0.6)); vis(eq, t, 0.8, null);
    c1.set(K(t, 1.0, 1.8, E.io3));
    S(r1, { o: K(t, 3.0, 0.3), x: X(1), y: Y(0), s: 1 + 0.3 * Math.sin(t * 5) }); S(r2, { o: K(t, 3.3, 0.3), x: X(2), y: Y(0), s: 1 + 0.3 * Math.sin(t * 5 + 1) });
    vis(lab1, t, 3.1, null); vis(lab2, t, 3.4, null);
    vis(legend[0], t, 7.2, null, { dy: 0 });
    c2.set(K(t, 7.8, 1.4, E.io3)); S(r3, { o: K(t, 9.0, 0.3), x: X(1.5), y: Y(0) }); vis(legend[1], t, 8.4, null, { dy: 0 });
    c3.set(K(t, 9.9, 1.4, E.io3)); vis(legend[2], t, 10.5, null, { dy: 0 });
  };
}, seqCaps(0.6, [[6.0, "방정식의 근 = 포물선이 **x축과 만나는 점** → x = 1, x = 2"], [6.6, "판별식 D = b² − 4ac 의 부호가 **만나는 점의 개수**를 결정한다"]]));

dia(6, "switch와 break", 16.5, root => {
  const slots = [["case 0:", "없음"], ["case 1:", "하나"], ["case 2:", "둘"], ["default:", "많음"]];
  const head = at(root, 640, 200, "mono", hlC("switch (number) {"), { fontSize: 36, fontWeight: 700 }, true);
  const S2 = slots.map(([c, b], i) => {
    const e = at(root, 640, 310 + i * 120, "", `<span class="mono" style="color:#ff7ab2;font-weight:700;width:170px;display:inline-block">${c}</span><span class="mono">printf("${b}")</span>`, { width: 600, height: 96, borderRadius: 18, display: "flex", alignItems: "center", padding: "0 26px", fontSize: 28, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }, true);
    const br = at(root, 870, 310 + i * 120, "mono", "break;", { fontSize: 24, fontWeight: 700, color: "#ffd479", padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(255,212,121,.5)", background: "rgba(255,212,121,.1)" }, true);
    return { e, br };
  });
  const end = at(root, 640, 800, "mono", "}  ← switch 끝", { fontSize: 30, color: "rgba(255,255,255,.6)" }, true);
  const val = at(root, 200, 200, "mono", "", { fontSize: 36, fontWeight: 700, color: "#ffd479" }, true);
  const ball = dot(root, "#ffd479", 16);
  const tb = termBox(root, 1450, 470, 480, 300);
  const nob = at(root, 1450, 220, "", "break를 지우면?", { fontSize: 34, fontWeight: 800, color: "#ff375f" }, true);
  return t => {
    blurIn(head, t, 0.2); S2.forEach((s, i) => { pop(s.e, t, 0.5 + i * 0.12); S(s.br, { o: clamp((t - 0.9 - i * 0.12) * 3) * (1 - K(t, 8.3, 0.4) * (i < 3 ? 0.85 : 0)), s: 1 }); }); vis(end, t, 1.1, null); pop(tb, t, 1.3);
    // run 1: number=2
    let out = "";
    if (t < 8.0) { txt(val, "number = 2"); S(val, { o: K(t, 1.6, 0.4) }); }
    else { txt(val, "number = 1"); S(val, { o: K(t, 8.6, 0.4) }); }
    vis(nob, t, 8.4, null);
    let bx = null, by = null;
    if (t > 2.4 && t < 3.4) { const q = E.io3((t - 2.4) / 1.0); bx = lerp(200, 380, q); by = lerp(240, 550, q) - Math.sin(q * Math.PI) * 120; }
    else if (t >= 3.4 && t < 4.6) { bx = 380 + (t - 3.4) / 1.2 * 490; by = 550; }
    else if (t >= 4.6 && t < 5.6) { const q = E.io3((t - 4.6) / 1.0); bx = lerp(870, 640, q); by = lerp(550, 800, q); }
    if (t > 9.0 && t < 9.9) { const q = E.io3((t - 9.0) / 0.9); bx = lerp(200, 380, q); by = lerp(240, 430, q) - Math.sin(q * Math.PI) * 100; }
    else if (t >= 9.9 && t < 13.4) { const q = (t - 9.9) / 3.5; bx = 380; by = lerp(430, 790, q); }
    if (bx != null) S(ball, { o: 1, x: bx, y: by }); else S(ball, { o: 0 });
    glow(S2[2].br, K(t, 4.5, 0.2) * (1 - K(t, 5.3, 0.4)), "#ff375f");
    if (t > 3.8 && t < 8.0) out = "둘\n";
    if (t > 8.0) { out = ""; if (t > 10.0) out += "하나\n"; if (t > 11.2) out += "둘\n"; if (t > 12.4) out += "많음\n"; }
    [1, 2, 3].forEach((i, k) => glow(S2[i].e, t > 8 ? K(t, 9.9 + k * 1.2, 0.2) * (1 - K(t, 10.9 + k * 1.2, 0.4)) : (i === 2 ? K(t, 3.3, 0.3) * (1 - K(t, 5.4, 0.5)) : 0), "#ff375f"));
    txt(tb.tb, out);
  };
}, seqCaps(0.6, [[3.4, "`switch`는 값과 **일치하는 case로 바로 점프**한다"], [3.6, "`break`를 만나면 switch를 **빠져나간다**"], [4.8, "break를 빼먹으면? 아래 case까지 **계속 실행** — fall-through"], [3.6, "의도한 fall-through가 아니라면 break는 **필수**!"]]));

code(6, {
  name: "달의 일수", file: "days.c", tag: "강의 예제", types: { month: "int", days: "int" },
  title: "fall-through 활용", about: "break가 없는 성질을 **일부러** 이용해 여러 case가 같은 코드를 공유한다.",
  src: String.raw`
#include <stdio.h>

int main(void)
{
    int month, days;

    printf("달을 입력하시오: ");
    scanf("%d", &month);

    switch (month) {
        case 2:
            days = 28;
            break;
        case 4: case 6: case 9: case 11:   // 30일인 달들
            days = 30;
            break;
        default:                           // 나머지는 31일
            days = 31;
            break;
    }
    printf("%d월의 일수는 %d입니다.\n", month, days);
    return 0;
}`,
  steps: [
    { l: "7-8", t: "입력", d: "6월.", o: "달을 입력하시오: [[6]]\n", v: { month: "6", days: "?" } },
    { l: "10", t: "`switch (month)`", d: "month의 값 6과 **일치하는 case 라벨**을 찾아 점프한다.", m: ["switch (month)"] },
    { l: "14", t: "case 겹쳐 쓰기", d: "`case 4: case 6: case 9: case 11:` — 빈 case는 아래로 **흘러내려** 같은 코드를 공유한다.", m: ["case 6:"] },
    { l: "15-16", t: "30일 · break", d: "days = 30 을 저장하고 break로 탈출.", v: { days: "30" } },
    { l: "17-19", t: "default", d: "어떤 case와도 맞지 않으면 실행 → 31일.", m: ["default"] },
    { l: "21", t: "출력", d: "6월의 일수는 30.", o: "6월의 일수는 30입니다.\n" },
  ],
});

code(6, {
  name: "계산기", file: "calculator.c", tag: "강의 예제", types: { x: "int", op: "char", y: "int", result: "int" },
  title: "switch로 만드는 계산기", about: "`2 + 5` 처럼 입력하면 연산자에 따라 다른 계산을 한다. case 라벨에 **문자**를 쓴다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    char op;
    int x, y, result;

    printf("수식을 입력하시오(예: 2 + 5)\n>>");
    scanf("%d %c %d", &x, &op, &y);

    switch (op) {
        case '+': result = x + y; break;
        case '-': result = x - y; break;
        case '*': result = x * y; break;
        case '/': result = x / y; break;
        case '%': result = x % y; break;
        default:
            printf("지원되지 않는 연산자입니다.\n");
    }
    printf("%d %c %d = %d \n", x, op, y, result);
    return 0;
}`,
  steps: [
    { l: "9-10", t: "수식 입력", d: "`%d %c %d` — 정수, **문자**, 정수를 한 번에 읽는다.", o: "수식을 입력하시오(예: 2 + 5)\n>>[[8 * 7]]\n", v: { x: "8", op: "'*'", y: "7", result: "?" }, m: ["%d %c %d"] },
    { l: "12", t: "문자로 분기", d: "`switch (op)` — op에 든 문자 '*' 와 같은 case를 찾는다." },
    { l: "15", t: "`case '*'`", d: "result = 8 × 7 = **56**, 곧바로 break.", v: { result: "56" }, m: ["case '*'"] },
    { l: "18-19", t: "default", d: "+ − * / % 외의 문자면 안내 메시지." },
    { l: "21", t: "출력", d: "`%c` 로 연산자 문자까지 함께 출력.", o: "8 * 7 = 56 \n" },
  ],
});

code(6, {
  name: "올바른 삼각형", file: "triangle.c", tag: "Lab", types: { a: "int", b: "int", c: "int" },
  title: "&&로 조건 묶기", about: "세 변의 길이로 삼각형이 만들어지는지 판별한다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int a, b, c;

    printf("삼각형의 3변을 입력하시오: ");
    scanf("%d%d%d", &a, &b, &c);

    if ((a + b) > c && (b + c) > a && (a + c) > b)
        printf("올바른 삼각형\n");
    else
        printf("올바르지 않은 삼각형\n");
    return 0;
}`,
  steps: [
    { l: "8-9", t: "세 변 입력", d: "3, 4, 5", o: "삼각형의 3변을 입력하시오: [[3 4 5]]\n", v: { a: "3", b: "4", c: "5" } },
    { l: "11", t: "세 조건 모두 참?", d: "**어느 두 변의 합도 나머지 한 변보다 커야** 삼각형. 7>5, 9>3, 8>4 → 모두 참", m: ["(a + b) > c", "(b + c) > a", "(a + c) > b"] },
    { l: "12", t: "결과", d: "`&&` 는 하나라도 거짓이면 즉시 거짓 — 1, 2, 10 이면 '올바르지 않은 삼각형'.", o: "올바른 삼각형\n" },
  ],
});
/* ===================== CHAPTER 7 ===================== */
chTitle(7, ["while", "센티널", "do - while", "for", "중첩 반복", "break · continue"]);

code(7, {
  name: "왜 반복문인가", file: "repeat.c", tag: "비교",
  title: "같은 일을 다섯 번", about: "Hello World! 를 5번 출력하는 두 가지 방법.",
  termH: 250,
  src: String.raw`
// 5번 복사-붙여넣기
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");

// 반복문 한 줄로
for (i = 0; i < 5; i++)
    printf("Hello World! \n");`,
  steps: [
    { l: "2-6", t: "반복 없이", d: "같은 문장을 다섯 번 복사했다. 100번, 1000번이라면? 고칠 때도 전부 고쳐야 한다." },
    { l: "9-10", t: "for 한 줄로", d: "반복문은 같은 작업을 **조건이 참인 동안** 되풀이한다. 숫자 5만 바꾸면 끝.", o: "Hello World! \nHello World! \nHello World! \nHello World! \nHello World! \n" },
  ],
});

dia(7, "while 루프", 13.5, root => {
  const svg = svgLayer(root);
  const cx = 760;
  const dia = sv(svg, "polygon", { points: `${cx},220 ${cx + 180},300 ${cx},380 ${cx - 180},300`, fill: "rgba(48,209,88,.12)", stroke: "var(--acc)", "stroke-width": 3 });
  const dl = at(root, cx, 300, "mono", "i <= 5 ?", { fontSize: 32, fontWeight: 700 }, true);
  const body = node(root, cx, 540, 420, 130, '<span class="mono">sum += i;<br>i++;</span>', "", { fontSize: 30 });
  const ex = node(root, 1340, 300, 220, 100, "탈출", "", { fontSize: 30, borderColor: "rgba(255,69,58,.5)" });
  const aT = arrow(svg, [[cx, 382], [cx, 470]], { c: "#30d158" }), aB = arrow(svg, [[cx - 212, 540], [420, 540], [420, 300], [cx - 184, 300]], { c: "rgba(255,255,255,.6)" }), aX = arrow(svg, [[cx + 182, 300], [1226, 300]], { c: "#ff453a" });
  const lT = at(root, cx + 36, 425, "", "참", { fontSize: 24, fontWeight: 800, color: "#30d158" }, true), lF = at(root, 1060, 270, "", "거짓", { fontSize: 24, fontWeight: 800, color: "#ff453a" }, true), lB = at(root, 340, 420, "", "다시 검사", { fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,.7)" }, true);
  const g1 = arrow(svg, [[cx, 300], [cx, 540]], { head: 0 }), g2 = arrow(svg, [[cx, 540], [420, 540], [420, 300], [cx, 300]], { head: 0 }), g3 = arrow(svg, [[cx, 300], [1340, 300]], { head: 0 });
  [g1, g2, g3].forEach(g => g.set(1, 0));
  const tok = dot(root, "#ffd479", 14);
  const st = at(root, 1340, 600, "mono", "", { fontSize: 40, fontWeight: 700, lineHeight: 1.6, whiteSpace: "pre" }, true);
  return t => {
    dia.style.opacity = K(t, 0.3, 0.5); vis(dl, t, 0.4, null, { dy: 0 });
    aT.set(K(t, 0.8, 0.4)); vis(lT, t, 0.9, null); pop(body, t, 1.0); aB.set(K(t, 1.4, 0.8)); vis(lB, t, 1.8, null); aX.set(K(t, 1.8, 0.5)); vis(lF, t, 2.0, null); pop(ex, t, 2.2);
    const c0 = 2.6, cyc = 1.6;
    let i = 1, sum = 0, p = null;
    if (t >= c0) {
      const k = Math.floor((t - c0) / cyc), u = (t - c0) - k * cyc;
      if (k < 5) {
        i = k + 1; sum = (k * (k + 1)) / 2;
        if (u < 0.6) p = g1.pt(E.io3(u / 0.6)); else { p = g2.pt(E.io3((u - 0.6) / 1.0)); sum += i; i++; }
      } else { i = 6; sum = 15; const v = (t - c0 - 5 * cyc) / 0.9; if (v < 1) p = g3.pt(E.io3(v)); }
    }
    if (p) S(tok, { o: 1, x: p.x, y: p.y }); else S(tok, { o: 0 });
    glow(body, t > c0 && t < c0 + 5 * cyc && ((t - c0) % cyc) > 0.5 && ((t - c0) % cyc) < 0.9 ? 1 : 0);
    glow(ex, K(t, c0 + 5 * cyc + 0.8, 0.3), "#ff453a");
    txt(st, `i   = ${i}\nsum = ${sum}`); S(st, { o: K(t, 2.4, 0.4) });
  };
}, seqCaps(0.6, [[3.4, "`while (조건)` — 조건을 **먼저 검사**하고, 참이면 몸체를 실행한 뒤 **다시 검사**"], [5.4, "i = 1, 2, 3, 4, 5 … 다섯 바퀴를 돌며 sum에 더한다"], [3.4, "i = 6 → 조건 **거짓** → 루프 탈출. i++ 가 없다면? **무한 루프**!"]]));

(function () {
  const steps = [
    { l: "5", t: "변수", d: "i: 1부터 셀 **카운터**, sum: 누적 합.", v: { i: "?", n: "?", sum: "?" } },
    { l: "7-8", t: "n 입력", d: "5를 입력.", o: "정수를 입력하시오:[[5]]\n", v: { n: "5" } },
    { l: "10-11", t: "초기화", d: "합은 반드시 **0으로 시작**해야 한다. 쓰레기값에 더하면 엉뚱한 결과가 나온다.", v: { i: "1", sum: "0" } },
    { l: "12", t: "반복 추적", d: "i ≤ n 인 동안 sum에 i를 더하고 i를 1 증가.\n`sum += i` 는 `sum = sum + i`.", dur: 5.2 },
  ];
  let sum = 0;
  for (let i = 1; i <= 5; i++) { sum += i; steps.push({ l: "14", v: { sum: String(sum) }, dur: 1.0 }, { l: "15", v: { i: String(i + 1) }, dur: 0.8 }, { l: "12", dur: 0.7 }); }
  steps.push({ l: "17", t: "출력", d: "i = 6 이 되어 조건이 **거짓** → 루프 탈출. sum = **15**", o: "1부터 5까지의 합은 15입니다\n" });
  code(7, {
    name: "1부터 n까지의 합", file: "sum_n.c", tag: "강의 예제", types: { i: "int", n: "int", sum: "int" },
    title: "while로 누적 합", about: "반복문의 기본 패턴: **카운터 · 누적 변수 · 조건**.",
    src: String.raw`
#include <stdio.h>

int main(void)
{
    int i, n, sum;

    printf("정수를 입력하시오:");
    scanf("%d", &n);

    i = 1;
    sum = 0;
    while (i <= n)
    {
        sum += i;   // sum = sum + i
        i++;        // i = i + 1
    }
    printf("1부터 %d까지의 합은 %d입니다\n", n, sum);
    return 0;
}`,
    steps,
  });
})();

code(7, {
  name: "센티널로 평균 구하기", file: "average.c", tag: "강의 예제", types: { grade: "int", n: "int", sum: "float", average: "float" },
  title: "음수가 나올 때까지", about: "몇 개를 입력할지 모를 때, **끝을 알리는 특별한 값(센티널)** 을 정해 둔다.",
  termH: 280,
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int grade, n = 0;
    float sum = 0, average;
    grade = 0;

    printf("성적 입력을 종료하려면 음수를 입력하시오\n");
    while (grade >= 0)
    {
        printf("성적을 입력하시오: ");
        scanf("%d", &grade);
        sum += grade;
        n++;
    }
    sum = sum - grade;  // 마지막에 더해진 음수를 빼준다
    n--;                // 센티널은 개수에서 제외
    average = sum / n;
    printf("성적의 평균은 %f입니다.\n", average);
    return 0;
}`,
  steps: [
    { l: "6-8", t: "준비", d: "grade를 0으로 두어 **첫 조건 검사를 통과**시킨다.", v: { grade: "0", n: "0", sum: "0.0", average: "?" } },
    { l: "10-11", t: "센티널(보초값)", d: "입력의 끝을 알리는 특별한 값 — 여기서는 **음수**.", o: "성적 입력을 종료하려면 음수를 입력하시오\n" },
    { l: "13-16", t: "입력 → 더하기 → 세기", d: "한 바퀴마다 성적을 입력받아 sum에 더하고 n을 1 증가.", o: "성적을 입력하시오: [[90]]\n", v: { grade: "90", sum: "90.0", n: "1" } },
    { l: "13-16", o: "성적을 입력하시오: [[80]]\n", v: { grade: "80", sum: "170.0", n: "2" }, dur: 2.0 },
    { l: "13-16", o: "성적을 입력하시오: [[70]]\n", v: { grade: "70", sum: "240.0", n: "3" }, dur: 2.0 },
    { l: "13-16", t: "음수 입력", d: "-1도 일단 **더해지고 개수도 늘어난다**. 그 다음 조건 검사에서 탈출.", o: "성적을 입력하시오: [[-1]]\n", v: { grade: "-1", sum: "239.0", n: "4" } },
    { l: "18-19", t: "보정", d: "마지막에 더해진 센티널을 빼고(239 − (−1) = 240), 개수도 하나 줄인다.", v: { sum: "240.0", n: "3" } },
    { l: "20-21", t: "평균", d: "sum이 float이라 **실수 나눗셈** 240 / 3 = **80**.", v: { average: "80.0" }, o: "성적의 평균은 80.000000입니다.\n" },
  ],
});

(function () {
  const steps = [
    { l: "7-8", t: "입력", d: "48과 18.", o: "두개의 정수를 입력하시오(큰수, 작은수): [[48 18]]\n", v: { x: "48", y: "18", r: "?" } },
    { l: "10", t: "유클리드 호제법", d: "x를 y로 나눈 **나머지**로 계속 바꿔 가다가, **나머지가 0이 되면** 그때의 x가 최대공약수." },
  ];
  let x = 48, y = 18;
  while (y !== 0) { const r = x % y; steps.push({ l: "12", v: { r: String(r) }, dur: 1.0 }, { l: "13", v: { x: String(y) }, dur: 0.8 }, { l: "14", v: { y: String(r) }, dur: 0.8 }, { l: "10", dur: 0.8 }); x = y; y = r; }
  steps[2].t = "추적"; steps[2].d = "r = x % y → x ← y → y ← r\n48,18 → 18,12 → 12,6 → 6,0"; steps[2].dur = 4.2;
  steps.push({ l: "16", t: "결과", d: "y가 0이 되어 루프 종료. GCD(48, 18) = **6**", o: "최대 공약수는 6입니다.\n" });
  code(7, {
    name: "최대공약수", file: "gcd.c", tag: "강의 예제", types: { x: "int", y: "int", r: "int" },
    title: "유클리드 알고리즘", about: "2000년도 더 된 알고리즘을 while 몇 줄로.",
    src: String.raw`
#include <stdio.h>

int main(void)
{
    int x, y, r;

    printf("두개의 정수를 입력하시오(큰수, 작은수): ");
    scanf("%d%d", &x, &y);

    while (y != 0)
    {
        r = x % y;
        x = y;
        y = r;
    }
    printf("최대 공약수는 %d입니다.\n", x);
    return 0;
}`,
    steps,
  });
})();

dia(7, "그림으로 보는 GCD", 15, root => {
  const u = 16, X0 = 576, Y0 = 250;
  const box = at(root, X0, Y0, "", "", { width: 48 * u, height: 18 * u, border: "2px solid rgba(255,255,255,.5)", borderRadius: 4 });
  const sq = [[0, 0, 18, "#30d158", 1.2], [18, 0, 18, "#30d158", 1.6], [36, 0, 12, "#64d2ff", 4.6], [36, 12, 6, "#ffd479", 7.6], [42, 12, 6, "#ffd479", 8.0]].map(([x, y, s, c, a]) => ({ e: at(root, X0 + x * u, Y0 + y * u, "", `<span>${s}×${s}</span>`, { width: s * u - 4, height: s * u - 4, margin: "2px", borderRadius: 6, background: `color-mix(in srgb, ${c} 38%, transparent)`, border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s > 8 ? 30 : 20, fontWeight: 700, transformOrigin: "0 0" }), a }));
  const lab = at(root, X0 + 24 * u, Y0 - 40, "mono", "48", { fontSize: 28, color: "rgba(255,255,255,.6)" }, true), lab2 = at(root, X0 - 40, Y0 + 9 * u, "mono", "18", { fontSize: 28, color: "rgba(255,255,255,.6)" }, true);
  const eqs = ["48 = 18 × 2 + 12", "18 = 12 × 1 + 6", "12 = 6 × 2 + 0"].map((s, i) => at(root, 640, 640 + i * 70, "mono", s, { fontSize: 38, fontWeight: 700, whiteSpace: "pre" }));
  const res = at(root, 1320, 710, "", "GCD = 6", { fontSize: 64, fontWeight: 900, color: "var(--acc)" }, true);
  return t => {
    S(box, { o: K(t, 0.2, 0.5) }); vis(lab, t, 0.4, null); vis(lab2, t, 0.5, null);
    sq.forEach(({ e, a }) => { const q = K(t, a, 0.6, E.ob); S(e, { o: clamp((t - a) * 4), s: q }); });
    eqs.forEach((e, i) => vis(e, t, [2.2, 5.4, 8.6][i], null, { dy: 0, x: 0 }));
    pop(res, t, 9.8);
  };
}, seqCaps(0.6, [[4.0, "48 × 18 직사각형을 **가장 큰 정사각형**으로 잘라 나가면"], [3.6, "남은 12 × 18 조각을 또 정사각형으로…"], [5.8, "마지막 **6 × 6** 정사각형으로 전체를 빈틈없이 채울 수 있다 → GCD = **6**"]]));

code(7, {
  name: "do-while", file: "dowhile.c", tag: "강의 예제", types: { number: "int", sum: "int" },
  title: "최소 한 번은 실행", about: "0을 입력할 때까지 입력값을 모두 더한다. 조건 검사가 **몸체 뒤**에 있다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int number, sum = 0;

    do {
        printf("정수를 입력하시오: ");
        scanf("%d", &number);
        sum += number;
    } while (number != 0);

    printf("숫자들의 합 = %d \n", sum);
    return 0;
}`,
  steps: [
    { l: "6", t: "준비", d: "number는 아직 모름 — 그래도 괜찮다. 검사를 나중에 하니까.", v: { number: "?", sum: "0" } },
    { l: "8-11", t: "do { … }", d: "몸체를 **먼저 한 번 실행**하고 나서 조건을 검사한다. → **최소 1회 실행** 보장.", o: "정수를 입력하시오: [[10]]\n", v: { number: "10", sum: "10" } },
    { l: "12", t: "조건 검사", d: "10 ≠ 0 → 다시 반복. 끝의 **세미콜론**을 잊지 말 것: `while (…);`", m: ["while (number != 0);"] },
    { l: "8-11", o: "정수를 입력하시오: [[20]]\n", v: { number: "20", sum: "30" }, dur: 2.0 },
    { l: "8-12", t: "0 → 종료", d: "0을 더한 뒤 조건이 거짓이 되어 탈출.", o: "정수를 입력하시오: [[0]]\n", v: { number: "0" } },
    { l: "14", t: "출력", d: "10 + 20 + 0 = 30", o: "숫자들의 합 = 30 \n" },
  ],
});

dia(7, "for의 세 칸", 15, root => {
  const ln = at(root, 960, 230, "mono", `<span>for (</span><span class="p1" style="color:#64d2ff">i = 1</span><span>; </span><span class="p2" style="color:#ffd479">i &lt;= n</span><span>; </span><span class="p3" style="color:#ff7ab2">i++</span><span>)</span>`, { fontSize: 72, fontWeight: 700, whiteSpace: "pre" }, true);
  const tags = [["① 초기식", "처음 한 번만", "#64d2ff"], ["② 조건식", "매 반복 전에 검사", "#ffd479"], ["③ 증감식", "몸체 실행 후", "#ff7ab2"]].map(([a, b, c]) => at(root, 0, 360, "", `<div style="font-size:30px;font-weight:800;color:${c}">${a}</div><div style="font-size:22px;color:rgba(255,255,255,.6)">${b}</div>`, { textAlign: "center", width: 300 }, true));
  const svg = svgLayer(root);
  const P = { s: [380, 650], c: [780, 650], b: [1180, 650], u: [980, 840], x: [1560, 650] };
  const nS = node(root, ...P.s, 240, 100, "① i = 1", "", { fontSize: 28, borderColor: "#64d2ff" }), nC = node(root, ...P.c, 240, 100, "② i ≤ n ?", "", { fontSize: 28, borderColor: "#ffd479" }),
    nB = node(root, ...P.b, 240, 100, "몸체 실행", "", { fontSize: 28 }), nU = node(root, ...P.u, 240, 100, "③ i++", "", { fontSize: 28, borderColor: "#ff7ab2" }), nX = node(root, ...P.x, 200, 100, "종료", "", { fontSize: 28 });
  const a1 = arrow(svg, [[500, 650], [656, 650]]), a2 = arrow(svg, [[900, 650], [1056, 650]], { c: "#30d158" }), a3 = arrow(svg, [[1180, 702], [1180, 840], [1102, 840]]), a4 = arrow(svg, [[858, 840], [780, 840], [780, 702]]), a5 = arrow(svg, [[780, 598], [780, 560], [1560, 560], [1560, 598]], { c: "#ff453a" });
  const g = arrow(svg, [[780, 650], [1180, 650], [1180, 840], [780, 840], [780, 650]], { head: 0 }); g.set(1, 0);
  const tok = dot(root, "#ffd479", 13);
  let measured = false;
  return t => {
    if (!measured && t > 0.05) { measured = true; ["p1", "p2", "p3"].forEach((c, i) => { const sp = ln.querySelector("." + c); tags[i].style.left = (ln.offsetLeft - ln.offsetWidth / 2 + sp.offsetLeft + sp.offsetWidth / 2) + "px"; }); }
    blurIn(ln, t, 0.2); tags.forEach((e, i) => vis(e, t, 1.2 + i * 1.2, null));
    pop(nS, t, 4.6); a1.set(K(t, 4.9, 0.4)); pop(nC, t, 5.1); a2.set(K(t, 5.4, 0.4)); pop(nB, t, 5.6); a3.set(K(t, 5.9, 0.5)); pop(nU, t, 6.2); a4.set(K(t, 6.5, 0.5)); a5.set(K(t, 6.8, 0.6)); pop(nX, t, 7.2);
    if (t > 7.6 && t < 12.6) { const v = ((t - 7.6) / 2.5) % 1; const p = g.pt(E.io3(v)); S(tok, { o: 1, x: p.x, y: p.y }); } else S(tok, { o: 0 });
    glow(nS, K(t, 4.6, 0.3) * (1 - K(t, 5.4, 0.4)), "#64d2ff");
  };
}, seqCaps(0.6, [[3.8, "for 괄호 안의 **세 칸**: 초기식 ; 조건식 ; 증감식"], [3.0, "실행 순서는 ① → ② → 몸체 → ③ → ② → …"], [5.0, "조건식이 거짓이 되면 끝. **횟수가 정해진 반복**에 딱 맞다"]]));

(function () {
  const steps = [
    { l: "5", t: "곱의 시작은 1", d: "곱셈 누적은 **1부터** 시작해야 한다. 0이면 결과가 항상 0.", v: { fact: "1", i: "?", n: "?" } },
    { l: "8-9", t: "입력", d: "5를 입력.", o: "정수를 입력하시요:[[5]]\n", v: { n: "5" } },
    { l: "11-12", t: "for 반복", d: "i가 1부터 n까지 1씩 증가하며 fact에 곱한다.\n1 → 2 → 6 → 24 → 120", v: { i: "1", fact: "1" } },
  ];
  let f = 1; for (let i = 2; i <= 5; i++) { f *= i; steps.push({ l: "11-12", v: { i: String(i), fact: String(f) }, dur: 1.2 }); }
  steps.push({ l: "14", t: "결과", d: "팩토리얼은 금방 커지므로 `long` 과 `%ld` 를 쓴다. (13! 부터는 long도 넘친다)", o: "5!은 120입니다.\n", m: ["%ld"] });
  code(7, {
    name: "팩토리얼", file: "factorial.c", tag: "강의 예제", types: { fact: "long", i: "int", n: "int" },
    title: "for로 n! 구하기", about: "n! = 1 × 2 × 3 × … × n",
    src: String.raw`
#include <stdio.h>

int main(void)
{
    long fact = 1;
    int i, n;

    printf("정수를 입력하시요:");
    scanf("%d", &n);

    for (i = 1; i <= n; i++)
        fact = fact * i;

    printf("%d!은 %ld입니다.\n", n, fact);
    return 0;
}`,
    steps,
  });
})();

(function () {
  const steps = [
    { l: "6", t: "바깥 for: 줄", d: "y는 줄 번호 1 ~ 5.", v: { y: "1", x: "?" } },
    { l: "8-9", t: "안쪽 for: 별", d: "각 줄에서 x가 0부터 y−1까지 → **y개**의 별.", v: { x: "0" }, o: "*" },
    { l: "10", t: "줄바꿈", d: "안쪽 for가 끝나면 줄을 바꾼다.", o: "\n" },
  ];
  for (let y = 2; y <= 5; y++) steps.push({ l: "6", v: { y: String(y) }, dur: 0.7 }, { l: "8-9", v: { x: String(y - 1) }, o: "*".repeat(y), dur: 0.9 }, { l: "10", o: "\n", dur: 0.5 });
  steps.push({ l: "6-11", t: "중첩 반복", d: "바깥 1회마다 안쪽 전체가 실행된다 → 별 1 + 2 + 3 + 4 + 5 = **15개**." });
  code(7, {
    name: "직각삼각형 별", file: "stars.c", tag: "강의 예제", types: { x: "int", y: "int" },
    title: "반복 안의 반복", about: "for 안에 for — **중첩 반복**으로 별 삼각형을 그린다.",
    termH: 290,
    src: String.raw`
#include <stdio.h>

int main(void)
{
    int x, y;
    for (y = 1; y <= 5; y++)       // 줄: 1~5
    {
        for (x = 0; x < y; x++)    // 각 줄에서 y개
            printf("*");
        printf("\n");              // 한 줄 끝나면 줄바꿈
    }
    return 0;
}`,
    steps,
  });
})();

(function () {
  const steps = [
    { l: "2", t: "기호 상수", d: "원금 1,000,000원.", m: ["SEED_MONEY"] },
    { l: "6", t: "초기화", d: "0년차, 원금으로 시작.", v: { year: "0", money: "1000000" } },
    { l: "7", t: "`while (1)`", d: "조건이 항상 1(참) → **무한 루프**. 빠져나갈 길은 `break` 뿐.", m: ["while (1)"] },
  ];
  let m = 1000000, y = 0;
  while (true) { y++; m = Math.trunc(m + m * 0.3); steps.push({ l: "9-11", v: { year: String(y), money: String(m) }, dur: 0.85 }); if (m > 10000000) break; }
  steps[3].t = "해마다 30%"; steps[3].d = "money += money × 0.30 → 10배(10,000,000)를 넘는지 매년 검사."; steps[3].dur = 4.5;
  steps.push({ l: "12", t: "break", d: "10배를 넘는 순간 **루프를 즉시 탈출**한다.", m: ["break"] });
  steps.push({ l: "14", t: "결과", d: "연 30% 수익이면 **9년** 만에 10배.", o: String(y) });
  code(7, {
    name: "break", file: "break.c", tag: "강의 예제", types: { year: "int", money: "int" },
    title: "원금의 10배가 되는 해", about: "무한 루프 + break: 종료 조건이 루프 **중간**에 있을 때 쓰는 패턴.",
    src: String.raw`
#include <stdio.h>
#define SEED_MONEY 1000000

int main(void)
{
    int year = 0, money = SEED_MONEY;
    while (1)                        // 무한 루프
    {
        year++;
        money += money * 0.30;       // 해마다 30% 수익
        if (money > 10 * SEED_MONEY) // 10배 넘으면
            break;                   // 루프 탈출
    }
    printf("%d", year);
    return 0;
}`,
    steps,
  });
})();

code(7, {
  name: "continue", file: "upper.c", tag: "강의 예제", types: { letter: "char" },
  title: "소문자만 대문자로", about: "소문자가 아니면 **건너뛰고**(continue), Q면 **끝낸다**(break).",
  termH: 290,
  src: String.raw`
// 소문자를 대문자로 변경한다. Q면 종료.
#include <stdio.h>

int main(void)
{
    char letter;
    while (1)
    {
        printf("소문자를 입력하시오: ");
        scanf(" %c", &letter);
        if (letter == 'Q')
            break;                      // 종료
        if (letter < 'a' || letter > 'z')
            continue;                   // 소문자가 아니면 다시 입력
        letter -= 32;                   // 아스키상 소문자-32 = 대문자
        printf("변환된 대문자는 %c입니다.\n", letter);
    }
    return 0;
}`,
  steps: [
    { l: "7", t: "무한 루프", d: "Q를 입력할 때까지 계속." },
    { l: "9-10", t: "문자 입력", d: "`\" %c\"` 앞의 **공백**은 남아 있는 엔터(`\\n`)를 건너뛰게 한다.", o: "소문자를 입력하시오: [[a]]\n", v: { letter: "'a'" }, m: ['" %c"'] },
    { l: "15-16", t: "대문자 변환", d: "'a'(97) − 32 = 'A'(65)", v: { letter: "'A'" }, o: "변환된 대문자는 A입니다.\n", m: ["letter -= 32"] },
    { l: "9-10", o: "소문자를 입력하시오: [[1]]\n", v: { letter: "'1'" }, dur: 1.8 },
    { l: "13-14", t: "continue", d: "소문자가 아니면 아래를 **건너뛰고** 바로 다음 반복으로.", m: ["continue"] },
    { l: "9-10", o: "소문자를 입력하시오: [[b]]\n", v: { letter: "'b'" }, dur: 1.6 },
    { l: "15-16", o: "변환된 대문자는 B입니다.\n", v: { letter: "'B'" }, dur: 1.6 },
    { l: "9-12", t: "break vs continue", d: "**break**: 반복 자체를 끝낸다 / **continue**: 이번 회차만 건너뛴다.", o: "소문자를 입력하시오: [[Q]]\n", v: { letter: "'Q'" }, m: ["break"] },
  ],
});

(function () {
  const rows = []; let tot = 10000000;
  for (let i = 1; i <= 10; i++) { tot = tot * 1.07; rows.push([i, tot]); }
  const fmt = (i, v) => String(i).padStart(2, " ") + v.toFixed(1).padStart(10, " ");
  const steps = [
    { l: "2-4", t: "기호 상수 세 개", d: "이율 7%, 원금 1천만 원, 기간 10년. 숫자를 바꾸고 싶으면 **여기만** 고친다." },
    { l: "11-13", t: "표 머리", d: "구분선과 제목을 출력.", o: "==============\n연도 원리금\n==============\n" },
    { l: "14-18", t: "매년 7% 복리", d: "total = total × 1.07 — 이자에 **이자가 붙는다**. `%10.1f`: 폭 10칸 · 소수 1자리 — 값이 10칸을 꽉 채워 연도와 **붙어 보인다**.", o: fmt(1, rows[0][1]) + "\n", m: ["%2d%10.1f"] },
  ];
  rows.slice(1).forEach(([i, v]) => steps.push({ l: "14-18", o: fmt(i, v) + "\n", dur: 0.75 }));
  steps.push({ l: "14-18", t: "10년 후", d: "약 **1,967만 원** — 거의 두 배가 된다." });
  code(7, {
    name: "복리 이자표", file: "interest.c", tag: "강의 예제",
    title: "for로 표 만들기", about: "1천만 원을 연 7% 복리로 10년 동안 맡기면?",
    termH: 480,
    src: String.raw`
#include <stdio.h>
#define RATE 0.07          // 연 7%
#define INVESTMENT 10000000 // 초기 투자금
#define YEARS 10

int main(void)
{
    int i;
    double total = INVESTMENT;

    printf("==============\n");
    printf("연도 원리금\n");
    printf("==============\n");
    for (i = 1; i <= YEARS; i++)
    {
        total = total * (1 + RATE);  // 매년 7% 복리
        printf("%2d%10.1f\n", i, total);
    }
    return 0;
}`,
    steps,
  });
  dia(7, "복리의 힘", 10.5, root => {
    const bars = rows.map(([i, v], k) => {
      const hgt = (v / 20000000) * 560;
      const b = at(root, 430 + k * 112, 820 - hgt, "", "", { width: 80, height: hgt, borderRadius: "12px 12px 4px 4px", background: "linear-gradient(180deg,var(--acc2),var(--acc))", transformOrigin: "50% 100%" });
      const l = at(root, 470 + k * 112, 820 - hgt - 30, "mono", Math.round(v / 10000).toLocaleString(), { fontSize: 22, fontWeight: 700 }, true);
      const y = at(root, 470 + k * 112, 852, "mono", i + "년", { fontSize: 22, color: "rgba(255,255,255,.6)" }, true);
      return { b, l, y, k };
    });
    const base = at(root, 400, 820, "", "", { width: 1150, height: 2, background: "rgba(255,255,255,.3)" });
    const unit = at(root, 1560, 200, "", "단위: 만 원", { fontSize: 24, color: "rgba(255,255,255,.55)" }, true);
    return t => { S(base, { o: K(t, 0.2, 0.4) }); vis(unit, t, 0.4, null); bars.forEach(({ b, l, y, k }) => { const q = K(t, 0.5 + k * 0.32, 0.8, E.o5); S(b, { o: clamp((t - 0.5 - k * 0.32) * 4), sy: q }); vis(l, t, 0.9 + k * 0.32, null, { dy: 10 }); vis(y, t, 0.5 + k * 0.32, null, { dy: 0 }); }); };
  }, seqCaps(0.6, [[4.6, "1년차 1,070만 → 10년차 **1,967만 원**"], [4.4, "매년 같은 비율로 불어나는 **복리** — 반복문이 계산해 준다"]]));
})();
/* ===================== CHAPTER 8 ===================== */
chTitle(8, ["함수 정의 · 호출", "매개변수와 인수", "반환값 return", "함수 원형", "rand · math 라이브러리"]);

dia(8, "함수 = 블랙박스", 15, root => {
  const box = at(root, 960, 360, "", `<div class="mono" style="font-size:64px;font-weight:700">max</div><div style="font-size:22px;color:rgba(255,255,255,.6);margin-top:6px">더 큰 값을 돌려주는 함수</div>`, { width: 420, height: 240, borderRadius: 34, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,rgba(255,214,10,.22),rgba(255,214,10,.05))", border: "2px solid var(--acc)" }, true);
  const inA = at(root, 0, 0, "mono", "3", { fontSize: 50, fontWeight: 700, width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#64d2ff", color: "#000" }, true);
  const inB = at(root, 0, 0, "mono", "7", { fontSize: 50, fontWeight: 700, width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#64d2ff", color: "#000" }, true);
  const out = at(root, 0, 0, "mono", "7", { fontSize: 50, fontWeight: 700, width: 100, height: 100, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffd60a", color: "#000", boxShadow: "0 0 40px #ffd60a" }, true);
  const li = at(root, 470, 250, "", "인수 (argument)", { fontSize: 28, fontWeight: 700, color: "#64d2ff" }, true), lo = at(root, 1470, 250, "", "반환값 (return)", { fontSize: 28, fontWeight: 700, color: "#ffd60a" }, true);
  const hdr = at(root, 960, 700, "mono", `<span class="h1" style="color:#ff7ab2">int</span> <span class="h2" style="color:#6bdfff">max</span><span class="h3">(int x, int y)</span>`, { fontSize: 66, fontWeight: 700, whiteSpace: "pre" }, true);
  const tags = [["반환형", "#ff7ab2"], ["함수 이름", "#6bdfff"], ["매개변수 (parameter)", "#fff"]].map(([s, c]) => at(root, 0, 800, "", s, { fontSize: 26, fontWeight: 700, color: c, whiteSpace: "nowrap" }, true));
  let m = false;
  return t => {
    if (!m && t > 0.05) { m = true; ["h1", "h2", "h3"].forEach((c, i) => { const sp = hdr.querySelector("." + c); tags[i].style.left = (hdr.offsetLeft - hdr.offsetWidth / 2 + sp.offsetLeft + sp.offsetWidth / 2) + "px"; }); }
    pop(box, t, 0.3); vis(li, t, 1.6, null); vis(lo, t, 4.2, null);
    const qa = K(t, 1.4, 1.2, E.io3), qb = K(t, 1.7, 1.2, E.io3);
    S(inA, { o: clamp((t - 1.2) * 4) * (1 - K(t, 2.6, 0.2)), x: lerp(300, 780, qa), y: 320 });
    S(inB, { o: clamp((t - 1.5) * 4) * (1 - K(t, 2.9, 0.2)), x: lerp(300, 780, qb), y: 420 });
    glow(box, K(t, 2.9, 0.2) * (1 - K(t, 4.0, 0.5)));
    const qo = K(t, 3.6, 1.0, E.o5); S(out, { o: clamp((t - 3.6) * 4), x: lerp(1100, 1470, qo), y: 360, s: 0.6 + 0.4 * qo });
    blurIn(hdr, t, 7.6); tags.forEach((e, i) => vis(e, t, 8.6 + i * 0.6, null));
  };
}, seqCaps(0.6, [[3.0, "함수: 특정 작업을 수행하는 **이름 붙은 코드 묶음**"], [3.4, "값을 넣으면(**인수**) 일을 하고 결과를 돌려준다(**반환값**)"], [6.6, "함수 헤더 = **반환형** + **함수 이름** + **매개변수 목록**"]]));

code(8, {
  name: "별 출력 함수", file: "stars_fn.c", tag: "강의 예제",
  title: "void 함수 정의와 호출", about: "같은 일을 두 번 해야 할 때, 코드를 복사하지 말고 **함수로 만들어 두 번 호출**한다.",
  src: String.raw`
#include <stdio.h>

void print_stars()     // 반환값 없음(void), 매개변수 없음
{
    for (int i = 0; i < 30; i++)
        printf("*");
}

int main(void)
{
    print_stars();                 // 함수 호출
    printf("\nHello World!\n");
    print_stars();
    printf("\n");
    return 0;
}`,
  steps: [
    { l: "3-7", t: "함수 정의", d: "`void` = **반환값 없음**. 호출되면 별 30개를 출력한다. 정의만으로는 실행되지 않는다.", m: ["void", "print_stars"] },
    { l: "11", t: "호출 ①", d: "`print_stars();` — 실행 흐름이 **함수로 점프**한다.", m: ["11:print_stars();"] },
    { l: "5-6", t: "함수 안에서", d: "for가 30번 돌며 별을 찍고, 함수가 끝나면 **호출한 곳 다음 줄로 복귀**.", o: "******************************" },
    { l: "12", t: "main 계속", d: "`\\n` 으로 줄을 바꾼 뒤 Hello World!", o: "\nHello World!\n" },
    { l: "13", t: "호출 ②", d: "한 번 정의한 함수를 **여러 번 재사용**한다.", o: "******************************" },
    { l: "14-15", t: "종료", d: "마지막 줄바꿈 후 main 종료.", o: "\n" },
  ],
});

code(8, {
  name: "max — 반환값", file: "max.c", tag: "강의 예제", types: { x: "int", y: "int", larger: "int" },
  title: "값을 돌려주는 함수", about: "두 정수를 받아서 **더 큰 값을 return** 한다.",
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int max(int x, int y)   // 두 정수를 받아 큰 값을 반환
{
    if (x > y)
        return x;
    else
        return y;
}

int main(void)
{
    int x, y;
    printf("정수를 입력하시오: ");
    scanf("%d", &x);
    printf("정수를 입력하시오: ");
    scanf("%d", &y);

    int larger = max(x, y);   // 반환값을 변수에 담기
    printf("더 큰값은 %d입니다. \n", larger);
    return 0;
}`,
  steps: [
    { l: "4", t: "함수 헤더", d: "`int` 반환형, `max` 이름, `(int x, int y)` **매개변수** 두 개.", m: ["int max(int x, int y)"] },
    { l: "14-18", t: "main에서 입력", d: "3과 7을 입력.", o: "정수를 입력하시오: [[3]]\n정수를 입력하시오: [[7]]\n", v: { x: "3", y: "7" } },
    { l: "20", t: "호출 `max(x, y)`", d: "인수 3, 7이 함수의 매개변수 x, y로 **복사**되어 전달된다.", m: ["max(x, y)"] },
    { l: "6-9", t: "함수 안", d: "3 > 7 거짓 → `return y;` → **7을 반환**하며 함수가 즉시 끝난다.", m: ["9:return y;"] },
    { l: "20", t: "반환값 저장", d: "호출식 `max(x, y)` 자리가 **7로 바뀐** 것처럼 동작한다.", v: { larger: "7" } },
    { l: "21", t: "출력", d: "더 큰 값 7.", o: "더 큰값은 7입니다. \n" },
  ],
});

code(8, {
  name: "get_integer + add", file: "add_fn.c", tag: "강의 예제", types: { x: "int", y: "int", sum: "int" },
  title: "함수로 나눈 프로그램", about: "입력 담당, 계산 담당 — 일을 **함수 단위로 나누면** main이 이야기처럼 읽힌다.",
  src: String.raw`
#include <stdio.h>

int get_integer()      // 정수를 입력받아 반환
{
    int value;
    printf("정수를 입력하시오: ");
    scanf("%d", &value);
    return value;
}

int add(int x, int y)  // 두 수의 합을 반환
{
    return x + y;
}

int main(void)
{
    int x = get_integer();
    int y = get_integer();
    int sum = add(x, y);
    printf("두수의 합은 %d입니다. \n", sum);
    return 0;
}`,
  steps: [
    { l: "3-9", t: "입력 함수", d: "매개변수 없이 입력받은 값을 **반환만** 한다. 입력 코드를 재사용할 수 있다." },
    { l: "11-14", t: "덧셈 함수", d: "두 수를 받아 합을 반환. 함수 몸체가 한 줄이어도 된다." },
    { l: "18", t: "첫 호출", d: "get_integer()의 반환값 10이 x의 **초기값**이 된다.", o: "정수를 입력하시오: [[10]]\n", v: { x: "10" } },
    { l: "19", t: "두 번째 호출", d: "같은 함수, 다른 결과.", o: "정수를 입력하시오: [[20]]\n", v: { y: "20" } },
    { l: "20", t: "add(x, y)", d: "10 + 20 = **30** 반환.", v: { sum: "30" }, m: ["add(x, y)"] },
    { l: "21", t: "출력", d: "", o: "두수의 합은 30입니다. \n" },
  ],
});

dia(8, "호출과 복귀", 13, root => {
  const mk = (x, title, lines, w) => {
    const box = at(root, x, 470, "", `<div style="font-size:26px;font-weight:800;color:var(--acc);margin-bottom:16px">${title}</div>` + lines.map((s, i) => `<div class="mono ln${i}" style="font-size:28px;line-height:1.9;padding:0 12px;border-radius:8px;white-space:pre">${hlC(s)}</div>`).join(""), { width: w, padding: "28px 30px", borderRadius: 26, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }, true);
    return box;
  };
  const M = mk(560, "main", ["int x = 10, y = 20;", "int sum = add(x, y);", 'printf("%d", sum);'], 620);
  const A = mk(1400, "add", ["int add(int x, int y)", "{", "    return x + y;", "}"], 520);
  const svg = svgLayer(root);
  const go = arrow(svg, [[870, 440], [1020, 300], [1140, 370]], { c: "#64d2ff", curve: true, w: 4 }), back = arrow(svg, [[1140, 580], [1020, 660], [870, 500]], { c: "#ffd60a", curve: true, w: 4 });
  const l1 = at(root, 1010, 270, "mono", "10, 20 →", { fontSize: 30, fontWeight: 700, color: "#64d2ff" }, true), l2 = at(root, 1010, 700, "mono", "← 30", { fontSize: 30, fontWeight: 700, color: "#ffd60a" }, true);
  const hl = (box, i, on) => { const e = box.querySelector(".ln" + i); const bg = on > 0.01 ? `rgba(255,214,10,${(0.22 * on).toFixed(3)})` : ""; if (e._bg !== bg) { e.style.background = bg; e._bg = bg; } };
  return t => {
    rise(M, t, 0.3); rise(A, t, 0.6);
    hl(M, 0, K(t, 1.4, 0.3) * (1 - K(t, 2.3, 0.3)));
    hl(M, 1, K(t, 2.4, 0.3) * (1 - K(t, 3.4, 0.3)) + K(t, 7.4, 0.3) * (1 - K(t, 8.6, 0.3)));
    go.set(K(t, 3.2, 0.8, E.io3)); vis(l1, t, 3.6, null);
    hl(A, 2, K(t, 4.4, 0.3) * (1 - K(t, 6.6, 0.3)));
    back.set(K(t, 6.2, 0.8, E.io3)); vis(l2, t, 6.6, null);
    hl(M, 2, K(t, 9.0, 0.3));
  };
}, seqCaps(0.6, [[3.6, "main이 위에서부터 실행되다가 `add(x, y)` 를 만나면"], [3.4, "실행 흐름이 **함수로 이동** — 인수 값이 매개변수에 복사된다"], [4.4, "`return` 을 만나면 값을 들고 **호출한 자리로 복귀**한다"]]));

code(8, {
  name: "함수 원형", file: "prototype.c", tag: "강의 예제",
  title: "먼저 선언, 나중에 정의", about: "컴파일러는 소스를 **위에서 아래로** 읽는다. main보다 뒤에 정의된 함수는 어떻게 쓸까?",
  src: String.raw`
#include <stdio.h>
double c_to_f(double c_temp);   // ← 함수 원형(선언)

int main(void)
{
    printf("섭씨 %lf도는 화씨 %lf입니다. \n", 36.0, c_to_f(36.0));
    return 0;
}

double c_to_f(double c_temp)    // 실제 정의는 아래에
{
    return 9.0 / 5.0 * c_temp + 32;
}`,
  steps: [
    { l: "2", t: "함수 원형 (prototype)", d: "함수의 **이름 · 반환형 · 매개변수**를 미리 알려 둔다. 끝에 **세미콜론**.", m: ["double c_to_f(double c_temp);"] },
    { l: "6", t: "호출", d: "원형 덕분에 컴파일러는 c_to_f를 이미 알고 있다. 원형이 없으면 **경고 또는 오류**.", o: "섭씨 36.000000도는 화씨 96.800000입니다. \n", m: ["c_to_f(36.0)"] },
    { l: "10-13", t: "실제 정의", d: "9/5 × 36 + 32 = **96.8**. 정의 헤더에는 세미콜론이 **없다**.", m: ["9.0 / 5.0"] },
  ],
});

code(8, {
  name: "온도 변환기", file: "converter.c", tag: "강의 예제 · 전체 코드", types: { choice: "char", temp: "double" },
  title: "메뉴 + 함수 + 무한 루프", about: "지금까지 배운 것을 모두 합친 프로그램. 함수 3개와 `while(1)` 메뉴 루프.",
  termH: 300,
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

void printOptions()
{
    printf(" 'c' 섭씨온도에서 화씨온도로 변환\n");
    printf(" 'f' 화씨온도에서 섭씨온도로 변환\n");
    printf(" 'q' 종료\n");
}
double C2F(double c_temp) { return 9.0 / 5.0 * c_temp + 32; }
double F2C(double f_temp) { return (f_temp - 32.0) * 5.0 / 9.0; }

int main(void)
{
    char choice;
    double temp;
    while (1) {
        printOptions();
        printf("메뉴에서 선택하세요.");
        choice = getchar();
        if (choice == 'q') break;
        else if (choice == 'c') {
            printf("섭씨온도: ");
            scanf("%lf", &temp);
            printf("화씨온도: %lf \n", C2F(temp));
        }
        else if (choice == 'f') {
            printf("화씨온도: ");
            scanf("%lf", &temp);
            printf("섭씨온도: %lf \n", F2C(temp));
        }
        getchar();  // 엔터키(남은 \n) 제거용
    }
    return 0;
}`,
  steps: [
    { l: "4-9", t: "메뉴 출력 함수", d: "반복해서 보여줄 메뉴를 **함수로 분리**했다." },
    { l: "10-11", t: "한 줄짜리 함수 두 개", d: "C2F: 9/5 × c + 32, F2C: (f − 32) × 5/9. `9.0 / 5.0` 처럼 **실수로** 써야 정수 나눗셈을 피한다.", m: ["9.0 / 5.0", "5.0 / 9.0"] },
    { l: "17-18", t: "무한 루프 + 메뉴", d: "`while (1)` 안에서 매번 메뉴를 출력한다.", o: " 'c' 섭씨온도에서 화씨온도로 변환\n 'f' 화씨온도에서 섭씨온도로 변환\n 'q' 종료\n" },
    { l: "19-20", t: "`getchar()`", d: "키보드에서 **문자 하나**를 읽어 반환하는 라이브러리 함수.", o: "메뉴에서 선택하세요.[[c]]\n", v: { choice: "'c'" }, m: ["getchar()"] },
    { l: "22-26", t: "'c' 를 고르면", d: "온도를 입력받아 `C2F(temp)` 에 넘기고, **반환값을 바로 출력**한다.", o: "섭씨온도: [[36]]\n화씨온도: 96.800000 \n", v: { temp: "36.0" }, m: ["C2F(temp)"] },
    { l: "32", t: "남은 엔터 제거", d: "scanf 뒤에 남은 `\\n` 이 다음 getchar()에 읽히지 않도록 **한 번 더 읽어서 버린다**." },
    { l: "18-21", t: "'q' → break", d: "메뉴를 다시 보여 주고, q를 입력하면 무한 루프를 빠져나와 종료.", o: " 'c' 섭씨온도에서 화씨온도로 변환\n 'f' 화씨온도에서 섭씨온도로 변환\n 'q' 종료\n메뉴에서 선택하세요.[[q]]\n", v: { choice: "'q'" }, m: ["break"] },
  ],
});

/* deterministic coin tosses shared by the code scene and the diagram */
const COINS = (() => { const r = rng(20261020); const a = []; for (let i = 0; i < 100; i++) a.push(r() < 0.5 ? 1 : 0); return a; })();
const HEADS = COINS.reduce((s, v) => s + v, 0), TAILS = 100 - HEADS;

(function () {
  const steps = [
    { l: "2-4", t: "헤더 세 개", d: "`stdlib.h`: rand · srand,  `time.h`: time" },
    { l: "6-9", t: "coin_toss()", d: "`rand()` 는 0 ~ 32767 사이의 난수. `% 2` 하면 **0 또는 1**.", m: ["rand() % 2"] },
    { l: "14", t: "시드 설정", d: "`srand(time(NULL))` — 현재 시각으로 시드를 정해 **실행할 때마다 다른** 난수열을 얻는다.", m: ["srand(time(NULL))"] },
    { l: "16-21", t: "100번 던지기", d: "반환값이 1이면 앞면, 아니면 뒷면 개수를 늘린다.", v: { heads: "0", tails: "0" } },
  ];
  [25, 50, 75, 100].forEach(n => { const h = COINS.slice(0, n).reduce((s, v) => s + v, 0); steps.push({ l: "16-21", v: { heads: String(h), tails: String(n - h) }, dur: 1.0 }); });
  steps.push({ l: "22-23", t: "결과", d: "실행할 때마다 달라지지만 대략 **반반**에 가깝다.", o: `동전의 앞면: ${HEADS} \n동전의 뒷면: ${TAILS} \n` });
  code(8, {
    name: "동전 던지기", file: "coin.c", tag: "강의 예제", types: { heads: "int", tails: "int" },
    title: "rand()로 시뮬레이션", about: "라이브러리 함수 `rand()` 로 동전을 100번 던져 본다.",
    src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

int coin_toss(void)       // 0 또는 1 반환
{
    return rand() % 2;
}

int main(void)
{
    int heads = 0, tails = 0;
    srand(time(NULL));     // 시드 설정(실행마다 다르게)

    for (int toss = 0; toss < 100; toss++) {
        if (coin_toss() == 1)
            heads++;
        else
            tails++;
    }
    printf("동전의 앞면: %d \n", heads);
    printf("동전의 뒷면: %d \n", tails);
    return 0;
}`,
    steps,
  });
})();

dia(8, "100번의 동전", 11.5, root => {
  const coins = COINS.map((v, i) => at(root, 380 + (i % 10) * 78, 200 + Math.floor(i / 10) * 66, "", v ? "앞" : "뒤", { width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#000", background: v ? "radial-gradient(circle at 35% 30%,#fff2a8,#ffd60a 60%,#c9a300)" : "radial-gradient(circle at 35% 30%,#fff,#c7c7cc 60%,#8e8e93)" }, true));
  const hc = at(root, 1440, 330, "", "", { fontSize: 44, fontWeight: 800 }, true), tc = at(root, 1440, 420, "", "", { fontSize: 44, fontWeight: 800 }, true);
  const hb = at(root, 1250, 520, "", "", { width: 380, height: 34, borderRadius: 17, background: "#ffd60a", transformOrigin: "0 50%" }), tb = at(root, 1250, 574, "", "", { width: 380, height: 34, borderRadius: 17, background: "#c7c7cc", transformOrigin: "0 50%" });
  return t => {
    let h = 0, n = 0;
    coins.forEach((c, i) => { const a = 0.4 + i * 0.075, q = K(t, a, 0.35, E.o3); S(c, { o: clamp((t - a) * 6), sx: Math.abs(Math.cos((1 - q) * Math.PI * 1.5)) || 0.02, s: 1 }); if (t > a + 0.2) { n++; h += COINS[i]; } });
    txt(hc, `앞면 ${h}`); txt(tc, `뒷면 ${n - h}`); S(hc, { o: K(t, 0.4, 0.4) }); S(tc, { o: K(t, 0.4, 0.4) });
    S(hb, { o: K(t, 0.4, 0.4), sx: Math.max(0.001, h / 60) }); S(tb, { o: K(t, 0.4, 0.4), sx: Math.max(0.001, (n - h) / 60) });
  };
}, seqCaps(0.6, [[4.6, "`rand() % 2` → 0 또는 1, 동전 100개를 던지면…"], [5.4, `앞면 **${HEADS}** · 뒷면 **${TAILS}** — 던질수록 50 : 50 에 가까워진다`]]));

code(8, {
  name: "나무 높이 측정", file: "tree.c", tag: "Lab", types: { distance: "double", height: "double", degrees: "double", radians: "double", tree_height: "double" },
  title: "math.h의 tan()", about: "나무까지의 거리와 올려다본 각도만으로 나무의 높이를 구한다.",
  termH: 290,
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <math.h>
#include <stdio.h>

int main(void)
{
    double height, distance, tree_height, degrees, radians;

    printf("나무와의 길이(단위는 미터): ");
    scanf("%lf", &distance);
    printf("측정자의 키(단위는 미터): ");
    scanf("%lf", &height);
    printf("각도(단위는 도): ");
    scanf("%lf", &degrees);

    radians = degrees * (3.141592 / 180.0);  // 도 → 라디안
    tree_height = tan(radians) * distance + height;
    printf("나무의 높이(단위는 미터): %lf \n", tree_height);
    return 0;
}`,
  steps: [
    { l: "2", t: "`math.h`", d: "`tan()` 같은 삼각함수, `sqrt()`, `pow()` 등이 들어 있다.", m: ["math.h"] },
    { l: "9-14", t: "세 값 입력", d: "거리 10m, 키 1.7m, 각도 45도.", o: "나무와의 길이(단위는 미터): [[10]]\n측정자의 키(단위는 미터): [[1.7]]\n각도(단위는 도): [[45]]\n", v: { distance: "10.0", height: "1.7", degrees: "45.0" } },
    { l: "16", t: "도 → 라디안", d: "C의 삼각함수는 **라디안**을 받는다. 도 × π / 180", v: { radians: "0.785398" }, m: ["3.141592 / 180.0"] },
    { l: "17", t: "높이 계산", d: "tan(45°) ≈ 1 → 1 × 10 + 1.7 = **11.7m**", v: { tree_height: "11.699997" }, m: ["tan(radians)"] },
    { l: "18", t: "출력", d: "π를 3.141592로 근사해 **11.699997** 처럼 아주 작은 오차가 생긴다.", o: "나무의 높이(단위는 미터): 11.699997 \n" },
  ],
});

dia(8, "삼각비로 높이 재기", 11, root => {
  const svg = svgLayer(root);
  const gx = 640, gy = 860, tx = 1200, eye = 170;
  const ground = arrow(svg, [[300, gy], [1650, gy]], { c: "rgba(255,255,255,.35)", w: 3, head: 0 });
  const person = at(root, gx, gy - eye / 2, "", "", { width: 26, height: eye, borderRadius: 13, background: "#64d2ff" }, true);
  const head = at(root, gx, gy - eye - 18, "", "", { width: 40, height: 40, borderRadius: "50%", background: "#64d2ff" }, true);
  const trunk = at(root, tx, gy - 150, "", "", { width: 50, height: 300, background: "#8b5a2b", borderRadius: 8 }, true);
  const crown = at(root, tx, 350, "", "", { width: 300, height: 450, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#9cf0ae,#30d158 55%,#1a7a35)" }, true);
  const sight = arrow(svg, [[gx, gy - eye], [tx, gy - eye - (tx - gx)]], { c: "#ffd60a", w: 4, dash: "14 10" });
  const base = arrow(svg, [[gx, gy - eye], [tx, gy - eye]], { c: "rgba(255,255,255,.7)", w: 3, head: 0 });
  const vert = arrow(svg, [[tx + 200, gy - eye], [tx + 200, gy - eye - (tx - gx)]], { c: "#ff9f0a", w: 4 });
  const ang = sv(svg, "path", { d: `M${gx + 120} ${gy - eye} A120 120 0 0 0 ${gx + 85} ${gy - eye - 85}`, fill: "none", stroke: "#ffd60a", "stroke-width": 4 });
  const lA = at(root, gx + 170, gy - eye - 50, "", "45°", { fontSize: 30, fontWeight: 800, color: "#ffd60a" }, true), lD = at(root, (gx + tx) / 2, gy - eye + 36, "mono", "distance = 10m", { fontSize: 28, fontWeight: 700 }, true);
  const lH = at(root, tx + 340, gy - eye - (tx - gx) / 2, "mono", "tan(45°) × 10", { fontSize: 28, fontWeight: 700, color: "#ff9f0a" }, true), lE = at(root, gx - 110, gy - eye / 2, "mono", "1.7m", { fontSize: 28, fontWeight: 700, color: "#64d2ff" }, true);
  const res = at(root, 600, 170, "mono", "높이 = tan(각도) × 거리 + 키", { fontSize: 44, fontWeight: 700 }, true);
  return t => {
    ground.set(K(t, 0.2, 0.6)); pop(person, t, 0.6); pop(head, t, 0.7); vis(lE, t, 1.0, null);
    pop(trunk, t, 0.9); pop(crown, t, 1.1);
    base.set(K(t, 1.8, 0.7)); vis(lD, t, 2.2, null);
    sight.set(K(t, 2.8, 0.9)); ang.style.opacity = K(t, 3.5, 0.4); vis(lA, t, 3.6, null);
    vert.set(K(t, 4.6, 0.7)); vis(lH, t, 5.0, null);
    blurIn(res, t, 6.2);
  };
}, seqCaps(0.6, [[5.2, "눈높이에서 나무 꼭대기를 올려다본 각도가 45°라면"], [4.6, "높이 = tan(45°) × 10 + 1.7 ≈ **11.7m**"]]));
/* ===================== CHAPTER 9 ===================== */
chTitle(9, ["지역 변수 · 블록", "값에 의한 전달", "전역 변수", "static", "재귀 함수", "하노이의 탑"]);

(function () {
  const steps = [
    { l: "5", t: "main의 지역 변수", d: "함수 안에서 선언한 변수는 **그 함수 안에서만** 쓸 수 있다.", v: { i: "?" } },
    { l: "6-9", t: "블록 안에서 선언", d: "`temp` 는 **블록 `{ }` 안**에서만 존재한다. 블록이 끝나면 사라진다.", v: { i: "0", temp: "1" }, o: "temp = 1\n", m: ["int temp = 1;"] },
    { l: "10", t: "증가시켜도…", d: "temp++ 로 2가 되지만, 블록 끝에서 **소멸**한다.", v: { temp: "2" } },
  ];
  for (let i = 1; i < 5; i++) steps.push({ l: "8-9", v: { i: String(i), temp: "1" }, o: "temp = 1\n", dur: 1.1 });
  steps.push({ l: "6-11", t: "매번 새로 생성", d: "반복마다 **다시 만들어지고 다시 1로 초기화** → 항상 1이 출력된다." });
  code(9, {
    name: "블록과 지역 변수", file: "block.c", tag: "강의 예제", types: { i: "int", temp: "int" },
    title: "변수의 범위와 생존 기간", about: "변수는 **선언된 블록 안에서만** 살아 있다.",
    termH: 290,
    src: String.raw`
#include <stdio.h>

int main(void)
{
    int i;
    for (i = 0; i < 5; i++)
    {
        int temp = 1;   // 매 반복마다 새로 생성·초기화
        printf("temp = %d\n", temp);
        temp++;
    }
    return 0;
}`,
    steps,
  });
})();

code(9, {
  name: "값에 의한 전달", file: "inc.c", tag: "강의 예제", types: { i: "int (main)", counter: "int (inc)" },
  title: "원본은 바뀌지 않는다", about: "함수에 변수를 넘겨서 1 증가시키면, 원래 변수도 바뀔까?",
  src: String.raw`
#include <stdio.h>
void inc(int counter);

int main(void)
{
    int i = 10;
    printf("함수 호출전 i=%d\n", i);
    inc(i);                 // i의 값(10)만 복사해 전달
    printf("함수 호출후 i=%d\n", i);
    return 0;
}

void inc(int counter)
{
    counter++;   // 복사본만 증가, 원본 i는 그대로
}`,
  steps: [
    { l: "2", t: "원형 선언", d: "inc를 main 뒤에 정의하므로 미리 선언해 둔다." },
    { l: "6-7", t: "i = 10", d: "", v: { i: "10" }, o: "함수 호출전 i=10\n" },
    { l: "8", t: "값에 의한 전달", d: "i 자체가 아니라 **값 10만 복사**해서 넘긴다.", v: { counter: "10" }, m: ["inc(i)"] },
    { l: "13-16", t: "복사본 증가", d: "counter는 inc의 **지역 변수**. 11이 되어도 i와는 **다른 상자**다.", v: { counter: "11" }, m: ["counter++"] },
    { l: "9", t: "i는 그대로", d: "함수가 끝나면 counter는 사라지고 i는 여전히 10. → **call by value**", v: { counter: "(소멸)" }, o: "함수 호출후 i=10\n" },
  ],
});

dia(9, "복사본만 바뀐다", 11.5, root => {
  const mk = (x, title, name) => {
    const b = at(root, x, 450, "", `<div style="font-size:26px;font-weight:800;color:var(--acc)">${title}</div>`, { width: 460, height: 360, borderRadius: 28, padding: "26px 30px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }, true);
    const cell = at(root, x, 480, "", "", { width: 200, height: 150, borderRadius: 20, border: "2px solid rgba(255,255,255,.3)", background: "rgba(0,0,0,.3)" }, true);
    const nm = at(root, x, 590, "mono", name, { fontSize: 32, fontWeight: 700, color: "var(--acc)" }, true);
    const v = at(root, x, 480, "mono", "", { fontSize: 72, fontWeight: 700 }, true);
    return { b, cell, nm, v };
  };
  const M = mk(560, "main()", "i"), F = mk(1360, "inc()", "counter");
  const fly = at(root, 0, 0, "mono", "10", { fontSize: 72, fontWeight: 700, color: "#64d2ff", textShadow: "0 0 24px #64d2ff" }, true);
  const copy = at(root, 960, 330, "", "값 복사", { fontSize: 28, fontWeight: 700, color: "#64d2ff" }, true);
  const same = at(root, 560, 720, "", "그대로 10", { fontSize: 30, fontWeight: 800, color: "#30d158" }, true);
  const gone = at(root, 1360, 720, "", "함수 종료 → 소멸", { fontSize: 30, fontWeight: 800, color: "#ff453a" }, true);
  return t => {
    [M, F].forEach((P, k) => { rise(P.b, t, 0.3 + k * 0.3); pop(P.cell, t, 0.6 + k * 0.3); vis(P.nm, t, 0.8 + k * 0.3, null); });
    txt(M.v, "10"); S(M.v, { o: K(t, 1.0, 0.4) });
    const q = K(t, 1.8, 1.3, E.io3);
    if (t > 1.8 && t < 3.15) S(fly, { o: 1, x: lerp(560, 1360, q), y: 480 - Math.sin(q * Math.PI) * 160 }); else S(fly, { o: 0 });
    vis(copy, t, 1.9, 3.6);
    txt(F.v, t < 4.6 ? "10" : "11"); S(F.v, { o: K(t, 3.1, 0.2), s: 1 + 0.2 * K(t, 4.6, 0.15) * (1 - K(t, 4.8, 0.5)) });
    glow(F.cell, K(t, 4.6, 0.2) * (1 - K(t, 5.6, 0.5)));
    vis(same, t, 6.0, null); glow(M.cell, K(t, 6.0, 0.3), "#30d158");
    const g = K(t, 8.2, 0.8); S(F.b, { o: (1 - g * 0.75) * K(t, 0.6, 0.7) }); S(F.cell, { o: 1 - g * 0.8 }); S(F.v, { o: K(t, 3.1, 0.2) * (1 - g) }); S(F.nm, { o: 1 - g * 0.8 });
    vis(gone, t, 8.4, null);
  };
}, seqCaps(0.6, [[4.4, "인수의 **값이 복사**되어 매개변수로 전달된다"], [3.4, "함수 안에서 바꿔도 **원본은 그대로**"], [2.6, "→ C의 기본 전달 방식, **값에 의한 호출**"]]));

code(9, {
  name: "전역 변수", file: "global.c", tag: "강의 예제", types: { A: "int (전역)", B: "int (전역)", answer: "int" },
  title: "모든 함수가 공유하는 변수", about: "함수 **바깥**에 선언하면 어느 함수에서든 쓸 수 있다.",
  src: String.raw`
#include <stdio.h>
int A;   // 전역 변수(초기값 0)
int B;

int add()
{
    return A + B;   // 전역 변수를 함수 안에서 사용
}

int main()
{
    int answer;
    A = 5;
    B = 7;
    answer = add();
    printf("%d + %d = %d\n", A, B, answer);
    return 0;
}`,
  steps: [
    { l: "2-3", t: "전역 변수", d: "함수 **밖**에 선언 → 모든 함수에서 사용. 초기화하지 않아도 **자동으로 0**.", v: { A: "0", B: "0" } },
    { l: "12-14", t: "main에서 대입", d: "지역 변수 answer를 선언하고, 전역 A, B에 값을 넣는다.", v: { answer: "?", A: "5", B: "7" } },
    { l: "15", t: "add() 호출", d: "매개변수가 없어도 add는 전역 A, B를 **직접 읽는다** → 12", v: { answer: "12" }, m: ["add()"] },
    { l: "16", t: "출력 — 그리고 주의", d: "편리하지만 **어디서든 바뀔 수 있어** 오류를 추적하기 어렵다. 꼭 필요할 때만 쓰자.", o: "5 + 7 = 12\n" },
  ],
});

code(9, {
  name: "static 지역 변수", file: "static.c", tag: "강의 예제", types: { scount: "static int", acount: "int" },
  title: "함수가 끝나도 기억한다", about: "같은 함수를 세 번 호출했을 때, `static` 변수와 일반 변수의 차이.",
  termH: 270,
  src: String.raw`
#include <stdio.h>

void sub() {
    static int scount = 0;   // 정적: 호출 사이에 값 유지
    int acount = 0;          // 자동: 매번 0으로 재생성
    printf("scount = %d\t", scount);
    printf("acount = %d\n", acount);
    scount++;
    acount++;
}

int main(void) {
    sub();
    sub();
    sub();
    return 0;
}`,
  steps: [
    { l: "4", t: "static 지역 변수", d: "**처음 한 번만** 초기화되고, 함수가 끝나도 **값이 유지**된다.", m: ["static"] },
    { l: "5", t: "자동 지역 변수", d: "호출될 때마다 **새로 만들어져** 0으로 초기화된다." },
    { l: "13", t: "1번째 호출", d: "출력 후 둘 다 1 증가.", v: { scount: "1", acount: "1" }, o: "scount = 0\tacount = 0\n" },
    { l: "14", t: "2번째 호출", d: "acount는 **다시 0** 부터, scount는 **1을 기억**하고 있다.", v: { scount: "2", acount: "1" }, o: "scount = 1\tacount = 0\n" },
    { l: "15", t: "3번째 호출", d: "scount는 0 → 1 → 2 로 쌓이고, acount는 늘 0.", v: { scount: "3", acount: "1" }, o: "scount = 2\tacount = 0\n" },
  ],
});

dia(9, "변수가 사는 곳", 13.5, root => {
  const D = at(root, 560, 480, "", `<div style="font-size:30px;font-weight:800;color:var(--acc)">데이터 영역</div><div style="font-size:22px;color:rgba(255,255,255,.6);margin-top:6px">전역 · static — 프로그램 끝까지 생존</div>`, { width: 620, height: 470, borderRadius: 28, padding: "28px 32px", background: "rgba(100,210,255,.06)", border: "1px solid rgba(100,210,255,.35)" }, true);
  const sc = at(root, 560, 520, "", `<div class="mono" style="font-size:26px;color:rgba(255,255,255,.6)">static int scount</div><div class="mono v" style="font-size:80px;font-weight:700"></div>`, { width: 360, height: 200, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.35)", border: "2px solid rgba(100,210,255,.5)" }, true);
  const scv = sc.querySelector(".v");
  const St = at(root, 1360, 480, "", `<div style="font-size:30px;font-weight:800;color:#ff9f0a">스택</div><div style="font-size:22px;color:rgba(255,255,255,.6);margin-top:6px">지역 변수 — 함수가 끝나면 소멸</div>`, { width: 620, height: 470, borderRadius: 28, padding: "28px 32px", background: "rgba(255,159,10,.05)", border: "1px solid rgba(255,159,10,.35)" }, true);
  const mainF = at(root, 1360, 650, "mono", "main()", { width: 440, height: 80, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, background: "rgba(255,255,255,.08)" }, true);
  const subF = at(root, 1360, 550, "", `<span class="mono" style="font-size:26px">sub()</span><span class="mono v" style="font-size:26px;margin-left:30px;color:#ff9f0a"></span>`, { width: 440, height: 90, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,159,10,.25)", border: "1px solid #ff9f0a" }, true);
  const subV = subF.querySelector(".v");
  const calls = at(root, 960, 820, "mono", "", { fontSize: 30, fontWeight: 700 }, true);
  return t => {
    rise(D, t, 0.3); pop(sc, t, 0.8); rise(St, t, 0.5); pop(mainF, t, 1.0);
    let s = 0, k = -1;
    for (let c = 0; c < 3; c++) { const a = 2.0 + c * 3.4; if (t >= a) k = c; if (t >= a + 1.8) s = c + 1; }
    txt(scv, String(s));
    glow(sc, [0, 1, 2].reduce((m, c) => m + K(t, 3.8 + c * 3.4, 0.2) * (1 - K(t, 4.4 + c * 3.4, 0.4)), 0), "#64d2ff");
    if (k >= 0) {
      const a = 2.0 + k * 3.4, u = t - a;
      const pin = K(u, 0, 0.4, E.ob), pout = K(u, 2.6, 0.5, E.io3);
      S(subF, { o: clamp(u * 4) * (1 - pout), y: (1 - pin) * 40 - pout * 30 });
      txt(subV, "acount = " + (u < 1.8 ? 0 : 1));
      txt(calls, `sub() 호출 ${k + 1}번째`); S(calls, { o: 1 });
    } else { S(subF, { o: 0 }); S(calls, { o: 0 }); }
  };
}, seqCaps(0.6, [[4.6, "전역 · static 변수 → **데이터 영역**: 프로그램이 끝날 때까지 생존"], [4.4, "지역(자동) 변수 → **스택**: 함수가 끝나면 사라진다"], [3.0, "그래서 scount는 쌓이고, acount는 매번 0"]]));

(function () {
  const steps = [
    { l: "3-8", t: "재귀 함수", d: "함수가 **자기 자신을 호출**한다. 반드시 멈추는 **종료 조건**이 있어야 한다." },
    { l: "13-14", t: "입력", d: "4를 입력.", o: "정수를 입력하시오:[[4]]\n", v: { n: "4" } },
    { l: "15", t: "factorial(4)", d: "printf가 출력하기 전에, 인수 자리의 `factorial(n)` 이 **먼저 실행**된다.", m: ["factorial(n)"] },
    { l: "5", t: "호출 추적", d: "n × factorial(n − 1): 문제를 **한 단계 작은 같은 문제**로 줄여 나간다.", o: "factorial(4)\n", dur: 5.0 },
  ];
  [3, 2, 1].forEach(k => steps.push({ l: "7", dur: 0.8 }, { l: "5", o: `factorial(${k})\n`, dur: 1.0 }));
  steps.push({ l: "6", t: "종료 조건", d: "n ≤ 1 → **1을 반환**. 이제 거꾸로 돌아가며 곱한다: 1 → 2 → 6 → 24", m: ["n <= 1"] });
  steps.push({ l: "15", t: "결과", d: "4 × 3 × 2 × 1 = **24**", o: "4!은 24입니다.\n" });
  code(9, {
    name: "재귀 팩토리얼", file: "recursion.c", tag: "강의 예제", types: { n: "int" },
    title: "n! = n × (n−1)!", about: "반복문 없이, 함수가 **자기 자신을** 불러서 팩토리얼을 계산한다.",
    termH: 300,
    src: String.raw`
#include <stdio.h>

long factorial(int n)
{
    printf("factorial(%d)\n", n);
    if (n <= 1) return 1;                 // 종료 조건
    else return n * factorial(n - 1);     // 자기 자신 호출
}

int main(void)
{
    int n;
    printf("정수를 입력하시오:");
    scanf("%d", &n);
    printf("%d!은 %ld입니다.\n", n, factorial(n));
    return 0;
}`,
    steps,
  });
})();

dia(9, "콜 스택", 17, root => {
  const X = 640, B = 860, Hh = 112;
  const frames = ["main()", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"].map((s, i) => at(root, X, B - i * (Hh + 10) - Hh / 2, "", `<span class="mono" style="font-size:30px;font-weight:700">${s}</span><span class="mono r" style="font-size:28px;margin-left:24px;color:var(--acc)"></span>`, { width: 560, height: Hh, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: i ? "color-mix(in srgb, var(--acc) 16%, rgba(255,255,255,.04))" : "rgba(255,255,255,.08)", border: "1px solid " + (i ? "color-mix(in srgb, var(--acc) 50%, transparent)" : "rgba(255,255,255,.18)") }, true));
  const rv = frames.map(f => f.querySelector(".r"));
  const eqs = ["factorial(4)", "= 4 × factorial(3)", "= 4 × 3 × factorial(2)", "= 4 × 3 × 2 × factorial(1)", "= 4 × 3 × 2 × 1", "= 24"].map((s, i) => at(root, 1180, 250 + i * 80, "mono", s, { fontSize: 36, fontWeight: 700, color: i === 5 ? "var(--acc)" : "#fff", whiteSpace: "pre" }));
  const ret = ["1", "2", "6", "24"];
  const bub = at(root, 0, 0, "mono", "", { fontSize: 34, fontWeight: 800, color: "#000", background: "#ffd479", padding: "6px 18px", borderRadius: 999 }, true);
  return t => {
    frames.forEach((f, i) => {
      const a = 0.6 + i * 1.1, pin = K(t, a, 0.5, E.ob);
      const popAt = i ? 6.6 + (4 - i) * 1.6 : 99, po = K(t, popAt, 0.5, E.io3);
      S(f, { o: clamp((t - a) * 4) * (1 - po), y: (1 - pin) * -60 - po * 40, s: 1 - 0.05 * po });
    });
    // return labels
    const lab = [null, "4 × 6 = 24", "3 × 2 = 6", "2 × 1 = 2", "return 1"];
    frames.forEach((f, i) => { if (!i) return; const at2 = 6.0 + (4 - i) * 1.6; txt(rv[i], t > at2 ? lab[i] : ""); });
    txt(rv[0], t > 13.0 ? "← 24" : "");
    eqs.forEach((e, i) => vis(e, t, i < 5 ? 0.8 + i * 1.1 : 12.4, null, { dy: 0 }));
    // bubble travels down from popped frame to the one below
    let shown = false;
    for (let k = 0; k < 4; k++) {
      const s0 = 6.6 + k * 1.6, i = 4 - k, u = (t - s0) / 0.6;
      if (u > 0 && u < 1) { const y0 = B - i * (Hh + 10) - Hh / 2, y1 = y0 + Hh + 10; txt(bub, ret[k]); S(bub, { o: 1, x: X + 330, y: lerp(y0, y1, E.io3(u)) }); shown = true; }
    }
    if (!shown) S(bub, { o: 0 });
  };
}, seqCaps(0.6, [[5.2, "호출할 때마다 **스택**에 새 칸이 쌓인다 — factorial(4) → (3) → (2) → (1)"], [6.2, "종료 조건에 닿으면 반환값을 들고 **한 칸씩 내려오며** 사라진다"], [4.0, "4 × 3 × 2 × 1 = **24**"]]));

(function () {
  const steps = [
    { l: "3-10", t: "2진수 출력", d: "2로 나눈 **나머지**가 각 자리 숫자. 하지만 나머지는 **가장 낮은 자리부터** 나온다." },
    { l: "14", t: "print_binary(9)", d: "9를 2진수로 찍어 보자.", m: ["print_binary(9)"] },
    { l: "5-7", t: "먼저 재귀", d: "출력보다 **재귀 호출을 먼저** 해서, 상위 자리가 먼저 찍히게 만든다. 9 → 4 → 2 → 1 → 0 (멈춤)", m: ["print_binary(x / 2)"] },
    { l: "8", t: "돌아오며 출력", d: "가장 깊은 곳부터 돌아오며 1 % 2 = 1, 2 % 2 = 0, 4 % 2 = 0, 9 % 2 = 1", o: "1", m: ["x % 2"] },
    { l: "8", o: "0", dur: 1.0 }, { l: "8", o: "0", dur: 1.0 }, { l: "8", o: "1", dur: 1.0 },
    { l: "7-8", t: "결과 1001", d: "9 = 8 + 1 = **1001₂**. 두 줄의 순서를 바꾸면 자릿수가 **거꾸로** 찍힌다 (6 → 110이 아니라 011)." },
  ];
  code(9, {
    name: "재귀로 2진수", file: "binary.c", tag: "강의 예제",
    title: "호출 순서 vs 출력 순서", about: "재귀 호출과 printf의 **순서**가 결과를 결정한다.",
    src: String.raw`
#include <stdio.h>

void print_binary(int x)
{
    if (x > 0)
    {
        print_binary(x / 2);   // 먼저 상위 자리로 재귀
        printf("%d", x % 2);   // 그 다음 현재 자리 출력
    }
}

int main(void)
{
    print_binary(9);   // 1001
    return 0;
}`,
    steps,
  });
})();

dia(9, "내려가고, 올라오며 출력", 13.5, root => {
  const vals = [9, 4, 2, 1, 0];
  const N = vals.map((v, i) => at(root, 380 + i * 230, 230 + i * 120, "", `<span class="mono" style="font-size:30px;font-weight:700">pb(${v})</span>`, { width: 200, height: 90, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: v ? "rgba(100,210,255,.12)" : "rgba(255,69,58,.12)", border: "1px solid " + (v ? "rgba(100,210,255,.5)" : "rgba(255,69,58,.5)") }, true));
  const svg = svgLayer(root);
  const A = vals.slice(0, 4).map((v, i) => arrow(svg, [[380 + i * 230 + 60, 230 + i * 120 + 46], [380 + (i + 1) * 230 - 60, 230 + (i + 1) * 120 - 46]], { c: "rgba(255,255,255,.5)" }));
  const R = vals.slice(0, 4).map((v, i) => at(root, 380 + i * 230 - 190, 230 + i * 120, "mono", `${v} % 2 = <b style="color:#ffd479">${v % 2}</b>`, { fontSize: 24 }, true));
  const stop = at(root, 380 + 4 * 230, 230 + 4 * 120 + 74, "", "x > 0 거짓 → 멈춤", { fontSize: 22, color: "#ff6b61", fontWeight: 700 }, true);
  const out = at(root, 1500, 300, "mono", "", { fontSize: 110, fontWeight: 700, letterSpacing: ".08em" }, true);
  const ol = at(root, 1500, 200, "", "출력", { fontSize: 26, color: "rgba(255,255,255,.55)" }, true);
  return t => {
    N.forEach((n, i) => pop(n, t, 0.5 + i * 0.75)); A.forEach((a, i) => a.set(K(t, 0.8 + i * 0.75, 0.4)));
    vis(stop, t, 3.8, null);
    const ups = [8.4, 7.2, 6.0, 4.8];
    R.forEach((r, i) => vis(r, t, ups[i], null, { dy: -10 }));
    N.forEach((n, i) => glow(n, i < 4 ? K(t, ups[i], 0.2) * (1 - K(t, ups[i] + 0.9, 0.4)) : 0, "#ffd479"));
    let s = ""; [4.8, 6.0, 7.2, 8.4].forEach((a, k) => { if (t > a + 0.3) s += ["1", "0", "0", "1"][k]; });
    txt(out, s); vis(ol, t, 4.6, null); S(out, { o: K(t, 4.6, 0.4) });
  };
}, seqCaps(0.6, [[3.8, "내려갈 때는 출력 없이 호출만: 9 → 4 → 2 → 1 → 0"], [4.6, "돌아올 때 각자 `x % 2` 를 출력 → 1, 0, 0, 1"], [3.6, "그래서 화면에는 **1001** — 위 자리부터 올바르게"]]));

(function () {
  const steps = [
    { l: "3-9", t: "유클리드를 재귀로", d: "반복문 대신 **자기 자신**을 호출: gcd(x, y) = gcd(y, x % y)" },
    { l: "13", t: "gcd(30, 20)", d: "", m: ["gcd(30, 20)"] },
    { l: "8", t: "→ gcd(20, 10)", d: "30 % 20 = 10 → 더 작은 문제로", m: ["gcd(y, x % y)"] },
    { l: "8", t: "→ gcd(10, 0)", d: "20 % 10 = 0" },
    { l: "5-6", t: "y == 0 → 10 반환", d: "종료 조건 도달. 반환값 10이 그대로 **위로 전달**된다.", m: ["y == 0"] },
    { l: "13", t: "결과", d: "GCD(30, 20) = **10**", o: "10\n" },
  ];
  code(9, {
    name: "재귀 최대공약수", file: "gcd_rec.c", tag: "강의 예제",
    title: "while 대신 재귀", about: "7장의 유클리드 알고리즘을 재귀 함수 하나로.",
    src: String.raw`
#include <stdio.h>

int gcd(int x, int y)
{
    if (y == 0)
        return x;                // 종료 조건
    else
        return gcd(y, x % y);    // y와 (x%y)의 GCD로 축소
}

int main(void)
{
    printf("%d\n", gcd(30, 20));
    return 0;
}`,
    steps,
  });
})();

/* Hanoi moves */
const HMOVES = (() => { const m = []; (function h(n, f, tmp, to) { if (n === 1) { m.push([1, f, to]); return; } h(n - 1, f, to, tmp); m.push([n, f, to]); h(n - 1, tmp, f, to); })(3, "A", "B", "C"); return m; })();

code(9, {
  name: "하노이의 탑", file: "hanoi.c", tag: "강의 예제 · 전체 코드",
  title: "재귀의 끝판왕", about: "원판 n개를 A에서 C로 옮긴다. 한 번에 한 개씩, **큰 원판은 작은 원판 위에 올 수 없다**.",
  termH: 370,
  src: String.raw`
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

void hanoi_tower(int n, char from, char tmp, char to);

int main(void)
{
    hanoi_tower(3, 'A', 'B', 'C');   // 원판 3개를 A에서 C로
    return 0;
}

// from의 원판 n개를 tmp를 거쳐 to로 옮긴다
void hanoi_tower(int n, char from, char tmp, char to)
{
    if (n == 1)
        printf("원판 1을 %c에서 %c으로 옮긴다.\n", from, to);
    else
    {
        hanoi_tower(n - 1, from, to, tmp);   // ① n-1개를 B로
        printf("원판 %d을 %c에서 %c으로 옮긴다.\n", n, from, to); // ② 큰 원판
        hanoi_tower(n - 1, tmp, from, to);   // ③ n-1개를 C로
    }
}`,
  steps: [
    { l: "4", t: "함수 원형", d: "매개변수: 원판 수 `n`, 출발 `from`, 보조 `tmp`, 목적지 `to`." },
    { l: "8", t: "시작", d: "원판 3개를 A에서 C로, B를 보조로.", m: ["hanoi_tower(3, 'A', 'B', 'C')"] },
    { l: "15-16", t: "종료 조건", d: "원판이 **1개**면 그냥 옮기면 된다.", m: ["n == 1"] },
    { l: "19", t: "① n−1개를 tmp로", d: "가장 큰 원판을 빼고, 위의 n−1개를 **보조 기둥**으로 (재귀). to와 tmp의 **자리가 바뀐** 것에 주목.", m: ["from, to, tmp"] },
    { l: "20", t: "② 가장 큰 원판을 to로", d: "이제 비어 있는 목적지로 가장 큰 원판을 옮긴다." },
    { l: "21", t: "③ n−1개를 to로", d: "보조 기둥에 있던 n−1개를 목적지 위로 (재귀). 이동 횟수 = **2ⁿ − 1**", m: ["tmp, from, to"] },
    { l: "14-23", t: "실행 결과", d: "원판 3개 → **7번** 이동.", o: HMOVES.map(([n, f, to]) => `원판 ${n}을 ${f}에서 ${to}으로 옮긴다.\n`).join("") },
  ],
});

dia(9, "하노이의 탑", 24, root => {
  const px = { A: 400, B: 800, C: 1200 }, base = 760, dh = 50, widths = { 1: 150, 2: 230, 3: 310 }, cols = { 1: "#64d2ff", 2: "#5e5ce6", 3: "#bf5af2" };
  const plate = at(root, 180, base, "", "", { width: 1240, height: 18, borderRadius: 9, background: "rgba(255,255,255,.25)" });
  const pegs = ["A", "B", "C"].map(k => at(root, px[k], base - 170, "", "", { width: 14, height: 340, borderRadius: 7, background: "rgba(255,255,255,.3)" }, true));
  const pl = ["A", "B", "C"].map(k => at(root, px[k], base + 50, "mono", k, { fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,.7)" }, true));
  const disks = {}; [3, 2, 1].forEach(n => disks[n] = at(root, 0, 0, "mono", String(n), { width: widths[n], height: dh - 6, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", background: `linear-gradient(180deg, ${cols[n]}, color-mix(in srgb, ${cols[n]} 60%, #000))`, boxShadow: `0 8px 24px rgba(0,0,0,.4)` }, true));
  // precompute states
  const states = [{ A: [3, 2, 1], B: [], C: [] }];
  HMOVES.forEach(([n, f, to]) => { const s = JSON.parse(JSON.stringify(states[states.length - 1])); s[f].pop(); s[to].push(n); states.push(s); });
  const logP = at(root, 1640, 470, "", "", { width: 500, height: 470, borderRadius: 22, padding: "22px 26px", background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.12)" }, true);
  const log = h(logP, "mono", "", { fontSize: 21, lineHeight: 1.85, whiteSpace: "pre" });
  const cnt = at(root, 800, 230, "mono", "", { fontSize: 46, fontWeight: 700 }, true);
  const M0 = 2.0, MD = 2.3;
  const posOf = (s, n) => { for (const k of ["A", "B", "C"]) { const i = s[k].indexOf(n); if (i >= 0) return [px[k], base - dh / 2 - 4 - i * dh]; } };
  return t => {
    S(plate, { o: K(t, 0.2, 0.5) }); pegs.forEach((p, i) => S(p, { o: K(t, 0.3 + i * 0.1, 0.5), sy: K(t, 0.3 + i * 0.1, 0.6, E.o5) })); pl.forEach((p, i) => vis(p, t, 0.5 + i * 0.1, null));
    const NM = HMOVES.length;
    let k = -1, u = 0, done = 0;
    if (t >= M0 + NM * MD) { k = NM; done = NM; }
    else if (t >= M0) { k = Math.floor((t - M0) / MD); u = t - M0 - k * MD; done = k + (u >= 1.9 ? 1 : 0); }
    [1, 2, 3].forEach(n => {
      let x, y;
      if (k < 0) [x, y] = posOf(states[0], n);
      else if (k >= NM) [x, y] = posOf(states[NM], n);
      else if (HMOVES[k][0] === n && u < 1.9) {
        const [x0, y0] = posOf(states[k], n), [x1, y1] = posOf(states[k + 1], n), top = base - 420;
        if (u < 0.6) { x = x0; y = lerp(y0, top, E.io3(u / 0.6)); }
        else if (u < 1.3) { y = top; x = lerp(x0, x1, E.io3((u - 0.6) / 0.7)); }
        else { x = x1; y = lerp(top, y1, E.o3((u - 1.3) / 0.6)); }
      } else [x, y] = posOf(states[k + 1], n);
      S(disks[n], { o: K(t, 0.8 + (3 - n) * 0.2, 0.4), x, y });
    });
    txt(log, HMOVES.slice(0, done).map(([n, f, to]) => `원판 ${n}을 ${f}에서 ${to}으로 옮긴다.`).join("\n"));
    S(logP, { o: K(t, 1.2, 0.5) });
    txt(cnt, `이동 ${done} / 7`); S(cnt, { o: K(t, 1.5, 0.5) });
  };
}, seqCaps(0.6, [[5.4, "규칙: 한 번에 하나씩, **작은 원판 위에 큰 원판을 놓을 수 없다**"], [7.0, "① 위의 2개를 B로 → ② 가장 큰 원판을 C로 → ③ 2개를 다시 C로"], [5.4, "원판 3개 → 2³ − 1 = **7번**"], [4.4, "64개라면 2⁶⁴ − 1번… 1초에 한 번씩 옮겨도 약 **5,849억 년**"]]));

/* ===================== OUTRO ===================== */
add({
  ch: 0, name: "마무리", dur: 17, hud: false,
  build(root) {
    const sums = { 2: "소스 → 컴파일 → 링크 → 실행", 3: "주석 · 변수 · printf · scanf(&)", 4: "자료형 크기 · 오버플로우 · 상수", 5: "/ % · ++ · && || · ^ · 형변환", 6: "if-else · else if · switch-break", 7: "while · do-while · for · break", 8: "정의 · 호출 · return · 원형", 9: "지역/전역 · static · 재귀" };
    const tiles = [2, 3, 4, 5, 6, 7, 8, 9].map((c, i) => {
      const C = CH[c], col = i % 4, row = Math.floor(i / 4);
      return at(root, 158 + col * 408 + 190, 330 + row * 230 + 100, "", `<div style="font-size:52px;font-weight:900;letter-spacing:-.04em;color:${C.acc}">${C.no}</div><div style="font-size:28px;font-weight:800;margin-top:4px">${C.title}</div><div style="font-size:21px;color:rgba(255,255,255,.62);margin-top:8px;line-height:1.4">${sums[c]}</div>`,
        { width: 380, height: 200, borderRadius: 26, padding: "20px 26px", background: "linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)" }, true);
    });
    const head = at(root, 960, 170, "big", "8개 장, 한눈에", { fontSize: 76, whiteSpace: "nowrap" }, true);
    const fin = at(root, 960, 470, "big grad", "이제 직접 쳐 볼 차례.", { fontSize: 120, whiteSpace: "nowrap" }, true);
    const sub = at(root, 960, 610, "", "코드는 눈으로 읽는 것보다 <b style='color:#fff'>손으로 칠 때</b> 내 것이 된다", { fontSize: 36, color: "rgba(255,255,255,.65)", whiteSpace: "nowrap" }, true);
    const sig = at(root, 960, 700, "mono", hlC("return 0;"), { fontSize: 44, fontWeight: 700 }, true);
    return t => {
      const out = K(t, 8.2, 0.8, E.io3);
      blurIn(head, t, 0.2); S(head, { o: K(t, 0.2, 0.8) * (1 - out), y: -out * 40 });
      tiles.forEach((e, i) => { const q = K(t, 0.6 + i * 0.12, 0.8, E.o5); S(e, { o: q * (1 - out), y: (1 - q) * 50 - out * 40, s: 1 - out * 0.05, b: (1 - q) * 10 + out * 6 }); });
      const f = K(t, 9.0, 1.2, E.o5); S(fin, { o: f, s: 1.15 - 0.15 * f, b: (1 - f) * 18 });
      rise(sub, t, 10.2); pop(sig, t, 11.6);
    };
  },
});
