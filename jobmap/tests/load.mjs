// 브라우저 전역 스크립트를 node vm 한 컨텍스트에 index.html의 <script src> 순서대로 올린다.
// 인라인 스크립트(drawTest(); route(); 등)는 실행하지 않는다. 다른 업무는 이 파일에 추가만 한다.
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL("../", import.meta.url));

// index.html의 <script src="…"> 목록(순서 그대로, 주석·외부 주소 제외, ?v= 같은 꼬리 제거)
export function scripts(dir = HERE) {
  const html = readFileSync(join(dir, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1].split(/[?#]/)[0]).filter((s) => !/^(https?:)?\/\//.test(s));
}

export function load(dir = HERE) {
  const noop = () => {};
  const el = () => ({
    innerHTML: "", textContent: "", value: "", hidden: false, style: {}, dataset: {},
    classList: { toggle: noop, add: noop, remove: noop, contains: () => false },
    querySelectorAll: () => [], querySelector: () => el(), closest: () => null,
    get firstElementChild() { return el(); },
    addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
    setAttribute: noop, getAttribute: () => null, removeAttribute: noop, toggleAttribute: noop,
    remove: noop, append: noop, insertAdjacentHTML: noop, scrollIntoView: noop, focus: noop,
    animate: () => ({ finished: Promise.resolve(), cancel: noop }), getAnimations: () => [],
    getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
  });
  const els = {};
  const document = {
    getElementById: (id) => (els[id] ??= el()), querySelectorAll: () => [], querySelector: () => el(),
    addEventListener: noop, removeEventListener: noop, activeElement: el(),
    body: { ...el(), dataset: {} }, documentElement: { ...el(), dataset: {}, clientWidth: 1280 },
    fonts: { load: async () => [], check: () => true }
  };
  const ctx = {
    console, document, URL, Blob, TextEncoder, performance, setTimeout, clearTimeout,
    requestAnimationFrame: (cb) => { cb(performance.now()); return 0; },
    matchMedia: () => ({ matches: true, addEventListener: noop, removeEventListener: noop }),
    history: { pushState: noop, replaceState: noop, back: noop, state: null },
    location: { hash: "", pathname: "/jobmap/", origin: "http://127.0.0.1" },
    navigator: { clipboard: { writeText: async () => {} }, canShare: undefined, share: undefined },
    getComputedStyle: () => ({ getPropertyValue: () => "" }), innerHeight: 800, scrollY: 0, scrollTo: noop,
    addEventListener: noop, removeEventListener: noop
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of scripts(dir)) vm.runInContext(readFileSync(join(dir, f), "utf8"), ctx, { filename: f });
  // 최상위 const/function(D, qa, compute…)은 컨텍스트의 전역 렉시컬 스코프에 있어 평가식으로 꺼낸다
  return { els, ctx, get: (expr) => vm.runInContext(expr, ctx) };
}
